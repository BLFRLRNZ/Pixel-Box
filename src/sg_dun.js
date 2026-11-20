// ===================== PIXEL SAGA · i santuari =====================
// Le mappe dei cinque santuari, disegnate a mano stanza per stanza, la loro geometria 3D,
// le piastrelle dei muri e i disegni di mostri e guardiani. Tutto vive in SG.dun.
(() => {
const A = SG.art, TAU = Math.PI * 2;
// misure: lato della cella, altezza dei muri e delle porte, profondità di pozzi, acqua e lava
const CS = 10, WH = 14, DH = 10.5, PD = 34, WD = 6, LD = 1.2;
// tipi di cella
const ROCK = 0, WALL = 1, CRACK = 2, FLOOR = 3, PIT = 4, WATER = 5, LAVA = 6, ICE = 7, SPIKE = 8, BRIDGE = 9, DOOR = 10, EXIT = 11, TOGB = 12, PLAT = 13, STAIR = 14;
const ORDER = ['bosco', 'lago', 'sole', 'ghiaccio', 'fuoco'];

// ---------- come si disegna una mappa: stanze, porte e oggetti ----------
// Legenda: ' ' roccia, '#' muro, '%' muro crepato, '.' pavimento, '_' pozzo, '~' acqua profonda, 'L' lava,
// 'I' ghiaccio, '^' punte, '=' ponte, '@' uscita, 'D' porta a chiave, 'B' porta del guardiano, '+' passaggio,
// '1'-'9' saracinesca, 'r'/'u' blocchi rossi/blu, 'R'/'U' piattaforme rosse/blu sopra i pozzi, 'x' cristallo,
// 'O' masso, 'p' piastra, 'P' piastra pesante (solo massi), 't' braciere, 'v' vaso, 'T' statua che spara, 'S' lapide,
// 'k' forziere con piccola chiave, 'q' lo stesso ma compare a stanza ripulita, 'c'/'Q' forziere con bottino,
// 'K' grande chiave, 'C' grande forziere, 'M' guardiano, 'e' 'f' 'g' 'h' nemici, 'j' il campione del piano.
// Piani: '@' è la via del ritorno (l'uscita, oppure la scala verso il piano prima), '>' la scala verso il piano dopo,
// 'G' il sigillo che si spezza quando cade il guardiano. Arredi: '$' oro, '*' cristalli che fanno luce, 'A' statua, 'b' ossa,
// ':' tappeto, ';' lastra con la runa.
function Maker() {
  const cells = new Map(), extra = { loot: {}, signs: {}, trig: {} };
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const key = (x, y) => x + ',' + y;
  const put = (x, y, ch) => { cells.set(key(x, y), ch); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  const get = (x, y) => cells.get(key(x, y)) || ' ';
  return {
    room(a, b, c, d, fl = '.') { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) { if (x === a || x === c || y === b || y === d) { if (get(x, y) === ' ') put(x, y, '#'); } else put(x, y, fl); } },
    fill(a, b, c, d, ch) { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) put(x, y, ch); },
    get, at(x, y, s) { for (let i = 0; i < s.length; i++) put(x + i, y, s[i]); },
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
      m.at(37, 17, 'g'); m.at(42, 15, 'g'); m.at(43, 19, 'f'); m.at(36, 8, 'h'); m.at(42, 6, '>>'); m.at(42, 7, ';;'); m.at(42, 8, ';;'); m.at(44, 21, 't');
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
      m.fill(11, 4, 30, 12, '~'); m.fill(18, 6, 23, 10, '.'); m.chest(20, 8, 'c', 'monete:80'); m.at(20, 2, '>>'); m.at(20, 3, ';;'); m.at(18, 6, 't'); m.at(23, 10, 't'); m.col(31, 3, 'BB');
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
      m.fill(11, 18, 34, 21, '_'); m.fill(22, 18, 23, 21, 'U'); m.at(22, 15, 'x'); m.col(10, 14, '>>'); m.at(11, 14, ';;'); m.at(11, 15, ';;'); m.at(30, 15, 'f'); m.at(15, 16, 'f');
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
      m.fill(1, 15, 7, 20, 'I'); m.at(3, 10, '>>'); m.at(3, 11, ';;'); m.at(3, 12, ';;'); m.at(3, 18, 'e'); m.at(5, 21, 'e'); m.chest(6, 22, 'c', 'pozione:2'); m.at(1, 11, 't'); m.at(7, 23, 't');
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
      m.fill(9, 18, 14, 21, 'L'); m.fill(30, 18, 35, 21, 'L'); m.fill(7, 14, 38, 15, '_'); m.fill(10, 14, 11, 15, 'U'); m.at(20, 10, 'x'); m.col(6, 9, '>>'); m.at(7, 9, ';;'); m.at(7, 10, ';;');
      m.at(30, 11, 'e'); m.at(14, 9, 'e'); m.at(7, 23, 't'); m.at(38, 23, 't'); m.at(7, 7, 't'); m.at(22, 6, 'BB');
      m.col(39, 10, '%'); m.chest(41, 10, 'c', 'cuore');
      // la salamandra
      m.fill(9, -10, 13, -7, 'L'); m.fill(32, -10, 36, -7, 'L'); m.fill(9, 0, 13, 3, 'L'); m.fill(32, 0, 36, 3, 'L');
      m.at(22, -4, 'M'); m.at(5, -13, 't'); m.at(40, -13, 't'); m.at(5, 5, 't'); m.at(40, 5, 't');
    },
  },
  // ---------- le grotte nascoste: niente guardiano, solo tesori (e qualche mostro) ----------
  funghi: {
    name: 'GROTTA DEI FUNGHI', cave: true, foes: { e: 'slime', f: 'goblin', g: 'bat', h: 'plant' },
    floor: 49, wall: 50, crack: 55, fog: '#0a120a', amb: 0.34, water: '#2a5a4a', torch: [1, 0.74, 0.44], shot: 'seed', pot: ['#9a6a4a', '#5a3a24'], glow: '#8af07a',
    make(m) {
      m.room(10, 22, 21, 31); m.at(15, 31, '@@'); m.at(11, 23, 't'); m.at(20, 23, 't'); m.at(11, 30, 'v'); m.at(20, 30, 'v');
      m.sign(13, 28, 'GROTTA DEI FUNGHI.\nSUI MURI QUALCUNO HA DISEGNATO TRE FUNGHI E UNA CREPA. CHISSÀ COSA VUOL DIRE...');
      m.at(15, 22, '++');
      // la sala dei funghi giganti
      m.room(5, 10, 26, 22); m.at(8, 13, 'e'); m.at(22, 14, 'e'); m.at(15, 17, 'h'); m.at(10, 19, 'g'); m.at(20, 12, 'g');
      m.at(6, 11, 't'); m.at(25, 11, 't'); m.at(6, 21, 'v'); m.at(25, 21, 'v'); m.chest(24, 19, 'c', 'pozione:2');
      // la crepa a ovest: una stanza segreta
      m.col(5, 15, '%'); m.room(0, 12, 5, 19); m.chest(2, 15, 'c', 'anelloForza'); m.at(1, 13, 'v'); m.at(1, 18, 'v');
      // est: la tana dei goblin (trappola)
      m.col(26, 15, '33'); m.room(26, 9, 38, 22); m.at(29, 12, 'f'); m.at(35, 13, 'f'); m.at(32, 19, 'f'); m.at(29, 18, 'h'); m.at(36, 20, 'h');
      m.at(27, 10, 't'); m.at(37, 10, 't'); m.at(27, 21, 't'); m.at(37, 21, 't'); m.at(37, 16, 'v');
      m.trig(3, 'kill', 32, 15); m.chest(32, 15, 'Q', 'mantello'); m.col(38, 15, '>>'); m.at(36, 15, ';;'); m.at(36, 16, ';;');
    },
  },
  mare: {
    name: 'GROTTA DEL CONTRABBANDIERE', cave: true, foes: { e: 'slimeB', f: 'crab', g: 'bat' },
    floor: 54, wall: 53, crack: 55, fog: '#081218', amb: 0.38, water: '#2a7a9a', torch: [1, 0.82, 0.56], shot: 'bubble', pot: ['#8a6a4a', '#5a3a24'], glow: '#5ac8ff',
    make(m) {
      m.room(12, 24, 23, 32); m.at(17, 32, '@@'); m.at(13, 25, 't'); m.at(22, 25, 't'); m.at(13, 31, 'v'); m.fill(20, 28, 22, 30, '~');
      m.sign(15, 29, "GROTTA DEL CONTRABBANDIERE.\nQUI I PIRATI DELLA COSTA NASCONDEVANO IL BOTTINO. IL PIÙ PREZIOSO, DICONO, STA OLTRE L'ACQUA PROFONDA.");
      m.at(17, 24, '++');
      // il canale, con un ponte di assi
      m.room(6, 12, 29, 24); m.fill(7, 16, 28, 19, '~'); m.fill(17, 16, 18, 19, '=');
      m.at(9, 13, 'f'); m.at(26, 22, 'f'); m.at(12, 21, 'e'); m.at(24, 14, 'g'); m.at(7, 13, 't'); m.at(28, 13, 't'); m.at(7, 23, 't'); m.at(28, 23, 't');
      m.chest(26, 20, 'c', 'monete:60');
      // ovest, oltre l'acqua profonda (serve l'elmo delle maree)
      m.fill(6, 16, 6, 19, '~'); m.room(-6, 13, 6, 23); m.fill(-1, 16, 5, 19, '~'); m.chest(-4, 17, 'c', 'piuma'); m.at(-5, 14, 'v'); m.at(-5, 22, 'v'); m.at(-3, 21, 't');
      // nord: il deposito dei contrabbandieri (trappola)
      m.at(17, 12, '44'); m.room(8, 2, 27, 12); m.at(11, 5, 'f'); m.at(23, 5, 'f'); m.at(14, 9, 'e'); m.at(21, 9, 'e'); m.at(17, 4, 'g');
      m.at(9, 3, 't'); m.at(26, 3, 't'); m.at(9, 11, 'v'); m.at(10, 11, 'v'); m.at(26, 11, 'v');
      m.trig(4, 'kill', 17, 7); m.chest(17, 6, 'Q', 'monete:150'); m.at(17, 2, '>>'); m.at(17, 3, ';;');
    },
  },
  cristalli: {
    name: 'GROTTA DEI CRISTALLI', cave: true, foes: { e: 'bat', f: 'skel', g: 'slime' },
    floor: 49, wall: 52, crack: 55, fog: '#0c0a16', amb: 0.36, water: '#5a4aa8', torch: [0.8, 0.62, 1], shot: 'ice', pot: ['#6a5a8a', '#3a2a5a'], glow: '#c8a0ff',
    make(m) {
      m.room(12, 22, 23, 30); m.at(17, 30, '@@'); m.at(13, 23, 't'); m.at(22, 23, 't'); m.at(13, 29, 'v'); m.at(22, 29, 'v');
      m.sign(15, 27, 'GROTTA DEI CRISTALLI.\nI MINATORI SCAVAVANO QUI PRIMA DEI MOSTRI. UN MASSO SULLA PIASTRA APRIVA IL LORO DEPOSITO.');
      m.at(17, 22, '++');
      // la galleria
      m.room(8, 12, 27, 22); m.at(10, 14, 'e'); m.at(24, 15, 'e'); m.at(15, 18, 'f'); m.at(20, 14, 'f'); m.at(12, 20, 'g');
      m.at(9, 13, 't'); m.at(26, 13, 't'); m.at(9, 21, 't'); m.at(26, 21, 't'); m.chest(25, 19, 'c', 'monete:100');
      // nord: una crepa nella roccia
      m.at(17, 12, '%'); m.room(14, 4, 21, 12); m.chest(17, 7, 'c', 'elisir'); m.at(15, 5, 'v'); m.at(20, 5, 'v');
      // ovest: l'enigma del masso e il deposito dei minatori
      m.col(8, 16, '++'); m.room(-6, 12, 8, 22); m.at(2, 18, 'O'); m.at(-3, 14, 'p'); m.at(-5, 21, 't'); m.at(7, 13, 't');
      m.at(0, 12, '55'); m.trig(5, 'plates'); m.room(-6, 2, 8, 12); m.chest(0, 6, 'c', 'bastone'); m.at(0, 2, '>>'); m.at(0, 3, ';;'); m.at(0, 4, ';;'); m.at(-5, 3, 't'); m.at(7, 3, 't'); m.at(-5, 11, 'v'); m.at(7, 11, 'v');
    },
  },
  gelo: {
    name: 'GROTTA GELATA', cave: true, foes: { e: 'icewolf', f: 'iceskel', g: 'icebat' },
    floor: 24, wall: 51, crack: 55, fog: '#0a1018', amb: 0.44, water: '#4a8ac8', torch: [0.8, 0.9, 1], shot: 'ice', pot: ['#8ab8e0', '#4a6a90'], glow: '#bff0ff',
    make(m) {
      m.room(12, 22, 23, 30); m.at(17, 30, '@@'); m.at(13, 23, 't'); m.at(22, 23, 't'); m.at(13, 29, 'v'); m.at(22, 29, 'v');
      m.sign(15, 27, 'GROTTA GELATA.\nSUL GHIACCIO NON CI SI FERMA: PRIMA DI LANCIARTI, GUARDA DOVE ANDRAI A SBATTERE.');
      m.at(17, 22, '++');
      // il lago ghiacciato
      m.room(6, 8, 29, 22); m.fill(9, 11, 26, 19, 'I'); m.at(12, 14, 'e'); m.at(23, 16, 'e'); m.at(18, 10, 'g'); m.at(8, 20, 'g');
      m.at(7, 9, 't'); m.at(28, 9, 't'); m.at(7, 21, 't'); m.at(28, 21, 't'); m.chest(27, 19, 'c', 'pozione:3');
      // una crepa nel muro nord: la veste d'ombra
      m.at(17, 8, '%'); m.room(12, 0, 23, 8); m.chest(17, 3, 'c', 'monete:200'); m.at(13, 1, 't'); m.at(22, 1, 't'); m.at(13, 7, 'v'); m.at(22, 7, 'v');
      // est: la trappola degli scheletri di ghiaccio
      m.col(29, 14, '66'); m.room(29, 9, 40, 21); m.at(33, 12, 'f'); m.at(37, 16, 'f'); m.at(33, 19, 'f'); m.at(36, 11, 'g');
      m.at(30, 10, 't'); m.at(39, 10, 't'); m.at(30, 20, 't'); m.at(39, 20, 't');
      m.trig(6, 'kill', 35, 15); m.chest(35, 15, 'Q', 'cuore'); m.col(40, 14, '>>'); m.at(38, 14, ';;'); m.at(38, 15, ';;');
    },
  },
};
const CAVES = Object.keys(DEF).filter(k => DEF[k].cave);

