/** Un único conjunto de listeners durante toda la vida de la aplicación. */
export class Input {
  constructor(onPause) {
    this.keys = new Set();
    const tracked = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'KeyP', 'Escape'];
    window.addEventListener('keydown', event => {
      const pauseKey = ['KeyP', 'Escape'].includes(event.code);
      if (!tracked.includes(event.code) || event.target.closest('input, textarea, select') || (!pauseKey && event.target.closest('button, a'))) return;
      event.preventDefault();
      this.keys.add(event.code);
      if (!event.repeat && pauseKey) onPause();
    });
    window.addEventListener('keyup', event => this.keys.delete(event.code));
    window.addEventListener('blur', () => this.clear());
  }
  get axis() { return Number(this.keys.has('ArrowRight') || this.keys.has('KeyD')) - Number(this.keys.has('ArrowLeft') || this.keys.has('KeyA')); }
  get firing() { return this.keys.has('Space'); }
  clear() { this.keys.clear(); }
}
