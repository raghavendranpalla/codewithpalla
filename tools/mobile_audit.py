"""Render each page at phone width, detect horizontal overflow, screenshot."""
import asyncio, os
from playwright.async_api import async_playwright

ROOT = r'C:\Users\palrag\Documents\PallasTech'
OUT = r'C:\Users\palrag\AppData\Local\Temp\mobshots'
os.makedirs(OUT, exist_ok=True)
PAGES = ['index', 'courses', 'curriculum', 'about', 'contact', '404']

OVERFLOW_JS = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > vw + 1) {
      out.push({tag: el.tagName.toLowerCase(),
                cls: (el.getAttribute('class') || '').slice(0, 45),
                right: Math.round(r.right), w: Math.round(r.width)});
    }
  }
  return {vw, sw: document.documentElement.scrollWidth, count: out.length, items: out.slice(0, 12)};
}
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        page = await ctx.new_page()
        for name in PAGES:
            url = 'file:///' + os.path.join(ROOT, name + '.html').replace('\\', '/')
            await page.goto(url, wait_until='load')
            await page.wait_for_timeout(900)
            res = await page.evaluate(OVERFLOW_JS)
            flag = 'OK' if res['count'] == 0 and res['sw'] <= res['vw'] + 1 else '*** OVERFLOW ***'
            print(f"[{name:11}] vw={res['vw']} scrollWidth={res['sw']} overflowElems={res['count']}  {flag}")
            for it in res['items']:
                print(f"      -> {it['tag']}.{it['cls']}  right={it['right']} w={it['w']}")
            await page.screenshot(path=os.path.join(OUT, name + '.png'), full_page=(name != 'curriculum'))
        # curriculum: viewport-only (hero+tabs) + selenium tab
        url = 'file:///' + os.path.join(ROOT, 'curriculum.html').replace('\\', '/')
        await page.goto(url, wait_until='load'); await page.wait_for_timeout(700)
        await page.screenshot(path=os.path.join(OUT, 'curriculum.png'))
        await page.click('button.track-tab[data-track="selenium"]'); await page.wait_for_timeout(300)
        await page.screenshot(path=os.path.join(OUT, 'curriculum-selenium.png'))
        await b.close()
    print('SHOTS_DIR', OUT)

asyncio.run(main())
