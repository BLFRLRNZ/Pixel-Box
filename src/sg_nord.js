// ===================== PIXEL SAGA · i grandi monti del nord =====================
// Oltre i Monti del Drago, dove prima c'era il mare, la terra continua e sale: prima le alture di sempre,
// poi creste sempre più alte fino ai ghiacciai. In fondo alla Valle delle Cascate, incastonata nella roccia
// e affacciata verso Lumen, sta Marmorea: la Grande Terrazza, i colonnati, l'acropoli e l'acqua che cade da ogni gradone.
(() => {
const W = SG.world, B = W.B, TN = SG.town, TL = TN.TL, C = SG.city, K = W.kit, { quad, walls, box, boxTop, gable, onWall, prism } = K;
const { oct, decal, dome, hip, fountain } = TN;
const sm = W.smooth, lerp = W.lerp, TAU = Math.PI * 2, c01 = v => Math.max(0, Math.min(1, v));
// tutto quello che segue (oggetti, nascondigli) ha la sua sequenza di numeri: le terre di prima non cambiano
W.NORDN = { nooks: [W.NOOKS.length, 0], props: [W.PROPS.length, 0] };

// ---------- la terra ----------
// i monti nuovi valgono solo a nord (mai sotto z = 300) e a ovest dello stretto: il resto del mondo resta com'era
const QUI = (x, z) => sm(300, 40, z + 150 * W.fbm(x / 260, z / 260, 2)) * sm(3950, 3700, x);
W.REG.push(
  [1500, -150, 520, B.ALP, 'SOGLIA DEI GIGANTI', QUI], [2350, -180, 520, B.ALP, 'VALLE DELLE CASCATE', QUI], [3200, -200, 520, B.ALP, 'SOGLIA DEI GIGANTI', QUI],
  [1500, -720, 520, B.ALP, 'MONTI DEL CIELO', QUI], [2400, -720, 520, B.ALP, 'VALLE DELLE CASCATE', QUI], [3250, -760, 520, B.ALP, "CRESTE D'ARGENTO", QUI],
  [1750, -1280, 520, B.ALP, 'MONTI DEL CIELO', QUI], [2450, -1330, 520, B.ALP, 'GHIACCIAIO ETERNO', QUI], [3150, -1280, 520, B.ALP, "CRESTE D'ARGENTO", QUI],
  [2450, -1700, 420, B.ALP, 'GHIACCIAIO ETERNO', QUI]);
// le cime: [x, z, altezza in più, raggio]
W.PEAKS.push([2430, -1500, 620, 340], [1740, -800, 260, 290], [3090, -820, 270, 290], [2020, -130, 150, 230], [3080, -110, 140, 230], [1560, -1250, 180, 260], [3260, -1280, 40, 260]);
// quelle che si vedono da tutto il mondo, come sagome oltre la foschia: [x, z, mezza larghezza]
W.GIANTS = [[2430, -1500, 640], [3290, -1220, 520], [3080, -1584, 430], [1776, -904, 480], [3128, -900, 460], [1776, -1276, 420], [1512, -1324, 380], [2184, -124, 360], [1952, -92, 300], [2832, -288, 320]];

// ---------- Marmorea: le misure ----------
// quattro piani, da sud a nord: il lago in fondo alla valle, la Grande Terrazza, la città, l'acropoli
const XC = 2424, Y0 = 330, Y1 = 392, Y2 = 420, Y3 = 468;
const ZF = -656,      // il parapetto della terrazza, sul vuoto
  ZT = -776,          // il muro della città (in mezzo, la scalinata)
  ZS1 = -824,         // in cima alla scalinata
  ZN2 = -1024,        // il muro dell'acropoli
  ZS2 = -1080,        // in cima alla seconda scalinata
  ZB = -1208;         // il fondo dell'acropoli, sotto la parete
const HW1 = 136, HW2 = 176, HW3 = 128, SW1 = 40, SW2 = 32, RA = 104, RB = 136, ZR = -560;   // mezze larghezze dei piani e delle scalinate; le due rampe dal lago
// la valle: dal valico dietro i Monti del Drago fino al lago (stringendosi: la città resta chiusa tra le pareti)
W.CARVE.push({ pts: [[2640, 150, 214, 1], [2610, -150, 246, 1], [2505, -420, 290, 0.95], [2450, -520, 322, 0.7], [XC, -580, Y0, 0.52]], w: 55, w2: 270 });
// i gradoni scavati nella montagna
W.SHAPERS.push({ box: [XC - 320, ZB - 64, XC + 320, -504], f(x, z, h) {
  const dx = Math.abs(x - XC);
  if (z > ZF) {   // davanti alla terrazza: la conca del lago e le due rampe che salgono ai suoi lati
    const k = sm(-512, -560, z); if (k <= 0) return h;
    const yr = lerp(Y0, Y1, c01((ZR - z) / (ZR - ZF)));
    let t;
    if (dx < RA) t = Y0 - (dx <= 96 && z <= -576 ? 1.6 * sm(96, 86, dx) * sm(-576, -586, z) : 0);
    else if (dx <= RB) t = yr;
    else t = lerp(yr, Math.max(h, yr), sm(RB, RB + 64, dx));
    return lerp(h, t, k);
  }
  if (z < ZB) return lerp(lerp(Y3, Math.max(h, Y3), sm(0, 40, ZB - z)), h, sm(HW3, HW3 + 60, dx));
  let lev, hw;
  if (z >= ZT) { lev = Y1; hw = HW1; }
  else if (z > ZS1) { lev = dx <= SW1 ? lerp(Y1, Y2, (ZT - z) / (ZT - ZS1)) : Y2; hw = HW2; }
  else if (z >= ZN2) { lev = Y2; hw = HW2; }
  else if (z > ZS2) { lev = dx <= SW2 ? lerp(Y2, Y3, (ZN2 - z) / (ZN2 - ZS2)) : Y3; hw = HW3; }
  else { lev = Y3; hw = HW3; }
  return dx <= hw ? lev : lerp(lev, Math.max(h, lev), sm(0, 56, dx - hw));
} });

// ---------- strade, nomi, cartelli ----------
W.ROADS.push(
  // dal sentiero del Picco del Drago, oltre il valico, giù nella valle e fino alla rampa di levante
  { w: 8, pts: [[2308, 684], [2400, 668], [2500, 610], [2580, 520], [2625, 420], [2645, 300], [2640, 150], [2625, 0], [2605, -160], [2560, -300], [2505, -420], [2520, -500], [2544, -564]] },
  { w: 7, pts: [[2520, -500], [2440, -532], [2330, -540], [2304, -564]] });
W.PLACES.push([XC - 72, -716, 94, 'LA GRANDE TERRAZZA'], [XC + 72, -716, 94, 'LA GRANDE TERRAZZA'], [XC - 60, -1146, 100, 'ACROPOLI DELLE ACQUE'], [XC + 60, -1146, 100, 'ACROPOLI DELLE ACQUE'], [2632, 330, 70, 'VALICO DEI GIGANTI']);
W.PROPS.push(['sign', 2326, 672], ['sign', 2652, 160], ['sign', 2532, -486]);
W.PAVE.push(['b', 'rect', XC - HW1, ZT, XC + HW1, ZF], ['b', 'rect', XC + RA, ZF, XC + RB, ZR + 6], ['b', 'rect', XC - RB, ZF, XC - RA, ZR + 6],
  ['g', 'rect', XC - HW2, ZN2, XC + HW2, ZT - 8], ['b', 'rect', XC - SW1, ZS1 - 16, XC + SW1, ZT], ['b', 'rect', XC - SW2, ZS2, XC + SW2, ZN2 + 24], ['b', 'rect', XC - HW3, ZB, XC + HW3, ZN2 - 8],
  // intarsi grigi sulla terrazza: il cerchio della fontana e la via di mezzo
  ['g', 'disc', XC, -716, 30], ['b', 'disc', XC, -716, 25],
  // la banchina del lago
  ['b', 'rect', XC - RB, ZR - 14, XC + RB, ZR + 6]);
W.CLEAR.push([XC - HW2 - 20, ZB - 10, XC + HW2 + 20, -548]);
W.FINE.push([XC - 420, ZB - 260, XC + 420, -440]);   // da lontano il rilievo qui resta preciso: i muri di marmo combaciano sempre con i gradoni
// statue, panchine e lampioni sulla terrazza e sull'acropoli
for (const s of [-1, 1]) {
  W.PROPS.push(['ninfa', XC + s * 32, -748], ['ninfa', XC + s * 32, -684], ['bench', XC + s * 58, ZF - 9], ['bench', XC + s * 80, ZF - 9], ['lamp', XC + s * 46, ZF - 6], ['lamp', XC + s * 92, ZF - 6],
    ['lamp', XC + s * 60, -716], ['bench', XC + s * 66, -706], ['bench', XC + s * 66, -726], ['pot', XC + s * 100, -716], ['pot', XC + s * 21, ZT + 22], ['lamp', XC + s * 100, ZT + 40],
    ['ninfa', XC + s * 46, ZS2 - 62], ['pot', XC + s * 20, ZS2 - 8], ['lamp', XC + s * 60, ZS2 - 44], ['bench', XC + s * 58, ZS2 - 20], ['pine', XC + s * 112, ZS2 - 24], ['pine', XC + s * 112, ZS2 - 60]);
}

// ---------- pezzi di marmo ----------
const mesh = () => W.mesh;
// acqua viva: i riquadri disegnati da fn scorrono (4: cade, 5: si muove piano)
function flusso(f, fn) { const n0 = W.mesh.length; fn(); for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] = 0.93 + 2 * f; }
// il rivestimento dei gradoni: un riquadro per ogni cella ripida del rilievo, appoggiato sulla roccia (stessa diagonale del terreno)
function riveste(g, x0, z0, x1, z1, tile = TL.MARBLE, min = 4, f = 0) {
  const tx = tile % 8, ty = Math.floor(tile / 8), M = W.mesh;
  for (let z = z0; z < z1; z += 8) for (let x = x0; x < x1; x += 8) {
    const a = g(x, z), b = g(x, z + 8), c = g(x + 8, z + 8), d = g(x + 8, z); if (Math.max(a, b, c, d) - Math.min(a, b, c, d) < min) continue;
    const gx = (d + c - a - b) / 16, gz = (b + c - a - d) / 16, n = Math.hypot(gx, 1, gz), nx = -gx / n, ny = 1 / n, nz = -gz / n, e = f ? 0.8 : 0.45, X = Math.abs(gz) >= Math.abs(gx);
    const sh = f ? 0.93 + 2 * f : Math.min(0.97, K.faceLight(nx, ny, nz) + 0.08), sc = tile === TL.MARBLE ? 16 : 8;   // sui muri grandi i blocchi sono grandi
    // (riquadri contati da un punto vicino: numeri piccoli, precisi anche sui telefoni vecchi)
    const vs = f ? 14 : sc, u0 = Math.floor((X ? x : z) / sc) * sc, v0 = Math.ceil(Math.max(a, b, c, d) / vs) * vs;
    for (const [px, py, pz] of [[x, a, z], [x, b, z + 8], [x + 8, c, z + 8], [x + 8, d, z]]) M.push(px + nx * e, py + ny * e, pz + nz * e, tx, ty, ((X ? px : pz) - u0) / sc, (v0 - py) / vs, sh);
  }
}
// balaustra tra due punti (anche in salita), con i pilastrini; chiude il passo
function balaustra(x0, z0, x1, z1, ya, yb, b) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 6)), m = Math.max(1, Math.round(L / 24));
  quad([x0, ya, z0], [x1, yb, z1], [x1, yb + 3.4, z1], [x0, ya + 3.4, z0], TL.BALUSTER, n, 1, 0.95);
  for (let k = 0; k <= m; k++) { const px = x0 + (x1 - x0) * k / m, pz = z0 + (z1 - z0) * k / m, py = ya + (yb - ya) * k / m; box(px - 0.9, pz - 0.9, px + 0.9, pz + 0.9, py - 1, py + 4.3, TL.MARBLE); }
  W.addBox(Math.min(x0, x1) - 0.8, Math.min(z0, z1) - 0.8, Math.max(x0, x1) + 0.8, Math.max(z0, z1) + 0.8, Math.max(ya, yb) + 3.4, b);
}
// fascia col fregio azzurro e oro attorno a un rettangolo
function fregio(x0, z0, x1, z1, y0, y1) {
  const h = y1 - y0, ux = Math.max(1, Math.round((x1 - x0) / h)), uz = Math.max(1, Math.round((z1 - z0) / h)), e = 0.06;
  quad([x0, y0, z1 + e], [x1, y0, z1 + e], [x1, y1, z1 + e], [x0, y1, z1 + e], TL.FRIEZE, ux, 1); quad([x1, y0, z0 - e], [x0, y0, z0 - e], [x0, y1, z0 - e], [x1, y1, z0 - e], TL.FRIEZE, ux, 1);
  quad([x1 + e, y0, z1], [x1 + e, y0, z0], [x1 + e, y1, z0], [x1 + e, y1, z1], TL.FRIEZE, uz, 1); quad([x0 - e, y0, z0], [x0 - e, y0, z1], [x0 - e, y1, z1], [x0 - e, y1, z0], TL.FRIEZE, uz, 1);
}
// colonna scanalata con plinto e capitello
function colonna(x, z, y, h, r = 1.5, b) {
  box(x - r * 1.5, z - r * 1.5, x + r * 1.5, z + r * 1.5, y - 1.5, y + 1, TL.MARBLE);
  oct(x, z, r, y + 1, y + h - 1.4, TL.FLUTE);
  box(x - r * 1.5, z - r * 1.5, x + r * 1.5, z + r * 1.5, y + h - 1.4, y + h, TL.MARBLE);
  if (b !== undefined) W.addBox(x - r * 1.2, z - r * 1.2, x + r * 1.2, z + r * 1.2, y + h, b);
}
// vasca col bordo di marmo e l'acqua che si muove
function vasca(x0, z0, x1, z1, y, b, rim = 1.3) {
  for (const r of [[x0 - 1.6, z0 - 1.6, x1 + 1.6, z0], [x0 - 1.6, z1, x1 + 1.6, z1 + 1.6], [x0 - 1.6, z0, x0, z1], [x1, z0, x1 + 1.6, z1]]) box(r[0], r[1], r[2], r[3], y - 2, y + rim, TL.MARBLE);
  flusso(5, () => quad([x0, y + rim - 0.5, z1], [x1, y + rim - 0.5, z1], [x1, y + rim - 0.5, z0], [x0, y + rim - 0.5, z0], TL.POOLW, (x1 - x0) / 8, (z1 - z0) / 8));
  W.addBox(x0 - 1.6, z0 - 1.6, x1 + 1.6, z1 + 1.6, y + rim, b);
}
// cascata che esce da un doccione in cima a un muro e cade verso sud: x, z del ciglio, zf dove cade, da yt a yb
function cascata(x, z, zf, yt, yb, w, forza = 1) {
  box(x - w / 2 - 1.2, z - 3, x + w / 2 + 1.2, zf, yt - 2.6, yt - 0.3, TL.MARBLE);
  box(x - w / 2 - 1.2, z - 3, x - w / 2, zf, yt - 0.3, yt + 0.5, TL.MARBLE); box(x + w / 2, z - 3, x + w / 2 + 1.2, zf, yt - 0.3, yt + 0.5, TL.MARBLE);
  flusso(4, () => {
    quad([x - w / 2, yt + 0.1, zf], [x + w / 2, yt + 0.1, zf], [x + w / 2, yt + 0.1, z - 3], [x - w / 2, yt + 0.1, z - 3], TL.FALL, w / 8, (zf - z + 3) / 10);
    quad([x - w / 2, yb, zf + 0.25], [x + w / 2, yb, zf + 0.25], [x + w / 2, yt + 0.1, zf + 0.25], [x - w / 2, yt + 0.1, zf + 0.25], TL.FALL, w / 8, (yt - yb) / 11);
    quad([x - w * 0.36, yb, zf + 0.9], [x + w * 0.3, yb, zf + 0.9], [x + w * 0.3, yt - 1.5, zf + 0.9], [x - w * 0.36, yt - 1.5, zf + 0.9], TL.FALL, w * 0.66 / 8 + 0.31, (yt - yb) / 8);
  });
  W.falls.push([x, yb, zf + 1.2, w + 2, 1, forza]);
}
// portico: due file di colonne lungo z, architrave col fregio e tetto azzurro
function portico(xa, xb, z0, z1, y, b, hc = 16) {
  const n = Math.round((z1 - z0) / 12);
  for (let k = 0; k <= n; k++) { const z = z0 + (z1 - z0) * k / n; colonna(xa, z, y, hc, 1.5, b); colonna(xb, z, y, hc, 1.5, b); }
  const x0 = Math.min(xa, xb) - 2.4, x1 = Math.max(xa, xb) + 2.4, t = y + hc;
  box(x0, z0 - 2.4, x1, z1 + 2.4, t, t + 3.2, TL.MARBLE); fregio(x0, z0 - 2.4, x1, z1 + 2.4, t + 0.2, t + 3.2);
  hip(x0, z0 - 2.4, x1, z1 + 2.4, t + 3.2, 5, TL.ROOF_BLUE, 1.2);
}
// sperone a tre riseghe contro un muro a scarpa che guarda a sud (in cima il muro sta a zt, al piede a zb)
function sperone(x, zt, zb, yb, yt, hw = 2.6) {
  for (let k = 0; k < 3; k++) { const y0 = yb + (yt - yb) * k / 3, y1 = yb + (yt - yb) * (k + 1) / 3, zw = zb + (zt - zb) * k / 3; box(x - hw + k * 0.5, zt - 1, x + hw - k * 0.5, zw + 2.4, y0 - (k ? 0 : 2), y1, TL.MARBLE); }
}
// arcate cieche al piede di un muro che guarda a sud: una fila di archi alti h tra xa e xb
function arcate(xa, xb, z, y, h, b) {
  const n = Math.max(1, Math.round((xb - xa) / (h * 0.86)));
  box(xa, z - 3, xb, z + 1.4, y - 2, y + h + 1, TL.MARBLE); box(xa - 0.5, z - 3, xb + 0.5, z + 1.9, y + h + 1, y + h + 2.2, TL.MARBLE);
  quad([xa, y, z + 1.46], [xb, y, z + 1.46], [xb, y + h, z + 1.46], [xa, y + h, z + 1.46], TL.ARCH_M, n, 1);
  if (b !== undefined) W.addBox(xa, z - 3, xb, z + 1.4, y + h, b);
}
// asta con la bandiera azzurra
const asta = (x, z, y, h) => { box(x - 0.28, z - 0.28, x + 0.28, z + 0.28, y, y + h, TL.GOLD); W.flags.push([x, y + h, z, 2]); };
// vaso di marmo con un alberello
const vaso = (x, z, y, b) => { prism(x, z, 2.2, y - 1, y + 2.4, TL.MARBLE, 8); W.addBox(x - 1.8, z - 1.8, x + 1.8, z + 1.8, y + 2.4, b); };

