import { CONFIG } from './config.js';
import { SPRITES, ANIMATIONS } from './sprite-data.js';
export { SPRITES, ANIMATIONS };
export class Sprites {
  constructor() {
    this.cache = new Map();
    for (const [name, rows] of Object.entries(SPRITES)) {
      const canvas = document.createElement('canvas');
      canvas.width = rows[0].length; canvas.height = rows.length;
      const ctx = canvas.getContext('2d');
      rows.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== '.') { ctx.fillStyle = CONFIG.palette[pixel]; ctx.fillRect(x, y, 1, 1); }
      }));
      this.cache.set(name, canvas);
    }
  }
  draw(ctx, name, x, y, scale = 1) { const sprite = this.cache.get(name); ctx.drawImage(sprite, Math.round(x), Math.round(y), sprite.width * scale, sprite.height * scale); }
  animate(ctx, name, x, y, scale, time, interval = CONFIG.art.enemyFrameInterval) {
    const frames = ANIMATIONS[name];
    this.draw(ctx, frames[Math.floor(time / interval) % frames.length], x, y, scale);
  }
}
