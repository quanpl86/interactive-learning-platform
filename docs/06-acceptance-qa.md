# Acceptance, test matrix and quality gates

## Automation expected
- Unit: schema parser/migration, timeline crossing, project revision conflict, quiz state, completion policy, export preflight.
- Component: keyboard/ARIA focus, tab state, error and loading, responsive layout at 360/768/1280 px.
- Integration: browser worker Run/Stop, iframe isolation/bridge, auth/RBAC, upload constraints, save/resume.
- E2E: admin drafts→previews→publishes release; student reads→video checkpoint→quiz→run code→checklist→resume; media dual output when worker ready.

## Mandatory scenarios
- Python `print('Hello')` shows exact output; SyntaxError visible; runaway `while True` stopped by terminate+new worker; nonresponsive UI does not freeze.
- Input() when not yet supported gives explicit feature message; after implementation, stdin is interactive with own E2E.
- HTML preview renders HTML, CSS, JS button; parent DOM/tokens inaccessible; user-provided JS `postMessage` ignored unless protocol matches and source is trusted.
- Timeline event at 90s fires during ordinary playback and after seek crossing according to policy; reload maintains completion, no duplicate grade.
- Reset asks confirmation if modified; reset cannot delete release or other activity drafts.
- Backend save outage never displays `Saved`; concurrent device conflict returns a conflict UI.
- Quiz untrusted input cannot inject HTML; teacher-only answer isn't in student payload.
- Local project upload rejects traversals, excessive size, executable abuse; scan/quarantine as policy.
- Student A cannot read student B draft/submission, admin writes denied to student.
- Published release does not change when author edits draft.
- MP4 export is playable with audio/subtitles strategy; content requiring interaction adapted, no phantom click promises.

## Accessibility acceptance
All functionality with keyboard, visible focus, semantic headings/forms, form labels, escape modal, non-color-only statuses, captions/transcript, reduced-motion support, WCAG 2.2 AA as target. Test automated + manual keyboard + screen reader spot check.

## Security acceptance
Threat model, separate preview origin in production, CSP, iframe permission minimal, no script eval in parent, no private secret client, authorization server-side, signed limited uploads, database migration backup.

## Performance targets (benchmarks, not claims)
App shell FCP/LCP measured on classroom device/network; lazy Pyodide; no video preloading across catalog; first Run tested on low-end machines; CDN and cache for immutable media. Do not invent throughput or user counts; write load scenarios and record actual measurements.

## Evidence template
```
Issue/PR:
Changed files:
Tests executed + exact result:
Manual QA + viewport:
Security/accessibility checks:
Known gaps:
Screenshots or logs:
```
