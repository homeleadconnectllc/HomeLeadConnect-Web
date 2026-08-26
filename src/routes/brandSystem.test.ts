import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { inflateSync } from "node:zlib";

const brandLock = readFileSync("src/styles/hlc-brand-lock.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8") + readFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const authShell = readFileSync("src/components/auth/AuthShell.tsx", "utf8");
const htmlEntry = readFileSync("index.html", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");
const transparentLogo = readFileSync("public/hlc-logo-transparent.png");

const canonicalLogoPath = "/hlc-logo-transparent.png";
const activeBrandSurfaces = [navbar, footer, authShell, htmlEntry, manifest, serviceWorker];
const forbiddenLegacyLogoReferences = [
  "/favicon.svg",
  "/hlc-icon.jpeg",
  "/hlc-trans-logo.jpeg",
  "/logo.png",
  "/hlc-logo-final.png",
];

function pngAlphaAt(buffer: Buffer, x: number, y: number) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert.ok(x >= 0 && x < width && y >= 0 && y < height);

  let offset = 8;
  const idat: Buffer[] = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const kind = buffer.toString("ascii", offset + 4, offset + 8);
    if (kind === "IDAT") idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (kind === "IEND") break;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const rowBytes = width * 4;
  const rowStart = y * (rowBytes + 1);
  assert.equal(raw[rowStart], 0, "canonical transparent logo must use unfiltered RGBA rows");
  return raw[rowStart + 1 + x * 4 + 3];
}

test("HLC canonical brand lock stays global before legacy and final release guards", () => {
  assert.match(mainEntry, /contrast-contract\.css";\s*import "\.\/styles\/responsive-page-contract\.css";\s*import "\.\/styles\/hlc-brand-lock\.css";\s*import "\.\/styles\/legacy-device-compat\.css";\s*import "\.\/styles\/final-release-guard\.css";/);
  assert.match(authenticatedEntry, /workspace-premium-v3\.css/);
  assert.match(brandLock, /--hlc-brand-navy: #0d1b3d/);
  assert.match(brandLock, /--hlc-brand-blue: #1e5bff/);
  assert.match(brandLock, /--hlc-brand-white: #ffffff/);
  assert.match(brandLock, /--hlc-brand-charcoal: #111827/);
  assert.match(brandLock, /font-family: "Poppins"/);
});

test("brand lock replaces green matching, agent, and success presentation with HLC blue-gray styling", () => {
  assert.match(brandLock, /\.hlc-match-availability\.is-available/);
  assert.match(brandLock, /\.hlc-match-swipe-stamp\.is-like/);
  assert.match(brandLock, /\.hlc-status-pill\[data-tone="success"\]/);
  assert.match(brandLock, /\.hlc-agent-dock\[data-agent="diamond"\]/);
  assert.match(brandLock, /\.hlc-agent-presence/);
  assert.match(brandLock, /\.hlc-route-content section\[aria-labelledby="hlc-audio-device-title"\]::before/);
  assert.doesNotMatch(brandLock, /#34d399|#10b981|#059669|#047857|#0f766e|#15803d|#166534|#dcfce7|#ecfdf5/i);
});

test("official HLC mark stays canonical across shared UI, browser, PWA, and notifications", () => {
  for (const surface of activeBrandSurfaces) {
    assert.match(surface, new RegExp(canonicalLogoPath.replaceAll(".", "\\.")));
  }

  assert.match(htmlEntry, /rel="icon"[^>]+type="image\/png"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(htmlEntry, /rel="apple-touch-icon"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"src"\s*:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"type"\s*:\s*"image\/png"/);
  assert.match(serviceWorker, /icon:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(serviceWorker, /badge:\s*"\/hlc-logo-transparent\.png"/);
});

test("canonical HLC logo asset is a 1024px RGBA PNG with a clean transparent outer band", () => {
  assert.deepEqual([...transparentLogo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(transparentLogo.readUInt32BE(16), 1024);
  assert.equal(transparentLogo.readUInt32BE(20), 1024);
  assert.equal(transparentLogo[24], 8);
  assert.equal(transparentLogo[25], 6);

  const center = 512;
  const edgeProbe = 18;
  for (const [x, y] of [
    [0, 0], [1023, 0], [0, 1023], [1023, 1023],
    [center, edgeProbe], [center, 1023 - edgeProbe],
    [edgeProbe, center], [1023 - edgeProbe, center],
  ]) {
    assert.equal(pngAlphaAt(transparentLogo, x, y), 0, `logo outer-band pixel ${x},${y} must be fully transparent`);
  }
  assert.equal(pngAlphaAt(transparentLogo, center, center), 255, "logo center must remain fully opaque");
});

test("active HLC brand surfaces reject legacy and placeholder logo references", () => {
  for (const surface of activeBrandSurfaces) {
    for (const legacyReference of forbiddenLegacyLogoReferences) {
      assert.doesNotMatch(surface, new RegExp(legacyReference.replaceAll(".", "\\.")));
    }
  }
});
