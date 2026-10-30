// Tema original: 4 compases de arpegios, melodía cuadrada y bajo triangular.
// El reloj de Web Audio conserva el ritmo aunque varíe la frecuencia de dibujo.
const MELODY = [76, 0, 79, 83, 81, 79, 76, 74, 72, 0, 76, 79, 78, 76, 74, 71,
  69, 0, 72, 76, 79, 76, 72, 74, 71, 74, 78, 81, 79, 78, 74, 71];
const ROOTS = [52, 48, 45, 47];
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
export class Chiptune {
  constructor() { this.voices = new Set(); this.active = false; this.step = 0; }
  start(context, destination) {
    if (this.active) return;
    this.context = context; this.destination = destination;
    this.active = true; this.step = 0; this.next = context.currentTime;
    this.update();
  }
  note(midi, wave, start, duration, volume) {
    if (!midi || this.voices.size >= 24) return;
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = wave; oscillator.frequency.setValueAtTime(frequency(midi), start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .005);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain); gain.connect(this.destination);
    const voice = { oscillator, gain }; this.voices.add(voice);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    oscillator.start(start); oscillator.stop(start + duration);
  }
  update() {
    if (!this.active || this.context.state !== 'running') return;
    const now = this.context.currentTime, beat = 60 / 132 / 2;
    // Tras una interrupción no se acumulan notas atrasadas.
    if (this.next < now - beat) this.next = now;
    while (this.next < now + .12) {
      const step = this.step % 32, root = ROOTS[Math.floor(step / 8)];
      this.note(MELODY[step], 'square', this.next, beat * .7, .065);
      if (step % 2 === 0) this.note(root - 12, 'triangle', this.next, beat * 1.6, .15);
      this.note(root + [12, 19, 24, 19][step % 4], 'square', this.next, beat * .35, .025);
      this.step++; this.next += beat;
    }
  }
  stop() {
    this.active = false;
    for (const { oscillator, gain } of this.voices) {
      try { oscillator.stop(); oscillator.disconnect(); gain.disconnect(); } catch { /* Ya finalizada. */ }
    }
    this.voices.clear();
  }
}
