// ===================== PIXEL SAGA · i santuari =====================
// Le mappe dei cinque santuari, disegnate a mano stanza per stanza, la loro geometria 3D,
// le piastrelle dei muri e i disegni di mostri e guardiani. Tutto vive in SG.dun.
(() => {
const A = SG.art, TAU = Math.PI * 2;
// misure: lato della cella, altezza dei muri e delle porte, profondità di pozzi, acqua e lava
const CS = 10, WH = 14, DH = 10.5, PD = 34, WD = 6, LD = 1.2;
// tipi di cella
const ROCK = 0, WALL = 1, CRACK = 2, FLOOR = 3, PIT = 4, WATER = 5, LAVA = 6, ICE = 7, SPIKE = 8, BRIDGE = 9, DOOR = 10, EXIT = 11, TOGB = 12, PLAT = 13;
const ORDER = ['bosco', 'lago', 'sole', 'ghiaccio', 'fuoco'];

// ---------- come si disegna una mappa: stanze, porte e oggetti ----------
// Legenda: ' ' roccia, '#' muro, '%' muro crepato, '.' pavimento, '_' pozzo, '~' acqua profonda, 'L' lava,
// 'I' ghiaccio, '^' punte, '=' ponte, '@' uscita, 'D' porta a chiave, 'B' porta del guardiano, '+' passaggio,
// '1'-'9' saracinesca, 'r'/'u' blocchi rossi/blu, 'R'/'U' piattaforme rosse/blu sopra i pozzi, 'x' cristallo,
// 'O' masso, 'p' piastra, 'P' piastra pesante (solo massi), 't' braciere, 'v' vaso, 'T' statua che spara, 'S' lapide,
// 'k' forziere con piccola chiave, 'q' lo stesso ma compare a stanza ripulita, 'c'/'Q' forziere con bottino,
// 'K' grande chiave, 'C' grande forziere, 'M' guardiano, 'e' 'f' 'g' 'h' nemici.
function Maker() {
  const cells = new Map(), extra = { loot: {}, signs: {}, trig: {} };
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const key = (x, y) => x + ',' + y;
  const put = (x, y, ch) => { cells.set(key(x, y), ch); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  const get = (x, y) => cells.get(key(x, y)) || ' ';
  return {
    room(a, b, c, d, fl = '.') { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) { if (x === a || x === c || y === b || y === d) { if (get(x, y) === ' ') put(x, y, '#'); } else put(x, y, fl); } },
    fill(a, b, c, d, ch) { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) put(x, y, ch); },
    at(x, y, s) { for (let i = 0; i < s.length; i++) put(x + i, y, s[i]); },
    col(x, y, s) { for (let i = 0; i < s.length; i++) put(x, y + i, s[i]); },
    chest(x, y, ch, loot) { put(x, y, ch); if (loot) extra.loot[key(x, y)] = loot; },
    sign(x, y, txt) { put(x, y, 'S'); extra.signs[key(x, y)] = txt; },
    trig(g, type, x, y) { extra.trig[g] = [type, x, y]; },
    done() {
      const rows = []; for (let y = y0; y <= y1; y++) { let s = ''; for (let x = x0; x <= x1; x++) s += get(x, y); rows.push(s); }
      const norm = o => { const out = {}; for (const k in o) { const [x, y] = k.split(',').map(Number); out[(x - x0) + ',' + (y - y0)] = o[k]; } return out; };
      const trig = {}; for (const g in extra.trig) { const [t, x, y] = extra.trig[g]; trig[g] = [t, x === undefined ? null : x - x0, y === undefined ? null : y - y0]; }
      return { rows, loot: norm(extra.loot), signs: norm(extra.signs), trig };
    },
  };
}

// ---------- i cinque santuari ----------
const DEF = {
  bosco: {
    name: 'SANTUARIO DEL BOSCO', boss: 'golem', item: 'radici', gem: 'pBosco', foes: { e: 'slime', f: 'goblin', g: 'bat', h: 'plant' },
    floor: 18, wall: 19, fog: '#0b140e', amb: 0.36, water: '#2a6a5a', torch: [1, 0.72, 0.42], shot: 'seed', pot: ['#7a9a4a', '#3a5a24'], glow: '#5af07a',
    make(m) {
      m.room(17, 34, 28, 42); m.room(11, 22, 34, 34); m.room(1, 20, 11, 36); m.room(-4, 27, 1, 31); m.room(34, 22, 45, 34);
      m.room(11, 10, 34, 22); m.room(34, 6, 45, 22); m.room(10, -5, 33, 10);
      // ingresso
      m.at(22, 42, '@@'); m.at(19, 36, 't'); m.at(26, 36, 't'); m.at(18, 41, 'v'); m.at(27, 41, 'v');
      m.sign(20, 39, 'SANTUARIO DEL BOSCO.\nCAMMINA CONTRO UN MASSO PER SPINGERLO. LE PIASTRE CHIEDONO UN PESO. SE UN MASSO SI INCASTRA, ESCI DALLA STANZA E RIENTRA.');
      // atrio: due piastre e un masso
      m.at(22, 34, '++'); m.at(15, 25, 'p'); m.at(30, 25, 'p'); m.at(15, 30, 'O');
      m.at(12, 23, 't'); m.at(33, 23, 't'); m.at(12, 33, 't'); m.at(33, 33, 't');
      m.at(22, 22, '11'); m.col(11, 27, 'DD'); m.col(34, 27, '22');
      m.trig(1, 'plates'); m.trig(2, 'kill');
      // ovest: il grande forziere tra le piante carnivore, e una crepa nel muro
      m.chest(6, 22, 'C'); m.at(3, 26, 'h'); m.at(9, 26, 'h'); m.at(3, 31, 'h'); m.at(9, 31, 'h'); m.at(2, 35, 'v'); m.at(10, 35, 'v'); m.at(2, 21, 't'); m.at(10, 21, 't');
      m.col(1, 29, '%'); m.chest(-2, 29, 'c', 'monete:50');
      // est: la stanza trappola
      m.at(38, 25, 'e'); m.at(42, 27, 'e'); m.at(38, 31, 'e'); m.at(41, 30, 'f'); m.chest(40, 28, 'q'); m.at(44, 23, 't'); m.at(35, 33, 't');
      // nord: il fossato da riempire con il masso
      m.fill(12, 15, 33, 15, '_'); m.at(22, 18, 'O'); m.chest(13, 12, 'k'); m.at(12, 19, 't'); m.at(33, 19, 't'); m.at(33, 11, 't');
      m.at(22, 10, 'BB'); m.col(34, 12, 'DD');
      // nord-est: punte, pipistrelli e la grande chiave
      m.fill(35, 10, 42, 10, '^'); m.fill(40, 11, 40, 18, '^');
      m.at(37, 17, 'g'); m.at(42, 15, 'g'); m.at(43, 19, 'f'); m.at(36, 8, 'h'); m.chest(43, 8, 'K'); m.at(44, 21, 't');
      // il guardiano
      m.at(21, 1, 'M'); m.at(11, -4, 't'); m.at(32, -4, 't'); m.at(11, 9, 't'); m.at(32, 9, 't');
    },
  },
  lago: {
    name: 'SANTUARIO DEL LAGO', boss: 'serpent', item: 'maree', gem: 'pLago', foes: { e: 'slimeB', f: 'crab', g: 'bat', h: 'skel' },
    floor: 20, wall: 21, fog: '#08111c', amb: 0.38, water: '#2a6ab0', torch: [0.72, 0.86, 1], shot: 'bubble', pot: ['#5a8ab8', '#2a4a7a'], glow: '#5ac8ff',
    make(m) {
      m.room(14, 40, 27, 48); m.room(27, 43, 31, 47); m.room(8, 26, 33, 40); m.room(0, 24, 8, 38); m.room(12, 14, 29, 26); m.room(33, 24, 44, 38);
      m.room(10, 2, 31, 14); m.room(31, -4, 48, 12);
      // ingresso, con una crepa a est
      m.at(20, 48, '@@'); m.at(20, 40, '++'); m.at(15, 41, 't'); m.at(26, 41, 't'); m.fill(15, 44, 16, 47, '~'); m.fill(25, 44, 26, 46, '~');
      m.sign(18, 42, 'SANTUARIO DEL LAGO.\nCOLPISCI I CRISTALLI CON LA SPADA: I BLOCCHI ROSSI E QUELLI BLU NON STANNO MAI ALZATI INSIEME.');
      m.col(27, 45, '%'); m.chest(29, 45, 'c', 'pozione:3');
      // sala del cristallo: il fossato e il ponte
      m.fill(9, 32, 32, 33, '~'); m.fill(20, 32, 21, 33, '='); m.at(20, 31, 'rr'); m.at(13, 36, 'x'); m.at(28, 29, 'x'); m.col(32, 29, 'uu');
      m.at(9, 27, 't'); m.at(9, 39, 't'); m.at(32, 39, 't'); m.at(32, 27, 't');
      m.col(33, 29, '++'); m.col(8, 28, 'DD'); m.at(20, 26, '22');
      // ovest: l'elmo delle maree
      m.chest(4, 26, 'C'); m.at(2, 31, 'h'); m.at(6, 34, 'h'); m.at(1, 37, 'v'); m.at(7, 37, 'v'); m.at(1, 25, 't'); m.at(7, 25, 't');
      // nord: trappola con granchi e melme
      m.at(16, 18, 'f'); m.at(25, 18, 'f'); m.at(14, 23, 'e'); m.at(20, 20, 'e'); m.at(27, 23, 'e'); m.at(20, 14, '22'); m.at(13, 15, 't'); m.at(28, 15, 't');
      m.trig(2, 'kill', 18, 21);
      // est: la piccola chiave
      m.chest(42, 26, 'k'); m.chest(35, 26, 'c', 'monete:40'); m.at(38, 30, 'h'); m.at(36, 34, 'g'); m.at(41, 35, 'g'); m.at(34, 37, 'v'); m.at(43, 37, 'v'); m.at(34, 32, 't');
      // la grande vasca e l'isola della grande chiave
      m.fill(11, 4, 30, 12, '~'); m.fill(18, 6, 23, 10, '.'); m.chest(20, 8, 'K'); m.at(18, 6, 't'); m.at(23, 10, 't'); m.col(31, 3, 'BB');
      // il guardiano e le sue quattro vasche
      m.fill(33, -1, 35, 1, '~'); m.fill(44, -1, 46, 1, '~'); m.fill(33, 7, 35, 9, '~'); m.fill(44, 7, 46, 9, '~');
      m.at(39, 4, 'M'); m.at(32, -3, 't'); m.at(47, -3, 't'); m.at(32, 11, 't'); m.at(47, 11, 't');
    },
  },
  sole: {
    name: 'SANTUARIO DEL SOLE', boss: 'scarab', item: 'solare', gem: 'pSole', foes: { e: 'skel', f: 'mummy', g: 'bat' },
    floor: 22, wall: 23, fog: '#170f07', amb: 0.4, water: '#3a7a9a', torch: [1, 0.78, 0.42], shot: 'fire', pot: ['#c89a5a', '#8a5a2a'], glow: '#ffd23f',
    make(m) {
      m.room(16, 40, 29, 48); m.room(10, 28, 35, 40); m.room(0, 24, 10, 44); m.room(35, 24, 46, 44); m.room(46, 38, 50, 42); m.room(10, 12, 35, 28); m.room(8, -8, 37, 12);
      m.at(22, 48, '@@'); m.at(22, 40, '++'); m.at(17, 41, 't'); m.at(28, 41, 't');
      m.sign(19, 43, 'SANTUARIO DEL SOLE.\nLE STATUE SPUTANO FUOCO: UNO SCUDO DEGNO DI UN EROE LO RIMANDA INDIETRO. TRE PIASTRE, DUE MASSI... E TU.');
      // sala delle statue
      m.at(11, 29, 'T'); m.at(34, 29, 'T'); m.at(14, 31, 'p'); m.at(31, 31, 'p'); m.at(22, 31, 'p'); m.at(14, 36, 'O'); m.at(31, 36, 'O');
      m.fill(17, 34, 19, 34, '^'); m.fill(26, 34, 28, 34, '^'); m.at(11, 39, 't'); m.at(34, 39, 't');
      m.at(22, 28, '11'); m.col(10, 33, '++'); m.col(35, 33, 'DD'); m.trig(1, 'plates');
      // ovest: la cripta allagata (serve l'elmo delle maree)
      m.fill(1, 28, 9, 40, '~'); m.chest(5, 26, 'k'); m.at(7, 26, 'f'); m.at(2, 42, 'v'); m.at(8, 42, 'v'); m.at(1, 25, 't'); m.at(9, 25, 't');
      // est: la lama del sole, e una crepa
      m.chest(41, 26, 'C'); m.chest(44, 42, 'c', 'monete:80'); m.fill(36, 30, 43, 30, '^'); m.fill(38, 38, 45, 38, '^');
      m.at(38, 32, 'e'); m.at(43, 36, 'e'); m.at(40, 41, 'f'); m.at(44, 28, 'g'); m.at(36, 25, 't'); m.at(45, 25, 't');
      m.col(46, 40, '%'); m.chest(48, 40, 'c', 'cuore');
      // nord: l'abisso. Il cristallo sta dall'altra parte
      m.fill(11, 18, 34, 21, '_'); m.fill(22, 18, 23, 21, 'U'); m.at(22, 15, 'x'); m.chest(12, 14, 'K'); m.at(30, 15, 'f'); m.at(15, 16, 'f');
      m.at(11, 27, 't'); m.at(34, 27, 't'); m.at(34, 13, 't'); m.at(22, 12, 'BB');
      // lo scarabeo e i pilastri
      m.fill(14, -3, 15, -2, '#'); m.fill(30, -3, 31, -2, '#'); m.fill(14, 6, 15, 7, '#'); m.fill(30, 6, 31, 7, '#');
      m.at(22, 2, 'M'); m.at(9, -7, 't'); m.at(36, -7, 't'); m.at(9, 11, 't'); m.at(36, 11, 't');
    },
  },
  ghiaccio: {
    name: 'SANTUARIO DEL GHIACCIO', boss: 'queen', item: 'brina', gem: 'pGhiaccio', foes: { e: 'icewolf', f: 'iceskel', g: 'icebat' },
    floor: 24, wall: 25, fog: '#0d1620', amb: 0.42, water: '#3a7ab8', torch: [0.75, 0.9, 1], shot: 'ice', pot: ['#a8c8e8', '#5a7a9a'], glow: '#bff0ff',
    make(m) {
      m.room(16, 40, 29, 48); m.room(8, 26, 37, 40); m.room(0, 26, 8, 40); m.room(37, 24, 47, 42); m.room(8, 10, 37, 26); m.room(0, 10, 8, 24); m.room(-4, 15, 0, 19); m.room(6, -9, 39, 10);
      m.at(22, 48, '@@'); m.at(22, 40, '++'); m.at(17, 41, 't'); m.at(28, 41, 't');
      m.sign(19, 43, 'SANTUARIO DEL GHIACCIO.\nSUL GHIACCIO I MASSI SCIVOLANO FINCHÉ NON SBATTONO CONTRO QUALCOSA. LA PIASTRA PESANTE SENTE SOLO LA PIETRA.');
      // la sala di ghiaccio: il masso va fatto scivolare sulla piastra pesante
      m.fill(9, 27, 36, 39, 'I'); m.at(14, 36, 'O'); m.at(31, 36, '#'); m.at(30, 27, 'P'); m.at(9, 27, 't'); m.at(9, 39, 't'); m.at(36, 33, 't');
      m.at(22, 26, '11'); m.col(8, 32, '22'); m.col(37, 38, 'DD'); m.trig(1, 'plates'); m.trig(2, 'kill');
      // ovest: i lupi dei ghiacci
      m.at(3, 29, 'e'); m.at(5, 34, 'e'); m.at(2, 37, 'e'); m.chest(4, 31, 'q'); m.at(1, 27, 't'); m.at(7, 27, 't');
      // est: l'armatura di brina oltre l'acqua gelida
      m.fill(38, 30, 46, 36, '~'); m.chest(42, 26, 'C'); m.at(40, 38, 'f'); m.at(44, 40, 'f'); m.at(38, 25, 't'); m.at(46, 25, 't'); m.at(46, 41, 't');
      // nord: il crepaccio, il ponte e i blocchi colorati
      m.fill(9, 16, 36, 17, '_'); m.fill(31, 16, 32, 17, '='); m.at(31, 15, 'rr'); m.at(14, 13, 'x'); m.col(9, 12, 'uu'); m.col(8, 12, '++');
      m.at(20, 21, 'g'); m.at(27, 13, 'g'); m.at(33, 12, 'f'); m.at(9, 25, 't'); m.at(36, 25, 't'); m.at(36, 11, 't'); m.at(22, 10, 'BB');
      // nord-ovest: la grande chiave, e una crepa
      m.fill(1, 15, 7, 20, 'I'); m.chest(4, 11, 'K'); m.at(3, 18, 'e'); m.at(5, 21, 'e'); m.chest(6, 22, 'c', 'pozione:2'); m.at(1, 11, 't'); m.at(7, 23, 't');
      m.col(0, 17, '%'); m.chest(-2, 17, 'c', 'monete:150');
      // la regina sul lago ghiacciato
      m.fill(7, -8, 38, 9, 'I'); m.at(12, -4, '#'); m.at(33, -4, '#'); m.at(12, 5, '#'); m.at(33, 5, '#');
      m.at(22, 0, 'M'); m.at(7, -8, 't'); m.at(38, -8, 't'); m.at(7, 9, 't'); m.at(38, 9, 't');
    },
  },
  fuoco: {
    name: 'SANTUARIO DEL FUOCO', boss: 'salamander', item: 'fenice', gem: 'pFuoco', foes: { e: 'imp', f: 'slimeR', g: 'firebat' },
    floor: 26, wall: 27, fog: '#170706', amb: 0.32, water: '#ff6a1a', torch: [1, 0.62, 0.32], shot: 'fire', pot: ['#8a3a2a', '#4a1a14'], glow: '#ff5a3a',
    make(m) {
      m.room(16, 40, 29, 48); m.room(6, 24, 39, 40); m.room(-6, 18, 6, 36); m.room(39, 18, 52, 40); m.room(6, 6, 39, 24); m.room(39, 8, 43, 12); m.room(4, -14, 41, 6);
      m.at(22, 48, '@@'); m.at(22, 40, '++'); m.at(17, 41, 't'); m.at(28, 41, 't');
      m.sign(19, 43, 'SANTUARIO DEL FUOCO.\nSOLO CHI NON TEME LE FIAMME CAMMINA SUI FIUMI DI LAVA. LE PIASTRE PESANTI ASPETTANO I LORO MASSI.');
      // il fiume di lava
      m.fill(7, 30, 38, 33, 'L'); m.at(7, 25, 'T'); m.at(38, 25, 'T'); m.at(12, 26, 'P'); m.at(13, 26, 'O'); m.at(33, 26, 'P'); m.at(32, 26, 'O');
      m.at(7, 39, 't'); m.at(38, 39, 't'); m.at(16, 25, 't'); m.at(29, 25, 't');
      m.at(22, 24, '11'); m.col(6, 27, '22'); m.col(39, 27, 'DD'); m.trig(1, 'plates'); m.trig(2, 'kill');
      // ovest: i diavoletti
      m.at(-2, 22, 'e'); m.at(3, 26, 'e'); m.at(0, 31, 'e'); m.chest(0, 24, 'q'); m.fill(-4, 28, -2, 30, 'L'); m.at(-5, 19, 't'); m.at(5, 19, 't'); m.at(-5, 35, 't'); m.at(5, 35, 't');
      // est: l'amuleto della fenice oltre le punte
      m.chest(49, 20, 'C'); m.chest(51, 38, 'c', 'monete:120'); m.fill(40, 24, 48, 24, '^'); m.fill(43, 29, 51, 29, '^'); m.fill(40, 34, 48, 34, '^');
      m.at(45, 26, 'g'); m.at(47, 32, 'g'); m.at(42, 37, 'f'); m.at(50, 36, 'f'); m.at(40, 19, 't'); m.at(51, 19, 't');
      // nord: l'abisso, il cristallo e la grande chiave; una crepa a est
      m.fill(9, 18, 14, 21, 'L'); m.fill(30, 18, 35, 21, 'L'); m.fill(7, 14, 38, 15, '_'); m.fill(10, 14, 11, 15, 'U'); m.at(20, 10, 'x'); m.chest(36, 8, 'K');
      m.at(30, 11, 'e'); m.at(14, 9, 'e'); m.at(7, 23, 't'); m.at(38, 23, 't'); m.at(7, 7, 't'); m.at(22, 6, 'BB');
      m.col(39, 10, '%'); m.chest(41, 10, 'c', 'cuore');
      // la salamandra
      m.fill(9, -10, 13, -7, 'L'); m.fill(32, -10, 36, -7, 'L'); m.fill(9, 0, 13, 3, 'L'); m.fill(32, 0, 36, 3, 'L');
      m.at(22, -4, 'M'); m.at(5, -13, 't'); m.at(40, -13, 't'); m.at(5, 5, 't'); m.at(40, 5, 't');
    },
  },
};

// ---------- dalla mappa disegnata alle celle, alle stanze e agli oggetti ----------
const cache = {};
function parse(id) {
  if (cache[id]) return cache[id];
  const def = DEF[id], m = Maker(); def.make(m); const out = m.done(), rows = out.rows;
  const H = rows.length, Wd = Math.max(...rows.map(r => r.length));
  const ch = (i, j) => (j >= 0 && j < H && i >= 0 && i < rows[j].length) ? rows[j][i] : ' ';
  const cell = new Uint8Array(Wd * H), objs = [];
  const BASE = { ' ': ROCK, '#': WALL, '%': CRACK, '.': FLOOR, '_': PIT, '~': WATER, 'L': LAVA, 'I': ICE, '^': SPIKE, '=': BRIDGE, '@': EXIT, 'r': TOGB, 'u': TOGB, 'R': PLAT, 'U': PLAT };
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    const c = ch(i, j), k = j * Wd + i;
    if (BASE[c] !== undefined) cell[k] = BASE[c];
    else if ('DB+123456789'.includes(c)) cell[k] = DOOR;
    else {
      // oggetto appoggiato sul pavimento: ghiaccio se intorno c'è ghiaccio
      let ice = 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (ch(i + a, j + b) === 'I') ice++;
      cell[k] = ice >= 2 ? ICE : FLOOR;
      objs.push({ c, i, j });
    }
    if (c === 'r' || c === 'u' || c === 'R' || c === 'U') objs.push({ c, i, j });
  }
  const P = { id, def, w: Wd, h: H, rows, cell, loot: out.loot, signs: out.signs };
  const at = (i, j) => (i >= 0 && j >= 0 && i < Wd && j < H) ? cell[j * Wd + i] : ROCK;
  P.at = at;
  // stanze: zone di pavimento separate da muri e porte
  const room = new Int16Array(Wd * H).fill(-1), boxes = [];
  const inRoom = t => t !== ROCK && t !== WALL && t !== CRACK && t !== DOOR && t !== EXIT;
  let nR = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    if (room[j * Wd + i] >= 0 || !inRoom(at(i, j))) continue;
    const st = [[i, j]], b = [i, j, i, j]; room[j * Wd + i] = nR;
    while (st.length) { const [x, y] = st.pop(); b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y);
      for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + c; if (X < 0 || Y < 0 || X >= Wd || Y >= H) continue; const kk = Y * Wd + X; if (room[kk] < 0 && inRoom(at(X, Y))) { room[kk] = nR; st.push([X, Y]); } } }
    boxes.push(b); nR++;
  }
  P.room = room; P.nRooms = nR;
  P.rooms = boxes.map(([a, b, c, d]) => ({ i0: a, j0: b, i1: c, j1: d, x: (a + c + 1) / 2 * CS, z: (b + d + 1) / 2 * CS, r: Math.max(c - a + 1, d - b + 1) * CS / 2 }));
  const roomOf = (i, j) => (i >= 0 && j >= 0 && i < Wd && j < H) ? room[j * Wd + i] : -1;
  P.roomOf = roomOf;
  // porte: celle vicine con la stessa lettera
  const seenD = new Uint8Array(Wd * H); P.doors = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    if (at(i, j) !== DOOR || seenD[j * Wd + i]) continue;
    const c = ch(i, j), cells = [], st = [[i, j]]; seenD[j * Wd + i] = 1;
    while (st.length) { const [x, y] = st.pop(); cells.push([x, y]); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b; if (ch(X, Y) === c && !seenD[Y * Wd + X]) { seenD[Y * Wd + X] = 1; st.push([X, Y]); } } }
    const solidX = t => t === WALL || t === DOOR || t === ROCK || t === CRACK;
    const axis = (solidX(at(i - 1, j)) || solidX(at(i + 1, j))) ? 'x' : 'z';    // 'x': la porta corre lungo x, si attraversa da nord a sud
    let cx = 0, cz = 0; for (const [x, y] of cells) { cx += (x + 0.5) * CS; cz += (y + 0.5) * CS; } cx /= cells.length; cz /= cells.length;
    const sides = new Set(); for (const [x, y] of cells) { if (axis === 'x') { sides.add(roomOf(x, y - 1)); sides.add(roomOf(x, y + 1)); } else { sides.add(roomOf(x - 1, y)); sides.add(roomOf(x + 1, y)); } }
    sides.delete(-1);
    P.doors.push({ c, cells, axis, cx, cz, kind: c === 'D' ? 'lock' : c === 'B' ? 'boss' : c === '+' ? 'open' : 'shut', g: /[1-9]/.test(c) ? +c : 0, key: cells[0].join(','), rooms: [...sides] });
  }
  // uscita e punto di partenza
  P.exits = []; for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) if (at(i, j) === EXIT) P.exits.push([i, j]);
  const ex = P.exits.reduce((s, [i]) => s + i, 0) / P.exits.length, ey = P.exits[0][1];
  P.spawn = { x: (ex + 0.5) * CS, z: (ey - 1.1) * CS };
  // oggetti
  P.objs = objs.map(o => ({ ...o, x: (o.i + 0.5) * CS, z: (o.j + 0.5) * CS, room: roomOf(o.i, o.j) }));
  const M = P.objs.find(o => o.c === 'M'); P.bossRoom = M ? M.room : -1; P.bossAt = M;
  // saracinesche: chi le apre?
  P.shut = {};
  for (const d of P.doors) if (d.kind === 'shut' && !P.shut[d.g]) {
    const tg = out.trig[d.g] || ['kill', null, null], type = tg[0];
    let r = tg[1] !== null ? roomOf(tg[1], tg[2]) : -1;
    if (r < 0) {
      const cand = new Set(); for (const dd of P.doors) if (dd.kind === 'shut' && dd.g === d.g) for (const rr of dd.rooms) cand.add(rr);
      const good = [...cand].filter(rr => P.objs.some(o => o.room === rr && (type === 'kill' ? 'efgh'.includes(o.c) : (o.c === 'p' || o.c === 'P'))));
      if (good.length !== 1) throw new Error('SARACINESCA ' + d.g + ' DI ' + id + ': ' + good.length + ' STANZE POSSIBILI');
      r = good[0];
    }
    P.shut[d.g] = { type, room: r };
  }
  return cache[id] = P;
}

