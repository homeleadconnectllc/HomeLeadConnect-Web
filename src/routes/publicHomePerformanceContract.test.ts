import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");

test("public home stays outside the authenticated application bundle while retaining route delivery", () => {
  assert.match(main, /isPublicHome/);
  assert.doesNotMatch(main, /BrowserRouter/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.doesNotMatch(home, /react-router-dom/);
  assert.doesNotMatch(footer, /react-router-dom/);
  assert.match(home, /href="\/pricing"/);
  assert.match(home, /data-route-to="\/request-service"/);
  assert.match(home, /data-route-to="\/app"/);
  assert.match(home, /data-route-to="\/community"/);
  assert.match(home, /loading="lazy"/);
  assert.doesNotMatch(footer, /hlc-logo-final\.png/);
});

test("public home renders without paying React startup cost", () => {
  assert.doesNotMatch(main, /^import .* from "react"/m);
  assert.doesNotMatch(main, /^import .* from "react-dom\/client"/m);
  assert.doesNotMatch(main, /^import HomePage /m);
  assert.match(main, /rootElement\.innerHTML = publicHomeMarkup\(\)/);
  assert.match(main, /import\("react"\)/);
  assert.match(main, /import\("react-dom\/client"\)/);
  assert.match(main, /data-route-to="\/request-service"/);
  assert.match(main, /data-route-to="\/app"/);
  assert.match(main, /data-route-to="\/community"/);
  assert.match(main, /aria-label="Legal and accessibility"/);
});
