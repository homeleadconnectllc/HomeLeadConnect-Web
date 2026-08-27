import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync, constants as zlibConstants } from "node:zlib";

const target = process.argv[2] || "dist/hlc-logo-transparent.png";
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

const chunks = [];
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
  else chunks.push({ type, data: Buffer.from(data) });
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

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

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

const filtered = Buffer.allocUnsafe(expectedBytes);
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
  const targetStart = y * (rowBytes + 1);
  filtered[targetStart] = bestFilter;
  best.out.copy(filtered, targetStart + 1);
}

const compressed = deflateSync(filtered, {
  level: 9,
  strategy: zlibConstants.Z_FILTERED,
});

const output = [signature];
let insertedIdat = false;
for (const item of chunks) {
  if (item.type === "IEND" && !insertedIdat) {
    output.push(chunk("IDAT", compressed));
    insertedIdat = true;
  }
  output.push(chunk(item.type, item.data));
}
const optimized = Buffer.concat(output);

if (optimized.length >= input.length) {
  console.log(`Canonical logo already optimal enough: ${input.length} bytes`);
  process.exit(0);
}

writeFileSync(target, optimized);
const saved = input.length - optimized.length;
const percent = ((saved / input.length) * 100).toFixed(1);
console.log(`Optimized canonical logo losslessly: ${input.length} -> ${optimized.length} bytes (${percent}% smaller)`);
