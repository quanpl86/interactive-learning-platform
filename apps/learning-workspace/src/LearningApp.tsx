import { AppShell, Badge, Button, Card, PageHeader } from '@ilp/shared-ui';

const navigation = [
  { href: '/courses', label: 'Khóa học', icon: '▤' },
  { href: '/learn/demo-release', label: 'Bài đang học', icon: '▶' },
  { href: '/projects', label: 'Dự án của tôi', icon: '⌘' },
  { href: '/submissions', label: 'Bài nộp', icon: '✓' },
] as const;

const demoCourses = [
  {
    badge: 'Python Console',
    description:
      'Đọc bài, quiz và Python Console trong trình duyệt; dự án GUI làm trên máy cá nhân.',
    lessons: '01 bài mẫu',
    symbol: 'PY',
    title: 'Python Development',
  },
  {
    badge: 'Web Static',
    description:
      'HTML/CSS/JavaScript preview trong trình duyệt; React và Next.js dùng starter project local.',
    lessons: '01 bài mẫu',
    symbol: '{}',
    title: 'Web Development',
  },
] as const;

export function LearningApp() {
  const currentPath = navigation.some((item) => item.href === window.location.pathname)
    ? window.location.pathname
    : '/courses';

  return (
    <AppShell appName="Learning Workspace" currentPath={currentPath} navigation={navigation}>
      <PageHeader
        eyebrow="Không gian học tập / Khóa học"
        title="Học và thực hành theo từng bước"
        subtitle="Foundation shell cho nội dung đọc, video, quiz, checklist và Mini Coding Workspace."
        action={
          <Button disabled title="Đăng nhập được triển khai cùng backend">
            Tiếp tục bài học
          </Button>
        }
      />

      <div className="notice" role="status">
        <strong>Chế độ demo.</strong> Foundation chưa lưu tiến độ và chưa chạy mã. Các CTA chưa có
        backend được vô hiệu hóa rõ ràng.
      </div>

      <div className="section-heading">
        <div>
          <h2>Khóa học mẫu</h2>
          <p>Hai hướng học đã khóa trong phạm vi MVP.</p>
        </div>
        <Badge tone="info">VIỆT NAM</Badge>
      </div>

      <section className="course-grid" aria-label="Danh sách khóa học">
        {demoCourses.map((course) => (
          <Card className="course-card" key={course.title}>
            <div className="course-symbol" aria-hidden="true">
              {course.symbol}
            </div>
            <div className="course-card-body">
              <Badge tone="success">{course.badge}</Badge>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <small className="course-meta">{course.lessons} · Dữ liệu minh họa</small>
            </div>
          </Card>
        ))}
      </section>

      <div className="section-heading">
        <div>
          <h2>Luồng học dự kiến</h2>
          <p>Chưa ghi nhận hoàn thành ở Foundation.</p>
        </div>
      </div>
      <section className="content-grid">
        <Card>
          <ul className="activity-list">
            <li>
              <span>
                <strong>1. Đọc nội dung và mục tiêu</strong>
                <small>Lesson renderer an toàn được triển khai ở Slice 2</small>
              </span>
              <Badge>Chưa bắt đầu</Badge>
            </li>
            <li>
              <span>
                <strong>2. Video và checkpoint</strong>
                <small>Không hiển thị nút phát giả khi chưa có media</small>
              </span>
              <Badge>Chưa bắt đầu</Badge>
            </li>
            <li>
              <span>
                <strong>3. Mini Coding Workspace</strong>
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
          <Button variant="secondary" disabled title="Starter ZIP thuộc Slice 5">
            Tải project mẫu
          </Button>
        </Card>
      </section>
    </AppShell>
  );
}
