# Prompt to paste into Codex — Slice 0

Bạn là engineering lead của Interactive Learning Platform. Đọc `AGENTS.md`, `README.md`, `docs/01-product-scope.md`, `docs/02-architecture.md`, `docs/03-delivery-plan.md`, `docs/design/UI_UX.md`, `docs/06-acceptance-qa.md` và `docs/backlog.json`. Đừng tự mở rộng sang cloud IDE, runtime Node/Tkinter/Pygame server hoặc dark mode.

TASK: Hoàn thành **Slice 0 / Foundation** trong repository hiện tại. Trước khi sửa code, kiểm tra `git status`, cây file và các file có sẵn; không ghi đè công việc cũ. Tạo pnpm monorepo thực với hai Vite+React+TypeScript app `apps/admin-studio`, `apps/learning-workspace`, package `packages/shared-ui`, `packages/design-tokens`, cấu hình strict TS, lint, format, unit test và một Playwright smoke test nếu hạ tầng phù hợp. Dùng UI reference trong `ui-prototype/`, nhưng xây lại semantic React components; light-only responsive đạt 360/768/1280px và keyboard focus. Tạo route shell rõ ràng và dùng mock fixture dán nhãn DEMO; **không** giả vờ API/lưu/publish đã chạy. Cập nhật README setup, `.env.example` không có secrets, CI nếu có, và `docs/backlog.json` theo bằng chứng.

ACCEPT: cả hai app dev/build được; typecheck/lint/test thành công; kiểm tra responsive ở 360, 768 và 1280; Git không chứa PII/secrets. Nếu không cài được dependency hoặc chạy e2e, nêu rõ lệnh/đầu ra và blocker, không tuyên bố PASS. Chỉ hoàn thành Slice 0; đừng tiếp tục Slice 1 khi chưa được giao.

OUTPUT: files changed, architecture decisions, test commands/results, screenshots if obtained, blockers, proposed next PR. Không deploy/push main nếu chưa được yêu cầu.
