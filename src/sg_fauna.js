// ===================== PIXEL SAGA · la fauna gentile =====================
// Animali che non attaccano: pascolano, saltellano, volano, nuotano, e scappano se l'eroe si avvicina troppo.
// Qui ci sono i modellini (fatti di ellissoidi, capsule e coni, come quelli di personaggi e mostri), le specie
// con il loro carattere, le tabelle che dicono chi vive dove, e il piccolo motore che li fa comparire attorno all'eroe.
(() => {
const TAU = Math.PI * 2, EYE = '#1a1420';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- attrezzi per modellare ----------
// E ellissoide, C capsula, K cono arrotondato. x in avanti, y di lato, z in alto; s ingrandisce tutto.
function kit(s = 1) {
  const P = [], S = v => v.map(q => q * s), R = rot => rot && rot.length ? rot.map(q => [q[0], q[1], q[2] * s, q[3] * s, q[4] * s]) : undefined;
  return { P,
    E: (o, r, c, rot, k, z) => P.push({ t: 'e', o: S(o), r: S(r), c, rot: R(rot), k, z }),
    C: (a, b, r, c, rot, k) => P.push({ t: 'c', a: S(a), b: S(b), r: r * s, c, rot: R(rot), k }),
    K: (a, b, r, r2, c, rot, k) => P.push({ t: 'k', a: S(a), b: S(b), r: r * s, r2: r2 * s, c, rot: R(rot), k }) };
}
const join = (a, b) => (a || []).concat(b || []);

// ---------- quadrupedi ----------
// Un solo modello per cervi, cavalli, mucche, volpi, conigli...: cambiano le misure e gli ornamenti.
//   len wid hgt: mezze misure del corpo   ll: lunghezza delle zampe   lr: spessore   nl na nt: collo (lungo, angolo, spesso)
//   head [l, w, h]  sn: muso [lungo, colore]  ear [tipo, misura, colore]  tail [tipo, misura, colore]
// pose: leg (passo), graze (bruca), hop (salto: zampe distese), sit (seduto sulle zampe dietro)
function quad(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m;
  const len = o.len || 6.2, wid = o.wid || 2.8, hgt = o.hgt || 3, ll = o.ll || 6, lr = o.lr || 1;
  const c = o.c, c2 = o.c2 || c, lc = o.leg || c, L = pose.leg || 0, hop = pose.hop || 0;
  const bz = ll + hgt * 0.72 + hop * 1.2, tilt = (o.tilt || 0) + (pose.sit ? 0.5 : 0) - hop * 0.12;
  const bodyR = tilt ? [['y', tilt, -len * 0.5, 0, bz - hgt * 0.5]] : null;
  // corpo
  E([0, 0, bz], [len, wid, hgt], c, bodyR);
  if (c2 !== c) E([len * 0.04, 0, bz - hgt * 0.42], [len * 0.84, wid * 0.84, hgt * 0.66], c2, bodyR);
  if (o.chest) E([len * 0.55, 0, bz + hgt * 0.06], [len * 0.52, wid * o.chest, hgt * o.chest], o.chestC || c, bodyR);
  if (o.rump) E([-len * 0.5, 0, bz + hgt * 0.05], [len * 0.52, wid * o.rump, hgt * o.rump], c, bodyR);
  // zampe: davanti e dietro si muovono incrociate; nel salto si distendono
  const fx = len * (o.legx || 0.62), fy = wid * (o.legy || 0.55), top = bz - hgt * 0.25;
  const legs = [[fx, fy, L + hop * 0.9, 1], [fx, -fy, -L + hop * 0.9, 1], [-fx, fy, -L - hop * 1.0, o.hind || 1], [-fx, -fy, L - hop * 1.0, o.hind || 1]];
  for (const [x, y, a, th] of legs) {
    const t2 = top + (tilt ? Math.sin(tilt) * (x + len * 0.5) : 0), rot = a ? [['y', a, x, y, t2]] : null, r = lr * th;
    const foot = pose.sit && x < 0 ? t2 - ll * 0.55 : 0;
    C([x, y, t2], [x, y, foot + r * 0.9], r, lc, rot);
    if (o.hoof) E([x + r * 0.2, y, foot + r * 0.72], [r * 1.15, r * 1.08, r * 0.72], o.hoof, rot);
    else E([x + r * 0.5, y, foot + r * 0.68], [r * 1.3, r * 0.98, r * 0.68], o.paw || lc, rot);
  }
  // collo e testa: nascono dritti, poi si piegano tutti insieme (per brucare o guardarsi attorno)
  const sh = tilt ? Math.sin(tilt) * len * 1.2 : 0;
  const nb = [len * (o.nx || 0.74), 0, bz + hgt * (o.nz !== undefined ? o.nz : 0.42) + sh], na = o.na !== undefined ? o.na : 0.8, nl = o.nl !== undefined ? o.nl : 3, nt = o.nt || 1.9;
  const g = pose.graze ? -(o.grazeA || 1.45) : (pose.look || 0);
  const HR = g ? [['y', g, nb[0], 0, nb[2]]] : [];
  const hx = nb[0] + Math.cos(na) * nl, hz = nb[2] + Math.sin(na) * nl;
  if (nl > 0.6) K(nb, [hx, 0, hz], nt * (o.nb || 1.3), nt, o.neckC || c, HR);
  if (o.mane) { const [mc, mt] = o.mane; K([nb[0] - nt * 0.9, 0, nb[2] + nt * 0.5], [hx - nt * 0.75, 0, hz + nt * 0.45], mt, mt * 0.8, mc, HR); }
  const [hl, hw, hh] = o.head || [2.4, 1.8, 1.9], hc = o.headC || c;
  const H = [hx + hl * 0.3, 0, hz + hh * 0.15];
  E(H, [hl, hw, hh], hc, HR);
  const [sl, sc, sd] = o.sn || [1.5, c2, 0];
  if (sl) { const S0 = [H[0] + hl * 0.85, 0, H[2] - hh * 0.2 - (sd || 0)]; E(S0, [sl, hw * (o.snw || 0.62), hh * (o.snh || 0.6)], sc, HR); E([S0[0] + sl * 0.85, 0, S0[2] + hh * 0.1], [sl * 0.28 + 0.2, hw * 0.3, hh * 0.24], o.nose || EYE, HR, 1, 0.1); }
  const es = o.eye || 0.42;
  for (const t of [1, -1]) {
    E([H[0] + hl * 0.42, t * hw * 0.8, H[2] + hh * 0.22], [es, es * 0.7, es * 1.15], o.eyeC || EYE, HR, 1, 0.25);
    // orecchie
    const [et, ez, ec] = o.ear || ['point', 1.6, c], ex = H[0] - hl * 0.25, ey = t * hw * 0.62, eh = H[2] + hh * 0.6;
    if (et === 'point') K([ex, ey, eh], [ex - ez * 0.18, t * (hw * 0.62 + ez * 0.28), eh + ez], ez * 0.42, ez * 0.12, ec, HR);
    else if (et === 'long') { const er = join([['x', -t * 0.16, ex, ey, eh]], HR); E([ex - ez * 0.1, ey, eh + ez * 0.5], [ez * 0.2, ez * 0.14, ez * 0.56], ec, er); E([ex - ez * 0.1 + 0.25, ey, eh + ez * 0.5], [ez * 0.12, ez * 0.1, ez * 0.42], o.earIn || '#f0b0a8', er, 1, 0.2); }
    else if (et === 'round') E([ex, t * hw * 0.82, eh - ez * 0.1], [ez * 0.3, ez * 0.5, ez * 0.5], ec, HR);
    else if (et === 'side') E([ex - 0.2, t * (hw + ez * 0.42), H[2] + hh * 0.25], [ez * 0.3, ez * 0.58, ez * 0.26], ec, join([['x', t * 0.25, ex, t * hw, H[2] + hh * 0.25]], HR));
    else if (et === 'droop') E([ex + 0.1, t * (hw * 0.95), H[2] - hh * 0.25], [ez * 0.36, ez * 0.2, ez * 0.6], ec, HR);
    else if (et === 'big') E([ex - ez * 0.12, t * (hw * 0.9 + ez * 0.3), H[2] + hh * 0.05], [ez * 0.16, ez * 0.5, ez * 0.62], ec, join([['z', t * 0.5, ex, t * hw * 0.8, H[2]]], HR));
    // corna
    const [ht, hs, hcol] = o.horn || [0, 0, 0], bx = H[0] - hl * 0.1, by = t * hw * 0.45, bh = H[2] + hh * 0.75;
    if (ht === 'short') K([bx, by, bh], [bx + hs * 0.2, t * (hw * 0.5 + hs * 0.55), bh + hs * 0.85], hs * 0.26, hs * 0.08, hcol, HR);
    else if (ht === 'back') { K([bx, by, bh], [bx - hs * 0.45, by + t * hs * 0.14, bh + hs * 0.72], hs * 0.2, hs * 0.14, hcol, HR); K([bx - hs * 0.45, by + t * hs * 0.14, bh + hs * 0.72], [bx - hs * 1.05, by + t * hs * 0.24, bh + hs * 0.62], hs * 0.14, hs * 0.05, hcol, HR); }
    else if (ht === 'lyre') { K([bx, by, bh], [bx - hs * 0.12, by + t * hs * 0.16, bh + hs * 0.6], hs * 0.13, hs * 0.1, hcol, HR); K([bx - hs * 0.12, by + t * hs * 0.16, bh + hs * 0.6], [bx + hs * 0.08, by + t * hs * 0.04, bh + hs * 1.15], hs * 0.1, hs * 0.04, hcol, HR); }
    else if (ht === 'antler') {
      const a1 = [bx - hs * 0.1, by + t * hs * 0.3, bh + hs * 0.55], a2 = [bx - hs * 0.3, by + t * hs * 0.52, bh + hs * 1.05];
      C([bx, by, bh], a1, hs * 0.11, hcol, HR); C(a1, a2, hs * 0.09, hcol, HR);
      C(a1, [a1[0] + hs * 0.42, a1[1] + t * hs * 0.1, a1[2] + hs * 0.3], hs * 0.075, hcol, HR);
      C(a2, [a2[0] + hs * 0.34, a2[1] + t * hs * 0.14, a2[2] + hs * 0.3], hs * 0.07, hcol, HR);
      C(a2, [a2[0] - hs * 0.3, a2[1] + t * hs * 0.12, a2[2] + hs * 0.32], hs * 0.07, hcol, HR);
    }
    else if (ht === 'knob') C([bx, by, bh - 0.2], [bx - 0.1, by, bh + hs], hs * 0.3, hcol, HR);
    else if (ht === 'tusk') K([H[0] + hl * 0.75, t * hw * 0.5, H[2] - hh * 0.45], [H[0] + hl * 0.9 + hs * 0.75, t * (hw * 0.55 + hs * 0.2), H[2] - hh * 0.45 + hs * 0.5], hs * 0.2, hs * 0.06, hcol, HR);
  }
  // coda
  const [tt, ts, tc] = o.tail || ['none', 0, c], tb = [-len * 0.93, 0, bz + hgt * 0.3 - (tilt ? Math.sin(tilt) * len * 0.45 : 0)], wag = pose.wag || 0;
  if (tt === 'puff') E([tb[0] - ts * 0.3, 0, tb[2]], [ts * 0.6, ts * 0.6, ts * 0.6], tc);
  else if (tt === 'up') K(tb, [tb[0] - ts * 0.5, wag * ts * 0.3, tb[2] + ts * 0.85], ts * 0.2, ts * 0.1, tc);
  else if (tt === 'hang') { C(tb, [tb[0] - ts * 0.22, wag * ts * 0.15, tb[2] - ts * 0.75], ts * 0.07 + 0.1, tc); E([tb[0] - ts * 0.24, wag * ts * 0.18, tb[2] - ts * 0.9], [ts * 0.13 + 0.2, ts * 0.11 + 0.2, ts * 0.2 + 0.2], o.tuft || tc); }
  else if (tt === 'horse') { K(tb, [tb[0] - ts * 0.35, wag * ts * 0.12, tb[2] - ts * 0.5], ts * 0.16, ts * 0.2, tc); K([tb[0] - ts * 0.35, wag * ts * 0.12, tb[2] - ts * 0.5], [tb[0] - ts * 0.4, wag * ts * 0.2, tb[2] - ts * 1.05], ts * 0.2, ts * 0.08, tc); }
  else if (tt === 'bushy') { const e1 = [tb[0] - ts * 0.55, wag * ts * 0.2, tb[2] + ts * 0.18], e2 = [tb[0] - ts * 1.0, wag * ts * 0.35, tb[2] + ts * 0.32]; K(tb, e1, ts * 0.16, ts * 0.3, tc); K(e1, e2, ts * 0.3, ts * 0.1, o.tuft || tc); }
  else if (tt === 'squirrel') { const e1 = [tb[0] - ts * 0.42, 0, tb[2] + ts * 0.4], e2 = [tb[0] - ts * 0.3, 0, tb[2] + ts * 1.0], e3 = [tb[0] + ts * 0.15, 0, tb[2] + ts * 1.3]; K(tb, e1, ts * 0.14, ts * 0.28, tc); K(e1, e2, ts * 0.28, ts * 0.32, tc); K(e2, e3, ts * 0.32, ts * 0.16, o.tuft || tc); }
  else if (tt === 'curl') { C(tb, [tb[0] - ts * 0.4, 0, tb[2] + ts * 0.3], ts * 0.12, tc); E([tb[0] - ts * 0.5, ts * 0.15, tb[2] + ts * 0.45], [ts * 0.2, ts * 0.2, ts * 0.2], tc); }
  else if (tt === 'long') { const e1 = [tb[0] - ts * 0.5, wag * ts * 0.2, tb[2] + ts * 0.12], e2 = [tb[0] - ts * 0.95, wag * ts * 0.45, tb[2] + ts * 0.5]; C(tb, e1, ts * 0.075, tc); C(e1, e2, ts * 0.065, tc); }
  if (o.extra) o.extra(m, { len, wid, hgt, ll, bz, H, hl, hw, hh, HR, nb, hx, hz, c, c2, pose, bodyR });
  return m.P;
}

// ---------- uccelli ----------
//   pose.fly: 1 ali in su, 2 ali in giù   pose.peck: becca   pose.swim: galleggia (niente zampe)
function bird(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m;
  const fly = pose.fly || 0, legL = pose.swim || fly ? 0 : (o.legs || 1.4), bl = o.len || 2.8, bw = o.wid || 2, bh = o.hgt || 2.1;
  const bz = legL + bh * 0.9 + (fly ? 1 + (o.wing || 4.2) * 0.5 : 0), c = o.c, c2 = o.c2 || c, c3 = o.c3 || c;
  const up = fly ? 0.05 : (o.up !== undefined ? o.up : 0.32), BR = [['y', up, 0, 0, bz]];
  E([0, 0, bz], [bl, bw, bh], c, BR);
  if (c3 !== c) E([bl * 0.12, 0, bz - bh * 0.3], [bl * 0.82, bw * 0.86, bh * 0.76], c3, BR);
  // coda
  const tl = o.tail || 1.6;
  E([-bl * 0.95 - tl * 0.45, 0, bz + (fly ? 0 : -0.1)], [tl * 0.75, bw * (fly ? 0.75 : 0.5), 0.34], o.tailC || c2, [['y', fly ? 0 : -0.28 + (o.tailUp || 0), -bl * 0.9, 0, bz]]);
  // collo e testa
  const nl = o.neck || 0, pk = pose.peck ? -(o.peckA || 1.1) : 0;
  const nb = [bl * 0.7, 0, bz + bh * 0.45 + Math.sin(up) * bl * 0.7], na = fly ? 0.25 : (o.na !== undefined ? o.na : 1.15);
  const HR = pk ? [['y', pk, nb[0], 0, nb[2]]] : [];
  const hx = nb[0] + Math.cos(na) * (nl + 0.6), hz = nb[2] + Math.sin(na) * (nl + 0.6), hr = o.head || 1.45;
  if (nl > 0.5) { if (o.scurve && !fly) { const mid = [nb[0] + nl * 0.5, 0, nb[2] + nl * 0.42]; C(nb, mid, o.nt || 0.6, o.neckC || c, HR); C(mid, [hx, 0, hz], o.nt || 0.6, o.neckC || c, HR); } else C(nb, [hx, 0, hz], o.nt || 0.6, o.neckC || c, HR); }
  const H = [hx + hr * 0.15, 0, hz + hr * 0.25];
  E(H, [hr, hr * 0.92, hr * 0.95], o.headC || c, HR);
  if (o.cap) E([H[0] - hr * 0.05, 0, H[2] + hr * 0.45], [hr * 0.75, hr * 0.7, hr * 0.6], o.cap, HR);
  if (o.cheek) for (const t of [1, -1]) E([H[0] + hr * 0.25, t * hr * 0.6, H[2] - hr * 0.2], [hr * 0.5, hr * 0.42, hr * 0.5], o.cheek, HR);
  const [bkl, bkc, bkr] = o.beak || [1.2, '#f0b030', 0.42];
  if (o.hook) { K([H[0] + hr * 0.7, 0, H[2] + hr * 0.1], [H[0] + hr * 0.75 + bkl * 0.7, 0, H[2] - hr * 0.1], bkr, bkr * 0.7, bkc, HR); K([H[0] + hr * 0.75 + bkl * 0.7, 0, H[2] - hr * 0.1], [H[0] + hr * 0.6 + bkl * 0.8, 0, H[2] - hr * 0.1 - bkl * 0.6], bkr * 0.7, bkr * 0.2, o.beakTip || bkc, HR); }
  else K([H[0] + hr * 0.7, 0, H[2] - hr * 0.05], [H[0] + hr * 0.7 + bkl, 0, H[2] - hr * 0.18 - (o.beakDown || 0) * bkl], bkr, bkr * 0.28, bkc, HR);
  if (o.comb) { E([H[0], 0, H[2] + hr * 0.95], [hr * 0.6, hr * 0.2, hr * 0.42], o.comb, HR); E([H[0] + hr * 0.75, 0, H[2] - hr * 0.75], [hr * 0.28, hr * 0.22, hr * 0.4], o.comb, HR); }
  if (o.crest) K([H[0] - hr * 0.3, 0, H[2] + hr * 0.7], [H[0] - hr * 0.9, 0, H[2] + hr * 1.6], hr * 0.3, hr * 0.08, o.crest, HR);
  if (o.tufts) for (const t of [1, -1]) K([H[0] - hr * 0.1, t * hr * 0.6, H[2] + hr * 0.7], [H[0] - hr * 0.3, t * hr * 0.95, H[2] + hr * 1.45], hr * 0.26, hr * 0.06, o.tufts, HR);
  const es = o.eye || 0.34;
  for (const t of [1, -1]) {
    if (o.eyeRing) E([H[0] + hr * 0.55, t * hr * 0.5, H[2] + hr * 0.15], [es * 1.7, es * 1.5, es * 1.9], o.eyeRing, HR, 1.1, 0.2);
    E([H[0] + hr * 0.62, t * hr * (o.eyeRing ? 0.52 : 0.72), H[2] + hr * 0.18], [es, es * 0.8, es * 1.1], o.eyeC || EYE, HR, 1, 0.4);
    // ali: chiuse sui fianchi, oppure aperte e battenti
    if (fly) {
      const a = fly === 1 ? 0.6 : fly === 2 ? -0.42 : 0.08, ws = o.wing || 4.2, rot = [['x', t * a, 0, t * bw * 0.6, bz + bh * 0.3]];
      E([0.1, t * (bw * 0.6 + ws * 0.5), bz + bh * 0.3], [bl * 0.72, ws * 0.56, 0.3], c2, rot);
      E([-0.35, t * (bw * 0.6 + ws * 1.02), bz + bh * 0.3], [bl * 0.5, ws * 0.42, 0.26], o.tip || c2, rot);
    } else E([-bl * 0.12, t * bw * 0.86, bz + bh * 0.12], [bl * 0.8, bw * 0.3, bh * 0.66], c2, BR);
    // zampe
    if (legL) { const lx = -bl * 0.05, ly = t * bw * 0.4, lc = o.legC || '#e8a030', sw = (pose.leg || 0) * t; C([lx, ly, bz - bh * 0.6], [lx + sw, ly, 0.3], o.legR || 0.26, lc); E([lx + sw + 0.5, ly, 0.22], [0.8, 0.5, 0.22], lc); }
    else if (fly && o.legsFly) C([-bl * 0.5, t * bw * 0.3, bz - bh * 0.5], [-bl * 0.9 - o.legsFly, t * bw * 0.25, bz - bh * 0.6], 0.24, o.legC || '#e8a030');
  }
  if (o.extra) o.extra(m, { bz, bl, bw, bh, H, hr, HR, BR, pose });
  return m.P;
}

// ---------- altri piccoli modelli ----------
function frog(o, pose = {}) {
  const m = kit(o.s || 1), { E, C } = m, j = pose.hop || 0, bz = 2.1 + j * 1.6, R = [['y', 0.38 + j * 0.25, 0, 0, bz]];
  E([0, 0, bz], [3, 2.5, 1.9], o.c, R); E([0.4, 0, bz - 0.6], [2.5, 2.1, 1.3], o.c2, R);
  E([2.1, 0, bz + 0.95], [1.9, 2.1, 1.35], o.c, R);
  for (const t of [1, -1]) {
    E([2.3, t * 1.25, bz + 2.15], [0.85, 0.8, 0.85], o.c, R); E([2.75, t * 1.3, bz + 2.3], [0.45, 0.42, 0.5], EYE, R, 1, 0.3);
    if (j) { C([-1.6, t * 2.1, bz - 0.3], [-4.6, t * 2.6, bz - 1.9], 0.7, o.c); E([-5.2, t * 2.7, bz - 2.2], [1.1, 0.75, 0.35], o.c2); }
    else { E([-1.5, t * 2.5, 1.5], [2.1, 1.05, 1.45], o.c); E([-0.2, t * 2.9, 0.4], [1.5, 0.8, 0.38], o.c2); }
    C([1.6, t * 1.7, bz - 0.4], [2.4, t * 2.1, j ? bz - 1.8 : 0.4], 0.5, o.c);
  }
  return m.P;
}
function lizard(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m, L = pose.leg || 0, w = L * 0.9;
  E([0, 0, 1.5], [3.6, 1.45, 1.05], o.c); E([0.2, 0, 1.15], [3.2, 1.2, 0.7], o.c2);
  E([4.3, w * 0.5, 1.75], [1.8, 1.25, 0.95], o.c);
  K([-3, 0, 1.45], [-6.2, -w * 1.6, 1.0], 0.9, 0.55, o.c); K([-6.2, -w * 1.6, 1.0], [-9.4, w * 1.4, 0.7], 0.55, 0.14, o.c);
  if (o.crest) for (const x of [-2, -0.6, 0.8, 2.2]) K([x, 0, 2.3], [x - 0.5, 0, 3.3], 0.42, 0.1, o.crest);
  for (const t of [1, -1]) {
    E([5.1, t * 0.85 + w * 0.5, 2.25], [0.42, 0.36, 0.42], EYE, null, 1, 0.3);
    for (const [x, a] of [[2.3, t * L], [-2.3, -t * L]]) { C([x, t * 1.1, 1.3], [x + a * 1.8, t * 2.7, 0.5], 0.42, o.c); E([x + a * 1.8 + 0.4, t * 3, 0.3], [0.75, 0.55, 0.25], o.c2); }
  }
  return m.P;
}
function crab(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m, L = pose.leg || 0;
  E([0, 0, 2.2], [2.6, 3.6, 1.55], o.c); E([0.3, 0, 1.75], [2.2, 3.1, 1.0], o.c2);
  for (const t of [1, -1]) {
    C([1.6, t * 0.9, 3.2], [2.1, t * 1.0, 4.3], 0.22, o.c); E([2.15, t * 1.0, 4.6], [0.42, 0.42, 0.48], EYE);
    C([1.4, t * 3.2, 2.2], [3.2, t * 4.6, 2.6 + (pose.claw || 0)], 0.5, o.c); E([4.3, t * 4.5, 3 + (pose.claw || 0)], [1.5, 1.0, 1.05], o.c);
    for (const [x, k] of [[0.3, 1], [-0.8, -1], [-1.8, 1]]) C([x, t * 3, 1.9], [x + k * L * 0.9, t * (5.1 + k * L * 0.3), 0.3], 0.3, o.c2);
  }
  return m.P;
}
function turtle(o, pose = {}) {
  const m = kit(o.s || 1), { E, C } = m, L = pose.leg || 0;
  E([0, 0, 2.5], [4.2, 3.5, 2.2], o.c); E([0, 0, 1.5], [4.5, 3.8, 1.0], o.c2);
  for (const [x, y] of [[1.6, 0], [-1.4, 1.5], [-1.4, -1.5], [0.2, 2.2], [0.2, -2.2]]) E([x, y, 3.9 - Math.abs(y) * 0.32 - Math.abs(x) * 0.12], [1.1, 1.0, 0.6], o.c3 || o.c, null, 1.12);
  E([5.2, 0, 2.6 + (pose.look || 0)], [1.5, 1.15, 1.1], o.skin); for (const t of [1, -1]) E([6, t * 0.8, 2.9 + (pose.look || 0)], [0.36, 0.3, 0.4], EYE, null, 1, 0.3);
  for (const t of [1, -1]) for (const [x, a] of [[2.7, t * L], [-2.9, -t * L]]) E([x + a * 1.4, t * 3.7, 0.75], [1.5, 1.1, 0.5], o.skin);
  E([-4.6, 0, 1.3], [0.9, 0.4, 0.35], o.skin);
  return m.P;
}
function penguin(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m, w = pose.leg || 0, R = w ? [['x', w * 0.22, 0, 0, 0]] : [];
  E([0, 0, 5], [2.7, 3, 4.6], o.c, R); E([0.9, 0, 4.6], [2.1, 2.5, 3.9], '#f8f8fc', R);
  E([0.3, 0, 10], [2.3, 2.4, 2.3], o.c, R);
  for (const t of [1, -1]) {
    E([1.5, t * 1.2, 9.9], [0.95, 0.9, 1.0], '#f8f8fc', R); E([2.15, t * 1.2, 10.2], [0.4, 0.36, 0.45], EYE, R, 1, 0.3);
    E([0, t * 3.2, 5.6], [1.0, 0.5, 2.9], o.c, join([['x', -t * (0.28 + (pose.flap || 0)), 0, t * 2.7, 8]], R));
    E([1.3, t * 1.3, 0.4], [1.5, 0.95, 0.4], '#f0a030', R);
  }
  K([2.3, 0, 9.6], [4, 0, 9.2], 0.6, 0.15, '#f0a030', R);
  if (o.bib) E([1.6, 0, 7.8], [1.3, 1.9, 0.9], o.bib, R);
  return m.P;
}
function seal(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m, up = pose.look || 0;
  K([1, 0, 2.6], [-6.5, 0, 1.5], 2.9, 1.3, o.c); E([0.5, 0, 1.9], [4.6, 2.5, 1.5], o.c2);
  K([1, 0, 2.6], [4.2, 0, 4.4 + up * 2.4], 2.9, 2.0, o.c);
  E([5.6, 0, 5.4 + up * 2.6], [2.2, 2.0, 1.9], o.c); E([7.3, 0, 5 + up * 2.6], [1.1, 1.3, 0.9], o.c2); E([8.2, 0, 5.3 + up * 2.6], [0.4, 0.5, 0.36], EYE);
  for (const t of [1, -1]) { E([6.6, t * 1.25, 6.1 + up * 2.6], [0.42, 0.38, 0.5], EYE, null, 1, 0.3); E([2.2, t * 3.1, 1.0 + (pose.leg || 0) * t * 0.5], [2.1, 1.2, 0.4], o.c2); E([-7.8, t * 1.1, 1.3], [1.7, 0.9, 0.36], o.c2); }
  return m.P;
}
function monkey(o, pose = {}) {
  const m = kit(o.s || 1), { E, C, K } = m, L = pose.leg || 0, sit = pose.sit ? 1 : 0;
  const bz = sit ? 4.2 : 5.4, R = [['y', sit ? 1.0 : 0.35, 0, 0, bz]];
  E([0, 0, bz], [3.6, 2.5, 2.6], o.c, R); E([0.6, 0, bz - 0.5], [2.6, 2, 1.9], o.c2, R);
  const hx = sit ? 1.3 : 3.6, hz = sit ? 8.6 : 8.2;
  E([hx, 0, hz], [2.4, 2.4, 2.3], o.c); E([hx + 1.1, 0, hz - 0.3], [1.7, 1.8, 1.7], o.face); E([hx + 2.2, 0, hz - 0.9], [1.0, 1.2, 0.85], o.face);
  for (const t of [1, -1]) {
    E([hx + 2.1, t * 0.85, hz + 0.2], [0.42, 0.36, 0.48], EYE, null, 1, 0.3); E([hx - 0.2, t * 2.4, hz + 0.3], [0.5, 0.75, 0.85], o.face);
    if (sit) { C([1.6, t * 1.9, 5.8], [3, t * 2.2, 2.2], 0.75, o.c); C([-0.5, t * 2.2, 2.4], [2.4, t * 2.6, 0.9], 0.85, o.c); }
    else { C([2.6, t * 1.7, bz], [2.6 + t * L * 2.2, t * 1.9, 0.8], 0.75, o.c); C([-2.4, t * 1.7, bz - 0.6], [-2.4 - t * L * 2.2, t * 1.9, 0.8], 0.8, o.c); }
  }
  const tb = sit ? [-2.2, 0, 2.2] : [-3.2, 0, 5.6];
  C(tb, [tb[0] - 3.4, 0, tb[2] + 2.6], 0.5, o.c); C([tb[0] - 3.4, 0, tb[2] + 2.6], [tb[0] - 3, 0, tb[2] + 5.6], 0.45, o.c); E([tb[0] - 2.2, 0, tb[2] + 6.2], [0.9, 0.5, 0.75], o.c);
  return m.P;
}
// pesci e delfini: disegnati mentre saltano fuori dall'acqua
function fish(o, pose = {}) {
  const m = kit(o.s || 1), { E, K } = m, b = pose.bend || 0;
  E([0, 0, 3], [4.4, 1.3, 2.1], o.c); E([0.3, 0, 2.3], [3.6, 1.1, 1.3], o.c2);
  K([-3.6, 0, 3], [-6, b, 3], 1.0, 0.5, o.c); E([-7.1, b * 1.4, 3], [1.4, 0.3, 2.3], o.fin || o.c);
  E([0, 0, 5.2], [1.9, 0.26, 1.1], o.fin || o.c); E([3.3, 0, 3.4], [0.4, 1.34, 0.45], EYE, null, 1, 0.1);
  for (const t of [1, -1]) E([1, t * 1.3, 2.2], [1.1, 0.3, 0.7], o.fin || o.c);
  if (o.spots) for (const [x, z] of o.spots) E([x, 0, z], [1.2, 1.36, 0.9], o.spotC);
  return m.P;
}
function dolphin(o, pose = {}) {
  const m = kit(o.s || 1), { E, K } = m, b = pose.bend || 0;
  E([0, 0, 4], [7.5, 2.5, 2.7], o.c); E([0.6, 0, 3], [6.3, 2.1, 1.7], o.c2);
  K([6, 0, 4.2], [9.6, 0, 3.6], 1.9, 0.75, o.c); E([8, 0, 4.9], [1.2, 2.2, 0.5], EYE, null, 1, 0.05);
  K([-5.6, 0, 4], [-10.5, 0, 4 - b * 2], 1.8, 0.7, o.c); E([-11.6, 0, 4 - b * 2.5], [1.5, 3.4, 0.4], o.c);
  K([-0.5, 0, 6.2], [-2.6, 0, 9], 1.2, 0.3, o.c);
  for (const t of [1, -1]) E([2.5, t * 2.6, 2.6], [1.9, 1.3, 0.36], o.c, [['x', t * 0.5, 2.5, t * 2.2, 2.8]]);
  return m.P;
}

// tutto il modello inclinato in avanti o indietro (per chi salta fuori dall'acqua)
const pitched = (P, a, cz = 3, lift = 5) => { for (const p of P) p.rot = join(p.rot, [['y', a, 0, 0, cz], ['t', 0, 0, lift]]); return P; };

// ---------- le specie ----------
// m(pose): il modello.  f: le pose da disegnare.  W H: la tela (in pixel "da personaggio").
// k: il carattere (vedi il motore più sotto).  v: passo  run: corsa  fl: da che distanza scappa (0 = mai)  al: da che distanza si accorge di te
// r: ombra  g: quanti insieme  roam: quanto si allontanano dal branco  tn: tinte possibili (ogni animale ne prende una)
const WALK = [{}, { leg: 0.5 }], GRAZE = [{}, { leg: 0.5 }, { graze: 1 }], HOP = [{}, { hop: 1 }], BIRD = [{}, { peck: 1 }, { fly: 1 }, { fly: 2 }], WING = [{ fly: 1 }, { fly: 2 }], GLIDE = [{ fly: 3 }, { fly: 1 }, { fly: 2 }];
const DEER = { s: 1.3, c: '#b87840', c2: '#ecd8b0', leg: '#8a5a30', hoof: '#3a2a22', len: 6, wid: 2.4, hgt: 2.8, ll: 8, lr: 0.78, nl: 5.2, na: 1.08, nt: 1.5, head: [2.2, 1.5, 1.65], sn: [1.6, '#8a5a30'], ear: ['point', 2.7, '#b87840'], tail: ['puff', 1.5, '#fff8e8'], rump: 1.04, eye: 0.5 };
const HORSE = { s: 1.5, c: '#b87848', c2: '#b87848', leg: '#7a4a2a', hoof: '#2a2026', len: 7.2, wid: 2.9, hgt: 3.3, ll: 9.4, lr: 1.0, nl: 6, na: 0.98, nt: 2.1, nb: 1.45, head: [2.5, 1.6, 1.8], sn: [2.3, '#8a5a3a', 0.5], snw: 0.72, ear: ['point', 1.5, '#b87848'], tail: ['horse', 7, '#3a2618'], mane: ['#3a2618', 1.25], chest: 1.04, rump: 1.06, eye: 0.5 };
const FOX = { s: 1.3, c: '#e27a2a', c2: '#fff4e4', leg: '#3a2a26', len: 5.2, wid: 2.1, hgt: 2.2, ll: 4, lr: 0.75, nl: 2, na: 0.7, nt: 1.6, head: [2.2, 2, 1.8], sn: [1.7, '#fff4e4'], snw: 0.5, snh: 0.5, ear: ['point', 2.6, '#3a2a26'], tail: ['bushy', 7, '#e27a2a'], tuft: '#fff4e4', eye: 0.46 };
const RABBIT = { s: 0.95, c: '#b89060', c2: '#f0e4cc', len: 3.5, wid: 2.4, hgt: 2.7, ll: 1.5, lr: 0.75, hind: 1.25, nl: 0.9, na: 0.9, nt: 1.7, nx: 0.6, head: [2.2, 2, 2.1], sn: [0.9, '#f0e4cc'], nose: '#e88a9a', ear: ['long', 5.4, '#b89060'], tail: ['puff', 1.7, '#ffffff'], tilt: 0.16, eye: 0.52, legx: 0.6 };
const SPEC = {
  // --- prati, campi, colline
  coniglio: { n: 'coniglio', m: p => quad(RABBIT, p), f: HOP, W: 18, H: 20, k: 'hop', v: 22, run: 44, fl: 14, al: 34, r: 1.3, g: [1, 4], roam: 34, tn: [null, [0.72, 0.7, 0.72], [1.2, 1.15, 1.1]] },
  cervo: { n: 'cerva', m: p => quad(DEER, p), f: GRAZE, W: 40, H: 34, k: 'graze', v: 9, run: 46, fl: 20, al: 48, r: 2.6, g: [2, 4], roam: 50 },
  cervoM: { n: 'cervo', m: p => quad(Object.assign({}, DEER, { s: 1.45, c: '#a86a36', horn: ['antler', 5, '#e8dcc0'], nt: 1.8 }), p), f: GRAZE, W: 58, H: 44, k: 'graze', v: 9, run: 46, fl: 20, al: 50, r: 2.9, g: [1, 1], roam: 50 },
  cavallo: { n: 'cavallo selvatico', m: p => quad(HORSE, p), f: GRAZE, W: 48, H: 41, k: 'graze', v: 11, run: 52, fl: 12, al: 40, r: 3.2, g: [2, 5], roam: 70, tn: [null, [0.62, 0.52, 0.48], [1.3, 1.25, 1.2], [0.85, 0.8, 0.78], [1.15, 0.95, 0.7]] },
  mucca: { n: 'mucca', m: p => quad({ s: 1.5, c: '#f6f2ea', c2: '#f6f2ea', leg: '#f0ece2', hoof: '#3a3036', len: 7.4, wid: 3.6, hgt: 3.8, ll: 5.4, lr: 1.25, nl: 2.6, na: 0.42, nt: 2.6, head: [2.6, 2.1, 2.2], sn: [1.7, '#f4b4ac', 0.3], snw: 0.8, snh: 0.72, nose: '#c87a80', ear: ['side', 2.2, '#3a3036'], horn: ['short', 1.9, '#f0e8d0'], tail: ['hang', 6, '#f0ece2'], tuft: '#3a3036', eye: 0.5, grazeA: 0.95,
      extra: ({ E }, q) => { E([-1.8, 2.5, q.bz + 0.8], [2.8, 1.5, 2.4], '#3a3036'); E([2.6, -2.6, q.bz + 0.3], [2.2, 1.4, 2.2], '#3a3036'); E([-4.6, -1.6, q.bz + 1.4], [2.2, 2.4, 1.9], '#3a3036'); E([-2.6, 0, q.bz - 3.6], [1.7, 1.5, 1.1], '#f4b4ac'); E(q.H.map((v, i) => v + [0.3, 1.2, 0.5][i]), [1.5, 1.1, 1.4], '#3a3036', q.HR); } }, p), f: GRAZE, W: 44, H: 32, k: 'graze', v: 6, run: 20, fl: 0, al: 0, r: 3.4, g: [2, 4], roam: 40, tn: [null, null, [0.92, 0.66, 0.46]] },
  pecora: { n: 'pecora', m: p => quad({ s: 1.4, c: '#f8f4ea', c2: '#f8f4ea', leg: '#3a3238', hoof: '#2a2428', len: 5.2, wid: 3.6, hgt: 3.7, ll: 3.6, lr: 0.8, nl: 1.6, na: 0.5, nt: 1.9, neckC: '#f8f4ea', head: [2, 1.5, 1.7], headC: '#3a3238', sn: [1.3, '#3a3238'], nose: '#1a1420', ear: ['side', 1.9, '#3a3238'], tail: ['puff', 1.6, '#f8f4ea'], eye: 0.4, eyeC: '#f8f0d0', grazeA: 1.0,
      extra: ({ E }, q) => { for (const [x, y, z, r] of [[3.2, 1.6, 1.6, 2.5], [3.2, -1.6, 1.6, 2.5], [-3.2, 1.7, 1.5, 2.6], [-3.2, -1.7, 1.5, 2.6], [0, 2.1, 2.1, 2.7], [0, -2.1, 2.1, 2.7], [0, 0, 2.9, 2.9], [4.2, 0, 0.4, 2.4], [-4.3, 0, 0.3, 2.5]]) E([x, y, q.bz + z], [r, r, r * 0.9], '#f8f4ea'); E([q.H[0] - 1, 0, q.H[2] + 1.3], [1.5, 1.4, 1.1], '#f8f4ea', q.HR); } }, p), f: GRAZE, W: 30, H: 24, k: 'graze', v: 6, run: 24, fl: 12, al: 0, r: 2.8, g: [3, 6], roam: 36, tn: [null, null, null, [0.36, 0.34, 0.38]] },
  maiale: { n: 'maiale', m: p => quad({ s: 1.4, c: '#f2b0a8', c2: '#f8c8c0', len: 5.8, wid: 3.2, hgt: 3.2, ll: 2.9, lr: 1, nl: 1.2, na: 0.3, nt: 2.6, head: [2.4, 2.1, 2.1], sn: [1.2, '#e89a94'], snw: 0.7, snh: 0.66, nose: '#c8707a', ear: ['droop', 2, '#e89a94'], tail: ['curl', 2.2, '#f2b0a8'], hoof: '#8a5a58', eye: 0.42 }, p), f: WALK, W: 32, H: 22, k: 'scurry', v: 7, run: 22, fl: 0, al: 0, r: 2.6, g: [1, 3], roam: 26 },
  cinghiale: { n: 'cinghiale', m: p => quad({ s: 1.5, c: '#5e4a3c', c2: '#4a3a30', leg: '#3a2c26', len: 6, wid: 3, hgt: 3.3, ll: 3.6, lr: 0.95, chest: 1.12, nl: 1.2, na: 0.15, nt: 2.8, head: [2.8, 2.1, 2.2], sn: [2, '#4a3a30', 0.2], snw: 0.6, nose: '#c89a90', ear: ['point', 1.5, '#3a2c26'], horn: ['tusk', 1.7, '#f4ecd8'], tail: ['hang', 2.4, '#3a2c26'], hoof: '#2a2020', eye: 0.38,
      extra: ({ K }, q) => K([3.6, 0, q.bz + 3], [-3.8, 0, q.bz + 2.8], 1.1, 0.6, '#3a2c26') }, p), f: WALK, W: 38, H: 25, k: 'scurry', v: 9, run: 36, fl: 14, al: 38, r: 2.7, g: [1, 3], roam: 46 },
  volpe: { n: 'volpe', m: p => quad(FOX, p), f: WALK, W: 38, H: 24, k: 'scurry', v: 13, run: 46, fl: 20, al: 50, r: 2, g: [1, 1], roam: 70 },
  cane: { n: 'cane', m: p => quad({ s: 1.35, c: '#c89058', c2: '#f4e4c8', len: 5.2, wid: 2.3, hgt: 2.5, ll: 4.4, lr: 0.9, nl: 1.9, na: 0.75, nt: 1.8, head: [2.3, 2, 1.9], sn: [1.6, '#f4e4c8'], ear: ['droop', 2.3, '#8a5a34'], tail: ['up', 4.4, '#c89058'], eye: 0.46 }, p), f: [{}, { leg: 0.5 }, { leg: 0.5, wag: 1 }], W: 32, H: 24, k: 'pet', v: 14, run: 34, fl: 0, al: 46, r: 2, g: [1, 1], roam: 40, tn: [null, [0.5, 0.46, 0.44], [1.25, 1.22, 1.2], [0.85, 0.62, 0.42]] },
  gatto: { n: 'gatto', m: p => quad({ s: 1.15, c: '#8a8a96', c2: '#d8d8e0', len: 3.9, wid: 1.7, hgt: 1.8, ll: 2.9, lr: 0.62, nl: 1.2, na: 0.8, nt: 1.3, head: [1.9, 1.8, 1.7], sn: [0.7, '#d8d8e0'], nose: '#e88a9a', ear: ['point', 1.7, '#8a8a96'], tail: ['long', 5.6, '#8a8a96'], eye: 0.44, eyeC: '#3a8a3a' }, p), f: [{}, { leg: 0.5 }, { sit: 1 }], W: 26, H: 20, k: 'pet', v: 10, run: 38, fl: 9, al: 30, r: 1.5, g: [1, 1], roam: 34, tn: [null, [0.36, 0.36, 0.4], [1.3, 1.3, 1.3]] },
  // --- bosco
  scoiattolo: { n: 'scoiattolo', m: p => quad({ s: 0.95, c: '#c8642a', c2: '#f8e8d0', len: 2.6, wid: 1.6, hgt: 1.9, ll: 1.1, lr: 0.55, hind: 1.3, nl: 0.6, na: 1, nt: 1.2, nx: 0.6, head: [1.7, 1.5, 1.5], sn: [0.7, '#f8e8d0'], ear: ['point', 1.5, '#c8642a'], tail: ['squirrel', 4.6, '#c8642a'], tuft: '#e88a4a', tilt: 0.3, eye: 0.44 }, p), f: HOP, W: 16, H: 17, k: 'hop', v: 26, run: 48, fl: 12, al: 30, r: 1.1, g: [1, 2], roam: 30, tn: [null, [0.62, 0.6, 0.62]], when: 'day' },
  riccio: { n: 'riccio', m: p => quad({ s: 1.1, c: '#6a5444', c2: '#e8d0b0', leg: '#e8d0b0', len: 3.1, wid: 2.3, hgt: 2.2, ll: 0.8, lr: 0.5, nl: 0.5, na: 0.1, nt: 1.4, nz: -0.2, head: [1.5, 1.3, 1.2], headC: '#e8d0b0', sn: [1, '#e8d0b0'], ear: ['round', 0.9, '#c8a888'], eye: 0.34,
      extra: ({ K }, q) => { for (let i = 0; i < 16; i++) { const a = i * 2.4, x = -0.6 + Math.cos(a) * 2 * ((i % 4) / 4 + 0.3), y = Math.sin(a) * 1.5; K([x, y, q.bz + 1.4], [x - 0.5, y * 1.3, q.bz + 2.9 - Math.abs(y) * 0.4], 0.5, 0.1, i % 2 ? '#4a3a30' : '#8a7460'); } } }, p), f: WALK, W: 18, H: 13, k: 'scurry', v: 5, run: 9, fl: 0, al: 0, r: 1.1, g: [1, 2], roam: 20, when: 'night' },
  // --- monti e neve
  stambecco: { n: 'stambecco', m: p => quad({ s: 1.35, c: '#a89078', c2: '#e0d0b8', leg: '#6a5444', hoof: '#2a2420', len: 5.4, wid: 2.6, hgt: 2.9, ll: 5.4, lr: 0.85, nl: 2.6, na: 0.9, nt: 1.8, head: [2.1, 1.5, 1.7], sn: [1.4, '#6a5444'], ear: ['side', 1.4, '#a89078'], horn: ['back', 4.6, '#5a4a3e'], tail: ['up', 1.6, '#6a5444'], chest: 1.05, eye: 0.42,
      extra: ({ K }, q) => K([q.H[0] + 1.6, 0, q.H[2] - 1.2], [q.H[0] + 1.3, 0, q.H[2] - 3], 0.5, 0.12, '#6a5444', q.HR) }, p), f: GRAZE, W: 36, H: 30, k: 'graze', v: 8, run: 40, fl: 20, al: 50, r: 2.5, g: [1, 4], roam: 40, steep: 1 },
  renna: { n: 'renna', m: p => quad(Object.assign({}, DEER, { s: 1.4, c: '#8a7868', c2: '#f0ece4', leg: '#6a5a4e', neckC: '#f0ece4', horn: ['antler', 5.2, '#d8ccb0'], nt: 2, wid: 2.7, hgt: 3.1, ll: 7, sn: [1.6, '#4a3e36'], tail: ['puff', 1.4, '#f0ece4'] }), p), f: GRAZE, W: 56, H: 42, k: 'graze', v: 8, run: 42, fl: 18, al: 46, r: 2.9, g: [2, 5], roam: 60 },
  lepreB: { n: 'lepre bianca', m: p => quad(Object.assign({}, RABBIT, { c: '#f4f6fa', c2: '#ffffff', ear: ['long', 5.4, '#f4f6fa'] }), p), f: HOP, W: 18, H: 20, k: 'hop', v: 22, run: 46, fl: 14, al: 34, r: 1.3, g: [1, 3], roam: 34 },
  volpeB: { n: 'volpe artica', m: p => quad(Object.assign({}, FOX, { c: '#f2f5fa', c2: '#ffffff', leg: '#dfe6f0', ear: ['point', 2, '#f2f5fa'], tail: ['bushy', 7, '#f2f5fa'], tuft: '#ffffff', sn: [1.5, '#ffffff'] }), p), f: WALK, W: 38, H: 24, k: 'scurry', v: 13, run: 46, fl: 20, al: 50, r: 2, g: [1, 1], roam: 70 },
  pinguino: { n: 'pinguino', m: p => penguin({ c: '#2a2e3e', bib: '#ffd86a', s: 1.3 }, p), f: [{}, { leg: 1 }, { leg: -1 }, { flap: 0.5 }], W: 18, H: 23, k: 'waddle', v: 5, run: 11, fl: 0, al: 30, r: 1.6, g: [4, 9], roam: 26 },
  foca: { n: 'foca', m: p => seal({ c: '#8a96a6', c2: '#c8d2dc', s: 1.4 }, p), f: [{}, { look: 1 }, { leg: 1 }], W: 32, H: 23, k: 'loaf', v: 3, run: 8, fl: 0, al: 50, r: 3, g: [1, 3], roam: 12, tn: [null, [1.3, 1.3, 1.3], [0.7, 0.68, 0.7]] },
  // --- deserto, savana, altopiano
  cammello: { n: 'dromedario', m: p => quad({ s: 1.55, c: '#d8a868', c2: '#e8c088', leg: '#c0905a', hoof: '#6a4a30', len: 6.8, wid: 2.9, hgt: 3.1, ll: 10, lr: 0.95, nl: 7.6, na: 1.12, nt: 1.6, nb: 1.5, head: [2.2, 1.5, 1.6], sn: [2, '#c0905a', 0.3], snw: 0.7, ear: ['round', 1.2, '#d8a868'], tail: ['hang', 4, '#c0905a'], eye: 0.44, grazeA: 1.3,
      extra: ({ E }, q) => E([-0.4, 0, q.bz + 3.4], [3.4, 2.4, 3.2], '#d8a868') }, p), f: GRAZE, W: 50, H: 44, k: 'graze', v: 8, run: 30, fl: 0, al: 50, r: 3.2, g: [1, 3], roam: 60 },
  fennec: { n: 'volpe del deserto', m: p => quad(Object.assign({}, FOX, { s: 1.1, c: '#ecca94', c2: '#fff6e6', leg: '#d8b078', ear: ['point', 4.4, '#ecca94'], tail: ['bushy', 6, '#ecca94'], tuft: '#3a2a26' }), p), f: WALK, W: 30, H: 24, k: 'scurry', v: 14, run: 48, fl: 20, al: 50, r: 1.7, g: [1, 2], roam: 60 },
  lucertola: { n: 'lucertola', m: p => lizard({ c: '#5aa83e', c2: '#c8e088', s: 0.85 }, p), f: [{}, { leg: 0.6 }, { leg: -0.6 }], W: 22, H: 10, k: 'dart', v: 30, run: 52, fl: 14, al: 0, r: 1, g: [1, 2], roam: 24, tn: [null, [1.5, 1.1, 0.7], [0.8, 0.9, 1.3]], when: 'day' },
  bisonte: { n: 'bisonte', m: p => quad({ s: 1.65, c: '#7a5c42', c2: '#6a4e38', leg: '#4a3628', hoof: '#2a2020', len: 7.4, wid: 3.6, hgt: 3.9, ll: 4.8, lr: 1.2, chest: 1.3, chestC: '#4a3628', nl: 1.4, na: -0.1, nt: 3.2, nz: 0.1, head: [2.8, 2.4, 2.6], headC: '#3a2a20', sn: [1.5, '#3a2a20', 0.4], snw: 0.8, ear: ['side', 1.2, '#3a2a20'], horn: ['short', 2.2, '#e8dcc0'], tail: ['hang', 4.4, '#4a3628'], eye: 0.4, grazeA: 0.6,
      extra: ({ E, K }, q) => { E([3.6, 0, q.bz + 2.8], [3.6, 3.2, 3.2], '#4a3628'); K([q.H[0] + 1.5, 0, q.H[2] - 2], [q.H[0] + 1, 0, q.H[2] - 4.4], 0.9, 0.2, '#3a2a20', q.HR); } }, p), f: GRAZE, W: 46, H: 30, k: 'graze', v: 6, run: 30, fl: 0, al: 50, r: 3.6, g: [2, 5], roam: 60 },
  // --- palude, giungla, colline dei ciliegi
  rana: { n: 'rana', m: p => frog({ c: '#5ab83e', c2: '#d8f0a0', s: 0.85 }, p), f: HOP, W: 16, H: 14, k: 'hop', v: 14, run: 34, fl: 12, al: 0, r: 1, g: [2, 5], roam: 16, wet: 1, tn: [null, [1.5, 0.8, 0.5], [0.7, 1.1, 1.5], [1.4, 1.3, 0.5]] },
  tartaruga: { n: 'tartaruga', m: p => turtle({ c: '#5a7a3e', c2: '#3e5a2e', c3: '#7a9a4e', skin: '#a8c070', s: 1.15 }, p), f: [{}, { leg: 0.5 }, { look: 0.6 }], W: 22, H: 14, k: 'slow', v: 2.4, run: 3, fl: 0, al: 30, r: 2, g: [1, 2], roam: 18 },
  scimmia: { n: 'scimmia', m: p => monkey({ c: '#7a5438', c2: '#a87a54', face: '#ecc8a0', s: 1.25 }, p), f: [{ sit: 1 }, {}, { leg: 0.5 }], W: 22, H: 24, k: 'monkey', v: 16, run: 44, fl: 12, al: 40, r: 1.9, g: [2, 5], roam: 40, tn: [null, [1.4, 1.2, 0.9], [0.6, 0.6, 0.62]], when: 'day' },
  capibara: { n: 'capibara', m: p => quad({ s: 1.35, c: '#a87c4c', c2: '#c8a070', leg: '#7a5a38', len: 5.4, wid: 3, hgt: 3, ll: 2.9, lr: 1, nl: 1.6, na: 0.45, nt: 2.6, head: [2.6, 2, 2.1], sn: [1.5, '#8a6440', -0.2], snw: 0.86, snh: 0.86, ear: ['round', 1.1, '#7a5a38'], eye: 0.4, grazeA: 0.9 }, p), f: GRAZE, W: 34, H: 22, k: 'graze', v: 5, run: 18, fl: 0, al: 0, r: 2.5, g: [2, 4], roam: 26, wet: 1 },
  tanuki: { n: 'tanuki', m: p => quad(Object.assign({}, FOX, { s: 1.25, c: '#8e7c66', c2: '#d8ccb4', leg: '#2e2622', len: 4.8, wid: 2.6, hgt: 2.6, ll: 2.9, ear: ['round', 1.7, '#2e2622'], tail: ['bushy', 5, '#8e7c66'], tuft: '#2e2622', sn: [1.4, '#f4ece0'], head: [2.3, 2.2, 1.9],
      extra: ({ E }, q) => { for (const t of [1, -1]) E([q.H[0] + 0.9, t * 1.5, q.H[2] + 0.3], [1.0, 0.75, 0.9], '#2e2622', q.HR, 1, 0.15); } }), p), f: WALK, W: 30, H: 20, k: 'scurry', v: 9, run: 36, fl: 15, al: 40, r: 2, g: [1, 2], roam: 46 },
  cervoS: { n: 'cervo sika', m: p => quad(Object.assign({}, DEER, { c: '#c0703a', horn: ['antler', 3.4, '#e8dcc0'],
      extra: ({ E }, q) => { for (const [x, y, z] of [[2.6, 2.1, 1.3], [0.4, 2.3, 1.7], [-2, 2.2, 1.4], [-3.8, 1.9, 1.5], [2.6, -2.1, 1.5], [0.2, -2.3, 1.2], [-2.2, -2.2, 1.7], [-4, -1.9, 1.2], [1, 0, 2.7], [-1.6, 0, 2.75], [-3.8, 0, 2.6]]) E([x, y, q.bz + z], [0.62, 0.5, 0.5], '#fff4dc'); } }), p), f: GRAZE, W: 46, H: 37, k: 'graze', v: 9, run: 44, fl: 12, al: 40, r: 2.6, g: [2, 4], roam: 50 },
  // --- spiagge
  granchio: { n: 'granchio', m: p => crab({ c: '#e8643a', c2: '#f8b088', s: 0.8 }, p), f: [{}, { leg: 1 }, { leg: -1, claw: 1.2 }], W: 18, H: 12, k: 'crab', v: 12, run: 30, fl: 12, al: 0, r: 1.1, g: [2, 5], roam: 18, tn: [null, [0.75, 0.9, 1.4], [1.2, 1.1, 0.7]], when: 'day' },
  // --- uccelli
  passero: { n: 'passero', m: p => bird({ s: 1.0, c: '#8a6240', c2: '#5a3e2a', c3: '#e8d8c0', cap: '#6a4630', beak: [0.9, '#5a4a40', 0.36], legC: '#c89060', wing: 3.6, legs: 1.2 }, p), f: BIRD, W: 18, H: 16, k: 'bird', v: 9, run: 60, fl: 14, r: 1, g: [3, 6], roam: 22, alt: 22, tn: [null, [1.35, 1.1, 0.55], [0.7, 0.95, 1.6], [1.5, 0.6, 0.5]], when: 'day' },
  piccione: { n: 'piccione', m: p => bird({ s: 1.05, c: '#9aa0b0', c2: '#6a7084', c3: '#b8bcc8', headC: '#7a8098', beak: [0.9, '#e8c8a0', 0.36], legC: '#e87a7a', tip: '#3a3e4e', wing: 4.2, legs: 1.3,
      extra: ({ E }, q) => E([q.H[0] - 0.9, 0, q.H[2] - 1.2], [1.2, 1.3, 0.75], '#5aa88a', q.HR) }, p), f: BIRD, W: 20, H: 18, k: 'bird', v: 8, run: 58, fl: 12, r: 1.2, g: [4, 7], roam: 24, alt: 26, when: 'day' },
  corvo: { n: 'corvo', m: p => bird({ s: 1.2, c: '#22222c', c2: '#16161e', c3: '#2a2a36', beak: [1.5, '#2a2a30', 0.5], legC: '#2a2a30', wing: 4.6, legs: 1.5, eyeC: '#d8d8e0' }, p), f: BIRD, W: 22, H: 20, k: 'bird', v: 9, run: 56, fl: 17, r: 1.3, g: [2, 5], roam: 30, alt: 30 },
  gabbiano: { n: 'gabbiano', m: p => bird({ s: 1.15, c: '#f8f8fc', c2: '#a8b0c0', c3: '#ffffff', tip: '#2a2e3a', beak: [1.5, '#f0b020', 0.46], legC: '#f0a030', wing: 5.4, legs: 1.5, tailC: '#f8f8fc' }, p), f: BIRD, W: 24, H: 22, k: 'bird', v: 8, run: 56, fl: 14, r: 1.3, g: [3, 7], roam: 30, alt: 34, when: 'day' },
  pappagallo: { n: 'pappagallo', m: p => bird({ s: 1.15, c: '#e83a30', c2: '#2a6ae0', c3: '#f04a3a', tip: '#f8d020', beak: [1.3, '#f0e8d8', 0.6], hook: 1, beakTip: '#3a3a40', legC: '#6a6a70', wing: 4.6, legs: 1.2, tail: 4.4, tailC: '#2a6ae0', eyeRing: '#ffffff' }, p), f: BIRD, W: 24, H: 20, k: 'bird', v: 7, run: 54, fl: 15, r: 1.2, g: [2, 5], roam: 26, alt: 30, tn: [null, [0.4, 1.3, 0.7], [1.2, 1.25, 0.4], [0.5, 0.9, 1.6]], when: 'day' },
  tucano: { n: 'tucano', m: p => bird({ s: 1.15, c: '#1e1e28', c2: '#16161e', c3: '#fff4d0', beak: [3.4, '#f8a020', 0.85], beakTip: '#2a2a30', beakDown: 0.12, legC: '#5a7ac8', wing: 4.4, legs: 1.2, tail: 2.6, eyeRing: '#5ab0f0', cheek: '#fff4d0' }, p), f: BIRD, W: 22, H: 20, k: 'bird', v: 6, run: 50, fl: 15, r: 1.2, g: [1, 3], roam: 26, alt: 30, when: 'day' },
  gallina: { n: 'gallina', m: p => bird({ s: 1.25, c: '#f4f0e6', c2: '#e0dccc', c3: '#fffcf4', len: 2.9, wid: 2.3, hgt: 2.5, beak: [0.8, '#f0b030', 0.4], comb: '#e02a2a', legC: '#f0b030', legs: 1.9, tail: 2.2, tailUp: 0.9, up: 0.18, wing: 3 }, p), f: [{}, { peck: 1 }, { leg: 0.7 }], W: 18, H: 18, k: 'peck', v: 7, run: 24, fl: 7, r: 1.3, g: [3, 6], roam: 22, tn: [null, [0.8, 0.5, 0.32], [0.3, 0.28, 0.3], null], when: 'day' },
  pulcino: { n: 'pulcino', m: p => bird({ s: 0.75, c: '#ffe04a', c2: '#f4c830', c3: '#fff08a', len: 2.3, wid: 2.1, hgt: 2.2, head: 1.7, beak: [0.7, '#f08a20', 0.36], legC: '#f08a20', legs: 1.1, tail: 0.6, up: 0.1, eye: 0.42 }, p), f: [{}, { peck: 1 }, { leg: 0.6 }], W: 12, H: 12, k: 'peck', v: 9, run: 22, fl: 6, r: 0.7, g: [2, 4], roam: 12, when: 'day' },
  anatra: { n: 'anatra', m: p => bird({ s: 1.15, c: '#9a7a5a', c2: '#6a5240', c3: '#d8d0c0', len: 3.4, wid: 2.3, hgt: 2, headC: '#2a7a4a', neck: 1.4, nt: 0.75, beak: [1.4, '#f0c030', 0.5], legC: '#f08a20', legs: 1.2, tail: 1.6, tailUp: 0.5, wing: 4.4, na: 1.3,
      extra: ({ E }, q) => E([q.H[0] - 0.9, 0, q.H[2] - 1.5], [0.9, 0.95, 0.4], '#ffffff', q.HR) }, p), f: [{ swim: 1 }, { swim: 1, peck: 1 }, { fly: 1 }, { fly: 2 }, {}], W: 22, H: 20, k: 'swim', v: 6, run: 16, fl: 12, r: 1.5, g: [2, 5], roam: 30, alt: 22, tn: [null, [1.2, 1.15, 1.05], null] },
  cigno: { n: 'cigno', m: p => bird({ s: 1.4, c: '#fcfcff', c2: '#f0f2f8', c3: '#ffffff', len: 3.9, wid: 2.6, hgt: 2.3, neck: 4.4, nt: 0.72, scurve: 1, na: 1.45, head: 1.3, beak: [1.5, '#f08a20', 0.5], legC: '#3a3a40', legs: 1.4, tail: 1.9, tailUp: 0.6, wing: 5,
      extra: ({ E }, q) => { for (const t of [1, -1]) E([-0.6, t * 1.5, q.bz + 1.3], [3, 1.3, 1.9], '#fcfcff', q.BR); E([q.H[0] + 1.05, 0, q.H[2] + 0.05], [0.5, 0.6, 0.5], '#2a2a30', q.HR); } }, p), f: [{ swim: 1 }, { swim: 1, peck: 1 }], W: 30, H: 22, k: 'swim', v: 4.5, run: 10, fl: 0, r: 2.2, g: [1, 2], roam: 40 },
  airone: { n: 'airone', m: p => bird({ s: 1.25, c: '#a8b4c4', c2: '#7a8698', c3: '#e8ecf2', len: 3.3, wid: 1.9, hgt: 2, neck: 4.6, nt: 0.55, scurve: 1, na: 1.4, head: 1.15, headC: '#f4f6fa', cap: '#2a2e3a', beak: [2.6, '#f0b030', 0.4], legC: '#c8a860', legR: 0.22, legs: 6.4, tail: 1.6, wing: 5.4, legsFly: 4, up: 0.5 }, p), f: BIRD, W: 30, H: 28, k: 'wade', v: 4, run: 44, fl: 20, r: 1.6, g: [1, 2], roam: 30, alt: 30 },
  gru: { n: 'gru', m: p => bird({ s: 1.3, c: '#fcfcff', c2: '#f0f2f8', c3: '#ffffff', tip: '#22222c', tailC: '#22222c', len: 3.4, wid: 2, hgt: 2.1, neck: 4.8, nt: 0.55, na: 1.42, neckC: '#2a2a34', head: 1.15, cap: '#e02a2a', beak: [2.2, '#c8b890', 0.38], legC: '#3a3a44', legR: 0.22, legs: 6.8, tail: 2.4, wing: 5.6, legsFly: 4.4, up: 0.45 }, p), f: BIRD, W: 32, H: 30, k: 'wade', v: 4, run: 44, fl: 18, r: 1.6, g: [2, 3], roam: 34, alt: 34 },
  fenicottero: { n: 'fenicottero', m: p => bird({ s: 1.25, c: '#ff9ab8', c2: '#f07a9e', c3: '#ffb8cc', tip: '#2a2a34', len: 3.1, wid: 1.9, hgt: 2, neck: 5, nt: 0.5, scurve: 1, na: 1.5, head: 1.1, beak: [1.7, '#ffd0d8', 0.5], hook: 1, beakTip: '#2a2a34', legC: '#f07a9e', legR: 0.2, legs: 7.4, tail: 1.3, wing: 5, legsFly: 4.6, up: 0.5 }, p), f: BIRD, W: 30, H: 30, k: 'wade', v: 4, run: 42, fl: 18, r: 1.5, g: [3, 7], roam: 26, alt: 30 },
  gufo: { n: 'gufo', m: p => bird({ s: 1.25, c: '#8a6a48', c2: '#6a4e34', c3: '#d8c0a0', len: 2.4, wid: 2.3, hgt: 2.9, up: 1.05, head: 2.1, beak: [0.6, '#e8c060', 0.36], beakDown: 0.5, tufts: '#6a4e34', eyeRing: '#f8d030', eye: 0.36, legC: '#c8a878', legs: 0.9, tail: 1.3, wing: 5, na: 1.5 }, p), f: [{}, { fly: 1 }, { fly: 2 }], W: 26, H: 23, k: 'owl', v: 0, run: 44, fl: 16, r: 1.4, g: [1, 1], roam: 60, alt: 26, when: 'night' },
  // --- chi sta sempre in volo
  aquila: { n: 'aquila', m: p => bird({ s: 1.7, c: '#6a4a30', c2: '#4e3622', c3: '#7a5a3c', headC: '#f8f6f0', tailC: '#f8f6f0', tip: '#2e2018', beak: [1.3, '#f0c030', 0.56], hook: 1, legC: '#f0c030', wing: 7.4, tail: 2.4, legs: 1.4 }, p), f: GLIDE, W: 46, H: 34, k: 'soar', v: 26, r: 2, g: [1, 2], alt: 110 },
  avvoltoio: { n: 'avvoltoio', m: p => bird({ s: 1.7, c: '#3a3038', c2: '#2a222a', c3: '#4a3e46', headC: '#e89a90', tip: '#1e181e', beak: [1.2, '#e8dcc0', 0.5], hook: 1, legC: '#c8c0b0', wing: 7.6, tail: 2, legs: 1.4, neck: 1 }, p), f: GLIDE, W: 46, H: 34, k: 'soar', v: 20, r: 2, g: [2, 4], alt: 95 },
  oca: { n: 'oca selvatica', m: p => bird({ s: 1.2, c: '#8a7a6a', c2: '#5a4e44', c3: '#d8d0c4', headC: '#2a2a30', neckC: '#2a2a30', neck: 2.8, nt: 0.6, cheek: '#f4f0e8', beak: [1.1, '#2a2a30', 0.42], legC: '#3a3a40', wing: 5.6, tail: 1.6, legs: 1.3 }, p), f: WING, W: 26, H: 22, k: 'flock', v: 34, r: 1.5, g: [5, 9], alt: 120 },
  pipistrello: { n: 'pipistrello', m: p => SG.art.bat(p.fly === 2 ? 1 : 0, '#4a4058', '#3a3048', '#ffe080'), f: WING, W: 28, H: 30, sc: 0.5, k: 'flit', v: 30, r: 0.8, g: [2, 5], alt: 14, when: 'night' },
  // --- chi salta fuori dall'acqua
  pesce: { n: 'pesce', m: p => pitched(fish({ c: '#8ab0c8', c2: '#e0ecf4', fin: '#5a88a8', s: 0.8 }, p), p.pitch || 0), f: [{ pitch: 0.75 }, { pitch: 0, bend: 0.8 }, { pitch: -0.75 }], W: 18, H: 20, k: 'leap', r: 1.2, tn: [null, [1.3, 1.1, 0.6], [0.8, 1.1, 0.9]] },
  carpa: { n: 'carpa koi', m: p => pitched(fish({ c: '#f8f4ec', c2: '#ffffff', fin: '#f0a040', s: 0.9, spots: [[1.4, 3.9], [-1.8, 3.2]], spotC: '#f0602a' }, p), p.pitch || 0), f: [{ pitch: 0.75 }, { pitch: 0, bend: 0.8 }, { pitch: -0.75 }], W: 20, H: 21, k: 'leap', r: 1.2 },
  delfino: { n: 'delfino', m: p => pitched(dolphin({ c: '#6a8aa8', c2: '#d8e4ee' }, p), p.pitch || 0, 4, 10), f: [{ pitch: 0.7 }, { pitch: 0, bend: 0.5 }, { pitch: -0.7, bend: 1 }], W: 32, H: 30, k: 'leap', r: 3 },
};

// ---------- chi vive dove ----------
// Per ogni ambiente: [specie, peso]. Le specie "di giorno" di notte dormono e non si vedono; quelle "di notte" escono col buio.
const LAND = [
  /*  0 prati     */ [['coniglio', 5], ['cervo', 3], ['cavallo', 2], ['volpe', 1.2], ['passero', 2.5], ['corvo', 1.2], ['cinghiale', 0.6], ['riccio', 2.5]],
  /*  1 campi     */ [['mucca', 5], ['pecora', 5], ['gallina', 4], ['maiale', 2], ['cavallo', 1.5], ['cane', 1.2], ['gatto', 1], ['passero', 3], ['coniglio', 1], ['riccio', 1.5]],
  /*  2 bosco     */ [['cervo', 4], ['scoiattolo', 4.5], ['volpe', 2], ['cinghiale', 2], ['coniglio', 2], ['passero', 3], ['corvo', 1.2], ['gufo', 3.5], ['riccio', 2.5]],
  /*  3 monti     */ [['stambecco', 5], ['corvo', 2], ['coniglio', 0.6], ['gufo', 1.5]],
  /*  4 neve      */ [['renna', 4], ['lepreB', 4], ['volpeB', 2], ['pinguino', 2.5], ['gufo', 1]],
  /*  5 deserto   */ [['cammello', 3.5], ['fennec', 3], ['lucertola', 4.5]],
  /*  6 palude    */ [['rana', 5], ['airone', 3], ['tartaruga', 2], ['capibara', 1.5], ['corvo', 1], ['gufo', 2]],
  /*  7 vulcano   */ [['lucertola', 3], ['corvo', 2]],
  /*  8 autunno   */ [['cervo', 4], ['scoiattolo', 4], ['volpe', 2.5], ['cinghiale', 2], ['coniglio', 2], ['passero', 2.5], ['gufo', 3], ['riccio', 2.5]],
  /*  9 piana     */ [['cavallo', 4.5], ['bisonte', 2.5], ['cervo', 2.5], ['coniglio', 3], ['volpe', 1.2], ['passero', 2], ['lucertola', 1]],
  /* 10 altopiano */ [['bisonte', 4], ['lucertola', 3], ['fennec', 1.5], ['cavallo', 2]],
  /* 11 giungla   */ [['scimmia', 4], ['pappagallo', 4], ['tucano', 2.5], ['capibara', 2], ['rana', 3], ['tartaruga', 1]],
  /* 12 ciliegi   */ [['cervoS', 4], ['gru', 3], ['tanuki', 2.5], ['coniglio', 2], ['passero', 3], ['gatto', 0.7], ['gufo', 2]],
  /* 13 brughiera */ [['pecora', 3], ['cavallo', 2], ['corvo', 3], ['coniglio', 3], ['volpe', 1.5], ['gufo', 2]],
  /* 14 alpi      */ [['stambecco', 5], ['cervo', 2.5], ['lepreB', 2], ['volpeB', 1], ['corvo', 1.5], ['gufo', 1.5], ['passero', 1.5]],
  /* 15 colline   */ [['pecora', 3], ['cavallo', 2], ['coniglio', 4], ['cervo', 2], ['volpe', 1.5], ['passero', 3], ['riccio', 2], ['corvo', 1]],
];
const SKY = { 3: 'aquila', 5: 'avvoltoio', 7: 'avvoltoio', 9: 'aquila', 10: 'aquila', 14: 'aquila' };
const BEACH = [['granchio', 4], ['gabbiano', 4.5], ['tartaruga', 1.2]], BEACH_COLD = [['foca', 4], ['pinguino', 3.5], ['gabbiano', 2]];
// in città entrano solo cani, gatti e uccellini (e i gabbiani dei porti): nessun altro ci nasce, ci cammina o ci atterra
const STREET = [['passero', 3], ['gatto', 2.2], ['cane', 1.6], ['piccione', 1.2]];
for (const k of ['cane', 'gatto', 'piccione', 'passero', 'gabbiano']) SPEC[k].city = 1;
// la selvaggina: quello che una freccia può colpire (mai gli animali di casa, di fattoria o di città, né quelli sacri dei ciliegi)
for (const k of ['coniglio', 'lepreB', 'cervo', 'cervoM', 'cinghiale', 'volpe', 'volpeB', 'stambecco', 'renna', 'bisonte', 'fennec', 'anatra']) SPEC[k].game = 1;
const WATER = [['anatra', 4], ['cigno', 1.6]], WATER_WARM = [['fenicottero', 3], ['anatra', 2]];
const WARM = new Set([5, 9, 10, 11]), FLOWERS = new Set([0, 1, 8, 11, 12, 13, 14, 15]);

// ---------- il motore ----------
// Il mondo è diviso in riquadri: quando l'eroe si avvicina, ogni riquadro fa comparire i suoi gruppi (sempre gli stessi
// per quel posto e quell'ora); quando si allontana, spariscono. Gli sprite di una specie si disegnano la prima volta
// che serve, pochi per fotogramma, così il caricamento del gioco non si allunga.
function create(env) {
  const W = env.W, gH = env.gH, SR = env.SR, CS = 96, R_ON = 250, R_OFF = 330, MAXN = 115, SKS = 384, SK_ON = 620;
  const SP = {}, queue = [], cells = new Map(), skies = new Map();
  let list = [], scanT = 0, leapT = 4, flockT = 30, flutT = 1, croakT = 6, chirpT = 5, night = false, on = false;
  const rnd = Math.random, rr = (a, b) => a + rnd() * (b - a);
  const ang = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };

  // --- sprite
  function init() {
    for (const k of Object.keys(SPEC).sort((a, b) => SPEC[b].H - SPEC[a].H)) {
      const S = SPEC[k], w = Math.round(S.W * SR), h = Math.round(S.H * SR), fr = [];
      for (let f = 0; f < S.f.length; f++) { const d = []; for (let i = 0; i < 5; i++) d.push(env.reserve(w, h)); for (let i = 3; i > 0; i--) d.push(Object.assign({}, d[i], { u0: d[i].u1, u1: d[i].u0 })); fr.push(d); }
      SP[k] = { fr, s: 0.2 / SR * (S.sc || 1), ready: false, asked: false, left: S.f.length * 5, w, h };
    }
    // farfalle e libellule sono due disegnini a pixel: pronti subito, colorati con le tinte
    const px = env.pix;
    SP.farfalla = { ready: true, s: 0.2, fr: [px(['aa.aa', 'aaaaa', '.aba.', 'aa.aa', 'a...a'], { a: '#ffffff', b: '#3a3040' }), px(['.a.a.', '.aaa.', '.aba.', '.a.a.', '.....'], { a: '#ffffff', b: '#3a3040' })] };
    SP.libellula = { ready: true, s: 0.2, fr: [px(['aa...aa', '.aabaa.', '...b...', '...b...', '...b...'], { a: '#c8f0ff', b: '#2a8ab0' }), px(['.......', 'aaabaaa', '...b...', '...b...', '...b...'], { a: '#c8f0ff', b: '#2a8ab0' })] };
  }
  function want(k) {
    const sp = SP[k]; if (sp.asked) return sp.ready; sp.asked = true;
    for (let f = 0; f < SPEC[k].f.length; f++) for (let d = 0; d < 5; d++) queue.push([k, f, d]);
    return false;
  }
  function paintSome(ms) {
    const t0 = performance.now();
    while (queue.length) {
      const [k, f, d] = queue.shift(), S = SPEC[k], sp = SP[k];
      env.paint(sp.fr[f][d], env.figure(S.m(S.f[f]), d / 8 * TAU, sp.w, sp.h, { sc: (S.msc || 1) * SR, base: sp.h - 5 }));
      if (--sp.left === 0) sp.ready = true;
      if (performance.now() - t0 > ms) break;
    }
  }

  // --- il terreno visto dagli animali
  const inGrotta = (x, z) => { if (!W.GROTTE.length) return false; const q = W.grotta(x, z); return !!(q && q.f); };   // nelle grotte aperte gli animali dei prati non entrano
  const dry = (x, z, S) => { const g = gH(x, z); return g > (S.wet ? 0.15 : 0.4) && W.slope(x, z) < (S.steep ? 1.8 : 1.15) && !W.blocked(x, z, S.cr || 1.3) && !inGrotta(x, z); };
  const wet = (x, z) => { const g = gH(x, z); return g < -0.7 && g > -40 && !W.inBox(x, z, 2); };
  const shallow = (x, z) => { const g = gH(x, z); return g < 1.5 && g > -1.7 && !W.blocked(x, z, 1.3); };
  // il suolo delle città: i rettangoli di città e villaggi (W.URBAN), più Borgo Aurora attorno alle sue case
  let URB = null;
  const urban = (x, z) => {
    if (!URB) { URB = (W.URBAN || []).slice(); let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const b of W.BUILD) if (b.k === 'house' && Math.hypot(b.x - 2000, b.z - 2650) < 260) { x0 = Math.min(x0, b.x - b.w / 2); x1 = Math.max(x1, b.x + b.w / 2); z0 = Math.min(z0, b.z - b.d / 2); z1 = Math.max(z1, b.z + b.d / 2); } if (x1 > x0) URB.push([x0 - 14, z0 - 14, x1 + 14, z1 + 14]); }
    for (const r of URB) if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) return true;
    return false;
  };
  const inCity = () => { let n = 0; for (const a of list) if (urban(a.x, a.z)) n++; return n; };   // quanti sono già in città: oltre un certo numero non ne nascono altri
  const okFor = (S, x, z) => (S.city || !urban(x, z)) && (S.k === 'swim' ? wet(x, z) : S.k === 'wade' ? shallow(x, z) || dry(x, z, S) : dry(x, z, S));
  const nearWater = (x, z, r) => { for (let i = 0; i < 8; i++) { const a = i * 0.785; if (gH(x + Math.cos(a) * r, z + Math.sin(a) * r) < -0.3) return true; } return false; };
  function choose(table, R, only) {
    let tot = 0; for (const [, w] of table) tot += w;
    let v = R() * tot; for (const [k, w] of table) { v -= w; if (v <= 0) { const wh = SPEC[k].when; return (wh === 'day' && night) || (wh === 'night' && !night) || (only && wh !== only) ? null : k; } }
    return null;
  }

  // --- nascita
  // Le tinte: nel disegno un rosso sopra 1,05 vuol dire "brilla di luce propria" (fiamme, lanterne), e di notte l'animale
  // sarebbe un faro. Quindi una tinta che schiarisce diventa: colore pieno più un velo di bianco; le altre si abbassano.
  function shade(t) {
    if (!t) return [null, 0];
    const mx = Math.max(t[0], t[1], t[2]), mn = Math.min(t[0], t[1], t[2]);
    if (mn >= 1) return [[t[0] / mx, t[1] / mx, t[2] / mx], clamp(((t[0] + t[1] + t[2]) / 3 - 1) * 0.9, 0, 0.45)];
    const k = mx > 1.04 ? 1.04 / mx : 1; return [[t[0] * k, t[1] * k, t[2] * k], 0];
  }
  function add(k, x, z, grp, o) {
    const S = SPEC[k], [tn, wh] = shade(S.tn ? S.tn[Math.floor(rnd() * S.tn.length)] : null);
    const a = Object.assign({ k, S, x, z, y: gH(x, z), yaw: rnd() * TAU, st: 'idle', t: rr(0.5, 4), tx: x, tz: z, g: grp, tint: tn, wh, sc: rr(0.93, 1.07), walk: 0, mv: false, air: 0, ph: rnd() * 10, hop: 0, sp: 0 }, o);
    list.push(a); grp.m.push(a); return a;
  }
  function spot(S, x, z, r, R) {
    for (let i = 0; i < 8; i++) { const a = R() * TAU, d = Math.sqrt(R()) * r, X = x + Math.cos(a) * d, Z = z + Math.sin(a) * d; if (okFor(S, X, Z)) return [X, Z]; }
    return null;
  }
  function group(k, x, z, R, sure) {
    const S = SPEC[k];
    if (!sure && R() > 5.2 / (S.g[0] + S.g[1])) return;
    if (S.wet && W.biomeAt(x, z) !== 6 && !nearWater(x, z, 40)) return;
    want(k);
    const n = S.g[0] + Math.floor(R() * (S.g[1] - S.g[0] + 1)), grp = { k, x, z, m: [], alarm: 0, rest: rr(15, 50) };
    for (let i = 0; i < n; i++) { const p = spot(S, x, z, 5 + n * 2.5, R); if (p) add(k, p[0], p[1], grp); }
    if (!grp.m.length) return;
    // i piccoli: qualche cucciolo nei branchi, i pulcini dietro alle galline, un maschio con le cerve
    if (S.k === 'graze' && n > 1) for (const a of grp.m) if (R() < 0.22) a.sc = 0.62;
    if (k === 'gallina') { want('pulcino'); for (let i = 0; i < 1 + Math.floor(R() * 4); i++) { const p = spot(SPEC.pulcino, x, z, 6, R); if (p) add('pulcino', p[0], p[1], grp); } }
    if (k === 'cervo' && R() < 0.5) { want('cervoM'); const p = spot(SPEC.cervoM, x, z, 12, R); if (p) add('cervoM', p[0], p[1], grp); }
  }
  function sky(k, x, z, R) {
    const S = SPEC[k]; want(k);
    const n = S.g[0] + Math.floor(R() * (S.g[1] - S.g[0] + 1)), grp = { k, x, z, m: [], alarm: 0 }, rad = 70 + R() * 90, dir = R() < 0.5 ? 1 : -1;
    for (let i = 0; i < n; i++) add(k, x, z, grp, { st: 'soar', rad: rad * (0.8 + i * 0.25), ca: R() * TAU, dir, alt: S.alt * (0.8 + R() * 0.5) + i * 9 });
  }
  function fill(ci, cj, only, hx, hz) {
    const R = rng(((ci * 73856093) ^ (cj * 19349663) ^ (night ? 0x9e3779 : 0)) >>> 0), x0 = ci * CS, z0 = cj * CS;
    for (let t = 0; t < 3; t++) {
      const go = R() < [0.62, 0.31, 0.1][t], x = x0 + (0.1 + R() * 0.8) * CS, z = z0 + (0.1 + R() * 0.8) * CS;
      if (!go || list.length >= MAXN || x < 40 || z < W.Z0 + 40 || x > W.WS - 40 || z > W.WS - 40) continue;
      if (only && Math.hypot(x - hx, z - hz) < 110) continue;
      const g = gH(x, z), bio = W.biomeAt(x, z), cd = W.coastDist(x, z), urb = urban(x, z);
      let table;
      if (g < -0.6) { if (urb || g < -8 || bio === 4 || cd < 70) continue; table = WARM.has(bio) ? WATER_WARM : WATER; }
      else if (urb) { if (R() > 0.2 || inCity() >= 10) continue; table = STREET; }   // per le strade poca roba: i piccioni stanno in piazza (li mette la città, più sotto)
      else if (g < 3 && cd < 130 && bio !== 6) table = bio === 4 ? BEACH_COLD : BEACH;
      else table = LAND[bio];
      const k = choose(table, R, only); if (k) group(k, x, z, R);
    }
  }
  function scan(hx, hz) {
    const i0 = Math.floor((hx - R_ON) / CS), i1 = Math.floor((hx + R_ON) / CS), j0 = Math.floor((hz - R_ON) / CS), j1 = Math.floor((hz + R_ON) / CS);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const key = i + ',' + j; if (cells.has(key)) continue;
      const cx = (i + 0.5) * CS, cz = (j + 0.5) * CS; if (Math.hypot(cx - hx, cz - hz) > R_ON) continue;
      cells.set(key, { cx, cz }); fill(i, j);
    }
    for (const [key, c] of cells) if (Math.hypot(c.cx - hx, c.cz - hz) > R_OFF + CS + (c.town ? 80 : 0)) cells.delete(key);
    W.TOWNS.forEach((t, n) => {
      const key = 'T' + n; if (!t.big || cells.has(key) || Math.hypot(t.x - hx, t.z - hz) > R_ON + 60) return;
      cells.set(key, { cx: t.x, cz: t.z, town: true });
      const R = rng((n * 7919 + (night ? 13 : 0)) >>> 0), at = (k, r) => { const a = R() * TAU, d = R() * r; if (!(SPEC[k].when === 'day' && night) && inCity() < 14) group(k, t.x + Math.cos(a) * d, t.z + Math.sin(a) * d, R, true); };
      at('piccione', 14); if (R() < 0.35) at('piccione', 70); at('gatto', 80); if (R() < 0.7) at('cane', 70); if (R() < 0.6) at('passero', 90); if (R() < 0.5) at('gatto', 100);
    });
    // chi vola in cerchio si vede da lontano: per il cielo i riquadri sono più grandi
    if (night) return;
    const a0 = Math.floor((hx - SK_ON) / SKS), a1 = Math.floor((hx + SK_ON) / SKS), b0 = Math.floor((hz - SK_ON) / SKS), b1 = Math.floor((hz + SK_ON) / SKS);
    for (let j = b0; j <= b1; j++) for (let i = a0; i <= a1; i++) {
      const key = i + ',' + j; if (skies.has(key)) continue;
      const cx = (i + 0.5) * SKS, cz = (j + 0.5) * SKS; if (Math.hypot(cx - hx, cz - hz) > SK_ON) continue;
      skies.set(key, { cx, cz });
      const R = rng(((i * 83492791) ^ (j * 2971215073)) >>> 0), x = cx + (R() - 0.5) * SKS * 0.6, z = cz + (R() - 0.5) * SKS * 0.6, sk = SKY[W.biomeAt(x, z)];
      if (sk && R() < 0.55 && gH(x, z) > 1) sky(sk, x, z, R);
    }
    for (const [key, c] of skies) if (Math.hypot(c.cx - hx, c.cz - hz) > SK_ON + SKS * 1.5) skies.delete(key);
  }

  // --- movimento
  // un passo verso (tx, tz): true se si è mosso
  function go(a, tx, tz, v, dt) {
    const S = a.S, dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz); if (d < 0.6) return false;
    const want2 = Math.atan2(dz, dx); a.yaw += ang(want2, a.yaw) * Math.min(1, (S.turn || 7) * dt);
    const st = Math.min(d, v * dt), nx = a.x + Math.cos(a.yaw) * st, nz = a.z + Math.sin(a.yaw) * st;
    if (!okFor(S, nx, nz)) return false;
    a.x = nx; a.z = nz; a.walk += st; a.mv = true; return true;
  }
  function wander(a, r) {
    const g = a.g; for (let i = 0; i < 5; i++) { const an = rnd() * TAU, d = rr(0.25, 1) * r, X = g.x + Math.cos(an) * d, Z = g.z + Math.sin(an) * d; if (okFor(a.S, X, Z)) { a.tx = X; a.tz = Z; return true; } }
    return false;
  }
  // via dall'eroe: una direzione libera tra quelle che lo allontanano
  function away(a, hx, hz, d) {
    const b = Math.atan2(a.z - hz, a.x - hx);
    for (const o of [0, 0.5, -0.5, 1, -1, 1.5, -1.5]) { const an = b + o + rr(-0.2, 0.2), X = a.x + Math.cos(an) * d, Z = a.z + Math.sin(an) * d; if (okFor(a.S, X, Z) && okFor(a.S, a.x + Math.cos(an) * 6, a.z + Math.sin(an) * 6)) { a.tx = X; a.tz = Z; return true; } }
    return false;
  }
  function alarm(g, t) { if (g.alarm <= 0) g.alarm = t; }
  // gli uccelli si alzano in volo verso un posto più tranquillo
  function takeoff(a, hx, hz, far) {
    const S = a.S, b = Math.atan2(a.z - hz, a.x - hx) + rr(-0.9, 0.9), g = a.g;
    if (!g.fly || g.fly.t < env.time()) {
      let fx2 = a.x, fz2 = a.z, ok2 = false;
      for (let i = 0; i < 8 && !ok2; i++) { const an = b + rr(-0.5, 0.5) * i * 0.4, d = rr(far * 0.6, far); fx2 = a.x + Math.cos(an) * d; fz2 = a.z + Math.sin(an) * d; ok2 = okFor(S, fx2, fz2); }
      g.fly = { x: fx2, z: fz2, t: env.time() + 1.5, gone: !ok2 }; g.x = fx2; g.z = fz2;
      if (Math.hypot(a.x - hx, a.z - hz) < 90) env.noise(0.1, 0.012);
    }
    // ognuno atterra vicino agli altri, ma mai dentro una casa o in acqua
    a.tx = g.fly.x; a.tz = g.fly.z; a.leave = g.fly.gone;
    for (let i = 0; i < 5; i++) { const an = rnd() * TAU, d = rnd() * (4 + g.m.length * 1.5), X = g.fly.x + Math.cos(an) * d, Z = g.fly.z + Math.sin(an) * d; if (a.leave || okFor(S, X, Z)) { a.tx = X; a.tz = Z; break; } }
    a.st = 'fly'; a.fx0 = a.x; a.fz0 = a.z; a.fd = Math.max(20, Math.hypot(a.tx - a.x, a.tz - a.z)); a.t = rr(0, 0.25); a.top = S.alt * rr(0.6, 1.1); a.gy0 = gH(a.x, a.z);
  }

  // --- i caratteri
  function step(a, dt, h, run) {
    const S = a.S, k = S.k, g = a.g, dx = a.x - h.x, dz = a.z - h.z, d = Math.hypot(dx, dz);
    a.mv = false; a.t -= dt;
    if (g.alarm > 0 && a === g.m[0]) g.alarm -= dt;
    if (d > R_OFF + 60 && a.st !== 'soar' && a.st !== 'vee') { a.gone = true; return; }
    if (a.st === 'soar') {                               // in cerchio, alti nel cielo
      a.ca += a.dir * S.v / a.rad * dt; a.x = g.x + Math.cos(a.ca) * a.rad; a.z = g.z + Math.sin(a.ca) * a.rad; a.yaw = a.ca + a.dir * Math.PI / 2;
      a.y = Math.max(gH(a.x, a.z), 0) + a.alt + Math.sin(a.ca * 3 + a.ph) * 6;
      if (Math.hypot(g.x - h.x, g.z - h.z) > SK_ON + SKS) a.gone = true;
      return;
    }
    if (a.st === 'vee') { a.x += Math.cos(a.yaw) * S.v * dt; a.z += Math.sin(a.yaw) * S.v * dt; a.life -= dt; if (a.life <= 0) a.gone = true; return; }
    if (a.st === 'flit') {                               // pipistrelli: giri nervosi intorno a un punto
      a.ca += dt * (1.6 + Math.sin(a.ph + env.time() * 0.7)); const r = 14 + Math.sin(env.time() * 1.3 + a.ph) * 8;
      const nx = g.x + Math.cos(a.ca) * r, nz = g.z + Math.sin(a.ca * 1.3) * r; a.yaw = Math.atan2(nz - a.z, nx - a.x); a.x = nx; a.z = nz;
      a.y = gH(a.x, a.z) + S.alt + Math.sin(env.time() * 3 + a.ph) * 4; return;
    }
    const scared = !api.calm && S.fl && d < S.fl * (run ? 1.35 : 1) * (g.alarm > 0 ? 1.6 : 1);
    if (a.st === 'fly') {                                // volo da un punto all'altro: su, avanti, giù
      if (a.t > 0) { a.y = a.gy0; return; }
      const dd = Math.hypot(a.tx - a.x, a.tz - a.z), st = S.run * dt;
      a.yaw += ang(Math.atan2(a.tz - a.z, a.tx - a.x), a.yaw) * Math.min(1, 5 * dt);
      a.x += Math.cos(a.yaw) * st; a.z += Math.sin(a.yaw) * st;
      const u = clamp(1 - dd / a.fd, 0, 1), up = a.leave ? Math.min(1, u * 3) * 1.6 : Math.sin(Math.PI * Math.min(1, u * 1.04)) ** 0.6;
      const gy = a.leave ? a.gy0 : a.gy0 + (gH(a.tx, a.tz) - a.gy0) * u;
      a.y = Math.max(gy, gH(a.x, a.z)) + a.top * up; a.air = 1;
      if (a.leave ? (u > 0.9 || d > R_OFF) : dd < st * 1.5 + 0.5) { if (a.leave) { a.gone = true; return; } a.x = a.tx; a.z = a.tz; a.y = gH(a.x, a.z); a.st = 'idle'; a.t = rr(1, 4); a.air = 0; }
      return;
    }
    const ground = k === 'swim' ? 0 : gH(a.x, a.z);
    a.y += ((k === 'swim' ? Math.sin(env.time() * 2 + a.ph) * 0.12 - 0.5 : ground) - a.y) * Math.min(1, 14 * dt);

    if (k === 'bird' || k === 'wade' || k === 'owl') {
      if (scared || (g.alarm > 0 && k !== 'owl')) { alarm(g, 2); takeoff(a, h.x, h.z, k === 'owl' ? 90 : 130); return; }
      if (k === 'owl') { if (d < 90) a.yaw += ang(Math.atan2(-dz, -dx), a.yaw) * Math.min(1, 3 * dt); return; }
      // ogni tanto tutto lo stormo cambia posto
      if (a === g.m[0]) { g.rest -= dt; if (g.rest <= 0) { g.rest = rr(25, 70); if (d > 60) { g.alarm = 1.2; takeoff(a, a.x + rr(-1, 1), a.z + rr(-1, 1), k === 'wade' ? 70 : 90); return; } } }
      if (a.st === 'walk') { if (!go(a, a.tx, a.tz, S.v, dt) || a.t <= 0) { a.st = 'idle'; a.t = rr(0.6, 2.5); } }
      else if (a.t <= 0) { if (rnd() < (k === 'wade' ? 0.25 : 0.5) && wander(a, k === 'wade' ? 14 : 9)) { a.st = 'walk'; a.t = rr(0.5, 1.6); } else { a.st = rnd() < 0.6 ? 'eat' : 'idle'; a.t = rr(0.5, k === 'wade' ? 5 : 2); } }
      return;
    }
    if (k === 'swim') {
      const v = scared || g.alarm > 0 ? S.run : S.v;
      if (scared && a.st !== 'flee') { alarm(g, 3); if (away(a, h.x, h.z, 40)) { a.st = 'flee'; a.t = 3; } }
      if (a.st === 'walk' || a.st === 'flee') { if (!go(a, a.tx, a.tz, v, dt) || a.t <= 0) { a.st = 'idle'; a.t = rr(1, 4); if (a === g.m[0]) { g.x = a.x; g.z = a.z; } } }
      else if (a.t <= 0) { if (rnd() < 0.6 && wander(a, S.roam)) { a.st = 'walk'; a.t = rr(3, 8); } else { a.st = rnd() < 0.4 ? 'eat' : 'idle'; a.t = rr(1, 3); } }
      return;
    }
    if (k === 'hop' || k === 'dart' || k === 'crab') {
      // a balzi (o a scatti): un salto alla volta, con una pausa in mezzo
      if (a.hop > 0) {
        a.hop -= dt / a.hd; const st = a.sp * dt;
        const nx = a.x + Math.cos(a.ha) * st, nz = a.z + Math.sin(a.ha) * st;
        if (okFor(S, nx, nz)) { a.x = nx; a.z = nz; a.walk += st; a.mv = true; } else a.hop = Math.min(a.hop, 0.1);
        if (k === 'hop') a.y = gH(a.x, a.z) + Math.sin(Math.PI * clamp(a.hop, 0, 1)) * (a.st === 'flee' ? 2.6 : 1.9) * a.sc;
        return;
      }
      const jump = (an, v) => { a.ha = an; a.yaw = k === 'crab' ? an + Math.PI / 2 : an; a.sp = v; a.hd = k === 'hop' ? 0.34 : rr(0.25, 0.6); a.hop = 1; };
      if (scared && a.st !== 'flee') { alarm(g, 2.5); a.st = 'flee'; a.n = k === 'hop' ? 7 + Math.floor(rnd() * 5) : 3; a.t = 0; if (k === 'hop' && S.wet && d < 60 && rnd() < 0.5) env.tone(260, 0.05, 'square', 0.012, 140); }
      if (a.st === 'flee') {
        if (a.n-- > 0 && away(a, h.x, h.z, 14)) jump(Math.atan2(a.tz - a.z, a.tx - a.x), S.run);
        else { a.st = 'idle'; a.t = rr(1.5, 4); if (a === g.m[0]) { g.x = a.x; g.z = a.z; } }
        return;
      }
      if (g.alarm > 0 && d < S.fl * 2.4) { a.yaw += ang(Math.atan2(-dz, -dx), a.yaw) * Math.min(1, 6 * dt); return; }
      if (a.st === 'walk') { if (a.n-- > 0 && Math.hypot(a.tx - a.x, a.tz - a.z) > 3) jump(Math.atan2(a.tz - a.z, a.tx - a.x) + rr(-0.3, 0.3), S.v); else { a.st = 'idle'; a.t = rr(0.8, k === 'dart' ? 7 : 4.5); } return; }
      if (a.t <= 0) { if (wander(a, S.roam)) { a.st = 'walk'; a.n = 2 + Math.floor(rnd() * 5); } else a.t = 1; }
      return;
    }
    // chi cammina: bruca, guarda, passeggia, scappa
    if (k === 'pet' && S.fl === 0) {                      // il cane: ti viene incontro e ti segue per un po'
      if (d < S.al && a.st !== 'follow' && a.cool === undefined) { a.st = 'follow'; a.t = rr(8, 16); }
      if (a.st === 'follow') {
        if (a.t <= 0 || d > 120) { a.st = 'idle'; a.t = 2; a.cool = 1; a.tx = g.x; a.tz = g.z; return; }
        if (d > 9) go(a, h.x, h.z, d > 30 ? S.run : S.v * 1.4, dt); else a.yaw += ang(Math.atan2(-dz, -dx), a.yaw) * Math.min(1, 6 * dt);
        return;
      }
      if (a.cool !== undefined) { a.cool -= dt; if (a.cool < -40) a.cool = undefined; }
    }
    if (scared && a.st !== 'flee') { alarm(g, 3); if (away(a, h.x, h.z, rr(50, 80))) { a.st = 'flee'; a.t = rr(2.2, 3.6) + (a === g.m[0] ? 0 : rr(0, 0.4)); } }
    else if (!S.fl && d < 7 && a.st !== 'walk' && S.k !== 'loaf' && away(a, h.x, h.z, 12)) { a.st = 'walk'; a.t = 2; }        // chi non ha paura si scosta soltanto
    if (a.st === 'flee') {
      if (!go(a, a.tx, a.tz, S.run * (a.sc < 0.8 ? 0.92 : 1), dt)) { if (!away(a, h.x, h.z, 40)) a.t = 0; }
      if (a.t <= 0 || Math.hypot(a.tx - a.x, a.tz - a.z) < 2) { if (d < S.fl * 1.5 && away(a, h.x, h.z, 60)) a.t = 2; else { a.st = 'idle'; a.t = rr(2, 5); if (a === g.m[0]) { g.x = a.x; g.z = a.z; } } }
      return;
    }
    // sull'attenti: l'eroe è abbastanza vicino da farsi notare
    if (S.al && d < S.al * (run ? 1.25 : 1) && (S.fl || k === 'loaf' || k === 'waddle' || k === 'slow')) {
      if (a.st !== 'alert') { a.st = 'alert'; a.t = rr(1.5, 4); }
      if (k !== 'loaf' && k !== 'slow') a.yaw += ang(Math.atan2(-dz, -dx), a.yaw) * Math.min(1, 5 * dt);
      if (a.t <= 0 && d > S.fl * 1.5) { a.st = 'idle'; a.t = rr(1, 3); a.calm = 5; }
      if (a.st === 'alert' && !(a.calm > 0)) return;
    }
    if (a.calm > 0) a.calm -= dt;
    if (a.st === 'alert') { a.st = 'idle'; a.t = rr(0.5, 2); }
    if (a.st === 'walk') { if (!go(a, a.tx, a.tz, S.v * (a.sc < 0.8 ? 1.25 : 1), dt) || a.t <= 0) { a.st = 'idle'; a.t = rr(1, 4); } return; }
    if (a.t <= 0) {
      const r = rnd();
      // i cuccioli e chi si è allontanato tornano dal branco
      if (Math.hypot(a.x - g.x, a.z - g.z) > S.roam * 1.2) { if (wander(a, S.roam * 0.5)) { a.st = 'walk'; a.t = 12; } else a.t = 2; }
      else if (r < (k === 'graze' ? 0.5 : 0.25) && S.f.length > 2 && k !== 'pet' && k !== 'waddle') { a.st = 'eat'; a.t = rr(3, 9); }
      else if (r < (k === 'loaf' ? 0.6 : 0.82) && k !== 'slow' ? wander(a, S.roam) : rnd() < 0.3 && wander(a, S.roam)) { a.st = 'walk'; a.t = rr(3, 9); }
      else { a.st = k === 'pet' && rnd() < 0.7 ? 'eat' : 'idle'; a.t = rr(1.5, 6); }
    }
  }

  // --- quello che succede intorno: salti dall'acqua, stormi di passaggio, farfalle
  function leap(h) {
    const an = rnd() * TAU, d = rr(35, 170), x = h.x + Math.cos(an) * d, z = h.z + Math.sin(an) * d, g = gH(x, z);
    if (g > -1.6 || W.inBox(x, z, 3)) return;
    const cd = W.coastDist(x, z), sea = cd < 20, bio = W.biomeAt(x, z);
    const k = sea && g < -6 && rnd() < 0.5 ? 'delfino' : bio === 12 && !sea ? 'carpa' : 'pesce';
    if (!want(k)) return;
    const S = SPEC[k], n = k === 'delfino' ? 2 + Math.floor(rnd() * 2) : 1, ya = rnd() * TAU, grp = { k, x, z, m: [], alarm: 0 };
    for (let i = 0; i < n; i++) add(k, x + Math.cos(ya + 1.6) * i * 9, z + Math.sin(ya + 1.6) * i * 9, grp, { st: 'leap', yaw: ya, vy: k === 'delfino' ? 17 : 13, y: -1.5, t: i * 0.45, sp: k === 'delfino' ? 13 : 7, wetIn: false });
  }
  function vee(h) {
    if (!want('oca')) return;
    const S = SPEC.oca, an = rnd() * TAU, side = an + Math.PI / 2, off = rr(-140, 140), d0 = 560;
    const sx = h.x - Math.cos(an) * d0 + Math.cos(side) * off, sz = h.z - Math.sin(an) * d0 + Math.sin(side) * off, n = S.g[0] + Math.floor(rnd() * (S.g[1] - S.g[0] + 1));
    const grp = { k: 'oca', x: sx, z: sz, m: [], alarm: 0 }, alt = Math.max(gH(h.x, h.z), 0) + S.alt + rr(-15, 25);
    for (let i = 0; i < n; i++) { const row = Math.ceil(i / 2), sgn = i % 2 ? 1 : -1; add('oca', sx - Math.cos(an) * row * 7 + Math.cos(side) * sgn * row * 6, sz - Math.sin(an) * row * 7 + Math.sin(side) * sgn * row * 6, grp, { st: 'vee', yaw: an, y: alt + row * 0.6, life: d0 * 2 / S.v, air: 1 }); }
    if (rnd() < 0.7) { env.tone(520, 0.09, 'triangle', 0.012, 470, 0.3); env.tone(560, 0.09, 'triangle', 0.011, 500, 0.75); }
  }
  let flut = [];
  function flutter(h, dt) {
    for (const b of flut) {
      b.t -= dt; b.ph += dt;
      b.vx += (Math.sin(b.ph * 2.3 + b.s) * 9 - b.vx) * dt * 2 + (b.hx - b.x) * dt * 0.15; b.vz += (Math.cos(b.ph * 1.7 + b.s * 2) * 9 - b.vz) * dt * 2 + (b.hz - b.z) * dt * 0.15;
      b.x += b.vx * dt; b.z += b.vz * dt; b.y = Math.max(gH(b.x, b.z), b.wt ? 0 : -9) + b.h + Math.sin(b.ph * 5 + b.s) * 0.9;
      if (b.t <= 0 || Math.hypot(b.x - h.x, b.z - h.z) > 150) b.gone = true;
    }
    flut = flut.filter(b => !b.gone);
    flutT -= dt; if (flutT > 0) return; flutT = 0.5;
    if (night || flut.length >= 9) return;
    const an = rnd() * TAU, d = rr(18, 95), x = h.x + Math.cos(an) * d, z = h.z + Math.sin(an) * d, g = gH(x, z), bio = W.biomeAt(x, z);
    const dragon = bio === 6 || (g < 0.6 && g > -2 && W.coastDist(x, z) > 60);
    if (!dragon && (!FLOWERS.has(bio) || g < 0.5)) return;
    if (inGrotta(x, z)) return;
    const C = dragon ? [[0.5, 1.2, 1.5], [1.4, 0.6, 0.5], [0.6, 1.5, 0.7]] : [[1.5, 1.3, 0.4], [1.5, 0.7, 0.3], [0.6, 0.9, 1.6], [1.5, 1.5, 1.5], [1.5, 0.6, 1.1], [1.1, 0.6, 1.5]];
    for (let i = 0, n = 1 + Math.floor(rnd() * 3); i < n; i++) { const tw = shade(C[Math.floor(rnd() * C.length)]); flut.push({ k: dragon ? 'libellula' : 'farfalla', x: x + rr(-6, 6), z: z + rr(-6, 6), hx: x, hz: z, y: 0, vx: 0, vz: 0, h: rr(2, 5.5), wt: dragon, s: rnd() * 9, ph: rnd() * 9, t: rr(18, 40), tint: tw[0], wh: tw[1] }); }
  }

  function update(dt, h, run, isNight) {
    paintSome(2.2);
    if (isNight !== night) { night = isNight; if (on) { for (const a of list) { const w = a.S.when; if ((w === 'day' && night) || (w === 'night' && !night)) { if (a.S.k === 'bird' && a.st !== 'fly') { a.g.fly = null; takeoff(a, h.x, h.z, 400); a.leave = true; } else if (a.st === 'flit' || Math.hypot(a.x - h.x, a.z - h.z) > 170) a.gone = true; else a.fade = 1; } } for (const key of cells.keys()) if (key[0] !== 'T') { const [i, j] = key.split(',').map(Number); fill(i, j, night ? 'night' : 'day', h.x, h.z); } if (night) for (const a of list) if (a.st === 'soar') a.gone = true; skies.clear(); } }
    on = true;
    scanT -= dt; if (scanT <= 0) { scanT = 0.35; scan(h.x, h.z); }
    for (const a of list) {
      if (a.st === 'leap') {
        if (a.t > 0) { a.t -= dt; continue; }
        if (!a.wetIn) { a.wetIn = true; splash(a.x, a.z, a.k === 'delfino' ? 7 : 4); if (Math.hypot(a.x - h.x, a.z - h.z) < 110) env.noise(0.07, 0.01); }
        a.vy -= 26 * dt; a.y += a.vy * dt; a.x += Math.cos(a.yaw) * a.sp * dt; a.z += Math.sin(a.yaw) * a.sp * dt;
        if (a.y < -2 && a.vy < 0) { splash(a.x, a.z, a.k === 'delfino' ? 9 : 5); a.gone = true; }
        continue;
      }
      if (a.fade) { if (Math.hypot(a.x - h.x, a.z - h.z) > 150) { a.gone = true; continue; } }
      step(a, dt, h, run);
    }
    if (list.some(a => a.gone)) { list = list.filter(a => !a.gone); for (const a of list) if (a.g.m.some(q => q.gone)) a.g.m = a.g.m.filter(q => !q.gone); }
    leapT -= dt; if (leapT <= 0) { leapT = rr(2.5, 7); leap(h); }
    flockT -= dt; if (flockT <= 0) { flockT = rr(45, 110); if (!night) vee(h); }
    // i pipistrelli escono col buio vicino all'eroe
    if (night) { croakT -= dt; if (croakT <= 0) { croakT = rr(14, 30); if (list.length < MAXN && want('pipistrello') && !list.some(a => a.k === 'pipistrello' && Math.hypot(a.x - h.x, a.z - h.z) < 260)) { const an = rnd() * TAU, d = rr(60, 140), x = h.x + Math.cos(an) * d, z = h.z + Math.sin(an) * d; if (gH(x, z) > 0.5) { const grp = { k: 'pipistrello', x, z, m: [], alarm: 0 }; for (let i = 0, n = 2 + Math.floor(rnd() * 4); i < n; i++) add('pipistrello', x, z, grp, { st: 'flit', ca: rnd() * TAU, air: 1 }); } } } }
    flutter(h, dt);
    if (!night) { chirpT -= dt; if (chirpT <= 0) { chirpT = rr(5, 13); let nb = null, bd = 80; for (const a of list) if (a.S.k === 'bird' && a.st !== 'fly') { const d = Math.hypot(a.x - h.x, a.z - h.z); if (d < bd) { bd = d; nb = a; } }
      if (nb) { const f0 = nb.k === 'corvo' ? 620 : nb.k === 'gabbiano' ? 1300 : rr(2300, 3300), v = 0.011 * (1 - bd / 100), crow = nb.k === 'corvo'; for (let i = 0, n = crow ? 2 : 2 + Math.floor(rnd() * 3); i < n; i++) env.tone(f0 * rr(0.94, 1.08), crow ? 0.12 : 0.045, crow ? 'sawtooth' : 'sine', crow ? v * 0.6 : v, f0 * (crow ? 0.8 : rr(1.1, 1.3)), i * (crow ? 0.22 : 0.09)); } } }
  }
  // --- la caccia
  // che cosa c'è lungo il volo di una freccia (da un punto all'altro): la prima preda entro il raggio, a terra o poco sopra
  function strike(x0, z0, x1, z1, r) {
    const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1e-6; let best = null, bt = 2;
    for (const a of list) {
      if (!a.S.game || a.gone || a.st === 'soar' || a.st === 'vee' || a.st === 'leap') continue;
      const t = clamp(((a.x - x0) * dx + (a.z - z0) * dz) / L2, 0, 1), px = x0 + dx * t, pz = z0 + dz * t, R = a.S.r * a.sc + r;
      if ((a.x - px) ** 2 + (a.z - pz) ** 2 > R * R || t >= bt) continue;
      if (a.y - (a.S.k === 'swim' ? 0 : gH(a.x, a.z)) > 8) continue;
      best = a; bt = t;
    }
    return best;
  }
  // tutto il branco scappa da (hx, hz), anche se chi l'ha spaventato è lontano
  function panic(g, hx, hz) {
    g.alarm = Math.max(g.alarm, 5);
    for (const a of g.m) {
      if (a.gone) continue; const k = a.S.k;
      if (a.st === 'soar' || a.st === 'vee' || a.st === 'flit' || a.st === 'leap' || a.st === 'fly') continue;
      if (k === 'bird' || k === 'wade' || k === 'owl') takeoff(a, hx, hz, 130);
      else if (k === 'hop' || k === 'dart' || k === 'crab') { a.st = 'flee'; a.n = 9; a.t = 0; }
      else if (away(a, hx, hz, k === 'swim' ? 40 : rr(60, 90))) { a.st = 'flee'; a.t = rr(3, 5); }
    }
  }
  function fell(a, hx, hz) { a.gone = true; panic(a.g, hx, hz); }
  // una freccia caduta vicino: i branchi nel raggio scappano
  function startle(x, z, r, hx, hz) { const done = new Set(); for (const a of list) if (!done.has(a.g) && a.S.fl && !a.gone && (a.x - x) ** 2 + (a.z - z) ** 2 < r * r) { done.add(a.g); panic(a.g, hx, hz); } }
  function splash(x, z, n) { for (let i = 0; i < n; i++) { const an = rnd() * TAU, v = rr(3, 9); env.fx({ k: 'drop', x, z, y: 0.3, vx: Math.cos(an) * v, vz: Math.sin(an) * v, vy: rr(9, 17), t: rr(0.5, 0.9), s: 0.3 }); } }
  // spavento: un colpo di spada, un incantesimo, un mostro...
  function scare(x, z, r) { for (const a of list) if (a.S.fl && (a.x - x) ** 2 + (a.z - z) ** 2 < r * r) a.g.alarm = Math.max(a.g.alarm, 2.5); }

  // --- disegno
  function frame(a, t) {
    const k = a.S.k, n = a.S.f.length, w = Math.floor(a.walk / ((a.S.stride || 3.2) * a.sc)) % 2;
    if (a.st === 'soar') return Math.sin(t * 0.7 + a.ph) > 0.86 ? 1 + (Math.floor(t * 7) % 2) : 0;
    if (a.st === 'vee' || a.st === 'flit') return Math.floor(t * (a.st === 'flit' ? 11 : 6) + a.ph) % 2;
    if (a.st === 'leap') return a.vy > 5 ? 0 : a.vy > -5 ? 1 : 2;
    if (a.st === 'fly') return a.t > 0 ? 0 : (k === 'owl' ? 1 : 2) + (Math.floor(t * 10 + a.ph) % 2);
    if (k === 'hop') return a.hop > 0 ? 1 : 0;
    if (k === 'dart' || k === 'crab') return a.hop > 0 ? 1 + w : 0;
    if (k === 'bird' || k === 'wade') return a.st === 'eat' && Math.sin(t * 5 + a.ph) > 0.2 ? 1 : 0;
    if (k === 'owl') return 0;
    if (k === 'swim') return a.st === 'eat' && Math.sin(t * 1.6 + a.ph) > 0.3 ? 1 : 0;
    if (k === 'peck') return a.mv ? (w ? 2 : 0) : a.st === 'eat' && Math.sin(t * 6 + a.ph) > 0 ? 1 : 0;
    if (k === 'waddle') return a.mv ? 1 + w : a.st === 'alert' && Math.sin(t * 7 + a.ph) > 0 ? 3 : 0;
    if (k === 'loaf') return a.mv ? (w ? 2 : 0) : a.st === 'alert' || a.st === 'eat' ? 1 : 0;
    if (k === 'monkey') return a.mv ? 1 + w : 0;
    if (k === 'pet') return a.mv ? (w ? 1 : 0) : n > 2 && (a.st === 'eat' || a.st === 'follow') ? (a.S.fl ? 2 : (Math.sin(t * 9) > 0 ? 2 : 0)) : 0;
    if (k === 'slow') return a.mv ? (w ? 1 : 0) : a.st === 'alert' ? 2 : 0;
    return a.mv ? (w ? 1 : 0) : a.st === 'eat' && n > 2 ? 2 : 0;
  }
  function draw(cam, t) {
    const push = env.pushBB, dirOf = env.dirOf;
    for (const a of list) {
      const dd = (a.x - cam.x) ** 2 + (a.z - cam.z) ** 2, far = a.air || a.st === 'soar' ? 620 : a.S.r < 1.6 ? 330 : 500; if (dd > far * far) continue;
      const sp = SP[a.k]; if (!sp.ready) continue;
      if (a.st === 'leap' && a.t > 0) continue;
      push(a.x, a.y - 0.66 * a.sc, a.z, sp.fr[frame(a, t)][dirOf(a.x, a.z, a.yaw)], sp.s * a.sc, 1, a.wh, a.tint);
    }
    for (const b of flut) push(b.x, b.y, b.z, SP[b.k].fr[Math.floor(t * (b.k === 'farfalla' ? 9 : 16) + b.s) % 2], SP[b.k].s, 1, b.wh, b.tint);
  }
  function shadows(cam) {
    for (const a of list) { if (a.st === 'leap' || a.st === 'soar' || a.st === 'vee' || a.S.k === 'swim' || !SP[a.k].ready) continue; if ((a.x - cam.x) ** 2 + (a.z - cam.z) ** 2 > 230 * 230) continue; env.pushShadow(a.x, a.z, a.S.r * a.sc * (a.air ? 0.7 : 1)); }
  }
  function reset() { list = []; flut = []; cells.clear(); skies.clear(); on = false; scanT = 0; }
  const api = { init, update, draw, shadows, scare, strike, fell, startle, reset, urban, get list() { return list; }, get flut() { return flut; }, get queue() { return queue.length; }, SP, want, group: (k, x, z, R) => group(k, x, z, R, true), sky, calm: false };
  return api;
}

SG.faunaModels = { kit, quad, bird, frog, lizard, crab, turtle, penguin, seal, monkey, fish, dolphin };
SG.fauna = { SPEC, LAND, create, model: { quad, bird, lizard, DEER, FOX, HORSE } };
})();
