# Security and student privacy rules

1. Threat model: student-authored JS, Python, ZIP, Markdown, asset SVG, iframe; compromised author, guessed IDs, uploaded source leaking credentials, unsafe file paths, media worker executing scene code.
2. Browser Python Worker is performance isolation, NOT blanket security sandbox. Use a separate runner origin without platform cookies when feasible, or obtain explicit security review of equivalent controls; CSP/network/API limits must be verified; no trusted-grade claims for browser tests.
3. HTML preview: separate origin in production + iframe sandbox minimal. Do not combine allow-scripts and allow-same-origin with untrusted same-origin content. Adopt strict CSP at serving origin; no forms/popups/navigation/top-level access unless approved, connect-src none if lessons do not need network.
4. postMessage: validate event.source, expected origin (`null` for opaque-origin srcdoc requires stronger nonce/runId and still not a trust boundary), schema, action allowlist, size and context. Never accept grade from child message as authority.
5. Content renderer: parse Markdown with sanitized output; no unsanitized `innerHTML` or `dangerouslySetInnerHTML` from user data; disallow active SVG/script, sanitize URLs.
6. Server: verified Auth, RBAC, row/project ownership and classroom enrollment per endpoint, RLS defense-in-depth, service credentials never in client, audit author/publisher operations.
7. Upload: quotas, path normalization (reject `..`, absolute, Unicode quirks and symlinks), ZIP bomb prevention, MIME+signature, extension allowlist, antivirus where needed, private storage by default; no secret source in public repo.
8. Local practice: guide students not to commit `.env`, API tokens, `node_modules`, `.venv`, personal data or private DB. Teacher submissions remain private.
9. Media worker: outbound-initiated job polling, short-lived signed asset URLs, no public localhost, known scene templates only; untrusted TS scene requires separate sandbox/review.
10. Privacy: minimal child data, appropriate guardian/school consents, deletion/retention policy, privacy notice, no granular keystroke surveillance; educational analytics only as necessary.
11. No uncontrolled `git push`, deployment, public publishing, DB destructive migration or production credentials without explicit human approval.
