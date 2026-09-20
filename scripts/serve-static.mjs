import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const publicRoot = new URL('./public/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 8080);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const candidate = normalize(join(publicRoot, pathname));
  const safeCandidate = candidate.startsWith(normalize(publicRoot))
    ? candidate
    : join(publicRoot, 'index.html');
  const filePath =
    existsSync(safeCandidate) && statSync(safeCandidate).isFile()
      ? safeCandidate
      : join(publicRoot, 'index.html');

  response.setHeader('Content-Type', mimeTypes[extname(filePath)] ?? 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  createReadStream(filePath).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Static app listening on http://0.0.0.0:${port}`);
});
