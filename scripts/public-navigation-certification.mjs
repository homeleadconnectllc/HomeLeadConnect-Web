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
const expectedMenuPaths = ['/', '/about', '/homeowners', '/professionals', '/partners', '/community', '/services', '/contact', '/accessibility', '/platform-disclosure', '/privacy', '/terms', '/login', '/register'];
const expectedLogoPath = '/hlc-logo-ui.png';
const report = { sha, routes, widths, cases: [], restrictions: 'Anonymous CI build only; external requests blocked; no form submission, credential entry, backend writes, or production navigation.' };

const browser = await chromium.launch();

const visible = async locator => {
  if (!await locator.count()) return false;
  return locator.evaluate(element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0 && box.width > 0 && box.height > 0;
  });
};

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === base || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort();
    });

    for (const path of routes) {
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const result = { path, width, errors: [] };
      report.cases.push(result);
      const check = fn => { try { fn(); } catch (error) { result.errors.push(error.message); } };

      try {
        const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        assert.ok(response?.ok(), `Route did not load: ${response?.status()}`);

        const header = page.locator('[data-hlc-public-navigation="true"]');
        await header.waitFor();

        const logo = header.locator('img[data-hlc-master-logo="true"]');
        assert.equal(await visible(logo), true, 'Approved logo is not physically visible');
        assert.equal(await logo.evaluate(element => new URL(element.src).pathname), expectedLogoPath, 'Visible navbar artwork is not the approved responsive derivative');

        const trigger = header.locator('button.hlc-public-menu-trigger');
        assert.equal(await visible(trigger), true, 'Logo menu trigger is not visible');
        assert.equal(await trigger.getAttribute('aria-controls'), 'hlc-public-menu', 'Menu trigger does not identify menu panel');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Menu trigger must start closed');

        const signIn = header.locator('a.hlc-board-login');
        const getStarted = header.locator('a.hlc-board-cta');
        assert.equal(await visible(signIn), true, 'Sign In must remain visible');
        assert.equal(await visible(getStarted), true, 'Get Started must remain visible');

        await trigger.click();
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true', 'Menu did not open from logo trigger');

        const menu = page.locator('#hlc-public-menu');
        assert.equal(await visible(menu), true, 'Menu panel is not visible after opening');

        const paths = await menu.locator('a').evaluateAll(elements => elements.map(element => new URL(element.href).pathname));
        for (const destination of expectedMenuPaths) check(() => assert.ok(paths.includes(destination), `Missing menu destination ${destination}`));

        const targets = await menu.locator('a').evaluateAll(elements => elements.map(element => {
          const box = element.getBoundingClientRect();
          return { label: element.textContent.trim(), width: box.width, height: box.height };
        }));
        check(() => assert.ok(targets.every(target => target.width > 0 && target.height >= 40), 'Menu links are not usable touch targets'));

        await trigger.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Escape did not close menu');
        assert.equal(await trigger.evaluate(element => document.activeElement === element), true, 'Focus did not return to logo menu trigger after Escape');

        await trigger.press('Enter');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true', 'Enter did not open menu');
        await trigger.press('Escape');

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        check(() => assert.equal(overflow, false, 'Public navigation causes horizontal overflow'));

        result.header = await header.evaluate(element => {
          const box = element.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        });

        if (result.errors.length) throw new Error(result.errors.join('; '));
      } catch (error) {
        if (!result.errors.includes(error.message)) result.errors.push(error.message);
        await page.screenshot({ path: `${directory}/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${width}-failure.png` }).catch(() => {});
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

report.passed = report.cases.filter(result => result.errors.length === 0).length;
report.failed = report.cases.length - report.passed;
writeFileSync(`${directory}/report.json`, JSON.stringify(report, null, 2));
console.log(`Navigation certification ${sha}: ${report.passed}/${report.cases.length} passed`);
for (const result of report.cases.filter(result => result.errors.length)) console.error(`${result.path} @ ${result.width}: ${result.errors.join('; ')}`);
if (report.failed) process.exitCode = 1;
