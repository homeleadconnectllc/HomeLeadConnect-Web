import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "public/hlc-frontdoor-resident-hero.webp.b64";
const outputPath = "public/hlc-frontdoor-resident-hero.webp";
const expectedSize = 65350;
const expectedSha256 = "c5cd9576a96d360aeadfec507f321b542f827da1d524fa66d0792070dd1998bc";

const encoded = readFileSync(sourcePath, "utf8").replace(/\s+/g, "");
const bytes = Buffer.from(encoded, "base64");
const riff = bytes.subarray(0, 4).toString("ascii");
const webp = bytes.subarray(8, 12).toString("ascii");
const sha256 = createHash("sha256").update(bytes).digest("hex");

if (bytes.length !== expectedSize || riff !== "RIFF" || webp !== "WEBP" || sha256 !== expectedSha256) {
  throw new Error(`Front-door hero source integrity failure: size=${bytes.length} sha256=${sha256}`);
}

writeFileSync(outputPath, bytes);
console.log(`Materialized front-door hero: ${outputPath} (${bytes.length} bytes)`);
