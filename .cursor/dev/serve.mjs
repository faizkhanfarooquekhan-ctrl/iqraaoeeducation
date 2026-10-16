#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMockApi, mockApiScript } from './mock-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '0.0.0.0';

const INCLUDE_RE = /<\?!= include\('([^']+)'\); \?>/g;

function readInclude(name) {
  const file = path.join(ROOT, `${name}.html`);
  return fs.readFileSync(file, 'utf8');
}

function buildIndexHtml() {
  const indexPath = ['index.html', 'Index.html']
    .map((name) => path.join(ROOT, name))
    .find((file) => fs.existsSync(file));
  if (!indexPath) throw new Error('index.html not found');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/\r\n/g, '\n');
  html = html.replace(INCLUDE_RE, (_, name) => readInclude(name));
  const mockTag = `<script>${mockApiScript()}</script>`;
  if (!html.includes('window.IQRA_MOCK = async')) {
    html = html.replace('</head>', `${mockTag}\n</head>`);
  }
  return html;
}

let cachedIndex = null;

function send(res, status, body, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}`);

  if (url.pathname === '/health') {
    return send(res, 200, 'ok\n');
  }

  if (url.pathname === '/__mock_api' && req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      const { action, payload } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      return send(res, 200, JSON.stringify(handleMockApi(action, payload)), 'application/json');
    } catch {
      return send(res, 400, JSON.stringify({ ok: false, error: 'Bad request' }), 'application/json');
    }
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    if (!cachedIndex) cachedIndex = buildIndexHtml();
    return send(res, 200, cachedIndex, 'text/html; charset=utf-8');
  }

  send(res, 404, 'Not found\n');
});

server.listen(PORT, HOST, () => {
  console.log(`IQRA AOE local dev: http://127.0.0.1:${PORT}/ (mock API enabled)`);
});