// ---------- dalla mappa disegnata alle celle, alle stanze e agli oggetti ----------
const cache = {};
function parse(id) {
  if (cache[id]) return cache[id];
  const def = DEF[id], m = Maker(); def.make(m); const out = m.done(), rows = out.rows;
  const H = rows.length, Wd = Math.max(...rows.map(r => r.length));
  const ch = (i, j) => (j >= 0 && j < H && i >= 0 && i < rows[j].length) ? rows[j][i] : ' ';
  const cell = new Uint8Array(Wd * H), objs = [];
  const BASE = { ' ': ROCK, '#': WALL, '%': CRACK, '.': FLOOR, '_': PIT, '~': WATER, 'L': LAVA, 'I': ICE, '^': SPIKE, '=': BRIDGE, '@': EXIT, '>': STAIR, 'r': TOGB, 'u': TOGB, 'R': PLAT, 'U': PLAT, ':': FLOOR, ';': FLOOR };
  const FT = { ':': 59, ';': 60 }, tiles = {};
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    const c = ch(i, j), k = j * Wd + i;
    if (BASE[c] !== undefined) { cell[k] = BASE[c]; if (FT[c]) tiles[k] = FT[c]; }
    else if ('DBG+123456789'.includes(c)) cell[k] = DOOR;
    else {
      // oggetto appoggiato sul pavimento: ghiaccio se intorno c'è ghiaccio
      let ice = 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (ch(i + a, j + b) === 'I') ice++;
      cell[k] = ice >= 2 ? ICE : FLOOR;
      objs.push({ c, i, j });
    }
    if (c === 'r' || c === 'u' || c === 'R' || c === 'U') objs.push({ c, i, j });
  }
  const P = { id, def, w: Wd, h: H, rows, cell, tiles, loot: out.loot, signs: out.signs };
  const at = (i, j) => (i >= 0 && j >= 0 && i < Wd && j < H) ? cell[j * Wd + i] : ROCK;
  P.at = at;
  // stanze: zone di pavimento separate da muri e porte
  const room = new Int16Array(Wd * H).fill(-1), boxes = [];
  const inRoom = t => t !== ROCK && t !== WALL && t !== CRACK && t !== DOOR && t !== EXIT && t !== STAIR;
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
    P.doors.push({ c, cells, axis, cx, cz, kind: c === 'D' ? 'lock' : c === 'B' ? 'boss' : c === 'G' ? 'seal' : c === '+' ? 'open' : 'shut', g: /[1-9]/.test(c) ? +c : 0, key: cells[0].join(','), rooms: [...sides] });
  }
  // la via del ritorno ('@') e la scala verso il piano dopo ('>'): da che parte sta la stanza, e dove ci si ritrova arrivando
  const land = type => {
    const cells = []; for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) if (at(i, j) === type) cells.push([i, j]);
    if (!cells.length) return null;
    const open = t => t !== ROCK && t !== WALL && t !== CRACK && t !== EXIT && t !== STAIR;
    let d = [0, -1, 'n']; for (const q of [[0, -1, 'n'], [0, 1, 's'], [1, 0, 'e'], [-1, 0, 'w']]) if (cells.every(([i, j]) => open(at(i + q[0], j + q[1])))) { d = q; break; }
    const cx = cells.reduce((s, c) => s + c[0], 0) / cells.length + 0.5, cz = cells.reduce((s, c) => s + c[1], 0) / cells.length + 0.5;
    // si arriva a una cella e mezza dalla soglia; se lì dietro non c'è pavimento sicuro (acqua, vuoto...) ci si ferma sulla prima cella
    const far = cells.every(([i, j]) => at(i + d[0] * 2, j + d[1] * 2) === FLOOR) ? 1.6 : 1.25;
    return { x: (cx + d[0] * far) * CS, z: (cz + d[1] * far) * CS, yaw: Math.atan2(d[1], d[0]), side: d[2], cells, cx: cx * CS, cz: cz * CS };
  };
  P.spawn = land(EXIT); P.exits = P.spawn.cells; P.stairs = land(STAIR);
  const sideOf = {}; for (const L of [P.spawn, P.stairs]) if (L) for (const [i, j] of L.cells) sideOf[j * Wd + i] = L.side;
  P.sideOf = sideOf;
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
      const good = [...cand].filter(rr => P.objs.some(o => o.room === rr && (type === 'kill' ? 'efghj'.includes(o.c) : (o.c === 'p' || o.c === 'P'))));
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
const isFlat = t => t === FLOOR || t === ICE || t === SPIKE || t === BRIDGE || t === DOOR || t === EXIT || t === TOGB || t === STAIR;
// una scala dentro lo spessore del muro: un pianerottolo, poi quattro gradini che scendono (o salgono) nel buio.
// side: da che parte sta la stanza
const SDEEP = 4 * 1.9;
function stairsTo(fl, wl, i, j, side, up, tile, ftile) {
  const x0 = i * CS, z0 = j * CS, n = 4, flat = 3, run = (CS - flat) / n, rise = up ? 1.9 : -1.9;
  const Q = (u, v, y) => side === 's' ? [x0 + v, y, z0 + CS - u] : side === 'n' ? [x0 + CS - v, y, z0 + u] : side === 'e' ? [x0 + CS - u, y, z0 + CS - v] : [x0 + u, y, z0 + v];
  quadTo(fl, Q(0, 0, 0), Q(0, CS, 0), Q(flat, CS, 0), Q(flat, 0, 0), ftile, 1, flat / CS, LIT.floor);
  for (let k = 0; k < n; k++) {
    const u0 = flat + k * run, u1 = u0 + run, ya = k * rise, yb = (k + 1) * rise, L = Math.max(0.3, 0.86 - k * (up ? 0.07 : 0.15));
    quadTo(fl, Q(u0, 0, yb), Q(u0, CS, yb), Q(u1, CS, yb), Q(u1, 0, yb), tile, 1, 0.25, L);               // pedata
    if (up) quadTo(fl, Q(u0, 0, ya), Q(u0, CS, ya), Q(u0, CS, yb), Q(u0, 0, yb), tile, 1, 0.25, L * 0.8);  // alzata, vista dalla stanza
  }
  const yb = n * rise;
  quadTo(wl, Q(CS, 0, Math.min(yb, 0) - 0.01), Q(CS, CS, Math.min(yb, 0) - 0.01), Q(CS, CS, DH), Q(CS, 0, DH), 42, 1, 1, up ? 0.12 : 0.05);  // il buio in fondo
}
const bottomOf = t => t === PIT || t === PLAT ? -PD : t === WATER ? -WD : t === LAVA ? -LD : 0;
// cell: celle attuali (muri rotti, pozzi riempiti); filled: celle riempite da un masso
function buildStatic(P, cell, filled) {
  const D = P.def, Wd = P.w, H = P.h, at = (i, j) => (i >= 0 && j >= 0 && i < Wd && j < H) ? cell[j * Wd + i] : ROCK;
  const floor = [], wall = [], water = [], lava = [];
  const N4 = [[0, -1, 'n'], [0, 1, 's'], [1, 0, 'e'], [-1, 0, 'w']];
  // le scale: '>' porta avanti (giù, oppure su nelle torri), '@' nei piani dopo il primo riporta indietro
  const tower = D.dir === 'up', isStair = t => t === STAIR || (t === EXIT && !!D.up), goesUp = t => t === STAIR ? tower : !tower;
  const low = n => isStair(n) && !goesUp(n) ? -SDEEP - 0.5 : bottomOf(n);
  for (let j = 0; j < H; j++) for (let i = 0; i < Wd; i++) {
    const t = at(i, j), x0 = i * CS, z0 = j * CS, x1 = x0 + CS, z1 = z0 + CS, k = j * Wd + i;
    if (t === WALL || t === CRACK) {
      const tile = t === CRACK ? (D.crack || 41) : D.wall;
      for (const [a, b, s] of N4) { const n = at(i + a, j + b); if (!isSolid(n)) sideTo(wall, i, j, s, low(n), WH, tile); }
      let open = false; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (!isSolid(at(i + a, j + b))) open = true;
      if (open) flatTo(wall, x0, z0, x1, z1, WH, tile, 1, 1, LIT.top);
      continue;
    }
    if (isStair(t)) {
      const sd = P.sideOf[k] || 'n', fa = sd === 'n' || sd === 's' ? ['n', 's'] : ['e', 'w'];
      stairsTo(floor, wall, i, j, sd, goesUp(t), 57, D.floor);
      for (const f of fa) sideTo(wall, i, j, f, DH, WH, D.wall);
      { const up = goesUp(t), sg = up ? 120 : 63, a = DH + 0.5, b = DH + 3.1, e = 0.07, c0 = CS / 2 - 1.5, c1 = CS / 2 + 1.5;     // la freccia accesa sopra l'arco: su o giù
        const q = sd === 's' ? [[x0 + c0, z1 + e], [x0 + c1, z1 + e]] : sd === 'n' ? [[x0 + c1, z0 - e], [x0 + c0, z0 - e]] : sd === 'e' ? [[x1 + e, z0 + c1], [x1 + e, z0 + c0]] : [[x0 - e, z0 + c0], [x0 - e, z0 + c1]];
        quadTo(wall, [q[0][0], a, q[0][1]], [q[1][0], a, q[1][1]], [q[1][0], b, q[1][1]], [q[0][0], b, q[0][1]], sg, 1, 1, 1); }
      flatTo(wall, x0, z0, x1, z1, WH, D.wall, 1, 1, LIT.top);
      quadTo(wall, [x0, DH, z0], [x1, DH, z0], [x1, DH, z1], [x0, DH, z1], D.wall, 1, 1, 0.5);
      continue;
    }
    if (isFlat(t)) {
      const tile = t === ICE ? 28 : t === SPIKE ? 29 : t === BRIDGE ? 30 : filled && filled.has(k) ? 47 : P.tiles[k] ? P.tiles[k] : P.room[k] === P.bossRoom && P.bossRoom >= 0 ? 44 : D.floor;
      flatTo(floor, x0, z0, x1, z1, 0, tile, 1, 1, tile === 60 ? 1 : LIT.floor);
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
  // grotte: roccia viva a sassi tondi, pavimenti di terra e sabbia, l'imbocco visto da fuori
  const rocky = (cols, mortar, gem) => {
    g.fillStyle = mortar; g.fillRect(0, 0, T, T);
    for (let k = 0; k < 26; k++) {
      const cx = rnd(T), cy = rnd(T), rx = 3 + rnd(5), ry = 2 + rnd(4), c0 = cols[rnd(cols.length)];
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) { if ((x / rx) ** 2 + (y / ry) ** 2 > 1) continue; g.fillStyle = y < -ry * 0.4 ? sh(c0, 1.18) : y > ry * 0.5 ? sh(c0, 0.8) : c0; g.fillRect((cx + x + T) % T, (cy + y + T) % T, 1, 1); }
    }
    if (gem) for (let k = 0; k < 3; k++) { const x = rnd(T - 6) + 3, y = rnd(T - 8) + 4; g.fillStyle = gem[0]; g.fillRect(x, y, 2, 5); g.fillRect(x + 2, y + 2, 2, 3); g.fillStyle = gem[1]; g.fillRect(x, y, 1, 3); }
  };
  at(48, () => {
    g.clearRect(0, 0, T, T);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const dx = (x + 0.5 - 16) / 14, dy = (y + 0.5 - 17) / 15, top = y < 17;
      if (top ? dx * dx + dy * dy > 1 : Math.abs(dx) > 1) continue;
      const inner = top ? dx * dx + dy * dy < 0.5 : Math.abs(dx) < 0.7;
      g.fillStyle = inner ? (y > 27 ? '#16121a' : '#09070c') : ((x * 7 + y * 3) % 5 < 2 ? '#6a6670' : (x + y) % 4 ? '#58545e' : '#7e7a86');
      g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = '#3a7a2a'; for (const [x, y, h] of [[6, 7, 5], [9, 4, 7], [22, 4, 6], [25, 8, 4], [15, 2, 3]]) g.fillRect(x, y, 1, h);
  });
  at(49, () => { fill('#5a4a3c', 120, 0.35); speck(['#7a6a58', '#3e3228', '#8a7a68'], 40, 2, 1); });
  at(50, () => rocky(['#6a6460', '#7a726a', '#5a5450'], '#2e2a28'));
  at(51, () => rocky(['#8ab0d0', '#a8c8e4', '#7aa0c0'], '#3a5068'));
  at(52, () => rocky(['#4a4258', '#5a5068', '#3e3850'], '#1e1a26', ['#c8a0ff', '#f0e0ff']));
  at(53, () => { rocky(['#3a5a5e', '#4a6a6e', '#2e4a4e'], '#16262a'); speck(['#e8e0d0', '#c8c0b0'], 10, 2, 1); });
  at(54, () => { fill('#c8b080', 140, 0.25); speck(['#e8d8b0', '#a08860', '#f4e8c8'], 40); });
  at(56, () => { rocky(['#8a8690', '#9a96a2', '#7a7682', '#a8a4ae'], '#4a4652'); speck(['#5a8a3a', '#6a9a44'], 14, 2, 1); });
  at(55, () => { rocky(['#6a6460', '#7a726a', '#5a5450'], '#2e2a28'); g.fillStyle = '#141210'; let x = 15, y = 0; while (y < T) { g.fillRect(x, y, 2, 2); y += 2; x += rnd(3) - 1; } g.fillRect(8, 12, 8, 2); g.fillRect(18, 20, 7, 2); });
  at(47, () => { g.fillStyle = '#5a5a66'; g.fillRect(0, 0, T, T); g.fillStyle = '#7a7a86'; g.fillRect(1, 1, T - 2, T - 2); g.fillStyle = '#5a5a66'; g.fillRect(15, 1, 2, T - 2); g.fillRect(1, 15, T - 2, 2); });
  // le profondità: gradini, sigillo del guardiano, tappeto, lastra con la runa, muro e pavimento delle cripte
  at(57, () => { for (let y = 0; y < T; y += 8) { g.fillStyle = sh('#8a8690', 0.9 + R() * 0.2); g.fillRect(0, y, T, 8); g.fillStyle = '#b4b0bc'; g.fillRect(0, y, T, 2); g.fillStyle = '#4a4652'; g.fillRect(0, y + 7, T, 1); } speck(['#6a6670', '#9a96a2'], 30, 2, 1); });
  at(58, () => { g.fillStyle = '#1e1a2a'; g.fillRect(0, 0, T, T); g.fillStyle = '#3a3450'; g.fillRect(2, 2, T - 4, T - 4); g.fillStyle = '#5a5278'; g.fillRect(2, 2, T - 4, 2); g.fillRect(2, 2, 2, T - 4);
    for (let a = 0; a < TAU; a += 0.09) { g.fillStyle = '#7af0ff'; g.fillRect(Math.round(15.5 + Math.cos(a) * 9), Math.round(15.5 + Math.sin(a) * 9), 1, 1); g.fillStyle = '#3ab8e0'; g.fillRect(Math.round(15.5 + Math.cos(a) * 11), Math.round(15.5 + Math.sin(a) * 11), 1, 1); }
    g.fillStyle = '#eaffff'; g.fillRect(15, 9, 2, 14); g.fillRect(11, 12, 10, 2); g.fillRect(12, 19, 8, 2); g.fillStyle = '#7af0ff'; g.fillRect(9, 15, 3, 2); g.fillRect(20, 15, 3, 2); });
  at(59, () => { fill('#8a1e2a', 90, 0.22); g.fillStyle = '#e8b42a'; for (const [x, y] of [[8, 8], [24, 8], [8, 24], [24, 24], [16, 16], [0, 0], [0, 16], [16, 0]]) { g.fillRect((x + 31) % 32, y, 3, 1); g.fillRect(x, (y + 31) % 32, 1, 3); } g.fillStyle = '#5a1018'; for (let x = 0; x < T; x += 8) g.fillRect(x + 4, 0, 1, T); });
  at(60, () => { g.fillStyle = '#12162a'; g.fillRect(0, 0, T, T); g.fillStyle = '#1e2440'; g.fillRect(1, 1, T - 2, T - 2); g.fillStyle = '#2a3258'; g.fillRect(1, 1, T - 2, 1); g.fillRect(1, 1, 1, T - 2);
    for (let a = 0; a < TAU; a += 0.1) { g.fillStyle = '#5ae0ff'; g.fillRect(Math.round(15.5 + Math.cos(a) * 11), Math.round(15.5 + Math.sin(a) * 11), 1, 1); }
    g.fillStyle = '#bff4ff'; for (let i = 0; i < 9; i++) { g.fillRect(11 + i, 11 + i, 2, 1); g.fillRect(20 - i, 11 + i, 2, 1); } g.fillRect(15, 6, 2, 5); g.fillRect(15, 21, 2, 5); g.fillRect(6, 15, 5, 2); g.fillRect(21, 15, 5, 2); });
  at(61, () => { bricks('#4a4456', '#16121e', 11, 7); g.fillStyle = '#c89a2a'; g.fillRect(0, 14, T, 2); g.fillStyle = '#7a5a14'; g.fillRect(0, 16, T, 1); g.fillStyle = '#ffd86a'; for (let x = 3; x < T; x += 8) g.fillRect(x, 14, 2, 1);
    g.fillStyle = '#0e0a14'; g.fillRect(12, 20, 8, 8); g.fillStyle = '#d8d0c0'; g.fillRect(13, 21, 6, 5); g.fillRect(14, 26, 4, 1); g.fillStyle = '#0e0a14'; g.fillRect(14, 23, 1, 2); g.fillRect(17, 23, 1, 2); });
  at(62, () => { flags('#3e3a4a', '#14101c'); g.fillStyle = '#b8902a'; for (const [x, y] of [[0, 0], [T - 2, 0], [0, T - 2], [T - 2, T - 2], [15, 15]]) g.fillRect(x, y, 2, 2); g.fillStyle = '#6a5418'; g.fillRect(16, 0, 1, 10); g.fillRect(10, 16, 1, 16); });
  const arrow = up => { g.fillStyle = '#10141f'; g.fillRect(0, 0, T, T); g.fillStyle = '#2a3258'; g.fillRect(1, 1, T - 2, T - 2); g.fillStyle = '#12162a'; g.fillRect(3, 3, T - 6, T - 6);
    for (let k = 0; k < 11; k++) { const y = up ? 6 + k : 25 - k, w = k; g.fillStyle = '#bff4ff'; g.fillRect(15 - w, y, 2 * w + 2, 1); }
    g.fillStyle = '#bff4ff'; g.fillRect(12, up ? 17 : 6, 8, 9); g.fillStyle = '#5ae0ff'; g.fillRect(12, up ? 25 : 6, 8, 1); };
  at(63, () => arrow(false)); at(120, () => arrow(true));
  return c;
}

// ---------- disegni: oggetti, nuovi mostri e guardiani (forme tonde) ----------
const sh = A.shade, Y = (s, a, b) => s > 0 ? [a, b] : [-b, -a];
const Cy = (a, b, r, c, k, rot) => ({ t: 'y', a, b, r, c, k, rot }), Ca = (a, b, r, c, k, rot) => ({ t: 'c', a, b, r, c, k, rot });
const El = (o, r, c, k, z, rot) => ({ t: 'e', o, r, c, k, z, rot }), Kc = (a, b, r, r2, c, k, rot) => ({ t: 'k', a, b, r, r2, c, k, rot });
// oggetti del santuario: modellini alla stessa grana dei personaggi (0,2 unità per pixel)
const brazier = () => A.fit([Cy([0, 0, 0], [0, 0, 0.5], 1.7, '#3a3038'), Cy([0, 0, 0.5], [0, 0, 4.4], 0.5, '#4a3e34'), Cy([0, 0, 2.2], [0, 0, 2.6], 0.75, '#5a4a3a'),
  Cy([0, 0, 4.2], [0, 0, 4.7], 1.5, '#4a3e34'), Cy([0, 0, 4.7], [0, 0, 5.2], 2.1, '#6a5a48'), Cy([0, 0, 5.1], [0, 0, 5.35], 2.3, '#3a3038'), Cy([0, 0, 5.34], [0, 0, 5.4], 1.9, '#ff7a2a', 1.35)], Math.PI - 0.4);
const pot = (c1, c2) => A.fit([Cy([0, 0, 0], [0, 0, 0.5], 1.2, sh(c1, 0.8)), El([0, 0, 2.1], [2.0, 2.0, 1.95], c1), El([0, 0, 2.5], [2.06, 2.06, 0.36], c2),
  Cy([0, 0, 3.4], [0, 0, 4.4], 1.0, c1), Cy([0, 0, 4.3], [0, 0, 4.75], 1.35, sh(c1, 1.1)), Cy([0, 0, 4.74], [0, 0, 4.8], 0.95, '#1a1418')], Math.PI - 0.4);
// cristallo interruttore: un cubo in piedi su una punta, sopra un piedistallo
const GEMR = [['x', 0.7854, 0, 0, 0], ['y', 0.6155, 0, 0, 0]];
const xtal = (c1, c2) => A.fit([Cy([0, 0, 0], [0, 0, 0.6], 2.6, '#3a3440'), Cy([0, 0, 0.6], [0, 0, 1.6], 1.8, '#6a6070'), Cy([0, 0, 1.55], [0, 0, 1.75], 2.0, '#4a4452'),
  { t: 'b', b: [-1.5, 1.5, -1.5, 1.5, -1.5, 1.5], c: c1, k: 1.05, rot: [...GEMR, ['t', 0, 0, 4.2]] }, El([0.9, -0.5, 5.1], [0.3, 0.3, 0.45], c2, 1.3, 1)], Math.PI - 0.3);
const gem = c => A.fit([{ t: 'b', b: [-2.1, 2.1, -2.1, 2.1, -2.1, 2.1], c, k: 1.08, rot: [...GEMR, ['t', 0, 0, 3.8]] }, El([1.3, -0.7, 5.0], [0.4, 0.4, 0.6], '#ffffff', 1.2, 1)], Math.PI - 0.3);
const lapide = () => A.fit([{ t: 'b', b: [-0.6, 0.6, -2.6, 2.6, 0, 3.6], c: '#8a8a94' }, Cy([-0.6, 0, 3.6], [0.6, 0, 3.6], 2.6, '#8a8a94'), { t: 'b', b: [-0.9, 0.9, -3.0, 3.0, 0, 0.45], c: '#6a6a74' },
  ...[4.6, 3.5, 2.4].map(z => ({ t: 'b', b: [0.6, 0.68, -1.6, 1.6, z, z + 0.32], c: '#4a4a54' }))], Math.PI - 0.3);
// arredi delle profondità: mucchi d'oro, cristalli che fanno luce, ossa
const goldPile = () => A.fit([El([0, 0, 0.7], [3.5, 3.5, 1.0], '#b8801a'), El([0.5, 0.3, 1.4], [2.6, 2.6, 0.95], '#e0a424'), El([-0.3, -0.3, 2.1], [1.7, 1.7, 0.8], '#ffc83a'), El([0.2, 0.1, 2.7], [0.9, 0.9, 0.5], '#ffe98a', 1.2),
  Cy([2.9, -1.3, 0.1], [2.9, -1.3, 0.4], 0.75, '#ffd23f'), Cy([-2.7, 1.9, 0.1], [-2.7, 1.9, 0.4], 0.75, '#ffd23f'), Cy([-2.2, -2.4, 0.1], [-2.2, -2.4, 0.4], 0.6, '#ffe07a'),
  El([1.5, 1.7, 1.25], [0.55, 0.55, 0.55], '#e8304a', 1.25), El([-1.6, -0.9, 1.7], [0.5, 0.5, 0.5], '#3ad0ff', 1.25), El([0.2, -1.9, 1.2], [0.45, 0.45, 0.45], '#5af07a', 1.25)], Math.PI - 0.4);
const cluster = (c1, c2) => A.fit([Cy([0, 0, 0], [0, 0, 0.5], 2.5, '#3a3440'), Kc([0, 0, 0.3], [0.3, 0, 6.6], 1.35, 0.1, c1, 1.2), Kc([-1.2, 0.6, 0.3], [-2.5, 1.1, 4.4], 0.95, 0.1, c1, 1.1),
  Kc([1.2, -0.6, 0.3], [2.7, -1.3, 3.8], 0.85, 0.1, c2, 1.3), Kc([0.4, 1.3, 0.3], [1.0, 2.7, 3.0], 0.7, 0.1, c2, 1.2), Kc([-0.5, -1.3, 0.3], [-1.1, -2.6, 2.6], 0.65, 0.1, c1, 1.15)], Math.PI - 0.3);
const bonesPile = () => A.fit([El([0, 0, 0.9], [1.3, 1.2, 1.1], '#e8e2d0'), { t: 'b', b: [0.9, 1.3, -0.7, -0.2, 0.9, 1.4], c: '#1a1418' }, { t: 'b', b: [0.9, 1.3, 0.2, 0.7, 0.9, 1.4], c: '#1a1418' },
  Cy([-2.6, 1.6, 0.25], [1.2, 2.6, 0.25], 0.3, '#d8d2c0'), Cy([-2.2, -2.2, 0.25], [1.6, -1.4, 0.25], 0.3, '#cfc8b4'), El([-2.6, 1.6, 0.3], [0.5, 0.5, 0.4], '#e8e2d0'), El([1.6, -1.4, 0.3], [0.5, 0.5, 0.4], '#e8e2d0')], Math.PI - 0.5);
// le statue sono guerrieri di pietra; i campioni dei piani più bassi, guerrieri in carne e ossa (più grandi del normale)
const STONE = { skin: '#8a8a94', hand: '#8a8a94', helm: { c: '#6a6a74', spike: true }, shirt: '#7a7a84', plate: '#9a9aa4', pauldron: '#6a6a74', pants: '#6a6a74', boots: '#5a5a64', belt: '#5a5a64', eyes: '#5a5a64', weapon: { kind: 'spear', col: '#9a9aa4' }, shield: '#7a7a84', emblem: '#9a9aa4' };
const CHAMP = {
  troll: { skin: '#5a8a3a', hand: '#5a8a3a', ears: true, shirt: '#5a4028', pants: '#4a3420', boots: '#2a2018', belt: '#8a6a3a', eyes: '#ffe14a', wide: 0.9, weapon: { kind: 'club' } },
  tritone: { skin: '#4aa8c8', hand: '#4aa8c8', helm: { c: '#2a6a8a', wings: '#9ae8ff' }, shirt: '#2a6a8a', plate: '#5ac8e0', pants: '#1e4a6a', boots: '#1e3a4a', eyes: '#ffffff', weapon: { kind: 'spear' } },
  faraone: { skin: '#e8d090', hand: '#e8d090', crown: '#ffc83a', shirt: '#f0e8d0', plate: '#ffc83a', pauldron: '#3a7ae8', pants: '#f0e8d0', boots: '#c89a2a', belt: '#3a7ae8', eyes: '#ff3a2a', weapon: { kind: 'staff', col: '#ffe14a' } },
  jarl: { skin: '#cfe8ff', hand: '#cfe8ff', skull: true, crown: '#bfe6ff', shirt: '#5a8ac0', plate: '#8ab8e0', pauldron: '#e8f4ff', pants: '#4a6a90', boots: '#3a5a7a', cape: '#e8f4ff', weapon: { col: '#e8f8ff', guard: '#5a8ac0', glow: '#ffffff', len: 3 } },
  demone: { skin: '#b82a1a', hand: '#b82a1a', horns: '#1a0e0e', shirt: '#3a1414', plate: '#5a1e1a', pauldron: '#ff7a2a', pants: '#2a1010', boots: '#1a0a0a', cape: '#5a1414', eyes: '#ffe14a', wide: 0.6, weapon: { kind: 'axe', col: '#ff9a3a' } },
  lich: { skin: '#3a2a4a', hand: '#3a2a4a', helm: { c: '#2a1e3a', spike: true }, shirt: '#2a1e3a', plate: '#4a3a6a', pauldron: '#8a5ae0', pants: '#1e1628', boots: '#14101e', cape: '#5a2a7a', eyes: '#ff4ae0', weapon: { col: '#c8a0ff', guard: '#5a2a7a', glow: '#ffffff', len: 3 } },
  idolo: { skin: '#4ac88a', hand: '#4ac88a', helm: { c: '#2a8a5a', crown: true, gem: '#ffd23f' }, shirt: '#2a8a5a', plate: '#5ae0a0', pauldron: '#ffd23f', pants: '#1e6a44', boots: '#1e4a34', eyes: '#ffd23f', wide: 0.5, weapon: { kind: 'hammer', col: '#ffd23f' } },
  capo: { skin: '#6aa83e', hand: '#6aa83e', ears: true, helm: { c: '#8a6a3a', spike: true }, shirt: '#8a2a2a', pauldron: '#8a6a3a', pants: '#4a3a2a', boots: '#2a2a2a', belt: '#ffc83a', eyes: '#ffe14a', wide: 0.5, weapon: { kind: 'axe', col: '#9aa4b2' } },
  pirata: { skin: '#d8a07a', hand: '#d8a07a', hat: '#1e1a22', beard: '#2a1a1a', shirt: '#8a1e2a', sleeve: '#f0e8d8', pants: '#2a2a3a', boots: '#1a1a1e', belt: '#ffc83a', cape: '#1e1a22', weapon: { col: '#e8eef6', guard: '#ffc83a', len: 1 } },
  minatore: { skin: '#8a7aa8', hand: '#8a7aa8', skull: true, helm: { c: '#c8a0ff' }, shirt: '#3a2a5a', plate: '#6a5a8a', pants: '#2a1e44', boots: '#1e1630', eyes: '#f0e0ff', wide: 0.4, weapon: { kind: 'hammer', col: '#c8a0ff' } },
  yeti: { skin: '#f4f8ff', hand: '#f4f8ff', shirt: '#e8eef8', sleeve: '#f4f8ff', pants: '#dce6f2', boots: '#c8d4e4', belt: '#dce6f2', eyes: '#4ae0ff', wide: 1.1, weapon: { kind: 'club' } },
};
const CPOSE = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0 }, { armR: 1.4, leg: -0.3 }];
// la famiglia di un santuario: il piano d'ingresso e tutti quelli sotto (o sopra) di lui
const rootOf = id => DEF[id].base || id;
const family = id => { const r = rootOf(id); return Object.keys(DEF).filter(k => rootOf(k) === r); };
function portal(f, W = 40, H = 115) {
  const c = A.mk(W, H), g = c.getContext('2d');
  for (let y = 0; y < H; y++) { const w = Math.round(W * 0.175) + Math.round(W * 0.25 * (1 - y / H)) + (f && y % 15 < 7 ? 2 : 0); g.fillStyle = y % 10 < 5 ? '#fff8d0' : '#bfe8ff'; g.fillRect(W / 2 - w, y, w * 2, 1); g.fillStyle = '#ffffff'; g.fillRect(W / 2 - 3, y, 6, 1); }
  for (let k = 0; k < 16; k++) { g.fillStyle = '#ffffff'; g.fillRect((k * 13 + f * 7) % (W - 4) + 2, (k * 29 + f * 17) % (H - 6), 2, 4); }
  return c;
}
function turret(c, eye) {
  return [{ t: 'b', b: [-5, 5, -5, 5, 0, 9], c: sh(c, 0.75) }, { t: 'b', b: [-4.5, 4.5, -4.5, 4.5, 9, 17.5], c },
    { t: 'b', b: [4.4, 4.8, 1.2, 3, 14.5, 16.2], c: eye, k: 1.3 }, { t: 'b', b: [4.4, 4.8, -3, -1.2, 14.5, 16.2], c: eye, k: 1.3 },
    { t: 'b', b: [4.4, 4.9, -2.2, 2.2, 10.5, 13], c: '#140c0c' }, { t: 'b', b: [-2, 2, 3.4, 5.4, 17, 20.5], c }, { t: 'b', b: [-2, 2, -5.4, -3.4, 17, 20.5], c }];
}
// pianta carnivora: stelo curvo, foglie, due mascelle tonde che si aprono
function plant(f) {
  const P = [], o = f ? 0.55 : 0.1, J = [['y', -o, -3, 0, 12.8]];
  P.push(Kc([0, 0, 0], [0.7, 0, 5.5], 1.1, 0.9, '#3a7a2a'), Kc([0.7, 0, 5.5], [0, 0, 10.5], 0.9, 0.8, '#3a7a2a'));
  for (const a of [0, 1.6, 3.2, 4.8]) P.push(El([0, 3.4, 0.8], [1.3, 3.0, 0.45], '#4a9a3a', 1, 0, [['x', 0.25, 0, 0, 0], ['z', a, 0, 0, 0]]));
  P.push(El([0.6, 0, 11.2], [3.8, 3.5, 1.8], '#b8302a'), El([0.8, 0, 12.7], [2.9, 2.8, 0.8], '#5a0a14', 1, 0, J), El([0.6, 0, 14.3], [3.8, 3.5, 1.9], '#e04a3a', 1, 0, J));
  P.push(El([3.6, 0, 12.8], [0.6, 2.6, 0.5], '#ffffff', 1, 0, [['y', -o * 0.5, -3, 0, 12.8]]));
  for (const [x, y] of [[0, 1.5], [1.6, -1.6], [-1.4, -0.8]]) P.push(El([x, y, 16.0], [0.65, 0.65, 0.4], '#fff4d0', 1, 0, J));
  return P;
}
function crab(f) {
  const P = [], c = '#e0603a', c2 = '#ffb070', a = f ? 0.45 : -0.15;
  P.push(El([0, 0, 5.1], [4.8, 6.4, 2.5], c), El([0.4, 0, 3.8], [4.3, 5.8, 1.4], c2));
  for (const s of [1, -1]) P.push(Ca([2.4, s * 1.5, 6.5], [2.7, s * 1.7, 9.1], 0.45, c), El([2.8, s * 1.75, 9.8], [0.75, 0.75, 0.8], '#1a1420'), El([3.35, s * 1.95, 10.1], [0.25, 0.25, 0.25], '#ffffff', 1.2, 1));
  for (const s of [1, -1]) {
    const arm = [['z', s * 0.3, 3, s * 6, 5]], claw = [['z', s * (0.3 + a), 8, s * 6.5, 5]];
    P.push(Ca([3, s * 5.6, 5.2], [8.2, s * 6.2, 5.4], 1.0, c, 1, arm), El([9.8, s * 6.6, 5.4], [2.6, 1.9, 1.9], c2, 1, 0, claw), Kc([11, s * 7.6, 6.0], [12.8, s * 8.2, 6.4], 0.85, 0.35, c2, 1, claw));
  }
  for (const s of [1, -1]) for (const x of [-3, 0, 3]) { const rot = [['x', s * (f ? 0.35 : -0.25) * (x === 0 ? -1 : 1), x, s * 6, 4]]; P.push(Ca([x, s * 5.6, 4.4], [x, s * 8.6, 4.8], 0.55, c, 1, rot), Ca([x, s * 8.6, 4.8], [x, s * 9.8, 0.4], 0.5, c, 1, rot)); }
  return P;
}
// guardiani (X avanti, Y sinistra, Z su)
function golem(p) {
  const P = [], stone = '#7e7e72', dark = '#5a5a50', moss = '#4a8a3a', moss2 = '#6aaa4a';
  const st = p === 3, tz = st ? 6 : 11, arm = p === 1 ? -2.6 : p === 2 ? 1.25 : st ? 1.05 : 0.12;
  for (const s of [1, -1]) P.push(Kc([0, s * 5, 1.8], [0, s * 5, tz + 1], 3.2, 3.6, dark), El([1.2, s * 5, 1.3], [4.0, 3.2, 1.6], stone));
  P.push(El([0, 0, tz + 9.5], [7.4, 10.6, 9.6], stone), El([-0.6, 0, tz + 15], [7.5, 10.9, 5.0], moss), El([-0.8, 0, tz + 18.8], [5.2, 8.2, 2.0], moss2));
  P.push(El([6.6, 0, tz + 9], [1.2, 2.7, 3.2], st ? '#b8ffb8' : '#2e5a2e', st ? 1.45 : 1));
  P.push(El([1, 0, tz + 21.8], [4.4, 4.8, 3.9], stone), El([0.6, 0, tz + 24.2], [4.4, 5.0, 2.0], moss));
  for (const s of [1, -1]) P.push(El([4.6, s * 2.3, tz + 21.6], [0.7, 1.05, 0.9], st ? '#2a2a2a' : '#7aff8a', st ? 1 : 1.3, 1));
  for (const s of [1, -1]) {
    const rot = [['y', arm, 0, s * 12.5, tz + 16]];
    P.push(Kc([0, s * 12.5, tz + 16], [0, s * 12.5, tz + 3], 3.3, 2.9, dark, 1, rot), El([0, s * 12.6, tz - 1], [4.3, 3.4, 4.2], stone, 1, 0, rot), El([0, s * 12.6, tz + 15.6], [3.8, 3.3, 2.8], moss, 1, 0, rot));
  }
  return P;
}
function serpent(p) {
  const P = [], c = '#2a8a9a', c2 = '#1e6a7a', belly = '#bfe8c8', fin = '#e8f48a', O = (o, r, col, z) => P.push({ t: 'o', o, r, c: col, z });
  const low = p === 3, H = low ? 9 : 18, lean = p === 1 ? 9 : 5, side = p === 2 ? 8 : 0, drop = p === 2 ? 5 : 0;
  let hx = 0, hy = 0, hz = 0;
  for (let i = 0; i < 9; i++) {
    const t = i / 8, x = -4 + lean * t * t + Math.sin(t * 3) * 2, y = side * t * t, z = t * H - drop * t * t, r = 5.6 - t * 1.6;
    O([x, y, z], r, i % 2 ? c : c2); O([x + r * 0.55, y, z], r * 0.62, belly, 1);
    if (i % 2 === 0 && i < 8) P.push(El([x - r - 0.5, y, z + 1.3], [1.1, 0.42, 2.4], fin));
    hx = x; hy = y; hz = z;
  }
  const mo = p === 1 ? 0.65 : 0.05, tilt = p === 2 ? 0.6 : 0, R = extra => [...(extra || []), ['x', tilt, hx, hy, hz]];
  P.push(El([hx + 2, hy, hz + 3.6], [6.4, 4.7, 3.1], c, 1, 0, R()), El([hx + 8.4, hy, hz + 3.3], [3.4, 3.4, 2.2], c, 1, 0, R()));
  P.push(El([hx + 3.8, hy, hz - 0.1], [6.8, 3.7, 1.4], belly, 1, 0, R([['y', mo, hx - 3, hy, hz + 0.5]])));
  if (p === 1) P.push(Kc([hx + 3, hy, hz + 1.1], [hx + 10, hy, hz + 1.1], 0.7, 0.35, '#e83a4a', 1, R()));
  for (const s2 of [1, -1]) {
    P.push(El([hx + 5.2, hy + s2 * 3.7, hz + 5.2], [1.25, 1.0, 1.1], p === 2 ? '#1a1420' : '#ffe14a', 1.35, 1, R()));
    P.push(El([hx - 1, hy + s2 * 6.3, hz + 5.4], [0.5, 2.3, 2.5], fin, 1, 0, R([['x', s2 * -0.5, hx, hy + s2 * 4.5, hz + 4]])));
  }
  P.push(El([hx - 3, hy, hz + 8], [2.3, 0.55, 3.3], fin, 1, 0, R()));
  return P;
}
function scarab(p) {
  const P = [], g1 = '#d8a82a', g2 = '#ffe07a', d = '#6a4a0e', O = (o, r, c, rz) => P.push({ t: 'o', o, r, c, rz });
  if (p === 3) {
    O([0, 0, 6], 12, d, 6); O([0, 0, 8.5], 9, '#4a3410', 4); O([11, 0, 5], 4.5, d);
    for (const s of [1, -1]) for (const x of [-6, 0, 6]) P.push(Kc([x, s * 4, 10], [x, s * 4, 18.5], 0.9, 0.6, d, 1, [['x', s * 0.5, x, s * 4, 10]]));
    return P;
  }
  const L = p === 1 ? 0.5 : p === 0 ? -0.5 : 0, dip = p === 2 ? -2.5 : 0;
  O([-2, 0, 10 + dip * 0.2], 12.5, g1, 8.5); P.push(El([-2, 0, 10 + dip * 0.2], [12.6, 0.55, 8.62], d));
  P.push(El([-1, 4, 16.8], [3, 2.4, 1.8], g2), El([-1, -4, 16.8], [3, 2.4, 1.8], g2));
  O([11, 0, 8 + dip], 5.5, d, 4.5);
  P.push(Kc([13, 0, 8.5 + dip], [22, 0, 9.2 + dip], 1.7, 0.5, g2, 1, [['y', p === 2 ? 0.15 : -0.55, 13, 0, 8 + dip]]));
  for (const s of [1, -1]) P.push(El([14.4, s * 2.6, 9.8 + dip], [0.8, 0.9, 0.9], '#ff3a2a', 1.3, 1));
  for (const s of [1, -1]) for (const [x, a] of [[-6, L], [0, -L], [6, L]]) {
    const rot = [['y', a * s, x, s * 8, 6.5]];
    P.push(Kc([x, s * 8, 6.5], [x, s * 12.5, 5], 1.1, 0.9, d, 1, rot), Kc([x, s * 12.5, 5], [x, s * 14.5, 0.5], 0.9, 0.6, d, 1, rot));
  }
  return P;
}
function queen(p) {
  const P = A.human({ skin: '#d8ecff', hairStyle: 'long', hair: '#ffffff', robe: '#4a7ac8', shirt: '#8ab8f0', sleeve: '#c8e4ff', pants: '#4a7ac8', boots: '#4a7ac8', cape: '#e8f4ff', staff: '#bfe6ff', orb: '#ffffff', eyes: '#4ae0ff', helm: { c: '#cfeaff', crown: true, gem: '#4ae0ff' } },
    p === 1 ? { armR: 2.7, armL: 2.3 } : p === 2 ? { armR: 0.9, armL: 0.9, bob: -1 } : { armR: 0.35, armL: -0.2 });
  // in ginocchio: tutta la figura scende e si piega all'indietro
  if (p === 2) for (const q of P) q.rot = (q.rot || []).concat([['t', 0, 0, -5], ['y', -0.45, 0, 0, 4]]);
  return P;
}
function salamander(p) {
  const P = [], cool = p === 3, c = cool ? '#4e4a4a' : '#d8401a', c2 = cool ? '#6e6a6a' : '#ffb040', d = cool ? '#2a2828' : '#8a1e10', fr = cool ? '#5a5656' : '#ff8a2a';
  const L = p === 0 ? 0.45 : p === 1 ? -0.45 : 0, hr = p === 2 ? -0.4 : 0, H = [['y', hr, 8, 0, 8]];
  P.push(El([-0.5, 0, 8], [11.2, 6.6, 4.3], c), El([-0.5, 0, 6.4], [10.2, 5.7, 2.6], c2));
  // collare di fuoco dietro la testa: si vede bene di fronte
  P.push(El([7.8, 0, 10.8], [0.8, 9.8, 6.4], fr, cool ? 1 : 1.2, 0, H), El([8.3, 0, 11.4], [0.6, 7.2, 4.6], cool ? fr : '#ffe14a', cool ? 1 : 1.3, 0, H));
  P.push(El([13.6, 0, 9.3], [6.4, 5.0, 3.4], c, 1, 0, H));
  P.push(El([18.4, 0, 6.0], [3.8, 3.6, 1.5], p === 2 ? '#ffe14a' : d, p === 2 ? 1.4 : 1, 0, [['y', hr + (p === 2 ? 0.45 : 0), 16, 0, 7]]));
  if (p === 2) P.push(El([19.8, 0, 7.5], [2.2, 2.6, 0.8], '#fff4b0', 1.4, 0, H));
  for (const s2 of [1, -1]) P.push(El([17.3, s2 * 3.5, 11.2], [1.15, 1.05, 1.1], cool ? '#2a2a2a' : '#ffe14a', 1.35, 1, H), El([19.6, s2 * 1.4, 10.0], [0.5, 0.45, 0.4], '#1a0a08', 1, 1, H));
  P.push(Kc([-9, 0, 7.8], [-21.5, -2.6, 7.1], 3.8, 2.4, c), Kc([-21.5, -2.6, 7.1], [-32, -7.5, 6.6], 2.4, 0.8, d));
  for (const [fx2, fy, a] of [[6, 1, L], [6, -1, -L], [-7, 1, -L], [-7, -1, L]]) { const rot = [['y', a, fx2, fy * 6, 6.5]]; P.push(Kc([fx2, fy * 5.6, 6.2], [fx2 + 0.5, fy * 8.8, 1.4], 2.1, 1.6, d, 1, rot), El([fx2 + 1.3, fy * 9.1, 0.9], [2.3, 1.7, 0.9], d, 1, 0, rot)); }
  if (!cool) for (const x of [-8, -4, 0, 4]) P.push(Kc([x, 0, 11.6], [x - 0.6, 0, 15.5 + (x % 8 ? 1.5 : 0)], 1.25, 0.3, '#ffe14a', 1.35));
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
  const D = DEF[rootOf(id)], CH = {}, SP = {};
  const k = A.SR, dirs = (make, w, h, o = {}) => { const oo = Object.assign({}, o, { sc: (o.sc || 1) * k, base: o.base !== undefined ? Math.round(o.base * k) : undefined }), out = []; for (let d = 0; d < 8; d++) out.push(atlas.add(A.figure(make(), d / 8 * TAU, Math.round(w * k), Math.round(h * k), oo))); return out; };
  const B = BOSS[D.boss] || null;
  CH.boss = []; if (B) for (let p = 0; p < B.poses; p++) CH.boss.push(dirs(() => B.make(p), B.w, B.h, { sc: B.sc, base: B.h - 4 }));
  const need = new Set(); for (const k of family(id)) for (const t of Object.values(DEF[k].foes || {})) need.add(t);
  for (const t of need) if (CHAMP[t]) CH[t] = CPOSE.map(p => dirs(() => A.human(CHAMP[t], p), 48, 56));
  if (need.has('plant')) CH.plant = [0, 1].map(f => dirs(() => plant(f), 26, 28));
  if (need.has('crab')) CH.crab = [0, 1].map(f => dirs(() => crab(f), 34, 22));
  if (need.has('slimeB')) CH.slimeB = [0, 1].map(f => dirs(() => A.slime({ c: '#4a8ae8' }, f), 34, 26));
  if (need.has('slimeR')) CH.slimeR = [0, 1].map(f => dirs(() => A.slime({ c: '#ff6a2a' }, f), 34, 26));
  if (need.has('mummy')) CH.mummy = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0, armL: 2.6 }, { armR: 1.4, armL: 1.2, leg: -0.3 }].map(p => dirs(() => A.human({ skin: '#d8d0b0', hand: '#d8d0b0', shirt: '#cfc6a4', sleeve: '#d8d0b0', pants: '#bdb492', boots: '#9a9278', eyes: '#ff3a2a', belt: '#a89e7c' }, p), 44, 48));
  if (need.has('iceskel')) CH.iceskel = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0 }, { armR: 1.4, leg: -0.3 }].map(p => dirs(() => A.human({ skin: '#cfe8ff', hand: '#cfe8ff', skull: true, shirt: '#8ab8e0', sleeve: '#cfe8ff', pants: '#8ab8e0', boots: '#5a7a9a', weapon: { col: '#bfe6ff', guard: '#5a8ac0', glow: '#ffffff' } }, p), 44, 48));
  if (need.has('icebat')) CH.icebat = [0, 1].map(f => dirs(() => A.bat(f, '#8ab8e0', '#5a7aa8', '#ffffff'), 40, 30));
  if (need.has('firebat')) CH.firebat = [0, 1].map(f => dirs(() => A.bat(f, '#c8342c', '#7a1a14', '#ffe14a'), 40, 30));
  SP.turret = dirs(() => turret(sh(D.pot[0], 0.9), '#ff6a3a'), 30, 30);
  SP.brazier = atlas.add(brazier());
  SP.pot = atlas.add(pot(D.pot[0], D.pot[1]));
  SP.xtal = [atlas.add(xtal('#e83a3a', '#ff9a9a')), atlas.add(xtal('#3a7ae8', '#9ac8ff'))];
  SP.gem = atlas.add(gem(D.glow));
  SP.portal = [atlas.add(portal(0)), atlas.add(portal(1))];
  SP.portalS = [atlas.add(portal(0, 56, 80)), atlas.add(portal(1, 56, 80))];      // quello delle tesorerie: basso, sta sotto l'architrave
  SP.lapide = atlas.add(lapide());
  SP.gold = atlas.add(goldPile()); SP.bones = atlas.add(bonesPile());
  SP.cluster = atlas.add(cluster(D.glow, sh(D.glow, 1.35)));
  SP.statue = dirs(() => A.human(STONE, {}), 44, 50);
  return { CH, SP, boss: B };
}

SG.dun = { CS, WH, DH, PD, WD, LD, T: { ROCK, WALL, CRACK, FLOOR, PIT, WATER, LAVA, ICE, SPIKE, BRIDGE, DOOR, EXIT, TOGB, PLAT, STAIR }, Maker, ORDER, CAVES, DEF, BOSS, CHAMP, rootOf, family, parse, buildStatic, quadTo, boxTo, flatTo, tilesOn, art };
})();
