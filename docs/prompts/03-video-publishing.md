# Codex task template — Media + dual publication

Read `AGENTS.md`, `.agents/skills/video-publishing/SKILL.md`, `docs/08-publishing.md`. Implement minimal video import first (MP4+VTT), validated timeline and one real quiz checkpoint, then separate Media Job contract. If local TTS or render dependencies are unavailable, leave an adapter with explicit unavailable state; never mock a completed video. Dual publish must differentiate HTML interactive vs MP4 passive and record source revision + media hash; tests verify that MP4 does not claim playable interactions.
