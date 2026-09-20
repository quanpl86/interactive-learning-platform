import type { ReactNode } from 'react';
import { parseMarkdown, safeHref } from './markdown-parser';

function inlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-${index}`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-${index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={`${keyPrefix}-${index}`}>{token.slice(1, -1)}</em>);
    } else {
      const href = safeHref(match[3] ?? '');
      nodes.push(
        href ? (
          <a key={`${keyPrefix}-${index}`} href={href} target="_blank" rel="noreferrer">
            {match[2]}
          </a>
        ) : (
          (match[2] ?? token)
        ),
      );
    }
    cursor = match.index + token.length;
    index += 1;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="lesson-markdown">
      {parseMarkdown(markdown).map((token, index) => {
        if (token.kind === 'heading') {
          const Tag = `h${token.level}` as 'h1' | 'h2' | 'h3';
          return <Tag key={index}>{inlineMarkdown(token.text ?? '', `heading-${index}`)}</Tag>;
        }
        if (token.kind === 'list') {
          return (
            <ul key={index}>
              {token.items?.map((item, itemIndex) => (
                <li key={itemIndex}>{inlineMarkdown(item, `item-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        if (token.kind === 'code') {
          return (
            <pre key={index} data-language={token.language}>
              <code>{token.text}</code>
            </pre>
          );
        }
        return <p key={index}>{inlineMarkdown(token.text ?? '', `paragraph-${index}`)}</p>;
      })}
    </div>
  );
}
