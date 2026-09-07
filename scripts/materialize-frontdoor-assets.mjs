import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const outDir = path.join(root, "dist");
const sourceDir = path.join(root, "scripts", "frontdoor-assets");

const assets = [
  {
    key: "hero",
    output: "hlc-frontdoor-resident-hero.jpg",
    bytes: 175673,
    sha256: "163b0ebb60633c796173293db9068ca263295142700bb757b55fca7d8bc3229b",
  },
  {
    key: "people-first",
    output: "hlc-frontdoor-people-first.jpg",
    bytes: 148258,
    sha256: "623201a40a0e33daa3243eb3d0a906ade445df79abb4f83f833b35b02167fa7f",
  },
  {
    key: "professional",
    output: "hlc-frontdoor-professional.jpg",
    bytes: 152709,
    sha256: "04f1f1381906017bb74867bf28e27b1678801226653900e1c9f5a56eb030642d",
  },
];

function materialize(asset) {
  const prefix = `${asset.key}.b64.part`;
  const parts = fs.readdirSync(sourceDir)
    .filter((name) => name.startsWith(prefix))
    .sort();
  if (!parts.length) throw new Error(`Missing source chunks for ${asset.key}`);

  const encoded = parts.map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8").trim()).join("");
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length !== asset.bytes) {
    throw new Error(`${asset.key}: expected ${asset.bytes} bytes, got ${bytes.length}`);
  }
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9)) {
    throw new Error(`${asset.key}: invalid JPEG signature`);
  }
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  if (digest !== asset.sha256) {
    throw new Error(`${asset.key}: sha256 mismatch ${digest}`);
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, asset.output), bytes);
  console.log(`materialized ${asset.output} (${bytes.length} bytes, sha256 ${digest})`);
}

for (const asset of assets) materialize(asset);
