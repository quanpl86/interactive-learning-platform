import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js';

import lessonSchema from '../../../schemas/lesson.schema.json';
import type { LessonActivity, LessonDocument, ValidationIssue, ValidationResult } from './types';

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateShape = ajv.compile<LessonDocument>(lessonSchema);

const SAFE_RELATIVE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_./-]+$/;

export interface LessonValidationOptions {
  availableAssetRefs?: ReadonlySet<string>;
}

function schemaIssue(error: ErrorObject): ValidationIssue {
  return {
    code: `schema.${error.keyword}`,
    message: error.message ?? 'Giá trị không hợp lệ.',
    path: error.instancePath || '/',
  };
}

function pushDuplicateIssues(
  issues: ValidationIssue[],
  values: readonly string[],
  path: string,
): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      issues.push({
        code: 'semantic.duplicate-id',
        message: `ID "${value}" bị trùng.`,
        path: `${path}/${index}/id`,
      });
    }
    seen.add(value);
  });
}

function isSafeResourceUrl(value: string): boolean {
  if (SAFE_RELATIVE_PATH.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function referencedAssets(lesson: LessonDocument): Array<{ path: string; ref: string }> {
  const refs: Array<{ path: string; ref: string }> = [];
  if (lesson.media) {
    refs.push({ path: '/media/videoRef', ref: lesson.media.videoRef });
    if (lesson.media.subtitleRef) {
      refs.push({ path: '/media/subtitleRef', ref: lesson.media.subtitleRef });
    }
    if (lesson.media.posterRef) {
      refs.push({ path: '/media/posterRef', ref: lesson.media.posterRef });
    }
  }
  lesson.contentBlocks.forEach((block, index) => {
    if (block.type === 'image') {
      refs.push({ path: `/contentBlocks/${index}/assetRef`, ref: block.assetRef });
    }
  });
  lesson.activities.forEach((activity, index) => {
    if (activity.type === 'quick-code' && activity.testSpecRef) {
      refs.push({ path: `/activities/${index}/testSpecRef`, ref: activity.testSpecRef });
    }
    if (activity.type === 'local-project') {
      refs.push({ path: `/activities/${index}/templateRef`, ref: activity.templateRef });
      refs.push({ path: `/activities/${index}/guideRef`, ref: activity.guideRef });
    }
  });
  return refs;
}

function activityTargetMatches(
  activity: LessonActivity | undefined,
  action: LessonDocument['timeline'][number]['action'],
): boolean {
  if (!activity) return false;
  if (action === 'openQuiz') return activity.type === 'quiz';
  if (action === 'openPractice') {
    return activity.type === 'quick-code' || activity.type === 'local-project';
  }
  return false;
}

function semanticIssues(
  lesson: LessonDocument,
  options: LessonValidationOptions,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  pushDuplicateIssues(
    issues,
    lesson.objectives.map(({ id }) => id),
    '/objectives',
  );
  pushDuplicateIssues(
    issues,
    lesson.contentBlocks.map(({ id }) => id),
    '/contentBlocks',
  );
  pushDuplicateIssues(
    issues,
    lesson.activities.map(({ id }) => id),
    '/activities',
  );
  pushDuplicateIssues(
    issues,
    lesson.timeline.map(({ id }) => id),
    '/timeline',
  );
  pushDuplicateIssues(
    issues,
    lesson.checklist.map(({ id }) => id),
    '/checklist',
  );

  const objectives = new Set(lesson.objectives.map(({ id }) => id));
  const activities = new Map(lesson.activities.map((activity) => [activity.id, activity]));
  const resources = new Set(
    lesson.contentBlocks.filter((block) => block.type === 'resource').map(({ id }) => id),
  );

  lesson.activities.forEach((activity, activityIndex) => {
    if (activity.type === 'quiz') {
      pushDuplicateIssues(
        issues,
        activity.options.map(({ id }) => id),
        `/activities/${activityIndex}/options`,
      );
      if (!activity.options.some(({ id }) => id === activity.correctOptionId)) {
        issues.push({
          code: 'semantic.quiz-answer-missing',
          message: 'correctOptionId không tham chiếu đến option hợp lệ.',
          path: `/activities/${activityIndex}/correctOptionId`,
        });
      }
    }
    if (activity.type === 'quick-code') {
      Object.keys(activity.files).forEach((filename) => {
        if (!SAFE_RELATIVE_PATH.test(filename)) {
          issues.push({
            code: 'security.unsafe-file-path',
            message: `Tên tệp "${filename}" không an toàn.`,
            path: `/activities/${activityIndex}/files`,
          });
        }
      });
    }
  });

  let previousTime = -1;
  lesson.timeline.forEach((event, index) => {
    if (lesson.durationSec === undefined || event.atSec > lesson.durationSec) {
      issues.push({
        code: 'semantic.timeline-out-of-range',
        message: 'Mốc timeline phải nằm trong durationSec đã khai báo.',
        path: `/timeline/${index}/atSec`,
      });
    }
    if (event.atSec < previousTime) {
      issues.push({
        code: 'semantic.timeline-order',
        message: 'Timeline phải được sắp xếp tăng dần theo atSec.',
        path: `/timeline/${index}/atSec`,
      });
    }
    previousTime = event.atSec;

    const validTarget =
      event.action === 'openResource'
        ? resources.has(event.targetId)
        : activityTargetMatches(activities.get(event.targetId), event.action);
    if (!validTarget) {
      issues.push({
        code: 'semantic.timeline-target',
        message: `Target "${event.targetId}" không phù hợp với action ${event.action}.`,
        path: `/timeline/${index}/targetId`,
      });
    }
  });

  lesson.checklist.forEach((item, index) => {
    if (!objectives.has(item.objectiveId)) {
      issues.push({
        code: 'semantic.checklist-objective',
        message: `Objective "${item.objectiveId}" không tồn tại.`,
        path: `/checklist/${index}/objectiveId`,
      });
    }
    if (item.activityId && !activities.has(item.activityId)) {
      issues.push({
        code: 'semantic.checklist-activity',
        message: `Activity "${item.activityId}" không tồn tại.`,
        path: `/checklist/${index}/activityId`,
      });
    }
    if (item.evidence === 'system' && !item.activityId) {
      issues.push({
        code: 'semantic.system-evidence-activity',
        message: 'Checklist system evidence phải tham chiếu activityId.',
        path: `/checklist/${index}/activityId`,
      });
    }
  });

  lesson.contentBlocks.forEach((block, index) => {
    if (block.type === 'resource' && !isSafeResourceUrl(block.url)) {
      issues.push({
        code: 'security.unsafe-resource-url',
        message: 'Resource chỉ được dùng HTTPS hoặc đường dẫn tương đối an toàn.',
        path: `/contentBlocks/${index}/url`,
      });
    }
  });

  if (options.availableAssetRefs) {
    referencedAssets(lesson).forEach(({ path, ref }) => {
      if (!options.availableAssetRefs?.has(ref)) {
        issues.push({
          code: 'semantic.asset-missing',
          message: `Asset "${ref}" không có trong manifest.`,
          path,
        });
      }
    });
  }
  return issues;
}

export function validateLesson(
  input: unknown,
  options: LessonValidationOptions = {},
): ValidationResult<LessonDocument> {
  if (!validateShape(input)) {
    return { ok: false, issues: (validateShape.errors ?? []).map(schemaIssue) };
  }
  const issues = semanticIssues(input, options);
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: structuredClone(input), issues: [] };
}

export class LessonValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(`Lesson không hợp lệ (${issues.length} lỗi).`);
    this.name = 'LessonValidationError';
  }
}

export function assertValidLesson(
  input: unknown,
  options: LessonValidationOptions = {},
): LessonDocument {
  const result = validateLesson(input, options);
  if (!result.ok) throw new LessonValidationError(result.issues);
  return result.value;
}

export { lessonSchema };
