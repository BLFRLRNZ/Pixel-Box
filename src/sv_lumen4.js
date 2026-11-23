// ---------- IL GRANDE VIAGGIO · Terra I: Lumen — il regno dei nani ----------
// Fucinafonda, la città dei nani sotto i Monti del Drago: una porta monumentale nel fianco del monte (con la dogana e la fila di chi aspetta),
// una galleria, e in fondo una caverna grande come un paese, alta come una cattedrale: il viale con i pilastri, la Grande Fucina con il camino
// che sale fino alla volta e i canali di lava, le case a gradoni lungo le pareti, la Sala del Re, la birreria, le botteghe dei mastri.
// La Galleria dei Carrelli la unisce alla Miniera di Barbarossa, che qui viene allargata (sale grandi, la Sala dei Cristalli, la Vena d'Oro).
// Tutto è costruito a blocchi (W.kit) da un solo costruttore, 'fucinafonda'; la gente e le frasi stanno in fondo.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenNani = (m) => {
  const W = m.world, C = m.city, TN = m.town, TL = TN.TL, K = W.kit, LK = C.LOOKS;
  const P = (...a) => W.PROPS.push(...a), D1 = { dentro: 1 };
  const Y = 64, GX = 4480, GZ = 568;                   // la quota della città; il centro (la Grande Fucina)
  W.TESTI = W.TESTI || {};
  let seme = 4480; const rnd = () => (seme = (seme * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  // ================= LE GROTTE =================
  W.GROTTE.push({ id: 'fucinafonda', y: Y, musica: 'grotta:cristalli', volta: 190, chiaro: 0.62, liscio: 1, rami: [
    [[5075, 600, 17], [4985, 600, 17], [4930, 600, 24], [4880, 600, 36], [4820, 596, 19], [4760, 588, 19], [4700, 580, 24], [4660, 574, 70]],   // la porta, la dogana, la Via del Re
    [[4660, 574, 110], [4540, 570, 160], [4410, 566, 160], [4310, 562, 115]],                                                               // la grande caverna
    [[4310, 562, 115], [4236, 562, 52]],                                                                                                    // la nicchia della Sala del Re
    [[4640, 690, 14], [4664, 760, 12, -4], [4716, 815, 12, -9], [4756, 856, 16, -12]]] });                                                   // la Galleria dei Carrelli, giù fino alla miniera
  W.PLACES.push([GX, GZ, 244, 'FUCINAFONDA', 0], [5020, 600, 80, 'PORTA DI FUCINAFONDA', 0], [4244, 562, 46, 'SALA DEL RE SOTTO IL MONTE', 0], [4690, 790, 60, 'GALLERIA DEI CARRELLI', 0], [4800, 594, 120, 'VIA DEL RE', 0]);
  // la Miniera di Barbarossa, allargata: la sala grande, la sala di tramontana (dove arriva la Galleria), la Sala dei Cristalli e, più giù, la Vena d'Oro
  { const B = W.GROTTE.find(g => g.id === 'barbarossa'); if (B) { B.volta = 70;
      B.rami.push([[4790, 1000, 56], [4786, 1004, 56]], [[4760, 850, 42], [4756, 856, 42]], [[4540, 1010, 28], [4470, 1016, 62]], [[4470, 1016, 62], [4424, 1088, 15, -5], [4384, 1156, 44, -9]], [[4850, 1150, 22], [4900, 1196, 40, -4]]);
      W.PLACES.push([4470, 1016, 66, 'SALA DEI CRISTALLI', 0], [4384, 1156, 50, "VENA D'ORO", 0]);
      for (let k = 0; k < 16; k++) { const a = k * 2.4, r = 22 + (k * 7) % 34, col = k % 3 ? [0.5, 0.85, 1] : [0.8, 0.6, 1]; P([k % 4 === 3 ? 'icecrystal' : 'crystal', Math.round(4470 + Math.cos(a) * r), Math.round(1016 + Math.sin(a) * r), { dentro: 1, glow: [5, 9, col[0], col[1], col[2], 1], s: k % 5 === 0 ? 1.5 : 1 }]); }
      for (let k = 0; k < 9; k++) { const a = k * 2.1 + 0.4, r = 14 + (k * 5) % 24; P(['rock', Math.round(4384 + Math.cos(a) * r), Math.round(1156 + Math.sin(a) * r), { dentro: 1, lit: 0.8, glow: [3, 6, 1, 0.8, 0.3, 1] }]); }
      P(['cart', 4398, 1132, D1], ['crate', 4372, 1140, D1], ['lantern', 4424, 1088, { dentro: 1, lit: 1.15, glow: [5, 10, 1, 0.8, 0.45, 1] }], ['lantern', 4900, 1196, { dentro: 1, lit: 1.15, glow: [5, 10, 1, 0.8, 0.45, 1] }], ['barrel', 4912, 1206, D1], ['crate', 4890, 1210, D1]);
      W.CHESTS.push(['gv_vena', 4372, 1176, 'monete:120', 2], ['gv_cristalli', 4436, 1040, 'elisir', 1]); } }
  // nella città e davanti alla porta, niente branchi
  W.CAMPS.splice(0, W.CAMPS.length, ...W.CAMPS.filter(c => !((c[0] > 4150 && c[0] < 4800 && c[1] > 380 && c[1] < 760) || Math.hypot(c[0] - 5000, c[1] - 600) < 190)));

  // ================= LA CITTÀ, A BLOCCHI =================
  const PIL = [], CASE = [], LUMI = [];                          // pilastri, porte delle case al piano del viale, lumi (li usa anche la vita della città)
  W.builders.fucinafonda = (b, gy) => {
    const y = Y, M = W.mesh, buio = (n0, k) => { for (let i = n0 + 7; i < M.length; i += 8) if (M[i] < 0.93) M[i] *= k; };
    const blocco = (x0, z0, x1, z1, y0, y1, tile, top, k = 0.6, solido = true) => { const n0 = M.length; K.box(x0, z0, x1, z1, y0, y1, tile, top === undefined ? tile : top); buio(n0, k); if (solido) W.addBox(x0, z0, x1, z1, y1, b); };
    const lastra = (x0, z0, x1, z1, tile, k = 0.62) => { const n0 = M.length; K.boxTop(x0, z0, x1, z1, y + 0.12, tile); buio(n0, k); };
    const lava = (x0, z0, x1, z1, yy, f) => { const n0 = M.length; K.boxTop(x0, z0, x1, z1, yy, TL.LAVA); for (let i = n0 + 7; i < M.length; i += 8) M[i] = 0.93 + 2 * f; };
    const lume = (x, yy, z, r, c, k) => W.glows.push([x, yy, z, r, c[0], c[1], c[2], 1]);
    const CALDO = [1, 0.74, 0.38], BRACE = [1, 0.48, 0.14], CIELO = [0.55, 0.85, 1];
    // --- il lastricato: il viale, la piazza della fucina, le due traverse, il vicolo della galleria ---
    lastra(4250, GZ - 13, 4706, GZ + 13, TL.STONE, 0.36); lastra(GX - 62, GZ - 62, GX + 62, GZ + 62, TL.STONE, 0.42);
    for (const x of [4390, 4570]) lastra(x - 7, 446, x + 7, 690, TL.STONE, 0.3); lastra(4633, GZ + 13, 4647, 690, TL.STONE, 0.3);
    // --- i pilastri del viale e della piazza: base, fusto fino alla volta, un anello d'oro e un lume ---
    for (const [px, pz] of [[4664, GZ - 34], [4664, GZ + 34], [4592, GZ - 34], [4592, GZ + 34], [4350, GZ - 34], [4350, GZ + 34], [4300, GZ - 34], [4300, GZ + 34], [GX - 62, GZ - 62], [GX + 62, GZ - 62], [GX - 62, GZ + 62], [GX + 62, GZ + 62]]) {
      blocco(px - 4.5, pz - 4.5, px + 4.5, pz + 4.5, y - 1, y + 3.2, 11); blocco(px - 3, pz - 3, px + 3, pz + 3, y + 3.2, y + 84, 9, 9, 0.5, false); blocco(px - 3.5, pz - 3.5, px + 3.5, pz + 3.5, y + 9, y + 10.2, TL.GOLD, TL.GOLD, 0.9, false);
      lume(px, y + 12, pz + (pz < GZ ? 4 : -4), 9, CALDO); if (Math.abs(pz - GZ) < 40) K.onWall(pz < GZ ? 's' : 'n', px - 3, pz - 3, px + 3, pz + 3, px, y + 13, 4.4, 11, PIL.length % 4 < 2 ? TL.BAN_RED : TL.BAN_BLUE, true); PIL.push([px, pz]); }
    // --- la Grande Fucina: tre gradoni, quattro bocche di fuoco, il camino fino alla volta ---
    blocco(GX - 17, GZ - 17, GX + 17, GZ + 17, y - 1, y + 4, 11); blocco(GX - 12, GZ - 12, GX + 12, GZ + 12, y + 4, y + 13, 16, 11, 0.55, false); blocco(GX - 6, GZ - 6, GX + 6, GZ + 6, y + 13, y + 26, 10, 10, 0.5, false); blocco(GX - 4, GZ - 4, GX + 4, GZ + 4, y + 26, y + 90, 10, 10, 0.42, false);
    blocco(GX - 12.6, GZ - 12.6, GX + 12.6, GZ + 12.6, y + 12, y + 13.2, TL.GOLD, TL.GOLD, 0.9, false);
    for (const s of ['n', 's', 'e', 'w']) { K.onWall(s, GX - 12, GZ - 12, GX + 12, GZ + 12, s === 'n' || s === 's' ? GX : GZ, y + 4.6, 9, 6.4, TL.LAVA, true); const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[s]; lume(GX + v[0] * 14, y + 8, GZ + v[1] * 14, 15, BRACE); }
    lume(GX, y + 30, GZ, 30, BRACE); lume(GX, y + 16, GZ, 42, BRACE);
    // --- i canali di lava: dalla parete di tramontana alla fucina, dalla fucina alla parete di mezzogiorno; in cima, la cascata che scende dalla roccia ---
    for (const [z0, z1, zc] of [[426, GZ - 37, 424], [GZ + 37, 712, 714]]) {
      blocco(GX - 5.2, z0, GX - 3.8, z1, y - 1, y + 1.5, 11, 11, 0.6, false); blocco(GX + 3.8, z0, GX + 5.2, z1, y - 1, y + 1.5, 11, 11, 0.6, false); lava(GX - 3.8, z0, GX + 3.8, z1, y + 0.95, zc < GZ ? 1.6 : -1.6); W.addBox(GX - 5.2, z0, GX + 5.2, z1, y + 1.5, b);
      blocco(GX - 5.2, Math.min(z1, z0) - (zc < GZ ? 0 : 0), GX + 5.2, Math.min(z1, z0) + 0.1, y - 1, y + 1.5, 11, 11, 0.6, false);
      { const n0 = M.length, zz = zc; K.quad([GX - 3.6, y + 0.9, zz], [GX + 3.6, y + 0.9, zz], [GX + 3.6, y + 46, zz + (zc < GZ ? -9 : 9)], [GX - 3.6, y + 46, zz + (zc < GZ ? -9 : 9)], TL.LAVA, 1, 6); K.quad([GX + 3.6, y + 0.9, zz], [GX - 3.6, y + 0.9, zz], [GX - 3.6, y + 46, zz + (zc < GZ ? -9 : 9)], [GX + 3.6, y + 46, zz + (zc < GZ ? -9 : 9)], TL.LAVA, 1, 6); for (let i = n0 + 7; i < M.length; i += 8) M[i] = 0.93 + 2 * 3; }
      for (let z = z0 + 14; z < z1; z += 34) lume(GX, y + 3, z, 13, BRACE); lume(GX, y + 16, zc, 22, BRACE); }
    // --- le case: una fila al piano del viale, e due gradoni di case più su, contro la roccia ---
    const casa = (x0, z0, x1, z1, y0, h, porta, muro, acc) => { blocco(x0, z0, x1, z1, y0 - 1, y0 + h, muro, 11, y0 < y + 2 ? 0.72 : 0.86, y0 < y + 2); blocco(x0 - 0.8, z0 - 0.8, x1 + 0.8, z1 + 0.8, y0 + h, y0 + h + 1.2, 11, 11, 0.55, false);
      const cx = (x0 + x1) / 2, zf = porta === 's' ? z1 : z0, sg = porta === 's' ? 1 : -1;
      K.onWall(porta, x0, z0, x1, z1, cx, y0, 5, 7.6, TL.DOOR, true); for (const dx of [-8.5, 8.5]) K.onWall(porta, x0, z0, x1, z1, cx + dx, y0 + 3.2, 3.8, 4.2, TL.WIN_ARCH, true);
      if (acc) lume(cx + 8.5, y0 + 5.4, zf + sg * 1.2, y0 < y + 2 ? 6 : 8, CALDO); if (y0 < y + 2) CASE.push([cx, zf + sg * 3.6, sg > 0 ? -Math.PI / 2 : Math.PI / 2]); };
    for (const sg of [-1, 1]) { const por = sg < 0 ? 's' : 'n', zA = GZ + sg * 50, zB = GZ + sg * 68, zC = GZ + sg * 96, zD = GZ + sg * 124, lo = (a, c) => Math.min(a, c), hi = (a, c) => Math.max(a, c);
      // la fila del viale (fuori dalla piazza; a mezzogiorno resta libero l'angolo della birreria e il vicolo della galleria)
      for (const x of [4300, 4338, 4400, 4554, 4592].concat(sg < 0 ? [4630] : [])) { if (sg > 0 && x === 4300) continue; casa(x, lo(zA, zB), x + 30, hi(zA, zB), y, 12 + (x % 3) * 1.5, por, x % 2 ? 9 : 16, true); }
      // i due gradoni (muri di sostegno) e le loro case
      blocco(4322, lo(zB, zC), sg > 0 ? 4612 : 4660, hi(zB, zC), y - 1, y + 10, 11, TL.STONE, 0.5); blocco(4372, lo(zC, zD), 4606, hi(zC, zD), y - 1, y + 20, 11, TL.STONE, 0.46);
      let k = 0; for (let x = 4330; x + 26 <= (sg > 0 ? 4610 : 4656); x += 36) casa(x, lo(zB + sg * 5, zB + sg * 23), x + 26, hi(zB + sg * 5, zB + sg * 23), y + 10, 11 + (k % 3), por, k % 2 ? 16 : 9, k++ % 2 === 0);
      for (let x = 4380; x + 26 <= 4604; x += 38) casa(x, lo(zC + sg * 5, zC + sg * 22), x + 26, hi(zC + sg * 5, zC + sg * 22), y + 20, 10 + (k % 3), por, k % 2 ? 9 : 16, k++ % 2 === 0); }
    // --- la Sala del Re: sei colonne, il muro col portone, gli stendardi ---
    blocco(4216, GZ - 40, 4222, GZ + 34, y - 1, y + 46, 11, 11, 0.85); lume(4236, y + 24, GZ - 3, 36, CALDO); lume(4250, y + 40, GZ - 30, 14, CALDO); lume(4250, y + 40, GZ + 24, 14, CALDO); K.onWall('e', 4216, GZ - 40, 4222, GZ + 34, GZ - 3, y, 15, 22, TL.DOOR_BIG, true);
    for (const dz of [-27, 21]) K.onWall('e', 4216, GZ - 40, 4222, GZ + 34, GZ + dz, y + 12, 7, 16, TL.BAN_RED, true);
    blocco(4222, GZ - 40, 4262, GZ + 34, y + 34, y + 38, 11, 11, 0.5, false); blocco(4222, GZ - 41, 4263, GZ + 35, y + 38, y + 40, TL.GOLD, TL.GOLD, 0.85, false);
    for (let k = 0; k < 6; k++) { const cz = GZ - 34 + k * 12.4; if (k === 2 || k === 3) { if (k === 2) lume(4250, y + 12, GZ - 3, 20, CALDO); } blocco(4254, cz - 2.6, 4259.2, cz + 2.6, y - 1, y + 34, 9, 9, 0.8); }
    // --- le stelle della volta: cristalli che fanno luce, alti sopra la città ---
    for (let k = 0; k < 26; k++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), x = 4470 + Math.cos(a) * r * 190, z = GZ + Math.sin(a) * r * 110; lume(x, y + 46 + r * -18 + rnd() * 20, z, 4.5 + rnd() * 3, k % 4 ? CIELO : [0.85, 0.7, 1]); }
    // --- la porta nel fianco del monte: due piloni, l'architrave, due colossi di pietra con l'ascia ---
    for (const sg of [-1, 1]) { const pz = 600 + sg * 23;
      blocco(4984, pz - 7, 4998, pz + 7, Math.min(gy(4991, pz), y) - 6, y + 40, 11, 11, 0.8); blocco(4983, pz - 8, 4999, pz + 8, y + 40, y + 43, TL.GOLD, TL.GOLD, 0.95, false);
      K.onWall('e', 4984, pz - 7, 4998, pz + 7, pz, y + 14, 7, 18, TL.BAN_RED, true);
      // il colosso: gambe, busto, braccia, testa con l'elmo, barba, e l'ascia piantata davanti
      const cx = 5020, cz = 600 + sg * 34, g0 = Math.min(gy(cx, cz), gy(cx + 4, cz)) - 3;
      blocco(cx - 6, cz - 7, cx + 6, cz + 7, g0, g0 + 7, 11, 11, 0.8); for (const s2 of [-1, 1]) blocco(cx - 2.5, cz + s2 * 3.6 - 2, cx + 2.5, cz + s2 * 3.6 + 2, g0 + 7, g0 + 15, 9, 9, 0.8, false);
      blocco(cx - 3.5, cz - 6, cx + 3.5, cz + 6, g0 + 15, g0 + 27, 9, 9, 0.82, false); for (const s2 of [-1, 1]) blocco(cx - 2.2, cz + s2 * 7.6 - 1.8, cx + 2.8, cz + s2 * 7.6 + 1.8, g0 + 16, g0 + 26, 9, 9, 0.78, false);
      blocco(cx - 3, cz - 3.6, cx + 3.4, cz + 3.6, g0 + 27, g0 + 34, 9, 9, 0.86, false); blocco(cx + 3.4, cz - 3, cx + 5, cz + 3, g0 + 21, g0 + 30, 10, 10, 0.7, false); blocco(cx - 3.6, cz - 4.2, cx + 3.8, cz + 4.2, g0 + 33, g0 + 36.5, TL.GOLD, TL.GOLD, 0.9, false);
      blocco(cx + 6, cz - sg * 7.6 - 0.7, cx + 7.4, cz - sg * 7.6 + 0.7, g0 + 7, g0 + 31, 10, 10, 0.75, false); blocco(cx + 5.6, cz - sg * 7.6 - 4.5, cx + 7.8, cz - sg * 7.6 + 4.5, g0 + 24, g0 + 31, 9, 9, 0.9, false); }
    blocco(4984, 584, 4998, 616, y + 28, y + 40, 11, 11, 0.72, false); blocco(4983, 583, 4999, 617, y + 26, y + 28, TL.GOLD, TL.GOLD, 0.95, false);
    lume(5004, y + 20, 600, 16, CALDO);
    // --- la dogana: due muretti che stringono il passo, il banco del doganiere ---
    blocco(4872, 566, 4876, 590, y - 1, y + 4, 11); blocco(4872, 610, 4876, 634, y - 1, y + 4, 11); lume(4874, y + 8, 590, 9, CALDO); lume(4874, y + 8, 610, 9, CALDO);
  };
  W.BUILD.push({ k: 'fucinafonda', x: GX, z: GZ });
  // le tre botteghe dei mastri, ai lati della piazza (banchi con la tenda), e la birreria all'angolo di mezzogiorno-ponente
  for (const [x, z, t] of [[4436, 524, 13], [4524, 524, TL.AWN_BLUE], [4436, 620, TL.AWN_YELLOW]]) W.BUILD.push({ k: 'stall', x, z, w: 14, d: 8, h: 7, cloth: t });
  P(['anvil', 4448, 530, D1], ['anvil', 4512, 530, D1], ['barrel', 4424, 526, D1], ['crate', 4536, 526, D1], ['goldchest', 4448, 624, D1], ['anvil', GX - 22, GZ + 7, D1], ['anvil', GX + 22, GZ - 9, D1], ['rack', GX + 22, GZ + 13, D1], ['rack', GX - 22, GZ - 14, D1]);
  for (const [x, z] of [[4306, 630], [4322, 646], [4300, 656]]) P(['table', x, z, D1], ['stool', x - 4.6, z + 0.4, D1], ['stool', x + 4.6, z - 0.4, D1], ['stool', x + 0.4, z + 4.6, D1]);
  P(['keg', 4290, 640, D1], ['barrel', 4288, 630, D1], ['barrel', 4294, 624, D1], ['barrel', 4284, 650, D1], ['lantern', 4312, 640, { dentro: 1, lit: 1.15, glow: [5, 10, 1, 0.8, 0.45, 1] }]);
  // bracieri e statue: alla porta, lungo la Via del Re, davanti alla Sala del Re; carrelli e casse nella galleria
  for (const [x, z] of [[5034, 586], [5034, 614], [4940, 586], [4940, 614], [4800, 584], [4800, 608], [4730, 570], [4730, 596], [4268, GZ - 20], [4268, GZ + 14]]) P(['braciereV', x, z, { dentro: x < 4980 ? 1 : 0, glow: [6, 12, 1, 0.6, 0.25, 1] }]);
  for (const x of [4322, 4400, 4562, 4618, 4676]) for (const sg of [-1, 1]) P(['braciereV', x, GZ + sg * 16, { dentro: 1, glow: [6, 11, 1, 0.6, 0.25, 1] }]);
  P(['kingstatue', 4278, GZ - 34, D1], ['kingstatue', 4278, GZ + 28, D1], ['cart', 4656, 712, D1], ['cart', 4684, 792, D1], ['crate', 4673, 748, D1], ['barrel', 4731, 815, D1], ['cart', 4930, 618, D1], ['crate', 4886, 628, D1], ['crate', 4882, 574, D1], ['sack', 4888, 570, D1], ['sign', 5052, 618]);
  W.TESTI['5052,618'] = ['FUCINAFONDA, CITTÀ DEI NANI SOTTO IL MONTE. CHI ENTRA PASSA DALLA DOGANA.', 'ARMI SGUAINATE NON SONO GRADITE. MONETE SÌ.'];
  for (const [x, z] of [[4664, 760], [4716, 815]]) W.BUILD.push({ k: 'puntello', x, z, w: 17, h: 9.5, asse: x === 4664 ? 'x' : 'x', buio: 0.5 });

  // ================= LA GENTE =================
  Object.assign(LK, {
    nanoguardia: { sc: 0.82, wide: 0.9, skin: '#e0b088', helm: { c: '#c8d0dc', nose: 1, spike: 1 }, beard: '#a8582a', shirt: '#2a4a8a', plate: '#c8d0dc', pauldron: '#a8b4c8', belt: '#b89030', pants: '#3a4252', boots: '#2a2630', weapon: { kind: 'spear' }, shield: '#2a4a8a', emblem: '#ffd23f' },
    renano: { sc: 0.9, wide: 1.0, skin: '#e0b088', crown: '#ffd23f', hairStyle: 'long', hair: '#f0ece4', beard: '#f0ece4', beardLong: 1, shirt: '#8a2a2a', plate: '#e8c860', pauldron: '#ffd86a', cape: '#6a1e2e', belt: '#ffd23f', pants: '#4a2a2a', boots: '#3a2a1a' } });
  if (LK.nano2) LK.nano2.walk = 1;   // (solo un aspetto impara a camminare: sul foglio delle figure non c'è posto per altri)
  const F = (look, n, x, z, yaw, righe, extra) => C.folk(look, n, x, z, yaw, righe, Object.assign({ sveglio: 1 }, extra));
  const E = 0, N = -Math.PI / 2, S = Math.PI / 2, O = Math.PI;
  // alla porta
  F('nanoguardia', 'GUARDIA DELLA PORTA', 5030, 592, E, ['FUCINAFONDA È APERTA A CHI VIENE IN PACE. LA DOGANA È IN FONDO ALLA PRIMA GALLERIA.', 'I DUE COLOSSI? I PRIMI RE. LI SCOLPIRONO IN CENT\'ANNI, DA UN SOLO BLOCCO.']);
  F('nanoguardia', 'GUARDIA DELLA PORTA', 5030, 608, E, ['GUARDA DOVE METTI I PIEDI: QUI SOTTO PASSA META\' DEL FERRO DI LUMEN.']);
  // la fila alla dogana
  F('mercante', 'UN MERCANTE IN FILA', 4936, 604, O, ['SONO IN FILA DA STAMATTINA. I NANI CONTROLLANO OGNI CASSA, OGNI SACCO, OGNI TASCA.', 'MA NE VALE LA PENA: UNA LAMA DI QUI SI RIVENDE AL TRIPLO.']);
  F('donna', 'UNA VIANDANTE IN FILA', 4924, 598, O, ['DICONO CHE DENTRO CI SIA UNA CITTÀ INTERA, CON UN FIUME DI FUOCO. IO VOGLIO VEDERLA.']);
  F('monaco', 'UN PELLEGRINO IN FILA', 4912, 603, O, ['LA PAZIENZA È UNA VIRTÙ. I NANI ME LA STANNO INSEGNANDO TUTTA OGGI.']);
  F('nano3', 'IL DOGANIERE', 4868, 600, E, ['NOME, MESTIERE E MOTIVO DELLA VISITA. ... UN VIANDANTE? PASSA PURE.', 'REGOLE DI FUCINAFONDA: NIENTE RISSE, NIENTE DEBITI, NIENTE FUOCHI CHE NON SIANO I NOSTRI.']);
  F('nanoguardia', 'GUARDIA DELLA DOGANA', 4862, 586, E, ['AVANTI UNO ALLA VOLTA.']); F('nanoguardia', 'GUARDIA DELLA DOGANA', 4862, 614, E, ['IL VIALE È DRITTO DAVANTI A TE. LA GRANDE FUCINA NON PUOI MANCARLA: È LA COSA PIÙ ALTA CHE VEDRAI.']);
  // la città
  F('renano', 'RE BRANDOR PUGNODIFERRO', 4268, GZ - 3, E, ['BENVENUTO A FUCINAFONDA, GENTE DI SOPRA. IO SONO BRANDOR, RE SOTTO IL MONTE.', 'QUI SI LAVORA IL FERRO DA PRIMA CHE SOLIS AVESSE UN NOME. QUEL CHE ESCE DALLE NOSTRE FUCINE NON SI ROMPE: SI EREDITA.', 'QUANDO IL TUO VIAGGIO COMINCERÀ DAVVERO, TORNA DA ME. I NANI HANNO UN CONTO APERTO CON CIÒ CHE DORME SOTTO IL PICCO.']);
  F('nanoguardia', 'GUARDIA DEL RE', 4274, GZ - 16, E, ['PARLA AL RE CON RISPETTO.']); F('nanoguardia', 'GUARDIA DEL RE', 4274, GZ + 10, E, ['IL RE RICEVE TUTTI. ANCHE QUELLI ALTI.']);
  F('nano', 'MASTRO GRIMO', 4436, 518, S, ['LAME DELLA GRANDE FUCINA. LA MIGLIORE È DI FERROSTELLA: FERRO CADUTO DAL CIELO. COSTA QUANTO UNA CASA, E VALE DI PIÙ.'], { role: 'shop', shop: 'nani_armi' });
  F('nana', 'MASTRA ILDA', 4524, 518, S, ['CORAZZE, ELMI, SCUDI. PROVA A SCALFIRNE UNO: SE CI RIESCI TE LO REGALO.'], { role: 'shop', shop: 'nani_corazze' });
  F('nano3', "L'ORAFO TOBRO", 4436, 614, S, ['GEMME DEL MONTE E ANELLI DA MASTRO. PICCOLI, MA PESANO.'], { role: 'shop', shop: 'nani_gemme' });
  F('nana', 'LA BIRRAIA GUNDA', 4296, 634, E, ['BIRRA DI RADICI, SCURA COME LA MINIERA! E PER CHI HA PRESO BOTTE, RIMEDI DA NANI.'], { role: 'shop', shop: 'nani_birra' });
  F('nano', 'IL MASTRO DELLA GRANDE FUCINA', GX + 24, GZ + 4, E, ['LA GRANDE FUCINA NON SI SPEGNE DA NOVECENTO ANNI. LA LAVA SCENDE DAL CUORE DEL MONTE: NOI LE ABBIAMO SOLO INSEGNATO LA STRADA.', 'CON UN FUOCO COSÌ, UNA LAMA SI TEMPRA IN UN GIORNO INVECE CHE IN UN MESE.']);
  F('nano', 'UN FABBRO AL LAVORO', GX - 24, GZ - 6, O, ['BATTI, GIRA, BATTI. CENTO VOLTE. POI SI RICOMINCIA.']);
  F('nano3', 'LA CUSTODE DELLE RUNE', 4340, GZ + 30, N, ['SUI PILASTRI CI SONO I NOMI DI TUTTI I RE. L\'ULTIMO POSTO È ANCORA VUOTO: BRANDOR NON HA FRETTA.', 'LE LUCI LASSÙ, NELLA VOLTA? CRISTALLI. I PICCOLI LE CHIAMANO STELLE, PERCHÉ QUELLE VERE NON LE HANNO MAI VISTE.']);
  F('nano', 'UN MINATORE', 4628, 672, E, ['LA GALLERIA DEI CARRELLI SCENDE FINO ALLA MINIERA DI BARBAROSSA. DI LÌ SI ESCE DALL\'ALTRA PARTE DEL MONTE.']);
  F('bimbo', 'UN PICCOLO NANO', 4520, GZ + 40, O, ['DA GRANDE AVRÒ UNA BARBA FINO AI PIEDI!', 'TU VIENI DA SOPRA? È VERO CHE LÌ IL SOFFITTO È AZZURRO?'], { walk: 1 });
  // i nani che girano per la città
  const nomi = { nano2: ['UN NANO', 'UN MINATORE', 'UN CARPENTIERE', 'UN FABBRO'] };
  for (let i = 0; i < 12; i++) { const look = 'nano2', a = i / 12 * Math.PI * 2; C.folk(look, nomi[look][i % nomi[look].length], GX + Math.cos(a) * 44, GZ + Math.sin(a) * 44, a + Math.PI, ['SALUTE, GENTE DI SOPRA.'], { id: 'v_nani_' + i, walk: 1, vita: 'nani', nott: i % 3 === 1 }); }
  // chi ha l'aspetto dei nani che camminano ma sta fermo al suo posto (le figure sono le stesse: non servono due fogli)
  for (const id in W.FOLK) { const f = W.FOLK[id]; if (f.look === 'nano2' && !f.walk) { f.walk = 1; f.fermo = 1; } }

  // la vita della città: le mete (piazza, fucina, botteghe, birreria) e le porte delle case al piano del viale. Le porte le sa il costruttore: stanno in CASE quando il mondo nasce
  const V = W.VITA = W.VITA || {};
  const zona = { id: 'nani', nome: 'FUCINAFONDA', box: [4240, 440, 4720, 700], centro: [GX + 30, GZ + 26], strade: [[4250, GZ - 13, 4706, GZ + 13], [GX - 62, GZ - 62, GX + 62, GZ + 62], [4383, 446, 4397, 690], [4563, 446, 4577, 690]],
    mete: [[GX - 40, GZ - 40, 'piazza', 0.8], [GX + 40, GZ - 40, 'piazza', 2.4], [GX - 40, GZ + 40, 'piazza', -0.8], [GX + 44, GZ + 36, 'piazza', -2.4], [GX - 50, GZ, 'piazza', 0], [GX + 50, GZ, 'piazza', O],
      [GX - 26, GZ, 'fucina', 0], [GX + 26, GZ - 8, 'fucina', O], [GX, GZ - 25, 'fucina', S], [GX, GZ + 25, 'fucina', N], [GX - 9, GZ - 40, 'fucina', 0.3], [GX + 9, GZ + 44, 'fucina', O - 0.3],
      [4432, 532, 'bancarella', N], [4440, 532, 'bancarella', N], [4520, 532, 'bancarella', N], [4528, 532, 'bancarella', N], [4436, 628, 'bancarella', N],
      [4306, 624, 'birra', S], [4328, 644, 'birra', O], [4310, 650, 'birra', N], [4300, 662, 'birra', N],
      [4290, GZ + 4, 'piazza', O], [4600, GZ - 8, 'piazza', O], [4690, GZ + 6, 'piazza', 0], [4390, 470, 'piazza', S], [4570, 668, 'piazza', N]],
    get case() { return CASE; } };
  (V.zone = V.zone || []).push(zona);
  (V.dettiDi = V.dettiDi || {}).nani = {
    giro: ['VADO ALLA FUCINA: IL TURNO COMINCIA FRA POCO.', 'QUI SOTTO NON PIOVE MAI. È LA COSA CHE PREFERISCO.', 'SEI ALTO, TU. ATTENTO ALLE TRAVI, NELLE GALLERIE.', 'A FUCINAFONDA NESSUNO VA DI FRETTA. TRANNE QUANDO SUONA LA CAMPANA DELLA BIRRA.'],
    piazza: ['GUARDA IL CAMINO: SALE FINO ALLA VOLTA E OLTRE, FIN FUORI DAL MONTE.', 'ASPETTO MIO FRATELLO. LAVORA ALLA VENA D\'ORO: ESCE SEMPRE TARDI.', 'IL RE PASSA DI QUI OGNI MATTINA. SALUTA TUTTI PER NOME.'],
    fucina: ['SENTI CHE CALDO? È LA LAVA: SCENDE DAL CUORE DEL MONTE.', 'GUARDO LAVORARE I MASTRI. NON CI SI STANCA MAI.', 'UN GIORNO BATTERÒ ANCH\'IO IL FERROSTELLA. PER ORA PORTO IL CARBONE.'],
    bancarella: ['QUESTA LAMA È DI MASTRO GRIMO: SI VEDE DAL FILO.', 'UNO SCUDO DI ILDA DURA TRE VITE. IO NE HO UNO DI MIO NONNO.', 'GUARDO SOLTANTO. I PREZZI DEI MASTRI NON SONO PER LE MIE TASCHE.'],
    birra: ['UN BOCCALE DI RADICI E PASSA TUTTO.', 'ALLA SALUTE DEL RE SOTTO IL MONTE!', 'GUNDA FA LA BIRRA COME SUA NONNA. E SUA NONNA LA FACEVA COME UN FABBRO FA UNA SPADA.', 'SIEDITI, GENTE DI SOPRA! QUI SI BEVE IN PIEDI SOLO PER PUNIZIONE.'],
    chiacchiera: ['PARLAVAMO DELLA VENA NUOVA. DICONO CHE SIA ORO BUONO.', 'SHH. SI PARLA DI AFFARI.', 'HAI SAPUTO? UN UOMO DI SOPRA HA COMPRATO UNA LAMA DI FERROSTELLA. PAGATA IN MONETE, UNA SULL\'ALTRA.'],
    casa: ['CASA MIA È SCAVATA NELLA ROCCIA DA MIO BISNONNO. NON HA UNA CREPA.'],
    sera: ['SUONA LA CAMPANA: SI SPENGONO I MANTICI. A DOMANI.', 'DI SERA LE STELLE DELLA VOLTA SI VEDONO MEGLIO.'],
    notte: ['IL TURNO DI NOTTE È IL MIGLIORE: LA FUCINA È TUTTA TUA.', 'NON HO SONNO. QUI SOTTO IL GIORNO E LA NOTTE LI DECIDE LA CAMPANA.'],
    esce: {}, dentro: {} };
  W.PLACES.sort((a, b) => a[2] - b[2]);
};
})();
