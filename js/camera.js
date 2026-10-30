import { CONFIG } from './config.js';
/** Desplazamiento exclusivamente visual; el HUD y las coordenadas de colisión permanecen estables. */
export class Camera {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() { this.remaining = 0; this.duration = 0; this.strength = 0; this.x = 0; this.y = 0; }
  kick(kind, reducedMotion = false) {
    if (reducedMotion) { this.reset(); return; }
    const spec = CONFIG.feedback.shake[kind];
    if (!spec) return;
    this.remaining = Math.max(this.remaining, spec.duration); this.duration = this.remaining;
    this.strength = Math.max(this.strength, spec.strength);
  }
  update(dt, reducedMotion = false) {
    if (reducedMotion || this.remaining <= dt) { this.reset(); return; }
    this.remaining -= dt;
    const strength = this.strength * this.remaining / this.duration;
    this.x = Math.round((this.random() * 2 - 1) * strength);
    this.y = Math.round((this.random() * 2 - 1) * strength);
  }
}