// ---------- il lago e il fronte della terrazza ----------
const PARTI = {
  fronte(b, g) {
    // i gradoni rivestiti di marmo, dal lago al parapetto, e i fianchi delle rampe
    riveste(g, XC - RB, ZF - 8, XC + RB, ZR + 8);
    // il lago ai piedi del muro
    flusso(5, () => quad([XC - 100, Y0 - 0.55, -572], [XC + 100, Y0 - 0.55, -572], [XC + 100, Y0 - 0.55, ZF + 6], [XC - 100, Y0 - 0.55, ZF + 6], TL.POOLW, 25, 10));
    // speroni e arcate lungo il muro, a filo dell'acqua
    for (const s of [-1, 1]) { sperone(XC + s * 34, ZF, ZF + 8, Y0 - 1.6, Y1 - 4.6); sperone(XC + s * 92, ZF, ZF + 8, Y0 - 1.6, Y1 - 4.6, 3); arcate(XC + s * 18, XC + s * 31, ZF + 8, Y0 - 0.6, 13); arcate(XC + s * 73, XC + s * 88.5, ZF + 8, Y0 - 0.6, 13); arcate(XC + s * 37, XC + s * 51, ZF + 8, Y0 - 0.6, 13); }
    // tre cascate: due dai doccioni, una larga sotto il belvedere
    cascata(XC - 62, ZF, ZF + 12, Y1, Y0 - 0.6, 12, 1.6); cascata(XC + 62, ZF, ZF + 12, Y1, Y0 - 0.6, 12, 1.6); cascata(XC, ZF, ZF + 14, Y1 - 1, Y0 - 0.6, 26, 2.4);
    // il parapetto sul vuoto (aperto dove arrivano le rampe) e la cornice col fregio
    box(XC - RA + 1, ZF - 2.6, XC + RA - 1, ZF + 0.5, Y1 - 4.4, Y1 + 0.3, TL.MARBLE); fregio(XC - RA + 1, ZF - 2.6, XC + RA - 1, ZF + 0.5, Y1 - 4.2, Y1 - 0.2);
    for (const s of [-1, 1]) {
      balaustra(XC + s * 13, ZF - 1.4, XC + s * (RA - 2), ZF - 1.4, Y1 + 0.3, Y1 + 0.3, b);
      // le rampe: balaustra verso il lago e due lampioni di marmo all'imbocco
      balaustra(XC + s * (RA - 1.5), ZF - 1.4, XC + s * (RA - 1.5), ZR + 2, Y1 + 0.3, Y0 + 1.6, b);
      for (const zz of [ZR + 2, ZF - 1.4]) { const yy = g(XC + s * (RB - 2), zz); colonna(XC + s * (RA - 1.5), zz, zz > ZF ? Y0 : Y1, 9, 1.1); W.glows.push([XC + s * (RA - 1.5), (zz > ZF ? Y0 : Y1) + 10.4, zz, 5, 0.75, 0.9, 1, 0]); }
    }
    // il belvedere sopra la grande cascata, con le due bandiere
    balaustra(XC - 13, ZF - 1.4, XC + 13, ZF - 1.4, Y1 + 0.3, Y1 + 0.3, b);
    for (const s of [-1, 1]) { asta(XC + s * 13, ZF - 1.4, Y1 + 4, 15); asta(XC + s * (RA - 2), ZF - 1.4, Y1 + 4, 11); }
  },
  // ---------- la Grande Terrazza ----------
  terrazza(b, g) {
    // i due portici lungo i fianchi
    for (const s of [-1, 1]) portico(XC + s * 112, XC + s * 126, ZT + 16, ZF - 14, Y1, b);
    // la fontana al centro, in una vasca ottagonale
    prism(XC, -716, 19, Y1 - 2, Y1 + 1.5, TL.MARBLE, 8);
    flusso(5, () => { const tp = []; for (let k = 0; k < 8; k++) tp.push([XC + Math.cos(k / 8 * TAU) * 17.6, Y1 + 0.9, -716 + Math.sin(k / 8 * TAU) * 17.6]); for (let k = 1; k < 7; k += 2) quad(tp[0], tp[k], tp[k + 1], tp[(k + 2) % 8], TL.POOLW, 3, 3); });
    prism(XC, -716, 3, Y1, Y1 + 7, TL.MARBLE, 8); prism(XC, -716, 8.5, Y1 + 6.4, Y1 + 7.8, TL.MARBLE, 8);
    flusso(5, () => { const tp = []; for (let k = 0; k < 8; k++) tp.push([XC + Math.cos(k / 8 * TAU) * 7.6, Y1 + 7.9, -716 + Math.sin(k / 8 * TAU) * 7.6]); for (let k = 1; k < 7; k += 2) quad(tp[0], tp[k], tp[k + 1], tp[(k + 2) % 8], TL.POOLW, 2, 2); });
    prism(XC, -716, 1.5, Y1 + 7.8, Y1 + 14, TL.MARBLE, 8); prism(XC, -716, 4, Y1 + 13.4, Y1 + 14.4, TL.MARBLE, 8); prism(XC, -716, 0.8, Y1 + 14.4, Y1 + 17, TL.GOLD, 8);
    W.addBox(XC - 17, -733, XC + 17, -699, Y1 + 1.5, b); W.sprays.push([XC, Y1 + 17.2, -716, 8], [XC, Y1 + 8.5, -716, 16]);
    // il muro della città: marmo sui gradoni, la scalinata, due cascate nelle loro vasche
    riveste(g, XC - HW1, ZS1 - 8, XC - SW1, ZT + 8); riveste(g, XC + SW1, ZS1 - 8, XC + HW1, ZT + 8); riveste(g, XC - SW1, ZS1, XC + SW1, ZT, TL.STEPS, 2);   // (oltre la terrazza il gradone resta di roccia)
    for (const s of [-1, 1]) {
      cascata(XC + s * 92, ZT - 8, ZT + 5, Y2, Y1 + 0.8, 10, 1.1); vasca(XC + s * 92 - 9, ZT + 1.5, XC + s * 92 + 9, ZT + 14, Y1, b);
      // parapetti in cima al muro e lungo la scalinata
      const xa = XC + s * (SW1 + 9.4), xb = XC + s * (HW1 + 2);
      box(Math.min(xa, xb), ZT - 10.6, Math.max(xa, xb), ZT - 7.4, Y2 - 4.4, Y2 + 0.3, TL.MARBLE); fregio(Math.min(xa, xb), ZT - 10.6, Math.max(xa, xb), ZT - 7.4, Y2 - 4.2, Y2 - 0.2);
      balaustra(xa, ZT - 9.4, XC + s * 85, ZT - 9.4, Y2 + 0.3, Y2 + 0.3, b); balaustra(XC + s * 99, ZT - 9.4, xb, ZT - 9.4, Y2 + 0.3, Y2 + 0.3, b);
      balaustra(xa, ZT - 9.4, xa, ZS1 - 2, Y2 + 0.3, Y2 + 0.3, b);
      // speroni e arcate ai piedi del muro
      for (const xx of [66, 120]) sperone(XC + s * xx, ZT - 8, ZT, Y1 - 1, Y2 - 4.6, 2.4);
      arcate(XC + s * 70, XC + s * 81, ZT, Y1, 10, b); arcate(XC + s * 103, XC + s * 116.5, ZT, Y1, 10, b);
      // due colonne con la fiamma azzurra ai piedi della scalinata
      colonna(XC + s * (SW1 + 5), ZT + 6, Y1, 13, 1.7, b); W.glows.push([XC + s * (SW1 + 5), Y1 + 15, ZT + 6, 7, 0.7, 0.88, 1, 0]);
      // vasi con gli alberelli
      for (const zz of [ZF - 14, -700, -732, ZT + 26]) vaso(XC + s * 100, zz, Y1, b);
    }
  },
  // ---------- l'acropoli ----------
  acropoli(b, g) {
    // il muro e la scalinata
    riveste(g, XC - HW3, ZS2 - 8, XC - SW2, ZN2 + 8); riveste(g, XC + SW2, ZS2 - 8, XC + HW3, ZN2 + 8); riveste(g, XC - SW2, ZS2, XC + SW2, ZN2, TL.STEPS, 2);
    for (const s of [-1, 1]) {
      const xa = XC + s * (SW2 + 9.4), xb = XC + s * HW3;
      box(Math.min(xa, xb), ZN2 - 10.6, Math.max(xa, xb), ZN2 - 7.4, Y3 - 4.4, Y3 + 0.3, TL.MARBLE); fregio(Math.min(xa, xb), ZN2 - 10.6, Math.max(xa, xb), ZN2 - 7.4, Y3 - 4.2, Y3 - 0.2);
      balaustra(xa, ZN2 - 9.4, XC + s * 77, ZN2 - 9.4, Y3 + 0.3, Y3 + 0.3, b); balaustra(XC + s * 91, ZN2 - 9.4, xb, ZN2 - 9.4, Y3 + 0.3, Y3 + 0.3, b);
      balaustra(xa, ZN2 - 9.4, xa, ZS2 - 2, Y3 + 0.3, Y3 + 0.3, b);
      for (const xx of [56, 108]) sperone(XC + s * xx, ZN2 - 8, ZN2, Y2 - 1, Y3 - 4.6, 2.6);
      arcate(XC + s * 36, XC + s * 53, ZN2, Y2, 12, b); arcate(XC + s * 59, XC + s * 73, ZN2, Y2, 12, b); arcate(XC + s * 95, XC + s * 105, ZN2, Y2, 12, b); arcate(XC + s * 111, XC + s * 127, ZN2, Y2, 12, b);
      // le sorgenti: l'acqua scende dalla parete, riempie la vasca, corre nel canale e cade verso la città
      const cx = XC + s * 84;
      riveste(g, cx - 16, ZB - 64, cx + 16, ZB, TL.FALL, 3, 4); W.falls.push([cx, Y3 + 1.2, ZB + 3, 30, 1, 2.2]);
      vasca(cx - 26, ZB + 2, cx + 26, ZB + 40, Y3, b, 1.5);
      for (const q of [-1, 1]) box(cx + q * 5 - 0.8, ZB + 41.6, cx + q * 5 + 0.8, ZN2 - 8, Y3 - 2, Y3 + 1.5, TL.MARBLE);
      flusso(4, () => quad([cx - 4.2, Y3 + 1, ZN2 - 8], [cx + 4.2, Y3 + 1, ZN2 - 8], [cx + 4.2, Y3 + 1, ZB + 41.6], [cx - 4.2, Y3 + 1, ZB + 41.6], TL.FALL, 1, (ZN2 - 8 - ZB - 41.6) / 12));
      W.addBox(cx - 5.8, ZB + 41.6, cx + 5.8, ZN2 - 8, Y3 + 1.5, b);
      cascata(cx, ZN2 - 8, ZN2 + 5, Y3 + 0.9, Y2 + 0.8, 8.4, 1.3); vasca(cx - 9, ZN2 + 1.5, cx + 9, ZN2 + 15, Y2, b);
      // colonne votive lungo il viale
      for (const zz of [ZS2 - 10, ZS2 - 30]) { colonna(XC + s * 44, zz, Y3, 14, 1.6, b); W.glows.push([XC + s * 44, Y3 + 16, zz, 7, 0.7, 0.88, 1, 0]); }
    }
    // il Tempio delle Acque: gradini, un giro di colonne, la cella, il frontone e l'acroterio d'oro
    const tx0 = XC - 30, tx1 = XC + 30, tz0 = ZB + 14, tz1 = ZS2 - 46, ty = Y3 + 3.2, hc = 24;
    for (let k = 0; k < 3; k++) box(tx0 - 6 + k * 2, tz0 - 6 + k * 2, tx1 + 6 - k * 2, tz1 + 6 - k * 2, Y3 - 2, Y3 + 1.2 + k, TL.MARBLE);
    W.addBox(tx0 - 5, tz0 - 5, tx1 + 5, tz1 + 5, ty, b);
    for (let k = 0; k < 6; k++) { const x = tx0 + (tx1 - tx0) * k / 5; colonna(x, tz1, ty, hc, 1.9); colonna(x, tz0, ty, hc, 1.9); }
    for (let k = 1; k < 8; k++) { const z = tz0 + (tz1 - tz0) * k / 8; colonna(tx0, z, ty, hc, 1.9); colonna(tx1, z, ty, hc, 1.9); }
    box(tx0 + 9, tz0 + 9, tx1 - 9, tz1 - 12, ty, ty + hc, TL.MARBLE); onWall('s', tx0 + 9, tz0 + 9, tx1 - 9, tz1 - 12, XC, ty, 11, 17, TL.MARBLE_DOOR, 2);
    for (const s of [-1, 1]) onWall(s < 0 ? 'w' : 'e', tx0 + 9, tz0 + 9, tx1 - 9, tz1 - 12, (tz0 + tz1) / 2 - 2, ty + 7, 6, 10, TL.MARBLE_WIN, true);
    const et = ty + hc; box(tx0 - 3, tz0 - 3, tx1 + 3, tz1 + 3, et, et + 4.4, TL.MARBLE); fregio(tx0 - 3, tz0 - 3, tx1 + 3, tz1 + 3, et + 0.2, et + 4.2);
    gable(tx0 - 3, tz0 - 3, tx1 + 3, tz1 + 3, et + 4.4, 13, TL.ROOF_BLUE, TL.MARBLE, 1.8);
    decal(XC, et + 6.2, tz1 + 3, 1, 0, 9, 9, TL.CREST, false, 0.3);
    for (const [ax, az] of [[XC, tz1 + 3], [XC, tz0 - 3]]) { box(ax - 0.9, az - 0.9, ax + 0.9, az + 0.9, et + 17, et + 22, TL.GOLD); }
    asta(XC, tz1 + 3, et + 22, 9);
    for (const sx of [-1, 1]) for (const az of [tz1 + 3, tz0 - 3]) box(XC + sx * 33 - 0.8, az - 0.8, XC + sx * 33 + 0.8, az + 0.8, et + 4.4, et + 8, TL.GOLD);
    W.glows.push([XC, ty + 9, tz1 - 11, 10, 0.6, 0.85, 1, 0]);
    // il braciere azzurro davanti al tempio
    prism(XC, ZS2 - 22, 3.4, Y3 - 1, Y3 + 3, TL.MARBLE, 8); prism(XC, ZS2 - 22, 2.4, Y3 + 3, Y3 + 3.6, TL.GOLD, 8); W.addBox(XC - 3, ZS2 - 25, XC + 3, ZS2 - 19, Y3 + 3, b); W.glows.push([XC, Y3 + 6, ZS2 - 22, 9, 0.55, 0.85, 1, 1]);
  },
};
W.builders.marmo = (b, g) => PARTI[b.part](b, g);
W.BUILD.push({ k: 'marmo', part: 'fronte', x: XC, z: -600 }, { k: 'marmo', part: 'terrazza', x: XC - 400, z: -730 }, { k: 'marmo', part: 'acropoli', x: XC + 400, z: -1140 });

