# Data contracts and event semantics

## Schema policy
`schemas/lesson.schema.json` là contract v2 chính thức ở Slice 1, với runtime package `@ilp/lesson-schema` và hai fixture trong `examples/`. JSON Schema kiểm tra shape; semantic validator kiểm tra ID, target, timeline, đường dẫn, URL và asset manifest khi được cung cấp.

`migrateLessonV1ToV2()` nhập schemaVersion 1.0.0 qua resolver chỉ đọc, trả warning có cấu trúc và giữ payload gốc trong `sourceArchive`. Activity chưa hỗ trợ không được phát minh thành loại khác. Student projection phải đi qua `toStudentLesson()` để loại `correctOptionId`; payload author/release không được gửi thẳng tới học sinh.

## Entities
- Course: id, title, locale, modules, access.
- ContentProject: id, type (lesson/video/document/slide/etc), draftRevision, blocks/assets.
- LessonRelease: immutable ID and source revision, content blocks, media, activities, timeline, checklist, template references, checksums, publishedAt.
- Activity: discriminated type quiz/quick-code/local-project/resource. Each has stable ID, visibility and completion policy.
- StudentProgress: subjectId, releaseId, activityId, status, verified evidence reference; one record per idempotent update.
- StudentDraft: subjectId, releaseId, activityId, file map and revision; save uses optimistic concurrency (revision/etag), never silent overwrites.
- Submission: immutable artifact IDs and timestamps, teacher feedback separate.
- VideoProject: source scenes and narration segments; release ties to actual MP4 duration and event mapping.

## Timeline semantics
- Seek crossing and playback crossing use `[previousTime, nextTime]` with clear forward-only trigger, not floating-point `~1.5s` window.
- Event once-per-release unless teacher config explicitly repeatable.
- `pauseVideo=true` pauses source video, activity runs independently, resume is gated only when configured. Repeated seeks never corrupt progress.
- `resource` targets resources, never activity IDs. Validate every target reference, uniqueness, monotonic chapter times, `0<=at<=duration`.
- Time anchors can be `{sceneId,offsetMs}` in authoring; publication resolves seconds pinned to media revision.

## Formative testing
Tests on browser reveal enough to be inspectable and user-controllable; do not call browser tests secure grading. Distinguish `runPassed` / `practiceCompleted` / `teacherApproved`. Keep teacher-only answer/test secrets server-side when formal grading exists; do not suggest client code is uncheatable.

## Local template
`local-project` includes `templateAssetId`, filename, checksum, setup guide, runtime version, expected outputs, submission accepted types/limit and no runtimeServer. Never include student credentials or `node_modules`/`.venv` in template.

## Exporters
`PublicationManifest`: id, releaseId, format, sourceRevision, output assets with checksums, serviceRequirements, preflight report, status. `interactive-web` is HTML player+timeline+activities, `mp4` is flat video and must explicitly define interactions adaptation; DOCX/PPTX/etc are later.

## Contracts tests
Valid fixtures pass validator, invalid fixtures for duplicate ID/missing target/negative time/unsupported activity reject. Publish revalidation mandatory, not only on UI. API request/response data contracts documented once app is implemented.

## Slice 1 implementation
- `LessonDraft` dùng revision và optimistic concurrency; conflict là lỗi tường minh.
- `LessonRelease` pin `sourceRevision`, SHA-256 checksum và snapshot lesson đã publish.
- `FixtureLessonRepository` chỉ dùng trong development/test và tự nhận diện là `fixture-memory`; không tuyên bố persistence.
- Asset existence chỉ được khẳng định khi caller truyền asset manifest. Schema validation đơn thuần không đủ điều kiện publish.
