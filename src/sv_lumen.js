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
  const W = m.world, B = W.B;
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
  Object.assign(W.RIVER, { pts: [[2170, 1560], [2200, 1800], [2160, 2050], [2250, 2350], [2320, 2600], [2290, 2880], [2200, 3180], [2130, 3480], [2090, 3780], [2075, 4100]].map(p => T(p[0], p[1])), w: 42, fords: [[4533, 5121]] });
  delete W.RIVER.box; W.RIVERS.push(W.RIVER);
  // valli scavate: la gola del Valico dei Giganti (sale verso nord) e la valle nascosta
  W.CARVE.push({ pts: [[5144, 950, 45], [5260, 100, 95], [5150, -700, 150], [5230, -1300, 205], [5200, -2100, 240]], w: 70, w2: 460 });
  W.CARVE.push({ pts: [[3250, -930, 180], [3850, -900, 180]], w: 230, w2: 560 });
  // i luoghi
  const BORGO = [3944, 5022], ROCCA = [6300, 4750], SOLIS = T(3360, 1670), ALBERO = T(1080, 1420), FARO = T(1440, 3700), PONTE = [7560, 3790], GHIACCIO = T(660, 598), GRIFONE = T(3700, 900);
  W.FLAT.push([BORGO[0], BORGO[1], 330, null], [ROCCA[0], ROCCA[1], 560, null], [SOLIS[0], SOLIS[1], 430, null], [2300, 5000, 90, null], [4704, 7150, 90, null], [5450, 3300, 90, null]);
  W.PLACES.push([BORGO[0], BORGO[1], 330, 'BORGO AURORA'], [ROCCA[0], ROCCA[1], 560, 'ROCCA DI LUMEN'], [SOLIS[0], SOLIS[1], 430, 'ROVINE DI SOLIS'], [ALBERO[0], ALBERO[1], 200, "L'ALBERO MADRE"], [lago[0], lago[1], 110, 'ISOLA DEL LAGO'],
    [picco[0], picco[1], 250, 'VETTA DEL DRAGO'], [brace[0], brace[1], 220, 'CRATERE DEL BRACE'], [5200, -1750, 300, 'VALICO DEI GIGANTI'], [3520, -930, 400, 'VALLE NASCOSTA'], [PONTE[0], PONTE[1], 300, 'PONTE DEI RE'],
    [2300, 5000, 150, 'PRATOLUNGO'], [4704, 7150, 150, 'CALA DELLE CONCHIGLIE'], [5450, 3300, 150, 'GIRASOLE'], [FARO[0], FARO[1], 150, 'APPRODO DEL FARO']);
  W.TOWNS.push({ x: BORGO[0], z: BORGO[1], name: 'BORGO AURORA', big: true, home: true }, { x: ROCCA[0], z: ROCCA[1], name: 'ROCCA DI LUMEN', big: true });
  // le strade: maestre (lastricate) tra le città e verso i passaggi, minori verso villaggi e segreti
  const via = (w, pts) => W.ROADS.push({ w, pts });
  via(9, [BORGO, [4700, 5150], [5500, 4950], ROCCA]);
  via(9, [ROCCA, [6900, 4350], [7300, 3950], PONTE]);
  via(9, [BORGO, [4150, 4300], [4450, 3600], [4950, 3050], [5250, 2300], [5200, 1400], [5144, 950], [5260, 100], [5150, -700], [5230, -1300], [5200, -2040]]);
  via(9, [ROCCA, [6200, 4250], [6129, 3844], [6350, 3450], SOLIS]);
  via(5, [BORGO, [3300, 4500], [2800, 3700], [2350, 3000], ALBERO]); via(5, [ALBERO, [1900, 2000], [1600, 1500], GHIACCIO]); via(5, [BORGO, [3700, 5900], [3200, 6500], FARO]);
  via(5, [FARO, [3800, 7150], [4704, 7180], [5600, 7000], [6300, 6500], [6450, 6150]]); via(5, [ROCCA, [6450, 5300], [6500, 5760]]); via(5, [SOLIS, [6900, 2500], GRIFONE]);
  via(5, [BORGO, [3100, 5050], [2300, 5000], [1500, 4900]]); via(5, [[4950, 3050], [5450, 3300], [6129, 3844]]);
};
})();
