import pythonLesson from '../../../examples/lesson.sample.json';
import webLesson from '../../../examples/lesson.web.sample.json';
import { assertValidLesson, toStudentLesson, type StudentLessonDocument } from '@ilp/lesson-schema';

export const demoLessons: readonly StudentLessonDocument[] = [
  toStudentLesson(assertValidLesson(pythonLesson)),
  toStudentLesson(assertValidLesson(webLesson)),
];
