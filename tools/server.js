/* 弹幕地狱 · 本地静态服务器（正确 MIME） */
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.normalize(__dirname + '/..');
const port = process.env.PORT || 8077;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8',
};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.normalize(path.join(root, p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(port, () => console.log('http://127.0.0.1:' + port + '/'));
