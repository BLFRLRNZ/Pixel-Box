// Pixel Saga — gli ingressi degli altri santuari (Lago, Sole, Ghiaccio, Fuoco) e i portali delle grotte.
// Come per il Bosco: la cella tiene la pianta di prima (così il mondo attorno non si sposta di un filo) e tutto il resto
// è aggiunto dopo: colonne, statue e bracieri entrano nella lista W.LATE, i selciati fuori dalle piazze sono lastre posate sul terreno.
(() => {
const W = SG.world, TN = SG.town, TL = TN.TL, K = W.kit, { quad, box, onWall } = K, { oct, decal, pyramid, dome } = TN;
const late = (x0, z0, x1, z1, top, b) => W.LATE.boxes.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), top, b]);
const segna = (fn, v) => { const n0 = W.mesh.length; fn(); for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] = v; };
const acceso = (fn, dec) => segna(fn, 0.995 + (dec ? 2 : 0));       // luce propria (con «dec» resta staccato dal muro)
const cade = (fn, lit) => segna(fn, (lit ? 0.995 : 0.93) + 8);      // scorre verso il basso
const scorre = (fn, lit) => segna(fn, (lit ? 0.995 : 0.93) + 10);   // scorre piano
// gli otto riquadri di un tema, più il tetto
const kit = (id, roof) => { const t = TL.TEMA[id]; return { wall: t, flute: t + 1, frieze: t + 2, door: t + 3, crest: t + 4, rune: t + 5, drip: t + 6, ban: t + 7, roof }; };

