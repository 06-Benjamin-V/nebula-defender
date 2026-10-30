import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { Player } from '../js/player.js';
import { Boss } from '../js/boss.js';
import { Session } from '../js/session.js';
import { ShipSelection } from '../js/ships.js';
import { createProjectile } from '../js/projectiles.js';
import { Input } from '../js/input.js';

test('Cometa cambia velocidad, cadencia y vidas sin alterar Aurora; respeta mejoras y límites', () => {
  const aurora = new Player(), comet = new Player('comet');
  const input = { axis: 1, firing: true }, a = [], c = [];
  aurora.update(.1, input, a); comet.update(.1, input, c);
  assert.ok(comet.x > aurora.x); assert.ok(comet.cooldown < aurora.cooldown);
  assert.equal(aurora.lives, 3); assert.equal(comet.lives, 2);
  comet.damage(); assert.equal(comet.lives, 1);
  comet.update(10, { axis: 1, firing: false }, c); assert.equal(comet.x + comet.width, CONFIG.width);
  comet.activate('double'); comet.activate('rapid'); comet.cooldown = 0;
  comet.update(0, { axis: 0, firing: true }, c);
  assert.equal(c.length, 3); assert.equal(comet.cooldown, .18 * CONFIG.powerUps.rapidMultiplier);
  assert.equal(new Player('desconocida').ship, 'aurora');
});

test('la elección se conserva y solo afecta a nuevas sesiones; almacenamiento fallido funciona', () => {
  const values = new Map(), provider = () => ({ getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) });
  const choice = new ShipSelection(provider), run = new Session({ ship: choice.value, debug: true });
  choice.select('comet'); assert.equal(run.player.ship, 'aurora');
  assert.equal(new Session({ ship: new ShipSelection(provider).value, debug: true }).player.lives, 2);
  values.set(CONFIG.storage.shipKey, '__proto__'); assert.equal(new ShipSelection(provider).value, 'aurora');
  const blocked = new ShipSelection(() => { throw Error('bloqueado'); });
  blocked.select('comet'); assert.equal(blocked.value, 'comet');
});

test('Némesis abre la segunda ruta y repara hasta el máximo de cada nave sin conceder victoria', () => {
  for (const ship of ['aurora', 'comet']) {
    const run = new Session({ ship, debug: true }); run.loadLevel(5); run.levels.intro = 0; run.player.lives = 1;
    const boss = run.levels.boss;
    for (let i = 0; i < boss.health; i++) run.projectiles.push(createProjectile(boss.x + boss.width / 2, boss.y + 20, 'player'));
    run.update(0, { axis: 0, firing: false });
    assert.equal(run.result, null); assert.equal(run.levels.number, 6);
    assert.equal(run.player.lives, run.player.maxLives); assert.equal(run.score, CONFIG.boss.points);
    assert.equal(run.projectiles.length, 0); assert.ok(run.levels.intro > 0);
  }
});

test('Eclipse tiene salud y cadencia superiores, barrido dirigido, límite de proyectiles y limpieza final', () => {
  const base = new Boss(), boss = new Boss({ ...CONFIG.boss, ...CONFIG.finalBoss });
  assert.ok(boss.maxHealth > base.maxHealth); assert.ok(boss.spec.fireInterval < base.spec.fireInterval);
  const player = new Player(); let shots = [];
  for (let volley = 0; volley < 3; volley++) { shots = []; boss.fireTimer = 0; boss.update(0, shots, player); assert.equal(shots.length, [5, 2, 5][volley]); }
  boss.health = 70; boss.fireTimer = 0; shots = []; boss.volley = 0; boss.update(0, shots, player);
  assert.equal(shots.length, 7); assert.equal(boss.enraged, true);
  while (shots.length < boss.spec.maxShots) shots.push(createProjectile(0, 0, 'enemy'));
  boss.fireTimer = 0; boss.update(.1, shots, player); assert.equal(shots.length, 24);
  const run = new Session({ debug: true }); run.loadLevel(10); run.levels.intro = 0;
  const final = run.levels.boss;
  for (let i = 0; i < final.health; i++) run.projectiles.push(createProjectile(final.x + final.width / 2, final.y + 20, 'player'));
  run.update(0, { axis: 0, firing: false });
  assert.equal(run.result, 'victory'); assert.equal(run.score, 6000);
});

test('el acceso debug 0 abre el sector 10 y no se intercepta dentro de un diálogo', () => {
  const previous = globalThis.window, handlers = {};
  globalThis.window = { addEventListener: (type, handler) => { handlers[type] = handler; } };
  try {
    const levels = []; new Input(() => {}, number => levels.push(number));
    const event = code => ({ code, preventDefault() {}, target: { closest: () => null } });
    handlers.keydown(event('Digit0')); handlers.keydown(event('Numpad9'));
    handlers.keydown({ ...event('Digit0'), target: { closest: () => ({}) } });
    assert.deepEqual(levels, [10, 9]);
  } finally { globalThis.window = previous; }
});
