---
name: mini-coding
description: Implement or debug quick Python Console or HTML/CSS/JS practice inside lesson; use for Monaco, Pyodide, iframe and formative tests, NOT cloud IDE.
---


# Mini Coding integration
Read engineering/security rules and acceptance. Fixed teacher-specified files only. Monaco models bound by stable URI, disposed on unmount; draft backend ack. Python: isolated runner origin without auth cookies, version-pinned Pyodide module Web Worker lazy-loaded, stdout/stderr, Run/Stop/Reset, worker terminate for hangs, output/time limits. `input()` must explicitly work with tests or show unsupported notice; do not fake. Web: production isolated origin, iframe sandbox allow-scripts ONLY and CSP; no secrets, no parent DOM, trusted message protocol with runId/source. Client-side tests = formative; never trusted grades. Include malicious code/loop/error tests.
