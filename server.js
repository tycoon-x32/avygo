require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = process.env.PORT || 8000;
const root = __dirname;

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'application/octet-stream';
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  if (reqUrl.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body || '{}');

        if (!message || !process.env.OPENAI_API_KEY) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            ok: false,
            error: 'Missing message or OpenAI API key.'
          }));
          return;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are AvyGo AI, an aviation and travel assistant focused on flights, hotels, private aviation, lounge access, cargo, insurance, and trip planning.'
              },
              { role: 'user', content: message }
            ],
            temperature: 0.7
          })
        });

        const data = await response.json();

        if (!response.ok) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: data.error?.message || 'OpenAI request failed.' }));
          return;
        }

        const reply = data.choices?.[0]?.message?.content || 'No response generated.';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, reply }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload.' }));
      }
    });

    return;
  }

  let safePath = reqUrl.pathname === '/' ? '/index.html' : reqUrl.pathname;
  safePath = safePath.replace(/^\/+/, '');
  const fullPath = path.join(root, safePath);

  if (!fullPath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      const fallback = path.join(root, 'index.html');
      serveFile(res, fallback, 'text/html; charset=utf-8');
      return;
    }

    serveFile(res, fullPath, getContentType(fullPath));
  });
});

server.listen(port, () => {
  console.log(`AvyGo server running at http://localhost:${port}`);
});
