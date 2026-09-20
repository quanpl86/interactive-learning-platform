# Routes, layout and wireframe details

## Routes (proposal)
Admin: `/dashboard`, `/courses`, `/courses/:courseId`, `/lessons/:lessonId/edit`, `/videos/:projectId`, `/lessons/:lessonId/preview`, `/publications`.
Learner: `/courses`, `/courses/:courseId`, `/learn/:releaseId`, `/learn/:releaseId/practice/:activityId`, `/projects`, `/submissions`.
Embed: `/embed/:releaseId` served on approved origin; auth and embed limits handled separately.

## Admin layout desktop
`[Sidebar 228px] [Header 64px / account] [Page title / actions] [main table/cards]`; authoring `outline 240 | canvas minmax(0,1fr) | inspector 300`, inspector collapses by tablet breakpoint. Keep primary action at top right and explicit save state near title.

## Learner layout desktop
`[Sidebar] [Lesson header] [Main reading/video 55%] [Practice 45% or below] [Checklist collapsed side / end]`. Main content `min-width:0`, overflow controlled; video 16:9; player never forced autoplay. Tablet/mobile one vertical sequence video→activity→editor→checklist.

## Mini editor layout
Tabbed fixed files, Run/Stop/Reset toolbar, output tab/preview tab, error panel; Python load state (idle/loading/ready/running/stopped/error), Web ready state with run revision. Reset prompts when dirty. Project download a separate local-practice CTA.

## Admin publishing UI
List publications by format/revision/status. New publication dialog selects Interactive Web or Standalone MP4. Future formats can be displayed as clearly disabled roadmapped items, never clickable empty buttons. Preflight report before Publish; output has URL/download and audit record only when complete.

## Design constraints
No gradients, shadows only for dialog, no dark editor; visible whitespace and 1px dividers; breakpoint at 1024 and 720, mobile 360 min. No placeholder Chinese/English text in shipped Vietnamese student flow.
