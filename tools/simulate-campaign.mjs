// Diagnóstico reproducible con un controlador automático. No altera salud, daño ni reglas del juego.
// Sus resultados no equivalen a una prueba de dificultad con jugadores humanos ni a una medición de FPS.
import { Session } from '../js/session.js';
import { Records } from '../js/storage.js';
import { CONFIG } from '../js/config.js';
const ship = process.argv[2] ?? 'aurora';
if (!Object.hasOwn(CONFIG.ships, ship)) throw new Error('Nave válida: aurora o comet');

for (let seed = 1; seed <= 3; seed++) {
  let state = seed, damaged = 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const run = new Session({ ship, random, records: new Records(() => undefined), onEvent: type => { if (type === 'damage') damaged++; } });
  let time = 0;
  while (!run.result && time < 400) {
    const player = run.player, center = player.x + player.width / 2;
    const targets = run.levels.targets.filter(enemy => enemy.alive);
    const enemy = targets.reduce((best, candidate) => Math.abs(candidate.x + candidate.width / 2 - center) < Math.abs(best.x + best.width / 2 - center) ? candidate : best, targets[0]);
    let aim = enemy ? enemy.x + enemy.width / 2 : center;
    if (enemy?.type === 'boss') {
      const b = enemy.spec, flight = (player.y - enemy.y - enemy.height) / CONFIG.projectile.playerSpeed;
      aim = CONFIG.width / 2 + Math.sin(enemy.time + flight * (enemy.enraged ? b.enragedFrequency : b.frequency)) * b.amplitude;
    } else if (enemy) aim += run.levels.formation.direction * run.levels.spec.speed * ((player.y - enemy.y) / CONFIG.projectile.playerSpeed);
    let axis = Math.abs(aim - center) < 5 ? 0 : Math.sign(aim - center);
    const threat = run.projectiles.find(shot => shot.owner === 'enemy' && shot.y > player.y - 65 && shot.y < player.y + player.height && Math.abs(shot.x - center) < 26);
    if (threat && !player.powers.shield && !player.invulnerability) axis = center < 40 ? 1 : center > 440 ? -1 : center < threat.x ? -1 : 1;
    run.update(1 / 60, { axis, firing: true }); time += 1 / 60;
  }
  console.log(JSON.stringify({ ship, seed, result: run.result, sector: run.levels.number, simulatedSeconds: Math.round(time), lives: run.player.lives, score: run.score, damage: damaged, bossHealth: run.levels.boss?.health }));
  if (run.result !== 'victory') process.exitCode = 1;
}
