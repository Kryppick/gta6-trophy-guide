// main.ts — hands in the GTA 6 trophy guide entry.
// Node 22 standard library only. Copies app/ and screenshots/ from this
// repository into the output directory and writes /output/dossier.json with
// buildDossier from vendor/makefun-frontend.ts (the kit's library, unchanged).
// Running it twice writes identical bytes.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true, dereference: false });
}

function main(): void {
  const appSource = join(repoRoot, 'app');
  const shotsSource = join(repoRoot, 'screenshots');
  if (!existsSync(appSource)) throw new Error('app/ is missing from the repository');
  if (!existsSync(shotsSource)) throw new Error('screenshots/ is missing from the repository');
  mkdirSync(outputDir, { recursive: true });
  // Start clean so a second run writes exactly the same bytes as the first.
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    const target = join(outputDir, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
  copyTree(appSource, join(outputDir, 'app'));
  copyTree(shotsSource, join(outputDir, 'screenshots'));
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  const indexHtml = readFileSync(join(outputDir, 'app', 'index.html'), 'utf8');
  if (!indexHtml.includes('Leonida Legend Tracker')) throw new Error('app/index.html is not the trophy guide');
}

main();
