import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");

test("public home stays outside the authenticated application bundle while retaining route context", () => {
  assert.match(main, /isPublicHome/);
  assert.match(main, /<BrowserRouter>/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.match(home, /react-router-dom/);
  assert.match(home, /to="\/pricing"/);
  assert.match(home, /loading="lazy"/);
  assert.doesNotMatch(footer, /hlc-logo-final\.png/);
});
