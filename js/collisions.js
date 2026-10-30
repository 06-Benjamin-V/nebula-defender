export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
/** Cada proyectil consume como máximo una colisión por actualización. */
export function resolveCollisions(player, enemies, projectiles, onKill) {
  let playerHit = false;
  for (const shot of projectiles) {
    if (!shot.alive) continue;
    if (shot.owner === 'player') {
      const enemy = enemies.find(candidate => candidate.alive && overlaps(shot, candidate));
      if (enemy) { shot.alive = false; enemy.alive = false; onKill(enemy); }
    } else if (overlaps(shot, player)) { shot.alive = false; playerHit = true; }
  }
  return playerHit || enemies.some(enemy => enemy.alive && enemy.y + enemy.height >= player.y);
}
