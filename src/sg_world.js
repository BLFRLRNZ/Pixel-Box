// ===================== PIXEL SAGA · le Terre di Lumen =====================
// L'isola di Lumen (a nord-ovest) disegnata a mano: regioni, rilievi, lago, fiume, strade, borgo, rocca, rovine e santuari.
// Le terre nuove (il continente a est e le terre del sud) si aggiungono in sg_lands.js; città e castelli in sg_town.js.
// Le forme sono decise dalle tabelle; il rumore aggiunge solo i dettagli, sempre uguali (seme fisso).
(() => {
// il mondo è largo WS (x da 0 a WS) e si allunga a nord di ZN: z va da Z0 = -ZN a WS (le terre di prima restano dove sono)
const WS = 8192, ZN = 2048, Z0 = -ZN, WSZ = WS + ZN, N = 1024, CELL = WS / N, NZ = WSZ / CELL, V = N + 1, VZ = NZ + 1, TEX = 2048, TC = WS / TEX, TEXZ = WSZ / TC, WL = 0, CH = 32, CS = WS / CH, CHZ = WSZ / CS, OLD = 4096;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- rumore ripetibile ----------
const PERM = new Uint8Array(512), GV = new Float32Array(256);
{ const R = rng(1957); const p = []; for (let i = 0; i < 256; i++) p.push(i); for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; for (let i = 0; i < 256; i++) GV[i] = R(); }
function vn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), X = xi & 255, Y = yi & 255;
  const a = GV[PERM[PERM[X] + Y]], b = GV[PERM[PERM[X + 1] + Y]], c = GV[PERM[PERM[X] + Y + 1]], d = GV[PERM[PERM[X + 1] + Y + 1]];
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}
function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * vn(x * f + i * 17.3, y * f + i * 9.1); n += a; a *= 0.5; f *= 2.03; } return s / n; }
function ridge(x, y, o = 4) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { const r = 1 - Math.abs(vn(x * f + i * 31.7, y * f) * 2 - 1); s += a * r * r; n += a; a *= 0.5; f *= 2.1; } return s / n; }

// ---------- disegno del mondo ----------
const B = { MEADOW: 0, FARM: 1, FOREST: 2, MOUNT: 3, SNOW: 4, DESERT: 5, SWAMP: 6, VOLCANO: 7, AUTUMN: 8, SAVANNA: 9, MESA: 10, JUNGLE: 11, BLOSSOM: 12, MOOR: 13, ALP: 14, HILLS: 15 };
const NB = 16;
const COAST = [[520, 420], [900, 230], [1150, 150], [1120, -250], [1020, -700], [1160, -1150], [1500, -1520], [2000, -1760], [2500, -1840], [3000, -1760], [3400, -1480], [3640, -1050], [3700, -550], [3620, -120], [3500, 120],
  [3450, 300], [3800, 560], [3940, 1000], [3960, 1500], [3930, 1900], [4020, 2000], [3930, 2100], [3960, 2500],
  [3880, 3000], [3700, 3450], [3350, 3750], [2900, 3880], [2450, 3940], [2050, 3980], [1600, 3880], [1150, 3740], [750, 3480], [430, 3100], [260, 2650], [200, 2150], [260, 1650], [190, 1150], [300, 750]];
// [x, z, raggio, bioma, nome]
const REG = [
  [2050, 2600, 720, B.MEADOW, 'PRATI DI LUMEN'], [2430, 2790, 230, B.FARM, 'CAMPI DORATI'], [1500, 2200, 300, B.MEADOW, 'PRATI DI LUMEN'],
  [1200, 1550, 520, B.FOREST, 'BOSCO ANTICO'], [700, 1150, 380, B.FOREST, 'BOSCO ANTICO'], [1650, 1250, 280, B.FOREST, 'BOSCO ANTICO'],
  [2150, 1340, 420, B.MEADOW, 'LAGO DI CRISTALLO'],
  [1250, 520, 430, B.MOUNT, 'MONTI DEL DRAGO'], [2300, 480, 470, B.MOUNT, 'PICCO DEL DRAGO'], [3150, 620, 430, B.MOUNT, 'MONTI DEL DRAGO'], [3680, 900, 260, B.MOUNT, 'RUPI DEL GRIFONE'],
  [650, 640, 300, B.SNOW, 'VALLE GELATA'],
  // (qui c'era il Deserto di Solis: le due regioni restano, ma dove contavano davvero il loro peso passa alle colline: vedi SOLIS in prepCoarse)
  [3250, 1750, 560, B.DESERT, 'COLLINE DI SOLIS', null, B.HILLS], [3550, 2350, 320, B.DESERT, 'COLLINE DI SOLIS', null, B.HILLS],
  [650, 2650, 450, B.SWAMP, "PALUDE D'OMBRA"],
  [3350, 3150, 430, B.VOLCANO, 'MONTE BRACE'],
  [2760, 2960, 330, B.MEADOW, 'ROCCA DI LUMEN'],
  [1350, 3350, 420, B.MEADOW, 'COSTA DELLE CONCHIGLIE'], [2600, 3550, 330, B.MEADOW, 'COSTA DELLE CONCHIGLIE'],
];
const LAKES = [{ x: 2150, z: 1340, rx: 330, rz: 250, d: -18 }, { x: 3150, z: 2060, rx: 46, rz: 38, d: -5 }, { x: 1790, z: 2930, rx: 42, rz: 34, d: -4 }];
const ISLAND = { x: 2150, z: 1340, r: 58, h: 5 };
const STONES = [[2010, 1578], [2052, 1500], [2098, 1438], [2138, 1394]];   // il passaggio nascosto verso l'isola
const RIVER = { pts: [[2170, 1560], [2200, 1800], [2160, 2050], [2250, 2350], [2320, 2600], [2290, 2880], [2200, 3180], [2130, 3480], [2090, 3780], [2075, 4100]], w: 30, fords: [[2318, 2705]] };
// strade visibili e sentieri nascosti (solo il terreno diventa percorribile)
const ROADS = [
  { w: 9, pts: [[2000, 2600], [1990, 2420], [2040, 2200], [2080, 1980], [2110, 1780], [2130, 1640]] },
  { w: 9, pts: [[2040, 2650], [2200, 2690], [2318, 2705], [2440, 2760], [2490, 2850], [2505, 2940], [2562, 2960]] },
  { w: 9, pts: [[1960, 2620], [1780, 2480], [1560, 2260], [1400, 2000], [1250, 1760], [1130, 1520]] },
  { w: 8, pts: [[1960, 2680], [1700, 2760], [1400, 2790], [1100, 2720], [860, 2650]] },
  { w: 8, pts: [[1990, 2700], [1940, 2950], [1800, 3200], [1620, 3420], [1450, 3600]] },
  { w: 8, pts: [[2440, 2760], [2600, 2700], [2850, 2580], [3050, 2300], [3200, 2000], [3330, 1740]] },
  { w: 9, pts: [[3200, 2000], [3450, 2030], [3700, 2010], [3890, 2000]] },
  { w: 8, pts: [[2540, 1400], [2700, 1500], [3000, 1640], [3300, 1700]] },
  { w: 7, pts: [[2130, 1640], [1880, 1560], [1760, 1340], [1880, 1120], [2050, 1060], [2150, 1050], [2230, 900], [2300, 720], [2330, 560], [2310, 450]] },
  { w: 8, pts: [[1130, 1520], [1010, 1500], [950, 1350], [860, 980], [760, 760], [700, 650]] },
  { w: 8, pts: [[2665, 3144], [2700, 3205], [2800, 3225], [2950, 3215], [3150, 3170], [3270, 3110], [3340, 3048]] },
  { w: 8, hidden: true, pts: [[3400, 1350], [3520, 1200], [3630, 1040], [3695, 915]] },
  { w: 8, hidden: true, pts: [[860, 2650], [760, 2640], [665, 2650]] },
];
// aree spianate: [x, z, raggio, altezza (null = quella del centro)]
const FLAT = [[2000, 2650, 175, null], [2760, 2960, 310, 60], [3360, 1670, 150, null], [1080, 1420, 120, null], [3700, 900, 85, 150], [3150, 1985, 50, null],
  [690, 660, 100, null], [2310, 445, 55, null], [1650, 2850, 45, null], [2130, 1650, 30, null], [665, 2650, 40, 3]];

