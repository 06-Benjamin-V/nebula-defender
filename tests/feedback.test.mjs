import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/config.js';
import { Audio } from '../js/audio.js';
import { Camera } from '../js/camera.js';
import { Particles } from '../js/particles.js';
import { Input } from '../js/input.js';
import { Dialogs } from '../js/dialogs.js';

// Doble de Web Audio: verifica gestión de recursos y preferencias, no calidad auditiva.
class Param {
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
  cancelScheduledValues() {}
}
class Context {
  constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = {}; this.oscillators = []; this.resumes = 0; }
  async resume() { this.resumes++; this.state = 'running'; }
  createGain() { return { gain: new Param(), connect() {}, disconnect() {} }; }
  createOscillator() {
    const oscillator = { frequency: new Param(), stopped: [], connect() {}, disconnect() {}, start(time) { this.started = time; }, stop(time) { this.stopped.push(time); } };
    this.oscillators.push(oscillator); return oscillator;
  }
}
function fixture() {
  const context = new Context(), values = new Map(); let created = 0;
  const provider = () => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const audio = new Audio({ provider, factory: () => { created++; return context; } });
  return { audio, context, values, provider, created: () => created };
}

test('el audio no crea contexto antes de Jugar, incluso con preferencias y efectos solicitados', async () => {
  const { audio, created } = fixture();
  audio.play('select'); audio.setMuted(true); audio.setMuted(false); audio.setVolume(.3);
  assert.equal(created(), 0); assert.equal(audio.context, null);
  await audio.unlock(); await audio.unlock();
  assert.equal(created(), 1); assert.equal(audio.context.state, 'running');
});
test('silencio y volumen persisten; silenciar detiene voces y anula la salida inmediatamente', async () => {
  const { audio, context, provider } = fixture(); await audio.unlock(); audio.play('power');
  assert.ok(audio.voices.size > 0);
  audio.setVolume(.15); audio.setMuted(true);
  assert.equal(audio.voices.size, 0); assert.equal(audio.master.gain.value, 0);
  assert.ok(context.oscillators.every(voice => voice.stopped.includes(undefined)));
  const restored = new Audio({ provider });
  assert.equal(restored.muted, true); assert.equal(restored.volume, .15); assert.equal(restored.context, null);
  audio.play('fire'); assert.equal(audio.voices.size, 0);
});
test('la cadencia y el máximo de voces limitan ráfagas; cada voz se limpia al terminar', async () => {
  const { audio, context } = fixture(); await audio.unlock();
  audio.play('fire'); audio.play('fire'); assert.equal(audio.voices.size, 1);
  context.currentTime += .1;
  for (const name of Object.keys(CONFIG.audio.cues)) audio.play(name);
  assert.ok(audio.voices.size <= CONFIG.audio.maxVoices);
  assert.ok(context.oscillators.length <= CONFIG.audio.maxVoices);
  for (const oscillator of context.oscillators) oscillator.onended();
  assert.equal(audio.voices.size, 0);
});
test('almacenamiento bloqueado y Web Audio no disponible permiten seguir jugando sin excepciones', async () => {
  const audio = new Audio({ provider: () => { throw new Error('Sin permiso'); }, factory: () => { throw new Error('No compatible'); } });
  audio.setMuted(true); audio.setVolume(.2); audio.setMuted(false);
  await assert.doesNotReject(() => audio.unlock());
  assert.equal(audio.available, false); assert.doesNotThrow(() => audio.play('damage'));
});
test('se rechazan preferencias de volumen corruptas y se permite volumen cero sin crear voces', async () => {
  const { audio, context } = fixture(); await audio.unlock(); audio.setVolume(0); audio.play('fire');
  assert.equal(context.oscillators.length, 0);
  audio.setVolume(NaN); assert.equal(audio.volume, 0);
  const invalid = new Audio({ provider: () => ({ getItem: () => 'corrupto' }) });
  assert.equal(invalid.volume, CONFIG.audio.defaultVolume);
});
test('partículas acotadas se desplazan y expiran; movimiento reducido no genera partículas', () => {
  const particles = new Particles(() => .5);
  for (let i = 0; i < 20; i++) particles.burst(100, 100, 'boss');
  assert.equal(particles.items.length, CONFIG.feedback.maxParticles);
  const x = particles.items[0].x; particles.update(.05); assert.notEqual(particles.items[0].x, x);
  particles.update(1); assert.equal(particles.items.length, 0);
  particles.burst(10, 10, 'damage', true); assert.equal(particles.items.length, 0);
  particles.burst(10, 10, 'damage'); particles.update(0, true); assert.equal(particles.items.length, 0);
});
test('vibración acotada vuelve a cero y se desactiva inmediatamente con movimiento reducido', () => {
  const camera = new Camera(() => 1); camera.kick('boss'); camera.update(.01);
  assert.ok(Math.abs(camera.x) <= CONFIG.feedback.shake.boss.strength); assert.notEqual(camera.x, 0);
  camera.update(1); assert.equal(camera.x, 0); assert.equal(camera.y, 0);
  camera.kick('damage'); camera.update(.01, true); assert.equal(camera.remaining, 0);
  camera.kick('boss', true); assert.equal(camera.x, 0); assert.equal(camera.remaining, 0);
});
test('los controles de vuelo y debug no interceptan las teclas de los diálogos', () => {
  const originalWindow = globalThis.window, listeners = {};
  globalThis.window = { addEventListener: (name, handler) => { listeners[name] = handler; } };
  try {
    let pauses = 0, jumps = 0, prevented = 0;
    new Input(() => pauses++, () => jumps++);
    const event = code => ({ code, repeat: false, target: { closest: selector => selector.includes('dialog') ? {} : null }, preventDefault: () => prevented++ });
    for (const code of ['KeyP', 'Escape', 'Space', 'Digit4']) listeners.keydown(event(code));
    assert.equal(pauses, 0); assert.equal(jumps, 0); assert.equal(prevented, 0);
    listeners.keydown({ ...event('KeyP'), target: { closest: () => null } }); assert.equal(pauses, 1);
  } finally { globalThis.window = originalWindow; }
});

test('cerrar un diálogo devuelve el foco al botón que lo abrió, incluso tras la pausa automática', () => {
  const originalDocument = globalThis.document;
  let returned = false, paused = 0, closed = 0;
  const dialog = { id: 'help-dialog', open: false, addEventListener: (_type, handler) => { dialog.closed = handler; }, showModal() { this.open = true; } };
  const button = { dataset: { dialog: 'help-dialog' }, isConnected: true, disabled: false, addEventListener: (_type, handler) => { button.clicked = handler; }, focus: () => { returned = true; } };
  globalThis.document = { querySelectorAll: selector => selector === 'dialog' ? [dialog] : [button] };
  try {
    const dialogs = new Dialogs(() => { paused++; }, () => { closed++; });
    button.clicked(); assert.equal(dialogs.isOpen, true); assert.equal(paused, 1);
    button.clicked(); assert.equal(paused, 1);
    dialog.open = false; dialog.closed();
    assert.equal(dialogs.isOpen, false); assert.equal(returned, true); assert.equal(closed, 1);
  } finally { globalThis.document = originalDocument; }
});
