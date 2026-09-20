import type { PropsWithChildren } from 'react';

interface BadgeProps extends PropsWithChildren {
  tone?: 'default' | 'info' | 'success' | 'warning';
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