// ---------- la città ----------
C.city({ id: 'marmorea', guild: true, name: 'MARMOREA', x: XC, z: -922, w: 336, d: 164, y: Y2, style: 'marmo', open: true, noTerra: true, plaza: { w: 78, d: 60 }, board: [22, 15],
  shops: [['cigno', 'locanda', 'LOCANDA DEL CIGNO', 's1', { fw: 32, fd: 21, h: 17, roof: TL.ROOF_TEAL }], ['marmo_armi', 'armeria', "L'ARMERIA DELLE CASCATE", 's2', { roof: TL.ROOF_BLUE }],
    ['marmo_erbe', 'erboristeria', 'LA FONTE DEI RIMEDI', 'n1', { roof: TL.ROOF_TEAL }], ['marmo_gemme', 'orafo', "L'ORAFO DEL GHIACCIAIO", 'n2', { roof: TL.ROOF_BLUE }]],
  people: [
    ['saggio', "L'ARCONTE DELLE ACQUE", ['BENVENUTO A MARMOREA, VIANDANTE. POCHI SALGONO FIN QUASSÙ: IL VALICO DEI GIGANTI SPAVENTA PIÙ DEI LUPI.', "L'ACQUA CHE VEDI CADERE NASCE DAL GHIACCIAIO ETERNO. FINCHÉ SCORRE, LA CITTÀ VIVE.", 'SALI ALLA TERRAZZA AL TRAMONTO: DA LÌ SI VEDE TUTTA LA VALLE, E NEI GIORNI LIMPIDI PERFINO IL LAGO DI LUMEN.'], [12, -190, Math.PI / 2], { id: 'arconte' }],
    ['ostessa', 'OSTESSA DEL CIGNO', ['AL CIGNO SI DORME COL RUMORE DELLE CASCATE. I FORESTIERI DICONO CHE È IL SONNO PIÙ BELLO DELLA LORO VITA.'], 'in:cigno', { role: 'inn', cost: 16 }],
    ['montanaro', 'LA GUIDA DEL GHIACCIAIO', ['SOPRA LA CITTÀ NON CI SONO STRADE: SOLO NEVE, ROCCIA E VENTO. MA LUNGO LA VALLE, TRA I PINI, QUALCUNO HA NASCOSTO PIÙ DI UN FORZIERE.'], 'in:cigno:ospite1'],
    ['mercante', 'IL MERCANTE DI LUMEN', ['HO PORTATO DUE MULI DI STOFFE FIN QUI. AL RITORNO LI CARICO DI MARMO: A BORGO AURORA NON HANNO MAI VISTO UNA PIETRA COSÌ BIANCA.'], 'in:cigno:ospite2'],
    ['lanciere', "L'ARMAIOLA DELLE CASCATE", ["L'ACCIAIO TEMPRATO NELL'ACQUA DEL GHIACCIAIO NON SI SPEZZA. PROVA A PIEGARLO, SE NON MI CREDI."], 'in:marmo_armi', { role: 'shop', shop: 'marmo_armi' }],
    ['monaco', 'IL CUSTODE DELLA FONTE', ["L'ACQUA DELLA FONTE GUARISCE. IO CI AGGIUNGO SOLO LE ERBE GIUSTE E UN PO' DI PAZIENZA."], 'in:marmo_erbe', { role: 'shop', shop: 'marmo_erbe' }],
    ['dama2', "L'ORAFA", ["SOTTO IL GHIACCIO SI TROVANO PIETRE CHE NON HANNO NOME. IO LE LEGO NELL'ARGENTO E GLIENE DO UNO."], 'in:marmo_gemme', { role: 'shop', shop: 'marmo_gemme' }],
    ['guardia', 'LA SENTINELLA', ["DALLA GRANDE TERRAZZA SI VEDE CHI ARRIVA UN'ORA PRIMA CHE BUSSI. NON CHE BUSSI MAI NESSUNO.", "LE DUE RAMPE AI LATI DEL LAGO SONO L'UNICA VIA PER SALIRE. CHI HA COSTRUITO LA CITTÀ SAPEVA IL FATTO SUO."], [70, 252, -Math.PI / 2]],
    ['dama', 'LA SCULTRICE', ["OGNI COLONNA DELLA CITTÀ È STATA TAGLIATA DALLA MONTAGNA QUI DIETRO. LA MONTAGNA NON SE N'È NEMMENO ACCORTA."], 'p', { walk: 1 }],
    ['bimbo', 'LA PICCOLA NIVE', ['HO CONTATO LE CASCATE: SONO NOVE! LA PIÙ GRANDE È QUELLA SOTTO IL BELVEDERE: DA VICINO BAGNA TUTTI.'], 'p', { walk: 1 }],
    ['borghese', "IL MAESTRO D'ACQUE", ["L'ACQUA SCENDE DALLE SORGENTI DELL'ACROPOLI, PASSA SOTTO LA CITTÀ E CADE DALLA TERRAZZA NEL LAGO. NON SE NE PERDE UNA GOCCIA."], 'd'],
    ['donna', 'LA LAVANDAIA', ["D'INVERNO IL LAGO GELA E I BAMBINI CI SCIVOLANO SOPRA. LE CASCATE NO: QUELLE NON SI FERMANO MAI."], 'd', { walk: 1 }],
    ['monaco', 'IL PELLEGRINO', ['SONO SALITO DAL BORGO A PIEDI PER VEDERE IL TEMPIO DELLE ACQUE. HO LE VESCICHE, MA NE VALEVA LA PENA.'], [-22, -172, Math.PI / 2]],
    ['saggio', 'IL VECCHIO DELLA TERRAZZA', ['DA GIOVANE HO VISTO IL DRAGO VOLARE SOPRA IL PICCO, LAGGIÙ IN FONDO. DA QUASSÙ SEMBRAVA UNA RONDINE.'], [-40, 250, -Math.PI / 2]],
  ] });