function colonna(M, x, z, y, h, r, b, deep = 2) {
  box(x - r * 1.5, z - r * 1.5, x + r * 1.5, z + r * 1.5, y - deep, y + 1.4, M.wall); oct(x, z, r, y + 1.4, y + h - 1.8, M.flute);
  box(x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25, y + h - 1.8, y + h - 0.9, M.wall); box(x - r * 1.6, z - r * 1.6, x + r * 1.6, z + r * 1.6, y + h - 0.9, y + h, M.wall);
  if (b !== undefined) late(x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25, y + h, b);
}
function fregio(M, x0, z0, x1, z1, y0, y1, lati = 'snew') {
  const h = y1 - y0, ux = Math.max(1, Math.round((x1 - x0) / h)), uz = Math.max(1, Math.round((z1 - z0) / h)), e = 0.07, F = M.frieze;
  if (lati.includes('s')) quad([x0, y0, z1 + e], [x1, y0, z1 + e], [x1, y1, z1 + e], [x0, y1, z1 + e], F, ux, 1); if (lati.includes('n')) quad([x1, y0, z0 - e], [x0, y0, z0 - e], [x0, y1, z0 - e], [x1, y1, z0 - e], F, ux, 1);
  if (lati.includes('e')) quad([x1 + e, y0, z1], [x1 + e, y0, z0], [x1 + e, y1, z0], [x1 + e, y1, z1], F, uz, 1); if (lati.includes('w')) quad([x0 - e, y0, z0], [x0 - e, y0, z1], [x0 - e, y1, z1], [x0 - e, y1, z0], F, uz, 1);
}
// frontone: i due triangoli (a sud e a nord) e le falde che scendono a levante e a ponente
function frontone(M, x0, z0, x1, z1, y, rh, o = 1.5) {
  const xm = (x0 + x1) / 2, sl = Math.hypot((x1 - x0) / 2 + o, rh) / 8, ln = (z1 - z0 + 2 * o) / 8;
  quad([x0 - o, y - 0.8, z0 - o], [x0 - o, y - 0.8, z1 + o], [xm, y + rh, z1 + o], [xm, y + rh, z0 - o], M.roof, ln, sl); quad([x1 + o, y - 0.8, z1 + o], [x1 + o, y - 0.8, z0 - o], [xm, y + rh, z0 - o], [xm, y + rh, z1 + o], M.roof, ln, sl);
  quad([x0, y, z1], [x1, y, z1], [xm, y + rh, z1], [xm, y + rh, z1], M.wall, (x1 - x0) / 8, rh / 8); quad([x1, y, z0], [x0, y, z0], [xm, y + rh, z0], [xm, y + rh, z0], M.wall, (x1 - x0) / 8, rh / 8);
}
// pendagli (ghiaccioli, rivoli, colature) sotto un bordo che va da a verso b: la faccia guarda a destra di chi cammina da a a b
function pendagli(tile, xa, za, xb, zb, y, h, w, lit) {
  const L = Math.hypot(xb - xa, zb - za), n = Math.max(1, Math.round(L / w)), ux = (xb - xa) / L, uz = (zb - za) / L;
  const f = () => { for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; decal(xa + (xb - xa) * t, y - h, za + (zb - za) * t, ux, uz, L / n, h, tile, false, 0.12); } };
  if (lit) acceso(f, true); else f();
}
// tutt'attorno a un rettangolo, saltando i lati scritti in «no»
function pendagliAttorno(tile, x0, z0, x1, z1, y, h, w, lit, no = '') {
  if (!no.includes('s')) pendagli(tile, x0, z1, x1, z1, y, h, w, lit); if (!no.includes('n')) pendagli(tile, x1, z0, x0, z0, y, h, w, lit);
  if (!no.includes('e')) pendagli(tile, x1, z1, x1, z0, y, h, w, lit); if (!no.includes('w')) pendagli(tile, x0, z0, x0, z1, y, h, w, lit);
}
// lastre posate sul terreno (dove non si può stendere un selciato vero senza spostare gli alberi)
function lastre(g, xa, za, xb, zb, tile) {
  const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), z0 = Math.min(za, zb), z1 = Math.max(za, zb), nx = Math.max(1, Math.round((x1 - x0) / 5)), nz = Math.max(1, Math.round((z1 - z0) / 5)), e = 0.16;
  segna(() => { for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = x0 + (x1 - x0) * i / nx, b = x0 + (x1 - x0) * (i + 1) / nx, c = z0 + (z1 - z0) * j / nz, d = z0 + (z1 - z0) * (j + 1) / nz;
    quad([a, g(a, d) + e, d], [b, g(b, d) + e, d], [b, g(b, c) + e, c], [a, g(a, c) + e, c], tile, (b - a) / 8, (d - c) / 8); } }, 2.93);
}
// un ciuffo di cristalli accesi su uno zoccolo
function cristalli(x, z, y, tile, gl, b, base, k = 1) {
  if (base !== undefined) box(x - 2.6 * k, z - 2.6 * k, x + 2.6 * k, z + 2.6 * k, y - 3, y + 1.2 * k, base);
  acceso(() => { for (const [dx, dz, r, h] of [[0, 0, 1.5, 12], [-1.5, 0.9, 1.0, 7.5], [1.4, -0.7, 0.9, 6], [0.5, 1.6, 0.7, 4.4]]) pyramid(x + (dx - r) * k, z + (dz - r) * k, x + (dx + r) * k, z + (dz + r) * k, y + (base !== undefined ? k : -0.5), h * k, tile, 0); });
  W.glows.push([x, y + 6 * k, z, Math.max(4, 6.5 * k), gl[0], gl[1], gl[2], 1]); if (b) late(x - 2.4 * k, z - 2.4 * k, x + 2.4 * k, z + 2.4 * k, y + 8 * k, b);
}
// una coppa di fuoco (o di luce) su un tetto
function coppa(M, x, z, y, tile, gl) {
  box(x - 0.8, z - 0.8, x + 0.8, z + 0.8, y, y + 1.6, M.wall); box(x - 1.5, z - 1.5, x + 1.5, z + 1.5, y + 1.6, y + 2.3, M.wall); acceso(() => box(x - 1.1, z - 1.1, x + 1.1, z + 1.1, y + 2.3, y + 3.5, tile));
  if (gl) W.glows.push([x, y + 3.6, z, 7, gl[0], gl[1], gl[2], 1]);
}
// obelisco a tre rocchi con la punta d'oro e le rune accese
function obelisco(M, x, z, y, h, b, gl) {
  box(x - 3.4, z - 3.4, x + 3.4, z + 3.4, y - 3, y + 2.6, M.wall); box(x - 3, z - 3, x + 3, z + 3, y + 2.6, y + 3.4, M.wall);
  for (const [r, a, c] of [[2.5, 3.4, h * 0.38], [2.1, h * 0.38, h * 0.72], [1.7, h * 0.72, h]]) box(x - r, z - r, x + r, z + r, y + a, y + c, M.wall);
  pyramid(x - 1.7, z - 1.7, x + 1.7, z + 1.7, y + h, 4.8, TL.GOLD, 0.25);
  acceso(() => { for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { decal(x - uz * 2.5, y + 5.4, z + ux * 2.5, ux, uz, 3.4, 3.4, M.rune, false, 0.12); decal(x - uz * 2.1, y + h * 0.46, z + ux * 2.1, ux, uz, 2.8, 2.8, M.rune, false, 0.12); } }, true);
  W.glows.push([x, y + h + 3, z, 7, gl[0], gl[1], gl[2], 1]); late(x - 3.4, z - 3.4, x + 3.4, z + 3.4, y + h, b);
}

