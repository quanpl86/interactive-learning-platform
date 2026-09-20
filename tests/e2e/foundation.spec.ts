import { expect, test } from '@playwright/test';

test.describe('Foundation app shells', () => {
  test('Admin Studio is responsive and labels demo data honestly', async ({ page }) => {
    await page.goto('http://127.0.0.1:6173/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Quản lý và sản xuất học liệu',
    );
    await expect(page.getByText('Dữ liệu minh họa.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tạo học liệu mới' })).toBeDisabled();
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Learning Workspace exposes the scoped MVP and no fake runtime', async ({ page }) => {
    await page.goto('http://127.0.0.1:6174/courses');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Học và thực hành theo từng bước',
    );
    await expect(page.getByText('Python và Web browser runtime thuộc Slice 3–4')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tải project mẫu' })).toBeDisabled();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
