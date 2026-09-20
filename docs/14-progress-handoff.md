# Progress handoff — 2026-09-20

Tài liệu này là điểm bắt đầu khi chuyển môi trường phát triển sang Windows hoặc macOS. Đọc cùng
`AGENTS.md`, `docs/03-delivery-plan.md` và `docs/backlog.json` trước khi tiếp tục code.

## Git state cần checkout

- Repository: `https://github.com/quanpl86/interactive-learning-platform.git`
- Branch tiếp tục: `feat/slice-2-learning-vertical`
- Foundation trên `main`: `f9093c4`
- Slice 1 Content Model: `abac1de`
- Slice 2 Learning vertical: `70050fc`

Sau khi clone hoặc pull, kiểm tra commit mới nhất bằng `git log -3 --oneline`. Commit chứa chính tài
liệu handoff này nằm sau `70050fc`.

## Tiến độ có bằng chứng

Backlog hiện hoàn thành 10/34 công việc, tương đương 29,4% nếu chỉ tính theo số issue. Các issue có
khối lượng khác nhau nên tỷ lệ này không phải phần trăm effort.

| Slice                 | Trạng thái | Issue                              |
| --------------------- | ---------- | ---------------------------------- |
| 0 — Foundation        | Hoàn thành | FND-001, FND-002, FND-003          |
| 1 — Content Model     | Hoàn thành | MOD-001, MOD-002, MOD-003          |
| 2 — Learning vertical | Hoàn thành | LRN-001, LRN-002, LRN-003, LRN-004 |
| 3–9                   | Planned    | 24 issue còn lại                   |

Đã có hai React app, shared design system, lesson schema/validator/migration, immutable release model,
catalog/detail lesson, safe Markdown subset, native video/captions/chapters, timeline state machine,
formative quiz và checklist evidence.

## Bằng chứng kiểm thử gần nhất

- `pnpm quality`: PASS — lint, TypeScript, 23 unit tests, negative quality gate và hai production build.
- `pnpm e2e`: PASS — 6/6 tests ở 360, 768 và 1280 px.
- Timeline tests: ordinary playback, forward seek, backward seek, repeatable và once-per-release.
- Security checks: không dùng raw `innerHTML`/`dangerouslySetInnerHTML`; link Markdown chỉ nhận HTTPS
  hoặc path tương đối; student payload không chứa `correctOptionId`.
- Handoff validator: PASS 7 nhóm. Python package `jsonschema` chưa cài nên phần kiểm tra Python đầy đủ
  được skip; Ajv runtime và Vitest vẫn kiểm tra JSON Schema v2.
- Docker production images đã PASS ở Slice 1. Slice 2 chưa build lại local vì Docker Desktop daemon
  không hoạt động ở cuối phiên; GitHub Actions phải xác nhận Docker matrix sau khi push.

## Bootstrap trên MacBook

Yêu cầu: Git, Docker Desktop, Node.js 24.x và Corepack. Trên Apple Silicon không cần ép `platform`;
base image `node:24-alpine` tự chọn kiến trúc phù hợp.

```bash
git clone https://github.com/quanpl86/interactive-learning-platform.git
cd interactive-learning-platform
git fetch --all --prune
git switch feat/slice-2-learning-vertical

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
- Browser Python và HTML/CSS/JS runtime chưa được triển khai.
- System/teacher checklist không thể tự xác nhận bởi học sinh.
- Không có secret hoặc dữ liệu học sinh thật trong repository.
- `hocweb2026` chỉ là nguồn import/reference; không sửa hoặc push vào repository đó.

## Kế hoạch tiếp theo — Slice 3 Mini Python

Thực hiện theo thứ tự dependency, trên branch mới tạo từ branch hiện tại sau khi CI xanh:

1. PY-001: fixed-file editor UI, dirty state và reset confirmation.
2. PY-002: pinned Pyodide module Worker, lazy load khi mở Python activity; `input()` báo chưa hỗ trợ.
3. PY-003: lifecycle `idle → loading → ready → running → error/stopped`, Stop bằng terminate và tạo
   Worker mới; giới hạn output và timeout.
4. PY-004: formative output checks, không coi kết quả client là điểm tin cậy.
5. Unit/integration/E2E: print output, SyntaxError, infinite loop Stop, repeated run, reset và keyboard.

Decision gate trước PY-002: chốt runner origin/network policy. Worker không phải security sandbox; không
được gửi cookie, token hoặc API secret vào runtime. MVP vẫn không có cloud execution, shell hoặc package
install.

## Quy trình tiếp tục an toàn

```bash
git status --short
git pull --ff-only
git switch -c feat/slice-3-mini-python
```

Sau mỗi slice: cập nhật `docs/backlog.json`, chạy `pnpm quality`, `pnpm e2e`, Docker build, ghi known
gaps, commit trên branch riêng và chỉ merge/push `main` khi đã có yêu cầu rõ ràng.
