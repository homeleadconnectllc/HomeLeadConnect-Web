import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { inflateSync } from "node:zlib";

const brandLock = readFileSync("src/styles/hlc-brand-lock.css", "utf8");
const logoGeometry = readFileSync("src/styles/global-logo-geometry.css", "utf8");
const appEntry = readFileSync("src/App.tsx", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8") + readFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const authShell = readFileSync("src/components/auth/AuthShell.tsx", "utf8");
const publicSiteNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const htmlEntry = readFileSync("index.html", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");
const transparentLogo = readFileSync("public/hlc-logo-transparent.png");

const canonicalLogoPath = "/hlc-logo-transparent.png";
const canonicalPublicMasterPath = "/brand/homelead-connect-master-transparent.png";
const browserBrandSurfaces = [navbar, htmlEntry, manifest, serviceWorker];
const forbiddenLegacyLogoReferences = [
  "/favicon.svg",
  "/hlc-icon.jpeg",
  "/hlc-trans-logo.jpeg",
  "/logo.png",
  "/hlc-logo-final.png",
];

function paethPredictor(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

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
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  let rawOffset = 0;
  let previous = Buffer.alloc(rowBytes);

  for (let row = 0; row < height; row += 1) {
    const filter = raw[rawOffset++];
    const current = Buffer.alloc(rowBytes);
    for (let i = 0; i < rowBytes; i += 1) {
      const encoded = raw[rawOffset++];
      const left = i >= bytesPerPixel ? current[i - bytesPerPixel] : 0;
      const up = previous[i];
      const upLeft = i >= bytesPerPixel ? previous[i - bytesPerPixel] : 0;
      if (filter === 0) current[i] = encoded;
      else if (filter === 1) current[i] = (encoded + left) & 0xff;
      else if (filter === 2) current[i] = (encoded + up) & 0xff;
      else if (filter === 3) current[i] = (encoded + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) current[i] = (encoded + paethPredictor(left, up, upLeft)) & 0xff;
      else assert.fail(`unsupported PNG filter type ${filter}`);
    }
    if (row === y) return current[x * bytesPerPixel + 3];
    previous = current;
  }

  assert.fail("requested PNG row was not decoded");
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
  for (const surface of browserBrandSurfaces) {
    assert.match(surface, new RegExp(canonicalLogoPath.replaceAll(".", "\\.")));
  }
  assert.match(footer, new RegExp(canonicalPublicMasterPath.replaceAll(".", "\\.")));

  assert.match(htmlEntry, /rel="icon"[^>]+type="image\/png"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(htmlEntry, /rel="apple-touch-icon"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"src"\s*:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"type"\s*:\s*"image\/png"/);
  assert.match(serviceWorker, /icon:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(serviceWorker, /badge:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(authShell, /<PublicSiteNav\s*\/>/);
  assert.match(publicSiteNav, /src="\/brand\/homelead-connect-master-transparent\.png"/);
});

test("canonical HLC logo asset is the locked 1254px RGBA master derivative with transparent outer corners", () => {
  assert.deepEqual([...transparentLogo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(transparentLogo.readUInt32BE(16), 1254);
  assert.equal(transparentLogo.readUInt32BE(20), 1254);
  assert.equal(transparentLogo[24], 8);
  assert.equal(transparentLogo[25], 6);

  const last = 1253;
  const center = 627;
  for (const [x, y] of [
    [0, 0], [last, 0], [0, last], [last, last],
  ]) {
    assert.equal(pngAlphaAt(transparentLogo, x, y), 0, `logo outer-corner pixel ${x},${y} must be fully transparent`);
  }
  assert.equal(pngAlphaAt(transparentLogo, center, center), 255, "logo center must remain fully opaque");
});

test("shared logo presentation removes white outer corners without altering the canonical asset", () => {
  assert.match(appEntry, /global-logo-geometry\.css/);
  assert.match(logoGeometry, /\.hlc-navbar-logo[\s\S]*background:\s*transparent\s*!important/);
  assert.match(logoGeometry, /\.hlc-auth-logo-link img[\s\S]*padding:\s*0\s*!important/);
  assert.match(logoGeometry, /\.hlc-public-footer-mark[\s\S]*border-radius:\s*50%\s*!important/);
  assert.match(logoGeometry, /clip-path:\s*circle\(50% at 50% 50%\)/);
  assert.doesNotMatch(logoGeometry, /background:\s*#fff(?:fff)?/i);
});

test("active HLC brand surfaces reject legacy and placeholder logo references", () => {
  for (const surface of [...browserBrandSurfaces, footer]) {
    for (const legacyReference of forbiddenLegacyLogoReferences) {
      assert.doesNotMatch(surface, new RegExp(legacyReference.replaceAll(".", "\\.")));
    }
  }
});
