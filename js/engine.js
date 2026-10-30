import { CONFIG } from './config.js';
import { STATES, StateMachine } from './state.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Formation } from './enemies.js';
import { updateProjectiles } from './projectiles.js';
import { resolveCollisions } from './collisions.js';
import { Sprites } from './sprites.js';
import { UI } from './ui.js';
import { Background } from './background.js';
import { Effects } from './effects.js';
/** Motor único. Los estados suspendidos se dibujan pero no actualizan la simulación. */
export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.debug = new URLSearchParams(location.search).get('debug') === '1';
    this.sprites = new Sprites();
    this.background = new Background();
    this.effects = new Effects();
    this.motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    this.state = new StateMachine(value => { this.input.clear(); this.ui.render(value); });
    this.input = new Input(() => this.togglePause());
    this.ui = new UI(() => this.state.value === STATES.PAUSED ? this.state.set(STATES.PLAYING) : this.start(), () => this.togglePause(), () => this.start());
    this.reset(); this.ui.render(STATES.MENU);
    const autoPause = () => { if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED); };
    window.addEventListener('blur', autoPause);
    document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
    this.lastTime = null;
    requestAnimationFrame(time => this.frame(time));
  }
  reset() { this.player = new Player(); this.formation = new Formation(); this.projectiles = []; this.effects.items = []; this.artTime = 0; this.score = 0; this.ui.setScore(0); this.input.clear(); }
  start() { this.reset(); this.state.set(STATES.PLAYING); }
  togglePause() {
    if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED);
    else if (this.state.value === STATES.PAUSED) this.state.set(STATES.PLAYING);
  }
  update(dt) {
    const previousShots = this.projectiles.length;
    this.player.update(dt, this.input, this.projectiles);
    if (this.projectiles.length > previousShots) this.effects.add('muzzle', this.player.x + this.player.width / 2 - 3, this.player.y - 6);
    this.formation.update(dt, this.projectiles);
    updateProjectiles(this.projectiles, dt);
    const hit = resolveCollisions(this.player, this.formation.enemies, this.projectiles, enemy => {
      this.score += CONFIG.formation.points; this.ui.setScore(this.score);
      this.effects.add('explosion', enemy.x + enemy.width / 2 - 16, enemy.y + enemy.height / 2 - 16, 2);
      this.effects.add('impact', enemy.x + enemy.width / 2 - 3, enemy.y + enemy.height / 2 - 3);
    });
    this.projectiles = this.projectiles.filter(shot => shot.alive);
    this.formation.enemies = this.formation.enemies.filter(enemy => enemy.alive);
    if (hit) {
      this.effects.add('explosion', this.player.x, this.player.y, 2);
      this.state.set(STATES.DEFEAT);
    }
    else if (!this.formation.enemies.length) this.state.set(STATES.VICTORY);
  }
  draw(dt) {
    const ctx = this.ctx;
    this.background.draw(ctx);
    ctx.strokeStyle = '#1b3045'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(0, this.player.y + this.player.height + 5); ctx.lineTo(CONFIG.width, this.player.y + this.player.height + 5); ctx.stroke(); ctx.setLineDash([]);
    this.sprites.draw(ctx, 'player', this.player.x, this.player.y, CONFIG.player.scale);
    if (this.state.value !== STATES.DEFEAT) this.sprites.animate(ctx, 'thrust', this.player.x + 8, this.player.y + 30, 2, this.motionPreference.matches ? 0 : this.artTime, CONFIG.art.thrustFrameInterval);
    for (const enemy of this.formation.enemies) this.sprites.animate(ctx, 'scout', enemy.x, enemy.y, CONFIG.formation.scale, this.motionPreference.matches ? 0 : this.artTime + enemy.column * 0.05);
    for (const shot of this.projectiles) this.sprites.draw(ctx, shot.owner === 'player' ? 'bullet' : 'enemyBullet', shot.x, shot.y);
    this.effects.draw(ctx, this.sprites, this.motionPreference.matches);
    if (this.debug) {
      ctx.strokeStyle = '#ffb45f';
      for (const entity of [this.player, ...this.formation.enemies, ...this.projectiles]) ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
      ctx.fillStyle = '#ecf8ff'; ctx.font = '10px monospace'; ctx.fillText(`FPS ${dt > 0 ? Math.round(1 / dt) : 0}`, 8, 14);
    }
  }
  frame(time) {
    const rawDelta = this.lastTime === null ? 0 : (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDelta, CONFIG.maxDelta);
    if (this.state.value !== STATES.PAUSED && !document.hidden) {
      this.artTime += dt;
      this.background.update(dt, this.motionPreference.matches);
      this.effects.update(dt, this.motionPreference.matches);
    }
    if (this.state.value === STATES.PLAYING) this.update(dt);
    this.draw(rawDelta);
    requestAnimationFrame(next => this.frame(next));
  }
}