// ---------- edifici: case con tetto a due falde, torri, mura, templi ----------
// tile: 0 intonaco, 1 graticcio, 2 pietra, 3 assi, 4 tegole rosse, 5 ardesia, 6 paglia, 7 porta, 8 finestra, 9 pietra chiara,
// 10 arenaria, 11 pietra muschiosa, 12 porta runica, 13 tenda a righe, 14 pietra scura, 15 lanterna, 16 mattoni
const BUILD = [
  { k: 'house', x: 1930, z: 2585, w: 24, d: 18, h: 12, wall: 1, roof: 4, door: 's', name: 'CASA DI MIRTA' },
  { k: 'house', x: 2078, z: 2588, w: 20, d: 16, h: 10, wall: 2, roof: 5, door: 'w', name: 'FUCINA' },
  { k: 'house', x: 2075, z: 2722, w: 28, d: 20, h: 17, wall: 1, roof: 6, door: 'n', name: 'LOCANDA', shop: 'gallo', aw: 13, chim: true },
  { k: 'house', x: 1925, z: 2722, w: 18, d: 16, h: 11, wall: 0, roof: 4, door: 'n' },
  { k: 'house', x: 1868, z: 2652, w: 16, d: 20, h: 10, wall: 3, roof: 6, door: 'e' },
  { k: 'house', x: 2128, z: 2650, w: 16, d: 16, h: 10, wall: 0, roof: 5, door: 'w' },
  { k: 'house', x: 1995, z: 2760, w: 16, d: 14, h: 10, wall: 16, roof: 4, door: 'n' },
  { k: 'house', x: 2220, z: 2770, w: 32, d: 20, h: 14, wall: 3, roof: 4, door: 'w' },
  { k: 'house', x: 2032, z: 2570, w: 24, d: 17, h: 17, wall: 1, roof: 5, door: 's', name: 'EMPORIO', shop: 'nino', aw: 101, chim: true },
  { k: 'board', x: 2021, z: 2633 },
  { k: 'house', x: 2105, z: 1665, w: 14, d: 12, h: 9, wall: 3, roof: 6, door: 'n' },
  { k: 'house', x: 765, z: 700, w: 16, d: 14, h: 10, wall: 2, roof: 5, door: 'w' },
  // la Rocca di Lumen
  // i cinque santuari sigillati
  { k: 'temple', x: 1115, z: 1330, w: 26, d: 22, h: 16, wall: 11, door: 's', id: 'bosco' },
  { k: 'temple', x: 3385, z: 1600, w: 30, d: 24, h: 18, wall: 10, door: 's', id: 'sole' },
  { k: 'temple', x: 660, z: 598, w: 24, d: 20, h: 15, wall: 9, door: 's', id: 'ghiaccio' },
  { k: 'temple', x: 3350, z: 3020, w: 24, d: 20, h: 15, wall: 14, door: 'n', id: 'fuoco' },
  { k: 'temple', x: 2150, z: 1328, w: 20, d: 18, h: 14, wall: 9, door: 's', id: 'lago' },
  // rovine di Solis
  { k: 'ruin', x: 3330, z: 1700, w: 70, d: 6, h: 9, wall: 10, gate: true }, { k: 'ruin', x: 3420, z: 1660, w: 6, d: 60, h: 11, wall: 10 }, { k: 'ruin', x: 3300, z: 1630, w: 6, d: 40, h: 7, wall: 10 },
  { k: 'ruin', x: 1870, z: 1240, w: 30, d: 5, h: 6, wall: 11 }, { k: 'ruin', x: 1600, z: 3460, w: 5, d: 24, h: 5, wall: 9 },
  { k: 'tower', x: 1310, z: 3610, r: 9, h: 46, wall: 9, roof: 4 },
  // grotte segrete: un poggio di roccia con l'imbocco, nascosto tra alberi e massi
  { k: 'cave', x: 520, z: 1560, w: 28, d: 22, h: 12, door: 's', id: 'funghi' },
  { k: 'cave', x: 2400, z: 3815, w: 30, d: 20, h: 11, door: 's', id: 'mare' },
  { k: 'cave', x: 1750, z: 690, w: 28, d: 22, h: 13, door: 's', id: 'cristalli' },
  { k: 'cave', x: 360, z: 640, w: 24, d: 22, h: 12, door: 'e', id: 'gelo' },
];
// oggetti messi a mano: [tipo, x, z]
const PROPS = [
  ['giant', 1080, 1420], ['well', 2000, 2650], ['torch', 1970, 2625], ['torch', 2030, 2625], ['torch', 1970, 2678], ['torch', 2030, 2678], ['anvil', 2062, 2604],
  ['sign', 1996, 2470], ['sign', 2120, 1680], ['sign', 2532, 2936], ['sign', 3220, 1980], ['sign', 1180, 1600], ['sign', 900, 2660],
  ['statue', 2040, 2470], ['statue', 2536, 2924], ['statue', 2536, 2996],
  ['menhir', 1625, 2850], ['menhir', 1675, 2850], ['menhir', 1650, 2825], ['menhir', 1650, 2875], ['menhir', 1632, 2832], ['menhir', 1668, 2868],
  ['tent', 3172, 1992], ['campfire', 3148, 2012], ['snowman', 780, 600],
  ['banner', 2548, 2944], ['banner', 2548, 2976],
  ['ore', 2380, 2350], ['ore', 2455, 2285], ['ore', 2525, 2405], ['ore', 2605, 2300], ['ore', 2440, 2440],
];
// forzieri: [id, x, z, contenuto, rarità, direzione]
const CHESTS = [
  ['c01', 1925, 2562, 'pozione', 0], ['c02', 2475, 2930, 'monete:40', 0], ['c03', 1625, 2330, 'giaco', 0], ['c04', 1195, 1765, 'monete:60', 0],
  ['c05', 1080, 1392, 'cuore', 1], ['c06', 2150, 1352, 'cuore', 2], ['c07', 2316, 452, 'monete:350', 2], ['c08', 3395, 1655, 'monete:250', 2],
  ['c09', 665, 2650, 'elisir', 2], ['c10', 3702, 905, 'monete:300', 2], ['c11', 860, 480, 'vento', 2], ['c12', 3230, 3150, 'runica', 2],
  ['c13', 2916, 3052, 'elmoFerro', 1], ['c14', 1292, 3632, 'cotta', 1], ['c15', 3060, 2385, 'argento', 1], ['c16', 830, 1175, 'monete:80', 0],
  ['c17', 3620, 1920, 'ascia', 2], ['c18', 2950, 3420, 'cuore', 1], ['c19', 1150, 3150, 'pozione:2', 0], ['c20', 3210, 1140, 'acciaio', 2],
  ['c21', 1650, 2850, 'cuore', 1], ['c22', 2600, 1150, 'monete:100', 0], ['c23', 1904, 897, 'alato', 2], ['c24', 2550, 3700, 'pozione:3', 0],
  ['c25', 820, 1900, 'scudoFerro', 1], ['c26', 1850, 3650, 'monete:70', 0], ['c27', 3150, 2700, 'pozione:2', 0], ['c28', 1550, 1050, 'anello2', 1],
  ['c29', 610, 2960, 'elisir', 1], ['c30', 1330, 1180, 'monete:90', 0], ['c31', 3500, 2150, 'elisir', 1],
];
// nascondigli: un cerchio di cespugli, alberi o massi attorno a un forziere (stile, apertura verso...)
const NOOKS = [
  [1925, 2562, 'cespugli'], [2475, 2930, 'cespugli'], [1625, 2330, 'cespugli'], [1195, 1765, 'bosco'], [1080, 1392, 'bosco'], [860, 480, 'neve'],
  [3230, 3150, 'brace'], [1292, 3632, 'cespugli'], [3060, 2385, 'solis'], [830, 1175, 'bosco'], [3620, 1920, 'solis'], [2950, 3420, 'brace'],
  [1150, 3150, 'cespugli'], [3210, 1140, 'rocce'], [2600, 1150, 'rocce'], [1904, 897, 'rocce'], [2550, 3700, 'cespugli'], [820, 1900, 'bosco'],
  [1850, 3650, 'cespugli'], [3150, 2700, 'brace'], [1550, 1050, 'bosco'], [610, 2960, 'palude'], [1330, 1180, 'bosco'], [3500, 2150, 'solis'],
];
// abitanti e creature con un nome: [id, x, z, direzione]
const NPCS = [
  ['mirta', 1958, 2605, 1.2], ['bruno', 2058, 2612, 3.6], ['lia', 2022, 2668, 2.4], ['otto', 2165, 2672, 3.14],
  ['viandante', 2062, 2706, 4.4], ['pescatore', 2122, 1632, -1.4], ['spirito', 1095, 1462, 1.57], ['ardea', 2800, 2960, 3.14],
  ['nomade', 3150, 2000, 1.2], ['eremita', 748, 712, 3.4], ['contadino', 2380, 2700, 0.6], ['biscotto', 1475, 2020, 0.4],
];
// tane dei nemici: [x, z, tipo, numero, raggio]
const CAMPS = [
  [2420, 2840, 'slime', 4, 80], [2440, 2630, 'slime', 3, 70], [2280, 2960, 'slime', 3, 70], [1700, 2180, 'slime', 3, 90], [1850, 3150, 'slime', 3, 90],
  [1320, 1660, 'wolf', 3, 100], [880, 1300, 'wolf', 3, 100], [1530, 1300, 'wolf', 2, 90], [600, 1100, 'wolf', 3, 100],
  [900, 2560, 'goblin', 3, 90], [560, 2900, 'goblin', 3, 90], [1250, 2830, 'goblin', 2, 70], [430, 2400, 'goblin', 3, 90],
  [3355, 1655, 'skel', 4, 55], [3060, 1960, 'skel', 2, 80], [3550, 2300, 'skel', 3, 90], [3500, 1450, 'skel', 2, 80],
  [3400, 3020, 'imp', 3, 90], [3100, 3330, 'imp', 2, 80], [3600, 3200, 'imp', 3, 90],
  [870, 560, 'icewolf', 3, 90], [1150, 820, 'icewolf', 2, 80], [2330, 650, 'icewolf', 2, 70], [560, 820, 'icewolf', 2, 80],
  [1600, 1650, 'bat', 3, 80], [700, 2350, 'bat', 3, 80],
];
// nomi dei luoghi speciali (prima delle regioni): [x, z, raggio, nome]
const PLACES = [[2000, 2650, 200, 'BORGO AURORA'], [2760, 2960, 300, 'ROCCA DI LUMEN'], [3360, 1670, 180, 'ROVINE DI SOLIS'], [1080, 1420, 150, "L'ALBERO MADRE"],
  [2150, 1340, 70, "ISOLA DEL LAGO"], [3700, 900, 90, 'NIDO DEL GRIFONE'], [3150, 2030, 110, 'FONTE DEI GIRASOLI'], [2310, 445, 90, 'VETTA DEL DRAGO'], [1310, 3610, 70, 'FARO DEL SUD'], [3350, 3150, 150, 'CRATERE DEL BRACE']];
// altre tabelle che le terre nuove e le città possono allungare
const COASTS = [COAST], RIVERS = [RIVER];
const FINE = [];                                   // zone dove il rilievo resta preciso anche da lontano: [x0, z0, x1, z1]
const SHAPERS = [];                                // forme a mano sul rilievo finito: { box: [x0, z0, x1, z1], f(x, z, h) → nuova quota } (i gradoni della città dei monti)
const CARVE = [];                                  // valli scavate nei monti: { pts: [[x, z, quota]...], w (fondo piatto), w2 (dove la valle finisce) }
const PEAKS = [[2300, 440, 210, 290]];           // cime isolate: [x, z, altezza, raggio]
const VOLC = [3350, 3150];
const TERRA = [];                                  // opere sul terreno: { x0, z0, x1, z1, y, mode } (ponti, moli, bacini, terrazze)
const BRIDGES = [];                                // ponti: { x0, z0, x1, z1, y } allineati alla griglia
// pavimenti: ['g' selciato | 'b' pietra chiara | 'r' terra battuta, 'disc', x, z, r] oppure [.., 'rect', x0, z0, x1, z1] oppure [.., 'line', larghezza, punti]
const PAVE = [['g', 'disc', 2000, 2650, 62], ['b', 'rect', 3290, 1610, 3430, 1720], ['b', 'disc', 1080, 1420, 40], ['b', 'disc', 2150, 1340, 30]];
// zone senza alberi né sassi: [x0, z0, x1, z1]
const CLEAR = [];
const OLDN = { nooks: NOOKS.length, props: PROPS.length };
// la sequenza della vegetazione di Lumen, riga per riga (vedi placeObjects): numeri già usati all'inizio della riga 738, poi quanti ne usa ogni riga
const SOLR0 = 64383, SOLR = [1052,1051,1054,1051,1050,1055,1058,1070,1062,1057,1068,1068,1065,1064,1081,1074,1074,1085,1090,1093,1099,1105,1115,1102,1114,1093,1097,1100,1110,1094,1108,1090,1097,1106,1103,1091,1098,1090,1091,1097,1087,1098,1102,1090,1096,1096,1103,1101,1093,1083,1085,1086,1084,1086,1074,1093,1080,1086,1089,1077,1075,1084,1077,1080,1089,1090,1101,1095,1104,1093,1096,1095,1094,1101,1103,1103,1089,1092,1105,1102,1105,1088,1107,1108,1095,1097,1099,1095,1104,1104,1102,1095,1102,1094,1103,1107,1096,1104,1094,1101,1084,1101,1100,1086,1081,1087,1091,1085,1091,1086,1089,1082,1071,1081,1086,1083,1077,1071,1075,1070,1073,1072,1060,1055,1061,1060,1062,1085,1074,1084,1071,1065,1067,1072,1068,1069,1071,1052,1074,1077,1063,1063,1068,1072,1073,1070,1064,1060,1065,1063,1060,1056,1064,1059,1067,1054,1059,1056,1056,1057,1061,1059,1049,1056,1053,1064,1055,1053,1052,1054,1058,1062,1057,1074,1058,1056,1057,1068,1062,1061,1058,1054,1060,1053,1065,1057,1047,1065,1056,1055,1067,1057,1054,1059,1059,1058,1052,1059,1059,1057,1051,1056,1052,1053,1058,1057,1052,1066,1058,1053,1067,1068,1057];

// ---------- griglie larghe (un punto ogni 32 unità): distanza dalla costa e pesi dei biomi ----------
const CG = 32, CGN = WS / CG, CGV = CGN + 1, CGNZ = WSZ / CG, CGVZ = CGNZ + 1;
let CHGc = null;   // dove il mondo è cambiato rispetto a prima (le Colline di Solis): serve a lasciare identica la vegetazione di tutto il resto
let SDc = null, BWc = null;
function polySD(P, x, z) {
  let inside = false, md = 1e18;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const xi = P[i][0], zi = P[i][1], xj = P[j][0], zj = P[j][1];
    if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) inside = !inside;
    const dx = xj - xi, dz = zj - zi, t = Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / (dx * dx + dz * dz))), ex = x - xi - dx * t, ez = z - zi - dz * t, d = ex * ex + ez * ez;
    if (d < md) md = d;
  }
  md = Math.sqrt(md); return inside ? md : -md;
}
function warp(x, z, o) { o[0] = x + (fbm(x / 640, z / 640, 3) - 0.5) * 460; o[1] = z + (fbm(x / 640 + 41, z / 640 + 13, 3) - 0.5) * 460; }
function* prepCoarse() {
  SDc = new Float32Array(CGV * CGVZ); BWc = new Float32Array(CGV * CGVZ * NB); CHGc = new Uint8Array(CGV * CGVZ);
  const BB = COASTS.map(P => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of P) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } return [x0, z0, x1, z1]; });
  const wp = [0, 0];
  for (let j = 0; j < CGVZ; j++) {
    for (let i = 0; i < CGV; i++) {
      const x = i * CG, z = Z0 + j * CG, k = j * CGV + i, o = k * NB; let best = -1e9;
      for (let p = 0; p < COASTS.length; p++) {
        const b = BB[p], ox = Math.max(b[0] - x, 0, x - b[2]), oz = Math.max(b[1] - z, 0, z - b[3]);
        if (ox + oz > 0 && -Math.hypot(ox, oz) <= best) continue;
        const d = polySD(COASTS[p], x, z); if (d > best) best = d;
      }
      SDc[k] = best;
      if (best < -420) { BWc[o] = 1; continue; }
      warp(x, z, wp); let tot = 0;
      let ws = 0;
      for (const r of REG) { let w = Math.exp(-7 * Math.hypot(wp[0] - r[0], wp[1] - r[1]) / r[2]); if (r[5]) w *= r[5](x, z); BWc[o + r[3]] += w; tot += w; if (r[6] !== undefined) ws += w; }   // r[5]: dove la regione vale (i monti del nord non toccano le terre di prima)
      if (tot > 1e-200) for (let b = 0; b < NB; b++) BWc[o + b] /= tot; else { for (let b = 0; b < NB; b++) BWc[o + b] = 0; BWc[o] = 1; }
      // SOLIS: dove il vecchio deserto pesava almeno un po', il suo peso diventa collina. Altrove (a ovest del lago, a nord, oltre lo stretto) niente cambia di una virgola
      if (ws > 0 && tot > 1e-200) { const wn = ws / tot, m = smooth(0.03, 0.15, wn) * smooth(880, 960, z) * smooth(4250, 4120, x); if (m > 0) { BWc[o + B.DESERT] -= wn * m; BWc[o + B.HILLS] += wn * m; CHGc[k] = 1; } }
    }
    if (j % 32 === 0) yield j / CGVZ;
  }
}
function sdAt(x, z) {
  const fx = Math.max(0, Math.min(CGN - 0.001, x / CG)), fz = Math.max(0, Math.min(CGNZ - 0.001, (z - Z0) / CG)), i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = j * CGV + i;
  return (SDc[k] * (1 - u) + SDc[k + 1] * u) * (1 - v) + (SDc[k + CGV] * (1 - u) + SDc[k + CGV + 1] * u) * v;
}
function coastDist(x, z) { return sdAt(x, z) + (fbm(x / 320, z / 320, 3) - 0.5) * 170; }
function biomeW(x, z, out) {
  const fx = Math.max(0, Math.min(CGN - 0.001, x / CG)), fz = Math.max(0, Math.min(CGNZ - 0.001, (z - Z0) / CG)), i = fx | 0, j = fz | 0, u = fx - i, v = fz - j;
  const a = (j * CGV + i) * NB, b = a + NB, c = a + CGV * NB, d = c + NB, wa = (1 - u) * (1 - v), wb = u * (1 - v), wc = (1 - u) * v, wd = u * v;
  for (let q = 0; q < NB; q++) out[q] = BWc[a + q] * wa + BWc[b + q] * wb + BWc[c + q] * wc + BWc[d + q] * wd;
  return out;
}

