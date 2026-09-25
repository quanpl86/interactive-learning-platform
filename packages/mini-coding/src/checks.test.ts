import { describe, expect, it } from 'vitest';
import { evaluateFormativeChecks, parseFormativeChecks } from './checks';

describe('formative output checks', () => {
  it('validates the external spec before evaluating stdout', () => {
    const checks = parseFormativeChecks({
      version: 1,
      checks: [
        { id: 'hello', label: 'In lời chào', matcher: { type: 'includes', value: 'Xin chào' } },
        { id: 2, label: 'invalid', matcher: { type: 'equals', value: '' } },
      ],
    });
    expect(checks).toHaveLength(1);
    expect(
      evaluateFormativeChecks(checks, [
        { stream: 'stdout', text: 'Xin chào Python!' },
        { stream: 'stderr', text: 'không tính vào kết quả' },
      ]),
    ).toMatchObject([{ id: 'hello', passed: true }]);
  });

  it('returns an inspectable failure without claiming a trusted grade', () => {
    const checks = parseFormativeChecks({
      version: 1,
      checks: [{ id: 'exact', label: 'Đúng output', matcher: { type: 'equals', value: '42' } }],
    });
    expect(evaluateFormativeChecks(checks, [{ stream: 'stdout', text: '41' }])[0]?.passed).toBe(
      false,
    );
  });
});
