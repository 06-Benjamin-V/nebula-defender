import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { Session } from '../js/session.js';
import { Player } from '../js/player.js';
import { Formation } from '../js/enemies.js';
import { Boss } from '../js/boss.js';
import { Records } from '../js/storage.js';
import { PowerUps } from '../js/power-ups.js';
import { createProjectile } from '../js/projectiles.js';
import { projectileHits, resolveCollisions } from '../js/collisions.js';

const idle = { axis: 0, firing: false };
const records = () => new Records(() => undefined);
const session = options => new Session({ records: records(), random: () => 0.99, ...options });
function incoming(run, count = 1) {
  for (let i = 0; i < count; i++) run.projectiles.push(createProjectile(run.player.x + run.player.width / 2, run.player.y + 10, 'enemy'));
}
function clearStage(run) {
  run.levels.intro = 0;
  for (const enemy of run.levels.targets) for (let i = 0; i < enemy.health; i++) {
    run.projectiles.push(createProjectile(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'player'));
  }
  run.update(0, idle);
}

test('la introducción deja mover la nave y suspende disparos y enemigos; luego habilita el combate', () => {
  const run = session(), initial = run.levels.targets[0].x, initialPlayer = run.player.x;
  run.update(.5, { axis: 1, firing: true });
  assert.equal(run.levels.targets[0].x, initial); assert.equal(run.projectiles.length, 0);
  assert.ok(run.player.x > initialPlayer);
  run.update(CONFIG.campaign.introDuration, idle); run.update(.05, { axis: 0, firing: true });
  assert.equal(run.projectiles.filter(shot => shot.owner === 'player').length, 1);
  assert.notEqual(run.levels.targets[0].x, initial);
});

