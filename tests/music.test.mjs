import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Audio } from '../js/audio.js';
import { Input } from '../js/input.js';

function audioFixture() {
  const nodes = [], param = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  const context = { state: 'running', currentTime: 0, destination: {},
    createGain: () => ({ gain: param(), connect() {}, disconnect() {} }),
    createOscillator() { const node = { frequency: param(), connect() {}, disconnect() {}, start(t) { this.startTime = t; }, stop() { this.stopped = true; } }; nodes.push(node); return node; } };
  return { audio: new Audio({ provider: () => null, factory: () => context }), context, nodes };
}
test('música inmediata, reloj estable y sin notas atrasadas tras una interrupción', async () => {
  const { audio, context, nodes } = audioFixture();
  audio.setMusic(true); assert.equal(nodes.length, 0);
  await audio.unlock(); assert.ok(nodes.length > 0); assert.equal(nodes[0].startTime, 0);
  const first = nodes.length; audio.updateMusic(); assert.equal(nodes.length, first);
  for (const node of [...nodes]) node.onended();
  context.currentTime = 30; audio.updateMusic();
  assert.ok(nodes.slice(first).every(node => node.startTime >= 30));
  assert.ok(audio.music.voices.size <= 24);
});
test('pausa, silencio y volumen cero cortan la música y reactivarla no duplica voces', async () => {
  const { audio, nodes } = audioFixture(); await audio.unlock(); audio.setMusic(true);
  audio.setMusic(false); assert.equal(audio.music.voices.size, 0); assert.ok(nodes.every(node => node.stopped));
  audio.setMusic(true); audio.setMuted(true); assert.equal(audio.music.active, false);
  audio.setMuted(false); await audio.unlock(); assert.equal(audio.music.active, true);
  audio.setVolume(0); assert.equal(audio.music.active, false);
  audio.setVolume(.4); assert.equal(audio.music.active, true);
  const count = nodes.length; audio.setMusic(true); assert.equal(nodes.length, count);
  audio.stopAll(); assert.equal(audio.music.voices.size, 0);
});
test('las cuatro flechas no desplazan la página y los campos conservan sus teclas', () => {
  const previous = globalThis.window, listeners = {};
  globalThis.window = { addEventListener: (name, listener) => { listeners[name] = listener; } };
  try {
    new Input(() => {});
    for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      let prevented = false;
      listeners.keydown({ code, target: { closest: () => null }, preventDefault() { prevented = true; } });
      assert.equal(prevented, true);
    }
    let prevented = false;
    listeners.keydown({ code: 'ArrowDown', target: { closest: () => ({}) }, preventDefault() { prevented = true; } });
    assert.equal(prevented, false);
  } finally { globalThis.window = previous; }
});
