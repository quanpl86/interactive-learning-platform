# PRD — phạm vi chính thức MVP 1.0

## Product outcome
Một hệ thống cho tác giả sản xuất bài học có nội dung đọc, video tương tác, quiz, checklist và quick practice; học sinh học, chạy snippets trên browser, lưu tiến độ, tải template dự án lớn để làm trên máy cá nhân rồi nộp file.

## Personas / quyền
- Author: biên soạn Course/Module/Lesson/Content/Video/Quiz/Template.
- Reviewer: xem thử, ghi nhận issues, approve một revision; không mặc định publish.
- Publisher/Admin: quản lý releases, users, quyền, assets và thu hồi một release.
- Student: chỉ nội dung được cấp quyền, lưu draft, thử, nộp, xem feedback.

## Core flows
A. Author → tạo course/lesson → viết Markdown + asset → gắn video/quiz/quick-code/checklist → preview với giả lập vai trò học sinh → review → publish release → URL.
B. Student → mở lesson → đọc → xem video → checkpoint quiz → editor chạy code → nhận phản hồi formative → checklist ghi bằng chứng → tiếp tục → hoàn thành.
C. Local project → tải ZIP được version → kiểm tra môi trường local theo hướng dẫn → làm trên VS Code/Python/Node → zip nguồn không gồm node_modules/venv/secrets → nộp → giáo viên review.
D. Video → kịch bản + scene + narration → TTS local + Motion Canvas worker → MP4 + VTT → timeline → publish interactive Web hoặc standalone MP4. MVP có thể import MP4 trước khi worker hoàn thiện.

## MVP IN
1. 2 app, auth + RBAC khi bật backend, lesson catalog, CRUD/draft/release.
2. Content block: Markdown text/image/code/example/resource; chapter + objective.
3. Hosted interactive lesson: video with VTT, currentTime, seek semantics, timeline quiz and practice; progress persistence, resume.
4. Quiz single choice; checklist self-confirm vs system-confirm vs teacher review separately.
5. Mini Coding: tabs fixed by teacher, Python `.py` console (Pyodide Worker) and HTML/CSS/JS (`index.html`,`style.css`,`script.js`), Run/Stop/Reset, diagnostics, simple formative checks, draft save.
6. Browser static Bootstrap template if local vetted asset available; don't silently depend on an external CDN for offline preview.
7. Local project starter ZIP and upload for Tkinter+SQLite, Pygame, React/Vite, Next.js. No direct execution in platform for those.
8. Export interactive hosted + embed URL, MP4 standalone; editable video project config and release manifest. DOCX/XLSX/PPTX/PDF later but exporter interface designed now.
9. Admin flat light responsive UI, preview/review, asset library minimum, job state when media worker exists.

## OUT (do not implement implicitly)
Cloud IDE, arbitrary terminal, remote execution of student code, Tkinter GUI stream, Pygame browser packaging, Next.js server sandbox, PHP/MySQL, Scratch/Godot/IoT, live collaboration, payments, automatic AI grading, LMS/SCORM certification, arbitrary video timeline like Premiere, multi-tenant SaaS billing.

## Nonfunctional outcomes
- One source of truth: drafts mutable, releases immutable, full version references.
- Accessibility: keyboard, focus, semantic controls, captions, no color-only status, high contrast.
- Performance: target quick editor interactive without loading Pyodide until first Python use; avoid giant media payload in app shell.
- Privacy: minimal student data; avoid publishing identifiable artifacts; secure defaults.
- Offline: browser quick practice maybe cached separately in a later phase; do NOT label MVP fully offline.

## Happy-path example
`PY-GUESS-01`: read objective, video 0:00–1:30, quiz at 90s, Python `print`/`input` quick practice at 180s, run/test, checklist, completion. Web fixture: Flexbox responsive card with three files. When code tests run browser-side, result is formative, not proctored.
