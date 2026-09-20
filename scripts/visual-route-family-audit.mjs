import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { routeFamilies } from './visual-route-inventory.mjs';

// Local presentation evidence only. Never substitutes for authenticated runtime proof.
const base = process.env.HLC_VISUAL_BASE_URL || 'http://127.0.0.1:4173';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('This audit requires an isolated local build.');
const output = path.resolve(process.env.HLC_VISUAL_OUTPUT || '../route-audit');
const inventory = {families: Object.entries(routeFamilies).map(([id, routes]) => ({id, routes}))};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.HLC_CHROME_PATH ? { executablePath: process.env.HLC_CHROME_PATH } : {}) });
const results = [];
const golden = new Set(['/', '/homeowners', '/login', '/homeowner-portal', '/contractor-portal', '/partner-portal', '/messages', '/workflow', '/activity', '/network/service-areas']);
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(10000);
    // Avoid production APIs, analytics, and remote writes during local presentation checks.
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    for (const family of inventory.families) {
      const ordered = [...family.routes].sort((a, b) => Number(golden.has(b)) - Number(golden.has(a)));
      for (const pattern of ordered) {
        const route = pattern === '*' ? '/visual-audit-not-found' : pattern.replace(/:[^/]+/g, '1');
        console.log(`Checking ${width} ${pattern}`);
        const errors = [];
        const onError = error => errors.push(error.message);
        page.on('pageerror', onError);
        await page.goto(base + route, { waitUntil: 'load' });
        await page.waitForFunction(() => document.body.innerText.trim().length > 30 && !/^Loading page/.test(document.body.innerText.trim()));
        await page.waitForTimeout(300);
        const metrics = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
          const visible = element => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0 && getComputedStyle(element).display !== 'none';
          return {
            pathname: location.pathname,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            heading: document.querySelector('h1')?.textContent?.trim() || null,
            nav: rect('.hlc-public-shared-nav'),
            logo: rect('.hlc-public-shared-nav [data-hlc-master-logo]'),
            missingImages: [...document.images].filter(image => visible(image) && image.complete && !image.naturalWidth).map(image => image.getAttribute('src')),
            errorOverlay: !!document.querySelector('vite-error-overlay'),
            crampedHeroHeading: [...document.querySelectorAll('.hlc-pathway-hero h1, .hlc-public-hero h1, .hlc-legal-hero h1')].some(element => {
              const style = getComputedStyle(element);
              return parseFloat(style.lineHeight) < parseFloat(style.fontSize);
            }),
          };
        });
        const failures = [];
        if (metrics.overflow) failures.push('horizontal-overflow');
        if (metrics.crampedHeroHeading) failures.push('cramped-hero-heading');
        if (metrics.errorOverlay || errors.length) failures.push('page-error');
        if (metrics.missingImages.length) failures.push('missing-images');
        if (metrics.nav && metrics.nav.height > 110) failures.push('oversized-header');
        if (metrics.logo && (metrics.logo.width > 90 || metrics.logo.height > 90 || metrics.logo.y < -1)) failures.push('logo-outside-header');
        const protectedRoute = family.id !== 'public';
        if (protectedRoute && metrics.pathname !== '/login') failures.push('unexpected-public-boundary');
        let menu = 'not-present';
        const trigger = page.locator('.hlc-public-menu-trigger');
        if (golden.has(pattern) && await trigger.count()) {
          await trigger.click();
          if (await trigger.getAttribute('aria-expanded') !== 'true') failures.push('menu-did-not-open');
          await page.keyboard.press('Escape');
          if (await trigger.getAttribute('aria-expanded') !== 'false') failures.push('menu-did-not-close');
          menu = 'open-and-escape-checked';
        }
        if (family.id === 'public' || golden.has(pattern) || failures.length) {
          await page.screenshot({ path: path.join(output, `${pattern.replace(/[^a-z0-9]/gi, '_')}-${width}.png`), fullPage: true });
        }
        results.push({ family: family.id, pattern, width, coverage: protectedRoute ? 'unauthenticated-boundary-only' : 'public-render', ...metrics, menu, errors, failures });
        page.off('pageerror', onError);
      }
    }
    // Catch stale mobile presentation after a real viewport resize.
    await page.goto(base + '/homeowners');
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await page.waitForTimeout(300);
    const resize = await page.locator('.hlc-public-shared-nav').boundingBox();
    if (!resize || resize.height > 110) throw new Error('Header failed resize check');
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
const failed = results.filter(result => result.failures.length);
console.log(JSON.stringify({ checks: results.length, failed: failed.map(({ pattern, width, failures }) => ({ pattern, width, failures })), coverage: 'Public renders plus unauthenticated boundaries; no authenticated content certification.' }, null, 2));
if (failed.length) process.exitCode = 1;
