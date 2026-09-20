import { describe, expect, it } from 'vitest';

import lessonFixture from '../../../examples/lesson.sample.json';
import {
  DraftConflictError,
  FixtureLessonRepository,
  createLessonRelease,
  toStudentLesson,
} from './repository';
import { assertValidLesson } from './validation';

const initialDraft = {
  projectId: 'project-python-guess',
  revision: 'draft-r1',
  lesson: assertValidLesson(lessonFixture),
  updatedAt: '2026-09-20T00:00:00.000Z',
};

describe('draft and release model', () => {
  it('creates a deterministic immutable release snapshot', async () => {
    const first = await createLessonRelease(initialDraft, {
      releaseId: 'release-python-r1',
      publishedAt: '2026-09-20T01:00:00.000Z',
    });
    const second = await createLessonRelease(initialDraft, {
      releaseId: 'release-python-r1',
      publishedAt: '2026-09-20T01:00:00.000Z',
    });

    expect(first.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(first.checksum).toBe(second.checksum);
    expect(Object.isFrozen(first.lesson)).toBe(true);
    expect(first.sourceRevision).toBe('draft-r1');
  });

  it('keeps an old release unchanged after the draft is edited', async () => {
    const repository = new FixtureLessonRepository([initialDraft]);
    const release = await repository.publishDraft({
      projectId: initialDraft.projectId,
      expectedRevision: 'draft-r1',
      releaseId: 'release-python-r1',
      publishedAt: '2026-09-20T01:00:00.000Z',
    });
    const edited = structuredClone(initialDraft.lesson);
    edited.title = 'Tiêu đề draft mới';
    await repository.saveDraft({
      projectId: initialDraft.projectId,
      expectedRevision: 'draft-r1',
      lesson: edited,
      updatedAt: '2026-09-20T02:00:00.000Z',
    });

    const storedRelease = await repository.getRelease(release.releaseId);
    expect(storedRelease?.lesson.title).toBe(initialDraft.lesson.title);
    expect((await repository.getDraft(initialDraft.projectId))?.lesson.title).toBe(
      'Tiêu đề draft mới',
    );
  });

  it('returns an explicit optimistic concurrency conflict', async () => {
    const repository = new FixtureLessonRepository([initialDraft]);
    await expect(
      repository.saveDraft({
        projectId: initialDraft.projectId,
        expectedRevision: 'draft-stale',
        lesson: initialDraft.lesson,
        updatedAt: '2026-09-20T02:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(DraftConflictError);
  });

  it('removes teacher-only answers from the student payload', () => {
    const publicLesson = toStudentLesson(initialDraft.lesson);
    expect(JSON.stringify(publicLesson)).not.toContain('correctOptionId');
    expect(publicLesson.activities.find(({ type }) => type === 'quiz')).toMatchObject({
      id: 'quiz-print',
      type: 'quiz',
    });
  });
});
