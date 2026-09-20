#!/usr/bin/env python3
"""Optional Playwright smoke of standalone UI prototype. No network/server needed.

Install: python -m pip install playwright; python -m playwright install chromium
Optional: CHROMIUM_PATH points to a system Chromium binary. Screenshots saved in ui-prototype.
"""
import os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1] / 'ui-prototype'
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
js=(root/'app.js').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="styles.css">', '<style>'+css+'</style>')
html=html.replace('<script src="app.js" defer></script>', '')
html=html.replace('</body>', '<script>'+js+'</script></body>')
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=(os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None),args=(['--no-sandbox','--disable-dev-shm-usage'] if os.name != 'nt' else []))
        for width, height in [(1280,850),(768,1000),(390,844),(360,780)]:
            page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,accept_downloads=True)
            errors=[]
            page.on('pageerror',lambda exc:errors.append(str(exc)))
            page.set_content(html,wait_until='domcontentloaded')
            page.locator('#admin-title').wait_for()
            overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
            assert not overflow, f'Horizontal overflow at {width}px'
            if width==1280:
                page.screenshot(path=str(root/'admin-desktop.png'),full_page=True)
            if width==390:
                page.locator('.mobile-navigation [data-view="learner"]').click()
                page.screenshot(path=str(root/'learner-mobile.png'),full_page=True)
            else:
                nav='.mobile-navigation [data-view="learner"]' if width<=1024 else '.sidebar [data-view="learner"]'
                page.locator(nav).click()
            page.locator('#learner-title').wait_for()
            page.locator('input[name="quiz"][value="print"]').check()
            page.locator('button#check-quiz').click()
            assert 'Chính xác' in page.locator('#quiz-feedback').inner_text(), 'Quiz not functional'
            page.locator('#runtime').select_option('web')
            page.locator('#run-code').click()
            frame=page.frame_locator('#web-preview')
            frame.locator('#title').wait_for(timeout=5000)
            assert frame.locator('#title').inner_text() == 'Xin chào!', 'Web HTML preview broken'
            frame.locator('#change').click()
            assert frame.locator('#title').inner_text() == 'Đã thay đổi!', 'Web JS preview broken'
            assert '2/3' in page.locator('#progress-count').inner_text(), 'Progress state not updated'
            page.locator('#runtime').select_option('python')
            page.locator('#run-code').click()
            assert 'Chưa có Pyodide' in page.locator('#python-preview').inner_text(), 'Python should not fabricate output'
            assert not errors, f'JS errors at {width}px: {errors}'
            print(f'PASS UI {width}px: no overflow; nav, quiz, HTML/CSS/JS preview, progress, honest Python state')
            page.close()
        page=browser.new_page(viewport={'width':1280,'height':850},accept_downloads=True)
        page.set_content(html,wait_until='domcontentloaded')
        page.locator('#admin-tab-author').click()
        page.locator('#content-type').select_option('interactive')
        page.locator('#author-preview').click()
        assert 'interactive' in page.locator('#author-config').inner_text()
        page.locator('#admin-tab-publish').click()
        with page.expect_download() as download_info:
            page.locator('#download-manifest').click()
        d=download_info.value
        assert d.suggested_filename == 'demo-publishing-manifest.json'
        print('PASS Admin authoring type UI + publication manifest demo download')
        browser.close()
finally:
    print('Browser UI smoke completed without external network/server')
