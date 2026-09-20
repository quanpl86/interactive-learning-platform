import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from './markdown';
import { parseMarkdown, safeHref } from './markdown-parser';

describe('safe Markdown content', () => {
  it('supports the lesson subset without injecting HTML', () => {
    const html = renderToStaticMarkup(
      <MarkdownContent markdown={'# Tiêu đề\n\n<script>alert(1)</script> **an toàn**'} />,
    );
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('<strong>an toàn</strong>');
    expect(html).not.toContain('<script>');
  });

  it('allows HTTPS/relative links and rejects active or protocol-relative URLs', () => {
    expect(safeHref('https://example.com/lesson')).toBe('https://example.com/lesson');
    expect(safeHref('/assets/guide.html')).toBe('/assets/guide.html');
    expect(safeHref('javascript:alert(1)')).toBeUndefined();
    expect(safeHref('//evil.example')).toBeUndefined();
  });

  it('parses headings, lists and fenced code deterministically', () => {
    expect(parseMarkdown('## H\n\n- A\n- B\n\n```css\na { color: red; }\n```')).toEqual([
      { kind: 'heading', level: 2, text: 'H' },
      { kind: 'list', items: ['A', 'B'] },
      { kind: 'code', language: 'css', text: 'a { color: red; }' },
    ]);
  });
});
