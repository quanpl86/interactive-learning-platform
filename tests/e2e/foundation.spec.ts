import { expect, test } from '@playwright/test';

test.describe('Learning platform app shells', () => {
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

  test('Learning Workspace opens a safe lesson reader and formative quiz', async ({ page }) => {
    await page.goto('http://127.0.0.1:6174/courses');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Học và thực hành theo từng bước',
    );
    await expect(page.getByRole('link', { name: 'Mở bài học' }).first()).toBeVisible();
    await expect(page.getByText('Markdown và resource')).toBeVisible();

    await page.getByRole('link', { name: 'Mở bài học' }).nth(1).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thực hành HTML/CSS/JS nhanh');
    await expect(page.getByText('Markdown an toàn')).toBeVisible();
    await expect(page.getByText('Bài mẫu chưa có video.')).toBeVisible();

    await page.goto('http://127.0.0.1:6174/learn/PY-GUESS-01');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Trò chơi đoán số — Python Console',
    );
    await page.locator('video').evaluate((video) => {
      Object.defineProperty(video, 'currentTime', { configurable: true, value: 100 });
      video.dispatchEvent(new Event('timeupdate'));
    });
    await expect(page.getByText('Đã qua').first()).toBeVisible();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Ghi nhận câu trả lời' }).click();
    await expect(page.getByText('Đã ghi nhận formative, chưa phải điểm chính thức.')).toBeVisible();
    await page.getByRole('checkbox').first().check();
    await expect(page.getByRole('checkbox').first()).toBeChecked();

    await page.reload();
    await expect(page.getByRole('radio').first()).not.toBeChecked();
    await expect(page.getByRole('checkbox').first()).not.toBeChecked();
    await expect(page.getByText('Refresh trang sẽ reset trạng thái trong Slice 2.')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
