// Comprobación estática reproducible de recursos, identificadores HTML y contraste de la paleta.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
let references = 0;
function checkReference(file, reference) {
  if (reference.startsWith('#') || reference.startsWith('data:')) return;
  if (/^(https?:)?\/\//.test(reference)) throw new Error('Dependencia remota: ' + reference);
  const target = resolve(dirname(file), reference.split(/[?#]/)[0]);
  if (!existsSync(target)) throw new Error('Recurso ausente: ' + reference + ' desde ' + file);
  references++;
}
for (const name of ['index.html', 'sprites-preview.html']) {
  const file = resolve(root, name), content = readFileSync(file, 'utf8'), ids = new Set();
  for (const match of content.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) checkReference(file, match[1]);
  for (const match of content.matchAll(/\bid=["']([^"']+)["']/g)) {
    if (ids.has(match[1])) throw new Error('ID duplicado: ' + match[1]);
    ids.add(match[1]);
  }
}
for (const name of readdirSync(resolve(root, 'js')).filter(name => name.endsWith('.js'))) {
  const file = resolve(root, 'js', name), content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(/\bfrom\s*["']([^"']+)["']/g)) checkReference(file, match[1]);
}
console.log('Referencias locales verificadas: ' + references + '. Sin IDs duplicados ni dependencias remotas en las páginas.');
const css = readFileSync(resolve(root, 'css/global.css'), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/g)].map(match => [match[1], match[2]]));
const luminance = hex => hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
  .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
  .reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
for (const [label, a, b] of [['Texto/fondo', colors.text, colors.bg], ['Texto/panel', colors.text, colors.panel], ['Secundario/panel', colors.muted, colors.panel], ['Cian/panel', colors.cyan, colors.panel], ['Violeta/panel', colors.violet, colors.panel], ['Botón principal', '#071820', colors.cyan]]) {
  const x = luminance(a), y = luminance(b), ratio = (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  console.log(label + ': ' + ratio.toFixed(2) + ':1');
  if (ratio < 4.5) throw new Error('Contraste insuficiente: ' + label);
}
