export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
/** Barrido contra el rectángulo expandido: evita atravesar blancos entre frames. */
export function projectileHits(shot, target) {
  const startX = shot.previousX ?? shot.x, startY = shot.previousY ?? shot.y;
  let enter = 0, exit = 1;
  for (const [start, delta, min, max] of [
    [startX, shot.x - startX, target.x - shot.width, target.x + target.width],
    [startY, shot.y - startY, target.y - shot.height, target.y + target.height],
  ]) {
    if (delta === 0) { if (start < min || start > max) return false; }
    else {
      const a = (min - start) / delta, b = (max - start) / delta;
      enter = Math.max(enter, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
      if (enter > exit) return false;
    }
  }
  return true;
}
/** Un proyectil consume un impacto; cada baja otorga puntos una sola vez. */
export function resolveCollisions(player, enemies, projectiles, onKill, onImpact = () => {}) {
  let playerHit = false;
  for (const shot of projectiles) {
    if (!shot.alive) continue;
    if (shot.owner === 'player') {
      const enemy = enemies.find(candidate => candidate.alive && projectileHits(shot, candidate));
      if (enemy) {
        shot.alive = false; enemy.health = (enemy.health ?? 1) - 1; onImpact(enemy);
        if (enemy.health <= 0) { enemy.alive = false; onKill(enemy); }
      }
    } else if (projectileHits(shot, player.hitbox ?? player)) { shot.alive = false; playerHit = true; }
  }
  return { playerHit, breach: enemies.some(enemy => enemy.alive && enemy.type !== 'boss' && enemy.y + enemy.height >= player.y) };
}
