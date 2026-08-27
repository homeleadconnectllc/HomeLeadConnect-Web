import { readFileSync, writeFileSync } from "node:fs";

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

writeFileSync(indexPath, updated);
console.log(`Rewired built browser icon metadata to ${derivative}; source branding contract and manifest remain canonical.`);
