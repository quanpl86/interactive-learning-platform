# Implementation blueprint — giao việc trực tiếp cho Codex

## Mục tiêu xuyên suốt
Tạo **vertical slice thật** trước: tác giả cấu hình lesson fixture → học sinh đọc/video (nếu có file) → quiz → Quick Code → checklist → bản lưu → phát hành, không chỉ dựng các trang screenshot. Không tự động bắt đầu Slice kế tiếp trước khi có kết quả nghiệm thu.

## 0. Cấu trúc source phải tạo ở Slice 0

```text
apps/
  admin-studio/src/{app,pages,features,components}/
  learning-workspace/src/{app,pages,features,components}/
packages/
  design-tokens/
  shared-ui/
  lesson-schema/
  lesson-player/
  mini-coding/
  practice-sdk/
  export-sdk/
services/
  api/
  media-worker/             # scaffold sau, không chạy ngầm ở MVP
scripts/
tests/
```

Workspace `pnpm` và TypeScript strict. Tạo rõ ràng `dev:admin`, `dev:learner`, `typecheck`, `lint`, `test`, `build`, `e2e` khi có test harness tương ứng. `pnpm` qua Corepack/phiên bản pin; hướng dẫn Windows PowerShell và Mac/Linux khi có khác biệt. `.env.example` chỉ chứa tên biến; KHÔNG có key thật.

## 1. Interfaces trước UI/adapter

```ts
interface LessonRepository {
  getRelease(releaseId: string): Promise<LessonRelease>;
  saveDraft(input: SaveDraftInput): Promise<{revision: string}>;
  getProgress(releaseId: string): Promise<Progress>;
}
interface PracticeAdapter {
  id: 'python-console' | 'web-static';
  mount(target: HTMLElement): Promise<void>;
  loadFiles(files: Record<string,string>): Promise<void>;
  run(): Promise<RunOutcome>;
  stop(): Promise<void>;
  reset(): Promise<void>;
  dispose(): Promise<void>;
}
interface PublicationAdapter {
  format: 'interactive-web' | 'mp4';
  preflight(releaseId: string): Promise<PreflightReport>;
  publish(releaseId: string, options: unknown): Promise<Publication>;
}
```

Tên kiểu chỉ là phác thảo; dùng schema runtime và các kiểu có định danh/phiên bản thực tế. `mock` interface riêng và dán nhãn trong UI. Không dùng in-memory mock để khẳng định đã có persistence.

## 2. Slice 1 — model chi tiết
- JSON Schema 2020-12 trong `schemas/lesson.schema.json` và fixtures. Tạo typed TS model từ schema hoặc đồng bộ bằng test; không maintain 2 định nghĩa lệch nhau.
- Validator: shape + uniqueness + event targets + time range + media/file existence + teacher-only resource gate trước publish.
- Import v1 có adapter và warning log; so sánh mapping 1:1; original source giữ nguyên làm archive; rollback.
- `draftRevision` thay đổi theo save; `releaseId` bất biến; publication references releaseId and checksum.

## 3. Slice 2 — Player và checkpoint
- Vidstack (kiểm chứng package/version chính thức) hoặc native video ban đầu; subscribe `timeupdate`, `seeking/seeked`, `ended`; không dùng đồng hồ tự tăng.
- Event scheduling phải tính seek crossing; durable completion gắn `studentId+releaseId+eventId`; `pause` gate riêng với từng activity.
- Markdown sanitize; quiz single-choice formative; checklist self/system/teacher tách quyền; video không có file hiển thị lỗi và transcript nếu có.
- Testing: Playwright fake media clock có kiểm soát, seek forward/back, refresh and completed event.

## 4. Slice 3 — Python quick code
- Monaco light `vs`, fixed file tabs (MVP tối đa vài file), lazy pinned Pyodide in module Worker; avoid loading until Python activity opened.
- Put actual untrusted runner in a **separate origin with no platform cookies** where feasible; worker alone does not provide security isolation. Runner iframe can host the Worker and communicate via authenticated-scoped, nonce/runId-based channel with strict allowlist; alternate runner design requires security sign-off and proof that student code cannot reach authenticated APIs.
- Worker lifecycle `idle→loading→ready→running→error/stopped`; Stop terminates & rebuilds Worker; cap output/time/memory where feasible and explain browser limits.
- `input()` is a separate vertical slice with real stdin UX; until then show explicit unsupported state. Verify version-pinned Pyodide API before coding.
- Tests: print result, exceptions, unresponsive loop stop, repeated run, reset, no cross-activity file leakage.

## 5. Slice 4 — Web quick code
- Monaco fixed three files; bundling only HTML+CSS+JS static, no npm/Node/php.
- Render in iframe on **dedicated preview origin** for production; sandbox minimal with scripts only, strong CSP and no platform secrets. `srcdoc` in UI prototype is NOT accepted for production security gate by itself.
- Console forwarding: trusted wrapper collects log and emits known protocol; `source/origin/runId` validation, bounded messages; no direct `contentDocument` for opaque-origin frame.
- Tests: CSS, JS event, console, navigation attempts, fetch to privileged API rejected, malicious HTML cannot access parent.

## 6. Slice 5 — persistence and local project
- Save draft on edit debounce with version/ETag; mark Saved only after server reply; offline pending and retry visible; concurrent edit conflict UI.
- Upload local practice ZIP must enforce authentication, MIME+size, path traversal/symlink/zip bomb checks; teacher review and ownership.
- Version templates for Python/Tkinter, Pygame, React and Next.js with supported local commands; do not bundle `node_modules`/`.venv`.

## 7. Slice 6 — authoring
- Author CRUD and screen from UI prototype; content blocks, quiz, objective/checklist, practice config, media asset picker, student preview.
- Reviewer role approves draft; Publisher role creates immutable release; preflight stops invalid asset, target, duration and private data leak. UI buttons have real API or disabled reason.

## 8. Slices 7–8 — media + two outputs
- Import existing MP4/VTT first, verify media and activate real player. Hybrid worker contract: outbound polling/claim lease, checksums, progress, failure/retry, upload, validation. Then VieNeu, scene templates, Motion Canvas, FFmpeg.
- Publish interactive Web: HTML Player + MP4/VTT + lesson timeline + activities + service requirements.
- Publish MP4: flatten interactions with chosen adaptation/scene; verify file with ffprobe and preview. Do not label iframe or JSON in MP4 as playable interaction.

## Implementation PR checklist
- Slice ID and desired behavior.
- Files and surfaces affected.
- Tests and actual command output, include negative cases.
- Responsive screenshots at 360/768/1280 if UI touched.
- Security/privacy/accessibility impact.
- What is still mock and what is production.
- Backlog status change only with evidence.
