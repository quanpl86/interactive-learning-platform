import { lazy, Suspense } from 'react';
import { LessonPlayer } from '@ilp/lesson-player';
import { AppShell, Badge, Card, PageHeader } from '@ilp/shared-ui';
import printChecks from '../../../examples/tests/print.formative.json';
import { demoLessons } from './fixtures';

const PythonPractice = lazy(() =>
  import('@ilp/mini-coding').then(({ PythonPractice: Component }) => ({ default: Component })),
);

const navigation = [
  { href: '/courses', label: 'Khóa học', icon: '▤' },
  { href: '/learn/demo-release', label: 'Bài đang học', icon: '▶' },
  { href: '/projects', label: 'Dự án của tôi', icon: '⌘' },
  { href: '/submissions', label: 'Bài nộp', icon: '✓' },
] as const;

export function LearningApp() {
  const path = window.location.pathname;
  const lessonId = path.match(/^\/learn\/([^/]+)/)?.[1];
  const lesson = demoLessons.find(({ id }) => id === lessonId);
  const currentPath = lessonId ? '/learn/demo-release' : '/courses';

  return (
    <AppShell appName="Learning Workspace" currentPath={currentPath} navigation={navigation}>
      {lesson ? (
        <LessonPlayer
          key={lesson.id}
          lesson={lesson}
          renderQuickCode={(activity, onCompleted) => {
            if (activity.runtime !== 'python-console') return undefined;
            return (
              <Suspense fallback={<div className="lesson-notice">Đang tải trình soạn thảo…</div>}>
                <PythonPractice
                  activityId={activity.id}
                  starterFiles={activity.files}
                  checks={activity.testSpecRef === 'tests/print.formative.json' ? printChecks : undefined}
                  runnerUrl={getPythonRunnerUrl()}
                  onCompleted={onCompleted}
                />
              </Suspense>
            );
          }}
        />
      ) : (
        <CourseCatalog />
      )}
    </AppShell>
  );
}

function CourseCatalog() {
  return (
    <>
      <PageHeader
        eyebrow="Không gian học tập / Khóa học"
        title="Học và thực hành theo từng bước"
        subtitle="Chọn một lesson để đọc nội dung, xem checkpoint, trả lời quiz và xác nhận checklist."
      />

      <div className="notice" role="status">
        <strong>Chế độ demo.</strong> Lesson v2 đã được validate ở runtime; câu trả lời và checklist
        chưa đồng bộ backend.
      </div>

      <div className="section-heading">
        <div>
          <h2>Khóa học mẫu</h2>
          <p>Hai hướng học đã khóa trong phạm vi MVP.</p>
        </div>
        <Badge tone="info">VIỆT NAM</Badge>
      </div>

      <section className="course-grid" aria-label="Danh sách khóa học">
        {demoLessons.map((lesson) => (
          <Card className="course-card" key={lesson.id}>
            <div className="course-symbol" aria-hidden="true">
              {lesson.id.startsWith('PY') ? 'PY' : '{}'}
            </div>
            <div className="course-card-body">
              <Badge tone="success">
                {lesson.id.startsWith('PY') ? 'Python Console' : 'Web Static'}
              </Badge>
              <h2>{lesson.title}</h2>
              <p>{lesson.objectives[0]?.text}</p>
              <a className="button button-primary lesson-open-link" href={`/learn/${lesson.id}`}>
                Mở bài học
              </a>
              <small className="course-meta">
                {lesson.activities.length} hoạt động · {lesson.contentBlocks.length} block nội dung
              </small>
            </div>
          </Card>
        ))}
      </section>

      <div className="section-heading">
        <div>
          <h2>Phạm vi runtime</h2>
          <p>Python Console đã chạy thật; Web Static được triển khai ở Slice 4.</p>
        </div>
      </div>
      <section className="content-grid">
        <Card>
          <ul className="activity-list">
            <li>
              <span>
                <strong>Markdown và resource</strong>
                <small>Parser subset, không render HTML thô từ lesson</small>
              </span>
              <Badge tone="success">Sẵn sàng</Badge>
            </li>
            <li>
              <span>
                <strong>Video và timeline</strong>
                <small>Native media.currentTime, captions nếu asset tồn tại</small>
              </span>
              <Badge tone="success">Sẵn sàng</Badge>
            </li>
            <li>
              <span>
                <strong>Mini Coding</strong>
                <small>Python Console sẵn sàng; Web Static thuộc Slice 4</small>
              </span>
              <Badge tone="success">Python sẵn sàng</Badge>
            </li>
          </ul>
        </Card>
        <Card>
          <h2>Thực hành dự án local</h2>
          <p>
            Tkinter, Pygame, React và Next.js chạy trên Windows hoặc macOS bằng starter project; nền
            tảng không giả lập Cloud IDE.
          </p>
          <span className="muted-copy">Starter ZIP thuộc Slice 5.</span>
        </Card>
      </section>
    </>
  );
}

function getPythonRunnerUrl(): string | undefined {
  const configured = import.meta.env.VITE_PYTHON_RUNNER_URL as string | undefined;
  if (configured) {
    const url = new URL(configured, window.location.origin);
    if (!import.meta.env.DEV && (url.protocol !== 'https:' || url.origin === window.location.origin)) {
      return undefined;
    }
    return url.toString();
  }
  if (import.meta.env.DEV) return new URL('/python-runner.html', window.location.origin).toString();
  return undefined;
}
