import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const sha = process.env.CANDIDATE_SHA;
assert.match(sha ?? '', /^[0-9a-f]{40}$/);
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sha);
const base = 'http://127.0.0.1:4173';
const directory = 'artifacts/public-navigation-certification';
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/candidate-sha.txt`, `${sha}\n`);
const routes = ['/', '/about', '/homeowners', '/contractors', '/professionals', '/partners', '/community', '/services', '/how-it-works', '/leadscope', '/pricing', '/trust', '/demo', '/contact', '/request-service', '/professional-application', '/privacy', '/terms', '/accessibility', '/platform-disclosure', '/login', '/register', '/forgot-password', '/reset-password', '/app', '/portal', '/memorial', '/kendrell-memorial', '/portal/accept', '/team/accept'];
const widths = [320, 390, 1440];
const expectedPaths = ['/about', '/homeowners', '/professionals', '/partners', '/community', '/services', '/login', '/register'];
const expectedLogoPath = '/brand/homelead-connect-master-transparent.png';
const report = { sha, routes, widths, cases: [], restrictions: 'Anonymous local build only; external requests blocked; no form submission, credential entry, backend writes, or production navigation.' };
const browser = await chromium.launch();

async function metrics(page) {
  return page.evaluate(() => {
    const header = document.querySelector('.hlc-public-site-nav, .hlc-board-nav');
    if (!header) return null;
    const visible = (element) => {
      if (!element) return false;
      const details = element.tagName === 'SUMMARY' ? null : element.closest('details');
      if (details && !details.open) return false;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0 && box.width > 0 && box.height > 0;
    };
    const brand = header.querySelector('.hlc-board-brand, .hlc-public-site-nav__brand, .hlc-auth-public-brand');
    const visibleBrandImage = [...header.querySelectorAll('img[data-hlc-master-logo]')].find(visible) ?? null;
    const summary = [...header.querySelectorAll('summary')].find(visible);
    const login = [...header.querySelectorAll('a')].find(a => a.textContent.trim() === 'Sign In' && visible(a));
    const cta = [...header.querySelectorAll('a')].find(a => a.textContent.includes('Get Started') && visible(a));
    const box = header.getBoundingClientRect();
    const properties = element => element ? { color: getComputedStyle(element).color, fill: getComputedStyle(element).webkitTextFillColor, background: getComputedStyle(element).backgroundColor, radius: getComputedStyle(element).borderRadius, font: getComputedStyle(element).fontSize } : null;
    return {
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      background: getComputedStyle(header).backgroundColor,
      brand: brand ? { text: brand.textContent?.trim() ?? '', width: brand.getBoundingClientRect().width, height: brand.getBoundingClientRect().height } : null,
      visibleBrandImage: visibleBrandImage ? { src: new URL(visibleBrandImage.src).pathname, width: visibleBrandImage.getBoundingClientRect().width, height: visibleBrandImage.getBoundingClientRect().height } : null,
      summary: properties(summary), login: properties(login), cta: properties(cta),
      overflow: document.documentElement.scrollWidth > innerWidth + 1
    };
  });
}

try {
  await Promise.all(widths.map(async (width) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === base || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort();
    });
    const authorityPage = await context.newPage();
    await authorityPage.goto(base, { waitUntil: 'networkidle' });
    await authorityPage.locator('.hlc-board-nav').waitFor();
    await authorityPage.evaluate(() => document.fonts.ready);
    const authority = await metrics(authorityPage);
    await authorityPage.close();
    for (const path of routes) {
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      const name = `${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${width}`;
      const result = { path, width, errors: [], authority };
      report.cases.push(result);
      try {
        const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        assert.ok(response?.ok(), `Route did not load: ${response?.status()}`);
        await page.locator('.hlc-public-site-nav, .hlc-board-nav').waitFor({ timeout: 10000 });
        await page.evaluate(() => document.fonts.ready);
        result.metrics = await metrics(page);
        await page.screenshot({ path: `${directory}/${name}-closed.png` });
        const check = (fn) => { try { fn(); } catch (error) { result.errors.push(error.message); } };
        const measured = result.metrics;
        check(() => assert.ok(Math.abs(measured.box.x - authority.box.x) <= 2, 'Header horizontal inset differs from Home'));
        check(() => assert.ok(Math.abs(measured.box.y - authority.box.y) <= 2, 'Header vertical inset differs from Home'));
        check(() => assert.ok(Math.abs(measured.box.width - authority.box.width) <= 2, 'Header width differs from Home'));
        check(() => assert.ok(Math.abs(measured.box.height - authority.box.height) <= 2, 'Header height differs from Home'));
        check(() => assert.equal(measured.background, authority.background, 'Header background differs from Home'));
        check(() => assert.equal(measured.brand?.text, 'HomeLead Connect', 'Brand label is missing or inconsistent'));
        check(() => assert.ok(measured.visibleBrandImage, 'Approved logo derivative is not physically visible'));
        check(() => assert.equal(measured.visibleBrandImage?.src, expectedLogoPath, 'Visible navbar artwork is not the approved responsive derivative'));
        check(() => assert.ok(measured.visibleBrandImage?.width >= 40 && measured.visibleBrandImage?.height >= 40, 'Approved logo is rendered too small to be visibly present'));
        const header = page.locator('.hlc-public-site-nav, .hlc-board-nav');
        const summary = header.locator('summary');
        if (width <= 680) {
          check(() => assert.ok(measured.summary, 'Mobile Menu is not visible'));
          check(() => assert.equal(measured.summary?.color, authority.summary?.color, 'Menu label color differs from Home'));
          check(() => assert.ok(measured.login, 'Mobile Sign In is not visible beside Menu'));
          check(() => assert.equal(measured.login?.color, authority.login?.color, 'Sign In color differs from Home'));
          check(() => assert.equal(measured.cta, null, 'Desktop Get Started must not crowd the mobile header'));
          if (await summary.count()) {
            await summary.click();
            assert.equal(await summary.evaluate(element => element.parentElement.open), true, 'Menu did not open on click');
            const menuState = await summary.evaluate(element => {
              const details = element.parentElement;
              const panel = details.querySelector('nav');
              if (!panel) return null;
              const style = getComputedStyle(panel);
              const box = panel.getBoundingClientRect();
              const links = [...panel.querySelectorAll('a')].map(link => {
                const linkStyle = getComputedStyle(link);
                const linkBox = link.getBoundingClientRect();
                return { label: link.textContent.trim(), path: new URL(link.href).pathname, box: linkBox.toJSON(), display: linkStyle.display, visibility: linkStyle.visibility };
              });
              return { panel: { display: style.display, visibility: style.visibility, opacity: style.opacity, width: box.width, height: box.height }, links };
            });
            assert.ok(menuState, 'Menu panel is missing after opening');
            assert.notEqual(menuState.panel.display, 'none', 'Menu panel is display:none after opening');
            assert.notEqual(menuState.panel.visibility, 'hidden', 'Menu panel is hidden after opening');
            assert.ok(menuState.panel.width > 0 && menuState.panel.height > 0, 'Menu panel has no rendered geometry after opening');
            result.menuLinks = menuState.links;
            for (const destination of expectedPaths) check(() => assert.ok(menuState.links.some(link => link.path === destination), `Missing menu destination ${destination}`));
            check(() => assert.ok(menuState.links.every(link => link.display !== 'none' && link.visibility !== 'hidden' && link.box.width > 0 && link.box.height >= 40), 'Menu links are not rendered usable touch targets'));
            const restingFocusBackground = await summary.evaluate(element => {
              const firstLink = element.parentElement.querySelector('nav a');
              return firstLink ? getComputedStyle(firstLink).backgroundColor : null;
            });
            await page.screenshot({ path: `${directory}/${name}-open.png` });
            await summary.click();
            assert.equal(await summary.evaluate(element => element.parentElement.open), false, 'Menu did not close on click');
            await summary.press('Enter');
            assert.equal(await summary.evaluate(element => element.parentElement.open), true, 'Enter did not open Menu');
            await summary.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'A', 'Tab did not reach a menu link');
            result.focus = await page.evaluate(() => {
              const style = getComputedStyle(document.activeElement);
              return { label: document.activeElement?.textContent.trim(), outline: style.outlineStyle, boxShadow: style.boxShadow, background: style.backgroundColor };
            });
            check(() => assert.ok(result.focus.outline !== 'none' || result.focus.boxShadow !== 'none' || result.focus.background !== restingFocusBackground, 'Focused menu link has no visible focus indicator'));
            await summary.focus();
            await summary.press('Space');
            assert.equal(await summary.evaluate(element => element.parentElement.open), false, 'Space did not close Menu');
          }
        } else {
          check(() => assert.ok(measured.cta, 'Desktop Get Started is missing'));
          check(() => assert.equal(measured.cta?.background, authority.cta?.background, 'Desktop CTA background differs from Home'));
          const links = await header.locator('a').evaluateAll(elements => elements.filter(element => element.getBoundingClientRect().width > 0).map(element => new URL(element.href).pathname));
          for (const destination of expectedPaths) check(() => assert.ok(links.includes(destination), `Missing desktop destination ${destination}`));
        }
        result.headerOverflow = await header.evaluate(element => element.scrollWidth > element.clientWidth + 1);
        check(() => assert.equal(result.headerOverflow, false, 'Header overflows horizontally'));
      } catch (error) {
        result.errors.push(error.message);
        await page.screenshot({ path: `${directory}/${name}-failure.png` }).catch(() => {});
      } finally {
        await page.close();
      }
    }
    await context.close();
  }));
} finally {
  await browser.close();
}
report.passed = report.cases.filter(result => result.errors.length === 0).length;
report.failed = report.cases.length - report.passed;
writeFileSync(`${directory}/report.json`, JSON.stringify(report, null, 2));
console.log(`Navigation certification ${sha}: ${report.passed}/${report.cases.length} passed`);
for (const result of report.cases.filter(result => result.errors.length)) console.error(`${result.path} @ ${result.width}: ${result.errors.join('; ')}`);
if (report.failed) process.exitCode = 1;
