export type LessonStatus = 'draft' | 'in-review' | 'approved' | 'published';

export interface LessonObjective {
  id: string;
  text: string;
}

export interface MarkdownBlock {
  id: string;
  type: 'markdown';
  markdown: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  alt: string;
  assetRef: string;
  caption?: string;
}

export interface CodeBlock {
  id: string;
  type: 'code';
  language: 'python' | 'html' | 'css' | 'javascript' | 'sql' | 'text';
  code: string;
  filename?: string;
}

export interface ResourceBlock {
  id: string;
  type: 'resource';
  title: string;
  url: string;
}

export type ContentBlock = MarkdownBlock | ImageBlock | CodeBlock | ResourceBlock;

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizActivity {
  id: string;
  type: 'quiz';
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  completion: 'answered' | 'correct';
  assessmentMode?: 'formative-client';
}

export interface QuickCodeActivity {
  id: string;
  type: 'quick-code';
  runtime: 'python-console' | 'web-static';
  files: Record<string, string>;
  completion: 'run' | 'formative-tests';
  testSpecRef?: string;
}

export interface LocalProjectActivity {
  id: string;
  type: 'local-project';
  templateRef: string;
  guideRef: string;
  completion: 'submitted' | 'teacher-reviewed';
}

export type LessonActivity = QuizActivity | QuickCodeActivity | LocalProjectActivity;

export interface TimelineEvent {
  id: string;
  atSec: number;
  action: 'openQuiz' | 'openPractice' | 'openResource';
  targetId: string;
  pause: boolean;
  repeatable?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  objectiveId: string;
  evidence: 'self' | 'system' | 'teacher';
  activityId?: string;
}

export interface LessonMedia {
  videoRef: string;
  subtitleRef?: string;
  posterRef?: string;
  assetRevision?: string;
}

export interface LessonDocument {
  schemaVersion: '2.0.0';
  id: string;
  title: string;
  locale: 'vi-VN';
  status: LessonStatus;
  durationSec?: number;
  objectives: LessonObjective[];
  contentBlocks: ContentBlock[];
  media?: LessonMedia;
  activities: LessonActivity[];
  timeline: TimelineEvent[];
  checklist: ChecklistItem[];
}

export type StudentQuizActivity = Omit<QuizActivity, 'correctOptionId'>;
export type StudentLessonActivity = StudentQuizActivity | QuickCodeActivity | LocalProjectActivity;
export type StudentLessonDocument = Omit<LessonDocument, 'activities'> & {
  activities: StudentLessonActivity[];
};

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export interface LessonDraft {
  projectId: string;
  revision: string;
  lesson: LessonDocument;
  updatedAt: string;
}

export interface LessonRelease {
  releaseId: string;
  projectId: string;
  sourceRevision: string;
  checksum: string;
  publishedAt: string;
  lesson: DeepReadonly<LessonDocument>;
}

export interface ValidationIssue {
  code: string;
  message: string;
  path: string;
}

export type ValidationResult<T> =
  { ok: true; value: T; issues: [] } | { ok: false; issues: ValidationIssue[] };

export interface LessonV1Chapter {
  id: string;
  title: string;
  start: number;
}

export interface LessonV1Activity {
  id: string;
  type: 'quiz' | 'coding' | 'simulation' | string;
  title: string;
  config: string;
}

export interface LessonV1TimelineEvent {
  id: string;
  time: number;
  action: 'openActivity' | 'showResource' | string;
  target: string;
  pauseVideo: boolean;
}

export interface LessonV1Document {
  schemaVersion: '1.0.0';
  id: string;
  title: string;
  status: LessonStatus;
  duration: number;
  description: string;
  media?: {
    video?: string;
    poster?: string;
  };
  chapters: LessonV1Chapter[];
  content: Record<string, string>;
  resources: Array<{ id: string; title: string; path: string }>;
  activities: LessonV1Activity[];
  timeline: LessonV1TimelineEvent[];
}

export interface MigrationWarning {
  code: string;
  message: string;
  path: string;
}

export interface MigrationSource {
  repository: string;
  revision: string;
  lessonPath: string;
}

export interface MigrationSourceResolver {
  readText(path: string): Promise<string | undefined>;
  readJson(path: string): Promise<unknown | undefined>;
}

export interface LessonMigrationResult {
  lesson: LessonDocument;
  warnings: MigrationWarning[];
  source: MigrationSource;
  sourceArchive: LessonV1Document;
}
