---
name: plan-slice
description: Plan one implementation slice from the roadmap and backlog; use before coding a new feature, NOT for release approval.
---


# Planning an engineering slice
1. Read AGENTS, scope, architecture, slice acceptance and affected contracts. Inspect code/git status first.
2. State user journey, smallest vertical slice, dependencies, files likely touched, assumptions and decision gates.
3. List acceptance tests including errors/security/accessibility and fallback; no estimates presented as guaranteed.
4. Plan code/test/docs in same PR; avoid unrequested redesign, full platform scaffolding in one PR, or cloud runtime.
5. Execute only assigned slice, then evidence-backed completion and backlog updates.
