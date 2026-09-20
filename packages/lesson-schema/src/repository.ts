import type {
  DeepReadonly,
  LessonDocument,
  LessonDraft,
  LessonRelease,
  StudentLessonDocument,
} from './types';
import { assertValidLesson } from './validation';

export interface SaveDraftInput {
  projectId: string;
  expectedRevision: string;
  lesson: unknown;
  updatedAt: string;
}

export interface PublishDraftInput {
  projectId: string;
  expectedRevision: string;
  releaseId: string;
  publishedAt: string;
}

export interface LessonRepository {
  getDraft(projectId: string): Promise<LessonDraft | undefined>;
  saveDraft(input: SaveDraftInput): Promise<LessonDraft>;
  getRelease(releaseId: string): Promise<LessonRelease | undefined>;
  publishDraft(input: PublishDraftInput): Promise<LessonRelease>;
}

export class DraftConflictError extends Error {
  constructor(
    public readonly expectedRevision: string,
    public readonly actualRevision: string,
  ) {
    super(`Draft conflict: expected ${expectedRevision}, actual ${actualRevision}.`);
    this.name = 'DraftConflictError';
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach((child) => deepFreeze(child));
  }
  return value as DeepReadonly<T>;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function toStudentLesson(lesson: LessonDocument): StudentLessonDocument {
  return {
    ...clone(lesson),
    activities: lesson.activities.map((activity) => {
      if (activity.type !== 'quiz') return clone(activity);
      const { correctOptionId: teacherOnlyAnswer, ...studentQuiz } = clone(activity);
      void teacherOnlyAnswer;
      return studentQuiz;
    }),
  };
}

export async function createLessonRelease(
  draft: LessonDraft,
  input: Pick<PublishDraftInput, 'releaseId' | 'publishedAt'>,
): Promise<LessonRelease> {
  const releasedLesson = assertValidLesson({ ...clone(draft.lesson), status: 'published' });
  const release: LessonRelease = {
    releaseId: input.releaseId,
    projectId: draft.projectId,
    sourceRevision: draft.revision,
    checksum: await sha256(releasedLesson),
    publishedAt: input.publishedAt,
    lesson: deepFreeze(releasedLesson),
  };
  return deepFreeze(release) as LessonRelease;
}

/**
 * Development-only repository. It deliberately makes no persistence claim;
 * callers must label it as fixture data in the UI.
 */
export class FixtureLessonRepository implements LessonRepository {
  readonly persistence = 'fixture-memory' as const;
  private readonly drafts = new Map<string, LessonDraft>();
  private readonly releases = new Map<string, LessonRelease>();
  private readonly revisionCounters = new Map<string, number>();

  constructor(initialDrafts: readonly LessonDraft[] = []) {
    initialDrafts.forEach((draft) => {
      const lesson = assertValidLesson(draft.lesson);
      this.drafts.set(draft.projectId, clone({ ...draft, lesson }));
      const suffix = Number.parseInt(draft.revision.match(/(\d+)$/)?.[1] ?? '0', 10);
      this.revisionCounters.set(draft.projectId, Number.isNaN(suffix) ? 0 : suffix);
    });
  }

  async getDraft(projectId: string): Promise<LessonDraft | undefined> {
    const draft = this.drafts.get(projectId);
    return draft ? clone(draft) : undefined;
  }

  async saveDraft(input: SaveDraftInput): Promise<LessonDraft> {
    const current = this.drafts.get(input.projectId);
    const actualRevision = current?.revision ?? 'missing';
    if (!current || input.expectedRevision !== actualRevision) {
      throw new DraftConflictError(input.expectedRevision, actualRevision);
    }
    const lesson = assertValidLesson(input.lesson);
    if (lesson.status === 'published') {
      throw new TypeError('Draft không được lưu trực tiếp với status published.');
    }
    const counter = (this.revisionCounters.get(input.projectId) ?? 0) + 1;
    this.revisionCounters.set(input.projectId, counter);
    const saved: LessonDraft = {
      projectId: input.projectId,
      revision: `draft-r${counter}`,
      lesson,
      updatedAt: input.updatedAt,
    };
    this.drafts.set(input.projectId, clone(saved));
    return clone(saved);
  }

  async getRelease(releaseId: string): Promise<LessonRelease | undefined> {
    const release = this.releases.get(releaseId);
    return release ? clone(release) : undefined;
  }

  async publishDraft(input: PublishDraftInput): Promise<LessonRelease> {
    if (this.releases.has(input.releaseId)) {
      throw new TypeError(`Release ID "${input.releaseId}" đã tồn tại.`);
    }
    const draft = this.drafts.get(input.projectId);
    const actualRevision = draft?.revision ?? 'missing';
    if (!draft || input.expectedRevision !== actualRevision) {
      throw new DraftConflictError(input.expectedRevision, actualRevision);
    }
    const release = await createLessonRelease(draft, input);
    this.releases.set(input.releaseId, release);
    return clone(release);
  }
}
