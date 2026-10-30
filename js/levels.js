import { CONFIG } from './config.js';
import { Formation } from './enemies.js';
import { Boss } from './boss.js';
/** Cinco sectores reales; solo destruir al jefe del último concede la victoria. */
export class Levels {
  constructor(random = Math.random) { this.random = random; this.load(1); }
  load(number) {
    this.number = Math.max(1, Math.min(CONFIG.levels.length, number));
    this.spec = CONFIG.levels[this.number - 1];
    this.formation = this.spec.boss ? null : new Formation(this.spec, this.random);
    this.boss = this.spec.boss ? new Boss() : null;
    this.intro = CONFIG.campaign.introDuration;
  }
  get targets() { return this.boss ? [this.boss].filter(boss => boss.alive) : this.formation.enemies; }
  get cleared() { return this.targets.every(target => !target.alive); }
  update(dt, projectiles, player) {
    if (this.boss) this.boss.update(dt, projectiles, player);
    else this.formation.update(dt, projectiles, player);
  }
}