// ---------- funzioni del terreno ----------
function segDist(x, z, pts) {
  let md = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))), d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < md) md = d;
  }
  return md;
}
const boxOf = (pts, m) => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of pts) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } return [x0 - m, z0 - m, x1 + m, z1 + m]; };
function biomeH(b, x, z) {
  switch (b) {
    case B.MEADOW: return 14 + 17 * fbm(x / 520, z / 520, 4) + 5 * fbm(x / 110, z / 110, 2);
    case B.FARM: return 12 + 5 * fbm(x / 400, z / 400, 3);
    case B.FOREST: return 20 + 30 * fbm(x / 420, z / 420, 4) + 7 * fbm(x / 95, z / 95, 2);
    case B.MOUNT: return 50 + 260 * Math.pow(ridge(x / 760, z / 760, 4), 1.7) + 18 * fbm(x / 140, z / 140, 2);
    case B.SNOW: return 58 + 46 * fbm(x / 330, z / 330, 4) + 9 * fbm(x / 80, z / 80, 2);
    case B.DESERT: { const du = Math.abs(Math.sin(x * 0.011 + z * 0.004 + 6 * fbm(x / 500, z / 500, 2))); return 10 + 12 * fbm(x / 600, z / 600, 3) + 10 * du * du; }
    case B.SWAMP: return -1.6 + 6.5 * fbm(x / 160, z / 160, 3);
    case B.AUTUMN: return 20 + 28 * fbm(x / 420, z / 420, 4) + 6 * fbm(x / 95, z / 95, 2);
    case B.SAVANNA: return 15 + 15 * fbm(x / 600, z / 600, 3) + 3 * fbm(x / 120, z / 120, 2);
    // altopiani a gradoni: cime piatte e pareti ripide
    case B.MESA: { const v = 12 + 190 * Math.pow(fbm(x / 520, z / 520, 4), 1.7) + 6 * fbm(x / 130, z / 130, 2), st = 28, f = v / st, fl = Math.floor(f); return (fl + smooth(0.7, 0.97, f - fl)) * st + 3 * fbm(x / 60, z / 60, 2); }
    case B.JUNGLE: return 12 + 30 * fbm(x / 380, z / 380, 4) + 8 * fbm(x / 90, z / 90, 2);
    case B.BLOSSOM: return 20 + 44 * fbm(x / 460, z / 460, 4) + 6 * fbm(x / 100, z / 100, 2);
    case B.MOOR: return 10 + 22 * fbm(x / 420, z / 420, 3) + 12 * Math.pow(ridge(x / 300, z / 300, 3), 2);
    // i grandi monti del nord: salgono a poco a poco verso settentrione, con creste sempre più alte
    // le Colline di Solis: dossi morbidi, più mossi dei prati
    case B.HILLS: return 15 + 30 * fbm(x / 360 + 5.3, z / 360 + 1.9, 4) + 6 * fbm(x / 95, z / 95, 2);
    case B.ALP: { const up = smooth(280, -1050, z), rg = Math.pow(ridge(x / 880 + 3.1, z / 880 + 7.7, 5), 1.45); return 150 + 300 * up + (230 + 470 * up) * rg + 26 * fbm(x / 150, z / 150, 3); }
    default: return 20 + 10 * fbm(x / 200, z / 200, 2);
  }
}
const BW = new Float32Array(NB);
function height0(x, z) {
  const sd = sdAt(x, z), cd = sd + (fbm(x / 320, z / 320, 3) - 0.5) * 170;
  if (sd < -280) return Math.max(-42, -3 + cd * 0.08);   // mare aperto: niente da calcolare
  biomeW(x, z, BW);
  let h = 0;
  for (let b = 0; b < NB; b++) if (BW[b] > 0.004) h += BW[b] * biomeH(b, x, z);
  // cime isolate (il Picco del Drago...) e il vulcano
  for (const p of PEAKS) { const dx = x - p[0], dz = z - p[1], r = p[3]; if (Math.abs(dx) < r * 3 && Math.abs(dz) < r * 3) h += p[2] * Math.exp(-(dx * dx + dz * dz) / (r * r)); }
  const dv = Math.hypot(x - VOLC[0], z - VOLC[1]);
  if (dv < 700) { h += 235 * Math.pow(1 - dv / 700, 1.5); if (dv < 115) h -= (115 - dv) * 1.15; }
  // laghi
  for (const L of LAKES) {
    if (Math.abs(x - L.x) > L.rx * 1.6 || Math.abs(z - L.z) > L.rz * 1.6) continue;
    const s = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz) * (1 + (fbm(x / 90, z / 90, 2) - 0.5) * 0.3);
    if (s < 1.25) h = Math.min(h, lerp(L.d, Math.max(h, 2), smooth(0.72, 1.25, s)));
  }
  const di = Math.hypot(x - ISLAND.x, z - ISLAND.z);
  if (di < ISLAND.r * 1.7) h = Math.max(h, lerp(ISLAND.h, -18, smooth(ISLAND.r, ISLAND.r * 1.7, di)));
  // i fiumi: una valle larga e un letto profondo, con i guadi
  for (const rv of RIVERS) {
    const bx = rv.box || (rv.box = boxOf(rv.pts, 200));
    if (x < bx[0] || x > bx[2] || z < bx[1] || z > bx[3]) continue;
    const d = segDist(x, z, rv.pts), w = rv.w;
    if (d < w * 4) {
      h = lerp(Math.min(h, 5), h, smooth(w * 0.9, w * 4, d));
      let fd = 1e9; for (const f of rv.fords || []) fd = Math.min(fd, Math.hypot(x - f[0], z - f[1]));
      const bed = lerp(-0.9, -6.5, smooth(10, 45, fd));
      h = lerp(bed, h, smooth(w * 0.3, w * 0.95, d));
    }
  }
  // le valli scavate: un fondo quasi piano che sale lungo il percorso, e i fianchi che tornano alla montagna
  for (const cv of CARVE) {
    const bx = cv.box || (cv.box = boxOf(cv.pts, cv.w2));
    if (x < bx[0] || x > bx[2] || z < bx[1] || z > bx[3]) continue;
    let md = 1e9, fy = 0, wm = 1;   // il quarto numero di ogni punto: quanto è larga lì la valle (1 = tutta)
    for (let i = 0; i < cv.pts.length - 1; i++) { const a = cv.pts[i], b = cv.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))), d = Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); if (d < md) { md = d; fy = a[2] + (b[2] - a[2]) * t; const ma = a[3] === undefined ? 1 : a[3], mb = b[3] === undefined ? 1 : b[3]; wm = ma + (mb - ma) * t; } }
    const w = cv.w * wm, w2 = cv.w2 * wm;
    if (md < w2) { const k = smooth(w, w2, md + (fbm(x / 70, z / 70, 2) - 0.5) * 50 * wm), fl = fy + 5 * fbm(x / 60, z / 60, 2); h = lerp(lerp(fl, Math.min(h, fl), smooth(w, w * 2.5, md)), h, k * k); }
  }
  // la costa
  if (cd < 0) h = Math.max(-42, Math.min(h, -3 + cd * 0.08));
  else if (cd < 170) h = lerp(lerp(-3, 3.5, smooth(0, 40, cd)), h, smooth(30, 170, cd));
  if (x < 2300 && x > 1900 && z < 1700 && z > 1300 && segDist(x, z, STONES) < 6) h = Math.max(h, -1.1);
  return h;
}

// ---------- il mondo vero e proprio ----------
const W = {
  WS, WSZ, Z0, ZN, N, NZ, CELL, V, TEX, TEXZ, WL, CH, CHZ, CS, OLD, B, NB, REG, PLACES, BUILD, PROPS, CHESTS, NOOKS, NPCS, CAMPS, ROADS, RIVER, RIVERS, STONES, ISLAND, COASTS, LAKES, FLAT, PEAKS, TERRA, BRIDGES, PAVE, CLEAR, CARVE, SHAPERS, FINE,
  H: null, SL: null, SH: null, col: null, mat: null, road: null, biome: null, nObjs: 0, colliders: null, boxes: [], mapImg: null, builders: {}, hooks: [], glows: [], smokes: [],
};
W.ground = (x, z) => {
  const fx = x / CELL, fz = (z - Z0) / CELL, i = Math.floor(fx), j = Math.floor(fz);
  if (i < 0 || j < 0 || i >= N || j >= NZ) return -40;
  const u = fx - i, v = fz - j, k = j * V + i, H = W.H, h00 = H[k], h10 = H[k + 1], h01 = H[k + V], h11 = H[k + V + 1];
  return u > v ? h00 + (h10 - h00) * u + (h11 - h10) * v : h00 + (h11 - h01) * u + (h01 - h00) * v;
};
W.slope = (x, z) => { const i = Math.max(0, Math.min(N, Math.round(x / CELL))), j = Math.max(0, Math.min(NZ, Math.round((z - Z0) / CELL))); return W.SL[j * V + i]; };
W.biomeAt = (x, z) => { const i = Math.max(0, Math.min(N, Math.round(x / CELL))), j = Math.max(0, Math.min(NZ, Math.round((z - Z0) / CELL))); return W.biome[j * V + i]; };
W.roadAt = (x, z) => { const i = Math.max(0, Math.min(TEX - 1, Math.floor(x / TC))), j = Math.max(0, Math.min(TEXZ - 1, Math.floor((z - Z0) / TC))); return W.road[j * TEX + i] / 255; };
const WP = [0, 0];
W.placeName = (x, z) => {
  for (const p of PLACES) if (Math.hypot(x - p[0], z - p[1]) < p[2]) return p[3];
  warp(x, z, WP);
  let best = null, bd = 1e9;
  for (const r of REG) { const d = Math.hypot(WP[0] - r[0], WP[1] - r[1]) / r[2]; if (d < bd) { bd = d; best = r[4]; } }
  return best;
};
// aria per regione: quanto pesa ogni bioma in quel punto
W.atmo = (x, z) => biomeW(x, z, BW);

// collisioni: cerchi (alberi, rocce) e scatole (edifici), ognuni nella loro griglia
const GC = 32, GN = WS / GC, GNZ = WSZ / GC, BGC = 64, BGN = WS / BGC, BGNZ = WSZ / BGC;
W.addCircle = (x, z, r) => { const i = Math.floor(x / GC), j = Math.floor((z - Z0) / GC); if (i < 0 || j < 0 || i >= GN || j >= GNZ) return; const k = j * GN + i; (W.colliders[k] || (W.colliders[k] = [])).push([x, z, r]); };
W.addBox = (x0, z0, x1, z1, top, b) => {
  const bx = [x0, z0, x1, z1, top, b]; W.boxes.push(bx);
  const i0 = Math.max(0, Math.floor(x0 / BGC)), i1 = Math.min(BGN - 1, Math.floor(x1 / BGC)), j0 = Math.max(0, Math.floor((z0 - Z0) / BGC)), j1 = Math.min(BGNZ - 1, Math.floor((z1 - Z0) / BGC));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * BGN + i; (W.boxGrid[k] || (W.boxGrid[k] = [])).push(bx); }
  return bx;
};
W.blocked = (x, z, r) => {
  const i0 = Math.floor((x - r - 20) / GC), i1 = Math.floor((x + r + 20) / GC), j0 = Math.floor((z - r - 20 - Z0) / GC), j1 = Math.floor((z + r + 20 - Z0) / GC);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GN || j >= GNZ) continue; const L = W.colliders[j * GN + i]; if (L) for (const c of L) if ((x - c[0]) ** 2 + (z - c[1]) ** 2 < (r + c[2]) ** 2) return c; }
  return W.inBox(x, z, r);
};
W.inBox = (x, z, m = 0) => {
  const i0 = Math.max(0, Math.floor((x - m) / BGC)), i1 = Math.min(BGN - 1, Math.floor((x + m) / BGC)), j0 = Math.max(0, Math.floor((z - m - Z0) / BGC)), j1 = Math.min(BGNZ - 1, Math.floor((z + m - Z0) / BGC));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const L = W.boxGrid[j * BGN + i]; if (L) for (const b of L) if (x > b[0] - m && x < b[2] + m && z > b[1] - m && z < b[3] + m) return b; }
  return null;
};

// ---------- costruzione, a passi (per la barra di caricamento) ----------
const BCH = ['#5aa83e', '#86c858', '#7cc24e', '#d9b44a', '#3e7a32', '#5e8e3a', '#8c8274', '#a29a8a', '#dce6f2', '#f2f6fc', '#e3c27a', '#d0a65c', '#4e5e34', '#6e7a3e', '#4a4242', '#5e5048',
  '#8e8438', '#b88a34', '#bfae4c', '#dcc866', '#c26238', '#e08c4c', '#2c8436', '#48a648', '#62b456', '#a2d676', '#56485c', '#6c5a68', '#5c9648', '#86b262', '#74a644', '#a4b850'];
