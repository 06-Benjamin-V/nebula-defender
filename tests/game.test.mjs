import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { Player } from '../js/player.js';
import { Formation } from '../js/enemies.js';
import { resolveCollisions } from '../js/collisions.js';
import { createProjectile, updateProjectiles } from '../js/projectiles.js';
import { StateMachine, STATES } from '../js/state.js';
import { SPRITES } from '../js/sprites.js';

test('la nave respeta límites y cadencia; una instancia nueva reinicia su estado', () => {
  const player = new Player(), shots = [];
  player.update(10, { axis: -1, firing: true }, shots);
  assert.equal(player.x, 0); assert.equal(shots.length, 1);
  player.update(.01, { axis: 0, firing: true }, shots);
  assert.equal(shots.length, 1);
  player.update(10, { axis: 1, firing: false }, shots);
  assert.equal(player.x, CONFIG.width - player.width);
  assert.equal(new Player().cooldown, 0);
});
test('un disparo elimina un solo enemigo y entrega una sola recompensa', () => {
  const enemies = [0, 1].map(() => ({ x: 10, y: 10, width: 24, height: 24, alive: true }));
  const shots = [{ x: 15, y: 15, width: 3, height: 7, owner: 'player', alive: true }];
  let score = 0;
  resolveCollisions(new Player(), enemies, shots, () => { score += CONFIG.enemies.scout.points; });
  resolveCollisions(new Player(), enemies, shots, () => { score += CONFIG.enemies.scout.points; });
  assert.equal(enemies.filter(e => e.alive).length, 1); assert.equal(score, 100);
});
test('colisiones diferencian impactos e invasión para resolver las vidas en la sesión', () => {
  const player = new Player();
  const shot = createProjectile(player.x + 10, player.y, 'enemy');
  assert.equal(resolveCollisions(player, [], [shot], () => {}).playerHit, true);
  assert.equal(shot.alive, false);
  assert.equal(resolveCollisions(player, [{ x: 0, y: player.y, width: 24, height: 24, alive: true }], [], () => {}).breach, true);
});
test('la formación rebota, desciende y dispara desde la fila inferior', () => {
  const formation = new Formation(CONFIG.levels[0], () => 0), shots = [];
  formation.update(CONFIG.enemies.scout.fireInterval, shots);
  assert.equal(shots.length, 1);
  assert.equal(shots[0].y, Math.max(...formation.enemies.map(e => e.y + e.height)));
  formation.enemies = [{ x: CONFIG.width - CONFIG.formation.margin - 24, baseX: CONFIG.width - CONFIG.formation.margin - 24, y: 20, baseY: 20, width: 24, height: 24, column: 0, type: 'scout', alive: true, cooldown: 1 }];
  formation.update(.05, shots);
  assert.equal(formation.direction, -1); assert.equal(formation.enemies[0].y, 20 + CONFIG.levels[0].descent);
});
test('proyectiles fuera de pantalla quedan descartados', () => {
  const shot = createProjectile(10, 0, 'player'); updateProjectiles([shot], 1); assert.equal(shot.alive, false);
});
test('estados impiden transiciones inválidas y permiten pausa, final y reinicio', () => {
  const state = new StateMachine(() => {});
  state.set(STATES.VICTORY); assert.equal(state.value, STATES.MENU);
  for (const next of [STATES.PLAYING, STATES.PAUSED, STATES.PLAYING, STATES.VICTORY, STATES.PLAYING, STATES.DEFEAT, STATES.PLAYING]) {
    state.set(next); assert.equal(state.value, next);
  }
});
test('las matrices de sprites son rectangulares y usan solo la paleta', () => {
  for (const rows of Object.values(SPRITES)) for (const row of rows) {
    assert.equal(row.length, rows[0].length);
    for (const pixel of row) assert.ok(pixel in CONFIG.palette);
  }
});
