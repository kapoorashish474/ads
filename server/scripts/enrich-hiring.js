/** @deprecated Use fetch-verified-hiring.js — re-exports for backwards compatibility. */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fetch-verified-hiring.js');
const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