const BM = [[1, 0, 0, 0], [0.6, 0.4, 0, 0], [0.75, 0.25, 0, 0], [0, 0.25, 0.75, 0], [0, 0.1, 0, 0.9], [0, 0.75, 0, 0.25], [0.45, 0.35, 0, 0.2], [0, 0.6, 0.4, 0],
  [0.7, 0.3, 0, 0], [0.65, 0.35, 0, 0], [0, 0.55, 0.45, 0], [0.9, 0.1, 0, 0], [1, 0, 0, 0], [0.5, 0.3, 0.2, 0], [0.8, 0.08, 0.12, 0], [0.9, 0.1, 0, 0]];
function* build(atlas, sprites) {
  for (const f of W.hooks) f();   // le città preparano strade, spianate e case prima che nasca il terreno
  for (const p of prepCoarse()) yield 0.005 + 0.035 * p;
  const H = W.H = new Float32Array(V * VZ);
  for (let j = 0; j < VZ; j++) { for (let i = 0; i < V; i++) H[j * V + i] = height0(i * CELL, Z0 + j * CELL); if (j % 32 === 0) yield 0.04 + 0.26 * j / VZ; }
  // spianate (borgo, rocca, città...) e, dopo, una piazzola sotto ogni edificio isolato: niente case mezze sepolte nei pendii
  const pads = [];
  for (const b of BUILD) {
    if (b.k !== 'house' && b.k !== 'temple' && b.k !== 'cave' && b.k !== 'tower' && b.k !== 'special') continue;
    const hw = b.k === 'tower' ? b.r : b.w / 2, hd = b.k === 'tower' ? b.r : b.d / 2; if (!hw || !hd) continue;
    pads.push([b.x, b.z, (Math.hypot(hw, hd) + 5) / 0.62, null]);
  }
  const flatten = L => { for (const [fx, fz, r, th] of L) {
    const t = th !== null ? th : W_groundRaw(H, fx, fz);
    const i0 = Math.max(0, Math.floor((fx - r) / CELL)), i1 = Math.min(N, Math.ceil((fx + r) / CELL)), j0 = Math.max(0, Math.floor((fz - r - Z0) / CELL)), j1 = Math.min(NZ, Math.ceil((fz + r - Z0) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(i * CELL - fx, Z0 + j * CELL - fz); if (d < r) H[j * V + i] = lerp(t, H[j * V + i], smooth(r * 0.62, r, d)); }
  } };
  flatten(FLAT.concat(pads));
  yield 0.31;
  // strade: il terreno lungo il percorso viene smussato (si sale anche in montagna)
  {
    const rm = SG.art.mk(V, VZ), rx = rm.getContext('2d');
    rx.fillStyle = '#000'; rx.fillRect(0, 0, V, VZ); rx.lineCap = 'round'; rx.lineJoin = 'round'; rx.strokeStyle = '#fff';
    for (const r of ROADS) { rx.lineWidth = (r.w + 26) / CELL; rx.beginPath(); r.pts.forEach(([x, z], k) => k ? rx.lineTo(x / CELL, (z - Z0) / CELL) : rx.moveTo(x / CELL, (z - Z0) / CELL)); rx.stroke(); }
    const rmask = rx.getImageData(0, 0, V, VZ).data;
    const blur = (src, rad) => {
      const a = new Float32Array(V * VZ), b = new Float32Array(V * VZ);
      for (let j = 0; j < VZ; j++) { let s = 0, n = 0; for (let i = -rad; i <= rad; i++) { const ii = Math.max(0, Math.min(N, i)); s += src[j * V + ii]; n++; } for (let i = 0; i < V; i++) { a[j * V + i] = s / n; const o = Math.max(0, Math.min(N, i - rad)), p = Math.max(0, Math.min(N, i + rad + 1)); s += src[j * V + p] - src[j * V + o]; } }
      for (let i = 0; i < V; i++) { let s = 0, n = 0; for (let j = -rad; j <= rad; j++) { const jj = Math.max(0, Math.min(NZ, j)); s += a[jj * V + i]; n++; } for (let j = 0; j < VZ; j++) { b[j * V + i] = s / n; const o = Math.max(0, Math.min(NZ, j - rad)), p = Math.max(0, Math.min(NZ, j + rad + 1)); s += a[p * V + i] - a[o * V + i]; } }
      return b;
    };
    let Hb = blur(H, 5); yield 0.33; Hb = blur(Hb, 5);
    for (let k = 0; k < V * VZ; k++) { const m = rmask[k * 4] / 255; if (m > 0 && H[k] > -0.5) H[k] = lerp(H[k], Hb[k], m * 0.92); }
    rm.width = rm.height = 1;
  }
  flatten(pads);   // le strade passano accanto alle case e ne smussano il terreno: le piazzole tornano piane
  // opere: ponti, moli, bacini dei porti, terrazze
  for (const t of TERRA) {
    const sf = t.soft || 0;   // bordo morbido: attorno al rettangolo il terreno raggiunge la quota a poco a poco (niente gradini agli angoli)
    const i0 = Math.max(0, Math.ceil((t.x0 - sf) / CELL)), i1 = Math.min(N, Math.floor((t.x1 + sf) / CELL)), j0 = Math.max(0, Math.ceil((t.z0 - sf - Z0) / CELL)), j1 = Math.min(NZ, Math.floor((t.z1 + sf - Z0) / CELL));
    const ty = t.y === null || t.y === undefined ? W_groundRaw(H, t.rx, t.rz) : t.y;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * V + i;
      if (sf) { const x = i * CELL, z = Z0 + j * CELL, d = Math.hypot(Math.max(t.x0 - x, 0, x - t.x1), Math.max(t.z0 - z, 0, z - t.z1)); if (d > 0) { if (d < sf && H[k] > -0.5) H[k] = lerp(ty, H[k], smooth(0, sf, d)); continue; } }
      H[k] = t.mode === 'max' ? Math.max(H[k], ty) : t.mode === 'min' ? Math.min(H[k], ty) : t.mode === 'rampx' ? lerp(ty, t.y1, (i * CELL - t.x0) / (t.x1 - t.x0)) : t.mode === 'rampz' ? lerp(ty, t.y1, (Z0 + j * CELL - t.z0) / (t.z1 - t.z0)) : ty; }
  }
  for (const s of SHAPERS) {
    const i0 = Math.max(0, Math.ceil(s.box[0] / CELL)), i1 = Math.min(N, Math.floor(s.box[2] / CELL)), j0 = Math.max(0, Math.ceil((s.box[1] - Z0) / CELL)), j1 = Math.min(NZ, Math.floor((s.box[3] - Z0) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) H[j * V + i] = s.f(i * CELL, Z0 + j * CELL, H[j * V + i]);
  }
  // quanto è vicina la riva (per la schiuma): 255 a riva e sulla terra, 0 dove l'acqua è profonda 7 o più
  const shore = W.shore = new Uint8Array(N * NZ);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < N; i++) { const h = H[j * V + i]; shore[j * N + i] = h >= 0 ? 255 : Math.max(0, 255 + h * 36); }
  yield 0.35;
  // pendenza e luce per vertice; bioma dominante; rumore largo per i colori
  const SL = W.SL = new Float32Array(V * VZ), SH = W.SH = new Float32Array(V * VZ), BI = W.biome = new Uint8Array(V * VZ), N1 = new Float32Array(V * VZ);
  const sun = [-0.42, 0.78, 0.46], sl = Math.hypot(...sun);
  for (let j = 0; j < VZ; j++) {
    for (let i = 0; i < V; i++) {
      const k = j * V + i, hl = H[j * V + Math.max(0, i - 1)], hr = H[j * V + Math.min(N, i + 1)], hu = H[Math.max(0, j - 1) * V + i], hd = H[Math.min(NZ, j + 1) * V + i];
      const gx = (hr - hl) / (2 * CELL), gz = (hd - hu) / (2 * CELL), n = Math.hypot(gx, 1, gz);
      SL[k] = Math.hypot(gx, gz);
      const dot = (-gx * sun[0] + sun[1] - gz * sun[2]) / (n * sl);
      SH[k] = Math.max(0.42, Math.min(1.12, 0.38 + 0.74 * Math.max(0, dot)));
      if (H[k] < -16) { N1[k] = 0.5; continue; }
      biomeW(i * CELL, Z0 + j * CELL, BW); let bb = 0; for (let b = 1; b < NB; b++) if (BW[b] > BW[bb]) bb = b; BI[k] = bb;
      N1[k] = fbm(i * CELL / 210, (Z0 + j * CELL) / 210, 3);
    }
    if (j % 32 === 0) yield 0.35 + 0.1 * j / VZ;
  }
  // maschera delle strade visibili e dei pavimenti (risoluzione della texture)
  const tm = SG.art.mk(TEX, TEXZ), tx = tm.getContext('2d');
  tx.fillStyle = '#000'; tx.fillRect(0, 0, TEX, TEXZ); tx.lineCap = 'round'; tx.lineJoin = 'round';
  const line = (w, pts) => { tx.lineWidth = w / TC; tx.beginPath(); pts.forEach(([x, z], k) => k ? tx.lineTo(x / TC, (z - Z0) / TC) : tx.moveTo(x / TC, (z - Z0) / TC)); tx.stroke(); };
  tx.strokeStyle = '#f00'; for (const r of ROADS) if (!r.hidden) line(r.w, r.pts);
  const PC = { r: '#f00', g: '#0f0', b: '#00f' };
  for (const p of PAVE) {
    tx.fillStyle = tx.strokeStyle = PC[p[0]];
    if (p[1] === 'disc') { tx.beginPath(); tx.arc(p[2] / TC, (p[3] - Z0) / TC, p[4] / TC, 0, Math.PI * 2); tx.fill(); }
    else if (p[1] === 'rect') tx.fillRect(Math.round(p[2] / TC), Math.round((p[3] - Z0) / TC), Math.round((p[4] - p[2]) / TC), Math.round((p[5] - p[3]) / TC));
    else { tx.lineCap = p[4] ? 'butt' : 'round'; line(p[2], p[3]); tx.lineCap = 'round'; }
  }
  const road = tx.getImageData(0, 0, TEX, TEXZ).data;
  tm.width = tm.height = 1;
  yield 0.47;
  // colori e motivi del terreno: una cella del rilievo (4 punti di colore) alla volta
  const col = W.col = new Uint8Array(TEX * TEXZ * 4), mat = W.mat = new Uint8Array(TEX * TEXZ * 4), paved = W.road = new Uint8Array(TEX * TEXZ);
  const BC = []; for (let b = 0; b < NB; b++) BC.push([BCH[b * 2], BCH[b * 2 + 1]].map(h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }));
  const c = [0, 0, 0], m = [0, 0, 0, 0], tmp = new Float32Array(NB), act = new Int32Array(NB), aw = new Float32Array(NB);
  for (let cj = 0; cj < NZ; cj++) {
    for (let ci = 0; ci < N; ci++) {
      const k00 = cj * V + ci, h00 = H[k00], h10 = H[k00 + 1], h01 = H[k00 + V], h11 = H[k00 + V + 1];
      if (h00 < -15 && h10 < -15 && h01 < -15 && h11 < -15) {   // mare profondo
        for (let t = 0; t < 4; t++) { const o = ((cj * 2 + (t >> 1)) * TEX + ci * 2 + (t & 1)) * 4; col[o] = 70; col[o + 1] = 110; col[o + 2] = 120; mat[o + 1] = 102; mat[o + 3] = 153; }
        continue;
      }
      if (h00 < -0.5 && h10 < -0.5 && h01 < -0.5 && h11 < -0.5) {   // fondale basso: il colore dipende solo dalla profondità
        for (let t = 0; t < 4; t++) { const u = t & 1 ? 0.75 : 0.25, v = t & 2 ? 0.75 : 0.25, tx2 = ci * 2 + (t & 1), ty = cj * 2 + (t >> 1), o = (ty * TEX + tx2) * 4;
          const h = (h00 * (1 - u) + h10 * u) * (1 - v) + (h01 * (1 - u) + h11 * u) * v, dd = smooth(-0.4, -14, h), vv = 0.94 + vn((tx2 + 0.5) * TC / 23, (Z0 + (ty + 0.5) * TC) / 23) * 0.12;
          col[o] = lerp(196, 70, dd) * vv; col[o + 1] = lerp(180, 110, dd) * vv; col[o + 2] = lerp(128, 120, dd) * vv; mat[o + 1] = 102; mat[o + 3] = 153; }
        continue;
      }
      biomeW((ci + 0.5) * CELL, Z0 + (cj + 0.5) * CELL, tmp);
      let na = 0; for (let b = 0; b < NB; b++) if (tmp[b] >= 0.01) { act[na] = b; aw[na++] = tmp[b]; }
      const wVol = tmp[B.VOLCANO], wDes = tmp[B.DESERT], wSw = tmp[B.SWAMP], wMesa = tmp[B.MESA], wJun = tmp[B.JUNGLE], wAlp = tmp[B.ALP];
      const s00 = SL[k00], s10 = SL[k00 + 1], s01 = SL[k00 + V], s11 = SL[k00 + V + 1], q00 = N1[k00], q10 = N1[k00 + 1], q01 = N1[k00 + V], q11 = N1[k00 + V + 1];
      for (let t = 0; t < 4; t++) {
        const u = t & 1 ? 0.75 : 0.25, v = t & 2 ? 0.75 : 0.25, tx2 = ci * 2 + (t & 1), ty = cj * 2 + (t >> 1), x = (tx2 + 0.5) * TC, z = Z0 + (ty + 0.5) * TC;
        const w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
        const h = h00 * w00 + h10 * w10 + h01 * w01 + h11 * w11, s = s00 * w00 + s10 * w10 + s01 * w01 + s11 * w11, n1 = q00 * w00 + q10 * w10 + q01 * w01 + q11 * w11, n2 = vn(x / 23, z / 23);
        c[0] = c[1] = c[2] = 0; m[0] = m[1] = m[2] = m[3] = 0; let em = 0;
        const tt = Math.max(0, Math.min(1, n1 * 1.6 - 0.3 + (n2 - 0.5) * 0.3));
        for (let a = 0; a < na; a++) {
          const b = act[a], wb = aw[a], p = BC[b];
          let cr = p[0][0] + (p[1][0] - p[0][0]) * tt, cg = p[0][1] + (p[1][1] - p[0][1]) * tt, cb = p[0][2] + (p[1][2] - p[0][2]) * tt;
          if (b === B.FARM) { const fx2 = Math.floor((x * 0.8 + z * 0.3) / 70), fz2 = Math.floor((z * 0.8 - x * 0.3) / 46), kind = PERM[(fx2 & 255) + PERM[fz2 & 255]] % 3, stripe = Math.floor((x * 0.8 + z * 0.3) / 5) % 2;
            const FC = [[217, 180, 74], [124, 194, 78], [138, 90, 52]][kind]; cr = FC[0] * (stripe ? 0.88 : 1); cg = FC[1] * (stripe ? 0.88 : 1); cb = FC[2] * (stripe ? 0.88 : 1); }
          else if (b === B.MOUNT) { if (h < 90) { const g = smooth(90, 45, h); cr = lerp(cr, 96, g); cg = lerp(cg, 150, g); cb = lerp(cb, 70, g); } }
          else if (b === B.DESERT) { const rp = Math.sin(x * 0.35 + z * 0.12 + n1 * 9) > 0.7 ? 0.92 : 1; cr *= rp; cg *= rp; cb *= rp; }
          else if (b === B.SWAMP) { if (n2 > 0.66) { cr = 90; cg = 74; cb = 50; } }
          else if (b === B.VOLCANO) { const dv = Math.hypot(x - VOLC[0], z - VOLC[1]); if (dv < 105 && h < 150) em = Math.max(em, smooth(105, 70, dv)); else if (dv < 600) { const crack = Math.abs(fbm(x / 60, z / 60, 3) - 0.5); if (crack < 0.035 && h > 40) em = Math.max(em, 0.85 * (1 - crack / 0.035) * smooth(0.3, 0.65, wb)); } }
          else if (b === B.AUTUMN) { if (n2 > 0.68) { cr = 196; cg = 104; cb = 44; } else if (n2 < 0.22) { cr = 150; cg = 60; cb = 40; } }
          else if (b === B.SAVANNA) { if (n2 > 0.74) { cr = 176; cg = 140; cb = 84; } }
          else if (b === B.MESA) { const bd = Math.floor((h + n1 * 14) / 7) % 3; if (bd === 1) { cr *= 0.86; cg *= 0.84; cb *= 0.86; } else if (bd === 2) { cr = lerp(cr, 236, 0.35); cg = lerp(cg, 190, 0.35); cb = lerp(cb, 140, 0.35); } }
          else if (b === B.JUNGLE) { if (n2 > 0.7) { cr *= 0.78; cg *= 0.8; cb *= 0.78; } }
          else if (b === B.BLOSSOM) { if (vn(x / 6, z / 6) > 0.8) { cr = 250; cg = 176; cb = 204; } }
          // colline: chiazze di grano dorato a righe, e prati più gialli dove crescono i girasoli
          else if (b === B.HILLS) { if (n1 > 0.55) { const k = smooth(0.55, 0.6, n1), st = Math.floor((x * 0.8 + z * 0.3) / 5) % 2 ? 0.9 : 1; cr = lerp(cr, 226 * st, k); cg = lerp(cg, 190 * st, k); cb = lerp(cb, 86 * st, k); } else if (n1 < 0.45 && n2 > 0.6) { const k = 0.6 * smooth(0.6, 0.68, n2); cr = lerp(cr, 206, k); cg = lerp(cg, 196, k); cb = lerp(cb, 66, k); } }
          else if (b === B.ALP) { const g = smooth(400, 520, h + (n1 - 0.5) * 70); cr = lerp(cr, 134, g); cg = lerp(cg, 130, g); cb = lerp(cb, 124, g); if (g < 0.5 && n2 > 0.8) { cr *= 0.86; cg *= 0.9; cb *= 0.84; } }
          else if (b === B.MOOR) { if (n2 > 0.62) { cr = 124; cg = 76; cb = 124; } else if (n2 < 0.2) { cr = 66; cg = 70; cb = 60; } }
          c[0] += cr * wb; c[1] += cg * wb; c[2] += cb * wb;
          const bm = BM[b]; m[0] += bm[0] * wb; m[1] += bm[1] * wb; m[2] += bm[2] * wb; m[3] += bm[3] * wb;
        }
        // neve in alto, roccia sui pendii, sabbia in riva, fondali sott'acqua
        const snow = smooth(165 + 365 * wAlp, 205 + 395 * wAlp, h + (n1 - 0.5) * (50 + 40 * wAlp)) * (1 - wVol) * (1 - wDes) * (1 - wMesa) * (1 - wJun);
        if (snow > 0) { c[0] = lerp(c[0], 238, snow); c[1] = lerp(c[1], 244, snow); c[2] = lerp(c[2], 251, snow); m[0] *= 1 - snow; m[1] *= 1 - snow; m[2] *= 1 - snow; m[3] = m[3] * (1 - snow) + snow; }
        const rk = smooth(0.62, 1.0, s) * (1 - snow * 0.6);
        if (rk > 0) {
          // la roccia delle Terre Rosse è a strati rossi e chiari
          let r0 = 122, r1 = 114, r2 = 104;
          if (wMesa > 0.05) { const bd = Math.floor((h + n1 * 10) / 6) % 4, K = [[178, 86, 54], [204, 112, 66], [150, 70, 50], [226, 164, 110]][bd]; r0 = lerp(r0, K[0], wMesa); r1 = lerp(r1, K[1], wMesa); r2 = lerp(r2, K[2], wMesa); }
          c[0] = lerp(c[0], r0, rk); c[1] = lerp(c[1], r1, rk); c[2] = lerp(c[2], r2, rk); for (let q = 0; q < 4; q++) m[q] *= 1 - rk; m[2] += rk;
        }
        if (h < 4.5 && h > -2.5 && wSw < 0.4) { const sd = smooth(4.5, 1.5, h); c[0] = lerp(c[0], 232, sd); c[1] = lerp(c[1], 212, sd); c[2] = lerp(c[2], 152, sd); for (let q = 0; q < 4; q++) m[q] *= 1 - sd; m[1] += sd * 0.7; m[3] += sd * 0.3; }
        if (h < -0.4) { const dd = smooth(-0.4, -14, h); c[0] = lerp(196, 70, dd); c[1] = lerp(180, 110, dd); c[2] = lerp(128, 120, dd); m[0] = 0; m[1] = 0.4; m[2] = 0; m[3] = 0.6; }
        if (x < 2300 && x > 1900 && z < 1700 && z > 1300 && segDist(x, z, STONES) < 5.5 && h > -2) { c[0] = 226; c[1] = 232; c[2] = 224; m[0] = 0; m[1] = 0; m[2] = 1; m[3] = 0; }
        // strade, piazze, pavimenti
        const ti = ty * TEX + tx2, ri = ti * 4, rr = road[ri] / 255, rg = road[ri + 1] / 255, rb = road[ri + 2] / 255;
        if (rr > 0) { c[0] = lerp(c[0], 168, rr); c[1] = lerp(c[1], 128, rr); c[2] = lerp(c[2], 84, rr); for (let q = 0; q < 4; q++) m[q] *= 1 - rr; m[1] += rr * 0.75; m[2] += rr * 0.25; }
        if (rg > 0) { const kk = ((tx2 >> 1) + (ty >> 1)) & 1 ? 1 : 0.93; c[0] = lerp(c[0], 160 * kk, rg); c[1] = lerp(c[1], 156 * kk, rg); c[2] = lerp(c[2], 150 * kk, rg); for (let q = 0; q < 4; q++) m[q] *= 1 - rg; m[2] += rg; }
        if (rb > 0) { const kk = ((tx2 >> 1) + (ty >> 1)) & 1 ? 1 : 0.94 - 0.05 * wAlp; c[0] = lerp(c[0], lerp(214, 232, wAlp) * kk, rb); c[1] = lerp(c[1], lerp(186, 232, wAlp) * kk, rb); c[2] = lerp(c[2], lerp(126, 238, wAlp) * kk, rb); for (let q = 0; q < 4; q++) m[q] *= 1 - rb; m[2] += rb; }
        paved[ti] = Math.max(road[ri], road[ri + 1], road[ri + 2]);
        em *= 1 - Math.min(1, rr + rg + rb);
        const o = ri, vv = 0.94 + n2 * 0.12;
        col[o] = Math.min(255, c[0] * vv); col[o + 1] = Math.min(255, c[1] * vv); col[o + 2] = Math.min(255, c[2] * vv); col[o + 3] = em * 255;
        if (em > 0) { col[o] = 255; col[o + 1] = 90 + em * 60; col[o + 2] = 20; }
        const ms = m[0] + m[1] + m[2] + m[3] || 1;
        mat[o] = m[0] / ms * 255; mat[o + 1] = m[1] / ms * 255; mat[o + 2] = m[2] / ms * 255; mat[o + 3] = m[3] / ms * 255;
      }
    }
    if (cj % 32 === 0) yield 0.47 + 0.33 * cj / NZ;
  }
  // immagine della mappa (512x512) con rilievo e acqua
  const MS = 512, MSZ = MS * WSZ / WS, mi = SG.art.mk(MS, MSZ), mx = mi.getContext('2d'), md = mx.createImageData(MS, MSZ);
  for (let y = 0; y < MSZ; y++) for (let x = 0; x < MS; x++) {
    const o = (y * MS + x) * 4, t = ((y * 4 + 2) * TEX + x * 4 + 2) * 4, i = Math.min(N, x * 2 + 1), j = Math.min(NZ, y * 2 + 1), h = H[j * V + i], sh = SH[j * V + i];
    if (h < -0.6) { const dd = smooth(0, -20, h); md.data[o] = lerp(86, 40, dd); md.data[o + 1] = lerp(150, 90, dd); md.data[o + 2] = lerp(210, 170, dd); }
    else { md.data[o] = Math.min(255, col[t] * (0.55 + sh * 0.5)); md.data[o + 1] = Math.min(255, col[t + 1] * (0.55 + sh * 0.5)); md.data[o + 2] = Math.min(255, col[t + 2] * (0.55 + sh * 0.5)); }
    md.data[o + 3] = 255;
  }
  mx.putImageData(md, 0, 0); W.mapImg = mi;
  yield 0.82;
  // edifici e collisioni
  W.colliders = new Array(GN * GNZ); W.boxGrid = new Array(BGN * BGNZ); W.boxes = []; W.mesh = []; W.lights = []; W.sites = []; W.glows = []; W.smokes = [];
  for (const p of buildMeshes()) yield 0.82 + 0.06 * p;
  // oggetti messi a mano e sparsi
  for (const p of placeObjects(sprites)) yield 0.88 + 0.08 * p;
  // ombre di alberi ed edifici dipinte sul terreno
  if (W.bakeShadows) W.bakeShadows();
  yield 0.97;
}
function W_groundRaw(H, x, z) { const i = Math.round(x / CELL), j = Math.round((z - Z0) / CELL); return H[Math.max(0, Math.min(NZ, j)) * V + Math.max(0, Math.min(N, i))]; }

