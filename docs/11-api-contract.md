# Minimal API contract — implementation proposal

All private routes authenticated; role/ownership checked server-side; consistent error envelope `{code, message, details?, requestId}`; cursored pagination for lists and idempotency for submissions/publish.

| Action | Proposed route | Owner |
|---|---|---|
| List courses | GET `/api/v1/courses` | authorized student/author |
| Create/update draft | POST `/api/v1/lessons`, PATCH `/api/v1/lessons/:id/draft` | author |
| Validate/review | POST `/api/v1/lessons/:id/validate`, POST `/api/v1/lessons/:id/review` | author/reviewer |
| Publish release | POST `/api/v1/lessons/:id/releases` | publisher |
| Fetch release | GET `/api/v1/releases/:id` | authorized student |
| Save code draft | PUT `/api/v1/activities/:id/drafts` with `{revision,files}` | owner student |
| Fetch progress | GET `/api/v1/releases/:id/progress` | owner student |
| Update progress | PUT `/api/v1/progress/:activityId` | server-validated capability |
| Submit ZIP | POST `/api/v1/activities/:id/submissions` | owner student |
| Media job | POST `/api/v1/media/jobs` | author |
| Publication | POST `/api/v1/releases/:id/publications` | publisher |

Avoid returning teacher-only answer or secret tests in student endpoints. Require `If-Match`/revision concurrency for draft saves; 409 conflict leads to recover/merge UI. Asset uploads via signed short-lived URL and finalize endpoint, with content validation.

MVP local fixture repository must implement same interface and explicitly say `DEMO - not synchronized`; never present in-memory/browser storage as true backend persistence.
