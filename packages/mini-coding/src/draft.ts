export function updateDraftFile(
  files: Readonly<Record<string, string>>,
  filename: string,
  value: string,
): Readonly<Record<string, string>> {
  if (!(filename in files)) return files;
  return { ...files, [filename]: value };
}

export function isDraftDirty(
  files: Readonly<Record<string, string>>,
  starterFiles: Readonly<Record<string, string>>,
): boolean {
  const names = Object.keys(starterFiles);
  return (
    names.length !== Object.keys(files).length ||
    names.some((filename) => files[filename] !== starterFiles[filename])
  );
}
