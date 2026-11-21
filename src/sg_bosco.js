// ===================== PIXEL SAGA · l'Albero Madre e il Santuario del Bosco =====================
// L'Albero Madre non è più un disegno piatto che gira con lo sguardo: è costruito in rilievo, come le case. Tronco a contrafforti,
// otto radici, rami, una chioma fatta di tante masse di foglie, liane, lanterne, funghi, rune e la cavità col cuore che brilla.
// Poco a nord, il Santuario del Bosco ha finalmente un ingresso da santuario: pronao a colonne col frontone, piloni, cervi di pietra,
// custodi, bracieri dalla fiamma verde e un sagrato lastricato che scende fino ai piedi dell'albero.
// Tutto sta dentro la radura di sempre (nessun albero del bosco si sposta): gli ostacoli e gli oggetti nuovi entrano per ultimi (W.LATE).
(() => {
const W = SG.world, TN = SG.town, TL = TN.TL, K = W.kit, { quad, box, boxTop, onWall, prism } = K;
const { oct, decal, pyramid } = TN;
const TAU = Math.PI * 2, lerp = (a, b, t) => a + (b - a) * t, c01 = v => Math.max(0, Math.min(1, v));
const TX = 1080, TZ = 1420;       // il piede dell'Albero Madre
const late = (x0, z0, x1, z1, top, b) => W.LATE.boxes.push([x0, z0, x1, z1, top, b]);
// i riquadri disegnati da fn brillano di luce propria (rune, lanterne, il cuore dell'albero); dec: staccati dal muro come le insegne
function acceso(fn, dec) { const n0 = W.mesh.length; fn(); for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] = 0.995 + (dec ? 2 : 0); }
// una fascia di riquadri tra due anelli di punti (A sotto, B sopra)
function fascia(A, B, tile, vr, lf) { const n = A.length; for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; quad(A[k1], A[k], B[k], B[k1], tile, 1, vr, lf ? lf(k) : undefined); } }
// un ramo: un tubo a sei facce che segue i punti [x, y, z, raggio]
function ramo(P, tile = TL.BARK, n = 6) {
  let prev = null;
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], dl = Math.hypot(d[0], d[1], d[2]) || 1; d[0] /= dl; d[1] /= dl; d[2] /= dl;
    // due direzioni di traverso al ramo
    let s = [d[2], 0, -d[0]], sl = Math.hypot(s[0], s[2]); if (sl < 0.01) s = [1, 0, 0]; else { s[0] /= sl; s[2] /= sl; }
    const u = [d[1] * s[2] - d[2] * s[1], d[2] * s[0] - d[0] * s[2], d[0] * s[1] - d[1] * s[0]], r = P[i][3], ring = [];
    for (let k = 0; k < n; k++) { const t = k / n * TAU, c = Math.cos(t) * r, q = Math.sin(t) * r; ring.push([P[i][0] + s[0] * c + u[0] * q, P[i][1] + s[1] * c + u[1] * q, P[i][2] + s[2] * c + u[2] * q]); }
    if (prev) fascia(prev, ring, tile, Math.max(1, Math.round(Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]) / 8)));
    prev = ring;
  }
}
// una massa di foglie: un ellissoide schiacciato a fasce (scuro sotto, chiaro in cima), un po' storto, con la frangia attorno
function chioma(cx, cy, cz, rx, ry, rz, R, n = 9) {
  const LV = [[0.62, -0.5], [1, -0.08], [0.84, 0.46], [0.5, 0.82]], rings = LV.map(([k, h]) => { const out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, j = 0.9 + R() * 0.2; out.push([cx + Math.cos(a) * rx * k * j, cy + ry * h + (R() - 0.5) * ry * 0.14, cz + Math.sin(a) * rz * k * j]); } return out; });
  const lum = (k, base) => { const a = (k + 0.5) / n * TAU; return c01(base + 0.09 * (Math.cos(a) * 0.5 - Math.sin(a) * 0.3)); };       // il lato verso il sole è un po' più chiaro
  const bot = [cx, cy - ry * 0.62, cz], top = [cx + (R() - 0.5) * rx * 0.2, cy + ry, cz + (R() - 0.5) * rz * 0.2];
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; quad(rings[0][k], rings[0][k1], bot, bot, TL.LEAF_D, 2, 2, 0.5); quad(rings[3][k1], rings[3][k], top, top, TL.LEAF_L, 2, 2, lum(k, 0.93)); }
  fascia(rings[0], rings[1], TL.LEAF_D, 1.5, k => lum(k, 0.62)); fascia(rings[1], rings[2], TL.LEAF_M, 1.5, k => lum(k, 0.8)); fascia(rings[2], rings[3], TL.LEAF_L, 1.5, k => lum(k, 0.9));
  // la frangia: l'orlo frastagliato che pende dal punto più largo
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n, a = rings[1][k], b = rings[1][k1], h = ry * 0.5, o = 1.07;
    quad([cx + (b[0] - cx) * o, b[1] - h, cz + (b[2] - cz) * o], [cx + (a[0] - cx) * o, a[1] - h, cz + (a[2] - cz) * o], [cx + (a[0] - cx) * 1.02, a[1] + 0.6, cz + (a[2] - cz) * 1.02], [cx + (b[0] - cx) * 1.02, b[1] + 0.6, cz + (b[2] - cz) * 1.02], TL.LEAF_FR, 2, 1, lum(k, 0.7)); }
}
// una liana: due veli incrociati che pendono
function liana(x, y, z, len, a) { const c = Math.cos(a) * 1.6, s = Math.sin(a) * 1.6, v = len / 8; quad([x - c, y - len, z - s], [x + c, y - len, z + s], [x + c, y, z + s], [x - c, y, z - s], TL.VINE, 1, v, 0.86); quad([x + s, y - len, z - c], [x - s, y - len, z + c], [x - s, y, z + c], [x + s, y, z - c], TL.VINE, 1, v, 0.8); }
// una lanterna appesa: la corda, la gabbia accesa, la luce attorno
function lanterna(x, y, z, len) {
  box(x - 0.14, z - 0.14, x + 0.14, z + 0.14, y - len, y, TL.BARK_D); box(x - 0.95, z - 0.95, x + 0.95, z + 0.95, y - len - 0.5, y - len, TL.BARK_D);
  acceso(() => box(x - 0.8, z - 0.8, x + 0.8, z + 0.8, y - len - 2.4, y - len - 0.5, TL.LANTERN));
  box(x - 0.95, z - 0.95, x + 0.95, z + 0.95, y - len - 2.8, y - len - 2.4, TL.BARK_D); W.glows.push([x, y - len - 1.4, z, 7, 0.75, 0.62, 0.32, 1]);
}

