import { readFile } from 'node:fs/promises';

const [html, css, ...legacyBlocks] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/legacy.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/legacy/app-1.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/legacy/app-2.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/legacy/app-3.js', import.meta.url), 'utf8'),
]);
const legacy = legacyBlocks.join('\n');

const checks = [
  ['stylesheet reference', html.includes('./src/styles/legacy.css')],
  ['legacy script 1 reference', html.includes('./src/legacy/app-1.js')],
  ['legacy script 2 reference', html.includes('./src/legacy/app-2.js')],
  ['legacy script 3 reference', html.includes('./src/legacy/app-3.js')],
  ['no inline style blocks', !/<style(?:\s|>)/i.test(html)],
  ['no inline script blocks', !/<script(?![^>]*\bsrc=)/i.test(html)],
  ['CSS retained', css.includes(':root') && css.includes('.mode-race')],
  ['start mode retained', legacy.includes('function updateStartUI')],
  ['race mode retained', legacy.includes('function updateRaceUI')],
  ['plan mode retained', legacy.includes('function runPlanAnalysis')],
  ['initialization retained', legacy.includes('requestAnimationFrame(rafLoop)')],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  throw new Error(`Structural validation failed: ${failures.join(', ')}`);
}

console.log(`Structure OK: ${html.split('\n').length} HTML lines, ${css.split('\n').length} CSS lines, ${legacy.split('\n').length} legacy JS lines in ${legacyBlocks.length} ordered files`);
