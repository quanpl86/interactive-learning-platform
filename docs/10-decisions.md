# Architecture decision records (ADRs)

- ADR-001 Accepted: new monorepo; existing public `hocweb2026` remains source/reference; migration via import.
- ADR-002 Accepted: two apps; shared UI/schema/player/mini editor; API minimal.
- ADR-003 Accepted: browser-only quick code in MVP (Pyodide Worker + HTML/CSS/JS iframe); local desktop for bigger projects.
- ADR-004 Accepted: light-only flat design responsive; no dark mode.
- ADR-005 Accepted: one editable content model, immutable release, separate publications; MP4 passive, interactive Web uses Player.
- ADR-006 Accepted: hybrid media production, independent from student playback.
- ADR-007 Accepted: formative browser checks, formal grades require trusted evidence/review.
- ADR-008 Conditional: Supabase/R2/Netlify are candidate services, not hard vendor lock nor already deployed.
- ADR-009 Deferred: SQLite WASM, WebContainers, Node sandbox, Tkinter/Pygame browser, LTI, SCORM, large CMS, full video editor, SaaS multi-tenancy.
- ADR-010 Accepted: MVP import can use existing MP4; local pipeline release gate later; no fabricated renders.
- ADR-011 Accepted: support Windows and macOS host development plus Docker Desktop. Use one multi-stage Dockerfile for both frontend images and Compose for dev; containers never become a student-code runtime. Preserve exFAT-compatible pnpm settings until the repository filesystem changes and is revalidated.
- ADR-012 Accepted: `schemas/lesson.schema.json` là nguồn contract v2; `@ilp/lesson-schema` dùng Ajv 2020-12 cho shape validation và semantic checks riêng cho cross-reference/security. Import v1 luôn giữ source archive và warning; release là snapshot SHA-256 bất biến. Student payload là projection loại teacher-only answer, không phải raw author/release document.
- ADR-013 Accepted: Learning Workspace dùng React-node Markdown subset, không nhận raw HTML và không dùng `dangerouslySetInnerHTML`; link chỉ cho HTTPS hoặc path tương đối an toàn. Video dùng native `media.currentTime`, caption track và chapter contract. Timeline dùng forward crossing `(previous,next]`; quiz client chỉ ghi nhận formative, không tiết lộ đáp án hoặc tuyên bố điểm chính thức.
- ADR-014 Accepted: Mini Python dùng Monaco `vs` với model URI ổn định và Pyodide `0.29.5` trong module Worker. Production bắt buộc `python-runner.html` chạy trên HTTPS origin riêng, không có platform cookie/token; parent/runner kiểm tra `source`, origin, nonce, runId và schema. Nếu chưa có runner origin hợp lệ thì execution tự tắt, không hạ sandbox. Local dev cùng origin chỉ được phép khi ứng dụng chưa có auth/secret. Deployment phải gửi CSP bằng HTTP header cho runner HTML và Worker assets; thẻ meta chỉ là lớp bổ sung.

Any change: create ADR with context, options, trade-offs, decision, consequences, approver before implementation. No implicit feature creep.
