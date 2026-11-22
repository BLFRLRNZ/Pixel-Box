// ---------- IL GRANDE VIAGGIO · Terra I: Lumen — grotte, luoghi e gente fuori dalle città ----------
// La scheda di Lumen (sv_lumen.js) disegna la terra, le città e le strade maestre. Qui sta quel che la riempie:
// le grotte aperte, i luoghi lungo le vie (torri, fattorie, mulini, rovine, altari), i cartelli, i forzieri e la gente che ci vive.
// Tutto è fatto di elenchi: per aggiungere un luogo si aggiunge una riga.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenLuoghi = (m, L) => {
  const W = m.world, B = W.B, C = m.city, TN = m.town, TL = TN.TL, K = W.kit, { via, T } = L;
  const TAU = Math.PI * 2;
  let seme = 20261122; const rnd = () => (seme = (seme * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  W.TESTI = W.TESTI || {};   // quel che si legge esaminando un oggetto preciso (cartelli, lapidi, statue): «x,z» → righe
  const testo = (x, z, righe) => { W.TESTI[x + ',' + z] = righe; };
  const quieti = [];         // dove sta la gente: lì attorno niente branchi di nemici (si tolgono in fondo)
  const vecchi = new Set(W.CAMPS);   // i branchi che c'erano già: solo quelli si tolgono dai luoghi abitati

  // ================= LE GROTTE =================
  // una rupe: un poggio di roccia alzato sul terreno (come il Poggio del Tasso). cr = [x, z, raggio]: lì la rupe è sfondata (una dolina: il tetto non c'è)
  const rupe = (x, z, rx, rz, h, cr) => W.SHAPERS.push({ box: [x - rx - 50, z - rz - 50, x + rx + 50, z + rz + 50], free: () => true,
    f: (px, pz, hh) => { const s = Math.hypot((px - x) / rx, (pz - z) / rz) * (1 + (W.fbm(px / 80, pz / 80, 2) - 0.5) * 0.14); if (s >= 1) return hh;
      let su = (h + 14 * (W.fbm(px / 45, pz / 45, 3) - 0.5)) * W.smooth(1, 0.78, s);
      if (cr) su *= W.smooth(cr[2] * 0.6, cr[2] * 1.25, Math.hypot(px - cr[0], pz - cr[1]));
      return hh + su; } });
  // una grotta: lo scavo, il nome sulla carta, due torce all'imbocco
  const grotta = o => { const g = { id: o.id, y: o.y, musica: o.musica, rami: o.rami, roccia: o.roccia, prato: o.prato }; W.GROTTE.push(g);
    const A = o.rami[0][0], M = o.rami[0][1], Ln = Math.hypot(M[0] - A[0], M[1] - A[1]), ux = (M[0] - A[0]) / Ln, uz = (M[1] - A[1]) / Ln, c = o.centro || o.rami[0][o.rami[0].length - 1];
    W.PLACES.push([c[0], c[1], o.raggio || 130, o.nome, o.segreta ? 1 : 0]);
    if (!o.buia) for (const s of [-1, 1]) W.PROPS.push(['torch', Math.round(M[0] - ux * 20 - uz * (M[2] + 4) * s), Math.round(M[1] - uz * 20 + ux * (M[2] + 4) * s)]);
    return g; };
  // l'arredo di una grotta: cristalli (alcuni fanno luce), funghi chiari, sassi, ossa, lungo i rami ma non in mezzo al passaggio. «dentro»: l'oggetto si posa solo se cade sul fondo della grotta
  const arreda = (g, o) => { const buio = { lit: 0.46, dentro: 1 }, pc = o.pc === undefined ? 0.3 : o.pc, pf = o.pf === undefined ? 0.25 : o.pf;
    g.rami.forEach((P, bi) => { for (let s = bi === 0 ? 1 : 0; s < P.length - 1; s++) { const A = P[s], Q = P[s + 1], Ln = Math.hypot(Q[0] - A[0], Q[1] - A[1]), ux = (Q[0] - A[0]) / Ln, uz = (Q[1] - A[1]) / Ln, n = Math.max(2, Math.round(Ln / (o.passo || 22)));
      for (let i = 0; i < n; i++) { const t = (i + 0.15 + rnd() * 0.7) / n, r = A[2] + (Q[2] - A[2]) * t, off = r * (0.45 + rnd() * 0.33) * (rnd() < 0.5 ? -1 : 1), x = Math.round(A[0] + (Q[0] - A[0]) * t - uz * off), z = Math.round(A[1] + (Q[1] - A[1]) * t + ux * off), k = rnd(), lc = o.luci[Math.floor(rnd() * o.luci.length)], acceso = rnd() < (o.accesi || 0.6);
        if (k < pc) W.PROPS.push([o.cristallo || 'crystal', x, z, acceso ? { glow: [5, 8, lc[0], lc[1], lc[2], 1], dentro: 1 } : { dentro: 1 }]);
        else if (k < pc + pf) W.PROPS.push(['mushroom', x, z, acceso && o.lucciole ? { lit: 1.15, dentro: 1, glow: [3, 6, lc[0], lc[1], lc[2], 1] } : { lit: 1.15, dentro: 1 }]);
        else if (k < 0.93) W.PROPS.push([o.sasso || 'rock', x, z, buio]);
        else W.PROPS.push(['bones', x, z, buio]); } } }); };
  const lume = (r, g, b, forte) => ({ glow: [5, forte ? 12 : 8, r, g, b, 1], dentro: 1 });
  const AZZ = [0.3, 0.7, 1], VIO = [0.55, 0.4, 1], VER = [0.45, 1, 0.5], GIA = [1, 0.85, 0.45], BIA = [0.75, 0.9, 1], ARG = [0.8, 0.85, 1];

  // --- 1. la Miniera di Barbarossa: la galleria dei nani, nel fianco dei Monti del Drago, a ponente della via del Valico ---
  { const g = grotta({ id: 'barbarossa', nome: 'MINIERA DI BARBAROSSA', y: 52, musica: 'grotta:cristalli', raggio: 190, centro: [4860, 1000], buia: 1, rami: [
      [[5046, 1000, 13], [4972, 1000, 13], [4880, 1000, 14], [4790, 1000, 36]],
      [[4790, 1000, 36], [4700, 1000, 14], [4610, 1004, 14], [4540, 1010, 28]],
      [[4790, 1000, 36], [4780, 920, 13], [4760, 850, 24]],
      [[4790, 1000, 36], [4800, 1085, 13], [4850, 1150, 22]]] });
    // i puntelli lungo la galleria maestra (due ritti e un traverso), e le lanterne dei nani
    W.builders.puntello = (b, gy) => { const n0 = W.mesh.length, y = gy(b.x, b.z), hw = b.w / 2, [px, pz] = b.asse === 'x' ? [0, 1] : [1, 0];
      for (const s of [-1, 1]) K.box(b.x + px * hw * s - 0.8, b.z + pz * hw * s - 0.8, b.x + px * hw * s + 0.8, b.z + pz * hw * s + 0.8, y - 1.5, y + b.h, 3);
      K.box(b.x - (px ? hw + 1.4 : 0.9), b.z - (pz ? hw + 1.4 : 0.9), b.x + (px ? hw + 1.4 : 0.9), b.z + (pz ? hw + 1.4 : 0.9), y + b.h, y + b.h + 1.5, 3);
      for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] *= b.buio === undefined ? 0.4 : b.buio; };
    for (const x of [4950, 4915, 4880, 4845, 4720, 4680, 4640, 4600]) W.BUILD.push({ k: 'puntello', x, z: x < 4700 ? 1002 : 1000, w: 19, h: 9.5, asse: 'x' });
    W.BUILD.push({ k: 'puntello', x: 4980, z: 1000, w: 24, h: 11, asse: 'x', buio: 0.85 });   // il portale all'imbocco
    const lant = (x, z) => W.PROPS.push(['lantern', x, z, { glow: [5, 10, 1, 0.8, 0.45, 1], lit: 1.15, dentro: 1 }]);
    for (const [x, z] of [[4935, 992], [4862, 1008], [4812, 978], [4770, 1024], [4762, 978], [4700, 992], [4630, 1010], [4556, 996], [4530, 1022], [4776, 900], [4752, 856], [4806, 1090], [4846, 1140]]) lant(x, z);
    W.PROPS.push(['cart', 4902, 1004, { lit: 0.6, dentro: 1 }], ['cart', 4662, 1006, { lit: 0.6, dentro: 1 }], ['crate', 4808, 1022, { lit: 0.6, dentro: 1 }], ['crate', 4814, 1028, { lit: 0.6, dentro: 1 }], ['barrel', 4772, 976, { lit: 0.6, dentro: 1 }],
      ['anvil', 4768, 862], ['campfire', 4754, 846, { dentro: 1, glow: [3, 12, 1, 0.6, 0.25, 1] }], ['keg', 4744, 858, { lit: 0.6, dentro: 1 }], ['table', 4772, 842, { lit: 0.6, dentro: 1 }], ['stool', 4778, 848, { lit: 0.6, dentro: 1 }],
      ['crate', 4842, 1152, { lit: 0.6, dentro: 1 }], ['crate', 4858, 1158, { lit: 0.6, dentro: 1 }], ['barrel', 4860, 1144, { lit: 0.6, dentro: 1 }], ['sack', 4850, 1162, { lit: 0.6, dentro: 1 }],
      ['crystal', 4528, 1000, lume(...GIA)], ['crystal', 4548, 1028, lume(...GIA)], ['crystal', 4522, 1016, { dentro: 1 }], ['rock', 4560, 1024, { lit: 0.46, dentro: 1 }], ['rock', 4712, 1010, { lit: 0.46, dentro: 1 }]);
    testo(4768, 862, ["L'INCUDINE DEI NANI. È PIÙ BASSA DI QUELLE DEGLI UOMINI, E SUONA UNA NOTA PIÙ GRAVE."]);
    // il campo dei nani davanti all'imbocco, sulla via del Valico
    W.FLAT.push([5078, 1000, 46, null]); W.CLEAR.push([5020, 950, 5130, 1052]);
    W.PROPS.push(['tent', 5090, 968], ['tent', 5104, 1030], ['campfire', 5082, 1002], ['cart', 5066, 1034], ['crate', 5058, 970], ['barrel', 5062, 976], ['anvil', 5074, 978], ['torch', 5040, 984], ['torch', 5040, 1016]);
    testo(5074, 978, ['UNA PICCOLA INCUDINE DA CAMPO. I NANI CI RADDRIZZANO I PICCONI.']);
    Object.assign(C.LOOKS, { nano2: Object.assign({}, C.LOOKS.nano, { beard: '#e8e0d0', shirt: '#3a5a7a', plate: '#a8a8b4' }), nano3: Object.assign({}, C.LOOKS.nano, { beard: '#3a2a1a', shirt: '#4a6a3a', helm: { c: '#b08a4a', nose: 1 } }),
      nana: { sc: 0.8, wide: 0.85, skin: '#e8b890', hairStyle: 'tails', hair: '#c8642a', shirt: '#7a3a2a', apron: '#4a4a52', belt: '#3a2a1a', pants: '#4a4a52', boots: '#3a2a1a' } });
    C.folk('nano', 'BARBAROSSA IL CAPOMASTRO', 5070, 1006, 0, ['IO SONO BARBAROSSA, E QUESTA È LA MIA MINIERA. SIAMO VENUTI DA FONDOFERRO PER MARE, CON I PICCONI IN SPALLA.', 'I MONTI DEL DRAGO SONO PIENI DI FERRO BUONO. ENTRA PURE, MA NON TOCCARE I PUNTELLI: REGGONO LA MONTAGNA.']);
    C.folk('nana', 'BRUNILDE', 5096, 994, Math.PI, ['CUCINO PER DODICI NANI. VUOL DIRE CUCINARE PER TRENTA UOMINI.', "IN FONDO ALLA GALLERIA MAESTRA C'È IL FILONE: LÌ LA ROCCIA LUCCICA D'ORO ANCHE SENZA LANTERNA."]);
    C.folk('nano2', 'IL VECCHIO DURIN', 4806, 986, 0, ['SCAVO DA DUECENTO ANNI. LA ROCCIA PARLA, A SAPERLA ASCOLTARE: QUESTA DICE CHE SOTTO CE NE È ANCORA.', 'A NORD, OLTRE IL VALICO, STA LA NOSTRA CITTÀ. LE PORTE SONO CHIUSE, MA A UN AMICO DEI NANI SI APRONO.']);
    C.folk('nano3', 'UN MINATORE', 4640, 994, 0, ['OCCHIO AI PIPISTRELLI NEL RAMO DI TRAMONTANA. NOI LI LASCIAMO STARE: MANGIANO LE ZANZARE.']);
    C.folk('nano', 'IL FABBRO DELLA MINIERA', 4760, 868, Math.PI / 2, ['QUI SOTTO IL FERRO SI BATTE APPENA CAVATO, ANCORA CALDO DI MONTAGNA.', "NEL MAGAZZINO, NEL RAMO DI MEZZOGIORNO, C'È UNA CASSA CHE NESSUNO HA RECLAMATO. SE TI SERVE UNA MAZZA, È TUA."]);
    W.CHESTS.push(['gv_g1a', 4852, 1158, 'mazza', 2], ['gv_g1b', 4536, 1012, 'monete:180', 1]);
    quieti.push([5078, 1000, 150], [4790, 1000, 120]);
    via(5, [[5144, 1010], [5100, 1002], [5046, 1000]]); }

  // --- 2. la Via Sepolta: il traforo che dalla gola del Valico porta nella Valle Nascosta ---
  { const g = grotta({ id: 'sepolta', nome: 'LA VIA SEPOLTA', segreta: 1, y: 168, musica: 'grotta:funghi', raggio: 330, centro: [4600, -862], rami: [
      [[5040, -850, 14], [4975, -850, 14], [4850, -852, 14, 2], [4720, -858, 15, 5], [4600, -862, 40, 7]],
      [[4600, -862, 40, 7], [4470, -868, 15, 9], [4350, -874, 15, 12], [4240, -880, 15, 14], [4150, -886, 17, 15], [4075, -890, 18, 15]],
      [[4600, -862, 40, 7], [4610, -770, 14, 7], [4650, -700, 26, 8]]] });
    arreda(g, { luci: [AZZ, VIO], passo: 34, pc: 0.42, pf: 0.2, accesi: 0.75 });
    W.PROPS.push(['crystal', 4588, -884, lume(...VIO, 1)], ['crystal', 4622, -838, lume(...AZZ, 1)], ['crystal', 4574, -846, lume(...AZZ)], ['crystal', 4660, -692, lume(...VIO, 1)]);
    W.CHESTS.push(['gv_g2a', 4654, -696, 'elisir', 2]);
    W.CAMPS.push([4600, -862, 'bat', 4, 34], [4350, -874, 'slimeB', 3, 14], [4640, -720, 'bat', 3, 22]);
    via(5, [[5170, -850], [5100, -850], [5040, -850]]);
    // la Valle Nascosta: chi esce dal traforo trova un lago, un cerchio di pietre e chi la custodisce
    via(5, [[4075, -890], [3900, -905], [3700, -900]]);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, x = Math.round(3790 + Math.cos(a) * 34), z = Math.round(-1010 + Math.sin(a) * 34); W.PROPS.push(['menhir', x, z]); testo(x, z, ['UNA PIETRA RITTA, PIÙ ANTICA DI SOLIS. I SEGNI INCISI SONO QUELLI DEGLI ELFI.']); }
    W.PROPS.push(['runa', 3790, -1010]); W.FLAT.push([3790, -1010, 52, null]); W.CLEAR.push([3740, -1060, 3840, -960]);
    for (const [x, z] of [[3700, -880], [3660, -850], [3730, -930], [3620, -1010], [3560, -1040], [3450, -1030], [3400, -860], [3470, -820], [3580, -810]]) W.PROPS.push(['flower', x, z], ['flower', x + 6, z + 4], ['fern', x - 5, z + 6]);
    C.folk('elfosaggio', 'LA VOCE DELLA VALLE', 3760, -960, 0, ['DA MILLE ANNI NESSUN UOMO ENTRAVA QUI. LA VIA ERA SEPOLTA, E NOI LA LASCIAVAMO DORMIRE.', "QUANDO SOLIS CADDE, GLI ULTIMI DEL SOLE SI NASCOSERO IN QUESTA VALLE. IL CERCHIO DI PIETRE È LA LORO TOMBA, E IL LORO SALUTO.", "SULLA RIVA DI PONENTE DEL LAGO C'È UN DONO PER CHI ARRIVA FIN QUI. PRENDILO: È TUO."]);
    C.folk('elfa', 'UNA PASTORA DI CERVI', 3640, -840, 1, ['I CERVI DELLA VALLE NON HANNO MAI VISTO UN CACCIATORE. NON INSEGNARGLI TU CHE COSA SIA.']);
    W.CHESTS.push(['gv_valle', 3352, -930, 'cuore', 2]); W.NOOKS.push([3352, -930, 'rocce', 0]);
    W.CAMPS.splice(0, W.CAMPS.length, ...W.CAMPS.filter(c => !(c[2] === 'icewolf' && Math.hypot(c[0] - 3520, c[1] + 760) < 60)));   // nella valle non ci sono più lupi
    quieti.push([3700, -930, 420]); }

  // --- 3. la Grotta della Cascata: sulla sponda di tramontana del Lago di Cristallo, la bocca è dietro l'acqua che cade ---
  { const g = grotta({ id: 'cascata', nome: 'GROTTA DELLA CASCATA', segreta: 1, y: 26, musica: 'grotta:mare', raggio: 150, centro: [4232, 1900], buia: 1, rami: [
      [[4230, 2052, 13], [4230, 2004, 13], [4230, 1950, 13, 1], [4232, 1890, 34, 2]],
      [[4232, 1890, 34, 2], [4170, 1850, 13, 3], [4120, 1800, 24, 4]],
      [[4232, 1890, 34, 2], [4300, 1850, 13, 3], [4350, 1810, 22, 4]]] });
    arreda(g, { luci: [AZZ, BIA], pc: 0.45, pf: 0.15, accesi: 0.7 });
    W.PROPS.push(['crystal', 4216, 1872, lume(...AZZ, 1)], ['crystal', 4252, 1904, lume(...BIA, 1)], ['crystal', 4112, 1796, lume(...AZZ, 1)], ['crystal', 4356, 1806, lume(...BIA, 1)]);
    // l'acqua: il ruscello scende dal monte, salta davanti alla bocca e va al lago. Si disegna da sé, non ferma nessuno
    const scorre = (f, fn) => { const n0 = W.mesh.length; fn(); for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] = 0.93 + 2 * f; };
    W.builders.ruscello = (b, gy) => scorre(b.f || 3, () => { const P = b.pts, hw = b.w / 2;
      for (let s = 0; s < P.length - 1; s++) { const [ax, az] = P[s], [bx, bz] = P[s + 1], Ln = Math.hypot(bx - ax, bz - az), n = Math.ceil(Ln / 5), ux = (bx - ax) / Ln, uz = (bz - az) / Ln, p = (x, z, sd) => { const qx = x - uz * hw * sd, qz = z + ux * hw * sd; return [qx, Math.max(b.alto ? W.ground(qx, qz, 1e9) : gy(qx, qz), b.min || -99) + 0.4, qz]; };
        for (let i = 0; i < n; i++) { const x0 = ax + (bx - ax) * i / n, z0 = az + (bz - az) * i / n, x1 = ax + (bx - ax) * (i + 1) / n, z1 = az + (bz - az) * (i + 1) / n; K.quad(p(x1, z1, 1), p(x1, z1, -1), p(x0, z0, -1), p(x0, z0, 1), TL.FALL, b.w / 8, Ln / n / 10); } } });
    W.builders.salto = (b, gy) => scorre(4, () => { const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2;
      K.quad([x0, b.yb, b.z], [x1, b.yb, b.z], [x1, b.yt, b.z], [x0, b.yt, b.z], TL.FALL, b.w / 8, (b.yt - b.yb) / 11);
      K.quad([x1, b.yb, b.z - 0.5], [x0, b.yb, b.z - 0.5], [x0, b.yt, b.z - 0.5], [x1, b.yt, b.z - 0.5], TL.FALL, b.w / 8, (b.yt - b.yb) / 11);
      K.quad([x0 + 2, b.yb, b.z + 0.8], [x1 - 3, b.yb, b.z + 0.8], [x1 - 3, b.yt - 1.5, b.z + 0.8], [x0 + 2, b.yt - 1.5, b.z + 0.8], TL.FALL, b.w * 0.7 / 8 + 0.31, (b.yt - b.yb) / 8); });
    W.BUILD.push({ k: 'ruscello', x: 4232, z: 1900, w: 12, alto: 1, pts: [[4250, 1790], [4244, 1836], [4238, 1900], [4232, 1960], [4230, 1998]] }, { k: 'salto', x: 4230, z: 2000, w: 24, yb: 25.5, yt: 47 },
      { k: 'ruscello', x: 4230, z: 2040, w: 14, min: 0.2, pts: [[4230, 2002], [4230, 2050], [4226, 2100]] });
    W.falls.push([4230, 26.5, 2003, 22, 1, 1.6]);
    W.CHESTS.push(['gv_g3a', 4116, 1798, 'talismano', 2], ['gv_g3b', 4352, 1808, 'monete:160', 1]);
    W.CAMPS.push([4232, 1890, 'bat', 3, 28], [4340, 1818, 'slimeB', 3, 16]);
    // il sentiero della sponda: dalla via del nord fino alla cascata, e avanti fino alla Forra del Drago
    via(5, [[5202, 2420], [4900, 2130], [4600, 2068], [4330, 2052], [4230, 2050]]); }

  // --- 4. la Grotta del Gelo: nella parete di levante della Valle Gelata ---
  { const g = grotta({ id: 'gelo', nome: 'GROTTA DEL GELO', segreta: 1, y: 100, musica: 'grotta:gelo', raggio: 150, centro: [1860, 890], rami: [
      [[1670, 900, 13], [1736, 900, 13], [1800, 900, 13], [1870, 896, 34]],
      [[1870, 896, 34], [1880, 820, 13], [1900, 760, 24]],
      [[1870, 896, 34], [1930, 930, 13], [1975, 975, 22]]] });
    arreda(g, { luci: [BIA, AZZ], cristallo: 'icecrystal', sasso: 'rocksnow', pc: 0.5, pf: 0, accesi: 0.65 });
    W.PROPS.push(['icecrystal', 1856, 874, lume(...BIA, 1)], ['icecrystal', 1888, 916, lume(...AZZ, 1)], ['icecrystal', 1906, 752, lume(...BIA, 1)], ['icecrystal', 1982, 980, lume(...AZZ, 1)], ['snowman', 1700, 884]);
    W.CHESTS.push(['gv_g4a', 1902, 756, 'pelliccia', 2], ['gv_g4b', 1978, 978, 'pozione:2', 1]);
    W.CAMPS.push([1870, 896, 'icebat', 4, 28], [1900, 770, 'iceskel', 2, 18], [1968, 968, 'icebat', 2, 16]);
    via(5, [[1470, 1150], [1560, 1000], [1670, 900]]); }

  // --- 5. il Pozzo della Luna: una dolina nel Bosco Antico. In mezzo alla rupe la volta è crollata, e sul fondo cresce un giardino ---
  { rupe(2760, 3180, 190, 170, 50, [2760, 3205, 46]);
    const g = grotta({ id: 'luna', nome: 'POZZO DELLA LUNA', y: 41, musica: 'grotta:funghi', raggio: 150, centro: [2760, 3210], roccia: [2760, 3180, 190, 170], prato: [2760, 3206, 46], rami: [
      [[2760, 3400, 13], [2760, 3345, 13], [2760, 3275, 13], [2760, 3208, 44]],
      [[2760, 3208, 44], [2838, 3186, 13], [2888, 3166, 22]],
      [[2760, 3208, 44], [2690, 3160, 13], [2650, 3120, 22]]] });
    arreda({ rami: g.rami.slice(1) }, { luci: [ARG, VER], pc: 0.25, pf: 0.5, lucciole: 1, accesi: 0.6 });
    // il giardino sul fondo: betulle, fiori, felci, e l'altare della luna in mezzo
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3, x = Math.round(2760 + Math.cos(a) * 16), z = Math.round(3206 + Math.sin(a) * 16); W.PROPS.push(['menhir', x, z, { dentro: 1, s: 0.3, r: 1.6 }]); testo(x, z, ['UNA PIETRA BIANCA, LISCIA COME UN OSSO. DI NOTTE RIFLETTE LA LUNA.']); }
    W.PROPS.push(['runa', 2760, 3206, { dentro: 1, glow: [3, 12, 0.8, 0.85, 1, 1] }]);
    for (const [x, z] of [[2736, 3184], [2786, 3188], [2734, 3232], [2790, 3230], [2760, 3170]]) W.PROPS.push(['birch', x, z, { dentro: 1 }]);
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, r = 8 + rnd() * 30; W.PROPS.push([rnd() < 0.6 ? 'flower' : 'fern', Math.round(2760 + Math.cos(a) * r), Math.round(3206 + Math.sin(a) * r), { dentro: 1, small: true }]); }
    C.folk('elfa', 'LA SACERDOTESSA DELLA LUNA', 2776, 3222, Math.PI, ['QUESTO È IL POZZO DELLA LUNA. LA VOLTA CADDE LA NOTTE IN CUI CADDE SOLIS, E DA ALLORA LA LUCE SCENDE FIN QUAGGIÙ.', "NEL RAMO DI LEVANTE CUSTODIAMO UN AMULETO. CHI ARRIVA FIN QUI SENZA SPEZZARE UN RAMO PUÒ PORTARLO CON SÉ."]);
    W.CHESTS.push(['gv_g5a', 2890, 3164, 'luna', 2], ['gv_g5b', 2648, 3118, 'monete:120', 1]);
    W.CAMPS.push([2660, 3128, 'slimeB', 3, 16]);
    quieti.push([2760, 3210, 110]);
    via(5, [[2612, 3408], [2700, 3424], [2760, 3400]]); }

  // --- 6. la Tana del Vecchio Grigio: nel Bosco Antico di ponente, la casa del lupo più vecchio di Lumen ---
  { rupe(1500, 2480, 190, 160, 52);
    const g = grotta({ id: 'grigio', nome: 'TANA DEL VECCHIO GRIGIO', y: 41, musica: 'grotta:funghi', raggio: 150, centro: [1560, 2480], roccia: [1500, 2480, 190, 160], rami: [
      [[1722, 2500, 13], [1668, 2500, 13], [1610, 2492, 13], [1556, 2480, 32]],
      [[1556, 2480, 32], [1544, 2420, 13], [1530, 2380, 22]],
      [[1556, 2480, 32], [1500, 2512, 13], [1452, 2540, 26]]] });
    arreda(g, { luci: [VER], pc: 0.08, pf: 0.3, accesi: 0.4 });
    for (const [x, z] of [[1600, 2486], [1566, 2466], [1540, 2496], [1470, 2530], [1444, 2552], [1462, 2548], [1438, 2534], [1528, 2386]]) W.PROPS.push(['bones', x, z, { lit: 0.5, dentro: 1 }]);
    W.CHESTS.push(['gv_g6a', 1440, 2544, 'mantello', 2], ['gv_g6b', 1528, 2376, 'monete:140', 1]);
    W.CAMPS.push([1556, 2480, 'wolf', 4, 30], [1458, 2538, 'grigio', 1, 14], [1700, 2560, 'wolf', 3, 60]);
    via(5, [[2196, 2685], [1950, 2590], [1722, 2500]]); }

  // --- 7. la Grotta delle Lucciole: una rupe muschiosa in mezzo alla Palude d'Ombra ---
  { rupe(1130, 5080, 180, 150, 46);
    const g = grotta({ id: 'lucciole', nome: 'GROTTA DELLE LUCCIOLE', y: 3.5, musica: 'grotta:funghi', raggio: 150, centro: [1180, 5080], roccia: [1130, 5080, 180, 150], rami: [
      [[1350, 5080, 13], [1296, 5080, 13], [1236, 5080, 13], [1180, 5080, 34]],
      [[1180, 5080, 34], [1160, 5010, 13], [1146, 4984, 22]],
      [[1180, 5080, 34], [1120, 5104, 13], [1076, 5116, 24]]] });
    arreda(g, { luci: [VER, GIA], pc: 0.08, pf: 0.62, lucciole: 1, accesi: 0.8, passo: 16 });
    W.PROPS.push(['mushroom', 1180, 5064, { lit: 1.15, dentro: 1, s: 0.9, glow: [5, 12, 0.45, 1, 0.5, 1] }], ['mushroom', 1070, 5122, { lit: 1.15, dentro: 1, s: 0.9, glow: [5, 12, 1, 0.85, 0.45, 1] }]);
    W.CHESTS.push(['gv_g7a', 1072, 5114, 'trifoglio', 2], ['gv_g7b', 1144, 4982, 'pozione:2', 1]);
    W.CAMPS.push([1180, 5080, 'slime', 4, 28], [1150, 4992, 'plant', 2, 14], [1084, 5112, 'slime2', 2, 16]);
    via(5, [[1500, 4900], [1420, 5010], [1350, 5080]]); }

  // --- 8. la Grotta delle Maree: sotto lo scoglio della costa di mezzogiorno, ci si entra dalla spiaggia ---
  { rupe(5940, 7110, 175, 120, 30);
    const g = grotta({ id: 'maree', nome: 'GROTTA DELLE MAREE', segreta: 1, y: 5, musica: 'grotta:mare', raggio: 150, buia: 1, centro: [5936, 7090], roccia: [5940, 7110, 175, 120], rami: [
      [[5940, 7240, 14], [5940, 7200, 14], [5940, 7150, 14], [5936, 7082, 34]],
      [[5936, 7082, 34], [5862, 7052, 13], [5812, 7012, 22]],
      [[5936, 7082, 34], [6008, 7042, 13], [6050, 6994, 22]]] });
    arreda(g, { luci: [AZZ, VER], pc: 0.4, pf: 0.1, accesi: 0.7 });
    W.PROPS.push(['anchor', 5952, 7096, { lit: 0.6, dentro: 1 }], ['barrel', 5918, 7070, { lit: 0.6, dentro: 1 }], ['barrel', 5924, 7064, { lit: 0.6, dentro: 1 }], ['crate', 6046, 7000, { lit: 0.6, dentro: 1 }], ['crate', 6056, 6992, { lit: 0.6, dentro: 1 }], ['keg', 6040, 6988, { lit: 0.6, dentro: 1 }],
      ['crystal', 5924, 7098, lume(...AZZ, 1)], ['crystal', 5806, 7006, lume(...VER, 1)], ['crystal', 6058, 7002, lume(...AZZ, 1)], ['boat', 5900, 7236], ['torch', 5929, 7226], ['torch', 5951, 7226]);
    W.CHESTS.push(['gv_g8a', 5808, 7010, 'madreperla', 2], ['gv_g8b', 6052, 6990, 'monete:220', 1]);
    W.CAMPS.push([5936, 7082, 'crab', 4, 28], [5820, 7020, 'crab', 2, 16], [6046, 7000, 'bandit', 2, 16]);
    via(5, [[5600, 7000], [5700, 7150], [5810, 7226], [5930, 7240]]); }

  // --- 9. la Cisterna di Solis: sotto il colle a tramontana delle rovine, dove la città teneva l'acqua ---
  { rupe(6520, 2560, 185, 165, 48);
    const g = grotta({ id: 'cisterna', nome: 'CISTERNA DI SOLIS', segreta: 1, y: 35.5, musica: 'grotta:cristalli', raggio: 150, centro: [6520, 2580], roccia: [6520, 2560, 185, 165], rami: [
      [[6520, 2772, 13], [6520, 2716, 13], [6520, 2650, 14], [6520, 2580, 40]],
      [[6520, 2580, 40], [6450, 2540, 13], [6410, 2500, 22]],
      [[6520, 2580, 40], [6590, 2540, 13], [6630, 2500, 22]],
      [[6520, 2580, 40], [6520, 2500, 13], [6520, 2452, 20]]] });
    arreda({ rami: g.rami.slice(1) }, { luci: [GIA], pc: 0.2, pf: 0.1, accesi: 0.7 });
    // le colonne della sala (due file), i vasi, la luce dorata
    for (const [dx, dz] of [[-18, -18], [18, -18], [-18, 12], [18, 12], [-18, 40], [18, 40]]) { const x = 6520 + dx, z = 2580 + dz - 10; W.PROPS.push(['menhir', x, z, { lit: 0.6, dentro: 1 }]); testo(x, z, ['UNA COLONNA DELLA CISTERNA. IL SOLE DI SOLIS È ANCORA INCISO SUL CAPITELLO.']); }
    W.PROPS.push(['crystal', 6540, 2546, lume(...GIA, 1)], ['crystal', 6498, 2600, lume(...GIA)], ['crystal', 6542, 2600, lume(...GIA)], ['jar', 6504, 2562, { lit: 0.6, dentro: 1 }], ['jar', 6538, 2566, { lit: 0.6, dentro: 1 }], ['pot', 6412, 2504, { lit: 0.6, dentro: 1 }], ['pot', 6628, 2504, { lit: 0.6, dentro: 1 }],
      ['crystal', 6506, 2442, lume(...GIA, 1)], ['bones', 6512, 2462, { lit: 0.5, dentro: 1 }], ['bones', 6406, 2494, { lit: 0.5, dentro: 1 }]);
    W.CHESTS.push(['gv_g9a', 6520, 2450, 'anelloForza', 2], ['gv_g9b', 6408, 2498, 'monete:200', 1], ['gv_g9c', 6632, 2498, 'pozione:3', 1]);
    W.CAMPS.push([6520, 2580, 'skel', 4, 30], [6520, 2462, 'mummy', 2, 14], [6626, 2506, 'skel', 2, 14]);
    via(5, [[6528, 2900], [6520, 2772]]); }

  // --- 10. la Forra del Drago: una gola a cielo aperto che dalla sponda del lago sale alla conca dove giacciono le Ossa del Drago ---
  W.CARVE.push({ pts: [[3850, 2010, 22, 0.4], [3850, 1880, 58, 0.4], [3846, 1760, 96, 0.4], [3840, 1650, 132, 0.4], [3832, 1560, 162, 0.45], [3825, 1480, 183, 0.6]], w: 40, w2: 190 });
  W.FLAT.push([3815, 1405, 70, 184]); W.CLEAR.push([3750, 1340, 3880, 1470]);
  W.PLACES.push([3846, 1760, 130, 'FORRA DEL DRAGO'], [3815, 1405, 90, 'LE OSSA DEL DRAGO', 1]);
  via(5, [[4230, 2050], [4050, 2050], [3900, 2040], [3850, 2010], [3850, 1880], [3846, 1760], [3840, 1650], [3832, 1560], [3822, 1460]]);
  for (const [x, z, s] of [[3790, 1380, 5], [3806, 1366, 6], [3824, 1360, 6], [3842, 1368, 5], [3856, 1384, 4.4], [3800, 1420, 3.6], [3846, 1424, 3.6]]) W.PROPS.push(['bones', x, z, { s: s * 0.3, r: 4 }]);
  for (const [x, z] of [[3770, 1410], [3866, 1412], [3818, 1340]]) { W.PROPS.push(['menhir', x, z]); testo(x, z, ['SULLA PIETRA, IN LETTERE DI SOLIS: «QUI CADDE IL PRIMO DRAGO. NON ERA IL NEMICO».']); }
  W.CHESTS.push(['gv_ossa', 3818, 1392, 'scaglie', 2]);
  W.CAMPS.push([3846, 1760, 'wolf', 3, 60], [3838, 1600, 'bat', 3, 50]);


  // ================= I LUOGHI LUNGO LE VIE =================
  // La regola è di densità: lungo una strada, ogni venti o trenta secondi di cammino c'è qualcosa da guardare, da prendere o qualcuno con cui parlare.
  const P = (...a) => W.PROPS.push(...a);
  const SEGRETI = ['I SETTE FRATELLI', 'LA TORRE SPEZZATA', 'LA VEDETTA CADUTA', 'IL TEMPIO AFFONDATO'];
  const sito = (x, z, r, nome) => { W.FLAT.push([x, z, r, null]); W.CLEAR.push([x - r, z - r, x + r, z + r]); if (nome) W.PLACES.push([x, z, r + 30, nome, SEGRETI.includes(nome) ? 1 : 0]); quieti.push([x, z, r + 160]); };
  const casa = (x, z, o) => W.BUILD.push(Object.assign({ k: 'house', x, z, w: 20, d: 16, h: 11, wall: 1, roof: 4, door: 's', chim: true }, o));
  const gente = (x, z, lista) => lista.forEach(([look, n, dx, dz, yaw, righe, extra]) => C.folk(look, n, x + dx, z + dz, yaw, righe, extra));
  const cartello = (x, z, ...righe) => { P(['sign', x, z]); testo(x, z, righe); };
  const tesoro = (id, x, z, stile, loot, r, ang) => { W.NOOKS.push([x, z, stile, ang === undefined ? 0 : ang]); W.CHESTS.push(['gv_' + id, x, z, loot, r || 1]); };
  Object.assign(C.LOOKS, {
    pastore: { walk: 1, skin: '#d8a07a', hat: '#8a6a3a', hairStyle: 'short', hair: '#6a4a2a', beard: '#6a4a2a', shirt: '#e8dcc0', cape: '#7a5a34', pants: '#6a5a3a', boots: '#3a2a1a', staff: '#7a5230' },
    cacciatore: { skin: '#d8a07a', cap: '#5a3a1a', feather: '#c8342c', beard: '#4a3020', shirt: '#6a5a2a', quiver: '#6a4a2a', belt: '#3a2a1a', pants: '#4a3a2a', boots: '#3a2a1a', weapon: { kind: 'bow', col: '#8a6a3a' } },
    vecchia: { skin: '#d8c0a8', hood: '#3a2a4a', robe: '#4a3a5a', shirt: '#6a5a7a', pants: '#3a2a4a', boots: '#2a1a2a', staff: '#5a4a2a', orb: '#7af08a' },
    muratore: { skin: '#d8a07a', hat: '#c8a040', beard: '#5a3a1a', shirt: '#b8b0a0', apron: '#6a5a4a', pants: '#4a4a52', boots: '#3a2a1a', weapon: { kind: 'hammer', col: '#6a6e78' } },
    contadino: { walk: 1, skin: '#d8a07a', hat: '#d8b44a', hairStyle: 'short', hair: '#5a3a1a', shirt: '#4a7ab0', pants: '#6a5a3a', boots: '#3a2a1a' } });
  // una fattoria: casa, fienile, pozzo, carro, balle di fieno, lo spaventapasseri e il campo
  const fattoria = (x, z, nome, [muro, tetto, coltura], lista) => { sito(x, z, 64, nome);
    casa(x - 18, z - 20, { w: 24, d: 16, h: 12, wall: muro, roof: tetto }); casa(x + 28, z - 8, { w: 16, d: 22, h: 10, wall: 3, roof: tetto, door: 'w', chim: false });
    P(['well', x + 2, z + 10], ['cart', x + 30, z + 24], ['haybale', x - 36, z + 12], ['haybale', x - 42, z + 17], ['haybale', x - 37, z + 23], ['barrel', x - 2, z - 9], ['crate', x + 12, z - 4], ['bench', x - 22, z - 8], ['dummy', x - 8, z + 50]);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) P([coltura || 'tuftgold', x - 32 + i * 8, z + 38 + j * 7, { small: true }]);
    gente(x, z, lista); };
  // una torre di vedetta: la torre col fuoco in cima, due torce, lo stendardo e chi fa la guardia
  const torre = (x, z, nome, o, lista) => { sito(x, z, 42, nome); W.BUILD.push(Object.assign({ k: 'tower', x, z, r: 9, h: 44, wall: 9, roof: 5 }, o));
    P(['torch', x - 13, z + 15], ['torch', x + 13, z + 15], ['crate', x + 15, z + 3], ['barrel', x - 16, z + 2], ['banner', x + 20, z + 18]); gente(x, z, lista); };
  // un campo: tende attorno a un fuoco
  const campo = (x, z, nome, tende, lista, r) => { sito(x, z, r || 38, nome); for (const [dx, dz] of tende) P(['tent', x + dx, z + dz]); P(['campfire', x, z]); gente(x, z, lista); };

  // --- la via del nord: dal Borgo al Valico dei Giganti ---
  sito(4284, 4378, 50, 'MULINO DEL BORGO'); casa(4290, 4366, { w: 28, d: 18, h: 15, wall: 2, roof: 5, door: 'w' }); casa(4270, 4408, { w: 14, d: 12, h: 9, wall: 3, roof: 5, door: 'n', chim: false });
  P(['sack', 4262, 4372], ['sack', 4258, 4378], ['sack', 4264, 4380], ['cart', 4252, 4392], ['barrel', 4268, 4354], ['crate', 4262, 4350], ['bench', 4256, 4362]);
  gente(4284, 4378, [['ostessa', 'LA MUGNAIA', -34, -4, Math.PI, ['IL FIUME GIRA LA MACINA GIORNO E NOTTE. IO GIRO SOLO DI GIORNO, PER FORTUNA.', 'SE RISALI IL FIUME ARRIVI AL LAGO DI CRISTALLO. SULLA SPONDA DI TRAMONTANA, DICONO, UNA CASCATA NASCONDE UNA GROTTA.']],
    ['bimbo', 'IL GARZONE DEL MULINO', -40, 16, 0, ['PORTO I SACCHI AL BORGO COL CARRETTO. DUE VIAGGI AL GIORNO, TRE QUANDO PIOVE FARINA!'], { walk: 1 }]]);
  via(5, [[4120, 4350], [4200, 4370], [4246, 4376]]);
  fattoria(4790, 3440, 'CASCINA DEL NOCE', [1, 4, 'tuftgold'], [['contadino', 'IL FATTORE DEL NOCE', -6, 0, Math.PI / 2, ['IL NOCE DAVANTI A CASA LO PIANTÒ MIO BISNONNO. FA OMBRA A TUTTA LA CASCINA.', "A PONENTE C'È IL GUADO DI PIETRE PER L'ISOLA DEL LAGO. I PESCATORI TI DICONO DOVE METTERE I PIEDI."]],
    ['donna', 'LA FATTORA', 14, 8, Math.PI, ['LATTE, UOVA E PANE: QUI NON MANCA NIENTE. MANCA SOLO CHI SI FERMI A FARE DUE CHIACCHIERE.']]]);
  P(['oakbig', 4836, 3406]); via(5, [[4708, 3372], [4760, 3420]]);
  torre(5010, 2712, 'TORRE DEL LAGO', {}, [['guardia', 'LA SENTINELLA DEL LAGO', 4, 22, Math.PI / 2, ['DA QUASSÙ SI VEDE TUTTO IL LAGO DI CRISTALLO, E NELLE GIORNATE LIMPIDE ANCHE LA NEVE DEL PICCO DEL DRAGO.', 'UN SENTIERO SEGUE LA SPONDA DI TRAMONTANA FINO A UNA CASCATA. PIÙ IN LÀ COMINCIA LA FORRA DEL DRAGO: IO NON CI SONO MAI SALITO.']]]);
  sito(5300, 1880, 34, 'ALTARE DEI MONTI'); P(['statue', 5300, 1870], ['torch', 5288, 1878], ['torch', 5312, 1878], ['bench', 5282, 1896], ['flower', 5296, 1884], ['flower', 5304, 1886], ['flower', 5300, 1890]);
  testo(5300, 1870, ["UN VIANDANTE DI PIETRA, CON IL BASTONE E LA BISACCIA. AI SUOI PIEDI QUALCUNO LASCIA SEMPRE UN FIORE.", "SUL BASAMENTO: «CHI SALE AL VALICO LASCI QUI LA FRETTA»."]);
  gente(5300, 1880, [['monaco', 'UN PELLEGRINO', 14, 12, Math.PI, ['MI FERMO A OGNI ALTARE DA QUI AL VALICO. LE GAMBE RINGRAZIANO PIÙ DELLO SPIRITO.', 'PIÙ SU, A PONENTE DELLA VIA, I NANI HANNO APERTO UNA MINIERA. SI SENTONO I PICCONI FIN DA QUI.']]]);
  torre(5262, 430, 'TORRE DEL VALICO', { wall: 10, h: 48 }, [['guardia', 'LA GUARDIA DEL VALICO', 4, 22, Math.PI / 2, ['DA QUI IN SU LA GOLA SI STRINGE TRA PARETI CHE NESSUNO HA MAI SCALATO. LA VIA SALE FINO ALLA PORTA DEI GIGANTI.', 'TIENI GLI OCCHI APERTI: NELLA GOLA SCENDONO I LUPI DEI GHIACCI.']],
    ['lanciere', 'IL LANCIERE DI MONTAGNA', -20, 20, 0, ['DICONO CHE NELLA PARETE DI PONENTE, PIÙ SU, CI SIA UNA VIA SEPOLTA. IO HO VISTO SOLO DUE TORCE SPENTE E UN BUCO NERO.']]]);
  // la Porta dei Giganti: in cima al Valico due colossi di pietra, e la frana che chiude la via per i Monti del Cielo
  sito(5200, -1900, 70, 'PORTA DEI GIGANTI'); P(['statue', 5140, -1905, { s: 0.85, r: 9 }], ['statue', 5262, -1905, { s: 0.85, r: 9 }]);
  testo(5140, -1905, ['UN GIGANTE DI PIETRA, ALTO COME UNA TORRE. HA IL VISO CONSUMATO DAL VENTO E LO SGUARDO RIVOLTO A NORD.']); testo(5262, -1905, ['IL SECONDO GIGANTE. TRA I DUE PASSAVA LA VIA PER I MONTI DEL CIELO, PRIMA DELLA FRANA.']);
  for (let i = 0; i < 15; i++) P(['rocksnow', 5104 + i * 13, -1972 + Math.round(Math.sin(i * 1.9) * 7), { s: 0.95, r: 7 }], ['rocksnow', 5110 + i * 13, -1992 + Math.round(Math.cos(i * 1.3) * 6), { s: 0.8, r: 6 }]);
  cartello(5222, -1930, 'OLTRE LA FRANA: I MONTI DEL CIELO.', 'LA VIA È CHIUSA. SI RIAPRIRÀ QUANDO IL VIAGGIO COMINCERÀ.');
  campo(5158, -1830, null, [[-16, -12]], [['montanaro', 'LA SENTINELLA DEI GIGANTI', 10, 6, 0, ['LA FRANA È VENUTA GIÙ QUEST\'INVERNO. DALL\'ALTRA PARTE CI SONO MARMOREA E LE CITTÀ DEI MONTI: LE ABBIAMO SENTITE CHIAMARE COI CORNI.', 'I NANI DICONO DI POTERLA SGOMBERARE IN UNA STAGIONE. I NANI DICONO TANTE COSE.']]], 30);
  tesoro('n1', 5278, -1850, 'neve', 'monete:200', 1, Math.PI);

  // --- la via maestra, tra il Borgo e la Rocca ---
  sito(4990, 4928, 44, 'CROCICCHIO DEL CARRETTIERE'); W.BUILD.push({ k: 'stall', x: 4990, z: 4910, w: 14, d: 9, h: 8, cloth: 13 });
  P(['cart', 4962, 4930], ['cart', 5020, 4936], ['barrel', 5004, 4914], ['crate', 4976, 4912], ['bench', 4990, 4946], ['well', 5022, 4904], ['lamp', 4966, 4950], ['lamp', 5014, 4950]);
  gente(4990, 4928, [['mercante', 'IL MERCANTE DEL CROCICCHIO', 0, -6, Math.PI / 2, ['A METÀ STRADA TRA IL BORGO E LA ROCCA: IL POSTO GIUSTO PER VENDERE ACQUA AI CARRETTIERI E CHIACCHIERE AI VIANDANTI.', 'A MEZZOGIORNO DI QUI CI SONO I CAMPI DORATI, CON LA CASCINA E IL MULINO A VENTO. A TRAMONTANA, I GIRASOLI.']],
    ['borghese', 'UN CARRETTIERE', -24, 10, 0, ['HO UNA RUOTA CHE CIGOLA DA TRE GIORNI. LA RUOTA STA BENE: SONO IO CHE NON LA SOPPORTO PIÙ.'], { walk: 1 }]]);
  fattoria(5150, 5350, 'CASCINA DORATA', [16, 6, 'tuftgold'], [['contadino', 'IL FATTORE DEI CAMPI DORATI', -6, 0, Math.PI / 2, ['QUI IL GRANO VIENE ALTO COME UN UOMO. LO PORTIAMO AL MULINO A VENTO, LÌ A LEVANTE, E POI ALLA ROCCA.', "DI NOTTE LE MELME VENGONO A MANGIARE LE SPIGHE. SE NE VEDI UNA, FALLE CAPIRE CHE NON È ARIA."]],
    ['fioraia', 'LA FIGLIA DEL FATTORE', 16, 10, Math.PI, ['DA GRANDE VADO A VIVERE ALLA ROCCA. O AL BORGO. O DOVUNQUE NON CI SIA DA MIETERE.'], { walk: 1 }], ['bimbo', 'IL PICCOLO ELIA', -30, 30, 0, ['LO SPAVENTAPASSERI SI CHIAMA ARTURO. DI NOTTE, SECONDO ME, SI MUOVE.'], { walk: 1 }]]);
  via(5, [[5100, 4968], [5120, 5150], [5140, 5290]]);
  sito(5440, 5290, 40, 'MULINO DEI CAMPI DORATI'); W.BUILD.push({ k: 'special', sk: 'mill', x: 5440, z: 5282, w: 20, d: 20, style: 'lumen', o: { roof: 4 } });
  P(['sack', 5420, 5300], ['sack', 5416, 5306], ['cart', 5464, 5308], ['haybale', 5468, 5290]);
  gente(5440, 5290, [['borghese', 'IL MUGNAIO DEL VENTO', -8, 22, Math.PI / 2, ['QUANDO TIRA IL VENTO DEL MARE LE PALE GIRANO DA SOLE E IO DORMO. QUANDO NON TIRA, GIRO IO.', 'DA LASSÙ, DALLA FINESTRA IN CIMA, SI VEDE IL CRATERE DEL MONTE BRACE. È SPENTO DA SECOLI: CI HANNO FATTO IL NIDO LE ANATRE.']]]);
  via(5, [[5200, 5340], [5320, 5320], [5412, 5300]]);

  // --- verso il Ponte dei Re: la torre di levante e il cantiere ---
  torre(6800, 4050, 'TORRE DI LEVANTE', { roof: 4 }, [['guardia', 'LA SENTINELLA DI LEVANTE', 4, 22, Math.PI / 2, ["GUARDO IL MARE D'ORIENTE. DALL'ALTRA PARTE C'È UNA TERRA DI VENTO E DI SABBIA: UN GIORNO IL PONTE CI ARRIVERÀ.", 'IL CANTIERE È IN FONDO ALLA VIA. SE CERCHI LAVORO, CHIEDI AL CAPOMASTRO; SE CERCHI GUAI, CHIEDI AI GABBIANI.']]]);
  sito(7545, 3790, 70, 'CANTIERE DEL PONTE DEI RE'); W.FLAT.push([7600, 3790, 46, 14]);
  TN.addBridge({ axis: 'x', a0: 7610, a1: 7800, c: 3790, y: 14, towers: false, ramps: false });
  W.BUILD.push({ k: 'tower', x: 7606, z: 3764, r: 6, h: 34, wall: 9, roof: 5 }, { k: 'tower', x: 7606, z: 3816, r: 6, h: 34, wall: 9, roof: 5 });
  P(['tent', 7520, 3750], ['tent', 7478, 3884], ['campfire', 7506, 3864], ['cart', 7556, 3760], ['cart', 7570, 3826], ['crate', 7548, 3838], ['crate', 7554, 3844], ['crate', 7542, 3846], ['barrel', 7580, 3756], ['barrel', 7586, 3750], ['rack', 7534, 3742], ['anvil', 7512, 3800],
    ['crate', 7786, 3784], ['crate', 7790, 3796], ['barrel', 7794, 3788], ['banner', 7598, 3836]);
  testo(7512, 3800, ["L'INCUDINE DEL CANTIERE. CI SI RADDRIZZANO I FERRI DEGLI SCALPELLINI."]);
  cartello(7772, 3782, 'IL PONTE DEI RE FINISCE QUI, PER ORA.', "QUANDO SARÀ FINITO UNIRÀ LUMEN ALL'ORIENTE: MILLE PASSI SOPRA IL MARE.");
  gente(7545, 3790, [['muratore', 'IL CAPOMASTRO DEL PONTE', -6, -26, Math.PI / 2, ['UN ARCO AL MESE, SE IL MARE CE LO LASCIA FARE. A QUESTO PASSO I MIEI NIPOTI VEDRANNO LA FINE.', 'SALI PURE FINO IN FONDO: DA LÌ, NELLE GIORNATE LIMPIDE, SI VEDE GIÀ LA COSTA DI LÀ.']],
    ['muratore', 'UNO SCALPELLINO', -44, -12, 0, ["OGNI PIETRA DEL PONTE PORTA IL SEGNO DI CHI L'HA TAGLIATA. LA MIA È UNA STELLA A CINQUE PUNTE."], { walk: 1 }],
    ['nano', 'UN MASTRO NANO', 26, 30, Math.PI, ['IL RE CI HA CHIAMATI PER LE FONDAMENTA. GLI UOMINI COSTRUISCONO BENE IN ALTO; SOTTO IL PELO DELL\'ACQUA, PERÒ, CI VOGLIONO I NANI.']],
    ['guardia', 'LA GUARDIA DEL CANTIERE', 40, -30, Math.PI / 2, ['DI NOTTE QUALCUNO RUBA LE CORDE. IO DICO I PREDONI DEL MONTE BRACE, IL CAPOMASTRO DICE I GABBIANI.']]]);
  via(9, [[7560, 3790], [7612, 3790]]);

  // --- verso Solis e Girasole ---
  sito(6344, 3586, 30, 'FONTE DEI GIRASOLI'); P(['well', 6344, 3582], ['bench', 6330, 3596], ['bench', 6358, 3596]);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; P(['girasole', Math.round(6344 + Math.cos(a) * 20), Math.round(3582 + Math.sin(a) * 18), { small: true }]); }
  gente(6344, 3586, [['monaco', 'IL FRATE DELLA FONTE', 16, 6, Math.PI, ["L'ACQUA DELLA FONTE VIENE DA SOTTO LE ROVINE. I RE DI SOLIS LA RACCOGLIEVANO IN UNA GRANDE CISTERNA, SOTTO IL COLLE A TRAMONTANA.", 'BEVI, RIPOSA. LE ROVINE NON SCAPPANO: STANNO LÌ DA MILLE ANNI.']]]);
  fattoria(5800, 3660, 'LA VIGNA DI SOLIS', [2, 5, 'bushred'], [['contadino', 'IL VIGNAIOLO', -6, 0, Math.PI / 2, ['QUESTE VITI VENGONO DA TRALCI DI SOLIS. IL VINO È DOLCE COME IL SOLE CHE LE HA CRESCIUTE.', 'A LEVANTE, OLTRE LE ROVINE, UN SENTIERO SALE ALLE RUPI DEL GRIFONE. LASSÙ IN CIMA, DICONO, IL GRIFONE HA LASCIATO IL SUO TESORO.']],
    ['mercantessa', 'LA VIGNAIOLA', 14, 8, Math.PI, ['A SETTEMBRE VENGONO A VENDEMMIARE DA GIRASOLE E PERFINO DALLA ROCCA. E POI SI BALLA.']]]);
  via(5, [[5810, 3544], [5800, 3610]]);
  // la Vedetta Caduta, sul sentiero del Grifone: quel che resta di una torre di Solis
  sito(6965, 2415, 34, 'LA VEDETTA CADUTA'); for (const [dx, dz, w, d, h, g2] of [[0, -20, 44, 6, 12], [-22, 0, 6, 40, 9], [22, 0, 6, 40, 14], [0, 20, 44, 6, 7, 1]]) W.BUILD.push({ k: 'ruin', x: 6965 + dx, z: 2415 + dz, w, d, h, wall: 10, gate: !!g2 });
  W.CHESTS.push(['gv_vedetta', 6965, 2410, 'lancia', 2]); W.CAMPS.push([6965, 2470, 'skel', 3, 50]);

  // --- il Bosco Antico ---
  campo(3090, 4190, 'CAPANNA DEL BOSCAIOLO', [], [['boscaiolo', 'IL VECCHIO BOSCAIOLO', 10, 10, Math.PI, ['TAGLIO SOLO GLI ALBERI CHE GLI ELFI SEGNANO COL NASTRO BIANCO. È IL PATTO, E IL BOSCO LO RICORDA MEGLIO DI ME.', "PIÙ AVANTI, A DESTRA DEL SENTIERO, C'È UNA RUPE CON UN BUCO IN CIMA: GLI ELFI LO CHIAMANO IL POZZO DELLA LUNA."]]], 44);
  casa(3080, 4170, { w: 18, d: 14, h: 10, wall: 3, roof: 6 }); P(['crate', 3110, 4176], ['crate', 3116, 4182], ['barrel', 3066, 4190], ['haybale', 3112, 4200], ['bench', 3078, 4198]);
  via(5, [[3180, 4134], [3120, 4180]]);
  sito(2110, 2290, 40, 'I SETTE FRATELLI'); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU - 0.4, x = Math.round(2110 + Math.cos(a) * 24), z = Math.round(2290 + Math.sin(a) * 24); P(['menhir', x, z]); testo(x, z, ['UNO DEI SETTE FRATELLI. GLI ELFI DICONO CHE FURONO SETTE CACCIATORI, FERMATI DAL BOSCO PRIMA DELL\'ULTIMO COLPO.']); }
  P(['runa', 2110, 2290]); W.CHESTS.push(['gv_fratelli', 2110, 2298, 'cappuccio', 2]);
  sito(1700, 1800, 36, 'LA TORRE SPEZZATA'); for (const [dx, dz, w, d, h, g2] of [[0, -22, 48, 6, 16], [-24, 0, 6, 44, 12], [24, 0, 6, 44, 8], [0, 22, 48, 6, 6, 1]]) W.BUILD.push({ k: 'ruin', x: 1700 + dx, z: 1800 + dz, w, d, h, wall: 9, gate: !!g2 });
  W.CHESTS.push(['gv_spezzata', 1700, 1794, 'brocchiere', 2]); W.CAMPS.push([1700, 1860, 'skel', 3, 50]);
  campo(1640, 1396, 'CAPANNO DEL CACCIATORE', [[-14, -12]], [['cacciatore', 'IL CACCIATORE DELLA VALLE', 10, 6, Math.PI, ['CACCIO LEPRI DI NEVE, MAI I LUPI: I LUPI DEI GHIACCI CACCIANO IN BRANCO, E IO SONO DA SOLO.', "NELLA PARETE DI LEVANTE DELLA VALLE GELATA C'È UNA GROTTA DOVE IL GHIACCIO NON SI SCIOGLIE NEMMENO D'ESTATE. DENTRO FA LUCE DA SOLO."]]], 30);
  P(['rack', 1658, 1384]);

  // --- a mezzogiorno del Borgo: lo stagno, la torre, la cascina del fiume, la costa ---
  sito(3650, 5560, 30, 'STAGNO DEL SALICE'); P(['willow', 3640, 5530], ['willow', 3668, 5590], ['bench', 3654, 5552], ['boat', 3618, 5566], ['reeds', 3612, 5540, { small: true }], ['reeds', 3608, 5588, { small: true }], ['reeds', 3620, 5600, { small: true }]);
  gente(3650, 5560, [['traghettatore', 'IL PESCATORE DELLO STAGNO', -6, 6, Math.PI, ["C'È UNA CARPA, QUI SOTTO, PIÙ VECCHIA DI ME. CI CONOSCIAMO DA QUARANT'ANNI E NON MI HA MAI DATO SODDISFAZIONE."]]]);
  via(5, [[3822, 5550], [3740, 5556], [3672, 5560]]);
  tesoro('stagno', 3470, 5520, 'cespugli', 'pozione:2', 1, Math.PI);
  torre(3440, 6312, 'TORRE DI MEZZOGIORNO', { wall: 9, roof: 6 }, [['guardia', 'LA SENTINELLA DI MEZZOGIORNO', 4, 22, Math.PI / 2, ["DA QUI SI VEDONO LE VELE CHE NON ARRIVANO PIÙ. L'APPRODO DEL FARO ASPETTA UN MOLO NUOVO DA DIECI ANNI.", 'A PONENTE, LUNGO LA COSTA, LA SABBIA DIVENTA FANGO: È LA PALUDE D\'OMBRA. NON CI PORTO NEANCHE IL CANE.']]]);
  fattoria(4150, 6000, 'CASCINA DEL FIUME', [0, 4, 'tuftgold'], [['contadino', 'IL FATTORE DEL FIUME', -6, 0, Math.PI / 2, ["IL FIUME CI DÀ L'ACQUA PER I CAMPI E OGNI TANTO SE LI RIPRENDE. SIAMO PARI.", 'IL BARCAIOLO DEL BORGO DICE CHE UN GIORNO SCENDERÀ FIN QUI IN BARCA. IO GLI TENGO UN POSTO AL TAVOLO DA TRE ANNI.']],
    ['pastore', 'IL PASTORE DEL FIUME', 30, 44, 0, ['LE PECORE BEVONO AL FIUME E IO CONTO LE NUVOLE. UN MESTIERE COME UN ALTRO.'], { walk: 1 }]]);
  via(5, [[3700, 5900], [3950, 5962], [4096, 5992]]);
  sito(3480, 7215, 46, 'BARACCHE DEI PESCATORI'); casa(3460, 7200, { w: 16, d: 12, h: 9, wall: 3, roof: 6, chim: false }); casa(3500, 7196, { w: 14, d: 12, h: 9, wall: 3, roof: 5, chim: true });
  P(['boat', 3470, 7240], ['boat', 3492, 7246], ['rack', 3448, 7226], ['rack', 3514, 7222], ['barrel', 3482, 7208], ['anchor', 3506, 7236], ['crate', 3440, 7212]);
  gente(3480, 7215, [['traghettatore', 'IL VECCHIO DELLE BARACCHE', 0, 8, Math.PI / 2, ['CON LA BASSA MAREA, A LEVANTE, OLTRE LA CALA, SI SCOPRE UNO SCOGLIO CON UNA BOCCA NERA. NOI CI PASSIAMO AL LARGO.', 'CI ABITANO I GRANCHI, E QUALCUNO CHE NON VUOLE FARSI TROVARE.']],
    ['pescivendola', 'LA PESCATRICE DELLE BARACCHE', 22, 14, Math.PI, ['SARDE, ACCIUGHE E QUALCHE POLPO. IL MARE DI MEZZOGIORNO È GENEROSO CON CHI SI ALZA PRESTO.'], { walk: 1 }]]);
  via(5, [[3470, 7092], [3478, 7176]]);
  sito(5250, 7185, 44, 'LE SALINE'); W.PAVE.push(['b', 'disc', 5226, 7180, 15], ['b', 'disc', 5262, 7172, 13], ['b', 'disc', 5252, 7206, 14], ['b', 'disc', 5286, 7198, 11]);
  P(['sack', 5236, 7158], ['sack', 5242, 7154], ['sack', 5230, 7154], ['cart', 5270, 7150], ['barrel', 5218, 7160]);
  gente(5250, 7185, [['borghese', 'IL SALINARO', -10, -22, Math.PI / 2, ["IL MARE ENTRA NELLE VASCHE, IL SOLE SE LO BEVE E A NOI RESTA IL SALE. IL LAVORO LO FANNO LORO: IO RACCOLGO.", 'A LEVANTE LA STRADA SALE VERSO IL MONTE BRACE. PRIMA, PERÒ, UN VIOTTOLO SCENDE ALLA SPIAGGIA DELLO SCOGLIO.']]]);
  via(5, [[5250, 7070], [5252, 7140]]);
  torre(6070, 6770, 'TORRE DELLA COSTA', { roof: 4 }, [['guardia', 'LA SENTINELLA DELLA COSTA', 4, 22, Math.PI / 2, ['LO SCOGLIO DELLE MAREE È LAGGIÙ, A PONENTE. CI VANNO I CONTRABBANDIERI: IO FACCIO FINTA DI NON VEDERLI, LORO FANNO FINTA DI NON ESSERCI.', 'A TRAMONTANA IL MONTE BRACE. IN CIMA, NEL CRATERE, UN FRATE HA FATTO IL SUO ROMITORIO.']]]);
  via(5, [[6020, 6700], [6056, 6742]]);

  // --- il Monte Brace: il romitorio e il lago nel cratere ---
  sito(6440, 5735, 34, 'ROMITORIO DEL BRACE'); casa(6436, 5722, { w: 16, d: 12, h: 9, wall: 2, roof: 6 }); P(['bench', 6446, 5744], ['pot', 6426, 5740], ['pot', 6452, 5732], ['torch', 6462, 5746]);
  gente(6440, 5735, [['monaco', 'IL ROMITO DEL BRACE', 6, 14, Math.PI / 2, ['QUESTO MONTE SPUTAVA FUOCO QUANDO SOLIS ERA GIOVANE. ORA NEL CRATERE C\'È UN LAGO, E NEL LAGO IL CIELO.', "SCENDI PURE ALLA RIVA. SULLA SPONDA DI MEZZOGIORNO QUALCUNO, TANTO TEMPO FA, HA LASCIATO UN'OFFERTA."]]]);
  via(5, [[6500, 5760], [6528, 5850], [6520, 5906]]); W.PLACES.push([6509, 5972, 100, 'LAGO DEL CRATERE']);
  tesoro('cratere', 6509, 6042, 'solis', 'anello2', 2, -Math.PI / 2);

  // --- a ponente: i pascoli, Pratolungo, la Palude d'Ombra ---
  campo(3350, 5140, 'PASCOLO DEL BORGO', [[-16, -10]], [['pastore', 'IL PASTORE', 10, 4, Math.PI, ['PORTO LE PECORE DAL BORGO A PRATOLUNGO E RITORNO. LORO LA STRADA LA SANNO: SONO IO CHE LE SEGUO.', 'SE VAI A PONENTE, OLTRE PRATOLUNGO, FERMATI DALLA VECCHIA DELLA PALUDE. FA PAURA SOLO A GUARDARLA: POI TI OFFRE LA ZUPPA.'], { walk: 1 }]], 34);
  sito(1790, 4830, 40, 'CASA DELLA VECCHIA'); casa(1790, 4816, { w: 18, d: 14, h: 11, wall: 3, roof: 6 }); P(['cauldron', 1806, 4838], ['campfire', 1806, 4846], ['pot', 1772, 4834], ['pot', 1778, 4840], ['mushroom', 1762, 4826, { small: true }], ['mushroom', 1814, 4822, { small: true }], ['lantern', 1774, 4828], ['lantern', 1808, 4828]);
  gente(1790, 4830, [['vecchia', 'LA VECCHIA DELLA PALUDE', 6, 12, Math.PI / 2, ['NON SONO UNA STREGA. LE STREGHE HANNO IL GATTO: IO HO SOLO LE RANE.', 'A LIBECCIO, IN MEZZO AL FANGO, UNA RUPE BRILLA DI NOTTE: SONO LE LUCCIOLE DELLA GROTTA. PIÙ GIÙ ANCORA STA IL TEMPIO AFFONDATO, E LÌ NON BRILLA NIENTE.', 'SE CI VAI, CAMMINA DOVE CRESCONO LE CANNE: SOTTO C\'È TERRA.']]]);
  via(5, [[1800, 4942], [1794, 4870]]);
  sito(1000, 5650, 44, 'IL TEMPIO AFFONDATO'); for (const [dx, dz, w, d, h, g2] of [[0, -28, 60, 6, 12], [-30, 0, 6, 56, 8], [30, 0, 6, 56, 14], [0, 28, 60, 6, 6, 1]]) W.BUILD.push({ k: 'ruin', x: 1000 + dx, z: 5650 + dz, w, d, h, wall: 10, gate: !!g2 });
  for (const [dx, dz] of [[-14, -12], [14, -12], [-14, 10], [14, 10]]) { P(['menhir', 1000 + dx, 5650 + dz]); testo(1000 + dx, 5650 + dz, ["UNA COLONNA SPROFONDATA FINO A METÀ. IL FANGO HA CANCELLATO OGNI SCRITTA TRANNE UNA PAROLA: «SOLE»."]); }
  W.CHESTS.push(['gv_affondato', 1000, 5644, 'giaco', 2]); W.CAMPS.push([1000, 5700, 'wraith', 2, 40]);

  // --- il Lago di Cristallo e il Colle dei Re ---
  sito(4412, 3116, 30, 'APPRODO DEL LAGO'); casa(4424, 3104, { w: 14, d: 12, h: 9, wall: 3, roof: 5, chim: false }); P(['boat', 4392, 3090], ['rack', 4402, 3126], ['barrel', 4434, 3120]);
  gente(4412, 3116, [['traghettatore', 'IL PESCATORE DEL LAGO', -4, 8, Math.PI, ["LE PIETRE DEL GUADO LE HANNO MESSE I RE DI SOLIS. PORTANO ALL'ISOLA, E SULL'ISOLA C'È IL SANTUARIO DEL LAGO.", "DI NOTTE L'ACQUA È LIMPIDA COME DI GIORNO. PER QUESTO LO CHIAMANO DI CRISTALLO."]]]);
  sito(7150, 4900, 50, 'IL COLLE DEI RE'); for (let i = 0; i < 4; i++) for (const dz of [-14, 14]) { const x = 7120 + i * 20, z = 4900 + dz; P(['tomb', x, z, { s: 0.6, r: 2.4 }]); }
  P(['statue', 7150, 4862], ['torch', 7136, 4866], ['torch', 7164, 4866], ['flower', 7146, 4872], ['flower', 7154, 4874]);
  testo(7150, 4862, ['RE AURELIO IL FONDATORE VEGLIA SULLE TOMBE DEI SUOI FIGLI.', 'SUL BASAMENTO: «OTTO RE DORMONO QUI. IL NONO REGNA».']);
  gente(7150, 4900, [['monaco', 'IL CUSTODE DELLE TOMBE', 30, 4, Math.PI, ['OTTO RE DI LUMEN RIPOSANO SU QUESTO COLLE, CON IL VISO VERSO IL MARE. RE ALDRIC VIENE QUI OGNI PRIMAVERA, DA SOLO.', "I RE DI SOLIS, INVECE, NESSUNO SA DOVE SIANO SEPOLTI. C'È CHI DICE IN UNA VALLE TRA I MONTI, CHE NON SI TROVA."]]]);
  via(5, [[6734, 4750], [6950, 4812], [7104, 4888]]); tesoro('re', 7230, 4940, 'solis', 'monete:250', 1, 0);

  // --- i cartelli ai bivi ---
  cartello(3962, 4800, 'NORD: PONTE DI PIETRA, LAGO DI CRISTALLO, VALICO DEI GIGANTI.', 'PONENTE: TANA DEL TASSO, BOSCO ANTICO.');
  cartello(4398, 3972, 'NORD: LAGO DI CRISTALLO, GIRASOLE, VALICO DEI GIGANTI.', 'SUD: BORGO AURORA.');
  cartello(4542, 3606, "PONENTE: IL GUADO PER L'ISOLA DEL LAGO.", 'NORD: GIRASOLE, VALICO DEI GIGANTI.');
  cartello(4972, 3034, 'LEVANTE: GIRASOLE, ROVINE DI SOLIS, ROCCA DI LUMEN.', 'NORD: VALICO DEI GIGANTI. SUD: BORGO AURORA.');
  cartello(5222, 2412, 'PONENTE: SPONDA DEL LAGO, LA CASCATA, FORRA DEL DRAGO.', 'NORD: VALICO DEI GIGANTI.');
  cartello(5164, 1026, 'MINIERA DI BARBAROSSA.', 'CHI ENTRA, SALUTI. CHI TOCCA I PUNTELLI, CORRA.');
  cartello(6146, 3862, 'PONENTE: GIRASOLE. NORD: ROVINE DI SOLIS.', 'SUD: ROCCA DI LUMEN.');
  cartello(6246, 4082, 'LEVANTE: PONTE DEI RE (IN COSTRUZIONE).', 'NORD: ROVINE DI SOLIS. SUD: ROCCA DI LUMEN.');
  cartello(3672, 4634, 'TANA DEL TASSO: A TRAMONTANA, TRA LE DUE TORCE.', 'DENTRO È BUIO. PORTA UNA LANTERNA, O TROVALA.');
  cartello(2366, 3014, 'PONENTE: VILLAGGIO DEGLI ELFI.', "NORD: L'ALBERO MADRE E IL SANTUARIO DEL BOSCO.");
  cartello(2212, 2664, 'NORD: VALLE GELATA.', 'PONENTE: IL SENTIERO DEL LUPO. CHI HA GIUDIZIO TORNA INDIETRO.');
  cartello(2626, 3396, 'POZZO DELLA LUNA: LEVANTE.', '(INCISO SOTTO, IN LETTERE ELFICHE: «ENTRA IN SILENZIO».)');
  cartello(3928, 5214, 'SUD: STAGNO DEL SALICE, TORRE DI MEZZOGIORNO, APPRODO DEL FARO.');
  cartello(3018, 6974, 'LEVANTE: BARACCHE DEI PESCATORI, CALA DELLE CONCHIGLIE.', 'NORD: BORGO AURORA.');
  cartello(5612, 7016, 'MEZZOGIORNO: LA SPIAGGIA E LO SCOGLIO DELLE MAREE.', 'LEVANTE: TORRE DELLA COSTA, MONTE BRACE.');
  cartello(3712, 5036, "PONENTE: PRATOLUNGO, PALUDE D'OMBRA.");
  cartello(1512, 4914, 'DA QUI IN POI È PALUDE.', 'GROTTA DELLE LUCCIOLE: A LIBECCIO, DOVE LA RUPE BRILLA.');
  cartello(6316, 5152, "MEZZOGIORNO: LA SALA D'ARMI, MONTE BRACE.");
  cartello(6748, 4764, 'LEVANTE: IL COLLE DEI RE.');
  cartello(5112, 4974, 'MEZZOGIORNO: CASCINA DORATA, MULINO DEI CAMPI DORATI.');

  // --- i forzieri nascosti lungo le vie e nei posti dove non passa nessuno ---
  for (const [id, x, z, stile, loot, ang] of [['p1', 4070, 4610, 'cespugli', 'pozione:2', 0], ['p2', 4640, 3350, 'cespugli', 'monete:60', Math.PI], ['p3', 5340, 2060, 'rocce', 'monete:90', 0], ['p4', 5196, 660, 'rocce', 'pozione:2', Math.PI], ['p5', 5296, -300, 'rocce', 'monete:150', 0],
    ['p6', 5130, -1500, 'rocce', 'elisir', Math.PI], ['p7', 5700, 4740, 'cespugli', 'monete:70', -1.57], ['p8', 4800, 5210, 'cespugli', 'pozione:1', 1.57], ['p9', 6900, 4210, 'solis', 'monete:110', 1.57], ['p10', 6050, 3200, 'solis', 'monete:80', Math.PI],
    ['p11', 2950, 3960, 'bosco', 'monete:60', 1.57], ['p12', 2250, 3360, 'bosco', 'pozione:2', 1.57], ['p13', 1790, 2250, 'bosco', 'monete:120', Math.PI], ['p14', 3350, 6050, 'cespugli', 'monete:70', Math.PI], ['p15', 5000, 7228, 'cespugli', 'pozione:2', 1.57],
    ['p16', 6600, 6300, 'solis', 'monete:130', 0], ['p17', 2700, 5250, 'cespugli', 'monete:60', 1.57], ['p18', 1400, 4400, 'palude', 'monete:140', 0], ['p19', 700, 5200, 'palude', 'elisir', 0], ['p20', 7350, 5300, 'solis', 'monete:160', 0],
    ['p21', 3000, 2300, 'bosco', 'monete:100', 0], ['p22', 1300, 3600, 'bosco', 'pozione:3', 0], ['p23', 3700, 7250, 'cespugli', 'monete:90', 1.57], ['p24', 4560, 6500, 'cespugli', 'monete:80', 0], ['p25', 5900, 5600, 'cespugli', 'pozione:2', 0]]) tesoro(id, x, z, stile, loot, 1, ang);
  // qualche branco in più dove ora c'è un motivo per andare
  W.CAMPS.push([3700, 7300, 'crab', 3, 50], [5080, 7260, 'crab', 3, 50], [7300, 5200, 'bandit', 3, 70], [1350, 4450, 'goblin', 3, 60]);

  // i luoghi piccoli vincono su quelli grandi che li contengono (la Porta dei Giganti dentro il Valico)
  W.PLACES.sort((a, b) => a[2] - b[2]);
  // nei luoghi abitati niente branchi: si tolgono quelli (di prima) che ci cadono dentro
  W.CAMPS.splice(0, W.CAMPS.length, ...W.CAMPS.filter(c => !vecchi.has(c) || !quieti.some(q => Math.hypot(c[0] - q[0], c[1] - q[1]) < q[2])));
  return { quieti, rnd, testo, rupe };
};
})();
