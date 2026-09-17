import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import test from "node:test";
import { publicPageImagery } from "../config/publicPageImagery.ts";

const projectRoot = process.cwd();
const pageSources = readdirSync(join(projectRoot, "src/pages"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx") && entry.name !== "HomePage.tsx")
  .map((entry) => join(entry.parentPath, entry.name));
const nonHomeVisualAuthorities = [
  "src/styles/hlc-route-visual-banners.css",
  "src/styles/premium-portal-family-rollout-20260911.css",
  "src/styles/public-auth-visual-closure-20260912.css",
  "src/styles/version-a-portal-imagery-authority-20260904.css",
];

test("account access uses the shared public header and canonical public/app destinations", () => {
  const source = readFileSync(join(projectRoot, "src/components/auth/AuthShell.tsx"), "utf8");
  assert.match(source, /<PublicSiteNav\s*\/>/);
  assert.doesNotMatch(source, /<nav className="hlc-auth-public-nav"/);
  for (const path of ["/homeowners", "/professionals", "/partners", "/services", "/about", "/contact"]) {
    assert.ok(source.includes(`publicUrl("${path}")`), `Missing canonical public destination ${path}`);
  }
  assert.ok(source.includes('appUrl("/request-service")'), "Missing canonical app request-service destination");
  assert.doesNotMatch(source, /https:\/\/(residents|professionals|partners|platform|about|contact)\.homeleadconnect\.org\//);
});

test("every registered page photograph has a unique file, hash, and descriptive Black-centered alt", () => {
  const entries = Object.entries(publicPageImagery);
  const sources = entries.map(([, image]) => image.src);
  assert.equal(new Set(sources).size, sources.length, "A photograph is assigned to more than one page key");

  const hashes = entries.map(([key, image]) => {
    assert.match(image.src, /^\/page-[a-z0-9-]+-20260916\.webp$/, `${key} does not use the sprint asset naming contract`);
    assert.match(image.alt, /Black/, `${key} does not describe the Black people shown in the image`);
    const path = join(projectRoot, "public", basename(image.src));
    assert.ok(existsSync(path), `Missing page photograph: ${image.src}`);
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  });

  assert.equal(new Set(hashes).size, hashes.length, "Two page photographs have identical file content");
});

test("interior page components never reuse Four Pathways photography", () => {
  const sources = [...pageSources, ...nonHomeVisualAuthorities.map((path) => join(projectRoot, path))];
  const offenders = sources.filter((path) => readFileSync(path, "utf8").includes("four-pathways-"));
  assert.deepEqual(offenders, [], `Four Pathways photography leaked into interior pages: ${offenders.join(", ")}`);
});
