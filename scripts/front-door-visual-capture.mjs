import fs from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.HLC_VISUAL_BASE_URL || "http://127.0.0.1:4173";
const candidateSha = process.env.CANDIDATE_SHA || process.env.GITHUB_SHA || "unknown";
const routes = [
  ["home", "/"],
  ["login", "/login"],
  ["about", "/about"],
  ["register", "/register"],
  ["forgot-password", "/forgot-password"],
  ["reset-password", "/reset-password"],
];
const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 900 }],
];

async function settle(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  await page.waitForTimeout(200);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const [routeName, routePath] of routes) {
      await settle(page, new URL(routePath, baseUrl).toString());
      await page.screenshot({ path: `/tmp/${routeName}-${viewportName}.png` });

      if (routeName === "home") {
        const footer = page.locator(".hlc-board-footer").last();
        await footer.waitFor({ state: "visible", timeout: 10_000 });
        await footer.scrollIntoViewIfNeeded();
        const box = await footer.boundingBox();
        if (!box || box.width < viewport.width * 0.9 || box.height < 100) {
          throw new Error(`Footer geometry invalid at ${viewportName}`);
        }
        await footer.screenshot({ path: `/tmp/home-footer-${viewportName}.png` });
      }
    }

    await context.close();
  }

  fs.writeFileSync("/tmp/candidate-sha.txt", `${candidateSha}\n`);
  console.log(`Front door visual capture complete for ${candidateSha}`);
} finally {
  await browser.close();
}
