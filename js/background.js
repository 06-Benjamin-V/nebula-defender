import { CONFIG } from './config.js';
/** Nebulosa calculada una vez; tres capas de estrellas reutilizadas sin asignaciones por frame. */
export class Background {
  constructor() {
    this.layers = CONFIG.art.starLayers.map(layer => ({ ...layer,
      stars: Array.from({ length: layer.count }, () => ({ x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height })),
    }));
    this.nebula = document.createElement('canvas');
    this.nebula.width = CONFIG.width; this.nebula.height = CONFIG.height;
    const ctx = this.nebula.getContext('2d');
    ctx.fillStyle = CONFIG.background; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    for (const [x, y, radius, color] of [[365, 85, 210, '#542a672a'], [65, 240, 180, '#194e6e2b']]) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color); glow.addColorStop(1, '#080d1d00');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    }
  }
  update(dt, reducedMotion) {
    if (reducedMotion) return;
    for (const layer of this.layers) for (const star of layer.stars) star.y = (star.y + layer.speed * dt) % CONFIG.height;
  }
  draw(ctx) {
    ctx.drawImage(this.nebula, 0, 0);
    for (const layer of this.layers) {
      ctx.fillStyle = layer.color;
      for (const star of layer.stars) ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
    }
  }
}
