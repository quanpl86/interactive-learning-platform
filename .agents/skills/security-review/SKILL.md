---
name: security-review
description: Review risky iframe, HTML/Markdown, code worker, asset upload, auth and student data security; read-only review skill, NOT feature implementation.
---


# Security review
Read threat model. Examine preview origin+flags+CSP; student JS must not touch main origin, tokens or parent. Check postMessage source/runId/schema and no self-reported grade trust. Check Markdown sanitization, ZIP slips/bombs, filename normalization, API auth/RBAC, secret key handling, child privacy, media jobs. Write prioritized findings with file+line+repro; stop release on severe issue; do not silently weaken controls. No code edits unless separately authorized.