// ---------- geometria: pavimenti, muri, pozzi, acqua ----------
// vertice: x, y, z, riquadro x, riquadro y, u, v, luce (1 = brilla da sola)
function quadTo(a, p0, p1, p2, p3, tile, u, v, sh) {
  const tx = tile % 8, ty = Math.floor(tile / 8);
  a.push(p0[0], p0[1], p0[2], tx, ty, 0, v, sh, p1[0], p1[1], p1[2], tx, ty, u, v, sh, p2[0], p2[1], p2[2], tx, ty, u, 0, sh, p3[0], p3[1], p3[2], tx, ty, 0, 0, sh);
}
const LIT = { s: 0.92, n: 0.66, e: 0.8, w: 0.74, top: 0.97, floor: 0.88 };
// una parete verticale sul lato di una cella (lato: 'n', 's', 'e', 'w'), rivolta verso fuori
function sideTo(a, i, j, side, y0, y1, tile, u = 1, sh) {
  const x0 = i * CS, x1 = x0 + CS, z0 = j * CS, z1 = z0 + CS, v = (y1 - y0) / CS, L = sh !== undefined ? sh : LIT[side];
  if (side === 's') quadTo(a, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], tile, u, v, L);
  else if (side === 'n') quadTo(a, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], tile, u, v, L);
  else if (side === 'e') quadTo(a, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], tile, u, v, L);
  else quadTo(a, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], tile, u, v, L);
}
function flatTo(a, x0, z0, x1, z1, y, tile, u = 1, v = 1, sh = LIT.floor) { quadTo(a, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], tile, u, v, sh); }
// una scatola (porte, massi, blocchi): fianchi e coperchio
function boxTo(a, x0, z0, x1, z1, y0, y1, tile, top = tile, sh = 1) {
  const v = (y1 - y0) / CS, ux = Math.max(0.5, (x1 - x0) / CS), uz = Math.max(0.5, (z1 - z0) / CS), k = s => Math.min(0.98, LIT[s] * sh);
  quadTo(a, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], tile, ux, v, k('s'));
  quadTo(a, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], tile, ux, v, k('n'));
  quadTo(a, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], tile, uz, v, k('e'));
  quadTo(a, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], tile, uz, v, k('w'));
  if (top !== null) quadTo(a, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], top, ux, uz, k('top'));
}
const isSolid = t => t === WALL || t === CRACK || t === ROCK;
const isFlat = t => t === FLOOR || t === ICE || t === SPIKE || t === BRIDGE || t === DOOR || t === EXIT || t === TOGB;
const bottomOf = t => t === PIT || t === PLAT ? -PD : t === WATER ? -WD : t === LAVA ? -LD : 0;
// cell: celle attuali (muri rotti, pozzi riempiti); filled: celle riempite da un masso
function buildStatic(P, cell, filled) {
  const D = P.def, Wd = P.w, H = P.h, at = (i, j) => (i >= 0 && j >= 0 && i < Wd && j < H) ? cell[j * Wd + i] : ROCK;
  const floor = [], wall = [], water = [], lava = [];
  const N4 = [[0, -1, 'n'], [0, 1, 's'], [1, 0, 'e'], [-1, 0, 'w']];
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    const t = at(i, j), x0 = i * CS, z0 = j * CS, x1 = x0 + CS, z1 = z0 + CS, k = j * Wd + i;
    if (t === WALL || t === CRACK) {
      const tile = t === CRACK ? 41 : D.wall;
      for (const [a, b, s] of N4) { const n = at(i + a, j + b); if (!isSolid(n)) sideTo(wall, i, j, s, bottomOf(n), WH, tile); }
      let open = false; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (!isSolid(at(i + a, j + b))) open = true;
      if (open) flatTo(wall, x0, z0, x1, z1, WH, tile, 1, 1, LIT.top);
      continue;
    }
    if (isFlat(t)) {
      const tile = t === ICE ? 28 : t === SPIKE ? 29 : t === BRIDGE ? 30 : filled && filled.has(k) ? 47 : P.room[k] === P.bossRoom && P.bossRoom >= 0 ? 44 : D.floor;
      flatTo(floor, x0, z0, x1, z1, 0, tile);
      // bordi verso pozzi, acqua e lava
      for (const [a, b, s] of N4) { const n = at(i + a, j + b); if (n === PIT || n === PLAT || n === WATER || n === LAVA) sideTo(floor, i, j, s, t === BRIDGE ? -1.4 : bottomOf(n), 0, t === BRIDGE ? 30 : 42); }
      // architrave sopra porte e uscite
      if (t === DOOR || t === EXIT) {
        const ax = isSolid(at(i - 1, j)) || at(i - 1, j) === DOOR || at(i - 1, j) === EXIT || isSolid(at(i + 1, j)) || at(i + 1, j) === DOOR || at(i + 1, j) === EXIT;
        if (ax) { sideTo(wall, i, j, 'n', DH, WH, D.wall); sideTo(wall, i, j, 's', DH, WH, D.wall); }
        else { sideTo(wall, i, j, 'e', DH, WH, D.wall); sideTo(wall, i, j, 'w', DH, WH, D.wall); }
        flatTo(wall, x0, z0, x1, z1, WH, D.wall, 1, 1, LIT.top);
        quadTo(wall, [x0, DH, z0], [x1, DH, z0], [x1, DH, z1], [x0, DH, z1], D.wall, 1, 1, 0.5);
        if (t === EXIT) quadTo(wall, [x0, 0, z1 + CS * 0.6], [x1, 0, z1 + CS * 0.6], [x1, DH, z1 + CS * 0.6], [x0, DH, z1 + CS * 0.6], 45, 1, 1, 1);
      }
      continue;
    }
    if (t === WATER) { flatTo(floor, x0, z0, x1, z1, -WD, 43); water.push(x0, z0, x1, z0, x1, z1, x0, z1); }
    if (t === LAVA) lava.push(x0, z0, x1, z0, x1, z1, x0, z1);
    if (t === WATER || t === LAVA) for (const [a, b, s] of N4) { const n = at(i + a, j + b); if (n === PIT) sideTo(floor, i, j, s, -PD, bottomOf(t), 42); }
  }
  return { floor: new Float32Array(floor), wall: new Float32Array(wall), water: new Float32Array(water), lava: new Float32Array(lava) };
}

