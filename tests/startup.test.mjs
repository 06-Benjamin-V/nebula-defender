import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Audio } from '../js/audio.js';
import { Game } from '../js/engine.js';

test('resume lento se espera y las llamadas simultáneas comparten un único desbloqueo', async () => {
  let release, resumes = 0;
  const context = { state: 'suspended', currentTime: 0, destination: {},
    createGain: () => ({ connect() {}, gain: { cancelScheduledValues() {}, setValueAtTime() {} } }),
    resume() { resumes++; return new Promise(resolve => { release = () => { this.state = 'running'; resolve(); }; }); } };
  const audio = new Audio({ provider: () => undefined, factory: () => context });
  const first = audio.unlock(), second = audio.unlock();
  assert.equal(audio.context.state, 'suspended'); assert.equal(resumes, 1);
  release(); assert.equal(await first, true); assert.equal(await second, true);
});

test('un dispositivo sin respuesta no bloquea indefinidamente el inicio', async () => {
  const audio = new Audio({ provider: () => undefined, startupTimeoutMs: 1, factory: () => ({
    state: 'suspended', currentTime: 0, destination: {},
    createGain: () => ({ connect() {}, gain: { cancelScheduledValues() {}, setValueAtTime() {} } }),
    resume: () => new Promise(() => {}),
  }) });
  assert.equal(await audio.unlock(), false); assert.equal(audio.available, false);
});

function launchFixture(state = 'menu') {
  let release, unlocks = 0;
  const events = [], game = Object.create(Game.prototype);
  Object.assign(game, { launchId: 0, starting: false, ui: { dialogOpen: false, setStarting: value => events.push(['busy', value]) },
    audio: { allowed: true, unlock: () => { unlocks++; return new Promise(resolve => { release = resolve; }); }, play: cue => events.push(['sound', cue]) },
    state: { value: state, set(value) { this.value = value; } }, canvas: { focus() {} },
    start() { this.cancelStart(); events.push(['simulation']); this.state.value = 'playing'; } });
  return { game, events, release: () => release(), unlocks: () => unlocks };
}

test('la simulación y su señal de inicio empiezan juntas después de que el audio esté listo', async () => {
  const original = globalThis.document; globalThis.document = { hidden: false };
  try {
    const { game, events, release, unlocks } = launchFixture();
    const pending = game.begin(); await game.begin();
    assert.equal(unlocks(), 1); assert.equal(game.state.value, 'menu');
    assert.equal(events.some(event => event[0] === 'simulation'), false);
    release(); await pending;
    assert.equal(game.state.value, 'playing');
    assert.deepEqual(events.slice(-2), [['simulation'], ['sound', 'start']]);
  } finally { globalThis.document = original; }
});

test('cancelar una activación pendiente impide que una respuesta tardía inicie la misión', async () => {
  const original = globalThis.document; globalThis.document = { hidden: false };
  try {
    const { game, events, release } = launchFixture(); const pending = game.begin();
    game.cancelStart(); release(); await pending;
    assert.equal(game.state.value, 'menu'); assert.equal(game.starting, false);
    assert.equal(events.some(event => event[0] === 'simulation' || event[0] === 'sound'), false);
  } finally { globalThis.document = original; }
});

test('continuar conserva la pausa hasta que termina la reactivación del audio, sin reiniciar la campaña', async () => {
  const original = globalThis.document; globalThis.document = { hidden: false };
  try {
    const { game, events, release } = launchFixture('paused'); const pending = game.prepareMission(true);
    assert.equal(game.state.value, 'paused'); release(); await pending;
    assert.equal(game.state.value, 'playing');
    assert.equal(events.some(event => event[0] === 'simulation'), false);
  } finally { globalThis.document = original; }
});
