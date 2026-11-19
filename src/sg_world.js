// ===================== PIXEL SAGA · le Terre di Lumen =====================
// Un'isola disegnata a mano: regioni, rilievi, lago, fiume, strade, borgo, rocca, rovine e santuari.
// Le forme sono decise qui; il rumore aggiunge solo i dettagli, sempre uguali (seme fisso).
(() => {
const WS = 4096, N = 512, CELL = WS / N, V = N + 1, TEX = 1024, TC = WS / TEX, WL = 0, CH = 16, CS = WS / CH;
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
const B = { MEADOW: 0, FARM: 1, FOREST: 2, MOUNT: 3, SNOW: 4, DESERT: 5, SWAMP: 6, VOLCANO: 7 };
const NB = 8;
const COAST = [[520, 420], [900, 230], [1400, 170], [1900, 200], [2400, 130], [2950, 200], [3450, 300], [3800, 560], [3940, 1000], [3960, 1500], [3900, 2000], [3960, 2500],
  [3880, 3000], [3700, 3450], [3350, 3750], [2900, 3880], [2450, 3940], [2050, 3980], [1600, 3880], [1150, 3740], [750, 3480], [430, 3100], [260, 2650], [200, 2150], [260, 1650], [190, 1150], [300, 750]];
// [x, z, raggio, bioma, nome]
const REG = [
  [2050, 2600, 720, B.MEADOW, 'PRATI DI LUMEN'], [2430, 2790, 230, B.FARM, 'CAMPI DORATI'], [1500, 2200, 300, B.MEADOW, 'PRATI DI LUMEN'],
  [1200, 1550, 520, B.FOREST, 'BOSCO ANTICO'], [700, 1150, 380, B.FOREST, 'BOSCO ANTICO'], [1650, 1250, 280, B.FOREST, 'BOSCO ANTICO'],
  [2150, 1340, 420, B.MEADOW, 'LAGO DI CRISTALLO'],
  [1250, 520, 430, B.MOUNT, 'MONTI DEL DRAGO'], [2300, 480, 470, B.MOUNT, 'PICCO DEL DRAGO'], [3150, 620, 430, B.MOUNT, 'MONTI DEL DRAGO'], [3680, 900, 260, B.MOUNT, 'RUPI DEL GRIFONE'],
  [650, 640, 300, B.SNOW, 'VALLE GELATA'],
  [3250, 1750, 560, B.DESERT, 'DESERTO DI SOLIS'], [3550, 2350, 320, B.DESERT, 'DESERTO DI SOLIS'],
  [650, 2650, 450, B.SWAMP, "PALUDE D'OMBRA"],
  [3350, 3150, 430, B.VOLCANO, 'MONTE BRACE'],
  [2760, 2960, 260, B.MEADOW, 'ROCCA DI LUMEN'],
  [1350, 3350, 420, B.MEADOW, 'COSTA DELLE CONCHIGLIE'], [2600, 3550, 330, B.MEADOW, 'COSTA DELLE CONCHIGLIE'],
];
const LAKES = [{ x: 2150, z: 1340, rx: 330, rz: 250, d: -18 }, { x: 3150, z: 2060, rx: 46, rz: 38, d: -5 }, { x: 1790, z: 2930, rx: 42, rz: 34, d: -4 }];
const ISLAND = { x: 2150, z: 1340, r: 58, h: 5 };
const STONES = [[2010, 1578], [2052, 1500], [2098, 1438], [2138, 1394]];   // il passaggio nascosto verso l'isola
const RIVER = { pts: [[2170, 1560], [2200, 1800], [2160, 2050], [2250, 2350], [2320, 2600], [2290, 2880], [2200, 3180], [2130, 3480], [2090, 3780], [2075, 4100]], w: 30, fords: [[2318, 2705]] };
// strade visibili e sentieri nascosti (solo il terreno diventa percorribile)
const ROADS = [
  { w: 9, pts: [[2000, 2600], [1990, 2420], [2040, 2200], [2080, 1980], [2110, 1780], [2130, 1640]] },
  { w: 9, pts: [[2040, 2650], [2200, 2690], [2318, 2705], [2460, 2760], [2600, 2880], [2695, 2950]] },
  { w: 9, pts: [[1960, 2620], [1780, 2480], [1560, 2260], [1400, 2000], [1250, 1760], [1130, 1520]] },
  { w: 8, pts: [[1960, 2680], [1700, 2760], [1400, 2790], [1100, 2720], [860, 2650]] },
  { w: 8, pts: [[1990, 2700], [1940, 2950], [1800, 3200], [1620, 3420], [1450, 3600]] },
  { w: 8, pts: [[2600, 2880], [2850, 2600], [3050, 2300], [3200, 2000], [3330, 1740]] },
  { w: 8, pts: [[2540, 1400], [2700, 1500], [3000, 1640], [3300, 1700]] },
  { w: 7, pts: [[2130, 1640], [1880, 1560], [1760, 1340], [1880, 1120], [2050, 1060], [2150, 1050], [2230, 900], [2300, 720], [2330, 560], [2310, 450]] },
  { w: 8, pts: [[1130, 1520], [1010, 1500], [950, 1350], [860, 980], [760, 760], [700, 650]] },
  { w: 8, pts: [[2620, 2990], [2640, 3100], [2950, 3180], [3150, 3170], [3270, 3110], [3340, 3048]] },
  { w: 8, hidden: true, pts: [[3400, 1350], [3520, 1200], [3630, 1040], [3695, 915]] },
  { w: 8, hidden: true, pts: [[860, 2650], [760, 2640], [665, 2650]] },
];
// aree spianate: [x, z, raggio, altezza (null = quella del centro)]
const FLAT = [[2000, 2650, 175, null], [2760, 2960, 205, 60], [3360, 1670, 150, null], [1080, 1420, 120, null], [3700, 900, 85, 150], [3150, 1985, 50, null],
  [690, 660, 100, null], [2310, 445, 55, null], [1650, 2850, 45, null], [2130, 1650, 30, null], [665, 2650, 40, 3]];

// ---------- edifici: case con tetto a due falde, torri, mura, templi ----------
// tile: 0 intonaco, 1 graticcio, 2 pietra, 3 assi, 4 tegole rosse, 5 ardesia, 6 paglia, 7 porta, 8 finestra, 9 pietra chiara,
// 10 arenaria, 11 pietra muschiosa, 12 porta runica, 13 tenda a righe, 14 pietra scura, 15 lanterna, 16 mattoni
const BUILD = [
  { k: 'house', x: 1930, z: 2585, w: 24, d: 18, h: 12, wall: 1, roof: 4, door: 's', name: 'CASA DI MIRTA' },
  { k: 'house', x: 2078, z: 2588, w: 20, d: 16, h: 10, wall: 2, roof: 5, door: 'w', name: 'FUCINA' },
  { k: 'house', x: 2075, z: 2722, w: 28, d: 20, h: 14, wall: 1, roof: 6, door: 'n', name: 'TAVERNA' },
  { k: 'house', x: 1925, z: 2722, w: 18, d: 16, h: 11, wall: 0, roof: 4, door: 'n' },
  { k: 'house', x: 1868, z: 2652, w: 16, d: 20, h: 10, wall: 3, roof: 6, door: 'e' },
  { k: 'house', x: 2128, z: 2650, w: 16, d: 16, h: 10, wall: 0, roof: 5, door: 'w' },
  { k: 'house', x: 1995, z: 2760, w: 16, d: 14, h: 10, wall: 16, roof: 4, door: 'n' },
  { k: 'house', x: 2220, z: 2770, w: 32, d: 20, h: 14, wall: 3, roof: 4, door: 'w' },
  { k: 'stall', x: 2006, z: 2565, w: 14, d: 8, h: 7 },
  { k: 'house', x: 2105, z: 1665, w: 14, d: 12, h: 9, wall: 3, roof: 6, door: 'n' },
  { k: 'house', x: 765, z: 700, w: 16, d: 14, h: 10, wall: 2, roof: 5, door: 'w' },
  // la Rocca di Lumen
  { k: 'castle', x: 2760, z: 2960, s: 170 },
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
  ['sign', 1996, 2470], ['sign', 2120, 1680], ['sign', 2655, 2925], ['sign', 3220, 1980], ['sign', 1180, 1600], ['sign', 900, 2660],
  ['statue', 2040, 2470], ['statue', 2690, 2930], ['statue', 2690, 2995],
  ['menhir', 1625, 2850], ['menhir', 1675, 2850], ['menhir', 1650, 2825], ['menhir', 1650, 2875], ['menhir', 1632, 2832], ['menhir', 1668, 2868],
  ['tent', 3172, 1992], ['campfire', 3148, 2012], ['snowman', 780, 600],
  ['banner', 2700, 2935], ['banner', 2700, 2985],
  ['ore', 2380, 2350], ['ore', 2455, 2285], ['ore', 2525, 2405], ['ore', 2605, 2300], ['ore', 2440, 2440],
];
// forzieri: [id, x, z, contenuto, rarità, direzione]
const CHESTS = [
  ['c01', 1925, 2562, 'pozione', 0], ['c02', 2475, 2930, 'monete:40', 0], ['c03', 1625, 2330, 'giaco', 0], ['c04', 1195, 1765, 'monete:60', 0],
  ['c05', 1080, 1392, 'cuore', 1], ['c06', 2150, 1352, 'aurora', 3], ['c07', 2316, 452, 'drago', 3], ['c08', 3395, 1655, 'corona', 3],
  ['c09', 665, 2650, 'luna', 3], ['c10', 3702, 905, 'grifone', 3], ['c11', 860, 480, 'vento', 2], ['c12', 3230, 3150, 'runica', 2],
  ['c13', 2829, 2960, 'elmoFerro', 1], ['c14', 1292, 3632, 'cotta', 1], ['c15', 3060, 2385, 'argento', 1], ['c16', 830, 1175, 'monete:80', 0],
  ['c17', 3620, 1920, 'ascia', 2], ['c18', 2950, 3420, 'cuore', 1], ['c19', 1150, 3150, 'pozione:2', 0], ['c20', 3210, 1140, 'acciaio', 2],
  ['c21', 1650, 2850, 'cuore', 1], ['c22', 2600, 1150, 'monete:100', 0], ['c23', 1904, 897, 'alato', 2], ['c24', 2550, 3700, 'pozione:3', 0],
  ['c25', 820, 1900, 'scudoFerro', 1], ['c26', 1850, 3650, 'monete:70', 0], ['c27', 3150, 2700, 'pozione:2', 0], ['c28', 1550, 1050, 'anello2', 1],
  ['c29', 610, 2960, 'elisir', 1], ['c30', 1330, 1180, 'monete:90', 0], ['c31', 3500, 2150, 'elisir', 1],
];
// nascondigli: un cerchio di cespugli, alberi o massi attorno a un forziere (stile, apertura verso...)
const NOOKS = [
  [1925, 2562, 'cespugli'], [2475, 2930, 'cespugli'], [1625, 2330, 'cespugli'], [1195, 1765, 'bosco'], [1080, 1392, 'bosco'], [860, 480, 'neve'],
  [3230, 3150, 'brace'], [1292, 3632, 'cespugli'], [3060, 2385, 'sabbia'], [830, 1175, 'bosco'], [3620, 1920, 'sabbia'], [2950, 3420, 'brace'],
  [1150, 3150, 'cespugli'], [3210, 1140, 'rocce'], [2600, 1150, 'rocce'], [1904, 897, 'rocce'], [2550, 3700, 'cespugli'], [820, 1900, 'bosco'],
  [1850, 3650, 'cespugli'], [3150, 2700, 'brace'], [1550, 1050, 'bosco'], [610, 2960, 'palude'], [1330, 1180, 'bosco'], [3500, 2150, 'sabbia'],
];
// abitanti e creature con un nome: [id, x, z, direzione]
const NPCS = [
  ['mirta', 1958, 2605, 1.2], ['bruno', 2058, 2612, 3.6], ['lia', 2022, 2668, 2.4], ['otto', 2165, 2672, 3.14], ['nino', 2006, 2559, 1.57],
  ['viandante', 2062, 2706, 4.4], ['pescatore', 2122, 1632, -1.4], ['spirito', 1095, 1462, 1.57], ['ardea', 2752, 2962, 3.14],
  ['nomade', 3150, 2000, 1.2], ['eremita', 748, 712, 3.4], ['contadino', 2380, 2700, 0.6], ['biscotto', 1475, 2020, 0.4],
];
// tane dei nemici: [x, z, tipo, numero, raggio]
const CAMPS = [
  [2420, 2840, 'slime', 4, 80], [2560, 2720, 'slime', 3, 70], [2280, 2960, 'slime', 3, 70], [1700, 2180, 'slime', 3, 90], [1850, 3150, 'slime', 3, 90],
  [1320, 1660, 'wolf', 3, 100], [880, 1300, 'wolf', 3, 100], [1530, 1300, 'wolf', 2, 90], [600, 1100, 'wolf', 3, 100],
  [900, 2560, 'goblin', 3, 90], [560, 2900, 'goblin', 3, 90], [1250, 2830, 'goblin', 2, 70], [430, 2400, 'goblin', 3, 90],
  [3355, 1655, 'skel', 4, 55], [3060, 1960, 'skel', 2, 80], [3550, 2300, 'skel', 3, 90], [3500, 1450, 'skel', 2, 80],
  [3400, 3020, 'imp', 3, 90], [3100, 3330, 'imp', 2, 80], [3600, 3200, 'imp', 3, 90],
  [870, 560, 'icewolf', 3, 90], [1150, 820, 'icewolf', 2, 80], [2330, 650, 'icewolf', 2, 70], [560, 820, 'icewolf', 2, 80],
  [1600, 1650, 'bat', 3, 80], [700, 2350, 'bat', 3, 80],
];
// nomi dei luoghi speciali (prima delle regioni): [x, z, raggio, nome]
const PLACES = [[2000, 2650, 200, 'BORGO AURORA'], [2760, 2960, 210, 'ROCCA DI LUMEN'], [3360, 1670, 180, 'ROVINE DI SOLIS'], [1080, 1420, 150, "L'ALBERO MADRE"],
  [2150, 1340, 70, "ISOLA DEL LAGO"], [3700, 900, 90, 'NIDO DEL GRIFONE'], [3150, 2030, 110, 'OASI DI SABBIA'], [2310, 445, 90, 'VETTA DEL DRAGO'], [1310, 3610, 70, 'FARO DEL SUD'], [3350, 3150, 150, 'CRATERE DEL BRACE']];

// ---------- funzioni del terreno ----------
function coastDist(x, z) {
  let inside = false, md = 1e9;
  for (let i = 0, j = COAST.length - 1; i < COAST.length; j = i++) {
    const [xi, zi] = COAST[i], [xj, zj] = COAST[j];
    if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) inside = !inside;
    const dx = xj - xi, dz = zj - zi, t = Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / (dx * dx + dz * dz))), d = Math.hypot(x - xi - dx * t, z - zi - dz * t);
    if (d < md) md = d;
  }
  return (inside ? md : -md) + (fbm(x / 320, z / 320, 3) - 0.5) * 170;
}
function segDist(x, z, pts) {
  let md = 1e9, mt = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))), d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < md) { md = d; mt = i + t; }
  }
  return md;
}
const RIVBOX = (() => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of RIVER.pts) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } return [x0 - 200, z0 - 200, x1 + 200, z1 + 200]; })();
function biomeW(x, z, out) {
  const wx = x + (fbm(x / 640, z / 640, 3) - 0.5) * 460, wz = z + (fbm(x / 640 + 41, z / 640 + 13, 3) - 0.5) * 460;
  out.fill(0); let tot = 0;
  for (const r of REG) { const d = Math.hypot(wx - r[0], wz - r[1]) / r[2], w = Math.exp(-7 * d); out[r[3]] += w; tot += w; }
  for (let b = 0; b < NB; b++) out[b] /= tot;
  return out;
}
function biomeH(b, x, z) {
  switch (b) {
    case B.MEADOW: return 14 + 17 * fbm(x / 520, z / 520, 4) + 5 * fbm(x / 110, z / 110, 2);
    case B.FARM: return 12 + 5 * fbm(x / 400, z / 400, 3);
    case B.FOREST: return 20 + 30 * fbm(x / 420, z / 420, 4) + 7 * fbm(x / 95, z / 95, 2);
    case B.MOUNT: return 50 + 260 * Math.pow(ridge(x / 760, z / 760, 4), 1.7) + 18 * fbm(x / 140, z / 140, 2);
    case B.SNOW: return 58 + 46 * fbm(x / 330, z / 330, 4) + 9 * fbm(x / 80, z / 80, 2);
    case B.DESERT: { const du = Math.abs(Math.sin(x * 0.011 + z * 0.004 + 6 * fbm(x / 500, z / 500, 2))); return 10 + 12 * fbm(x / 600, z / 600, 3) + 10 * du * du; }
    case B.SWAMP: return -1.6 + 6.5 * fbm(x / 160, z / 160, 3);
    default: return 20 + 10 * fbm(x / 200, z / 200, 2);
  }
}
const BW = new Float32Array(NB);
function height0(x, z) {
  biomeW(x, z, BW);
  let h = 0;
  for (let b = 0; b < NB; b++) if (BW[b] > 0.004) h += BW[b] * biomeH(b, x, z);
  // il picco del drago e il vulcano
  const dp = Math.hypot(x - 2300, z - 440); h += 210 * Math.exp(-((dp / 290) ** 2));
  const dv = Math.hypot(x - 3350, z - 3150);
  if (dv < 700) { h += 235 * Math.pow(1 - dv / 700, 1.5); if (dv < 115) h -= (115 - dv) * 1.15; }
  // laghi
  for (const L of LAKES) {
    const s = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz) * (1 + (fbm(x / 90, z / 90, 2) - 0.5) * 0.3);
    if (s < 1.25) h = Math.min(h, lerp(L.d, Math.max(h, 2), smooth(0.72, 1.25, s)));
  }
  const di = Math.hypot(x - ISLAND.x, z - ISLAND.z);
  if (di < ISLAND.r * 1.7) h = Math.max(h, lerp(ISLAND.h, -18, smooth(ISLAND.r, ISLAND.r * 1.7, di)));
  // il fiume: una valle larga e un letto profondo, con un guado
  if (x > RIVBOX[0] && x < RIVBOX[2] && z > RIVBOX[1] && z < RIVBOX[3]) {
    const d = segDist(x, z, RIVER.pts), w = RIVER.w;
    if (d < w * 4) {
      h = lerp(Math.min(h, 5), h, smooth(w * 0.9, w * 4, d));
      let fd = 1e9; for (const f of RIVER.fords) fd = Math.min(fd, Math.hypot(x - f[0], z - f[1]));
      const bed = lerp(-0.9, -6.5, smooth(10, 45, fd));
      h = lerp(bed, h, smooth(w * 0.3, w * 0.95, d));
    }
  }
  // la costa
  const cd = coastDist(x, z);
  if (cd < 0) h = Math.max(-42, Math.min(h, -3 + cd * 0.08));
  else if (cd < 170) h = lerp(lerp(-3, 3.5, smooth(0, 40, cd)), h, smooth(30, 170, cd));
  if (segDist(x, z, STONES) < 6) h = Math.max(h, -1.1);
  return h;
}

