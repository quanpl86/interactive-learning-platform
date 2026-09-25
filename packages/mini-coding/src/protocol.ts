import type { PythonRunLimits, PythonRunnerStatus } from './types';

export interface RunnerRunMessage {
  type: 'ilp-python-run';
  nonce: string;
  runId: string;
  files: Readonly<Record<string, string>>;
  entryFile: string;
  limits: PythonRunLimits;
}

export interface RunnerStopMessage {
  type: 'ilp-python-stop';
  nonce: string;
  runId: string;
}

export type ParentToRunnerMessage = RunnerRunMessage | RunnerStopMessage;

export type RunnerToParentMessage =
  | { type: 'ilp-python-ready'; nonce: string }
  | {
      type: 'ilp-python-status';
      nonce: string;
      runId: string;
      status: PythonRunnerStatus;
    }
  | {
      type: 'ilp-python-output';
      nonce: string;
      runId: string;
      stream: 'stdout' | 'stderr';
      text: string;
    }
  | {
      type: 'ilp-python-result';
      nonce: string;
      runId: string;
      ok: boolean;
      error?: string;
    };

export function isParentToRunnerMessage(value: unknown): value is ParentToRunnerMessage {
  if (!isRecord(value) || typeof value.nonce !== 'string' || typeof value.runId !== 'string') {
    return false;
  }
  if (value.type === 'ilp-python-stop') return true;
  return (
    value.type === 'ilp-python-run' &&
    isStringRecord(value.files) &&
    typeof value.entryFile === 'string' &&
    isRecord(value.limits) &&
    typeof value.limits.timeoutMs === 'number' &&
    typeof value.limits.maxOutputChars === 'number'
  );
}

export function isRunnerToParentMessage(value: unknown): value is RunnerToParentMessage {
  if (!isRecord(value) || typeof value.type !== 'string' || typeof value.nonce !== 'string') {
    return false;
  }
  if (value.type === 'ilp-python-ready') return true;
  if (typeof value.runId !== 'string') return false;
  if (value.type === 'ilp-python-status') {
    return (
      value.status === 'idle' ||
      value.status === 'loading' ||
      value.status === 'ready' ||
      value.status === 'running' ||
      value.status === 'stopped' ||
      value.status === 'error'
    );
  }
  if (value.type === 'ilp-python-output') {
    return (
      (value.stream === 'stdout' || value.stream === 'stderr') && typeof value.text === 'string'
    );
  }
  return (
    value.type === 'ilp-python-result' &&
    typeof value.ok === 'boolean' &&
    (value.error === undefined || typeof value.error === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}