// ---------- l'Albero Madre ----------
const NR = 8, radA = j => (j + 0.5) / NR * TAU;                 // le otto radici: a nord (dove sta il forziere) e a sud (dove si apre la cavità) resta un varco
// il tronco: [quota, raggio, quanto sporgono i contrafforti sopra le radici]
const TRUNK = [[-3, 19, 0.3], [3, 16.4, 0.27], [9, 14.2, 0.19], [18, 12.5, 0.1], [30, 11.5, 0.05], [42, 11.3, 0.03], [50, 12.4, 0.02], [57, 13.6, 0]];
// raggio del tronco a una certa quota, tra due radici (rad = false) o sopra una radice (rad = true)
const pende = y => [Math.sin(y * 0.05) * 1.2, Math.cos(y * 0.04) * 0.9];      // il tronco non sale dritto: il centro si sposta un poco con la quota
// un punto sulla corteccia: all'angolo a, alla quota y, staccato di e
function pelle(a, y, e = 0) { const l = pende(y), r = raggio(y, false) + e; return [TX + l[0] + Math.cos(a) * r, TZ + l[1] + Math.sin(a) * r]; }
function raggio(y, rad) { let i = 0; while (i < TRUNK.length - 2 && y > TRUNK[i + 1][0]) i++; const a = TRUNK[i], b = TRUNK[i + 1], t = c01((y - a[0]) / (b[0] - a[0])), r = lerp(a[1], b[1], t), l = lerp(a[2], b[2], t); return r * (rad ? 1 + l : 1 - l * 0.4); }
W.builders.albero = (b, g) => {
  const y0 = g(TX, TZ), R = rng(1420), N = NR * 2, jit = []; for (let k = 0; k < N; k++) jit.push(0.97 + R() * 0.06);
  // il tronco: sedici spigoli, uno sì e uno no sporge a contrafforte sopra una radice
  const anello = ([y, r, l], i) => { const out = [], lean = pende(y); for (let k = 0; k < N; k++) { const a = k / N * TAU, rr = r * (k % 2 === 1 ? 1 + l : 1 - l * 0.4) * jit[k]; out.push([TX + lean[0] + Math.cos(a) * rr, y0 + y, TZ + lean[1] + Math.sin(a) * rr]); } return out; };
  const rings = TRUNK.map(anello);
  for (let i = 0; i < rings.length - 1; i++) fascia(rings[i], rings[i + 1], TL.BARK, Math.max(1, Math.round((TRUNK[i + 1][0] - TRUNK[i][0]) / 8)));
  { const top = [TX, y0 + 62, TZ], A = rings[rings.length - 1]; for (let k = 0; k < N; k++) quad(A[(k + 1) % N], A[k], top, top, TL.BARK_D, 1, 1); }
  // le radici: creste che escono dal tronco, si piegano e affondano nella terra
  for (let j = 0; j < NR; j++) {
    const a0 = radA(j), nord = Math.sin(a0) < -0.85, L = (nord ? 27 : 34 + R() * 7), bend = (R() - 0.5) * 0.5, S = [], LB = [], RB = [];
    const prof = [[0.1, 17.5, 4.2], [0.34, 12, 4.8], [0.58, 6.8, 3.8], [0.8, 3, 2.6], [1, -0.4, 1]];
    for (const [t, h, w] of prof) { const r = lerp(11, L, t), a = a0 + bend * t * t, x = TX + Math.cos(a) * r, z = TZ + Math.sin(a) * r, px = -Math.sin(a), pz = Math.cos(a), gy = g(x, z) - 1.2;
      S.push([x, Math.max(gy + 0.4, y0 + h + (R() - 0.5) * 0.8), z]); LB.push([x + px * w, gy, z + pz * w]); RB.push([x - px * w, gy, z - pz * w]); }
    for (let i = 0; i < S.length - 1; i++) { quad(LB[i], LB[i + 1], S[i + 1], S[i], TL.BARK_D, 1, 1); quad(RB[i + 1], RB[i], S[i], S[i + 1], TL.BARK_D, 1, 1); }
    // dove la radice è alta non si passa; verso la punta la si scavalca
    for (const t of [0.36, 0.56]) { const r = lerp(11, L, t), a = a0 + bend * t * t; W.LATE.circles.push([TX + Math.cos(a) * r, TZ + Math.sin(a) * r, t < 0.5 ? 3.6 : 2.8]); }
    // un ciuffo di muschio a cavallo della cresta
    if (j % 2 === 0) { const m = S[2], n2 = S[3]; quad([m[0], m[1] - 3.2, m[2]], [n2[0], n2[1] - 2.6, n2[2]], [n2[0], n2[1] + 0.15, n2[2]], [m[0], m[1] + 0.15, m[2]], TL.MOSS, 2, 1, 0.9); }
  }
  // la cavità a sud, col cuore dell'albero che brilla, e due lanterne ai lati
  { const yb = y0 + 0.6, yt = y0 + 15.5, pb = pelle(TAU / 4, 0.6, 0.7), pt = pelle(TAU / 4, 15.5, 0.8);
    acceso(() => quad([pb[0] - 6.2, yb, pb[1]], [pb[0] + 6.2, yb, pb[1]], [pt[0] + 6.2, yt, pt[1]], [pt[0] - 6.2, yt, pt[1]], TL.HOLLOW, 1, 1), true);
    W.glows.push([TX, y0 + 5, TZ + 19, 16, 0.78, 1, 0.5, 1]); }
  // rune incise sulla corteccia, a spirale
  for (const [deg, y, s] of [[40, 21, 5], [138, 26, 5.4], [205, 19, 5], [318, 24, 5.4], [262, 31, 4.6], [90, 33, 5]]) { const a = deg / 360 * TAU, p0 = pelle(a, y, 0.9), p1 = pelle(a, y + s, 0.9), px = -Math.sin(a) * s / 2, pz = Math.cos(a) * s / 2;
    acceso(() => quad([p0[0] - px, y0 + y, p0[1] - pz], [p0[0] + px, y0 + y, p0[1] + pz], [p1[0] + px, y0 + y + s, p1[1] + pz], [p1[0] - px, y0 + y + s, p1[1] - pz], TL.RUNE_G, 1, 1), true); }
  // mensole di funghi
  for (const [deg, y, r] of [[20, 9, 2.6], [28, 12.5, 2], [14, 15, 1.6], [168, 10, 2.8], [176, 14, 2.1], [160, 17.5, 1.5], [300, 12, 2.4], [292, 16, 1.8]]) { const a = deg / 360 * TAU, c = pelle(a, y, r * 0.2); prism(c[0], c[1], r, y0 + y, y0 + y + 0.7, TL.FUNGUS, 7); const t = [c[0], y0 + y + 1.3, c[1]];
    for (let k = 0; k < 7; k++) { const a0 = k / 7 * TAU, a1 = (k + 1) / 7 * TAU; quad([t[0] + Math.cos(a1) * r, y0 + y + 0.7, t[2] + Math.sin(a1) * r], [t[0] + Math.cos(a0) * r, y0 + y + 0.7, t[2] + Math.sin(a0) * r], t, t, TL.FUNGUS, 1, 1); } }
  // i rami maestri (sei, a raggiera) e la cima
  const RAMI = [];
  for (let i = 0; i < 6; i++) { const a = (i + 0.3) / 6 * TAU + (R() - 0.5) * 0.3, ca = Math.cos(a), sa = Math.sin(a), tw = (R() - 0.5) * 9, up = R() * 5;
    const P = [[TX + ca * 4, y0 + 49, TZ + sa * 4, 6.2], [TX + ca * 19 - sa * tw * 0.3, y0 + 60 + up * 0.4, TZ + sa * 19 + ca * tw * 0.3, 4.6], [TX + ca * 33 - sa * tw, y0 + 69 + up, TZ + sa * 33 + ca * tw, 3.1], [TX + ca * 43 - sa * tw, y0 + 76 + up, TZ + sa * 43 + ca * tw, 1.6]];
    ramo(P); RAMI.push([a, P[3], P[2]]); }
  ramo([[TX, y0 + 54, TZ, 8.2], [TX + 2.5, y0 + 72, TZ - 1.5, 5.6], [TX - 1.5, y0 + 90, TZ + 1, 3.4], [TX, y0 + 102, TZ, 1.6]]);
  // tre rami bassi, da cui pendono le lanterne
  const BASSI = [];
  for (const deg of [58, 122, 196, 344]) { const a = deg / 360 * TAU, ca = Math.cos(a), sa = Math.sin(a), P = [[TX + ca * 8, y0 + 36, TZ + sa * 8, 3.3], [TX + ca * 21, y0 + 43, TZ + sa * 21, 2.5], [TX + ca * 33, y0 + 46, TZ + sa * 33, 1.7], [TX + ca * 41, y0 + 45, TZ + sa * 41, 0.9]]; ramo(P, TL.BARK_D, 5); BASSI.push(P); }
  // la chioma: una massa in fondo a ogni ramo, una tra un ramo e l'altro più in alto, la corona in cima, ciuffi sui rami bassi
  for (const [a, e] of RAMI) chioma(e[0] + Math.cos(a) * 3, e[1] + 6, e[2] + Math.sin(a) * 3, 22 + R() * 3, 12 + R() * 2, 22 + R() * 3, R);
  for (let i = 0; i < 6; i++) { const a = (i + 0.8) / 6 * TAU, r = 25 + R() * 4; chioma(TX + Math.cos(a) * r, y0 + 93 + R() * 4, TZ + Math.sin(a) * r, 21 + R() * 3, 12 + R() * 2, 21 + R() * 3, R); }
  for (let i = 0; i < 4; i++) { const a = (i + 0.4) / 4 * TAU; chioma(TX + Math.cos(a) * 14, y0 + 104 + R() * 3, TZ + Math.sin(a) * 14, 18, 10.5, 18, R); }
  for (let i = 0; i < 6; i++) { const a = (i + 0.82) / 6 * TAU, r = 37 + R() * 4; chioma(TX + Math.cos(a) * r, y0 + 81 + R() * 3, TZ + Math.sin(a) * r, 16 + R() * 2, 8.5 + R(), 16 + R() * 2, R, 8); }      // tra un ramo e l'altro, più in basso: la chioma è piena anche vista da sotto
  chioma(TX, y0 + 113, TZ, 24, 13, 24, R);
  for (const P of BASSI) { const e = P[3]; chioma(e[0], e[1] + 4.5, e[2], 12.5, 6.6, 12.5, R, 8); }
  // liane sotto la chioma e lungo i rami bassi
  for (const [a, e, m] of RAMI) { liana(e[0] + Math.cos(a) * 6, e[1] - 2, e[2] + Math.sin(a) * 6, 15 + R() * 13, R() * 3); liana(m[0] - Math.sin(a) * 4, m[1] - 2, m[2] + Math.cos(a) * 4, 11 + R() * 9, R() * 3); liana(e[0] - Math.sin(a) * 12, e[1] - 1, e[2] + Math.cos(a) * 12, 12 + R() * 12, R() * 3); }
  for (const P of BASSI) { liana(P[2][0], P[2][1] - 1, P[2][2], 9 + R() * 6, R() * 3); lanterna(P[1][0] + (P[2][0] - P[1][0]) * 0.55, P[1][1] + (P[2][1] - P[1][1]) * 0.55 - 2, P[1][2] + (P[2][2] - P[1][2]) * 0.55, 6 + R() * 4); }
  // lucciole e bagliori tra le foglie: di notte l'albero è acceso
  for (let i = 0; i < 7; i++) { const a = R() * TAU, r = 20 + R() * 30; W.glows.push([TX + Math.cos(a) * r, y0 + 58 + R() * 14, TZ + Math.sin(a) * r, 12, 0.6, 1, 0.55, 1]); }
};
W.BUILD.push({ k: 'albero', x: TX, z: TZ });
(W.bigShadows = W.bigShadows || []).push([TX, TZ, 52]);
// attorno al piede: pietre con le rune in cerchio, funghi e felci tra le radici, due bracieri davanti alla cavità
for (const deg of [20, 60, 120, 160, 200, 340]) { const a = deg / 360 * TAU; W.LATE.props.push(['runa', TX + Math.cos(a) * 44, TZ + Math.sin(a) * 44]); }      // (a sud, davanti alla cavità, e a nord, dov'è il forziere, il passo resta libero)
W.LATE.props.push(['braciereV', TX - 11, TZ + 26], ['braciereV', TX + 11, TZ + 26]);
{ const R = rng(2014); for (let j = 0; j < NR; j++) for (let k = 0; k < 3; k++) { const a = radA(j) + TAU / NR / 2 + (R() - 0.5) * 0.5, r = 19 + R() * 13; if (Math.sin(a) < -0.7 && r > 22) continue; W.LATE.props.push([['mushroom', 'fern', 'flower'][(j + k) % 3], TX + Math.cos(a) * r, TZ + Math.sin(a) * r]); } }

