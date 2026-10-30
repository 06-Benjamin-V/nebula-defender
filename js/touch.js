/** Controles de pulsación sostenida con múltiples punteros y captura; nunca deja acciones atascadas. */
export class TouchControls {
  constructor(input, root) {
    this.input = input; this.root = root; this.enabled = null; this.pointers = new Map();
    this.buttons = [...root.querySelectorAll('[data-touch]')];
    input.onClear = () => this.clear();
    for (const button of this.buttons) {
      button.addEventListener('pointerdown', event => {
        if (!this.enabled || event.button !== 0) return;
        event.preventDefault();
        this.pointers.set(event.pointerId, { action: button.dataset.touch, button });
        try { button.setPointerCapture(event.pointerId); } catch { /* La cancelación también limpia el estado. */ }
        this.sync();
      });
      const release = event => { this.pointers.delete(event.pointerId); this.sync(); };
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, release);
      button.addEventListener('keydown', event => {
        if (!this.enabled || !['Space', 'Enter'].includes(event.code)) return;
        event.preventDefault();
        this.pointers.set('key-' + event.code, { action: button.dataset.touch, button }); this.sync();
      });
      button.addEventListener('keyup', event => {
        if (!['Space', 'Enter'].includes(event.code)) return;
        event.preventDefault(); this.pointers.delete('key-' + event.code); this.sync();
      });
      button.addEventListener('blur', () => {
        for (const [id, value] of this.pointers) if (typeof id === 'string' && value.button === button) this.pointers.delete(id);
        this.sync();
      });
      button.addEventListener('contextmenu', event => event.preventDefault());
    }
    for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => {
      if (this.pointers.delete(event.pointerId)) this.sync();
    });
    window.addEventListener('resize', () => this.clear());
    this.syncState(false);
  }
  sync() {
    this.input.touch.clear();
    for (const { action } of this.pointers.values()) this.input.touch.add(action);
    for (const button of this.buttons) {
      const active = [...this.pointers.values()].some(value => value.button === button);
      button.classList.toggle('is-held', active); button.setAttribute('aria-pressed', String(active));
    }
  }
  clear() {
    const previous = [...this.pointers]; this.pointers.clear(); this.sync();
    for (const [id, { button }] of previous) {
      try { if (typeof id === 'number' && button.hasPointerCapture(id)) button.releasePointerCapture(id); } catch { /* Puede estar liberado. */ }
    }
  }
  syncState(playing) {
    if (this.enabled === playing && this.root.hidden === false) return;
    this.enabled = playing; this.root.hidden = false;
    for (const button of this.buttons) button.disabled = !playing;
    if (!playing) this.clear();
  }
}
