import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'ilp-quality-gate-'));
const invalidFixture = join(temporaryDirectory, 'invalid-fixture.ts');
const compilerPath = fileURLToPath(import.meta.resolve('typescript/lib/tsc.js'));

try {
  writeFileSync(invalidFixture, 'const lessonCount: string = 2;\n', 'utf8');
  const result = spawnSync(
    process.execPath,
    [compilerPath, '--noEmit', '--strict', '--skipLibCheck', invalidFixture],
    { encoding: 'utf8' },
  );
  const output = `${result.stdout}${result.stderr}`;

  if (result.status === 0 || !output.includes('TS2322')) {
    throw new Error('Quality gate did not reject the deliberately invalid TypeScript fixture.');
  }

  console.log('PASS: TypeScript quality gate rejected the deliberate invalid fixture (TS2322).');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
