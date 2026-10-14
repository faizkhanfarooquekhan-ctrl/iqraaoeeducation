import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'CSS.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'JS.html'), 'utf8');
const demo = fs.readFileSync(path.join(root, 'tools/demo-backend.js'), 'utf8');

const html = index
  .replace("<?!= include('CSS'); ?>", css)
  .replace("<?!= include('JS'); ?>", demo + '\n' + js);

const port = Number(process.env.PORT || 4173);
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
});

server.listen(port, '0.0.0.0', () => {
  console.log('IQRA preview on http://127.0.0.1:' + port);
});
