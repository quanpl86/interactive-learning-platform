import type { PropsWithChildren, ReactNode } from 'react';
import type { NavigationItem } from './types';

interface AppShellProps extends PropsWithChildren {
  appName: string;
  currentPath: string;
  navigation: readonly NavigationItem[];
  productLabel?: string;
  status?: ReactNode;
}

export function AppShell({
  appName,
  children,
  currentPath,
  navigation,
  productLabel = 'Interactive Learning Platform',
  status,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <aside className="sidebar" aria-label="Điều hướng chính">
        <a className="brand" href="/" aria-label={`${productLabel} — ${appName}`}>
          <span className="brand-mark" aria-hidden="true">
            IL
          </span>
          <span>
            <strong>{appName}</strong>
            <small>{productLabel}</small>
          </span>
        </a>
        <nav className="navigation" aria-label="Không gian làm việc">
          {navigation.map((item) => {
            const active = currentPath === item.href;
            return (
              <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
                {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="scope-note">
          <strong>Foundation 0.1.0</strong>
          <p>Giao diện minh họa dùng fixture, chưa kết nối backend.</p>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">{productLabel}</span>
            <strong>{appName}</strong>
          </div>
          {status ?? <Badge tone="demo">DEMO</Badge>}
        </header>
        <nav className="mobile-navigation" aria-label="Điều hướng trên màn hình nhỏ">
          {navigation.map((item) => {
            const active = currentPath === item.href;
            return (
              <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </a>
            );
          })}
        </nav>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </section>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: 'demo' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
