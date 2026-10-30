import { CONFIG } from './config.js';
import { Sprites, SPRITES, ANIMATIONS } from './sprites.js';

const catalog = [
  ['player', 'ND–01 / AURORA', 'Nave defensora', 'Cabina de cristal, cañones laterales, blindaje azul y dos motores.'],
  ['thrust', 'MOTOR / ION', 'Propulsión', 'Dos estados de llama para los motores de la nave.'],
  ['scout', 'ESPECIE / 01', 'Explorador Prisma', 'Antenas de cian, sensores gemelos y patas articuladas. Enemigo actual del juego.'],
  ['wraith', 'ESPECIE / 02', 'Espectro Violeta', 'Alas segmentadas y ojos oblicuos sobre una silueta de mantarraya.'],
  ['sentinel', 'ESPECIE / 03', 'Centinela Carmesí', 'Coraza magenta, visor naranja y dos garras inferiores.'],
  ['boss', 'FORTALEZA / NÉMESIS', 'El guardián de la nebulosa', 'Fortaleza simétrica de 48×32: torretas con núcleos de energía y reactor central protegido.'],
  ['bullet', 'ARSENAL / ALIADO', 'Lanza de iones', 'Núcleo blanco con estela azul y cian.'],
  ['enemyBullet', 'ARSENAL / HOSTIL', 'Aguijón de plasma', 'Cabeza naranja, cápsula magenta y estela violeta.'],
  ['double', 'MEJORA / 01', 'Disparo doble', 'Cápsula de cian con dos haces paralelos.'],
  ['rapid', 'MEJORA / 02', 'Disparo rápido', 'Cápsula naranja con un rayo de energía.'],
  ['shield', 'MEJORA / 03', 'Escudo temporal', 'Cápsula violeta con escudo heráldico luminoso.'],
  ['muzzle', 'EFECTO / DISPARO', 'Destello de boca', 'Dos frames de liberación de energía del cañón.'],
  ['impact', 'EFECTO / IMPACTO', 'Contacto de plasma', 'Dos frames de contacto y dispersión del impacto.'],
  ['explosion', 'EFECTO / DESTRUCCIÓN', 'Ruptura del reactor', 'Cuatro frames: ignición, expansión, anillo y disipación.'],
];
const sprites = new Sprites(), views = [];
const grid = document.querySelector('#sprite-grid');
for (const [name, label, title, description] of catalog) {
  const frames = ANIMATIONS[name], rows = SPRITES[frames[0]];
  const card = document.createElement('article'); card.className = `sprite-card ${name}`;
  const header = document.createElement('header');
  const eyebrow = document.createElement('span'); eyebrow.className = 'eyebrow'; eyebrow.textContent = label;
  const heading = document.createElement('h2'); heading.textContent = title; header.append(eyebrow, heading);
  const stage = document.createElement('div'); stage.className = 'sprite-stage';
  const canvas = document.createElement('canvas'); canvas.width = rows[0].length * 8; canvas.height = rows.length * 8;
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `${title}, ampliado ocho veces`); stage.append(canvas);
  const text = document.createElement('p'); text.textContent = description;
  const meta = document.createElement('dl');
  for (const [key, value] of [['MATRIZ', `${rows[0].length} × ${rows.length}`], ['FRAMES', String(frames.length)]]) {
    const dt = document.createElement('dt'), dd = document.createElement('dd'), group = document.createElement('div');
    dt.textContent = key; dd.textContent = value; group.append(dt, dd); meta.append(group);
  }
  const details = document.createElement('details'), summary = document.createElement('summary'), strip = document.createElement('div');
  summary.textContent = 'Inspeccionar todos los frames ×8'; strip.className = 'frame-strip';
  for (const frame of frames) {
    const figure = document.createElement('figure'), frameCanvas = document.createElement('canvas'), caption = document.createElement('figcaption');
    frameCanvas.width = canvas.width; frameCanvas.height = canvas.height;
    const ctx = frameCanvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    sprites.draw(ctx, frame, 0, 0, 8); caption.textContent = frame;
    figure.append(frameCanvas, caption); strip.append(figure);
  }
  details.append(summary, strip); card.append(header, stage, text, meta, details); grid.append(card);
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; views.push({ name, ctx, canvas });
}
for (const [index, color] of Object.entries(CONFIG.palette)) {
  if (index === '.') continue;
  const swatch = document.createElement('div'), chip = document.createElement('i'), label = document.createElement('span');
  swatch.className = 'swatch'; chip.style.background = color; label.textContent = `${index} / ${color}`;
  swatch.append(chip, label); document.querySelector('#palette').append(swatch);
}
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const button = document.querySelector('#animation-toggle');
let paused = preference.matches, elapsed = 0, previous = null;
function updateButton() { button.textContent = paused ? 'Reproducir animaciones' : 'Pausar animaciones'; button.setAttribute('aria-pressed', String(paused)); }
button.addEventListener('click', () => { paused = !paused; updateButton(); });
preference.addEventListener('change', event => { paused = event.matches; updateButton(); });
updateButton();
function render(time) {
  const dt = previous === null ? 0 : Math.min((time - previous) / 1000, CONFIG.maxDelta); previous = time;
  if (!paused && !document.hidden) elapsed += dt;
  for (const { name, ctx, canvas } of views) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const interval = name === 'thrust' ? CONFIG.art.thrustFrameInterval : name === 'explosion' ? CONFIG.art.explosionFrameInterval * 2 : CONFIG.art.enemyFrameInterval;
    sprites.animate(ctx, name, 0, 0, 8, elapsed, interval);
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