// ---------- il mondo vero e proprio ----------
const W = {
  WS, N, CELL, V, TEX, WL, CH, CS, B, REG, PLACES, BUILD, PROPS, CHESTS, NOOKS, NPCS, CAMPS, ROADS, RIVER, STONES, ISLAND,
  H: null, SL: null, SH: null, col: null, mat: null, road: null, biome: null, objs: [], colliders: null, boxes: [], mapImg: null,
};
W.ground = (x, z) => {
  const fx = x / CELL, fz = z / CELL, i = Math.floor(fx), j = Math.floor(fz);
  if (i < 0 || j < 0 || i >= N || j >= N) return -40;
  const u = fx - i, v = fz - j, k = j * V + i, H = W.H, h00 = H[k], h10 = H[k + 1], h01 = H[k + V], h11 = H[k + V + 1];
  return u > v ? h00 + (h10 - h00) * u + (h11 - h10) * v : h00 + (h11 - h01) * u + (h01 - h00) * v;
};
W.slope = (x, z) => { const i = Math.max(0, Math.min(N, Math.round(x / CELL))), j = Math.max(0, Math.min(N, Math.round(z / CELL))); return W.SL[j * V + i]; };
W.biomeAt = (x, z) => { const i = Math.max(0, Math.min(N, Math.round(x / CELL))), j = Math.max(0, Math.min(N, Math.round(z / CELL))); return W.biome[j * V + i]; };
W.roadAt = (x, z) => { const i = Math.max(0, Math.min(TEX - 1, Math.floor(x / TC))), j = Math.max(0, Math.min(TEX - 1, Math.floor(z / TC))); return W.road[(j * TEX + i) * 4] / 255; };
W.placeName = (x, z) => {
  for (const p of PLACES) if (Math.hypot(x - p[0], z - p[1]) < p[2]) return p[3];
  biomeW(x, z, BW);
  let best = null, bd = 1e9;
  const wx = x + (fbm(x / 640, z / 640, 3) - 0.5) * 460, wz = z + (fbm(x / 640 + 41, z / 640 + 13, 3) - 0.5) * 460;
  for (const r of REG) { const d = Math.hypot(wx - r[0], wz - r[1]) / r[2]; if (d < bd) { bd = d; best = r[4]; } }
  return best;
};
// aria per regione: colore della nebbia, distanza
W.atmo = (x, z) => { biomeW(x, z, BW); return BW; };

