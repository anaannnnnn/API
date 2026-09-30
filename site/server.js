// Zero-dependency static server + API proxy (avoids CORS). Usage: node server.js [port]
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || process.argv[2] || 3000;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/img') {
    let t; try { t = new URL(u.searchParams.get('u')); } catch { res.writeHead(400); return res.end(); }
    if (t.protocol !== 'https:' || !/(^|\.)eporner\.com$/.test(t.hostname)) { res.writeHead(403); return res.end(); }
    https.get(t, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.eporner.com/' } }, r => {
      if (r.statusCode !== 200) { r.resume(); res.writeHead(502); return res.end(); }
      res.writeHead(200, { 'Content-Type': r.headers['content-type'] || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      r.pipe(res);
    }).on('error', () => { res.writeHead(502); res.end(); });
    return;
  }
  if (u.pathname.startsWith('/api/')) {
    const hosts = (process.env.UPSTREAM || 'https://www.eporner.com,https://eporner.com').split(',');
    const tryHost = i => {
      if (i >= hosts.length) { res.writeHead(502); return res.end('{"error":"upstream"}'); }
      https.get(hosts[i].replace(/\/$/, '') + '/api/v2/' + u.pathname.slice(5) + u.search, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }, timeout: 8000 }, r => {
        if (r.statusCode !== 200) { r.resume(); return tryHost(i + 1); }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' });
        r.pipe(res);
      }).on('timeout', function () { this.destroy(); }).on('error', () => tryHost(i + 1));
    };
    tryHost(0);
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
