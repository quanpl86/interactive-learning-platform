import type {
  ContentBlock,
  LessonActivity,
  LessonDocument,
  LessonMigrationResult,
  LessonV1Document,
  MigrationSource,
  MigrationSourceResolver,
  MigrationWarning,
  QuizActivity,
  TimelineEvent,
} from './types';
import { assertValidLesson } from './validation';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function warning(warnings: MigrationWarning[], code: string, path: string, message: string): void {
  warnings.push({ code, message, path });
}

function outputFilename(kind: string, sourcePath: string): string {
  if (kind === 'html') return 'index.html';
  if (kind === 'css') return 'style.css';
  if (kind === 'javascript' || kind === 'js') return 'script.js';
  return sourcePath.split('/').at(-1) ?? `${kind}.txt`;
}

async function migrateQuiz(
  activityId: string,
  configPath: string,
  resolver: MigrationSourceResolver,
  warnings: MigrationWarning[],
): Promise<QuizActivity | undefined> {
  const config = await resolver.readJson(configPath);
  if (!isObject(config)) {
    warning(warnings, 'missing-quiz-config', configPath, 'Không đọc được cấu hình quiz.');
    return undefined;
  }
  const contentPath = config.content;
  const options = config.options;
  const answer = config.answer;
  if (!isString(contentPath) || !Array.isArray(options) || !isObject(answer)) {
    warning(warnings, 'invalid-quiz-config', configPath, 'Cấu hình quiz v1 không hợp lệ.');
    return undefined;
  }
  const parsedOptions = options.flatMap((option) => {
    if (!isObject(option) || !isString(option.id) || !isString(option.text)) return [];
    return [{ id: option.id, text: option.text }];
  });
  const answerIds = Array.isArray(answer.correctOptionIds)
    ? answer.correctOptionIds.filter(isString)
    : [];
  if (parsedOptions.length < 2 || answerIds.length === 0) {
    warning(warnings, 'invalid-quiz-data', configPath, 'Quiz thiếu options hoặc đáp án.');
    return undefined;
  }
  if (answerIds.length > 1) {
    warning(
      warnings,
      'multiple-answers-not-supported',
      `${configPath}/answer/correctOptionIds`,
      'V2 single-choice chỉ giữ đáp án đầu tiên.',
    );
  }
  const question = await resolver.readText(contentPath);
  if (!question) {
    warning(warnings, 'missing-question-content', contentPath, 'Không đọc được nội dung câu hỏi.');
    return undefined;
  }
  return {
    id: activityId,
    type: 'quiz',
    question,
    options: parsedOptions,
    correctOptionId: answerIds[0] ?? '',
    completion: 'answered',
    assessmentMode: 'formative-client',
  };
}

async function migrateCoding(
  activityId: string,
  configPath: string,
  resolver: MigrationSourceResolver,
  warnings: MigrationWarning[],
): Promise<LessonActivity | undefined> {
  const config = await resolver.readJson(configPath);
  if (!isObject(config) || !isStringRecord(config.starterFiles)) {
    warning(warnings, 'invalid-coding-config', configPath, 'Cấu hình coding v1 không hợp lệ.');
    return undefined;
  }
  const files: Record<string, string> = {};
  for (const [kind, sourcePath] of Object.entries(config.starterFiles)) {
    const content = await resolver.readText(sourcePath);
    if (content === undefined) {
      warning(warnings, 'missing-starter-file', sourcePath, 'Không đọc được starter file.');
      continue;
    }
    files[outputFilename(kind, sourcePath)] = content;
  }
  if (Object.keys(files).length === 0) return undefined;
  return {
    id: activityId,
    type: 'quick-code',
    runtime: 'web-static',
    files,
    completion: isString(config.testSuite) ? 'formative-tests' : 'run',
    ...(isString(config.testSuite) ? { testSpecRef: config.testSuite } : {}),
  };
}

async function migrateContent(
  source: LessonV1Document,
  resolver: MigrationSourceResolver,
  warnings: MigrationWarning[],
): Promise<ContentBlock[]> {
  const blocks: ContentBlock[] = [
    {
      id: 'content-description',
      type: 'markdown',
      markdown: source.description,
    },
  ];
  for (const [name, path] of Object.entries(source.content)) {
    const markdown = await resolver.readText(path);
    if (markdown === undefined) {
      warning(warnings, 'missing-content', path, `Không đọc được content ${name}.`);
      continue;
    }
    blocks.push({ id: `content-${name}`, type: 'markdown', markdown });
  }
  source.resources.forEach((resource) => {
    blocks.push({ id: resource.id, type: 'resource', title: resource.title, url: resource.path });
  });
  return blocks;
}

