import { CONFIG } from './config.js';
export function createProjectile(x, y, owner, options = {}) {
  const spec = CONFIG.projectile;
  const speed = options.speed ?? (owner === 'player' ? spec.playerSpeed : spec.enemySpeed);
  const slope = options.slope ?? 0;
  return { x: x - spec.width / 2, y, previousX: x - spec.width / 2, previousY: y,
    width: spec.width, height: spec.height, owner, vx: slope * speed / Math.hypot(1, slope),
    velocity: (owner === 'player' ? -1 : 1) * speed / Math.hypot(1, slope), alive: true };
}
export function updateProjectiles(projectiles, dt) {
  for (const shot of projectiles) {
    shot.previousX = shot.x; shot.previousY = shot.y;
    shot.x += shot.vx * dt; shot.y += shot.velocity * dt;
    if (shot.y + shot.height < 0 || shot.y > CONFIG.height || shot.x + shot.width < 0 || shot.x > CONFIG.width) shot.alive = false;
  }
}
