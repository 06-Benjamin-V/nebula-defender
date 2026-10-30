import { CONFIG } from './config.js';
import { ANIMATIONS } from './sprite-data.js';
/** Secuencias de sprites; las partículas y la cámara tienen módulos independientes. */
export class Effects {
  constructor() { this.items = []; }
  add(type, x, y, scale = 1) {
    if (this.items.length >= CONFIG.art.maxEffects) this.items.shift();
    this.items.push({ type, x, y, scale, age: 0 });
  }
  interval(type, reducedMotion) {
    return reducedMotion ? CONFIG.art.explosionFrameInterval * 2 : type === 'explosion' ? CONFIG.art.explosionFrameInterval : CONFIG.art.flashFrameInterval;
  }
  update(dt, reducedMotion) {
    for (const effect of this.items) effect.age += dt;
    this.items = this.items.filter(effect => effect.age < ANIMATIONS[effect.type].length * this.interval(effect.type, reducedMotion));
  }
  draw(ctx, sprites, reducedMotion) {
    for (const effect of this.items) {
      const frames = ANIMATIONS[effect.type];
      const index = reducedMotion ? frames.length - 1 : Math.min(frames.length - 1, Math.floor(effect.age / this.interval(effect.type, false)));
      sprites.draw(ctx, frames[index], effect.x, effect.y, effect.scale);
    }
  }
}
