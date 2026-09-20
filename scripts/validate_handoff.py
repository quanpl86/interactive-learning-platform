#!/usr/bin/env python3
"""Validate Codex handoff structure, contract examples, and backlog graph.

No network or user credentials. jsonschema is optional; if absent, reports skipped full schema check.
Install for full check: python -m pip install 'jsonschema>=4.20,<5'.
"""
from __future__ import annotations
import json
import re
import sys
import tomllib
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checks: list[str] = []


def must(path: str) -> Path:
    p = ROOT / path
    if not p.is_file():
        errors.append(f"Missing: {path}")
    return p


def read_json(path: str) -> dict:
    p = must(path)
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        errors.append(f"Invalid JSON {path}: {exc}")
        return {}

for name in ["README.md", "AGENTS.md", "docs/01-product-scope.md", "docs/02-architecture.md",
             "docs/03-delivery-plan.md", "docs/design/UI_UX.md", "docs/design/tokens.json",
             "docs/prompts/00-kickoff.md", "docs/07-security-privacy.md", "docs/08-publishing.md",
             "ui-prototype/index.html", "ui-prototype/styles.css", "ui-prototype/app.js"]:
    must(name)
checks.append("Required entrypoint files")

schema = read_json("schemas/lesson.schema.json")
fixtures = [read_json("examples/lesson.sample.json"), read_json("examples/lesson.web.sample.json")]
backlog = read_json("docs/backlog.json")
read_json("docs/design/tokens.json")
checks.append("All JSON files readable")

try:
    from jsonschema import Draft202012Validator
except ImportError:
    print("WARN: jsonschema not installed; full JSON Schema checks skipped. Run: python -m pip install 'jsonschema>=4.20,<5'")
    for fixture in fixtures:
        if fixture.get("schemaVersion") != "2.0.0" or not fixture.get("contentBlocks"):
            errors.append("Fixture failed minimal schema check")
else:
    try:
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        for fixture in fixtures:
            for issue in validator.iter_errors(fixture):
                errors.append(f"Schema fixture {fixture.get('id')}: {issue.message}")
        invalid = json.loads(json.dumps(fixtures[0]))
        invalid["schemaVersion"] = "invalid"
        if validator.is_valid(invalid):
            errors.append("Invalid schema version unexpectedly accepted")
        checks.append("JSON Schema 2020-12 and invalid version negative test")
    except Exception as exc:
        errors.append(f"Schema validation failed: {exc}")


def verify_lesson(lesson: dict) -> None:
    activity_ids = [act["id"] for act in lesson.get("activities", [])]
    resource_ids = [b["id"] for b in lesson.get("contentBlocks", []) if b.get("type") == "resource"]
    event_ids = [ev["id"] for ev in lesson.get("timeline", [])]
    objective_ids = [ob["id"] for ob in lesson.get("objectives", [])]
    for group, ids in (("activities", activity_ids), ("events", event_ids), ("objectives", objective_ids)):
        if len(ids) != len(set(ids)):
            errors.append(f"Lesson {lesson.get('id')}: duplicate {group}")
    mapping = {"openQuiz": {a["id"] for a in lesson.get("activities", []) if a["type"] == "quiz"},
               "openPractice": {a["id"] for a in lesson.get("activities", []) if a["type"] in ("quick-code", "local-project")},
               "openResource": set(resource_ids)}
    for event in lesson.get("timeline", []):
        if event.get("targetId") not in mapping.get(event.get("action"), set()):
            errors.append(f"Lesson {lesson.get('id')}: unknown target for event {event.get('id')}")
        if event.get("atSec", -1) > lesson.get("durationSec", 0):
            errors.append(f"Lesson {lesson.get('id')}: event after duration")
    for item in lesson.get("checklist", []):
        if item["objectiveId"] not in objective_ids:
            errors.append(f"Lesson {lesson.get('id')}: checklist objective missing")
        if "activityId" in item and item["activityId"] not in activity_ids:
            errors.append(f"Lesson {lesson.get('id')}: checklist activity missing")
    for act in lesson.get("activities", []):
        if act["type"] == "quiz" and act["correctOptionId"] not in [opt["id"] for opt in act["options"]]:
            errors.append(f"Lesson {lesson.get('id')}: quiz correct option missing")

for item in fixtures:
    verify_lesson(item)
checks.append("Cross-reference checks (activities, timeline, checklist)")

items = backlog.get("items", [])
ids = [item.get("id") for item in items]
if len(ids) != len(set(ids)):
    errors.append("Duplicate backlog IDs")
lookup = {item["id"]: item for item in items}
for item in items:
    if item.get("status") not in backlog.get("statuses", []):
        errors.append(f"Invalid status: {item.get('id')}")
    if item.get("status") == "done" and not item.get("evidence"):
        errors.append(f"Done without evidence: {item.get('id')}")
    for dep in item.get("dependsOn", []):
        if dep not in lookup:
            errors.append(f"Unknown dependency {item.get('id')} -> {dep}")
        elif lookup[dep]["slice"] > item["slice"]:
            errors.append(f"Forward dependency {item.get('id')} -> {dep}")
visit: set[str] = set()
visiting: set[str] = set()
def dfs(id: str) -> None:
    if id in visiting:
        errors.append(f"Dependency cycle at {id}")
        return
    if id in visit:
        return
    visiting.add(id)
    for dep in lookup[id].get("dependsOn", []):
        if dep in lookup:
            dfs(dep)
    visiting.remove(id)
    visit.add(id)
for id in lookup:
    dfs(id)
checks.append(f"Backlog {len(items)} items, status/graph validated")

skill_paths = sorted((ROOT / ".agents/skills").glob("*/SKILL.md"))
if len(skill_paths) < 6:
    errors.append("Fewer than 6 Codex skills")
for p in skill_paths:
    text = p.read_text(encoding="utf-8")
    if not re.match(r"\A---\nname: [a-z0-9-]+\ndescription: .+\n---\n", text):
        errors.append(f"Invalid SKILL frontmatter {p.relative_to(ROOT)}")
checks.append(f"Codex skills {len(skill_paths)} metadata")

roles = sorted((ROOT / ".codex/agents").glob("*.toml"))
for p in roles:
    try:
        data = tomllib.loads(p.read_text(encoding="utf-8"))
        for key in ("name", "description", "developer_instructions"):
            if not data.get(key):
                errors.append(f"Agent {p.name} missing {key}")
    except (OSError, ValueError) as exc:
        errors.append(f"Invalid TOML role {p.name}: {exc}")
checks.append(f"Codex agent TOML {len(roles)} parsed")

html = must("ui-prototype/index.html").read_text(encoding="utf-8")
html_ids = re.findall(r'\bid="([^"]+)"', html)
duplicates = [name for name, count in Counter(html_ids).items() if count > 1]
if duplicates:
    errors.append(f"Duplicate HTML IDs: {duplicates}")
for required in ("view-admin", "view-learner", "runtime", "web-preview", "check-quiz-status"):
    if required not in html_ids:
        errors.append(f"Missing UI element #{required}")
css = must("ui-prototype/styles.css").read_text(encoding="utf-8")
if "color-scheme:light" not in css or "@media(max-width:720px)" not in css:
    errors.append("Light-only or responsive CSS policy absent")
checks.append("UI required targets and HTML ID uniqueness")

if errors:
    print(f"FAIL: {len(errors)} issue(s)")
    for err in errors:
        print("  -", err)
    sys.exit(1)
for result in checks:
    print("PASS:", result)
print(f"PASS: handoff integrity ({len(checks)} check groups)")
