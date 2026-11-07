import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const FA = 'node_modules/@fortawesome/fontawesome-free';
const OUT = 'src/styles/fontawesome-subset.css';
const FONT_DIR = '../../node_modules/@fortawesome/fontawesome-free/webfonts/';
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (p === OUT) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const used = new Set();
for (const file of walk('src').filter(f => ['.astro', '.js', '.ts', '.css'].includes(extname(f)))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\bfa-([a-z0-9-]+)/g)) used.add(`fa-${m[1]}`);
}
function pickIcons(css) {
  const rules = [];
  for (const m of css.matchAll(/([^{}]+)\{(--fa:"[^"]*")\}/g)) {
    const selectors = m[1].split(',').map(s => s.trim());
    const hit = selectors.filter(s => used.has(s.slice(1)));
    if (hit.length) rules.push(`${hit.join(',')}{${m[2]}}`);
  }
  return rules.join('');
}

const core = readFileSync(`${FA}/css/fontawesome.min.css`, 'utf8');
const iconsAt = core.indexOf('.fa-0{');
const coreBase = core.slice(0, core.indexOf('.fa-1x{'));
const coreIcons = pickIcons(core.slice(iconsAt));

const solid = readFileSync(`${FA}/css/solid.min.css`, 'utf8');

const brands = readFileSync(`${FA}/css/brands.min.css`, 'utf8');
const brandsAt = brands.search(/\.fa-[a-z0-9-]+\{--fa:/);
const brandsBase = brands.slice(0, brandsAt);
const brandIcons = pickIcons(brands.slice(brandsAt).replace(/\\\\/g, '\\'));

const css = [coreBase, coreIcons, solid, brandsBase, brandIcons]
  .join('\n')
  .replaceAll('../webfonts/', FONT_DIR);

writeFileSync(OUT, css);
console.log(`fa-subset: ${used.size} fa-* classes referenced -> ${(css.length / 1024).toFixed(1)} KB written to ${OUT}`);
