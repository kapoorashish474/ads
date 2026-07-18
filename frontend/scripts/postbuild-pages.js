import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('postbuild-pages: dist/index.html not found — run vite build first');
  process.exit(1);
}

fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
console.log('Copied dist/index.html → dist/404.html for GitHub Pages SPA routing');