// ---------- piastrelle dei santuari (riquadri 18-47 dell'atlante degli edifici) ----------
function tilesOn(c, R) {
  const T = 32, g = c.getContext('2d'), sh = A.shade, rnd = n => Math.floor(R() * n);
  const at = (i, fn) => { g.save(); g.translate((i % 8) * T, Math.floor(i / 8) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); fn(); g.restore(); };
  const speck = (cols, n, w = 1, h = 1) => { for (let k = 0; k < n; k++) { g.fillStyle = cols[rnd(cols.length)]; g.fillRect(rnd(T), rnd(T), w, h); } };
  const fill = (col, n, v) => { g.fillStyle = col; g.fillRect(0, 0, T, T); for (let k = 0; k < n; k++) { g.fillStyle = sh(col, 1 + (R() - 0.5) * v); g.fillRect(rnd(T), rnd(T), 1 + (R() < 0.3), 1); } };
  const flags = (col, gap) => {
    g.fillStyle = gap; g.fillRect(0, 0, T, T);
    for (const [x, y, w, h] of [[0, 0, 16, 16], [16, 0, 16, 10], [16, 10, 16, 6], [0, 16, 10, 16], [10, 16, 22, 16]]) {
      g.fillStyle = sh(col, 0.9 + R() * 0.2); g.fillRect(x + 1, y + 1, w - 1, h - 1);
      g.fillStyle = sh(col, 1.15); g.fillRect(x + 1, y + 1, w - 1, 1); g.fillStyle = sh(col, 0.8); g.fillRect(x + 1, y + h - 1, w - 1, 1);
    }
  };
  const bricks = (col, mortar, bw, bh) => { g.fillStyle = mortar; g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0; for (let x = -bw; x < T; x += bw) { g.fillStyle = sh(col, 0.86 + R() * 0.26); g.fillRect(x + off + 1, y + 1, bw - 1, bh - 1); g.fillStyle = sh(col, 1.14); g.fillRect(x + off + 1, y + 1, bw - 1, 1); } } };
  // bosco
  at(18, () => { flags('#5e6e52', '#2a3424'); speck(['#4a8a3a', '#6aa84a', '#3a6a2a'], 70, 2, 1); });
  at(19, () => { bricks('#6a7660', '#2e3628', 11, 7); speck(['#4a8a3a', '#5a9a44'], 50, 2, 1); g.fillStyle = '#4a3420'; for (let k = 0; k < 2; k++) { let x = rnd(T); for (let y = 0; y < T; y++) { g.fillRect(x, y, 1, 1); if (R() < 0.3) x += R() < 0.5 ? -1 : 1; } } });
  // lago
  at(20, () => { flags('#5a7a96', '#26384a'); g.fillStyle = 'rgba(170,220,250,.35)'; for (let x = 0; x < T; x++) { const y = 8 + Math.round(Math.sin(x / T * TAU * 2) * 2); g.fillRect(x, y, 1, 1); g.fillRect(x, y + 16, 1, 1); } });
  at(21, () => { bricks('#4e6e8e', '#22324a', 12, 8); speck(['#e8e0d0', '#f0c8b8'], 8, 2, 2); });
  // sole
  at(22, () => { flags('#d8b070', '#8a6430'); g.fillStyle = '#e8a83a'; g.fillRect(6, 6, 4, 4); g.fillRect(7, 4, 2, 8); g.fillRect(4, 7, 8, 2); });
  at(23, () => { bricks('#d4ac6c', '#8a6a3a', 16, 8); g.fillStyle = '#e8b830'; g.fillRect(0, 13, T, 3); g.fillStyle = '#a87a1a'; g.fillRect(0, 16, T, 1); });
  // ghiaccio
  at(24, () => { flags('#a8bccc', '#5a6e82'); speck(['#e8f4ff', '#ffffff'], 30); });
  at(25, () => { bricks('#9ac0e0', '#4a6a8a', 14, 8); g.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 4; k++) { const x = rnd(T), y = rnd(T); g.fillRect(x, y, 3, 1); g.fillRect(x + 1, y - 1, 1, 3); } });
  // fuoco
  at(26, () => { flags('#4a3a3a', '#1a1010'); g.fillStyle = '#ff6a1a'; g.fillRect(15, 0, 1, 15); g.fillRect(9, 16, 1, 16); g.fillStyle = '#ffb030'; g.fillRect(15, 4, 1, 3); g.fillRect(9, 22, 1, 4); });
  at(27, () => { bricks('#5a2a24', '#1a0a08', 11, 7); speck(['#8a3a2a', '#ff7a2a'], 12); });
  // ghiaccio scivoloso, punte, ponte
  at(28, () => { g.fillStyle = '#9cc8e0'; g.fillRect(0, 0, T, T); g.fillStyle = '#cfeaf8'; for (let k = 0; k < 6; k++) { const x = rnd(T), y = rnd(T), l = 4 + rnd(8); for (let i = 0; i < l; i++) g.fillRect(x + i, y - i, 1, 1); } speck(['#7ab0d0'], 20); });
  at(29, () => { g.fillStyle = '#2a2a32'; g.fillRect(0, 0, T, T); for (let y = 2; y < T; y += 8) for (let x = 2; x < T; x += 8) { g.fillStyle = '#5a5a66'; g.fillRect(x, y, 5, 5); g.fillStyle = '#d8dce8'; g.fillRect(x + 2, y, 1, 4); g.fillRect(x + 1, y + 2, 3, 1); g.fillStyle = '#ffffff'; g.fillRect(x + 2, y, 1, 1); } });
  at(30, () => { g.fillStyle = '#3a2414'; g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += 8) { g.fillStyle = sh('#9a6a3a', 0.85 + R() * 0.3); g.fillRect(0, y + 1, T, 6); g.fillStyle = '#5a3a1e'; g.fillRect(rnd(T), y + 2, 2, 1); g.fillRect(rnd(T), y + 5, 2, 1); } });
  // porte: a chiave, del guardiano, saracinesca
  at(31, () => { g.fillStyle = '#3a2416'; g.fillRect(0, 0, T, T); for (let x = 1; x < T; x += 6) { g.fillStyle = sh('#8a5a30', 0.85 + R() * 0.3); g.fillRect(x, 0, 5, T); } g.fillStyle = '#5a5a66'; g.fillRect(0, 5, T, 3); g.fillRect(0, 24, T, 3); g.fillStyle = '#ffc83a'; g.fillRect(12, 12, 8, 9); g.fillStyle = '#1a1010'; g.fillRect(15, 14, 2, 3); g.fillRect(15, 17, 2, 2); });
  at(32, () => { g.fillStyle = '#2a2230'; g.fillRect(0, 0, T, T); g.fillStyle = '#4a3e56'; g.fillRect(2, 2, T - 4, T - 4); g.fillStyle = '#c89a2a'; g.fillRect(0, 0, T, 2); g.fillRect(0, T - 2, T, 2); g.fillRect(0, 0, 2, T); g.fillRect(T - 2, 0, 2, T);
    ['.aaaaa.', 'aaaaaaa', 'abaaaba', 'aaaaaaa', '.aacaa.', '.a.a.a.'].forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] !== '.') { g.fillStyle = r[x] === 'a' ? '#ffd86a' : r[x] === 'b' ? '#1a1010' : '#c89a2a'; g.fillRect(9 + x * 2, 9 + y * 2, 2, 2); } }); });
  at(33, () => { g.clearRect(0, 0, T, T); for (let x = 2; x < T; x += 6) { g.fillStyle = '#6a6a76'; g.fillRect(x, 0, 3, T); g.fillStyle = '#a8a8b4'; g.fillRect(x, 0, 1, T); } g.fillStyle = '#4a4a54'; g.fillRect(0, 3, T, 3); g.fillRect(0, 26, T, 3); });
  // piastre
  const plate = (col, rune) => { g.fillStyle = '#2a2a30'; g.fillRect(0, 0, T, T); g.fillStyle = col; g.fillRect(3, 3, T - 6, T - 6); g.fillStyle = sh(col, 1.25); g.fillRect(3, 3, T - 6, 2); g.fillStyle = rune; g.fillRect(12, 9, 8, 2); g.fillRect(15, 9, 2, 14); g.fillRect(10, 21, 12, 2); };
  at(34, () => plate('#7a8090', '#4ae0e8')); at(35, () => plate('#4a505c', '#2a7a80'));
  at(46, () => { plate('#8a7a6a', '#ff9a3a'); g.fillStyle = '#ff9a3a'; for (let i = 0; i < 13; i++) { g.fillRect(9 + i, 9 + i, 2, 2); g.fillRect(21 - i, 9 + i, 2, 2); } });
  // masso
  at(36, () => { g.fillStyle = '#6a6a74'; g.fillRect(0, 0, T, T); g.fillStyle = '#8a8a96'; g.fillRect(2, 2, T - 4, T - 4); g.fillStyle = '#a8a8b4'; g.fillRect(2, 2, T - 4, 2); g.fillRect(2, 2, 2, T - 4); g.fillStyle = '#4a4a54'; g.fillRect(2, T - 4, T - 4, 2); g.fillRect(T - 4, 2, 2, T - 4); g.fillStyle = '#5a5a66'; for (let a = 0; a < 16; a += 0.4) { const r = 1 + a * 0.62; g.fillRect(Math.round(16 + Math.cos(a) * r), Math.round(16 + Math.sin(a) * r), 2, 2); } });
  // blocchi colorati: alzati e abbassati
  const tog = (col, low) => { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, T, T); g.fillStyle = col; if (low) { g.fillRect(2, 2, T - 4, 2); g.fillRect(2, T - 4, T - 4, 2); g.fillRect(2, 2, 2, T - 4); g.fillRect(T - 4, 2, 2, T - 4); return; }
    g.fillRect(1, 1, T - 2, T - 2); g.fillStyle = sh(col, 1.35); g.fillRect(1, 1, T - 2, 3); g.fillRect(1, 1, 3, T - 2); g.fillStyle = sh(col, 0.65); g.fillRect(1, T - 4, T - 2, 3); g.fillRect(T - 4, 1, 3, T - 2); g.fillStyle = sh(col, 1.2); g.fillRect(12, 12, 8, 8); };
  at(37, () => tog('#d83a3a')); at(38, () => tog('#3a7ae8')); at(39, () => tog('#d83a3a', 1)); at(40, () => tog('#3a7ae8', 1));
  // muro crepato
  at(41, () => { bricks('#7a746a', '#3a3630', 11, 7); g.fillStyle = '#141210'; let x = 16, y = 0; while (y < T) { g.fillRect(x, y, 2, 2); y += 2; x += rnd(3) - 1; if (R() < 0.25) { let bx = x, by = y; for (let k = 0; k < 5; k++) { g.fillRect(bx, by, 1, 1); bx += R() < 0.5 ? 1 : -1; by++; } } } });
  // roccia dei pozzi, fondale, pavimento del guardiano, luce del giorno, lastra
  at(42, () => { fill('#2a2a30', 80, 0.5); g.fillStyle = '#1a1a1e'; for (let y = 4; y < T; y += 7) g.fillRect(0, y, T, 1); });
  at(43, () => fill('#1e3a4a', 60, 0.4));
  at(44, () => { flags('#4a4448', '#1e1a20'); g.fillStyle = '#a8842a'; for (const [x, y] of [[0, 0], [T - 3, 0], [0, T - 3], [T - 3, T - 3]]) g.fillRect(x, y, 3, 3); g.fillStyle = '#6a2a30'; g.fillRect(13, 13, 6, 6); g.fillStyle = '#a8842a'; g.fillRect(15, 15, 2, 2); });
  at(45, () => { for (let y = 0; y < T; y++) { const k = y / T; g.fillStyle = 'rgb(' + Math.round(255 - 90 * k) + ',' + Math.round(250 - 34 * k) + ',' + Math.round(224 + 31 * k) + ')'; g.fillRect(0, y, T, 1); } });
  at(47, () => { g.fillStyle = '#5a5a66'; g.fillRect(0, 0, T, T); g.fillStyle = '#7a7a86'; g.fillRect(1, 1, T - 2, T - 2); g.fillStyle = '#5a5a66'; g.fillRect(15, 1, 2, T - 2); g.fillRect(1, 15, T - 2, 2); });
  return c;
}

