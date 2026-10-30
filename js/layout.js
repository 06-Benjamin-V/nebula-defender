import { CONFIG } from './config.js';
/** Mantiene 3:2 y aprovecha toda el área disponible, sin límite artificial de escala. */
export function fitStage(width, height) {
  const scale = Math.max(0, Math.min(width / CONFIG.width, height / CONFIG.height));
  return { width: Math.floor(CONFIG.width * scale), height: Math.floor(CONFIG.width * scale) * CONFIG.height / CONFIG.width };
}
export class Layout {
  constructor(panel, stage) {
    this.panel = panel; this.stage = stage;
    this.resize = () => {
      const compact = matchMedia('(max-height: 560px) and (orientation: landscape)').matches;
      const controls = panel.querySelector('#touch-controls');
      const hasTouch = controls.offsetHeight > 0;
      // Dos zonas laterales iguales dejan las flechas juntas fuera del campo de juego.
      const sidebar = compact && hasTouch ? 2 * (Math.max(controls.querySelector('.touch-move').offsetWidth, controls.querySelector('.touch-fire').offsetWidth) + 16) : 0;
      const toolbar = panel.querySelector('.console-toolbar').offsetHeight;
      const hud = panel.querySelector('.hud').offsetHeight;
      const powers = panel.querySelector('.power-bar').offsetHeight;
      const footer = panel.querySelector('.console-footer').offsetHeight;
      const touch = compact ? 0 : controls.offsetHeight;
      const visual = window.visualViewport;
      const screenHeight = visual && visual.scale === 1 ? visual.height : window.innerHeight;
      const padding = getComputedStyle(document.body);
      const safeArea = (parseFloat(padding.paddingTop) || 0) + (parseFloat(padding.paddingBottom) || 0);
      const shell = panel.parentElement;
      const surroundings = [...shell.children].filter(child => child !== panel).reduce((total, child) => {
        const style = getComputedStyle(child);
        if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') return total;
        return total + child.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }, 0);
      const height = Math.max(0, screenHeight - surroundings - toolbar - hud - powers - footer - touch - safeArea - 2);
      const size = fitStage(Math.max(1, panel.clientWidth - sidebar - 2), height);
      const width = size.width + 'px', stageHeight = size.height + 'px';
      if (stage.style.width !== width) stage.style.width = width;
      if (stage.style.height !== stageHeight) stage.style.height = stageHeight;
    };
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    if (globalThis.ResizeObserver) {
      this.observer = new ResizeObserver(this.resize);
      for (const element of [panel, ...panel.querySelectorAll('.console-toolbar, .hud, .power-bar, #touch-controls')]) this.observer.observe(element);
    }
    this.resize();
  }
  focusOnGame() {
    this.resize();
  }
}
