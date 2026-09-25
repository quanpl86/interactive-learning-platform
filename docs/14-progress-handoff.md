# Progress handoff — 2026-09-25

Tài liệu này là điểm bắt đầu khi chuyển môi trường phát triển sang Windows hoặc macOS. Đọc cùng
`AGENTS.md`, `docs/03-delivery-plan.md` và `docs/backlog.json` trước khi tiếp tục code.

## Git state cần checkout

- Repository: `https://github.com/quanpl86/interactive-learning-platform.git`
- Branch tiếp tục: `feat/slice-3-mini-python`
- Foundation trên `main`: `f9093c4`
- Slice 1 Content Model: `abac1de`
- Slice 2 Learning vertical: `70050fc`
- Feature-branch CI: `9777e5c`
- Slice 3 base/handoff: `cb914a2`

Sau khi clone hoặc pull, kiểm tra commit mới nhất bằng `git log -3 --oneline` và đối chiếu branch
`feat/slice-3-mini-python` trên GitHub.

## Tiến độ có bằng chứng

Backlog hiện hoàn thành 14/34 công việc, tương đương 41,2% nếu chỉ tính theo số issue. Các issue có
khối lượng khác nhau nên tỷ lệ này không phải phần trăm effort.

| Slice                 | Trạng thái | Issue                              |
| --------------------- | ---------- | ---------------------------------- |
| 0 — Foundation        | Hoàn thành | FND-001, FND-002, FND-003          |
| 1 — Content Model     | Hoàn thành | MOD-001, MOD-002, MOD-003          |
| 2 — Learning vertical | Hoàn thành | LRN-001, LRN-002, LRN-003, LRN-004 |
| 3 — Mini Python       | Hoàn thành | PY-001, PY-002, PY-003, PY-004     |
| 4–9                   | Planned    | 20 issue còn lại                   |

Đã có hai React app, shared design system, lesson schema/validator/migration, immutable release model,
catalog/detail lesson, safe Markdown subset, native video/captions/chapters, timeline state machine,
formative quiz, checklist evidence và Mini Python Monaco/Pyodide.

## Bằng chứng kiểm thử gần nhất

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm quality:negative`: PASS; 29/29 unit tests.
- `pnpm e2e`: PASS — 10 passed, 2 lifecycle cases intentionally skipped ngoài desktop; UI chạy ở
  360, 768 và 1280 px. Runtime test xác minh print thật, SyntaxError, input policy, output limit,
  infinite-loop Stop và chạy lại bằng Worker mới.
- Docker Node 24 production build: PASS cho `ilp/admin:slice-3` và `ilp/learner:slice-3`.
- Host MacBook hiện là Node 22 nên lệnh `pnpm build --configLoader native` trên host không hợp lệ;
  production build được xác minh trong image `node:24-alpine` đúng contract của repo.
- Security review: production yêu cầu HTTPS runner khác app origin, không cookie/token; source/origin,
  nonce, runId, message schema, filename, payload, load/execution time và output đều được kiểm tra.
- Known release gate: hạ tầng runner production phải gửi CSP bằng HTTP header cho runner HTML và
  Worker assets. Khi chưa cấu hình `VITE_PYTHON_RUNNER_URL` hợp lệ, production execution tự tắt.

## Bootstrap trên MacBook

Yêu cầu: Git, Docker Desktop, Node.js 24.x và Corepack. Trên Apple Silicon không cần ép `platform`;
base image `node:24-alpine` tự chọn kiến trúc phù hợp.

```bash
git clone https://github.com/quanpl86/interactive-learning-platform.git
cd interactive-learning-platform
git fetch --all --prune
git switch feat/slice-3-mini-python

corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm quality
pnpm exec playwright install chromium
pnpm e2e
```

Chạy native:

```bash
pnpm dev
```

- Admin Studio: <http://localhost:5173/dashboard>
- Learning catalog: <http://localhost:5174/courses>
- Python lesson: <http://localhost:5174/learn/PY-GUESS-01>
- Web lesson: <http://localhost:5174/learn/WEB-STATIC-01>

Chạy bằng Docker:

```bash
docker compose up --build
docker compose ps
```

Nếu cổng bận:

```bash
ADMIN_PORT=15173 LEARNER_PORT=15174 docker compose up --build
```

## Trạng thái dữ liệu và giới hạn hiện tại

- UI vẫn dùng fixture, có nhãn demo rõ ràng; chưa có backend, auth, RBAC hoặc database.
- Quiz/checklist chỉ tồn tại trong React state. Refresh reset trạng thái; save/resume thật thuộc Slice 5.
- Python fixture tham chiếu MP4/VTT chưa tồn tại nên Player hiển thị fallback, không giả trạng thái phát.
- Browser Python đã triển khai ở Slice 3; production execution tự tắt cho tới khi cấu hình runner
  HTTPS khác origin và CSP header. HTML/CSS/JS runtime chưa được triển khai.
- System/teacher checklist không thể tự xác nhận bởi học sinh.
- Không có secret hoặc dữ liệu học sinh thật trong repository.
- `hocweb2026` chỉ là nguồn import/reference; không sửa hoặc push vào repository đó.

## Kế hoạch tiếp theo — Slice 4 Mini Web

Thực hiện WEB-001 → WEB-004 theo dependency: fixed HTML/CSS/JS tabs, preview origin tách biệt, console
bridge có source/origin/runId validation và formative DOM/CSS checks. Không dùng `srcdoc` như security
boundary production; không cho untrusted JS đọc parent DOM, cookie hoặc token.

## Quy trình tiếp tục an toàn

```bash
git status --short
git pull --ff-only
git switch -c feat/slice-4-mini-web
```

Sau mỗi slice: cập nhật `docs/backlog.json`, chạy `pnpm quality`, `pnpm e2e`, Docker build, ghi known
gaps, commit trên branch riêng và chỉ merge/push `main` khi đã có yêu cầu rõ ràng.
