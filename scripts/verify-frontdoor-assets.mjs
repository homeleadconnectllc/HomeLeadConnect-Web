import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const FRONTDOOR_ASSETS = [
  {
    path: "four-pathways-residents-hq-20260915.jpg",
    expectedSize: 81169,
    expectedSha256: "8dae49e7a875aa12523f4fe7eaaff9fda49c3ff5438472e2e22e51d060d7e09b",
    kind: "jpeg",
  },
  {
    path: "four-pathways-professionals-hq-20260915.jpg",
    expectedVariants: [
      {
        size: 43570,
        sha256: "1622254895e6e9c598befdda73a6671c304ce016811a4d70db89eb6553a00415",
      },
      {
        size: 94971,
        sha256: "4df6446e022a42f720b7ff90da6af8148d17787bf13f5adf2eb71ea8aa82cd46",
      },
    ],
    kind: "jpeg",
  },
  {
    path: "four-pathways-partners-hq-20260915.jpg",
    expectedSize: 107268,
    expectedSha256: "bb1514ec33d6ac4091ad7d8cdc548b294bd14cf54e8ba787c3f127ba06683c1a",
    kind: "jpeg",
  },
  {
    path: "four-pathways-community-hq-20260915.jpg",
    expectedSize: 121797,
    expectedSha256: "75b1f369f5dea143dc6e53885cfd62884851e00e3ad6090c9ac50832bd6cea73",
    kind: "jpeg",
  },
];

function assertWebP(buffer, path) {
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (buffer.length < 12 || riff !== "RIFF" || webp !== "WEBP") {
    throw new Error(`${path} is not a valid WebP container`);
  }
}

function assertJpeg(buffer, path) {
  if (
    buffer.length < 4 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8 ||
    buffer[buffer.length - 2] !== 0xff ||
    buffer[buffer.length - 1] !== 0xd9
  ) {
    throw new Error(`${path} is not a valid JPEG container`);
  }
}

export function verifyFrontdoorAssets(root) {
  for (const asset of FRONTDOOR_ASSETS) {
    const fullPath = join(root, asset.path);
    const bytes = readFileSync(fullPath);

    if (asset.kind === "jpeg") assertJpeg(bytes, asset.path);
    else assertWebP(bytes, asset.path);

    const actualSha256 = createHash("sha256").update(bytes).digest("hex");

    if (asset.expectedVariants) {
      const matched = asset.expectedVariants.some(
        (variant) => variant.size === bytes.length && variant.sha256 === actualSha256,
      );
      if (!matched) {
        throw new Error(
          `${asset.path} did not match an approved variant: received ${bytes.length} bytes / ${actualSha256}`,
        );
      }
    } else {
      if (bytes.length !== asset.expectedSize) {
        throw new Error(`${asset.path} size mismatch: expected ${asset.expectedSize}, received ${bytes.length}`);
      }

      if (asset.expectedSha256 && actualSha256 !== asset.expectedSha256) {
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
