export type PythonRunnerStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'error';

export type OutputStream = 'stdout' | 'stderr';

export interface PythonOutput {
  stream: OutputStream;
  text: string;
}

export interface PythonRunLimits {
  timeoutMs: number;
  maxOutputChars: number;
}

export interface PythonRunRequest {
  files: Readonly<Record<string, string>>;
  entryFile: string;
  limits?: Partial<PythonRunLimits>;
}

export interface PythonRunResult {
  runId: string;
  ok: boolean;
  status: 'completed' | 'error' | 'stopped' | 'timeout' | 'output-limit';
  output: readonly PythonOutput[];
  error?: string;
}

export interface FormativeCheck {
  id: string;
  label: string;
  matcher: {
    type: 'includes' | 'equals';
    value: string;
  };
}

export interface FormativeCheckResult extends FormativeCheck {
  passed: boolean;
}
