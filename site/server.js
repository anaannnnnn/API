// Zero-dependency static server + API proxy (avoids CORS). Usage: node server.js [port]
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || process.argv[2] || 3000;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/api/')) {
    https.get('https://www.eporner.com/api/v2/' + u.pathname.slice(5) + u.search, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
      res.writeHead(r.statusCode, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' });
      r.pipe(res);
    }).on('error', () => { res.writeHead(502); res.end('{"error":"upstream"}'); });
    return;
  }
  let p = path.join(__dirname, 'public', u.pathname === '/' ? 'index.html' : path.normalize(u.pathname));
  if (!p.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(PORT, () => console.log('http://localhost:' + PORT));
