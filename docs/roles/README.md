# Role model — product team vs Codex subagents

## Human product roles
- Product owner / Academic lead: approve scope, curriculum quality, release acceptance.
- Author: create content and drafts.
- Reviewer: approve editorial/pedagogical quality.
- Publisher: publishes releases and manages rollback.
- Student: learner and project owner.
- Operations/Security: approves production infrastructure changes and reviews sandbox/privacy.

## Codex roles
`.codex/agents/*.toml` provides scoped project-specific subagent definitions. They do not grant actual human role permissions and MUST NOT bypass AGENTS.md or approval gates. Use implementation agent on one slice, reviewer agent read-only, test agent independent. Keep tasks narrow; subagent support/config can vary by Codex version.

## Handoff sequence
Architect designs slice and contracts → UI/frontend/API/learning agent implements independent areas after contracts approved → QA reviews tests → security review for code execution or uploads → product owner accepts. Do not claim review happened unless actually performed.
