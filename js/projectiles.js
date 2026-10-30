import { CONFIG } from './config.js';
export function createProjectile(x, y, owner) {
  const spec = CONFIG.projectile;
  return { x: x - spec.width / 2, y, width: spec.width, height: spec.height, owner,
    velocity: owner === 'player' ? -spec.playerSpeed : spec.enemySpeed, alive: true };
}
export function updateProjectiles(projectiles, dt) {
  for (const shot of projectiles) { shot.y += shot.velocity * dt; if (shot.y + shot.height < 0 || shot.y > CONFIG.height) shot.alive = false; }
}
