import fs from 'node:fs';
import path from 'node:path';

const assets = [
  ['public/hlc-frontdoor-resident-hero.jpg.b64', 'dist/hlc-frontdoor-resident-hero.jpg'],
  ['public/hlc-frontdoor-people-first.jpg.b64', 'dist/hlc-frontdoor-people-first.jpg'],
  ['public/hlc-frontdoor-professional.jpg.b64', 'dist/hlc-frontdoor-professional.jpg'],
];

for (const [source, target] of assets) {
  if (!fs.existsSync(source)) throw new Error(`Missing approved front-door asset source: ${source}`);
  const encoded = fs.readFileSync(source, 'utf8').replace(/\s+/g, '');
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length < 100000 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    throw new Error(`Invalid approved JPEG asset: ${source}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  console.log(`Materialized ${target} (${bytes.length} bytes)`);
}
