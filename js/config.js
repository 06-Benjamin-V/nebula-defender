// Todo el balance: distancias en píxeles lógicos, velocidades en píxeles/segundo y tiempos en segundos.
export const CONFIG = {
  width: 480, height: 320, maxDelta: 0.05,
  player: { width: 16, height: 16, scale: 2, speed: 235, bottomMargin: 18, fireInterval: 0.24,
    lives: 3, invulnerability: 1.8, hitboxInset: 5, blinkInterval: 0.12, doubleOffset: 8 },
  projectile: { width: 3, height: 7, playerSpeed: 310, enemySpeed: 125 },
  formation: { columns: 8, x: 53, y: 38, gapX: 45, gapY: 32, scale: 2, margin: 14 },
  // Cada especie tiene salud, puntos, movimiento y cadencia propios. Dispara la base de cada columna.
  enemies: {
    scout: { health: 1, points: 100, fireInterval: 2.8, shotSpeed: 125, pattern: 'straight', swayX: 0, swayY: 0, frequency: 0 },
    wraith: { health: 1, points: 150, fireInterval: 2.1, shotSpeed: 145, pattern: 'aimed', swayX: 0, swayY: 7, frequency: 2.5 },
    sentinel: { health: 2, points: 250, fireInterval: 3.3, shotSpeed: 130, pattern: 'spread', swayX: 3, swayY: 0, frequency: 1.8 },
  },
  enemyFire: { initialDelayFactor: 0.5, maxAimSlope: 0.65, spreadSlopes: [-0.32, 0, 0.32] },
  // Filas de arriba hacia abajo; nivel 4 exclusivo del jefe.
  levels: [
    { name: 'ÓRBITA EXTERIOR', rows: ['scout', 'scout', 'scout'], speed: 24, descent: 10, volleyInterval: 1.05, maxShots: 5 },
    { name: 'CINTURÓN ESPECTRAL', rows: ['wraith', 'scout', 'wraith'], speed: 32, descent: 12, volleyInterval: 0.85, maxShots: 7 },
    { name: 'BASTIÓN CARMESÍ', rows: ['sentinel', 'wraith', 'sentinel'], speed: 40, descent: 14, volleyInterval: 0.72, maxShots: 10 },
    { name: 'NÉMESIS', boss: true },
  ],
  campaign: { introDuration: 1.5 },
  powerUps: { chance: 0.2, types: ['double', 'rapid', 'shield'], duration: 8, fallSpeed: 44,
    size: 10, scale: 2, rapidMultiplier: 0.48, maxDrops: 4 },
  boss: { width: 48, height: 32, scale: 2, y: 28, health: 80, points: 3000,
    amplitude: 150, frequency: 0.65, enragedFrequency: 0.95, enragedThreshold: 0.5,
    fireInterval: 1.2, enragedFireInterval: 0.8, shotSpeed: 145, enragedShotSpeed: 165,
    fanSlopes: [-0.55, 0, 0.55], enragedFanSlopes: [-0.8, -0.4, 0, 0.4, 0.8],
    turretInset: 10, telegraphDuration: 0.3, maxShots: 18 },
  storage: { recordKey: 'nebula-defender-record' },
  palette: { '.': 'transparent', c: '#64f4e5', b: '#4d80ff', p: '#a68aff', m: '#ff68c6', w: '#ecf8ff', o: '#ffb45f', d: '#253757' },
  background: '#080d1d',
  // Ritmos puramente visuales, independientes del movimiento y de los disparos.
  art: { enemyFrameInterval: 0.38, thrustFrameInterval: 0.09, explosionFrameInterval: 0.075,
    flashFrameInterval: 0.045, maxEffects: 48,
    starLayers: [{ count: 45, speed: 2, color: '#26324f' }, { count: 26, speed: 6, color: '#475777' }, { count: 12, speed: 13, color: '#8296b2' }] },
};
