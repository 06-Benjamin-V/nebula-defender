/** Arte original: matrices de índices de la paleta, sin imágenes ni SVG. */
export const SPRITES = {
  player: [
    '.......ww.......', '.......cc.......', '......cwwc......', '......cbbc......',
    '.....dcbbcd.....', '..w..dcbbcd..w..', '..c..dcwwcd..c..', '..c.dcwwwwcd.c..',
    '.dcddcbbbbcddcd.', '.cbbccbbbbccbbc.', 'wcbbbcwwwwcbbbcw', 'ccbbddddddddbbcc',
    '.cddcbccccbcddc.', '..ddccddddccdd..', '....dd....dd....', '................',
  ],
  comet: [
    '.......ww.......', '.......oo.......', '......owwo......', '......ommo......',
    '.....dommod.....', '.....dowwod.....', '....odowwodo....', '...omdommodmo...',
    '..ommdooodmmoo..', '.ommmdooodmmmmo.',
    'ommmddowwoddmmmo', 'ommdddommodddmmo', '.oddddoooddddo..',
    '..oddd...dddo...', '...oo.....oo....', '................',
  ],
  thrust0: ['cw....wc', 'ow....wo', '.o....o.', '........'],
  thrust1: ['cw....wc', 'ow....wo', 'oo....oo', '.o....o.'],
  scout0: [
    '..c......c..', '...c....c...', '..dcccccd...', '.ccbcccbbcc.',
    'cbbwwbbwwbbc', 'cbbcwbbwcbbc', '.cbbbbbbbbc.', '..cbbbbbbc..',
    '.cdccddccdc.', 'cc..c..c..cc', 'c..........c', '............',
  ],
  scout1: [
    '...c....c...', '..c......c..', '..dcccccd...', '.ccbcccbbcc.',
    'cbbwwbbwwbbc', 'cbbcwbbwcbbc', '.cbbbbbbbbc.', '..cbbbbbbc..',
    '.cdccddccdc.', '.c..c..c..c.', '..cc....cc..', '............',
  ],
  wraith0: [
    'p..........p', '.p........p.', '.pp..pp..pp.', '..pppppppp..',
    '.pdppppppdp.', 'ppdwppppwdpp', 'pddwwppwwddp', '.pddppppddp.',
    '..ppdppdpp..', '.pp..pp..pp.', 'pp...pp...pp', 'p..........p',
  ],
  wraith1: [
    '............', 'p..........p', '.pp..pp..pp.', '..pppppppp..',
    '.pdppppppdp.', 'ppdwppppwdpp', 'pddwwppwwddp', '.pddppppddp.',
    '..ppdppdpp..', '..p..pp..p..', '.pp......pp.', 'pp........pp',
  ],
  sentinel0: [
    '...oo..oo...', '..ommmmmmo..', '.omddmmddmo.', 'omddddddddmo',
    'mddowwwwoddm', 'mddommmmoddm', 'mdddmmmmdddm', '.mdddoodddm.',
    '..mddddddm..', '.ommm..mmmo.', '.odmo..omdo.', '..oo....oo..',
  ],
  sentinel1: [
    '...oo..oo...', '..ommmmmmo..', '.omddmmddmo.', 'omddddddddmo',
    'mddowwwwoddm', 'mddommmmoddm', 'mdddmmmmdddm', '.mdddoodddm.',
    '..mddddddm..', '..mmm..mmm..', '..dmo..omd..', '.oo......oo.',
  ],
  bullet: ['.w.', 'cwc', 'cwc', 'cbc', '.c.', '.b.', '.b.'],
  enemyBullet: ['.o.', 'mwm', 'mom', 'mmm', '.m.', '.p.', '.p.'],
  muzzle0: ['...c...', '.c.w.c.', '..www..', 'cwwwwwc', '..www..', '.c.w.c.', '...c...'],
  muzzle1: ['.......', '...c...', '..cwc..', '.cwwwc.', '..cwc..', '...c...', '.......'],
  impact0: ['o.....o', '.o.w.o.', '..www..', '.wwwww.', '..www..', '.o.w.o.', 'o.....o'],
  impact1: ['.......', '.o...o.', '...o...', '..o.o..', '...o...', '.o...o.', '.......'],
  double: ['..cccccc..', '.cddddddc.', 'cddcddcddc', 'cddwddwddc', 'cddwddwddc', 'cddwddwddc', 'cddcddcddc', 'cddddddddc', '.cddddddc.', '..cccccc..'],
  rapid: ['..oooooo..', '.oddddddo.', 'odddowdddo', 'oddodwdddo', 'oddowwwddo', 'oddwwwoddo', 'odddwodddo', 'oddwoddddo', '.oddddddo.', '..oooooo..'],
  shield: ['..pppppp..', '.pddddddp.', 'pdppppppdp', 'pdpwwwwpdp', 'pdppwwppdp', 'pddpwwpddp', 'pddppppddp', 'pdddppdddp', '.pddddddp.', '..pppppp..'],
  explosion0: [
    '................', '................', '................', '.......o........',
    '.....o.wo.......', '......www.o.....', '....owwwwwo.....', '...owwwwwwwo....',
    '....owwwwwo.....', '.....owwwo......', '....o.owo.o.....', '.......o........',
    '................', '................', '................', '................',
  ],
  explosion1: [
    '................', '...o.......o....', '....o..o..o.....', '..o..oomoo..o...',
    '...oomwwmoo.....', '.o.omwwwwmomo...', '...mwwwwwwmo....', '..omwwwwwwmo.o..',
    '.oomwwwwwwmoo...', '...omwwwwmo.....', '..o.omwwmo.o....', '....oommoo......',
    '...o..oo..o.....', '......o....o....', '................', '................',
  ],
  explosion2: [
    '..m.........o...', '....o..m........', '.o....ooo...m...', '...oom...moo....',
    '..om.......mo...', '..m.........m.o.', '.om.........mo..', '.o...........o..',
    '.om.........mo..', '..m.........m...', '..om.......mo...', '...oom...moo..o.',
    '.m....ooo.......', '....o.....o.....', '..o....m.....m..', '................',
  ],
  explosion3: [
    '................', '..p.........m...', '.......p........', '....m.....p.....',
    '.m..............', '............m...', '...p............', '..............p.',
    '.p..............', '...........p....', '....m...........', '..............m.',
    '..m.....p.......', '............p...', '.....p..........', '................',
  ],
};

