// ---------- IL GRANDE VIAGGIO · Terra I: Lumen ----------
// La scheda di una terra: prende un mondo appena uscito dalla fabbrica (SG.mondo), lo svuota di quel che era del mondo di oggi
// e lo riempie con il suo disegno. Coste, regioni, monti, laghi, fiumi, strade: sono tutti elenchi, e stanno qui.
(() => {
SG.terre = SG.terre || {};
// toglie tutto quel che apparteneva al mondo di oggi (restano i costruttori e gli attrezzi)
SG.terre.svuota = W => {
  for (const k of ['PLACES', 'BUILD', 'PROPS', 'CHESTS', 'NOOKS', 'NPCS', 'CAMPS', 'ROADS', 'RIVERS', 'STONES', 'COASTS', 'LAKES', 'FLAT', 'PEAKS', 'TERRA', 'BRIDGES', 'PAVE', 'CLEAR', 'CARVE', 'SHAPERS', 'LATESHAPE', 'FINE', 'REG', 'TOWNS', 'hooks', 'URBAN', 'flags', 'sprays', 'falls', 'GIANTS']) if (Array.isArray(W[k])) W[k].length = 0;
  for (const k of ['props', 'boxes', 'circles']) W.LATE[k].length = 0;
  W.OLDN.nooks = W.OLDN.props = 0; W.NORDN = { nooks: [0, 0], props: [0, 0] }; W.FOLK = {}; W.DOCKS = {}; W.bigShadows = [];
};
// Lumen: l'isola di oggi ingrandita 1,9 volte per lato, con a nord un massiccio nuovo attraversato dal Valico dei Giganti.
// T porta un punto della Lumen di oggi al suo posto nella terra nuova.
const S = 1.9, T = (x, z) => [Math.round((x - 128) * S + 387), Math.round((z - 192) * S + 352)];
SG.terre.lumen = m => {
  const W = m.world, B = W.B, C = m.city;
  // i pezzi di Pixel Saga che tornano al loro posto nuovo (santuari, rovine, faro): si prendono dal mondo di sempre prima di svuotarlo
  const dentro = (x, z, b) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
  const prendi = b => ({ build: W.BUILD.filter(q => dentro(q.x, q.z, b)), props: W.PROPS.filter(q => dentro(q[1], q[2], b)), late: W.LATE.props.filter(q => dentro(q[1], q[2], b)),
    chests: W.CHESTS.filter(q => dentro(q[1], q[2], b)), pave: W.PAVE.filter(q => (q[1] === 'rect' || q[1] === 'disc') && dentro(q[2], q[3], b)) });
  const posa = (P, dx, dz) => {
    for (const q of P.build) W.BUILD.push(Object.assign({}, q, { x: q.x + dx, z: q.z + dz }));
    for (const q of P.props) W.PROPS.push([q[0], q[1] + dx, q[2] + dz].concat(q.slice(3)));
    for (const q of P.late) W.LATE.props.push([q[0], q[1] + dx, q[2] + dz].concat(q.slice(3)));
    for (const q of P.chests) W.CHESTS.push(['gv_' + q[0], q[1] + dx, q[2] + dz].concat(q.slice(3)));
    for (const q of P.pave) W.PAVE.push(q[1] === 'rect' ? [q[0], 'rect', q[2] + dx, q[3] + dz, q[4] + dx, q[5] + dz].concat(q.slice(6)) : [q[0], 'disc', q[2] + dx, q[3] + dz].concat(q.slice(4)));
  };
  const SOLIS0 = prendi([3150, 1450, 3600, 1900]), GHIACCIO0 = prendi([500, 440, 830, 760]), ISOLA0 = prendi([2070, 1260, 2230, 1420]), FARO0 = prendi([1200, 3500, 1420, 3720]);
  const CAMPI0 = W.CAMPS.filter(c => c[0] < 4000 && c[1] < 4000);   // i nemici dell'isola di Lumen di sempre
  SG.terre.svuota(W);
  // la costa: il corpo dell'isola, e a nord il massiccio che arriva fino al bordo della carta (oltre c'è la terra dei monti)
  const corpo = [[3800, 560], [3940, 1000], [3960, 1500], [3930, 1900], [4020, 2000], [3930, 2100], [3960, 2500], [3880, 3000], [3700, 3450], [3350, 3750], [2900, 3880], [2450, 3940], [2050, 3980], [1600, 3880],
    [1150, 3740], [750, 3480], [430, 3100], [260, 2650], [200, 2150], [260, 1650], [190, 1150], [300, 750], [520, 420]].map(p => T(p[0], p[1]));
  W.COASTS.push([[1150, 250], [1000, -700], [1450, -1500], [1900, -2400], [6600, -2400], [7050, -1500], [7450, -700], [7350, 250]].concat(corpo));
  // le regioni di sempre, al loro posto nuovo
  const reg = (x, z, r, b, n) => { const q = T(x, z); W.REG.push([q[0], q[1], Math.round(r * S), b, n]); };
  reg(2050, 2600, 720, B.MEADOW, 'PRATI DI LUMEN'); reg(2430, 2790, 230, B.FARM, 'CAMPI DORATI'); reg(1500, 2200, 300, B.MEADOW, 'PRATI DI LUMEN');
  reg(1200, 1550, 520, B.FOREST, 'BOSCO ANTICO'); reg(700, 1150, 380, B.FOREST, 'BOSCO ANTICO'); reg(1650, 1250, 280, B.FOREST, 'BOSCO ANTICO');
  reg(2150, 1340, 420, B.MEADOW, 'LAGO DI CRISTALLO');
  reg(1250, 520, 430, B.MOUNT, 'MONTI DEL DRAGO'); reg(2300, 480, 470, B.MOUNT, 'PICCO DEL DRAGO'); reg(3150, 620, 430, B.MOUNT, 'MONTI DEL DRAGO'); reg(3680, 900, 260, B.MOUNT, 'RUPI DEL GRIFONE');
  reg(650, 640, 300, B.SNOW, 'VALLE GELATA');
  reg(3250, 1750, 560, B.HILLS, 'COLLINE DI SOLIS'); reg(3550, 2350, 320, B.HILLS, 'COLLINE DI SOLIS');
  reg(650, 2650, 450, B.SWAMP, "PALUDE D'OMBRA");
  reg(3350, 3150, 430, B.HILLS, 'MONTE BRACE');                 // vulcano spento: colline e roccia al posto della lava (il fuoco sta in un'altra terra)
  reg(2760, 2960, 330, B.MEADOW, 'CAMPI DORATI');
  reg(1350, 3350, 420, B.MEADOW, 'COSTA DELLE CONCHIGLIE'); reg(2600, 3550, 330, B.MEADOW, 'COSTA DELLE CONCHIGLIE');
  W.REG.push([6300, 4750, 520, B.MEADOW, 'ROCCA DI LUMEN']);
  // il massiccio del nord: i monti più alti di Lumen
  for (const [x, z, r] of [[2300, -500, 800], [3800, -700, 850], [5600, -600, 850], [6700, -300, 700], [2900, -1600, 800], [4300, -1700, 850], [5800, -1600, 800], [1700, 100, 500]]) W.REG.push([x, z, r, B.ALP, 'MONTI DEL DRAGO']);
  // cime, vulcano, laghi, fiume
  const picco = T(2300, 440), brace = T(3350, 3150), lago = T(2150, 1340);
  W.PEAKS.push([picco[0], picco[1], 300, 550], [brace[0], brace[1], 110, 380]);   // il Picco del Drago; e Monte Brace, un cono basso e largo
  W.VOLC[0] = W.VOLC[1] = -99999;                                                     // nessun vulcano acceso in questa terra
  W.LAKES.push({ x: lago[0], z: lago[1], rx: 627, rz: 475, d: -22 }, { x: 3545, z: 5554, rx: 70, rz: 56, d: -4 },
    { x: brace[0], z: brace[1], rx: 66, rz: 60, d: -5, wl: 122, dp: 3 },          // il lago nel cratere
    { x: 3520, z: -930, rx: 120, rz: 95, d: -4, wl: 182, dp: 2.5 });              // il lago della valle nascosta
  Object.assign(W.ISLAND, { x: lago[0], z: lago[1], r: 110, h: 5 });
  Object.assign(W.RIVER, { pts: [[2170, 1560], [2200, 1800], [2160, 2050], [2250, 2350], [2320, 2600], [2290, 2880], [2200, 3180], [2130, 3480], [2090, 3780], [2075, 4100]].map(p => T(p[0], p[1])), w: 42, fords: [] });
  delete W.RIVER.box; W.RIVERS.push(W.RIVER);
  // valli scavate: la gola del Valico dei Giganti (sale verso nord) e la valle nascosta
  W.CARVE.push({ pts: [[5144, 950, 45], [5260, 100, 95], [5150, -700, 150], [5230, -1300, 205], [5200, -2100, 240]], w: 70, w2: 460 });
  W.CARVE.push({ pts: [[3250, -930, 180], [3850, -900, 180]], w: 230, w2: 560 });
  // i luoghi
  const BORGO = [3944, 5022], ROCCA = [6300, 4750], SOLIS = T(3360, 1670), ALBERO = T(1080, 1420), FARO = T(1440, 3700), PONTE = [7560, 3790], GHIACCIO = T(660, 598), GRIFONE = T(3700, 900);
  W.FLAT.push([SOLIS[0], SOLIS[1], 430, null], [2300, 5000, 90, null], [4704, 7150, 90, null], [5450, 3300, 90, null]);
  W.PLACES.push([BORGO[0], BORGO[1], 330, 'BORGO AURORA'], [ROCCA[0], ROCCA[1], 560, 'ROCCA DI LUMEN'], [SOLIS[0], SOLIS[1], 430, 'ROVINE DI SOLIS'], [ALBERO[0], ALBERO[1], 200, "L'ALBERO MADRE"], [lago[0], lago[1], 110, 'ISOLA DEL LAGO'],
    [picco[0], picco[1], 250, 'VETTA DEL DRAGO'], [brace[0], brace[1], 220, 'CRATERE DEL BRACE'], [5200, -1750, 300, 'VALICO DEI GIGANTI'], [3520, -930, 400, 'VALLE NASCOSTA'], [PONTE[0], PONTE[1], 300, 'PONTE DEI RE'],
    [2790, 7120, 70, 'FARO DEL SUD'], [GRIFONE[0], GRIFONE[1], 110, 'NIDO DEL GRIFONE']);   // (villaggi e città il nome lo ricevono dal generatore delle città)
  // gente nuova: gli elfi (orecchie a punta, capelli lunghi, verdi del bosco) e i nani (bassi, larghi, barbuti)
  Object.assign(C.LOOKS, {
    elfo: { walk: 1, skin: '#f4e0c4', ears: 1, hairStyle: 'long', hair: '#e8dc9a', shirt: '#3e8a4a', cape: '#1e4a2a', belt: '#6a4a2a', pants: '#3a4a2a', boots: '#5a4a2a' },
    elfa: { walk: 1, skin: '#f6e4cc', ears: 1, hairStyle: 'long', hair: '#b8d8a0', robe: '#6aa86a', shirt: '#a8d8a0', pants: '#4a7a4a', boots: '#5a4a2a' },
    elfoarciere: { skin: '#f0d8b8', ears: 1, hairStyle: 'long', hair: '#b08a4a', cap: '#2e6a3a', feather: '#f0e8d8', shirt: '#4a7a3a', quiver: '#6a4a2a', belt: '#3a2a1a', pants: '#3a4a2a', boots: '#4a3a22', weapon: { kind: 'bow', col: '#8a6a3a' } },
    elfosaggio: { sc: 1.04, skin: '#f4e4d0', ears: 1, hairStyle: 'long', hair: '#f0f0f8', robe: '#e8e8d8', shirt: '#f4f4e8', cape: '#7ab87a', pants: '#c8c8b0', boots: '#8a8a6a', staff: '#c8c8a0', orb: '#a8f0c0' },
    nano: { sc: 0.8, wide: 0.9, skin: '#e0b088', helm: { c: '#8a8a96', nose: 1 }, beard: '#c8642a', shirt: '#7a3a2a', plate: '#8a8a96', belt: '#3a2a1a', pants: '#4a4a52', boots: '#3a2a1a', weapon: { kind: 'hammer', col: '#6a6e78' } } });
  // le città: il generatore di sempre, con misure nuove
  // Borgo Aurora: il doppio di oggi, aperto, senza mura
  C.city({ id: 'borgo', name: 'BORGO AURORA', x: BORGO[0], z: BORGO[1], w: 420, d: 340, style: 'ambra', open: true, plaza: { w: 76, d: 64 },
    shops: [['aurora', 'locanda', "LOCANDA DELL'AURORA", 'n1', { fw: 32, fd: 22, h: 17 }], ['nino', 'emporio', "L'EMPORIO DI NINO", 'e1', {}], ['bruno', 'armeria', 'LA FUCINA DI BRUNO', 'w1', {}]],
    people: [
      ['donna', "L'ANZIANA MIRTA", ["CHE TU SIA IL BENVENUTO NEL BORGO NUOVO. È CRESCIUTO, VERO? E ANCHE LA TERRA TUTT'ATTORNO.", 'IL VIAGGIO NON È ANCORA COMINCIATO. PER ORA CAMMINA, GUARDA, E RICORDA QUEL CHE NON VA.'], 'p'],
      ['ostessa', "L'OSTESSA DELL'AURORA", ["UN LETTO PULITO E UNA ZUPPA CALDA. BENVENUTO ALLA LOCANDA DELL'AURORA!"], 'in:aurora', { role: 'inn', cost: 8 }],
      ['mercante', 'NINO', ["POZIONI, CAPPUCCI, QUEL CHE SERVE A CHI PARTE. L'EMPORIO È PICCOLO, MA C'È TUTTO."], 'in:nino', { role: 'shop', shop: 'nino' }],
      ['fabbro', 'BRUNO', ['IL FERRO BUONO SI BATTE DUE VOLTE. GUARDA PURE.'], 'in:bruno', { role: 'shop', shop: 'bruno' }],
      ['boscaiolo', 'IL BOSCAIOLO', ['NEL BOSCO ANTICO, A NORD-OVEST, GLI ELFI HANNO UN VILLAGGIO. SEGUI IL SENTIERO E, AL BIVIO, PRENDI A SINISTRA.'], 'd'],
      ['borghese', 'IL CARRETTIERE', ['A EST, OLTRE IL PONTE DI PIETRA, LA VIA MAESTRA PORTA ALLA ROCCA DI LUMEN. È UN MINUTO DI CORSA, NON DI PIÙ.'], 'p'],
      ['donna', 'LA LAVANDAIA', ['A NORD LA STRADA PASSA IL FIUME, COSTEGGIA IL LAGO DI CRISTALLO E SALE AL VALICO DEI GIGANTI. LASSÙ FA FREDDO.'], 'd'],
      ['bimbo', 'IL PICCOLO TOBIA', ['DICONO CHE TRA I MONTI DEL NORD CI SIA UNA VALLE CHE NESSUNO HA MAI TROVATO. IO DA GRANDE LA TROVO!'], 'p', { walk: 1 }],
      ['borgomastro', 'IL BORGOMASTRO', ['IN POCHI ANNI IL BORGO È RADDOPPIATO: CASE NUOVE, GENTE NUOVA. E IO DEVO RICORDARMI TUTTI I NOMI!', 'PRESTO APPENDEREMO UNA BACHECA IN PIAZZA, PER CHI CERCA LAVORO E PER CHI NE OFFRE.'], 'p'],
      ['fioraia', 'ROSA LA FIORAIA', ['FIORI DEI PRATI DI LUMEN, COLTI STAMATTINA! QUELLI AZZURRI CRESCONO SOLO VERSO IL LAGO DI CRISTALLO.'], 'p', { walk: 1 }],
      ['minatore', 'IL VECCHIO MINATORE', ["A NORD-OVEST, LUNGO IL SENTIERO DEL BOSCO, C'È UN POGGIO DI ROCCIA CON DUE TORCE ALL'IMBOCCO: È LA TANA DEL TASSO.", 'DENTRO È BUIO PESTO. IN FONDO AL RAMO DI PONENTE HO LASCIATO LA MIA LANTERNA: SE LA TROVI, TIENILA.'], 'd'],
      ['guardia', 'LA GUARDIA DEL BORGO', ['QUI NON CI SONO MURA: CI SONO IO. DI NOTTE ACCENDO LE LANTERNE E FACCIO IL GIRO DELLE CASE.'], 'd'],
      ['pescivendola', 'LA PESCIVENDOLA', ["TROTE DEL FIUME, PESCATE ALL'ALBA SOTTO IL PONTE DI PIETRA!"], 'p'],
      ['bimbo', 'LA PICCOLA NINA', ['GIOCO A NASCONDINO CON TOBIA TRA LE CASE NUOVE. NON DIRGLI CHE SONO QUI!'], 'd', { walk: 1 }],
      ['donna', 'LA FORNAIA', ['IL MIO FORNO È LA PRIMA LUCE CHE SI ACCENDE NEL BORGO. IL PANE MIGLIORE È QUELLO CHE SCOTTA ANCORA.'], 'd'],
      ['monaco', 'FRATE ILARIO', ['UNA VOLTA AL MESE VADO A PIEDI FINO ALLA ROCCA. LA VIA MAESTRA È LARGA E LASTRICATA: NON CI SI PERDE NEMMENO COL BUIO.'], 'd'],
      ['borghese', 'IL MUGNAIO', ["IL GRANO ARRIVA DAI CAMPI DORATI, A LEVANTE. QUEST'ANNO LE SPIGHE SONO ALTE COSÌ."], 'd', { walk: 1 }],
      ['spadaccino', 'UN VIANDANTE', ['VENGO DAL VALICO DEI GIGANTI. LASSÙ LA NEVE NON SI SCIOGLIE MAI, E LA GOLA SALE TRA PARETI ALTE COME TORRI.', "OLTRE IL VALICO C'È UN'ALTRA TERRA. MA LA STRADA, PER ORA, FINISCE LÌ."], 'p'],
      ['traghettatore', 'IL BARCAIOLO', ['UN GIORNO PORTERÒ LA GENTE GIÙ PER IL FIUME, FINO ALLA CALA DELLE CONCHIGLIE. PER ORA RATTOPPO LA BARCA.'], 'd'],
      ['mercantessa', 'LA MERCIAIA', ['AGHI, FILO, NASTRI E BOTTONI. E QUALCHE CHIACCHIERA, SE HAI TEMPO.', 'DICONO CHE GLI ELFI SIANO TORNATI NEL BOSCO ANTICO. LA MIA BISNONNA LI AVEVA VISTI DA BAMBINA.'], 'p', { walk: 1 }]] });
  W.PROPS.push(['well', BORGO[0] + 27, BORGO[1] - 19]);   // il pozzo del Borgo: chi beve si rimette in forze
  // il villaggio degli elfi nel Bosco Antico: case strette di legno dai tetti ripidi e muschiati, tra le querce grandi, con le lanterne
  const TL = m.town.TL, ELFI = [1750, 3180];
  C.STYLES.elfi = { walls: [3, 3, TL.TIMBER2], roofs: [TL.ROOF_MOSS, TL.ROOF_MOSS, TL.ROOF_GREEN], rt: ['gable'], steep: 0.95, h: [12, 19], wd: [12, 17], chim: 0, win: [8, TL.WIN_PAPER], dr: [7], aw: [], cw: 2, cm: TL.MERL_GREY, tr: TL.ROOF_MOSS,
    pave: 'g', trees: ['oakbig', 'oakbig', 'oak'], lamp: 'lantern', yard: ['pot', 'bench', 'barrel'], flag: 0, ban: TL.BAN_RED };
  C.city({ id: 'elfi', name: 'VILLAGGIO DEGLI ELFI', x: ELFI[0], z: ELFI[1], w: 250, d: 210, style: 'elfi', open: true, small: true, center: 'none', plaza: { w: 46, d: 40 },
    people: [['elfosaggio', 'IL CUSTODE DELLA RADURA', ['GLI UOMINI TORNANO NEL BOSCO ANTICO. ERA TEMPO.', "L'ALBERO MADRE È PIÙ A NORD, LUNGO IL SENTIERO. NOI LO CUSTODIAMO DA PRIMA CHE CADESSE SOLIS.", 'ACCANTO ALL\'ALBERO C\'È IL SANTUARIO DEL BOSCO. CHI HA CORAGGIO PUÒ ENTRARE.'], 'p'],
      ['elfa', 'LIRIEL', ['LE NOSTRE CASE VERE NON SONO ANCORA FINITE: QUESTE LE ABBIAMO TIRATE SU COME FANNO GLI UOMINI.'], 'd'],
      ['elfo', 'THALION', ['CAMMINIAMO SENZA RUMORE E PARLIAMO POCO. MA CHI PORTA RISPETTO AL BOSCO È SEMPRE IL BENVENUTO.'], 'p', { walk: 1 }],
      ['elfoarciere', 'LA SENTINELLA', ['DAGLI ALBERI VEDIAMO CHI ARRIVA DAL SENTIERO MOLTO PRIMA CHE LUI VEDA NOI. TI ABBIAMO VISTO GIÀ AL BIVIO.'], 'd'],
      ['elfa', 'LA TESSITRICE DI LANTERNE', ['INTRECCIAMO LE LANTERNE CON LA SETA DEI RAGNI E LA RESINA DELLE QUERCE: NON SI SPENGONO NEMMENO CON LA PIOGGIA.'], 'd'],
      ['elfo', 'UN GIOVANE ELFO', ["HO CENT'ANNI APPENA COMPIUTI. GLI ANZIANI DICONO CHE SONO ANCORA UN RAGAZZINO."], 'p', { walk: 1 }],
      ['elfa', 'LA CANTORA', ["A OGNI LUNA NUOVA CANTIAMO PER L'ALBERO MADRE. LE SUE RADICI ARRIVANO FIN SOTTO IL VILLAGGIO."], 'p'],
      ['elfoarciere', "L'ARCIERE DELLA RADURA", ['UNA FRECCIA SOLA, E SOLO QUANDO SERVE. IL BOSCO NON AMA CHI SPRECA.'], 'd']] });
  W.PROPS.push(['oakbig', ELFI[0], ELFI[1]], ['lantern', ELFI[0] - 14, ELFI[1] - 10], ['lantern', ELFI[0] + 14, ELFI[1] - 10], ['lantern', ELFI[0] - 14, ELFI[1] + 12], ['lantern', ELFI[0] + 14, ELFI[1] + 12]);
  // la Rocca di Lumen: quattro volte quella di oggi, murata, con quattro porte
  W.FLAT.push([ROCCA[0], ROCCA[1], 640, 30]);   // il pianoro della città
  C.city(Object.assign({ id: 'rocca', guild: true, name: 'ROCCA DI LUMEN', x: ROCCA[0], z: ROCCA[1], w: 820, d: 720, y: 30, style: 'lumen', gates: 'nsw', fitto: true, plaza: { w: 130, d: 110 }, reserve: [[222, -126, 410, 126]],
    people: [
      ['guardia', 'GUARDIA DELLA PORTA', ['BENVENUTO ALLA ROCCA DI LUMEN, LA CITTÀ DEL RE. È QUATTRO VOLTE QUELLA CHE RICORDI.', 'IL MASTIO È IN FONDO AL VIALE, CONTRO LE MURA DI LEVANTE.'], 'p'],
      ['oste', 'OSTE DEL LEONE', ['BENVENUTO ALLA LOCANDA DEL LEONE!'], 'in:leone', { role: 'inn', cost: 10 }],
      ['borghese', 'MASTRO ORAFO', ['ANELLI, AMULETI, PIETRE CHE PORTANO FORTUNA. GUARDA PURE!'], 'in:orafo', { role: 'shop', shop: 'orafo' }],
      ['mercantessa', "L'ERBORISTA", ['ERBE DEI PRATI DI LUMEN, DISTILLATE CON CURA.'], 'in:erbe', { role: 'shop', shop: 'erbe' }],
      ['fabbro', "L'ARMAIOLO DEL RE", ['LE GUARDIE DEL MASTIO SI ARMANO QUI. SE HAI MONETE, ANCHE TU.'], 'in:rocca_armi', { role: 'shop', shop: 'rocca_armi' }],
      ['dama', 'DAMA ISOTTA', ['HAI VISTO QUANTE CASE NUOVE? CI SI PERDE, ORMAI. IO MI ORIENTO CON LA TORRE DEL RE.'], 'p'],
      ['bimbo', 'PAGGIO TEO', ['DA GRANDE FARÒ LA GUARDIA DEL MASTIO!'], 'p', { walk: 1 }],
      ['monaco', 'FRATE ANSELMO', ['A NORD, OLTRE LA FONTE DEI GIRASOLI, CI SONO LE ROVINE DI SOLIS. NESSUNO CI ABITA PIÙ DA MILLE ANNI.'], 'd'],
      ['borghese', 'IL CARRETTIERE', ["LA VIA DEL PONTE DEI RE ESCE DALLA PORTA DI TRAMONTANA E PIEGA A LEVANTE. IL PONTE, PERÒ, NON C'È ANCORA."], 'd'],
      ['guardia', 'GUARDIA DEL MASTIO', ['IL RE RICEVE NEL CORTILE. PARLA CON RISPETTO.'], [245, 14, Math.PI]],
      ['re', 'RE ALDRIC DI LUMEN', ['IL MIO REGNO È CRESCIUTO, VIANDANTE. E OLTRE IL VALICO DEI GIGANTI CI SONO TERRE CHE NEMMENO IO HO MAI VISTO.', 'QUANDO IL VIAGGIO COMINCERÀ AVRÒ UN INCARICO PER TE. PER ORA GUARDA LA MIA CITTÀ, E DIMMI SE TI PIACE.'], [260, -13, Math.PI], { id: 're_gv' }],
      ['guardia', 'GUARDIA DI TRAMONTANA', ['DALLA PORTA DI TRAMONTANA SI VA ALLE ROVINE DI SOLIS E, PIEGANDO A LEVANTE, VERSO IL PONTE DEI RE.'], 'd'],
      ['guardia', 'GUARDIA DI MEZZOGIORNO', ["LA PORTA DI MEZZOGIORNO GUARDA IL MONTE BRACE. È UN VULCANO SPENTO DA SECOLI: NEL CRATERE, ORA, C'È UN LAGO."], 'd'],
      ['lanciere', 'IL LANCIERE DI RONDA', ['FACCIO IL GIRO DELLE MURA TRE VOLTE AL GIORNO. DA QUANDO LA CITTÀ È CRESCIUTA, NON FINISCO PIÙ.'], 'p'],
      ['dama', 'DAMA ELEONORA', ['RE ALDRIC RICEVE CHIUNQUE, NEL CORTILE DEL MASTIO. NON TUTTI I RE LO FANNO.'], 'p'],
      ['borghese', 'IL BANDITORE', ["UDITE, UDITE! LA ROCCA CERCA MURATORI, FABBRI E CARPENTIERI: C'È UN PONTE DA COSTRUIRE, IL PIÙ LUNGO DEL REGNO!"], 'p', { walk: 1 }],
      ['mercante', 'IL MERCANTE DI STOFFE', ['SETE DI ZAFIRA, LANE DEI MONTI... ARRIVERANNO, QUANDO SI POTRÀ PASSARE. PER ORA VENDO QUEL CHE HO.'], 'p', { walk: 1 }],
      ['fioraia', 'LA FIORAIA DELLA PIAZZA', ['GIRASOLI APPENA COLTI! IL PAESE DI GIRASOLE È A NORD-OVEST, SULLA STRADA CHE TAGLIA VERSO IL LAGO.'], 'p'],
      ['mercantessa', 'LA FRUTTIVENDOLA', ['MELE, PERE E UVA DELLE COLLINE DI SOLIS. ASSAGGIA, ASSAGGIA!'], 'd', { walk: 1 }],
      ['saggio', "L'ARCHIVISTA DEL RE", ["NELLE CARTE ANTICHE LUMEN È SOLO UNA DI QUATTRO TERRE: I MONTI DEL CIELO A NORD, L'ORIENTE OLTRE IL PONTE, I MARI DEL SUD.", 'QUATTRO TERRE IN CERCHIO. E IN MEZZO... LÌ LE CARTE SONO BRUCIATE.'], 'd'],
      ['nano', 'UN NANO DI PASSAGGIO', ['VENGO DA FONDOFERRO, SOTTO I MONTI DEL CIELO. HO FATTO IL GIRO LUNGO, PER MARE: IL VALICO È ANCORA CHIUSO DALLA NEVE.', 'VOI UOMINI COSTRUITE IN ALTO. NOI SCAVIAMO. VEDREMO CHI ARRIVA PRIMA DALL\'ALTRA PARTE.'], 'p'],
      ['spadaccino', "IL MAESTRO D'ARMI", ["LE RECLUTE SI ALLENANO DIETRO L'ARMERIA. TU HAI IL PASSO DI UNO CHE HA GIÀ COMBATTUTO."], 'd'],
      ['monaco', 'FRATE BENIAMINO', ['CURIAMO I VIANDANTI CHE ARRIVANO STANCHI DALLA VIA MAESTRA. SE CERCHI UN LETTO, LA LOCANDA DEL LEONE È QUI VICINO.'], 'd'],
      ['bimbo', 'LA PICCOLA GIADA', ['HO CONTATO LE TORRI DELLE MURA: SONO PIÙ DELLE MIE DITA!'], 'p', { walk: 1 }],
      ['donna', 'LA TESSITRICE', ["TESSO GLI STENDARDI DEL RE: IL LEONE D'ORO IN CAMPO AZZURRO. CE NE VUOLE UNO NUOVO PER OGNI TORRE."], 'd'],
      ['borgomastro', 'IL SINISCALCO', ["TENGO I CONTI DEL REGNO. IL PONTE DEI RE COSTERÀ QUANTO TUTTE LE MURA: MA UNIRÀ LUMEN ALL'ORIENTE."], 'd'],
      ['elfa', "UN'ELFA IN VISITA", ['SONO SCESA DAL BOSCO ANTICO PER VEDERE LA CITTÀ DI PIETRA. QUANTO RUMORE FATE, VOI UOMINI!'], 'p', { walk: 1 }]],
    shops: [['leone', 'locanda', 'LOCANDA DEL LEONE', 'n1', { fw: 34, fd: 22, h: 17, wall: 1, roof: 4 }], ['orafo', 'orafo', "L'OREFICERIA DELLA ROCCA", 'n2', { wall: 2, roof: 5 }],
      ['erbe', 'erboristeria', "L'ERBORISTERIA DELLA ROCCA", 'e1', { fw: 22, wall: 0, roof: 4 }], ['rocca_armi', 'armeria', "L'ARMERIA DEL RE", 'w1', { fw: 22, wall: 16, roof: 5 }]] }, W.mastio(ROCCA[0] + 210, ROCCA[1])));   // il mastio del Re, contro le mura di levante
  // l'Albero Madre e, poco a nord, il Santuario del Bosco: quelli di Pixel Saga, al loro posto nuovo (accanto al bivio dei sentieri, in una radura)
  const AM = [ALBERO[0] + 70, ALBERO[1] - 50], SB = [AM[0] + 35, AM[1] - 90];
  W.FLAT.push([AM[0] + 15, AM[1] - 40, 175, null]); W.CLEAR.push([AM[0] - 95, AM[1] - 150, AM[0] + 125, AM[1] + 75]);
  W.BUILD.push({ k: 'albero', x: AM[0], z: AM[1] }, { k: 'temple', x: SB[0], z: SB[1], w: 26, d: 22, h: 16, wall: 11, door: 's', id: 'bosco' });
  W.PROPS.push(['giant', AM[0], AM[1]]); W.bigShadows.push([AM[0], AM[1], 52]);
  for (const deg of [20, 60, 120, 160, 200, 340]) { const a = deg / 360 * Math.PI * 2; W.LATE.props.push(['runa', AM[0] + Math.cos(a) * 44, AM[1] + Math.sin(a) * 44]); }
  W.LATE.props.push(['braciereV', AM[0] - 11, AM[1] + 26], ['braciereV', AM[0] + 11, AM[1] + 26]);
  { const X = SB[0], Z1 = SB[1] + 11;   // il sagrato: lastre dal pronao ai piedi dell'albero, cervi di pietra, custodi, bracieri
    W.PAVE.push(['g', 'rect', X - 30, Z1, X + 30, Z1 + 33], ['g', 'rect', X - 12, Z1 + 33, X + 12, Z1 + 53], ['b', 'rect', X - 7.5, Z1, X + 7.5, Z1 + 53], ['b', 'rect', X - 22, Z1, X + 22, Z1 + 19], ['g', 'disc', X, Z1 + 39, 14], ['b', 'disc', X, Z1 + 39, 10.5]);
    W.LATE.props.push(['cervopietra', X - 19, Z1 + 24, { r: 5.6 }], ['cervopietra2', X + 19, Z1 + 24, { r: 5.6 }], ['custode', X - 19, Z1 + 39, { r: 3.6 }], ['custode', X + 19, Z1 + 39, { r: 3.6 }], ['braciereV', X - 9, Z1 + 20.5], ['braciereV', X + 9, Z1 + 20.5]); }
  C.folk('elfoarciere', 'LA CUSTODE DEL SANTUARIO', SB[0] + 30, SB[1] + 44, Math.PI / 2, ['IL SANTUARIO DEL BOSCO HA DORMITO MILLE ANNI. ORA LE RUNE SI ACCENDONO PER CHI ARRIVA FIN QUI.', 'DENTRO CI SONO PORTE CHIUSE, TRAPPOLE E UN GUARDIANO. NON ENTRARE SENZA POZIONI.']);
  C.folk('elfosaggio', "IL CANTORE DELL'ALBERO", AM[0] - 30, AM[1] + 40, 0, ["QUESTO È L'ALBERO MADRE. ERA GIÀ VECCHIO QUANDO GLI UOMINI ALZARONO LA PRIMA PIETRA DI SOLIS.", 'IL SANTUARIO È LÌ DIETRO, A TRAMONTANA: SEGUI LE LASTRE CHIARE.']);
  // i quattro villaggi: poche case attorno a una piazzetta, sulla strada
  const paese = (id, name, x, z, style, gates, people) => C.city({ id, name, x, z, w: 190, d: 150, style, open: true, small: true, plaza: { w: 44, d: 36 }, gates, people });
  paese('pratolungo', 'PRATOLUNGO', 2300, 5000, 'ambra', 'ew', [
    ['borghese', 'IL FATTORE', ["PRATOLUNGO È TUTTO QUI: QUATTRO CASE, UNA FONTANA E L'ERBA PIÙ ALTA DI LUMEN."], 'p'],
    ['donna', 'LA PASTORA', ['LE PECORE SCENDONO AL MARE DA SOLE E DA SOLE TORNANO. IO LE CONTO SOLO LA SERA.'], 'd', { walk: 1 }],
    ['boscaiolo', 'IL TAGLIALEGNA', ["A PONENTE COMINCIA LA PALUDE D'OMBRA. CI VADO SOLO DI GIORNO, E SOLO FINO AL PRIMO SALICE."], 'd'],
    ['bimbo', 'LA PICCOLA LIA', ['DA GRANDE VOGLIO ANDARE AL BORGO, DOVE CI SONO LE BOTTEGHE. QUI CI SONO SOLO LE PECORE!'], 'p', { walk: 1 }],
    ['mercantessa', 'LA FORMAGGIAIA', ['FORMAGGIO DI PRATOLUNGO: LO COMPRA PERFINO IL CUOCO DEL RE.'], 'p']]);
  paese('cala', 'CALA DELLE CONCHIGLIE', 4704, 7160, 'porto', 'ew', [
    ['pescivendola', 'LA PESCATRICE', ['LE CONCHIGLIE PIÙ BELLE LE PORTA IL MARE DOPO LE BURRASCHE. LE VENDIAMO ALLA ROCCA, PER LE COLLANE DELLE DAME.'], 'p'],
    ['traghettatore', 'IL VECCHIO PESCATORE', ['NELLE GIORNATE LIMPIDE, DALLA SPIAGGIA, SI VEDONO LE ISOLE DEI MARI DEL SUD. UN GIORNO CI ARRIVERÀ UNA NAVE.'], 'd'],
    ['bimbo', 'IL PICCOLO LEO', ['HO TROVATO UNA CONCHIGLIA CHE FA IL RUMORE DEL MARE ANCHE IN CASA!'], 'p', { walk: 1 }],
    ['donna', 'LA RETAIA', ["RAMMENDO LE RETI. OGNI BUCO È UN PESCE CHE SE N'È ANDATO."], 'd'],
    ['borghese', 'IL SALATORE', ['IL PESCE SOTTO SALE ARRIVA FINO AL VALICO SENZA GUASTARSI. IL SALE LO PRENDIAMO DALLE POZZE, A LEVANTE.'], 'd', { walk: 1 }]]);
  paese('girasole', 'GIRASOLE', 5450, 3300, 'sole', 'ew', [
    ['fioraia', 'LA CONTADINA DEI GIRASOLI', ['I GIRASOLI GUARDANO TUTTI VERSO SOLIS. I VECCHI DICONO CHE ASPETTANO CHE IL SOLE CI TORNI.'], 'p'],
    ['borghese', 'IL FRANTOIANO', ["DAI SEMI FACCIAMO L'OLIO PER LE LAMPADE DELLA ROCCA. BRUCIA CHIARO E NON FA FUMO."], 'd', { walk: 1 }],
    ['saggio', 'IL VECCHIO DEL PAESE', ['LE ROVINE DI SOLIS SONO A LEVANTE, OLTRE LE COLLINE. DI NOTTE, TRA LE COLONNE, QUALCOSA CAMMINA ANCORA.', 'IN MEZZO ALLE ROVINE C\'È IL SANTUARIO DEL SOLE. I RE DI SOLIS CI SALIVANO SCALZI.'], 'p'],
    ['bimbo', 'IL PICCOLO NILO', ['IL GIRASOLE PIÙ ALTO DEL PAESE È PIÙ ALTO DI MIO PADRE!'], 'p', { walk: 1 }],
    ['mercante', 'UN MERCANTE DI PASSAGGIO', ['DALLA VIA MAESTRA SI TAGLIA DI QUI PER LA ROCCA. SI RISPARMIA MEZZA GIORNATA, E SI BEVE MEGLIO.'], 'd']]);
  paese('faro', 'APPRODO DEL FARO', 2900, 6990, 'porto', 'ne', [
    ['traghettatore', 'IL GUARDIANO DEL FARO', ['ACCENDO IL FARO OGNI SERA. DA QUANDO LE NAVI NON PASSANO PIÙ, LO ACCENDO PER ABITUDINE.', 'IL FARO È LÌ, SULLA PUNTA A LIBECCIO. AI SUOI PIEDI QUALCUNO HA DIMENTICATO UN BAULE.'], 'p'],
    ['pescivendola', 'LA MOGLIE DEL GUARDIANO', ['QUI UNA VOLTA ATTRACCAVANO I VELIERI DEL SUD. IL MOLO SE L\'È PORTATO VIA UNA MAREGGIATA.'], 'd'],
    ['spadaccino', 'UN MARINAIO A TERRA', ['ASPETTO UN IMBARCO PER I MARI DEL SUD. DICONO CHE IL MOLO NUOVO SI FARÀ: IO INTANTO ASPETTO.'], 'p'],
    ['donna', 'LA LOCANDIERA', ['NON HO PIÙ LA LOCANDA, MA UN PIATTO DI ZUPPA PER CHI ARRIVA A PIEDI DAL BORGO C\'È SEMPRE.'], 'd']]);
  // il faro (quello di Pixel Saga), sulla punta a libeccio dell'Approdo
  W.FLAT.push([2790, 7120, 38, null]); posa(FARO0, 2790 - 1310, 7120 - 3610);
  // le rovine di Solis con il Santuario del Sole: il nucleo è quello di Pixel Saga; attorno, i resti della città (muri smozzicati, colonne, ossa)
  posa(SOLIS0, SOLIS[0] - 3360, SOLIS[1] - 1670);
  for (const [dx, dz, w, d, h, gate] of [[-190, -40, 70, 6, 8], [-170, 60, 6, 80, 10], [-90, -150, 90, 6, 7, 1], [150, -130, 6, 70, 9], [200, 30, 80, 6, 8], [130, 150, 6, 60, 7], [-60, 190, 100, 6, 9, 1], [-250, 150, 6, 70, 6], [260, -70, 6, 60, 10], [20, -240, 110, 6, 8, 1], [-300, -120, 60, 6, 7], [300, 170, 60, 6, 6]])
    W.BUILD.push({ k: 'ruin', x: SOLIS[0] + dx, z: SOLIS[1] + dz, w, d, h, wall: 10, gate: !!gate });
  for (const [dx, dz] of [[-120, -90], [-100, -90], [-80, -90], [110, -40], [110, -20], [110, 0], [-140, 120], [-120, 120], [60, 210], [80, 210], [230, -150], [250, -150], [-220, -200], [180, 230]]) W.PROPS.push(['menhir', SOLIS[0] + dx, SOLIS[1] + dz]);
  for (const [dx, dz] of [[-150, 20], [90, 90], [-40, -180], [210, -20], [-230, 90], [40, 260]]) W.PROPS.push(['bones', SOLIS[0] + dx, SOLIS[1] + dz]);
  // il Santuario del Lago sull'isola, con il passaggio di pietre dalla riva di mezzogiorno
  posa(ISOLA0, lago[0] - 2150, lago[1] - 1340);
  { const guado = [[lago[0] + 20, lago[1] + 90], [lago[0] + 60, lago[1] + 300], [lago[0] + 106, lago[1] + 497]];   // approda sulla riva a levante della foce del fiume
    W.SHAPERS.push({ box: [lago[0] - 30, lago[1] + 60, lago[0] + 150, lago[1] + 540], free: () => true, f: (x, z, h) => h < -1.1 && W.segDist(x, z, guado) < 12 ? -1.1 : h });
    for (let i = 0; i < guado.length - 1; i++) { const [ax, az] = guado[i], [bx, bz] = guado[i + 1], L = Math.hypot(bx - ax, bz - az); for (let t = 6; t < L; t += 11) W.PROPS.push(['stepstone', ax + (bx - ax) * t / L + Math.sin(t * 1.7) * 2, az + (bz - az) * t / L + Math.cos(t * 2.3) * 2, { y: W.WL + 0.15, sink: 0 }]); }
    W.ROADS.push({ w: 5, pts: [[4520, 3620], [4440, 3300], [lago[0] + 121, lago[1] + 530]] }); }
  // il Santuario del Ghiaccio nella Valle Gelata, con la capanna dell'eremita
  W.FLAT.push([GHIACCIO[0] + 30, GHIACCIO[1] + 62, 110, null]); posa(GHIACCIO0, GHIACCIO[0] - 660, GHIACCIO[1] - 598);
  C.folk('montanaro', "L'EREMITA DELLA VALLE", GHIACCIO[0] + 88, GHIACCIO[1] + 114, 3.4, ['QUASSÙ NON SALE NESSUNO DA ANNI. TU SEI IL PRIMO CHE VEDO DA QUANDO HO SMESSO DI CONTARE GLI INVERNI.', 'IL SANTUARIO DEL GHIACCIO È APERTO, MA DENTRO IL FREDDO MORDE. PORTA QUALCOSA DI CALDO, E UNA BUONA SPADA.']);
  // il Nido del Grifone: in cima alle rupi, un forziere
  W.FLAT.push([GRIFONE[0], GRIFONE[1], 70, null]); W.CHESTS.push(['gv_c10', GRIFONE[0] + 2, GRIFONE[1] + 5, 'monete:300', 2]);
  // i nemici: quelli dell'isola di sempre al loro posto nuovo, e attorno a ogni branco altri due (la terra è più grande); niente branchi addosso a città e villaggi
  { const abitati = [[3944, 5022, 210, 170], [6300, 4750, 410, 360], [1750, 3180, 125, 105], [2300, 5000, 95, 75], [4704, 7160, 95, 75], [5450, 3300, 95, 75], [2900, 6990, 95, 75], [3660, 4350, 215, 165], [AM[0] + 15, AM[1] - 40, 110, 110], [2790, 7120, 40, 40]];
    const libero = (x, z) => !abitati.some(c => Math.abs(x - c[0]) < c[2] + 170 && Math.abs(z - c[1]) < c[3] + 170);
    for (const [x, z, t, n, r] of CAMPI0) { const q = T(x, z), tipo = t === 'imp' ? 'bandit' : t;
      [[0, 0, n], [310, 2.1, Math.max(2, n - 1)], [310, 4.2, Math.max(2, n - 1)]].forEach(([d, a, k]) => { const ang = a + x * 0.01, cx = Math.round(q[0] + Math.cos(ang) * d), cz = Math.round(q[1] + Math.sin(ang) * d); if (libero(cx, cz)) W.CAMPS.push([cx, cz, tipo, k, Math.round(r * 1.2)]); }); }
    W.CAMPS.push([5400, 150, 'icewolf', 3, 100], [5000, -650, 'icewolf', 3, 100], [5380, -1250, 'icewolf', 2, 90], [3520, -760, 'icewolf', 3, 100]);   // la gola del Valico e la valle nascosta
    W.CAMPS.push([3650, 4400, 'bat', 3, 28], [3566, 4320, 'slimeB', 2, 18], [3750, 4326, 'slimeB', 2, 16]); }                                      // nella Tana del Tasso
  // le strade: maestre (lastricate) tra le città e verso i passaggi, minori verso villaggi e segreti
  const via = (w, pts) => W.ROADS.push({ w, pts });
  const BE = [4160, 5022], BN = [3944, 4846], BS = [3944, 5198], BW2 = [3728, 5022], RW = [5866, 4750], RE = [6734, 4750], RN = [6300, 4366], RS = [6300, 5134];   // dove le strade toccano le città (le porte)
  via(9, [BE, [4440, 5090], [4630, 5090], [5450, 4880], RW]);
  via(9, [[6230, 4100], [6750, 4130], [7200, 4020], PONTE]);   // la via del Ponte dei Re si stacca da quella di Solis, fuori dalla porta di tramontana
  via(9, [BN, [4120, 4350], [4190, 4000], [4380, 4000], [4520, 3620], [4950, 3050], [5250, 2300], [5200, 1400], [5144, 950], [5260, 100], [5150, -700], [5230, -1300], [5200, -2040]]);
  via(9, [RN, [6230, 4100], [6129, 3844], [6350, 3450], [SOLIS[0] - 30, SOLIS[1] + 64]]);   // fino alla porta nel muro delle rovine
  via(5, [BN, [3500, 4500], [2800, 3700], [2350, 3000], ALBERO]); via(5, [[2350, 3000], [2060, 3110], [1880, 3180]]); via(5, [ALBERO, [1900, 2000], [1600, 1500], [GHIACCIO[0], GHIACCIO[1] + 50]]); via(5, [ALBERO, [AM[0], AM[1] + 46]]); via(5, [BS, [3700, 5900], [3200, 6500], [2900, 6909]]);
  via(5, [[3001, 6990], [3800, 7160], [4030, 7160], [4210, 7160], [4603, 7160]]); via(5, [[4805, 7160], [5600, 7000], [6300, 6500], [6450, 6150]]); via(5, [RS, [6430, 5450], [6500, 5760]]); via(5, [SOLIS, [6900, 2500], GRIFONE]);
  via(5, [BW2, [3100, 5050], [2401, 5000]]); via(5, [[2199, 5000], [1500, 4900]]); via(5, [[4950, 3050], [5349, 3300]]); via(5, [[5551, 3300], [6129, 3844]]);
  // il Poggio del Tasso: una rupe a nord-ovest del Borgo, lungo il sentiero del Bosco Antico. Dentro c'è la prima grotta aperta (di prova):
  // un invito tra due pareti, la bocca, un corridoio, una sala e due rami. Ci si entra a piedi, senza cambiare mondo.
  const POG = [3660, 4350];
  W.SHAPERS.push({ box: [POG[0] - 260, POG[1] - 210, POG[0] + 260, POG[1] + 210], free: () => true,
    f: (x, z, h) => { const s = Math.hypot((x - POG[0]) / 215, (z - POG[1]) / 165) * (1 + (W.fbm(x / 80, z / 80, 2) - 0.5) * 0.14); return s >= 1 ? h : h + (58 + 14 * (W.fbm(x / 45, z / 45, 3) - 0.5)) * W.smooth(1, 0.78, s); } });
  W.GROTTE.push({ id: 'tasso', y: 25, musica: 'grotta:cristalli', rami: [
    [[3656, 4544, 12], [3656, 4496, 14], [3656, 4448, 15], [3650, 4398, 36]],
    [[3650, 4398, 36], [3600, 4350, 15], [3566, 4316, 28]],
    [[3650, 4398, 36], [3712, 4362, 15], [3752, 4322, 26]]] });
  W.PLACES.push([3656, 4400, 150, 'TANA DEL TASSO']);
  via(5, [[3656, 4622], [3656, 4504]]);   // il viottolo che si stacca dal sentiero e arriva alla bocca
  { const buio = { lit: 0.46 }, luce = (r, g, b) => ({ glow: [5, 8, r, g, b, 1] });
    W.PROPS.push(['torch', 3640, 4520], ['torch', 3672, 4520],
      ['crystal', 3758, 4310, luce(0.3, 0.7, 1)], ['crystal', 3768, 4326, luce(0.3, 0.7, 1)], ['crystal', 3744, 4302, luce(0.55, 0.4, 1)], ['crystal', 3738, 4336, {}], ['crystal', 3764, 4338, {}],
      ['crystal', 3664, 4374, luce(0.3, 0.7, 1)], ['crystal', 3624, 4388, {}], ['crystal', 3548, 4302, luce(0.55, 0.4, 1)], ['crystal', 3580, 4296, {}],
      ['menhir', 3632, 4416, buio], ['menhir', 3672, 4408, buio], ['menhir', 3640, 4376, buio], ['menhir', 3588, 4328, buio], ['menhir', 3552, 4330, buio], ['menhir', 3724, 4348, buio],
      ['rock', 3664, 4460, buio], ['rock', 3644, 4432, buio], ['rock', 3676, 4384, buio], ['rock', 3610, 4364, buio], ['rock', 3574, 4334, buio], ['rock', 3700, 4372, buio], ['rock', 3742, 4318, buio], ['bones', 3562, 4322, buio], ['bones', 3654, 4404, buio]);
    for (const [x, z] of [[3662, 4470], [3636, 4402], [3660, 4420], [3608, 4352], [3560, 4306], [3572, 4322], [3716, 4358], [3750, 4330], [3734, 4310]]) W.PROPS.push(['mushroom', x, z, { lit: 1.15 }]); }
  W.CHESTS.push(['gv_tasso', 3560, 4312, 'lanterna', 2]);   // in fondo al ramo di ponente: la lanterna del minatore
  // i ponti di pietra sul fiume, dove lo passano le strade: quello del Borgo, quello della via del nord, quello della costa
  for (const [a0, a1, c] of [[4474, 4594, 5090], [4223, 4343, 4000], [4058, 4178, 7160]]) m.town.addBridge({ axis: 'x', a0, a1, c, y: 6, towers: false, ramps: false });
};
})();
