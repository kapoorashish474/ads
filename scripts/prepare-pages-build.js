#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'server/data/store.json');
const destDir = path.join(root, 'frontend/public/data');
const dest = path.join(destDir, 'store.json');

if (!fs.existsSync(src)) {
  console.error('Missing seed store:', src);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied store.json → frontend/public/data/store.json');
