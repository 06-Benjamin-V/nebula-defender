import { CONFIG } from './config.js';
/** Partículas pequeñas y acotadas: se descartan al expirar y se omiten con movimiento reducido. */
export class Particles {
  constructor(random = Math.random) { this.random = random; this.items = []; }
  clear() { this.items = []; }
  burst(x, y, kind, reducedMotion = false) {
    if (reducedMotion) return;
    const spec = CONFIG.feedback;
    const colors = kind === 'power' || kind === 'blocked' ? ['c', 'p', 'w'] : ['o', 'm', 'p'];
    const count = Math.min(spec.bursts[kind] ?? spec.bursts.kill, spec.maxParticles - this.items.length);
    for (let i = 0; i < count; i++) {
      const angle = this.random() * Math.PI * 2, speed = spec.speedMin + this.random() * (spec.speedMax - spec.speedMin);
      const life = spec.lifeMin + this.random() * (spec.lifeMax - spec.lifeMin);
      this.items.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life, remaining: life, size: this.random() < 0.7 ? 1 : 2, color: CONFIG.palette[colors[i % colors.length]] });
    }
  }
  update(dt, reducedMotion = false) {
    if (reducedMotion) { this.clear(); return; }
    for (const item of this.items) {
      item.remaining -= dt; item.vy += CONFIG.feedback.gravity * dt;
      item.x += item.vx * dt; item.y += item.vy * dt;
    }
    this.items = this.items.filter(item => item.remaining > 0);
  }
  draw(ctx) {
    ctx.save();
    for (const item of this.items) {
      ctx.globalAlpha = Math.min(1, item.remaining / item.life * 2); ctx.fillStyle = item.color;
      ctx.fillRect(Math.round(item.x), Math.round(item.y), item.size, item.size);
    }
    ctx.restore();
  }
}
