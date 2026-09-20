import { describe, expect, it } from 'vitest';

import codingConfig from '../test-fixtures/v1/activities/coding-01.json';
import introduction from '../test-fixtures/v1/content/introduction.md?raw';
import summary from '../test-fixtures/v1/content/summary.md?raw';
import theory from '../test-fixtures/v1/content/flexbox-theory.md?raw';
import lessonV1 from '../test-fixtures/v1/lesson.json';
import questionConfig from '../test-fixtures/v1/questions/q01/question.json';
import question from '../test-fixtures/v1/questions/q01/question.md?raw';
import starterHtml from '../test-fixtures/v1/starter/index.html?raw';
import starterCss from '../test-fixtures/v1/starter/style.css?raw';
import testSuite from '../test-fixtures/v1/tests/flexbox.test.json';
import { migrateLessonV1ToV2 } from './migration-v1';
import type { MigrationSourceResolver } from './types';
import { validateLesson } from './validation';

const source = {
  repository: 'https://github.com/quanpl86/hocweb2026',
  revision: '230380834630f571775a07424cfbb362b9a72108',
  lessonPath: 'lessons/web-flexbox-01/lesson.json',
};

function fixtureResolver(): MigrationSourceResolver {
  const texts = new Map<string, string>([
    ['content/introduction.md', introduction],
    ['content/flexbox-theory.md', theory],
    ['content/summary.md', summary],
    ['questions/q01/question.md', question],
    ['starter/index.html', starterHtml],
    ['starter/style.css', starterCss],
  ]);
  const json = new Map<string, unknown>([
    ['questions/q01/question.json', questionConfig],
    ['activities/coding-01.json', codingConfig],
    ['tests/flexbox.test.json', testSuite],
  ]);
  return {
    readJson: async (path) => structuredClone(json.get(path)),
    readText: async (path) => texts.get(path),
  };
}

describe('migrateLessonV1ToV2', () => {
  it('deterministically migrates the real hocweb2026 fixture', async () => {
    const first = await migrateLessonV1ToV2(lessonV1, fixtureResolver(), source);
    const second = await migrateLessonV1ToV2(lessonV1, fixtureResolver(), source);

    expect(first).toEqual(second);
    expect(validateLesson(first.lesson)).toMatchObject({ ok: true });
    expect(first.lesson.id).toBe('WEB-FLEXBOX-01');
    expect(first.lesson.media?.videoRef).toBe('assets/video/lesson.mp4');
    expect(first.lesson.activities.map(({ id }) => id)).toEqual(['quiz-01', 'coding-01']);
    expect(first.lesson.timeline.map(({ id }) => id)).toEqual(['cp-01', 'cp-02', 'cp-03']);
    expect(first.sourceArchive).toEqual(lessonV1);
    expect(first.warnings.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'unsupported-activity',
        'timeline-target-skipped',
        'chapters-preserved-in-archive',
      ]),
    );
  });

  it('preserves source IDs, option answer and starter file contents', async () => {
    const result = await migrateLessonV1ToV2(lessonV1, fixtureResolver(), source);
    const quiz = result.lesson.activities.find(({ type }) => type === 'quiz');
    const coding = result.lesson.activities.find(({ type }) => type === 'quick-code');

    expect(quiz).toMatchObject({ id: 'quiz-01', correctOptionId: 'B' });
    expect(coding).toMatchObject({
      id: 'coding-01',
      files: { 'index.html': starterHtml, 'style.css': starterCss },
      testSpecRef: 'tests/flexbox.test.json',
    });
  });

  it('fails explicitly when required referenced source is missing', async () => {
    const resolver = fixtureResolver();
    resolver.readJson = async () => undefined;

    const result = await migrateLessonV1ToV2(lessonV1, resolver, source);
    expect(result.lesson.activities).toEqual([]);
    expect(result.lesson.timeline.map(({ id }) => id)).toEqual(['cp-02']);
    expect(result.warnings.map(({ code }) => code)).toContain('missing-quiz-config');
  });
});
