import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
export class Player {
  constructor() {
    this.width = CONFIG.player.width * CONFIG.player.scale;
    this.height = CONFIG.player.height * CONFIG.player.scale;
    this.y = CONFIG.height - this.height - CONFIG.player.bottomMargin;
    this.x = (CONFIG.width - this.width) / 2;
    this.cooldown = 0; this.invulnerability = 0; this.lives = CONFIG.player.lives;
    this.powers = { double: 0, rapid: 0, shield: 0 };
  }
  get hitbox() {
    const inset = CONFIG.player.hitboxInset;
    return { x: this.x + inset, y: this.y + inset, width: this.width - inset * 2, height: this.height - inset * 2 };
  }
  update(dt, input, projectiles, canFire = true) {
    for (const type of CONFIG.powerUps.types) this.powers[type] = Math.max(0, this.powers[type] - dt);
    this.invulnerability = Math.max(0, this.invulnerability - dt);
    this.x = Math.max(0, Math.min(CONFIG.width - this.width, this.x + input.axis * CONFIG.player.speed * dt));
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (canFire && input.firing && this.cooldown <= 0) {
      const center = this.x + this.width / 2;
      const offsets = this.powers.double > 0 ? [-CONFIG.player.doubleOffset, CONFIG.player.doubleOffset] : [0];
      for (const offset of offsets) projectiles.push(createProjectile(center + offset, this.y - CONFIG.projectile.height, 'player'));
      this.cooldown = CONFIG.player.fireInterval * (this.powers.rapid > 0 ? CONFIG.powerUps.rapidMultiplier : 1);
    }
  }
  activate(type) { if (type in this.powers) this.powers[type] = CONFIG.powerUps.duration; }
  damage(breach = false) {
    // Una invasión consume una vida incluso con escudo; la sesión reconstruye la oleada.
    if (!breach && (this.invulnerability > 0 || this.powers.shield > 0)) return false;
    this.lives = Math.max(0, this.lives - 1);
    this.invulnerability = CONFIG.player.invulnerability;
    this.x = (CONFIG.width - this.width) / 2; this.cooldown = 0;
    for (const type of CONFIG.powerUps.types) this.powers[type] = 0;
    return true;
  }
}