// ---------- il santuario: cella più alta, portale ad arco, pronao con colonne, architrave, frontone (o attico con la stele) ----------
// «u» corre lungo la facciata, «v» esce dalla porta: così lo stesso disegno vale per chi guarda a sud e per chi guarda a nord.
function tempio(b, g, M, o) {
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, dz = b.door === 'n' ? -1 : 1, zF = dz > 0 ? z1 : z0, Z = v => zF + dz * v, deep = o.deep || 3;
  let y0 = Infinity; for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [b.x, b.z]]) y0 = Math.min(y0, g(x, z));
  const { H1, PW, PF, hc, rc = 1.9 } = o, vc = o.vc || PF - 2, sF = dz > 0 ? 's' : 'n', sB = dz > 0 ? 'n' : 's';
  const bx = (u0, v0, u1, v1, ya, yb, t) => box(b.x + u0, Math.min(Z(v0), Z(v1)), b.x + u1, Math.max(Z(v0), Z(v1)), ya, yb, t);
  const dc = (u, y, v, w, h, tile, lit) => { const f = () => decal(b.x + u, y, Z(v), dz, 0, w, h, tile, false, 0.25); if (lit) acceso(f, true); else f(); };
  // la cella: muri, lesene agli angoli, fregio e cornicione
  box(x0, z0, x1, z1, y0 - deep, y0 + H1, M.wall);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) box(px - 1.4, pz - 1.4, px + 1.4, pz + 1.4, y0 - deep, y0 + H1, M.wall);
  fregio(M, x0, z0, x1, z1, y0 + H1 - 5, y0 + H1); box(x0 - 1.6, z0 - 1.6, x1 + 1.6, z1 + 1.6, y0 + H1, y0 + H1 + 1.6, M.wall);
  // il portale e la runa accesa sopra l'arco
  onWall(sF, x0, z0, x1, z1, b.x, y0, 11.5, 15, M.door);
  acceso(() => onWall(sF, x0, z0, x1, z1, b.x, y0 + 15.6, 4.2, 4.2, M.rune), true);
  W.lights.push({ x: b.x, z: zF + dz * 2, id: b.id });
  W.addBox(x0, z0, x1, z1, y0 + H1, b);
  // il pronao
  const n = o.cols.length, ax0 = b.x - PW, ax1 = b.x + PW, az0 = Math.min(Z(0), Z(PF)), az1 = Math.max(Z(0), Z(PF)), yt = y0 + hc + 5.8;
  for (const u of o.cols) for (const s of [-1, 1]) colonna(M, b.x + s * u, Z(vc), y0, hc, rc, b, deep);
  if (o.fianco) for (const s of [-1, 1]) colonna(M, b.x + s * o.cols[n - 1], Z(o.fianco), y0, hc, rc, b, deep);
  box(ax0, az0, ax1, az1, y0 + hc, y0 + hc + 4.6, M.wall); fregio(M, ax0, az0, ax1, az1, y0 + hc + 0.3, y0 + hc + 4.3, 'ew' + sF);
  quad([ax0, y0 + hc, az0], [ax1, y0 + hc, az0], [ax1, y0 + hc, az1], [ax0, y0 + hc, az1], M.wall, PW / 4, PF / 8, 0.5);
  bx(-PW - 1.2, 0, PW + 1.2, PF + 1.2, y0 + hc + 4.6, yt, M.wall);
  if (o.rh) {
    frontone(M, ax0, az0, ax1, az1, yt, o.rh); const cw = Math.min(6.8, o.rh * 0.66);
    dc(0, yt + 0.6, PF, cw, cw, M.crest); dc(-PW * 0.45, yt + 0.5, PF, 3, 3, M.rune, 1); dc(PW * 0.45, yt + 0.5, PF, 3, 3, M.rune, 1);
    for (const [du, dy] of [[0, o.rh], [-PW, 0], [PW, 0]]) { const f = () => box(b.x + du - 0.8, Z(PF) - 0.8, b.x + du + 0.8, Z(PF) + 0.8, yt + dy, yt + dy + 4, o.fin || TL.GOLD); if (o.fin) acceso(f); else f(); }
  } else {
    // attico piatto: al centro una stele più alta con lo stemma acceso
    bx(-PW + 3, 0, PW - 3, PF - 1.5, yt, yt + 5.4, M.wall); fregio(M, b.x - PW + 3, Math.min(Z(0), Z(PF - 1.5)), b.x + PW - 3, Math.max(Z(0), Z(PF - 1.5)), yt + 1, yt + 5, 'ew' + sF);
    bx(-PW + 2.2, 0, PW - 2.2, PF - 0.7, yt + 5.4, yt + 6.3, M.wall);
    bx(-5.2, PF - 3.4, 5.2, PF - 0.9, yt + 6.3, yt + 15.2, M.wall); bx(-6, PF - 3.8, 6, PF - 0.5, yt + 15.2, yt + 16.2, M.wall);
    dc(0, yt + 7.2, PF - 0.9, 7.2, 7.2, M.crest, 1);
  }
  // gli stendardi tra le colonne e, se c'è posto, il gradino
  if (n > 1) for (const s of [-1, 1]) decal(b.x + s * (o.cols[0] + o.cols[1]) / 2, y0 + hc - 9.4, Z(vc + 0.1), dz, 0, 3.6, 9, M.ban, false, 0.1);
  if (o.gradino !== 0) bx(-PW - 1.5, PF, PW + 1.5, PF + 2.2, y0 - deep, y0 + 0.28, M.wall);
  return { x0, x1, z0, z1, y0, dz, zF, Z, bx, dc, sF, sB, yt, yR: y0 + H1 + 1.6 };
}

