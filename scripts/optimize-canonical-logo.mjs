import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync, constants as zlibConstants } from "node:zlib";

const target = process.argv[2] || "dist/hlc-logo-transparent.png";
const derivativeTarget = process.argv[3] || "dist/hlc-logo-ui.png";
const derivativeSize = Number(process.argv[4] || 96);
const input = readFileSync(target);
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (!input.subarray(0, 8).equals(signature)) throw new Error(`${target} is not a PNG`);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const out = Buffer.allocUnsafe(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function filterPixels(pixels, width, height) {
  const bpp = 4;
  const rowBytes = width * bpp;
  const filtered = Buffer.allocUnsafe(height * (rowBytes + 1));

  function filteredRow(row, prev, filter) {
    const out = Buffer.allocUnsafe(rowBytes);
    let score = 0;
    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= bpp ? row[x - bpp] : 0;
      const up = prev ? prev[x] : 0;
      const upLeft = prev && x >= bpp ? prev[x - bpp] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) predictor = paeth(left, up, upLeft);
      const encoded = (row[x] - predictor + 256) & 255;
      out[x] = encoded;
      const signed = encoded < 128 ? encoded : encoded - 256;
      score += Math.abs(signed);
    }
    return { out, score };
  }

  for (let y = 0; y < height; y += 1) {
    const row = pixels.subarray(y * rowBytes, (y + 1) * rowBytes);
    const prev = y ? pixels.subarray((y - 1) * rowBytes, y * rowBytes) : null;
    let bestFilter = 0;
    let best = filteredRow(row, prev, 0);
    for (let filter = 1; filter <= 4; filter += 1) {
      const candidate = filteredRow(row, prev, filter);
      if (candidate.score < best.score) {
        best = candidate;
        bestFilter = filter;
      }
    }
    const start = y * (rowBytes + 1);
    filtered[start] = bestFilter;
    best.out.copy(filtered, start + 1);
  }
  return filtered;
}

function encodeRgbaPng(pixels, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const compressed = deflateSync(filterPixels(pixels, width, height), {
    level: 9,
    strategy: zlibConstants.Z_FILTERED,
  });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const ancillaryChunks = [];
const idat = [];
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
let interlace = 0;
let offset = 8;
while (offset < input.length) {
  const length = input.readUInt32BE(offset);
  const type = input.toString("ascii", offset + 4, offset + 8);
  const data = input.subarray(offset + 8, offset + 8 + length);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    interlace = data[12];
  }
  if (type === "IDAT") idat.push(data);
  else if (!["IHDR", "IEND"].includes(type)) ancillaryChunks.push({ type, data: Buffer.from(data) });
  offset += 12 + length;
  if (type === "IEND") break;
}

if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
  throw new Error(`Expected non-interlaced 8-bit RGBA PNG, got bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}`);
}

const bpp = 4;
const rowBytes = width * bpp;
const inflated = inflateSync(Buffer.concat(idat));
const expectedBytes = height * (rowBytes + 1);
if (inflated.length !== expectedBytes) throw new Error(`Unexpected inflated size ${inflated.length}; expected ${expectedBytes}`);

const pixels = Buffer.allocUnsafe(height * rowBytes);
let previous = Buffer.alloc(rowBytes);
for (let y = 0; y < height; y += 1) {
  const sourceStart = y * (rowBytes + 1);
  const filter = inflated[sourceStart];
  const source = inflated.subarray(sourceStart + 1, sourceStart + 1 + rowBytes);
  const row = pixels.subarray(y * rowBytes, (y + 1) * rowBytes);
  for (let x = 0; x < rowBytes; x += 1) {
    const raw = source[x];
    const left = x >= bpp ? row[x - bpp] : 0;
    const up = previous[x];
    const upLeft = x >= bpp ? previous[x - bpp] : 0;
    let value;
    if (filter === 0) value = raw;
    else if (filter === 1) value = (raw + left) & 255;
    else if (filter === 2) value = (raw + up) & 255;
    else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 255;
    else if (filter === 4) value = (raw + paeth(left, up, upLeft)) & 255;
    else throw new Error(`Unsupported PNG filter ${filter}`);
    row[x] = value;
  }
  previous = row;
}

