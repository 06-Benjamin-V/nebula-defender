// Resolución y balance de la base jugable. Velocidades en píxeles/segundo; tiempos en segundos.
export const CONFIG = {
  width: 480, height: 320, maxDelta: 0.05,
  player: { width: 16, height: 16, scale: 2, speed: 235, bottomMargin: 18, fireInterval: 0.24 },
  projectile: { width: 3, height: 7, playerSpeed: 310, enemySpeed: 125 },
  formation: { rows: 3, columns: 8, x: 53, y: 38, gapX: 45, gapY: 32, scale: 2,
    speed: 24, descent: 12, margin: 14, fireInterval: 1.05, maxEnemyShots: 5, points: 100 },
  palette: { '.': 'transparent', c: '#64f4e5', b: '#4d80ff', p: '#a68aff', m: '#ff68c6', w: '#ecf8ff', o: '#ffb45f', d: '#253757' },
  background: '#080d1d', starCount: 75,
};
