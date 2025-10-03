#!/usr/bin/env node
// Quick scanner for common module issues:
// 1) Barrel files re-exporting non-existent targets
// 2) export { default as X } from './Y' where ./Y has no default export
// 3) Empty/No-export files re-exported from barrels
// 4) React.lazy targets that lack a default export (relative paths only)
// Zero deps; conservative checks.
import fs from 'fs';
import path from 'path';
import url from 'url';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

const problems = [];

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function existsWithExt(base) {
  // Try base as a file, then index.* inside a folder
  for (const e of exts) {
    const f1 = base + e;
    if (fs.existsSync(f1)) return f1;
  }
  for (const e of exts) {
    const f2 = path.join(base, 'index' + e);
    if (fs.existsSync(f2)) return f2;
  }
  return null;
}

function hasDefaultExport(code) {
  if (!code) return false;
  // Rough checks for default export presence
  const patterns = [
    /\bexport\s+default\b/,
    /\bexport\s*\{\s*default\s+as\s+\w+\s*\}/,
  ];
  return patterns.some((r) => r.test(code));
}

function hasAnyExport(code) {
  if (!code) return false;
  return /\bexport\s+/.test(code);
}

function relToAbs(fromFile, target) {
  if (!target.startsWith('.')) return null; // only handle relative for now
  const base = path.resolve(path.dirname(fromFile), target);
  return existsWithExt(base);
}

function walk(dir, files = []) {
  let list = [];
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const d of list) {
    if (d.name === 'node_modules' || d.name.startsWith('.')) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      walk(full, files);
    } else {
      if (exts.includes(path.extname(d.name))) files.push(full);
    }
  }
  return files;
}

function checkBarrel(file, code) {
  // Patterns:
  // export { default as X } from './Y'
  // export { A, B } from './Y'
  // export * from './Y'
  const reDefaultAlias =
    /export\s*\{\s*default\s+as\s+([A-Za-z0-9_$]+)\s*\}\s*from\s*['"](.+?)['"]/g;
  const reNamed = /export\s*\{\s*([^}]+)\}\s*from\s*['"](.+?)['"]/g;
  const reStar = /export\s*\*\s*from\s*['"](.+?)['"]/g;

  let m;
  while ((m = reDefaultAlias.exec(code))) {
    const [, alias, target] = m;
    const resolved = relToAbs(file, target);
    if (!resolved) {
      problems.push({
        type: 'MISSING_TARGET',
        file,
        detail: `default as ${alias} from '${target}' not found`,
      });
      continue;
    }
    const tcode = readIfExists(resolved);
    if (!hasDefaultExport(tcode)) {
      problems.push({
        type: 'NO_DEFAULT_IN_TARGET',
        file,
        detail: `export { default as ${alias} } from '${target}' but target has no default export (${path.relative(ROOT, resolved)})`,
      });
    }
  }

  while ((m = reNamed.exec(code))) {
    const [, names, target] = m;
    const resolved = relToAbs(file, target);
    if (!resolved) {
      problems.push({
        type: 'MISSING_TARGET',
        file,
        detail: `{ ${names.trim()} } from '${target}' not found`,
      });
      continue;
    }
    const tcode = readIfExists(resolved);
    if (!hasAnyExport(tcode)) {
      problems.push({
        type: 'EMPTY_EXPORT_TARGET',
        file,
        detail: `re-exporting from '${target}' but file has no exports (${path.relative(ROOT, resolved)})`,
      });
    }
  }

  while ((m = reStar.exec(code))) {
    const [, target] = m;
    const resolved = relToAbs(file, target);
    if (!resolved) {
      problems.push({
        type: 'MISSING_TARGET',
        file,
        detail: `* from '${target}' not found`,
      });
      continue;
    }
    const tcode = readIfExists(resolved);
    if (!hasAnyExport(tcode)) {
      problems.push({
        type: 'EMPTY_EXPORT_TARGET',
        file,
        detail: `export * from '${target}' but file has no exports (${path.relative(ROOT, resolved)})`,
      });
    }
  }
}

function checkLazy(file, code) {
  // Find React.lazy(() => import('./Something'))
  const reLazy =
    /React\.lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"](.+?)['"]\s*\)\s*\)/g;
  let m;
  while ((m = reLazy.exec(code))) {
    const [, target] = m;
    const resolved = relToAbs(file, target);
    if (!resolved) {
      problems.push({
        type: 'LAZY_MISSING_TARGET',
        file,
        detail: `lazy import '${target}' not found`,
      });
      continue;
    }
    const tcode = readIfExists(resolved);
    if (!hasDefaultExport(tcode)) {
      problems.push({
        type: 'LAZY_NO_DEFAULT',
        file,
        detail: `lazy import '${target}' has no default export (${path.relative(ROOT, resolved)})`,
      });
    }
  }
}

// Main execution
console.log('🔍 Scanning for module export issues...\n');

const srcFiles = walk(SRC);
let checked = 0;

for (const file of srcFiles) {
  const code = readIfExists(file);
  if (!code) continue;

  checkBarrel(file, code);
  checkLazy(file, code);
  checked++;
}

// Report results
console.log(`📊 Checked ${checked} files, found ${problems.length} issues:\n`);

if (problems.length === 0) {
  console.log('✅ No export issues found!');
  process.exit(0);
}

// Group by type for better readability
const byType = {};
for (const p of problems) {
  if (!byType[p.type]) byType[p.type] = [];
  byType[p.type].push(p);
}

for (const [type, issues] of Object.entries(byType)) {
  console.log(`\n🚨 ${type} (${issues.length}):`);
  for (const issue of issues) {
    const relFile = path.relative(ROOT, issue.file);
    console.log(`   ${relFile}: ${issue.detail}`);
  }
}

console.log(`\n💡 Total: ${problems.length} issues found`);
process.exit(1);
