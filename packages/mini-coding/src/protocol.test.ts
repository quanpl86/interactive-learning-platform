import { describe, expect, it } from 'vitest';
import { isParentToRunnerMessage, isRunnerToParentMessage } from './protocol';

describe('Python runner message protocol', () => {
  it('rejects malformed or unscoped messages', () => {
    expect(isParentToRunnerMessage({ type: 'ilp-python-stop', runId: 'r1' })).toBe(false);
    expect(isRunnerToParentMessage({ type: 'ilp-python-result', nonce: 'n', ok: true })).toBe(
      false,
    );
  });

  it('accepts a bounded run command shape', () => {
    expect(
      isParentToRunnerMessage({
        type: 'ilp-python-run',
        nonce: 'n',
        runId: 'r1',
        files: { 'main.py': 'print(1)' },
        entryFile: 'main.py',
        limits: { timeoutMs: 8000, maxOutputChars: 32000 },
      }),
    ).toBe(true);
  });
});
