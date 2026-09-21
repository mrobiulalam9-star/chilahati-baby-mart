const http = require('http');

const TARGET = { host: '127.0.0.1', port: 3001 };

const server = http.createServer((req, res) => {
  const proxy = http.request(
    { ...TARGET, path: req.url, method: req.method, headers: { ...req.headers, host: `localhost:${TARGET.port}` } },
    (pRes) => {
      res.writeHead(pRes.statusCode, pRes.headers);
      pRes.pipe(res);
    }
  );
  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err.message}`);
  });
  req.pipe(proxy);
});

server.listen(3000, () => {
  console.log('Proxy running on http://localhost:3000 -> http://localhost:3001');
});