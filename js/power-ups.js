import { CONFIG } from './config.js';
import { overlaps } from './collisions.js';
export class PowerUps {
  constructor(random = Math.random) { this.items = []; this.random = random; }
  drop(enemy) {
    const spec = CONFIG.powerUps;
    if (this.items.length >= spec.maxDrops || this.random() >= spec.chance) return;
    const size = spec.size * spec.scale;
    this.items.push({ x: Math.max(0, Math.min(CONFIG.width - size, enemy.x + enemy.width / 2 - size / 2)),
      y: enemy.y, width: size, height: size, type: spec.types[Math.floor(this.random() * spec.types.length)], alive: true });
  }
  update(dt, player, onCollect = () => {}) {
    for (const item of this.items) {
      item.y += CONFIG.powerUps.fallSpeed * dt;
      if (overlaps(item, player)) { player.activate(item.type); item.alive = false; onCollect(item); }
      if (item.y > CONFIG.height) item.alive = false;
    }
    this.items = this.items.filter(item => item.alive);
  }
}
