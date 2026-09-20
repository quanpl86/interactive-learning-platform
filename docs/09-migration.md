# Source migration — `quanpl86/hocweb2026`

## Verified existing context at planning time
Public repository `https://github.com/quanpl86/hocweb2026`, root `README.md` describes a chapter-2 student assignment **HTML+CSS, nonresponsive, no JavaScript/backend/database inside the student's deliverable**. This restriction belongs to that exercise, NOT the new platform UI or future course architecture.
Past repository inspection also observed prototype `player.html`, `studio.html`, `player/player.js`, `studio/studio.js`, `schemas/validator.js`, `lessons/web-flexbox-01/lesson.json` v1.0.0; inspect fresh checkout before relying on exact paths.

## Migration strategy
1. Create a **new** platform repo, don't replace source course in place without explicit approval.
2. Git clone source read-only or fetch via authorized connector; inventory live files, branch, license, privacy, referenced assets and schema version. Avoid assumptions based on historical snapshots.
3. Implement import adapter for v1 lesson JSON; preserve source revision and content, issue explicit errors/warnings for missing assets/unknown activity IDs.
4. Convert Markdown and quiz to canonical blocks while preserving raw copy for diff; map Flexbox fixture to v2 sample. Do not move teacher-only answers into public build.
5. Run old Netlify/GitHub Pages content unchanged; link into new Learning App via canonical lesson URL only once release validated.
6. Tests: compare chapter count/content, link integrity, quiz options, media, code starter, timeline. Missing MP4 is a known possible condition; do not invent video.

## Branch + publication safety
Do not push, move, delete or rewrite `hocweb2026` without explicit authorization. New app must not expose real student data in public repository.
