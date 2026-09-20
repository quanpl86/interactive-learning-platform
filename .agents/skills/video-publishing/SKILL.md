---
name: video-publishing
description: Develop local VieNeu/Motion Canvas media job, interactive timeline and MP4/web dual publishing; use on video/media tasks, NOT a full freeform NLE.
---


# Video workflow
Read publishing plan. VideoProject stores script/scene/narration segments and source revision. Worker outbound-claims idempotent jobs, pinned version, scoped asset upload, ffprobe duration verification; no public local ports. Map narration duration and scene anchors to timeline, allow manual subtitle correction. Interactive Web = MP4+VTT+events+activities; MP4 = passive linear adapted content, never embedded quiz runtime. Preflight targets/missing media/time/captions/rights. Keep previous release immutable. If local TTS not installed, report blocked; do not pretend render succeeded.
