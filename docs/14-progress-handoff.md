# Progress handoff Windows/macOS — 2026-09-25

Tài liệu này là điểm bắt đầu chính thức khi chuyển việc phát triển giữa Windows và macOS. Codex ở
máy mới phải đọc `AGENTS.md`, tài liệu này, `docs/03-delivery-plan.md`, `docs/backlog.json` và các
acceptance/security rules liên quan trước khi sửa code.

## Mốc Git đã xác minh

- Repository: `https://github.com/quanpl86/interactive-learning-platform.git`
- Branch chứa toàn bộ Slice 3: `feat/slice-3-mini-python`
- Commit triển khai Slice 3: `a34464c72dcdab8c6843b93b6ed68ac7b8f1c6c5`
- Commit nền Slice 2: `cb914a2`
- Slice tiếp theo: **Slice 4 — Mini Web**, gồm `WEB-001`, `WEB-002`, `WEB-003`
- Branch mới cần tạo trên máy tiếp tục: `feat/slice-4-mini-web`

Không phát triển Slice 4 trực tiếp trên `main` hoặc tiếp tục ghi code vào branch Slice 3. Branch
Slice 4 phải được tạo sau khi đã pull bản mới nhất của `origin/feat/slice-3-mini-python`.

## Tiến độ có bằng chứng

Backlog hiện hoàn thành 14/34 công việc, tương đương 41,2% nếu chỉ tính số issue. Các issue có khối
lượng khác nhau nên đây không phải phần trăm effort.

| Slice                 | Trạng thái | Issue                               |
| --------------------- | ---------- | ----------------------------------- |
| 0 — Foundation        | Hoàn thành | FND-001, FND-002, FND-003           |
| 1 — Content Model     | Hoàn thành | MOD-001, MOD-002, MOD-003           |
| 2 — Learning vertical | Hoàn thành | LRN-001, LRN-002, LRN-003, LRN-004 |
| 3 — Mini Python       | Hoàn thành | PY-001, PY-002, PY-003, PY-004      |
| 4 — Mini Web          | Kế tiếp    | WEB-001, WEB-002, WEB-003           |
| 5–9                   | Planned    | 17 issue còn lại                    |

Đã có hai React app, shared design system, lesson schema/validator/migration, immutable release model,
catalog/detail lesson, safe Markdown subset, native video/captions/chapters, timeline state machine,
formative quiz, checklist evidence và Mini Python Monaco/Pyodide.

## Bằng chứng kiểm thử của Slice 3

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm quality:negative`: PASS; 29/29 unit tests.
- `pnpm e2e`: PASS — 10 passed, 2 lifecycle cases chủ động skip ngoài desktop; UI được kiểm tra ở
  360, 768 và 1280 px. Runtime test bao phủ print thật, SyntaxError, input policy, output limit,
  infinite-loop Stop và chạy lại bằng Worker mới.
- Docker Node 24 production build: PASS cho `ilp/admin:slice-3` và `ilp/learner:slice-3`.
- `docker compose config`: PASS.
- MacBook dùng Node 22 chỉ tạo cảnh báo engine; bằng chứng production build lấy từ `node:24-alpine`
  đúng contract của repo.
- Security review không có blocker trong code Slice 3. Release gate còn lại là hạ tầng runner HTTPS
  khác app origin và CSP gửi bằng HTTP response header.

## Tiếp tục trên Windows — clone mới

Yêu cầu: Git, Docker Desktop chạy Linux containers, Node.js 24.x và pnpm 11.19.0. Chạy trong
PowerShell tại thư mục cha muốn chứa repository:

```powershell
git clone --branch feat/slice-3-mini-python https://github.com/quanpl86/interactive-learning-platform.git
Set-Location interactive-learning-platform
git fetch origin --prune
git status --short --branch
git log -3 --oneline
git merge-base --is-ancestor a34464c HEAD

corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm quality
pnpm exec playwright install chromium
pnpm e2e
```

`git merge-base --is-ancestor a34464c HEAD` phải trả exit code `0`. Repository có `.gitattributes`
để giữ LF nhất quán; không đổi lockfile hoặc pnpm linker chỉ vì chuyển từ macOS sang NTFS.

## Tiếp tục trên Windows — đã có repository

Trước tiên chạy `git status --short --branch`. Nếu có file sửa hoặc file chưa track, dừng và kiểm tra
quyền sở hữu thay đổi; không tự reset, checkout đè hoặc stash thay đổi của người dùng. Khi working tree
sạch:

```powershell
git fetch origin --prune
git switch feat/slice-3-mini-python
git pull --ff-only origin feat/slice-3-mini-python
git status --short --branch
git log -3 --oneline
git merge-base --is-ancestor a34464c HEAD
pnpm install --frozen-lockfile
```

Nếu branch Slice 4 chưa tồn tại ở máy Windows:

```powershell
git switch -c feat/slice-4-mini-web
```

Nếu branch đã tồn tại do một phiên làm việc trước, dùng `git switch feat/slice-4-mini-web`, kiểm tra
status và upstream trước khi tiếp tục; không tạo branch trùng hoặc force-push.

## Chạy và xác minh môi trường

Chạy native:

```powershell
pnpm dev
```

- Admin Studio: <http://localhost:5173/dashboard>
- Learning catalog: <http://localhost:5174/courses>
- Python lesson: <http://localhost:5174/learn/PY-GUESS-01>
- Web lesson: <http://localhost:5174/learn/WEB-STATIC-01>

Chạy bằng Docker Desktop:

```powershell
docker compose config
docker compose up --build
```

Khi cổng mặc định bận trong PowerShell:

```powershell
$env:ADMIN_PORT = "15173"
$env:LEARNER_PORT = "15174"
docker compose up --build
```

Docker là tooling chuẩn hóa môi trường, không phải runtime chạy code học sinh.

## Kế hoạch triển khai kế tiếp — Slice 4 Mini Web

### Hành trình người học

Học sinh mở fixture `WEB-STATIC-01`, sửa ba file cố định `index.html`, `style.css`, `script.js`, bấm
Run để xem preview và console, rồi chạy formative checks. Reset phải cảnh báo khi có thay đổi chưa lưu.
Kết quả browser chỉ mang tính formative, không phải điểm chính thức.

### Phạm vi nhỏ nhất theo dependency

1. `WEB-001`: Monaco ba tab cố định, dirty/reset và preview UI; tái sử dụng primitive từ
   `packages/mini-coding`, không tạo app mới.
2. `WEB-002`: explicit Run, iframe `sandbox="allow-scripts"`, runner/preview origin tách biệt ở
   production; code học sinh không đọc parent DOM, cookie hoặc token.
3. `WEB-003`: console bridge và DOM/CSS formative checks với validation chặt `source`, `origin`,
   `nonce`, `runId` và message schema; payload giả hoặc stale phải bị bỏ qua.

Không triển khai backend save/resume, auth/RBAC, upload, cloud execution, shell/package install hoặc
arbitrary multi-file IDE trong Slice 4. Các phần save/persistence thuộc Slice 5.

### File dự kiến tác động

- `packages/mini-coding/src/`: Web editor, preview bridge/protocol, checks, styles và unit tests.
- `apps/learning-workspace/`: runner HTML/entry riêng, Vite entry/config và tích hợp activity.
- `packages/lesson-player/src/LessonPlayer.tsx`: chỉ nối activity Web nếu interface hiện tại cần.
- `examples/lesson.web.sample.json` và `examples/tests/`: fixture/checks, không đưa đáp án tin cậy ra
  client.
- `tests/e2e/foundation.spec.ts`: happy path, reset, console, isolation và malicious/stale messages.
- `.env.example`, `Dockerfile`, `README.md`, `docs/10-decisions.md`,
  `docs/13-development-environment.md`, `docs/backlog.json` và tài liệu handoff này khi cần.

Không thay schema nếu contract `web-static` hiện tại đủ dùng. Nếu buộc phải đổi contract, phải thêm
validator/migration tests và chứng minh fixture cũ vẫn đọc được.

### Acceptance và decision gates

- Ba file sửa được, chuyển tab không mất nội dung, reset dirty có xác nhận, keyboard focus rõ ràng.
- HTML hiển thị, CSS thay đổi giao diện, JS click hoạt động sau explicit Run; lỗi script hiện ở console
  bằng thông báo dễ hiểu.
- Không dùng `eval` trong parent, không đọc `contentDocument` của opaque sandbox iframe, không kết hợp
  `allow-scripts` với `allow-same-origin` cho untrusted preview.
- URL/network/form/navigation bị CSP giới hạn; preview không nhận platform credentials hoặc secrets.
- Bridge loại bỏ sai origin/source/schema/runId/nonce và message từ lượt chạy cũ.
- Formative DOM/CSS checks có pass/fail unit tests nhưng không được tự nhận là trusted grading.
- UI light-only, responsive tại 360/768/1280, không horizontal overflow, trạng thái không chỉ dựa màu.
- Local development có thể dùng runner local có nhãn rõ; production phải tự tắt nếu chưa có HTTPS
  preview origin riêng và CSP response headers. Không hạ sandbox để làm demo chạy.
- Trước khi đánh dấu `WEB-*` done: chạy lint, typecheck, unit, negative gate, E2E và Docker Node 24
  builds; chỉ cập nhật backlog theo bằng chứng thật.

## Prompt khởi động cho Codex trên Windows

Sau khi checkout branch `feat/slice-4-mini-web`, dùng yêu cầu sau:

> Đọc toàn bộ `AGENTS.md`, `docs/01-product-scope.md`, `docs/02-architecture.md`,
> `docs/03-delivery-plan.md`, `docs/12-implementation-blueprint.md`,
> `docs/14-progress-handoff.md`, `docs/backlog.json`, `docs/06-acceptance-qa.md`, các rules và skill
> phù hợp trước khi code. Kiểm tra git status và xác nhận branch `feat/slice-4-mini-web` bắt nguồn từ
> bản mới nhất của `origin/feat/slice-3-mini-python` có commit `a34464c`. Lập implementation plan và
> danh sách file dự kiến sửa, sau đó triển khai đúng Slice 4 theo thứ tự WEB-001 → WEB-002 → WEB-003.
> Giữ lockfile, tương thích Windows/macOS, không hạ iframe/CSP security boundary, không triển khai
> backend/persistence ngoài scope. Chạy QA có bằng chứng, cập nhật backlog/handoff, commit trên branch
> Slice 4 và không merge hoặc push `main` nếu chưa được yêu cầu.

## Trạng thái dữ liệu và giới hạn cần giữ nguyên

- UI vẫn dùng fixture và có nhãn demo; chưa có backend, auth, RBAC hoặc database.
- Quiz/checklist chỉ ở React state; refresh reset trạng thái. Save/resume thật thuộc Slice 5.
- Python fixture tham chiếu MP4/VTT chưa tồn tại nên Player hiển thị fallback trung thực.
- Browser Python production tự tắt nếu thiếu `VITE_PYTHON_RUNNER_URL` HTTPS khác origin và CSP header.
- System/teacher checklist không thể tự xác nhận bởi học sinh.
- Không đưa secret, dữ liệu học sinh thật hoặc teacher-only answers vào repository/public bundle.
- `hocweb2026` chỉ là nguồn import/reference; không sửa hoặc push repository đó.

Sau mỗi slice: cập nhật `docs/backlog.json`, chạy QA theo rủi ro, ghi rõ known gaps, commit trên branch
riêng và chỉ merge/push `main` khi có yêu cầu rõ ràng.
