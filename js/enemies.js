import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
export function aimedSlope(x, y, player) {
  return Math.max(-CONFIG.enemyFire.maxAimSlope, Math.min(CONFIG.enemyFire.maxAimSlope,
    (player.x + player.width / 2 - x) / Math.max(1, player.y - y)));
}
export class Formation {
  constructor(level = CONFIG.levels[0], random = Math.random) {
    this.level = level; this.random = random; this.time = 0;
    const f = CONFIG.formation;
    this.enemies = level.rows.flatMap((type, row) => Array.from({ length: f.columns }, (_, column) => {
      const spec = CONFIG.enemies[type], x = f.x + column * f.gapX, y = f.y + row * f.gapY;
      return { x, y, baseX: x, baseY: y, width: 12 * f.scale, height: 12 * f.scale, column, type,
        health: spec.health, alive: true, cooldown: spec.fireInterval * (CONFIG.enemyFire.initialDelayFactor + random()) };
    }));
    this.direction = 1; this.fireTimer = level.volleyInterval;
  }
  update(dt, projectiles, player = { x: CONFIG.width / 2, y: CONFIG.height, width: 0 }) {
    const live = this.enemies.filter(enemy => enemy.alive), f = CONFIG.formation;
    if (!live.length) return;
    this.time += dt;
    const step = this.direction * this.level.speed * dt;
    if (live.some(enemy => enemy.baseX + step - CONFIG.enemies[enemy.type].swayX < f.margin ||
      enemy.baseX + enemy.width + step + CONFIG.enemies[enemy.type].swayX > CONFIG.width - f.margin)) {
      this.direction *= -1;
      live.forEach(enemy => { enemy.baseY += this.level.descent; });
    } else live.forEach(enemy => { enemy.baseX += step; });
    for (const enemy of live) {
      const spec = CONFIG.enemies[enemy.type], wave = Math.sin(this.time * spec.frequency + enemy.column);
      enemy.x = enemy.baseX + wave * spec.swayX; enemy.y = enemy.baseY + wave * spec.swayY;
      enemy.cooldown -= dt;
    }
    this.fireTimer -= dt;
    if (this.fireTimer > 0) return;
    const count = projectiles.filter(shot => shot.alive && shot.owner === 'enemy').length;
    const shooters = live.filter(enemy => enemy.cooldown <= 0 && !live.some(other => other.column === enemy.column && other.baseY > enemy.baseY));
    if (!shooters.length || count >= this.level.maxShots) return;
    const enemy = shooters[Math.floor(this.random() * shooters.length)], spec = CONFIG.enemies[enemy.type];
    const x = enemy.x + enemy.width / 2, y = enemy.y + enemy.height;
    const slopes = spec.pattern === 'spread' ? CONFIG.enemyFire.spreadSlopes : [spec.pattern === 'aimed' ? aimedSlope(x, y, player) : 0];
    for (const slope of slopes.slice(0, this.level.maxShots - count)) projectiles.push(createProjectile(x, y, 'enemy', { slope, speed: spec.shotSpeed }));
    enemy.cooldown = spec.fireInterval; this.fireTimer = this.level.volleyInterval;
  }
}
