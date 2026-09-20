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

Any change: create ADR with context, options, trade-offs, decision, consequences, approver before implementation. No implicit feature creep.
