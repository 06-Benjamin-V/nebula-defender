export const STATES = Object.freeze({ MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', VICTORY: 'victory', DEFEAT: 'defeat' });
/** Transiciones explícitas: una partida terminada solo vuelve a empezar mediante reinicio. */
export class StateMachine {
  constructor(onChange) { this.value = STATES.MENU; this.onChange = onChange; }
  set(next) {
    const allowed = { menu: ['playing'], playing: ['paused', 'victory', 'defeat'], paused: ['playing'], victory: ['playing'], defeat: ['playing'] };
    if (!allowed[this.value].includes(next)) return;
    this.value = next;
    this.onChange(next);
  }
}
