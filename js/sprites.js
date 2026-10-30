import { CONFIG } from './config.js';
// Arte provisional original. Cada carácter referencia la paleta compartida.
export const SPRITES = {
  player: ['.......cc.......','......cwwc......','......cbbc......','.....ccbbcc.....','.....cbbbbc.....','..c..cbbbbc..c..','..c.ccbbbbcc.c..','..cccbbwwbbccc..','.cccbbbwwbbbccc.','.ccbbbbbbbbbbcc.','cccbbccccccbbccc','ccbbccddddccbbcc','cccccc....cccccc','..cc.o....o.cc..','.....o....o.....','................'],
  enemy: ['..pp....pp..','...pp..pp...','..pppppppp..','.pppppppppp.','ppwwppppwwpp','ppwwppppwwpp','pppppppppppp','..pp.pp.pp..','.pp..pp..pp.','pp........pp','..pp....pp..','............'],
  bullet: ['.w.','cwc','cwc','ccc','ccc','.c.','.c.'],
  enemyBullet: ['.m.','mmm','mom','mom','mmm','.m.','.m.'],
};
export class Sprites {
  constructor() {
    this.cache = new Map();
    for (const [name, rows] of Object.entries(SPRITES)) {
      const canvas = document.createElement('canvas');
      canvas.width = rows[0].length; canvas.height = rows.length;
      const ctx = canvas.getContext('2d');
      rows.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== '.') { ctx.fillStyle = CONFIG.palette[pixel]; ctx.fillRect(x, y, 1, 1); }
      }));
      this.cache.set(name, canvas);
    }
  }
  draw(ctx, name, x, y, scale = 1) { const sprite = this.cache.get(name); ctx.drawImage(sprite, Math.round(x), Math.round(y), sprite.width * scale, sprite.height * scale); }
}
