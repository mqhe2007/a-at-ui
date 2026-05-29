import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const packageRoot = path.join(repoRoot, 'packages', 'a-at-ui');
const distRoot = path.join(packageRoot, 'dist');

// Ensure dist exists
if (!existsSync(distRoot)) {
  mkdirSync(distRoot, { recursive: true });
}

// ── Skills directory — bundled for skill distribution ───────────────────────
const skillsSrc = path.join(repoRoot, 'skills');
const skillsTarget = path.join(distRoot, 'skills');

for (const skillName of ['a-at-ui-manifest', 'a-at-ui-setup', 'a-at-ui-protocol']) {
  const srcDir = path.join(skillsSrc, skillName);
  const tgtDir = path.join(skillsTarget, skillName);
  if (existsSync(srcDir)) {
    rmSync(tgtDir, { recursive: true, force: true });
    cpSync(srcDir, tgtDir, { recursive: true });
  }
}
