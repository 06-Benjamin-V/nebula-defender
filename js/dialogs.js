/** Diálogos nativos: foco contenido, Escape para cerrar y devolución del foco al control de origen. */
export class Dialogs {
  constructor(beforeOpen, onClose = () => {}) {
    this.dialogs = [...document.querySelectorAll('dialog')];
    this.beforeOpen = beforeOpen;
    for (const dialog of this.dialogs) dialog.addEventListener('close', () => {
      onClose();
      const opener = this.returnFocus; this.returnFocus = null;
      if (opener?.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
    });
    for (const button of document.querySelectorAll('[data-dialog]')) {
      button.addEventListener('click', () => this.open(button.dataset.dialog, button));
    }
  }
  get isOpen() { return this.dialogs.some(dialog => dialog.open); }
  open(id, opener = document.activeElement) {
    if (this.isOpen) return;
    const dialog = this.dialogs.find(item => item.id === id);
    if (!dialog) return;
    this.returnFocus = opener;
    this.beforeOpen(); dialog.showModal();
  }
}
