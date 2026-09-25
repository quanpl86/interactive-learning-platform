import { describe, expect, it } from 'vitest';
import { isDraftDirty, updateDraftFile } from './draft';

describe('Python draft files', () => {
  const starter = { 'main.py': 'print("Xin chào")', 'helper.py': 'VALUE = 1' };

  it('updates only a fixed teacher-provided filename', () => {
    expect(updateDraftFile(starter, 'main.py', 'print("Đã sửa")')).toEqual({
      ...starter,
      'main.py': 'print("Đã sửa")',
    });
    expect(updateDraftFile(starter, '../secret.py', 'leak')).toBe(starter);
  });

  it('detects dirty and reset-equivalent states', () => {
    expect(isDraftDirty(starter, starter)).toBe(false);
    expect(isDraftDirty({ ...starter, 'main.py': 'pass' }, starter)).toBe(true);
    expect(isDraftDirty({ 'main.py': starter['main.py'] }, starter)).toBe(true);
  });
});