// ---------- geometria degli edifici ----------
// vertice: x, y, z, riquadro x, riquadro y, u, v, luce
const SUN = [-0.42, 0.78, 0.46];
function faceLight(nx, ny, nz) { const l = Math.hypot(...SUN); return Math.max(0.5, Math.min(0.98, 0.5 + 0.55 * Math.max(0, (nx * SUN[0] + ny * SUN[1] + nz * SUN[2]) / l))); }
function quad(p0, p1, p2, p3, tile, uLen, vLen, light) {
  const tx = tile % 8, ty = Math.floor(tile / 8);
  const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2], bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
  const sh = light !== undefined ? light : faceLight(nx, ny, nz);
  W.mesh.push(p0[0], p0[1], p0[2], tx, ty, 0, vLen, sh, p1[0], p1[1], p1[2], tx, ty, uLen, vLen, sh, p2[0], p2[1], p2[2], tx, ty, uLen, 0, sh, p3[0], p3[1], p3[2], tx, ty, 0, 0, sh);
}
const T8 = 8;
function walls(x0, z0, x1, z1, y0, y1, tile) {
  const L = (a, b) => Math.max(1, Math.round(a / T8 * 2) / 2);
  quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], tile, L(x1 - x0), (y1 - y0) / T8);
  quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], tile, L(x1 - x0), (y1 - y0) / T8);
  quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], tile, L(z1 - z0), (y1 - y0) / T8);
  quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], tile, L(z1 - z0), (y1 - y0) / T8);
}
function boxTop(x0, z0, x1, z1, y, tile) { quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], tile, Math.max(1, (x1 - x0) / T8), Math.max(1, (z1 - z0) / T8)); }
function box(x0, z0, x1, z1, y0, y1, tile, top = tile) { walls(x0, z0, x1, z1, y0, y1, tile); boxTop(x0, z0, x1, z1, y1, top); }
function gable(x0, z0, x1, z1, y, rh, roof, wall, o = 1.6) {
  const alongX = (x1 - x0) >= (z1 - z0);
  if (alongX) {
    const zm = (z0 + z1) / 2, sl = Math.hypot((z1 - z0) / 2 + o, rh) / T8, ln = (x1 - x0 + 2 * o) / T8;
    quad([x0 - o, y - 0.8, z1 + o], [x1 + o, y - 0.8, z1 + o], [x1 + o, y + rh, zm], [x0 - o, y + rh, zm], roof, ln, sl);
    quad([x1 + o, y - 0.8, z0 - o], [x0 - o, y - 0.8, z0 - o], [x0 - o, y + rh, zm], [x1 + o, y + rh, zm], roof, ln, sl);
    quad([x1, y, z1], [x1, y, z0], [x1, y + rh, zm], [x1, y + rh, zm], wall, (z1 - z0) / T8, rh / T8);
    quad([x0, y, z0], [x0, y, z1], [x0, y + rh, zm], [x0, y + rh, zm], wall, (z1 - z0) / T8, rh / T8);
  } else {
    const xm = (x0 + x1) / 2, sl = Math.hypot((x1 - x0) / 2 + o, rh) / T8, ln = (z1 - z0 + 2 * o) / T8;
    quad([x1 + o, y - 0.8, z1 + o], [x1 + o, y - 0.8, z0 - o], [xm, y + rh, z0 - o], [xm, y + rh, z1 + o], roof, ln, sl);
    quad([x0 - o, y - 0.8, z0 - o], [x0 - o, y - 0.8, z1 + o], [xm, y + rh, z1 + o], [xm, y + rh, z0 - o], roof, ln, sl);
    quad([x0, y, z1], [x1, y, z1], [xm, y + rh, z1], [xm, y + rh, z1], wall, (x1 - x0) / T8, rh / T8);
    quad([x1, y, z0], [x0, y, z0], [xm, y + rh, z0], [xm, y + rh, z0], wall, (x1 - x0) / T8, rh / T8);
  }
}
// porta, finestra, insegna: un riquadro appena staccato dal muro. glow: di notte si accende
function onWall(side, x0, z0, x1, z1, c, y0, w, h, tile, glow, e = 0.18) {
  const a = c - w / 2, b = c + w / 2, n0 = W.mesh.length;
  if (side === 's') quad([a, y0, z1 + e], [b, y0, z1 + e], [b, y0 + h, z1 + e], [a, y0 + h, z1 + e], tile, 1, 1);
  if (side === 'n') quad([b, y0, z0 - e], [a, y0, z0 - e], [a, y0 + h, z0 - e], [b, y0 + h, z0 - e], tile, 1, 1);
  if (side === 'e') quad([x1 + e, y0, b], [x1 + e, y0, a], [x1 + e, y0 + h, a], [x1 + e, y0 + h, b], tile, 1, 1);
  if (side === 'w') quad([x0 - e, y0, a], [x0 - e, y0, b], [x0 - e, y0 + h, b], [x0 - e, y0 + h, a], tile, 1, 1);
  // segno «decalcomania»: nello shader si stacca dal muro anche da lontano (niente sfarfallio con i mattoni dietro)
  // glow: di notte la finestra si accende (non tutte: sette su dieci); glow 2: vetrata colorata
  const lit = glow === 2 ? 6 : glow && ((Math.round(c * 13.7 + y0 * 7.3 + (x0 + z1) * 3.1) % 10) + 10) % 10 < 7 ? 4 : 2;
  for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] += lit;
}
// poggio di roccia: quattro anelli di punti un po' storti e una cupola in cima; il lato della porta è una parete dritta
function crag(b, g) {
  const R = rng(Math.round(b.x * 13 + b.z * 7)), N = 12, rx = b.w / 2, rz = b.d / 2, cx = b.x, cz = b.z, TAU2 = Math.PI * 2;
  const dv = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[b.door] || [0, 1];
  let lo = Infinity, hi = -Infinity; for (let i = 0; i < N; i++) { const a = i / N * TAU2, h = g(cx + Math.cos(a) * rx, cz + Math.sin(a) * rz); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  const H = b.h, se = v => Math.sign(v) * Math.pow(Math.abs(v), 0.6), jit = []; for (let i = 0; i < N; i++) jit.push(0.86 + R() * 0.14);
  const P = [[1, lo - 4], [0.95, hi + H * 0.72], [0.72, hi + H * 1.0], [0.38, hi + H * 1.2]].map(([k, y], ri) => {
    const out = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU2, ca = Math.cos(a), sa = Math.sin(a), j = ri === 3 ? 1 : jit[i];
      let x = cx + se(ca) * rx * k * j, z = cz + se(sa) * rz * k * j;
      if (ri < 2 && ca * dv[0] + sa * dv[1] > 0.6) { if (dv[0]) x = cx + dv[0] * rx; else z = cz + dv[1] * rz; }
      out.push([x, y + (ri > 0 ? (R() - 0.5) * 1.6 : 0), z]);
    }
    return out;
  });
  for (let r = 0; r < 3; r++) for (let i = 0; i < N; i++) {
    const i1 = (i + 1) % N, a = P[r][i], c1 = P[r][i1], up = P[r + 1][i], up1 = P[r + 1][i1];
    quad(c1, a, up, up1, 56, Math.max(1, Math.round(Math.hypot(a[0] - c1[0], a[2] - c1[2]) / 8)), Math.max(1, Math.round((up[1] - a[1]) / 8)));
  }
  const tp = [cx, hi + H * 1.32, cz];
  for (let i = 0; i < N; i++) { const i1 = (i + 1) % N; quad(P[3][i1], P[3][i], tp, tp, 56, 1, 1); }
  return tp[1];
}
function prism(cx, cz, r, y0, y1, tile, sides = 8, cap, roof = 4) {
  for (let k = 0; k < sides; k++) {
    const a0 = k / sides * Math.PI * 2, a1 = (k + 1) / sides * Math.PI * 2, p = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], q = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
    quad([q[0], y0, q[1]], [p[0], y0, p[1]], [p[0], y1, p[1]], [q[0], y1, q[1]], tile, Math.max(1, Math.round(2 * Math.PI * r / sides / T8)), (y1 - y0) / T8);
  }
  if (cap === 'cone') for (let k = 0; k < sides; k++) { const a0 = k / sides * Math.PI * 2, a1 = (k + 1) / sides * Math.PI * 2, R = r + 2; quad([cx + Math.cos(a1) * R, y1 - 0.5, cz + Math.sin(a1) * R], [cx + Math.cos(a0) * R, y1 - 0.5, cz + Math.sin(a0) * R], [cx, y1 + r * 1.6, cz], [cx, y1 + r * 1.6, cz], roof, 2, 2); }
}
function crenels(x0, z0, x1, z1, y, tile) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.floor(L / 7)), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
  for (let k = 0; k <= n; k += 2) { const cx = x0 + dx * (k * L / n), cz = z0 + dz * (k * L / n); box(cx - 1.8, cz - 1.8, cx + 1.8, cz + 1.8, y, y + 3.2, tile); }
}
W.kit = { quad, walls, box, boxTop, gable, onWall, prism, crenels, crag, faceLight, T8, mesh: () => W.mesh };
// i pezzi vicini finiscono nello stesso «cantiere»: si disegnano solo quelli in vista
function* buildMeshes() {
  const g = W.ground, solo = { city: 1, citadel: 1, bridge: 1, fort: 1 };
  const order = BUILD.map((b, i) => [solo[b.k] ? 1e7 + i : Math.floor(b.x / 384) * 100 + Math.floor(b.z / 384), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let key = null, q0 = 0;
  const close = () => {
    const n = W.mesh.length / 32 - q0; if (n <= 0) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = q0 * 32; i < W.mesh.length; i += 8) { const x = W.mesh[i], y = W.mesh[i + 1], z = W.mesh[i + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z; }
    W.sites.push({ q0, n, x0, x1, y0, y1, z0, z1, x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: Math.hypot(x1 - x0, z1 - z0) / 2 });
    q0 = W.mesh.length / 32;
  };
  let done = 0;
  for (const [k, bi] of order) {
    const b = BUILD[bi];
    if (k !== key) { close(); key = k; }
    if (W.builders[b.k]) { W.builders[b.k](b, g); if (solo[b.k]) yield ++done / 12; continue; }
    if (b.k === 'temple') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
      let y0 = Infinity; for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [b.x, b.z]]) y0 = Math.min(y0, g(x, z));
      const base = y0 - 3, top = y0 + b.h;
      box(x0, z0, x1, z1, base, top, b.wall); crenels(x0, z0, x1, z0, top, b.wall); crenels(x0, z1, x1, z1, top, b.wall);
      box(x0 + 3, z0 + 3, x1 - 3, z1 - 3, top, top + 5, b.wall);
      const c = (b.door === 'n' || b.door === 's') ? b.x : b.z; onWall(b.door, x0, z0, x1, z1, c, y0, 8, 10, 12);
      W.lights.push({ x: b.x, z: b.door === 's' ? z1 + 2 : b.door === 'n' ? z0 - 2 : b.z, id: b.id });
      W.addBox(x0, z0, x1, z1, top, b);
    } else if (b.k === 'stall') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y0 = g(b.x, b.z);
      box(x0, z0 + 2, x1, z1 - 3, y0 - 2, y0 + 3.4, 3);
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) box(px - 0.5, pz - 0.5, px + 0.5, pz + 0.5, y0 - 1, y0 + b.h, 3);
      quad([x0 - 1, y0 + b.h - 1.5, z1 + 1.5], [x1 + 1, y0 + b.h - 1.5, z1 + 1.5], [x1 + 1, y0 + b.h + 1.5, z0 - 1], [x0 - 1, y0 + b.h + 1.5, z0 - 1], b.cloth || 13, 2, 1);
      W.addBox(x0, z0 + 1, x1, z1 - 2, y0 + 3.4, b);
    } else if (b.k === 'ruin') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, R = rng(Math.round(b.x * 7 + b.z));
      const along = b.w > b.d, L = along ? b.w : b.d, n = Math.ceil(L / 8);
      for (let k2 = 0; k2 < n; k2++) {
        const hh = b.h * (0.35 + 0.65 * R()), a0 = (along ? x0 : z0) + k2 * L / n, a1 = a0 + L / n - 0.01;
        const y0 = g(along ? (a0 + a1) / 2 : b.x, along ? b.z : (a0 + a1) / 2) - 3;
        if (R() < 0.18 || (b.gate && Math.abs(k2 - (n - 1) / 2) < 1)) continue;
        if (along) box(a0, z0, a1, z1, y0, y0 + 3 + hh, b.wall); else box(x0, a0, x1, a1, y0, y0 + 3 + hh, b.wall);
        if (along) W.addBox(a0, z0, a1, z1, y0 + 3 + hh, b); else W.addBox(x0, a0, x1, a1, y0 + 3 + hh, b);
      }
    } else if (b.k === 'cave') {
      // un poggio di roccia dalla forma irregolare, con una parete dritta dove si apre la grotta
      const top = crag(b, g), x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
      const dx = b.door === 'e' ? x1 + 2 : b.door === 'w' ? x0 - 2 : b.x, dz = b.door === 's' ? z1 + 2 : b.door === 'n' ? z0 - 2 : b.z, gy = g(dx, dz);
      onWall(b.door, x0, z0, x1, z1, (b.door === 'n' || b.door === 's') ? b.x : b.z, gy - 0.6, 7.5, 7.6, 48);
      W.lights.push({ x: dx, z: dz, id: b.id, cave: true });
      W.addBox(x0 + 1, z0 + 1, x1 - 1, z1 - 1, top, b);
    } else if (b.k === 'tower') {
      const y0 = g(b.x, b.z) - 2; prism(b.x, b.z, b.r, y0, y0 + b.h, b.wall, 8, 'cone', b.roof || 4);
      onWall('s', b.x - 3, b.z - b.r, b.x + 3, b.z + b.r * 0.92, b.x, y0 + 2, 5, 8, 7);
      W.lights.push({ x: b.x, z: b.z, y: y0 + b.h - 4, beacon: true });
      W.glows.push([b.x, y0 + b.h - 4, b.z, 7, 1, 0.85, 0.5, 1]);
      W.addBox(b.x - b.r, b.z - b.r, b.x + b.r, b.z + b.r, y0 + b.h, b);
    }
  }
  close();
}

