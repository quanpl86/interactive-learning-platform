import { useEffect, useMemo, useRef, useState } from 'react';
import { evaluateFormativeChecks, parseFormativeChecks } from './checks';
import { isDraftDirty, updateDraftFile } from './draft';
import { IframePythonRunner } from './iframe-runner';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import type {
  FormativeCheck,
  FormativeCheckResult,
  PythonOutput,
  PythonRunnerStatus,
} from './types';
import './styles.css';

interface PythonPracticeProps {
  activityId: string;
  starterFiles: Readonly<Record<string, string>>;
  checks?: unknown;
  runnerUrl?: string;
  onCompleted?(): void;
}

const STATUS_LABELS: Record<PythonRunnerStatus, string> = {
  idle: 'Chưa khởi động',
  loading: 'Đang tải Python',
  ready: 'Sẵn sàng',
  running: 'Đang chạy',
  stopped: 'Đã dừng',
  error: 'Có lỗi',
};

export function PythonPractice({
  activityId,
  starterFiles,
  checks,
  runnerUrl,
  onCompleted,
}: PythonPracticeProps) {
  const filenames = useMemo(() => Object.keys(starterFiles), [starterFiles]);
  const [files, setFiles] = useState<Readonly<Record<string, string>>>(() => ({ ...starterFiles }));
  const [activeFile, setActiveFile] = useState(filenames[0] ?? 'main.py');
  const [status, setStatus] = useState<PythonRunnerStatus>('idle');
  const [output, setOutput] = useState<readonly PythonOutput[]>([]);
  const [error, setError] = useState('');
  const [checkResults, setCheckResults] = useState<readonly FormativeCheckResult[]>([]);
  const [editorVersion, setEditorVersion] = useState(0);
  const runnerRef = useRef<IframePythonRunner | undefined>(undefined);
  const parsedChecks = useMemo<readonly FormativeCheck[]>(() => parseFormativeChecks(checks), [checks]);
  const dirty = isDraftDirty(files, starterFiles);
  const isBusy = status === 'loading' || status === 'running';

  useEffect(
    () => () => {
      runnerRef.current?.dispose();
      runnerRef.current = undefined;
    },
    [],
  );

  const createRunner = () => {
    if (!runnerUrl) return undefined;
    runnerRef.current ??= new IframePythonRunner(runnerUrl, {
      onStatus: setStatus,
      onOutput: (next) => setOutput((current) => [...current, next]),
    });
    return runnerRef.current;
  };

  const run = async () => {
    const runner = createRunner();
    if (!runner) {
      setError('Runtime Python chưa được cấu hình runner origin an toàn cho môi trường này.');
      setStatus('error');
      return;
    }
    setOutput([]);
    setError('');
    setCheckResults([]);
    try {
      const result = await runner.run({ files, entryFile: activeFile });
      if (!result.ok) {
        setError(result.error ?? 'Chương trình Python kết thúc với lỗi.');
        return;
      }
      const results = evaluateFormativeChecks(parsedChecks, result.output);
      setCheckResults(results);
      if (results.length > 0 && results.every(({ passed }) => passed)) onCompleted?.();
    } catch (runError) {
      setStatus('error');
      setError(runError instanceof Error ? runError.message : String(runError));
    }
  };

  const stop = () => runnerRef.current?.stop();

  const reset = () => {
    if (dirty && !window.confirm('Đặt lại toàn bộ file về nội dung ban đầu? Thay đổi chưa lưu sẽ mất.')) {
      return;
    }
    setFiles({ ...starterFiles });
    setOutput([]);
    setError('');
    setCheckResults([]);
    setStatus('idle');
    setEditorVersion((current) => current + 1);
  };

  return (
    <section className="python-practice" aria-labelledby={`python-title-${activityId}`}>
      <div className="python-practice-heading">
        <div>
          <span className="python-eyebrow">Python Console</span>
          <h2 id={`python-title-${activityId}`}>Thực hành nhanh</h2>
        </div>
        <span className={`python-status python-status-${status}`} role="status">
          {STATUS_LABELS[status]}
        </span>
      </div>

      {!runnerUrl ? (
        <div className="python-runtime-warning" role="note">
          Runtime đang tắt vì chưa có runner origin tách biệt. Bạn vẫn có thể sửa và đặt lại code.
        </div>
      ) : null}

      <div className="python-tabs" role="tablist" aria-label="File Python cố định">
        {filenames.map((filename) => (
          <button
            key={filename}
            type="button"
            role="tab"
            aria-selected={activeFile === filename}
            tabIndex={activeFile === filename ? 0 : -1}
            onClick={() => setActiveFile(filename)}
          >
            {filename}
            {files[filename] !== starterFiles[filename] ? ' •' : ''}
          </button>
        ))}
      </div>

      <MonacoCodeEditor
        key={editorVersion}
        activityId={activityId}
        activeFile={activeFile}
        files={files}
        onChange={(filename, value) => setFiles((current) => updateDraftFile(current, filename, value))}
      />

      <div className="python-toolbar" aria-label="Điều khiển Python">
        <button type="button" className="python-button python-button-primary" disabled={isBusy || !runnerUrl} onClick={() => void run()}>
          Chạy mã
        </button>
        <button type="button" className="python-button" disabled={!isBusy} onClick={stop}>
          Dừng
        </button>
        <button type="button" className="python-button" disabled={isBusy} onClick={reset}>
          Đặt lại
        </button>
        <span className="python-dirty-state">{dirty ? 'Có thay đổi chưa lưu' : 'Đang dùng bản mẫu'}</span>
      </div>

      <div className="python-console" aria-live="polite" aria-label="Kết quả chạy Python">
        <div className="python-console-title">Kết quả</div>
        {output.length === 0 && !error ? (
          <p>Chưa có output. Runtime chỉ được tải khi bạn chọn “Chạy mã”.</p>
        ) : (
          <pre>
            {output.map((item, index) => (
              <span className={item.stream === 'stderr' ? 'python-stderr' : undefined} key={`${item.stream}-${index}`}>
                {item.text}{'\n'}
              </span>
            ))}
            {error ? <span className="python-stderr">{error}</span> : null}
          </pre>
        )}
      </div>

      {checkResults.length > 0 ? (
        <div className="python-checks" aria-label="Kiểm tra formative">
          <h3>Kiểm tra kết quả</h3>
          <ul>
            {checkResults.map((check) => (
              <li key={check.id}>
                <span aria-hidden="true">{check.passed ? '✓' : '!'}</span>
                <span>{check.label}</span>
                <strong>{check.passed ? 'Đạt' : 'Chưa đạt'}</strong>
              </li>
            ))}
          </ul>
          <p>Kết quả chạy trên trình duyệt chỉ mang tính formative, không phải điểm chính thức.</p>
        </div>
      ) : null}
    </section>
  );
}
