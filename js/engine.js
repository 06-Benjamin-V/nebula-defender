import { CONFIG } from './config.js';
import { STATES, StateMachine } from './state.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Formation } from './enemies.js';
import { updateProjectiles } from './projectiles.js';
import { resolveCollisions } from './collisions.js';
import { Sprites } from './sprites.js';
import { UI } from './ui.js';
/** Motor único. Los estados suspendidos se dibujan pero no actualizan la simulación. */
export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.debug = new URLSearchParams(location.search).get('debug') === '1';
    this.sprites = new Sprites();
    this.state = new StateMachine(value => { this.input.clear(); this.ui.render(value); });
    this.input = new Input(() => this.togglePause());
    this.ui = new UI(() => this.state.value === STATES.PAUSED ? this.state.set(STATES.PLAYING) : this.start(), () => this.togglePause(), () => this.start());
    this.stars = Array.from({ length: CONFIG.starCount }, () => ({ x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height, bright: Math.random() }));
    this.reset(); this.ui.render(STATES.MENU);
    const autoPause = () => { if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED); };
    window.addEventListener('blur', autoPause);
    document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
    this.lastTime = null;
    requestAnimationFrame(time => this.frame(time));
  }
  reset() { this.player = new Player(); this.formation = new Formation(); this.projectiles = []; this.score = 0; this.ui.setScore(0); this.input.clear(); }
  start() { this.reset(); this.state.set(STATES.PLAYING); }
  togglePause() {
    if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED);
    else if (this.state.value === STATES.PAUSED) this.state.set(STATES.PLAYING);
  }
  update(dt) {
    this.player.update(dt, this.input, this.projectiles);
    this.formation.update(dt, this.projectiles);
    updateProjectiles(this.projectiles, dt);
    const hit = resolveCollisions(this.player, this.formation.enemies, this.projectiles, () => {
      this.score += CONFIG.formation.points; this.ui.setScore(this.score);
    });
    this.projectiles = this.projectiles.filter(shot => shot.alive);
    this.formation.enemies = this.formation.enemies.filter(enemy => enemy.alive);
    if (hit) this.state.set(STATES.DEFEAT);
    else if (!this.formation.enemies.length) this.state.set(STATES.VICTORY);
  }
  draw(dt) {
    const ctx = this.ctx;
    ctx.fillStyle = CONFIG.background; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    for (const star of this.stars) { ctx.fillStyle = star.bright > .65 ? '#7183ac' : '#283854'; ctx.fillRect(star.x, star.y, 1, 1); }
    ctx.strokeStyle = '#1b3045'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(0, this.player.y + this.player.height + 5); ctx.lineTo(CONFIG.width, this.player.y + this.player.height + 5); ctx.stroke(); ctx.setLineDash([]);
    this.sprites.draw(ctx, 'player', this.player.x, this.player.y, CONFIG.player.scale);
    for (const enemy of this.formation.enemies) this.sprites.draw(ctx, 'enemy', enemy.x, enemy.y, CONFIG.formation.scale);
    for (const shot of this.projectiles) this.sprites.draw(ctx, shot.owner === 'player' ? 'bullet' : 'enemyBullet', shot.x, shot.y);
    if (this.debug) {
      ctx.strokeStyle = '#ffb45f';
      for (const entity of [this.player, ...this.formation.enemies, ...this.projectiles]) ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
      ctx.fillStyle = '#ecf8ff'; ctx.font = '10px monospace'; ctx.fillText(`FPS ${dt > 0 ? Math.round(1 / dt) : 0}`, 8, 14);
    }
  }
  frame(time) {
    const rawDelta = this.lastTime === null ? 0 : (time - this.lastTime) / 1000;
    this.lastTime = time;
    if (this.state.value === STATES.PLAYING) this.update(Math.min(rawDelta, CONFIG.maxDelta));
    this.draw(rawDelta);
    requestAnimationFrame(next => this.frame(next));
  }
}
