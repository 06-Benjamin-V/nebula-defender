import { CONFIG } from './config.js';
import { Player } from './player.js';
import { Levels } from './levels.js';
import { PowerUps } from './power-ups.js';
import { Records } from './storage.js';
import { updateProjectiles } from './projectiles.js';
import { resolveCollisions } from './collisions.js';
/** Simulación independiente del DOM; pausa y render pertenecen al motor. */
export class Session {
  constructor({ debug = false, records = new Records(), random = Math.random, onEvent = () => {}, ship = 'aurora' } = {}) {
    this.debug = debug; this.records = records; this.onEvent = onEvent;
    this.player = new Player(ship); this.levels = new Levels(random); this.powerUps = new PowerUps(random);
    this.projectiles = []; this.score = 0; this.result = null;
  }
  loadLevel(number) {
    this.levels.load(number); this.projectiles = []; this.powerUps.items = [];
    this.onEvent('level', { number: this.levels.number });
  }
  update(dt, input) {
    if (this.result) return;
    const player = this.player, levels = this.levels, waiting = levels.intro > 0;
    const before = this.projectiles.length;
    player.update(dt, input, this.projectiles, !waiting);
    if (this.projectiles.length > before) this.onEvent('fire', player);
    if (waiting) { levels.intro = Math.max(0, levels.intro - dt); return; }
    levels.update(dt, this.projectiles, player);
    updateProjectiles(this.projectiles, dt);
    const { playerHit, breach } = resolveCollisions(player, levels.targets, this.projectiles, enemy => {
      this.score += enemy.type === 'boss' ? enemy.spec.points : CONFIG.enemies[enemy.type].points;
      if (!this.debug) this.records.update(this.score);
      this.onEvent('kill', enemy);
      if (enemy.type !== 'boss') this.powerUps.drop(enemy);
    }, enemy => this.onEvent('impact', enemy));
    const hitLocation = { x: player.x, y: player.y, width: player.width, height: player.height };
    const damaged = (breach || playerHit) && player.damage(breach);
    if (damaged) {
      this.onEvent('damage', hitLocation);
      this.projectiles = this.projectiles.filter(shot => shot.owner === 'player');
      if (player.lives === 0) { this.result = 'defeat'; return; }
      if (breach) { this.loadLevel(levels.number); return; }
    } else if (playerHit) this.onEvent('blocked', hitLocation);
    this.powerUps.update(dt, player, item => this.onEvent('power', item));
    this.projectiles = this.projectiles.filter(shot => shot.alive);
    if (levels.formation) levels.formation.enemies = levels.formation.enemies.filter(enemy => enemy.alive);
    if (levels.cleared) {
      if (levels.number === CONFIG.levels.length) this.result = 'victory';
      else {
        if (levels.boss) { player.lives = player.maxLives; player.invulnerability = CONFIG.player.invulnerability; }
        this.loadLevel(levels.number + 1);
      }
    }
  }
}
