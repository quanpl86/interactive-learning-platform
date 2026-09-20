# Fixtures are contract examples, not publishable lessons
- `lesson.sample.json`: Python sample references `assets/video/demo.mp4`, `.vtt`, `.webp`, local starter and tests **not included**. A production validator MUST reject publication until those assets exist. JSON Schema validation alone does not validate referenced asset existence or cross-ID relationships.
- `lesson.web.sample.json`: media-free Web quick practice fixture for contract validation.
- correct quiz option shown in public fixture is deliberately `formative-client`, NOT private/exam answer; do not use for secure grading.
- Do not put real student records in fixtures.
