#!/usr/bin/env node
// Adds safe default-export shims where a barrel does:
//   export { default as X } from './Y'
// but ./Y has no default export and exactly ONE named export.
// This avoids mass refactors and unblocks React.lazy + default imports.
// Zero dependencies. Conservative matching. Relative paths only.
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}
function write(p, s) {
  fs.writeFileSync(p, s);
}
function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}
function listDir(p) {
  try {
    return fs.readdirSync(p, { withFileTypes: true });
  } catch {
    return [];
  }
}

function resolveWithExt(base) {
  for (const e of exts) {
    if (exists(base + e)) return base + e;
  }
  for (const e of exts) {
    const idx = path.join(base, 'index' + e);
    if (exists(idx)) return idx;
  }
  return null;
}

function walk(dir, out = []) {
  for (const d of listDir(dir)) {
    if (d.name === 'node_modules' || d.name.startsWith('.')) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) walk(full, out);
    else if (exts.includes(path.extname(full))) out.push(full);
  }
  return out;
}

function hasDefaultExport(code) {
  return (
    /\bexport\s+default\b/.test(code) || /\bexport\s*\{\s*default\b/.test(code)
  );
}

function findNamedExports(code) {
  // Capture exported symbols likely to be components/services/hooks.
  // Matches: export function Name, export class Name, export const Name, export let Name
  const names = new Set();
  const patterns = [
    /\bexport\s+function\s+([A-Za-z0-9_$]+)\b/g,
    /\bexport\s+class\s+([A-Za-z0-9_$]+)\b/g,
    /\bexport\s+const\s+([A-Za-z0-9_$]+)\b/g,
    /\bexport\s+let\s+([A-Za-z0-9_$]+)\b/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code))) names.add(m[1]);
  }
  // Also catch "export { A, B as C }" — we only add a shim if this results in exactly one exported symbol.
  const reBrace = /\bexport\s*\{\s*([^}]+)\s*\}/g;
  let m;
  while ((m = reBrace.exec(code))) {
    const inner = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of inner) {
      // handle "B as C"
      const alias = part.includes(' as ')
        ? part.split(/\s+as\s+/i)[1]
        : part.split(/\s+/)[0];
      if (alias) names.add(alias.trim());
    }
  }
  return [...names];
}

function isBarrel(file) {
  const base = path.basename(file).toLowerCase();
  return base === 'index.ts' || base === 'index.tsx';
}

function collectDefaultAliasTargets(file, code) {
  // export { default as X } from './Y'
  const targets = [];
  const re =
    /export\s*\{\s*default\s+as\s+[A-Za-z0-9_$]+\s*\}\s*from\s*['"](.+?)['"]/g;
  let m;
  while ((m = re.exec(code))) {
    const rel = m[1];
    if (!rel.startsWith('.')) continue; // only fix relative
    const abs = resolveWithExt(path.resolve(path.dirname(file), rel));
    if (abs) targets.push(abs);
  }
  return targets;
}

const files = walk(SRC);
const barrels = files.filter(isBarrel);
const targets = new Set();
for (const barrel of barrels) {
  const code = read(barrel) || '';
  for (const t of collectDefaultAliasTargets(barrel, code)) {
    targets.add(t);
  }
}

const changed = [];
const skipped = [];

for (const t of targets) {
  const code = read(t);
  if (!code) {
    skipped.push([t, 'UNREADABLE']);
    continue;
  }
  if (hasDefaultExport(code)) {
    skipped.push([t, 'HAS_DEFAULT']);
    continue;
  }
  const names = findNamedExports(code);
  if (names.length !== 1) {
    skipped.push([t, `NAMED_COUNT_${names.length}`]);
    continue;
  }
  const name = names[0];
  // Append a default export shim at EOF.
  const shim = `\n\n// auto-generated shim for barrel default export\nexport default ${name};\n`;
  write(t, code + shim);
  changed.push([t, name]);
}

if (changed.length) {
  console.log(`✅ Added default-export shims to ${changed.length} file(s):`);
  for (const [f, name] of changed) {
    console.log(`- ${path.relative(ROOT, f)} → export default ${name}`);
  }
}
if (skipped.length) {
  console.log(`\nℹ️ Skipped ${skipped.length} file(s):`);
  for (const [f, reason] of skipped) {
    console.log(`- ${path.relative(ROOT, f)} (${reason})`);
  }
}

if (!changed.length) {
  console.log('No eligible files required default-export shims.');
}
