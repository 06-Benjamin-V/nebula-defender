import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { SPRITES, ANIMATIONS, Sprites } from '../js/sprites.js';
import { Effects } from '../js/effects.js';
import { Background } from '../js/background.js';

test('el atlas tiene dimensiones acordadas y cubre todos los frames originales', () => {
  const dimensions = { player: [16, 16], scout: [12, 12], wraith: [12, 12], sentinel: [12, 12], boss: [48, 32], bullet: [3, 7], enemyBullet: [3, 7], double: [10, 10], rapid: [10, 10], shield: [10, 10], explosion: [16, 16] };
  const covered = new Set();
  for (const [name, frames] of Object.entries(ANIMATIONS)) {
    for (const frame of frames) {
      assert.ok(SPRITES[frame], `Frame ausente: ${frame}`); covered.add(frame);
      if (dimensions[name]) assert.deepEqual([SPRITES[frame][0].length, SPRITES[frame].length], dimensions[name]);
    }
    if (frames.length > 1) assert.equal(new Set(frames.map(frame => SPRITES[frame].join(''))).size, frames.length, `Frames repetidos: ${name}`);
  }
  assert.equal(covered.size, Object.keys(SPRITES).length);
  assert.equal(ANIMATIONS.explosion.length, 4);
  for (const name of ['scout', 'wraith', 'sentinel']) assert.equal(ANIMATIONS[name].length, 2);
});

test('la caché se rasteriza una vez y dibujar animaciones no crea más canvas', () => {
  let created = 0;
  const originalDocument = globalThis.document;
  globalThis.document = { createElement: () => { created++; return { getContext: () => ({ fillRect() {} }) }; } };
  try {
    const sprites = new Sprites(), cachedCount = created, draws = [];
    const ctx = { drawImage: (...args) => draws.push(args) };
    for (let i = 0; i < 100; i++) sprites.animate(ctx, 'scout', 10.4, 20.8, 8, i / 10);
    assert.equal(created, cachedCount); assert.equal(cachedCount, Object.keys(SPRITES).length);
    assert.equal(draws[0][1], 10); assert.equal(draws[0][2], 21);
    assert.deepEqual(draws[0].slice(3), [96, 96]);
    assert.notEqual(draws[0][0], draws[4][0]);
  } finally { globalThis.document = originalDocument; }
});

test('efectos tienen límite, expiran y usan una imagen estable con movimiento reducido', () => {
  const effects = new Effects();
  for (let i = 0; i < CONFIG.art.maxEffects + 5; i++) effects.add('explosion', i, 0);
  assert.equal(effects.items.length, CONFIG.art.maxEffects);
  const frames = [], sprites = { draw: (_ctx, frame) => frames.push(frame) };
  effects.draw({}, sprites, true);
  assert.ok(frames.every(frame => frame === 'explosion3'));
  effects.update(2, true); assert.equal(effects.items.length, 0);
  effects.add('muzzle', 0, 0);
  effects.update(CONFIG.art.flashFrameInterval * 2, false); assert.equal(effects.items.length, 0);
});

test('parallax respeta velocidades, envuelve estrellas y se detiene con movimiento reducido', () => {
  const background = Object.create(Background.prototype);
  background.layers = CONFIG.art.starLayers.map(layer => ({ ...layer, stars: [{ x: 10, y: CONFIG.height - 1 }] }));
  const before = background.layers.map(layer => layer.stars[0].y);
  background.update(.5, true);
  assert.deepEqual(background.layers.map(layer => layer.stars[0].y), before);
  background.update(.5, false);
  background.layers.forEach(layer => assert.equal(layer.stars[0].y, (CONFIG.height - 1 + layer.speed * .5) % CONFIG.height));
});
