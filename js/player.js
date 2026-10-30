import { CONFIG } from './config.js';
import { createProjectile } from './projectiles.js';
export class Player {
  constructor() {
    this.width = CONFIG.player.width * CONFIG.player.scale;
    this.height = CONFIG.player.height * CONFIG.player.scale;
    this.x = (CONFIG.width - this.width) / 2;
    this.y = CONFIG.height - this.height - CONFIG.player.bottomMargin;
    this.cooldown = 0;
  }
  update(dt, input, projectiles) {
    this.x = Math.max(0, Math.min(CONFIG.width - this.width, this.x + input.axis * CONFIG.player.speed * dt));
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (input.firing && this.cooldown <= 0) {
      projectiles.push(createProjectile(this.x + this.width / 2, this.y - CONFIG.projectile.height, 'player'));
      this.cooldown = CONFIG.player.fireInterval;
    }
  }
}
