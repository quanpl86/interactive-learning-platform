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
    await expect(page.getByText('Dữ liệu demo hiện reset khi refresh.')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Python practice lazy-loads, runs real output and resets dirty code', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('http://127.0.0.1:6174/learn/PY-GUESS-01');

    await expect(page.getByRole('heading', { name: 'Thực hành nhanh' })).toBeVisible();
    await expect(page.getByText('Runtime chỉ được tải khi bạn chọn')).toBeVisible();
    await page.getByRole('button', { name: 'Chạy mã' }).click();
    await expect(page.getByLabel('Kết quả chạy Python')).toContainText('Xin chào Python!', {
      timeout: 45_000,
    });
    await expect(page.getByText('Chương trình in đúng lời chào Python')).toBeVisible();
    await expect(page.getByText('formative, không phải điểm chính thức')).toBeVisible();

    const editor = page.locator('.python-monaco .view-lines');
    await editor.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.type('print("Da sua")');
    await expect(page.getByText('Có thay đổi chưa lưu')).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Đặt lại' }).click();
    await expect(page.getByText('Đang dùng bản mẫu')).toBeVisible();
  });

  test('Python runtime reports syntax errors, stops loops and can run again', async (
    { page },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runtime lifecycle is covered once on desktop.');
    test.setTimeout(120_000);
    await page.goto('http://127.0.0.1:6174/courses');

    const evidence = await page.evaluate(async () => {
      const nonce = crypto.randomUUID();
      const iframe = document.createElement('iframe');
      iframe.src = `/python-runner.html?parentOrigin=${encodeURIComponent(window.location.origin)}#${nonce}`;
      iframe.hidden = true;
      document.body.append(iframe);

      const ready = new Promise<void>((resolve) => {
        const onReady = (event: MessageEvent<unknown>) => {
          const message = event.data as { type?: string; nonce?: string };
          if (
            event.source === iframe.contentWindow &&
            event.origin === window.location.origin &&
            message.type === 'ilp-python-ready' &&
            message.nonce === nonce
          ) {
            window.removeEventListener('message', onReady);
            resolve();
          }
        };
        window.addEventListener('message', onReady);
      });
      await ready;

      const run = (source: string, stopWhenRunning = false) =>
        new Promise<{ output: string; error: string; status: string }>((resolve) => {
          const runId = crypto.randomUUID();
          let output = '';
          const onMessage = (event: MessageEvent<unknown>) => {
            const message = event.data as {
              type?: string;
              nonce?: string;
              runId?: string;
              status?: string;
              stream?: string;
              text?: string;
              error?: string;
            };
            if (
              event.source !== iframe.contentWindow ||
              event.origin !== window.location.origin ||
              message.nonce !== nonce ||
              message.runId !== runId
            ) {
              return;
            }
            if (message.type === 'ilp-python-output') output += `${message.text ?? ''}\n`;
            if (message.type === 'ilp-python-status' && message.status === 'running' && stopWhenRunning) {
              iframe.contentWindow?.postMessage(
                { type: 'ilp-python-stop', nonce, runId },
                window.location.origin,
              );
            }
            if (message.type === 'ilp-python-status' && message.status === 'stopped') {
              window.removeEventListener('message', onMessage);
              resolve({ output, error: '', status: 'stopped' });
            }
            if (message.type === 'ilp-python-result') {
              window.removeEventListener('message', onMessage);
              resolve({ output, error: message.error ?? '', status: 'result' });
            }
          };
          window.addEventListener('message', onMessage);
          iframe.contentWindow?.postMessage(
            {
              type: 'ilp-python-run',
              nonce,
              runId,
              files: { 'main.py': source },
              entryFile: 'main.py',
              limits: { timeoutMs: 8000, maxOutputChars: 32000 },
            },
            window.location.origin,
          );
        });

      const syntax = await run('print(');
      const input = await run('input("Tên của bạn: ")');
      const overflow = await run('print("x" * 40000)');
      const stopped = await run('while True:\n    pass', true);
      const repeated = await run('print("Xin chào Python!")');
      iframe.remove();
      return { syntax, input, overflow, stopped, repeated };
    });

    expect(evidence.syntax.error).toContain('SyntaxError');
    expect(evidence.input.error).toContain('input() chưa được hỗ trợ');
    expect(evidence.overflow.error).toContain('Giới hạn output');
    expect(evidence.stopped.status).toBe('stopped');
    expect(evidence.repeated.output).toContain('Xin chào Python!');
  });
});
