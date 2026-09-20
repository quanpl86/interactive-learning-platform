---
name: lesson-authoring
description: Implement versioned lesson/content blocks, import, author CRUD, review/publish and validation; use for lesson schema or authoring, NOT code runtime.
---


# Lesson authoring workflow
Read contracts, schema and source migration. Validate external JSON at boundary; preserve original source on import; authored lesson draft vs immutable release. Keep stable IDs for blocks/activities/timeline, verify all targets and media duration, never ship teacher-only answers. Author preview must not mutate student progress. Test invalid assets, duplicate IDs, source migration, version/rollback and role protections. Document UI + API changes.