const optimizedCore = encodeRgbaPng(pixels, width, height);
let optimized = optimizedCore;
if (ancillaryChunks.length) {
  const ihdrEnd = 33;
  optimized = Buffer.concat([
    optimizedCore.subarray(0, ihdrEnd),
    ...ancillaryChunks.map(({ type, data }) => chunk(type, data)),
    optimizedCore.subarray(ihdrEnd),
  ]);
}
if (optimized.length < input.length) {
  writeFileSync(target, optimized);
  const saved = input.length - optimized.length;
  const percent = ((saved / input.length) * 100).toFixed(1);
  console.log(`Optimized canonical logo losslessly: ${input.length} -> ${optimized.length} bytes (${percent}% smaller)`);
} else {
  console.log(`Canonical logo already optimal enough: ${input.length} bytes`);
}

if (!Number.isInteger(derivativeSize) || derivativeSize < 32 || derivativeSize > Math.min(width, height)) {
  throw new Error(`Invalid derivative size ${derivativeSize}`);
}
const small = Buffer.alloc(derivativeSize * derivativeSize * 4);
for (let dy = 0; dy < derivativeSize; dy += 1) {
  const sy0 = Math.floor((dy * height) / derivativeSize);
  const sy1 = Math.max(sy0 + 1, Math.floor(((dy + 1) * height) / derivativeSize));
  for (let dx = 0; dx < derivativeSize; dx += 1) {
    const sx0 = Math.floor((dx * width) / derivativeSize);
    const sx1 = Math.max(sx0 + 1, Math.floor(((dx + 1) * width) / derivativeSize));
    let sumA = 0;
    let sumRA = 0;
    let sumGA = 0;
    let sumBA = 0;
    let samples = 0;
    for (let sy = sy0; sy < sy1; sy += 1) {
      for (let sx = sx0; sx < sx1; sx += 1) {
        const src = (sy * width + sx) * 4;
        const a = pixels[src + 3];
        sumA += a;
        sumRA += pixels[src] * a;
        sumGA += pixels[src + 1] * a;
        sumBA += pixels[src + 2] * a;
        samples += 1;
      }
    }
    const dst = (dy * derivativeSize + dx) * 4;
    small[dst + 3] = samples ? Math.round(sumA / samples) : 0;
    if (sumA > 0) {
      small[dst] = Math.round(sumRA / sumA);
      small[dst + 1] = Math.round(sumGA / sumA);
      small[dst + 2] = Math.round(sumBA / sumA);
    } else {
      small[dst] = 0;
      small[dst + 1] = 0;
      small[dst + 2] = 0;
    }
  }
}

const derivative = encodeRgbaPng(small, derivativeSize, derivativeSize);
writeFileSync(derivativeTarget, derivative);
console.log(`Generated responsive logo derivative: ${derivativeTarget} (${derivativeSize}x${derivativeSize}, ${derivative.length} bytes)`);

const assetsDir = "dist/assets";
let publicBundleUpdated = false;
for (const name of readdirSync(assetsDir)) {
  if (!name.endsWith(".js")) continue;
  const path = `${assetsDir}/${name}`;
  const source = readFileSync(path, "utf8");
  if (!source.includes("One front door.") || !source.includes("/hlc-logo-transparent.png")) continue;
  const updated = source.replaceAll("/hlc-logo-transparent.png", "/hlc-logo-ui.png");
  writeFileSync(path, updated);
  publicBundleUpdated = true;
  console.log(`Rewired public-home UI logo delivery in ${name}`);
}
if (!publicBundleUpdated) throw new Error("Could not locate compiled public-home bundle for responsive logo delivery");
