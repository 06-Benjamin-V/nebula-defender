import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
export class Formation {
  constructor() {
    const f = CONFIG.formation;
    this.enemies = Array.from({ length: f.rows * f.columns }, (_, i) => ({
      x: f.x + (i % f.columns) * f.gapX, y: f.y + Math.floor(i / f.columns) * f.gapY,
      width: 12 * f.scale, height: 12 * f.scale, column: i % f.columns, alive: true,
    }));
    this.direction = 1; this.fireTimer = f.fireInterval;
  }
  update(dt, projectiles) {
    const f = CONFIG.formation;
    const live = this.enemies.filter(enemy => enemy.alive);
    if (!live.length) return;
    const step = this.direction * f.speed * dt;
    if (live.some(enemy => enemy.x + step < f.margin || enemy.x + enemy.width + step > CONFIG.width - f.margin)) {
      this.direction *= -1;
      live.forEach(enemy => { enemy.y += f.descent; });
    } else live.forEach(enemy => { enemy.x += step; });
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = f.fireInterval;
      if (projectiles.filter(shot => shot.alive && shot.owner === 'enemy').length >= f.maxEnemyShots) return;
      // Solo dispara el invasor inferior de cada columna, sin atravesar aliados.
      const shooters = live.filter(enemy => !live.some(other => other.column === enemy.column && other.y > enemy.y));
      const enemy = shooters[Math.floor(Math.random() * shooters.length)];
      projectiles.push(createProjectile(enemy.x + enemy.width / 2, enemy.y + enemy.height, 'enemy'));
    }
  }
}
