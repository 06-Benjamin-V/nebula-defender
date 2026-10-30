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
  storage: { recordKey: 'nebula-defender-record', mutedKey: 'nebula-defender-muted', volumeKey: 'nebula-defender-volume' },
  // Presentación: límites de partículas y vibraciones en píxeles lógicos; no afectan las colisiones.
  feedback: { maxParticles: 160, gravity: 24, speedMin: 25, speedMax: 85, lifeMin: 0.2, lifeMax: 0.55,
    bursts: { impact: 3, kill: 12, heavy: 20, damage: 22, power: 14, blocked: 5, boss: 42 },
    shake: { damage: { strength: 2, duration: 0.24 }, heavy: { strength: 1, duration: 0.12 }, boss: { strength: 3, duration: 0.4 } } },
  // Audio sintetizado. Volumen maestro moderado, límite de voces y cadencia mínima por efecto.
  audio: { defaultVolume: 0.4, masterGain: 0.22, maxVoices: 12, minInterval: 0.045, attack: 0.006,
    startupTimeoutMs: 3000, // Espera máxima de activación del dispositivo antes de continuar en silencio.
    cues: {
      fire: [{ frequency: 880, end: 180, duration: 0.075, wave: 'square', gain: 0.08 }],
      impact: [{ frequency: 170, end: 65, duration: 0.055, wave: 'triangle', gain: 0.15 }],
      kill: [{ frequency: 125, end: 28, duration: 0.2, wave: 'sawtooth', gain: 0.16 }],
      damage: [{ frequency: 100, end: 30, duration: 0.3, wave: 'square', gain: 0.12 }],
      blocked: [{ frequency: 390, end: 160, duration: 0.08, wave: 'sine', gain: 0.15 }],
      power: [{ frequency: 440, duration: 0.12, wave: 'triangle', gain: 0.2 }, { frequency: 660, delay: 0.07, duration: 0.12, wave: 'triangle', gain: 0.2 }, { frequency: 880, delay: 0.14, duration: 0.16, wave: 'triangle', gain: 0.2 }],
      select: [{ frequency: 540, end: 780, duration: 0.045, wave: 'sine', gain: 0.18 }],
      start: [{ frequency: 220, duration: 0.1, wave: 'triangle', gain: 0.2 }, { frequency: 440, delay: 0.1, duration: 0.1, wave: 'triangle', gain: 0.2 }, { frequency: 660, delay: 0.2, duration: 0.2, wave: 'triangle', gain: 0.2 }],
      pause: [{ frequency: 330, end: 220, duration: 0.1, wave: 'sine', gain: 0.15 }],
      level: [{ frequency: 330, duration: 0.12, wave: 'triangle', gain: 0.15 }, { frequency: 660, delay: 0.12, duration: 0.2, wave: 'triangle', gain: 0.15 }],
      victory: [{ frequency: 392, duration: 0.16, wave: 'triangle', gain: 0.2 }, { frequency: 523, delay: 0.16, duration: 0.16, wave: 'triangle', gain: 0.2 }, { frequency: 659, delay: 0.32, duration: 0.16, wave: 'triangle', gain: 0.2 }, { frequency: 784, delay: 0.48, duration: 0.4, wave: 'triangle', gain: 0.2 }],
      defeat: [{ frequency: 220, duration: 0.2, wave: 'triangle', gain: 0.2 }, { frequency: 165, delay: 0.2, duration: 0.2, wave: 'triangle', gain: 0.2 }, { frequency: 110, delay: 0.4, duration: 0.35, wave: 'triangle', gain: 0.2 }],
    } },
  palette: { '.': 'transparent', c: '#64f4e5', b: '#4d80ff', p: '#a68aff', m: '#ff68c6', w: '#ecf8ff', o: '#ffb45f', d: '#253757' },
  background: '#080d1d',
  // Ritmos puramente visuales, independientes del movimiento y de los disparos.
  art: { enemyFrameInterval: 0.38, thrustFrameInterval: 0.09, explosionFrameInterval: 0.075,
    flashFrameInterval: 0.045, maxEffects: 48,
    starLayers: [{ count: 45, speed: 2, color: '#26324f' }, { count: 26, speed: 6, color: '#475777' }, { count: 12, speed: 13, color: '#8296b2' }] },
};
