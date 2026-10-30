import { CONFIG } from './config.js';
/** Mantiene 3:2. Aprovecha escala entera cuando cabe sin desperdiciar espacio útil. */
export function fitStage(width, height) {
  const fit = Math.max(0, Math.min(width / CONFIG.width, height / CONFIG.height, 2));
  const integer = Math.floor(fit);
  const scale = integer >= 1 && fit - integer < 0.12 ? integer : fit;
  return { width: Math.floor(CONFIG.width * scale), height: Math.floor(CONFIG.width * scale) * CONFIG.height / CONFIG.width };
}
export class Layout {
  constructor(panel, stage) {
    this.panel = panel; this.stage = stage;
    this.resize = () => {
      const compact = matchMedia('(max-height: 560px) and (orientation: landscape)').matches;
      const sidebar = compact ? 144 : 0;
      const toolbar = panel.querySelector('.console-toolbar').offsetHeight;
      const hud = panel.querySelector('.hud').offsetHeight;
      const powers = panel.querySelector('.power-bar').offsetHeight;
      const footer = panel.querySelector('.console-footer').offsetHeight;
      const touch = compact ? 0 : panel.querySelector('#touch-controls').offsetHeight;
      const visual = window.visualViewport;
      const screenHeight = visual && visual.scale === 1 ? visual.height : window.innerHeight;
      const padding = getComputedStyle(document.body);
      const safeArea = (parseFloat(padding.paddingTop) || 0) + (parseFloat(padding.paddingBottom) || 0);
      const shell = panel.parentElement;
      const surroundings = [...shell.children].filter(child => child !== panel).reduce((total, child) => {
        const style = getComputedStyle(child);
        return total + child.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }, 0);
      const height = Math.max(0, screenHeight - surroundings - toolbar - hud - powers - footer - touch - safeArea - 16);
      const size = fitStage(Math.max(1, panel.clientWidth - sidebar - 2), height);
      const width = size.width + 'px', stageHeight = size.height + 'px';
      if (stage.style.width !== width) stage.style.width = width;
      if (stage.style.height !== stageHeight) stage.style.height = stageHeight;
    };
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    if (globalThis.ResizeObserver) { this.observer = new ResizeObserver(this.resize); this.observer.observe(panel); }
    this.resize();
  }
  focusOnGame() {
    this.resize();
  }
}
