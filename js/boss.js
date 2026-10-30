import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
import { aimedSlope } from './enemies.js';
export class Boss {
  constructor(spec = CONFIG.boss) {
    const b = this.spec = spec;
    this.width = b.width * b.scale; this.height = b.height * b.scale;
    this.x = (CONFIG.width - this.width) / 2; this.y = b.y;
    this.health = b.health; this.alive = true; this.type = 'boss';
    this.maxHealth = b.health;
    this.time = 0; this.fireTimer = b.fireInterval; this.volley = 0;
  }
  get enraged() { return this.health <= this.maxHealth * this.spec.enragedThreshold; }
  get telegraphing() { return this.fireTimer <= this.spec.telegraphDuration; }
  update(dt, projectiles, player) {
    if (!this.alive) return;
    const b = this.spec;
    this.time += dt * (this.enraged ? b.enragedFrequency : b.frequency);
    this.x = (CONFIG.width - this.width) / 2 + Math.sin(this.time) * b.amplitude;
    this.y = b.y + Math.sin(this.time * 1.5) * (b.driftY ?? 0);
    this.fireTimer -= dt;
    if (this.fireTimer > 0) return;
    this.fireTimer = this.enraged ? b.enragedFireInterval : b.fireInterval;
    const speed = this.enraged ? b.enragedShotSpeed : b.shotSpeed;
    const available = b.maxShots - projectiles.filter(shot => shot.alive && shot.owner === 'enemy').length;
    const volley = this.volley++;
    let emitters = volley % 2 === 0
      ? (this.enraged ? b.enragedFanSlopes : b.fanSlopes).map(slope => ({ x: this.x + this.width / 2, slope }))
      : [this.x + b.turretInset, this.x + this.width - b.turretInset].map(x => ({ x, slope: aimedSlope(x, this.y + this.height, player) }));
    if (b.sweep && volley % 3 === 2) {
      const aim = aimedSlope(this.x + this.width / 2, this.y + this.height, player);
      emitters = [-.45, -.225, 0, .225, .45].map(offset => ({ x: this.x + this.width / 2, slope: aim + offset }));
    }
    for (const { x, slope } of emitters.slice(0, Math.max(0, available))) projectiles.push(createProjectile(x, this.y + this.height, 'enemy', { speed, slope }));
  }
}
