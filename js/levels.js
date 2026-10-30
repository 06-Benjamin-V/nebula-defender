import { CONFIG } from './config.js';
import { Formation } from './enemies.js';
import { Boss } from './boss.js';
/** Diez sectores; derrotar a Némesis abre la segunda ruta, Eclipse concede victoria. */
export class Levels {
  constructor(random = Math.random) { this.random = random; this.load(1); }
  load(number) {
    this.number = Math.max(1, Math.min(CONFIG.levels.length, number));
    this.spec = CONFIG.levels[this.number - 1];
    this.formation = this.spec.boss ? null : new Formation(this.spec, this.random);
    this.boss = this.spec.boss ? new Boss(this.spec.boss === 'eclipse' ? { ...CONFIG.boss, ...CONFIG.finalBoss } : CONFIG.boss) : null;
    this.intro = CONFIG.campaign.introDuration;
  }
  get targets() { return this.boss ? [this.boss].filter(boss => boss.alive) : this.formation.enemies; }
  get cleared() { return this.targets.every(target => !target.alive); }
  update(dt, projectiles, player) {
    if (this.boss) this.boss.update(dt, projectiles, player);
    else this.formation.update(dt, projectiles, player);
  }
}
