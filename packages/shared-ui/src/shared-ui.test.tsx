import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';
import { Button } from './Button';

describe('shared UI', () => {
  it('marks the current navigation destination and exposes the main landmark', () => {
    const html = renderToStaticMarkup(
      <AppShell
        appName="Admin Studio"
        currentPath="/dashboard"
        navigation={[{ href: '/dashboard', label: 'Tổng quan' }]}
      >
        Nội dung
      </AppShell>,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('id="main-content"');
    expect(html).toContain('Bỏ qua điều hướng');
  });

  it('uses a real button element', () => {
    expect(renderToStaticMarkup(<Button>Lưu bản nháp</Button>)).toContain('<button');
  });
});
