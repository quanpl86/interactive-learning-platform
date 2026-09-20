# Design specification — Light-only, flat, clean, responsive

## Visual principles
1. White cards on neutral `#F7F9FC` page; solid flat surfaces, no gradients/glass/neumorphism. Border `#DFE5EC` 1px; no card shadow. Floating modal may have subtle shadow.
2. Main text `#0F172A`, secondary `#475569`, primary emerald `#047857`, blue for secondary actions. Error and warning use text+icon+message, never color alone.
3. One font stack `Inter, Segoe UI, Arial, sans-serif` with system fallback; do NOT bundle or redistribute proprietary font files.
4. Spacing 4/8/12/16/20/24/32/40/48; radius 6/10/14; no oversized pills on forms, dense but breathable.
5. Code area LIGHT (`Monaco theme: vs`, white/light code background). Only light theme, ignore `prefers-color-scheme: dark`, no theme toggle.
6. Motion ≤150ms and none with reduced-motion; avoid animated background/hero.

## Responsive contract (must ship, unlike old HTML/CSS-only exercise)
- Desktop ≥1025: 228px sidebar, 64px header, main max-width 1440, 2/3 column as appropriate. Admin editor optional right inspector 300px.
- Tablet 721–1024: sidebar collapses into compact top navigation, main split views can stack; inspector toggles.
- Mobile 360–720: one column; sidebar accessible via nav, video above practice, sticky action bar only if not hiding content, touch controls ≥44px, horizontal code scroll confined to editor. No viewport-wide overflow.
- Test 360, 390, 768, 1024, 1280, 1440 CSS pixels at 100% zoom, 200% text zoom and keyboard only.

## Navigation information architecture
Admin: Dashboard / Khoá học / Bài học / Tạo nội dung / Video Studio / Kho assets / Xuất bản / Báo cáo / Cấu hình.
Learner: Khóa học / Bài đang học / Bài học / Dự án của tôi / Bài nộp. Within lesson: Nội dung | Video | Thực hành | Checklist. A breadcrumb always permits return.

## Detailed screens
A. Admin dashboard: page heading + subtitle, 3–4 fact tiles with actual data, course list table (title, status, updated, actions), media job warning row; empty states and retry; no fake numbers.
B. Course manager: left outline course/module/lesson; main title/objectives; actions New, Copy, Archive; confirmation for destructive changes.
C. Lesson authoring: course breadcrumb, metadata, content blocks Markdown/image/code, collapsible right inspector for assessment and permissions; save state `Đang lưu/Đã lưu/Lỗi lưu` backed by API ack.
D. Video Studio: script scenes left, preview center, narration/audio and timeline right/bottom; job state, no illusory render button. Show preflight and explicit MP4 vs interactive output.
E. Publishing: formats cards (interactive web / standalone MP4; later DOCX etc), incompatibility warnings, preview and immutable revision.
F. Learner catalog: continue card, course cards, lesson list; card accessible without hidden-only icon.
G. Learner lesson: title + objective, reading, video (captions/transcript), checkpoint dialog, mini editor and checklist. Desktop split, mobile stacked.
H. Mini Coding: fixed teacher-specified filename tabs; toolbar Run/Stop/Reset/Check; Python console or Web preview, errors with copy; no arbitrary file tree in MVP.
I. Local practice: versioned starter ZIP, setup instructions, checklist, permitted upload, status and teacher feedback.

## Component inventory
AppShell, Sidebar, Header, Breadcrumb, PageHeader, CourseCard, LessonRow, StatusBadge, Tabs, Dialog, FormField, MediaPlayer, ActivityPanel, CodeTabs, RunToolbar, ConsoleOutput, PreviewFrame, ProgressChecklist, UploadDropzone, Toast/LiveRegion, EmptyState, ErrorState, Skeleton, PublicationCard.

## Interaction states
Default, hover, focus-visible (2px blue outline offset2), active, disabled (reason visible), loading (aria-busy), error, saved/pending/conflict. Modal traps focus, Escape close, restore focus. Tabs arrow-key navigation. Forms have labels/help/errors. Progress statuses semantic. Use Vietnamese UX copy short, action verbs: `Tạo bài`, `Lưu bản nháp`, `Xem thử`, `Chạy mã`, `Kiểm tra`, `Xuất bản`.

## Accessibility and content
WCAG 2.2 AA goal; captions and transcript; video controls keyboard; text alt; color contrast ≥4.5:1 normal text; code editor keyboard shortcuts documented with alternate UI; avoid audio autoplay. Provide skip link. Do not display `100% mastered` based solely on video plays.

## Prototype reference
`ui-prototype/index.html`, `ui-prototype/styles.css`, `ui-prototype/app.js`. This is an interactive design mock, NOT a React app or secure code playground. Build the real UI with semantic React components and tests, not by copying inline mock business state as production.
