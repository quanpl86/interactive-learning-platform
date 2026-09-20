import type { ReactNode } from 'react';

interface PageHeaderProps {
  action?: ReactNode;
  eyebrow?: string;
  subtitle: string;
  title: string;
}

export function PageHeader({ action, eyebrow, subtitle, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="breadcrumb">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
