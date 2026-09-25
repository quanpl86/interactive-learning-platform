import type { FormativeCheck, FormativeCheckResult, PythonOutput } from './types';

export function parseFormativeChecks(value: unknown): readonly FormativeCheck[] {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.checks)) return [];

  return value.checks.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== 'string' ||
      typeof candidate.label !== 'string' ||
      !isRecord(candidate.matcher) ||
      (candidate.matcher.type !== 'includes' && candidate.matcher.type !== 'equals') ||
      typeof candidate.matcher.value !== 'string'
    ) {
      return [];
    }
    return [
      {
        id: candidate.id,
        label: candidate.label,
        matcher: { type: candidate.matcher.type, value: candidate.matcher.value },
      } satisfies FormativeCheck,
    ];
  });
}

export function evaluateFormativeChecks(
  checks: readonly FormativeCheck[],
  output: readonly PythonOutput[],
): readonly FormativeCheckResult[] {
  const stdout = output
    .filter(({ stream }) => stream === 'stdout')
    .map(({ text }) => text)
    .join('\n')
    .trimEnd();

  return checks.map((check) => ({
    ...check,
    passed:
      check.matcher.type === 'equals'
        ? stdout === check.matcher.value
        : stdout.includes(check.matcher.value),
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
