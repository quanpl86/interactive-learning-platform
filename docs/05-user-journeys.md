# Detailed user journeys / screen contract

## Author
1. Dashboard: counts by draft/review/published and failed media jobs; not fake counts.
2. Course manager: course → module → lesson CRUD, reorder, hide. Unsaved changes warning.
3. Create dialog: lesson, interactive video, flat video, worksheet, slides, assessment, local project; available authoring modules determined by type.
4. Lesson editor: split outline left, block editor center, inspector right. Link objectives, content, media, activities, checklist.
5. Video editor: script per scene, voice segments, asset picker, scene templates, timeline, real rendered-preview status. Do not promise full NLE.
6. Activity builder: quiz target, pause policy, quick coding runtime, starter files, formative checks, local ZIP and setup guide.
7. Preview as student: all links/video/subtitle/checkpoints verified; no mutation of real student progress.
8. Review/publish: validator report, approver distinct role, release immutability; two outputs Interactive Web or MP4; adapters for DOCX/PPTX/etc later.

## Student
1. Catalog: continue learning, filter by course/module.
2. Lesson: breadcrumb, title, outcome, progress; reading/video/activity accessible by keyboard.
3. Video: transcript/VTT, chapter, speed, captions, seek stable, checkpoint opens accessible panel.
4. Mini Python: fixed `.py` tab(s), lazy runtime, Run/Stop/Reset, output/errors/test. No simulated stdout in final implementation.
5. Mini Web: fixed tabs HTML/CSS/JS, Run opens sandbox iframe, separate console, Reset.
6. Checklist: statuses self / automatic / teacher; no self-check spoof of test result.
7. Local project: download ZIP; follow setup; submit allowed ZIP, see upload state; no false desktop telemetry.
8. Resume: after refresh, resume video and saved draft, indicate save pending if offline/network fails.

## Empty/error/loading flows
- Empty course: clear CTA for authorized author; no dummy lessons.
- Missing media: error + fallback transcript; log issue; no fabricated placeholder success.
- Python loading error: retry + guidance; never mark exercise complete.
- Browser unsupported: read-only lesson + local practice fallback.
- Unsaved changes: warn on navigation, retry queue only when safe.
- Teacher-only resource: not visible in public payload, not simply CSS-hidden.
