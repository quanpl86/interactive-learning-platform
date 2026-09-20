# Architecture — MVP and extension boundaries

## Deployable units
- `apps/admin-studio`: React + TypeScript + Vite, browser UI.
- `apps/learning-workspace`: React + TypeScript + Vite; video, activity and Mini Coding.
- `services/api`: minimal Fastify/TypeScript OR documented equivalent; owns auth/RBAC, authoring, releases, progress, submissions. For Slice 0, mock repository behind same interfaces, NOT production API.
- `services/media-worker`: separate later hybrid worker, VieNeu local + Motion Canvas + FFmpeg; backend jobs/release assets.
- Browser workers: Pyodide Python, optionally test worker. Preview HTML/JS isolated iframe.
- Supabase Auth/PostgreSQL and object storage such as R2 can back services; provider choice behind interfaces, never hardwire business logic to Netlify-only functions.

## Monorepo target (to be scaffolded, not currently present)
```
apps/{admin-studio,learning-workspace}/
packages/{shared-ui,design-tokens,lesson-schema,lesson-player,content-editor,mini-coding,practice-sdk,export-sdk}/
services/{api,media-worker}/
examples/ tests/ docs/
```
Use pnpm workspaces, TypeScript strict, standard lint/format, unit + Playwright e2e. Avoid speculative microservices: API can be one deployable service initially.

## Development and container boundary
Host development supports Windows and macOS; Docker Compose provides the normalized Linux development path. Two frontend production images are built from one multi-stage Dockerfile and contain static output only. Docker is not used to execute student code. See `docs/13-development-environment.md`.

## Dependency direction
UI → public SDK/types → API/repository ports. `lesson-player` must not import Admin components; `mini-coding` must not depend on API or actual supplier credentials. Browser test results are untrusted telemetry and require review for formal grades.

## Content lifecycle
`ContentProject(DRAFT)` → validated `LessonRelease(immutable)` → `Publication` (hosted interactive / MP4). Release pins media hash, timeline, activities, template version, assets. Publishing validates files, captions, event times and target IDs. Media source remains editable, publication does not.

## Practice runtime
`PracticeActivity` config selects `python-console`, `web-static`, or `local-project`.
- Python: lazy-load pinned Pyodide in `type:module` Web Worker, redirect stdout/err, explicit stdin policy. For MVP without robust async stdin, mark input() unsupported in first slice and add separately with real tests; never fake input. Stop = terminate worker + reinstantiate. Limit output size and run time; user browser execution cannot guarantee untrusted-code isolation from network because workers have browser network privileges; establish runtime origin and CSP as appropriate.
- HTML/JS: preview separate origin in production; iframe sandbox `allow-scripts` and never same-origin combination `allow-same-origin` with untrusted scripts. CSP restrict network/form/navigation; no secret injected. `srcdoc` is fine for local UI-only prototype, NOT equivalent to hardened production origin. Diagnostic bridge uses scoped `postMessage` with unique run ID, validated source/origin/schema, no DOM access across sandbox.
- Static practice: no arbitrary npm, Node server or shell. React/Next.js project only downloadable.
- Save: drafts in backend (authenticated) + optional IndexedDB fast cache. `saved` UI only after confirmed durable backend acknowledgment; local storage is not a substitute for cross-device durability.

## Backend routes / security
`/courses`, `/lessons`, `/releases`, `/activities`, `/projects`, `/submissions`, `/progress`, `/media/jobs`, `/publications`. All protected writes verify session, ownership/class membership, CSRF strategy where applicable, size, type and role. Author-only answers NEVER shipped to public lesson JSON. API may use Supabase Auth and PostgreSQL RLS defense in depth; service-role key server-side only.

## Scaling
Video/static CDN; Pyodide/HTML run on student device; API stateless; queue local media rendering. Browser code execution is not charged to runtime server, but video bandwidth, storage, backend and endpoints still cost. Launch local media worker only for content production; student playback must not depend on it.

## Architecture decisions
See `docs/10-decisions.md` for approved and deferred choices. No claim that any service exists until verified in code/deployment.