// Mitad izquierda de la fortaleza: la reflexión produce una matriz final de 48×32.
const bossHalf = [
  '........................', '........................', '....p...................', '...ppp..................',
  '...pdp..............pppp', '..ppdpp............ppddd', '..pdddp..........ppdddbb', '.ppdddpp........ppdddbbb',
  '.pdddddp.......ppdddbbcc', 'ppddmddpp.....ppdddbbccc', 'pdddodddpp...ppdddbbccww', 'pdddoddddpppppdddbbccwww',
  'pddmmmdddddddddddbbccwww', 'pdmwwwmdddddddbbbbbccwww', 'pmwwwwwmddbbbbbbbbbccwww', 'pmwwwwwmdbbbcccccccccccc',
  'pdmwwwmddbbccddddddddccc', 'pddmmmdddbccdddddddddbcc', 'ppdddddddbccddmmmmmddbcc', '.ppddddddbccdmwwwwwmdbcc',
  '..ppdddddbccdmwwwwwmdbcc', '...ppddddbccddmmmmmddbcc', '....ppdddbbccddddddddccc', '.....ppdddbbcccccccccccc',
  '......ppdddbbbbbbbbbbbbb', '.......ppddddddddddddddd', '........ppppdddddppppppp', '...........pdddddpp.....',
  '...........ppdddpp......', '............pdddp.......', '............pooop.......', '.............ooo........',
];
SPRITES.boss = bossHalf.map(row => {
  const half = row.padEnd(24, '.');
  return half + [...half].reverse().join('');
});

// Eclipse: corona mecánica, alas dentadas y reactor anular, 48×32.
SPRITES.eclipse = Array.from({ length: 32 }, (_, y) => Array.from({ length: 48 }, (_, x) => {
  const dx = Math.abs(x - 23.5), dy = y - 16;
  const radius = (dx / 14) ** 2 + (dy / 12) ** 2;
  const wing = dx >= 13 && dx < 23 && y >= 9 + Math.floor((23 - dx) / 3) && y <= 23 - Math.floor((23 - dx) / 4);
  const crown = y >= 2 && y <= 10 && (Math.abs(dx - 8) < 2 || (dx < 2 && y >= 5));
  if (crown) return y < 5 ? 'w' : 'o';
  if (wing) return x % 4 === 0 || y === 16 ? 'o' : 'm';
  if (radius > 1) return '.';
  if (radius > .77) return 'o';
  if (radius > .48) return 'd';
  if (radius > .3) return 'm';
  if (radius > .13) return 'w';
  return 'o';
}).join(''));

export const ANIMATIONS = {
  player: ['player'], comet: ['comet'], eclipse: ['eclipse'], thrust: ['thrust0', 'thrust1'], scout: ['scout0', 'scout1'],
  wraith: ['wraith0', 'wraith1'], sentinel: ['sentinel0', 'sentinel1'], boss: ['boss'],
  bullet: ['bullet'], enemyBullet: ['enemyBullet'], double: ['double'], rapid: ['rapid'], shield: ['shield'],
  muzzle: ['muzzle0', 'muzzle1'], impact: ['impact0', 'impact1'],
  explosion: ['explosion0', 'explosion1', 'explosion2', 'explosion3'],
};