// ---------- il Lago: marmo chiaro, cupola verde acqua, rivoli sui fianchi, due fontane ----------
W.builders['temple:lago'] = (b, g) => {
  const M = kit('lago', TL.ROOF_TEAL), c = tempio(b, g, M, { H1: 20, PW: 14.8, PF: 7.5, vc: 5, hc: 16.5, cols: [6.5, 12.8], rc: 1.7, rh: 8 }), { x0, x1, z0, z1, y0, Z, yR, sB } = c;
  box(x0 + 2, z0 + 2, x1 - 2, z1 - 2, yR, yR + 4.4, M.wall); fregio(M, x0 + 2, z0 + 2, x1 - 2, z1 - 2, yR + 0.9, yR + 4.2); box(x0 + 1.2, z0 + 1.2, x1 - 1.2, z1 - 1.2, yR + 4.4, yR + 5.2, M.wall);
  dome(b.x, b.z, 7.4, yR + 5.2, TL.ROOF_TEAL); W.glows.push([b.x, yR + 15, b.z, 9, 0.28, 0.52, 0.72, 1]);
  // l'acqua scende dai fianchi dentro due vasche ai piedi del muro
  for (const [sd, s] of [['e', 1], ['w', -1]]) {
    const xw = s > 0 ? x1 : x0, xa = Math.min(xw, xw + s * 3.6), xb = Math.max(xw, xw + s * 3.6);
    cade(() => onWall(sd, x0, z0, x1, z1, b.z, y0 + 1.6, 5.4, 12, M.drip)); acceso(() => onWall(sd, x0, z0, x1, z1, b.z, y0 + 13.6, 2.6, 2.6, M.rune), true);
    box(xa, b.z - 4.4, xb, b.z + 4.4, y0 - 3, y0 + 1.8, M.wall);
    scorre(() => quad([xa + 0.5, y0 + 1.86, b.z + 3.9], [xb - 0.5, y0 + 1.86, b.z + 3.9], [xb - 0.5, y0 + 1.86, b.z - 3.9], [xa + 0.5, y0 + 1.86, b.z - 3.9], TL.POOLW, 0.4, 1));
    late(xa, b.z - 4.4, xb, b.z + 4.4, y0 + 1.8, b);
  }
  onWall(sB, x0, z0, x1, z1, b.x, y0 + 6, 6.4, 6.4, M.crest);
  // le due fontane ai lati del pronao: vasca quadra, fusto, quattro veli d'acqua
  for (const s of [-1, 1]) { const fx = b.x + s * 24, fz = Z(4), ya = y0 + 2, yb = y0 + 8.2;
    box(fx - 4.2, fz - 4.2, fx + 4.2, fz + 4.2, y0 - 3, ya, M.wall);
    scorre(() => quad([fx - 3.6, ya + 0.06, fz + 3.6], [fx + 3.6, ya + 0.06, fz + 3.6], [fx + 3.6, ya + 0.06, fz - 3.6], [fx - 3.6, ya + 0.06, fz - 3.6], TL.POOLW, 0.9, 0.9));
    oct(fx, fz, 0.95, ya, yb - 0.8, M.flute); box(fx - 2, fz - 2, fx + 2, fz + 2, yb - 0.8, yb, M.wall);
    cade(() => { for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) decal(fx - uz * 2, ya + 0.1, fz + ux * 2, ux, uz, 2.6, yb - ya - 0.5, TL.FALL, false, 0.05); });
    acceso(() => box(fx - 0.7, fz - 0.7, fx + 0.7, fz + 0.7, yb, yb + 1.5, TL.ICE));
    W.glows.push([fx, yb + 1.4, fz, 5, 0.24, 0.48, 0.68, 1]); late(fx - 4.2, fz - 4.2, fx + 4.2, fz + 4.2, ya, b);
  }
};
// ---------- il Sole: arenaria dorata, tetto a gradoni con la punta d'oro, attico con il disco acceso, due obelischi ----------
W.builders['temple:sole'] = (b, g) => {
  const M = kit('sole', TL.ROOF_ORANGE), PW = 23, c = tempio(b, g, M, { H1: 27, PW, PF: 16, hc: 22, cols: [6.6, 13.8, 20.8], fianco: 6.5, rc: 2 }), { x0, x1, z0, z1, y0, Z, yR, yt, sB } = c;
  box(x0 + 3, z0 + 3, x1 - 3, z1 - 3, yR, yR + 5.6, M.wall); fregio(M, x0 + 3, z0 + 3, x1 - 3, z1 - 3, yR + 1.4, yR + 5.4);
  box(x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, yR + 5.6, yR + 10.2, M.wall);
  for (const sd of ['s', 'e', 'w', 'n']) acceso(() => onWall(sd, x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, sd === 'e' || sd === 'w' ? b.z : b.x, yR + 6.1, 3.6, 3.6, M.rune), true);
  pyramid(x0 + 6.5, z0 + 6.5, x1 - 6.5, z1 - 6.5, yR + 10.2, 9, TL.GOLD, 0.8); W.glows.push([b.x, yR + 20, b.z, 11, 0.8, 0.62, 0.26, 1]);
  for (const sd of ['e', 'w', sB]) onWall(sd, x0, z0, x1, z1, sd === sB ? b.x : b.z, y0 + 6, 7, 7, M.crest);
  // i due obelischi, legati al pronao da un muretto, e due coppe di luce sull'attico
  for (const s of [-1, 1]) { obelisco(M, b.x + s * (PW + 8), Z(8), y0, 34, b, [0.7, 0.55, 0.24]);
    const xa = b.x + s * (PW + 0.5), xb = b.x + s * (PW + 4.6); box(Math.min(xa, xb), Z(6.6), Math.max(xa, xb), Z(9.4), y0 - 2, y0 + 6, M.wall); late(xa, Z(6.6), xb, Z(9.4), y0 + 6, b);
    coppa(M, b.x + s * (PW - 5.4), Z(8), yt + 6.3, TL.GOLD); }
};
// ---------- il Ghiaccio: pietra azzurra, guglia innevata, ghiaccioli, due ciuffi di cristalli ----------
W.builders['temple:ghiaccio'] = (b, g) => {
  const M = kit('ghiaccio', TL.ROOF_SNOW), H1 = 22, PW = 15, PF = 11, hc = 17, c = tempio(b, g, M, { H1, PW, PF, hc, cols: [5.8, 12.8], rc: 1.8, rh: 11, fin: TL.ICE }), { x0, x1, z0, z1, y0, Z, yR, sF, sB } = c;
  box(x0 + 2.5, z0 + 2.5, x1 - 2.5, z1 - 2.5, yR, yR + 4.6, M.wall); fregio(M, x0 + 2.5, z0 + 2.5, x1 - 2.5, z1 - 2.5, yR + 0.9, yR + 4.4);
  pyramid(x0 + 2.5, z0 + 2.5, x1 - 2.5, z1 - 2.5, yR + 4.6, 17, TL.ROOF_SNOW, 1.3);
  acceso(() => pyramid(b.x - 1.3, b.z - 1.3, b.x + 1.3, b.z + 1.3, yR + 19.6, 7.5, TL.ICE, 0)); W.glows.push([b.x, yR + 25, b.z, 9, 0.32, 0.52, 0.7, 1]);
  // i ghiaccioli: sotto il cornicione della cella e sotto l'architrave del pronao
  pendagliAttorno(M.drip, x0 - 1.6, z0 - 1.6, x1 + 1.6, z1 + 1.6, y0 + H1, 4.2, 7, 0, sF);
  pendagliAttorno(M.drip, b.x - PW - 1.2, Math.min(Z(0), Z(PF + 1.2)), b.x + PW + 1.2, Math.max(Z(0), Z(PF + 1.2)), y0 + hc + 4.6, 3.6, 6.5, 0, sB);
  onWall(sB, x0, z0, x1, z1, b.x, y0 + 6, 6.4, 6.4, M.crest);
  for (const s of [-1, 1]) cristalli(b.x + s * 17.6, Z(-3), y0, TL.ICE, [0.3, 0.5, 0.68], b, M.wall);
  // il selciato: lastre sotto il pronao, un largo davanti e il viale
  lastre(g, b.x - PW - 1.5, Z(0), b.x + PW + 1.5, Z(PF + 7), TL.SLAB_ICE); lastre(g, b.x - 7.5, Z(PF + 7), b.x + 7.5, Z(38), TL.SLAB_ICE);
};
// ---------- il Fuoco: basalto, cratere acceso sul tetto, colate di lava, la vasca di lava sul retro (dove arriva la strada) ----------
W.builders['temple:fuoco'] = (b, g) => {
  const M = kit('fuoco', TL.ROOF_DARK), H1 = 23, PW = 12.6, PF = 9.5, c = tempio(b, g, M, { H1, PW, PF, hc: 17, cols: [5.9, 11], rc: 1.7, deep: 7, gradino: 0, vc: 7.5 }), { x0, x1, z0, z1, y0, Z, yR, yt, sF, sB, dz } = c;
  const zB = dz > 0 ? z0 : z1;
  // due gradoni e il cratere: la lava ribolle in cima e cola giù dai fianchi
  box(x0 + 2.5, z0 + 2.5, x1 - 2.5, z1 - 2.5, yR, yR + 5, M.wall); fregio(M, x0 + 2.5, z0 + 2.5, x1 - 2.5, z1 - 2.5, yR + 0.9, yR + 4.9);
  box(x0 + 5.5, z0 + 5.5, x1 - 5.5, z1 - 5.5, yR + 5, yR + 8.6, M.wall);
  scorre(() => quad([x0 + 6.3, yR + 8.66, z1 - 6.3], [x1 - 6.3, yR + 8.66, z1 - 6.3], [x1 - 6.3, yR + 8.66, z0 + 6.3], [x0 + 6.3, yR + 8.66, z0 + 6.3], TL.LAVA, 1.4, 1), 1);
  W.glows.push([b.x, yR + 11, b.z, 12, 0.85, 0.38, 0.12, 1]);
  for (const sd of ['e', 'w']) { for (const dzz of [-4.6, 4.6]) cade(() => onWall(sd, x0, z0, x1, z1, b.z + dzz, y0 + 0.4, 2.2, H1 - 5.6, TL.LAVA), 1); acceso(() => onWall(sd, x0, z0, x1, z1, b.z, y0 + 7, 3.6, 3.6, M.rune), true); }
  pendagliAttorno(M.drip, x0 - 1.6, z0 - 1.6, x1 + 1.6, z1 + 1.6, y0 + H1, 4, 7, 1, sF);
  // il retro: lo stemma della fiamma, la colata e la vasca
  acceso(() => onWall(sB, x0, z0, x1, z1, b.x, y0 + 11.4, 6.6, 6.6, M.crest), true);
  cade(() => onWall(sB, x0, z0, x1, z1, b.x, y0 + 1.8, 3.2, 9.8, TL.LAVA), 1);
  for (const s of [-1, 1]) acceso(() => onWall(sB, x0, z0, x1, z1, b.x + s * 8.4, y0 + 12.6, 3.2, 3.2, M.rune), true);
  { const za = Math.min(zB, zB - dz * 3.4), zb = Math.max(zB, zB - dz * 3.4);
    box(b.x - 5.6, za, b.x + 5.6, zb, y0 - 5, y0 + 2, M.wall);
    scorre(() => quad([b.x - 5, y0 + 2.06, zb - 0.5], [b.x + 5, y0 + 2.06, zb - 0.5], [b.x + 5, y0 + 2.06, za + 0.5], [b.x - 5, y0 + 2.06, za + 0.5], TL.LAVA, 1.2, 0.4), 1);
    late(b.x - 5.6, za, b.x + 5.6, zb, y0 + 2, b); W.glows.push([b.x, y0 + 3.4, zB - dz * 2, 7, 0.8, 0.36, 0.12, 1]);
    lastre(g, x0 + 0.5, zB, x1 - 0.5, zB - dz * 9.5, TL.SLAB_FIRE); }
  // due coppe di fuoco sull'attico, due fiaccole ai lati della porta (in alto: sotto si passa)
  for (const s of [-1, 1]) { coppa(M, b.x + s * (PW - 4.6), Z(PF - 3), yt + 6.3, TL.LAVA, s > 0 ? [1, 0.5, 0.18] : null);
    const tx = b.x + s * 8.6; box(tx - 0.5, Math.min(Z(0), Z(1.3)), tx + 0.5, Math.max(Z(0), Z(1.3)), y0 + 8.6, y0 + 9.3, M.wall); acceso(() => box(tx - 0.7, Math.min(Z(0.3), Z(1.7)), tx + 0.7, Math.max(Z(0.3), Z(1.7)), y0 + 9.3, y0 + 10.7, TL.LAVA)); }
  lastre(g, x0 - 1, Z(0), x1 + 1, Z(PF), TL.SLAB_FIRE);
  // le salamandre di pietra stanno sul cornicione, sopra chi arriva dalla strada
  W.LATE.props.push(['salamandrapietra', b.x - 6.3, zB - dz * 0.2, { y: yR + 0.4, r: 0.01 }], ['salamandrapietra2', b.x + 6.3, zB - dz * 0.2, { y: yR + 0.4, r: 0.01 }]);
};
// le statue e i bracieri che si possono leggere o toccare: vanno in lista subito, il gioco li cerca all'avvio
W.LATE.props.push(
  ['cignopietra', 2150 - 13, 1337 + 21, { r: 5 }], ['cignopietra2', 2150 + 13, 1337 + 21, { r: 5 }], ['braciereB', 2150 - 9.6, 1337 + 12.6], ['braciereB', 2150 + 9.6, 1337 + 12.6],
  ['leonepietra', 3385 - 18, 1612 + 27, { r: 5.6 }], ['leonepietra2', 3385 + 18, 1612 + 27, { r: 5.6 }], ['custodeS', 3385 - 20, 1612 + 46, { r: 3.6 }], ['custodeS', 3385 + 20, 1612 + 46, { r: 3.6 }], ['braciereO', 3385 - 9, 1612 + 21.5], ['braciereO', 3385 + 9, 1612 + 21.5],
  ['lupopietra', 660 - 10.5, 608 + 20, { r: 5.2 }], ['lupopietra2', 660 + 10.5, 608 + 20, { r: 5.2 }], ['custodeG', 660 - 11, 608 + 32, { r: 3.6 }], ['custodeG', 660 + 11, 608 + 32, { r: 3.6 }], ['braciereI', 660 - 6.9, 608 + 14.6], ['braciereI', 660 + 6.9, 608 + 14.6],
  ['custodeF', 3350 - 9.4, 3030 + 5, { r: 3.6 }], ['custodeF', 3350 + 9.4, 3030 + 5, { r: 3.6 }]);

