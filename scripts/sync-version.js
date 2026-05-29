import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// 1. 从根 package.json 读取真理版本
const rootPkgPath = path.join(repoRoot, 'package.json');
const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'));
const version = rootPkg.version;

if (!version) {
  console.error('❌ 根 package.json 缺少 version 字段');
  process.exit(1);
}

console.log(`📌 真理版本: ${version}`);

// 2. 同步主包 package.json
const mainPkgPath = path.join(repoRoot, 'packages', 'a-at-ui', 'package.json');
const mainPkg = JSON.parse(readFileSync(mainPkgPath, 'utf-8'));
if (mainPkg.version !== version) {
  mainPkg.version = version;
  writeFileSync(mainPkgPath, JSON.stringify(mainPkg, null, 2) + '\n');
  console.log(`  ✓ packages/a-at-ui/package.json → ${version}`);
} else {
  console.log(`  - packages/a-at-ui/package.json 已是最新`);
}

// 3. 同步网站 package.json
const sitePkgPath = path.join(repoRoot, 'apps', 'website', 'package.json');
const sitePkg = JSON.parse(readFileSync(sitePkgPath, 'utf-8'));
if (sitePkg.version !== version) {
  sitePkg.version = version;
  writeFileSync(sitePkgPath, JSON.stringify(sitePkg, null, 2) + '\n');
  console.log(`  ✓ apps/website/package.json → ${version}`);
} else {
  console.log(`  - apps/website/package.json 已是最新`);
}

// 4. 同步技能 SKILL.md 的 YAML frontmatter 中的 version
const skillsDir = path.join(repoRoot, 'skills');
const { readdirSync } = await import('node:fs');

for (const skillName of readdirSync(skillsDir)) {
  const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');
  let content;
  try {
    content = readFileSync(skillMdPath, 'utf-8');
  } catch {
    continue; // 跳过不存在的文件
  }

  const versionLineRegex = /^(\s*version:\s*)".*?"/m;
  const match = content.match(versionLineRegex);
  if (!match) {
    console.log(`  ⚠ skills/${skillName}/SKILL.md 未找到 version 字段`);
    continue;
  }

  const currentVersion = match[0].match(/".*?"/)[0].replace(/"/g, '');
  if (currentVersion === version) {
    console.log(`  - skills/${skillName}/SKILL.md 已是最新`);
    continue;
  }

  const updated = content.replace(versionLineRegex, `$1"${version}"`);
  writeFileSync(skillMdPath, updated);
  console.log(`  ✓ skills/${skillName}/SKILL.md → ${version}`);
}

console.log('✅ 版本同步完成');