// ---------- oggetti: alberi, rocce, fiori... ----------
// ogni oggetto sono 7 numeri nel pezzo di mondo a cui appartiene: x, y, z, scala, disegno, luce, vento
const RL = [];
function* placeObjects(S) {
  const OB = W.OB = new Array(CH * CHZ), TAU2 = Math.PI * 2, isOld = (x, z) => x < OLD && z < OLD && z >= 0;
  let R = rng(4242);
  W.nObjs = 0;
  const add = (key, x, z, o = {}) => {
    const sp = S[key]; if (!sp) return;
    const y = o.y !== undefined ? o.y : W.ground(x, z), rect = sp.r[Math.floor(R() * sp.r.length)];
    if (rect._i === undefined) { rect._i = RL.length; RL.push(rect); }
    const ci = Math.max(0, Math.min(CH - 1, Math.floor(x / CS))), cj = Math.max(0, Math.min(CHZ - 1, Math.floor((z - Z0) / CS))), L = OB[cj * CH + ci] || (OB[cj * CH + ci] = { big: [], small: [] });
    (o.small || sp.small ? L.small : L.big).push(x, y - (o.sink || 0.4), z, o.s || sp.s, rect._i, sp.lit || 1, sp.sway || 0);
    if (sp.glow) W.glows.push([x, y + sp.glow[0], z, sp.glow[1], sp.glow[2], sp.glow[3], sp.glow[4], 0]);
    if (o.r || sp.col) W.addCircle(x, z, o.r || sp.col);
    W.nObjs++;
  };
  W.addObj = add;
  const busy = (x, z, m) => {
    for (const f of FLAT.slice(0, 4)) if (Math.hypot(x - f[0], z - f[1]) < f[2] * 0.85 + m) return true;
    for (const c of CLEAR) if (x > c[0] - m && x < c[2] + m && z > c[1] - m && z < c[3] + m) return true;
    for (const n of NOOKS) if (Math.abs(x - n[0]) < 17 && Math.hypot(x - n[0], z - n[1]) < 17) return true;
    for (const b of BUILD) if (b.k === 'cave' && Math.abs(x - b.x) < 30 && Math.hypot(x - b.x, z - b.z) < 30) return true;
    return !!W.inBox(x, z, m + 4);
  };
  // un nascondiglio: chi passa sulla strada non vede il forziere
  const NK = {
    cespugli: { ring: ['bush', 7, 6.5], back: [['oak', 2, 13]], deco: ['flower', 'tuft'] },
    bosco: { ring: ['bush', 6, 6.5], back: [['oakbig', 3, 14]], deco: ['mushroom', 'fern'] },
    rocce: { ring: ['rock', 5, 8, true], back: [['pine', 2, 14]], deco: ['tuft'] },
    neve: { ring: ['rocksnow', 5, 8, true], back: [['snowpine', 3, 14]], deco: [] },
    sabbia: { ring: ['sandrock', 4, 8, true], back: [['cactus', 1, 13], ['drybush', 3, 6]], deco: ['bones'] },
    solis: { ring: ['rock', 4, 8, true], back: [['cipresso', 1, 13], ['bush', 3, 6]], deco: ['flower'] },   // (stessi numeri di «sabbia»: la sequenza non si sposta)
    palude: { ring: ['reeds', 7, 6], back: [['willow', 3, 13]], deco: ['mushroom'] },
    brace: { ring: ['lavarock', 5, 8, true], back: [['burnt', 2, 14]], deco: ['bones'] },
    ambra: { ring: ['bushred', 7, 6.5], back: [['oakred', 3, 14]], deco: ['mushroom', 'fern'] },
    rosse: { ring: ['mesarock', 5, 8, true], back: [['cactus', 2, 13]], deco: ['bones'] },
    selva: { ring: ['fernbig', 7, 6.5], back: [['jungle', 3, 14]], deco: ['flower', 'fern'] },
    ciliegi: { ring: ['bush', 7, 6.5], back: [['cherry', 3, 14]], deco: ['flower', 'flower'] },
    brughiera: { ring: ['tomb', 5, 7.5, true], back: [['deadtree', 3, 14]], deco: ['heather'] },
  };
  const nook = ([nx, nz, st, ang]) => {
    const S2 = NK[st], open = ang !== undefined ? ang : Math.atan2(2400 - nz, 2048 - nx), [rk, rn, rr, solid] = S2.ring, slots = solid ? 7 : rn;
    for (let i = 0, put = 0; i < slots && put < rn; i++) {
      const a = open + Math.PI / slots + i / slots * TAU2;
      if (solid && Math.abs(Math.atan2(Math.sin(a - open), Math.cos(a - open))) < 0.75) continue;   // lascia un varco
      add(rk, nx + Math.cos(a) * (rr + (R() - 0.5)), nz + Math.sin(a) * (rr + (R() - 0.5)), rk === 'reeds' ? { small: true } : {}); put++;
    }
    for (const [bk, bn, br] of S2.back) for (let i = 0; i < bn; i++) { const a = open + Math.PI + (i - (bn - 1) / 2) * 0.75 + (R() - 0.5) * 0.2; add(bk, nx + Math.cos(a) * br, nz + Math.sin(a) * br); }
    for (const dk of S2.deco) for (let i = 0; i < 3; i++) { const a = R() * TAU2, r = 3 + R() * 4; add(dk, nx + Math.cos(a) * r, nz + Math.sin(a) * r, { small: true }); }
  };
  // massi e alberi attorno agli imbocchi delle grotte (il davanti resta libero)
  const caveRing = b => {
    const fw = b.door === 's' ? Math.PI / 2 : b.door === 'n' ? -Math.PI / 2 : b.door === 'e' ? 0 : Math.PI, bio = W.biomeAt(b.x, b.z);
    const rk = bio === B.SNOW ? 'rocksnow' : bio === B.DESERT ? 'sandrock' : bio === B.VOLCANO ? 'lavarock' : bio === B.MESA ? 'mesarock' : 'rock', tr = bio === B.SNOW ? 'snowpine' : bio === B.MOUNT ? 'pine' : bio === B.FOREST ? 'oakbig' : bio === B.MEADOW ? 'palm' : bio === B.AUTUMN ? 'oakred' : bio === B.JUNGLE ? 'jungle' : 'oak';
    for (let i = 0; i < 9; i++) { const a = fw + 0.9 + i / 8 * (TAU2 - 1.8), r = Math.max(b.w, b.d) * 0.55 + 4 + R() * 4; add(i % 3 === 1 ? tr : rk, b.x + Math.cos(a) * r, b.z + Math.sin(a) * r); }
    for (const sd of [-1, 1]) { const a = fw + sd * 0.62, r = Math.max(b.w, b.d) * 0.62 + 6; add(bio === B.SNOW ? 'snowpine' : 'bush', b.x + Math.cos(a) * r, b.z + Math.sin(a) * r); }
  };
  const prop = ([k, x, z, o]) => {
    if (k === 'ore') return;   // i minerali si raccolgono: li disegna il gioco
    if (k === 'giant') add('giant', x, z, { r: 15, sink: 2 });
    else if (k === 'well') add('well', x, z, { r: 6 });
    else if (k === 'anvil') add('anvil', x, z, { r: 2 });
    else if (k === 'menhir') add('menhir', x, z, { r: 3 });
    else if (k === 'statue') add('statue', x, z, { r: 4 });
    else add(k, x, z, Object.assign({ r: k === 'tent' ? 9 : k === 'sign' ? 1.2 : k === 'snowman' ? 3.5 : k === 'campfire' ? 2 : S[k] && S[k].col ? S[k].col : S[k] && S[k].small ? 0 : 1 }, o || {}));
  };
  const TBL = {
    [B.MEADOW]: [[0.012, 'oak'], [0.02, 'birch'], [0.034, 'bush'], [0.11, 'flower', 1], [0.16, 'tuft', 1], [0.168, 'rock']],
    [B.FARM]: [[0.004, 'oak'], [0.012, 'bush'], [0.03, 'flower', 1], [0.07, 'tuft', 1]],
    [B.FOREST]: [[0.24, 'oakbig'], [0.3, 'birch'], [0.36, 'bush'], [0.39, 'mushroom', 1], [0.46, 'tuft', 1], [0.475, 'rock'], [0.49, 'fern', 1]],
    [B.MOUNT]: [[0.03, 'pine'], [0.09, 'rock'], [0.11, 'tuft', 1]],
    [B.SNOW]: [[0.1, 'snowpine'], [0.13, 'rocksnow'], [0.15, 'icecrystal']],
    [B.DESERT]: [[0.012, 'cactus'], [0.025, 'drybush'], [0.035, 'sandrock'], [0.039, 'bones', 1]],
    [B.SWAMP]: [[0.06, 'deadtree'], [0.1, 'willow'], [0.16, 'reeds', 1], [0.2, 'mushroom', 1], [0.22, 'bush']],
    [B.VOLCANO]: [[0.025, 'burnt'], [0.06, 'lavarock'], [0.065, 'bones', 1]],
    [B.AUTUMN]: [[0.11, 'oakred'], [0.19, 'oakgold'], [0.23, 'birchgold'], [0.28, 'bushred'], [0.32, 'mushroom', 1], [0.42, 'leaves', 1], [0.44, 'rock'], [0.47, 'fern', 1]],
    [B.SAVANNA]: [[0.009, 'acacia'], [0.02, 'drybush'], [0.16, 'tuftgold', 1], [0.17, 'rock'], [0.18, 'flower', 1]],
    [B.MESA]: [[0.014, 'cactus'], [0.03, 'mesarock'], [0.045, 'drybush'], [0.05, 'bones', 1], [0.056, 'spire']],
    [B.JUNGLE]: [[0.15, 'jungle'], [0.24, 'palm'], [0.33, 'fernbig'], [0.4, 'fern', 1], [0.44, 'flower', 1], [0.46, 'bush'], [0.47, 'rock']],
    [B.BLOSSOM]: [[0.035, 'cherry'], [0.05, 'cherrywhite'], [0.062, 'bush'], [0.2, 'flower', 1], [0.27, 'tuft', 1], [0.276, 'rock']],
    [B.MOOR]: [[0.02, 'deadtree'], [0.03, 'willow'], [0.14, 'heather', 1], [0.16, 'rock'], [0.175, 'tomb'], [0.19, 'tuft', 1]],
    [B.HILLS]: [[0.012, 'cipresso'], [0.021, 'ulivo'], [0.03, 'bush'], [0.085, 'flower', 1], [0.14, 'tuft', 1], [0.146, 'rock']],
    [B.ALP]: [[0.06, 'pine'], [0.088, 'rock'], [0.098, 'rocksnow'], [0.14, 'tuft', 1], [0.185, 'flower', 1]],
  };
  const scatter = (gx0, gz0, gx1, gz1, skipOld) => {
    const step = 12;
    for (let gz = gz0 + step / 2; gz < gz1; gz += step) for (let gx = gx0 + step / 2; gx < gx1; gx += step) {
      if (skipOld && gx < OLD && gz < OLD) continue;
      const x = gx + (R() - 0.5) * step, z = gz + (R() - 0.5) * step, r = R();
      if (r > 0.5) continue;
      const h = W.ground(x, z); if (h < WL + 0.8) { if (h > -1.5 && r < 0.05 && W.biomeAt(x, z) === B.SWAMP) add('reeds', x, z, { small: true }); continue; }
      const sl = W.slope(x, z), b = W.biomeAt(x, z);
      if (W.roadAt(x, z) > 0.05 || busy(x, z, 6)) continue;
      if (W.col[(Math.max(0, Math.min(TEXZ - 1, Math.floor((z - Z0) / TC))) * TEX + Math.min(TEX - 1, Math.floor(x / TC))) * 4 + 3] > 20) continue;
      let pick = null;
      for (const e of TBL[b]) if (r < e[0]) { pick = e; break; }
      if (b === B.HILLS) { const f = fbm(x / 210, z / 210, 3); if (f < 0.45 && r >= 0.03 && r < 0.4) pick = [0, 'girasole', 1]; else if (f > 0.56 && pick && pick[2]) pick = null; }   // i campi di girasoli; nel grano niente erbacce
      if (!pick) continue;
      if (sl > 0.75 && pick[1] !== 'rock' && pick[1] !== 'mesarock') continue;
      // sui grandi monti: boschi di pini nelle valli, più radi salendo, e sopra i nevai soltanto roccia
      if (b === B.ALP) { if (h > 545) { if (pick[1] !== 'rock' && pick[1] !== 'rocksnow') continue; pick = [0, 'rocksnow']; } else if (h > 420) { if (pick[1] === 'pine') { if (r > 0.03) continue; pick = [0, 'snowpine']; } else if (pick[1] === 'flower') continue; } }
      else if (h > 175 && pick[1] === 'pine') pick = [0, 'snowpine'];
      if (Math.abs(x - 2150) < 360 && Math.abs(z - 1340) < 290 && h < 6 && R() < 0.5) pick = [0, 'crystal'];
      if (h < 6 && b === B.MEADOW && z > 3100 && R() < 0.4) pick = [0, 'palm'];
      add(pick[1], x, z, { small: !!pick[2] });
    }
  };
  // prima l'isola di Lumen, con lo stesso ordine di sempre: la sua vegetazione resta dov'era
  for (let i = 0; i < OLDN.nooks; i++) nook(NOOKS[i]);
  for (const b of BUILD) if (b.k === 'cave' && isOld(b.x, b.z)) caveRing(b);
  for (let i = 0; i < OLDN.props; i++) prop(PROPS[i]);
  yield 0.05;
  // a nord della riga 732 il terreno di Lumen è cambiato (i grandi monti, il valico): lì la vegetazione segue una sequenza sua.
  // Da lì in giù la sequenza riparte dal punto esatto di prima (64383 numeri già usati): ogni albero di Lumen resta dov'era
  R = rng(7117); scatter(0, 0, OLD, 732, false);
  // ...tranne dove c'era il Deserto di Solis, ora colline: lì (e a est, fino al mare) la sequenza è un'altra. Perché il resto non si sposti,
  // a ogni riga la sequenza di Lumen riparte dal punto in cui stava prima (SOLR: quanti numeri erano già usati all'inizio di ogni riga, dalla 738 alla 3294)
  { const at = n => rng((4242 + Math.imul(n, 0x6D2B79F5)) >>> 0), RZ = rng(2626);
    const xaOf = gz => { let m = 1e9; for (let j = Math.floor((gz - 140 - Z0) / CG); j <= Math.ceil((gz + 140 - Z0) / CG); j++) for (let i = 0; i < CGV; i++) if (CHGc[j * CGV + i]) { m = Math.min(m, i * CG); break; } return m > 1e8 ? OLD : Math.max(0, Math.min(OLD, Math.floor((m - 140) / 12) * 12)); };
    W.solisX = xaOf;
    let n = SOLR0, gz = 738;
    for (let k = 0; k < SOLR.length; k++, gz += 12) {
      R = at(n); const xa = xaOf(gz);
      scatter(0, gz - 6, xa, gz + 6, false);
      if (xa < OLD) { R = RZ; scatter(xa, gz - 6, OLD, gz + 6, false); }
      n += SOLR[k];
    }
    R = at(n); scatter(0, gz - 6, OLD, OLD, false);   // dalla riga 3294 in giù, tutto di fila come prima
    const RM = R;
    // il viale di cipressi che sale alle rovine
    R = RZ; for (const [ax, az, bx, bz] of [[3200, 2000, 3330, 1740]]) { const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L; for (let t = 34; t < L - 26; t += 26) for (const s of [-1, 1]) { const x = ax + ux * t - uz * s * 10, z = az + uz * t + ux * s * 10; if (W.roadAt(x, z) < 0.05 && !busy(x, z, 3)) add('cipresso', x, z); } }
    R = RM;
  }
  yield 0.3;
  // pietre che affiorano dal lago: il passaggio verso l'isola
  for (let i = 0; i < STONES.length - 1; i++) { const [ax, az] = STONES[i], [bx, bz] = STONES[i + 1], L = Math.hypot(bx - ax, bz - az); for (let t = 0; t < L; t += 11) { const x = ax + (bx - ax) * t / L + (R() - 0.5) * 4, z = az + (bz - az) * t / L + (R() - 0.5) * 4; add('stepstone', x, z, { y: WL + 0.15, sink: 0 }); } }
  // cristalli sulle rive del lago
  for (let k = 0; k < 70; k++) { const a = R() * Math.PI * 2, s = 1.02 + R() * 0.12, x = 2150 + Math.cos(a) * 330 * s, z = 1340 + Math.sin(a) * 250 * s; if (W.ground(x, z) > 0.5 && W.roadAt(x, z) < 0.05) add('crystal', x, z); }
  // palme sulla costa
  const warm = b => b !== B.SNOW && b !== B.MOUNT && b !== B.MOOR && b !== B.AUTUMN && b !== B.HILLS;
  // (nella zona delle colline non c'erano palme e non ce ne sono: la sequenza resta al passo)
  for (let k = 0; k < 900; k++) { const x = 300 + R() * 3500, z = 300 + R() * 3600, h = W.ground(x, z); if (z > 732 && z < 3300 && x >= W.solisX(Math.floor((z - 732) / 12) * 12 + 738)) continue; if (h > 0.8 && h < 4 && coastDist(x, z) < 160 && warm(W.biomeAt(x, z)) && !busy(x, z, 5)) add('palm', x, z); }
  // poi le terre nuove, con un'altra sequenza di numeri
  R = rng(90210);
  const NN = W.NORDN || { nooks: [0, 0], props: [0, 0] };   // le cose dei grandi monti (un tratto degli elenchi) hanno la loro sequenza: le lasciamo per ultime
  for (let i = OLDN.nooks; i < NOOKS.length; i++) if (i < NN.nooks[0] || i >= NN.nooks[1]) nook(NOOKS[i]);
  for (const b of BUILD) if (b.k === 'cave' && !isOld(b.x, b.z) && b.z >= 0) caveRing(b);
  for (let i = OLDN.props; i < PROPS.length; i++) if (i < NN.props[0] || i >= NN.props[1]) prop(PROPS[i]);
  yield 0.35;
  for (let z0 = 0; z0 < WS; z0 += 1024) { scatter(0, z0, WS, z0 + 1024, true); yield 0.35 + 0.6 * (z0 + 1024) / WS; }
  for (let k = 0; k < 3200; k++) { const x = 100 + R() * (WS - 200), z = 100 + R() * (WS - 200); if (x < OLD && z < OLD) continue; const h = W.ground(x, z); if (h > 0.8 && h < 4 && coastDist(x, z) < 160 && warm(W.biomeAt(x, z)) && !busy(x, z, 5)) add('palm', x, z); }
  // infine i grandi monti del nord
  R = rng(31337);
  for (let i = NN.nooks[0]; i < NN.nooks[1]; i++) nook(NOOKS[i]);
  for (const b of BUILD) if (b.k === 'cave' && b.z < 0) caveRing(b);
  for (let i = NN.props[0]; i < NN.props[1]; i++) prop(PROPS[i]);
  scatter(900, Z0, 3960, 0, false);
  for (const k in OB) { const L = OB[k]; L.big = new Float32Array(L.big); L.small = new Float32Array(L.small); }
}