// collisioni: cerchi (alberi, rocce) in una griglia, scatole (edifici)
const GC = 32, GN = WS / GC;
W.addCircle = (x, z, r) => { const i = Math.floor(x / GC), j = Math.floor(z / GC); if (i < 0 || j < 0 || i >= GN || j >= GN) return; const k = j * GN + i; (W.colliders[k] || (W.colliders[k] = [])).push([x, z, r]); };
W.blocked = (x, z, r) => {
  const i0 = Math.floor((x - r - 20) / GC), i1 = Math.floor((x + r + 20) / GC), j0 = Math.floor((z - r - 20) / GC), j1 = Math.floor((z + r + 20) / GC);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GN || j >= GN) continue; const L = W.colliders[j * GN + i]; if (L) for (const c of L) if ((x - c[0]) ** 2 + (z - c[1]) ** 2 < (r + c[2]) ** 2) return c; }
  for (const b of W.boxes) if (x + r > b[0] && x - r < b[2] && z + r > b[1] && z - r < b[3]) return b;
  return null;
};
W.inBox = (x, z, m = 0) => { for (const b of W.boxes) if (x > b[0] - m && x < b[2] + m && z > b[1] - m && z < b[3] + m) return b; return null; };

// ---------- costruzione, a passi (per la barra di caricamento) ----------
function* build(atlas, sprites) {
  const H = W.H = new Float32Array(V * V);
  for (let j = 0; j < V; j++) { for (let i = 0; i < V; i++) H[j * V + i] = height0(i * CELL, j * CELL); if (j % 24 === 0) yield 0.02 + 0.33 * j / V; }
  // spianate (borgo, rocca, rovine...)
  for (const [fx, fz, r, th] of FLAT) {
    const t = th !== null ? th : W_groundRaw(H, fx, fz);
    const i0 = Math.max(0, Math.floor((fx - r) / CELL)), i1 = Math.min(N, Math.ceil((fx + r) / CELL)), j0 = Math.max(0, Math.floor((fz - r) / CELL)), j1 = Math.min(N, Math.ceil((fz + r) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(i * CELL - fx, j * CELL - fz); if (d < r) H[j * V + i] = lerp(t, H[j * V + i], smooth(r * 0.62, r, d)); }
  }
  yield 0.37;
  // strade: il terreno lungo il percorso viene smussato (si sale anche in montagna)
  const rm = SG.art.mk(V, V), rx = rm.getContext('2d');
  rx.fillStyle = '#000'; rx.fillRect(0, 0, V, V); rx.lineCap = 'round'; rx.lineJoin = 'round'; rx.strokeStyle = '#fff';
  for (const r of ROADS) { rx.lineWidth = (r.w + 26) / CELL; rx.beginPath(); r.pts.forEach(([x, z], k) => k ? rx.lineTo(x / CELL, z / CELL) : rx.moveTo(x / CELL, z / CELL)); rx.stroke(); }
  const rmask = rx.getImageData(0, 0, V, V).data;
  const blur = (src, rad) => {
    const a = new Float32Array(V * V), b = new Float32Array(V * V);
    for (let j = 0; j < V; j++) { let s = 0, n = 0; for (let i = -rad; i <= rad; i++) { const ii = Math.max(0, Math.min(N, i)); s += src[j * V + ii]; n++; } for (let i = 0; i < V; i++) { a[j * V + i] = s / n; const o = Math.max(0, Math.min(N, i - rad)), p = Math.max(0, Math.min(N, i + rad + 1)); s += src[j * V + p] - src[j * V + o]; } }
    for (let i = 0; i < V; i++) { let s = 0, n = 0; for (let j = -rad; j <= rad; j++) { const jj = Math.max(0, Math.min(N, j)); s += a[jj * V + i]; n++; } for (let j = 0; j < V; j++) { b[j * V + i] = s / n; const o = Math.max(0, Math.min(N, j - rad)), p = Math.max(0, Math.min(N, j + rad + 1)); s += a[p * V + i] - a[o * V + i]; } }
    return b;
  };
  let Hb = blur(H, 5); Hb = blur(Hb, 5);
  for (let k = 0; k < V * V; k++) { const m = rmask[k * 4] / 255; if (m > 0 && H[k] > -0.5) H[k] = lerp(H[k], Hb[k], m * 0.92); }
  yield 0.4;
  // pendenza e luce per vertice; bioma dominante
  const SL = W.SL = new Float32Array(V * V), SH = W.SH = new Float32Array(V * V), BI = W.biome = new Uint8Array(V * V);
  const bw = new Float32Array(V * V * NB);
  const sun = [-0.42, 0.78, 0.46], sl = Math.hypot(...sun);
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < V; i++) {
      const k = j * V + i, hl = H[j * V + Math.max(0, i - 1)], hr = H[j * V + Math.min(N, i + 1)], hu = H[Math.max(0, j - 1) * V + i], hd = H[Math.min(N, j + 1) * V + i];
      const gx = (hr - hl) / (2 * CELL), gz = (hd - hu) / (2 * CELL), n = Math.hypot(gx, 1, gz);
      SL[k] = Math.hypot(gx, gz);
      const dot = (-gx * sun[0] + sun[1] - gz * sun[2]) / (n * sl);
      SH[k] = Math.max(0.42, Math.min(1.12, 0.38 + 0.74 * Math.max(0, dot)));
      biomeW(i * CELL, j * CELL, BW); let bb = 0; for (let b = 0; b < NB; b++) { bw[k * NB + b] = BW[b]; if (BW[b] > BW[bb]) bb = b; } BI[k] = bb;
    }
    if (j % 32 === 0) yield 0.4 + 0.15 * j / V;
  }
  // maschera delle strade visibili e delle piazze (risoluzione della texture)
  const tm = SG.art.mk(TEX, TEX), tx = tm.getContext('2d');
  tx.fillStyle = '#000'; tx.fillRect(0, 0, TEX, TEX); tx.lineCap = 'round'; tx.lineJoin = 'round';
  tx.strokeStyle = '#f00';
  for (const r of ROADS) if (!r.hidden) { tx.lineWidth = r.w / TC; tx.beginPath(); r.pts.forEach(([x, z], k) => k ? tx.lineTo(x / TC, z / TC) : tx.moveTo(x / TC, z / TC)); tx.stroke(); }
  tx.fillStyle = '#0f0';
  const disc = (x, z, r) => { tx.beginPath(); tx.arc(x / TC, z / TC, r / TC, 0, Math.PI * 2); tx.fill(); };
  disc(2000, 2650, 62); tx.fillRect((2760 - 74) / TC, (2960 - 74) / TC, 148 / TC, 148 / TC);
  tx.fillStyle = '#00f'; tx.fillRect((3290) / TC, (1610) / TC, 140 / TC, 110 / TC); disc(1080, 1420, 40); disc(2150, 1340, 30);
  const road = W.road = tx.getImageData(0, 0, TEX, TEX).data;
  yield 0.58;
  // colori e motivi del terreno
  const col = W.col = new Uint8Array(TEX * TEX * 4), mat = W.mat = new Uint8Array(TEX * TEX * 4);
  const BC = [['#5aa83e', '#86c858'], ['#7cc24e', '#d9b44a'], ['#3e7a32', '#5e8e3a'], ['#8c8274', '#a29a8a'], ['#dce6f2', '#f2f6fc'], ['#e3c27a', '#d0a65c'], ['#4e5e34', '#6e7a3e'], ['#4a4242', '#5e5048']].map(p => p.map(h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }));
  const BM = [[1, 0, 0, 0], [0.6, 0.4, 0, 0], [0.75, 0.25, 0, 0], [0, 0.25, 0.75, 0], [0, 0.1, 0, 0.9], [0, 0.75, 0, 0.25], [0.45, 0.35, 0, 0.2], [0, 0.6, 0.4, 0]];
  const c = [0, 0, 0], m = [0, 0, 0, 0], tmp = new Float32Array(NB);
  for (let ty = 0; ty < TEX; ty++) {
    for (let tx2 = 0; tx2 < TEX; tx2++) {
      const x = (tx2 + 0.5) * TC, z = (ty + 0.5) * TC, fx = x / CELL, fz = z / CELL, i = Math.min(N - 1, Math.floor(fx)), j = Math.min(N - 1, Math.floor(fz)), u = fx - i, v = fz - j;
      const k00 = j * V + i, k10 = k00 + 1, k01 = k00 + V, k11 = k01 + 1, w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
      const h = H[k00] * w00 + H[k10] * w10 + H[k01] * w01 + H[k11] * w11, s = SL[k00] * w00 + SL[k10] * w10 + SL[k01] * w01 + SL[k11] * w11;
      for (let b = 0; b < NB; b++) tmp[b] = bw[k00 * NB + b] * w00 + bw[k10 * NB + b] * w10 + bw[k01 * NB + b] * w01 + bw[k11 * NB + b] * w11;
      const n1 = fbm(x / 210, z / 210, 3), n2 = vn(x / 23, z / 23);
      c[0] = c[1] = c[2] = 0; m[0] = m[1] = m[2] = m[3] = 0; let em = 0;
      for (let b = 0; b < NB; b++) {
        const wb = tmp[b]; if (wb < 0.01) continue;
        let p = BC[b], t = Math.max(0, Math.min(1, n1 * 1.6 - 0.3 + (n2 - 0.5) * 0.3)), cr = p[0][0] + (p[1][0] - p[0][0]) * t, cg = p[0][1] + (p[1][1] - p[0][1]) * t, cb = p[0][2] + (p[1][2] - p[0][2]) * t;
        if (b === B.FARM) { const fx2 = Math.floor((x * 0.8 + z * 0.3) / 70), fz2 = Math.floor((z * 0.8 - x * 0.3) / 46), kind = PERM[(fx2 & 255) + PERM[fz2 & 255]] % 3, stripe = Math.floor((x * 0.8 + z * 0.3) / 5) % 2;
          const FC = [[217, 180, 74], [124, 194, 78], [138, 90, 52]][kind]; cr = FC[0] * (stripe ? 0.88 : 1); cg = FC[1] * (stripe ? 0.88 : 1); cb = FC[2] * (stripe ? 0.88 : 1); }
        if (b === B.MOUNT && h < 90) { const g = smooth(90, 45, h); cr = lerp(cr, 96, g); cg = lerp(cg, 150, g); cb = lerp(cb, 70, g); }
        if (b === B.DESERT) { const rp = Math.sin(x * 0.35 + z * 0.12 + n1 * 9) > 0.7 ? 0.92 : 1; cr *= rp; cg *= rp; cb *= rp; }
        if (b === B.SWAMP && n2 > 0.66) { cr = 90; cg = 74; cb = 50; }
        if (b === B.VOLCANO) { const dv = Math.hypot(x - 3350, z - 3150); if (dv < 105 && h < 150) em = Math.max(em, smooth(105, 70, dv)); else if (dv < 600) { const crack = Math.abs(fbm(x / 60, z / 60, 3) - 0.5); if (crack < 0.035 && h > 40) em = Math.max(em, 0.85 * (1 - crack / 0.035) * smooth(0.3, 0.65, wb)); } }
        c[0] += cr * wb; c[1] += cg * wb; c[2] += cb * wb;
        for (let q = 0; q < 4; q++) m[q] += BM[b][q] * wb;
      }
      // neve in alto, roccia sui pendii, sabbia in riva, fondali sott'acqua
      const snow = smooth(165, 205, h + (n1 - 0.5) * 50) * (1 - tmp[B.VOLCANO]) * (1 - tmp[B.DESERT]);
      if (snow > 0) { c[0] = lerp(c[0], 238, snow); c[1] = lerp(c[1], 244, snow); c[2] = lerp(c[2], 251, snow); m[0] *= 1 - snow; m[1] *= 1 - snow; m[2] *= 1 - snow; m[3] = m[3] * (1 - snow) + snow; }
      const rk = smooth(0.62, 1.0, s) * (1 - snow * 0.6);
      if (rk > 0) { c[0] = lerp(c[0], 122, rk); c[1] = lerp(c[1], 114, rk); c[2] = lerp(c[2], 104, rk); for (let q = 0; q < 4; q++) m[q] *= 1 - rk; m[2] += rk; }
      if (h < 4.5 && h > -2.5 && tmp[B.SWAMP] < 0.4) { const sd = smooth(4.5, 1.5, h); c[0] = lerp(c[0], 232, sd); c[1] = lerp(c[1], 212, sd); c[2] = lerp(c[2], 152, sd); for (let q = 0; q < 4; q++) m[q] *= 1 - sd; m[1] += sd * 0.7; m[3] += sd * 0.3; }
      if (h < -0.4) { const dd = smooth(-0.4, -14, h); c[0] = lerp(196, 70, dd); c[1] = lerp(180, 110, dd); c[2] = lerp(128, 120, dd); m[0] = 0; m[1] = 0.4; m[2] = 0; m[3] = 0.6; }
      if (segDist(x, z, STONES) < 5.5 && h > -2) { c[0] = 226; c[1] = 232; c[2] = 224; m[0] = 0; m[1] = 0; m[2] = 1; m[3] = 0; }
      // strade, piazze, pavimenti
      const ri = (ty * TEX + tx2) * 4, rr = road[ri] / 255, rg = road[ri + 1] / 255, rb = road[ri + 2] / 255;
      if (rr > 0) { c[0] = lerp(c[0], 168, rr); c[1] = lerp(c[1], 128, rr); c[2] = lerp(c[2], 84, rr); for (let q = 0; q < 4; q++) m[q] *= 1 - rr; m[1] += rr * 0.75; m[2] += rr * 0.25; }
      if (rg > 0) { c[0] = lerp(c[0], 160, rg); c[1] = lerp(c[1], 156, rg); c[2] = lerp(c[2], 150, rg); for (let q = 0; q < 4; q++) m[q] *= 1 - rg; m[2] += rg; }
      if (rb > 0) { c[0] = lerp(c[0], 214, rb); c[1] = lerp(c[1], 186, rb); c[2] = lerp(c[2], 126, rb); for (let q = 0; q < 4; q++) m[q] *= 1 - rb; m[2] += rb; }
      em *= 1 - Math.min(1, rr + rg + rb);
      const o = (ty * TEX + tx2) * 4, vv = 0.94 + n2 * 0.12;
      col[o] = Math.min(255, c[0] * vv); col[o + 1] = Math.min(255, c[1] * vv); col[o + 2] = Math.min(255, c[2] * vv); col[o + 3] = em * 255;
      if (em > 0) { col[o] = 255; col[o + 1] = 90 + em * 60; col[o + 2] = 20; }
      const ms = m[0] + m[1] + m[2] + m[3] || 1;
      mat[o] = m[0] / ms * 255; mat[o + 1] = m[1] / ms * 255; mat[o + 2] = m[2] / ms * 255; mat[o + 3] = m[3] / ms * 255;
    }
    if (ty % 16 === 0) yield 0.58 + 0.24 * ty / TEX;
  }
  // immagine della mappa (256x256) con rilievo e acqua
  const mi = SG.art.mk(256, 256), mx = mi.getContext('2d'), md = mx.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const o = (y * 256 + x) * 4, t = ((y * 4 + 2) * TEX + x * 4 + 2) * 4, i = Math.min(N, x * 2 + 1), j = Math.min(N, y * 2 + 1), h = H[j * V + i], sh = SH[j * V + i];
    if (h < -0.6) { const dd = smooth(0, -20, h); md.data[o] = lerp(86, 40, dd); md.data[o + 1] = lerp(150, 90, dd); md.data[o + 2] = lerp(210, 170, dd); }
    else { md.data[o] = Math.min(255, col[t] * (0.55 + sh * 0.5)); md.data[o + 1] = Math.min(255, col[t + 1] * (0.55 + sh * 0.5)); md.data[o + 2] = Math.min(255, col[t + 2] * (0.55 + sh * 0.5)); }
    md.data[o + 3] = 255;
  }
  mx.putImageData(md, 0, 0); W.mapImg = mi;
  yield 0.84;
  // edifici e collisioni
  W.colliders = new Array(GN * GN); W.boxes = []; W.mesh = []; W.lights = [];
  buildMeshes();
  yield 0.88;
  // oggetti messi a mano e sparsi
  placeObjects(sprites);
  yield 0.96;
}
function W_groundRaw(H, x, z) { const i = Math.round(x / CELL), j = Math.round(z / CELL); return H[Math.max(0, Math.min(N, j)) * V + Math.max(0, Math.min(N, i))]; }

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
function gable(x0, z0, x1, z1, y, rh, roof, wall) {
  const o = 1.6, alongX = (x1 - x0) >= (z1 - z0);
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
// porta o finestra: un riquadro appena staccato dal muro
function onWall(side, x0, z0, x1, z1, c, y0, w, h, tile) {
  const e = 0.18, a = c - w / 2, b = c + w / 2, n0 = W.mesh.length;
  if (side === 's') quad([a, y0, z1 + e], [b, y0, z1 + e], [b, y0 + h, z1 + e], [a, y0 + h, z1 + e], tile, 1, 1);
  if (side === 'n') quad([b, y0, z0 - e], [a, y0, z0 - e], [a, y0 + h, z0 - e], [b, y0 + h, z0 - e], tile, 1, 1);
  if (side === 'e') quad([x1 + e, y0, b], [x1 + e, y0, a], [x1 + e, y0 + h, a], [x1 + e, y0 + h, b], tile, 1, 1);
  if (side === 'w') quad([x0 - e, y0, a], [x0 - e, y0, b], [x0 - e, y0 + h, b], [x0 - e, y0 + h, a], tile, 1, 1);
  // segno «decalcomania»: nello shader si stacca dal muro anche da lontano (niente sfarfallio con i mattoni dietro)
  for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] += 2;
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
function prism(cx, cz, r, y0, y1, tile, sides = 8, cap) {
  for (let k = 0; k < sides; k++) {
    const a0 = k / sides * Math.PI * 2, a1 = (k + 1) / sides * Math.PI * 2, p = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], q = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
    quad([q[0], y0, q[1]], [p[0], y0, p[1]], [p[0], y1, p[1]], [q[0], y1, q[1]], tile, Math.max(1, Math.round(2 * Math.PI * r / sides / T8)), (y1 - y0) / T8);
  }
  if (cap === 'cone') for (let k = 0; k < sides; k++) { const a0 = k / sides * Math.PI * 2, a1 = (k + 1) / sides * Math.PI * 2, R = r + 2; quad([cx + Math.cos(a1) * R, y1 - 0.5, cz + Math.sin(a1) * R], [cx + Math.cos(a0) * R, y1 - 0.5, cz + Math.sin(a0) * R], [cx, y1 + r * 1.6, cz], [cx, y1 + r * 1.6, cz], 4, 2, 2); }
}
function crenels(x0, z0, x1, z1, y, tile) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.floor(L / 7)), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
  for (let k = 0; k <= n; k += 2) { const cx = x0 + dx * (k * L / n), cz = z0 + dz * (k * L / n); box(cx - 1.8, cz - 1.8, cx + 1.8, cz + 1.8, y, y + 3.2, tile); }
}
function buildMeshes() {
  const g = W.ground;
  for (const b of BUILD) {
    if (b.k === 'house' || b.k === 'temple') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
      let y0 = Infinity; for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [b.x, b.z]]) y0 = Math.min(y0, g(x, z));
      const base = y0 - 3, top = y0 + b.h;
      if (b.k === 'house') {
        walls(x0, z0, x1, z1, base, top, b.wall); gable(x0, z0, x1, z1, top, Math.min(b.w, b.d) * 0.5, b.roof, b.wall);
        const c = (b.door === 'n' || b.door === 's') ? b.x : b.z;
        onWall(b.door, x0, z0, x1, z1, c, y0, 5, 8.5, 7);
        for (const s of ['n', 's', 'e', 'w']) { const len = (s === 'n' || s === 's') ? b.w : b.d, cc = (s === 'n' || s === 's') ? b.x : b.z; for (const off of [-0.3, 0.3]) if (!(s === b.door && Math.abs(off) < 0.5 && len < 22) && len > 12) onWall(s, x0, z0, x1, z1, cc + off * len, y0 + 3.5, 4.5, 4.5, 8); }
      } else {
        box(x0, z0, x1, z1, base, top, b.wall); crenels(x0, z0, x1, z0, top, b.wall); crenels(x0, z1, x1, z1, top, b.wall);
        box(x0 + 3, z0 + 3, x1 - 3, z1 - 3, top, top + 5, b.wall);
        const c = (b.door === 'n' || b.door === 's') ? b.x : b.z; onWall(b.door, x0, z0, x1, z1, c, y0, 8, 10, 12);
        W.lights.push({ x: b.door === 's' ? b.x : b.door === 'n' ? b.x : b.x, z: b.door === 's' ? z1 + 2 : b.door === 'n' ? z0 - 2 : b.z, id: b.id });
      }
      W.boxes.push([x0, z0, x1, z1, top, b]);
    } else if (b.k === 'stall') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y0 = g(b.x, b.z);
      box(x0, z0 + 2, x1, z1 - 3, y0 - 2, y0 + 3.4, 3);
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) box(px - 0.5, pz - 0.5, px + 0.5, pz + 0.5, y0 - 1, y0 + b.h, 3);
      quad([x0 - 1, y0 + b.h - 1.5, z1 + 1.5], [x1 + 1, y0 + b.h - 1.5, z1 + 1.5], [x1 + 1, y0 + b.h + 1.5, z0 - 1], [x0 - 1, y0 + b.h + 1.5, z0 - 1], 13, 2, 1);
      W.boxes.push([x0, z0 + 1, x1, z1 - 2, y0 + 3.4, b]);
    } else if (b.k === 'ruin') {
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, R = rng(Math.round(b.x * 7 + b.z));
      const along = b.w > b.d, L = along ? b.w : b.d, n = Math.ceil(L / 8);
      for (let k = 0; k < n; k++) {
        const hh = b.h * (0.35 + 0.65 * R()), a0 = (along ? x0 : z0) + k * L / n, a1 = a0 + L / n - 0.01;
        const y0 = g(along ? (a0 + a1) / 2 : b.x, along ? b.z : (a0 + a1) / 2) - 3;
        if (R() < 0.18 || (b.gate && Math.abs(k - (n - 1) / 2) < 1)) continue;
        if (along) box(a0, z0, a1, z1, y0, y0 + 3 + hh, b.wall); else box(x0, a0, x1, a1, y0, y0 + 3 + hh, b.wall);
        W.boxes.push(along ? [a0, z0, a1, z1, y0 + 3 + hh, b] : [x0, a0, x1, a1, y0 + 3 + hh, b]);
      }
    } else if (b.k === 'cave') {
      // un poggio di roccia dalla forma irregolare, con una parete dritta dove si apre la grotta
      const top = crag(b, g), x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
      const dx = b.door === 'e' ? x1 + 2 : b.door === 'w' ? x0 - 2 : b.x, dz = b.door === 's' ? z1 + 2 : b.door === 'n' ? z0 - 2 : b.z, gy = g(dx, dz);
      onWall(b.door, x0, z0, x1, z1, (b.door === 'n' || b.door === 's') ? b.x : b.z, gy - 0.6, 7.5, 7.6, 48);
      W.lights.push({ x: dx, z: dz, id: b.id, cave: true });
      W.boxes.push([x0 + 1, z0 + 1, x1 - 1, z1 - 1, top, b]);
    } else if (b.k === 'tower') {
      const y0 = g(b.x, b.z) - 2; prism(b.x, b.z, b.r, y0, y0 + b.h, b.wall, 8, 'cone');
      onWall('s', b.x - 3, b.z - b.r, b.x + 3, b.z + b.r * 0.92, b.x, y0 + 2, 5, 8, 7);
      W.lights.push({ x: b.x, z: b.z, y: y0 + b.h - 4, beacon: true });
      W.boxes.push([b.x - b.r, b.z - b.r, b.x + b.r, b.z + b.r, y0 + b.h, b]);
    } else if (b.k === 'castle') {
      const s = b.s / 2, cx = b.x, cz = b.z, y = g(cx, cz), th = 6, wh = 24, base = y - 4;
      const seg = (x0, z0, x1, z1) => { box(x0, z0, x1, z1, base, y + wh, 9); W.boxes.push([x0, z0, x1, z1, y + wh, b]); const along = x1 - x0 > z1 - z0; if (along) { crenels(x0 + 2, z0 + 1, x1 - 2, z0 + 1, y + wh, 9); crenels(x0 + 2, z1 - 1, x1 - 2, z1 - 1, y + wh, 9); } else { crenels(x0 + 1, z0 + 2, x0 + 1, z1 - 2, y + wh, 9); crenels(x1 - 1, z0 + 2, x1 - 1, z1 - 2, y + wh, 9); } };
      seg(cx - s, cz - s, cx + s, cz - s + th); seg(cx - s, cz + s - th, cx + s, cz + s);
      seg(cx + s - th, cz - s, cx + s, cz + s);
      seg(cx - s, cz - s, cx - s + th, cz - 12); seg(cx - s, cz + 12, cx - s + th, cz + s);
      box(cx - s - 2, cz - 14, cx - s + th + 2, cz - 11, base, y + wh + 8, 9); box(cx - s - 2, cz + 11, cx - s + th + 2, cz + 14, base, y + wh + 8, 9);
      quad([cx - s - 2.2, y + wh - 2, cz + 11], [cx - s - 2.2, y + wh - 2, cz - 11], [cx - s - 2.2, y + wh + 8, cz - 11], [cx - s - 2.2, y + wh + 8, cz + 11], 9, 3, 1.25);
      for (const [tx, tz] of [[cx - s, cz - s], [cx + s, cz - s], [cx - s, cz + s], [cx + s, cz + s]]) { prism(tx, tz, 12, base, y + wh + 14, 9, 8, 'cone'); W.boxes.push([tx - 11, tz - 11, tx + 11, tz + 11, y + wh + 14, b]); }
      const kx0 = cx + 10, kx1 = cx + 58, kz0 = cz - 22, kz1 = cz + 22;
      walls(kx0, kz0, kx1, kz1, base, y + 30, 9); gable(kx0, kz0, kx1, kz1, y + 30, 20, 5, 9);
      onWall('w', kx0, kz0, kx1, kz1, cz, y, 9, 13, 7);
      for (const off of [-14, 14]) onWall('w', kx0, kz0, kx1, kz1, cz + off, y + 14, 5, 7, 8);
      prism(kx1 - 6, kz0 + 6, 7, y + 20, y + 46, 9, 8, 'cone');
      W.boxes.push([kx0, kz0, kx1, kz1, y + 30, b]);
    }
  }
}