export function isLessonV1Document(input: unknown): input is LessonV1Document {
  const validStatus =
    isObject(input) &&
    ['draft', 'in-review', 'approved', 'published'].includes(String(input.status));
  const validMedia =
    !isObject(input) ||
    input.media === undefined ||
    (isObject(input.media) &&
      (input.media.video === undefined || isString(input.media.video)) &&
      (input.media.poster === undefined || isString(input.media.poster)));
  return (
    isObject(input) &&
    input.schemaVersion === '1.0.0' &&
    isString(input.id) &&
    isString(input.title) &&
    isString(input.description) &&
    validStatus &&
    validMedia &&
    typeof input.duration === 'number' &&
    Number.isFinite(input.duration) &&
    input.duration >= 0 &&
    Array.isArray(input.chapters) &&
    input.chapters.every(
      (chapter) =>
        isObject(chapter) &&
        isString(chapter.id) &&
        isString(chapter.title) &&
        typeof chapter.start === 'number',
    ) &&
    isStringRecord(input.content) &&
    Array.isArray(input.resources) &&
    input.resources.every(
      (resource) =>
        isObject(resource) &&
        isString(resource.id) &&
        isString(resource.title) &&
        isString(resource.path),
    ) &&
    Array.isArray(input.activities) &&
    input.activities.every(
      (activity) =>
        isObject(activity) &&
        isString(activity.id) &&
        isString(activity.type) &&
        isString(activity.title) &&
        isString(activity.config),
    ) &&
    Array.isArray(input.timeline) &&
    input.timeline.every(
      (event) =>
        isObject(event) &&
        isString(event.id) &&
        typeof event.time === 'number' &&
        isString(event.action) &&
        isString(event.target) &&
        typeof event.pauseVideo === 'boolean',
    )
  );
}

export async function migrateLessonV1ToV2(
  input: unknown,
  resolver: MigrationSourceResolver,
  source: MigrationSource,
): Promise<LessonMigrationResult> {
  if (!isLessonV1Document(input)) {
    throw new TypeError('Nguồn import không phải lesson schemaVersion 1.0.0 hợp lệ.');
  }

  const sourceArchive = structuredClone(input);
  const warnings: MigrationWarning[] = [];
  const contentBlocks = await migrateContent(input, resolver, warnings);
  const activities: LessonActivity[] = [];

  for (const activity of input.activities) {
    if (activity.type === 'quiz') {
      const migrated = await migrateQuiz(activity.id, activity.config, resolver, warnings);
      if (migrated) activities.push(migrated);
    } else if (activity.type === 'coding') {
      const migrated = await migrateCoding(activity.id, activity.config, resolver, warnings);
      if (migrated) activities.push(migrated);
    } else {
      warning(
        warnings,
        'unsupported-activity',
        `activities/${activity.id}`,
        `Activity type "${activity.type}" được giữ ở source archive nhưng chưa nhập vào v2.`,
      );
    }
  }

  const migratedActivityIds = new Set(activities.map(({ id }) => id));
  const resourceIds = new Set(input.resources.map(({ id }) => id));
  const activityTypes = new Map(activities.map((activity) => [activity.id, activity.type]));
  const timeline: TimelineEvent[] = [];
  for (const event of input.timeline) {
    if (event.action === 'showResource' && resourceIds.has(event.target)) {
      timeline.push({
        id: event.id,
        atSec: event.time,
        action: 'openResource',
        targetId: event.target,
        pause: event.pauseVideo,
        repeatable: false,
      });
    } else if (event.action === 'openActivity' && migratedActivityIds.has(event.target)) {
      timeline.push({
        id: event.id,
        atSec: event.time,
        action: activityTypes.get(event.target) === 'quiz' ? 'openQuiz' : 'openPractice',
        targetId: event.target,
        pause: event.pauseVideo,
        repeatable: false,
      });
    } else {
      warning(
        warnings,
        'timeline-target-skipped',
        `timeline/${event.id}`,
        `Timeline target "${event.target}" không thể ánh xạ và đã được giữ trong source archive.`,
      );
    }
  }

  warning(
    warnings,
    'locale-defaulted',
    'locale',
    'Schema v1 không có locale; migration dùng locale dự án vi-VN.',
  );
  if (input.chapters.length > 0) {
    warning(
      warnings,
      'chapters-preserved-in-archive',
      'chapters',
      'Chapter v1 chưa có trường tương ứng trong v2 và được giữ nguyên ở source archive.',
    );
  }

  const draft: LessonDocument = {
    schemaVersion: '2.0.0',
    id: input.id,
    title: input.title,
    locale: 'vi-VN',
    status: 'draft',
    durationSec: input.duration,
    objectives: [{ id: 'objective-imported', text: input.description }],
    contentBlocks,
    ...(input.media?.video
      ? {
          media: {
            videoRef: input.media.video,
            ...(input.media.poster ? { posterRef: input.media.poster } : {}),
            assetRevision: source.revision,
          },
        }
      : {}),
    activities,
    timeline,
    checklist: [],
  };

  return {
    lesson: assertValidLesson(draft),
    warnings,
    source: structuredClone(source),
    sourceArchive,
  };
}
