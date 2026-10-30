import { CONFIG } from './config.js';
import { STATES } from './state.js';
import { Dialogs } from './dialogs.js';
export class UI {
  constructor(onPrimary, onPause, onRestart, { onToggleSound, onVolume, onPreview, onSelect, beforeDialog, afterDialog } = {}) {
    this.overlay = document.querySelector('#overlay');
    this.primary = document.querySelector('#primary'); this.restart = document.querySelector('#restart');
    this.pause = document.querySelector('#pause');
    this.nodes = Object.fromEntries(['score', 'record', 'lives', 'level', 'power-empty', 'power-double', 'power-rapid', 'power-shield', 'boss-panel', 'boss-health', 'boss-mode', 'level-banner', 'level-label', 'level-name', 'result-score', 'result-level', 'result-lives', 'new-record'].map(id => [id, document.getElementById(id)]));
    this.primary.addEventListener('click', () => { onPrimary(); this.primary.blur(); });
    this.pause.addEventListener('click', () => { onPause(); this.pause.blur(); });
    this.restart.addEventListener('click', () => { onRestart(); this.restart.blur(); });
    this.soundButtons = [...document.querySelectorAll('[data-sound-toggle]')];
    this.volume = document.querySelector('#volume');
    this.preview = document.querySelector('#audio-preview');
    this.audioStatus = document.querySelector('#audio-status');
    this.volumeValue = document.querySelector('#volume-value');
    for (const button of this.soundButtons) button.addEventListener('click', onToggleSound);
    this.volume.addEventListener('input', event => onVolume(Number(event.target.value) / 100));
    this.volume.addEventListener('change', onSelect);
    this.preview.addEventListener('click', onPreview);
    document.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button && !button.disabled) onSelect();
    });
    this.dialogs = new Dialogs(beforeDialog, afterDialog);
    document.querySelector('#help-power-duration').textContent = CONFIG.powerUps.duration;
  }
  get dialogOpen() { return this.dialogs.isOpen; }
  setStarting(value) {
    this.starting = value;
    this.primary.disabled = value; this.restart.disabled = value;
    if (value) this.primary.textContent = 'PREPARANDO MISIÓN…';
    else this.render(this.currentState);
  }
  setHero(sprites) {
    const ctx = document.querySelector('#menu-ship').getContext('2d'); ctx.imageSmoothingEnabled = false;
    sprites.draw(ctx, 'player', 16, 8, 4); sprites.draw(ctx, 'thrust0', 32, 68, 4);
  }
  syncAudio(audio) {
    for (const button of this.soundButtons) {
      const label = audio.muted ? 'Sonido silenciado' : 'Sonido activado';
      if (button.textContent !== label) button.textContent = label;
      button.setAttribute('aria-pressed', String(!audio.muted));
      button.title = audio.muted ? 'Activar sonido' : 'Silenciar sonido';
    }
    const volume = String(Math.round(audio.volume * 100));
    if (this.volume.value !== volume) this.volume.value = volume;
    this.volumeValue.textContent = volume + ' %';
    this.preview.disabled = !audio.allowed || !audio.available || audio.muted || audio.volume === 0 || audio.context?.state !== 'running';
    const status = !audio.available ? 'No se pudo iniciar el audio. Puedes seguir jugando en silencio.'
      : !audio.allowed ? 'El audio se activa al pulsar Jugar. Tu preferencia se guarda en este navegador.'
      : audio.muted ? 'Sonido silenciado. Tu preferencia está guardada en este navegador.'
      : audio.volume === 0 ? 'Volumen a cero. Súbelo para escuchar los efectos.'
      : 'Efectos de sonido listos. El volumen y el silencio se guardan automáticamente.';
    if (this.audioStatus.textContent !== status) this.audioStatus.textContent = status;
  }
  text(id, value) { if (this.nodes[id].textContent !== value) this.nodes[id].textContent = value; }
  sync(session, state, recordAtStart = 0) {
    const { player, levels } = session;
    this.text('score', String(session.score).padStart(6, '0'));
    this.text('record', String(session.records.score).padStart(6, '0'));
    this.text('lives', player.lives + ' / ' + CONFIG.player.lives);
    this.text('result-score', String(session.score).padStart(6, '0'));
    this.text('result-level', String(levels.number).padStart(2, '0') + ' / ' + String(CONFIG.levels.length).padStart(2, '0'));
    this.text('result-lives', player.lives + ' / ' + CONFIG.player.lives);
    this.nodes['new-record'].hidden = session.debug || session.score <= recordAtStart || ![STATES.VICTORY, STATES.DEFEAT].includes(state);
    this.text('level', String(levels.number).padStart(2, '0') + ' / ' + levels.spec.name);
    const labels = { double: 'DOBLE', rapid: 'RÁPIDO', shield: 'ESCUDO' };
    for (const type of CONFIG.powerUps.types) {
      this.nodes['power-' + type].hidden = player.powers[type] <= 0;
      this.text('power-' + type, labels[type] + ' · ' + Math.ceil(player.powers[type]) + ' s');
    }
    this.nodes['power-empty'].hidden = Object.values(player.powers).some(time => time > 0);
    this.nodes['boss-panel'].hidden = !levels.boss || state === STATES.MENU;
    if (levels.boss) {
      this.nodes['boss-health'].max = CONFIG.boss.health;
      this.nodes['boss-health'].value = Math.max(0, levels.boss.health);
      this.text('boss-mode', levels.boss.enraged ? 'REACTOR INESTABLE' : 'BLINDAJE ACTIVO');
    }
    this.nodes['level-banner'].hidden = levels.intro <= 0 || state !== STATES.PLAYING;
    this.text('level-label', 'SECTOR ' + String(levels.number).padStart(2, '0'));
    this.text('level-name', levels.spec.name);
  }
  render(state) {
    this.currentState = state;
    const playing = state === STATES.PLAYING;
    this.overlay.hidden = playing;
    this.overlay.dataset.state = state;
    document.querySelector('#menu-emblem').hidden = state !== STATES.MENU;
    document.querySelector('#menu-options').hidden = state !== STATES.MENU;
    document.querySelector('#result-summary').hidden = ![STATES.VICTORY, STATES.DEFEAT].includes(state);
    this.pause.disabled = ![STATES.PLAYING, STATES.PAUSED].includes(state);
    this.pause.textContent = state === STATES.PAUSED ? 'Continuar [P]' : 'Pausar [P]';
    this.restart.hidden = state !== STATES.PAUSED;
    const panels = {
      menu: ['PROTOCOLO DE DEFENSA', 'LA GALAXIA TE NECESITA.', 'Tres vidas. Cuatro sectores. Destruye a Némesis y protege la galaxia.', 'JUGAR · INICIAR MISIÓN →'],
      paused: ['SEÑAL EN ESPERA', 'MISIÓN EN PAUSA', 'Respira. La galaxia puede esperar un momento.', 'CONTINUAR →'],
      victory: ['NÉMESIS DESTRUIDA', 'GALAXIA A SALVO', 'Has superado los cuatro sectores. La humanidad vuelve a ver las estrellas.', 'VOLVER A JUGAR →'],
      defeat: ['SEÑAL PERDIDA', 'MISIÓN FALLIDA', 'No quedan naves de reserva. Vuelve a intentarlo, piloto.', 'REINTENTAR →'],
    };
    if (!playing) {
      const [label, title, text, button] = panels[state];
      document.querySelector('#panel-label').textContent = label;
      document.querySelector('#panel-title').textContent = title;
      document.querySelector('#panel-text').textContent = text;
      this.primary.textContent = button;
      if (state !== STATES.MENU) this.primary.focus({ preventScroll: true });
    }
    document.querySelector('#telemetry').textContent = playing ? 'MISIÓN ACTIVA' : 'EN ESPERA';
    document.querySelector('#announcement').textContent = playing ? 'Misión iniciada' : panels[state][1];
  }
}
