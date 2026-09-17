import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import test from "node:test";

const brandLock = readFileSync("src/styles/hlc-brand-lock.css", "utf8");
const appEntry = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const logoGeometry = readFileSync("src/styles/global-logo-geometry.css", "utf8");
const authShell = readFileSync("src/components/auth/AuthShell.tsx", "utf8");
const publicSiteNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const htmlEntry = readFileSync("index.html", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");
const transparentLogo = readFileSync("public/hlc-logo-transparent.png");
const canonicalLogoPath = "/hlc-logo-transparent.png";
const approvedMasterLogoPath = "/brand/homelead-connect-master-transparent.png";
const browserBrandSurfaces = [htmlEntry, manifest, serviceWorker];

function pngAlphaAt(buffer: Buffer, x: number, y: number) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;
  const idat: Buffer[] = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (type === "IHDR") {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9];
    }
    if (type === "IDAT") idat.push(buffer.subarray(dataStart, dataEnd));
    if (type === "IEND") break;
    offset = dataEnd + 4;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6);
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = inflateSync(Buffer.concat(idat));
  const rows = Array.from({ length: height }, () => Buffer.alloc(stride));
  let cursor = 0;
  for (let row = 0; row < height; row++) {
    const filter = raw[cursor++];
    const scan = raw.subarray(cursor, cursor + stride);
    cursor += stride;
    const out = rows[row];
    const prev = row > 0 ? rows[row - 1] : null;
    for (let col = 0; col < stride; col++) {
      const left = col >= bytesPerPixel ? out[col - bytesPerPixel] : 0;
      const up = prev ? prev[col] : 0;
      const upLeft = prev && col >= bytesPerPixel ? prev[col - bytesPerPixel] : 0;
      if (filter === 0) out[col] = scan[col];
      else if (filter === 1) out[col] = (scan[col] + left) & 255;
      else if (filter === 2) out[col] = (scan[col] + up) & 255;
      else if (filter === 3) out[col] = (scan[col] + Math.floor((left + up) / 2)) & 255;
      else {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        out[col] = (scan[col] + pr) & 255;
      }
    }
  }
  return rows[y][x * 4 + 3];
}

test("HLC canonical brand lock stays global before legacy and final release guards", () => {
  const brandIndex = appEntry.indexOf("hlc-brand-lock.css");
  const legacyIndex = appEntry.indexOf("legacy-device-compat.css");
  const finalIndex = appEntry.indexOf("final-release-guard.css");
  assert.ok(brandIndex >= 0);
  assert.ok(legacyIndex > brandIndex);
  assert.ok(finalIndex > legacyIndex);
  assert.match(brandLock, /--hlc-blue:/);
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

test("official HLC mark stays canonical for browser/PWA and approved master artwork owns navigation", () => {
  for (const surface of browserBrandSurfaces) {
    assert.match(surface, new RegExp(canonicalLogoPath.replaceAll(".", "\\.")));
  }

  assert.match(htmlEntry, /rel="icon"[^>]+type="image\/png"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(htmlEntry, /rel="apple-touch-icon"[^>]+href="\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"src"\s*:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"type"\s*:\s*"image\/png"/);
  assert.match(serviceWorker, /icon:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(serviceWorker, /badge:\s*"\/hlc-logo-transparent\.png"/);
  assert.match(authShell, /<PublicSiteNav\s*\/>/);
  assert.match(publicSiteNav, /data-hlc-master-logo="true"/);
  assert.match(publicSiteNav, new RegExp(approvedMasterLogoPath.replaceAll(".", "\\.")));
  assert.match(publicSiteNav, /hlc-brand-accessible-label">HomeLead Connect<\/span>/);
  assert.match(footer, /<strong>HomeLead Connect<\/strong>/);
  assert.doesNotMatch(publicSiteNav, /homelead-connect-transparent-v2\.svg/);
  assert.doesNotMatch(footer, /homelead-connect-transparent-v2\.svg/);
});

test("canonical HLC logo asset is the locked 1254px RGBA master derivative with transparent outer corners", () => {
  assert.deepEqual([...transparentLogo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(transparentLogo.readUInt32BE(16), 1254);
  assert.equal(transparentLogo.readUInt32BE(20), 1254);
  assert.equal(transparentLogo[24], 8);
  assert.equal(transparentLogo[25], 6);

  const last = 1253;
  const center = 627;
  for (const [x, y] of [[0, 0], [last, 0], [0, last], [last, last]]) {
    assert.equal(pngAlphaAt(transparentLogo, x, y), 0, `logo outer-corner pixel ${x},${y} must be fully transparent`);
  }
  assert.equal(pngAlphaAt(transparentLogo, center, center), 255, "logo center must remain fully opaque");
});

test("shared logo presentation removes white outer corners without altering the canonical asset", () => {
  assert.match(appEntry, /global-logo-geometry\.css/);
  assert.match(logoGeometry, /\.hlc-navbar-logo[\s\S]*background:\s*transparent\s*!important/);
});