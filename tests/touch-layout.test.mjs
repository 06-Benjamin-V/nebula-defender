import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../js/input.js';
import { TouchControls } from '../js/touch.js';
import { fitStage } from '../js/layout.js';

function fixture() {
  const listeners = {}, buttons = ['left', 'right', 'fire'].map(action => ({ dataset: { touch: action }, handlers: {}, capture: new Set(),
    classList: { toggle() {} }, setAttribute() {}, addEventListener(type, callback) { this.handlers[type] = callback; },
    setPointerCapture(id) { this.capture.add(id); }, hasPointerCapture(id) { return this.capture.has(id); }, releasePointerCapture(id) { this.capture.delete(id); } }));
  const oldWindow = globalThis.window;
  globalThis.window = { addEventListener: (type, callback) => { (listeners[type] ??= []).push(callback); } };
  const input = new Input(() => {}), root = { hidden: true, querySelectorAll: () => buttons }, controls = new TouchControls(input, root);
  return { input, controls, buttons, root, listeners, restore: () => { globalThis.window = oldWindow; } };
}
const pointer = id => ({ pointerId: id, button: 0, preventDefault() {} });

test('dos dedos permiten moverse y disparar; soltar uno conserva la otra acción', () => {
  const f = fixture();
  try {
    f.controls.syncState(true);
    f.buttons[0].handlers.pointerdown(pointer(1)); f.buttons[2].handlers.pointerdown(pointer(2));
    assert.equal(f.input.axis, -1); assert.equal(f.input.firing, true);
    f.buttons[0].handlers.pointerup(pointer(1));
    assert.equal(f.input.axis, 0); assert.equal(f.input.firing, true);
    f.buttons[2].handlers.pointerup(pointer(2)); assert.equal(f.input.firing, false);
  } finally { f.restore(); }
});
test('cancelaciones, pérdida de captura y pausa no dejan acciones retenidas', () => {
  const f = fixture();
  try {
    f.controls.syncState(true); f.buttons[1].handlers.pointerdown(pointer(1)); f.buttons[2].handlers.pointerdown(pointer(2));
    f.buttons[1].handlers.lostpointercapture(pointer(1)); assert.equal(f.input.axis, 0);
    f.listeners.pointercancel[0](pointer(2)); assert.equal(f.input.firing, false);
    f.buttons[0].handlers.pointerdown(pointer(3)); f.buttons[2].handlers.pointerdown(pointer(4));
    f.input.clear(); assert.equal(f.input.axis, 0); assert.equal(f.input.firing, false); assert.equal(f.controls.pointers.size, 0);
    f.buttons[2].handlers.pointerdown(pointer(5)); f.listeners.resize[0](); assert.equal(f.input.firing, false);
    f.controls.syncState(false); assert.ok(f.buttons.every(button => button.disabled));
  } finally { f.restore(); }
});
test('dos punteros en la misma dirección no se anulan al soltar solo uno; teclado y tacto se combinan', () => {
  const f = fixture();
  try {
    f.controls.syncState(true); f.buttons[0].handlers.pointerdown(pointer(1)); f.buttons[0].handlers.pointerdown(pointer(2));
    f.buttons[0].handlers.pointerup(pointer(1)); assert.equal(f.input.axis, -1);
    f.input.keys.add('ArrowRight'); assert.equal(f.input.axis, 0);
    f.input.keys.clear(); f.listeners.pointerup[0](pointer(2)); assert.equal(f.input.axis, 0);
  } finally { f.restore(); }
});
test('los botones táctiles también permiten pulsación sostenida con teclado y limpian al perder foco', () => {
  const f = fixture();
  try {
    f.controls.syncState(true);
    f.buttons[2].handlers.keydown({ code: 'Space', preventDefault() {} }); assert.equal(f.input.firing, true);
    f.buttons[2].handlers.blur(); assert.equal(f.input.firing, false);
  } finally { f.restore(); }
});
test('el ajuste cabe en móvil y aprovecha pantallas grandes sin recortar ni deformar', () => {
  for (const [width, height] of [[300, 400], [390, 500], [700, 180], [1040, 700], [800, 500]]) {
    const size = fitStage(width, height);
    assert.ok(size.width <= width); assert.ok(size.height <= height);
    assert.ok(Math.abs(size.width / size.height - 1.5) < .00001);
  }
  assert.deepEqual(fitStage(960, 640), { width: 960, height: 640 });
  assert.deepEqual(fitStage(500, 340), { width: 500, height: 1000 / 3 });
  assert.deepEqual(fitStage(1920, 1080), { width: 1620, height: 1080 });
});
