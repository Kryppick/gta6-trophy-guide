// main.ts — hands the GTA 6 trophy guide in.
// Copies app/ and screenshots/ from this repository to the output directory
// and writes /output/dossier.json with buildDossier from the kit's vendored
// library (vendor/makefun-frontend.ts, the kit's copy, unchanged).
// Deterministic: directory entries are copied in sorted order, file bytes
// are copied verbatim, and the dossier is built from the copied files, so
// two runs write the same bytes.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// The gate's limits for this bounty (see RULES.txt: app/ at most 993 files
// and 48 MiB, index.html at most 1 MiB, 3-4 screenshots of at most 256 KiB
// with long side at most 1280 and short side at least 480, dossier at most
// 1.5 MiB, its text at most 163,840 bytes, trophies.json at most 2 MiB).
const CAPS = {
  text_max_bytes: 163840,
  dossier_max_bytes: 1572864,
  app_max_files: 993,
  app_max_bytes: 50331648,
  index_max_bytes: 1048576,
  screenshots_max: 4,
  screenshot_max_bytes: 262144,
  screenshot_max_long: 1280,
  screenshot_min_short: 480,
  trophies_max_bytes: 2097152,
};

function copyTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(join(REPO_ROOT, "app"), join(OUTPUT_DIR, "app"));
  copyTree(join(REPO_ROOT, "screenshots"), join(OUTPUT_DIR, "screenshots"));
  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
}

main();
