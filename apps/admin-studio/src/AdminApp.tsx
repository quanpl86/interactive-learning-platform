import { AppShell, Badge, Button, Card, PageHeader } from '@ilp/shared-ui';

const navigation = [
  { href: '/dashboard', label: 'Tổng quan', icon: '▦' },
  { href: '/courses', label: 'Khóa học', icon: '▤' },
  { href: '/lessons', label: 'Bài học', icon: '◫' },
  { href: '/publications', label: 'Xuất bản', icon: '↗' },
] as const;

const demoCourses = [
  {
    code: 'PY',
    description: 'Python Console trên web · Tkinter và Pygame thực hành local',
    title: 'Python Development',
  },
  {
    code: '{}',
    description: 'HTML/CSS/JS trên web · React và Next.js thực hành local',
    title: 'Web Development',
  },
] as const;

export function AdminApp() {
  const currentPath = navigation.some((item) => item.href === window.location.pathname)
    ? window.location.pathname
    : '/dashboard';

  return (
    <AppShell appName="Admin Studio" currentPath={currentPath} navigation={navigation}>
      <PageHeader
        eyebrow="Không gian quản trị / Tổng quan"
        title="Quản lý và sản xuất học liệu"
        subtitle="Foundation shell cho quy trình biên soạn, review và xuất bản nội dung tương tác."
        action={
          <Button disabled title="Tính năng được triển khai ở Slice 6">
            Tạo học liệu mới
          </Button>
        }
      />

      <div className="notice" role="status">
        <strong>Dữ liệu minh họa.</strong> Các số liệu và khóa học bên dưới là fixture cục bộ; chưa
        có API, lưu dữ liệu hay xuất bản thật.
      </div>

      <section className="stats-grid" aria-label="Chỉ số minh họa">
        <Card className="stat-card">
          <span>Khóa học mẫu</span>
          <strong>02</strong>
          <small>Python · Web Development</small>
        </Card>
        <Card className="stat-card">
          <span>Bài tập nhanh</span>
          <strong>02</strong>
          <small>Python · HTML/CSS/JS</small>
        </Card>
        <Card className="stat-card">
          <span>Đầu ra thiết kế</span>
          <strong>02</strong>
          <small>Interactive Web · MP4</small>
        </Card>
        <Card className="stat-card">
          <span>Runtime cloud</span>
          <strong>0</strong>
          <small>Không nằm trong MVP</small>
        </Card>
      </section>

      <div className="section-heading">
        <div>
          <h2>Danh mục khóa học</h2>
          <p>Fixture dùng để kiểm tra app shell và design system.</p>
        </div>
        <Badge tone="info">DEMO</Badge>
      </div>

      <section className="course-grid" aria-label="Khóa học mẫu">
        {demoCourses.map((course) => (
          <Card className="course-card" key={course.code}>
            <div className="course-symbol" aria-hidden="true">
              {course.code}
            </div>
            <div className="course-card-body">
              <Badge tone="success">Course fixture</Badge>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className="section-heading">
        <div>
          <h2>Trạng thái Foundation</h2>
          <p>Các bề mặt thật sẽ được mở theo dependency của backlog.</p>
        </div>
      </div>
      <Card>
        <ul className="activity-list">
          <li>
            <span>
              <strong>Hai ứng dụng và design system</strong>
              <small>Admin Studio, Learning Workspace, tokens và shared components</small>
            </span>
            <Badge tone="success">Sẵn sàng</Badge>
          </li>
          <li>
            <span>
              <strong>Lesson Engine</strong>
              <small>Chưa triển khai; thuộc Slice 1–2</small>
            </span>
            <Badge>Đã lên kế hoạch</Badge>
          </li>
          <li>
            <span>
              <strong>Backend và tài khoản</strong>
              <small>Không dùng mock để khẳng định đã có persistence</small>
            </span>
            <Badge tone="warning">Chưa kết nối</Badge>
          </li>
        </ul>
      </Card>
    </AppShell>
  );
}
