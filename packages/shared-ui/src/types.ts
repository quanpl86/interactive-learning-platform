import type { ReactNode } from 'react';

export interface NavigationItem {
  href: string;
  icon?: ReactNode;
  label: string;
}
