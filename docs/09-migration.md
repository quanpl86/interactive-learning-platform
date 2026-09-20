# Source migration — `quanpl86/hocweb2026`

## Verified existing context at planning time
Public repository `https://github.com/quanpl86/hocweb2026`, root `README.md` describes a chapter-2 student assignment **HTML+CSS, nonresponsive, no JavaScript/backend/database inside the student's deliverable**. This restriction belongs to that exercise, NOT the new platform UI or future course architecture.
Kiểm tra lại trong Slice 1 xác nhận `main@230380834630f571775a07424cfbb362b9a72108` có `lessons/web-flexbox-01/lesson.json` schemaVersion 1.0.0 và các config/content được lesson tham chiếu.

## Migration strategy
1. Create a **new** platform repo, don't replace source course in place without explicit approval.
2. Git clone source read-only or fetch via authorized connector; inventory live files, branch, license, privacy, referenced assets and schema version. Avoid assumptions based on historical snapshots.
3. Implement import adapter for v1 lesson JSON; preserve source revision and content, issue explicit errors/warnings for missing assets/unknown activity IDs.
4. Convert Markdown and quiz to canonical blocks while preserving raw copy for diff; map Flexbox fixture to v2 sample. Do not move teacher-only answers into public build.
5. Run old Netlify/GitHub Pages content unchanged; link into new Learning App via canonical lesson URL only once release validated.
6. Tests: compare chapter count/content, link integrity, quiz options, media, code starter, timeline. Missing MP4 is a known possible condition; do not invent video.

## Adapter đã triển khai
- `migrateLessonV1ToV2()` nhận nguồn ngoài dưới dạng `unknown`, kiểm tra boundary rồi mới ánh xạ.
- ID lesson/activity/resource, media reference, quiz option và starter content được giữ nguyên khi contract v2 hỗ trợ.
- Simulation và chapter hiện chưa có kiểu v2 tương ứng: giữ trong `sourceArchive`, phát warning và bỏ timeline target không thể chạy.
- Locale v1 không tồn tại nên adapter dùng `vi-VN` kèm warning; objective bắt buộc được tạo từ chính description nguồn.
- Resolver thiếu content/config trả warning; không tạo nội dung hoặc media giả.

## Branch + publication safety
Do not push, move, delete or rewrite `hocweb2026` without explicit authorization. New app must not expose real student data in public repository.
