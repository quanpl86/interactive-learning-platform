import PythonWorker from './python.worker?worker';
import {
  isParentToRunnerMessage,
  type ParentToRunnerMessage,
  type RunnerToParentMessage,
} from './protocol';

interface WorkerMessage {
  type: 'status' | 'output' | 'result';
  runId: string;
  status?: 'loading' | 'ready' | 'running';
  stream?: 'stdout' | 'stderr';
  text?: string;
  ok?: boolean;
  error?: string;
}

export function startPythonRunnerBridge(): () => void {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get('parentOrigin');
  const nonce = window.location.hash.slice(1);
  if (
    !parentOrigin ||
    !isWebOrigin(parentOrigin) ||
    !/^[a-f0-9-]{36}$/i.test(nonce) ||
    window.parent === window
  ) {
    throw new Error('Python runner thiếu parentOrigin hoặc nonce hợp lệ.');
  }

  let worker: Worker | undefined;
  let activeRunId: string | undefined;
  let runTimeout: number | undefined;
  let executionTimeoutMs = 8_000;

  const send = (message: RunnerToParentMessage) => window.parent.postMessage(message, parentOrigin);
  const terminateWorker = () => {
    if (runTimeout !== undefined) window.clearTimeout(runTimeout);
    runTimeout = undefined;
    worker?.terminate();
    worker = undefined;
  };
  const createWorker = () => {
    terminateWorker();
    worker = new PythonWorker();
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!isWorkerMessage(event.data) || event.data.runId !== activeRunId) return;
      const message = event.data;
      if (message.type === 'status' && message.status) {
        if (message.status === 'running') {
          if (runTimeout !== undefined) window.clearTimeout(runTimeout);
          runTimeout = window.setTimeout(() => {
            const timedOutRunId = activeRunId;
            terminateWorker();
            if (timedOutRunId) {
              send({
                type: 'ilp-python-result',
                nonce,
                runId: timedOutRunId,
                ok: false,
                error: `Chương trình đã vượt giới hạn ${executionTimeoutMs / 1000} giây và bị dừng.`,
              });
            }
          }, executionTimeoutMs);
        }
        send({ type: 'ilp-python-status', nonce, runId: message.runId, status: message.status });
      } else if (message.type === 'output' && message.stream && typeof message.text === 'string') {
        send({
          type: 'ilp-python-output',
          nonce,
          runId: message.runId,
          stream: message.stream,
          text: message.text,
        });
      } else if (message.type === 'result' && typeof message.ok === 'boolean') {
        if (runTimeout !== undefined) window.clearTimeout(runTimeout);
        runTimeout = undefined;
        send({
          type: 'ilp-python-result',
          nonce,
          runId: message.runId,
          ok: message.ok,
          ...(message.error ? { error: message.error } : {}),
        });
      }
    };
    worker.onerror = () => {
      if (!activeRunId) return;
      send({
        type: 'ilp-python-result',
        nonce,
        runId: activeRunId,
        ok: false,
        error: 'Python Worker gặp lỗi và đã được dừng.',
      });
      terminateWorker();
    };
  };

  const onMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== window.parent || event.origin !== parentOrigin) return;
    if (!isParentToRunnerMessage(event.data) || event.data.nonce !== nonce) return;
    const message = event.data;
    if (message.type === 'ilp-python-stop') {
      if (message.runId !== activeRunId) return;
      terminateWorker();
      send({
        type: 'ilp-python-status',
        nonce,
        runId: message.runId,
        status: 'stopped',
      });
      return;
    }

    if (!isSafeRunMessage(message)) {
      send({
        type: 'ilp-python-result',
        nonce,
        runId: message.runId,
        ok: false,
        error: 'Yêu cầu chạy Python vượt giới hạn hoặc chứa tên file không hợp lệ.',
      });
      return;
    }
    activeRunId = message.runId;
    executionTimeoutMs = message.limits.timeoutMs;
    createWorker();
    runTimeout = window.setTimeout(() => {
      terminateWorker();
      send({
        type: 'ilp-python-result',
        nonce,
        runId: message.runId,
        ok: false,
        error: 'Runtime Python tải quá lâu và đã bị dừng.',
      });
    }, 45_000);
    worker?.postMessage({
      type: 'run',
      runId: message.runId,
      files: message.files,
      entryFile: message.entryFile,
      maxOutputChars: message.limits.maxOutputChars,
    });
  };

  window.addEventListener('message', onMessage);
  send({ type: 'ilp-python-ready', nonce });
  return () => {
    window.removeEventListener('message', onMessage);
    terminateWorker();
  };
}

function isWebOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.origin === value;
  } catch {
    return false;
  }
}

function isSafeRunMessage(
  message: Extract<ParentToRunnerMessage, { type: 'ilp-python-run' }>,
): boolean {
  const filenames = Object.keys(message.files);
  const totalChars = Object.values(message.files).reduce((total, source) => total + source.length, 0);
  return (
    /^[A-Za-z0-9-]{1,64}$/.test(message.runId) &&
    filenames.length >= 1 &&
    filenames.length <= 5 &&
    filenames.includes(message.entryFile) &&
    filenames.every((filename) => /^[A-Za-z0-9_-]+\.py$/.test(filename)) &&
    totalChars <= 200_000 &&
    Number.isFinite(message.limits.timeoutMs) &&
    message.limits.timeoutMs >= 1_000 &&
    message.limits.timeoutMs <= 15_000 &&
    Number.isFinite(message.limits.maxOutputChars) &&
    message.limits.maxOutputChars >= 1_000 &&
    message.limits.maxOutputChars <= 64_000
  );
}

function isWorkerMessage(value: unknown): value is WorkerMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'status' || value.type === 'output' || value.type === 'result') &&
    'runId' in value &&
    typeof value.runId === 'string'
  );
}
