const fs = require('node:fs');
const path = require('node:path');

const outDir = path.join(__dirname, '..', 'out');
const caDir = path.join(outDir, 'ca');

fs.rmSync(path.join(outDir, '404.html'));
fs.mkdirSync(caDir, { recursive: true });
fs.copyFileSync(path.join(outDir, 'ca.html'), path.join(caDir, 'index.html'));
fs.copyFileSync(path.join(outDir, 'ca.txt'), path.join(caDir, 'index.txt'));