// ---------- le grotte: un portale piccolo, a tema, davanti alla bocca ----------
const GROTTE = {
  funghi: { wall: TL.BOSCO_WALL, flute: TL.BOSCO_FLUTE, rune: TL.RUNE_G, drip: TL.MOSS, top: TL.LANTERN, gl: [0.36, 0.72, 0.44], br: 'braciereV' },
  mare: { wall: TL.TEMA.lago, flute: TL.TEMA.lago + 1, rune: TL.TEMA.lago + 5, drip: TL.TEMA.lago + 6, top: TL.ICE, gl: [0.3, 0.62, 0.8], br: 'braciereB' },
  cristalli: { wall: TL.DARKSTONE, flute: TL.DARKSTONE, rune: TL.RUNE_V, top: TL.CRYSTAL, gl: [0.7, 0.4, 1], cr: TL.CRYSTAL },
  gelo: { wall: TL.TEMA.ghiaccio, flute: TL.TEMA.ghiaccio + 1, rune: TL.TEMA.ghiaccio + 5, drip: TL.TEMA.ghiaccio + 6, top: TL.ICE, gl: [0.4, 0.62, 0.8], br: 'braciereI', cr: TL.ICE },
};
// la bocca della grotta: centro sulla parete e i due versi (fuori dalla porta, lungo la parete)
const bocca = b => { const d = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[b.door] || [0, 1], ox = b.x + d[0] * b.w / 2, oz = b.z + d[1] * b.d / 2; return { d, ox, oz, P: (u, v) => [ox + d[1] * u + d[0] * v, oz - d[0] * u + d[1] * v] }; };
W.builders.portalino = (p, g) => {
  const b = W.BUILD.find(c => c.k === 'cave' && c.id === p.id), T = GROTTE[p.id]; if (!b || !T) return;
  const { d, ox, oz, P } = bocca(b), y = g(ox + d[0] * 2, oz + d[1] * 2), hp = 8.6, ux = d[1], uz = -d[0];
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), c = P(u1, v1); return [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1])]; };
  const bx = (u0, v0, u1, v1, ya, yb, t) => { const r = rect(u0, v0, u1, v1); box(r[0], r[1], r[2], r[3], ya, yb, t); return r; };
  // due pilastri, l'architrave, un coronamento a gradino con la runa accesa
  for (const s of [-1, 1]) { const [px, pz] = P(s * 5.5, 1.5); box(px - 1.6, pz - 1.6, px + 1.6, pz + 1.6, y - 4, y + 1, T.wall); oct(px, pz, 1.05, y + 1, y + hp - 0.8, T.flute); box(px - 1.4, pz - 1.4, px + 1.4, pz + 1.4, y + hp - 0.8, y + hp, T.wall);
    late(px - 1.3, pz - 1.3, px + 1.3, pz + 1.3, y + hp, b);
    acceso(() => pyramid(px - 0.8, pz - 0.8, px + 0.8, pz + 0.8, y + hp + 2.6, 2.8, T.top, 0)); }
  bx(-7.2, 0.1, 7.2, 3, y + hp, y + hp + 2.6, T.wall); bx(-4.4, 0.3, 4.4, 2.8, y + hp + 2.6, y + hp + 5.4, T.wall); bx(-5, 0.1, 5, 3, y + hp + 5.4, y + hp + 6.1, T.wall);
  { const [cx, cz] = P(0, 2.8); acceso(() => decal(cx, y + hp + 2.8, cz, ux, uz, 2.5, 2.5, T.rune, false, 0.12), true); }
  if (T.drip) { const a = P(-7.2, 3), c = P(7.2, 3); pendagli(T.drip, a[0], a[1], c[0], c[1], y + hp, 2.6, 4.8, 0); }
  { const [lx, lz] = P(0, 3.4); W.glows.push([lx, y + hp + 3.6, lz, 6, T.gl[0], T.gl[1], T.gl[2], 1]); }
  // ai lati, più avanti: un ciuffo di cristalli dove la roccia ne dà
  if (T.cr && !T.br) for (const s of [-1, 1]) { const [qx, qz] = P(s * 9, 5.5); cristalli(qx, qz, g(qx, qz), T.cr, T.gl, b, undefined, 0.5); }
};
for (const b of W.BUILD.filter(c => c.k === 'cave')) { const T = GROTTE[b.id]; if (!T) continue;
  W.BUILD.push({ k: 'portalino', x: b.x, z: b.z, id: b.id });
  if (T.br) { const { P } = bocca(b); for (const s of [-1, 1]) { const [qx, qz] = P(s * 8.6, 5.6); W.LATE.props.push([T.br, qx, qz]); } }
}
})();
