import { describe, expect, it } from 'vitest';

import pythonLesson from '../../../examples/lesson.sample.json';
import webLesson from '../../../examples/lesson.web.sample.json';
import { lessonSchema, validateLesson } from './validation';

function clone<T>(value: T): T {
  return structuredClone(value);
}

describe('lesson v2 contract', () => {
  it('accepts both canonical fixtures', () => {
    expect(validateLesson(pythonLesson)).toMatchObject({ ok: true });
    expect(validateLesson(webLesson)).toMatchObject({ ok: true });
  });

  it('keeps TypeScript discriminator values synchronized with the schema', () => {
    expect(lessonSchema.properties.schemaVersion.const).toBe('2.0.0');
    expect(lessonSchema.properties.locale.const).toBe('vi-VN');
    expect(lessonSchema.properties.status.enum).toEqual([
      'draft',
      'in-review',
      'approved',
      'published',
    ]);
  });

  it('rejects an invalid enum and negative timeline timestamp at the JSON boundary', () => {
    const invalidStatus = { ...clone(pythonLesson), status: 'archived' };
    const invalidTime = clone(pythonLesson);
    invalidTime.timeline[0]!.atSec = -1;

    expect(validateLesson(invalidStatus)).toMatchObject({ ok: false });
    expect(validateLesson(invalidTime)).toMatchObject({ ok: false });
  });

  it('rejects duplicate IDs, mismatched targets and out-of-range events', () => {
    const lesson = clone(pythonLesson);
    lesson.activities[1]!.id = lesson.activities[0]!.id;
    lesson.timeline[0]!.targetId = 'missing-quiz';
    lesson.timeline[1]!.atSec = 999;

    const result = validateLesson(lesson);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'semantic.duplicate-id',
        'semantic.timeline-target',
        'semantic.timeline-out-of-range',
      ]),
    );
  });

  it('rejects traversal filenames and active resource URLs', () => {
    const traversalLesson = {
      ...clone(webLesson),
      activities: [{ ...clone(webLesson.activities[0]), files: { '../secret.txt': 'nope' } }],
    };
    const activeUrlLesson = {
      ...clone(webLesson),
      contentBlocks: [
        ...clone(webLesson.contentBlocks),
        {
          id: 'bad-resource',
          type: 'resource',
          title: 'Không an toàn',
          url: 'javascript:alert(1)',
        },
      ],
    };

    const traversalResult = validateLesson(traversalLesson);
    const urlResult = validateLesson(activeUrlLesson);
    expect(traversalResult).toMatchObject({ ok: false });
    expect(urlResult).toMatchObject({ ok: false });
    if (!traversalResult.ok) {
      expect(traversalResult.issues.map(({ code }) => code)).toContain('schema.pattern');
    }
    if (!urlResult.ok) {
      expect(urlResult.issues.map(({ code }) => code)).toContain('security.unsafe-resource-url');
    }
  });

  it('checks referenced assets when a manifest is supplied', () => {
    const result = validateLesson(pythonLesson, {
      availableAssetRefs: new Set(['assets/video/demo.mp4']),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.filter(({ code }) => code === 'semantic.asset-missing')).toHaveLength(5);
  });
});
