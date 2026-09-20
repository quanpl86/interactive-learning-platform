# Publishing and content export contract

## MVP outputs
A. Hosted interactive Web (or approved embed): MP4+VTT+timeline JSON+activities+quick editor/checklist. Progress requires authenticated platform services. Embed origin allowlist, auth strategy and LMS integration are separate decisions.
B. Standalone MP4: no clickable quiz/editor/tracking. Export mode `original` or `standalone-adapted` with authored explanation/screen/demo; `question-solution` optional after templates exist. Include subtitle burn-in or sidecar VTT/SRT options.
C. Local Practice ZIP: template, README/requirements, exercise and no secrets; user submits source zip.

## Later exporters
DOCX lesson plan/worksheet, PPTX teaching slides, XLSX curriculum/assessment, PDF printable, interactive package ZIP, LMS adapter. Add each via `ExportAdapter`; do NOT claim they already exist or preserve interactive features.

## Authoring vs publishing
Create `ContentProject` type lesson, interactive-video, flat-video, document, slides, assessment or practice. Shared blocks/asset references. A video project may publish Web Interactive and MP4 from same approved revision. Changing audio requires event timing review; old releases untouched.

## Preflight
Required: schema valid, file references exist, media probe duration, subtitle within duration, event target IDs unique/valid and times valid, no draft-only/teacher-only asset leak, author has rights, adaptation explicit for non-video interactions, immutable checksums. Publish failure must not leave partial public release.

## Media hybrid
Backend job with lease/heartbeat/retry/idempotency; local worker authenticates outbound to claim job, downloads scoped assets, renders, uploads output, backend verifies metadata. Students never depend on worker availability for existing published media. V1 can import existing MP4 as source fixture; never misrepresent it as automatically rendered.

## Release manifest
Release ID, source revision, format, asset IDs+checksums, generated timestamp, service requirements, preflight report, status. CDN cache keys immutable; clear rollback to prior release rather than overwriting media.
