import { useEffect, useRef, useState } from 'react';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import type { editor as MonacoEditorNamespace } from 'monaco-editor';

interface MonacoCodeEditorProps {
  activityId: string;
  activeFile: string;
  files: Readonly<Record<string, string>>;
  onChange(filename: string, value: string): void;
}

interface MonacoEnvironmentWindow extends Window {
  MonacoEnvironment?: {
    getWorker(): Worker;
  };
}

export function MonacoCodeEditor({
  activityId,
  activeFile,
  files,
  onChange,
}: MonacoCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditorNamespace.IStandaloneCodeEditor | undefined>(undefined);
  const modelsRef = useRef(new Map<string, MonacoEditorNamespace.ITextModel>());
  const initialFilesRef = useRef(files);
  const initialActiveFileRef = useRef(activeFile);
  const onChangeRef = useRef(onChange);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let disposed = false;
    const models = modelsRef.current;
    const initialize = async () => {
      try {
        (window as MonacoEnvironmentWindow).MonacoEnvironment ??= {
          getWorker: () => new EditorWorker(),
        };
        const monaco = await import('monaco-editor/editor/editor.api');
        await import('monaco-editor/languages/definitions/python/register');
        if (disposed || !containerRef.current) return;
        for (const [filename, source] of Object.entries(initialFilesRef.current)) {
          const uri = monaco.Uri.parse(`file:///lesson/${activityId}/${filename}`);
          const existing = monaco.editor.getModel(uri);
          const model = existing ?? monaco.editor.createModel(source, 'python', uri);
          models.set(filename, model);
          model.onDidChangeContent(() => onChangeRef.current(filename, model.getValue()));
        }
        editorRef.current = monaco.editor.create(containerRef.current, {
          model: models.get(initialActiveFileRef.current),
          theme: 'vs',
          automaticLayout: true,
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          ariaLabel: `Trình soạn thảo Python ${initialActiveFileRef.current}`,
        });
      } catch (error) {
        setLoadError(
          `Không tải được trình soạn thảo: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };
    void initialize();
    return () => {
      disposed = true;
      editorRef.current?.dispose();
      editorRef.current = undefined;
      for (const model of models.values()) model.dispose();
      models.clear();
    };
  }, [activityId]);

  useEffect(() => {
    const model = modelsRef.current.get(activeFile);
    if (model) {
      editorRef.current?.setModel(model);
      editorRef.current?.updateOptions({ ariaLabel: `Trình soạn thảo Python ${activeFile}` });
      editorRef.current?.focus();
    }
  }, [activeFile]);

  return loadError ? (
    <div className="python-runtime-error" role="alert">
      {loadError}
    </div>
  ) : (
    <div
      className="python-monaco"
      ref={containerRef}
      role="region"
      aria-label="Khu vực soạn thảo Python"
    />
  );
}
