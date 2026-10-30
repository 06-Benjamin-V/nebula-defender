import { CONFIG } from './config.js';
export function shipId(value) { return Object.hasOwn(CONFIG.ships, value) ? value : 'aurora'; }
/** La preferencia afecta a la próxima campaña; nunca cambia una nave en combate. */
export class ShipSelection {
  constructor(provider = () => globalThis.localStorage) {
    this.provider = provider; this.value = 'aurora';
    try { this.value = shipId(provider()?.getItem(CONFIG.storage.shipKey)); } catch { /* Preferencia en memoria. */ }
  }
  select(value) {
    this.value = shipId(value);
    try { this.provider()?.setItem(CONFIG.storage.shipKey, this.value); } catch { /* Preferencia en memoria. */ }
  }
}