W.URBAN.push([XC - HW2 - 12, ZB - 12, XC + HW2 + 12, ZR + 12]);   // lago, terrazza e acropoli sono città: niente stambecchi tra le colonne

// ---------- tane, tesori ----------
W.CAMPS.push([2660, 40, 'wolf', 3, 90], [2560, -160, 'icewolf', 3, 90], [2470, -455, 'bat', 3, 80], [2655, 250, 'icewolf', 2, 80]);
W.NOOKS.push([2668, -52, 'rocce'], [2470, -380, 'rocce']);
W.CHESTS.push(['n01', 2668, -52, 'monete:220', 1], ['n02', XC, ZB + 6, 'cuore', 2], ['n03', 2470, -380, 'elisir', 1]);
// a Borgo Aurora un mercante racconta della città di marmo: chi giocava già sa dove andare
C.folk('mercante', 'IL MERCANTE DI MARMO', 1972, 2694, -0.9, ['VENGO DA MARMOREA, LA CITTÀ DELLE CASCATE. NON LA CONOSCI? È LASSÙ, TRA I GIGANTI DI NEVE CHE VEDI A NORD.', 'SI SALE DAL SENTIERO DEL PICCO DEL DRAGO: A METÀ STRADA UN CARTELLO INDICA IL VALICO DEI GIGANTI. DA LÌ È TUTTA VALLE, FINO AL LAGO.', 'PORTATI UN MANTELLO. E OCCHI BUONI: UNA CITTÀ COSÌ NON L\'HAI MAI VISTA.'], { id: 'mercante_marmo' });

W.NORDN.nooks[1] = W.NOOKS.length; W.NORDN.props[1] = W.PROPS.length;
})();
