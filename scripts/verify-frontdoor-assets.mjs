import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const FRONTDOOR_ASSETS = [
  {
    path: "hlc-frontdoor-resident-hero.webp",
    expectedSize: 11312,
  },
  {
    path: "hlc-frontdoor-people-first.webp",
    expectedSize: 17976,
    expectedSha256: "39ba92e934428d7ae0c74a70847e5da3ca27226185da9efa1792ce6471f23df8",
    sourceAuthoritySha256: "623201a40a0e33daa3243eb3d0a906ade445df79abb4f83f833b35b02167fa7f",
  },
  {
    path: "hlc-frontdoor-professional.webp",
    expectedSize: 19772,
    expectedSha256: "d6fb656f3285e581fc3f049d65477496bc5b41d4d31f381d916acb4e678803db",
    sourceAuthoritySha256: "04f1f1381906017bb74867bf28e27b1678801226653900e1c9f5a56eb030642d",
  },
];

function assertWebP(buffer, path) {
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (buffer.length < 12 || riff !== "RIFF" || webp !== "WEBP") {
    throw new Error(`${path} is not a valid WebP container`);
  }
}

export function verifyFrontdoorAssets(root) {
  for (const asset of FRONTDOOR_ASSETS) {
    const fullPath = join(root, asset.path);
    const bytes = readFileSync(fullPath);
    assertWebP(bytes, asset.path);

    if (bytes.length !== asset.expectedSize) {
      throw new Error(`${asset.path} size mismatch: expected ${asset.expectedSize}, received ${bytes.length}`);
    }

    if (asset.expectedSha256) {
      const actualSha256 = createHash("sha256").update(bytes).digest("hex");
      if (actualSha256 !== asset.expectedSha256) {
        throw new Error(`${asset.path} SHA-256 mismatch: expected ${asset.expectedSha256}, received ${actualSha256}`);
      }
    }

    console.log(`Verified front-door asset ${fullPath}`);
  }
}

if (process.argv[1]?.endsWith("verify-frontdoor-assets.mjs")) {
  const root = process.argv[2] || "dist";
  verifyFrontdoorAssets(root);
}