// ---------- il Santuario del Bosco ----------
const BW = TL.BOSCO_WALL;
// colonna di pietra scanalata, col plinto, il capitello e un po' di muschio
function colonna(x, z, y, h, r, b) {
  box(x - r * 1.5, z - r * 1.5, x + r * 1.5, z + r * 1.5, y - 2, y + 1.4, BW); oct(x, z, r, y + 1.4, y + h - 1.8, TL.BOSCO_FLUTE); box(x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25, y + h - 1.8, y + h - 0.9, BW); box(x - r * 1.6, z - r * 1.6, x + r * 1.6, z + r * 1.6, y + h - 0.9, y + h, BW);
  if (b !== undefined) late(x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25, y + h, b);
}
// fascia col fregio di foglie attorno a un rettangolo (lati: quali facce)
function fregio(x0, z0, x1, z1, y0, y1, lati = 'snew') {
  const h = y1 - y0, ux = Math.max(1, Math.round((x1 - x0) / h / 2)) , uz = Math.max(1, Math.round((z1 - z0) / h / 2)), e = 0.07, F = TL.BOSCO_FRIEZE;
  if (lati.includes('s')) quad([x0, y0, z1 + e], [x1, y0, z1 + e], [x1, y1, z1 + e], [x0, y1, z1 + e], F, ux, 1); if (lati.includes('n')) quad([x1, y0, z0 - e], [x0, y0, z0 - e], [x0, y1, z0 - e], [x1, y1, z0 - e], F, ux, 1);
  if (lati.includes('e')) quad([x1 + e, y0, z1], [x1 + e, y0, z0], [x1 + e, y1, z0], [x1 + e, y1, z1], F, uz, 1); if (lati.includes('w')) quad([x0 - e, y0, z0], [x0 - e, y0, z1], [x0 - e, y1, z1], [x0 - e, y1, z0], F, uz, 1);
}
// frontone verso sud: il triangolo sulla facciata e le due falde che scendono a levante e a ponente
function frontone(x0, z0, x1, z1, y, rh, o = 1.5) {
  const xm = (x0 + x1) / 2, sl = Math.hypot((x1 - x0) / 2 + o, rh) / 8, ln = (z1 - z0 + 2 * o) / 8, R = TL.ROOF_MOSS;
  quad([x0 - o, y - 0.8, z0 - o], [x0 - o, y - 0.8, z1 + o], [xm, y + rh, z1 + o], [xm, y + rh, z0 - o], R, ln, sl); quad([x1 + o, y - 0.8, z1 + o], [x1 + o, y - 0.8, z0 - o], [xm, y + rh, z0 - o], [xm, y + rh, z1 + o], R, ln, sl);
  quad([x0, y, z1], [x1, y, z1], [xm, y + rh, z1], [xm, y + rh, z1], BW, (x1 - x0) / 8, rh / 8); quad([x1, y, z0], [x0, y, z0], [xm, y + rh, z0], [xm, y + rh, z0], BW, (x1 - x0) / 8, rh / 8);
}
// pilone: un obelisco tozzo con la runa accesa, la punta di rame e la luce in cima
function pilone(x, z, y, h, b) {
  box(x - 4, z - 4, x + 4, z + 4, y - 3, y + 3, BW); box(x - 3, z - 3, x + 3, z + 3, y + 3, y + h, BW); fregio(x - 3, z - 3, x + 3, z + 3, y + h - 5, y + h - 1); box(x - 3.6, z - 3.6, x + 3.6, z + 3.6, y + h, y + h + 1.2, BW);
  pyramid(x - 3, z - 3, x + 3, z + 3, y + h + 1.2, 6, TL.ROOF_MOSS, 0.4); box(x - 0.4, z - 0.4, x + 0.4, z + 0.4, y + h + 7, y + h + 9.4, TL.GOLD);
  acceso(() => decal(x, y + 9, z + 3, 1, 0, 4.4, 4.4, TL.RUNE_G), true); acceso(() => decal(x, y + 9, z - 3, -1, 0, 4.4, 4.4, TL.RUNE_G), true);
  quad([x - 3, y + h - 12, z + 3.08], [x + 3, y + h - 12, z + 3.08], [x + 3, y + h - 5, z + 3.08], [x - 3, y + h - 5, z + 3.08], TL.MOSS, 1, 1, 0.9);
  W.glows.push([x, y + h + 8, z, 9, 0.4, 0.75, 0.45, 1]); late(x - 4, z - 4, x + 4, z + 4, y + h, b);
}
W.builders['temple:bosco'] = (b, g) => {
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
  let y0 = Infinity; for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [b.x, b.z]]) y0 = Math.min(y0, g(x, z));
  const H1 = 25, PF = 17, PW = 22, zf = z1 + PF;         // la cella è alta una volta e mezza quella di prima; il pronao sporge di 17 ed è largo 44
  // la cella: muri, lesene agli angoli, fregio, cornicione, due gradoni rientrati e il tetto di rame
  box(x0, z0, x1, z1, y0 - 3, y0 + H1, BW);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) box(px - 1.4, pz - 1.4, px + 1.4, pz + 1.4, y0 - 3, y0 + H1, BW);
  fregio(x0, z0, x1, z1, y0 + H1 - 5, y0 + H1); box(x0 - 1.6, z0 - 1.6, x1 + 1.6, z1 + 1.6, y0 + H1, y0 + H1 + 1.6, BW);
  box(x0 + 3, z0 + 3, x1 - 3, z1 - 3, y0 + H1 + 1.6, y0 + H1 + 7.4, BW); fregio(x0 + 3, z0 + 3, x1 - 3, z1 - 3, y0 + H1 + 3.8, y0 + H1 + 7.4);
  box(x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, y0 + H1 + 7.4, y0 + H1 + 12, BW);
  for (const sd of ['s', 'e', 'w', 'n']) acceso(() => onWall(sd, x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, sd === 'e' || sd === 'w' ? b.z : b.x, y0 + H1 + 7.8, 3.6, 3.6, TL.RUNE_G), true);
  pyramid(x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, y0 + H1 + 12, 8, TL.ROOF_MOSS, 1.2); box(b.x - 0.5, b.z - 0.5, b.x + 0.5, b.z + 0.5, y0 + H1 + 19.5, y0 + H1 + 23, TL.GOLD);
  W.glows.push([b.x, y0 + H1 + 22, b.z, 12, 0.45, 0.85, 0.5, 1]);
  // sui fianchi e sul retro: il bassorilievo del cervo e il muschio che scende dal cornicione
  for (const sd of ['e', 'w']) { onWall(sd, x0, z0, x1, z1, b.z, y0 + 5, 9, 9, TL.RELIEF); onWall(sd, x0, z0, x1, z1, b.z - 6, y0 + H1 - 13, 8, 8, TL.MOSS); onWall(sd, x0, z0, x1, z1, b.z + 5.5, y0 + H1 - 12, 7, 7, TL.MOSS); }
  onWall('n', x0, z0, x1, z1, b.x, y0 + 5, 9, 9, TL.RELIEF); onWall('n', x0, z0, x1, z1, b.x - 7, y0 + H1 - 13, 8, 8, TL.MOSS);
  // il portale: grande, ad arco, con l'albero d'oro sui battenti
  onWall('s', x0, z0, x1, z1, b.x, y0, 11.5, 15, TL.BOSCO_DOOR);
  acceso(() => onWall('s', x0, z0, x1, z1, b.x, y0 + 16, 4.6, 4.6, TL.RUNE_G), true);
  W.lights.push({ x: b.x, z: z1 + 2, id: b.id });
  W.addBox(x0, z0, x1, z1, y0 + H1, b);
  // il pronao: sei colonne in facciata, due per fianco, l'architrave col fregio, il soffitto e il frontone con lo stemma
  const ax0 = b.x - PW, ax1 = b.x + PW, hc = 21;
  for (const dx of [6.6, 13.6, 20.4]) for (const s of [-1, 1]) colonna(b.x + s * dx, zf - 2, y0, hc, 1.9, b);
  for (const s of [-1, 1]) { colonna(b.x + s * 20.4, z1 + 6.6, y0, hc, 1.9, b); box(b.x + s * 13 - 1.6, z1, b.x + s * 13 + 1.6, z1 + 1.2, y0 - 2, y0 + hc, BW); }
  box(ax0, z1, ax1, zf, y0 + hc, y0 + hc + 4.6, BW); fregio(ax0, z1, ax1, zf, y0 + hc + 0.3, y0 + hc + 4.3, 'sew');
  quad([ax0, y0 + hc, z1], [ax1, y0 + hc, z1], [ax1, y0 + hc, zf], [ax0, y0 + hc, zf], BW, 5, 2, 0.5);
  box(ax0 - 1.2, z1, ax1 + 1.2, zf + 1.2, y0 + hc + 4.6, y0 + hc + 5.8, BW);
  frontone(ax0, z1, ax1, zf, y0 + hc + 5.8, 10);
  decal(b.x, y0 + hc + 6.4, zf, 1, 0, 6.8, 6.8, TL.CREST_G, false, 0.25); acceso(() => { decal(b.x - 9.5, y0 + hc + 6.3, zf, 1, 0, 3.4, 3.4, TL.RUNE_G, false, 0.25); decal(b.x + 9.5, y0 + hc + 6.3, zf, 1, 0, 3.4, 3.4, TL.RUNE_G, false, 0.25); }, true);
  for (const [dx, dy] of [[0, 10], [-PW, 0], [PW, 0]]) box(b.x + dx - 0.8, zf - 0.8, b.x + dx + 0.8, zf + 0.8, y0 + hc + 5.8 + dy, y0 + hc + 9.8 + dy, TL.GOLD);
  for (const s of [-1, 1]) { onWall('s', ax0, z1, ax1, zf, b.x + s * 17, y0 + hc - 9, 6, 9, TL.MOSS); decal(b.x + s * 10.1, y0 + hc - 9, zf - 1.9, 1, 0, 3.6, 9, TL.BAN_GREEN, false, 0.1); }
  for (const s of [-1, 1]) lanterna(b.x + s * 3.4, y0 + hc, z1 + 9, 3.2);
  // un gradino appena accennato davanti alle colonne
  box(ax0 - 1.5, zf, ax1 + 1.5, zf + 2.2, y0 - 2, y0 + 0.28, BW);
  // i due piloni ai lati del pronao e i muretti che li legano
  for (const s of [-1, 1]) { pilone(b.x + s * (PW + 8), z1 + 9, y0, 31, b); const xa = b.x + s * (PW + 0.5), xb = b.x + s * (PW + 4); box(Math.min(xa, xb), z1 + 7.6, Math.max(xa, xb), z1 + 10.4, y0 - 2, y0 + 6, BW); late(Math.min(xa, xb), z1 + 7.6, Math.max(xa, xb), z1 + 10.4, y0 + 6, b); }
  // in fondo al viale: due colonne basse con la fiamma verde in cima
  for (const s of [-1, 1]) { const x = b.x + s * 13.5, z = z1 + 51; colonna(x, z, y0, 12, 1.5, b); acceso(() => box(x - 0.9, z - 0.9, x + 0.9, z + 0.9, y0 + 12, y0 + 13.6, TL.LANTERN)); W.glows.push([x, y0 + 13.4, z, 7, 0.32, 0.62, 0.38, 1]); }
};
// il sagrato: lastre grigie dal pronao ai piedi dell'albero, il viale chiaro nel mezzo, un tondo con le rune
{ const X = 1115, Z1 = 1341;
  // (largo davanti al pronao, poi solo il viale: a ponente c'è il nascondiglio del forziere, che resta nell'erba tra i cespugli)
  W.PAVE.push(['g', 'rect', X - 30, Z1, X + 30, Z1 + 33], ['g', 'rect', X - 12, Z1 + 33, X + 12, Z1 + 53], ['b', 'rect', X - 7.5, Z1, X + 7.5, Z1 + 53], ['b', 'rect', X - 22, Z1, X + 22, Z1 + 19], ['g', 'disc', X, Z1 + 39, 14], ['b', 'disc', X, Z1 + 39, 10.5]);
  // le statue: due cervi di pietra davanti al pronao, due custodi ai lati del tondo, due bracieri
  W.LATE.props.push(['cervopietra', X - 19, Z1 + 24, { r: 5.6 }], ['cervopietra2', X + 19, Z1 + 24, { r: 5.6 }], ['custode', X - 19, Z1 + 39, { r: 3.6 }], ['custode', X + 19, Z1 + 39, { r: 3.6 }],
    ['braciereV', X - 9, Z1 + 20.5], ['braciereV', X + 9, Z1 + 20.5]);
}
})();
