import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
import { aimedSlope } from './enemies.js';
export class Boss {
  constructor() {
    const b = CONFIG.boss;
    this.width = b.width * b.scale; this.height = b.height * b.scale;
    this.x = (CONFIG.width - this.width) / 2; this.y = b.y;
    this.health = b.health; this.alive = true; this.type = 'boss';
    this.time = 0; this.fireTimer = b.fireInterval; this.volley = 0;
  }
  get enraged() { return this.health <= CONFIG.boss.health * CONFIG.boss.enragedThreshold; }
  get telegraphing() { return this.fireTimer <= CONFIG.boss.telegraphDuration; }
  update(dt, projectiles, player) {
    if (!this.alive) return;
    const b = CONFIG.boss;
    this.time += dt * (this.enraged ? b.enragedFrequency : b.frequency);
    this.x = (CONFIG.width - this.width) / 2 + Math.sin(this.time) * b.amplitude;
    this.fireTimer -= dt;
    if (this.fireTimer > 0) return;
    this.fireTimer = this.enraged ? b.enragedFireInterval : b.fireInterval;
    const speed = this.enraged ? b.enragedShotSpeed : b.shotSpeed;
    const available = b.maxShots - projectiles.filter(shot => shot.alive && shot.owner === 'enemy').length;
    const emitters = this.volley++ % 2 === 0
      ? (this.enraged ? b.enragedFanSlopes : b.fanSlopes).map(slope => ({ x: this.x + this.width / 2, slope }))
      : [this.x + b.turretInset, this.x + this.width - b.turretInset].map(x => ({ x, slope: aimedSlope(x, this.y + this.height, player) }));
    for (const { x, slope } of emitters.slice(0, Math.max(0, available))) projectiles.push(createProjectile(x, this.y + this.height, 'enemy', { speed, slope }));
  }
}