// ---------- caricamento sulla scheda grafica ----------
// il terreno e gli oggetti di ogni pezzo (256x256 unità) si caricano quando servono e si liberano quando sono lontani
const CV = N / CH + 1, scratch = new Float32Array(CV * CV * 6);
W.upload = (G) => {
  const gl = G.gl; W.G = G;
  W.tex = { col: G.texture({ w: TEX, h: TEXZ, data: W.col }, { linear: true }), mat: G.texture({ w: TEX, h: TEXZ, data: W.mat }, { linear: true }) };
  W.mat = null;
  const lod = st => { const out = []; for (let j = 0; j < CV - 1; j += st) for (let i = 0; i < CV - 1; i += st) { const a = j * CV + i, b = a + st, c = a + st * CV, d = c + st; out.push(a, d, b, a, c, d); } return G.buffer(new Uint16Array(out), gl.ELEMENT_ARRAY_BUFFER); };
  W.lod = [1, 2, 4].map(st => ({ buf: lod(st), n: ((CV - 1) / st) ** 2 * 6 }));
  W.chunks = []; W.live = [];
  const H = W.H;
  for (let cj = 0; cj < CHZ; cj++) for (let ci = 0; ci < CH; ci++) {
    let lo = 1e9, hi = -1e9;
    for (let j = 0; j < CV; j++) { const row = (cj * (CV - 1) + j) * V + ci * (CV - 1); for (let i = 0; i < CV; i++) { const h = H[row + i]; if (h < lo) lo = h; if (h > hi) hi = h; } }
    const L = W.OB[cj * CH + ci];
    const ccx = (ci + 0.5) * CS, ccz = Z0 + (cj + 0.5) * CS;
    W.chunks.push({ ci, cj, cx: ccx, cz: ccz, fine: FINE.some(f => ccx > f[0] && ccx < f[2] && ccz > f[1] && ccz < f[3]), lo, hi, buf: null, big: null, small: null, nb: L ? L.big.length / 7 : 0, ns: L ? L.small.length / 7 : 0, used: 0 });
  }
  const m = new Float32Array(W.mesh); W.meshBuf = G.buffer(m); W.meshQuads = m.length / 32; W.mesh = null; if (window.__SG_DEBUG) W.meshDbg = m;
  // acqua: un grande quadrato fino all'orizzonte
  W.waterBuf = G.buffer(new Float32Array([-3000, Z0 - 3000, WS + 3000, Z0 - 3000, WS + 3000, WS + 3000, -3000, WS + 3000]));
};
const quadsOf = list => {
  const n = list.length / 7, f = new Float32Array(n * 44); let p = 0;
  for (let q = 0; q < n; q++) {
    const o = q * 7, x = list[o], y = list[o + 1], z = list[o + 2], s = list[o + 3], r = RL[list[o + 4]], sh = list[o + 5], w = r.w * s, h = r.h * s, a = -(h + 1000 * list[o + 6]);
    f[p++] = x; f[p++] = y; f[p++] = z; f[p++] = -w / 2; f[p++] = 0; f[p++] = r.u0; f[p++] = r.v1; f[p++] = sh; f[p++] = sh; f[p++] = sh; f[p++] = a;
    f[p++] = x; f[p++] = y; f[p++] = z; f[p++] = w / 2; f[p++] = 0; f[p++] = r.u1; f[p++] = r.v1; f[p++] = sh; f[p++] = sh; f[p++] = sh; f[p++] = a;
    f[p++] = x; f[p++] = y; f[p++] = z; f[p++] = w / 2; f[p++] = h; f[p++] = r.u1; f[p++] = r.v0; f[p++] = sh; f[p++] = sh; f[p++] = sh; f[p++] = a;
    f[p++] = x; f[p++] = y; f[p++] = z; f[p++] = -w / 2; f[p++] = h; f[p++] = r.u0; f[p++] = r.v0; f[p++] = sh; f[p++] = sh; f[p++] = sh; f[p++] = a;
  }
  return f;
};
// il pezzo serve adesso: se non è ancora sulla scheda grafica, lo si prepara
W.need = (c, frame) => {
  c.used = frame;
  if (c.buf) return;
  const G = W.G, H = W.H, data = scratch;
  for (let j = 0; j < CV; j++) for (let i = 0; i < CV; i++) {
    const gi = c.ci * (CV - 1) + i, gj = c.cj * (CV - 1) + j, k = gj * V + gi, o = (j * CV + i) * 6;
    data[o] = gi * CELL; data[o + 1] = H[k]; data[o + 2] = Z0 + gj * CELL; data[o + 3] = W.SH[k];
    // pendenza (per disegnare le pareti di roccia senza stirare la grana)
    data[o + 4] = (H[gj * V + Math.min(N, gi + 1)] - H[gj * V + Math.max(0, gi - 1)]) / (2 * CELL); data[o + 5] = (H[Math.min(NZ, gj + 1) * V + gi] - H[Math.max(0, gj - 1) * V + gi]) / (2 * CELL);
  }
  c.buf = G.buffer(data);
  const L = W.OB[c.cj * CH + c.ci];
  if (L) { if (c.nb) c.big = G.buffer(quadsOf(L.big)); if (c.ns) c.small = G.buffer(quadsOf(L.small)); }
  W.live.push(c);
};
// ogni tanto: i pezzi che non si vedono da un po' lasciano la memoria
W.sweep = frame => {
  const gl = W.G.gl; let n = 0;
  for (const c of W.live) { if (frame - c.used > 600) { gl.deleteBuffer(c.buf); if (c.big) gl.deleteBuffer(c.big); if (c.small) gl.deleteBuffer(c.small); c.buf = c.big = c.small = null; } else W.live[n++] = c; }
  W.live.length = n;
};
// ombre di alberi ed edifici dipinte sul terreno (il sole sta a sud-ovest: le ombre vanno a nord-est)
W.bakeShadows = () => {
  const m = new Uint8Array(TEX * TEXZ), col = W.col, dx = 0.674, dz = -0.738;
  const put = (tx, tz, v) => { if (tx < 0 || tz < 0 || tx >= TEX || tz >= TEXZ) return; const k = tz * TEX + tx; if (m[k] < v) m[k] = v; };
  for (const L of W.OB) {
    if (!L) continue; const b = L.big;
    for (let o = 0; o < b.length; o += 7) {
      const r = RL[b[o + 4]], w = r.w * b[o + 3], h = r.h * b[o + 3]; if (h < 6 || b[o + 1] < 0.2) continue;
      const cx = b[o] + dx * h * 0.42, cz = b[o + 2] + dz * h * 0.42, ra = Math.max(3.5, h * 0.5), rb = Math.max(3.5, w * 0.36), R = Math.max(ra, rb);
      for (let tz = Math.floor((cz - R - Z0) / TC); tz <= (cz + R - Z0) / TC; tz++) for (let tx = Math.floor((cx - R) / TC); tx <= (cx + R) / TC; tx++) {
        const px = (tx + 0.5) * TC - cx, pz = Z0 + (tz + 0.5) * TC - cz, al = px * dx + pz * dz, ac = -px * dz + pz * dx; if ((al / ra) ** 2 + (ac / rb) ** 2 < 1) put(tx, tz, 62);
      }
    }
  }
  for (const b of W.boxes) {
    const g = W.ground((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), hh = Math.max(0, Math.min(46, b[4] - g)); if (hh < 3) continue;
    const vx = dx * hh * 1.25, vz = dz * hh * 1.25;
    for (let tz = Math.floor((b[1] + vz - Z0) / TC); tz <= (b[3] - Z0) / TC; tz++) for (let tx = Math.floor(b[0] / TC); tx <= (b[2] + vx) / TC; tx++) {
      const px = (tx + 0.5) * TC, pz = Z0 + (tz + 0.5) * TC, t0 = Math.max(0, (px - b[2]) / vx, (pz - b[1]) / vz), t1 = Math.min(1, (px - b[0]) / vx, (pz - b[3]) / vz);
      if (t0 <= t1) put(tx, tz, 84);
    }
  }
  for (let k = 0; k < TEX * TEXZ; k++) if (m[k]) { const o = k * 4; if (col[o + 3] > 8) continue; const f = 1 - m[k] / 255; col[o] *= f; col[o + 1] *= f; col[o + 2] *= f * 1.04 > 1 ? 1 : f * 1.04; }
};
W.build = build;
W.coastDist = coastDist;
W.fbm = fbm; W.vn = vn; W.smooth = smooth; W.lerp = lerp; W.segDist = segDist;
SG.world = W;
})();