test('la campaña tiene cinco sectores y avanza 1→2→3→4→5 antes de conceder victoria', () => {
  const run = session();
  assert.equal(CONFIG.levels.length, 5);
  assert.equal(CONFIG.levels[3].name, 'UMBRAL DEL VACÍO');
  assert.equal(CONFIG.levels[4].boss, true);
  for (let number = 1; number < CONFIG.levels.length; number++) {
    assert.equal(run.levels.number, number); clearStage(run);
    assert.equal(run.result, null); assert.equal(run.levels.number, number + 1);
    assert.equal(run.projectiles.length, 0); assert.equal(run.powerUps.items.length, 0);
    assert.equal(run.player.lives, 3); assert.ok(run.levels.intro > 0);
  }
  clearStage(run);
  assert.equal(run.result, 'victory'); assert.equal(run.levels.boss.health, 0);
  const expected = CONFIG.levels.filter(level => !level.boss).reduce((score, level) => score + level.rows.reduce((sum, type) => sum + CONFIG.enemies[type].points * CONFIG.formation.columns, 0), CONFIG.boss.points);
  assert.equal(run.score, expected); assert.equal(run.records.score, expected);
  run.update(1, { axis: 1, firing: true }); assert.equal(run.score, expected);
});
test('múltiples impactos simultáneos cuestan una vida; la protección expira y tres daños causan derrota', () => {
  const run = session(); run.levels.intro = 0;
  incoming(run, 4); run.update(0, idle); assert.equal(run.player.lives, 2);
  assert.equal(run.projectiles.filter(shot => shot.owner === 'enemy').length, 0);
  incoming(run); run.update(0, idle); assert.equal(run.player.lives, 2);
  run.player.update(CONFIG.player.invulnerability, idle, []);
  incoming(run); run.update(0, idle); assert.equal(run.player.lives, 1);
  run.player.update(CONFIG.player.invulnerability, idle, []);
  incoming(run); run.update(0, idle); assert.equal(run.player.lives, 0); assert.equal(run.result, 'defeat');
});
test('la invasión consume una sola vida y reconstruye el sector sin bucle de daños', () => {
  const run = session(); run.levels.intro = 0; run.player.activate('shield');
  for (const enemy of run.levels.targets) enemy.baseY = enemy.y = run.player.y;
  run.update(0, idle);
  assert.equal(run.player.lives, 2); assert.equal(run.levels.number, 1);
  assert.ok(run.levels.intro > 0); assert.ok(run.levels.targets.every(enemy => enemy.y < run.player.y));
  run.update(.05, idle); assert.equal(run.player.lives, 2);
});
test('doble y rápido se combinan; renovar no acumula duración; escudo bloquea impactos y todo expira', () => {
  const player = new Player(), shots = [];
  player.activate('double'); player.activate('rapid'); player.activate('shield');
  player.update(0, { axis: 0, firing: true }, shots);
  assert.equal(shots.length, 2); assert.notEqual(shots[0].x, shots[1].x);
  assert.equal(player.cooldown, CONFIG.player.fireInterval * CONFIG.powerUps.rapidMultiplier);
  assert.equal(player.damage(), false); assert.equal(player.lives, 3);
  player.update(1, idle, shots); player.activate('double'); assert.equal(player.powers.double, CONFIG.powerUps.duration);
  player.update(CONFIG.powerUps.duration, idle, shots);
  assert.ok(Object.values(player.powers).every(value => value === 0));
  assert.equal(player.damage(), true); assert.equal(player.lives, 2);
});
test('las tres cápsulas caen, se recogen y se limpian; probabilidad y límite se respetan', () => {
  for (const [index, type] of CONFIG.powerUps.types.entries()) {
    let calls = 0;
    const drops = new PowerUps(() => calls++ % 2 === 0 ? 0 : (index + .1) / CONFIG.powerUps.types.length);
    const player = new Player(); drops.drop(player); assert.equal(drops.items[0].type, type);
    const y = drops.items[0].y; drops.update(.01, player);
    assert.ok(player.powers[type] > 0); assert.equal(drops.items.length, 0);
    drops.drop({ ...player, y: CONFIG.height + 1 }); drops.update(0, player); assert.equal(drops.items.length, 0);
    assert.ok(y >= 0);
  }
  const none = new PowerUps(() => 1); none.drop(new Player()); assert.equal(none.items.length, 0);
  const many = new PowerUps(() => 0); for (let i = 0; i < 20; i++) many.drop(new Player());
  assert.equal(many.items.length, CONFIG.powerUps.maxDrops);
});
test('centinelas resisten dos impactos y solo conceden puntos al destruirse', () => {
  const enemy = { x: 100, y: 100, width: 24, height: 24, health: 2, alive: true };
  let kills = 0;
  const hit = () => resolveCollisions(new Player(), [enemy], [createProjectile(110, 110, 'player')], () => kills++);
  hit(); assert.equal(enemy.health, 1); assert.equal(kills, 0); assert.equal(enemy.alive, true);
  hit(); assert.equal(enemy.alive, false); assert.equal(kills, 1);
  hit(); assert.equal(kills, 1);
});
test('el barrido detecta blancos atravesados y descarta trayectorias laterales sin contacto', () => {
  const target = { x: 100, y: 80, width: 24, height: 24 };
  assert.equal(projectileHits({ x: 110, y: 20, previousX: 110, previousY: 150, width: 3, height: 7 }, target), true);
  assert.equal(projectileHits({ x: 90, y: 20, previousX: 90, previousY: 150, width: 3, height: 7 }, target), false);
});
test('especies producen tiro vertical, dirigido y abanico; respetan el límite de balas', () => {
  for (const type of Object.keys(CONFIG.enemies)) {
    const formation = new Formation({ ...CONFIG.levels[0], rows: [type] }, () => 0), shots = [];
    formation.enemies.forEach(enemy => { enemy.cooldown = 0; }); formation.fireTimer = 0;
    formation.update(.01, shots, { x: 400, y: 270, width: 32 });
    assert.equal(shots.length, type === 'sentinel' ? 3 : 1);
    if (type === 'scout') assert.equal(shots[0].vx, 0);
    if (type === 'wraith') assert.ok(shots[0].vx > 0);
    if (type === 'sentinel') assert.ok(shots[0].vx < 0 && shots[2].vx > 0);
    formation.fireTimer = 0; formation.enemies.forEach(enemy => { enemy.cooldown = 0; });
    while (shots.length < formation.level.maxShots) shots.push(createProjectile(10, 10, 'enemy'));
    formation.update(.01, shots); assert.equal(shots.length, formation.level.maxShots);
  }
});
test('Némesis alterna abanico y torretas; su segunda fase aumenta presión sin superar el límite', () => {
  const boss = new Boss(), player = new Player(), shots = [];
  boss.fireTimer = 0; boss.update(.01, shots, player); assert.equal(shots.length, 3);
  boss.fireTimer = 0; boss.update(.01, shots, player); assert.equal(shots.length, 5);
  boss.health = CONFIG.boss.health / 2; boss.fireTimer = 0; boss.update(.01, shots, player);
  assert.equal(boss.enraged, true); assert.equal(shots.length, 10);
  assert.equal(boss.fireTimer, CONFIG.boss.enragedFireInterval);
  for (let i = shots.length; i < CONFIG.boss.maxShots; i++) shots.push(createProjectile(0, 0, 'enemy'));
  boss.fireTimer = 0; boss.update(.01, shots, player); assert.equal(shots.length, CONFIG.boss.maxShots);
  assert.ok(boss.x >= 0 && boss.x + boss.width <= CONFIG.width);
});
test('récord persiste, valida datos y funciona en memoria cuando lectura o escritura fallan', () => {
  const values = new Map(), provider = () => ({ getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) });
  const record = new Records(provider); record.update(700); record.update(100);
  assert.equal(new Records(provider).score, 700);
  values.set(CONFIG.storage.recordKey, 'corrupto'); assert.equal(new Records(provider).score, 0);
  const broken = new Records(() => { throw new Error('Bloqueado'); }); broken.update(500); assert.equal(broken.score, 500);
});
test('reiniciar crea sesión limpia y debug nunca altera el récord normal', () => {
  const record = records(), run = session({ debug: true, records: record });
  run.player.activate('double'); clearStage(run); assert.ok(run.score > 0); assert.equal(record.score, 0);
  const restarted = session({ records: record });
  assert.equal(restarted.score, 0); assert.equal(restarted.levels.number, 1); assert.equal(restarted.player.lives, 3);
  assert.equal(restarted.projectiles.length, 0); assert.equal(restarted.powerUps.items.length, 0);
  assert.ok(Object.values(restarted.player.powers).every(value => value === 0));
  assert.equal(restarted.player.invulnerability, 0); assert.equal(restarted.result, null);
});
