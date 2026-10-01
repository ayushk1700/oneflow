import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('.');
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
const manifest = JSON.parse(await fs.readFile('manifest.json','utf8'));
export function preview(port = 4173) {
  return http.createServer(async (request,response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/newtab/index.html' : pathname));
      if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
      const content = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Security-Policy': manifest.content_security_policy.extension_pages, 'Cache-Control':'no-cache' });
      response.end(content);
    } catch { response.writeHead(404).end('Not found'); }
  }).listen(port, '127.0.0.1', () => console.log(`ONEFLOW preview: http://127.0.0.1:${port}/newtab/index.html`));
}
if (process.argv[1]?.endsWith('preview.js')) preview();
