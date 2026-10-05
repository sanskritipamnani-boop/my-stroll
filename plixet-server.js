import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const filePath = fs.existsSync(path.join(__dirname, 'plixet.html'))
  ? path.join(__dirname, 'plixet.html')
  : path.join(__dirname, 'public', 'plixet.html');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/plixet' || req.url === '/plixet.html') {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    // Attempt to serve other assets if requested
    const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
    const assetPath = path.join(__dirname, 'public', cleanUrl);
    if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
      const ext = path.extname(assetPath).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.css': 'text/css',
        '.js': 'application/javascript',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(assetPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Plixet standalone server running at http://localhost:${PORT}/`);
});
