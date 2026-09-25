# Interactive Learning Platform

Nền tảng sản xuất học liệu và học tập tương tác tích hợp thực hành lập trình.

> An extensible learning platform for creating, publishing, and delivering interactive lessons, AI-powered educational videos, quizzes, and browser-based coding practice.

**Phiên bản:** `0.1.0` — Foundation

**Trạng thái:** Foundation, Content Model v2, Learning vertical và Mini Python đã chạy; dữ liệu UI vẫn là fixture được gắn nhãn `DEMO`. Backend, tài khoản, lưu tiến độ và Mini Web chưa được triển khai.

## Phạm vi Foundation

- `apps/admin-studio`: shell quản trị học liệu.
- `apps/learning-workspace`: shell học tập và thực hành.
- `packages/design-tokens`: light-only design tokens.
- `packages/shared-ui`: semantic React components dùng chung.
- `packages/lesson-schema`: contract v2, runtime validation, migration v1 và immutable release model.
- `packages/lesson-player`: safe Markdown subset, native video/captions, chapters, timeline, quiz và checklist.
- `packages/mini-coding`: Monaco light, Pyodide Worker tách runner page, Run/Stop/Reset và kiểm tra formative.
- pnpm workspace, strict TypeScript, ESLint, Prettier, Vitest và Playwright.
- Docker dev workflow có hot reload và production image cho từng app.
- GitHub Actions kiểm tra chất lượng và Docker build.

Prototype cũ trong `ui-prototype/` chỉ là tài liệu tham chiếu. Hai app React trong `apps/` mới là mã nguồn Foundation.

## Yêu cầu phát triển

- Node.js 24.x
- pnpm 11.19.0 qua Corepack
- Docker Desktop mới nếu dùng workflow Docker
- Windows 11 hoặc macOS hiện hành; Docker image dùng Linux container và hỗ trợ cả máy Intel/Apple Silicon qua base image đa kiến trúc.

Repository có cấu hình pnpm `hoisted` và source aliases để hoạt động trên filesystem không hỗ trợ symlink như exFAT, đồng thời vẫn chạy trên NTFS, APFS và Linux.

## Chạy trực tiếp trên máy

```bash
corepack enable
pnpm install
pnpm dev
```

- Admin Studio: <http://localhost:5173/dashboard>
- Learning Workspace: <http://localhost:5174/courses>
- Python lesson: <http://localhost:5174/learn/PY-GUESS-01>

Ở local development, Python runner dùng `/python-runner.html` cùng dev server vì chưa có auth/cookie.
Production chỉ bật nút chạy khi `VITE_PYTHON_RUNNER_URL` là HTTPS và khác origin ứng dụng; runner host
phải không có platform cookie/token và gửi CSP bằng HTTP header cho HTML lẫn Worker assets.

Chạy riêng từng app:

```bash
pnpm dev:admin
pnpm dev:learner
```

Nếu cổng đang được ứng dụng khác sử dụng, dùng Docker Compose với biến port như phần dưới hoặc gọi script app cùng `--port` khác.

## Chạy bằng Docker trên Windows và macOS

```bash
docker compose up --build
```

Mặc định:

- Admin Studio: <http://localhost:5173/dashboard>
- Learning Workspace: <http://localhost:5174/courses>

Đổi cổng host mà không sửa file Compose:

PowerShell:

```powershell
$env:ADMIN_PORT = "15173"
$env:LEARNER_PORT = "15174"
docker compose up --build
```

macOS/Linux:

```bash
ADMIN_PORT=15173 LEARNER_PORT=15174 docker compose up --build
```

Dừng môi trường:

```bash
docker compose down
```

Khi lockfile hoặc dependencies thay đổi, chạy lại `docker compose build`. Source được bind mount và Vite polling được bật để hot reload ổn định qua Docker Desktop.

## Production image cục bộ

```bash
docker build --build-arg APP_NAME=admin-studio \
  -t interactive-learning-platform/admin-studio:0.1.0 .

docker build --build-arg APP_NAME=learning-workspace \
  -t interactive-learning-platform/learning-workspace:0.1.0 .
```

Mỗi image phục vụ SPA trên cổng `8080` bằng process Node không chạy với quyền root. Ví dụ:

```bash
docker run --rm -p 8080:8080 interactive-learning-platform/admin-studio:0.1.0
```

## Kiểm tra chất lượng

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm e2e
docker compose config
```

`pnpm quality` chạy lint, typecheck, unit test và build. E2E dùng cổng riêng `6173/6174` và không reuse server ngoài dự án để tránh kết quả sai.

## Cấu trúc chính

```text
apps/
  admin-studio/
  learning-workspace/
packages/
  design-tokens/
  lesson-player/
  lesson-schema/
  shared-ui/
docs/
schemas/
examples/
tests/e2e/
ui-prototype/
```

Các package và service của Slice sau được tạo khi bắt đầu đúng slice; không scaffold backend giả để tuyên bố đã có persistence.

## Quy tắc triển khai

Đọc `AGENTS.md`, sau đó `docs/01-product-scope.md`, `docs/02-architecture.md`, `docs/03-delivery-plan.md` và prompt của slice được giao. Không tự mở rộng sang Cloud IDE, runtime server cho mã học sinh hoặc dark mode.

Repository `quanpl86/hocweb2026` tiếp tục là kho giáo trình Web độc lập. Hướng dẫn nhập học liệu nằm trong `docs/09-migration.md`.

Khi chuyển máy hoặc tiếp tục một phiên Codex mới, bắt đầu từ `docs/14-progress-handoff.md` để lấy đúng
branch, commit, lệnh bootstrap, bằng chứng kiểm thử và kế hoạch slice kế tiếp.

## License

Chưa chọn. Không phát hành công khai hoặc thêm license trước khi hoàn tất rà soát dependency, model và tài sản nội dung.
