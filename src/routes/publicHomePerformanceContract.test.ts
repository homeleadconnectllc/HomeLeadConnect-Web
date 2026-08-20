import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");

test("public home stays outside the authenticated router bundle", () => {
  assert.doesNotMatch(main, /BrowserRouter/);
  assert.doesNotMatch(home, /react-router-dom/);
  assert.doesNotMatch(footer, /react-router-dom/);
  assert.match(home, /href="\/pricing"/);
  assert.match(footer, /href="\/privacy"/);
});
