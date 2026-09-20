export interface MarkdownToken {
  kind: 'heading' | 'paragraph' | 'list' | 'code';
  level?: number;
  text?: string;
  items?: string[];
  language?: string;
}

export function safeHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function parseMarkdown(markdown: string): MarkdownToken[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const tokens: MarkdownToken[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = line.match(/^```([a-zA-Z0-9_-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]!.match(/^```\s*$/)) {
        code.push(lines[index]!);
        index += 1;
      }
      if (index < lines.length) index += 1;
      tokens.push({ kind: 'code', language: fence[1] || undefined, text: code.join('\n') });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      tokens.push({ kind: 'heading', level: heading[1]!.length, text: heading[2] });
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index]!)) {
        items.push(lines[index]!.replace(/^[-*]\s+/, ''));
        index += 1;
      }
      tokens.push({ kind: 'list', items });
      continue;
    }
    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index]!.trim() &&
      !/^#{1,3}\s+/.test(lines[index]!) &&
      !/^[-*]\s+/.test(lines[index]!) &&
      !/^```/.test(lines[index]!)
    ) {
      paragraph.push(lines[index]!);
      index += 1;
    }
    tokens.push({ kind: 'paragraph', text: paragraph.join(' ') });
  }
  return tokens;
}