// ---------- oggetti: alberi, rocce, fiori... ----------
function placeObjects(S) {
  const objs = W.objs = [], R = rng(4242), TAU2 = Math.PI * 2;
  const add = (key, x, z, o = {}) => {
    const sp = S[key]; if (!sp) return;
    const y = o.y !== undefined ? o.y : W.ground(x, z);
    objs.push({ k: key, x, z, y: y - (o.sink || 0.4), s: o.s || sp.s, small: !!o.small || sp.small, sp: sp.r[Math.floor(R() * sp.r.length)] });
    if (o.r || sp.col) W.addCircle(x, z, o.r || sp.col);
  };
  const busy = (x, z, m) => { for (const f of FLAT.slice(0, 4)) if (Math.hypot(x - f[0], z - f[1]) < f[2] * 0.85 + m) return true; for (const n of NOOKS) if (Math.hypot(x - n[0], z - n[1]) < 17) return true; for (const b of BUILD) if (b.k === 'cave' && Math.hypot(x - b.x, z - b.z) < 30) return true; return !!W.inBox(x, z, m + 4); };
  // un nascondiglio: chi passa sulla strada non vede il forziere
  const NK = {
    cespugli: { ring: ['bush', 7, 6.5], back: [['oak', 2, 13]], deco: ['flower', 'tuft'] },
    bosco: { ring: ['bush', 6, 6.5], back: [['oakbig', 3, 14]], deco: ['mushroom', 'fern'] },
    rocce: { ring: ['rock', 5, 8, true], back: [['pine', 2, 14]], deco: ['tuft'] },
    neve: { ring: ['rocksnow', 5, 8, true], back: [['snowpine', 3, 14]], deco: [] },
    sabbia: { ring: ['sandrock', 4, 8, true], back: [['cactus', 1, 13], ['drybush', 3, 6]], deco: ['bones'] },
    palude: { ring: ['reeds', 7, 6], back: [['willow', 3, 13]], deco: ['mushroom'] },
    brace: { ring: ['lavarock', 5, 8, true], back: [['burnt', 2, 14]], deco: ['bones'] },
  };
  for (const [nx, nz, st] of NOOKS) {
    const S2 = NK[st], open = Math.atan2(2400 - nz, 2048 - nx), [rk, rn, rr, solid] = S2.ring, slots = solid ? 7 : rn;
    for (let i = 0, put = 0; i < slots && put < rn; i++) {
      const a = open + Math.PI / slots + i / slots * TAU2;
      if (solid && Math.abs(Math.atan2(Math.sin(a - open), Math.cos(a - open))) < 0.75) continue;   // lascia un varco
      add(rk, nx + Math.cos(a) * (rr + (R() - 0.5)), nz + Math.sin(a) * (rr + (R() - 0.5)), rk === 'bush' || rk === 'reeds' ? { small: rk === 'reeds' } : {}); put++;
    }
    for (const [bk, bn, br] of S2.back) for (let i = 0; i < bn; i++) { const a = open + Math.PI + (i - (bn - 1) / 2) * 0.75 + (R() - 0.5) * 0.2; add(bk, nx + Math.cos(a) * br, nz + Math.sin(a) * br); }
    for (const dk of S2.deco) for (let i = 0; i < 3; i++) { const a = R() * TAU2, r = 3 + R() * 4; add(dk, nx + Math.cos(a) * r, nz + Math.sin(a) * r, { small: true }); }
  }
  // massi e alberi attorno agli imbocchi delle grotte (il davanti resta libero)
  for (const b of BUILD) if (b.k === 'cave') {
    const fw = b.door === 's' ? Math.PI / 2 : b.door === 'n' ? -Math.PI / 2 : b.door === 'e' ? 0 : Math.PI, bio = W.biomeAt(b.x, b.z);
    const rk = bio === B.SNOW ? 'rocksnow' : bio === B.DESERT ? 'sandrock' : bio === B.VOLCANO ? 'lavarock' : 'rock', tr = bio === B.SNOW ? 'snowpine' : bio === B.MOUNT ? 'pine' : bio === B.FOREST ? 'oakbig' : bio === B.MEADOW ? 'palm' : 'oak';
    for (let i = 0; i < 9; i++) { const a = fw + 0.9 + i / 8 * (TAU2 - 1.8), r = Math.max(b.w, b.d) * 0.55 + 4 + R() * 4; add(i % 3 === 1 ? tr : rk, b.x + Math.cos(a) * r, b.z + Math.sin(a) * r); }
    for (const sd of [-1, 1]) { const a = fw + sd * 0.62, r = Math.max(b.w, b.d) * 0.62 + 6; add(bio === B.SNOW ? 'snowpine' : 'bush', b.x + Math.cos(a) * r, b.z + Math.sin(a) * r); }
  }
  for (const p of PROPS) {
    const [k, x, z] = p;
    if (k === 'ore') continue;   // i minerali si raccolgono: li disegna il gioco
    if (k === 'giant') add('giant', x, z, { r: 15, sink: 2 });
    else if (k === 'well') { add('well', x, z, { r: 6 }); }
    else if (k === 'anvil') add('anvil', x, z, { r: 2 });
    else if (k === 'menhir') add('menhir', x, z, { r: 3 });
    else if (k === 'statue') add('statue', x, z, { r: 4 });
    else add(k, x, z, { r: k === 'tent' ? 9 : k === 'sign' ? 1.2 : k === 'snowman' ? 3.5 : k === 'ore' ? 3.5 : k === 'campfire' ? 2 : 1 });
  }
  const TBL = {
    [B.MEADOW]: [[0.012, 'oak'], [0.02, 'birch'], [0.034, 'bush'], [0.11, 'flower', 1], [0.16, 'tuft', 1], [0.168, 'rock']],
    [B.FARM]: [[0.004, 'oak'], [0.012, 'bush'], [0.03, 'flower', 1], [0.07, 'tuft', 1]],
    [B.FOREST]: [[0.24, 'oakbig'], [0.3, 'birch'], [0.36, 'bush'], [0.39, 'mushroom', 1], [0.46, 'tuft', 1], [0.475, 'rock'], [0.49, 'fern', 1]],
    [B.MOUNT]: [[0.03, 'pine'], [0.09, 'rock'], [0.11, 'tuft', 1]],
    [B.SNOW]: [[0.1, 'snowpine'], [0.13, 'rocksnow'], [0.15, 'icecrystal']],
    [B.DESERT]: [[0.012, 'cactus'], [0.025, 'drybush'], [0.035, 'sandrock'], [0.039, 'bones', 1]],
    [B.SWAMP]: [[0.06, 'deadtree'], [0.1, 'willow'], [0.16, 'reeds', 1], [0.2, 'mushroom', 1], [0.22, 'bush']],
    [B.VOLCANO]: [[0.025, 'burnt'], [0.06, 'lavarock'], [0.065, 'bones', 1]],
  };
  const step = 12;
  for (let gz = step / 2; gz < WS; gz += step) for (let gx = step / 2; gx < WS; gx += step) {
    const x = gx + (R() - 0.5) * step, z = gz + (R() - 0.5) * step, r = R();
    if (r > 0.5) continue;
    const h = W.ground(x, z); if (h < WL + 0.8) { if (h > -1.5 && r < 0.05 && W.biomeAt(x, z) === B.SWAMP) add('reeds', x, z, { small: true }); continue; }
    const sl = W.slope(x, z), b = W.biomeAt(x, z);
    if (W.roadAt(x, z) > 0.05 || busy(x, z, 6)) continue;
    if (W.col[(Math.min(TEX - 1, Math.floor(z / TC)) * TEX + Math.min(TEX - 1, Math.floor(x / TC))) * 4 + 3] > 20) continue;
    let pick = null;
    for (const e of TBL[b]) if (r < e[0]) { pick = e; break; }
    if (!pick) continue;
    if (sl > 0.75 && pick[1] !== 'rock') continue;
    if (h > 175 && pick[1] === 'pine') pick = [0, 'snowpine'];
    if (Math.abs(x - 2150) < 360 && Math.abs(z - 1340) < 290 && h < 6 && R() < 0.5) pick = [0, 'crystal'];
    if (h < 6 && W.biomeAt(x, z) === B.MEADOW && z > 3100 && R() < 0.4) pick = [0, 'palm'];
    add(pick[1], x, z, { small: !!pick[2] });
  }
  // pietre che affiorano dal lago: il passaggio verso l'isola
  for (let i = 0; i < STONES.length - 1; i++) { const [ax, az] = STONES[i], [bx, bz] = STONES[i + 1], L = Math.hypot(bx - ax, bz - az); for (let t = 0; t < L; t += 11) { const x = ax + (bx - ax) * t / L + (R() - 0.5) * 4, z = az + (bz - az) * t / L + (R() - 0.5) * 4; add('stepstone', x, z, { y: WL + 0.15, sink: 0 }); } }
  // cristalli sulle rive del lago
  for (let k = 0; k < 70; k++) { const a = R() * Math.PI * 2, s = 1.02 + R() * 0.12, x = 2150 + Math.cos(a) * 330 * s, z = 1340 + Math.sin(a) * 250 * s; if (W.ground(x, z) > 0.5 && W.roadAt(x, z) < 0.05) add('crystal', x, z); }
  // palme sulla costa
  for (let k = 0; k < 900; k++) { const x = 300 + R() * 3500, z = 300 + R() * 3600, h = W.ground(x, z); if (h > 0.8 && h < 4 && coastDist(x, z) < 160 && W.biomeAt(x, z) !== B.SNOW && W.biomeAt(x, z) !== B.MOUNT && !busy(x, z, 5)) add('palm', x, z); }
}

