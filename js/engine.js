import { CONFIG } from './config.js';
import { STATES, StateMachine } from './state.js';
import { Input } from './input.js';
import { Session } from './session.js';
import { Records } from './storage.js';
import { Sprites } from './sprites.js';
import { UI } from './ui.js';
import { Background } from './background.js';
import { Effects } from './effects.js';
/** Un solo loop y listeners únicos; la sesión conserva toda la simulación comprobable sin DOM. */
export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.debug = new URLSearchParams(location.search).get('debug') === '1';
    this.sprites = new Sprites(); this.background = new Background(); this.effects = new Effects();
    this.records = new Records();
    this.motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    this.state = new StateMachine(value => { this.input.clear(); this.ui.render(value); this.ui.sync(this.session, value); });
    this.input = new Input(() => this.togglePause(), this.debug ? number => this.start(number) : null);
    this.ui = new UI(() => this.state.value === STATES.PAUSED ? this.state.set(STATES.PLAYING) : this.start(), () => this.togglePause(), () => this.start());
    this.reset(); this.ui.render(STATES.MENU);
    document.querySelector('#debug-note').hidden = !this.debug;
    const autoPause = () => { if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED); };
    window.addEventListener('blur', autoPause);
    document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
    this.lastTime = null;
    requestAnimationFrame(time => this.frame(time));
  }
  reset(number = 1) {
    this.effects.items = []; this.artTime = 0; this.input.clear();
    this.session = new Session({ debug: this.debug, records: this.records, onEvent: (type, entity) => this.effect(type, entity) });
    if (number !== 1) this.session.loadLevel(number);
    this.ui.sync(this.session, this.state.value);
  }
  start(number = 1) {
    this.reset(number);
    if (this.state.value !== STATES.PLAYING) this.state.set(STATES.PLAYING);
    this.ui.render(STATES.PLAYING);
  }
  togglePause() {
    if (this.state.value === STATES.PLAYING) this.state.set(STATES.PAUSED);
    else if (this.state.value === STATES.PAUSED) this.state.set(STATES.PLAYING);
  }
  effect(type, entity) {
    if (type === 'level') { this.effects.items = []; return; }
    if (type === 'fire') this.effects.add('muzzle', entity.x + entity.width / 2 - 3, entity.y - 6);
    if (type === 'impact' || type === 'power') this.effects.add('impact', entity.x + entity.width / 2 - 3, entity.y + entity.height / 2 - 3);
    if (type === 'kill' || type === 'damage') {
      const scale = entity.type === 'boss' ? CONFIG.boss.scale * 2 : 2;
      this.effects.add('explosion', entity.x + entity.width / 2 - 8 * scale, entity.y + entity.height / 2 - 8 * scale, scale);
    }
  }
  update(dt) {
    this.session.update(dt, this.input);
    if (this.session.result) this.state.set(this.session.result);
  }
  draw(dt) {
    const ctx = this.ctx, { player, levels, powerUps, projectiles } = this.session;
    const reduced = this.motionPreference.matches;
    this.background.draw(ctx);
    ctx.strokeStyle = '#1b3045'; ctx.setLineDash([3, 5]); ctx.beginPath();
    ctx.moveTo(0, player.y + player.height + 5); ctx.lineTo(CONFIG.width, player.y + player.height + 5); ctx.stroke(); ctx.setLineDash([]);
    ctx.save();
    if (player.invulnerability > 0) ctx.globalAlpha = reduced ? 0.6 : Math.floor(player.invulnerability / CONFIG.player.blinkInterval) % 2 ? 0.25 : 1;
    if (player.lives > 0) {
      this.sprites.draw(ctx, 'player', player.x, player.y, CONFIG.player.scale);
      this.sprites.animate(ctx, 'thrust', player.x + 8, player.y + 30, 2, reduced ? 0 : this.artTime, CONFIG.art.thrustFrameInterval);
    }
    ctx.restore();
    if (player.powers.shield > 0) {
      ctx.strokeStyle = CONFIG.palette.p; ctx.lineWidth = 1; ctx.strokeRect(Math.round(player.x - 3), player.y - 3, player.width + 6, player.height + 6);
    }
    for (const enemy of levels.formation?.enemies ?? []) this.sprites.animate(ctx, enemy.type, enemy.x, enemy.y, CONFIG.formation.scale, reduced ? 0 : this.artTime + enemy.column * 0.05);
    if (levels.boss?.alive) {
      const boss = levels.boss;
      this.sprites.draw(ctx, 'boss', boss.x, boss.y, CONFIG.boss.scale);
      if (boss.telegraphing) {
        ctx.fillStyle = boss.enraged ? CONFIG.palette.o : CONFIG.palette.m;
        for (const x of [boss.x + CONFIG.boss.turretInset, boss.x + boss.width - CONFIG.boss.turretInset]) ctx.fillRect(Math.round(x - 2), boss.y + boss.height - 4, 4, 4);
      }
    }
    for (const item of powerUps.items) this.sprites.draw(ctx, item.type, item.x, item.y, CONFIG.powerUps.scale);
    for (const shot of projectiles) this.sprites.draw(ctx, shot.owner === 'player' ? 'bullet' : 'enemyBullet', shot.x, shot.y);
    this.effects.draw(ctx, this.sprites, reduced);
    if (this.debug) {
      ctx.strokeStyle = '#ffb45f';
      for (const entity of [player.hitbox, ...levels.targets, ...projectiles, ...powerUps.items]) ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
      ctx.fillStyle = '#ecf8ff'; ctx.font = '9px monospace';
      ctx.fillText('FPS ' + (dt > 0 ? Math.round(1 / dt) : 0) + ' · DEBUG 1–4 · SIN RÉCORD', 8, CONFIG.height - 5);
    }
    this.ui.sync(this.session, this.state.value);
  }
  frame(time) {
    const rawDelta = this.lastTime === null ? 0 : (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDelta, CONFIG.maxDelta);
    if (this.state.value !== STATES.PAUSED && !document.hidden) {
      this.artTime += dt; this.background.update(dt, this.motionPreference.matches); this.effects.update(dt, this.motionPreference.matches);
    }
    if (this.state.value === STATES.PLAYING) this.update(dt);
    this.draw(rawDelta);
    requestAnimationFrame(next => this.frame(next));
  }
}
