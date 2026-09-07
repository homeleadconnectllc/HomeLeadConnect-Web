import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const indexPath = process.argv[2] || "dist/index.html";
const canonical = "/hlc-logo-transparent.png";
const derivative = "/hlc-logo-ui.png";

const source = readFileSync(indexPath, "utf8");
let updated = source;
updated = updated.replace(
  `<link rel="icon" type="image/png" href="${canonical}" />`,
  `<link rel="icon" type="image/png" href="${derivative}" />`,
);
updated = updated.replace(
  `<link rel="apple-touch-icon" href="${canonical}" />`,
  `<link rel="apple-touch-icon" href="${derivative}" />`,
);

if (updated === source) {
  throw new Error("Built browser icon metadata was not found for derivative rewiring");
}
if (!updated.includes(`rel="manifest" href="/manifest.webmanifest"`)) {
  throw new Error("Built manifest link is missing");
}

const manifestPath = join(dirname(indexPath), "manifest.webmanifest");
const manifestSource = readFileSync(manifestPath, "utf8");
const manifest = JSON.parse(manifestSource);
if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  throw new Error("Built manifest icons are missing");
}
let manifestRewired = false;
for (const icon of manifest.icons) {
  if (icon?.src === canonical) {
    icon.src = derivative;
    icon.sizes = "180x180";
    icon.type = "image/png";
    manifestRewired = true;
  }
}
if (!manifestRewired) {
  throw new Error("Built manifest canonical icon metadata was not found for derivative rewiring");
}

writeFileSync(indexPath, updated);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Rewired built browser and manifest icon metadata to ${derivative}; source branding contract remains canonical.`);
