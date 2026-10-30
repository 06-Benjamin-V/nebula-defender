import { CONFIG } from './config.js';
/** El almacenamiento es opcional: ni permisos ni valores corruptos interrumpen una partida. */
export class Records {
  constructor(provider = () => globalThis.localStorage) {
    this.provider = provider; this.score = 0;
    try {
      const value = Number(this.provider()?.getItem(CONFIG.storage.recordKey));
      if (Number.isSafeInteger(value) && value > 0) this.score = value;
    } catch { /* El récord sigue disponible durante esta sesión. */ }
  }
  update(score) {
    if (!Number.isSafeInteger(score) || score <= this.score) return;
    this.score = score;
    try { this.provider()?.setItem(CONFIG.storage.recordKey, String(score)); }
    catch { /* La partida continúa aunque localStorage no esté disponible. */ }
  }
}
