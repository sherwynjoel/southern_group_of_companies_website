/**
 * build.mjs — static dist build for Southern Group of Companies website
 * Usage: node build.mjs
 * Output: dist/
 */

import { execSync }    from 'child_process';
import { fileURLToPath } from 'url';
import fs   from 'fs';
import path from 'path';

const SRC  = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(SRC, 'dist');

/* ── helpers ── */
function run(cmd) { execSync(cmd, { stdio: 'inherit', cwd: SRC }); }

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function write(dest, content) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
}

/* ── clean dist ── */
console.log('\n🗑  Cleaning dist/');
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* ── CSS ── */
console.log('🎨  Minifying CSS');
fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
run(`npx cleancss -o "${path.join(DIST, 'css', 'style.css')}" "${path.join(SRC, 'css', 'style.css')}"`);

/* ── JS ── */
console.log('⚙️   Minifying JS');
fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
run(`npx terser "${path.join(SRC, 'js', 'main.js')}" -o "${path.join(DIST, 'js', 'main.js')}" --compress --mangle`);

/* ── HTML pages ── */
const HTML_FILES = ['index.html', 'sarnith.html', 'wind-power.html', 'transport.html', 'solar-power.html'];
const HTML_OPTS  = [
  '--collapse-whitespace',
  '--remove-comments',
  '--remove-optional-tags',
  '--remove-redundant-attributes',
  '--remove-script-type-attributes',
  '--remove-tag-whitespace',
  '--use-short-doctype',
  '--minify-css true',
  '--minify-js true',
].join(' ');

console.log('📄  Minifying HTML');
for (const file of HTML_FILES) {
  const src  = path.join(SRC, file);
  const dest = path.join(DIST, file);
  run(`npx html-minifier-terser ${HTML_OPTS} -o "${dest}" "${src}"`);
}

/* ── Assets ── */
console.log('🖼   Copying assets');
copy(path.join(SRC, 'logo.png.jpeg'), path.join(DIST, 'logo.png.jpeg'));

/* ── Report ── */
console.log('\n✅  Build complete → dist/\n');

function sizeOf(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? sizeOf(full) : fs.statSync(full).size;
  }
  return total;
}

function fmt(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

console.log('  File                  src →   dist');
console.log('  ─────────────────────────────────────');
for (const file of ['css/style.css', 'js/main.js', ...HTML_FILES]) {
  const srcPath  = path.join(SRC, file);
  const distPath = path.join(DIST, file);
  if (fs.existsSync(srcPath) && fs.existsSync(distPath)) {
    const s = fs.statSync(srcPath).size;
    const d = fs.statSync(distPath).size;
    const pct = Math.round((1 - d / s) * 100);
    console.log(`  ${file.padEnd(22)} ${fmt(s).padStart(8)} → ${fmt(d).padStart(7)}  (${pct}% smaller)`);
  }
}
const srcTotal  = sizeOf(SRC)  - (fs.existsSync(DIST) ? sizeOf(DIST) : 0);
const distTotal = sizeOf(DIST);
console.log(`\n  Total dist size: ${fmt(distTotal)}\n`);