// ---------- caricamento sulla scheda grafica ----------
W.upload = (G) => {
  const gl = G.gl;
  W.tex = { col: G.texture({ w: TEX, h: TEX, data: W.col }, { linear: true }), mat: G.texture({ w: TEX, h: TEX, data: W.mat }, { linear: true }) };
  // terreno a pezzi (16x16), tre livelli di dettaglio
  const CV = N / CH + 1;
  const lod = st => { const out = []; for (let j = 0; j < CV - 1; j += st) for (let i = 0; i < CV - 1; i += st) { const a = j * CV + i, b = a + st, c = a + st * CV, d = c + st; out.push(a, d, b, a, c, d); } return G.buffer(new Uint16Array(out), gl.ELEMENT_ARRAY_BUFFER); };
  W.lod = [1, 2, 4].map(st => ({ buf: lod(st), n: ((CV - 1) / st) ** 2 * 6 }));
  W.chunks = [];
  for (let cj = 0; cj < CH; cj++) for (let ci = 0; ci < CH; ci++) {
    const data = new Float32Array(CV * CV * 6); let lo = 1e9, hi = -1e9;
    for (let j = 0; j < CV; j++) for (let i = 0; i < CV; i++) {
      const gi = ci * (CV - 1) + i, gj = cj * (CV - 1) + j, k = gj * V + gi, o = (j * CV + i) * 6;
      data[o] = gi * CELL; data[o + 1] = W.H[k]; data[o + 2] = gj * CELL; data[o + 3] = W.SH[k];
      // pendenza (per disegnare le pareti di roccia senza stirare la grana)
      const HH = W.H; data[o + 4] = (HH[gj * V + Math.min(N, gi + 1)] - HH[gj * V + Math.max(0, gi - 1)]) / (2 * CELL); data[o + 5] = (HH[Math.min(N, gj + 1) * V + gi] - HH[Math.max(0, gj - 1) * V + gi]) / (2 * CELL);
      lo = Math.min(lo, W.H[k]); hi = Math.max(hi, W.H[k]);
    }
    W.chunks.push({ ci, cj, cx: (ci + 0.5) * CS, cz: (cj + 0.5) * CS, lo, hi, buf: G.buffer(data), big: null, small: null, nb: 0, ns: 0 });
  }
  // oggetti per pezzo (grandi e piccoli)
  const per = W.chunks.map(() => ({ big: [], small: [] }));
  for (const o of W.objs) { const ci = Math.max(0, Math.min(CH - 1, Math.floor(o.x / CS))), cj = Math.max(0, Math.min(CH - 1, Math.floor(o.z / CS))); per[cj * CH + ci][o.small ? 'small' : 'big'].push(o); }
  const quadsOf = list => { const f = new Float32Array(list.length * 4 * 11); let p = 0; for (const o of list) { const r = o.sp, w = r.w * o.s, h = r.h * o.s, sh = o.k === 'crystal' || o.k === 'icecrystal' || o.k === 'lavarock' ? 1.15 : 1; for (const [cx, cy, u, v] of [[-w / 2, 0, r.u0, r.v1], [w / 2, 0, r.u1, r.v1], [w / 2, h, r.u1, r.v0], [-w / 2, h, r.u0, r.v0]]) { f[p++] = o.x; f[p++] = o.y; f[p++] = o.z; f[p++] = cx; f[p++] = cy; f[p++] = u; f[p++] = v; f[p++] = sh; f[p++] = sh; f[p++] = sh; f[p++] = -h; } } return f; };
  W.chunks.forEach((c, k) => { const L = per[k]; if (L.big.length) { c.big = G.buffer(quadsOf(L.big)); c.nb = L.big.length; } if (L.small.length) { c.small = G.buffer(quadsOf(L.small)); c.ns = L.small.length; } });
  // edifici
  const m = new Float32Array(W.mesh); W.meshBuf = G.buffer(m); W.meshQuads = m.length / 32;
  // acqua: un grande quadrato fino all'orizzonte
  W.waterBuf = G.buffer(new Float32Array([-3000, -3000, WS + 3000, -3000, WS + 3000, WS + 3000, -3000, WS + 3000]));
};
W.build = build;
W.coastDist = coastDist;
W.fbm = fbm;
SG.world = W;
})();
