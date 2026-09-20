import { LessonPlayer } from '@ilp/lesson-player';
import { AppShell, Badge, Card, PageHeader } from '@ilp/shared-ui';
import { demoLessons } from './fixtures';

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
      {lesson ? <LessonPlayer key={lesson.id} lesson={lesson} /> : <CourseCatalog />}
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
          <p>Slice 2 chỉ đọc, video, quiz và checklist.</p>
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
                <small>Python và Web browser runtime thuộc Slice 3–4</small>
              </span>
              <Badge tone="warning">Chưa tích hợp</Badge>
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
