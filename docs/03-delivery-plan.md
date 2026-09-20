# Delivery plan — vertical slices and acceptance gates

**Use dependency-based phases, not invented timeline promises.** Implement one end-to-end slice before parallelizing. Each slice requires source changes, tests, accessible UI, docs update and evidence.

| Slice | Depends | Scope | Acceptance gate |
|---|---|---|---|
| 0. Foundation | — | pnpm monorepo, 2 Vite React apps, shared tokens/UI, CI, Docker dev/production workflow, routes, fixture repository | Both apps boot natively and in containers, responsive light layout, typecheck/lint/test green. No fake success actions. |
| 1. Content Model | 0 | JSON Schema, parser, blocks, draft versioning, fixture, asset paths | Valid sample passes, invalid data rejected, old v1 fixture migration produces deterministic result. |
| 2. Learning vertical | 1 | catalog/detail, Markdown rendered safely, video media time, chapter, quiz, checklist | Sample lesson flows reading→video→quiz→checklist; seek/refresh tested; WCAG keyboard. |
| 3. Mini Python | 2 | Monaco + pinned Pyodide module worker, stdout/stderr, run/stop/reset, simple tests | Hello print, syntax error, infinite loop stop, reset, no main thread freeze. Input() follow-on if time. |
| 4. Mini Web | 2 | HTML/CSS/JS fixed tabs, isolated preview, console, DOM/CSS checks | HTML displays, CSS changes, JS click works; iframe cannot access parent data; URLs blocked by CSP. |
| 5. Practice/persistence | 3,4 | save draft, offline pending UX, formative tests, local ZIP links/upload, progress | Refresh resumes files; failed save not shown as saved; tests not grade authority; upload access controls. |
| 6. Admin authoring | 1–5 | CRUD, activity config, preview student view, review/publish, asset manager | Author creates a new lesson with no code edits; invalid release rejected; old release unchanged. |
| 7. Media hybrid | 6 | media job contract, VieNeu/MC/FFmpeg local worker, audio segments, VTT, timeline editor | Job survives worker offline; audio duration checked; video render preview; no localhost exposed. |
| 8. Dual publishing | 7 | hosted/iframe interactive and standalone MP4, manifest, preflight and adaptations | One approved source → both validated outputs; MP4 no false interactivity claim. |
| 9. Production hardening | 1–8 | RBAC, upload/file security, load/accessibility, backup, monitoring, licensing | documented rehearsal/restore, real E2E and security tests, controlled deploy. |

## Prioritized build epics
- E00 design tokens / app shell / routes / CI.
- E01 lesson schema + migration + release validator.
- E02 player / event state machine / Quiz / checklist.
- E03 Python and Web mini editors.
- E04 project downloads and upload + progress.
- E05 admin authoring / review.
- E06 hybrid video production.
- E07 dual publish.
- E08 QA/reliability/security.

## Definition of Done per issue
1. Scope and dependencies confirmed against backlog; list acceptance test before coding.
2. Running code behind real handlers; mocks clearly labeled, no inert buttons or fake success.
3. Unit/integration/E2E for behavior and negative cases as applicable; test results recorded.
4. Typecheck, lint, tests pass or blocker documented, not silently skipped.
5. Security and accessibility checked for affected surface.
6. No secrets/PII/answer keys added to public builds.
7. Docs/contracts and `docs/backlog.json` updated to evidence-backed state.

## Milestone demos
- D0: 2 app shells and design system.
- D1: teacher publishes fixture lesson; student loads safe reading + video.
- D2: student runs browser Python/HTML, tests, checklist, save and resume.
- D3: teacher authors and renders a new video, releases Interactive Web and MP4.

## Explicit deferred decisions
React/Next runtime in browser vs external editor; SQLite WASM; SCORM/H5P; advanced editor; paid SaaS. Do not re-add without approved issue.
