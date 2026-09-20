# Codex project instructions — Interactive Learning Platform

Read `README.md`, `docs/01-product-scope.md`, `docs/02-architecture.md`, `docs/03-delivery-plan.md`, `docs/12-implementation-blueprint.md`, and `docs/rules/ENGINEERING.md` before coding. For UI, also read `docs/design/UI_UX.md` and `docs/design/tokens.json`. For each specialized task use matching `.agents/skills/*/SKILL.md`.

## Non-negotiable product constraints
1. Two user apps: Admin Studio, Learning Workspace. Shared packages, minimal API; never create an app per course.
2. MVP browser code execution ONLY: Python Console in a disposable Pyodide module Web Worker with an isolated runner origin / equivalent tested network restrictions; HTML/CSS/JS in a sandboxed preview. Do NOT create cloud execution, arbitrary shell, package install, Tkinter/Next.js servers, PHP or student Docker runtime unless product owner explicitly changes scope.
3. Tkinter, Pygame, React/Next.js are LOCAL practice: download versioned starter ZIP, instruction, offline test instructions and upload project. Never pretend web editor can execute them.
4. Lesson data is versioned and source-backed. Draft != immutable published release. MP4 cannot contain executable interactions.
5. UI light-only, clean flat design, Vietnamese-first, responsive, accessible. Never build dark mode, heavy gradients, 3D/glassmorphism or decorative UI. Use defined design tokens.
6. Never put real student data, teacher-only answers, API keys, model weights, or private video in public Git. Do not mutate `quanpl86/hocweb2026` without explicit request.
7. Treat student-authored Markdown/HTML/JS and uploaded ZIP as untrusted; isolate execution, sanitize rich text, verify authorization server-side, bound file size/path, and avoid unsandboxed eval.

## Delivery method
- Inspect existing repo and git status; do not overwrite user changes. Branch per slice; small focused commits; avoid unrelated refactors.
- Work in vertical slices specified in `docs/03-delivery-plan.md` and `docs/backlog.json`. Complete prerequisites and acceptance criteria; no fake UI handlers, mocked success or fabricated test results.
- First write a short implementation plan and list touched files. Implement actual behavior, add tests, run lint/typecheck/unit/e2e where available, document any unrun test honestly.
- Use package managers with lockfile; verify upstream versions and licences before new dependencies. Prefer reusable library integrations rather than cloning monorepos into `src/`.
- Keep host development compatible with Windows and macOS. Preserve the verified Docker workflow in `docs/13-development-environment.md`; Docker is project tooling, never a student-code runtime.
- No deployment, publishing, changing production DB, push to main or deleting existing resources without explicit permission; generate release instructions if credentials missing.
- Keep documentation in Vietnamese; code identifiers in English; user-facing errors actionable and accessible.
- After each slice report: implemented, tests run/results, unresolved risks, next slice. Update `docs/backlog.json` statuses only when evidenced.

## Project entry points
- `docs/prompts/00-kickoff.md`: initial Codex task.
- `docs/04-contracts.md`, `schemas/`, `examples/`: versioned contracts.
- `docs/06-acceptance-qa.md`: acceptance/security test matrix.
- `docs/08-publishing.md`: interactive Web vs standalone MP4 policies.
- `docs/13-development-environment.md`: Windows/macOS, pnpm filesystem and Docker contract.
- `ui-prototype/index.html`: UI reference only, not production code.

`docs/rules/PRODUCT.md`, `ENGINEERING.md`, `SECURITY.md`, `DESIGN.md` are normative project rules referenced here; they are not Codex command authorization rules.
