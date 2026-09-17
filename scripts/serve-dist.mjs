import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const host = process.env.HLC_PREVIEW_HOST || '127.0.0.1';
const port = Number(process.env.HLC_PREVIEW_PORT || 4173);
const root = join(process.cwd(), 'dist');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function sendFile(res, file) {
  const body = await readFile(file);
  res.writeHead(200, {
    'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const relative = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
    const requested = join(root, relative);

    try {
      const info = await stat(requested);
      if (info.isFile()) {
        await sendFile(res, requested);
        return;
      }
      if (info.isDirectory()) {
        await sendFile(res, join(requested, 'index.html'));
        return;
      }
    } catch {}

    await sendFile(res, join(root, 'index.html'));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Preview server error');
  }
}).listen(port, host, () => {
  console.log(`HomeLead Connect dist server: http://${host}:${port}`);
});
