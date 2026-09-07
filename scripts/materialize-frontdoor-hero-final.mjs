import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourceDir = path.join(root, "scripts", "frontdoor-assets");
const outputPath = path.join(root, "dist", "hlc-frontdoor-resident-hero-final.jpg");
const prefix = "hero-browser-safe.b64.part";
const expectedBytes = 40609;
const expectedSha256 = "cc1f6c789b6e0f749d05137dad0de94fc7fa7c6e9e8fe5e6117e9a7fca7201a8";

const parts = fs.readdirSync(sourceDir)
  .filter((name) => name.startsWith(prefix))
  .sort();

if (parts.length !== 7) {
  throw new Error(`Browser-safe hero source incomplete: expected 7 chunks, found ${parts.length}`);
}

const encoded = parts
  .map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8").trim())
  .join("");
const bytes = Buffer.from(encoded, "base64");

if (bytes.length !== expectedBytes) {
  throw new Error(`Browser-safe hero size mismatch: expected ${expectedBytes}, received ${bytes.length}`);
}
if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) {
  throw new Error("Browser-safe hero is not a valid JPEG container");
}
const actualSha256 = crypto.createHash("sha256").update(bytes).digest("hex");
if (actualSha256 !== expectedSha256) {
  throw new Error(`Browser-safe hero SHA-256 mismatch: expected ${expectedSha256}, received ${actualSha256}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, bytes);
console.log(`Materialized browser-safe hero ${outputPath} (${bytes.length} bytes, sha256 ${actualSha256})`);