// ---------- disegni: oggetti, nuovi mostri e guardiani ----------
const sh = A.shade, Y = (s, a, b) => s > 0 ? [a, b] : [-b, -a];
const brazier = () => A.pix(['.aaaaaaaa.', 'abbbbbbbba', '.abbbbbba.', '..aaaaaa..', '...acca...', '...acca...', '...acca...', '...acca...', '...acca...', '..accca...', '.aaaaaaaa.', 'adddddddda'], { a: '#1a1418', b: '#5a4a3a', c: '#8a7a6a', d: '#4a3e34' });
const pot = (c1, c2) => A.pix(['..aaaa..', '.abbbba.', '..abba..', '.abbbba.', 'abbccbba', 'abbbbbba', 'abcbbbba', '.abbbba.', '..aaaa..'], { a: '#1a1418', b: c1, c: c2 });
const xtal = (c1, c2) => A.pix(['....a....', '...aba...', '..abcba..', '.abccdba.', 'abccddcba', '.abcddba.', '..abdba..', '...aba...', '....a....', '...eee...', '..effffe.', '.effffffe', 'eeeeeeeee'], { a: '#141018', b: c1, c: c2, d: '#ffffff', e: '#3a3440', f: '#6a6070' });
const gem = c => A.pix(['....a....', '...aba...', '..abcba..', '.abccdba.', 'abccdddba', 'abcccddba', 'abbcccdba', '.abbccba.', '..abbba..', '...aba...', '....a....'], { a: '#141018', b: sh(c, 0.7), c, d: '#ffffff' });
function portal(f) {
  const c = A.mk(16, 46), g = c.getContext('2d');
  for (let y = 0; y < 46; y++) { const w = 3 + Math.round(4 * (1 - y / 46)) + (f && y % 6 < 3 ? 1 : 0); g.fillStyle = y % 4 < 2 ? '#fff8d0' : '#bfe8ff'; g.fillRect(8 - w, y, w * 2, 1); g.fillStyle = '#ffffff'; g.fillRect(7, y, 2, 1); }
  for (let k = 0; k < 8; k++) { g.fillStyle = '#ffffff'; g.fillRect((k * 5 + f * 3) % 14 + 1, (k * 11 + f * 7) % 44, 1, 2); }
  return c;
}
function turret(c, eye) {
  return [{ t: 'b', b: [-5, 5, -5, 5, 0, 9], c: sh(c, 0.75) }, { t: 'b', b: [-4.5, 4.5, -4.5, 4.5, 9, 17.5], c },
    { t: 'b', b: [4.4, 4.8, 1.2, 3, 14.5, 16.2], c: eye, k: 1.3 }, { t: 'b', b: [4.4, 4.8, -3, -1.2, 14.5, 16.2], c: eye, k: 1.3 },
    { t: 'b', b: [4.4, 4.9, -2.2, 2.2, 10.5, 13], c: '#140c0c' }, { t: 'b', b: [-2, 2, 3.4, 5.4, 17, 20.5], c }, { t: 'b', b: [-2, 2, -5.4, -3.4, 17, 20.5], c }];
}
function plant(f) {
  const P = [], B = (b, c, rot) => P.push({ t: 'b', b, c, rot });
  B([-0.9, 0.9, -0.9, 0.9, 0, 10.5], '#3a7a2a');
  for (const a of [0, 1.6, 3.2, 4.8]) B([-0.8, 0.8, 0.6, 6, 0, 1.4], '#4a9a3a', [['z', a, 0, 0, 0]]);
  const o = f ? 0.55 : 0.1;
  B([-3, 4, -3.4, 3.4, 9.5, 12.5], '#b8302a');
  B([-3, 4, -3.4, 3.4, 12.8, 16.4], '#e04a3a', [['y', -o, -3, 0, 12.8]]);
  B([3.6, 4.3, -2.6, 2.6, 12.2, 13.2], '#ffffff', [['y', -o * 0.5, -3, 0, 12.8]]);
  for (const [x, y] of [[0, 1.5], [1.6, -1.6], [-1.4, -0.8]]) B([x - 0.6, x + 0.6, y - 0.6, y + 0.6, 16.3, 16.7], '#fff4d0', [['y', -o, -3, 0, 12.8]]);
  return P;
}
function crab(f) {
  const P = [], c = '#e0603a', c2 = '#ffb070', B = (b, col, rot) => P.push({ t: 'b', b, c: col, rot });
  B([-4.5, 4.5, -6, 6, 3, 7], c); B([-4, 4, -5.5, 5.5, 2.4, 3.2], c2);
  for (const s of [1, -1]) { B([2, 3, ...Y(s, 1, 2), 7, 9.5], c); B([2, 3.2, ...Y(s, 0.8, 2.2), 9.5, 10.7], '#1a1420'); }
  for (const s of [1, -1]) { const a = f ? 0.45 : -0.15; B([3, 9, ...Y(s, 4.5, 7.5), 4, 6.5], c, [['z', s * 0.3, 3, s * 6, 5]]); B([8, 11.5, ...Y(s, 4.5, 8.5), 3.5, 7.5], c2, [['z', s * (0.3 + a), 8, s * 6.5, 5]]); }
  for (const s of [1, -1]) for (const x of [-3, 0, 3]) B([x - 0.6, x + 0.6, ...Y(s, 6, 9.5), 0, 4], c, [['x', s * (f ? 0.35 : -0.25) * (x === 0 ? -1 : 1), x, s * 6, 4]]);
  return P;
}
// guardiani (X avanti, Y sinistra, Z su)
function golem(p) {
  const P = [], B = (b, c, rot, k) => P.push({ t: 'b', b, c, rot, k }), stone = '#7e7e72', dark = '#5a5a50', moss = '#4a8a3a', moss2 = '#6aaa4a';
  const st = p === 3, tz = st ? 6 : 11, arm = p === 1 ? -2.6 : p === 2 ? 1.25 : st ? 1.05 : 0.12;
  for (const s of [1, -1]) B([-3.5, 3.5, ...Y(s, 2, 8), 0, tz + 1], dark);
  B([-7, 7, -10, 10, tz, tz + 18], stone); B([-7.3, 7.3, -10.3, 10.3, tz + 14, tz + 19], moss); B([-5, 5, -8, 8, tz + 18.5, tz + 20], moss2);
  B([6.9, 7.7, -2.6, 2.6, tz + 6, tz + 12], st ? '#b8ffb8' : '#2e5a2e', null, st ? 1.45 : 1);
  B([-3, 5, -4.5, 4.5, tz + 18, tz + 25], stone); B([-3.3, 5.3, -4.8, 4.8, tz + 23, tz + 25.6], moss);
  for (const s of [1, -1]) B([4.9, 5.4, ...Y(s, 1.4, 3.4), tz + 20.5, tz + 22.2], st ? '#2a2a2a' : '#7aff8a', null, 1.3);
  for (const s of [1, -1]) { const rot = [['y', arm, 0, s * 12.5, tz + 16]]; B([-3, 3, ...Y(s, 10, 15), tz + 2, tz + 18], dark, rot); B([-4, 4, ...Y(s, 9.5, 15.5), tz - 5, tz + 3], stone, rot); B([-3.2, 3.2, ...Y(s, 10, 15.2), tz + 13, tz + 17], moss, rot); }
  return P;
}
function serpent(p) {
  const P = [], c = '#2a8a9a', c2 = '#1e6a7a', belly = '#bfe8c8', fin = '#e8f48a', B = (b, col, rot, k) => P.push({ t: 'b', b, c: col, rot, k }), O = (o, r, col, z) => P.push({ t: 'o', o, r, c: col, z });
  const low = p === 3, H = low ? 9 : 18, lean = p === 1 ? 9 : 5, side = p === 2 ? 8 : 0, drop = p === 2 ? 5 : 0;
  let hx = 0, hy = 0, hz = 0;
  for (let i = 0; i < 9; i++) {
    const t = i / 8, x = -4 + lean * t * t + Math.sin(t * 3) * 2, y = side * t * t, z = t * H - drop * t * t, r = 5.6 - t * 1.6;
    O([x, y, z], r, i % 2 ? c : c2); O([x + r * 0.55, y, z], r * 0.62, belly, 1);
    if (i % 2 === 0 && i < 8) B([x - r - 1.6, x - r + 0.2, y - 0.4, y + 0.4, z - 1, z + 3.5], fin);
    hx = x; hy = y; hz = z;
  }
  const mo = p === 1 ? 0.65 : 0.05, tilt = p === 2 ? 0.6 : 0, R = extra => [...(extra || []), ['x', tilt, hx, hy, hz]];
  B([hx - 4, hx + 8, hy - 4.6, hy + 4.6, hz + 0.5, hz + 6.5], c, R());
  B([hx + 6, hx + 11, hy - 3.2, hy + 3.2, hz + 1.5, hz + 5.5], c, R());
  B([hx - 3, hx + 10.5, hy - 3.8, hy + 3.8, hz - 1.5, hz + 0.8], belly, R([['y', mo, hx - 3, hy, hz + 0.5]]));
  if (p === 1) B([hx + 2, hx + 9, hy - 2.6, hy + 2.6, hz + 0.6, hz + 1.4], '#e83a4a', R());
  for (const s2 of [1, -1]) {
    B([hx + 4, hx + 6.6, ...Y(s2, 3, 4.9), hz + 4.2, hz + 6.4], p === 2 ? '#1a1420' : '#ffe14a', R(), 1.35);
    B([hx - 3, hx + 1, ...Y(s2, 4.4, 8.5), hz + 3, hz + 7.5], fin, R([['x', s2 * -0.5, hx, hy + s2 * 4.5, hz + 4]]));
  }
  B([hx - 5, hx - 1, hy - 0.6, hy + 0.6, hz + 5, hz + 11], fin, R());
  return P;
}
function scarab(p) {
  const P = [], g1 = '#d8a82a', g2 = '#ffe07a', d = '#6a4a0e', B = (b, c, rot, k) => P.push({ t: 'b', b, c, rot, k }), O = (o, r, c, rz) => P.push({ t: 'o', o, r, c, rz });
  if (p === 3) {
    O([0, 0, 6], 12, d, 6); O([0, 0, 8.5], 9, '#4a3410', 4); O([11, 0, 5], 4.5, d);
    for (const s of [1, -1]) for (const x of [-6, 0, 6]) B([x - 0.9, x + 0.9, ...Y(s, 3, 5), 10, 19], d, [['x', s * 0.5, x, s * 4, 10]]);
    return P;
  }
  const L = p === 1 ? 0.5 : p === 0 ? -0.5 : 0, dip = p === 2 ? -2.5 : 0;
  O([-2, 0, 10 + dip * 0.2], 12.5, g1, 8.5); B([-14, 9, -0.5, 0.5, 9, 18.3], d); O([-1, 3.5, 15], 3, g2, 2); O([-1, -3.5, 15], 3, g2, 2);
  O([11, 0, 8 + dip], 5.5, d, 4.5);
  B([13, 22, -1.3, 1.3, 7 + dip, 10 + dip], g2, [['y', p === 2 ? 0.15 : -0.55, 13, 0, 8 + dip]]);
  for (const s of [1, -1]) B([14, 15, ...Y(s, 1.8, 3.4), 9 + dip, 10.6 + dip], '#ff3a2a', null, 1.3);
  for (const s of [1, -1]) for (const [x, a] of [[-6, L], [0, -L], [6, L]]) B([x - 1, x + 1, ...Y(s, 8, 15), 0, 6.5], d, [['y', a * s, x, s * 8, 6.5]]);
  return P;
}
function queen(p) {
  const P = A.human({ skin: '#d8ecff', hairStyle: 'long', hair: '#ffffff', robe: '#4a7ac8', shirt: '#8ab8f0', sleeve: '#c8e4ff', pants: '#4a7ac8', boots: '#4a7ac8', cape: '#e8f4ff', staff: '#bfe6ff', orb: '#ffffff', eyes: '#4ae0ff', helm: { c: '#cfeaff', crown: true, gem: '#4ae0ff' } },
    p === 1 ? { armR: 2.7, armL: 2.3 } : p === 2 ? { armR: 0.9, armL: 0.9, bob: -1 } : { armR: 0.35, armL: -0.2 });
  if (p === 2) for (const q of P) { if (q.t === 'b') { q.b = q.b.slice(); q.b[4] -= 5; q.b[5] -= 5; } else { q.o = q.o.slice(); q.o[2] -= 5; } q.rot = (q.rot || []).concat([['y', -0.45, 0, 0, 4]]); }
  return P;
}
function salamander(p) {
  const P = [], cool = p === 3, c = cool ? '#4e4a4a' : '#d8401a', c2 = cool ? '#6e6a6a' : '#ffb040', d = cool ? '#2a2828' : '#8a1e10', fr = cool ? '#5a5656' : '#ff8a2a', B = (b, col, rot, k) => P.push({ t: 'b', b, c: col, rot, k });
  const L = p === 0 ? 0.45 : p === 1 ? -0.45 : 0, hr = p === 2 ? -0.4 : 0, H = [['y', hr, 8, 0, 8]];
  B([-11, 10, -6.5, 6.5, 4, 12], c); B([-10, 9, -5.5, 5.5, 3.2, 4.2], c2);
  // collare di fuoco dietro la testa: si vede bene di fronte
  B([7, 8.6, -9.5, 9.5, 5, 16], fr, H, cool ? 1 : 1.2); B([7.2, 8.4, -7, 7, 15.5, 18.5], cool ? fr : '#ffe14a', H, cool ? 1 : 1.3);
  B([8, 19, -4.8, 4.8, 6, 12.5], c, H);
  B([16, 21.5, -3.6, 3.6, 4.4, 7], p === 2 ? '#ffe14a' : d, [['y', hr + (p === 2 ? 0.45 : 0), 16, 0, 7]], p === 2 ? 1.4 : 1);
  if (p === 2) B([18, 21.6, -2.8, 2.8, 7, 8], '#fff4b0', H, 1.4);
  for (const s2 of [1, -1]) { B([16.5, 18.5, ...Y(s2, 2.6, 4.9), 10, 12.2], cool ? '#2a2a2a' : '#ffe14a', H, 1.35); B([19, 20, ...Y(s2, 1, 2), 7.2, 8], '#1a0a08', H); }
  B([-23, -10, -3.4, 3.4, 5, 10], c, [['z', 0.22, -10, 0, 6]]); B([-35, -21, -2.2, 2.2, 5.4, 8.6], d, [['z', 0.5, -10, 0, 6]]);
  for (const [fx2, fy, a] of [[6, 1, L], [6, -1, -L], [-7, 1, -L], [-7, -1, L]]) B([fx2 - 2, fx2 + 2, ...Y(fy, 5, 10), 0, 6.5], d, [['y', a, fx2, fy * 6, 6.5]]);
  if (!cool) for (const x of [-8, -4, 0, 4]) B([x - 1.2, x + 1.2, -0.8, 0.8, 12, 15.5 + (x % 8 ? 1.5 : 0)], '#ffe14a', null, 1.35);
  return P;
}
const BOSS = {
  golem: { n: 'GOLEM DI MUSCHIO', s: 'IL GUARDIANO DEL BOSCO', poses: 4, make: golem, w: 112, h: 112, sc: 2.1, bs: 0.25, r: 10, hp: 10 },
  serpent: { n: 'SERPENTE DEL LAGO', s: 'IL GUARDIANO DELLE ACQUE', poses: 4, make: serpent, w: 112, h: 100, sc: 2.3, bs: 0.26, r: 8, hp: 12 },
  scarab: { n: "SCARABEO D'ORO", s: 'IL GUARDIANO DEL SOLE', poses: 4, make: scarab, w: 120, h: 80, sc: 2.5, bs: 0.24, r: 10, hp: 14 },
  queen: { n: 'REGINA DI BRINA', s: 'LA GUARDIANA DEI GHIACCI', poses: 3, make: queen, w: 72, h: 80, sc: 1.9, bs: 0.3, r: 5, hp: 16 },
  salamander: { n: 'SALAMANDRA DI BRACE', s: 'LA GUARDIANA DEL FUOCO', poses: 4, make: salamander, w: 136, h: 96, sc: 2.3, bs: 0.29, r: 11, hp: 18 },
};
// costruisce nell'atlante del santuario i disegni che servono lì: guardiano, nemici nuovi, oggetti
function art(id, atlas) {
  const P = parse(id), D = P.def, CH = {}, SP = {};
  const dirs = (make, w, h, o) => { const out = []; for (let d = 0; d < 8; d++) out.push(atlas.add(A.figure(make(), d / 8 * TAU, w, h, o))); return out; };
  const B = BOSS[D.boss];
  CH.boss = []; for (let p = 0; p < B.poses; p++) CH.boss.push(dirs(() => B.make(p), B.w, B.h, { sc: B.sc, base: B.h - 4 }));
  const need = new Set(Object.values(D.foes));
  if (need.has('plant')) CH.plant = [0, 1].map(f => dirs(() => plant(f), 26, 28));
  if (need.has('crab')) CH.crab = [0, 1].map(f => dirs(() => crab(f), 34, 22));
  if (need.has('slimeB')) CH.slimeB = [0, 1].map(f => dirs(() => A.slime({ c: '#4a8ae8' }, f), 34, 26));
  if (need.has('slimeR')) CH.slimeR = [0, 1].map(f => dirs(() => A.slime({ c: '#ff6a2a' }, f), 34, 26));
  if (need.has('mummy')) CH.mummy = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0, armL: 2.6 }, { armR: 1.4, armL: 1.2, leg: -0.3 }].map(p => dirs(() => A.human({ skin: '#d8d0b0', hand: '#d8d0b0', shirt: '#cfc6a4', sleeve: '#d8d0b0', pants: '#bdb492', boots: '#9a9278', eyes: '#ff3a2a', belt: '#a89e7c' }, p), 44, 48));
  if (need.has('iceskel')) CH.iceskel = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0 }, { armR: 1.4, leg: -0.3 }].map(p => dirs(() => A.human({ skin: '#cfe8ff', hand: '#cfe8ff', skull: true, shirt: '#8ab8e0', sleeve: '#cfe8ff', pants: '#8ab8e0', boots: '#5a7a9a', weapon: { col: '#bfe6ff', guard: '#5a8ac0', glow: '#ffffff' } }, p), 44, 48));
  if (need.has('icebat')) CH.icebat = [0, 1].map(f => dirs(() => A.bat(f, '#8ab8e0', '#5a7aa8', '#ffffff'), 40, 30));
  if (need.has('firebat')) CH.firebat = [0, 1].map(f => dirs(() => A.bat(f, '#c8342c', '#7a1a14', '#ffe14a'), 40, 30));
  SP.turret = dirs(() => turret(sh(D.pot[0], 0.9), '#ff6a3a'), 30, 30);
  SP.brazier = atlas.add(A.finish(brazier()));
  SP.pot = atlas.add(A.finish(pot(D.pot[0], D.pot[1])));
  SP.xtal = [atlas.add(xtal('#e83a3a', '#ff9a9a')), atlas.add(xtal('#3a7ae8', '#9ac8ff'))];
  SP.gem = atlas.add(gem(D.glow));
  SP.portal = [atlas.add(portal(0)), atlas.add(portal(1))];
  SP.lapide = atlas.add(A.pix(['.aaaaaa.', 'abbbbbba', 'abccccba', 'abbbbbba', 'abccccba', 'abbbbbba', 'abccccba', 'abbbbbba', 'aaaaaaaa'], { a: '#1a1418', b: '#8a8a94', c: '#4a4a54' }));
  return { CH, SP, boss: B };
}

SG.dun = { CS, WH, DH, PD, WD, LD, T: { ROCK, WALL, CRACK, FLOOR, PIT, WATER, LAVA, ICE, SPIKE, BRIDGE, DOOR, EXIT, TOGB, PLAT }, ORDER, DEF, BOSS, parse, buildStatic, quadTo, boxTo, flatTo, tilesOn, art };
})();
