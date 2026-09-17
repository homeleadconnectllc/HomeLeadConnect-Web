import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.VERIFICATION_BASE ?? 'http://127.0.0.1:4173';
const output = 'artifacts/mobile-public-menu-repair';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const paths = ['/about', '/homeowners', '/professionals', '/partners', '/community', '/services', '/login', '/register'];
const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
const luminance = value => rgb(value).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);

try {
  for (const width of [320, 390, 768, 1050, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    // Never send credentials, submit forms, or connect this check to a backend.
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    for (const path of ['/', '/login', '/register', '/about']) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      const header = page.locator('.hlc-public-shared-nav');
      await header.waitFor();
      assert.equal(errors.length, 0, errors.join('\n'));
      assert.equal(await page.locator('vite-error-overlay').count(), 0);
      const trigger = header.locator('summary');
      if (width <= 1050) {
        await trigger.click();
        const state = await trigger.evaluate(summary => {
          const details = summary.parentElement;
          const panel = details.querySelector('nav');
          const style = getComputedStyle;
          const box = panel.getBoundingClientRect();
          return {
            open: details.open,
            wrapperBorder: style(details).borderTopWidth,
            triggerBorder: style(summary).borderTopWidth,
            triggerShadow: style(summary).boxShadow,
            background: style(panel).backgroundColor,
            x: box.x, right: box.right,
            links: [...panel.querySelectorAll('a')].map(link => ({
              path: new URL(link.href).pathname,
              height: link.getBoundingClientRect().height,
              background: style(link).backgroundColor,
              color: style(link).color,
              labelColor: style(link.querySelector('span')).color,
              labelFill: style(link.querySelector('span')).webkitTextFillColor,
              iconColor: style(link.querySelector('svg')).color,
            })),
          };
        });
        assert.equal(state.open, true);
        assert.equal(state.wrapperBorder, '0px');
        assert.equal(state.triggerBorder, '0px');
        assert.equal(state.triggerShadow, 'none');
        assert.ok(state.x >= 0 && state.right <= width, `${path}: dropdown exceeds viewport`);
        assert.deepEqual(state.links.map(link => link.path), paths);
        for (const link of state.links) {
          const background = link.background === 'rgba(0, 0, 0, 0)' ? state.background : link.background;
          assert.ok(link.height >= 43, `${link.path}: touch target too small`);
          assert.equal(link.labelColor, link.color, `${link.path}: label has a page-level color override`);
          assert.equal(link.labelFill, link.color, `${link.path}: Safari text fill differs`);
          assert.equal(link.iconColor, link.color, `${link.path}: icon has a page-level color override`);
          assert.ok(contrast(link.labelColor, background) >= 4.5, `${link.path}: unreadable text contrast`);
        }
        await page.screenshot({ path: `${output}/${path === '/' ? 'home' : path.slice(1)}-${width}.png` });
        await trigger.click();
        assert.equal(await trigger.evaluate(element => element.parentElement.open), false);
        await trigger.press('Enter');
        assert.equal(await trigger.evaluate(element => element.parentElement.open), true);
        await trigger.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'A');
      } else {
        assert.equal(await trigger.isVisible(), false);
        assert.equal(await header.locator('.hlc-board-links').isVisible(), true);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path}: horizontal overflow`);
      console.log(`PASS ${path} @ ${width}`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
