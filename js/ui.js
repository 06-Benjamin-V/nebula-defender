import { CONFIG } from './config.js';
import { STATES } from './state.js';
export class UI {
  constructor(onPrimary, onPause, onRestart) {
    this.overlay = document.querySelector('#overlay');
    this.primary = document.querySelector('#primary'); this.restart = document.querySelector('#restart');
    this.pause = document.querySelector('#pause');
    this.nodes = Object.fromEntries(['score', 'record', 'lives', 'level', 'power-empty', 'power-double', 'power-rapid', 'power-shield', 'boss-panel', 'boss-health', 'boss-mode', 'level-banner', 'level-label', 'level-name'].map(id => [id, document.getElementById(id)]));
    this.primary.addEventListener('click', () => { onPrimary(); this.primary.blur(); });
    this.pause.addEventListener('click', () => { onPause(); this.pause.blur(); });
    this.restart.addEventListener('click', () => { onRestart(); this.restart.blur(); });
  }
  text(id, value) { if (this.nodes[id].textContent !== value) this.nodes[id].textContent = value; }
  sync(session, state) {
    const { player, levels } = session;
    this.text('score', String(session.score).padStart(6, '0'));
    this.text('record', String(session.records.score).padStart(6, '0'));
    this.text('lives', player.lives + ' / ' + CONFIG.player.lives);
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
    const playing = state === STATES.PLAYING;
    this.overlay.hidden = playing;
    this.pause.disabled = ![STATES.PLAYING, STATES.PAUSED].includes(state);
    this.pause.textContent = state === STATES.PAUSED ? 'Continuar [P]' : 'Pausar [P]';
    this.restart.hidden = state !== STATES.PAUSED;
    const panels = {
      menu: ['PROTOCOLO DE DEFENSA', 'PILOTO, TE ESPERAMOS.', 'Tres vidas. Cuatro sectores. Destruye a Némesis y protege la galaxia.', 'INICIAR MISIÓN →'],
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
