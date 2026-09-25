/// <reference lib="webworker" />

interface WorkerRunMessage {
  type: 'run';
  runId: string;
  files: Readonly<Record<string, string>>;
  entryFile: string;
  maxOutputChars: number;
}

interface PyodideFileSystem {
  mkdirTree(path: string): void;
  writeFile(path: string, value: string, options: { encoding: 'utf8' }): void;
  chdir(path: string): void;
}

interface PyodideApi {
  FS: PyodideFileSystem;
  runPythonAsync(code: string): Promise<unknown>;
  setStdin(options: { error: true }): void;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
}

interface PyodideModule {
  loadPyodide(options: { indexURL: string }): Promise<PyodideApi>;
}

const PYODIDE_VERSION = '0.29.5';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYODIDE_MODULE_URL = `${PYODIDE_INDEX_URL}pyodide.mjs`;

let pyodidePromise: Promise<PyodideApi> | undefined;

self.onmessage = (event: MessageEvent<unknown>) => {
  if (!isWorkerRunMessage(event.data)) return;
  void execute(event.data);
};

async function execute(message: WorkerRunMessage): Promise<void> {
  postStatus(message.runId, 'loading');
  let outputLimitExceeded = false;
  try {
    const pyodide = await getPyodide();
    postStatus(message.runId, 'ready');
    let outputChars = 0;
    const emit = (stream: 'stdout' | 'stderr', text: string) => {
      outputChars += text.length;
      if (outputChars > message.maxOutputChars) {
        outputLimitExceeded = true;
        throw new Error(`Giới hạn output ${message.maxOutputChars} ký tự đã bị vượt quá.`);
      }
      self.postMessage({ type: 'output', runId: message.runId, stream, text });
    };
    pyodide.setStdout({ batched: (text) => emit('stdout', text) });
    pyodide.setStderr({ batched: (text) => emit('stderr', text) });
    pyodide.setStdin({ error: true });

    const runDirectory = `/tmp/ilp-${message.runId}`;
    pyodide.FS.mkdirTree(runDirectory);
    for (const [filename, source] of Object.entries(message.files)) {
      pyodide.FS.writeFile(`${runDirectory}/${filename}`, source, { encoding: 'utf8' });
    }
    pyodide.FS.chdir(runDirectory);
    postStatus(message.runId, 'running');
    await pyodide.runPythonAsync(INPUT_POLICY_SOURCE);
    await pyodide.runPythonAsync(message.files[message.entryFile] ?? '');
    self.postMessage({ type: 'result', runId: message.runId, ok: true });
  } catch (error) {
    self.postMessage({
      type: 'result',
      runId: message.runId,
      ok: false,
      error: outputLimitExceeded
        ? `Giới hạn output ${message.maxOutputChars} ký tự đã bị vượt quá.`
        : error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

async function getPyodide(): Promise<PyodideApi> {
  pyodidePromise ??= import(/* @vite-ignore */ PYODIDE_MODULE_URL).then((module) =>
    (module as unknown as PyodideModule).loadPyodide({ indexURL: PYODIDE_INDEX_URL }),
  );
  return pyodidePromise;
}

function postStatus(runId: string, status: 'loading' | 'ready' | 'running'): void {
  self.postMessage({ type: 'status', runId, status });
}

function isWorkerRunMessage(value: unknown): value is WorkerRunMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'run' &&
    'runId' in value &&
    typeof value.runId === 'string' &&
    'files' in value &&
    typeof value.files === 'object' &&
    value.files !== null &&
    'entryFile' in value &&
    typeof value.entryFile === 'string' &&
    'maxOutputChars' in value &&
    typeof value.maxOutputChars === 'number'
  );
}

const INPUT_POLICY_SOURCE = `
import builtins

def _ilp_input_unsupported(*args, **kwargs):
    raise RuntimeError("input() chưa được hỗ trợ trong phiên bản này. Hãy dùng dữ liệu khai báo sẵn trong mã.")

builtins.input = _ilp_input_unsupported
`;

export {};
