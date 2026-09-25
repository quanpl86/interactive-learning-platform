import { isRunnerToParentMessage, type ParentToRunnerMessage } from './protocol';
import type {
  PythonOutput,
  PythonRunRequest,
  PythonRunResult,
  PythonRunnerStatus,
} from './types';

const DEFAULT_LIMITS = { timeoutMs: 8_000, maxOutputChars: 32_000 } as const;
const LOAD_TIMEOUT_MS = 45_000;

export interface RunnerCallbacks {
  onStatus(status: PythonRunnerStatus): void;
  onOutput(output: PythonOutput): void;
}

export class IframePythonRunner {
  readonly #runnerUrl: URL;
  readonly #callbacks: RunnerCallbacks;
  readonly #nonce = crypto.randomUUID();
  #iframe: HTMLIFrameElement | undefined;
  #readyPromise: Promise<void> | undefined;
  #resolveReady: (() => void) | undefined;
  #rejectReady: ((error: Error) => void) | undefined;
  #active:
    | {
        runId: string;
        output: PythonOutput[];
        resolve: (result: PythonRunResult) => void;
        timeout: number;
        executionTimeoutMs: number;
      }
    | undefined;

  constructor(runnerUrl: string, callbacks: RunnerCallbacks) {
    this.#runnerUrl = new URL(runnerUrl, window.location.href);
    this.#callbacks = callbacks;
    window.addEventListener('message', this.#onMessage);
  }

  async run(request: PythonRunRequest): Promise<PythonRunResult> {
    if (this.#active) throw new Error('Một lượt chạy Python đang hoạt động.');
    validateFiles(request.files, request.entryFile);
    await this.#ensureReady();
    const runId = crypto.randomUUID();
    const limits = { ...DEFAULT_LIMITS, ...request.limits };
    this.#callbacks.onStatus('loading');

    return new Promise<PythonRunResult>((resolve) => {
      const timeout = window.setTimeout(
        () => this.#timeoutActive('Runtime Python tải quá lâu và đã bị dừng.'),
        LOAD_TIMEOUT_MS,
      );
      this.#active = {
        runId,
        output: [],
        resolve,
        timeout,
        executionTimeoutMs: limits.timeoutMs,
      };
      this.#post({
        type: 'ilp-python-run',
        nonce: this.#nonce,
        runId,
        files: request.files,
        entryFile: request.entryFile,
        limits,
      });
    });
  }

  stop(): void {
    if (!this.#active) return;
    this.#post({
      type: 'ilp-python-stop',
      nonce: this.#nonce,
      runId: this.#active.runId,
    });
  }

  dispose(): void {
    window.removeEventListener('message', this.#onMessage);
    if (this.#active) {
      window.clearTimeout(this.#active.timeout);
      this.#active.resolve({
        runId: this.#active.runId,
        ok: false,
        status: 'stopped',
        output: this.#active.output,
        error: 'Runtime đã đóng.',
      });
      this.#active = undefined;
    }
    this.#iframe?.remove();
    this.#iframe = undefined;
  }

  async #ensureReady(): Promise<void> {
    if (this.#readyPromise) return this.#readyPromise;
    this.#readyPromise = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('Không thể kết nối Python runner trong 10 giây.')),
        10_000,
      );
      this.#resolveReady = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      this.#rejectReady = (error) => {
        window.clearTimeout(timeout);
        reject(error);
      };
    });
    const url = new URL(this.#runnerUrl);
    url.searchParams.set('parentOrigin', window.location.origin);
    url.hash = this.#nonce;
    const iframe = document.createElement('iframe');
    iframe.hidden = true;
    iframe.title = 'Python runner';
    iframe.src = url.toString();
    iframe.referrerPolicy = 'no-referrer';
    iframe.addEventListener('error', () =>
      this.#rejectReady?.(new Error('Không tải được trang Python runner.')),
    );
    if (url.origin !== window.location.origin) {
      iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    }
    document.body.append(iframe);
    this.#iframe = iframe;
    this.#readyPromise = this.#readyPromise.catch((error: unknown) => {
      iframe.remove();
      this.#iframe = undefined;
      this.#readyPromise = undefined;
      this.#resolveReady = undefined;
      this.#rejectReady = undefined;
      throw error;
    });
    return this.#readyPromise;
  }

  #post(message: ParentToRunnerMessage): void {
    this.#iframe?.contentWindow?.postMessage(message, this.#runnerUrl.origin);
  }

  #onMessage = (event: MessageEvent<unknown>): void => {
    if (
      event.source !== this.#iframe?.contentWindow ||
      event.origin !== this.#runnerUrl.origin ||
      !isRunnerToParentMessage(event.data) ||
      event.data.nonce !== this.#nonce
    ) {
      return;
    }
    const message = event.data;
    if (message.type === 'ilp-python-ready') {
      this.#resolveReady?.();
      this.#resolveReady = undefined;
      this.#rejectReady = undefined;
      return;
    }
    if (!this.#active || message.runId !== this.#active.runId) return;
    if (message.type === 'ilp-python-status') {
      this.#callbacks.onStatus(message.status);
      if (message.status === 'running') {
        window.clearTimeout(this.#active.timeout);
        const executionTimeoutMs = this.#active.executionTimeoutMs;
        this.#active.timeout = window.setTimeout(
          () =>
            this.#timeoutActive(
              `Chương trình đã vượt giới hạn ${executionTimeoutMs / 1000} giây và bị dừng.`,
            ),
          executionTimeoutMs,
        );
      }
      if (message.status === 'stopped') this.#finish(false, 'stopped', 'Đã dừng chương trình.');
    } else if (message.type === 'ilp-python-output') {
      const output = { stream: message.stream, text: message.text } as const;
      this.#active.output.push(output);
      this.#callbacks.onOutput(output);
    } else if (message.type === 'ilp-python-result') {
      this.#finish(message.ok, message.ok ? 'completed' : 'error', message.error);
    }
  };

  #timeoutActive(error: string): void {
    if (!this.#active) return;
    const active = this.#active;
    this.#post({ type: 'ilp-python-stop', nonce: this.#nonce, runId: active.runId });
    this.#active = undefined;
    this.#callbacks.onStatus('error');
    active.resolve({
      runId: active.runId,
      ok: false,
      status: 'timeout',
      output: active.output,
      error,
    });
  }

  #finish(
    ok: boolean,
    status: PythonRunResult['status'],
    error: string | undefined,
  ): void {
    if (!this.#active) return;
    window.clearTimeout(this.#active.timeout);
    const active = this.#active;
    this.#active = undefined;
    this.#callbacks.onStatus(ok ? 'ready' : status === 'stopped' ? 'stopped' : 'error');
    active.resolve({ runId: active.runId, ok, status, output: active.output, ...(error ? { error } : {}) });
  }
}

function validateFiles(files: Readonly<Record<string, string>>, entryFile: string): void {
  const names = Object.keys(files);
  if (names.length === 0 || names.length > 5) throw new Error('Activity phải có từ 1 đến 5 file.');
  if (!names.includes(entryFile)) throw new Error('Không tìm thấy file Python chạy chính.');
  if (names.some((name) => !/^[A-Za-z0-9_-]+\.py$/.test(name))) {
    throw new Error('Tên file Python không hợp lệ.');
  }
}
