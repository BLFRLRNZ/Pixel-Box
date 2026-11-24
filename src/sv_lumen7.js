// ---------- IL GRANDE VIAGGIO · Terra I: Lumen — le grotte di montagna, più profonde ----------
// Le due grotte dei monti crescono dentro la roccia, con sale grandi che prima non c'erano.
// La Via Sepolta (il traforo sotto i Monti del Drago): a nord il Bosco di Sotto (funghi alti come case, sotto una cupola), con un cunicolo
// che torna sulla via; a sud la Cripta del Sole (chi fece crollare la via, e la sua lama); dal vecchio ripostiglio, in discesa, il Pozzo dei Cristalli.
// La Grotta del Gelo (sui monti di ponente): a nord, in discesa, il Lago di Ghiaccio; da lì la Sala degli Specchi; e un cunicolo che riporta alla grotta vecchia.
// Le sale sono rami in più delle grotte che ci sono già (lo scavo lo fa sg_world.js); quel che c'è dentro è costruito a facce (W.kit), un costruttore per sala.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenGrotte = (m) => {
  const W = m.world, TL = m.town.TL, K = W.kit, TAU = Math.PI * 2;
  const P = (...a) => W.PROPS.push(...a);
  W.TESTI = W.TESTI || {};
  const testo = (x, z, righe) => { W.TESTI[x + ',' + z] = righe; };
  let seme = 7411; const rnd = () => (seme = (seme * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const AZZ = [0.3, 0.7, 1], VIO = [0.62, 0.4, 1], VER = [0.4, 1, 0.5], ORO = [1, 0.78, 0.36], BIA = [0.7, 0.88, 1], ROSA = [1, 0.45, 0.75];
  const lumeP = (c, forte) => ({ glow: [5, forte ? 12 : 8, c[0], c[1], c[2], 1], dentro: 1 });
  // l'arredo lungo i rami nuovi, come nelle altre grotte: cristalli (alcuni accesi), funghi, sassi, ossa, vicino alle pareti
  const arreda = (rami, o) => { const buio = { lit: 0.46, dentro: 1 };
    for (const R of rami) for (let s = 0; s < R.length - 1; s++) { const A = R[s], Q = R[s + 1], Ln = Math.hypot(Q[0] - A[0], Q[1] - A[1]), ux = (Q[0] - A[0]) / Ln, uz = (Q[1] - A[1]) / Ln, n = Math.max(2, Math.round(Ln / (o.passo || 26)));
      for (let i = 0; i < n; i++) { const t = (i + 0.15 + rnd() * 0.7) / n, r = A[2] + (Q[2] - A[2]) * t, off = r * (0.5 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1), x = Math.round(A[0] + (Q[0] - A[0]) * t - uz * off), z = Math.round(A[1] + (Q[1] - A[1]) * t + ux * off), k = rnd(), c = o.luci[Math.floor(rnd() * o.luci.length)], acceso = rnd() < 0.6;
        if (o.liberi.some(q => Math.hypot(x - q[0], z - q[1]) < q[2])) continue;   // agli incroci con la grotta vecchia il passo resta sgombro
        if (k < o.pc) P([o.cristallo || 'crystal', x, z, acceso ? lumeP(c) : { dentro: 1 }]);
        else if (k < o.pc + (o.pf || 0)) P(['mushroom', x, z, acceso ? { lit: 1.15, dentro: 1, glow: [3, 6, c[0], c[1], c[2], 1] } : { lit: 1.15, dentro: 1 }]);
        else if (k < 0.94) P([o.sasso || 'rock', x, z, buio]); else P(['bones', x, z, buio]); } } };

  // ---- le forme (tutte con la luce data a mano: sotto la volta il sole non c'è; sopra 0,92 il numero vuol dire altro) ----
  const giro = (cx, cz, r, y0, y1, tile, n, L) => { for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU; K.quad([cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], tile, Math.max(1, Math.round(TAU * r / n / K.T8)), Math.max(1, Math.round((y1 - y0) / K.T8)), L); } };
  const tronco = (cx, cz, r0, r1, y0, y1, tile, n, L) => { for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU; K.quad([cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0], [cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0], [cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1], [cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1], tile, 1, 1, L); } };
  const punta = (cx, cz, r, y0, y1, tile, n, L, u = 2) => { const t = [cx, y1, cz]; for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU; K.quad([cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], t, t, tile, u, u, L); } };   // una punta in su (o un disco, se y0 = y1)
  const sotto = (cx, cz, r, y0, y1, tile, n, L, u = 2) => { const t = [cx, y1, cz]; for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU; K.quad([cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], t, t, tile, u, u, L); } };   // una punta in giù, o il sotto di un cappello
  const lastra = (cx, cz, nx, nz, w, y0, y1, tile, L, punta1) => { const tx = -nz, tz = nx, a = [cx + tx * w, cz + tz * w], b = [cx - tx * w, cz - tz * w];   // una faccia dritta che guarda verso (nx, nz); con la cima a punta
    K.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], tile, Math.max(1, Math.round(2 * w / K.T8)), Math.max(1, Math.round((y1 - y0) / K.T8)), L);
    if (punta1) { const t = [cx + tx * w * punta1[0], y1 + punta1[1], cz + tz * w * punta1[0]]; K.quad([a[0], y1, a[1]], [b[0], y1, b[1]], t, t, tile, 1, 1, L); } };
  const scuro = (n0, k) => { const M = W.mesh; for (let i = n0 + 7; i < M.length; i += 8) if (M[i] < 0.93) M[i] *= k; };
  const lume = (x, y, z, r, c) => W.glows.push([x, y, z, r, c[0], c[1], c[2], 1]);
  const pieno = (x, z, r) => W.LATE.circles.push([x, z, r]);
  // il fondo e il soffitto in un punto (solo sotto la volta); una cosa alta si accorcia se il soffitto è più basso
  const qui = (x, z) => { const q = W.grotta(x, z); return q && q.f === 2 ? [W.ground(x, z, -1e9), q.ce] : null; };
  const cristallo = (x, z, r, h, tile, L, c) => { const q = qui(x, z); if (!q) return; h = Math.min(h, q[1] - q[0] - 1.5); if (h < 3) return; const y = q[0] - 0.4;
    sotto(x, z, r, y + h * 0.3, y, tile, 5, L * 0.8); punta(x, z, r, y + h * 0.3, y + h, tile, 5, L); pieno(x, z, r * 0.8); if (c) lume(x, y + h * 0.5, z, 3.2, c); };
  const stalattite = (x, z, r, h, tile, L) => { const q = qui(x, z); if (!q || q[1] - q[0] < h + 9) return; sotto(x, z, r, q[1] + 0.6, q[1] - h, tile, 5, L); };
  const stalagmite = (x, z, r, h, tile, L) => { const q = qui(x, z); if (!q) return; h = Math.min(h, q[1] - q[0] - 2); if (h < 2) return; punta(x, z, r, q[0] - 0.4, q[0] + h, tile, 5, L); pieno(x, z, r * 0.7); };
  // un fungo alto come una casa: gambo, cappello a cupola (che fa luce), lamelle chiare sotto
  const fungo = (x, z, h, rc, tile, c) => { const q = qui(x, z); if (!q) return; const y = q[0]; h = Math.min(h, q[1] - y - rc * 0.55 - 1.5); if (h < 4) return; const rs = Math.max(0.9, rc * 0.16), yc = y + h;
    tronco(x, z, rs * 1.5, rs, y - 0.5, y + h * 0.3, TL.MARBLE, 6, 0.3); giro(x, z, rs, y + h * 0.3, yc, TL.MARBLE, 6, 0.36);
    tronco(x, z, rc, rc * 0.62, yc - 0.4, yc + rc * 0.3, tile, 10, 0.8); punta(x, z, rc * 0.62, yc + rc * 0.3, yc + rc * 0.52, tile, 10, 0.9); sotto(x, z, rc, yc - 0.4, yc + 0.8, TL.OCHRE, 10, 0.42);
    if (rc >= 8) lume(x, yc - 3, z, 2.8, c); pieno(x, z, rs * 1.5 + 0.4); };

  // ================= LA VIA SEPOLTA =================
  const S = W.GROTTE.find(g => g.id === 'sepolta');
  if (S) {
    S.volta = 80; S.liscio = 1;   // (nelle sale grandi il soffitto sale: la cupola del bosco è alta una quarantina di passi; il fondo è piano, così i pavimenti posati combaciano)
    const BX = 4572, BZ = -1042, CX = 4300, CZ = -622, PX = 4802, PZ = -540;
    const nuovi = [[[4600, -862, 40, 7], [4594, -948, 15, 2], [BX, BZ, 70, 2]],                                   // a nord: il Bosco di Sotto
      [[BX, BZ, 70, 2], [4484, -1030, 14, 2], [4410, -958, 14, 8], [4350, -874, 15, 12]],                         // dal bosco, un cunicolo che torna sulla via
      [[4350, -874, 15, 12], [4338, -790, 13, 7], [4318, -700, 13, 3], [CX, CZ, 48, 3]],                          // a sud: la Cripta del Sole
      [[4650, -700, 26, 8], [4704, -642, 13, 2], [4762, -590, 13, -12], [PX, PZ, 46, -12]]];                        // dal ripostiglio, giù: il Pozzo dei Cristalli
    S.rami.push(...nuovi);
    W.PLACES.unshift([BX, BZ, 74, 'IL BOSCO DI SOTTO', 1], [CX, CZ, 52, 'LA CRIPTA DEL SOLE', 1], [PX, PZ, 50, 'IL POZZO DEI CRISTALLI', 1]);   // (segrete come la via: sulla carta compaiono quando ci si arriva; in testa all'elenco, perché vale il primo luogo che contiene il punto)
    arreda([nuovi[0].slice(0, 2), nuovi[1].slice(1), nuovi[2].slice(0, 3), nuovi[3].slice(0, 3)], { luci: [AZZ, VIO], pc: 0.36, pf: 0.3, liberi: [[4600, -862, 50], [4350, -874, 36], [4650, -700, 38]] });
    // --- il Bosco di Sotto ---
    const FUNGHI = [[0, 0, 26, 13, 0], [-30, -18, 18, 9, 1], [28, -24, 20, 10, 2], [-22, 30, 15, 8, 2], [34, 22, 16, 8.5, 1], [-46, 6, 12, 6.5, 0], [8, -44, 13, 7, 1], [48, -4, 11, 6, 2], [-8, 46, 12, 6.5, 0], [-36, -36, 8, 5, 2], [18, 40, 9, 5, 1], [52, -30, 7, 4.5, 0], [-52, 26, 7, 4.5, 1]];
    const CAPP = [[TL.ROOF_PURPLE, VIO], [TL.ROOF_TEAL, VER], [TL.ROOF_PINK, ROSA]];
    W.builders.gr_bosco = () => { for (const [dx, dz, h, rc, k] of FUNGHI) fungo(BX + dx, BZ + dz, h, rc, CAPP[k][0], CAPP[k][1]); };
    W.BUILD.push({ k: 'gr_bosco', x: BX, z: BZ });
    for (let k = 0; k < 34; k++) { const a = k * 2.399, r = 12 + (k * 11) % 52, x = Math.round(BX + Math.cos(a) * r), z = Math.round(BZ + Math.sin(a) * r), c = [VER, VIO, ROSA][k % 3];
      if (FUNGHI.some(f => Math.hypot(BX + f[0] - x, BZ + f[1] - z) < 5)) continue;
      P(k % 3 === 2 ? ['fern', x, z, { dentro: 1, lit: 0.7 }] : ['mushroom', x, z, Object.assign({ dentro: 1, lit: 1.15, s: 0.32 * (1 + (k % 4) * 0.4) }, k % 4 === 1 ? { glow: [3, 4, c[0], c[1], c[2], 1] } : {})]); }
    W.CHESTS.push(['gv_s_bosco', BX + 12, BZ - 10, 'elisir', 1]);
    W.CAMPS.push([BX - 10, BZ + 20, 'slimeB', 4, 40], [BX + 20, BZ - 40, 'bat', 3, 26]);
    if (W.RACCOLTA && W.RACCOLTA.fungo) W.RACCOLTA.fungo.punti.push([BX - 14, BZ + 10], [BX + 22, BZ + 8], [BX + 4, BZ - 26], [BX - 34, BZ - 6]);
    // --- la Cripta del Sole: si arriva da tramontana; in mezzo il sarcofago, in fondo la stele col sole ---
    W.builders.gr_cripta = (b) => { const q = qui(CX, CZ); if (!q) return; const y = q[0], M = W.mesh;
      punta(CX, CZ, 17, y + 0.14, y + 0.14, TL.MARBLE, 14, 0.4, 4); punta(CX, CZ, 9, y + 0.3, y + 0.3, TL.FRIEZE, 12, 0.5, 3);
      let n0 = M.length; K.box(CX - 5, CZ - 2.4, CX + 5, CZ + 2.4, y, y + 3.2, TL.MARBLE, TL.GOLD); K.box(CX - 6, CZ + 15, CX + 6, CZ + 16.4, y, y + 12, TL.MARBLE, TL.FRIEZE); scuro(n0, 0.55);
      W.addBox(CX - 5, CZ - 2.4, CX + 5, CZ + 2.4, y + 3.2, b); W.addBox(CX - 6, CZ + 15, CX + 6, CZ + 16.4, y + 12, b);
      lastra(CX, CZ + 14.9, 0, -1, 3.4, y + 4.6, y + 11.4, TL.ROSE, 0.9); lume(CX, y + 8, CZ + 13, 4, ORO);
      for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * TAU, x = CX + Math.cos(a) * 24, z = CZ + Math.sin(a) * 24, qq = qui(x, z); if (!qq) continue; const rotta = k % 3 === 1, h = Math.min(rotta ? 5 + k : 15, qq[1] - qq[0] - 2.5);
        giro(x, z, 1.9, qq[0] - 0.4, qq[0] + 1, TL.MARBLE, 8, 0.4); giro(x, z, 1.5, qq[0] + 1, qq[0] + h, TL.FLUTE, 8, 0.48); punta(x, z, rotta ? 1.5 : 2.2, qq[0] + h, qq[0] + h + (rotta ? 0.9 : 0), TL.MARBLE, 8, 0.5, 1); if (!rotta) giro(x, z, 2.2, qq[0] + h - 1.1, qq[0] + h, TL.FRIEZE, 8, 0.5); pieno(x, z, 2.1); }
      for (const s of [-1, 1]) { const x = CX + s * 9, z = CZ + 12; giro(x, z, 0.7, y - 0.3, y + 3.4, TL.MARBLE, 6, 0.45); tronco(x, z, 0.7, 1.7, y + 3.4, y + 4.4, TL.GOLD, 6, 0.6); punta(x, z, 1.5, y + 4.3, y + 4.3, TL.LAVA, 6, 0.92, 1); lume(x, y + 5.6, z, 4.2, ORO); pieno(x, z, 1.4); } };
    W.BUILD.push({ k: 'gr_cripta', x: CX, z: CZ });
    P(['statue', CX, CZ - 9, { dentro: 1, lit: 0.62 }], ['bones', CX - 14, CZ + 6, { dentro: 1, lit: 0.5 }], ['bones', CX + 16, CZ - 4, { dentro: 1, lit: 0.5 }]);
    testo(CX, CZ - 9, ["«QUI RIPOSA IL CAPITANO DEL SOLE. GUIDÒ GLI ULTIMI DI SOLIS OLTRE IL MONTE, E FECE CROLLARE LA VIA ALLE LORO SPALLE.»", "«LA SUA LAMA NON DORME CON LUI: ASPETTA, DIETRO LA STELE, CHI ABBIA ANCORA STRADA DA FARE.»"]);
    W.CHESTS.push(['gv_s_cripta', CX + 9, CZ + 20, 'runica', 2]);
    W.CAMPS.push([CX, CZ - 16, 'skel', 3, 20], [CX, CZ + 8, 'wraith', 1, 8]);
    // --- il Pozzo dei Cristalli: più in basso; cristalli alti come alberi, e le punte che pendono dal soffitto ---
    const CR = [[0, 0, 4.2, 22, 0], [5, 4, 2.6, 13, 1], [-5, 3, 2.4, 11, 0], [-24, -14, 3, 14, 1], [-20, -18, 1.9, 8, 0], [22, -20, 3.2, 15, 0], [27, -16, 2, 9, 2], [-18, 22, 2.8, 12, 2], [20, 24, 3, 13, 1], [24, 20, 1.8, 7, 0], [-34, 4, 2.2, 9, 1], [34, 2, 2.2, 9, 2]];
    const CT = [[TL.CRYSTAL_AZ, AZZ], [TL.CRYSTAL, VIO], [TL.ICE, BIA]];
    W.builders.gr_pozzo = () => { for (const [dx, dz, r, h, k] of CR) cristallo(PX + dx, PZ + dz, r, h, CT[k][0], k === 2 ? 0.6 : 0.8, r > 2.9 ? CT[k][1] : null);
      for (let k = 0; k < 16; k++) { const a = k * 2.399, r = 8 + (k * 9) % 32; stalattite(PX + Math.cos(a) * r, PZ + Math.sin(a) * r, 1.3 + (k % 3) * 0.5, 4 + (k % 4) * 2, TL.DARKSTONE, 0.3); } };
    W.BUILD.push({ k: 'gr_pozzo', x: PX, z: PZ });
    for (let k = 0; k < 14; k++) { const a = k * 2.399 + 1, r = 14 + (k * 13) % 26, x = Math.round(PX + Math.cos(a) * r), z = Math.round(PZ + Math.sin(a) * r); if (CR.some(c => Math.hypot(PX + c[0] - x, PZ + c[1] - z) < 5)) continue; P([k % 4 === 3 ? 'icecrystal' : 'crystal', x, z, k % 2 ? lumeP(k % 4 === 1 ? AZZ : VIO) : { dentro: 1 }]); }
    W.CHESTS.push(['gv_s_pozzo', PX + 14, PZ + 30, 'monete:200', 2]);
    W.CAMPS.push([PX, PZ - 6, 'bat', 4, 34], [4762, -590, 'slimeB', 2, 10]);
    if (W.RACCOLTA && W.RACCOLTA.cristallo) W.RACCOLTA.cristallo.punti.push([PX - 10, PZ + 12], [PX + 12, PZ - 10], [PX - 28, PZ + 14]);
  }

  // ================= LA GROTTA DEL GELO =================
  const G = W.GROTTE.find(g => g.id === 'gelo');
  if (G) {
    G.volta = 60; G.liscio = 1;
    const LX = 1860, LZ = 588, MX = 1652, MZ = 642;
    const nuovi = [[[1900, 760, 24], [1888, 700, 13, -5], [1872, 646, 13, -10], [LX, LZ, 52, -10]],     // a nord, in discesa: il Lago di Ghiaccio
      [[LX, LZ, 52, -10], [1790, 600, 14, -10], [1722, 620, 14, -6], [MX, MZ, 40, -6]],                 // a ponente: la Sala degli Specchi
      [[MX, MZ, 40, -6], [1722, 692, 13, -6], [1802, 736, 13, -3], [1880, 820, 13, 0]]];              // e un cunicolo che torna alla grotta vecchia
    G.rami.push(...nuovi);
    W.PLACES.unshift([LX, LZ, 56, 'IL LAGO DI GHIACCIO', 1], [MX, MZ, 44, 'LA SALA DEGLI SPECCHI', 1]);
    arreda([nuovi[0].slice(0, 3), nuovi[1].slice(1, 3), nuovi[2].slice(1)], { luci: [BIA, AZZ], cristallo: 'icecrystal', sasso: 'rocksnow', pc: 0.5, liberi: [[1900, 760, 32], [1880, 820, 28]] });
    // --- il Lago di Ghiaccio: si arriva da mezzogiorno; il lago gelato in mezzo, e nel lago il Cuore del Gelo ---
    const PUNTE = [[0, 0, 4.4, 20], [5.5, 3, 2.6, 12], [-5, 4, 2.8, 13], [2, -6, 2.2, 10], [-4, -5, 1.8, 7]];
    W.builders.gr_lago = () => { const q = qui(LX, LZ); if (!q) return; const y = q[0];
      punta(LX, LZ, 31, y + 0.16, y + 0.16, TL.POOLW, 18, 0.8, 5); for (let k = 0; k < 18; k++) { const a0 = k / 18 * TAU, a1 = (k + 1) / 18 * TAU; K.quad([LX + Math.cos(a0) * 31, y + 0.2, LZ + Math.sin(a0) * 31], [LX + Math.cos(a1) * 31, y + 0.2, LZ + Math.sin(a1) * 31], [LX + Math.cos(a1) * 33, y + 0.2, LZ + Math.sin(a1) * 33], [LX + Math.cos(a0) * 33, y + 0.2, LZ + Math.sin(a0) * 33], TL.WHITE, 2, 1, 0.5); }
      for (const [dx, dz, r, h] of PUNTE) cristallo(LX + dx, LZ + dz, r, h, r > 2.5 ? TL.TURQ : TL.POOLW, 0.8, null); lume(LX, y + 9, LZ, 4.2, AZZ); lume(LX + 3, y + 3, LZ + 6, 3, BIA);
      for (let k = 0; k < 20; k++) { const a = k * 2.399, r = 12 + (k * 7) % 36; stalattite(LX + Math.cos(a) * r, LZ + Math.sin(a) * r, 1.2 + (k % 3) * 0.5, 4 + (k % 5) * 1.6, TL.WHITE, 0.46); }
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + 0.3; stalagmite(LX + Math.cos(a) * (39 + (k % 3) * 3), LZ + Math.sin(a) * (39 + (k % 3) * 3), 1.6 + (k % 2) * 0.6, 4 + (k % 4) * 2, TL.POOLW, 0.56); } };
    W.BUILD.push({ k: 'gr_lago', x: LX, z: LZ });
    P(['icecrystal', LX - 36, LZ + 14, lumeP(BIA, 1)], ['icecrystal', LX + 38, LZ - 10, lumeP(AZZ, 1)], ['icecrystal', LX + 8, LZ - 40, lumeP(BIA)], ['snowman', LX + 26, LZ + 30, { dentro: 1, lit: 0.9 }]);
    testo(LX + 26, LZ + 30, ['UN PUPAZZO DI NEVE, QUAGGIÙ. CHI L\'HA FATTO NON È PIÙ TORNATO A PRENDERLO.']);
    W.CHESTS.push(['gv_g4c', LX - 4, LZ - 41, 'alato', 2]);
    W.CAMPS.push([LX + 6, LZ + 18, 'icebat', 4, 36], [LX - 10, LZ - 30, 'iceskel', 3, 14]);
    if (W.RACCOLTA && W.RACCOLTA.brina) W.RACCOLTA.brina.punti.push([LX - 24, LZ + 26], [LX + 30, LZ + 12]);
    // --- la Sala degli Specchi: un giro di lastre di ghiaccio alte e lisce, e in mezzo quel che custodiscono ---
    W.builders.gr_specchi = () => { const q = qui(MX, MZ); if (!q) return;
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + 0.2, nx = Math.cos(a), nz = Math.sin(a), x = MX + nx * 23, z = MZ + nz * 23, qq = qui(x, z); if (!qq) continue; const h = Math.min(9 + (k % 3) * 3, qq[1] - qq[0] - 3.5), y = qq[0] - 0.4, pt = [(k % 2 ? 0.5 : -0.5), 2.6];
        lastra(x - nx * 0.35, z - nz * 0.35, -nx, -nz, 3, y, y + h, TL.POOLW, 0.82, pt); lastra(x + nx * 0.35, z + nz * 0.35, nx, nz, 3, y, y + h, TL.POOLW, 0.5, [-pt[0], pt[1]]);
        if (k % 3 === 0) lume(x - nx * 3, y + h * 0.6, z - nz * 3, 2.8, AZZ); pieno(x - nz * 1.7, z + nx * 1.7, 1.3); pieno(x + nz * 1.7, z - nx * 1.7, 1.3); pieno(x, z, 1.3); }
      punta(MX, MZ, 7, q[0] + 0.14, q[0] + 0.14, TL.POOLW, 10, 0.8, 2);
      for (let k = 0; k < 10; k++) { const a = k * 2.399 + 0.5, r = 6 + (k * 9) % 26; stalattite(MX + Math.cos(a) * r, MZ + Math.sin(a) * r, 1.1 + (k % 3) * 0.4, 3.5 + (k % 4) * 1.5, TL.WHITE, 0.46); } };
    W.BUILD.push({ k: 'gr_specchi', x: MX, z: MZ });
    W.CHESTS.push(['gv_g4d', MX, MZ, 'vento', 2]);
    W.CAMPS.push([MX + 10, MZ + 12, 'icewolf', 3, 22], [1760, 712, 'icebat', 2, 12]);
  }

  // =============== LA SALA DEI CRISTALLI, nella Miniera di Barbarossa: i cristalli a pezzi ===============
  // Erano sedici figure piatte, alte fino a quaranta passi: una figura piatta guarda sempre chi la guarda, e in una sala piena tutto girava con lo sguardo
  // (e cinque stavano in mezzo al passo). Ora sono prismi di pietra, fermi: sei facce, la cima a punta, ognuno pende dalla sua parte, a gruppi (uno grande e i piccoli attorno).
  // I due passi restano sgombri (dall'imbocco di levante al centro, dal centro alla discesa per la Vena d'Oro) e in mezzo, fuori dal passo, sta il Cristallo Grande: si vede da tutta la sala.
  { const SX = 4470, SZ = 1016, COL = [[TL.CRYSTAL_AZ, AZZ, 1], [TL.CRYSTAL, VIO, 1], [TL.ICE, BIA, 0.58]];   // (il cristallo bianco è già chiarissimo: con la luce piena diventava una macchia bianca)
    // ogni faccia ha la sua luce (la sala è buia, il sole non c'è): girandoci attorno si vede che è un solido
    const prisma = (x, z, r, h, lx, lz, tile, L) => { const q = qui(x, z); if (!q) return 0; h = Math.min(h, q[1] - q[0] - 2); if (h < 3) return 0; const y = q[0] - 0.6, n = 6, hs = h * 0.74, f = hs / h, ap = [x + lx, y + h, z + lz];
      for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU, l = Math.min(0.9, L * (0.6 + 0.4 * (0.5 + 0.5 * Math.cos((a0 + a1) / 2 - 0.9))));
        const b0 = [x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], b1 = [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], t0 = [x + lx * f + Math.cos(a0) * r * 0.8, y + hs, z + lz * f + Math.sin(a0) * r * 0.8], t1 = [x + lx * f + Math.cos(a1) * r * 0.8, y + hs, z + lz * f + Math.sin(a1) * r * 0.8];
        K.quad(b1, b0, t0, t1, tile, 1, Math.max(1, Math.round(hs / K.T8)), l); K.quad(t1, t0, ap, ap, tile, 1, 1, Math.min(0.9, l * 1.15)); }
      pieno(x, z, r * 0.85); return h; };
    // un gruppo: [dx, dz, taglia 0..3, colore]. Taglia 3 è il Cristallo Grande
    const TG = [[1.9, 9, 2.6], [2.8, 15, 3.4], [3.7, 22, 4.4], [5.4, 34, 6.5]];
    const GRUPPI = [[-14, -9, 3, 0],
      [3, -37, 2, 0], [-17, -33, 1, 1], [10, -23, 1, 0], [-33, -19, 1, 2], [-49, -9, 2, 1], [-47, 19, 1, 0], [-52, 40, 1, 2], [-8, 44, 1, 0], [9, 30, 1, 1], [26, 34, 2, 0], [41, 16, 1, 2], [-27, 1, 0, 1], [-30, 16, 0, 2],
      [22, -17, 0, 1], [44, -22, 1, 1], [5, 54, 0, 0], [-36, -40, 0, 0], [34, -38, 0, 2], [52, 14, 0, 0], [58, -18, 0, 0], [78, 12, 0, 1], [-6, -52, 0, 1], [-58, 6, 0, 2]];
    W.builders.gr_sala = () => { GRUPPI.forEach(([dx, dz, t, c], i) => { const x = SX + dx, z = SZ + dz, [r, h, rl] = TG[t], [tile, luce, kl] = COL[c], a0 = i * 2.1, hh = h * (0.9 + 0.2 * ((i * 7) % 5) / 4);
        const fatto = prisma(x, z, r, hh, Math.cos(a0) * hh * 0.1, Math.sin(a0) * hh * 0.1, tile, 0.86 * kl); if (!fatto) return;
        const ns = 2 + t + (i % 2); for (let j = 0; j < ns; j++) { const a = a0 + 1 + j * TAU / ns, rs = r * (0.38 + 0.12 * ((i + j) % 3)), hs = fatto * (0.3 + 0.13 * ((i * 3 + j * 5) % 4)), d = r + rs * 0.55; prisma(x + Math.cos(a) * d, z + Math.sin(a) * d, rs, hs, Math.cos(a) * hs * 0.34, Math.sin(a) * hs * 0.34, COL[(c + (j === 1 ? 1 : 0)) % 3][0], 0.72 * COL[(c + (j === 1 ? 1 : 0)) % 3][2]); }
        const q = qui(x, z); lume(x, q[0] + fatto * 0.55, z, rl * (c === 2 ? 0.75 : 1), luce); }); };
    W.BUILD.push({ k: 'gr_sala', x: SX, z: SZ });
    P(['rock', SX - 40, SZ - 28, { lit: 0.46, dentro: 1 }], ['rock', SX + 16, SZ + 44, { lit: 0.46, dentro: 1 }], ['rock', SX + 30, SZ - 30, { lit: 0.46, dentro: 1 }]);
  }
};
})();
