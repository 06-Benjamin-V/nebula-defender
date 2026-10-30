import { CONFIG } from './config.js';
/** Audio opcional y perezoso: solo unlock(), llamado desde Jugar/Reintentar, crea un contexto. */
export class Audio {
  constructor({ provider = () => globalThis.localStorage, factory = () => {
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    return Context ? new Context({ latencyHint: 'interactive' }) : null;
  }, onChange = () => {}, startupTimeoutMs = CONFIG.audio.startupTimeoutMs } = {}) {
    this.provider = provider; this.factory = factory; this.onChange = onChange;
    this.context = null; this.master = null; this.allowed = false; this.available = true;
    this.startupTimeoutMs = startupTimeoutMs; this.pendingUnlock = null;
    this.muted = false; this.volume = CONFIG.audio.defaultVolume;
    this.voices = new Set(); this.lastPlayed = new Map();
    try {
      this.muted = this.provider()?.getItem(CONFIG.storage.mutedKey) === 'true';
      const stored = this.provider()?.getItem(CONFIG.storage.volumeKey);
      const value = stored === null || stored === undefined ? NaN : Number(stored);
      if (Number.isFinite(value) && value >= 0 && value <= 1) this.volume = value;
    } catch { /* Las preferencias quedan en memoria si el almacenamiento no está disponible. */ }
  }
  save() {
    try {
      const storage = this.provider();
      storage?.setItem(CONFIG.storage.mutedKey, String(this.muted));
      storage?.setItem(CONFIG.storage.volumeKey, String(this.volume));
    } catch { /* El sonido no depende de la persistencia. */ }
  }
  async unlock() {
    this.allowed = true;
    if (this.muted || !this.available) { this.onChange(this); return false; }
    if (!this.pendingUnlock) this.pendingUnlock = this.prepare().finally(() => { this.pendingUnlock = null; });
    return this.pendingUnlock;
  }
  async prepare() {
    let timeout;
    try {
      if (!this.context) {
        this.context = this.factory();
        if (!this.context) throw new Error('Audio no disponible');
        this.master = this.context.createGain(); this.master.connect(this.context.destination);
        this.applyVolume();
      }
      if (this.context.state === 'closed') throw new Error('Audio cerrado');
      if (this.context.state !== 'running') {
        await Promise.race([
          this.context.resume(),
          new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Audio sin respuesta')), this.startupTimeoutMs); }),
        ]);
      }
      if (this.context.state !== 'running') throw new Error('Audio todavía suspendido');
    } catch { this.available = false; this.stopAll(); }
    finally { clearTimeout(timeout); }
    this.onChange(this);
    return this.available && this.context?.state === 'running';
  }
  applyVolume() {
    if (!this.master) return;
    const time = this.context.currentTime;
    try {
      this.master.gain.cancelScheduledValues(time);
      this.master.gain.setValueAtTime(this.muted ? 0 : this.volume * CONFIG.audio.masterGain, time);
    } catch { this.available = false; this.stopAll(); }
  }
  setMuted(value) {
    this.muted = Boolean(value);
    if (this.muted) this.stopAll();
    this.applyVolume(); this.save(); this.onChange(this);
    if (!this.muted && this.allowed) void this.unlock();
  }
  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value)); this.applyVolume(); this.save(); this.onChange(this);
  }
  play(name) {
    const notes = CONFIG.audio.cues[name];
    if (!notes || !this.context || !this.master || this.context.state !== 'running' || this.muted || !this.available || this.volume === 0) return;
    const time = this.context.currentTime;
    if (time - (this.lastPlayed.get(name) ?? -Infinity) < CONFIG.audio.minInterval) return;
    this.lastPlayed.set(name, time);
    try {
      for (const note of notes) {
        if (this.voices.size >= CONFIG.audio.maxVoices) break;
        const oscillator = this.context.createOscillator(), gain = this.context.createGain();
        const start = time + (note.delay ?? 0), end = start + note.duration;
        oscillator.type = note.wave;
        oscillator.frequency.setValueAtTime(note.frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(note.end ?? note.frequency, end);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(note.gain, start + CONFIG.audio.attack);
        gain.gain.exponentialRampToValueAtTime(0.001, end);
        oscillator.connect(gain); gain.connect(this.master);
        const voice = { oscillator, gain };
        this.voices.add(voice);
        oscillator.onended = () => {
          try { oscillator.disconnect(); gain.disconnect(); } catch { /* El contexto puede haber sido cerrado. */ }
          this.voices.delete(voice);
        };
        oscillator.start(start); oscillator.stop(end);
      }
    } catch { this.available = false; this.stopAll(); this.onChange(this); }
  }
  stopAll() {
    for (const { oscillator, gain } of this.voices) {
      try { oscillator.stop(); } catch { /* Puede haber finalizado antes de esta limpieza. */ }
      try { oscillator.disconnect(); gain.disconnect(); } catch { /* La desconexión puede haberse realizado antes. */ }
    }
    this.voices.clear(); this.lastPlayed.clear();
  }
}
