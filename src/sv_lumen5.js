// ---------- IL GRANDE VIAGGIO · Terra I: Lumen — il Villaggio degli Elfi, com'è davvero ----------
// Il villaggio nasce dalla stessa pianta degli altri paesi (strade, piazza, gente davanti alle porte), ma qui diventa elfico:
// una casa su due è tonda, bianca, col tetto a punta di foglie (e una su otto sta in alto, attorno a un tronco, con la scala a chiocciola);
// tutt'attorno un giro di dodici grandi alberi con le vedette e i ponti sospesi da uno all'altro; in piazza l'Albero d'Argento
// nella sua vasca; archi di rami alle quattro uscite; lanterne di tre colori lungo le vie; funghi e cristalli che fanno luce.
// Tutto è costruito a pezzi (W.kit) da un solo costruttore, 'elfi'. Figure nuove non ce ne sono: sul foglio non c'è posto.
// Anche i grandi alberi sono a pezzi, tronco e chioma: una figura piatta così grande girava con lo sguardo, e col tronco largo entrava nelle case accanto.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenElfi = (m, { ELFI, piano }) => {
  const W = m.world, TL = m.town.TL, K = W.kit, [EX, EZ] = ELFI, P = (...a) => W.PROPS.push(...a), TAU = Math.PI * 2;
  const BARK = 180, BARK_D = 181, LEAF_L = 182, LEAF_M = 183, LEAF_D = 184, LEAF_FR = 185, VINE = 186;
  const DV = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  // una casa su due lascia il posto a una casa tonda (stesso posto, stessa porta: chi le sta davanti resta dov'è)
  const tonde = [];
  piano.houses = piano.houses.filter((h, i) => { if (i % 2) return true; tonde.push({ x: h.x, z: h.z, r: Math.max(5.4, Math.min(h.w, h.d) / 2 - 0.3), door: h.door, alta: i % 8 === 0, i }); return false; });
  // il giro dei grandi alberi, appena fuori dalle case (mai sulle quattro vie che escono)
  // (ai quattro angoli il giro cadeva dentro le case: lì l'albero si sposta in fuori lungo il suo raggio, finché tronco e vedetta stanno liberi)
  const libero = (x, z) => { let m = 1e9; for (const h of piano.houses.concat(piano.specials || [])) m = Math.min(m, Math.hypot(Math.max(Math.abs(x - h.x) - h.w / 2, 0), Math.max(Math.abs(z - h.z) - h.d / 2, 0))); for (const t of tonde) m = Math.min(m, Math.hypot(x - t.x, z - t.z) - t.r); return m; };
  const giroAlberi = []; for (let k = 0; k < 12; k++) { const a = (15 + 30 * k) / 360 * TAU; let f = 1, x, z; do { x = Math.round(EX + Math.cos(a) * 154 * f); z = Math.round(EZ + Math.sin(a) * 132 * f); f += 0.02; } while (libero(x, z) < 12.5 && f < 1.5); giroAlberi.push([x, z]); }
  // le misure delle chiome: [altezza dell'orlo, raggio]. Quelle del giro sono le più grandi; quelle delle case in alto spuntano sopra il tetto
  const chGiro = k => [62 + (k % 3) * 5, 27 + (k % 2) * 3], chCasa = i => [54 + ((i >> 3) % 3) * 4, 17 + ((i >> 3) % 2) * 3];
  giroAlberi.forEach(([x, z], k) => { W.CLEAR.push([x - 10, z - 10, x + 10, z + 10]); W.bigShadows.push([x, z, chGiro(k)[1] + 6]); });
  for (const h of tonde) if (h.alta) W.bigShadows.push([h.x, h.z, chCasa(h.i)[1] + 4]);

  W.builders.elfi = (b, g) => {
    const lume = (x, y, z, r, c, sempre = 0) => W.glows.push([x, y, z, r, c[0], c[1], c[2], sempre]);
    const LUNA = [0.3, 0.72, 0.95], ORO = [0.95, 0.68, 0.26], VIOLA = [0.62, 0.4, 0.95], TRE = [LUNA, ORO, VIOLA];   // (lumi piccoli e di colore pieno: ogni lume illumina anche la terra attorno, e tanti lumi bianchi insieme abbagliano)
    // un giro di facce (le facce guardano i quattro venti: ci stanno porte e finestre), un tetto a punta, una gemma di foglie
    const giro = (cx, cz, r, y0, y1, tile, n = 8) => { for (let k = 0; k < n; k++) { const a0 = (k - 0.5) / n * TAU, a1 = (k + 0.5) / n * TAU; K.quad([cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], tile, Math.max(1, Math.round(TAU * r / n / K.T8)), Math.max(1, (y1 - y0) / K.T8)); } };
    const punta = (cx, cz, r, y0, y1, tile, n = 8) => { for (let k = 0; k < n; k++) { const a0 = (k - 0.5) / n * TAU, a1 = (k + 0.5) / n * TAU, t = [cx, y1, cz]; K.quad([cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], t, t, tile, 2, 2); } };
    const sotto = (cx, cz, r, y0, y1, tile, n = 8) => { for (let k = 0; k < n; k++) { const a0 = (k - 0.5) / n * TAU, a1 = (k + 0.5) / n * TAU, t = [cx, y1, cz]; K.quad([cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], t, t, tile, 2, 2); } };
    const gemma = (cx, cy, cz, r, h, tile) => { punta(cx, cz, r, cy, cy + h, tile); sotto(cx, cz, r, cy, cy - h * 0.55, tile); };
    // --- i grandi alberi, a pezzi: una fascia (un giro che si stringe o si allarga), un ramo (quattro facce da un punto all'altro), una chioma a cupola col sotto scuro ---
    const fascia = (cx, cz, r0, y0, r1, y1, tile, n = 8) => { const u = Math.max(1, Math.round(TAU * Math.max(r0, r1) / n / K.T8)), v = Math.max(1, Math.round(Math.hypot(y1 - y0, r1 - r0) / K.T8));
      for (let k = 0; k < n; k++) { const a0 = (k - 0.5) / n * TAU, a1 = (k + 0.5) / n * TAU; K.quad([cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0], [cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0], [cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1], [cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1], tile, u, v); } };
    const ramo = (p, q, r) => { const dx = q[0] - p[0], dz = q[2] - p[2], l = Math.hypot(dx, dz) || 1, ux = -dz / l * r, uz = dx / l * r, c = [[ux, r, uz], [-ux, r, -uz], [-ux, -r, -uz], [ux, -r, uz]], v = Math.max(1, Math.round(Math.hypot(dx, q[1] - p[1], dz) / K.T8));
      for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; K.quad([p[0] + b[0], p[1] + b[1], p[2] + b[2]], [p[0] + a[0], p[1] + a[1], p[2] + a[2]], [q[0] + a[0] * 0.55, q[1] + a[1] * 0.55, q[2] + a[2] * 0.55], [q[0] + b[0] * 0.55, q[1] + b[1] * 0.55, q[2] + b[2] * 0.55], BARK, 1, v); } };
    const cupola = (cx, cy, cz, r, tile, rs, giu, n = 8) => {   // cy: l'orlo; il sotto si chiude più in basso di «giu», attorno a un cerchio di raggio rs (il tronco, o quasi una punta)
      fascia(cx, cz, rs, cy - giu, r * 0.8, cy - r * 0.14, LEAF_D, n); fascia(cx, cz, r * 0.8, cy - r * 0.14, r, cy + r * 0.12, LEAF_D, n); fascia(cx, cz, r, cy + r * 0.12, r * 0.92, cy + r * 0.44, tile, n); fascia(cx, cz, r * 0.92, cy + r * 0.44, r * 0.6, cy + r * 0.76, tile, n); fascia(cx, cz, r * 0.6, cy + r * 0.76, 0, cy + r * 0.94, tile, n); };
    const FOGLIE = [LEAF_M, LEAF_L, LEAF_D];
    // la chioma di un grande albero: la cupola di mezzo sul tronco, e attorno i palchi (cupole più piccole in cima a un ramo), ognuno alla sua altezza e del suo verde
    const chioma = (x, z, y, rt, H, R, k, palchi) => { cupola(x, y + H, z, R, FOGLIE[k % 2], rt, R * 0.4, 10); cupola(x + Math.cos(k * 2.3) * R * 0.22, y + H + R * 0.52, z + Math.sin(k * 2.3) * R * 0.22, R * 0.62, FOGLIE[(k + 1) % 2], 0.7, R * 0.2);
      for (let j = 0; j < palchi; j++) { const a = k * 1.3 + j * TAU / palchi + 0.4, d = R * 0.74, rl = R * (0.5 + 0.08 * ((k + j) % 3)), lx = x + Math.cos(a) * d, lz = z + Math.sin(a) * d, ly = y + H - R * 0.16 + ((k * 3 + j * 5) % 4) * 2.2;
        cupola(lx, ly, lz, rl, FOGLIE[(k + j + 1) % 3], 0.7, rl * 0.5); ramo([x, y + H - R * 0.5, z], [lx, ly - rl * 0.4, lz], rt * 0.6); } };
    const casetta = (x, z, r, y0, hh, door, i) => {             // il muro bianco, la porta, le finestre tonde accese, il tetto a due punte
      const ap = r * Math.cos(Math.PI / 8), v = DV[door] || DV.s, tetto = i % 3 === 0 ? LEAF_L : i % 3 === 1 ? LEAF_M : LEAF_D;
      giro(x, z, r, y0, y0 + hh, TL.WHITE); giro(x, z, r + 0.25, y0 + hh - 1.1, y0 + hh, TL.GOLD);
      K.onWall(door || 's', x - ap, z - ap, x + ap, z + ap, v[0] ? z : x, y0, 4, 6.4, TL.DOOR, true);
      for (const s of ['n', 's', 'e', 'w']) if (s !== (door || 's')) K.onWall(s, x - ap, z - ap, x + ap, z + ap, s === 'n' || s === 's' ? x : z, y0 + 3.4, 3.2, 3.2, TL.WIN_ROUND, true);
      punta(x, z, r + 2.6, y0 + hh - 0.6, y0 + hh + r * 1.25, tetto); sotto(x, z, r + 2.6, y0 + hh - 0.6, y0 + hh - 0.5, BARK_D); punta(x, z, r * 0.62, y0 + hh + r * 0.7, y0 + hh + r * 2.5, i % 2 ? LEAF_L : LEAF_FR);
      lume(x + v[0] * (r + 1.5), y0 + 5, z + v[1] * (r + 1.5), 2.6, TRE[i % 3]); };
    // --- le case tonde: a terra, o in alto attorno a un tronco con la scala a chiocciola ---
    for (const h of tonde) { const y = g(h.x, h.z);
      if (!h.alta) { casetta(h.x, h.z, h.r, y - 1, 10.5, h.door, h.i); W.LATE.circles.push([h.x, h.z, h.r + 0.4]); continue; }
      const yp = y + 13.5, r = h.r + 1.4, [CH, CR] = chCasa(h.i); giro(h.x, h.z, 2.7, y - 2, y + 36, BARK); fascia(h.x, h.z, 2.7, y + 36, 2.1, y + CH - CR * 0.4 + 1, BARK); chioma(h.x, h.z, y, 2.1, CH, CR, h.i >> 3, 3); W.LATE.circles.push([h.x, h.z, 3.4]);
      K.boxTop(h.x - r - 2.4, h.z - r - 2.4, h.x + r + 2.4, h.z + r + 2.4, yp, TL.PLANKS); K.quad([h.x - r - 2.4, yp - 0.05, h.z - r - 2.4], [h.x + r + 2.4, yp - 0.05, h.z - r - 2.4], [h.x + r + 2.4, yp - 0.05, h.z + r + 2.4], [h.x - r - 2.4, yp - 0.05, h.z + r + 2.4], BARK_D, 3, 3);
      K.walls(h.x - r - 2.4, h.z - r - 2.4, h.x + r + 2.4, h.z + r + 2.4, yp - 0.9, yp, BARK_D);
      for (let k = 0; k < 12; k++) { const a = k * 0.6 + 0.8, rr = 4.7, sx = h.x + Math.cos(a) * rr, sz = h.z + Math.sin(a) * rr; K.box(sx - 1.15, sz - 1.15, sx + 1.15, sz + 1.15, y + k * 1.1 - 0.2, y + k * 1.1 + 0.45, TL.PLANKS); }
      casetta(h.x, h.z, r, yp, 9, h.door, h.i); lume(h.x, yp - 1.5, h.z + r + 2, 3, TRE[(h.i >> 3) % 3]); }
    // --- il giro dei grandi alberi: il tronco, la vedetta in alto, e i ponti sospesi dall'uno all'altro ---
    const QP = 25, cime = giroAlberi.map(([x, z]) => [x, g(x, z) + QP, z]);
    giroAlberi.forEach(([x, z], k) => { const y = g(x, z), [CH, CR] = chGiro(k); fascia(x, z, 8, y - 2.5, 5.4, y + 4.5, BARK_D, 10); fascia(x, z, 5.4, y + 4.5, 4.5, y + 27, BARK, 10); fascia(x, z, 4.5, y + 27, 3.4, y + CH - CR * 0.4 + 1, BARK, 10); chioma(x, z, y, 3.4, CH, CR, k, 4); W.LATE.circles.push([x, z, 6.2]);
      K.boxTop(x - 8.5, z - 8.5, x + 8.5, z + 8.5, y + QP, TL.PLANKS); K.quad([x - 8.5, y + QP - 0.05, z - 8.5], [x + 8.5, y + QP - 0.05, z - 8.5], [x + 8.5, y + QP - 0.05, z + 8.5], [x - 8.5, y + QP - 0.05, z + 8.5], BARK_D, 2, 2); K.walls(x - 8.5, z - 8.5, x + 8.5, z + 8.5, y + QP - 0.9, y + QP, BARK_D);
      if (k % 2 === 0) { giro(x, z, 5.9, y + QP, y + QP + 6.5, TL.WHITE); for (const s of ['n', 's', 'e', 'w']) K.onWall(s, x - 5.45, z - 5.45, x + 5.45, z + 5.45, s === 'n' || s === 's' ? x : z, y + QP + 2.4, 2.8, 2.8, TL.WIN_ROUND, true); punta(x, z, 8, y + QP + 6, y + QP + 15, LEAF_M); }
      lume(x, y + QP + 3, z, 4, TRE[k % 3]); });
    for (let k = 0; k < 12; k++) { const A = cime[k], B = cime[(k + 1) % 12], L = Math.hypot(B[0] - A[0], B[2] - A[2]), dx = (B[0] - A[0]) / L, dz = (B[2] - A[2]) / L, px = -dz * 1.3, pz = dx * 1.3, N = 9, pt = [];
      for (let i = 0; i <= N; i++) { const t = i / N, d = 9 + (L - 18) * t; pt.push([A[0] + dx * d, A[1] + (B[1] - A[1]) * t - Math.sin(Math.PI * t) * 4.5, A[2] + dz * d]); }
      for (let i = 0; i < N; i++) { const p = pt[i], q = pt[i + 1], l = [p[0] + px, p[1], p[2] + pz], r = [p[0] - px, p[1], p[2] - pz], l2 = [q[0] + px, q[1], q[2] + pz], r2 = [q[0] - px, q[1], q[2] - pz];
        K.quad(l, r, r2, l2, TL.PLANKS, 1, 1); K.quad(r, l, l2, r2, TL.PLANKS, 1, 1, 0.5);                    // l'assito, sopra e sotto
        for (const [a, c] of [[l, l2], [r, r2]]) { K.quad([a[0], a[1] + 2.1, a[2]], [c[0], c[1] + 2.1, c[2]], [c[0], c[1] + 2.5, c[2]], [a[0], a[1] + 2.5, a[2]], BARK_D, 1, 1); K.quad([c[0], c[1] + 2.1, c[2]], [a[0], a[1] + 2.1, a[2]], [a[0], a[1] + 2.5, a[2]], [c[0], c[1] + 2.5, c[2]], BARK_D, 1, 1); } }
      for (const i of [3, 6]) lume(pt[i][0], pt[i][1] + 1.5, pt[i][2], 2.8, TRE[(k + i) % 3]); }
    // --- l'Albero d'Argento nella sua vasca, in mezzo alla piazza ---
    { const y = g(EX, EZ); giro(EX, EZ, 6.4, y - 1.5, y + 1.4, TL.MARBLE); giro(EX, EZ, 6.9, y + 1.1, y + 1.6, TL.GOLD);
      for (let k = 0; k < 8; k++) { const a0 = (k - 0.5) / 8 * TAU, a1 = (k + 0.5) / 8 * TAU, c = [EX, y + 0.95, EZ], n0 = W.mesh.length; K.quad([EX + Math.cos(a0) * 6.2, y + 0.95, EZ + Math.sin(a0) * 6.2], [EX + Math.cos(a1) * 6.2, y + 0.95, EZ + Math.sin(a1) * 6.2], c, c, TL.POOLW, 1, 1); }
      giro(EX, EZ, 2.6, y, y + 12, TL.MARBLE); giro(EX, EZ, 1.8, y + 12, y + 24, TL.WHITE); giro(EX, EZ, 3.4, y + 0.5, y + 2.4, TL.MARBLE);
      gemma(EX, y + 33, EZ, 13, 15, LEAF_FR); gemma(EX - 8, y + 25, EZ + 4, 7.5, 9, LEAF_FR); gemma(EX + 7, y + 26, EZ - 5, 8, 9.5, LEAF_FR); gemma(EX + 3, y + 23, EZ + 8, 6, 7, LEAF_L);
      W.LATE.circles.push([EX, EZ, 7]); lume(EX, y + 33, EZ, 9, LUNA, 1); lume(EX, y + 5, EZ, 4, LUNA, 1); lume(EX - 8, y + 25, EZ + 4, 4.5, VIOLA); lume(EX + 7, y + 26, EZ - 5, 4.5, ORO); lume(EX + 3, y + 23, EZ + 8, 3.5, LUNA); }
    // --- gli archi di rami alle quattro uscite ---
    for (const [ax, az, lungoX] of [[EX - 129, EZ, false], [EX + 129, EZ, false], [EX, EZ - 109, true], [EX, EZ + 109, true]]) { const y = g(ax, az);
      for (let j = 0; j <= 10; j++) { const t = Math.PI * j / 10, o = Math.cos(t) * 10, hh = Math.sin(t) * 12, x = ax + (lungoX ? o : 0), z = az + (lungoX ? 0 : o); K.box(x - 1.1, z - 1.1, x + 1.1, z + 1.1, y + hh - 1.6, y + hh + 1.2, j % 3 === 1 ? LEAF_D : BARK); }
      for (const o of [-10, 10]) W.LATE.circles.push([ax + (lungoX ? o : 0), az + (lungoX ? 0 : o), 1.8]);
      for (const o of [-5, 0, 5]) { const x = ax + (lungoX ? o : 0), z = az + (lungoX ? 0 : o), top = y + Math.sqrt(100 - o * o) * 1.2 - 1.2, e = lungoX ? [1.2, 0] : [0, 1.2];
        K.quad([x - e[0], top - 5, z - e[1]], [x + e[0], top - 5, z + e[1]], [x + e[0], top, z + e[1]], [x - e[0], top, z - e[1]], VINE, 1, 2); K.quad([x + e[0], top - 5, z + e[1]], [x - e[0], top - 5, z - e[1]], [x - e[0], top, z - e[1]], [x + e[0], top, z + e[1]], VINE, 1, 2); }
      lume(ax, y + 10.5, az, 4, ORO); }
    // --- le lanterne lungo le due vie: un palo sottile, il braccio, il lume (di tre colori) ---
    let n = 0; const palo = (x, z) => { const y = g(x, z), c = TRE[n++ % 3]; K.box(x - 0.35, z - 0.35, x + 0.35, z + 0.35, y - 1, y + 8.6, BARK_D); K.box(x - 0.9, z - 0.9, x + 0.9, z + 0.9, y + 8.6, y + 10.4, TL.WHITE, LEAF_FR); punta(x, z, 1.5, y + 10.4, y + 12.2, LEAF_M, 4); lume(x, y + 9.4, z, 3, c); W.LATE.circles.push([x, z, 0.8]); };
    for (const d of [32, 60, 88, 114]) for (const s of [-1, 1]) { palo(EX + s * d, EZ + (n % 2 ? 9.5 : -9.5)); palo(EX + (n % 2 ? 9.5 : -9.5), EZ + s * (d - 6)); }
  };
  W.BUILD.push({ k: 'elfi', x: EX, z: EZ });
  // funghi e cristalli che fanno luce: sul bordo della vasca (non in mezzo al passo), ai piedi dei grandi alberi
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + 0.5; P([k % 2 ? 'mushroom' : 'crystal', EX + Math.cos(a) * 6.7, EZ + Math.sin(a) * 6.7, { s: k % 2 ? 0.3 : 0.26, r: 0.1, glow: [2.5, 2.4, k % 2 ? 0.5 : 0.3, 0.75, 0.95, 0] }]); }
  giroAlberi.forEach(([x, z], k) => { const a = k * 2.1; P(['mushroom', Math.round(x + Math.cos(a) * 10.5), Math.round(z + Math.sin(a) * 10.5), { s: 0.45, r: 1.4, glow: [3, 2.8, 0.35, 0.85, 0.6, 0] }], ['fern', Math.round(x - Math.cos(a) * 10), Math.round(z - Math.sin(a) * 10)]); });
};
})();
