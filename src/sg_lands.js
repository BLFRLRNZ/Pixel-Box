// ===================== PIXEL SAGA · le terre nuove =====================
// Oltre lo Stretto dei Venti: il continente d'Oriente (savana, monti, bosco d'ambra, terre rosse, selva)
// e, a sud, le Colline dei Ciliegi e la Brughiera Nera. Qui stanno coste, regioni, strade, ponti, città,
// villaggi, luoghi da scoprire, tane e forzieri delle terre nuove — e la nuova Rocca di Lumen.
(() => {
const W = SG.world, B = W.B, TN = SG.town, TL = TN.TL, C = SG.city, K = W.kit, { quad, walls, box, boxTop, gable, onWall } = K;
const { tower, wallSeg, merl, merlBox, gate, decal, faceDecal, cone, oct, house, ship, dome, pyramid } = TN;

// ---------- terre e mari ----------
W.COASTS.push(
  // il continente d'Oriente
  [[4380, 1900], [4500, 1100], [4800, 560], [5400, 330], [6200, 380], [6900, 300], [7500, 520], [7880, 1050], [7950, 1800], [7820, 2600], [7920, 3400], [7780, 4200], [7900, 5000], [7750, 5800], [7450, 6500], [6900, 7100],
    [6200, 7500], [5500, 7650], [4900, 7400], [4550, 6900], [4540, 6400], [4700, 6150], [5150, 5900], [5350, 5400], [5100, 4900], [4650, 4500], [4480, 3900], [4700, 3300], [4600, 2700], [4380, 2100]],
  // le terre del sud
  [[700, 4950], [1500, 4650], [2400, 4720], [3200, 4600], [3850, 4900], [4080, 5600], [4200, 6300], [4180, 6500], [3700, 7200], [3000, 7650], [2000, 7800], [1100, 7500], [500, 6800], [350, 5900]]);
W.REG.push(
  [4850, 2000, 520, B.SAVANNA, 'PIANA DEI VENTI'], [5050, 2800, 420, B.SAVANNA, 'PIANA DEI VENTI'], [4900, 1200, 380, B.SAVANNA, 'PIANA DEI VENTI'],
  [5400, 700, 420, B.MOUNT, 'MONTI DI FERRO'], [6300, 650, 480, B.MOUNT, 'MONTI DI FERRO'], [7150, 800, 430, B.MOUNT, 'MONTI DI FERRO'],
  [6150, 1500, 330, B.SNOW, 'ALTOPIANO BIANCO'], [6900, 1500, 330, B.SNOW, 'ALTOPIANO BIANCO'],
  [5700, 3200, 520, B.AUTUMN, "BOSCO D'AMBRA"], [5600, 2400, 380, B.AUTUMN, "BOSCO D'AMBRA"], [6050, 3900, 380, B.AUTUMN, "BOSCO D'AMBRA"],
  [7100, 2900, 520, B.MESA, 'TERRE ROSSE'], [7350, 3800, 420, B.MESA, 'TERRE ROSSE'], [6600, 2300, 360, B.MESA, 'TERRE ROSSE'], [7150, 3080, 250, B.DESERT, 'TERRE ROSSE'],
  [7450, 2100, 330, B.DESERT, 'DUNE DEL SOLE'],
  [5850, 4700, 480, B.MEADOW, 'PIANA DI MEZZO'], [5300, 4300, 340, B.MEADOW, 'PIANA DI MEZZO'], [5950, 5150, 240, B.FARM, 'PIANA DI MEZZO'],
  [5600, 5450, 360, B.MEADOW, 'BAIA DI ZAFFIRO'],
  [6900, 5100, 540, B.JUNGLE, 'SELVA SMERALDO'], [6700, 6100, 500, B.JUNGLE, 'SELVA SMERALDO'], [7350, 5900, 380, B.JUNGLE, 'SELVA SMERALDO'],
  [5500, 6800, 480, B.SWAMP, 'DELTA DELLE NEBBIE'], [4950, 6550, 300, B.MEADOW, 'CAPO DELLE LANTERNE'], [3850, 6250, 300, B.MEADOW, 'CAPO DELLE LANTERNE'],
  [2300, 5350, 600, B.BLOSSOM, 'COLLINE DEI CILIEGI'], [1300, 5200, 420, B.BLOSSOM, 'COLLINE DEI CILIEGI'], [3300, 5300, 450, B.BLOSSOM, 'COLLINE DEI CILIEGI'],
  [1600, 6700, 600, B.MOOR, 'BRUGHIERA NERA'], [2800, 6900, 520, B.MOOR, 'BRUGHIERA NERA'], [900, 6100, 320, B.MOOR, 'BRUGHIERA NERA'],
  [3350, 6400, 280, B.MOUNT, 'DENTI DEL SUD']);
W.LAKES.push({ x: 2850, z: 4990, rx: 170, rz: 115, d: -10 }, { x: 6950, z: 5700, rx: 160, rz: 120, d: -9 }, { x: 6330, z: 4380, rx: 90, rz: 70, d: -6 });
W.PEAKS.push([6550, 560, 190, 280], [3350, 6420, 120, 200]);
W.RIVERS.push({ pts: [[5850, 1100], [5700, 1700], [5450, 2300], [5330, 2900], [5300, 3500], [5230, 4100], [5180, 4600], [5130, 4960]], w: 26 });
// ---------- strade ----------
W.ROADS.push(
  { w: 9, pts: [[4480, 2000], [4700, 2010], [5000, 2150], [5200, 2500], [5330, 2600]] }, { w: 9, pts: [[5450, 2600], [5490, 2900], [5505, 3200], [5530, 3320], [5552, 3320]] },
  { w: 8, pts: [[5000, 2150], [5300, 1950], [5500, 1830], [5600, 1800]] }, { w: 8, pts: [[5720, 1800], [5850, 1760], [6050, 1720], [6150, 1700], [6150, 1652]] },
  { w: 9, pts: [[5968, 3320], [6200, 3300], [6500, 3150], [6800, 3090], [6952, 3080]] },
  { w: 9, pts: [[5760, 3508], [5800, 3800], [5900, 4100], [5900, 4250]] }, { w: 9, pts: [[5900, 4410], [5850, 4800], [5680, 5080], [5565, 5180], [5560, 5222]] },
  { w: 9, pts: [[5560, 5578], [5540, 5700], [5480, 5860], [5200, 6150], [4900, 6380], [4620, 6400]] },
  { w: 8, pts: [[5788, 5400], [6100, 5420], [6500, 5480], [6740, 5500]] },
  { w: 8, pts: [[7150, 3258], [7200, 3600], [7250, 4100], [7100, 4600], [6900, 5000], [6800, 5380]] },
  { w: 9, pts: [[4120, 6400], [3900, 6300], [3600, 6000], [3200, 5700], [2800, 5480], [2500, 5350]] },
  { w: 8, pts: [[2300, 5170], [2100, 4980], [1800, 4860], [1630, 4800]] },
  { w: 8, pts: [[2300, 5530], [2250, 5900], [2100, 6400], [2010, 6850], [2000, 6940]] },
  { w: 8, pts: [[1450, 3600], [1445, 3650]] }, { w: 8, pts: [[1480, 3745], [1480, 3790], [1480, 3826]] }, { w: 7, pts: [[1612, 4797], [1572, 4780], [1534, 4746], [1512, 4708]] },
  { w: 7, hidden: true, pts: [[6150, 1350], [6300, 1100], [6480, 900], [6420, 980]] }, { w: 7, hidden: true, pts: [[7150, 2900], [7400, 2750], [7500, 2700]] },
  { w: 7, hidden: true, pts: [[3600, 6000], [3450, 6200], [3400, 6380]] });
// ---------- ponti ----------
TN.addBridge({ axis: 'x', a0: 3900, a1: 4472, c: 2000, y: 10, flag: 1, name: 'PONTE DEI RE' });
TN.addBridge({ axis: 'x', a0: 4130, a1: 4610, c: 6400, y: 10, flag: 2, roof: TL.ROOF_ORANGE, name: 'PONTE DELLE LANTERNE' });
TN.addBridge({ axis: 'x', a0: 5330, a1: 5450, c: 2600, y: 7, towers: false });
TN.addBridge({ axis: 'x', a0: 5600, a1: 5720, c: 1800, y: 7, towers: false });
// il vecchio guado tra il Borgo e la Rocca diventa un ponticello di pietra
TN.addBridge({ axis: 'x', a0: 2262, a1: 2374, c: 2704, y: 5.5, towers: false, ramps: false, lamp: false });
W.PLACES.push([4186, 2000, 300, 'PONTE DEI RE'], [4370, 6400, 250, 'PONTE DELLE LANTERNE']);

// ---------- la Rocca di Lumen: una città murata con il mastio del Re su una terrazza ----------
const RX = 2760, RZ = 2960;
C.city({ id: 'rocca', guild: true, name: 'ROCCA DI LUMEN', x: RX, z: RZ, w: 400, d: 360, style: 'lumen', gates: 'ws', y: 60, plaza: { dx: -95 }, reserve: [[12, -126, 200, 126]],
  specials: [['church', -128, 60, 30, 22, 'e', { m: 15 }]], board: [22, 20],
  shops: [['leone', 'locanda', 'LOCANDA DEL LEONE', 'n1', { fw: 34, fd: 22, h: 17, wall: 1, roof: 4 }], ['orafo', 'orafo', "L'OREFICERIA DELLA ROCCA", 'n2', { wall: 2, roof: 5 }],
    ['erbe', 'erboristeria', "L'ERBORISTERIA DELLA ROCCA", 'e1', { fw: 22, wall: 0, roof: 4 }], ['rocca_armi', 'armeria', "L'ARMERIA DEL RE", 'w1', { fw: 22, wall: 16, roof: 5 }]],
  people: [
    ['guardia', 'GUARDIA DELLA PORTA', ['BENVENUTO ALLA ROCCA DI LUMEN, LA CITTÀ DEL RE.', 'IL MASTIO È IN FONDO AL VIALE, SULLA TERRAZZA. NON SI PUÒ SBAGLIARE: È LA TORRE PIÙ ALTA DI TUTTA LUMEN.'], [-186, 16, 0]],
    ['guardia', 'GUARDIA DEL MASTIO', ['IL RE RICEVE NEL CORTILE. PARLA CON RISPETTO.', 'DALLA TORRE GRANDE, NELLE GIORNATE LIMPIDE, SI VEDE FINO AL PONTE DEI RE.'], [6, -16, Math.PI]],
    ['oste', 'OSTE DEL LEONE', ['BENVENUTO ALLA LOCANDA DEL LEONE!'], 'in:leone', { role: 'inn', cost: 10 }],
    ['guardia', 'IL VETERANO', ['IL MONTE BRACE, A SUD-EST, SCOTTA ANCHE DA LONTANO. MA A SUD DELLA ROCCA, TRA LE PRIME BRACI, QUALCUNO HA LASCIATO UN CUORE DI CRISTALLO.', 'IO NON CI TORNO. HO GIÀ DATO.'], 'in:leone:ospite1'],
    ['mercantessa', 'LA MERCANTESSA DI PASSAGGIO', ['VUOI UN CONSIGLIO? GUARDA LA BACHECA IN PIAZZA. CHI SBRIGA GLI INCARICHI DI UNA CITTÀ SI FA VOLERE BENE...', '...E AI BOTTEGAI DI QUELLA CITTÀ, CHI SI FA VOLERE BENE, STRAPPA SEMPRE UNO SCONTO.'], 'in:leone:ospite2'],
    ['borghese', 'MASTRO ORAFO', ['ANELLI, AMULETI, PIETRE CHE PORTANO FORTUNA. GUARDA PURE!'], 'in:orafo', { id: 'orafo', role: 'shop', shop: 'orafo' }],
    ['mercantessa', "L'ERBORISTA", ['ERBE DEI PRATI DI LUMEN, DISTILLATE CON CURA.'], 'in:erbe', { id: 'erborista', role: 'shop', shop: 'erbe' }],
    ['fabbro', "L'ARMAIOLO DEL RE", ['LE GUARDIE DEL MASTIO SI ARMANO QUI. SE HAI MONETE, ANCHE TU.'], 'in:rocca_armi', { role: 'shop', shop: 'rocca_armi' }],
    ['dama', 'DAMA ISOTTA', ['DA QUANDO IL RE È TORNATO, LA CITTÀ È RINATA. HAI VISTO QUANTE BANDIERE?', "DICONO CHE OLTRE IL PONTE DEI RE CI SIANO CITTÀ PIÙ GRANDI DELLA NOSTRA. IO NON CI CREDO."], 'p'],
    ['bimbo', 'PAGGIO TEO', ['DA GRANDE FARÒ LA GUARDIA DEL MASTIO!', 'IL CAPITANO ARDEA MI HA PROMESSO UNA SPADA DI LEGNO.'], 'p', { walk: 1 }],
    ['monaco', 'FRATE ANSELMO', ["LE VETRATE DELLA CAPPELLA RACCONTANO LA STORIA DELLE CINQUE PIETRE DELL'ALBA.", 'DI NOTTE, CON LE CANDELE ACCESE, SEMBRANO VIVE.'], [-104, 62, 0]],
    ['borghese', 'IL CARRETTIERE', ['PORTO IL GRANO DEI CAMPI DORATI FIN QUI OGNI MATTINA.', 'LA STRADA NUOVA PER IL PONTE PASSA DAL DESERTO: SEGUI I CARTELLI.'], 'd', { walk: 1 }],
    ['dama', 'LA FORNAIA', ["IL PANE DELLA ROCCA SI IMPASTA PRIMA DELL'ALBA. SE SENTI PROFUMO, SEGUI IL NASO."], 'd'],
    ['borghese', 'LO SCRIVANO', ['SONO IO CHE APPENDO GLI INCARICHI ALLA BACHECA. IL RE FIRMA, IO INCHIODO.', 'OGNI INCARICO SBRIGATO È UNO SCONTO IN PIÙ NELLE BOTTEGHE DELLA CITTÀ: PAROLA DI SCRIVANO.'], 'p'],
    ['guardia', 'LA RONDA', ["TUTTO TRANQUILLO IN PIAZZA. SE CERCHI UNA BOTTEGA, GUARDA LE INSEGNE: LA PORTA È LÌ SOTTO."], 'p'],
    ['bimbo', 'LA PICCOLA LIDIA', ['HO CONTATO LE INSEGNE DELLA PIAZZA: UN BOCCALE, UN ANELLO, UNA BOCCETTA E UNA SPADA. LA SPADA È LA PIÙ BELLA.'], 'p', { walk: 1 }],
    ['re', 'RE ALDRIC DI LUMEN', [], [50, -13, Math.PI], { id: 're' }],
  ],
  pre(P) {
    // la terrazza del mastio, più alta di 12, con la rampa davanti alla porta interna
    W.TERRA.push({ x0: RX + 22, z0: RZ - 118, x1: RX + 190, z1: RZ + 118, y: 72 }, { x0: RX - 6, z0: RZ - 12, x1: RX + 22, z1: RZ + 12, y: 60, y1: 72, mode: 'rampx' });
    W.PAVE.push(['g', 'rect', RX + 26, RZ - 44, RX + 66, RZ + 44], ['g', 'rect', RX - 10, RZ - 13, RX + 28, RZ + 13]);
    for (const [dx, dz] of [[30, -30], [30, 30], [56, -22], [56, 22]]) W.PROPS.push(['lamp', RX + dx, RZ + dz]);
    W.PROPS.push(['kingstatue', RX + 42, RZ - 62], ['statue', RX + 60, RZ - 24], ['statue', RX + 60, RZ + 24], ['oak', RX + 40, RZ + 70], ['oak', RX + 60, RZ + 88], ['birch', RX + 44, RZ - 92], ['pot', RX + 34, RZ - 10], ['pot', RX + 34, RZ + 10],
      ['target', RX + 60, RZ - 150], ['target', RX + 80, RZ - 150], ['target', RX + 100, RZ - 150], ['haybale', RX + 120, RZ - 150], ['haybale', RX + 126, RZ - 144], ['cart', RX + 100, RZ + 150]);
  },
  post(P, g, y, b) {
    const T = y + 12, S9 = 9, top = T + 18, RB = TL.ROOF_BLUE;
    // mura interne
    wallSeg(RX + 22, RZ - 118, RX + 190, RZ - 112, y - 6, top, S9, TL.MERL, b); wallSeg(RX + 22, RZ + 112, RX + 190, RZ + 118, y - 6, top, S9, TL.MERL, b); wallSeg(RX + 184, RZ - 118, RX + 190, RZ + 118, y - 6, top, S9, TL.MERL, b);
    wallSeg(RX + 22, RZ - 118, RX + 28, RZ - 15, y - 6, top, S9, TL.MERL, b); wallSeg(RX + 22, RZ + 15, RX + 28, RZ + 118, y - 6, top, S9, TL.MERL, b);
    for (const [dx, dz] of [[25, -115], [187, -115], [25, 115], [187, 115]]) tower(RX + dx, RZ + dz, 10, y - 6, top + 14, S9, { roof: RB, win: TL.WIN_ARCH, b, flag: 1 });
    gate(RX + 25, RZ, 'w', y - 6, T, 18, S9, TL.MERL, { hw: 8, tr: 8, th: 7, roof: RB, ban: TL.BAN_RED, crest: 1, b, flag: 1, up: 12 });
    // il mastio: corpo grande, avancorpo con il portone e il rosone, due ali, quattro torrette e la torre del Re
    const kx0 = RX + 82, kx1 = RX + 160, kz0 = RZ - 44, kz1 = RZ + 44, kt = T + 46;
    walls(kx0, kz0, kx1, kz1, T - 3, kt, S9); merlBox(kx0, kz0, kx1, kz1, kt, TL.MERL); boxTop(kx0, kz0, kx1, kz1, kt - 0.05, TL.PAVING);
    walls(kx0 + 5, kz0 + 5, kx1 - 5, kz1 - 5, kt, kt + 6, S9); gable(kx0 + 5, kz0 + 5, kx1 - 5, kz1 - 5, kt + 6, 26, RB, S9);
    for (const s of ['w', 'n', 's', 'e']) { const len = (s === 'n' || s === 's') ? kx1 - kx0 : kz1 - kz0, c = (s === 'n' || s === 's') ? (kx0 + kx1) / 2 : RZ;
      for (const off of [-0.38, -0.2, 0.2, 0.38]) { onWall(s, kx0, kz0, kx1, kz1, c + off * len, T + 10, 5, 13, TL.GLASS, true); onWall(s, kx0, kz0, kx1, kz1, c + off * len, T + 31, 4.5, 8, TL.WIN_ARCH, true); } }
    W.addBox(kx0, kz0, kx1, kz1, kt, b);
    const ax0 = RX + 60, az0 = RZ - 11, az1 = RZ + 11;
    walls(ax0, az0, kx0, az1, T - 3, T + 30, S9); gable(ax0, az0, kx0, az1, T + 30, 13, RB, S9); W.addBox(ax0, az0, kx0, az1, T + 30, b);
    onWall('w', ax0, az0, kx0, az1, RZ, T, 10, 14, TL.DOOR_BIG); onWall('w', ax0, az0, kx0, az1, RZ, T + 17.5, 8, 8, TL.ROSE, true);
    for (const s of [-1, 1]) { onWall('w', kx0, kz0, kx1, kz1, RZ + s * 21, T + 26, 5, 12, TL.BAN_RED); onWall('w', ax0, az0, kx0, az1, RZ + s * 7.6, T + 4, 3, 3, TL.CREST); }
    for (const s of [-1, 1]) { const wz0 = s < 0 ? RZ - 98 : RZ + 44, wz1 = s < 0 ? RZ - 44 : RZ + 98; walls(RX + 94, wz0, RX + 150, wz1, T - 3, T + 26, S9); gable(RX + 94, wz0, RX + 150, wz1, T + 26, 20, RB, S9); W.addBox(RX + 94, wz0, RX + 150, wz1, T + 26, b);
      for (const off of [-18, 0, 18]) { onWall('w', RX + 94, wz0, RX + 150, wz1, (wz0 + wz1) / 2 + off, T + 8, 4.5, 9, TL.GLASS, true); onWall('e', RX + 94, wz0, RX + 150, wz1, (wz0 + wz1) / 2 + off, T + 8, 4.5, 9, TL.WIN_ARCH, true); }
      onWall(s < 0 ? 'n' : 's', RX + 94, wz0, RX + 150, wz1, RX + 122, T + 8, 5, 12, TL.GLASS, true); }
    for (const [dx, dz, hh, fl] of [[82, -44, 66, 1], [82, 44, 66, 1], [160, -44, 74, 0], [160, 44, 74, 0]]) tower(RX + dx, RZ + dz, 8.5, T - 3, T + hh, S9, { roof: RB, rh: 20, win: TL.WIN_ARCH, b, flag: fl });
    // la torre del Re: si alza dal tetto fin sopra tutto, con una corona a metà e la fiamma in cima
    const dx = RX + 134, dz = RZ;
    oct(dx, dz, 14, kt, T + 118, S9); oct(dx, dz, 16.4, T + 92, T + 97, S9); for (let k = 0; k < 8; k++) { const a0 = (k - 0.5) / 8 * Math.PI * 2, a1 = (k + 0.5) / 8 * Math.PI * 2; merl(dx + Math.cos(a1) * 16.4, dz + Math.sin(a1) * 16.4, dx + Math.cos(a0) * 16.4, dz + Math.sin(a0) * 16.4, T + 97, TL.MERL); }
    oct(dx, dz, 15.4, T + 114, T + 118, S9); cone(dx, dz, 17.4, T + 117.8, 40, RB); box(dx - 0.5, dz - 0.5, dx + 0.5, dz + 0.5, T + 157, T + 164, TL.GOLD);
    for (const k of [0, 2, 4, 6]) { faceDecal(dx, dz, 14, k, T + 100, 4, 10, TL.GLASS, true); faceDecal(dx, dz, 14, k, T + 70, 4, 9, TL.WIN_ARCH, true); }
    for (const k of [1, 3, 5, 7]) faceDecal(dx, dz, 14, k, T + 76, 5, 12, TL.BAN_RED);
    W.flags.push([dx, T + 164, dz, 1]); W.glows.push([dx, T + 106, dz, 16, 1, 0.9, 0.6, 1]); W.lights.push({ x: dx, z: dz, y: T + 106, beacon: true });
  } });

// ---------- le città del continente e del sud ----------
C.city({ id: 'castelrosso', guild: true, name: 'CASTELROSSO', x: 5760, z: 3320, w: 420, d: 380, style: 'ambra', gates: 'wes',
  specials: [['hall', -30, -62, 34, 24, 's', { h: 17, wall: TL.TIMBER2, roof: 4 }], ['church', 34, -66, 22, 32, 's', { m: 15, wall: 2, roof: TL.ROOF_ORANGE }]], board: [22, -20],
  shops: [['ghianda', 'locanda', "LOCANDA DELLA GHIANDA D'ORO", 's1', { fw: 36, fd: 22, h: 17, wall: TL.TIMBER2, roof: TL.ROOF_ORANGE }], ['ambra_erbe', 'erboristeria', "L'ERBORISTERIA DELLE FOGLIE", 's2', { wall: 2, roof: TL.ROOF_DARK }],
    ['ambra_armi', 'armeria', "L'ARMERIA DI CASTELROSSO", 'w1', { fw: 22, wall: 3, roof: 4 }], ['ambra', 'sartoria', 'LA SARTORIA DELLA MERCIAIA', 'e1', { fw: 22, wall: TL.TIMBER2, roof: TL.ROOF_ORANGE }]],
  people: [
    ['borgomastro', 'BORGOMASTRO ULDERICO', [], [-30, -44, Math.PI / 2], { id: 'lead_ambra' }],
    ['ostessa', "OSTESSA DELLA GHIANDA", ["BENVENUTO ALLA GHIANDA D'ORO, VIAGGIATORE!"], 'in:ghianda', { role: 'inn', cost: 14 }],
    ['boscaiolo', 'IL TAGLIALEGNA STANCO', ["A NORD-EST DELLA CITTÀ, NEL FITTO DEL BOSCO D'AMBRA, HO VISTO UN FORZIERE TRA GLI ALBERI ROSSI. DENTRO C'ERA SETA, GIURO.", "NON L'HO PRESO: C'ERANO I LUPI. E IO HO SOLO UN'ASCIA E DUE GAMBE STANCHE."], 'in:ghianda:ospite1'],
    ['dama', 'LA VIANDANTE', ['ALTABRINA È A NORD, OLTRE IL PONTICELLO SUL FIUME. COPRITI BENE: LASSÙ I LUPI SONO BIANCHI, E PIÙ CATTIVI DEI NOSTRI.'], 'in:ghianda:ospite2'],
    ['mercantessa', 'LA MERCIAIA', ['STOFFE E MANTELLI CUCITI A CASTELROSSO, PUNTO DOPO PUNTO.'], 'in:ambra', { id: 'merciaia', role: 'shop', shop: 'ambra' }],
    ['fabbro', "L'ARMAIOLO", ['FERRO DEI MONTI E LEGNO DEL BOSCO. QUELLO CHE ESCE DA QUI NON SI SPEZZA.'], 'in:ambra_armi', { role: 'shop', shop: 'ambra_armi' }],
    ['monaco', "FRATE ERBOLARIO", ["FOGLIE D'AMBRA, RADICI, RUGIADA DEL MATTINO. E UN PO' DI PAZIENZA."], 'in:ambra_erbe', { role: 'shop', shop: 'ambra_erbe' }],
    ['boscaiolo', 'IL BOSCAIOLO', ["NEL BOSCO D'AMBRA È SEMPRE AUTUNNO. I VECCHI DICONO CHE GLI ALBERI RICORDINO UN TRAMONTO DI MILLE ANNI FA.", 'A NORD, DOVE IL FIUME SCENDE DAI MONTI, I LUPI SI SONO FATTI PIÙ GROSSI.'], 'd'],
    ['boscaiolo', 'IL CARBONAIO', ['LA STRADA A EST PORTA ALLE TERRE ROSSE E A ZAFIRA, LA CITTÀ DELLE CUPOLE.', "A SUD C'È PORTO SERENO. SE HAI MONETE, LÀ UNA NAVE TI PORTA DOVE VUOI."], 'd'],
    ['monaco', 'FRATE BENNO', ['IL CAMPANILE SUONA A OGNI TRAMONTO. LO SENTONO FINO AL PONTE SUL FIUME.'], [56, -46, Math.PI / 2]],
    ['bimbo', 'LA PICCOLA GRETA', ['IO LE FOGLIE ROSSE LE COLLEZIONO. NE HO GIÀ MILLE!', 'IL MULINO FUORI DALLE MURA FA UN RUMORE CHE SEMBRA UN DRAGO CHE RUSSA.'], 'p', { walk: 1 }],
    ['guardia', 'GUARDIA DI CASTELROSSO', ['CASTELROSSO, LA CITTÀ DELLE FOGLIE. COMPORTATI BENE E SARAI IL BENVENUTO.'], [-196, 16, 0]],
    ['borghese', 'IL MUGNAIO', ['IL GRANO ARRIVA DALLA PIANA DI MEZZO, LA FARINA TORNA INDIETRO. COSÌ GIRA IL MONDO.'], 'p', { walk: 1 }],
    ['boscaiolo', 'IL FALEGNAME', ["LE INSEGNE DELLE BOTTEGHE LE HO INTAGLIATE IO. QUELLA DELL'ARMERIA MI È VENUTA MEGLIO DELLE ALTRE."], 'd'],
    ['dama', 'LA FORNAIA', ['PANE DI CASTAGNE, ANCORA CALDO. I BOSCAIOLI NE PORTANO VIA TRE PAGNOTTE A TESTA.'], 'p'],
    ['borghese', 'IL BANDITORE', ['UDITE, UDITE! ALLA BACHECA DELLA PIAZZA IL BORGOMASTRO CERCA BRACCIA FORTI. SI PAGA IN MONETE SONANTI!'], 'p', { walk: 1 }],
  ] });
W.BUILD.push({ k: 'special', sk: 'mill', x: 5470, z: 3210, w: 20, d: 20, style: 'ambra' });
C.city({ id: 'altabrina', guild: true, name: 'ALTABRINA', x: 6150, z: 1500, w: 340, d: 300, style: 'nord', gates: 's', plaza: { w: 70, d: 64 },
  specials: [['big', 0, -84, 60, 34, 's', { h: 20, wall: TL.LOGS, roof: TL.ROOF_SNOW, steep: 0.8, dw: 9, dh: 12, dr: TL.DOOR_BIG, chim: true }]], board: [20, 16],
  shops: [['orso', 'locanda', "LOCANDA DELL'ORSO BIANCO", 's1', { fw: 32, fd: 21, h: 16, wall: TL.LOGS, roof: 5 }], ['nord_armi', 'fucina', 'LA FUCINA DEL NORD', 's2', { wall: 2, roof: TL.ROOF_SNOW }],
    ['nord', 'sartoria', 'PELLI E PELLICCE', 'w1', { fw: 22, wall: TL.LOGS, roof: TL.ROOF_SNOW }]],
  people: [
    ['thane', 'THANE BRUNILDE', [], [0, -58, Math.PI / 2], { id: 'lead_nord' }],
    ['oste', "OSTE DELL'ORSO", ["ENTRA, ENTRA! ALL'ORSO BIANCO IL FUOCO NON SI SPEGNE MAI."], 'in:orso', { role: 'inn', cost: 14 }],
    ['minatore', 'IL VECCHIO MINATORE', ['LA CIMA GRANDE SI SALE DAL SENTIERO DIETRO LA CITTÀ. LASSÙ, SOTTO LA NEVE, QUALCUNO HA LASCIATO UNA PELLICCIA CHE VALE UNA FORTUNA.'], 'in:orso:ospite1'],
    ['montanaro', 'LA GUIDA DEI MONTI', ["A EST, OLTRE L'ALTOPIANO BIANCO, TRA LE ROCCE INNEVATE BRILLA UN CUORE DI CRISTALLO. L'HO VISTO COL CANNOCCHIALE."], 'in:orso:ospite2'],
    ['montanaro', 'LA PELLICCIAIA', ['PELLICCE DEI MONTI DI FERRO: CON QUESTE IL GELO NON TI TROVA.'], 'in:nord', { id: 'pellicciaia', role: 'shop', shop: 'nord' }],
    ['minatore', 'IL MINATORE', ['SOTTO I MONTI DI FERRO CI SONO GALLERIE PIÙ LUNGHE DELLE STRADE DI SOPRA.', "IL FERRO DELLA SPADA DEL RE VIENE DA QUI. L'HA FORGIATA MIO NONNO."], 'd'],
    ['fabbro', 'IL FABBRO DEL NORD', ['QUI IL FERRO SI BATTE TRE VOLTE: UNA PER LA FORMA, UNA PER LA TEMPRA, UNA PER IL GELO.'], 'in:nord_armi', { role: 'shop', shop: 'nord_armi' }],
    ['montanaro', 'IL PASTORE', ['LE MIE CAPRE SENTONO LA NEVE DUE GIORNI PRIMA. E IO SENTO LE CAPRE.'], 'p', { walk: 1 }],
    ['bimbo', 'IL PICCOLO SVEN', ['HO FATTO UN PUPAZZO DI NEVE ALTO COME LA THANE! POI SI È SCIOLTO.'], 'p', { walk: 1 }],
    ['montanaro', 'LA TAGLIALEGNA', ["D'INVERNO LE CASE DI ALTABRINA SI STRINGONO UNA ALL'ALTRA COME LE CAPRE. COSÌ IL VENTO NON PASSA."], 'd', { walk: 1 }],
    ['minatore', 'IL CAPO DEI MINATORI', ["ALLA BACHECA C'È UNA TAGLIA SUL VECCHIO BIANCO. CI HO MESSO ANCH'IO DIECI MONETE: QUEL LUPO SI È MANGIATO IL MIO MULO."], 'p'],
    ['montanaro', 'NONNA GERDA', ["ALL'ORSO BIANCO FANNO UNA ZUPPA D'ORZO CHE RISVEGLIA I MORTI. E UN LETTO COSTA MENO DI UN PAIO DI GUANTI."], 'd'],
  ] });
C.city({ id: 'zafira', guild: true, name: 'ZAFIRA', x: 7150, z: 3080, w: 400, d: 360, style: 'sole', gates: 'ws', plaza: { w: 90, d: 80 },
  specials: [['palace', 138, 0, 64, 84, 'w'], ['pool', 68, 0, 30, 44], ['bazaar', -76, -72, 52, 44, 's']], board: [-22, 20],
  shops: [['bazar', 'emporio', 'IL GRAN BAZAR', 2], ['carovana', 'locanda', 'IL CARAVANSERRAGLIO', 's2', { fw: 36, fd: 24, h: 15, rt: 'flat', wall: TL.ADOBE, roof: TL.ADOBE, chim: false }],
    ['sole', 'armeria', 'LE LAME DI ZAFIRA', 'n2', { rt: 'flat', wall: TL.WHITE, roof: 10, chim: false }], ['spezie', 'erboristeria', 'LA SPEZIERIA', 'n1', { rt: 'dome', wall: TL.ADOBE, roof: TL.ADOBE, h: 12, chim: false }]],
  people: [
    ['emira', 'EMIRA SAHAR DI ZAFIRA', [], [98, 12, Math.PI], { id: 'lead_sole' }],
    ['oste', 'IL CAROVANIERE', ['RIPOSA AL CARAVANSERRAGLIO, STRANIERO. IL DESERTO NON PERDONA CHI È STANCO.'], 'in:carovana', { role: 'inn', cost: 16 }],
    ['mercante', 'IL CAMMELLIERE ASSETATO', ['NELLE DUNE DEL SOLE, A NORD-EST DELLA CITTÀ, IL VENTO HA SCOPERTO UN CUORE DI CRISTALLO.', 'IO HO VISTO SOLO IL LUCCICHIO. POI SONO ARRIVATE LE MUMMIE.'], 'in:carovana:ospite1'],
    ['donna', 'LA CERCATRICE', ['A SUD, TRA LE ROVINE DELLE TERRE ROSSE, DORME UN TURBANTE CHE FU DI UN PRINCIPE. GLI SCIACALLI GLI FANNO LA GUARDIA.'], 'in:carovana:ospite2'],
    ['mercante', "IL MERCANTE DI LAME", ["LAME CURVE, TEMPRATE NELLA SABBIA ROVENTE. NON NE TROVERAI DI UGUALI A OVEST DEL PONTE."], 'in:sole', { role: 'shop', shop: 'sole' }],
    ['donna', 'LA SPEZIALE', ['SPEZIE, UNGUENTI, ACQUA DI ROSE. E QUALCOSA DI PIÙ FORTE, PER CHI VIAGGIA.'], 'in:spezie', { id: 'speziale', role: 'shop', shop: 'spezie' }],
    ['mercante', 'IL SIGNORE DEL BAZAR', ['TUTTO QUELLO CHE BRILLA A ZAFIRA PASSA DA QUESTO BANCO. TOCCA PURE, MA CON GLI OCCHI.'], 'in:bazar', { role: 'shop', shop: 'bazar' }],
    ['lanciere', "GUARDIA DELL'EMIRA", ["ZAFIRA È SORTA ATTORNO ALL'ULTIMA SORGENTE DELLE TERRE ROSSE.", 'TRA GLI ALTOPIANI, A NORD-EST, UN SENTIERO NASCOSTO PORTA A UNA LAMA SEPOLTA DAL VENTO.'], [84, -14, Math.PI]],
    ['mercante', 'IL CAMMELLIERE', ['LE TERRE ROSSE SONO UN LABIRINTO DI GRADONI. SEGUI LA STRADA, O GLI SCHELETRI TI TROVERANNO PRIMA DI SERA.'], 'd', { walk: 1 }],
    ['donna', 'LA TESSITRICE', ['I TAPPETI DI ZAFIRA ARRIVANO FINO A PORTO SERENO, E DA LÌ PER MARE CHISSÀ DOVE.'], 'p'],
    ['bimbo', 'IL PICCOLO OMAR', ['DI NOTTE LA CUPOLA DEL PALAZZO BRILLA COME UNA SECONDA LUNA!'], 'p', { walk: 1 }],
    ['mercante', "IL VENDITORE D'ACQUA", ["UN SORSO DELLA SORGENTE? PER TE È GRATIS. LE COSE CHE COSTANO STANNO NEL BAZAR, SOTTO LA CUPOLA."], 'p', { walk: 1 }],
    ['donna', 'LA DANZATRICE', ['DI SERA, QUANDO SI ACCENDONO LE LANTERNE DELLE BOTTEGHE, LA PIAZZA DI ZAFIRA È IL POSTO PIÙ BELLO DEL MONDO.'], 'p'],
    ['lanciere', 'LA SENTINELLA DELLA PIAZZA', ["L'EMIRA HA FATTO APPENDERE UNA TAGLIA ALLA BACHECA: IL RE SCIACALLO. NESSUNO DI NOI È ANCORA TORNATO CON LA SUA PELLE."], 'd'],
  ] });
// Porto Sereno: affacciato sulla Baia di Zaffiro, con la banchina, i moli, le navi e il faro
const PX0 = 5410;
C.city({ id: 'porto', guild: true, name: 'PORTO SERENO', x: 5600, z: 5400, w: 380, d: 360, style: 'porto', gates: 'nes', noWall: 'w', y: 4.5, plaza: { dx: -40, w: 90, d: 80 },
  specials: [['big', -150, -92, 44, 26, 's', { h: 13, wall: 3, roof: TL.ROOF_ORANGE }], ['big', -150, 92, 44, 26, 'n', { h: 13, wall: 3, roof: 4 }], ['church', 30, -66, 22, 32, 's', { m: 15, wall: TL.WHITE, roof: TL.ROOF_ORANGE }]], board: [22, 20],
  shops: [['ancora', 'locanda', "LOCANDA DELL'ANCORA D'ORO", [-110, -55, 34, 22, 's'], { h: 17, wall: TL.WHITE, roof: TL.ROOF_ORANGE }], ['porto', 'emporio', "L'EMPORIO DELL'ARMATORE", 'n1', { wall: TL.OCHRE, roof: 4 }],
    ['pesce', 'pescheria', 'ZUPPE E RIMEDI DEL PORTO', 'n2', { wall: TL.WHITE, roof: TL.ROOF_ORANGE }]],
  people: [
    ['capitano', 'CAPITANO NEREO', [], [-170, -20, 0], { id: 'lead_porto' }],
    ['oste', "OSTE DELL'ANCORA", ["ALL'ANCORA D'ORO SI MANGIA IL PESCE PIÙ FRESCO DELLA BAIA."], 'in:ancora', { role: 'inn', cost: 14 }],
    ['marinaio', 'IL VECCHIO LUPO DI MARE', ["NELLA SELVA SMERALDO, A EST, PIÙ IN LÀ DEL TEMPIO DELLA LAGUNA, UN NOSTROMO PERSE IL SUO TRIDENTE. E ANCHE UNA GAMBA, MA QUELLA NON SERVE A NESSUNO."], 'in:ancora:ospite1'],
    ['pescivendola', 'LA PESCATRICE DI PERLE', ["NEL DELTA DELLE NEBBIE, A SUD, TRA LE ROVINE MEZZE SOMMERSE, C'È UNO SCUDO DI MADREPERLA GRANDE COME UNA PORTA."], 'in:ancora:ospite2'],
    ['pescivendola', 'LA PESCIVENDOLA', ['ZUPPA DI PESCE! RIMETTE IN PIEDI ANCHE UN ANNEGATO.'], 'in:pesce', { role: 'shop', shop: 'pesce' }],
    ['mercante', "L'ARMATORE", ["ROBA VENUTA DA OLTREMARE: NON CHIEDERMI COME L'HO AVUTA."], 'in:porto', { id: 'armatore', role: 'shop', shop: 'porto' }],
    ['traghettatore', 'IL NOSTROMO', [], [-205, 0, Math.PI], { id: 'ferry_porto', role: 'ferry', dock: 'porto' }],
    ['marinaio', 'IL MARINAIO', ['HO NAVIGATO FINO ALLE COLLINE DEI CILIEGI: LÀ I PETALI CADONO TUTTO L\'ANNO, COME LA NEVE.', "IL FARO DEL PORTO SI VEDE DA TRENTA MIGLIA. QUELLO VECCHIO, SULL'ISOLA DI LUMEN, DA DIECI."], 'p', { walk: 1 }],
    ['marinaio', 'IL PESCATORE DELLA BAIA', ['NELLA SELVA A EST DELLA CITTÀ, IN MEZZO A UNA LAGUNA, C\'È UN TEMPIO A GRADONI. NESSUNO SA CHI L\'HA COSTRUITO.'], 'd'],
    ['bimbo', 'IL MOZZO', ['UN GIORNO AVRÒ UNA NAVE TUTTA MIA, CON LE VELE ROSSE!'], 'p', { walk: 1 }],
    ['guardia', 'GUARDIA DEL PORTO', ['PORTO SERENO: DA QUI PARTONO LE NAVI PER TUTTO IL MONDO CONOSCIUTO.', "A SUD, OLTRE IL PONTE DELLE LANTERNE, COMINCIANO LE TERRE DEL SUD."], [-24, -166, Math.PI / 2]],
    ['marinaio', 'IL CALAFATO', ["OGNI NAVE CHE ATTRACCA PORTA QUALCOSA ALL'EMPORIO DELL'ARMATORE. E OGNI TANTO QUALCOSA SPARISCE DALLA STIVA, MA IO NON HO VISTO NIENTE."], 'd'],
    ['pescivendola', 'LA RETAIOLA', ["RAMMENDO RETI DA QUARANT'ANNI. LE CONCHIGLIE ROSA? IL MARE LE LASCIA SULLE SPIAGGE FUORI DAL PORTO, A NORD E A SUD."], 'p'],
    ['bimbo', 'LA PICCOLA MARINA', ['DALLA LOCANDA SI VEDONO PARTIRE LE NAVI. IO LE SALUTO TUTTE, UNA PER UNA.'], 'p', { walk: 1 }],
  ],
  pre(P) {
    // il bacino del porto scavato davanti alla banchina, tre moli, il molo del faro
    W.TERRA.push({ x0: 5150, z0: 5196, x1: PX0 - 4, z1: 5604, y: -10, mode: 'min' });
    for (const c of [5304, 5400, 5496]) TN.addPier({ axis: 'x', a0: 5328, a1: PX0, c, hw: 8, y: 3.6, land: 'a1', flat: false });
    W.BUILD.push({ k: 'quay', x: PX0 - 6, z: 5400, x0: PX0 - 10.5, x1: PX0 - 1.4, z0: 5222, z1: 5578, y: 4.5, gaps: [5304, 5400, 5496] });
    W.TERRA.push({ x0: 5320, z0: 5208, x1: PX0, z1: 5232, y: 4.5 });
    W.PAVE.push(['g', 'rect', PX0 - 2, 5222, PX0 + 14, 5578], ['g', 'rect', 5320, 5208, PX0, 5232]);
    for (const z of [5260, 5352, 5448, 5540]) W.PROPS.push(['lamp', PX0 + 3, z]);
    for (const [x, z, k] of [[PX0 + 8, 5290, 'crate'], [PX0 + 9, 5296, 'barrel'], [PX0 + 7, 5420, 'anchor'], [PX0 + 9, 5486, 'crate'], [PX0 + 8, 5512, 'barrel'], [5350, 5402, 'crate'], [5346, 5498, 'barrel']]) W.PROPS.push([k, x, z]);
    W.BUILD.push({ k: 'special', sk: 'lighthouse', x: 5334, z: 5220, w: 18, d: 18, door: 'e', style: 'porto', o: { h: 78, roof: TL.ROOF_ORANGE } });
  },
  post(P, g, y, b) { ship(5364, 5326, 'w', { b, flag: 2 }); ship(5362, 5474, 'w', { b, L: 40, B: 12, mh: 30, flag: 1 }); ship(5290, 5560, 'n', { b, L: 52, B: 14, mh: 38, flag: 2 }); } });
W.CLEAR.push([5150, 5190, 5420, 5610]);
W.PROPS.push(['boat', 5300, 5372], ['boat', 5262, 5440]);
C.city({ id: 'fioralba', guild: true, name: 'FIORALBA', x: 2300, z: 5350, w: 360, d: 320, style: 'fiore', open: true, plaza: { w: 80, d: 70 },
  board: [20, 16],
  shops: [['te', 'locanda', 'LA CASA DEL TÈ', 'n2', { fw: 34, fd: 22, rt: 'hip', wall: TL.WHITE, roof: TL.ROOF_PINK, h: 15, win: TL.SHOJI, dr: TL.DOOR_RED, chim: false }], ['dojo', 'dojo', 'IL DOJO DI FIORALBA', 's1', { fw: 36, fd: 24, rt: 'hip', wall: 3, roof: TL.ROOF_DARK, h: 15, win: TL.SHOJI, dr: TL.DOOR_RED, chim: false }],
    ['fiore', 'erboristeria', 'LA SERRA DELLA FIORAIA', 'n1', { rt: 'hip', wall: TL.PINK, roof: TL.ROOF_PURPLE, h: 15, win: TL.SHOJI, dr: TL.DOOR_RED, chim: false }]],
  specials: [['pagoda', -62, -72, 34, 34, 's'], ['pool', 62, 64, 36, 30],
    ['torii', 192, 0, 4, 24, 'e'], ['torii', 0, -172, 24, 4, 'n'], ['torii', 0, 172, 24, 4, 's']],
  people: [
    ['dama2', 'DAMA SAKURA DI FIORALBA', [], [-62, -48, Math.PI / 2], { id: 'lead_fiore' }],
    ['ostessa', 'LA LOCANDIERA DEL TÈ', ['SIEDITI, VIAGGIATORE. IL TÈ DEI PETALI SCIOGLIE LA STANCHEZZA.'], 'in:te', { role: 'inn', cost: 14 }],
    ['monaco', 'IL MONACO PELLEGRINO', ["SUI DENTI DEL SUD, A EST DELLA BRUGHIERA, UN SENTIERO SALE TRA LE ROCCE. IN CIMA HO TROVATO UNA BUSSOLA D'ORO... E L'HO LASCIATA DOV'ERA: NON È LA MIA STRADA."], 'in:te:ospite1'],
    ['dama', 'LA POETESSA', ['A OVEST, DOVE I CILIEGI ARRIVANO FINO AL MARE, HO VISTO BRILLARE UN CUORE TRA I TRONCHI. NE HO FATTO UNA POESIA, MA IL CUORE È ANCORA LÀ.'], 'in:te:ospite2'],
    ['fioraia', 'LA FIORAIA', ['FIORI DI CILIEGIO ESSICCATI, AMULETI DI SETA, PICCOLE COSE CHE PORTANO BENE.'], 'in:fiore', { id: 'fioraia', role: 'shop', shop: 'fiore' }],
    ['spadaccino', "IL MAESTRO D'ARMI", ['NEL DOJO INSEGNO LA VIA DELLA LAMA. LE MIE SPADE NON SI SPEZZANO.'], 'in:dojo', { role: 'shop', shop: 'dojo' }],
    ['saggio', 'IL VECCHIO HARU', ["I CILIEGI DI QUESTE COLLINE NON SFIORISCONO MAI. È UN DONO DELLA PIETRA DELL'ALBA, DICONO.", 'A SUD COMINCIA LA BRUGHIERA NERA. LÀ SORGE LA TORRE DELL\'ECLISSE: NON ANDARCI SENZA UNA BUONA ARMATURA.'], 'p'],
    ['fioraia', 'LA RAGAZZA DEL LAGO', ['A NORD-EST C\'È IL LAGO DEI PETALI. SULLA RIVA, TRA I CILIEGI, MIO NONNO NASCOSE IL SUO ELMO DA GUERRIERO.'], 'd', { walk: 1 }],
    ['spadaccino', 'LA SENTINELLA', ["DALL'APPRODO DEI PETALI, A NORD-OVEST, IL TRAGHETTO PORTA AL FARO DI LUMEN E A PORTO SERENO."], [176, 14, 0]],
    ['bimbo', 'LA PICCOLA HANA', ['SE STAI FERMO SOTTO UN CILIEGIO, I PETALI TI CONTANO I CAPELLI!'], 'p', { walk: 1 }],
    ['fioraia', 'LA GIARDINIERA', ['OGNI CASA DI FIORALBA HA IL SUO CILIEGIO. QUANDO NASCE UN BAMBINO, SE NE PIANTA UNO NUOVO.'], 'd', { walk: 1 }],
    ['saggio', 'IL CALLIGRAFO', ['GLI INCARICHI DELLA BACHECA LI SCRIVO IO, COL PENNELLO. LA TAGLIA SUL CAVALIERE SENZA NOME MI HA FATTO TREMARE LA MANO.'], 'p'],
    ['spadaccino', "L'ALLIEVO DEL DOJO", ['IL MAESTRO DICE CHE UNA BUONA LAMA SI COMPRA UNA VOLTA SOLA. PER QUESTO LE SUE COSTANO TANTO.'], 'd'],
  ] });
// villaggi lungo la strada
C.city({ id: 'ponte', name: 'LOCANDA DEL PONTE', x: 4650, z: 2096, w: 150, d: 110, style: 'ambra', open: true, small: true, center: 'none', plaza: { w: 40, d: 36 },
  shops: [['ponte', 'locanda', 'LA LOCANDA DEL PONTE', [-44, -34, 34, 22, 's'], { h: 17, wall: TL.TIMBER2, roof: 4 }]],
  people: [['oste', 'OSTE DEL PONTE', ['CHI PASSA IL PONTE DEI RE HA SEMPRE SETE. BENVENUTO!'], 'in:ponte', { id: 'oste_ponte', role: 'inn', cost: 12 }],
    ['guardia', 'LA GUARDIA DEL PONTE', ["A NORD-EST DI QUI, SOTTO LA VECCHIA TORRE DI GUARDIA DELLA PIANA, C'È UN CUORE DI CRISTALLO. LO SANNO ANCHE I PREDONI, PERÒ."], 'in:ponte:ospite1'],
    ['borghese', 'IL MERCANTE DI PASSAGGIO', ['SEI APPENA ARRIVATO SUL CONTINENTE? LA STRADA A EST PORTA A CASTELROSSO, QUELLA A NORD AD ALTABRINA, TRA LE NEVI.', 'QUI LE BESTIE SONO PIÙ FORTI CHE A LUMEN. TIENI PRONTE LE POZIONI.'], 'p']] });
W.PROPS.push(['well', 4650, 2096]);
C.city({ id: 'mezzavia', name: 'MEZZAVIA', x: 5900, z: 4330, w: 170, d: 130, style: 'lumen', open: true, small: true, center: 'none', plaza: { w: 40, d: 36 },
  shops: [['mezzavia', 'locanda', 'LA LOCANDA DI MEZZAVIA', [-50, -36, 32, 20, 's'], { wall: 1, roof: 4 }]],
  people: [['ostessa', 'OSTESSA DI MEZZAVIA', ['A METÀ STRADA TRA IL BOSCO E IL MARE: QUI SI FERMANO TUTTI, E NESSUNO RIPARTE A STOMACO VUOTO.'], 'in:mezzavia', { role: 'inn', cost: 12 }],
    ['marinaio', 'IL MARINAIO IN LICENZA', ['A SUD-OVEST DI QUI, VERSO IL FIUME, TRA I CESPUGLI DELLA PIANA, UN CARRETTIERE HA NASCOSTO LA PAGA DI UN MESE. ME LO HA DETTO LUI, DOPO IL TERZO BOCCALE.'], 'in:mezzavia:ospite1'],
    ['borghese', 'IL FATTORE', ['MEZZAVIA: A METÀ STRADA TRA CASTELROSSO E PORTO SERENO. DA NOI SI FERMANO TUTTI.', 'A EST, PRESSO LO STAGNO, QUALCUNO HA SEPOLTO UNA FIASCA PREZIOSA.'], 'p', { id: 'fattore' }], ['bimbo', 'IL GARZONE', ['LE MELME DELLA PIANA SONO GIALLE E GROSSE. IO LE FACCIO SCAPPARE COL BASTONE!'], 'p', { walk: 1 }]] });
W.PROPS.push(['well', 5900, 4330]); W.BUILD.push({ k: 'special', sk: 'mill', x: 6010, z: 4290, w: 20, d: 20, style: 'lumen', o: { roof: 4 } });
// i due approdi del traghetto
C.city({ id: 'faro', name: 'APPRODO DEL FARO', x: 1440, z: 3700, w: 120, d: 90, style: 'lumen', open: true, small: true, center: 'none', plaza: { w: 30, d: 28 },
  people: [['traghettatore', 'IL TRAGHETTATORE', [], [52, 116, -Math.PI / 2], { id: 'ferry_faro', role: 'ferry', dock: 'faro' }], ['marinaio', 'IL GUARDIANO DEL FARO', ['DAL MOLO PARTE IL TRAGHETTO PER LE TERRE DEL SUD E PER PORTO SERENO. COSTA QUALCHE MONETA, MA RISPARMI GIORNI DI CAMMINO.'], 'p', { id: 'guardiano_faro' }]] });
TN.addPier({ axis: 'z', a0: 3828, a1: 3952, c: 1480, hw: 8, y: 3.4, land: 'a0' }); W.PROPS.push(['boat', 1502, 3910], ['lamp', 1468, 3806], ['barrel', 1466, 3818]);
C.city({ id: 'petali', name: 'APPRODO DEI PETALI', x: 1630, z: 4840, w: 130, d: 90, style: 'fiore', open: true, small: true, center: 'none', plaza: { w: 30, d: 28 },
  people: [['traghettatore', 'LA TRAGHETTATRICE', [], [-106, -130, Math.PI / 2], { id: 'ferry_petali', role: 'ferry', dock: 'petali' }], ['fioraia', 'LA PESCATRICE', ['LA STRADA A SUD-EST PORTA A FIORALBA, LA CITTÀ DEI CILIEGI.'], 'p']] });
TN.addPier({ axis: 'z', a0: 4576, a1: 4698, c: 1512, hw: 8, y: 3.4, land: 'a1' }); W.PROPS.push(['boat', 1534, 4612], ['lantern', 1500, 4712]);
W.DOCKS = { faro: { n: 'APPRODO DEL FARO', x: 1480, z: 3832, yaw: -Math.PI / 2 }, petali: { n: 'APPRODO DEI PETALI', x: 1512, z: 4694, yaw: Math.PI / 2 }, porto: { n: 'PORTO SERENO', x: 5398, z: 5400, yaw: 0 } };
// ---------- Borgo Aurora: l'emporio di Nino al posto della bancarella, la locanda, la bacheca in piazza ----------
C.bottega('nino', 'emporio', "L'EMPORIO DI NINO", 'BORGO AURORA', 'lumen').folk.push('nino');
C.bottega('gallo', 'locanda', 'LA LOCANDA DEL GALLO', 'BORGO AURORA', 'lumen');
C.folk('ostessa', 'OSTESSA GEMMA', 0, 0, 0, ['BENVENUTO AL GALLO, CARO! QUI SI DORME TRA LENZUOLA CHE SANNO DI LAVANDA.'], { in: 'gallo', spot: 'banco', role: 'inn', cost: 6 });
C.folk('borghese', 'IL VECCHIO TOBIA', 0, 0, 0, ["DA GIOVANE HO NASCOSTO UN GRUZZOLO TRA I CESPUGLI, SULLA STRADA PER LA ROCCA, POCO PRIMA DELLE DUE STATUE. POI ME NE SONO SCORDATO PER QUARANT'ANNI.", 'SE LO TROVI È TUO. IO ORMAI HO LA ZUPPA DI GEMMA.'], { in: 'gallo', spot: 'ospite1' });
C.folk('boscaiolo', 'IL CACCIATORE', 0, 0, 0, ['I LUPI DEL BOSCO ANTICO GIRANO IN BRANCO: COLPISCI E ARRETRA, NON FARTI CHIUDERE IN MEZZO.', 'E DAI UN OCCHIO ALLA BACHECA IN PIAZZA: PER OGNI LAVORO FATTO, IL BORGO PAGA IN MONETE SONANTI.'], { in: 'gallo', spot: 'ospite2' });
W.BOARDS.push({ id: 'borgo', city: 'BORGO AURORA', x: 2021, z: 2633 });
C.folk('maestro', 'MAESTRO DELLA GILDA', 2034, 2636, 2.6, ['BENVENUTO, VIAGGIATORE. LA GILDA DEGLI EROI HA UN MAESTRO IN OGNI CITTÀ, E UNO ANCHE QUI AL BORGO. QUI SI CAMBIA MESTIERE E SI IMPARA.'], { role: 'guild', id: 'maestro_borgo' });
W.builders.board = (b, g) => SG.shop.bacheca(b.x, b.z, g(b.x, b.z), b, 4);
// il Borgo cresce: cinque case nuove attorno alla piazza, e chi ci abita
W.BUILD.push({ k: 'house', x: 1868, z: 2602, w: 20, d: 16, h: 11, wall: 2, roof: 4, door: 's', chim: true }, { k: 'house', x: 2142, z: 2592, w: 20, d: 16, h: 12, wall: 0, roof: 6, door: 's', chim: true },
  { k: 'house', x: 2144, z: 2734, w: 18, d: 16, h: 10, wall: 3, roof: 5, door: 'n' }, { k: 'house', x: 1914, z: 2794, w: 20, d: 16, h: 12, wall: 1, roof: 4, door: 'e', chim: true }, { k: 'house', x: 2052, z: 2798, w: 18, d: 16, h: 10, wall: 16, roof: 6, door: 'n' });
C.folk('dama', 'LA TESSITRICE NORA', 1876, 2616, 0.6, ["DA QUANDO NINO HA APERTO L'EMPORIO, LA PIAZZA SEMBRA QUELLA DI UNA CITTÀ. CI MANCA SOLO IL CAMPANILE."]);
C.folk('boscaiolo', 'IL BOSCAIOLO ELIO', 1930, 2786, 0, ["PRIMA DI PARTIRE PASSA DALLA BACHECA, IN PIAZZA. C'È SEMPRE QUALCUNO CHE HA BISOGNO DI DUE BRACCIA."]);
C.folk('bimbo', 'LA PICCOLA ADA', 2044, 2686, 2.2, ['GEMMA DELLA LOCANDA MI DÀ SEMPRE UN BISCOTTO. PERÒ NON DIRLO A BISCOTTO, CHE È UN GATTO GELOSO.'], { walk: 1 });
C.folk('borghese', 'IL CONTADINO BEPPE', 2142, 2606, 1.6, ["LE CASE NUOVE SONO VENUTE SU IN UN'ESTATE. IL BORGO CRESCE: MERITO DELLA STRADA PER LA ROCCA."], { walk: 1 });
W.PROPS.push(['haybale', 2158, 2600], ['barrel', 1880, 2612], ['crate', 2064, 2788], ['pot', 1926, 2800], ['bench', 2130, 2722], ['lamp', 2118, 2664], ['lamp', 1905, 2700], ['pot', 2020, 2582], ['pot', 2044, 2582], ['sack', 2047, 2575], ['table', 2060, 2704], ['stool', 2065, 2700], ['stool', 2056, 2700]);
// un po' di vita in più a Borgo Aurora
W.PROPS.push(['lamp', 1962, 2612], ['lamp', 2038, 2612], ['lamp', 1962, 2690], ['lamp', 2038, 2690], ['bench', 1984, 2632], ['bench', 2016, 2668], ['barrel', 2068, 2606], ['crate', 2094, 2712], ['pot', 1936, 2600], ['pot', 2086, 2708], ['cart', 2180, 2776], ['haybale', 2196, 2790]);

// ---------- luoghi da scoprire ----------
// la Torre dell'Eclisse, nella Brughiera Nera
W.FLAT.push([2000, 7000, 150, null]); W.CLEAR.push([1900, 6900, 2100, 7100]); W.PLACES.push([2000, 7000, 150, "TORRE DELL'ECLISSE"]); W.TOWNS.push({ x: 2000, z: 7000, name: "TORRE DELL'ECLISSE" });
W.BUILD.push({ k: 'fort', x: 2000, z: 7000, id: 'torre', door: 's' });
W.builders.fort = (b, g) => {
  const y = g(b.x, b.z), D = TL.DARKSTONE, M = TL.MERL_DARK, RP = TL.ROOF_PURPLE;
  tower(b.x, b.z, 20, y - 6, y + 118, D, { roof: RP, rh: 50, b }); oct(b.x, b.z, 23, y + 80, y + 86, D);
  for (const k of [0, 2, 4, 6]) { faceDecal(b.x, b.z, 20, k, y + 40, 4, 12, TL.RUNEWIN, true); faceDecal(b.x, b.z, 20, k, y + 92, 4, 12, TL.RUNEWIN, true); if (k !== 2) faceDecal(b.x, b.z, 20, k, y + 60, 5, 12, TL.BAN_PURPLE); }
  faceDecal(b.x, b.z, 20, 2, y, 10, 14, TL.DOOR_BIG);
  for (const [dx, dz, hh] of [[-62, -62, 50], [62, -62, 38], [-62, 62, 30], [62, 62, 54]]) tower(b.x + dx, b.z + dz, 9, y - 6, y + hh, D, hh > 40 ? { roof: RP, win: TL.RUNEWIN, b } : { merl: M, b });
  // la cinta in rovina: tratti interi e brecce
  for (const [x0, z0, x1, z1, hh] of [[-62, -66, -8, -59, 22], [22, -66, 62, -59, 14], [-66, -62, -59, 10, 20], [-66, 34, -59, 62, 12], [59, -62, 66, -20, 16], [59, 6, 66, 62, 22], [-62, 59, -16, 66, 18], [16, 59, 62, 66, 22]]) wallSeg(b.x + x0, b.z + z0, b.x + x1, b.z + z1, y - 6, y + hh, D, M, b);
  W.glows.push([b.x, y + 100, b.z, 18, 0.7, 0.35, 1, 1], [b.x, y + 46, b.z + 20, 8, 0.7, 0.35, 1, 0], [b.x, y + 7, b.z + 20, 9, 0.7, 0.35, 1, 1]);
  // il portone si apre: dentro, tre piani che salgono
  W.lights.push({ x: b.x, z: b.z + 21, id: b.id, cave: true, intro: ["IL PORTONE DELLA TORRE È SOCCHIUSO. DENTRO, UNA SCALA SALE NEL BUIO: UN PIANO, POI UN ALTRO, POI UN ALTRO ANCORA...", 'SPINGI IL BATTENTE ED ENTRI.'] });
};
// il tempio a gradoni nella laguna della selva
W.FLAT.push([6800, 5470, 110, 6]); W.CLEAR.push([6740, 5410, 6860, 5530]); W.PLACES.push([6800, 5470, 120, 'TEMPIO DELLA LAGUNA']); W.TOWNS.push({ x: 6800, z: 5470, name: 'TEMPIO DELLA LAGUNA' });
W.BUILD.push({ k: 'zig', x: 6800, z: 5450, id: 'laguna', door: 's' });
W.builders.zig = (b, g) => {
  const y = g(b.x, b.z + 50);
  for (let k = 0; k < 4; k++) { const s = 40 - k * 9, y0 = y - 4 + k * 9 + (k ? 4 : 0); box(b.x - s, b.z - s, b.x + s, b.z + s, y0, y + 9 + k * 9, 11); if (k) decal(b.x, y + k * 9, b.z + s, 1, 0, 12, 9, TL.STEPS); else decal(b.x, y, b.z + s, 1, 0, 9, 8.6, 12, true); }
  box(b.x - 8, b.z - 8, b.x + 8, b.z + 8, y + 36, y + 46, 11); pyramid(b.x - 8, b.z - 8, b.x + 8, b.z + 8, y + 46, 7, TL.GOLD, 2); decal(b.x, y + 36, b.z + 8, 1, 0, 6, 8, 12, true);
  W.addBox(b.x - 40, b.z - 40, b.x + 40, b.z + 40, y + 9, b); W.glows.push([b.x, y + 41, b.z + 9, 7, 0.3, 0.9, 0.9, 0], [b.x, y + 5, b.z + 41, 9, 0.3, 0.9, 0.8, 1]);
  // ai piedi della gradinata, una porta: dentro, tre piani che scendono sotto il livello del mare
  W.lights.push({ x: b.x, z: b.z + 41, id: b.id, cave: true, intro: ["AI PIEDI DELLA GRADINATA SI APRE UNA PORTA DI PIETRA VERDE. L'ARIA CHE ESCE SA DI SALE E DI MUSCHIO.", 'I GRADINI SCENDONO SOTTO IL LIVELLO DEL MARE. ENTRI.'] });
};
// la banchina di Porto Sereno: un muro di pietra a picco sull'acqua, con le bitte; tra un molo e l'altro non si cade in mare
W.builders.quay = b => {
  box(b.x0, b.z0, b.x1, b.z1, -11, b.y + 0.1, 9, TL.PAVING);
  const cut = [b.z0].concat(...b.gaps.map(c => [c - 12, c + 12]), [b.z1]);
  for (let k = 0; k < cut.length; k += 2) { W.addBox(b.x0 - 1, cut[k], b.x1 - 0.8, cut[k + 1], b.y + 3, b); for (let z = cut[k] + 10; z < cut[k + 1] - 6; z += 22) box(b.x0 + 1.6, z - 1, b.x0 + 3.6, z + 1, b.y, b.y + 2.4, TL.DARKSTONE); }
};
// torri di guardia, rovine, pietre
W.BUILD.push({ k: 'tower', x: 5060, z: 1300, r: 9, h: 42, wall: 2, roof: 4 }, { k: 'tower', x: 6420, z: 4020, r: 9, h: 40, wall: 9, roof: 5 }, { k: 'tower', x: 3620, z: 5040, r: 9, h: 44, wall: 9, roof: TL.ROOF_PINK }, { k: 'tower', x: 7620, z: 4640, r: 9, h: 40, wall: 10, roof: TL.TURQ },
  { k: 'ruin', x: 6650, z: 2470, w: 60, d: 6, h: 10, wall: 10, gate: true }, { k: 'ruin', x: 6690, z: 2430, w: 6, d: 50, h: 8, wall: 10 }, { k: 'ruin', x: 5440, z: 7040, w: 44, d: 6, h: 8, wall: 11, gate: true }, { k: 'ruin', x: 5470, z: 7070, w: 6, d: 40, h: 6, wall: 11 },
  { k: 'ruin', x: 1260, z: 6660, w: 50, d: 6, h: 9, wall: TL.DARKSTONE, gate: true }, { k: 'ruin', x: 2760, z: 7240, w: 6, d: 44, h: 8, wall: TL.DARKSTONE }, { k: 'ruin', x: 7400, z: 3920, w: 46, d: 6, h: 9, wall: 10 });
for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; W.PROPS.push(['menhir', 900 + Math.cos(a) * 26, 6210 + Math.sin(a) * 26]); }
W.PROPS.push(['tent', 4760, 1690], ['campfire', 4740, 1706], ['tent', 7480, 2030], ['campfire', 7462, 2046], ['campfire', 6240, 3590], ['tent', 6258, 3574], ['sign', 4500, 1990], ['sign', 5010, 2130], ['sign', 5770, 3530], ['sign', 4150, 6390], ['sign', 2310, 5540]);

// ---------- tane dei nemici, forzieri, nascondigli ----------
W.CAMPS.push(
  [4800, 1700, 'jackal', 3, 100], [5100, 2450, 'jackal', 3, 100], [4750, 2600, 'slime2', 4, 90], [4950, 1250, 'bandit', 3, 90],
  [5450, 2950, 'bandit', 3, 90], [6050, 2800, 'wolf', 4, 100], [5900, 3800, 'goblin', 4, 90], [6250, 3600, 'bat', 3, 80], [5350, 3700, 'wolf', 3, 100],
  [5700, 1100, 'icewolf', 3, 90], [6500, 1150, 'icewolf', 4, 90], [6900, 1400, 'icewolf', 3, 90], [7200, 1200, 'bat', 3, 80],
  [6700, 2600, 'skel', 3, 90], [7350, 2500, 'mummy', 3, 90], [7450, 3500, 'jackal', 4, 100], [6800, 3500, 'skel', 3, 90], [7500, 2050, 'mummy', 3, 90],
  [5600, 4500, 'slime2', 4, 90], [6200, 4700, 'slime2', 3, 90], [6300, 5100, 'bandit', 3, 90],
  [6700, 5000, 'bat', 4, 80], [7100, 5300, 'tiger', 3, 100], [6600, 5900, 'tiger', 3, 100], [7300, 6000, 'bat', 3, 80], [6900, 6400, 'goblin', 4, 90],
  [5600, 6700, 'goblin', 3, 90], [5300, 7000, 'bat', 3, 80],
  [1900, 5000, 'slime2', 3, 90], [2900, 5650, 'slime2', 3, 90], [3300, 5100, 'bandit', 3, 90], [1200, 5400, 'wolf', 3, 100],
  [1700, 6500, 'wraith', 3, 90], [2400, 6700, 'skel', 4, 90], [1300, 6900, 'bat', 4, 80], [2600, 7200, 'wraith', 3, 90], [2000, 6905, 'wraith', 3, 60], [3200, 6500, 'icewolf', 3, 90]);
W.CHESTS.push(
  ['d01', 4720, 2260, 'monete:80', 0], ['d02', 5080, 1320, 'cuore', 1], ['d03', 5420, 2200, 'pozione:3', 0], ['d04', 6050, 2650, 'seta', 1], ['d05', 5300, 3650, 'monete:120', 0],
  ['d06', 6420, 980, 'pelliccia', 2], ['d07', 7250, 1350, 'cuore', 1], ['d08', 5650, 950, 'elisir', 1],
  ['d09', 6670, 2452, 'monete:150', 0], ['d10', 7500, 2700, 'scimitarra', 2], ['d11', 7400, 3900, 'turbante', 1], ['d12', 7640, 2000, 'cuore', 1],
  ['d13', 6440, 4390, 'elisir', 1], ['d14', 5500, 4750, 'monete:100', 0],
  ['d15', 6800, 5398, 'monete:200', 1], ['d16', 7350, 5500, 'tridente', 2], ['d17', 6500, 6300, 'cuore', 1], ['d18', 7300, 6500, 'monete:200', 0],
  ['d19', 5452, 7056, 'madreperla', 2], ['d20', 4950, 6800, 'pozione:3', 0],
  ['d21', 3040, 5050, 'kabuto', 2], ['d22', 1250, 5050, 'cuore', 1], ['d23', 3350, 5650, 'monete:120', 0], ['d24', 3400, 6380, 'bussola', 2],
  ['d25', 2000, 6952, 'elisir', 1], ['d26', 1250, 6672, 'elisir', 1], ['d27', 2772, 7250, 'monete:300', 2], ['d28', 900, 6210, 'monete:160', 0]);
W.NOOKS.push(
  [4720, 2260, 'cespugli', 0.4], [5080, 1320, 'rocce', 1.2], [5420, 2200, 'ambra', 2.6], [6050, 2650, 'ambra', 3.4], [5300, 3650, 'ambra', 0.2],
  [6420, 980, 'neve', 1.8], [7250, 1350, 'neve', 2.4], [5650, 950, 'rocce', 1.2], [7500, 2700, 'rosse', 2.8], [7640, 2000, 'sabbia', 3.0],
  [6440, 4390, 'cespugli', 3.2], [5500, 4750, 'cespugli', 0.8], [7350, 5500, 'selva', 3.1], [6500, 6300, 'selva', -0.8], [7300, 6500, 'selva', -1.8], [4950, 6800, 'cespugli', -1.2],
  [3040, 5050, 'ciliegi', 2.9], [1250, 5050, 'ciliegi', 0.6], [3350, 5650, 'ciliegi', -2.2], [3400, 6380, 'rocce', -0.9], [1250, 6672, 'brughiera', 0.3]);
})();
