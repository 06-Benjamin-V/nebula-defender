import { STATES } from './state.js';
export class UI {
  constructor(onPrimary, onPause, onRestart) {
    this.overlay = document.querySelector('#overlay');
    this.primary = document.querySelector('#primary');
    this.restart = document.querySelector('#restart');
    this.pause = document.querySelector('#pause');
    this.score = document.querySelector('#score');
    this.primary.addEventListener('click', () => { onPrimary(); this.primary.blur(); });
    this.pause.addEventListener('click', () => { onPause(); this.pause.blur(); });
    this.restart.addEventListener('click', () => { onRestart(); this.restart.blur(); });
  }
  setScore(value) { this.score.textContent = String(value).padStart(6, '0'); }
  render(state) {
    const playing = state === STATES.PLAYING;
    this.overlay.hidden = playing;
    this.pause.disabled = ![STATES.PLAYING, STATES.PAUSED].includes(state);
    this.pause.textContent = state === STATES.PAUSED ? 'Continuar [P]' : 'Pausar [P]';
    this.restart.hidden = state !== STATES.PAUSED;
    const panels = {
      menu: ['PROTOCOLO DE DEFENSA', 'PILOTO, TE ESPERAMOS.', 'Defiende la órbita. Elimina la formación invasora.', 'INICIAR MISIÓN →'],
      paused: ['SEÑAL EN ESPERA', 'MISIÓN EN PAUSA', 'Respira. La galaxia puede esperar un momento.', 'CONTINUAR →'],
      victory: ['FORMACIÓN ELIMINADA', 'SECTOR DESPEJADO', 'Base jugable completada. Los siguientes sectores llegarán en la Fase 3.', 'VOLVER A JUGAR →'],
      defeat: ['SEÑAL PERDIDA', 'MISIÓN FALLIDA', 'La órbita ha caído. Vuelve a intentarlo, piloto.', 'REINTENTAR →'],
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
