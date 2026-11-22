// ===================== PIXEL SAGA · il gioco =====================
// Avventura fantasy in un mondo aperto: si esplora a schermo intero, in orizzontale.
GAMES.push((() => {
const A = SG.art, MU = SG.music, TAU = Math.PI * 2;
let W = SG.world;   // la terra dove si cammina (le terre possono essere più d'una: vedi TERRE)
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const hexf = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const RAR = ['#e6e9f2', '#5cb8ff', '#c77dff', '#ffb02e'], RARN = ['COMUNE', 'RARO', 'EPICO', 'LEGGENDARIO'];
let SAVEKEY = 'sg_save1';
// Lo stesso motore fa due giochi: Pixel Saga (MODO null) e l'anteprima del Grande Viaggio, sulla terra nuova di Lumen (MODO 'lumen').
// Il mondo in memoria è uno solo: per passare dall'uno all'altro Pixel Box si ricarica, con il gioco voluto già scelto.
let MODO = null, modoScelto = false;
const INIZIO = () => MODO ? { x: 3944, z: 5078 } : { x: 2005, z: 2700 };

// ---------- oggetti ----------
const IT = {
  legno: { n: 'SPADA DI LEGNO', t: 'arma', r: 0, att: 2, d: 'UN BASTONE CON LE AMBIZIONI DI UNA SPADA.', look: { col: '#b8885a', guard: '#6a4424' } },
  ferro: { n: 'SPADA DI FERRO', t: 'arma', r: 0, att: 4, d: 'FORGIATA DA BRUNO, IL FABBRO DEL BORGO.', look: { col: '#c8d0dc', guard: '#8a8a92' } },
  argento: { n: "SPADA D'ARGENTO", t: 'arma', r: 1, att: 6, d: 'LEGGERA E LUCENTE COME LA LUNA.', look: { col: '#f0f6ff', guard: '#c8a040', len: 1 } },
  runica: { n: 'SPADA RUNICA', t: 'arma', r: 2, att: 9, d: 'LE RUNE SULLA LAMA VIBRANO NEL BUIO.', look: { col: '#9a7af0', guard: '#4a3a7a', glow: '#e8dcff', len: 2 } },
  ascia: { n: 'ASCIA DEL GIGANTE', t: 'arma', r: 2, att: 10, d: 'PESANTE COME UN MACIGNO.', look: { kind: 'axe', col: '#c8d0dc' } },
  aurora: { n: "LAMA DELL'AURORA", t: 'arma', r: 3, att: 14, d: 'FORGIATA CON LA PRIMA LUCE DEL MONDO, E SEPOLTA DOVE LA LUCE NON ARRIVA.', look: { col: '#ffe8a0', guard: '#ffb02e', glow: '#ffffff', len: 3 } },
  tunica: { n: 'TUNICA DA VIAGGIO', t: 'armatura', r: 0, dif: 0, d: 'COMODA, MA NON FERMA NEMMENO UNA SPINA.', look: { shirt: '#3e8a4a', pants: '#4a5a7a', belt: '#6a4424' } },
  giaco: { n: 'GIACO DI CUOIO', t: 'armatura', r: 0, dif: 1, d: 'CUOIO SPESSO E BEN CUCITO.', look: { shirt: '#8a5a34', sleeve: '#6a4424', belt: '#3a2a1a', pants: '#5a4a3a' } },
  cotta: { n: 'COTTA DI MAGLIA', t: 'armatura', r: 1, dif: 2, d: 'MIGLIAIA DI ANELLI DI FERRO INTRECCIATI.', look: { shirt: '#9aa4b2', sleeve: '#8a94a2', belt: '#4a3a2a', pants: '#4a4a5a', cape: '#3a5a9a' } },
  acciaio: { n: "ARMATURA D'ACCIAIO", t: 'armatura', r: 2, dif: 3, d: 'LA PORTAVANO I CAVALIERI DELLA ROCCA.', look: { shirt: '#c8d0dc', plate: '#e8eef6', pauldron: '#c8d0dc', belt: '#5a4a3a', pants: '#5a6070', cape: '#8a2a2a' } },
  drago: { n: 'ARMATURA DEL DRAGO', t: 'armatura', r: 3, dif: 8, hp: 2, fire: true, d: 'SCAGLIE CHE NESSUNA FIAMMA BRUCIA E NESSUNA LAMA SCALFISCE: CAMMINI SULLA LAVA. +1 CUORE.', look: { shirt: '#c8342c', plate: '#f0b040', pauldron: '#8a1e1a', belt: '#f0b040', pants: '#5a1e1a', cape: '#3a1414' } },
  elmoFerro: { n: 'ELMO DI FERRO', t: 'elmo', r: 1, dif: 1, d: 'UN ELMO SOLIDO, CON IL PARANASO.', look: { helm: { c: '#9aa4b2', nose: true } } },
  alato: { n: 'ELMO ALATO', t: 'elmo', r: 2, dif: 2, d: "LE ALI D'ARGENTO SEMBRANO VERE.", look: { helm: { c: '#c8d0dc', wings: '#ffffff' } } },
  corona: { n: 'CORONA DEL RE ANTICO', t: 'elmo', r: 3, dif: 4, hp: 4, swim: true, d: "CHI LA PORTA NON TEME NÉ LAME NÉ ABISSI: RESPIRI SOTT'ACQUA. +2 CUORI.", look: { helm: { c: '#ffc83a', crown: true, gem: '#e8304a' } } },
  scudoLegno: { n: 'SCUDO DI LEGNO', t: 'scudo', r: 0, dif: 1, d: 'IL VECCHIO SCUDO DI OTTO.', look: { shield: '#8a5e34' } },
  scudoFerro: { n: 'SCUDO DI FERRO', t: 'scudo', r: 1, dif: 2, d: 'AMMACCATO, MA ANCORA FORTE.', look: { shield: '#9aa4b2', emblem: '#c8342c' } },
  grifone: { n: 'SCUDO DEL GRIFONE', t: 'scudo', r: 3, dif: 6, reflect: true, d: 'LE PIUME DORATE DEVIANO OGNI COLPO, E RESPINGONO QUELLI MAGICI.', look: { shield: '#3a6ab0', emblem: '#ffc83a' } },
  anelloVita: { n: 'ANELLO DI VITA', t: 'acc', r: 1, hp: 2, d: 'BRILLA DI UNA LUCE CALDA. +1 CUORE.', ico: 'ring' },
  anello2: { n: 'ANELLO DEL FALCO', t: 'acc', r: 1, vel: 0.15, d: 'CHI LO PORTA CORRE PIÙ SVELTO. +15% VELOCITÀ.', ico: 'ring' },
  vento: { n: 'STIVALI DEL VENTO', t: 'acc', r: 2, vel: 0.35, d: 'PIÙ VELOCI DEL VENTO. +35% VELOCITÀ.', ico: 'boots' },
  luna: { n: 'AMULETO DELLA LUNA', t: 'acc', r: 3, regen: 1, hp: 4, att: 2, d: 'LA LUCE DELLA LUNA RICUCE OGNI FERITA E GUIDA IL BRACCIO. +2 CUORI, ATT +2.', ico: 'amulet' },
  zanna: { n: "ZANNA DELL'INVERNO", t: 'arma', r: 3, att: 19, beam: true, d: 'UNA LAMA DI GHIACCIO CHE NON SI SCIOGLIE. A OGNI COLPO LANCIA UN RAGGIO GELIDO.', look: { col: '#cfeaff', guard: '#5a8ac0', glow: '#ffffff', len: 3 } },
  guanti: { n: 'GUANTI DEL GIGANTE', t: 'acc', r: 2, att: 4, d: 'CUOIO SPESSO E BORCHIE DI FERRO: OGNI COLPO PESA IL DOPPIO. ATT +4.', ico: 'ring' },
  lanterna: { n: 'LANTERNA DEL MINATORE', t: 'acc', r: 2, dif: 1, light: 1, d: 'NON SI SPEGNE MAI: NEL BUIO VEDI MOLTO PIÙ LONTANO. DIF +1.', ico: 'amulet' },
  calamita: { n: 'CALAMITA DEL CERCATORE', t: 'acc', r: 2, luck: 1, magnet: 1, d: 'MONETE E CUORI VOLANO DA TE ANCHE DA LONTANO, E I NEMICI NE LASCIANO IL DOPPIO.', ico: 'amulet' },
  cuore: { n: 'CUORE DI CRISTALLO', t: 'cuore', r: 1, d: 'UN CUORE IN PIÙ, PER SEMPRE.' },
  pozione: { n: 'POZIONE', t: 'pozione', r: 0, d: 'RIDÀ 3 CUORI. SI USA DAL MENU (START).' },
  mappa: { n: 'MAPPA DEI TESORI', t: 'mappa', r: 2, d: "SEGNA SULLA MAPPA I FORZIERI PIÙ RICCHI ALL'APERTO. I TESORI PIÙ GRANDI, PERÒ, STANNO SOTTOTERRA." },
  // capitolo 2: i tesori dei santuari
  radici: { n: 'SCUDO DELLE RADICI', t: 'scudo', r: 3, dif: 5, reflect: true, d: 'RESPINGE I COLPI MAGICI CHE TI ARRIVANO DI FRONTE (QUANDO NON ATTACCHI).', look: { shield: '#4a7a30', emblem: '#c8f08a' } },
  maree: { n: 'ELMO DELLE MAREE', t: 'elmo', r: 3, dif: 3, hp: 2, swim: true, d: "CON QUESTO ELMO RESPIRI SOTT'ACQUA E CAMMINI SUL FONDO DELL'ACQUA PROFONDA. +1 CUORE.", look: { helm: { c: '#3a8ac8', wings: '#bff0ff' } } },
  solare: { n: 'LAMA DEL SOLE', t: 'arma', r: 3, att: 16, beam: true, d: 'A OGNI COLPO LANCIA UN RAGGIO DI LUCE CHE ARRIVA LONTANO.', look: { col: '#fff0a0', guard: '#ffb02e', glow: '#ffffff', len: 3 } },
  brina: { n: 'ARMATURA DI BRINA', t: 'armatura', r: 3, dif: 6, fire: true, d: 'IL SUO GELO SPEGNE OGNI FIAMMA: CAMMINI SULLA LAVA SENZA BRUCIARTI.', look: { shirt: '#8ab8e0', plate: '#e8f4ff', pauldron: '#bfe0ff', belt: '#5a7aa8', pants: '#4a6a90', cape: '#e8f4ff' } },
  fenice: { n: 'AMULETO DELLA FENICE', t: 'acc', r: 3, regen: 1, hp: 2, d: '+1 CUORE. LE FERITE SI RIMARGINANO DA SOLE, COME LE PIUME DELLA FENICE.', ico: 'amulet' },
  sigillo: { n: 'SIGILLO DEL RE', t: 'chiave', r: 3, d: 'IL RUBINO DEI RE DI LUMEN: APRE I SANTUARI, UNO ALLA VOLTA.' },
  chiave: { n: 'PICCOLA CHIAVE', t: 'chiave', r: 0, d: 'APRE UNA PORTA CHIUSA DI QUESTO SANTUARIO.' },
  grandeChiave: { n: 'GRANDE CHIAVE', t: 'chiave', r: 2, d: 'APRE LA PORTA DEL GUARDIANO.' },
  pBosco: { n: "PIETRA DELL'ALBA DEL BOSCO", t: 'pietra', r: 3, c: '#5af07a', d: 'BRILLA DELLA LUCE VERDE DELLE FORESTE.' },
  pLago: { n: "PIETRA DELL'ALBA DEL LAGO", t: 'pietra', r: 3, c: '#5ac8ff', d: 'BRILLA DELLA LUCE AZZURRA DELLE ACQUE.' },
  pSole: { n: "PIETRA DELL'ALBA DEL SOLE", t: 'pietra', r: 3, c: '#ffd23f', d: 'BRILLA DELLA LUCE DORATA DI SOLIS.' },
  pGhiaccio: { n: "PIETRA DELL'ALBA DEL GHIACCIO", t: 'pietra', r: 3, c: '#bff0ff', d: 'BRILLA DELLA LUCE BIANCA DEI GHIACCI.' },
  pFuoco: { n: "PIETRA DELL'ALBA DEL FUOCO", t: 'pietra', r: 3, c: '#ff5a3a', d: 'BRILLA DELLA LUCE ROSSA DEL VULCANO.' },
  // armi, armature e amuleti nuovi: nei negozi e nelle grotte nascoste
  pugnale: { n: 'PUGNALE DEL LADRO', t: 'arma', r: 0, att: 3, d: 'CORTO E AFFILATO. MEGLIO DI UN BASTONE.', look: { col: '#d8dce4', guard: '#5a3a20', len: -2.5 } },
  lancia: { n: 'LANCIA DEL CACCIATORE', t: 'arma', r: 1, att: 6, d: 'LA USAVANO I CACCIATORI DI LUPI DEL BOSCO.', look: { kind: 'spear', col: '#c8d0dc' } },
  mazza: { n: 'MAZZA FERRATA', t: 'arma', r: 1, att: 7, d: 'NON È ELEGANTE, MA FA IL SUO LAVORO.', look: { kind: 'hammer', col: '#6a6e78' } },
  bastone: { n: 'BASTONE DEL SAGGIO', t: 'arma', r: 2, att: 8, regen: 1, d: 'LA SFERA IN CIMA RICUCE LE FERITE A POCO A POCO.', look: { kind: 'staff', col: '#7ae0ff' } },
  martello: { n: 'MARTELLO DI BRUNO', t: 'arma', r: 2, att: 12, d: 'IL CAPOLAVORO DELLA FUCINA: PESA COME UN SOMARO.', look: { kind: 'hammer', col: '#c8d0dc' } },
  mantello: { n: 'MANTELLO DEL BOSCO', t: 'armatura', r: 2, dif: 2, vel: 0.15, d: 'LEGGERO COME UNA FOGLIA. +15% VELOCITÀ.', look: { shirt: '#4a8a3a', sleeve: '#3a7a30', belt: '#6a4424', pants: '#3a4a2a', cape: '#2e6a24' } },
  scaglie: { n: 'CORAZZA A SCAGLIE', t: 'armatura', r: 2, dif: 4, d: 'CENTINAIA DI SCAGLIE DI BRONZO CUCITE SUL CUOIO.', look: { shirt: '#b08a3a', plate: '#e0b860', pauldron: '#a07a2a', belt: '#5a3a1a', pants: '#5a4a3a' } },
  ombra: { n: "VESTE D'OMBRA", t: 'armatura', r: 3, dif: 4, vel: 0.2, d: 'TESSUTA CON IL BUIO DELLE GROTTE. +20% VELOCITÀ.', look: { shirt: '#4a2a7a', sleeve: '#3a2066', belt: '#e0b040', pants: '#2a1e44', cape: '#6a3aaa' } },
  cappuccio: { n: 'CAPPUCCIO DEL VIANDANTE', t: 'elmo', r: 0, dif: 0, vel: 0.08, d: 'TIENE LONTANI IL VENTO E LA PIOGGIA. +8% VELOCITÀ.', look: { hood: '#7a6a3a' } },
  elmoCuoio: { n: 'ELMO DI CUOIO', t: 'elmo', r: 0, dif: 1, d: 'CUOIO BOLLITO, DURO COME IL LEGNO.', look: { helm: { c: '#8a5a34' } } },
  cappello: { n: 'CAPPELLO DEL MAGO', t: 'elmo', r: 2, dif: 1, hp: 2, d: 'APPARTENEVA A UN MAGO MOLTO DISTRATTO. +1 CUORE.', look: { hat: '#3a4aaa' } },
  brocchiere: { n: 'BROCCHIERE', t: 'scudo', r: 0, dif: 1, d: 'UNO SCUDO PICCOLO E TONDO, LEGGERISSIMO.', look: { shield: '#a07a4a', emblem: '#d8dce4' } },
  torre: { n: 'SCUDO A TORRE', t: 'scudo', r: 2, dif: 3, d: 'ALTO COME UNA PORTA: DIETRO CI SI STA COMODI.', look: { shield: '#5a6a8a', emblem: '#ffd23f' } },
  trifoglio: { n: 'QUADRIFOGLIO', t: 'acc', r: 1, luck: true, d: 'PORTA FORTUNA: I MOSTRI LASCIANO IL DOPPIO DELLE MONETE.', ico: 'clover' },
  talismano: { n: 'TALISMANO DI PIETRA', t: 'acc', r: 1, dif: 1, d: 'UNA PIETRA LISCIA CON INCISA UNA RUNA. DIF +1.', ico: 'amulet' },
  anelloForza: { n: 'ANELLO DELLA FORZA', t: 'acc', r: 2, att: 3, d: 'IL BRACCIO SI FA PESANTE COME IL FERRO. ATT +3.', ico: 'ring' },
  piuma: { n: 'PIUMA DEL GRIFONE', t: 'acc', r: 2, vel: 0.25, dif: 1, d: 'UNA PIUMA DORATA CHE TI FA LEGGERO. +25% VELOCITÀ, DIF +1.', ico: 'feather' },
  elisir: { n: 'ELISIR', t: 'elisir', r: 1, d: 'RIDÀ TUTTI I CUORI. SI BEVE DAL MENU (START).' },
  // il grande viaggio: tesori e mercanzie delle terre oltre il Ponte dei Re
  scimitarra: { n: 'SCIMITARRA DI ZAFIRA', t: 'arma', r: 2, att: 11, d: 'UNA LAMA CURVA TEMPRATA NELLA SABBIA ROVENTE.', look: { col: '#e8eef6', guard: '#e8b42a', len: 1 } },
  tridente: { n: 'TRIDENTE DEL NOSTROMO', t: 'arma', r: 2, att: 10, vel: 0.1, d: 'LEGGERO E LUNGO, BUONO PER I PESCI E PER I PREDONI. +10% VELOCITÀ.', look: { kind: 'spear', col: '#5ad0e8' } },
  katana: { n: 'LAMA DEI PETALI', t: 'arma', r: 3, att: 15, vel: 0.12, d: 'TAGLIA UN PETALO CHE CADE SENZA FERMARLO. +12% VELOCITÀ.', look: { col: '#f8f8ff', guard: '#c85a7a', glow: '#ffd8e8', len: 3 } },
  seta: { n: 'VESTE DI SETA', t: 'armatura', r: 1, dif: 2, vel: 0.1, d: 'SETA FITTA COME UNA MAGLIA DI FERRO, MA NON PESA NULLA. +10% VELOCITÀ.', look: { shirt: '#c85a8a', sleeve: '#e07aa8', belt: '#ffd23f', pants: '#4a3a6a' } },
  pelliccia: { n: 'PELLICCIA DEL NORD', t: 'armatura', r: 2, dif: 4, hp: 2, d: "PELO D'ORSO BIANCO SU CUOIO SPESSO. +1 CUORE.", look: { shirt: '#e8e8f0', sleeve: '#c8d0dc', pauldron: '#f4f8ff', belt: '#6a4424', pants: '#4a5a6a', cape: '#e8e8f0' } },
  eclisse: { n: "ARMATURA DELL'ECLISSE", t: 'armatura', r: 3, dif: 7, d: 'NERA COME IL SOLE CHE SI SPEGNE. NIENTE LA SCALFISCE.', look: { shirt: '#2a1e3a', plate: '#4a3a6a', pauldron: '#8a5ae0', belt: '#c8a0ff', pants: '#1e1628', cape: '#5a2a7a' } },
  turbante: { n: 'TURBANTE DEL DESERTO', t: 'elmo', r: 1, dif: 1, hp: 2, d: 'TIENE LA TESTA FRESCA ANCHE SOTTO IL SOLE DELLE DUNE. +1 CUORE.', look: { turban: '#f0ece0', gem: '#e8364e' } },
  kabuto: { n: 'ELMO DEL GUERRIERO', t: 'elmo', r: 2, dif: 3, d: 'LACCA NERA E CORNA DORATE: IL NEMICO SCAPPA SOLO A VEDERLO.', look: { helm: { c: '#3a2a3a', spike: true } } },
  madreperla: { n: 'SCUDO DI MADREPERLA', t: 'scudo', r: 2, dif: 4, d: 'LA CONCHIGLIA DI UN GIGANTE DEL MARE, LUCIDA COME UNO SPECCHIO.', look: { shield: '#e8f4ff', emblem: '#f8a8c8' } },
  bussola: { n: 'BUSSOLA DEL CAPITANO', t: 'acc', r: 2, vel: 0.3, dif: 1, d: 'CHI SA DOVE ANDARE ARRIVA PRIMA. +30% VELOCITÀ, DIF +1.', ico: 'amulet' },
  perla: { n: 'PERLA DELLA LAGUNA', t: 'acc', r: 3, hp: 4, regen: 1, d: 'GRANDE COME UN PUGNO. +2 CUORI, E LE FERITE SI RIMARGINANO.', ico: 'amulet' },
  alleanza: { n: "STELLA DELL'ALLEANZA", t: 'acc', r: 3, att: 3, dif: 2, hp: 2, d: 'CINQUE POPOLI, UN SOLO GIURAMENTO. ATT +3, DIF +2, +1 CUORE.', ico: 'amulet' },
};
const SLOTS = [['arma', 'ARMA'], ['armatura', 'ARMATURA'], ['elmo', 'ELMO'], ['scudo', 'SCUDO'], ['acc', 'ACCESSORIO']];
function itemIcon(id) {
  const it = IT[id]; if (!it) return null;
  if (iconCache[id]) return iconCache[id];
  let c;
  if (it.t === 'arma') { const k = it.look.kind; c = k === 'axe' ? A.icon('axe', it.look.col, '#a07040') : k === 'spear' ? A.icon('spear', it.look.col, '#a07040') : k === 'hammer' ? A.icon('hammer', it.look.col, '#a07040') : k === 'staff' ? A.icon('staff', it.look.col, '#a07040') : k === 'bow' ? A.icon('bow', it.look.col, it.look.str || '#f0e8d8') : k === 'dagger' ? A.icon('dagger', it.look.col, it.look.guard || '#c8a040') : k === 'wand' ? A.icon('staff', it.look.col, it.look.wood || '#a07040') : A.icon('sword', it.look.col, it.look.guard || '#c8a040'); }
  else if (it.t === 'armatura') c = A.icon('armor', it.look.shirt, it.look.plate || '#fff4b0');
  else if (it.t === 'elmo') c = it.look.hood ? A.icon('hood', it.look.hood) : it.look.hat ? A.icon('hat', it.look.hat, '#ffe14a') : A.icon('helm', it.look.helm ? it.look.helm.c : '#3e6a3a', '#ffe14a');
  else if (it.t === 'scudo') c = A.icon('shield', it.look.shield, it.look.emblem || '#e8d0a0');
  else if (it.t === 'acc') c = it.ico === 'clover' ? A.icon('clover', '#4ab84a', '#9af07a') : it.ico === 'feather' ? A.icon('feather', '#ffc83a', '#fff4b0') : A.icon(it.ico, it.r === 3 ? '#cfe8ff' : id === 'talismano' ? '#9aa4b2' : '#ffc83a', '#e8304a');
  else if (it.t === 'elisir') c = A.icon('potion', '#3a8ae8', '#bfe8ff');
  else if (it.t === 'cuore') c = A.icon('heart', '#ff4a6a', '#ffd0d8');
  else if (it.t === 'pozione') c = A.icon('potion', '#e8304a', '#ffb0c0');
  else if (it.t === 'chiave') c = id === 'grandeChiave' ? A.icon('bigkey', '#ffd86a', '#e8304a') : id === 'sigillo' ? A.icon('seal', '#c89a2a', '#e8304a') : A.icon('key', '#ffc83a');
  else if (it.t === 'pietra') c = A.icon('gem', it.c, '#ffffff');
  else c = A.icon('map', '#e8d8a8', '#8a3a2a');
  return iconCache[id] = c;
}
const iconCache = {};
const ICOIN = A.icon('coin', '#ffc83a', '#fff4b0'), IORE = A.icon('ore', '#8a8a92', '#ff9a3a'), IPOT = A.icon('potion', '#e8304a', '#ffb0c0'), IKEY = A.icon('key', '#ffc83a'), IBKEY = A.icon('bigkey', '#ffd86a', '#e8304a');
const HEARTS = [A.pix(['.aa.aa.', 'abbabba', 'abbbbba', 'abbbbba', '.abbba.', '..aba..', '...a...'], { a: '#1a0e14', b: '#ff4a6a' }),
  A.pix(['.aa.aa.', 'abbacca', 'abbccca', 'abbccca', '.abcca.', '..aca..', '...a...'], { a: '#1a0e14', b: '#ff4a6a', c: '#4a2a36' }),
  A.pix(['.aa.aa.', 'acca.ca', 'acccc.a', 'acccc.a', '.acca..', '..aca..', '...a...'], { a: '#1a0e14', c: '#4a2a36' })];

// ---------- abitanti ----------
const SKIN = '#f0c49a';
const NPC = {
  mirta: { n: 'ANZIANA MIRTA', look: { skin: '#e8c0a0', hairStyle: 'bun', hair: '#e0e0ea', robe: '#6a4a8a', shirt: '#7a5a9a', pants: '#5a3a6a', boots: '#3a2a2a', staff: '#7a5230', orb: '#8ae0ff' } },
  bruno: { n: 'BRUNO IL FABBRO', look: { skin: '#d8a07a', hairStyle: 'short', hair: '#3a2a1a', beard: '#3a2a1a', shirt: '#8a3a2a', apron: '#4a3a30', pants: '#3a3a44', boots: '#2a2a2a', wide: 0.6 } },
  lia: { n: 'PICCOLA LIA', sc: 0.78, look: { skin: SKIN, hairStyle: 'tails', hair: '#c8642a', shirt: '#e85a8a', pants: '#4a6ab0', boots: '#6a3a2a' } },
  otto: { n: 'GUARDIA OTTO', look: { skin: '#e0b088', helm: { c: '#9aa4b2', spike: true }, shirt: '#3a5a9a', plate: '#c8d0dc', pants: '#3a3a4a', boots: '#2a2a2a', weapon: { kind: 'spear' }, shield: '#3a5a9a', emblem: '#ffd23f' } },
  nino: { n: 'NINO IL MERCANTE', look: { skin: '#e8b890', hat: '#6a3a2a', shirt: '#c89a3a', pack: '#8a5a30', beard: '#8a6a4a', pants: '#5a4a3a', boots: '#3a2a1a', hairStyle: 'short', hair: '#8a6a4a' } },
  viandante: { n: 'IL VIANDANTE', look: { skin: '#d8a882', hood: '#4a4a5a', cape: '#5a5a6a', shirt: '#6a6a7a', pants: '#4a4a52', boots: '#2a2a2a', staff: '#7a5230' } },
  pescatore: { n: 'IL PESCATORE', look: { skin: '#e0a880', hat: '#d8b85a', shirt: '#4a7aa8', pants: '#6a5a3a', boots: '#3a3a3a', beard: '#c8c8d0', hairStyle: 'short', hair: '#c8c8d0' } },
  spirito: { n: 'SPIRITO DEL BOSCO', sc: 1.18, look: { skin: '#9af0b0', shirt: '#3aa860', robe: '#2a8a50', pants: '#2a8a50', boots: '#1e6a3a', antlers: '#f0e8d0', eyes: '#ffffff' } },
  ardea: { n: 'CAPITANO ARDEA', look: { skin: '#e8b890', helm: { c: '#c8d0dc', plume: '#c8342c' }, shirt: '#c8d0dc', plate: '#e8eef6', pauldron: '#c8d0dc', pants: '#5a6070', boots: '#3a3a44', cape: '#c8342c', weapon: { col: '#e8eef6', guard: '#c8a040' }, shield: '#c8342c', emblem: '#ffd23f' } },
  nomade: { n: 'LA PELLEGRINA', look: { skin: '#b07a50', hood: '#d8b878', robe: '#c89a5a', shirt: '#e0c080', pants: '#a87a4a', boots: '#6a4a2a' } },
  eremita: { n: "L'EREMITA", look: { skin: '#e0b8a0', hood: '#8a8a9a', robe: '#6a6a7a', shirt: '#7a7a8a', pants: '#5a5a6a', boots: '#3a3a44', beard: '#e8e8f0', staff: '#8a6a4a' } },
  contadino: { n: 'IL CONTADINO', look: { skin: '#d89a70', hat: '#d8b85a', shirt: '#8aaa5a', pants: '#6a5a3a', boots: '#4a3a2a', hairStyle: 'short', hair: '#5a3a1a', weapon: { kind: 'spear' } } },
};
// ---------- nemici ----------
const FOE = {
  slime: { n: 'MELMA', k: 'slime', hp: 3, dmg: 1, sp: 15, aggro: 50, range: 6, r: 3, coins: [1, 3] },
  wolf: { n: 'LUPO', k: 'beast', sc: 0.22, hp: 6, dmg: 2, sp: 34, aggro: 75, range: 8, r: 3.5, coins: [3, 6] },
  goblin: { n: 'GOBLIN', k: 'human', hp: 8, dmg: 2, sp: 24, aggro: 65, range: 8, r: 3, coins: [4, 8] },
  skel: { n: 'SCHELETRO', k: 'human', hp: 12, dmg: 3, sp: 22, aggro: 70, range: 9, r: 3, coins: [6, 12] },
  imp: { n: 'DIAVOLETTO', k: 'human', hp: 14, dmg: 3, sp: 30, aggro: 80, range: 10, r: 3, coins: [8, 14] },
  icewolf: { n: 'LUPO DEI GHIACCI', k: 'beast', sc: 0.22, hp: 12, dmg: 3, sp: 40, aggro: 85, range: 8, r: 3.5, coins: [7, 12] },
  bat: { n: 'PIPISTRELLO', k: 'bat', hp: 4, dmg: 1, sp: 32, aggro: 60, range: 6, r: 2.5, coins: [2, 4], fly: 7 },
  plant: { n: 'PIANTA CARNIVORA', k: 'plant', sc: 0.3, hp: 4, dmg: 1, sp: 0, aggro: 95, range: 0, r: 3, coins: [1, 3], shoot: 2.4 },
  crab: { n: 'GRANCHIO', k: 'crab', sc: 0.26, hp: 9, dmg: 2, sp: 30, aggro: 70, range: 8, r: 3.5, coins: [3, 6] },
  jackal: { n: 'SCIACALLO', k: 'beast', sc: 0.22, hp: 10, dmg: 3, sp: 40, aggro: 85, range: 8, r: 3.5, coins: [6, 10] },
  slime2: { n: 'MELMA DORATA', k: 'slime', hp: 9, dmg: 2, sp: 18, aggro: 55, range: 6, r: 3, coins: [5, 10] },
  bandit: { n: 'PREDONE', k: 'human', hp: 16, dmg: 3, sp: 28, aggro: 75, range: 9, r: 3, coins: [10, 18] },
  tiger: { n: 'TIGRE DELLA SELVA', k: 'beast', sc: 0.26, hp: 20, dmg: 4, sp: 44, aggro: 90, range: 9, r: 4, coins: [10, 18] },
  troll: { n: 'TROLL DELLE RADICI', k: 'human', sc: 0.33, hp: 60, dmg: 4, sp: 21, aggro: 150, range: 12, r: 5, coins: [50, 80], champ: 1 },
  tritone: { n: 'TRITONE DEL LAGO', k: 'human', sc: 0.33, hp: 85, dmg: 5, sp: 24, aggro: 150, range: 13, r: 5, coins: [60, 90], champ: 1 },
  faraone: { n: "L'ULTIMO RE DI SOLIS", k: 'human', sc: 0.33, hp: 100, dmg: 6, sp: 20, aggro: 150, range: 12, r: 5, coins: [80, 120], champ: 1 },
  jarl: { n: 'RE DEI GHIACCI', k: 'human', sc: 0.34, hp: 115, dmg: 6, sp: 24, aggro: 150, range: 13, r: 5, coins: [90, 130], champ: 1 },
  demone: { n: 'SIGNORE DELLE BRACI', k: 'human', sc: 0.35, hp: 135, dmg: 7, sp: 26, aggro: 150, range: 13, r: 5, coins: [110, 160], champ: 1 },
  lich: { n: "CAVALIERE DELL'ECLISSE", k: 'human', sc: 0.34, hp: 125, dmg: 7, sp: 26, aggro: 150, range: 13, r: 5, coins: [100, 150], champ: 1 },
  idolo: { n: 'IDOLO DI GIADA', k: 'human', sc: 0.34, hp: 110, dmg: 6, sp: 20, aggro: 150, range: 12, r: 5, coins: [90, 130], champ: 1 },
  capo: { n: 'CAPO DEI GOBLIN', k: 'human', sc: 0.28, hp: 34, dmg: 2, sp: 24, aggro: 130, range: 10, r: 4, coins: [30, 50], champ: 1 },
  pirata: { n: 'IL CAPITANO', k: 'human', sc: 0.28, hp: 50, dmg: 4, sp: 26, aggro: 130, range: 11, r: 4, coins: [50, 80], champ: 1 },
  minatore: { n: 'IL CAPO MINATORE', k: 'human', sc: 0.28, hp: 55, dmg: 4, sp: 22, aggro: 130, range: 10, r: 4, coins: [40, 70], champ: 1 },
  yeti: { n: 'LO YETI', k: 'human', sc: 0.34, hp: 65, dmg: 5, sp: 24, aggro: 140, range: 12, r: 5, coins: [50, 80], champ: 1 },
  wraith: { n: 'SPETTRO', k: 'human', hp: 22, dmg: 4, sp: 26, aggro: 85, range: 10, r: 3, coins: [12, 22] },
  slimeB: { n: 'MELMA BLU', k: 'slime', hp: 6, dmg: 1, sp: 17, aggro: 55, range: 6, r: 3, coins: [2, 4] },
  mummy: { n: 'MUMMIA', k: 'human', hp: 18, dmg: 3, sp: 13, aggro: 70, range: 9, r: 3, coins: [6, 12] },
  iceskel: { n: 'SCHELETRO DI GHIACCIO', k: 'human', hp: 18, dmg: 3, sp: 24, aggro: 75, range: 9, r: 3, coins: [7, 12] },
  icebat: { n: 'PIPISTRELLO DI GHIACCIO', k: 'bat', hp: 7, dmg: 2, sp: 34, aggro: 65, range: 6, r: 2.5, coins: [3, 5], fly: 7 },
  firebat: { n: 'PIPISTRELLO DI FUOCO', k: 'bat', hp: 9, dmg: 2, sp: 36, aggro: 70, range: 6, r: 2.5, coins: [3, 6], fly: 7 },
  // i mestieri della sala d'armi (Il Grande Viaggio): wind = quanto si preparano, rosso = colpo che non si para, gd = guardia, scudo = para di fronte
  sm: { n: 'MANICHINO', k: 'human', as: 'sm', hp: 300, dmg: 0, sp: 0, aggro: 0, range: 0, r: 3, coins: [0, 0], gd: 3, fermo: 1 },
  sf: { n: 'FANTE', k: 'human', as: 'sf', mest: 'fante', hp: 9, dmg: 2, sp: 25, aggro: 110, range: 8, r: 3, coins: [0, 0], wind: 0.5, turno: 1 },
  sa: { n: 'ARCIERE', k: 'human', as: 'sa', mest: 'arciere', hp: 7, dmg: 2, sp: 22, aggro: 130, range: 0, r: 3, coins: [0, 0], wind: 0.8 },
  ss: { n: 'SCUDIERO', k: 'human', as: 'ss', mest: 'scudiero', hp: 14, dmg: 2, sp: 19, aggro: 110, range: 8, r: 3.2, coins: [0, 0], wind: 0.6, scudo: 1, gd: 3 },
  st: { n: 'STREGONE', k: 'human', as: 'st', mest: 'mago', hp: 8, dmg: 2, sp: 20, aggro: 130, range: 0, r: 3, coins: [0, 0], wind: 0.9 },
  sb: { n: 'BRUTO', k: 'human', as: 'sb', sc: 0.29, mest: 'bruto', hp: 36, dmg: 4, sp: 14, aggro: 110, range: 11, r: 4.2, coins: [0, 0], wind: 0.95, rosso: 1, gd: 4 },
  sv: { n: 'VEDETTA', k: 'human', as: 'sv', mest: 'vedetta', hp: 6, dmg: 1, sp: 33, aggro: 120, range: 7, r: 3, coins: [0, 0], wind: 0.5 },
  slimeR: { n: 'MELMA DI FUOCO', k: 'slime', hp: 12, dmg: 2, sp: 18, aggro: 60, range: 6, r: 3, coins: [4, 8] },
};
// ---------- aria delle regioni: nebbia, cielo, distanza, acqua ----------
const ATMO = [
  ['#bcd8ee', '#4a92dc', 380, 1250, '#3a7ac8'], ['#c4dcee', '#4a92dc', 380, 1250, '#3a7ac8'], ['#a8c8b4', '#4a8ac0', 240, 900, '#3a6aa0'], ['#c8d6e8', '#3a7ccc', 450, 1450, '#3a72b8'],
  ['#dce6f2', '#7aa4d4', 200, 860, '#5a8ac0'], ['#f0d8a8', '#5a9cdc', 400, 1300, '#3a8ab8'], ['#8a9a7a', '#4a5a4e', 70, 480, '#4a5e46'], ['#b8786a', '#4a2424', 190, 820, '#5a3a3a'],
  ['#ecc8a0', '#6a9ad0', 300, 1050, '#3a7ab0'], ['#ecdcb0', '#5aa0dc', 420, 1350, '#3a86c0'], ['#f0c8a0', '#5a94d8', 400, 1300, '#3a8ab8'], ['#a8d0b0', '#4a90b8', 180, 760, '#2a8a80'],
  ['#f0d8e4', '#6aa8e4', 360, 1200, '#4a90d0'], ['#8a8498', '#4a4660', 110, 620, '#4a5068'], ['#cadaee', '#3672c8', 500, 1500, '#3a72b8'], ['#cfe0ee', '#4a94e0', 400, 1300, '#3a7ac8'],
].map(a => [hexf(a[0]), hexf(a[1]), a[2], a[3], hexf(a[4])]);

// ---------- stato ----------
let G = null, gl = null, st = 'boot', gen = null, prog = 0, progMsg = '', errMsg = '';
let atlas = null, ATEX = null, TILES = null, DET = null, PAVT = null, PANO = null, SHORE = null, glowBuf = null, SPR = {}, CHR = {}, heroRects = null;
let save = null, hero = null, npcs = [], chests = [], foes = [], camps = [], drops = [], fx = [], props = [], doors = [], botteghe = [];
let time = 0, saveT = 0, seenT = 0, placeT = 0, curPlace = '', placeCand = '', placeHold = 0, banner = null, toasts = [], target = null;
let dialog = null, menu = null, shop = null, loot = null, mapOpen = false, help = 0, death = 0, intro = 0, title = { sel: 0, t: 0 };
// misure del telefono (START, OPZIONI): quanto ci mette il mondo a nascere, immagini al secondo, spazio
const MIS = { t0: 0, wall: 0, calc: 0, fasi: {}, fr: [], last: 0, ts: 0, fps: 0, min: 0, scatti: 0, tex: 0, tex0: 0, dati: 0, sp: null, pers: null, gpu: '', maxTex: 0 };
const cam = { x: 2000, y: 60, z: 2700, yaw: -1.57, tx: 2000, ty: 30, tz: 2600 };
let GIANTS = []; const PKS = new Float32Array(40);
const atm = { fog: [0.74, 0.85, 0.93], zen: [0.3, 0.57, 0.86], near: 380, far: 1250, wat: [0.23, 0.48, 0.78] };
let Wr = 320, Hr = 180, K = 1, OX = 0, OY = 0, insetL = 70, insetR = 70, W3 = 427, H3 = 240, K3 = 1, OX3 = 0, OY3 = 0;
const hud = document.createElement('canvas'), hg = hud.getContext('2d');
let atlasUse = 0, fauna = null;
let dynF = new Float32Array(3000 * 44), shF = new Float32Array(400 * 20), dynBuf = null, shBuf = null;
const dragon = { a: 0, x: 2300, y: 600, z: 440, yaw: 0 };
const glowF = new Float32Array(160 * 44), WLP = new Float32Array(32), WLQ = new Float32Array(24);
let grK = 0, grMus = null, rifX = 0, rifZ = 0;                                      // quanto è al buio l'eroe: 0 all'aperto, 1 in fondo a una grotta aperta
const buio = () => Math.max(day.night, grK);      // il buio che conta per lanterna, lumi e aloni: la notte, oppure la grotta

// ---------- il giorno e la notte ----------
// Un giorno intero dura 12 minuti: l'alba alle 6, il tramonto verso le 19. Ogni ora ha la sua luce.
// [ora, luce, quanto è notte, zenit, peso, orizzonte, peso, stelle, colore del panorama]
const DAYLEN = 720, NIGHT = [[0.42, 0.5, 0.82], 1, [0.02, 0.04, 0.13], 1, [0.08, 0.11, 0.24], 0.92, 1, [0.26, 0.32, 0.52]], NOON = [[1, 1, 1], 0, [0, 0, 0], 0, [0, 0, 0], 0, 0, [1, 1, 1]];
const DKEY = [[0, NIGHT], [4.7, NIGHT], [6, [[0.96, 0.74, 0.66], 0.5, [0.3, 0.36, 0.66], 0.75, [1, 0.66, 0.5], 0.72, 0.15, [0.9, 0.7, 0.66]]], [7.6, NOON], [17.2, NOON],
  [18.8, [[1, 0.72, 0.52], 0.45, [0.34, 0.24, 0.52], 0.72, [1, 0.52, 0.3], 0.78, 0.1, [0.9, 0.6, 0.5]]], [20.3, NIGHT], [24, NIGHT]];
const day = { tod: 9, lc: [1, 1, 1], night: 0, zen: [0, 0, 0], zenK: 0, hor: [0, 0, 0], horK: 0, stars: 0, pano: [1, 1, 1] };
function setDay(tod) {
  day.tod = tod; let k = 0; while (k < DKEY.length - 2 && tod >= DKEY[k + 1][0]) k++;
  const a = DKEY[k], b = DKEY[k + 1], t = Math.max(0, Math.min(1, (tod - a[0]) / (b[0] - a[0]))), A2 = a[1], B2 = b[1], L = (x, y) => x + (y - x) * t;
  for (let i = 0; i < 3; i++) { day.lc[i] = L(A2[0][i], B2[0][i]); day.pano[i] = L(A2[7][i], B2[7][i]);
    // i colori del cielo si mescolano tenendo conto del peso (di giorno comanda la regione)
    const wa = A2[3], wb = B2[3], w = L(wa, wb) || 1; day.zen[i] = (A2[2][i] * wa * (1 - t) + B2[2][i] * wb * t) / w; const ha = A2[5], hb = B2[5], h2 = L(ha, hb) || 1; day.hor[i] = (A2[4][i] * ha * (1 - t) + B2[4][i] * hb * t) / h2; }
  day.night = L(A2[1], B2[1]); day.zenK = L(A2[3], B2[3]); day.horK = L(A2[5], B2[5]); day.stars = L(A2[6], B2[6]);
}

// ---------- salvataggio ----------
function newSave() {
  return { v: 1, x: INIZIO().x, z: INIZIO().z, yaw: -Math.PI / 2, hp: 6, hearts: 0, coins: 10, pot: 1, ore: 0, slimes: 0, oreTaken: {},
    eq: { arma: null, armatura: 'tunica', elmo: null, scudo: null, acc: null }, inv: ['tunica'], q: { main: 0, ferro: 0, gatto: 0, melme: 0, viaggio: 0 }, track: 'main',
    chests: {}, flags: {}, seen: '', time: 0, tod: 8, hint: 0, opt: { vib: true }, dun: {}, jobs: {}, cls: null, sk: {}, skSel: {} };
}
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVEKEY)); if (s && s.v === 1) { const n = Object.assign(newSave(), s); n.q = Object.assign(newSave().q, s.q); return n; } } catch (e) {} return null; }
function writeSave() {
  if (!save || !hero) return;
  if (D) { save.x = D.outX; save.z = D.outZ; save.yaw = D.outYaw; dsave(D.id).seen = b64(D.seen); } else { save.x = hero.x; save.z = hero.z; save.yaw = hero.yaw; }
  save.hp = hero.hp; save.time = Math.round(save.time);
  save.seen = b64(seen.subarray(MGN * MG)); save.seenN = b64(seen.subarray(0, MGN * MG));
  try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) {}
}
// la mappa esplorata: caselle di 64 unità. Le prime MGN righe sono le terre a nord (z negativa), aggiunte dopo: nei salvataggi stanno a parte (seenN)
const MG = 128, MGN = SG.world.ZN / 64, MGZ = MG + MGN, seen = new Uint8Array(MG * MGZ), LAND = new Uint8Array(MG * MGZ);
// i salvataggi di prima del grande viaggio ricordano solo l'isola di Lumen (64x64 caselle)
function loadSeen(str, strN) { seen.fill(0); if (strN) unb64(strN, seen.subarray(0, MGN * MG)); if (!str) return; if (str.length > 700) return unb64(str, seen.subarray(MGN * MG)); const o = new Uint8Array(4096); unb64(str, o); for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) seen[(j + MGN) * MG + i] = o[j * 64 + i]; }
function b64(u) { let s = ''; for (let i = 0; i < u.length; i += 8) { let b = 0; for (let k = 0; k < 8; k++) if (u[i + k]) b |= 1 << k; s += String.fromCharCode(b); } return btoa(s); }
function unb64(str, u) { try { const s = atob(str); for (let i = 0; i < s.length; i++) { const b = s.charCodeAt(i); for (let k = 0; k < 8; k++) u[i * 8 + k] = (b >> k) & 1; } } catch (e) {} }

// ---------- statistiche dell'eroe ----------
const CLS = SG.cls, CL = CLS.CL, SKL = CLS.SK;
const cls = () => (save && CL[save.cls]) ? save.cls : 'cavaliere', CC = () => CL[cls()];
const eqIt = s => (s === 'scudo' && !CC().shield) || !save.eq[s] ? null : IT[save.eq[s]];      // lo scudo lo porta solo il cavaliere
const EQS = ['arma', 'armatura', 'elmo', 'scudo', 'acc'], eqSum = f => EQS.reduce((s, k) => s + ((eqIt(k) || {})[f] || 0), 0), eqHas = f => EQS.some(k => (eqIt(k) || {})[f]);
const ATT = () => { const w = eqIt('arma'); return (w ? w.att : 1) + ((eqIt('acc') || {}).att || 0); };
const DIF = () => eqSum('dif') + CC().dif;
const MAXHP = () => 6 + save.hearts * 2 + eqSum('hp') + CC().hp;
const VEL = () => 1 + eqSum('vel') + CC().vel;
const MAXEN = () => CC().en;
// le abilità (C): quelle che la classe sa già e quella scelta
const skillsOf = c => CL[c].skills.filter(id => !SKL[id].price || (save.sk && save.sk[id]));
const curSkill = () => { const L = skillsOf(cls()), s = save.skSel && save.skSel[cls()]; return L.includes(s) ? s : L[0]; };
// ogni classe impugna le armi a modo suo: stesso oggetto, altro nome e altro aspetto
const BASEW = {}; for (const id in IT) if (IT[id].t === 'arma') BASEW[id] = { n: IT[id].n, d: IT[id].d, look: IT[id].look };
const weaponOf = (id, c) => (CLS.ARMI[c] && CLS.ARMI[c][id]) || BASEW[id];
function applyClass() { const c = cls(); for (const id in BASEW) Object.assign(IT[id], weaponOf(id, c)); for (const k in iconCache) delete iconCache[k]; }
// c: la classe (di solito quella dell'eroe); demo: il figurino della scheda, con l'arma e i panni di partenza
function heroLook(c = cls(), demo) {
  const K = CL[c], L = { skin: SKIN, hairStyle: 'short', hair: '#6a4024', boots: '#5a3a22' }, E = s => (demo || (s === 'scudo' && !K.shield) || !save.eq[s]) ? null : IT[save.eq[s]];
  Object.assign(L, IT.tunica.look, K.look);                    // la tunica di partenza ha il colore della classe
  const arm = E('armatura'); if (arm && arm.look && save.eq.armatura !== 'tunica') { delete L.sleeve; delete L.belt; Object.assign(L, arm.look); if (K.look.robe) L.robe = A.shade(arm.look.pants || arm.look.shirt, 0.92); }
  const el = E('elmo'); if (el && el.look) { for (const k of ['cap', 'feather', 'hat', 'hatPoint', 'hatBand', 'hood', 'mask']) delete L[k]; Object.assign(L, el.look); }
  const sc = E('scudo'); if (sc && sc.look) Object.assign(L, sc.look);
  if (L.helm || L.hood || L.cap) L.hairStyle = 'none';
  const wid = demo ? 'legno' : save.eq.arma; L.weapon = wid ? weaponOf(wid, c).look : null;
  if (demo) Object.assign(L, K.demo || {});
  if (K.dual && L.weapon) L.weapon2 = L.weapon;
  if (!demo && save.eq.acc === 'vento') L.boots = '#e8eef6';
  return L;
}

// ---------- sprite ----------
const POSE_N = 11;     // pose dell'eroe: ogni classe ha le sue (sg_class.js)
const POSE_NPC = [{}, { leg: 0.45 }, { leg: -0.45 }];
const POSE_FOE = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0 }, { armR: 1.4, leg: -0.3 }];
// otto direzioni: cinque disegnate, tre ottenute allo specchio (metà dello spazio nell'atlante)
function dirs(make, w, h, o = {}) { const k = o.raw ? 1 : SR, oo = Object.assign({}, o, { sc: (o.sc || 1) * k, base: o.base !== undefined ? Math.round(o.base * k) : undefined }), out = []; for (let d = 0; d < 5; d++) out.push(atlas.add(A.figure(make(), d / 8 * TAU, Math.round(w * k), Math.round(h * k), oo))); for (let d = 3; d > 0; d--) out.push(Object.assign({}, out[d], { u0: out[d].u1, u1: out[d].u0 })); return out; }
const SR = A.SR, HS = Math.round(48 * SR);
function buildStatics() {
  const R = rng(99), S = SPR, SH = {};
  const set = (k, list, s, col, small) => { S[k] = { r: list.map(c => atlas.add(c)), s, col, small }; };
  const SE = A.SR, Z = v => Math.round(v * SE), setZ = (k, list, s, col, small) => set(k, list, s / SE, col, small);
  const LEAF = ['#2a5a24', '#3e8a34', '#5aa844', '#8ac85a'], LEAF2 = ['#2e5a2e', '#3a7a3a', '#56a050', '#7ac06a'], BIR = ['#4a7a2a', '#6a9a3a', '#8aba4a', '#b8d86a'];
  setZ('oak', [A.oak(R, Z(40), Z(52), LEAF), A.oak(R, Z(40), Z(52), LEAF2), A.oak(R, Z(36), Z(48), LEAF)], 0.42, 2);
  setZ('oakbig', [A.oak(R, Z(56), Z(72), LEAF, A.TRUNK, 12), A.oak(R, Z(56), Z(72), LEAF2, A.TRUNK, 12)], 0.46, 2.6);
  setZ('birch', [A.oak(R, Z(32), Z(54), BIR, A.BIRCH, 7), A.oak(R, Z(30), Z(50), BIR, A.BIRCH, 6)], 0.42, 1.4);
  setZ('bush', [A.bush(R, Z(24), Z(18), LEAF), A.bush(R, Z(24), Z(18), LEAF2, '#e8304a')], 0.34);
  set('flower', ['#ff6a8a', '#ffe14a', '#ffffff', '#8a7aff', '#ff9a3a'].map(c => A.flower(c)), 0.2, 0, true);
  set('tuft', [A.tuft(['#3e8a34', '#6ac04a']), A.tuft(['#4a9a3a', '#86c858'])], 0.2, 0, true);
  set('fern', [A.tuft(['#2a6a2a', '#4a9a3a'], 14, 11)], 0.2, 0, true);
  setZ('rock', [A.rock(R, Z(20), Z(14), ['#4a4a52', '#6a6a74', '#8a8a94', '#acacb4']), A.rock(R, Z(26), Z(18), ['#4a4844', '#6a6660', '#8a8680', '#aca8a0'])], 0.42, 2.6);
  setZ('rocksnow', [A.rock(R, Z(22), Z(16), ['#5a6a7a', '#8a9aaa', '#c8d6e4', '#f4f8ff'])], 0.42, 2.6);
  setZ('sandrock', [A.rock(R, Z(24), Z(16), ['#8a5a30', '#b07a44', '#d09a5a', '#e8bc7a']), A.rock(R, Z(18), Z(22), ['#8a5a30', '#b07a44', '#d09a5a', '#e8bc7a'])], 0.45, 2.6);
  setZ('lavarock', [A.rock(R, Z(22), Z(16), ['#1a1416', '#2e2628', '#46383a', '#5e4a4a'], ['#ff6a1a', '#ffc145'])], 0.45, 2.6);
  setZ('pine', [A.pine(R, Z(30), Z(56), ['#1e4a34', '#2e6a44', '#4a8a5a']), A.pine(R, Z(26), Z(50), ['#1e4a34', '#2e6a44', '#4a8a5a'])], 0.46, 1.8);
  setZ('snowpine', [A.pine(R, Z(30), Z(56), ['#1e4a3a', '#2e6a4a', '#4a8a5a'], true), A.pine(R, Z(26), Z(48), ['#1e4a3a', '#2e6a4a', '#4a8a5a'], true)], 0.46, 1.8);
  setZ('palm', [A.palm(R, Z(40), Z(58)), A.palm(R, Z(40), Z(52))], 0.42, 1.2);
  setZ('cactus', [A.cactus(R, Z(22), Z(32)), A.cactus(R, Z(20), Z(26))], 0.42, 1.4);
  setZ('drybush', [A.bush(R, Z(22), Z(14), ['#6a5a2a', '#8a7a3a', '#a89a4a', '#c8b86a'])], 0.34);
  setZ('deadtree', [A.deadTree(R, Z(36), Z(50)), A.deadTree(R, Z(30), Z(44))], 0.46, 1.4);
  setZ('burnt', [A.deadTree(R, Z(34), Z(46), '#1e1818', '#3a2a2a')], 0.46, 1.4);
  setZ('willow', [A.willow(R, Z(46), Z(54)), A.willow(R, Z(40), Z(50))], 0.46, 2);
  set('reeds', [A.reeds()], 0.2, 0, true);
  setZ('mushroom', [A.mushroom(R, Z(10), Z(10), '#e8304a'), A.mushroom(R, Z(9), Z(9), '#c8642a')], 0.32, 0, true);
  setZ('crystal', [A.crystal(R, Z(18), Z(28), ['#2a8aa8', '#4ac8e8', '#a8f0ff', '#ffffff']), A.crystal(R, Z(16), Z(24), ['#6a3aa8', '#9a6ae8', '#d0b0ff', '#ffffff'])], 0.42, 1.4);
  setZ('icecrystal', [A.crystal(R, Z(18), Z(26), ['#5a8ac8', '#8ab8f0', '#d0e8ff', '#ffffff'])], 0.42, 1.4);
  set('bones', [A.bones()], 0.2, 0, true);
  set('giant', [A.pix(['.'], { a: '#000000' })], 0.2, 17);     // l'Albero Madre ora è costruito in rilievo (sg_bosco.js): qui resta solo il segnaposto, invisibile
  setZ('stepstone', [A.rock(R, Z(16), Z(7), ['#6a7a80', '#9aa8b0', '#c8d4d8', '#eef4f6'])], 0.5);
  set('well', [A.well()], 0.2, 6);
  set('torch', [A.torch()], 0.2, 1);
  set('anvil', [A.anvil()], 0.2, 2);
  set('sign', [A.sign()], 0.2, 1.2);
  set('statue', [A.figure([{ t: 'b', b: [-5, 5, -5, 5, -6, 0], c: '#7a7a82' }, ...A.human({ skin: '#a8a8b0', helm: { c: '#9a9aa2', plume: '#8a8a92' }, shirt: '#9a9aa2', plate: '#b0b0b8', pants: '#8a8a92', boots: '#7a7a82', cape: '#8a8a92', weapon: { col: '#b8b8c0', guard: '#8a8a92' }, shield: '#9a9aa2', emblem: '#b8b8c0' }, { armR: 1.0 })], Math.PI, Z(48), Z(52), { base: Z(46), sc: SE })], 0.42 / SE, 4);
  setZ('menhir', [A.rock(R, Z(12), Z(34), ['#4a4a56', '#66667a', '#86869a', '#a8a8ba']), A.rock(R, Z(14), Z(30), ['#4a4a56', '#66667a', '#86869a', '#a8a8ba'])], 0.62, 3);
  set('tent', [A.tent('#c8642a')], 0.2, 9);
  set('campfire', [A.campfire()], 0.2, 2);
  set('snowman', [A.snowman()], 0.2, 3.5);
  set('banner', [A.banner('#c8342c', '#ffd23f')], 0.2, 1);
  // le piante delle terre nuove
  const RED = ['#6a1e14', '#a8341c', '#d8562a', '#f08a3a'], RED2 = ['#7a2a14', '#b84a1c', '#e0702a', '#f8a03a'], GOLD = ['#7a5a14', '#b8861c', '#e0b030', '#f8dc5a'], PINK = ['#b04a7a', '#e07aa8', '#f8a8c8', '#ffd8e8'], PINK2 = ['#c05a8a', '#ec8ab4', '#fcb8d4', '#ffe4f0'];
  const DARKT = ['#3a2420', '#5a3a30', '#7a5244'], MES = ['#6a2e1e', '#a04a2c', '#c86a3c', '#e89a5a'];
  setZ('oakred', [A.oak(R, Z(44), Z(56), RED, A.TRUNK, 10), A.oak(R, Z(40), Z(52), RED2), A.oak(R, Z(52), Z(66), RED2, A.TRUNK, 12)], 0.44, 2.2);
  setZ('oakgold', [A.oak(R, Z(42), Z(54), GOLD), A.oak(R, Z(38), Z(50), GOLD)], 0.43, 2);
  setZ('birchgold', [A.oak(R, Z(32), Z(54), ['#8a6a14', '#c89a24', '#f0c840', '#fff07a'], A.BIRCH, 7)], 0.42, 1.4);
  setZ('bushred', [A.bush(R, Z(24), Z(18), RED), A.bush(R, Z(24), Z(18), GOLD)], 0.34);
  set('leaves', [A.pix(['a..b..', '..c..a', '.b..c.'], { a: '#e0702a', b: '#c8342c', c: '#f0c840' }), A.pix(['.b..a', 'c..b.', '..a..'], { a: '#e0702a', b: '#b84a1c', c: '#f0c840' })], 0.3, 0, true);
  setZ('acacia', [A.acacia(R, Z(58), Z(46), ['#4a6a1e', '#6a8a2a', '#8aa83a', '#b0c85a']), A.acacia(R, Z(50), Z(40), ['#566e22', '#768e2e', '#96ae40', '#bcd060'])], 0.46, 1.6);
  set('tuftgold', [A.tuft(['#b89a3a', '#e0c85a']), A.tuft(['#a88a34', '#d0b850'], 12, 10)], 0.2, 0, true);
  setZ('mesarock', [A.rock(R, Z(24), Z(18), MES), A.rock(R, Z(20), Z(24), MES)], 0.45, 2.6);
  setZ('spire', [A.rock(R, Z(14), Z(40), MES), A.rock(R, Z(18), Z(52), MES)], 0.7, 3.4);
  setZ('jungle', [A.oak(R, Z(60), Z(84), ['#0e3a1e', '#1a5a2a', '#2a7a34', '#4a9a44'], ['#3a2a1a', '#5a4428', '#7a5e38'], 13), A.oak(R, Z(52), Z(74), ['#123e22', '#1e6030', '#30843c', '#56a84c'], A.TRUNK, 11)], 0.48, 2.4);
  setZ('fernbig', [A.bush(R, Z(26), Z(18), ['#0e4a22', '#1a6a30', '#2e8a3c', '#52b04c']), A.bush(R, Z(22), Z(16), ['#0e4a22', '#1a6a30', '#2e8a3c', '#52b04c'], '#ff7ab0')], 0.36);
  setZ('cherry', [A.oak(R, Z(44), Z(52), PINK, DARKT, 10), A.oak(R, Z(40), Z(48), PINK2, DARKT, 9), A.oak(R, Z(48), Z(58), PINK, DARKT, 11)], 0.44, 2);
  setZ('cherrywhite', [A.oak(R, Z(40), Z(50), ['#c0a8b8', '#e8d0dc', '#f8ecf2', '#ffffff'], DARKT)], 0.43, 2);
  set('heather', [A.tuft(['#7a3a7a', '#b05aa8'], 12, 9), A.tuft(['#6a4a8a', '#9a6ac0'], 10, 8)], 0.2, 0, true);
  setZ('tomb', [A.rock(R, Z(8), Z(13), ['#3e3e4a', '#5e5e6c', '#7e7e8e', '#9e9eae']), A.rock(R, Z(10), Z(10), ['#3e3e4a', '#5e5e6c', '#7e7e8e', '#9e9eae'])], 0.4, 1.5);
  SG.town.sprites(set, A, R); SG.shop.sprites(set, A, R); S.lamp.glow = [9.6, 7, 1, 0.8, 0.42]; S.lantern.glow = [5.2, 6, 1, 0.45, 0.35]; S.braciereV.glow = [4.6, 7, 0.36, 0.72, 0.44]; S.runa.glow = [2.3, 3.5, 0.3, 0.6, 0.4];
  S.braciereB.glow = [4.6, 6, 0.24, 0.48, 0.64]; S.braciereO.glow = [4.6, 6.5, 0.66, 0.5, 0.24]; S.braciereI.glow = [4.6, 6, 0.28, 0.48, 0.64]; S.braciereR.glow = [4.6, 6.5, 0.7, 0.32, 0.14];
  // il vento muove alberi (poco) ed erba (di più); cristalli e lava brillano
  for (const k of ['oak', 'oakbig', 'birch', 'pine', 'snowpine', 'palm', 'willow', 'deadtree', 'burnt', 'oakred', 'oakgold', 'birchgold', 'acacia', 'jungle', 'cherry', 'cherrywhite']) S[k].sway = 1;
  for (const k of ['bush', 'flower', 'tuft', 'fern', 'reeds', 'drybush', 'bushred', 'tuftgold', 'fernbig', 'heather']) S[k].sway = 2;
  for (const k of ['crystal', 'icecrystal', 'lavarock']) S[k].lit = 1.15;
  setZ('ore', [A.rock(R, Z(22), Z(16), ['#3a3a44', '#5a5a66', '#7a7a88', '#9a9aa8'], ['#ff9a3a', '#ffd06a', '#e8eef6'])], 0.48, 3.5);
  // le Colline di Solis: cipressi, ulivi, girasoli (con numeri loro: gli altri disegni restano identici)
  { const R2 = rng(4711), CYP = ['#16382a', '#235238', '#3a7048'], OLV = ['#4a5a3a', '#66805a', '#8ea476', '#bccaa0'];
    setZ('cipresso', [A.cypress(R2, Z(15), Z(60), CYP), A.cypress(R2, Z(13), Z(50), CYP), A.cypress(R2, Z(16), Z(66), CYP)], 0.46, 1.5);
    setZ('ulivo', [A.oak(R2, Z(38), Z(40), OLV, A.TRUNK, 8), A.oak(R2, Z(34), Z(36), OLV, A.TRUNK, 7)], 0.42, 1.6);
    set('girasole', [A.sunflower(0), A.sunflower(1)], 0.25, 0, true);
    S.cipresso.sway = 1; S.ulivo.sway = 1; S.girasole.sway = 2; }
  // effetti
  const HD = (c, old) => { const r = atlas.add(c); r.f = old / c.width; return r; };
  SPR.puff = HD(A.puff(), 7);
  SPR.spark = atlas.add(A.pix(['..a..', '..a..', 'aabaa', '..a..', '..a..'], { a: '#ffd23f', b: '#ffffff' }));
  // le scie della lama (combattimento nuovo): un arco largo e basso, uno in diagonale, uno alto e stretto
  { const arco = (w, h, f) => { const c = A.mk(w, h), g = c.getContext('2d'); f(g); return atlas.add(c); }, luna = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
    // orizzontale: una falce coricata, la gobba in alto
    SPR.sciaO = arco(34, 13, g => { const su = [], giu = []; for (let i = 0; i <= 16; i++) { const t = i / 16, x = 1 + t * 32, k = Math.sin(t * Math.PI); su.push([x, 11 - k * 10]); giu.unshift([x, 11 - k * 5.5]); } luna(g, su.concat(giu), '#fff8d0'); const s2 = [], g2 = []; for (let i = 2; i <= 14; i++) { const t = i / 16, x = 1 + t * 32, k = Math.sin(t * Math.PI); s2.push([x, 11 - k * 9]); g2.unshift([x, 11 - k * 7]); } luna(g, s2.concat(g2), '#ffffff'); });
    // diagonale: dall'alto a destra al basso a sinistra
    SPR.sciaD = arco(26, 26, g => { const su = [], giu = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = -0.25 + t * 1.85, k = Math.sin(t * Math.PI); su.push([2 + Math.cos(a) * (21 + k * 2.5), 24 - Math.sin(a) * (21 + k * 2.5)]); giu.unshift([2 + Math.cos(a) * (21 - k * 3.5), 24 - Math.sin(a) * (21 - k * 3.5)]); } luna(g, su.concat(giu), '#fff8d0'); });
    // dall'alto: una falce in piedi
    SPR.sciaV = arco(12, 30, g => { const a = [], b = []; for (let i = 0; i <= 16; i++) { const t = i / 16, y = 1 + t * 28, k = Math.sin(t * Math.PI); a.push([6 + k * 5, y]); b.unshift([6 + k * 1.2, y]); } luna(g, a.concat(b), '#fff8d0'); }); }
  SPR.glint = atlas.add(A.pix(['...a...', '...a...', '..aba..', 'aabbbaa', '..aba..', '...a...', '...a...'], { a: '#fff4b0', b: '#ffffff' }));
  SPR.drop = atlas.add(A.pix(['.a.', 'aba', '.a.'], { a: '#7ac8f0', b: '#e0f4ff' }));
  SPR.leaf = [atlas.add(A.pix(['.aa', 'aab', 'ab.'], { a: '#e0702a', b: '#a8341c' })), atlas.add(A.pix(['aa.', 'baa', '.ba'], { a: '#f0c840', b: '#c8862a' })), atlas.add(A.pix(['.a.', 'aab', '.b.'], { a: '#c8342c', b: '#8a1e1a' }))];
  SPR.petal = [atlas.add(A.pix(['aa', 'ab'], { a: '#ffd8e8', b: '#f8a8c8' })), atlas.add(A.pix(['.a', 'ab'], { a: '#ffffff', b: '#f8a8c8' }))];
  SPR.snow = [atlas.add(A.pix(['aa', 'aa'], { a: '#ffffff' })), atlas.add(A.pix(['a'], { a: '#e8f4ff' }))];
  SPR.dust = [atlas.add(A.pix(['aaaa.', '.bbbb'], { a: '#f0d8a0', b: '#e0c080' }))];
  SPR.fly = [atlas.add(A.pix(['.a.', 'aba', '.a.'], { a: '#c8ff5a', b: '#ffffff' }))];
  SPR.mote = [atlas.add(A.pix(['a'], { a: '#d8c8ff' })), atlas.add(A.pix(['a'], { a: '#c8ffd0' }))];
  { const pf = A.puff(), g2 = pf.getContext('2d'), d = g2.getImageData(0, 0, pf.width, pf.height); for (let i = 0; i < d.data.length; i += 4) { const v = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3 * 0.72; d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v * 1.06; } g2.putImageData(d, 0, 0); SPR.smoke = HD(pf, 7); }
  SPR.ember = atlas.add(A.pix(['.a.', 'aba', '.a.'], { a: '#ff6a1a', b: '#ffe14a' }));
  SPR.coin = HD(A.coin(), 5);
  SPR.heart = HD(A.heartBig(), 7);
  SPR.flame = [atlas.add(A.flame(R, 0)), atlas.add(A.flame(R, 1))];
  SH.seed = HD(A.orb(9, '#5ab83a', '#d8ff9a', { spot: 1, oc: '#1a3a10' }), 5);
  SH.fire = HD(A.orb(11, '#ff8a2a', '#fff0a0', { oc: '#8a1a0a' }), 6);
  SH.ice = HD(A.shard(13, '#5aa8e8', '#bfe6ff'), 7);
  SH.bubble = HD(A.orb(11, '#5ab0f0', '#ffffff', { ring: 0.42, spot: 1, oc: '#1a4a8a' }), 6);
  SH.light = atlas.add(A.pix(['....aa....', '..abbbba..', '.abccccba.', 'abcc..ccba', 'abc....cba', 'ab......ba'], { a: '#ffb02e', b: '#ffe07a', c: '#ffffff' }));
  SH.rock = HD(A.orb(9, '#7a7a84', '#b8b8c4'), 5);
  // i colpi delle classi: frecce e pugnali hanno un verso (otto direzioni), dardi e sfere no
  const ARROW = [{ t: 'c', a: [-5, 0, 3], b: [4.4, 0, 3], r: 0.34, c: '#c8a878' }, { t: 'k', a: [4.4, 0, 3], b: [7, 0, 3], r: 0.95, r2: 0.12, c: '#e8eef6', k: 1.15 }, { t: 'e', o: [-4.6, 0, 3], r: [1.4, 0.28, 1.15], c: '#e8304a' }, { t: 'e', o: [-4.6, 0, 3], r: [1.4, 1.15, 0.28], c: '#f0e8d8' }];
  const KNIFE = [{ t: 'c', a: [-4, 0, 3], b: [-1.2, 0, 3], r: 0.5, c: '#3a2a20' }, { t: 'b', b: [-1.4, -0.9, -1.1, 1.1, 2.5, 3.5], c: '#c8a040' }, { t: 'k', a: [-0.8, 0, 3], b: [4.6, 0, 3], r: 0.85, r2: 0.15, c: '#e8eef6', k: 1.15 }];
  SH.arrow = dirs(() => ARROW, 20, 12, { base: 9 }); SH.knife = dirs(() => KNIFE, 16, 12, { base: 9 });
  SH.bolt = HD(A.orb(9, '#8a6af0', '#f0e8ff', { oc: '#2a1a5a' }), 5);
  SH.orb = HD(A.orb(13, '#5ab8ff', '#ffffff', { ring: 0.42, oc: '#1a3a8a' }), 7);
  SPR.bomb = atlas.add(A.pix(['......d..', '.....c.d.', '....c....', '...aaa...', '..abbba..', '.abbebba.', '.abbbbba.', '.abbbbba.', '..abbba..', '...aaa...'], { a: '#141018', b: '#3a3a4a', c: '#c8a878', d: '#ffb02e', e: '#8a8a9a' }));
  SPR.trap = atlas.add(A.pix(['.a.a.a.a.a.', '.babababab.', 'abbbbbbbbba', 'ab.ccccc.ba', 'abbbbbbbbba', '.babababab.', '.a.a.a.a.a.'], { a: '#e8eef6', b: '#6a6e78', c: '#3a2a20' }));
  SPR.star = atlas.add(A.pix(['..a..', '.aba.', 'abbba', '.aba.', '..a..'], { a: '#ffb02e', b: '#fff4b0' }));
  SPR.arrowfx = atlas.add(A.pix(['a', 'a', 'b', 'b', 'b', 'c'], { a: '#e8304a', b: '#c8a878', c: '#e8eef6' }));
  SPR.mdot = atlas.add(A.pix(['aa', 'aa'], { a: '#ffffff' }));
  SPR.mirino = atlas.add(A.pix(['...a...', '...a...', '.......', 'aa.b.aa', '.......', '...a...', '...a...'], { a: '#ffffff', b: '#ff5a4a' }));
  SPR.shot = SH; SPR.rockfx = SH.rock; SPR.icefx = SH.ice;
  // quello che si raccoglie per gli incarichi, e il punto esclamativo sopra le bacheche (giallo: c'è lavoro; verde: c'è una paga)
  SPR.pick = { fungo: atlas.add(A.pix(['...aaaa...', '..abaaba..', '.aaaaaaba.', '.abaaaaaa.', '.aaaabaaa.', '...cccc...', '....cc....', '....cc....', '...cccc...'], { a: '#e8304a', b: '#ffffff', c: '#f0e0c0' })),
    resina: atlas.add(A.pix(['....a....', '...aba...', '...aba...', '..abbca..', '.abbbbca.', '.abbbbba.', '.aabbbaa.', '..aaaaa..'], { a: '#c8701a', b: '#ffb02e', c: '#fff0a0' })),
    rosa: atlas.add(A.pix(['...aa.aa...', '..abbabba..', '.abccbccba.', '.abcbbbcba.', '..abbcbba..', '.abbcccbba.', '.abcbbbcba.', '..aabbbaa..', '....aaa....'], { a: '#a8643a', b: '#e0a878', c: '#f8d8b8' })),
    conchiglia: atlas.add(A.pix(['...aaaaa...', '..abcbcba..', '.abcbcbcba.', '.abcbcbcba.', '.abcbcbcba.', '..abcbcba..', '...abbba...', '....aaa....'], { a: '#c85a7a', b: '#f8a8c8', c: '#ffe4f0' })),
    loto: atlas.add(A.pix(['....a.a....', '...abab....', '..abbbba.a.', '.abcbcbbaba', '.abbcbbbbba', '..abbbbbba.', 'ddddaaadddd', '.ddddddddd.'], { a: '#c85a9a', b: '#f8b8d8', c: '#ffffff', d: '#3a8a4a' })) };
  SPR.bang = ['#ffd23f', '#5af07a'].map(c => atlas.add(A.pix(['.aaa.', 'abbba', 'abbba', 'abbba', '.aba.', '.aba.', '..a..', '.aaa.', 'abbba', '.aaa.'], { a: '#2a1a10', b: c })));
  SPR.rune = atlas.add(A.pix(['..aaa..', '.a...a.', 'a..b..a', 'a.bbb.a', 'a..b..a', '.a...a.', '..aaa..'], { a: '#4ae0e8', b: '#b8f8ff' }));
}
function* buildCharacters() {
  CHR.hero = null; heroRects = [];
  for (let p = 0; p < POSE_N; p++) { const row = []; for (let d = 0; d < 8; d++) row.push(atlas.add(A.mk(HS, HS))); heroRects.push(row); }
  yield 0.05;
  const LK = SG.city.LOOKS;
  for (const id in W.FOLK) { const f = W.FOLK[id], L = LK[f.look], wk = !!(f.walk && L.walk); NPC[id] = { n: f.n, look: L, sc: L.sc, as: f.look + (wk ? '+' : ''), lines: f.lines, f, walk: wk }; }
  const ids = Object.keys(NPC).filter(id => !NPC[id].as), made = {}; let k = 0;
  for (const id in NPC) { const N = NPC[id]; if (!N.as) continue; if (!made[N.as]) made[N.as] = POSE_NPC.slice(0, N.walk ? 3 : 1).map(p => dirs(() => A.human(N.look, p), 44, 52, { sc: N.sc || 1 })); CHR[id] = made[N.as]; }
  yield 0.2;
  for (const id of ids) { const N = NPC[id]; CHR[id] = POSE_NPC.slice(0, id === 'contadino' ? 3 : 1).map(p => dirs(() => A.human(N.look, p), 44, 52, { sc: N.sc || 1 })); k++; yield 0.05 + 0.45 * k / ids.length; }
  CHR.biscotto = [{}, { leg: 0.5 }].map(p => dirs(() => A.beast({ c: '#f0a050', c2: '#ffe0b0', eye: '#4ade80', s: 0.45, tailUp: 1.3 }, p), 26, 20));
  CHR.slime = [0, 1].map(f => dirs(() => A.slime({ c: '#5ad070' }, f), 34, 26));
  CHR.wolf = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#7a7a86', c2: '#b8b8c4' }, p), 44, 32));
  yield 0.6;
  CHR.icewolf = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#d0e2f4', c2: '#ffffff', eye: '#4ae0ff' }, p), 44, 32));
  CHR.goblin = POSE_FOE.map(p => dirs(() => A.human({ skin: '#6aa83e', shirt: '#6a4a2a', pants: '#4a3a2a', boots: '#2a2a2a', ears: true, weapon: { kind: 'club' }, eyes: '#ffe14a' }, p), 44, 48, { sc: 0.85 }));
  yield 0.7;
  CHR.skel = POSE_FOE.map(p => dirs(() => A.human({ skin: '#ece6d4', hand: '#ece6d4', skull: true, shirt: '#cfc8b4', sleeve: '#ece6d4', pants: '#cfc8b4', boots: '#a8a290', weapon: { col: '#8a8a7a', guard: '#5a5a4a' } }, p), 44, 48));
  CHR.imp = POSE_FOE.map(p => dirs(() => A.human({ skin: '#d84a2a', hand: '#d84a2a', horns: '#2a1a1a', shirt: '#8a1e1a', pants: '#5a1414', boots: '#2a1414', eyes: '#ffe14a', weapon: { kind: 'spear' } }, p), 44, 52, { sc: 0.85 }));
  yield 0.8;
  CHR.bat = [0, 1].map(f => dirs(() => A.bat(f), 40, 30));
  CHR.jackal = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#c8a05a', c2: '#f0d8a0', eye: '#2a1a10' }, p), 44, 32));
  CHR.tiger = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#e88a2a', c2: '#fff0d0', eye: '#4ade80' }, p), 44, 32));
  CHR.slime2 = [0, 1].map(f => dirs(() => A.slime({ c: '#e8c83a' }, f), 34, 26));
  CHR.bandit = POSE_FOE.map(p => dirs(() => A.human({ skin: '#d8a07a', hood: '#5a2a2a', shirt: '#3a3a44', sleeve: '#5a2a2a', pants: '#2a2a32', boots: '#1a1a1e', cape: '#5a2a2a', weapon: { col: '#d8dce4', guard: '#5a3a20' } }, p), 44, 48));
  CHR.mummy = POSE_FOE.map(p => dirs(() => A.human({ skin: '#d8cca8', hand: '#d8cca8', shirt: '#c8bc98', sleeve: '#d8cca8', pants: '#c8bc98', boots: '#a89c78', eyes: '#ffe14a' }, p), 44, 48));
  if (MODO) {   // i mestieri della sala d'armi
    const fig = (o, x) => POSE_FOE.map(p => dirs(() => A.human(o, p), 44, 48, x)), pelle = '#d8a07a', P = { pants: '#4a3a2a', boots: '#2a2a2a' };
    CHR.sm = fig({ skin: '#c8a86a', hand: '#c8a86a', shirt: '#b8944a', sleeve: '#c8a86a', pants: '#8a6a3a', boots: '#6a4a2a', hood: '#8a6a3a' });
    CHR.sf = fig(Object.assign({ skin: pelle, helm: { c: '#7a7a86' }, shirt: '#8a3a2a', weapon: { col: '#c8ccd4' } }, P));
    CHR.sa = fig(Object.assign({ skin: pelle, hood: '#3a5a2a', shirt: '#4a6a3a', quiver: '#6a4a2a', weapon: { kind: 'bow', col: '#8a6a3a' } }, P));
    CHR.ss = fig(Object.assign({ skin: pelle, helm: { c: '#8a8a96', nose: 1 }, plate: '#8a8a96', shirt: '#3a4a7a', shield: '#3a4a7a', emblem: '#ffd23f', weapon: { col: '#c8ccd4' } }, P));
    CHR.st = fig(Object.assign({ skin: '#c8b8d8', hood: '#4a2a6a', robe: '#5a2a7a', shirt: '#6a3a8a', staff: '#8a6a3a', orb: '#ff5a5a', eyes: '#ffe14a' }, P));
    CHR.sb = fig({ skin: '#c88a6a', helm: { c: '#4a4a52', nose: 1 }, plate: '#4a4a52', shirt: '#5a1e1a', pants: '#2a2a32', boots: '#1a1a1e', wide: 1.2, weapon: { kind: 'hammer', col: '#5a5e68' } });
    CHR.sv = fig(Object.assign({ skin: pelle, cap: '#2a4a7a', feather: '#f0e8d8', shirt: '#2a4a7a', weapon: { col: '#c8ccd4' } }, P), { sc: 0.9 });
  }
  CHR.wraith = POSE_FOE.map(p => dirs(() => A.human({ skin: '#b8a8e8', hand: '#b8a8e8', hood: '#3a2a5a', robe: '#2a1e44', shirt: '#3a2a5a', pants: '#2a1e44', boots: '#1e1630', eyes: '#ff4ae0', weapon: { kind: 'staff', col: '#c8a0ff' } }, p), 44, 52));
  CHR.dragon = [0, 1].map(f => dirs(() => A.dragon(f), 128, 96, { pitch: -0.3, base: 60, raw: true }));
  CHR.chest = [0, 1, 2, 3].map(r => [0, 1].map(o => dirs(() => A.chest(r, o), 28, 26)));
  fauna = SG.fauna.create({ W, gH: (x, z) => W.ground(x, z), SR, figure: A.figure, time: () => time, tone, noise,
    reserve: (w, h) => atlas.room(w, h), pix: (rows, pal) => atlas.add(A.pix(rows, pal)),
    paint: (r, c) => { gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x, r.y, gl.RGBA, gl.UNSIGNED_BYTE, c); },
    pushBB: (...a) => pushBB(...a), pushShadow: (...a) => pushShadow(...a), dirOf: (x, z, yaw) => dirOf(x, z, yaw), fx: p => fx.push(p) });
  fauna.init();
  yield 1;
}
function drawHeroSprites() {
  const L = heroLook(), P = CC().poses;
  for (let p = 0; p < POSE_N; p++) for (let d = 0; d < 8; d++) {
    const c = A.figure(A.human(L, P[p]), d / 8 * TAU, HS, HS, { sc: SR }), r = heroRects[p][d];
    if (ATEX) { gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x, r.y, gl.RGBA, gl.UNSIGNED_BYTE, c); }
  }
}

// ---------- caricamento ----------
// ---------- il mondo conservato sul telefono: rilievo e colori si calcolano una volta per versione, poi si rileggono ----------
const STO = (() => {
  const S = { stato: 'attesa', letto: 0, scritto: false, err: '' };   // attesa | nuovo (calcolato adesso) | letto (dal telefono) | spento (il telefono non offre spazio)
  const NOMI = ['H', 'H0', 'shore', 'SL', 'SH', 'biome', 'road0', 'pav', 'col', 'mat', 'road', 'map'];
  let db = null, data = null, busy = false;
  const PRE = () => (MODO || 'classica') + '/';   // ogni terra ha i suoi vettori
  const msg = e => String(e && e.message || e || '').toUpperCase().replace(/[^A-Z0-9 .,:()-]/g, ' ').slice(0, 30);
  const fine = (st, e) => { if (!busy) return; busy = false; S.stato = st; if (e) S.err = msg(e); };
  S.begin = () => {
    busy = true; S.stato = 'attesa'; data = null; const t0 = performance.now();
    // se l'ultima volta il mondo non è arrivato in fondo (gioco chiuso o bloccato mentre nasceva), questa volta si ricalcola tutto
    let rotto = false; try { rotto = localStorage.getItem('sg_nasce') === '1'; localStorage.setItem('sg_nasce', '1'); } catch (e) {}
    try {
      const rq = indexedDB.open('pixelsaga-mondo', 1);
      rq.onupgradeneeded = () => { rq.result.createObjectStore('terra'); };
      rq.onerror = rq.onblocked = () => fine('spento', rq.error || 'chiuso');
      rq.onsuccess = () => {
        db = rq.result; db.onversionchange = () => { try { db.close(); } catch (e) {} db = null; };
        if (!busy) return;
        try {
          const st = db.transaction('terra', 'readonly').objectStore('terra'), g = st.get(PRE() + 'meta');
          g.onerror = () => fine('nuovo', g.error);
          g.onsuccess = () => {
            const m = g.result; if (rotto || !m || m.id !== APP.id) return fine('nuovo');
            const out = {}; let n = 0;
            NOMI.forEach(k => { const r = st.get(PRE() + k); r.onerror = () => fine('nuovo', r.error); r.onsuccess = () => { out[k] = r.result; if (++n === NOMI.length && busy) { data = out; S.letto = performance.now() - t0; fine('letto'); } }; });
          };
        } catch (e) { fine('nuovo', e); }
      };
      setTimeout(() => fine(db ? 'nuovo' : 'spento', 'tempo scaduto'), 5000);
    } catch (e) { fine('spento', e); }
  };
  S.busy = () => busy;
  S.take = () => { const d = data; data = null; return d; };
  S.put = o => {
    if (S.stato === 'letto') S.stato = 'nuovo';   // quello che c'era non andava bene: si riscrive
    if (!db) return;
    try {
      const tx = db.transaction('terra', 'readwrite'), st = tx.objectStore('terra');
      NOMI.forEach(k => st.put(o[k], PRE() + k)); st.put({ id: APP.id, t: Date.now() }, PRE() + 'meta');
      tx.oncomplete = () => { S.scritto = true; }; tx.onerror = tx.onabort = () => { S.err = msg(tx.error || 'non scritto'); };
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(() => {}, () => {}); } catch (e) {}
    } catch (e) { S.err = msg(e); }
  };
  S.ok = () => { try { localStorage.removeItem('sg_nasce'); } catch (e) {} };
  return S;
})();
function* loader() {
  if (MODO) SG.terre[MODO]({ world: W, town: SG.town, city: SG.city, shop: SG.shop });   // la scheda della terra nuova, prima che il mondo nasca
  W.cache = STO; STO.begin();
  progMsg = 'PREPARO LA GRAFICA 3D'; yield 0.005;
  G = SG.createGL();
  if (!G) throw new Error('NOGL');
  gl = G.gl;
  { const tx = G.texture.bind(G); G.texture = (src, o) => { MIS.tex += (src.w || src.width || 0) * (src.h || src.height || 0) * (o && o.lum ? 1 : 4); return tx(src, o); }; }
  atlas = A.Atlas(2048, 3520);
  progMsg = 'DISEGNO ALBERI, ROCCE E FIORI'; yield 0.01;
  buildStatics();
  progMsg = 'MODELLO LE TERRE DI LUMEN';
  for (const p of W.build(atlas, SPR)) yield 0.02 + p * 0.62;
  progMsg = 'DISEGNO ABITANTI E CREATURE';
  for (const p of buildCharacters()) yield 0.66 + p * 0.24;
  progMsg = 'PREPARO IL VIAGGIO'; yield 0.92;
  ATEX = G.texture(atlas.c); atlasUse = atlas.used;
  atlas.c.width = atlas.c.height = 1;   // la tela non serve più: la memoria torna libera
  TILES = G.texture(SG.decor.tilesOn(SG.shop.tilesOn(SG.town.tilesOn(SG.dun.tilesOn(A.tiles(rng(5)), rng(11)), rng(21)), rng(31))));
  DET = G.texture(A.detail(rng(3)), { repeat: true }); PAVT = G.texture(A.paving(rng(77)), { repeat: true });
  SHORE = G.texture({ w: W.N, h: W.NZ, data: W.shore }, { linear: true, lum: true }); W.shore = null;
  glowBuf = G.buffer(glowF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
  PANO = G.texture(A.pano(rng(8), ['#8aa0c0', '#6a82a8', '#e8eef8']), { repeat: true });
  W.upload(G);
  dynBuf = G.buffer(dynF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
  shBuf = G.buffer(shF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
  setupWorld();
  yield 1;
}
// i punti fissati a mano devono stare all'asciutto e fuori dai muri
function fixSpot(x, z, r = 3) {
  const ok = (a, b) => gH(a, b) > 0.4 && !W.blocked(a, b, r) && W.slope(a, b) < 0.9;
  if (ok(x, z)) return [x, z];
  for (let rad = 4; rad < 90; rad += 4) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, X = x + Math.cos(a) * rad, Z = z + Math.sin(a) * rad; if (ok(X, Z)) return [X, Z]; }
  return [x, z];
}
function setupWorld() {
  npcs = W.NPCS.map(([id, x, z, yaw]) => { const [X, Z] = id === 'biscotto' ? [x, z] : fixSpot(x, z); return { id, x: X, z: Z, yaw, base: yaw, hx: X, hz: Z, t: Math.random() * 3, walk: 0, moving: false }; });
  chests = W.CHESTS.map(([id, x, z, c, r]) => { const fixed = ['c06', 'c07', 'c09', 'c10'].includes(id); const [X, Z] = fixed ? [x, z] : fixSpot(x, z, 4); return { id, x: X, z: Z, c, r, yaw: Math.atan2(2650 - Z, 2000 - X) }; });
  for (const c of chests) W.addCircle(c.x, c.z, 3);
  camps = W.CAMPS.map(([x, z, type, n, r]) => { const [X, Z] = fixSpot(x, z, 4); return { x: X, z: Z, type, n, r, alive: [], dead: 0, cool: 0, on: false }; });
  props = W.PROPS.map(([k, x, z]) => ({ k, x, z })).concat(W.LATE.props.filter(p => PROPTXT[p[0]]).map(([k, x, z]) => ({ k, x, z })));
  picks = [];
  for (const id in MODO ? {} : JOBS) { const j = JOBS[id];   // (i lavori della bacheca sono di Pixel Saga: nel Grande Viaggio non ci sono ancora)
    if (j.boss) { const [X, Z] = fixSpot(j.boss.x, j.boss.z, 5); camps.push({ x: X, z: Z, type: 'J_' + id, n: 1, r: 44, alive: [], dead: 0, cool: 0, on: false, job: id }); }
    if (j.pts) j.pts.forEach((q, i) => { const [X, Z] = fixSpot(q[0], q[1], 3); picks.push({ job: id, i, x: X, z: Z, what: j.what }); }); }
  for (const p of props) if (p.k === 'torch' || p.k === 'campfire') W.glows.push([p.x, gH(p.x, p.z) + (p.k === 'torch' ? 8 : 1.6), p.z, 6, 1, 0.7, 0.36, 1]);
  doors = W.lights.filter(l => l.id);
  SG.shop.registra(); botteghe = Object.values(W.SHOPS).filter(b => b.x !== undefined);      // le botteghe con la loro soglia
  for (let j = 0; j < MGZ; j++) for (let i = 0; i < MG; i++) LAND[j * MG + i] = gH(i * 64 + 32, (j - MGN) * 64 + 32) > 0 ? 1 : 0;
  // le grandi cime che si vedono da lontano: [x, z, quota vera della vetta, mezza larghezza]
  GIANTS = (W.GIANTS || []).map(([x, z, r]) => { let m = 0; for (let a = -96; a <= 96; a += 16) for (let b = -96; b <= 96; b += 16) m = Math.max(m, W.ground(x + a, z + b)); return [x, z, m, r]; });
}
function scegliModo(m) {
  if (st === 'boot' && !modoScelto) { MODO = m; modoScelto = true; SAVEKEY = m ? 'gv_save1' : 'sg_save1'; return true; }
  if (MODO === m) return true;
  try { localStorage.setItem('px_sel', String(GAMES.findIndex(g => g.id === (m ? 'viaggio' : 'saga')))); } catch (e) {}
  location.reload(); return false;
}
function startGame(fresh) {
  D = null; boss = null; shots = []; hazards = []; fade = null; quake = 0;
  if (fresh) { save = newSave(); seen.fill(0); try { localStorage.removeItem(SAVEKEY); } catch (e) {} }
  if (MODO) {   // nel Grande Viaggio non c'è ancora chi regala la prima spada: si parte con spada e scudo di legno
    const dai = (slot, id) => { if (!save.eq[slot]) { save.eq[slot] = id; if (!save.inv.includes(id)) save.inv.push(id); } };
    dai('arma', 'legno'); dai('scudo', 'scudoLegno');
  }
  else loadSeen(save.seen || '', save.seenN || '');
  { const p = fixSpot(save.x, save.z, 3); save.x = p[0]; save.z = p[1]; }   // il mondo può essere cambiato: mai dentro un muro o un albero
  hero = { x: save.x, z: save.z, y: gH(save.x, save.z), yaw: save.yaw, hp: Math.min(save.hp, MAXHP()), atk: 0, hitDone: true, walk: 0, moving: false, kb: 0, kx: 0, kz: 0, inv: 0, burnT: 0, dead: false, regenT: 0, wade: false, vx: 0, vz: 0, fall: 0, pushT: 0,
    act: 'slash', atkT: 0.42, en: MAXEN(), enT: 0, enFl: 0, chg: 0, aDown: false, aHold: 0, cdC: 0, dash: null, block: false, guard: 0, hid: 0, nextShot: null, castFn: null };
  things = []; applyClass(); clsUI = null;
  if (MODO) toasts.push({ t: 'ANTEPRIMA: LA TERRA È ANCORA VUOTA. PER ORA SI CAMMINA E SI GUARDA.', c: '#7af0ff', life: 12 });
  if (hero.hp <= 0) hero.hp = MAXHP();
  orb.id = null; orb.pBack = false; orb.p = Math.max(-1, Math.min(1, +save.opt.cam || 0));
  camBehind();
  foes = []; drops = []; fx = []; for (const c of camps) { c.alive = []; c.on = false; c.dead = 0; }
  fauna.reset();
  curPlace = ''; placeCand = ''; banner = null; toasts = []; dialog = null; menu = null; shop = null; loot = null; mapOpen = false; death = 0;
  drawHeroSprites();
  help = fresh ? 9 : 0;
  // chi giocava già scopre una volta sola che la visuale ora si gira col dito
  if (!fresh && !save.flags.camTip) toasts.push({ t: 'NOVITÀ: UN DITO SULLO SCHERMO GIRA LA VISUALE', c: '#7af0ff', life: 9 });
  save.flags.camTip = 1;
  // ...e che nelle città ci sono botteghe in cui entrare e bacheche con gli incarichi
  if (!fresh && !save.flags.cityTip) toasts.push({ t: 'NOVITÀ: BOTTEGHE, LOCANDE E BACHECHE NELLE CITTÀ', c: '#ffd23f', life: 11 });
  save.flags.cityTip = 1;
  // ...e che a nord sono nati i grandi monti
  if (!fresh && !save.flags.nordTip) toasts.push({ t: 'NOVITÀ: A NORD, OLTRE IL PICCO DEL DRAGO, I GRANDI MONTI E MARMOREA', c: '#bfe6ff', life: 13 });
  save.flags.nordTip = 1;
  // ...e che i comandi sono cambiati
  if (!fresh && !save.flags.levaTip) toasts.push({ t: 'NOVITÀ: LEVA A 8 DIREZIONI (PER I COMANDI DI PRIMA: START, OPZIONI)', c: '#7af0ff', life: 14 });
  save.flags.levaTip = 1;
  st = 'play';
  if (fresh) { intro = 1; st = 'intro'; }
  else if (!save.cls) openClass(save.time < 3 ? 'new' : 'old');       // chi giocava già sceglie la classe la prima volta che riprende
  writeSave();
}

// ---------- missioni ----------
const QN = { main: "LE PIETRE DELL'ALBA", ferro: 'FERRO PER LA FORGIA', gatto: 'IL GATTO BISCOTTO', melme: 'MELME NEI CAMPI', viaggio: "L'ALLEANZA DELLE CITTÀ" };
const QALL = ['main', 'viaggio', 'ferro', 'gatto', 'melme'];
// i cinque signori del grande viaggio: [chiave, abitante, città]
const LEAD = [['ambra', 'lead_ambra', 'CASTELROSSO'], ['nord', 'lead_nord', 'ALTABRINA'], ['sole', 'lead_sole', 'ZAFIRA'], ['porto', 'lead_porto', 'PORTO SERENO'], ['fiore', 'lead_fiore', 'FIORALBA']];
const allies = () => LEAD.filter(l => save.flags['al_' + l[0]]).length;
const isJob = q => q[1] === ':', qName = q => isJob(q) ? JOBS[q.slice(2)].n : QN[q];
function questLine(q) {
  if (isJob(q)) return jobLine(q.slice(2));
  const s = save.q[q];
  if (q === 'main') { if (s === 4) return 'LIBERA IL ' + SANCT[nextSanct()] + ' (PIETRE ' + gemsN() + '/5).'; return ['PARLA CON L\'ANZIANA MIRTA, NEL BORGO.', "RAGGIUNGI L'ALBERO MADRE NEL BOSCO ANTICO (NORD-OVEST).", 'PARLA CON IL CAPITANO ARDEA ALLA ROCCA DI LUMEN (SUD-EST).', 'TORNA DAL CAPITANO ARDEA, ALLA ROCCA: PRESTO ARRIVERANNO NOTIZIE DAL RE.', '', "PORTA LE CINQUE PIETRE DELL'ALBA ALLO SPIRITO DEL BOSCO.", 'CAPITOLO 2 COMPLETATO. IL SEGUITO NEL CAPITOLO 3!'][s]; }
  if (q === 'ferro') return ['', 'TROVA 3 MINERALI DI FERRO A NORD-EST DEL BORGO (' + Math.min(3, save.ore) + '/3).', 'PORTA IL FERRO A BRUNO IL FABBRO.', 'COMPLETATA'][s];
  if (q === 'gatto') return ['', 'CERCA BISCOTTO LUNGO LA STRADA PER IL BOSCO.', 'TORNA DA LIA.', 'COMPLETATA'][s];
  if (q === 'melme') return ['', 'SCONFIGGI 6 MELME NEI CAMPI DORATI (' + Math.min(6, save.slimes) + '/6).', 'TORNA DA OTTO, LA GUARDIA.', 'COMPLETATA'][s];
  if (q === 'viaggio') { const nx = LEAD.find(l => !save.flags['al_' + l[0]]); return ['', 'PORTA IL SIGILLO DEL RE AI CINQUE SIGNORI (' + allies() + '/5).' + (nx ? ' IL PROSSIMO: ' + nx[2] + '.' : ''), 'TORNA DAL RE ALDRIC, NEL CORTILE DEL MASTIO.', 'COMPLETATA'][s]; }
  return '';
}
const questDone = q => isJob(q) ? (jst(q.slice(2)) || {}).s === 3 : (q === 'main' ? save.q.main >= 6 : save.q[q] >= 3);
function questTarget(q) {
  const np = id => { const n = npcs.find(e => e.id === id); if (n) return [n.x, n.z]; const f = W.FOLK[id], b = f && f.in ? W.SHOPS[f.in] : id === 'nino' ? W.SHOPS.nino : null; return b && b.x !== undefined ? [b.x, b.z] : null; };
  if (isJob(q)) return jobTarget(q.slice(2), np);
  const s = save.q[q];
  if (q === 'main') { if (s === 4) { const d = doors.find(o => o.id === nextSanct()); return d ? [d.x, d.z] : null; } return [np('mirta'), np('spirito'), np('ardea'), np('ardea'), null, np('spirito'), null][s]; }
  if (q === 'ferro') { if (s === 1) { let best = null, bd = 1e9; for (const p of props) if (p.k === 'ore' && !save.oreTaken[p.x + ',' + p.z]) { const d = Math.hypot(p.x - hero.x, p.z - hero.z); if (d < bd) { bd = d; best = [p.x, p.z]; } } return best; } return s === 2 ? np('bruno') : null; }
  if (q === 'gatto') return s === 1 ? np('biscotto') : s === 2 ? np('lia') : null;
  if (q === 'melme') return s === 1 ? [2420, 2840] : s === 2 ? np('otto') : null;
  if (q === 'viaggio') { if (s === 2) return np('re'); if (s !== 1) return null; let best = null, bd = 1e9; for (const l of LEAD) if (!save.flags['al_' + l[0]]) { const p = np(l[1]); if (p) { const d = Math.hypot(p[0] - hero.x, p[1] - hero.z); if (d < bd) { bd = d; best = p; } } } return best; }
  return null;
}
function trackQuest(q) { save.track = q; }
function curTrack() {
  const active = q => isJob(q) ? !!JOBS[q.slice(2)] && [1, 2].includes((jst(q.slice(2)) || {}).s) : q === 'main' ? save.q.main < 6 : save.q[q] > 0 && save.q[q] < 3;
  if (save.track && active(save.track)) return save.track;
  for (const q of QALL) if (active(q)) return q;
  for (const id in save.jobs) if (active('J:' + id)) return 'J:' + id;
  return null;
}

// ---------- incarichi delle bacheche ----------
// save.jobs[id] = { s: 1 accettato | 2 compiuto, da riscuotere | 3 pagato, n: quanti finora, got: cose già raccolte }
const JOBS = SG.jobs.LIST, JCITY = SG.jobs.CITY, JNOME = SG.jobs.NOME, JHUNT = SG.jobs.HUNT;
let picks = [];
const jst = id => (save && save.jobs && save.jobs[id]) || null;
const jobsDone = city => { let n = 0; for (const id in JOBS) if (JNOME[JOBS[id].c] === city) { const s = jst(id); if (s && s.s === 3) n++; } return n; };
const boardOf = c => W.BOARDS.find(b => b.id === c);
// 2: c'è una paga da riscuotere, 1: c'è un incarico ancora da prendere, 0: niente di nuovo
const boardMark = c => { let m = 0; for (const id of JCITY[c] || []) { const s = jst(id); if (s && s.s === 2) return 2; if (!s) m = 1; } const hs = jst(huntOf(c)); return hs && hs.s === 2 ? 2 : m; };
// la battuta di caccia di una città: quella in corso, oppure la prossima del giro (si possono rifare quante volte si vuole)
const huntOf = c => { const L = JHUNT[c]; if (!L || !save) return null; return L.find(id => jst(id)) || L[((save.hunt && save.hunt[c]) || 0) % L.length]; };
const boardIds = c => (JCITY[c] || []).concat(huntOf(c) ? [huntOf(c)] : []);
function jobAccept(id) {
  save.jobs[id] = { s: 1, n: 0 }; trackQuest('J:' + id); toast('INCARICO ACCETTATO: ' + JOBS[id].n, '#ffd23f'); jingle();
  if (JOBS[id].k === 'selvaggina') toast(cls() !== 'arciere' ? "PER LA CACCIA SERVE UN ARCO: CHIEDI AL MAESTRO DELLA GILDA" : freeAim() ? 'AVVICINATI PIANO E TIRA DA LONTANO' : 'PER LA CACCIA USA LA MIRA LIBERA (IL MIRINO ACCANTO AL TASTO C)', '#7af0ff');
  writeSave();
}
// l'incarico è compiuto: resta da riscuotere alla bacheca (le consegne invece le paga chi riceve)
function jobReady(id) { const s = jst(id); if (!s || s.s !== 1) return; s.s = 2; banner = { t: 'INCARICO COMPIUTO', s: 'RISCUOTI ALLA BACHECA DI ' + JNOME[JOBS[id].c], life: 4, c: '#9af0b0' }; fanfare(); writeSave(); }
function jobPay(id) {
  const s = jst(id), j = JOBS[id]; if (!s || s.s === 3) return; s.s = 3; save.coins += j.coins; toast('+' + j.coins + ' MONETE', '#ffd23f');
  // le battute di caccia si rifanno: pagata una, la bacheca espone la prossima
  if (j.base) { delete save.jobs[id]; (save.hunt = save.hunt || {})[j.c] = ((save.hunt[j.c] || 0) + 1) % 1000; if (save.track === 'J:' + id) save.track = null; seq([523, 659, 784], 0.08, 0.08); writeSave(); return; }
  if (j.gift) { if (j.gift[0] === 'pozione') save.pot += j.gift[1]; else save.eli = (save.eli || 0) + j.gift[1]; toast('+' + j.gift[1] + (j.gift[0] === 'pozione' ? ' POZIONI' : ' ELISIR'), '#ff8aa0'); }
  const n = jobsDone(JNOME[j.c]); toast('SCONTO A ' + JNOME[j.c] + ': ' + Math.min(20, n * 5) + '%', '#9af0b0'); seq([523, 659, 784, 1047], 0.08, 0.08);
  // tutti e quattro: cittadino onorario, e un cuore di cristallo in dono
  if (JCITY[j.c].every(k => jst(k) && jst(k).s === 3) && !save.flags['on_' + j.c]) { save.flags['on_' + j.c] = 1; openLoot('cuore'); loot.note = 'CITTADINO ONORARIO DI ' + JNOME[j.c] + '!'; }
  writeSave();
}
// una preda abbattuta: vale per le battute di caccia in corso (true se ha contato)
function jobHunt(k) { let got = false; for (const id in save.jobs) { const s = save.jobs[id], j = JOBS[id]; if (!j || s.s !== 1 || j.k !== 'selvaggina' || !j.game.includes(k)) continue; got = true; s.n++; toast(j.pl + ': ' + Math.min(j.q, s.n) + '/' + j.q, '#9af0b0'); if (s.n >= j.q) jobReady(id); } return got; }
function jobKill(type) { for (const id in save.jobs) { const s = save.jobs[id], j = JOBS[id]; if (!j || s.s !== 1 || j.k !== 'caccia' || j.foe !== type) continue; s.n++; toast(j.pl + ': ' + Math.min(j.q, s.n) + '/' + j.q, '#9af0b0'); if (s.n >= j.q) jobReady(id); } }
// chi aspetta una consegna ringrazia e paga subito
function jobTalk(nid) { for (const id in save.jobs) { const s = save.jobs[id], j = JOBS[id]; if (!j || s.s !== 1 || j.k !== 'consegna' || j.to !== nid) continue; say(nid, j.thanks, () => { jingle(); jobPay(id); }); return true; } return false; }
// cose da raccogliere (basta passarci sopra) e luoghi da raggiungere
function jobsUpdate() {
  if (D || !save.jobs) return;
  for (const p of picks) { const s = jst(p.job); if (!s || s.s !== 1 || (s.got && s.got[p.i])) continue; if ((p.x - hero.x) ** 2 + (p.z - hero.z) ** 2 > 30) continue;
    (s.got = s.got || {})[p.i] = 1; s.n++; const j = JOBS[p.job]; puffAt(p.x, p.z, 4); seq([659, 880], 0.06, 0.06); toast(j.label + ': ' + Math.min(j.q, s.n) + '/' + j.q, '#9af0b0'); if (s.n >= j.q) jobReady(p.job); }
  if (dialog || shop || loot || fade || st !== 'play') return;
  for (const id in save.jobs) { const s = save.jobs[id], j = JOBS[id]; if (j && s.s === 1 && j.k === 'visita' && Math.hypot(j.x - hero.x, j.z - hero.z) < j.r) { say(null, [j.found], () => jobReady(id)); return; } }
}
const jobLine = id => { const j = JOBS[id], s = jst(id) || { s: 0, n: 0 };
  if (s.s === 2) return 'COMPIUTO! RISCUOTI LA PAGA ALLA BACHECA DI ' + JNOME[j.c] + '.';
  if (s.s === 3) return 'COMPLETATO';
  if (j.k === 'caccia') return 'SCONFIGGI ' + j.q + ' ' + j.pl + ' (' + Math.min(j.q, s.n) + '/' + j.q + ').';
  if (j.k === 'selvaggina') return "CACCIA CON L'ARCO " + j.q + ' ' + j.pl + ' (' + Math.min(j.q, s.n) + '/' + j.q + '): ' + j.where + '.';
  if (j.k === 'taglia') return 'SCONFIGGI ' + j.boss.n + ': ' + j.where + '.';
  if (j.k === 'consegna') return 'PORTA LA CONSEGNA A: ' + j.toN + '.';
  if (j.k === 'raccolta') return 'RACCOGLI ' + j.q + ' ' + j.label + ' (' + Math.min(j.q, s.n) + '/' + j.q + '): ' + j.where + '.';
  return 'RAGGIUNGI ' + j.at + ': ' + j.where + '.'; };
function jobTarget(id, np) {
  const j = JOBS[id], s = jst(id); if (!s) return null;
  if (s.s === 2) { const b = boardOf(j.c); return b ? [b.x, b.z] : null; }
  if (s.s !== 1) return null;
  const nearest = L => { let best = null, bd = 1e12; for (const p of L) { const d = (p.x - hero.x) ** 2 + (p.z - hero.z) ** 2; if (d < bd) { bd = d; best = [p.x, p.z]; } } return best; };
  if (j.k === 'caccia') return nearest(camps.filter(c => c.type === j.foe));
  if (j.k === 'selvaggina') return nearest(fauna.list.filter(a => j.game.includes(a.k) && !a.gone)) || huntGround(j);      // la preda più vicina, se ce n'è in vista; se no il terreno di caccia
  if (j.k === 'taglia') return nearest(camps.filter(c => c.job === id));
  if (j.k === 'consegna') return np(j.to);
  if (j.k === 'raccolta') return nearest(picks.filter(p => p.job === id && !(s.got && s.got[p.i])));
  return [j.x, j.z];
}
// il terreno di caccia di una battuta: il punto più vicino alla città dove quella selvaggina è di casa (si cerca una volta sola)
function huntGround(j) {
  if (j._at) return j._at;
  if (j.at) return j._at = j.at;
  const b = boardOf(j.c), L = SG.fauna.LAND; let best = null, bs = 0.02;
  for (let r = 260; r <= 530; r += 90) for (let a = 0; a < TAU; a += 0.26) {
    const x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r; if (x < 40 || z < W.Z0 + 40 || x > W.WS - 40 || z > W.WS - 40 || gH(x, z) < 1 || W.slope(x, z) > 0.45 || fauna.urban(x, z) || W.blocked(x, z, 3)) continue;
    let w = 0, tot = 0; for (const [k, v] of L[W.biomeAt(x, z)] || []) { tot += v; if (j.game.includes(k)) w += v; }
    const sc = tot ? w / tot - r * 0.00015 : 0;      // dove quella selvaggina è più di casa; a parità, più vicino alla città
    if (sc > bs) { bs = sc; best = [x, z]; }
  }
  return j._at = best || [b.x, b.z];
}
// nemici con una taglia: il disegno di un nemico comune, ingrandito e tinto, e numeri tutti suoi
for (const id in JOBS) { const j = JOBS[id], b = j.boss; if (!b) continue; const B = FOE[b.as]; FOE['J_' + id] = { n: b.n, k: B.k, as: b.as, sc: b.sc, hp: b.hp, dmg: b.dmg, sp: b.sp, aggro: 110, range: b.range, r: b.r, coins: [Math.round(j.coins * 0.1), Math.round(j.coins * 0.16)], elite: 1, tint: b.tint, job: id }; }

// ---------- dare oggetti ----------
function give(id, quiet) {
  const it = IT[id];
  if (it.t === 'cuore') { save.hearts++; hero.hp = MAXHP(); if (!quiet) toast('+1 CUORE!', '#ff6a8a'); return 'UN CUORE IN PIÙ!'; }
  if (it.t === 'pozione') { save.pot++; return null; }
  if (it.t === 'elisir') { save.eli = (save.eli || 0) + 1; return 'ELISIR NELLA BORSA: ' + save.eli; }
  if (it.t === 'mappa') { save.flags.mappa = 1; return 'I FORZIERI PIÙ RICCHI SONO SEGNATI SULLA MAPPA.'; }
  if (it.t === 'chiave') { if (id === 'sigillo') save.flags.sigillo = 1; return null; }
  if (it.t === 'pietra') return "PIETRE DELL'ALBA: " + gemsN() + ' SU 5';
  if (!save.inv.includes(id)) save.inv.push(id);
  if (it.t === 'scudo' && !CC().shield) return 'NELLA BORSA: LO SCUDO LO PORTA SOLO IL CAVALIERE.';
  const cur = eqIt(it.t), score = x => x ? (x.att || 0) * 3 + (x.dif || 0) * 3 + (x.hp || 0) * 2 + (x.vel || 0) * 10 + (x.regen || 0) * 6 + x.r : -1;
  if (score(it) > score(cur)) { equip(id); return 'EQUIPAGGIATO!'; }
  return 'MESSO NELLA BORSA (START).';
}
function equip(id) {
  const it = IT[id]; save.eq[it.t] = id;
  hero.hp = Math.min(hero.hp, MAXHP());
  drawHeroSprites();
}
function toast(t, c = '#ffffff') { toasts.push({ t, c, life: 3 }); if (toasts.length > 4) toasts.shift(); }

// ---------- dialoghi ----------
function say(id, lines, then) { dialog = { id, name: id && NPC[id] ? NPC[id].n : id === 'biscotto' ? 'BISCOTTO' : '', lines: lines.map(l => A.wrap(l, Math.max(120, dialogW() - 16))), i: 0, ch: 0, then }; }
// una domanda con le risposte da scegliere (croce su/giù, A conferma, B = l'ultima)
function ask(id, lines, opts, pick) { say(id, lines); dialog.opts = opts; dialog.sel = 0; dialog.pick = pick; }
const npcHidden = n => n.id === 're' && (!save || save.q.main < 4);
function sail(d) { const p = fixSpot(d.x, d.z, 3); hero.x = p[0]; hero.z = p[1]; hero.y = gH(hero.x, hero.z); hero.yaw = d.yaw; hero.vx = hero.vz = 0; camBehind(); curPlace = ''; placeCand = ''; save.time += 90; toast('SEI ARRIVATO: ' + d.n, '#9af0b0'); }
function talkFolk(n, N) {
  const f = N.f, id = n.id, q = save.q;
  if (f.role === 'shop') return say(id, f.lines, () => { shop = { sel: 0, top: 0, who: f.shop }; });
  // il maestro della gilda: cambia la classe e insegna le abilità
  if (f.role === 'guild') return ask(id, [f.lines[0], 'SE CAMBI, LE ARMI CHE HAI PRENDONO LA FORMA DELLA NUOVA CLASSE. E POSSO INSEGNARTI ABILITÀ CHE ANCORA NON CONOSCI.'], ['CAMBIA CLASSE' + (gildaCost() ? ' (' + gildaCost() + ' MONETE)' : ' (GRATIS)'), "IMPARA UN'ABILITÀ", 'NIENTE, GRAZIE'], i => { if (i === 0) openClass('gilda'); else if (i === 1) { shop = { sk: true, sel: 0 }; tone(660, 0.05); } });
  if (f.role === 'inn') return ask(id, [f.lines[0], 'UN LETTO E UNA ZUPPA CALDA, E DOMATTINA SEI COME NUOVO. FANNO ' + f.cost + ' MONETE.'], ['RIPOSA (' + f.cost + ' MONETE)', 'NO, GRAZIE'], i => {
    if (i) return; if (save.coins < f.cost) return say(id, ['NON HAI ABBASTANZA MONETE. TORNA QUANDO NE AVRAI ' + f.cost + '.']);
    save.coins -= f.cost; startFade(() => { hero.hp = MAXHP(); save.time += 60; save.tod = 7.2; setDay(save.tod); if (inCasa() && D.letto) { hero.x = D.letto[0]; hero.z = D.letto[1]; hero.yaw = D.letto[2]; hero.vx = hero.vz = 0; camBehind(); } toast('HAI RIPOSATO: TUTTI I CUORI SONO PIENI', '#9af0b0'); jingle(); writeSave(); }); });
  if (f.role === 'sala') return salaMenu(id);
  if (f.role === 'ferry') { const here = f.dock, to = Object.keys(W.DOCKS).filter(k => k !== here), cost = 25;
    return ask(id, ['IL TRAGHETTO È PRONTO A SALPARE. OGNI TRATTA COSTA ' + cost + ' MONETE. DOVE TI PORTO?'], to.map(k => W.DOCKS[k].n).concat(['RESTO A TERRA']), i => {
      if (i >= to.length) return; if (save.coins < cost) return say(id, ['SENZA MONETE NON SI SALPA, AMICO.']);
      save.coins -= cost; startFade(() => sail(W.DOCKS[to[i]])); }); }
  if (id === 're') {
    if (q.viaggio === 0) return say(id, ['EROE DI LUMEN! IL CAPITANO ARDEA MI HA RACCONTATO TUTTO DI TE.', 'IL DRAGO SI È SVEGLIATO, E LUMEN DA SOLA NON BASTERÀ. OLTRE IL PONTE DEI RE VIVONO POPOLI CHE UN TEMPO ERANO NOSTRI ALLEATI.', "PORTA IL MIO SIGILLO AI CINQUE SIGNORI: IL BORGOMASTRO DI CASTELROSSO, LA THANE DI ALTABRINA, L'EMIRA DI ZAFIRA, IL CAPITANO DI PORTO SERENO E LA DAMA DI FIORALBA.", 'IL PONTE È A EST, OLTRE LE COLLINE DI SOLIS. È UN VIAGGIO LUNGO: PRENDI QUESTE CENTO MONETE PER LOCANDE E TRAGHETTI.'], () => { q.viaggio = 1; save.coins += 100; trackQuest('viaggio'); toast("MISSIONE: L'ALLEANZA DELLE CITTÀ", '#ffd23f'); jingle(); });
    if (q.viaggio === 1) return say(id, ['HAI PARLATO CON ' + allies() + ' SIGNORI SU CINQUE. LA MAPPA (SELECT) TI MOSTRA DOVE SI TROVA IL PROSSIMO.', 'NEI PORTI I TRAGHETTI TI RISPARMIANO GIORNI DI CAMMINO.']);
    if (q.viaggio === 2) return say(id, ['CINQUE GIURAMENTI! NON ACCADEVA DAI TEMPI DI RE AURELIO.', "QUANDO IL DRAGO SCENDERÀ DAL PICCO, LUMEN NON SARÀ SOLA. PRENDI LA STELLA DELL'ALLEANZA: L'HAI MERITATA.", 'E TRECENTO MONETE DAL TESORO DELLA ROCCA.'], () => { q.viaggio = 3; save.coins += 300; openLoot('alleanza'); });
    return say(id, ['LE CITTÀ SONO CON NOI. RIPOSA, EROE: IL GIORNO DEL DRAGO SI AVVICINA.']);
  }
  const L = LEAD.find(l => l[1] === id);
  if (L) {
    const T = { ambra: [['CASTELROSSO VI DÀ IL BENVENUTO. IO SONO ULDERICO, BORGOMASTRO DA TRENT\'ANNI.', "QUI SI TAGLIA LEGNA, SI FA IL PANE E SI SUONA LA CAMPANA AL TRAMONTO. DI DRAGHI NON NE VOGLIAMO SAPERE."], ['IL SIGILLO DI RE ALDRIC! ALLORA È VERO: IL DRAGO SI È SVEGLIATO.', "I NOSTRI ARCIERI SONO I MIGLIORI DEL CONTINENTE. CASTELROSSO GIURA: SAREMO AL FIANCO DI LUMEN.", 'PRENDI QUESTE POZIONI PER LA STRADA.'], ['I NOSTRI ARCIERI SI ALLENANO OGNI GIORNO. DITE AL RE CHE CASTELROSSO NON DIMENTICA.']],
      nord: [['SONO BRUNILDE, THANE DI ALTABRINA. QUI COMANDANO LA NEVE E IL FERRO.', 'SE CERCHI UN LETTO CALDO, LA LOCANDA È IN PIAZZA.'], ['IL SIGILLO DEL RE DI LUMEN... MIO PADRE COMBATTÉ AL FIANCO DEL SUO.', 'I MONTI DI FERRO DARANNO LANCE E SCUDI. ALTABRINA GIURA.', "E TU PRENDI QUESTO: UN CUORE DI CRISTALLO DELLE NOSTRE MINIERE."], ['LE FUCINE LAVORANO GIORNO E NOTTE. IL DRAGO TROVERÀ FERRO AD ASPETTARLO.']],
      sole: [["BENVENUTO A ZAFIRA, PERLA DELLE TERRE ROSSE. IO SONO L'EMIRA SAHAR.", "L'ACQUA DELLA NOSTRA SORGENTE È PER TUTTI. LE NOSTRE LAME, SOLO PER GLI AMICI."], ["IL SIGILLO DI LUMEN? QUEL DRAGO, CENTO ANNI FA, BRUCIÒ I NOSTRI PALMETI.", 'ZAFIRA NON HA DIMENTICATO. I LANCIERI DEL SOLE MARCERANNO CON VOI: LO GIURO.', "PRENDI QUEST'ORO: UN VIAGGIATORE NE HA SEMPRE BISOGNO."], ['I LANCIERI DEL SOLE SONO PRONTI. CHE LA SABBIA TI SIA LIEVE, EROE.']],
      porto: [['CAPITANO NEREO, AL TUO SERVIZIO. QUESTO È PORTO SERENO, E QUELLE SONO LE MIE NAVI.', 'SE DEVI ANDARE LONTANO, PARLA COL NOSTROMO IN FONDO AL MOLO.'], ["IL SIGILLO DEL RE! SAPEVO CHE QUEL FUMO SUL PICCO NON PROMETTEVA BENE.", 'LA FLOTTA DELLA BAIA È CON LUMEN. GIURO SUL MARE.', 'E DA OGGI PER TE IL MIO ELISIR MIGLIORE.'], ['LE VELE SONO PRONTE. AL PRIMO SEGNALE DEL FARO, SALPIAMO.']],
      fiore: [['BENVENUTO A FIORALBA, VIAGGIATORE. IO SONO SAKURA, CUSTODE DEI CILIEGI.', 'RIPOSA ALL\'OMBRA DEI NOSTRI ALBERI: QUI NESSUNO HA FRETTA.'], ["IL SIGILLO DI LUMEN... I PETALI ME L'AVEVANO DETTO, STAMATTINA.", "I NOSTRI SPADACCINI SONO POCHI, MA NESSUNO LI HA MAI VISTI INDIETREGGIARE. FIORALBA GIURA.", 'PORTA CON TE QUESTO CUORE DI CRISTALLO: È CRESCIUTO TRA LE RADICI DEL CILIEGIO PIÙ ANTICO.'], ['QUANDO VERRÀ IL GIORNO, I PETALI CADRANNO SULLE NOSTRE LAME.']] }[L[0]];
    if (q.viaggio !== 1 || save.flags['al_' + L[0]]) return say(id, save.flags['al_' + L[0]] ? T[2] : T[0]);
    return say(id, T[1], () => { save.flags['al_' + L[0]] = 1; const n2 = allies();
      if (L[0] === 'ambra') { save.pot += 3; toast('+3 POZIONI', '#ff8aa0'); } else if (L[0] === 'sole') { save.coins += 150; toast('+150 MONETE', '#ffd23f'); } else if (L[0] === 'porto') { save.eli = (save.eli || 0) + 2; toast('+2 ELISIR', '#ff8aa0'); } else openLoot('cuore');
      toast('ALLEANZA: ' + n2 + ' SU 5', '#9af0b0'); jingle(); if (n2 >= 5) { q.viaggio = 2; toast('TORNA DAL RE ALDRIC!', '#ffd23f'); } });
  }
  const LL = f.lines; if (!LL || !LL.length) return say(id, ['...']);
  n.li = ((n.li === undefined ? -1 : n.li) + 1) % LL.length; return say(id, [LL[n.li]]);
}
function talk(n) {
  const q = save.q, id = n.id;
  if (jobTalk(id)) return;
  if (NPC[id] && NPC[id].f) return talkFolk(n, NPC[id]);
  if (id === 'mirta') {
    if (q.main === 0) return say(id, ['BENVENUTO A BORGO AURORA, VIAGGIATORE. IO SONO MIRTA, LA PIÙ ANZIANA DEL VILLAGGIO.', "DA QUANDO LE CINQUE PIETRE DELL'ALBA SONO SPARITE, LE CREATURE DI LUMEN SI SONO FATTE INQUIETE.", 'E SUL PICCO A NORD SI È SVEGLIATO IL DRAGO. DALLE RIVE DEL LAGO LO SI VEDE VOLARE.', "LO SPIRITO DEL BOSCO SA DOVE SONO NASCOSTE LE PIETRE. VIVE SOTTO L'ALBERO MADRE, NEL BOSCO ANTICO, A NORD-OVEST.", CLS.TXT.mirta[cls()]], () => { give('legno'); save.pot += 2; q.main = 1; trackQuest('main'); toast("MISSIONE: LE PIETRE DELL'ALBA", '#ffd23f'); jingle(); });
    if (q.main === 1) return say(id, ["L'ALBERO MADRE È NEL BOSCO ANTICO, A NORD-OVEST. SEGUI LA STRADA CHE PARTE DALLA PIAZZA.", 'SE TI PERDI, PREMI SELECT PER GUARDARE LA MAPPA. IL ROMBO GIALLO IN ALTO TI INDICA LA DIREZIONE.']);
    if (q.main === 2) return say(id, ['LO SPIRITO TI HA MANDATO ALLA ROCCA? ALLORA LA COSA È SERIA.', 'LA ROCCA DI LUMEN È A SUD-EST, OLTRE IL GUADO DEL FIUME.']);
    if (q.main === 3) return say(id, ['DICONO CHE IL RE STIA PER TORNARE DAL NORD. IL CAPITANO ARDEA AVRÀ PRESTO NOTIZIE PER TE.', 'E SE SEI FERITO, BEVI AL POZZO DELLA PIAZZA.']);
    if (q.main === 4) return say(id, gemsN() ? ["UNA PIETRA DELL'ALBA... LA SENTO DA QUI. ANCORA " + (5 - gemsN()) + ' E LA LUCE TORNERÀ.', 'NEI SANTUARI I GUARDIANI NON PERDONANO. PORTA SEMPRE QUALCHE POZIONE.'] : ['IL SIGILLO DEL RE! ALLORA I SANTUARI SI APRIRANNO.', 'NEI SANTUARI I GUARDIANI NON PERDONANO. PORTA SEMPRE QUALCHE POZIONE: NINO NE VENDE.']);
    if (q.main === 5) return say(id, ['TUTTE E CINQUE! PORTALE ALLO SPIRITO DEL BOSCO, PRESTO.']);
    return say(id, ["LA LUCE È TORNATA. MA IL DRAGO... STANOTTE L'HO SENTITO RUGGIRE FIN QUI."]);
  }
  if (id === 'bruno') {
    if (q.ferro === 0) return say(id, ['BENVENUTO NELLA MIA FUCINA! PECCATO CHE IL FUOCO SIA QUASI SPENTO: MI MANCA IL FERRO.', 'SULLE COLLINE A NORD-EST DEL BORGO CI SONO ROCCE CON VENATURE DI FERRO. LUCCICANO TRA L\'ERBA.', CLS.TXT.bruno1[cls()]], () => { q.ferro = 1; trackQuest('ferro'); toast('MISSIONE: FERRO PER LA FORGIA', '#ffd23f'); jingle(); });
    if (q.ferro === 1 && save.ore < 3) return say(id, ['MINERALE DI FERRO: NE HAI ' + save.ore + ' SU 3.', 'LE ROCCE CON IL FERRO SONO A NORD-EST DEL BORGO, TRA LE COLLINE.']);
    if (q.ferro <= 2) return say(id, ['CHE BEL FERRO! DAMMI UN MOMENTO...', CLS.TXT.bruno2[cls()]], () => { q.ferro = 3; openLoot('ferro'); });
    const open = () => { shop = { sel: 0, top: 0, who: 'bruno' }; };
    if (save.inv.includes('aurora') && !save.flags.brunoAurora) { save.flags.brunoAurora = 1; return say(id, [CLS.TXT.bruno3[cls()], "CUSTODISCI BENE QUEL TESORO. INTANTO, DAI UN'OCCHIATA A COSA HO FORGIATO COL TUO FERRO."], open); }
    return say(id, [save.q.main >= 4 ? 'IL FUOCO È ALTO E IL FERRO CANTA! HO FINITO IL MIO CAPOLAVORO: VUOI VEDERLO?' : 'COL TUO FERRO LA FUCINA È RINATA. GUARDA COSA TI POSSO FORGIARE!'], open);
  }
  if (id === 'lia') {
    if (q.gatto === 0) return say(id, ['IL MIO GATTO BISCOTTO È SCAPPATO VERSO IL BOSCO! È ARANCIONE E HA PAURA DI TUTTO...', 'MI AIUTI A TROVARLO? L\'HO VISTO CORRERE LUNGO LA STRADA PER IL BOSCO ANTICO.'], () => { q.gatto = 1; trackQuest('gatto'); toast('MISSIONE: IL GATTO BISCOTTO', '#ffd23f'); jingle(); });
    if (q.gatto === 1) return say(id, ['BISCOTTO È ANCORA LÀ FUORI... TI PREGO, CERCALO LUNGO LA STRADA DEL BOSCO!']);
    if (q.gatto === 2) return say(id, ['BISCOTTO È TORNATO! HA FATTO TUTTA LA STRADA DA SOLO, SPORCO DI FANGO.', "GRAZIE! TIENI, L'HO TROVATO IN FONDO AL POZZO: È UN ANELLO CHE BRILLA."], () => { q.gatto = 3; openLoot('anelloVita'); });
    return say(id, ['BISCOTTO ADESSO DORME SEMPRE VICINO AL POZZO. OGNI TANTO SOGNA I TOPI DEL BOSCO.']);
  }
  if (id === 'biscotto') {
    if (q.gatto === 1) return say(id, ['MIAO!', 'BISCOTTO TI ANNUSA LA MANO... POI CORRE A TUTTA VELOCITÀ VERSO IL BORGO!'], () => { q.gatto = 2; n.x = n.hx = 2032; n.z = n.hz = 2660; puffAt(n.x, n.z); toast('BISCOTTO È TORNATO A CASA!', '#ffd23f'); jingle(); });
    return say(id, [q.gatto >= 2 ? 'PRRR... PRRR...' : 'MIAO?']);
  }
  if (id === 'otto') {
    if (q.melme === 0) return say(id, ['ALT! AH, SEI UN VIAGGIATORE. SCUSA, SONO UN PO\' NERVOSO.', 'LE MELME HANNO INVASO I CAMPI DORATI, QUI A EST. IO NON POSSO LASCIARE IL POSTO DI GUARDIA...', 'NE SCONFIGGI SEI PER ME? TI RICOMPENSERÒ.'], () => { q.melme = 1; save.slimes = 0; trackQuest('melme'); toast('MISSIONE: MELME NEI CAMPI', '#ffd23f'); jingle(); });
    if (q.melme === 1) return say(id, ['MELME SCONFITTE: ' + save.slimes + ' SU 6. SONO NEI CAMPI A EST, OLTRE IL GUADO DEL FIUME.']);
    if (q.melme === 2) return CC().shield ? say(id, ['SEI MELME! I CONTADINI TI RINGRAZIANO.', 'PRENDI IL MIO VECCHIO SCUDO. E ANCHE QUESTE CINQUANTA MONETE.'], () => { q.melme = 3; save.coins += 50; openLoot('scudoLegno'); })
      : say(id, ['SEI MELME! I CONTADINI TI RINGRAZIANO.', 'IL MIO VECCHIO SCUDO A TE NON SERVIREBBE: PRENDI QUESTO ELMO DI CUOIO. E ANCHE QUESTE CINQUANTA MONETE.'], () => { q.melme = 3; save.coins += 50; openLoot('elmoCuoio'); });
    return say(id, ['DA QUANDO I CAMPI SONO PULITI IL GRANO CRESCE DORATO COME NON MAI.']);
  }
  if (id === 'nino') return say(id, ['BENVENUTO! MERCI DA TUTTA LUMEN, PREZZI ONESTI... QUASI.'], () => { shop = { sel: 0, top: 0, who: 'nino' }; });
  if (id === 'viandante') {
    const H = ['HO GIRATO TUTTA LUMEN. SAPEVI CHE SULL\'ISOLA DEL LAGO DI CRISTALLO C\'È UN ANTICO SANTUARIO?', "L'ACQUA DEL LAGO È PROFONDA... MA DALLA RIVA SUD-OVEST HO VISTO UN PUNTO DOVE SEMBRA PIÙ CHIARA.",
      'IN CIMA AL PICCO DEL DRAGO C\'È UN TESORO. IL SENTIERO PARTE DALLA RIVA NORD DEL LAGO: È RIPIDO, MA SI SALE.', 'LE RUPI DEL GRIFONE, A NORD-EST, SEMBRANO IMPOSSIBILI DA SCALARE. MA DALLE COLLINE DI SOLIS, TRA LE ROCCE, QUALCUNO CI È RIUSCITO.',
      "NEL CUORE DELLA PALUDE D'OMBRA BRILLA QUALCOSA. LE POZZE SONO BASSE: SI POSSONO GUADARE.", 'NEL CERCHIO DI PIETRE, A SUD-OVEST DEL BORGO, GLI ANTICHI LASCIAVANO DONI AGLI DEI.',
      'DIETRO AL GRANDE ALBERO DEL BOSCO, TRA LE RADICI, I BAMBINI DICONO DI AVER VISTO UN FORZIERE.',
      "NEL FITTO DEL BOSCO ANTICO, VERSO OVEST, C'È UNA GROTTA PIENA DI FUNGHI. I GOBLIN CI NASCONDONO IL LORO BOTTINO.",
      "I CERCATORI DI TESORI NON LASCIANO MAI I FORZIERI IN MEZZO AL SENTIERO: GUARDA TRA I CESPUGLI, DIETRO I MASSI E DIETRO LE CASE.",
      "SULLA SPIAGGIA A SUD, A EST DELLA FOCE DEL FIUME, I PIRATI AVEVANO UNA GROTTA. IL TESORO PIÙ BELLO STA OLTRE L'ACQUA PROFONDA.",
      "SUI MONTI A NORD, SOTTO IL PICCO DEL DRAGO, I MINATORI SCAVAVANO CRISTALLI. LA LORO GROTTA È ANCORA LÌ, TRA LE ROCCE.",
      "NELLA VALLE GELATA, VICINO AL MARE A OVEST, C'È UNA GROTTA DI GHIACCIO. DICONO CHE IN FONDO, MOLTO IN FONDO, CI SIA UNA VESTE FATTA DI BUIO.",
      'SOTTO OGNI SANTUARIO CI SONO ALTRI PIANI. LA GRANDE CHIAVE NON STA MAI VICINO AL GUARDIANO: STA PIÙ IN BASSO.',
      'I TESORI PIÙ GRANDI DI LUMEN NON STANNO ALL\'APERTO: DORMONO NELLE CRIPTE, SOTTO I SANTUARI. IL SIGILLO SI SPEZZA SOLO QUANDO IL GUARDIANO CADE.',
      'ANCHE LE GROTTE HANNO UN FONDO. CHI CI È SCESO PARLA DI CAPI GOBLIN, PIRATI E BESTIE ENORMI SEDUTI SUL LORO ORO.',
      "A SUD, OLTRE IL MARE, UNA TORRE NERA SALE VERSO LA LUNA. E NELLA SELVA D'ORIENTE UN TEMPIO SCENDE SOTTO LA LAGUNA. TUTTI E DUE HANNO UNA PORTA.",
      'NELLE LOCANDE, CHI BEVE PARLA. E CHI PARLA, OGNI TANTO, SA DOVE DORME UN TESORO: SIEDITI AI TAVOLI E ASCOLTA.',
      "OGNI CITTÀ HA LA SUA BACHECA, IN PIAZZA. PIÙ INCARICHI SBRIGHI PER UNA CITTÀ, PIÙ I SUOI BOTTEGAI TI FANNO LO SCONTO. E CHI LI SBRIGA TUTTI DIVENTA UNO DI LORO."];
    const h = H[save.hint % H.length]; save.hint++;
    return say(id, [h]);
  }
  if (id === 'pescatore') return say(id, ['IL LAGO È PROFONDO E I PESCI SONO FURBI.', "L'ALTRO GIORNO HO VISTO DELLE PIETRE CHIARE SOTT'ACQUA, PARTIVANO DALLA STRADA A OVEST DI QUI E ANDAVANO VERSO L'ISOLA."]);
  if (id === 'spirito') {
    if (q.main === 0) return say(id, ['...NON SEI ANCORA PRONTO. PARLA PRIMA CON LA SAGGIA DEL BORGO.']);
    if (q.main === 1) return say(id, ['...UN CUORE CORAGGIOSO. FINALMENTE.', "LE CINQUE PIETRE DELL'ALBA RIPOSANO NEI SANTUARI: NEL BOSCO, TRA LE ROVINE DI SOLIS, TRA I GHIACCI, NEL VULCANO E SULL'ISOLA DEL LAGO.", 'OGNI SANTUARIO È CHIUSO DA UN SIGILLO CHE SOLO IL SANGUE DEI RE DI LUMEN SA SPEZZARE.', "VA' ALLA ROCCA, A SUD-EST DEL BORGO, E PARLA CON IL CAPITANO ARDEA. E PRENDI QUESTO CUORE DI CRISTALLO: TI DARÀ FORZA."], () => { q.main = 2; trackQuest('main'); openLoot('cuore'); });
    if (q.main === 5) return say(id, ["...LE CINQUE PIETRE DELL'ALBA. LE SENTO CANTARE.", 'LA LUCE TORNA SULLE TERRE DI LUMEN: LE CREATURE SI CALMERANNO E I CAMPI TORNERANNO A FIORIRE.', 'MA ASCOLTA... SUL PICCO IL DRAGO SI È SVEGLIATO DEL TUTTO. HA SENTITO LA LUCE DELLE PIETRE, E LA VUOLE PER SÉ.', 'CON LUI SI SONO DESTATE LE CREATURE LEGGENDARIE DI LUMEN. PREPARATI, EROE: IL VIAGGIO NON È FINITO.', 'PRENDI QUESTE POZIONI E QUESTE MONETE. TI SERVIRANNO.'], () => { q.main = 6; save.pot += 3; save.coins += 200; toast('+3 POZIONI  +200 MONETE', '#ffd23f'); banner = { t: 'CAPITOLO 2 COMPLETATO', s: 'IL SEGUITO NEL CAPITOLO 3', life: 6, c: '#ffd23f' }; fanfare(); writeSave(); });
    if (q.main === 4) return say(id, ['LE PIETRE TI ASPETTANO NEI SANTUARI. IL PROSSIMO È IL ' + SANCT[nextSanct()] + '.']);
    if (q.main >= 6) return say(id, ['IL BOSCO È IN PACE, GRAZIE A TE. MA IL CIELO SOPRA IL PICCO... NON MI PIACE.']);
    return say(id, ['IL BOSCO TI OSSERVA, PICCOLO EROE. TORNA QUANDO I SIGILLI SARANNO SPEZZATI.']);
  }
  if (id === 'ardea') {
    if (q.main < 2) return say(id, ['QUESTA È LA ROCCA DI LUMEN. SENZA UN BUON MOTIVO NON SI ENTRA NEL MASTIO.']);
    if (q.main === 2) return say(id, ['TI MANDA LO SPIRITO DEL BOSCO? ALLORA I SIGILLI SI STANNO INDEBOLENDO...', 'IL RE È PARTITO PER LE TERRE DEL NORD IN CERCA DEGLI ANTICHI SAPIENTI: SOLO LORO SANNO LEGGERE LE RUNE DEI SANTUARI.', 'FINCHÉ NON TORNA, ALLENATI. ESPLORA LUMEN, TROVA EQUIPAGGIAMENTO DEGNO DI UN EROE E AIUTA LA GENTE.', 'PRENDI QUESTE CENTO MONETE PER IL VIAGGIO. E STAI LONTANO DAL DRAGO... PER ORA.'], () => { q.main = 3; save.c1t = save.time; save.coins += 100; toast('+100 MONETE', '#ffd23f'); banner = { t: 'CAPITOLO 1 COMPLETATO', s: 'ESPLORA UN PO\', POI TORNA DA ARDEA', life: 5, c: '#ffd23f' }; fanfare(); writeSave(); });
    if (q.main === 3 && save.c1t !== undefined && save.time - save.c1t < 90) return say(id, ['IL RE NON È ANCORA TORNATO. ESPLORA UN PO\' LUMEN E TORNA PIÙ TARDI: I SUOI MESSAGGERI SONO GIÀ IN VIAGGIO.']);
    if (q.main === 3) return say(id, ['FINALMENTE SEI QUI! IL RE È TORNATO DALLE TERRE DEL NORD: I SAPIENTI HANNO DECIFRATO LE RUNE DEI SANTUARI.', "I SIGILLI SI SPEZZANO UNO ALLA VOLTA, NELL'ORDINE IN CUI FURONO POSTI: IL BOSCO, IL LAGO, IL SOLE, IL GHIACCIO E PER ULTIMO IL FUOCO.", 'IL RE TI AFFIDA IL SUO SIGILLO: NEL RUBINO SCORRE IL SANGUE DEI RE DI LUMEN. APPOGGIALO ALLA PORTA DI UN SANTUARIO E LE RUNE SI APRIRANNO.', "DENTRO TROVERAI PICCOLE CHIAVI, UNA GRANDE CHIAVE E UN GUARDIANO. SCONFIGGILO, E LA PIETRA DELL'ALBA SARÀ TUA.", "IL PRIMO È IL SANTUARIO DEL BOSCO, NEL BOSCO ANTICO, POCO A NORD DELL'ALBERO MADRE. VA', EROE. LUMEN CONTA SU DI TE."], () => { q.main = 4; openLoot('sigillo'); trackQuest('main'); banner = { t: 'CAPITOLO 2', s: 'I CINQUE SANTUARI', life: 5, c: '#ffd23f' }; writeSave(); });
    if (q.main >= 4 && q.viaggio === 0 && !save.flags.reHint) { save.flags.reHint = 1; return say(id, ['IL RE VUOLE VEDERTI: TI ASPETTA QUI NEL CORTILE, DAVANTI AL PORTONE DEL MASTIO.']); }
    if (q.main === 4) { const nx = nextSanct(), H = { bosco: "È NEL BOSCO ANTICO, POCO A NORD DELL'ALBERO MADRE.", lago: "È SULL'ISOLA IN MEZZO AL LAGO DI CRISTALLO: LE PIETRE CHIARE NELL'ACQUA PORTANO FIN LÀ.", sole: 'È TRA LE ROVINE DI SOLIS, SULLE COLLINE A EST.', ghiaccio: 'È IN FONDO ALLA VALLE GELATA, LONTANO A NORD-OVEST.', fuoco: 'È SUL MONTE BRACE, A SUD-EST: LA SUA PORTA GUARDA IL CRATERE.' }; return say(id, ['IL PROSSIMO È IL ' + SANCT[nx] + '. ' + H[nx], "PIETRE DELL'ALBA RECUPERATE: " + gemsN() + ' SU 5.']); }
    if (q.main === 5) return say(id, ['LE CINQUE PIETRE! CHE IL RE TI BENEDICA. ORA PORTALE ALLO SPIRITO DEL BOSCO: SOLO LUI SA COSA FARNE.']);
    return say(id, ['IL DRAGO... I SAPIENTI DICONO CHE SI PREPARA QUALCOSA. RESTA PRONTO, EROE.']);
  }
  if (id === 'nomade') return say(id, ['LE ROVINE DI SOLIS CUSTODISCONO IL SANTUARIO DEL SOLE. GLI SCHELETRI LÀ DENTRO NON DORMONO MAI.', 'A NORD, OLTRE LE COLLINE, LE ROCCE SALGONO VERSO LE RUPI DEL GRIFONE. HO VISTO UN SENTIERO, MA NESSUNO TORNA A RACCONTARLO.']);
  if (id === 'eremita') return say(id, ["IL DRAGO... L'HO VISTO DA VICINO, UNA VOLTA. LE SUE SCAGLIE RESISTONO A TUTTO.", CLS.TXT.eremita[cls()], 'SE HAI FREDDO AI PIEDI, GUARDA DIETRO AL PUPAZZO DI NEVE.']);
  if (id === 'contadino') return say(id, [q.melme >= 3 ? 'CHE RACCOLTO, QUEST\'ANNO! GRAZIE A TE, VIAGGIATORE.' : 'LE MELME SI MANGIANO IL GRANO! SE LE SCACCI, OTTO SARÀ CONTENTO.']);
}
const SIGNS = {
  '1996,2470': '↑ LAGO DI CRISTALLO   ← BOSCO ANTICO\n→ ROCCA DI LUMEN   ↓ BORGO AURORA', '2120,1680': 'LAGO DI CRISTALLO\n↑ PICCO DEL DRAGO E VALICO PER MARMOREA: A OVEST DEL LAGO',
  '2326,672': '↑ VETTA DEL DRAGO\n→ VALICO DEI GIGANTI: MARMOREA, LA CITTÀ DELLE CASCATE', '2652,160': 'VALLE DELLE CASCATE\n↑ MARMOREA   ↓ LAGO DI CRISTALLO', '2532,-486': 'MARMOREA\nLE RAMPE AI LATI DEL LAGO SALGONO ALLA GRANDE TERRAZZA',
  '2532,2936': 'ROCCA DI LUMEN, CITTÀ DEL RE\n↗ COLLINE DI SOLIS E PONTE DEI RE   ↘ MONTE BRACE',
  '4500,1990': "IL CONTINENTE D'ORIENTE\n→ CASTELROSSO   ↗ ALTABRINA", '5010,2130': '↑ ALTABRINA   → CASTELROSSO\n← PONTE DEI RE', '5770,3530': 'CASTELROSSO\n↓ PORTO SERENO   → ZAFIRA',
  '4150,6390': 'LE TERRE DEL SUD\n← FIORALBA, LA CITTÀ DEI CILIEGI', '2310,5540': 'FIORALBA\n↓ BRUGHIERA NERA: PERICOLO!   ↖ APPRODO DEI PETALI', '3220,1980': '↑ ROVINE DI SOLIS\nATTENZIONE: SCHELETRI!', '1180,1600': "BOSCO ANTICO\n↑ L'ALBERO MADRE   ↖ VALLE GELATA", '900,2660': "PALUDE D'OMBRA\nNON ANDARE OLTRE AL TRAMONTO",
};
const PROPTXT = { cignopietra: 'UN CIGNO DI MARMO, IL COLLO PIEGATO VERSO IL LAGO. SUL BASAMENTO: «CHI È LIMPIDO, PASSA».', cignopietra2: 'UN CIGNO DI MARMO. QUALCUNO GLI HA LASCIATO UNA NINFEA TRA LE ALI.',
  leonepietra: 'UN LEONE DI ARENARIA SIEDE AL SOLE DA MILLE ANNI. SUL BASAMENTO: «LA LUCE NON TEME NESSUNO».', leonepietra2: 'UN LEONE DI ARENARIA. LA CRINIERA È CONSUMATA DAL VENTO, GLI OCCHI NO.',
  lupopietra: 'UN LUPO DI PIETRA, IL MUSO AL VENTO DEL NORD. SUL BASAMENTO: «IL FREDDO TEMPRA».', lupopietra2: 'UN LUPO DI PIETRA COPERTO DI BRINA. SEMBRA IN ASCOLTO.',
  custodeS: 'UN RE DEL SOLE SCOLPITO NELLA PIETRA DORATA: LA CORONA, LA BARBA, IL GLOBO ACCESO IN CIMA AL BASTONE.', custodeG: 'UN CUSTODE DEI GHIACCI: IL CAPPUCCIO CALATO, LA BARBA BIANCA DI BRINA, UN BASTONE CHE NON SI SCIOGLIE MAI.',
  custodeF: 'UN GUERRIERO DI BASALTO, ELMO E CORNA. NELLE CREPE DELLA PIETRA, IN FONDO, QUALCOSA BRILLA ANCORA.',
  custode: 'UN CUSTODE DEL BOSCO SCOLPITO NELLA PIETRA: IL CAPPUCCIO, LE CORNA DI CERVO, IL BASTONE. IL MUSCHIO GLI SALE FINO ALLE GINOCCHIA.', cervopietra: 'UN CERVO DI PIETRA GUARDA CHI SALE AL SANTUARIO. SUL BASAMENTO: «ENTRA IN PACE, ESCI PIÙ FORTE».', cervopietra2: 'UN CERVO DI PIETRA GUARDA CHI SALE AL SANTUARIO. SUL BASAMENTO: «CHI HA RADICI NON TEME IL VENTO».', runa: 'UNA PIETRA CON UNA RUNA CHE BRILLA DI VERDE. È TIEPIDA AL TATTO.', ninfa: "UNA NINFA DI MARMO CON IL BRACCIO LEVATO VERSO LE CASCATE. SUL BASAMENTO: «CHI BEVE A MARMOREA, RITORNA».", well: 'IL POZZO DEL BORGO. BEVI UN SORSO DI ACQUA FRESCA...', statue: 'UNA STATUA DI PIETRA. SUL BASAMENTO: "RE AURELIO, PRIMO SIGNORE DI LUMEN".', menhir: 'UNA PIETRA ANTICA COPERTA DI RUNE CONSUMATE DAL TEMPO.',
  snowman: 'UN PUPAZZO DI NEVE CON UNA CAROTA PER NASO. SEMBRA SORRIDERE.', giant: "L'ALBERO MADRE. IL SUO TRONCO È LARGO COME UNA CASA E LE RADICI AFFONDANO FINO AL CENTRO DEL MONDO. NELLA CAVITÀ BATTE UNA LUCE, PIANO, COME UN CUORE.", tent: 'LA TENDA DELLA NOMADE. PROFUMA DI SPEZIE.', campfire: 'UN FUOCO SCOPPIETTANTE.', anvil: "L'INCUDINE DI BRUNO. È ANCORA TIEPIDA." };
const SANCT = { bosco: 'SANTUARIO DEL BOSCO', sole: 'SANTUARIO DEL SOLE', ghiaccio: 'SANTUARIO DEL GHIACCIO', fuoco: 'SANTUARIO DEL FUOCO', lago: 'SANTUARIO DEL LAGO' };
// quello che vende ogni bottega (prezzo pieno; il terzo numero: da quale capitolo compare). «citta»: di chi è il banco, per lo sconto
const SHOPS = {
  nino: { title: "L'EMPORIO DI NINO", list: [['pozione', 20], ['elisir', 110], ['cappuccio', 40], ['brocchiere', 35], ['giaco', 60], ['scudoLegno', 45], ['talismano', 90], ['trifoglio', 160], ['mappa', 150], ['cappello', 380, 4]] },
  bruno: { title: 'LA FUCINA DI BRUNO', city: 'BORGO AURORA', list: [['pugnale', 45], ['elmoCuoio', 70], ['lancia', 120], ['mazza', 190], ['torre', 270], ['scaglie', 350], ['martello', 520, 4]] },
  orafo: { title: "L'OREFICERIA DELLA ROCCA", list: [['talismano', 90], ['trifoglio', 160], ['anello2', 260], ['anelloForza', 420]] },
  erbe: { title: "L'ERBORISTERIA DELLA ROCCA", list: [['pozione', 20], ['elisir', 100]] },
  rocca_armi: { title: "L'ARMERIA DEL RE", list: [['elmoFerro', 150], ['scudoFerro', 160], ['mazza', 190], ['cotta', 230], ['argento', 250]] },
  ambra: { title: 'LA SARTORIA DELLA MERCIAIA', list: [['cappuccio', 40], ['seta', 180], ['mantello', 380]] },
  ambra_armi: { title: "L'ARMERIA DI CASTELROSSO", list: [['lancia', 120], ['mazza', 190], ['cotta', 230], ['torre', 270]] },
  ambra_erbe: { title: "L'ERBORISTERIA DELLE FOGLIE", list: [['pozione', 22], ['elisir', 110]] },
  nord: { title: 'PELLI E PELLICCE', list: [['pozione', 24], ['elisir', 115], ['pelliccia', 460]] },
  nord_armi: { title: 'LA FUCINA DEL NORD', list: [['elmoFerro', 150], ['scudoFerro', 160], ['martello', 520]] },
  sole: { title: 'LE LAME DI ZAFIRA', list: [['turbante', 200], ['scaglie', 350], ['scimitarra', 480]] },
  spezie: { title: 'LA SPEZIERIA', list: [['pozione', 22], ['elisir', 110]] },
  bazar: { title: 'IL GRAN BAZAR', list: [['talismano', 90], ['mappa', 150], ['trifoglio', 160], ['piuma', 520]] },
  pesce: { title: 'ZUPPE E RIMEDI DEL PORTO', list: [['pozione', 18], ['elisir', 95]] },
  porto: { title: "L'EMPORIO DELL'ARMATORE", list: [['mappa', 150], ['tridente', 430], ['madreperla', 520], ['bussola', 600]] },
  fiore: { title: 'LA SERRA DELLA FIORAIA', list: [['pozione', 22], ['elisir', 105], ['trifoglio', 160], ['seta', 170]] },
  dojo: { title: 'IL DOJO DI FIORALBA', list: [['argento', 240], ['kabuto', 380], ['acciaio', 420]] },
  marmo_armi: { title: "L'ARMERIA DELLE CASCATE", list: [['elmoFerro', 150], ['torre', 270], ['scaglie', 350], ['acciaio', 430], ['martello', 520]] },
  marmo_erbe: { title: 'LA FONTE DEI RIMEDI', list: [['pozione', 22], ['elisir', 105]] },
  marmo_gemme: { title: "L'ORAFO DEL GHIACCIAIO", list: [['talismano', 90], ['anello2', 260], ['anelloForza', 420], ['piuma', 520]] },
};
// lo sconto di una bottega: la città ricorda chi ha sbrigato i suoi incarichi (5% per incarico, fino al 20%)
const shopCity = who => SHOPS[who].city || (W.SHOPS[who] || {}).city || '';
const sconto = who => Math.min(0.2, 0.05 * jobsDone(shopCity(who)));
const shopPrice = (who, p) => Math.max(1, Math.round(p * (1 - sconto(who))));
const shopList = () => SHOPS[shop.who].list.filter(r => !r[2] || save.q.main >= r[2]).map(r => [r[0], shopPrice(shop.who, r[1])]);
const shopOwned = id => id !== 'pozione' && id !== 'elisir' && id !== 'esci' && (id === 'mappa' ? !!save.flags.mappa : save.inv.includes(id));

// ---------- suoni ----------
const jingle = () => { MU.duck(0.8); seq([784, 988, 1175, 1568], 0.09, 0.08, 0.04); };
const fanfare = () => { MU.duck(1.6); seq([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.12, 0.11, 0.045); };
// ---------- musica: un brano per ogni luogo ----------
const MUS_PLACE = { 'BORGO AURORA': 'borgo', 'ROCCA DI LUMEN': 'rocca', 'PRATI DI LUMEN': 'prati', 'CAMPI DORATI': 'campi', 'BOSCO ANTICO': 'bosco', "L'ALBERO MADRE": 'bosco',
  'LAGO DI CRISTALLO': 'lago', 'ISOLA DEL LAGO': 'lago', 'MONTI DEL DRAGO': 'monti', 'PICCO DEL DRAGO': 'monti', 'VETTA DEL DRAGO': 'monti', 'RUPI DEL GRIFONE': 'rupi',
  'NIDO DEL GRIFONE': 'rupi', 'VALLE GELATA': 'gelo', 'COLLINE DI SOLIS': 'campi', 'ROVINE DI SOLIS': 'campi', 'FONTE DEI GIRASOLI': 'campi', "PALUDE D'OMBRA": 'palude',
  'MONTE BRACE': 'brace', 'CRATERE DEL BRACE': 'brace', 'COSTA DELLE CONCHIGLIE': 'costa', 'FARO DEL SUD': 'costa',
  // le terre nuove
  'CASTELROSSO': 'borgo:ambra', 'ALTABRINA': 'borgo:nord', 'LOCANDA DEL PONTE': 'campi', 'MEZZAVIA': 'campi', 'APPRODO DEL FARO': 'costa', 'APPRODO DEI PETALI': 'costa', 'PORTO SERENO': 'costa', 'ZAFIRA': 'deserto',
  'FIORALBA': 'fiore', 'COLLINE DEI CILIEGI': 'fiore', 'PONTE DEI RE': 'title', 'PONTE DELLE LANTERNE': 'costa', 'PIANA DEI VENTI': 'rupi', 'MONTI DI FERRO': 'monti', 'ALTOPIANO BIANCO': 'gelo', "BOSCO D'AMBRA": 'bosco',
  'TERRE ROSSE': 'deserto', 'DUNE DEL SOLE': 'deserto', 'PIANA DI MEZZO': 'prati', 'BAIA DI ZAFFIRO': 'costa', 'SELVA SMERALDO': 'selva', 'TEMPIO DELLA LAGUNA': 'selva', 'DELTA DELLE NEBBIE': 'palude', 'CAPO DELLE LANTERNE': 'prati',
  'BRUGHIERA NERA': 'palude', "TORRE DELL'ECLISSE": 'grotta:gelo', 'DENTI DEL SUD': 'monti',
  // i grandi monti del nord
  'VALICO DEI GIGANTI': 'monti', 'SOGLIA DEI GIGANTI': 'monti', 'MONTI DEL CIELO': 'monti', "CRESTE D'ARGENTO": 'monti', 'GHIACCIAIO ETERNO': 'gelo', 'VALLE DELLE CASCATE': 'lago',
  'MARMOREA': 'rocca', 'LA GRANDE TERRAZZA': 'rocca', 'ACROPOLI DELLE ACQUE': 'lago' };
const MUS_DUN = { bosco: 'santuario:bosco', lago: 'santuario:lago', sole: 'tempio:sole', ghiaccio: 'santuario:ghiaccio', fuoco: 'tempio:fuoco' };
let musQuiet = 0;
try { MU.on = localStorage.getItem('sg_mus') !== '0'; } catch (e) {}
function musicPick() {
  if (st === 'title' || st === 'intro') return 'title';
  if ((st !== 'play' && st !== 'class') || musQuiet > 0) return null;
  if (D) { if (D.def.casa) return MUS_PLACE[D.town] || 'borgo'; if (boss && boss.on && !boss.dead) return boss.st === 'die' ? null : 'guardiano'; const r = DS.rootOf(D.id); return D.def.music || (D.def.cave ? 'grotta:' + r : MUS_DUN[r] || 'santuario:bosco'); }
  if (grK > 0.45 && grMus) return grMus;   // in fondo a una grotta aperta: la sua musica
  return MUS_PLACE[curPlace || W.placeName(hero.x, hero.z)] || 'prati';
}
const vib = ms => { if (save && save.opt.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };

// ---------- forzieri e bottino ----------
function openLoot(id, qty) {
  const it = IT[id];
  if (id === 'pozione') { save.pot += qty || 1; loot = { id, txt: qty > 1 ? qty + ' POZIONI' : 'UNA POZIONE', note: 'POZIONI NELLA BORSA: ' + save.pot, t: 0 }; seq([659, 880], 0.08, 0.08); return; }
  if (it && EQS.includes(it.t) && save.inv.includes(id)) { const v = 120 * (it.r + 1); save.coins += v; loot = { id: 'monete', txt: v + ' MONETE', note: it.n + ": L'AVEVI GIÀ", t: 0 }; seq([1318, 1760, 2093], 0.06, 0.06); writeSave(); return; }
  const note = give(id);
  loot = { id, t: 0, note };
  if (it.r === 3) fanfare(); else jingle();
  vib(30); writeSave();
}
function openChest(c) {
  save.chests[c.id] = 1;
  const [k, n] = c.c.split(':');
  for (let i = 0; i < 6; i++) fx.push({ k: 'glint', x: c.x + (Math.random() - 0.5) * 6, z: c.z + (Math.random() - 0.5) * 6, y: gH(c.x, c.z) + 4, vy: 6 + Math.random() * 6, t: 1 });
  if (k === 'monete') { const v = +n; save.coins += v; loot = { id: 'monete', txt: v + ' MONETE', t: 0 }; seq([1318, 1760, 2093], 0.06, 0.06); writeSave(); return; }
  openLoot(k, n ? +n : 1);
}

// ---------- telecamera ----------
let camFix = null;   // (solo per le prove) telecamera ferma in un punto
const CAM_D = 25, CAM_H = 11, LOOK_F = 9, LOOK_H = 6.5, FOVY = 0.95;
let FOV = FOVY, aimK = 0;      // in mira il campo si stringe un poco: quello che è lontano si vede più grande
// La visuale si gira trascinando un dito sullo schermo. Di lato gira intorno all'eroe, fino a vederlo di fronte:
// quando lui riparte torna da sola alle sue spalle (i comandi restano quelli di sempre). In su e in giù si alza
// e si abbassa, e l'altezza scelta resta. Due tocchi veloci rimettono tutto a posto.
//   a: di quanto è girata rispetto alle spalle dell'eroe   p: altezza, da -1 (rasoterra, si guarda il cielo) a 1 (dall'alto)
const orb = { a: 0, p: 0, id: null, x: 0, y: 0, moved: 0, sx: 0, sy: 0, ax: '', t0: 0, tap: -9, tx: 0, ty: 0, hold: 0, back: false, pBack: false };
let scrW = 800, scrH = 400;
function camBehind() { orb.a = 0; orb.back = false; orb.hold = 0; cam.yaw = hero.yaw; placeCam(true); }
// i comandi: a 8 direzioni (la leva porta l'eroe dove punta, la visuale lo segue piano) oppure quelli classici (sinistra e destra lo fanno ruotare)
const ctrl8 = () => !save || save.opt.ctrl !== 'c';
const CAM_SEGUE = 1.5;   // quanto in fretta la visuale gira dietro l'eroe che va di lato (radianti al secondo)
function camUpdate(dt) {
  // in mira la visuale sta alle spalle dell'eroe, più vicina, e guarda lontano
  aimK += ((hero.aim ? 1 : 0) - aimK) * Math.min(1, 9 * dt); if (aimK < 0.003) aimK = 0; FOV = FOVY * (1 - 0.24 * aimK);
  if (hero.aim) { orb.a = 0; orb.back = false; cam.yaw += angDiff(hero.yaw, cam.yaw) * Math.min(1, 14 * dt); placeCam(false); return; }
  if (ctrl8()) {
    orb.a = 0;
    if (orb.id === null) {
      // due tocchi: la visuale torna alle spalle dell'eroe
      if (orb.back) { const d = angDiff(hero.yaw, cam.yaw); cam.yaw += d * Math.min(1, 9 * dt); if (Math.abs(d) < 0.02) orb.back = false; }
      // l'eroe va di lato o in diagonale: la visuale gli gira dietro piano (più è di lato, più gira); se viene verso lo schermo resta dov'è
      else if (hero.moving && !hero.dash) cam.yaw += Math.sin(hero.lev || 0) * CAM_SEGUE * dt;
      if (orb.pBack) { orb.p *= Math.exp(-dt * 10); if (Math.abs(orb.p) < 0.012) { orb.p = 0; orb.pBack = false; } }
    }
    placeCam(false); return;
  }
  if (orb.id === null) {
    if (orb.a !== 0) {
      // l'eroe cammina o gira: dopo un attimo la visuale torna dietro di lui
      orb.hold = hero.moving || BTN.left || BTN.right ? orb.hold + dt : 0;
      if (orb.back || orb.hold > 0.3) { orb.a *= Math.exp(-dt * (orb.back ? 10 : 3.4)); if (Math.abs(orb.a) < 0.012) { orb.a = 0; orb.back = false; } }
    } else orb.back = false;
    if (orb.pBack) { orb.p *= Math.exp(-dt * 10); if (Math.abs(orb.p) < 0.012) { orb.p = 0; orb.pBack = false; } }
  }
  cam.yaw += angDiff(hero.yaw + orb.a, cam.yaw) * Math.min(1, 4.2 * dt);
  placeCam(false);
}
function camPointer(type, x, y, id) {
  if (type === 'down') {
    if (orb.id !== null || st !== 'play' || !hero || hero.dead || dialog || shop || loot || menu || fade) return;
    orb.id = id; orb.x = x; orb.y = y; orb.moved = 0; orb.t0 = time; orb.sx = 0; orb.sy = 0; orb.ax = '';
    return;
  }
  if (orb.id !== id) return;
  if (type === 'move') {
    const dx = x - orb.x, dy = y - orb.y; orb.x = x; orb.y = y;
    orb.moved += Math.abs(dx) + Math.abs(dy);
    if (mapOpen) { if (!D) { const S = Math.min(Hr - 37, Wr - insetL - insetR - 10, 256) * K, q = mapV.span / Math.max(1, S); mapV.x -= dx * q; mapV.z -= dy * q; clampMap(); } return; }   // sulla mappa il dito la sposta
    orb.sx += dx; orb.sy += dy;
    if (orb.moved < scrH * 0.025) return;                    // un tocco non è un trascinamento
    // il gesto è di lato oppure in su e giù: così girando la visuale non se ne cambia per sbaglio l'altezza (in diagonale vale tutto)
    if (!orb.ax) { const ax = Math.abs(orb.sx), ay = Math.abs(orb.sy); orb.ax = ax > ay * 1.25 ? 'h' : ay > ax * 1.25 ? 'v' : 'hv'; return; }
    if (orb.ax !== 'v' && hero.aim) hero.yaw += dx / Math.max(1, scrW) * 1.5;          // in mira il dito sposta la mira, piano
    else if (orb.ax !== 'v') { const da = dx / Math.max(1, scrW) * 3.8; if (!ctrl8()) orb.a = angDiff(orb.a + da, 0); cam.yaw += da; orb.back = false; orb.hold = 0; }
    if (orb.ax !== 'h') { orb.p = Math.max(-1, Math.min(1, orb.p + dy / Math.max(1, scrH) * 2.2)); orb.pBack = false; }
    return;
  }
  orb.id = null;
  if (save && !mapOpen) save.opt.cam = Math.round(orb.p * 100) / 100;      // l'altezza preferita si ricorda
  if (type === 'up' && !mapOpen && orb.moved < scrH * 0.025 && time - orb.t0 < 0.3) {
    if (time - orb.tap < 0.42 && Math.hypot(x - orb.tx, y - orb.ty) < scrH * 0.2) { if (orb.a !== 0 || ctrl8()) orb.back = true; orb.pBack = true; orb.tap = -9; if (save) save.opt.cam = 0; tone(880, 0.03, 'square', 0.02); }
    else { orb.tap = time; orb.tx = x; orb.ty = y; }
  }
}
function placeCam(snap) {
  if (camFix) { Object.assign(cam, camFix); return; }
  const up = Math.max(0, orb.p), dn = D ? 0 : Math.max(0, -orb.p);
  if (D) { const fx2 = Math.cos(cam.yaw), fz2 = Math.sin(cam.yaw), cd = 20 - up * 7, ex = hero.x - fx2 * cd, ez = hero.z - fz2 * cd, ey = Math.max(hero.y, -2) + 16 + up * 15, k = snap ? 1 : 0.25, lf = 8 * (1 - 0.6 * up); cam.x += (ex - cam.x) * k; cam.y += (ey - cam.y) * k; cam.z += (ez - cam.z) * k; cam.tx = hero.x + fx2 * lf; cam.ty = hero.y + 6.5; cam.tz = hero.z + fz2 * lf; return; }
  const fx = Math.cos(cam.yaw), fz = Math.sin(cam.yaw), CD = (CAM_D - up * 7 - dn * 3) * (1 - 0.3 * aimK);
  // in una grotta aperta la visuale resta dentro: non sale sopra le pareti (si avvicina all'eroe) e sta sotto il soffitto
  let gf = 0, gce = 0; if (W.GROTTE.length) { const q = W.grotta(hero.x, hero.z); if (q && q.f && hero.y < q.ce) { gf = q.f; gce = q.ce; } }
  let d = CD * 0.24;
  for (let t = 0.24; t <= 1.001; t += 0.08) { const px = hero.x - fx * CD * t, pz = hero.z - fz * CD * t; if (W.inBox(px, pz, 1.5) || (gf && gH(px, pz) > hero.y + 3.5)) break; d = CD * t; }
  const ex = hero.x - fx * d, ez = hero.z - fz * d;
  let ey = hero.y + CAM_H + up * 24 - dn * 8.5;
  ey = Math.max(ey, gH(ex, ez) + 2.5, gH((ex + hero.x) / 2, (ez + hero.z) / 2) + 2, W.WL + 1.5);
  if (gf) { if (gf === 2) ey = Math.min(ey, gce - 1.6); const q = W.grotta(ex, ez); if (q && q.f >= 2) ey = Math.min(ey, q.ce - 1.6); }
  const k = snap ? 1 : 0.25, lf = LOOK_F * (1 - 0.6 * up) * (1 + 2.4 * aimK);
  cam.x += (ex - cam.x) * k; cam.y += (ey - cam.y) * k; cam.z += (ez - cam.z) * k;
  cam.tx = hero.x + fx * lf; cam.ty = hero.y + LOOK_H + dn * 5 + 1.5 * aimK; cam.tz = hero.z + fz * lf;
}

// ---------- movimento con collisioni ----------
function canStand(e, nx, nz, r, steep) {
  if (D) return dCanStand(e, nx, nz, r);
  if (nx < 10 || nz < W.Z0 + 10 || nx > W.WS - 10 || nz > W.WS - 10) return false;
  const h0 = gH(e.x, e.z, e.y), h1 = gH(nx, nz, e.y), d = Math.hypot(nx - e.x, nz - e.z) || 1e-6;
  if (h1 < W.wlAt(nx, nz) - 2.2) return false;
  if ((h1 - h0) / d > steep) return false;
  return !W.blocked(nx, nz, r);
}
function move(e, dx, dz, r, steep = 1.25) {
  if (canStand(e, e.x + dx, e.z + dz, r, steep)) { e.x += dx; e.z += dz; return true; }
  if (Math.abs(dx) > 1e-4 && canStand(e, e.x + dx, e.z, r, steep)) { e.x += dx; return true; }
  if (Math.abs(dz) > 1e-4 && canStand(e, e.x, e.z + dz, r, steep)) { e.z += dz; return true; }
  return false;
}
function puffAt(x, z, n = 6, y) { const gy = y !== undefined ? y : gH(x, z) + 2; for (let i = 0; i < n; i++) fx.push({ k: 'puff', x: x + (Math.random() - 0.5) * 4, z: z + (Math.random() - 0.5) * 4, y: gy, vy: 3 + Math.random() * 5, t: 0.6 + Math.random() * 0.3, s: 0.45 }); }

// ---------- il combattimento nuovo (solo nel Grande Viaggio) ----------
// Fiato (lo consumano schivate, colpi caricati e parate; torna pieno in due secondi), schivata con un tocco di B, catena di tre colpi a tempo,
// contrattacco subito dopo una schivata, parata perfetta se lo scudo si alza all'ultimo momento; i nemici si preparano con un lampo
// (bianco: si para o si schiva; rosso: si schiva soltanto) e i più robusti hanno una guardia da rompere.
const DIFF = [{ n: 'FACILE', dmg: 0.5, wind: 1.35, hp: 0.8 }, { n: 'NORMALE', dmg: 1, wind: 1, hp: 1 }, { n: 'DIFFICILE', dmg: 1.5, wind: 0.8, hp: 1.3 }];
const diffK = () => DIFF[save.opt.diff === undefined ? 1 : save.opt.diff] || DIFF[1];
let forzaOra = 0;   // quanto rompe la guardia il colpo che sta andando a segno: 0 colpo normale, 1 l'ultimo della catena, 2 contrattacco, 3 colpo caricato, 9 parata perfetta
function nuovoTick(dt) {
  const h = hero; if (h.fi === undefined) { h.fi = 1; h.fiT = 9; h.fiFl = 0; h.combo = 0; h.comboT = 9; h.ctr = 0; h.bHold = 0; h.blockT = 0; h.dmgK = 1; h.forza = 0; }
  h.fiT += dt; if (h.fiT > 0.4 && h.fi < 1) h.fi = Math.min(1, h.fi + dt / 2); if (h.fiFl > 0) h.fiFl -= dt;
  if (h.atk > 0) h.comboT = 0; else h.comboT += dt;
  if (h.ctr > 0) h.ctr -= dt; h.blockT = h.block ? h.blockT + dt : 0;
  // B: un tocco è la schivata (tenuto resta la corsa)
  const busy = dialog || shop || loot || menu || mapOpen || fade;
  if (BTN.b && !busy) h.bHold += dt; else { if (h.bHold > 0 && h.bHold < 0.2 && !busy) schiva(); h.bHold = 0; }
}
function schiva() {
  const h = hero; if (h.dash || h.fall > 0 || inCasa() || h.dead) return;
  if (h.fi < 0.3) { h.fiFl = 0.5; tone(160, 0.08, 'square', 0.03); return; }
  // nella direzione della leva; senza leva, un passo indietro
  let a = h.yaw + Math.PI;
  if (ctrl8()) { const ix = (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0), iy = (BTN.down ? 1 : 0) - (BTN.up ? 1 : 0); if (ix || iy) a = cam.yaw + Math.atan2(ix, -iy); }
  else if (BTN.left) a = h.yaw - Math.PI / 2; else if (BTN.right) a = h.yaw + Math.PI / 2; else if (BTN.up) a = h.yaw;
  h.fi -= 0.34; h.fiT = 0; h.atk = 0; h.chg = 0; h.aDown = false; h.aim = false; h.inv = Math.max(h.inv, 0.3);
  h.dash = { k: 'schivata', t: 0.24, vx: Math.cos(a) * 78, vz: Math.sin(a) * 78, hit: new Set() };
  tone(520, 0.07, 'triangle', 0.03, 260); noise(0.06, 0.02);
}
// la scia della lama: orizzontale, diagonale o dritta dall'alto
function scia(g) { const h = hero; fx.push({ k: ['sciaV', 'sciaD', 'sciaO'][g], x: h.x + Math.cos(h.yaw) * 6.5, z: h.z + Math.sin(h.yaw) * 6.5, y: h.y + (g === 2 ? 2.2 : 2.0), vy: 0, t: 0.17, s: g === 2 ? 0.42 : 0.36, fermo: 1 }); }
// A dopo A: la catena. Il terzo colpo è più forte; subito dopo una schivata, il contrattacco
function catena() {
  const h = hero; h.dmgK = 1; h.forza = 0;
  if (h.ctr > 0) { h.ctr = 0; h.combo = 0; h.dmgK = 2.2; h.forza = 2; h.gesto = 2; tone(1568, 0.05, 'square', 0.04); tone(2093, 0.08, 'square', 0.035, null, 0.05); for (let i = 0; i < 5; i++) fx.push({ k: 'glint', x: h.x + (Math.random() - 0.5) * 5, z: h.z + (Math.random() - 0.5) * 5, y: h.y + 3 + Math.random() * 4, vy: 7, t: 0.35, s: 0.3 }); }
  else { h.combo = h.comboT < 0.45 ? (h.combo + 1) % 3 : 0; h.gesto = [1, 2, 0][h.combo];   // primo colpo in diagonale, secondo di traverso, terzo dall'alto
    if (h.combo === 2) { h.dmgK = 1.8; h.forza = 1; tone(1175, 0.06, 'square', 0.04); } }
}
function togliGuardia(e, n) {
  const T = FOE[e.type]; if (!T.gd || e.st === 'dead' || e.rotto > 0) return;
  e.gd = (e.gd === undefined ? T.gd : e.gd) - n;
  if (e.gd <= 0) { e.gd = T.gd; e.rotto = 2; e.stun = 2; if (e.st === 'wind') { e.st = 'chase'; e.cd = 0.4; } toast('GUARDIA ROTTA!', '#ffd23f'); critFx(e); quake = Math.max(quake, 0.25); vib(40); }
}
// un colpo dell'eroe contro la guardia di un nemico: quanto danno passa (null = parato del tutto)
function guardiaNemico(e, dmg) {
  const T = FOE[e.type], fz = forzaOra;
  if (e.rotto > 0) return dmg * 2;
  if (T.scudo && !(e.stun > 0) && fz < 3 && Math.cos(e.yaw - Math.atan2(hero.z - e.z, hero.x - e.x)) > 0.25) {
    tone(1300, 0.05, 'square', 0.05); for (let i = 0; i < 3; i++) fx.push({ k: 'spark', x: e.x, z: e.z, y: e.y + 4 + Math.random() * 2, vy: 8, t: 0.2, s: 0.3 });
    if (fz > 0) togliGuardia(e, fz); return null; }
  if (T.gd) { if (fz > 0) togliGuardia(e, fz); return e.rotto > 0 ? dmg : Math.max(1, Math.round(dmg * 0.5)); }   // il colpo che rompe la guardia passa intero; i successivi valgono doppio
  return dmg;
}
// la parata: costa fiato; alzata all'ultimo momento è perfetta (non costa, e chi ha colpito resta scoperto). I colpi rossi non si parano
function parataNuova(src) {
  const foe = src.type && FOE[src.type] ? src : src.src && src.src.type && FOE[src.src.type] ? src.src : null;
  if (src.rosso || (foe === src && FOE[foe.type].rosso)) return false;
  const perf = hero.blockT < 0.24;
  if (!perf) { if (hero.fi < 0.2) { hero.guard = 1.6; hero.block = false; hero.fiFl = 0.6; toast('GUARDIA SPEZZATA!', '#ff8a8a'); tone(160, 0.2, 'square', 0.05, 80); return false; } hero.fi -= 0.25; hero.fiT = 0; }
  tone(1400, 0.05, 'square', 0.05); tone(900, 0.08, 'square', 0.04, null, 0.04); vib(20);
  for (let i = 0; i < 4; i++) fx.push({ k: 'spark', x: hero.x + Math.cos(hero.yaw) * 3, z: hero.z + Math.sin(hero.yaw) * 3, y: hero.y + 4 + Math.random() * 2, vy: 8, t: 0.22, s: 0.3 });
  const a = Math.atan2(hero.z - src.z, hero.x - src.x); hero.kx = Math.cos(a) * 14; hero.kz = Math.sin(a) * 14; hero.kb = 0.08; hero.inv = 0.3;
  if (perf) { toast('PARATA PERFETTA!', '#ffe14a'); seq([1568, 2093], 0.05, 0.05); if (foe && foe.st !== 'dead') { if (FOE[foe.type].gd) togliGuardia(foe, 9); else { foe.rotto = 2; foe.stun = 2; if (foe.st === 'wind') foe.st = 'chase'; critFx(foe); } } }
  else if (foe && foe.camp && foe.st !== 'dead') { foe.kb = 0.16; foe.kx = -Math.cos(a) * 40; foe.kz = -Math.sin(a) * 40; stun(foe, 0.5); }
  return true;
}
const perfetta = () => !!MODO && hero.block && hero.blockT < 0.24;
// il segnale: il nemico sta per colpire
function segnale(e) { const T = FOE[e.type]; tone(T.rosso ? 196 : 1320, 0.07, 'square', 0.035, T.rosso ? 147 : null); for (let i = 0; i < 3; i++) fx.push({ k: T.rosso ? 'ember' : 'glint', x: e.x + (Math.random() - 0.5) * 3, z: e.z + (Math.random() - 0.5) * 3, y: e.y + 9 + Math.random() * 2, vy: 4, t: 0.35, s: 0.34 }); }
// i mestieri: chi sta lontano e tira, chi rafforza i compagni, chi corre a chiamare rinforzi. true = per questo giro ha già deciso lui
function mestiere(e, T, dt, d, dx, dz) {
  const calmo = st !== 'play' || hero.dead || dialog || shop || loot || hero.hid > 0;
  if (T.fermo) { if (e.hp < 150) e.hp = T.hp; e.yaw += angDiff(Math.atan2(dz, dx), e.yaw) * Math.min(1, 2 * dt); return true; }
  if (T.mest === 'arciere' || T.mest === 'mago') {
    if (e.st === 'wind') { e.yaw = Math.atan2(dz, dx); if (e.t <= 0) { const a = Math.atan2(dz, dx);
        if (T.mest === 'mago') shoot('fire', e.x, e.z, a, 62, T.dmg, e, { rosso: true, life: 3.2, r: 2.8, y: e.y + 5 }); else shoot('seed', e.x, e.z, a, 128, T.dmg, e, { life: 1.6, y: e.y + 5 });
        tone(T.mest === 'mago' ? 300 : 520, 0.08, 'triangle', 0.04, 170); e.st = 'chase'; e.cd = T.mest === 'mago' ? 3 : 2.1; } return true; }
    if (calmo || d > T.aggro) return false;
    e.st = 'chase'; e.yaw += angDiff(Math.atan2(dz, dx), e.yaw) * Math.min(1, 8 * dt);
    // tiene la distanza: arretra se l'eroe è addosso, si avvicina se è troppo lontano
    const dir = d < 40 ? -1 : d > 68 ? 1 : 0; e.moving = false;
    if (dir) { const a = Math.atan2(dz, dx) + (dir < 0 ? Math.PI : 0), m = T.sp * (dir < 0 ? 0.8 : 1) * dt; if (move(e, Math.cos(a) * m, Math.sin(a) * m, T.r, 1.6)) { e.moving = true; e.walk += m; } }
    if (T.mest === 'mago') { e.buff = (e.buff || 4) - dt; if (e.buff <= 0) { e.buff = 7; let k = 0; for (const o of foes) if (o !== e && o.camp === e.camp && o.st !== 'dead' && Math.hypot(o.x - e.x, o.z - e.z) < 70) { o.rage = 4; k++; ringLite(o.x, o.z, 5, 'ember', 8); } if (k) { tone(233, 0.3, 'sawtooth', 0.04, 349); ringLite(e.x, e.z, 6, 'ember', 10); } } }
    if (e.cd <= 0 && d < T.aggro * 0.8) { e.st = 'wind'; e.t = Math.max(0.4, T.wind) * diffK().wind; segnale(e); }
    return true;
  }
  if (T.mest === 'vedetta' && e.vd !== 3) {
    if (!e.vd) { if (calmo || d > T.aggro) return false; e.vd = 1; e.t = 3.2; const a = Math.atan2(-dz, -dx); e.wx = e.camp.x + Math.cos(a) * 40; e.wz = e.camp.z + Math.sin(a) * 40; tone(880, 0.08, 'square', 0.03); }
    if (e.vd === 1) { const a = Math.atan2(e.wz - e.z, e.wx - e.x), m = T.sp * 1.25 * dt; e.yaw += angDiff(a, e.yaw) * Math.min(1, 10 * dt); e.moving = move(e, Math.cos(e.yaw) * m, Math.sin(e.yaw) * m, T.r, 1.6); if (e.moving) e.walk += m;
      if (Math.hypot(e.wx - e.x, e.wz - e.z) < 5 || e.t <= 0) { e.vd = 2; e.t = 1.7; toast('LA VEDETTA PORTA IL CORNO ALLA BOCCA...', '#ffb070'); } return true; }
    // suona il corno: se ci arriva, i rinforzi
    e.moving = false; e.st = 'wind'; e.yaw = Math.atan2(dz, dx);
    if (e.t <= 0) { e.vd = 3; e.st = 'chase'; e.cd = 1; seq([392, 392, 523], 0.16, 0.07); toast('IL CORNO! ARRIVANO I RINFORZI!', '#ff8a8a'); for (let i = 0; i < 2; i++) salaNemico('sf', e.camp, e.x + (i ? 14 : -14), e.z + 10); }
    return true;
  }
  return false;
}
// ---------- la sala d'armi ----------
const SALA_C = { x: 6200, z: 5320, type: 'sf', n: 0, r: 60, alive: [], dead: 0, cool: 1e9, on: true, sala: true };
function salaNemico(t, c, x, z) {
  const T = FOE[t], p = fixSpot(x, z, T.r), e = { type: t, camp: c, x: p[0], z: p[1], y: gH(p[0], p[1], -1e9), yaw: Math.atan2(hero.z - p[1], hero.x - p[0]), hp: Math.max(1, Math.round(T.hp * (T.fermo ? 1 : diffK().hp))), st: 'idle', t: 1 + Math.random(), cd: 0.8, flash: 0, kb: 0, walk: 0, hop: Math.random(), wx: p[0], wz: p[1] };
  foes.push(e); c.alive.push(e); puffAt(e.x, e.z, 6); return e;
}
function salaVia() { for (const e of foes) if (e.camp === SALA_C) e.gone = true; foes = foes.filter(e => !e.gone); SALA_C.alive = []; SALA_C.dead = 0; shots = shots.filter(s => s.from !== 'foe'); }
function salaMetti(tipi) { salaVia(); hero.hp = MAXHP(); hero.fi = 1; tipi.forEach((t, i) => { const a = Math.PI * (0.5 + (tipi.length > 1 ? (i / (tipi.length - 1) - 0.5) * 0.9 : 0)); salaNemico(t, SALA_C, SALA_C.x + Math.cos(a) * 30, SALA_C.z + Math.sin(a) * 30); }); seq([523, 659, 784], 0.07, 0.05); }
const SALA_TXT = ['DUE FANTI. ATTACCANO UNO ALLA VOLTA: QUANDO UNO LAMPEGGIA DI BIANCO, SCHIVA CON UN TOCCO DI B (O PARA), POI COLPISCI TRE VOLTE DI FILA.',
  "L'ARCIERE STA LONTANO E MIRA. CORRIGLI ADDOSSO, OPPURE ALZA LO SCUDO ALL'ULTIMO MOMENTO: LA FRECCIA TORNA INDIETRO.",
  'LO SCUDIERO DI FRONTE PARA TUTTO. GIRAGLI ATTORNO, O ROMPIGLI LA GUARDIA CON UN COLPO CARICATO (A TENUTO E LASCIATO).',
  'LE SFERE ROSSE DELLO STREGONE NON SI PARANO: SCHIVALE. E RAFFORZA IL FANTE CHE HA ACCANTO: VA PRESO PER PRIMO.',
  'IL BRUTO È LENTO E CORAZZATO. I SUOI COLPI ROSSI NON SI PARANO: SCHIVA, E COLPISCI SUBITO DOPO. ROMPIGLI LA GUARDIA E IL DANNO RADDOPPIA.',
  'LA VEDETTA SCAPPA A SUONARE IL CORNO. SE CI RIESCE ARRIVANO I RINFORZI: FERMALA PRIMA.'];
function salaMenu(id) {
  ask(id, ["QUESTA È LA SALA D'ARMI. CONTRO CHI TI ALLENI?"], ['IL MANICHINO', 'UN NEMICO PER MESTIERE', 'UNA SQUADRA', 'DIFFICOLTÀ: ' + diffK().n, 'SGOMBERA LA SALA', 'NIENTE'], i => {
    if (i === 0) { salaMetti(['sm']); say(id, ['IL MANICHINO NON SI MUOVE E NON MUORE. PROVA LA CATENA (A, A, A A TEMPO), IL COLPO CARICATO (A TENUTO) E LA SCHIVATA (UN TOCCO DI B).', 'LA BARRA VERDE È IL FIATO. LA SUA GUARDIA SI ROMPE CON I COLPI CARICATI: POI IL DANNO RADDOPPIA.']); }
    else if (i === 1) ask(id, ['QUALE MESTIERE?'], ['FANTE', 'ARCIERE', 'SCUDIERO', 'STREGONE', 'BRUTO', 'VEDETTA'], j => { salaMetti([['sf', 'sf'], ['sa'], ['ss'], ['st', 'sf'], ['sb'], ['sv']][j]); say(id, [SALA_TXT[j]]); });
    else if (i === 2) { salaMetti(['sf', 'sa', 'ss', 'st', 'sf']); say(id, ['UNA SQUADRA INTERA: DUE FANTI, UN ARCIERE, UNO SCUDIERO, UNO STREGONE. BUONA FORTUNA.']); }
    else if (i === 3) { save.opt.diff = ((save.opt.diff === undefined ? 1 : save.opt.diff) + 1) % 3; writeSave(); salaMenu(id); }
    else if (i === 4) salaVia();
  });
}

// ---------- eroe ----------
function hurtHero(dmg, src, hard) {
  if (hero.inv > 0 || hero.dead || hero.dash) return;
  if (MODO) dmg = Math.max(1, Math.round(dmg * diffK().dmg));
  // la guardia del cavaliere: ferma quello che arriva di fronte (i colpi più duri solo a metà); ogni parata costa energia
  if (MODO && hero.block && src && Math.cos(Math.atan2(src.z - hero.z, src.x - hero.x) - hero.yaw) > 0.15) { if (parataNuova(src)) return; }
  else if (hero.block && src && Math.cos(Math.atan2(src.z - hero.z, src.x - hero.x) - hero.yaw) > 0.15) {
    const cost = hard ? 2 : 1;
    if (hero.en >= cost) {
      hero.en -= cost; hero.enT = 0; tone(1400, 0.05, 'square', 0.05); tone(900, 0.08, 'square', 0.04, null, 0.04); vib(20);
      for (let i = 0; i < 4; i++) fx.push({ k: 'spark', x: hero.x + Math.cos(hero.yaw) * 3, z: hero.z + Math.sin(hero.yaw) * 3, y: hero.y + 4 + Math.random() * 2, vy: 8, t: 0.22, s: 0.3 });
      const a = Math.atan2(hero.z - src.z, hero.x - src.x); hero.kx = Math.cos(a) * 18; hero.kz = Math.sin(a) * 18; hero.kb = 0.1;
      if (src.type && FOE[src.type] && src.st !== 'dead' && src.camp) { src.kb = 0.16; src.kx = -Math.cos(a) * 40; src.kz = -Math.sin(a) * 40; stun(src, 0.7); }
      if (!hard) { hero.inv = 0.3; return; }
      dmg = Math.max(1, Math.ceil(dmg / 2));
    } else { hero.guard = 2.2; hero.block = false; hero.enFl = 0.6; toast('GUARDIA SPEZZATA!', '#ff8a8a'); tone(160, 0.2, 'square', 0.05, 80); }
  }
  const red = Math.floor(DIF() / 3), d = Math.max(1, dmg - (hard ? Math.min(1, red) : red));
  hero.hp -= d; hero.inv = 0.9; hero.flash = 0.25;
  if (src) { const a = Math.atan2(hero.z - src.z, hero.x - src.x); hero.kx = Math.cos(a) * 46; hero.kz = Math.sin(a) * 46; hero.kb = 0.18; }
  tone(170, 0.18, 'sawtooth', 0.06, 70); vib(60);
  if (hero.hp <= 0) { hero.hp = 0; hero.dead = true; death = 0; st = 'dead'; noise(0.5, 0.08); }
}
function heroUpdate(dt) {
  const h = hero;
  if (h.inv > 0) h.inv -= dt; if (h.flash > 0) h.flash -= dt;
  // caduta in un pozzo del santuario: si riparte dall'ingresso della stanza
  if (D && h.fall > 0) {
    h.fall -= dt; h.y -= 50 * dt; h.moving = false;
    if (h.fall <= 0) { h.fall = 0; h.hp -= 2; h.flash = 0.3; tone(170, 0.18, 'sawtooth', 0.06, 70); vib(60);
      if (h.hp <= 0) { h.hp = 0; h.dead = true; death = 0; st = 'dead'; noise(0.5, 0.08); }
      else { h.x = D.entry.x; h.z = D.entry.z; h.yaw = D.entry.yaw; h.y = 0; h.vx = h.vz = 0; h.inv = 1.2; camBehind(); toast('SEI CADUTO!', '#ff8a8a'); } }
    return;
  }
  const busy = dialog || shop || loot || menu || mapOpen || fade;
  let f = 0, turn = 0, ma = null;
  if (!busy) {
    if (ctrl8()) {
      // comandi a 8 direzioni: l'eroe va dove punta la leva, rispetto alla visuale (su = avanti, giù = verso di te), e si volta da solo
      const ix = (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0), iy = (BTN.down ? 1 : 0) - (BTN.up ? 1 : 0);
      if (ix || iy) { h.lev = Math.atan2(ix, -iy); ma = cam.yaw + h.lev; f = 1; }
    } else { turn = (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0); f = BTN.up ? 1 : BTN.down ? -0.55 : 0; }
  }
  if (h.aim && !busy) {
    const ix = (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0); h.aimT = ix ? (h.aimT || 0) + dt : 0;
    h.yaw += ix * (0.4 + Math.min(1, h.aimT / 0.7) * 1.3) * dt; ma = null; turn = 0; f = BTN.up ? 0.5 : BTN.down ? -0.4 : 0;
  }
  heroTick(dt);                                    // energia, colpo caricato, guardia
  if (h.dash) { f = 0; turn = 0; ma = null; }
  if (ma === null) h.lev = 0;
  if (ma !== null) h.yaw += angDiff(ma, h.yaw) * Math.min(1, 16 * dt); else h.yaw += turn * 2.45 * dt;
  const mdir = ma !== null ? ma : h.yaw;           // dove si va: con la leva, subito nella direzione premuta
  const cell = D ? dCellAt(h.x, h.z) : -1;
  h.wade = D ? cell === DT.WATER : gH(h.x, h.z) < W.wlAt(h.x, h.z) - 0.35;
  const slow = h.block ? 0.45 : h.chg > 0 ? 0.6 : 1;
  let sp = 25 * VEL() * (BTN.b && f > 0 && slow === 1 ? 1.65 : 1) * (h.wade ? (D ? 0.6 : 0.55) : 1) * (h.atk > 0 ? 0.35 : 1) * slow;
  if (h.kb > 0) { h.kb -= dt; move(h, h.kx * dt, h.kz * dt, 1.6); }
  h.moving = false;
  const dx = Math.cos(mdir) * f * sp * dt, dz = Math.sin(mdir) * f * sp * dt;
  if (h.dash) dashStep(dt);
  else if (D && cell === DT.ICE) {
    // sul ghiaccio si scivola
    const k = Math.min(1, 1.6 * dt); h.vx += (dx / dt - h.vx) * k; h.vz += (dz / dt - h.vz) * k;
    if (Math.hypot(h.vx, h.vz) > 0.4) { if (move(h, h.vx * dt, h.vz * dt, 1.6)) { h.moving = f !== 0; h.walk += Math.hypot(h.vx, h.vz) * dt; } else { h.vx *= -0.25; h.vz *= -0.25; } }
    if (f > 0) heroPush(dt, mdir);
  } else if (f !== 0) {
    h.vx = dx / dt; h.vz = dz / dt;
    if (move(h, dx, dz, 1.6)) { h.moving = true; h.walk += Math.hypot(dx, dz); if (!(D && f > 0 && D.blocks.length && heroPush(dt, mdir, 6.9))) h.pushT = 0; }
    else if (D && f > 0 && !heroPush(dt, mdir)) {
      const ahead = dCellAt(h.x + Math.cos(h.yaw) * 4, h.z + Math.sin(h.yaw) * 4);
      if (ahead === DT.WATER && !canSwim() && time > (h.hintT || 0)) { h.hintT = time + 4; toast(swimItem() ? 'EQUIPAGGIA ' + swimItem().n + ' (START)' : "L'ACQUA È TROPPO PROFONDA", '#a9d8ff'); }
    }
    if (h.wade && Math.random() < 0.3) fx.push({ k: 'drop', x: h.x, z: h.z, y: D ? -1 : W.wlAt(h.x, h.z) + 0.3, vy: 8 + Math.random() * 6, t: 0.4, s: 0.35 });
  } else { h.vx = h.vz = 0; h.pushT = 0; }
  // spinta via dagli abitanti
  if (!D) for (const n of npcs) { const ddx = h.x - n.x, ddz = h.z - n.z, d = Math.hypot(ddx, ddz); if (d < 4.2 && d > 0.01) { move(h, ddx / d * (4.2 - d), ddz / d * (4.2 - d), 1.6); } }
  h.y += (gH(h.x, h.z) - h.y) * Math.min(1, 18 * dt);
  // attacco
  if (h.atk > 0) {
    h.atk -= dt;
    if (!h.hitDone && h.atk < ACT[h.act][1]) { h.hitDone = true; heroHit(h.act); }
  }
  // pericoli del santuario: pozzi, punte, uscita
  if (D) {
    const c = dCellAt(h.x, h.z), i = Math.floor(h.x / DCS), j = Math.floor(h.z / DCS);
    if (c === DT.PIT || (c === DT.PLAT && !D.platUp[j * D.w + i])) { h.fall = 0.7; h.atk = 0; h.dash = null; h.chg = 0; tone(700, 0.6, 'triangle', 0.05, 90); return; }
    if (c === DT.SPIKE && h.inv <= 0) hurtHero(2, { x: h.x + Math.cos(h.yaw) * 4, z: h.z + Math.sin(h.yaw) * 4 });
    if (c === DT.EXIT && !fade) startFade(() => D.def.up ? gotoLevel(D.def.up, 'down') : exitDungeon());
    if (c === DT.STAIR && !fade && D.def.down) startFade(() => gotoLevel(D.def.down, 'up'));
  }
  // lava
  const lava = D ? dCellAt(h.x, h.z) === DT.LAVA : lavaAt(h.x, h.z);
  if (lava && (D || !h.wade) && !fireProof()) { h.burnT -= dt; if (h.burnT <= 0) { h.burnT = 0.7; hurtHero(1, null); toast('SCOTTA! LA LAVA BRUCIA!', '#ff8a4a'); } if (Math.random() < 0.3) fx.push({ k: 'ember', x: h.x, z: h.z, y: h.y + 1, vy: 10, t: 0.5, s: 0.4 }); }
  // amuleti che curano
  if (eqHas('regen') && h.hp < MAXHP()) { h.regenT += dt; if (h.regenT > 8) { h.regenT = 0; h.hp++; } }
}
function lavaAt(x, z) { const i = Math.max(0, Math.min(W.TEX - 1, Math.floor(x / (W.WS / W.TEX)))), j = Math.max(0, Math.min(W.TEXZ - 1, Math.floor((z - W.Z0) / (W.WS / W.TEX)))); return W.col[(j * W.TEX + i) * 4 + 3] > 140; }

// ---------- classi: colpi, colpo caricato, abilità ----------
// ogni mossa: quanto dura e quanto manca alla fine quando va a segno
const ACT = { slash: [0.42, 0.27], spin: [0.52, 0.38], shot: [0.4, 0.28], pshot: [0.5, 0.38], stab: [0.26, 0.18], knives: [0.42, 0.3], bolt: [0.45, 0.31], orb: [0.55, 0.39], cast: [0.4, 0.28] };
const ICE_T = [0.62, 0.95, 1.6], LIGHT_T = [1.6, 1.5, 0.9];
let things = [], clsUI = null, clsPics = null, chip = null, chipM = null, btnC = null;
function ringLite(x, z, r, k = 'spark', n = 14) { const gy = gH(x, z); for (let i = 0; i < n; i++) { const a = i / n * TAU; fx.push({ k, x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, y: gy + 2.5, vy: 5, t: 0.28, s: 0.3 }); } }
function startAct(a, fn) { const h = hero; h.dmgK = 1; h.forza = 0; h.gesto = 0; h.act = a; h.atkT = ACT[a][0]; h.atk = h.atkT; h.hitDone = false; h.castFn = fn || null; }
const tough = e => FOE[e.type].champ || FOE[e.type].elite;
function stun(e, t) { if (e.st === 'dead') return; e.stun = Math.max(e.stun || 0, t * (tough(e) ? 0.4 : 1)); if (e.st === 'wind') { e.st = 'chase'; e.cd = Math.max(e.cd, 0.3); } }
function freeze(e, t) { stun(e, t); e.frz = e.stun; }
function burn(e, t, d) { if (e.st === 'dead') return; e.burn = t; e.burnD = d; if (!(e.burnT > 0)) e.burnT = 0.8; }
// i guardiani si lasciano interrompere dai colpi forti delle classi, ma non di continuo
let ptime = 0, frozen = false;      // il tempo di gioco (fermo nei menu)
const classStun = () => !!boss && ptime > (boss.stunT || 0) && stunBoss(boss) && ((boss.stunT = ptime + 6), true);
// colpo alle spalle del furfante: il nemico non ti ha visto, è stordito o ti dà la schiena
const sneak = e => e.stun > 0 || hero.hid > 0 || (e.st !== 'chase' && e.st !== 'wind') || Math.cos(e.yaw - Math.atan2(hero.z - e.z, hero.x - e.x)) < -0.2;
function critFx(e) { for (let i = 0; i < 6; i++) fx.push({ k: 'glint', x: e.x + (Math.random() - 0.5) * 5, z: e.z + (Math.random() - 0.5) * 5, y: e.y + 3 + Math.random() * 4, vy: 7, t: 0.4, s: 0.34 }); tone(1760, 0.05, 'square', 0.05); tone(2349, 0.09, 'square', 0.04, null, 0.05); }
function dSight(x0, z0, x1, z1) { const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / 4); for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; if (dBlocks(Math.floor(x / DCS), Math.floor(z / DCS), 'shot')) return false; } return true; }
// il bersaglio di frecce e magie: il nemico più comodo davanti all'eroe (vicino e poco di lato), se non c'è un muro di mezzo
function aimAt(range, cone = 0.72) {
  const h = hero; let best = null, bs = -1e9;
  const see = (x, z, r, obj) => { const dx = x - h.x, dz = z - h.z, d = Math.hypot(dx, dz); if (d > range + r || d < 0.5) return; const c = Math.cos(Math.atan2(dz, dx) - h.yaw); if (c < cone) return; if (D && !dSight(h.x, h.z, x, z)) return; const s = c * 60 - d; if (s > bs) { bs = s; best = { x, z, obj, c }; } };
  for (const e of foes) if (e.st !== 'dead' && (!D || e.room === D.room)) see(e.x, e.z, FOE[e.type].r, e);
  if (D && boss && !boss.hide && !boss.dead && boss.on && boss.st !== 'die') see(boss.x, boss.z, boss.r, boss);
  return best;
}
// chi punta dritto un cristallo vuole colpire quello: vince sul nemico solo se l'eroe guarda più il cristallo che lui
function aimXtal(range) {
  if (!D) return null; const h = hero; let best = null, bc = 0.972;
  for (const x of D.xtals) { const dx = x.x - h.x, dz = x.z - h.z, d = Math.hypot(dx, dz); if (d > range || d < 0.5) continue; const c = Math.cos(Math.atan2(dz, dx) - h.yaw); if (c > bc && dSight(h.x, h.z, x.x, x.z)) { bc = c; best = { x: x.x, z: x.z, c }; } }
  return best;
}
// il bersaglio di un colpo a distanza: un nemico, oppure il cristallo se è quello che l'eroe ha davanti
function aimShot(range) { const xt = aimXtal(range), tg = aimAt(range); return xt && (!tg || xt.c >= tg.c) ? xt : tg; }
// colpi da vicino: davanti (o tutt'intorno), su nemici, guardiano, vasi, cristalli e crepe
function meleeHit(reach, cosMin, dmg, o = {}) {
  const h = hero;
  for (const e of foes) {
    if (e.st === 'dead') continue;
    const ex = e.x - h.x, ez = e.z - h.z, d = Math.hypot(ex, ez);
    if (d < reach + FOE[e.type].r && (o.all || Math.cos(Math.atan2(ez, ex) - h.yaw) > cosMin)) { const crit = o.back && sneak(e); hitFoe(e, crit ? Math.round(dmg * 2.5) : dmg, Math.atan2(ez, ex)); if (crit) critFx(e); }
  }
  if (D) dSwing(reach, cosMin, o);
}
function lightBeam(dmg) { const h = hero, a = h.yaw; shots.push({ k: 'light', from: 'hero', x: h.x + Math.cos(a) * 5, z: h.z + Math.sin(a) * 5, y: h.y + 4.5, vx: Math.cos(a) * 125, vz: Math.sin(a) * 125, r: 3, dmg: Math.max(2, Math.round(dmg * 0.6)), life: 0.62 }); tone(1046, 0.08, 'triangle', 0.03, 2093); }
// frecce, pugnali lanciati, dardi: partono verso il bersaglio e lo inseguono un poco
function heroShot(k, o = {}) {
  const h = hero; let tg = null;
  if (!o.noAim) { tg = aimShot(o.range || 125); if (tg) h.yaw = Math.atan2(tg.z - h.z, tg.x - h.x); }
  const a = h.yaw + (o.da || 0), sp = o.sp || 170;
  shots.push(Object.assign({ k, from: 'hero', cls: 1, x: h.x + Math.cos(a) * 4, z: h.z + Math.sin(a) * 4, y: h.y + 4.6, gy: D ? 0 : Math.max(W.ground(h.x, h.z), W.WL), vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, yaw: a, r: 2.2, dmg: 1, life: 0.75, tg: tg ? tg.obj : null, turn: 2.5 }, o));
}
// un'esplosione: ferisce chi è nel raggio; nei santuari rompe vasi, scuote cristalli e (le bombe) apre i muri crepati
function boom(x, z, r, dmg, o = {}) {
  const gy = gH(x, z);
  ringFx(x, z, r * 0.55); puffAt(x, z, 10, gy + 3);
  for (let i = 0; i < 10; i++) fx.push({ k: o.ice ? 'icefx' : 'ember', x: x + (Math.random() - 0.5) * r, z: z + (Math.random() - 0.5) * r, y: gy + 1 + Math.random() * 4, vy: 10 + Math.random() * 14, t: 0.4 + Math.random() * 0.3, s: o.ice ? 0.3 : 0.5 });
  noise(0.32, 0.09); tone(90, 0.32, 'sawtooth', 0.06, 40); quake = Math.max(quake, 0.4); vib(40);
  for (const e of foes) { if (e.st === 'dead' || e === o.skip) continue; if (Math.hypot(e.x - x, e.z - z) < r + FOE[e.type].r) { e.rage = 6; hitFoe(e, dmg, Math.atan2(e.z - z, e.x - x)); if (o.burn) burn(e, o.burn, Math.max(1, Math.round(dmg * 0.25))); if (o.frz) freeze(e, o.frz); } }
  if (D) {
    if (boss && boss !== o.skip && !boss.hide && !boss.dead && boss.on && boss.st !== 'die' && Math.hypot(boss.x - x, boss.z - z) < r + boss.r && !(o.pow && classStun())) bossHit(boss.vuln ? (o.boss || 1) : 0, true);
    for (const p of D.pots) if (p.alive && Math.hypot(p.x - x, p.z - z) < r) breakPot(p);
    for (const q of D.xtals) if (Math.hypot(q.x - x, q.z - z) < r * 0.7) hitXtal(q);
    if (o.crack) for (let j = Math.floor((z - r) / DCS); j <= Math.floor((z + r) / DCS); j++) for (let i = Math.floor((x - r) / DCS); i <= Math.floor((x + r) / DCS); i++)
      if (dAt(i, j) === DT.CRACK && Math.hypot((i + 0.5) * DCS - x, (j + 0.5) * DCS - z) < r + 3) for (let k = 0; k < 3 && dAt(i, j) === DT.CRACK; k++) hitCrack(i, j);
  } else fauna.scare(x, z, r * 3);
}
// fine corsa di un proiettile dell'eroe: quelli che esplodono, esplodono
function shotEnd(s, hit) { if (!s.boom || s.ended) return; s.ended = true; boom(s.x, s.z, s.boom.r, s.boom.dmg, { burn: s.boom.burn, frz: s.boom.frz, ice: s.boom.ice, pow: s.pow, boss: s.bossD, skip: s.boomOnly ? null : hit }); }
function shotWall(s) { if (!D) return; const i = Math.floor(s.x / DCS), j = Math.floor(s.z / DCS); if (dAt(i, j) === DT.CRACK) hitCrack(i, j); const p = D.pots.find(q => q.alive && Math.hypot(q.x - s.x, q.z - s.z) < 4.6); if (p) breakPot(p); }

// L'arco ha due stili. Mira automatica: la freccia parte verso il nemico che hai davanti e lo insegue un poco.
// Mira libera: tieni premuto A per tendere l'arco (la visuale si stringe, una linea mostra dove andrà la freccia), giri con la leva
// o col dito, lasci per tirare; la freccia va dritta dove guardi e non cerca nessuno. È lo stile della caccia.
const bowOn = () => !!save && cls() === 'arciere' && !!eqIt('arma');
const freeAim = () => bowOn() && save.opt.mira === 'l';
const AIM_R1 = 150, AIM_R2 = 225;     // fin dove arriva la freccia tirata subito e quella a corda tutta tesa
function toggleAim() {
  if (!bowOn() || !hero || hero.dead) return;
  save.opt.mira = freeAim() ? 'a' : 'l'; hero.aim = false; hero.aDown = false; hero.chg = 0; tone(1046, 0.05);
  toast(freeAim() ? 'MIRA LIBERA: TIENI A, GIRA, LASCIA PER TIRARE' : 'MIRA AUTOMATICA: LA FRECCIA CERCA IL NEMICO', '#7af0ff');
}
// lasciato A in mira libera: la freccia parte subito, dritta
function aimRelease(full) {
  const h = hero; h.free = true; startAct(full ? 'pshot' : 'shot'); h.hitDone = true; heroHit(h.act); h.free = false;
  tone(full ? 220 : 300, full ? 0.12 : 0.06, 'triangle', full ? 0.05 : 0.035, full ? 110 : 170);
  if (!D) fauna.scare(h.x, h.z, 20);
}
// A: il colpo della classe (senz'arma si va a pugni, come sempre)
function heroAttack() {
  const h = hero; if (MODO && h.atk > 0 && h.hitDone && h.atk < 0.2) h.atk = 0;   // la catena: si riparte sul finire del colpo
  if (h.atk > 0 || inCasa() || h.dash || h.block || h.fall > 0) return;
  if (freeAim()) { h.aim = true; h.aDown = true; h.aHold = 0; h.aimT = 0; h.chg = 0.02; tone(180, 0.09, 'triangle', 0.02, 260); return; }
  const c = cls(), a = !eqIt('arma') || c === 'cavaliere' ? 'slash' : c === 'arciere' ? 'shot' : c === 'furfante' ? 'stab' : 'bolt';
  startAct(a); h.aDown = true; h.aHold = 0; h.chg = 0; if (MODO) catena();
  if (a === 'slash') { noise(0.1, 0.04); tone(420, 0.08, 'triangle', 0.03, 200); }
  else if (a === 'shot') tone(300, 0.06, 'triangle', 0.035, 170);
  else if (a === 'stab') { noise(0.05, 0.03); tone(620, 0.05, 'triangle', 0.03, 320); }
  else tone(660, 0.1, 'sine', 0.04, 990);
  if (!D) fauna.scare(h.x, h.z, 46);
}
// A tenuto premuto e poi lasciato: il colpo caricato
function heroCharged() {
  const c = cls(), a = c === 'arciere' ? 'pshot' : c === 'furfante' ? 'knives' : c === 'mago' ? 'orb' : 'spin';
  if (MODO) { if (hero.fi < 0.3) { hero.fiFl = 0.5; tone(160, 0.08, 'square', 0.03); return; } hero.fi -= 0.34; hero.fiT = 0; }
  startAct(a); if (MODO) hero.forza = 3;
  if (a === 'spin') { noise(0.2, 0.06); tone(300, 0.3, 'sawtooth', 0.04, 700); } else if (a === 'pshot') tone(220, 0.12, 'triangle', 0.05, 110); else if (a === 'knives') { noise(0.1, 0.04); tone(800, 0.1, 'triangle', 0.03, 400); } else tone(440, 0.25, 'sine', 0.05, 1320);
  if (!D) fauna.scare(hero.x, hero.z, 60);
}
// il momento in cui il colpo va a segno
function heroHit(a) {
  const h = hero, w = eqIt('arma'), att = MODO ? Math.max(1, Math.round(ATT() * (h.dmgK || 1))) : ATT(), beam = !!(w && w.beam);
  forzaOra = MODO ? h.forza || 0 : 0;
  // chi tira da lontano, nei santuari, colpisce anche quello che ha a portata di mano (un cristallo, un vaso, una crepa): come una spada
  if (D && (a === 'shot' || a === 'pshot' || a === 'bolt' || a === 'orb')) dSwing(10.5, 0.35, { noBoss: true });
  if (a === 'slash' && MODO) { const g = h.gesto || 0; meleeHit(g === 2 ? 11 : g === 0 ? 11.5 : 10.5, g === 2 ? -0.1 : g === 0 ? 0.55 : 0.35, att); scia(g); if (beam) lightBeam(att); }   // di traverso prende largo, dall'alto stretto e lungo
  else if (a === 'slash') { meleeHit(10.5, 0.35, att); if (beam) lightBeam(att); }
  else if (a === 'spin') { meleeHit(15.5, 0, Math.round(att * 2), { all: true, boss: 2 }); ringLite(h.x, h.z, 9); ringLite(h.x, h.z, 14, 'glint', 10); if (beam) lightBeam(att); }
  else if (a === 'stab') { meleeHit(9.5, 0.3, Math.max(1, Math.round(att * 0.75)), { back: true, boss: 0.65 }); if (beam) lightBeam(att * 0.75); }
  else if (a === 'shot') { const o = h.nextShot || {}; h.nextShot = null; heroShot('arrow', Object.assign({ dmg: Math.max(1, Math.round(att * 0.8)), bossD: 0.8, pierce: beam, tint: beam ? LIGHT_T : null }, o, h.free ? { noAim: true, turn: 0, sp: 190, life: AIM_R1 / 190 } : null)); }
  else if (a === 'pshot') { heroShot('arrow', Object.assign({ dmg: Math.max(2, Math.round(att * 1.8)), sp: 230, life: 0.85, pierce: true, pow: true, bossD: 1.6, big: 1.4, turn: 1.2, tint: beam ? LIGHT_T : null }, h.free ? { noAim: true, turn: 0, sp: 250, life: AIM_R2 / 250 } : null)); noise(0.08, 0.04); }
  else if (a === 'knives') { const tg = aimShot(95); if (tg) h.yaw = Math.atan2(tg.z - h.z, tg.x - h.x); for (const da of [-0.19, 0, 0.19]) heroShot('knife', { noAim: true, da, dmg: Math.max(1, Math.round(att * 0.6)), sp: 185, life: 0.5, pow: true, bossD: 0.6, turn: 0, tg: null }); }
  else if (a === 'bolt') heroShot('bolt', { dmg: Math.max(1, Math.round(att * 0.85)), sp: 135, life: 0.8, turn: 5, bossD: 0.85, pierce: beam, tint: beam ? LIGHT_T : null });
  else if (a === 'orb') heroShot('orb', { dmg: Math.max(2, Math.round(att * 1.6)), sp: 120, life: 0.9, turn: 3, r: 3.2, pow: true, bossD: 1.6, big: 1.5, boom: { r: 11, dmg: Math.max(1, Math.round(att * 0.8)) } });
  else if (a === 'cast') { const fn = h.castFn; h.castFn = null; if (fn) fn(); }
  if (a !== 'cast') h.hid = 0;      // chi colpisce esce dal fumo
  forzaOra = 0;
}
// energia che torna, colpo caricato (A resta premuto), guardia del cavaliere (C premuto)
function heroTick(dt) {
  const h = hero, K = CC();
  if (MODO) nuovoTick(dt);
  if (h.cdC > 0) h.cdC -= dt; if (h.guard > 0) h.guard -= dt; if (h.hid > 0) h.hid -= dt; if (h.enFl > 0) h.enFl -= dt;
  h.enT += dt; if (h.enT >= K.regen) { h.enT = 0; if (h.en < K.en && !h.block) h.en++; }
  if (h.en > K.en) h.en = K.en;
  if (h.aim && (!h.aDown || !freeAim() || inCasa() || h.dash || h.fall > 0)) { h.aim = false; h.aDown = false; h.chg = 0; }
  if (h.aim) {
    // mira libera: l'arco si tende finché A resta premuto (la corda è tutta tesa dopo poco più di mezzo secondo)
    if (BTN.a) { h.aHold += dt; const was = h.chg; h.chg = Math.min(1, Math.max(0.02, h.aHold / 0.65)); if (h.chg >= 1 && was < 1) { tone(1568, 0.06, 'square', 0.04); tone(2093, 0.1, 'square', 0.035, null, 0.06); vib(15); } }
    else { const full = h.chg >= 1, ok = !(dialog || shop || loot || menu || mapOpen || fade) && h.atk <= 0; h.aim = false; h.aDown = false; h.chg = 0; if (ok) aimRelease(full); }
  } else if (h.aDown) {
    if (BTN.a) {
      h.aHold += dt;
      if (eqIt('arma') && h.atk <= 0 && !h.dash && !inCasa()) {
        const was = h.chg; h.chg = Math.min(1, Math.max(0, (h.aHold - 0.4) / 0.5));
        if (h.chg >= 1 && was < 1) { tone(1568, 0.06, 'square', 0.04); tone(2093, 0.1, 'square', 0.035, null, 0.06); vib(15); }
        if (h.chg > 0 && Math.random() < 0.18 + h.chg * 0.3) { const a = Math.random() * TAU; fx.push({ k: 'glint', x: h.x + Math.cos(a) * 2.6, z: h.z + Math.sin(a) * 2.6, y: h.y + 2 + Math.random() * 5, vy: 5, t: 0.22, s: 0.1 + h.chg * 0.07 }); }
      }
    } else { const full = h.chg >= 1; h.aDown = false; h.chg = 0; if (full && h.atk <= 0 && !h.dash) heroCharged(); }
  }
  h.block = !!K.shield && curSkill() === 'parata' && !!BTN.c && h.atk <= 0 && !h.dash && h.guard <= 0 && !inCasa();
}
// uno scatto: la carica del cavaliere (in avanti, travolge) e il balzo dell'arciere (all'indietro). Non salta i pozzi
function dashStep(dt) {
  const h = hero, d = h.dash, sp = Math.hypot(d.vx, d.vz) || 1; d.t -= dt; h.inv = Math.max(h.inv, 0.1);
  for (let k = 0; k < 3; k++) {
    const mx = d.vx * dt / 3, mz = d.vz * dt / 3;
    if (D) { const i = Math.floor((h.x + mx + d.vx / sp * 2.2) / DCS), j = Math.floor((h.z + mz + d.vz / sp * 2.2) / DCS), c = dAt(i, j); if (c === DT.PIT || c === DT.EXIT || c === DT.STAIR || (c === DT.PLAT && !D.platUp[j * D.w + i])) { d.t = 0; break; } }
    if (!move(h, mx, mz, 1.6)) { d.t = 0; break; }
  }
  h.moving = true; h.walk += sp * dt; h.vx = h.vz = 0;
  if (Math.random() < 0.7) fx.push({ k: 'puff', x: h.x, z: h.z, y: h.y + 0.6, vy: 2.5, t: 0.35, s: 0.3 });
  if (d.k === 'carica') {
    for (const e of foes) if (e.st !== 'dead' && !d.hit.has(e) && Math.hypot(e.x - h.x, e.z - h.z) < FOE[e.type].r + 5) { d.hit.add(e); hitFoe(e, Math.max(2, Math.round(ATT() * 1.5)), h.yaw); stun(e, 0.9); }
    if (D) {
      if (boss && !boss.hide && !boss.dead && boss.on && !d.hit.has(boss) && Math.hypot(boss.x - h.x, boss.z - h.z) < boss.r + 5) { d.hit.add(boss); bossHit(1.5); if (!boss.vuln) d.t = 0; }
      for (const p of D.pots) if (p.alive && Math.hypot(p.x - h.x, p.z - h.z) < 6) breakPot(p);
    }
  }
  if (d.t <= 0) { if (d.k === 'schivata') h.ctr = 0.5; h.dash = null; }
}
// C: l'abilità scelta (la parata invece si tiene premuta)
const SKILL = {
  carica() { const h = hero; h.dash = { k: 'carica', t: 0.27, vx: Math.cos(h.yaw) * 135, vz: Math.sin(h.yaw) * 135, hit: new Set() }; noise(0.18, 0.05); tone(180, 0.25, 'sawtooth', 0.05, 420); },
  grido() {
    const h = hero; startAct('cast'); ringLite(h.x, h.z, 12, 'glint', 12); ringLite(h.x, h.z, 26, 'spark', 20); ringLite(h.x, h.z, 40, 'spark', 26); tone(140, 0.5, 'sawtooth', 0.07, 90); tone(210, 0.4, 'square', 0.04, 120, 0.05); quake = Math.max(quake, 0.35); vib(60);
    for (const e of foes) if (e.st !== 'dead' && Math.hypot(e.x - h.x, e.z - h.z) < 46 && (!D || e.room === D.room)) { stun(e, 2.6); const a = Math.atan2(e.z - h.z, e.x - h.x); e.kb = tough(e) ? 0.05 : 0.16; e.kx = Math.cos(a) * 50; e.kz = Math.sin(a) * 50; }
    if (!D) fauna.scare(h.x, h.z, 90);
  },
  balzo() { const h = hero, tg = aimAt(125); if (tg) h.yaw = Math.atan2(tg.z - h.z, tg.x - h.x); h.dash = { k: 'balzo', t: 0.25, vx: -Math.cos(h.yaw) * 128, vz: -Math.sin(h.yaw) * 128 }; if (eqIt('arma')) heroShot('arrow', { noAim: true, tg: tg ? tg.obj : null, dmg: Math.max(1, Math.round(ATT() * 0.8)), bossD: 0.8 }); tone(600, 0.12, 'triangle', 0.04, 900); },
  fgelo() { hero.nextShot = { frz: 3.2, tint: ICE_T, pow: true, big: 1.2 }; startAct('shot'); tone(1318, 0.12, 'triangle', 0.04, 1976); },
  pioggia() {
    const h = hero, tg = aimAt(110, 0.5), x = tg ? tg.x : h.x + Math.cos(h.yaw) * 45, z = tg ? tg.z : h.z + Math.sin(h.yaw) * 45; if (tg) h.yaw = Math.atan2(tg.z - h.z, tg.x - h.x);
    startAct('cast'); things.push({ k: 'rain', x, z, t: 0.4, n: 5, r: 20, dmg: Math.max(1, Math.round(ATT() * 0.6)) }); tone(520, 0.3, 'triangle', 0.04, 260);
  },
  // la bomba cade sul nemico che hai davanti (se è a tiro), altrimenti poco più avanti
  bomba() { startAct('cast', () => { const h = hero, tg = aimAt(38, 0.5); if (tg) h.yaw = Math.atan2(tg.z - h.z, tg.x - h.x); const a = h.yaw, v = (tg ? Math.max(8, Math.min(36, Math.hypot(tg.x - h.x, tg.z - h.z))) : 24) / 0.42;
    things.push({ k: 'bomb', x: h.x + Math.cos(a) * 2, z: h.z + Math.sin(a) * 2, y: h.y + 5, y0: h.y + 5, vx: Math.cos(a) * v, vz: Math.sin(a) * v, fly: 0.42, t: 1.1, dmg: Math.max(3, Math.round(ATT() * 1.6)) }); tone(500, 0.1, 'triangle', 0.04, 250); }); },
  fumo() {
    const h = hero; h.hid = 4.5; noise(0.3, 0.05); tone(240, 0.2, 'sine', 0.04, 120);
    for (let i = 0; i < 14; i++) fx.push({ k: 'smoke', x: h.x + (Math.random() - 0.5) * 14, y: h.y + 0.5 + Math.random() * 4, z: h.z + (Math.random() - 0.5) * 14, vx: (Math.random() - 0.5) * 5, vz: (Math.random() - 0.5) * 5, vy: 1 + Math.random() * 1.5, t: 1.4 + Math.random() * 0.9, s: 0.26 });
    for (const e of foes) if (e.st !== 'dead' && Math.hypot(e.x - h.x, e.z - h.z) < 70) { e.rage = 0; if (e.st === 'chase' || e.st === 'wind') e.st = 'home'; }
  },
  trappola() { const h = hero, mine = things.filter(t => t.k === 'trap'); if (mine.length >= 2) mine[0].dead = true; things.push({ k: 'trap', x: h.x + Math.cos(h.yaw) * 4, z: h.z + Math.sin(h.yaw) * 4, life: 60, dmg: Math.max(2, Math.round(ATT() * 1.2)) }); tone(300, 0.06, 'square', 0.04); tone(200, 0.08, 'square', 0.04, null, 0.07); },
  fuoco() { startAct('cast', () => { const d = Math.max(3, Math.round(ATT() * 1.5)); heroShot('fire', { dmg: d, sp: 115, life: 0.95, turn: 2, r: 3, pow: true, bossD: 2, big: 1.3, boomOnly: true, boom: { r: 16, dmg: d, burn: 3.2 } }); }); tone(240, 0.25, 'sawtooth', 0.05, 520); },
  gelo() {
    startAct('cast', () => { const h = hero, d = Math.max(1, Math.round(ATT() * 0.5));
      for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, r = 9 + Math.random() * 21; fx.push({ k: 'icefx', x: h.x + Math.cos(a) * r, z: h.z + Math.sin(a) * r, y: h.y + 0.5, vy: 11 + Math.random() * 7, t: 0.45, s: 0.3 }); }
      tone(1500, 0.14, 'square', 0.04, 700); tone(2093, 0.3, 'triangle', 0.03, 1046, 0.05);
      for (const e of foes) if (e.st !== 'dead' && Math.hypot(e.x - h.x, e.z - h.z) < 32 + FOE[e.type].r && (!D || e.room === D.room)) { e.rage = 6; hitFoe(e, d, Math.atan2(e.z - h.z, e.x - h.x)); freeze(e, 3.2); }
      if (D && boss && !boss.hide && !boss.dead && boss.on && boss.st !== 'die' && Math.hypot(boss.x - h.x, boss.z - h.z) < 32 + boss.r && !classStun()) bossHit(boss.vuln ? 1 : 0, true); });
  },
  cura() { const h = hero; h.hp = Math.min(MAXHP(), h.hp + 4); for (let i = 0; i < 10; i++) fx.push({ k: 'glint', x: h.x + (Math.random() - 0.5) * 6, z: h.z + (Math.random() - 0.5) * 6, y: h.y + 1 + Math.random() * 7, vy: 7, t: 0.6, s: 0.3 }); seq([523, 659, 784], 0.07, 0.07); toast('+2 CUORI', '#9af0b0'); },
};
function heroSkill() {
  const h = hero; if (!h || st !== 'play' || inCasa() || h.atk > 0 || h.dash || h.cdC > 0 || h.fall > 0) return;
  const id = curSkill(), S = SKL[id]; if (id === 'parata') return;
  if (id === 'cura' && h.hp >= MAXHP()) { tone(200, 0.1, 'square', 0.03); return; }
  if (h.en < S.cost) { h.enFl = 0.5; tone(200, 0.1, 'square', 0.03); return; }
  h.en -= S.cost; h.enT = 0; h.cdC = 0.45; h.chg = 0; h.aDown = false; SKILL[id]();
  if (!D) fauna.scare(h.x, h.z, 40);
}
function cycleSkill() {
  if (st !== 'play' || !hero || hero.dead) return; const L = skillsOf(cls());
  if (L.length < 2) { tone(200, 0.1, 'square', 0.03); if (time > (hero.tipT || 0)) { hero.tipT = time + 6; toast('IL MAESTRO DELLA GILDA, IN CITTÀ, INSEGNA ALTRE ABILITÀ', '#a9c6e3'); } return; }
  save.skSel[cls()] = L[(L.indexOf(curSkill()) + 1) % L.length]; tone(1318, 0.04); toast('ABILITÀ: ' + SKL[curSkill()].n, CC().col);
}
// bombe con la miccia, tagliole, piogge di frecce
function thingsUpdate(dt) {
  for (const t of things) {
    if (t.dead) continue;
    if (t.k === 'bomb') {
      t.t -= dt;
      if (t.fly > 0) {
        t.fly -= dt; const nx = t.x + t.vx * dt, nz = t.z + t.vz * dt;
        const wall = D ? (dBlocks(Math.floor(nx / DCS), Math.floor(nz / DCS), 'shot') || D.blocks.some(b => !b.gone && Math.abs(nx - b.x) < 4.6 && Math.abs(nz - b.z) < 4.6)) : (!!W.inBox(nx, nz, 0) || W.ground(nx, nz) > t.y + 4);
        if (wall) { t.vx = t.vz = 0; } else { t.x = nx; t.z = nz; }
        const u = Math.max(0, 1 - t.fly / 0.42), g = Math.max(gH(t.x, t.z), D ? -2 : W.WL) + 0.5; t.y = t.y0 * (1 - u) + g * u + Math.sin(u * Math.PI) * 5;
        if (t.fly <= 0) { t.y = g; tone(180, 0.04, 'square', 0.03); }
      } else if (Math.random() < 0.5) fx.push({ k: 'spark', x: t.x, z: t.z, y: t.y + 2.4, vy: 6, t: 0.18, s: 0.22 });
      if (t.t <= 0) { t.dead = true; boom(t.x, t.z, 17, t.dmg, { crack: true, pow: true, boss: 2 }); }
    } else if (t.k === 'trap') {
      t.life -= dt; if (t.life <= 0) { t.dead = true; continue; }
      for (const e of foes) if (e.st !== 'dead' && !FOE[e.type].fly && Math.hypot(e.x - t.x, e.z - t.z) < FOE[e.type].r + 2.5) { t.dead = true; e.rage = 6; hitFoe(e, t.dmg, 0, true); stun(e, 3.6); e.st = e.st === 'dead' ? 'dead' : 'chase'; puffAt(t.x, t.z, 5, gH(t.x, t.z) + 1); tone(900, 0.04, 'square', 0.06); tone(300, 0.1, 'square', 0.05, null, 0.03); break; }
    } else if (t.k === 'rain') {
      t.t -= dt;
      if (t.t <= 0) {
        t.t = 0.28; t.n--; const gy = gH(t.x, t.z);
        for (let i = 0; i < 7; i++) { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * t.r; fx.push({ k: 'arrowfx', x: t.x + Math.cos(a) * r, z: t.z + Math.sin(a) * r, y: gy + 20 + Math.random() * 6, vy: -74, t: 0.3, s: 0.34 }); }
        noise(0.06, 0.03);
        for (const e of foes) if (e.st !== 'dead' && Math.hypot(e.x - t.x, e.z - t.z) < t.r + FOE[e.type].r) { e.rage = 6; hitFoe(e, t.dmg, 0, true); if (e.st === 'idle' || e.st === 'home') e.st = 'chase'; }
        if (D && boss && !boss.hide && !boss.dead && boss.on && boss.st !== 'die' && Math.hypot(boss.x - t.x, boss.z - t.z) < t.r + boss.r) bossHit(boss.vuln ? 0.5 : 0, true);
        if (t.n <= 0) t.dead = true;
      }
    }
  }
  things = things.filter(t => !t.dead);
}
// ---------- la scelta della classe (all'inizio, per chi giocava già, e alla gilda) ----------
const gildaCost = () => save.flags.clsCambi ? 100 : 0;      // la prima volta è gratis
function openClass(mode) { clsUI = { mode, sel: Math.max(0, CLS.ORD.indexOf(cls())), t: 0, msg: '' }; clsPics = null; st = 'class'; }
function setClass(id) {
  const first = !save.cls; save.cls = id; applyClass();
  const h = hero; h.en = MAXEN(); h.hp = first ? MAXHP() : Math.max(1, Math.min(h.hp, MAXHP())); h.atk = 0; h.dash = null; h.block = false; h.chg = 0; h.aDown = false; h.hid = 0; things = [];
  drawHeroSprites(); writeSave();
}
function classKey(name) {
  const U = clsUI, n = CLS.ORD.length; U.msg = '';
  if (name === 'left' || name === 'up') { U.sel = (U.sel + n - 1) % n; tone(1318, 0.03); }
  else if (name === 'right' || name === 'down') { U.sel = (U.sel + 1) % n; tone(1318, 0.03); }
  else if (name === 'b' && U.mode === 'gilda') { clsUI = null; st = 'play'; tone(660, 0.04); }
  else if (name === 'a' || name === 'start') {
    if (U.t < 0.6) return;                                      // niente scelte fatte per sbaglio, premendo A di corsa
    const id = CLS.ORD[U.sel];
    if (U.mode === 'gilda') {
      if (id === cls()) { tone(200, 0.1, 'square', 0.03); return; }
      const cost = gildaCost(); if (save.coins < cost) { U.msg = 'TI SERVONO ' + cost + ' MONETE'; tone(160, 0.2, 'square', 0.04, 100); return; }
      save.coins -= cost; save.flags.clsCambi = (save.flags.clsCambi || 0) + 1;
    }
    setClass(id); clsUI = null; st = 'play'; jingle(); banner = U.mode === 'gilda' ? { t: CL[id].n, s: 'LE TUE ARMI ORA SONO QUELLE DELLA NUOVA CLASSE', life: 3.4, c: CL[id].col } : null;
    if (U.mode === 'new') toast("PARLA CON L'ANZIANA MIRTA (A)", '#ffd23f');
    if (U.mode !== 'gilda') help = 11;
  }
}
function clsPic(id) {
  if (!clsPics) clsPics = {};
  return clsPics[id] || (clsPics[id] = A.figure(A.human(heroLook(id, clsUI.mode === 'new'), CL[id].poses[0]), Math.PI * 0.8, 62, 58, { sc: 1.65 }));
}
function drawClass() {
  const U = clsUI, n = CLS.ORD.length, sel = CLS.ORD[U.sel], K = CL[sel];
  hg.fillStyle = 'rgba(7,8,14,.84)'; hg.fillRect(0, 0, Wr, Hr);
  T(U.mode === 'new' ? 'CHE EROE SARAI? SCEGLI LA TUA CLASSE' : U.mode === 'old' ? "NOVITÀ: L'EROE HA UNA CLASSE. SCEGLI LA TUA" : 'GILDA DEGLI EROI: CAMBIA CLASSE', Wr / 2, 5, '#ffd23f', 1, 'center');
  const cw = Math.min(92, Math.floor((Wr - 12) / n)), x0 = Math.round(Wr / 2 - cw * n / 2), cy = 17, chh = 72;
  CLS.ORD.forEach((id, i) => {
    const C2 = CL[id], x = x0 + i * cw, on = i === U.sel;
    panel(x + 2, cy, cw - 4, chh, on ? C2.col : '#3a4458'); if (on) { hg.fillStyle = 'rgba(255,255,255,.08)'; hg.fillRect(x + 3, cy + 1, cw - 6, chh - 2); }
    const pic = clsPic(id); hg.globalAlpha = on ? 1 : 0.6; hg.drawImage(pic, Math.round(x + cw / 2 - pic.width / 2), cy + 3); hg.globalAlpha = 1;
    T(C2.n, x + cw / 2, cy + chh - 11, on ? C2.col : '#8a96aa', 1, 'center');
    if (U.mode === 'gilda' && save.cls === id) T('LA TUA', x + cw / 2, cy + 3, '#9af0b0', 1, 'center');
  });
  // la scheda della classe scelta
  const w = Math.max(190, Math.min(300, Wr - insetL - insetR - 4)), x = Math.round(Wr / 2 - w / 2), y = cy + chh + 3, h = Hr - y - 4, two = U.mode === 'gilda';
  panel(x, y, w, h, K.col);
  let yy = y + 5; for (const l of A.wrap(K.d, w - 14).slice(0, 2)) { T(l, x + 7, yy, '#ffffff'); yy += 9; }
  yy += 2; for (const t of K.tr) { if (yy > y + h - (two ? 30 : 21)) break; hg.fillStyle = K.col; hg.fillRect(x + 8, yy + 2, 3, 3); T(t, x + 15, yy, '#c9d3e6'); yy += 9; }
  if (!two && yy <= y + h - 21) T('IN CITTÀ, ALLA GILDA, POTRAI CAMBIARLA', x + 7, yy + 1, '#8a96aa', 1, 'left', null);
  if (U.msg) T(U.msg, Wr / 2, y + h - 11, '#ff8f8f', 1, 'center');
  else if (two) { const c = gildaCost(); T(sel === cls() ? 'È GIÀ LA TUA CLASSE' : 'A: DIVENTA ' + K.n + (c ? ' PER ' + c + ' MONETE' : ' (PER QUESTA VOLTA È GRATIS)'), Wr / 2, y + h - 20, sel === cls() ? '#8a96aa' : '#ffd23f', 1, 'center'); T('CROCE: CAMBIA   B: INDIETRO', Wr / 2, y + h - 11, '#8a96aa', 1, 'center'); }
  else if (U.t > 0.6 && Math.floor(time * 2.5) % 2) T('CROCE: CAMBIA   A: SCEGLI ' + K.n, Wr / 2, y + h - 11, '#ffd23f', 1, 'center');
}
// ---------- il maestro della gilda insegna le abilità ----------
const skIcons = {};
const skIcon = id => skIcons[id] || (skIcons[id] = A.icon(SKL[id].ico, SKL[id].c[0], SKL[id].c[1]));
const skKnown = id => !SKL[id].price || !!save.sk[id];
function skillKey(name) {
  const L = CL[cls()].skills, rows = L.length + 1;
  if (name === 'up') { shop.sel = (shop.sel + rows - 1) % rows; tone(1318, 0.03); }
  else if (name === 'down') { shop.sel = (shop.sel + 1) % rows; tone(1318, 0.03); }
  else if (name === 'b' || name === 'start' || (name === 'a' && shop.sel === L.length)) shop = null;
  else if (name === 'a') {
    const id = L[shop.sel], S = SKL[id];
    if (skKnown(id)) { save.skSel[cls()] = id; tone(1046, 0.05); toast('ABILITÀ SCELTA: ' + S.n, CC().col); }
    else if (save.coins < S.price) { tone(160, 0.2, 'square', 0.04, 100); toast('MONETE INSUFFICIENTI', '#ff8f8f'); }
    else { save.coins -= S.price; save.sk[id] = 1; save.skSel[cls()] = id; jingle(); toast('HAI IMPARATO: ' + S.n, '#9af0b0'); writeSave(); }
  }
}
function drawSkills() {
  const c = cls(), L = CL[c].skills, rows = L.concat(['esci']), w = Math.min(280, dialogW()), h = 22 + rows.length * 14 + 34, x = Math.round(Wr / 2 - w / 2), y = Math.round(Hr / 2 - h / 2);
  panel(x, y, w, h, CL[c].col); T('LE ABILITÀ DEL ' + CL[c].n, x + 8, y + 5, CL[c].col); hg.drawImage(ICOIN, x + w - 50, y + 3); T(String(save.coins), x + w - 36, y + 6, '#ffd23f');
  rows.forEach((id, i) => {
    const yy = y + 22 + i * 14, on = i === shop.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); }
    if (id === 'esci') { T('ESCI', x + 24, yy, on ? '#ffffff' : '#8a96aa'); return; }
    const S = SKL[id], kn = skKnown(id); hg.drawImage(skIcon(id), x + 7, yy - 3);
    T(S.n + (curSkill() === id ? '  (IN USO)' : ''), x + 24, yy, kn ? (on ? '#ffffff' : '#c9d3e6') : '#ffe8a0');
    T(kn ? 'LA SAI GIÀ' : S.price + '', x + w - 10, yy, kn ? '#5a6478' : save.coins >= S.price ? '#ffd23f' : '#ff8f8f', 1, 'right');
  });
  const sel = rows[shop.sel];
  if (sel !== 'esci') { const S = SKL[sel]; A.wrap(S.d, w - 16).slice(0, 2).forEach((l, i) => T(l, x + 8, y + h - 30 + i * 9, '#a9c6e3')); T(sel === 'parata' ? 'ENERGIA: 1 PER OGNI COLPO PARATO' : (c === 'mago' ? 'MANA: ' : 'ENERGIA: ') + S.cost, x + 8, y + h - 11, CL[c].enC); T(skKnown(sel) ? 'A: USA QUESTA' : 'A: IMPARA', x + w - 8, y + h - 11, '#5a6478', 1, 'right', null); }
}

// ---------- nemici ----------
// soft: un danno che non sposta e non sveglia (il fuoco che brucia, la pioggia di frecce)
function hitFoe(e, dmg, a, soft) {
  if (altroPiano(e)) return;
  if (MODO) { const r = guardiaNemico(e, dmg); if (r === null) { e.flash = 0.08; return; } dmg = r; }
  const T = FOE[e.type];
  e.hp -= dmg; e.flash = 0.16;
  if (!soft) { e.kb = T.champ ? 0.05 : T.elite ? 0.08 : 0.18; e.kx = Math.cos(a) * 60; e.kz = Math.sin(a) * 60; if (e.st !== 'wind' || !T.champ) e.st = 'chase'; }
  for (let i = 0; i < (soft ? 1 : 3); i++) fx.push({ k: 'spark', x: e.x, z: e.z, y: e.y + 3 + Math.random() * 2, vy: 8, t: 0.22, s: 0.3 });
  if (soft) tone(200, 0.04, 'square', 0.025, 120); else { tone(240, 0.07, 'square', 0.05, 120); vib(15); }
  if (e.hp <= 0) {
    e.st = 'dead'; e.fade = 0.5; puffAt(e.x, e.z, 8, e.y + 2); seq([523, 392, 262], 0.05, 0.05, 0.035);
    if (T.champ) { e.fade = 0.9; ringFx(e.x, e.z, 9); quake = 0.6; fanfare(); banner = { t: T.n + ' È CADUTO!', s: 'LA TESORERIA È APERTA', life: 3.6, c: '#ffd23f' }; }
    let n = T.coins[0] + Math.floor(Math.random() * (T.coins[1] - T.coins[0] + 1));
    if (eqHas('luck')) n *= 2;
    if (CC().coins) n = Math.ceil(n * CC().coins);            // il furfante fruga meglio nelle tasche
    for (let i = 0; i < Math.min(5, Math.ceil(n / 2)); i++) drops.push({ k: 'coin', v: Math.ceil(n / Math.min(5, Math.ceil(n / 2))), x: e.x, z: e.z, y: e.y + 2, vx: (Math.random() - 0.5) * 18, vz: (Math.random() - 0.5) * 18, vy: 20, t: 20 });
    if (hero.hp < MAXHP() && Math.random() < 0.3) drops.push({ k: 'heart', x: e.x, z: e.z, y: e.y + 2, vx: 0, vz: 0, vy: 22, t: 20 });
    jobKill(T.as || e.type);
    if (T.job) { e.fade = 0.9; ringFx(e.x, e.z, 8); quake = 0.5; jobReady(T.job); }
    if (e.type === 'slime' && save.q.melme === 1) { save.slimes++; toast('MELME: ' + Math.min(6, save.slimes) + '/6', '#9af0b0'); if (save.slimes >= 6) { save.q.melme = 2; toast('TORNA DA OTTO!', '#ffd23f'); jingle(); } }
  }
}
function spawnCamp(c) {
  const T = FOE[c.type];
  for (let i = c.alive.length; i < c.n - c.dead; i++) {
    for (let tries = 0; tries < 10; tries++) {
      const a = Math.random() * TAU, r = Math.random() * c.r * 0.7, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      if (gH(x, z, -1e9) < 0.3 || W.blocked(x, z, T.r)) continue;
      const e = { type: c.type, camp: c, x, z, y: gH(x, z, -1e9), yaw: Math.random() * TAU, hp: T.hp, st: 'idle', t: Math.random() * 2, cd: 0, flash: 0, kb: 0, walk: 0, hop: Math.random(), wx: x, wz: z };
      foes.push(e); c.alive.push(e); break;
    }
  }
}
function campsUpdate(dt) {
  for (const c of camps) {
    if (c.job) { const js = jst(c.job); if (!js || js.s !== 1) { if (c.on) { c.on = false; for (const e of c.alive) e.gone = true; c.alive = []; } continue; } }
    const d = Math.hypot(c.x - hero.x, c.z - hero.z);
    if (c.cool > 0) c.cool -= dt;
    if (!c.on && d < 330) { if (c.dead >= c.n && c.cool <= 0) c.dead = 0; c.on = true; spawnCamp(c); }
    else if (c.on && d > 480) { c.on = false; for (const e of c.alive) e.gone = true; c.alive = []; if (c.dead >= c.n) c.cool = 90; }
  }
  foes = foes.filter(e => !e.gone && !(e.st === 'dead' && e.fade <= 0));
}
function foeUpdate(e, dt) {
  const T = FOE[e.type], dx = hero.x - e.x, dz = hero.z - e.z, d = Math.hypot(dx, dz) + (altroPiano(e) ? 9999 : 0), homeD = Math.hypot(e.camp.x - e.x, e.camp.z - e.z), leash = e.camp.r * 2.6;
  if (e.flash > 0) e.flash -= dt; if (e.cd > 0) e.cd -= dt; e.t -= dt; if (e.rotto > 0) e.rotto -= dt; if (T.fermo) e.kb = 0;   // (il manichino non si sposta)
  if (e.st === 'dead') { e.fade -= dt; if (e.fade <= 0 && !e.counted) { e.counted = true; e.camp.dead++; e.camp.alive = e.camp.alive.filter(x => x !== e); } return; }
  // in fiamme, stordito o congelato (abilità delle classi)
  if (e.rage > 0) e.rage -= dt;
  if (e.burn > 0) { e.burn -= dt; e.burnT -= dt; if (Math.random() < 0.4) fx.push({ k: 'ember', x: e.x + (Math.random() - 0.5) * 3, z: e.z + (Math.random() - 0.5) * 3, y: e.y + 2 + Math.random() * 3, vy: 9, t: 0.4, s: 0.4 }); if (e.burnT <= 0) { e.burnT = 0.8; hitFoe(e, e.burnD || 1, 0, true); if (e.st === 'dead') return; } }
  if (e.stun > 0) { e.stun -= dt; if (e.frz > 0) e.frz -= dt; e.y += (gH(e.x, e.z, e.y) + (T.fly ? 2 : 0) - e.y) * Math.min(1, 12 * dt); if (e.kb > 0) { e.kb -= dt; move(e, e.kx * dt, e.kz * dt, T.r, 3); } return; }
  // le piante carnivore non si muovono: sputano semi
  if (T.shoot) {
    e.y = gH(e.x, e.z, e.y); if (e.open > 0) e.open -= dt; e.kb = 0;
    if (st === 'play' && !hero.dead && (!D || D.room === e.room) && d < T.aggro) { const a = Math.atan2(dz, dx); e.yaw += angDiff(a, e.yaw) * Math.min(1, 6 * dt); e.sh -= dt; if (e.sh <= 0) { e.sh = T.shoot; e.open = 0.45; shoot('seed', e.x, e.z, a, 40, 1, e); tone(520, 0.05, 'square', 0.03, 300); } }
    return;
  }
  const fly = T.fly ? T.fly + Math.sin(time * 4 + e.hop * 9) * 1.5 : 0;
  e.y += (gH(e.x, e.z, e.y) + fly - e.y) * Math.min(1, 12 * dt);
  if (e.kb > 0) { e.kb -= dt; move(e, e.kx * dt, e.kz * dt, T.r, 3); return; }
  if (MODO && (T.mest || T.fermo) && mestiere(e, T, dt, d, dx, dz)) return;
  if (e.st === 'wind') { e.yaw = Math.atan2(dz, dx); if (e.t <= 0) { if (d < T.range + 3 && st === 'play') hurtHero(T.dmg, e); e.st = 'chase'; e.cd = 1.1; } return; }
  // chi è stato colpito da lontano insegue più a lungo; col fumogeno nessuno vede l'eroe
  const calm = st !== 'play' || hero.dead || dialog || shop || loot || (D && D.room !== e.room) || hero.hid > 0, ag = T.aggro * (e.rage > 0 ? 2.4 : 1);
  if (!calm && d < ag && homeD < leash) e.st = 'chase';
  else if (e.st === 'chase' && (calm || d > ag * 1.7 || homeD > leash)) e.st = 'home';
  let tx = null, tz = null, sp = T.sp;
  if (e.st === 'chase') { if (d < T.range && e.cd <= 0) { if (MODO && T.turno && foes.some(o => o !== e && o.camp === e.camp && o.st === 'wind')) { e.yaw = Math.atan2(dz, dx); return; }   // i fanti attaccano a turno
      e.st = 'wind'; e.t = MODO ? Math.max(0.4, T.wind || 0.45) * diffK().wind : T.k === 'slime' ? 0.35 : 0.45; if (MODO) segnale(e); return; } if (d > T.range * 0.7) { tx = hero.x; tz = hero.z; } else e.yaw = Math.atan2(dz, dx); }
  else if (e.st === 'home') { tx = e.camp.x; tz = e.camp.z; sp *= 0.7; if (homeD < e.camp.r * 0.5) e.st = 'idle'; }
  else { if (e.t <= 0) { e.t = 2 + Math.random() * 3; const a = Math.random() * TAU, r = Math.random() * e.camp.r * 0.6; e.wx = e.camp.x + Math.cos(a) * r; e.wz = e.camp.z + Math.sin(a) * r; } if (Math.hypot(e.wx - e.x, e.wz - e.z) > 3) { tx = e.wx; tz = e.wz; sp *= 0.35; } }
  e.moving = false;
  if (tx !== null) {
    const a = Math.atan2(tz - e.z, tx - e.x); e.yaw += angDiff(a, e.yaw) * Math.min(1, 8 * dt);
    if (T.k === 'slime') { e.hop = (e.hop + dt * 1.3) % 1; if (e.hop > 0.55) return; }
    const m = sp * dt;
    if (move(e, Math.cos(e.yaw) * m, Math.sin(e.yaw) * m, T.r, 1.6)) { e.moving = true; e.walk += m; }
  }
  // non si sovrappongono
  // (spostandosi rispettano muri e ostacoli: una spinta alla cieca li infilava nelle pareti)
  for (const o of foes) if (o !== e && o.st !== 'dead') { const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz); if (od < 5 && od > 0.01) move(e, ox / od * (5 - od) * 0.5, oz / od * (5 - od) * 0.5, T.r, 3); }
}

// ---------- abitanti, monete, effetti ----------
function npcsUpdate(dt) {
  for (const n of npcs) {
    n.t -= dt;
    const d = Math.hypot(hero.x - n.x, hero.z - n.z);
    if (d > 420 && n.id !== 'biscotto') continue;
    if (n.id === 'biscotto' && save.q.gatto >= 2) { n.x = n.hx = 2032; n.z = n.hz = 2662; }
    if (d < 22 || (dialog && dialog.id === n.id)) { n.yaw += angDiff(Math.atan2(hero.z - n.z, hero.x - n.x), n.yaw) * Math.min(1, 5 * dt); n.moving = false; continue; }
    if (n.id === 'contadino' || n.id === 'biscotto' || (NPC[n.id] && NPC[n.id].walk)) {
      const wr = NPC[n.id] && NPC[n.id].walk ? 16 : 30;
      if (n.t <= 0) { n.t = 3 + Math.random() * 4; const a = Math.random() * TAU; n.wx = n.hx + Math.cos(a) * wr; n.wz = n.hz + Math.sin(a) * wr; }
      if (n.wx !== undefined && Math.hypot(n.wx - n.x, n.wz - n.z) > 2) { const a = Math.atan2(n.wz - n.z, n.wx - n.x); n.yaw += angDiff(a, n.yaw) * Math.min(1, 6 * dt); const m = (n.id === 'biscotto' ? 9 : 7) * dt; n.moving = move(n, Math.cos(n.yaw) * m, Math.sin(n.yaw) * m, 1.5); n.walk += m; }
      else n.moving = false;
    } else n.yaw += angDiff(n.base, n.yaw) * Math.min(1, 2 * dt);
  }
}
function dropsUpdate(dt) {
  for (const p of drops) {
    p.t -= dt; p.vy -= 60 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= 0.96; p.vz *= 0.96;
    const g = gH(p.x, p.z) + 1; if (p.y < g) { p.y = g; p.vy = Math.abs(p.vy) > 6 ? -p.vy * 0.4 : 0; }
    const d = Math.hypot(hero.x - p.x, hero.z - p.z);
    if (d < (eqHas('magnet') ? 75 : 16) && p.t < 19.6) { p.x += (hero.x - p.x) * Math.min(1, 6 * dt); p.z += (hero.z - p.z) * Math.min(1, 6 * dt); }
    if (d < 3.5 && p.t < 19.7) { p.t = 0; if (p.k === 'coin') { save.coins += p.v; tone(1318, 0.04, 'square', 0.03); tone(1760, 0.07, 'square', 0.03, null, 0.04); } else { hero.hp = Math.min(MAXHP(), hero.hp + 2); tone(880, 0.06); tone(1318, 0.1, 'square', 0.035, null, 0.06); } }
  }
  drops = drops.filter(p => p.t > 0);
}
// ---------- vita dell'aria: foglie, petali, neve, polvere, lucciole; fumo dei camini; spruzzi delle fontane ----------
let amb = [], ambT = 0;
const AMB = { leaf: [34, -6, 9, 7], petal: [34, -4.5, 8, 8], snow: [46, -9, 5, 6], dust: [14, -0.5, 26, 2.2], fly: [20, 0, 3, 7], mote: [14, 1.2, 2, 6], ember: [20, 4.5, 3, 3.4] };
function ambUpdate(dt) {
  // nei santuari l'aria è ferma e ogni luogo ha il suo pulviscolo: lucciole, polvere, cristalli di ghiaccio, faville
  const bw = D ? null : W.atmo(hero.x, hero.z), B = W.B, n = day.night;
  const want = D ? (D.def.air || {}) : { leaf: bw[B.AUTUMN] * 34 + bw[B.FOREST] * 4, petal: bw[B.BLOSSOM] * 34, snow: bw[B.SNOW] * 46 + (hero.y > 175 ? 22 : 0), dust: (bw[B.DESERT] + bw[B.MESA]) * 14,
    fly: n * (bw[B.FOREST] + bw[B.SWAMP] + bw[B.JUNGLE] + bw[B.MEADOW] * 0.5 + bw[B.BLOSSOM] * 0.6 + bw[B.AUTUMN] * 0.5) * 20, mote: bw[B.MOOR] * 14 + bw[B.JUNGLE] * 8 + bw[B.SWAMP] * 8 };
  const cnt = {}; for (const p of amb) cnt[p.k] = (cnt[p.k] || 0) + 1;
  ambT -= dt;
  if (ambT <= 0) { ambT = 0.06;
    for (const k in want) if ((cnt[k] || 0) < Math.round(want[k])) { const A2 = AMB[k], a = hero.yaw + (Math.random() - 0.5) * 2.6, r = 8 + Math.random() * 62, x = hero.x + Math.cos(a) * r, z = hero.z + Math.sin(a) * r, g = Math.max(0, gH(x, z));
      if (D) { const t = dAt(Math.floor(x / DCS), Math.floor(z / DCS)); if (t === DT.ROCK || t === DT.WALL || t === DT.CRACK) continue; }
      amb.push({ k, x, z, y: g + (k === 'ember' ? 0.4 + Math.random() * 2 : k === 'dust' ? 0.6 + Math.random() * 3 : k === 'fly' || k === 'mote' ? 1.5 + Math.random() * 7 : D ? 5 + Math.random() * 8 : 6 + Math.random() * 26), g, t: A2[3] * (0.6 + Math.random() * 0.6), ph: Math.random() * 6.28, v: Math.random() }); } }
  const wx = D ? 0.1 : 0.8, wz = D ? 0.08 : 0.6;
  for (const p of amb) { const A2 = AMB[p.k]; p.t -= dt; p.ph += dt;
    if (p.k === 'fly') { p.x += Math.sin(p.ph * 0.9 + p.v * 9) * 3 * dt; p.z += Math.cos(p.ph * 0.7 + p.v * 5) * 3 * dt; p.y += Math.sin(p.ph * 1.3) * 1.5 * dt; }
    else { const sw = p.k === 'dust' ? 0 : Math.sin(p.ph * 2.1 + p.v * 6) * 5; p.x += (wx * A2[2] + sw) * dt; p.z += wz * A2[2] * dt; p.y += A2[1] * dt; if (p.y < p.g + 0.2 && A2[1] < 0) p.t = Math.min(p.t, 0.6), p.y = p.g + 0.2, p.x -= wx * A2[2] * dt, p.z -= wz * A2[2] * dt; }
    if ((p.x - hero.x) ** 2 + (p.z - hero.z) ** 2 > 90 * 90) p.t = 0; }
  amb = amb.filter(p => p.t > 0);
  if (D) return;
  // fumo dei camini e zampilli delle fontane vicine
  for (const s of W.smokes) if (Math.abs(s[0] - hero.x) < 240 && Math.abs(s[2] - hero.z) < 240 && Math.random() < dt * 1.1) fx.push({ k: 'smoke', x: s[0], y: s[1], z: s[2], vx: 1.6 + Math.random(), vz: 1.2, vy: 4 + Math.random() * 2, t: 2.4, s: 0.36 });
  for (const s of W.sprays) if (Math.abs(s[0] - hero.x) < 160 && Math.abs(s[2] - hero.z) < 160 && Math.random() < dt * 26) { const a = Math.random() * TAU, v = 2.5 + Math.random() * 2.5; fx.push({ k: 'drop', x: s[0], y: s[1], z: s[2], vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: 9 + Math.random() * 3, t: 0.95, s: 0.3 }); }
  // ai piedi delle cascate: spruzzi e nuvole d'acqua. [x, y, z, larghezza, lungo x?, forza]
  for (const s of W.falls) if (Math.abs(s[0] - hero.x) < 330 && Math.abs(s[2] - hero.z) < 330) {
    if (Math.random() < dt * 5 * s[5]) { const o = (Math.random() - 0.5) * s[3], a = Math.random() * TAU, v = 1.5 + Math.random() * 3; fx.push({ k: 'drop', x: s[0] + (s[4] ? o : 0), y: s[1] + 0.3, z: s[2] + (s[4] ? 0 : o), vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: 7 + Math.random() * 7, t: 0.75, s: 0.34 }); }
    if (Math.random() < dt * 2.2 * s[5]) { const o = (Math.random() - 0.5) * s[3]; fx.push({ k: 'puff', x: s[0] + (s[4] ? o : 0), y: s[1] + 1 + Math.random() * 2, z: s[2] + (s[4] ? 0 : o), vx: (Math.random() - 0.5) * 2, vz: (Math.random() - 0.5) * 2, vy: 2.2 + Math.random() * 1.5, t: 0.9, s: 0.5 + Math.random() * 0.4 }); }
  }
  // polvere sotto i piedi quando si corre, schizzi nell'acqua bassa
  if (hero.moving && !D) { hero.dustT = (hero.dustT || 0) - dt; if (hero.dustT <= 0) { hero.dustT = BTN.b ? 0.16 : 0.34; if (hero.wade) fx.push({ k: 'drop', x: hero.x + (Math.random() - 0.5) * 2, y: 0.3, z: hero.z + (Math.random() - 0.5) * 2, vy: 7, t: 0.45, s: 0.3 }); else if (BTN.b) fx.push({ k: 'puff', x: hero.x - Math.cos(hero.yaw) * 1.5, y: hero.y + 0.4, z: hero.z - Math.sin(hero.yaw) * 1.5, vy: 2.5, t: 0.45, s: 0.3 }); } }
}
function fxUpdate(dt) {
  for (const p of fx) { p.t -= dt; p.y += p.vy * dt; if (p.vx) { p.x += p.vx * dt; p.z += (p.vz || 0) * dt; } p.vy -= (p.fermo ? 0 : p.k === 'smoke' ? -0.6 : p.k === 'puff' || p.k === 'glint' ? 4 : 30) * dt; }
  fx = fx.filter(p => p.t > 0);
  if (fx.length > 300) fx.splice(0, fx.length - 300);
}

// ---------- interazione: cosa c'è davanti all'eroe? ----------
function findTarget() {
  if (!D && W.GROTTE.length && W.sopra(hero.x, hero.z)) return null;   // sul dorso di una grotta non si tocca quel che c'è sotto
  let best = null, bs = -1;
  const consider = (x, z, kind, obj, r = 11) => {
    const dx = x - hero.x, dz = z - hero.z, d = Math.hypot(dx, dz); if (d > r) return;
    const c = d < 4 ? 1 : Math.cos(Math.atan2(dz, dx) - hero.yaw); if (c < 0.3) return;
    const s = c * 2 - d / r; if (s > bs) { bs = s; best = { kind, obj, x, z }; }
  };
  if (D) {
    const ds = dsave(D.id);
    for (const c of D.chests) if (!c.hidden && !ds.ch[c.key]) consider(c.x, c.z, 'dchest', c, 10);
    for (const d of D.doors) if ((d.kind === 'lock' || d.kind === 'boss' || d.kind === 'shut' || d.kind === 'seal') && d.anim < 0.5) consider(d.cx, d.cz, 'ddoor', d, 13);
    for (const s2 of D.signs) consider(s2.x, s2.z, 'sign', s2, 10);
    // la pietra davanti (ma con un nemico vicino A resta il colpo: la pietra allora si spinge camminandoci contro)
    const pa = !foes.some(e => e.st !== 'dead' && e.room === D.room && Math.hypot(e.x - hero.x, e.z - hero.z) < 36) && blockAhead(); if (pa) consider(pa.b.x, pa.b.z, 'block', pa, 12);
    if (D.gem) consider(D.gem.x, D.gem.z, 'gem', D.gem, 11);
    if (D.folk) for (const n of D.folk) consider(n.x, n.z, 'npc', n, 17);       // il bottegaio sta dall'altra parte del banco
    return best;
  }
  for (const n of npcs) if (!npcHidden(n)) consider(n.x, n.z, 'npc', n, n.id === 'nino' || (NPC[n.id] && NPC[n.id].f && NPC[n.id].f.role === 'shop') ? 14 : 11);
  for (const c of chests) if (!save.chests[c.id]) consider(c.x, c.z, 'chest', c, 9);
  for (const p of props) {
    if (p.k === 'sign' || p.k === 'statue' || p.k === 'kingstatue' || p.k === 'menhir' || p.k === 'well' || p.k === 'snowman' || p.k === 'giant' || p.k === 'anvil' || p.k === 'tent' || p.k === 'custode' || p.k === 'cervopietra' || p.k === 'cervopietra2' || p.k === 'runa' || (PROPTXT[p.k] && /pietra|custode/.test(p.k))) consider(p.x, p.z, 'prop', p, p.k === 'giant' ? 26 : p.k === 'well' ? 11 : 9);
    if (p.k === 'ore' && !save.oreTaken[p.x + ',' + p.z]) consider(p.x, p.z, 'ore', p, 9);
  }
  for (const d of doors) consider(d.x, d.z, 'door', d, 12);
  for (const b of botteghe) consider(b.x, b.z, 'shop', b, 10);
  for (const b of W.BOARDS) consider(b.x, b.z, 'board', b, 12);
  return best;
}
function interact(t) {
  if (t.kind === 'npc') { talk(t.obj); tone(660, 0.04); return; }
  if (t.kind === 'chest') { openChest(t.obj); return; }
  if (t.kind === 'door') { templeDoor(t.obj); return; }
  if (t.kind === 'board') { shop = { board: t.obj, sel: 0 }; tone(660, 0.05); return; }
  if (t.kind === 'shop') { tone(520, 0.06, 'triangle', 0.04, 660); startFade(() => enterShop(t.obj)); return; }
  if (t.kind === 'dchest') { openDChest(t.obj); return; }
  if (t.kind === 'ddoor') { useDoor(t.obj); return; }
  if (t.kind === 'sign') { say(null, [t.obj.txt]); return; }
  if (t.kind === 'gem') { takeGem(); return; }
  if (t.kind === 'block') {
    // l'eroe si volta verso la pietra e la spinge di una casella; se dietro non c'è posto, lo dice
    const p = blockAhead(), h = hero; if (!p) return; h.yaw = Math.atan2(p.dj, p.di); h.pushT = 0;
    if (pushBlock(p.b, p.di, p.dj)) vib(20);
    else if (time > (h.hintT || 0)) { h.hintT = time + 3; toast('DA QUESTA PARTE NON SI MUOVE: PROVA DA UN ALTRO LATO', '#a9d8ff'); }
    return;
  }
  if (t.kind === 'ore') {
    if (save.q.ferro === 1) { save.oreTaken[t.obj.x + ',' + t.obj.z] = 1; save.ore++; puffAt(t.obj.x, t.obj.z, 5); toast('MINERALE DI FERRO ' + Math.min(3, save.ore) + '/3', '#ffb070'); seq([523, 784], 0.06, 0.06); if (save.ore >= 3) { save.q.ferro = 2; toast('TORNA DA BRUNO!', '#ffd23f'); jingle(); } }
    else say(null, ['UNA ROCCIA CON VENATURE DI FERRO. AL FABBRO DEL BORGO FAREBBE COMODO.']);
    return;
  }
  const p = t.obj;
  if (p.k === 'sign') { say(null, [SIGNS[p.x + ',' + p.z] || 'UN CARTELLO ROVINATO DALLA PIOGGIA.']); return; }
  if (p.k === 'well') { say(null, [PROPTXT.well, hero.hp < MAXHP() ? 'TI SENTI RINVIGORITO! TUTTI I CUORI SONO PIENI.' : 'È FRESCA E LIMPIDA.']); hero.hp = MAXHP(); return; }
  if (p.k === 'kingstatue') { say(null, ['RE AURELIO IL FONDATORE, CON LA SPADA LEVATA VERSO IL PICCO DEL DRAGO.', 'SUL BASAMENTO: «FINCHÉ LA LUCE DURA, LUMEN DURA».']); return; }
  if (p.k === 'statue' && Math.hypot(p.x - 2760, p.z - 2960) < 300) { say(null, ['UNA GUARDIA DI PIETRA VEGLIA SULLA ROCCA DA CENTO ANNI.']); return; }
  say(null, [PROPTXT[p.k] || '...']);
}

// ---------- aggiornamento ----------
function playUpdate(dt) {
  save.time += dt; ptime += dt;
  if (fade) { fade.t += dt; if (fade.ph === 0 && fade.t >= 0.35) { fade.ph = 1; fade.t = 0; fade.then(); } else if (fade.ph === 1 && fade.t >= 0.35) fade = null; }
  if (st === 'play' && !dialog && !shop && !loot && !menu && !mapOpen && !fade) heroUpdate(dt);
  else hero.moving = false;
  if (D) dungeonUpdate(dt); else { campsUpdate(dt); fauna.update(dt, hero, hero.moving && !!BTN.b, day.night > 0.55); }
  for (const e of foes) foeUpdate(e, dt);
  if (D) foes = foes.filter(e => !(e.st === 'dead' && e.fade <= 0));
  if (!D) { npcsUpdate(dt); jobsUpdate(); }
  dropsUpdate(dt); fxUpdate(dt); shotsUpdate(dt); thingsUpdate(dt);
  if (!D && quake > 0) quake = Math.max(0, quake - dt * 1.6);
  if (!D) {
  // il drago gira intorno al picco
  dragon.a += dt * 0.07; dragon.x = 2250 + Math.cos(dragon.a) * 430; dragon.z = 760 + Math.sin(dragon.a) * 360; dragon.y += (Math.max(125, gH(dragon.x, dragon.z) + 85) + Math.sin(dragon.a * 3) * 15 - dragon.y) * Math.min(1, dt * 0.8); dragon.yaw = dragon.a + Math.PI / 2;
  if (Math.random() < dt * 0.05 && Math.hypot(hero.x - dragon.x, hero.z - dragon.z) < 900) { tone(90, 0.9, 'sawtooth', 0.05, 45); tone(70, 1.1, 'square', 0.03, 40, 0.1); }
  if (save.opt.day !== false) save.tod = ((save.tod || 0) + dt * 24 / DAYLEN) % 24; else save.tod = 11;
  setDay(save.tod);
  ambUpdate(dt);
  // luci del vulcano
  if (Math.hypot(hero.x - 3350, hero.z - 3150) < 500 && Math.random() < 0.5) { const a = Math.random() * TAU, r = Math.random() * 90; fx.push({ k: 'ember', x: 3350 + Math.cos(a) * r, z: 3150 + Math.sin(a) * r, y: gH(3350 + Math.cos(a) * r, 3150 + Math.sin(a) * r) + 2, vy: 18 + Math.random() * 20, t: 1.4, s: 0.6 }); }
  // aria della regione
  placeT -= dt;
  if (placeT <= 0) {
    placeT = 0.35;
    const bw = W.atmo(hero.x, hero.z), tgt = { fog: [0, 0, 0], zen: [0, 0, 0], near: 0, far: 0, wat: [0, 0, 0] };
    for (let b = 0; b < W.NB; b++) { const w = bw[b], a = ATMO[b]; for (let i = 0; i < 3; i++) { tgt.fog[i] += a[0][i] * w; tgt.zen[i] += a[1][i] * w; tgt.wat[i] += a[4][i] * w; } tgt.near += a[2] * w; tgt.far += a[3] * w; }
    atm.tgt = tgt;
    const name = W.placeName(hero.x, hero.z);
    if (name !== curPlace) { if (name === placeCand) { placeHold += 0.35; if (placeHold > 0.7) { curPlace = name; banner = { t: name, life: 3.2, c: '#ffffff' }; } } else { placeCand = name; placeHold = 0; } }
  }
  if (atm.tgt) { const k = Math.min(1, dt * 1.5), T = atm.tgt; for (let i = 0; i < 3; i++) { atm.fog[i] += (T.fog[i] - atm.fog[i]) * k; atm.zen[i] += (T.zen[i] - atm.zen[i]) * k; atm.wat[i] += (T.wat[i] - atm.wat[i]) * k; } atm.near += (T.near - atm.near) * k; atm.far += (T.far - atm.far) * k; }
  if (mapOpen && !D) { const sp = mapV.span * 0.55 * dt; mapV.x += ((BTN.right ? 1 : 0) - (BTN.left ? 1 : 0)) * sp; mapV.z += ((BTN.down ? 1 : 0) - (BTN.up ? 1 : 0)) * sp; clampMap(); }
  // mappa esplorata
  seenT -= dt;
  if (seenT <= 0) { seenT = 0.5; const ci = Math.floor(hero.x / 64), cj = Math.floor(hero.z / 64) + MGN; for (let j = cj - 3; j <= cj + 3; j++) for (let i = ci - 3; i <= ci + 3; i++) if (i >= 0 && j >= 0 && i < MG && j < MGZ && (i - ci) ** 2 + (j - cj) ** 2 <= 10) seen[j * MG + i] = 1; }
  }
  if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
  for (const t of toasts) t.life -= dt; toasts = toasts.filter(t => t.life > 0);
  if (help > 0) help -= dt;
  target = (!dialog && !shop && !loot && !menu && !mapOpen && !fade && !hero.fall) ? findTarget() : null;
  saveT += dt; if (saveT > 20) { saveT = 0; writeSave(); }
  // la quota di riferimento per le grotte aperte (chi è sul dorso di una volta ci resta, chi è dentro resta dentro); dopo un salto di posto si riparte dal fondo
  if (!D && W.GROTTE.length) { if (Math.hypot(hero.x - rifX, hero.z - rifZ) > 12) { W.rif = -1e9; hero.y = gH(hero.x, hero.z); } W.rif = hero.y; rifX = hero.x; rifZ = hero.z; }
  { const q = !D && W.GROTTE.length ? W.grotta(hero.x, hero.z) : null; grK += ((q && hero.y < q.ce ? q.bu : 0) - grK) * Math.min(1, 4 * dt); if (grK < 0.004) grK = 0; if (q && q.bu > 0 && hero.y < q.ce) grMus = q.g.musica || 'grotta'; }
  camUpdate(dt);
  if (dialog) { const L = dialog.lines[dialog.i]; const tot = L.join(' ').length; if (dialog.ch < tot) { dialog.ch = Math.min(tot, dialog.ch + dt * 70); if (Math.floor(dialog.ch) % 3 === 0) tone(820 + Math.random() * 120, 0.012, 'square', 0.012); } }
  if (loot) loot.t += dt;
}

// ===================== i santuari =====================
const DS = SG.dun, DT = DS.T, DCS = DS.CS;
let D = null, DID = null, DAT = null, DTEX = null, DCH = {}, DSP = {}, DBOSS = null;
let shots = [], boss = null, fade = null, hazards = [], quake = 0;
const dynF2 = new Float32Array(1500 * 44), dmF = new Float32Array(900 * 32);
let dynBuf2 = null, dmBuf = null, dmN = 0;
const gH = (x, z, ref) => D ? dGround(x, z) : W.ground(x, z, ref);   // ref: la quota di chi chiede (conta solo sopra le grotte aperte, dove il suolo ha due quote)
// un nemico su un altro piano di una grotta aperta (l'eroe sul dorso della volta e lui sotto, o viceversa): non si vedono e non si toccano
const altroPiano = e => !D && W.GROTTE.length > 0 && Math.abs(hero.y - e.y) > 18 && !!W.grotta(e.x, e.z);
const CASA = { keys: 0, big: 0, open: {}, ch: {}, sol: {}, br: {}, clr: {}, xs: 0, boss: 0, heart: 0, done: 0, seen: '', vis: 0 };       // le botteghe non lasciano tracce nel salvataggio
const inCasa = () => !!(D && D.def.casa);
function dsave(id) { if (DS.DEF[id] && DS.DEF[id].casa) return CASA; if (!save.dun) save.dun = {}; return save.dun[id] || (save.dun[id] = { keys: 0, big: 0, open: {}, ch: {}, sol: {}, br: {}, clr: {}, xs: 0, boss: 0, heart: 0, done: 0, seen: '', vis: 0 }); }
const droot = () => dsave(DS.rootOf(D.id));     // quello che vale per tutto il santuario: grande chiave, guardiano
const floorTag = d => { const n = DS.family(d.base || Object.keys(DS.DEF).find(k => DS.DEF[k] === d)).length; return n > 1 ? 'LIVELLO ' + (d.lv || 1) + ' DI ' + n : ''; };
const sanctDone = id => !!(save && save.dun && save.dun[id] && save.dun[id].done);
const gemsN = () => DS.ORDER.filter(sanctDone).length;
const nextSanct = () => DS.ORDER.find(id => !sanctDone(id)) || null;
const canSwim = () => !!(eqIt('elmo') || {}).swim;
const swimItem = () => save.inv.map(id => IT[id]).find(it => it && it.swim);
const fireProof = () => !!(eqIt('armatura') || {}).fire;
const canReflect = () => !!(eqIt('scudo') || {}).reflect;
function dAt(i, j) { return (i >= 0 && j >= 0 && i < D.w && j < D.h) ? D.cell[j * D.w + i] : DT.ROCK; }
const dCellAt = (x, z) => dAt(Math.floor(x / DCS), Math.floor(z / DCS));
const dRoomAt = (x, z) => D.P.roomOf(Math.floor(x / DCS), Math.floor(z / DCS));
function dGround(x, z) {
  const i = Math.floor(x / DCS), j = Math.floor(z / DCS), t = dAt(i, j);
  if (t === DT.WATER) return -DS.WD;
  if (t === DT.LAVA) return -0.6;
  if (t === DT.PIT) return -DS.PD;
  if (t === DT.PLAT) return D.platUp[j * D.w + i] ? 0 : -DS.PD;
  return 0;
}
// chi può entrare in una cella: 'hero', 'foe' (a terra), 'fly' (vola), 'shot' (proiettile)
function dBlocks(i, j, who) {
  const t = dAt(i, j), k = j * D.w + i;
  switch (t) {
    case DT.ROCK: case DT.WALL: case DT.CRACK: return true;
    case DT.DOOR: return !D.doorOpen[k];
    case DT.EXIT: case DT.STAIR: return who !== 'hero';
    case DT.TOGB: return !!D.togUp[k];
    case DT.PIT: return who === 'foe';
    case DT.PLAT: return who === 'foe' && !D.platUp[k];
    case DT.WATER: return who === 'foe' || (who === 'hero' && !canSwim());
    case DT.LAVA: return who === 'foe';
  }
  return false;
}
function dCanStand(e, nx, nz, r) {
  const who = e === hero ? 'hero' : (e.type && FOE[e.type] && FOE[e.type].fly) ? 'fly' : 'foe';
  const i0 = Math.floor((nx - r) / DCS), i1 = Math.floor((nx + r) / DCS), j0 = Math.floor((nz - r) / DCS), j1 = Math.floor((nz + r) / DCS);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (dBlocks(i, j, who)) {
    const cx = Math.max(i * DCS, Math.min(nx, i * DCS + DCS)), cz = Math.max(j * DCS, Math.min(nz, j * DCS + DCS));
    if ((nx - cx) ** 2 + (nz - cz) ** 2 < r * r - 0.01) return false;
  }
  for (const o of D.solids) if (!o.on || o.on()) { const dn = Math.hypot(nx - o.x, nz - o.z); if (dn < o.r + r && dn < Math.hypot(e.x - o.x, e.z - o.z)) return false; }
  for (const b of D.blocks) if (!b.gone && Math.abs(nx - b.x) < 4.6 + r && Math.abs(nz - b.z) < 4.6 + r) return false;
  if (D.rects) for (const q of D.rects) if (nx + r > q[0] && nx - r < q[2] && nz + r > q[1] && nz - r < q[3]) return false;
  if (boss && !boss.dead && boss.solid && !boss.hide && e !== boss) { const dn = Math.hypot(nx - boss.x, nz - boss.z); if (dn < boss.r + r && dn < Math.hypot(e.x - boss.x, e.z - boss.z)) return false; }
  return true;
}

// ---------- entrare e uscire ----------
function makeDungeon(id) {
  const P = DS.parse(id), ds = dsave(id), w = P.w, h = P.h;
  const R = { id, P, def: P.def, w, h, cell: P.cell.slice(), filled: new Set(), doorOpen: new Uint8Array(w * h), togUp: new Uint8Array(w * h), platUp: new Uint8Array(w * h),
    seen: new Uint8Array(w * h), trap: {}, crk: {}, room: -1, entry: { x: P.spawn.x, z: P.spawn.z, yaw: P.spawn.yaw }, lights: [], fogC: hexf(P.def.fog) };
  for (const k in ds.br) R.cell[+k] = DT.FLOOR;
  // i pozzi riempiti dai massi restano pieni: tornando da un piano più basso la strada c'è ancora
  const fl = ds.fl || {}, sunk = new Set(Object.values(fl)); for (const k in fl) { R.cell[+k] = DT.FLOOR; R.filled.add(+k); }
  unb64(ds.seen || '', R.seen);
  R.doors = P.doors.map(d => ({ ...d, anim: -1 }));
  R.togs = []; R.plats = []; R.blocks = []; R.plates = []; R.solids = []; R.turrets = []; R.chests = []; R.pots = []; R.xtals = []; R.signs = []; R.torches = []; R.decor = [];
  const TC = P.def.torch;
  for (const o of P.objs) {
    const k = o.j * w + o.i, rm = P.rooms[o.room];
    if (o.c === 'r' || o.c === 'u') R.togs.push({ ...o, k, up: false });
    else if (o.c === 'R' || o.c === 'U') R.plats.push({ ...o, k });
    else if (o.c === 'O') R.blocks.push({ ...o, si: o.i, sj: o.j, mv: null, gone: sunk.has(o.i + ',' + o.j) });
    else if (o.c === '$' || o.c === '*' || o.c === 'A' || o.c === 'b') {
      R.decor.push({ ...o, yaw: rm ? Math.atan2(rm.z - o.z, rm.x - o.x) : 0, ph: (o.i * 7 + o.j * 13) % 10 });
      if (o.c !== 'b') R.solids.push({ x: o.x, z: o.z, r: o.c === 'A' ? 2.8 : 2.6 });
      if (o.c === '*') R.lights.push({ x: o.x, y: 5, z: o.z, r: 44, c: hexf(P.def.glow).map(v => v * 0.8) });
    }
    else if (o.c === 'p' || o.c === 'P') R.plates.push({ ...o, heavy: o.c === 'P', on: false });
    else if (o.c === 't') { R.torches.push(o); R.solids.push({ x: o.x, z: o.z, r: 2.6 }); R.lights.push({ x: o.x, y: 9, z: o.z, r: 64, c: TC, flick: true }); }
    else if (o.c === 'v') { const p = { ...o, alive: true }; R.pots.push(p); R.solids.push({ x: o.x, z: o.z, r: 2.6, on: () => p.alive }); }
    else if (o.c === 'T') { R.turrets.push({ ...o, yaw: Math.atan2(rm.z - o.z, rm.x - o.x), t: 1 + Math.random() * 2, fl: 0 }); R.solids.push({ x: o.x, z: o.z, r: 4 }); }
    else if (o.c === 'x') { const x = { ...o, cd: 0 }; R.xtals.push(x); R.solids.push({ x: o.x, z: o.z, r: 3, xt: x }); R.lights.push({ x: o.x, y: 6, z: o.z, r: 30, xt: true }); }
    else if (o.c === 'S') { R.signs.push({ ...o, txt: P.signs[o.i + ',' + o.j] }); R.solids.push({ x: o.x, z: o.z, r: 2.5 }); }
    else if ('kqcQKC'.includes(o.c)) {
      const c = { ...o, key: o.i + ',' + o.j, kind: o.c, hidden: (o.c === 'q' || o.c === 'Q') && !ds.clr[o.room], loot: P.loot[o.i + ',' + o.j], yaw: Math.atan2(rm.z - o.z, rm.x - o.x) };
      R.chests.push(c); R.solids.push({ x: o.x, z: o.z, r: 3.4, on: () => !c.hidden });
    }
  }
  // la lava fa luce; l'uscita porta la luce del giorno
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (R.cell[j * w + i] === DT.LAVA && i % 3 === 1 && j % 3 === 1) R.lights.push({ x: (i + 0.5) * DCS, y: 5, z: (j + 0.5) * DCS, r: 46, c: [1, 0.45, 0.12], flick: true });
  R.lights.push({ x: P.spawn.cx, y: 8, z: P.spawn.cz, r: 52, c: P.def.up ? [0.6, 0.52, 0.4] : P.def.casa ? [0.3, 0.33, 0.38] : [0.75, 0.82, 0.95], day: !!P.def.casa });
  if (P.stairs) R.lights.push({ x: P.stairs.cx, y: 6, z: P.stairs.cz, r: 60, c: hexf(P.def.glow) });
  if (P.def.casa) P.def.casa.setup(R);      // una bottega: mobili, oggetti, lumi, chi ci lavora e chi ci beve
  R.clutter = P.def.casa ? [] : SG.decor.clutter(P);   // cose piccole ai piedi dei muri: si vedono e basta
  return R;
}
function dUpload() {
  const m = DS.buildStatic(D.P, D.cell, D.filled), del = b => { if (b) gl.deleteBuffer(b); };
  if (D.gl) { del(D.gl.floor); del(D.gl.wall); del(D.gl.deco); del(D.gl.water); del(D.gl.lava); }
  const buf = a => G.buffer(a.length ? a : new Float32Array(32));
  D.gl = { floor: buf(m.floor), nf: m.floor.length / 32, wall: buf(m.wall), nw: m.wall.length / 32, deco: buf(m.deco), nd: m.deco.length / 32, water: buf(m.water), nwa: m.water.length / 8, lava: buf(m.lava), nl: m.lava.length / 8 };
}
// from: 'out' si entra da fuori, 'up' si arriva dal piano prima (alla via del ritorno), 'down' si torna dal piano dopo (in cima alla scala)
function loadLevel(id, from, out) {
  if (D) dsave(D.id).seen = b64(D.seen);
  D = makeDungeon(id); Object.assign(D, out);
  const art = DS.rootOf(id);
  if (D.def.casa) CASA.seen = '';
  else if (DID !== art) {
    DAT = A.Atlas(2048, 1024); const r = DS.art(art, DAT); DCH = r.CH; DSP = r.SP; DBOSS = r.boss;
    if (DTEX) gl.deleteTexture(DTEX); DTEX = G.texture(DAT.c); DAT.c.width = DAT.c.height = 1; DID = art;
  }
  if (!dynBuf2) { dynBuf2 = G.buffer(dynF2, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW); dmBuf = G.buffer(dmF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW); }
  dUpload();
  const L = from === 'down' && D.P.stairs ? D.P.stairs : D.P.spawn;
  const h = hero; h.x = L.x; h.z = L.z; h.y = 0; h.yaw = L.yaw; h.vx = h.vz = 0; h.fall = 0; h.kb = 0; h.burnT = 0;
  D.entry = { x: h.x, z: h.z, yaw: h.yaw };
  shots = []; drops = []; fx = []; hazards = []; foes = []; amb = []; things = []; h.dash = null; h.atk = 0; h.chg = 0; h.hid = 0;
  spawnDungeonFoes(); makeBoss();
  D.room = -1; dRoomCheck(); dungeonUpdate(0);
  camBehind();
  banner = { t: D.def.name, s: floorTag(D.def), life: 3.2, c: '#ffd23f' }; target = null; curPlace = D.def.name;
  dsave(id).vis = 1; writeSave();
}
// si entra in una bottega dalla sua porta; uscendo ci si ritrova lì davanti, nella stessa città
function enterShop(b) { const town = curPlace || W.placeName(hero.x, hero.z); D = null; loadLevel('in_' + b.key, 'out', { outX: b.ox, outZ: b.oz, outYaw: b.oyaw, town }); }
function enterDungeon(id) {
  const door = doors.find(d => d.id === id), b = W.BUILD.find(q => q.id === id), ov = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[b ? b.door : 's'] || [0, 1];
  D = null; loadLevel(id, 'out', { outX: door ? door.x + ov[0] * 8 : hero.x, outZ: door ? door.z + ov[1] * 8 : hero.z, outYaw: Math.atan2(ov[1], ov[0]) });
}
function gotoLevel(id, from) { tone(from === 'up' ? 196 : 294, 0.25, 'triangle', 0.04, from === 'up' ? 131 : 392); loadLevel(id, from, { outX: D.outX, outZ: D.outZ, outYaw: D.outYaw }); }
function exitDungeon() {
  dsave(D.id).seen = b64(D.seen);
  const h = hero, town = D.def.casa ? D.town : ''; h.x = D.outX; h.z = D.outZ; h.yaw = D.outYaw; h.vx = h.vz = 0; h.fall = 0;
  D = null; boss = null; shots = []; foes = []; drops = []; fx = []; hazards = []; quake = 0; things = []; h.dash = null; h.hid = 0;
  for (const c of camps) { c.alive = []; c.on = false; }
  h.y = W.ground(h.x, h.z); camBehind();
  curPlace = town || ''; placeCand = curPlace; target = null; if (town) setDay(save.tod); writeSave();
}
function startFade(then) { if (fade) return; fade = { t: 0, ph: 0, then }; tone(392, 0.12, 'triangle', 0.04, 260); }
function templeDoor(d) {
  if (d.cave) { if (dsave(d.id).vis) startFade(() => enterDungeon(d.id)); else say(null, d.intro || ["UN'APERTURA BUIA TRA LE ROCCE. DA DENTRO ARRIVA UN'ARIA FREDDA E UMIDA...", 'ENTRI CON CAUTELA.'], () => startFade(() => enterDungeon(d.id))); return; }
  const id = d.id, q = save.q.main, nm = SANCT[id];
  // nel Grande Viaggio (anteprima) non c'è ancora la storia che apre i sigilli: il santuario si apre a chi arriva
  if (MODO) { if (dsave(id).vis) startFade(() => enterDungeon(id)); else say(null, ['LE RUNE DEL ' + nm + ' SI ACCENDONO UNA DOPO L\'ALTRA. LA PIETRA SI APRE...'], () => startFade(() => enterDungeon(id))); return; }
  if (q < 4) { say(null, ['UN ANTICO SIGILLO CHIUDE LA PORTA DEL ' + nm + '. LE RUNE BRILLANO DEBOLMENTE.', q === 3 ? 'FORSE IL CAPITANO ARDEA SA COME SPEZZARLO.' : 'SOLO IL SANGUE DEI RE DI LUMEN PUÒ SPEZZARLO.']); return; }
  const nx = nextSanct();
  if (sanctDone(id) || id === nx) {
    if (dsave(id).vis) { startFade(() => enterDungeon(id)); return; }
    say(null, [sanctDone(id) ? 'IL ' + nm + ' È LIBERO.' : 'APPOGGI IL SIGILLO DEL RE ALLA PORTA. LE RUNE SI ACCENDONO UNA DOPO L\'ALTRA E LA PIETRA SI APRE...'], () => startFade(() => enterDungeon(id)));
    return;
  }
  say(null, ['IL SIGILLO DI QUESTO SANTUARIO È ANCORA TROPPO FORTE: I SANTUARI SI APRONO UNO ALLA VOLTA.', 'PRIMA DEVI LIBERARE IL ' + SANCT[nx] + '.']);
}

// ---------- nemici e guardiano ----------
function dCamp(room) { D.camps = D.camps || {}; const rm = D.P.rooms[room]; return D.camps[room] || (D.camps[room] = { x: rm.x, z: rm.z, r: rm.r * 0.75, alive: [], dead: 0, n: 0 }); }
function addDFoe(type, x, z, room) {
  const camp = dCamp(room), T = FOE[type];
  const e = { type, camp, room, x, z, y: gH(x, z) + (T.fly || 0), yaw: Math.random() * TAU, hp: T.hp, st: 'idle', t: Math.random() * 2, cd: 0, sh: 0.5 + Math.random() * T.shoot || 0, flash: 0, kb: 0, walk: 0, hop: Math.random(), wx: x, wz: z, open: 0 };
  foes.push(e); camp.alive.push(e); camp.n++; return e;
}
function spawnDungeonFoes() {
  const ds = dsave(D.id); D.camps = {};
  for (const o of D.P.objs) if ('efghj'.includes(o.c)) { const type = D.def.foes[o.c]; if (type && !ds.clr[o.room]) addDFoe(type, o.x, o.z, o.room); }
}
function poolsOf(room) {
  const out = [], seenP = new Set();
  for (let j = 0; j < D.h; j++) for (let i = 0; i < D.w; i++) {
    const k = j * D.w + i; if (seenP.has(k) || D.cell[k] !== DT.WATER || D.P.room[k] !== room) continue;
    let sx = 0, sz = 0, n = 0; const st2 = [[i, j]]; seenP.add(k);
    while (st2.length) { const [a, c] = st2.pop(); sx += a; sz += c; n++; for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (c + v) * D.w + a + u; if (!seenP.has(kk) && dAt(a + u, c + v) === DT.WATER) { seenP.add(kk); st2.push([a + u, c + v]); } } }
    out.push({ x: (sx / n + 0.5) * DCS, z: (sz / n + 0.5) * DCS });
  }
  return out;
}
// In fondo a ogni dungeon, aperto il grande forziere, sulle rune davanti si accende un portale che riporta fuori:
// niente risalita a piedi. Appena comparso non scatta finché l'eroe non se ne allontana (ci sta sopra mentre apre).
const vaultFloor = () => !!(D && D.def.base && !D.def.down);
const vaultPortal = (c, armed) => ({ x: c.x + DCS / 2, z: c.z + DCS, arm: armed, s: 0.125 });      // più piccolo di quello delle arene: la tesoreria è una stanzetta
function makeBoss() {
  boss = null; D.gem = null; D.portal = null; D.heartP = null;
  if (vaultFloor()) { const c = D.chests.find(q => q.kind === 'C'); if (c && dsave(D.id).ch[c.key]) D.portal = vaultPortal(c, true); }
  const ds = dsave(D.id), M = D.P.bossAt; if (!M) return;
  const rm = D.P.rooms[D.P.bossRoom]; D.rewardAt = { x: rm.x, z: rm.z };
  if (ds.boss) { if (!ds.done) D.gem = { x: rm.x, z: rm.z }; else D.portal = { x: rm.x, z: rm.z }; if (!ds.heart) D.heartP = { x: rm.x + 16, z: rm.z }; return; }
  const B = DBOSS;
  boss = { type: D.def.boss, B, x: M.x, z: M.z, y: 0, yaw: Math.PI / 2, hp: B.hp, max: B.hp, st: 'idle', t: 0, vuln: false, flash: 0, pose: 0, r: B.r, on: false, dead: false, solid: true, hide: false, n: 0, touch: 2, walk: 0 };
  if (boss.type === 'serpent') { boss.pools = poolsOf(D.P.bossRoom); boss.solid = false; boss.hide = true; boss.touch = 0; }
}
function stepBoss(b, mx, mz) { if (dCanStand(b, b.x + mx, b.z + mz, b.r)) { b.x += mx; b.z += mz; return true; } return false; }
function bossDust(b, n = 3) { for (let i = 0; i < n; i++) fx.push({ k: 'puff', x: b.x + (Math.random() - 0.5) * b.r * 2, z: b.z + (Math.random() - 0.5) * b.r * 2, y: 1, vy: 4 + Math.random() * 4, t: 0.5, s: 0.5 }); }
function ringFx(x, z, r) { for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; fx.push({ k: 'puff', x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, y: 1, vy: 5 + Math.random() * 4, t: 0.6, s: 0.55 }); } }
function shoot(k, x, z, a, sp, dmg, src, extra) { shots.push(Object.assign({ k, from: 'foe', x: x + Math.cos(a) * 5, z: z + Math.sin(a) * 5, y: 5, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, r: 2.3, dmg, life: 4, src, hard: !!(src && src.B) }, extra || {})); }
function freeSpot(room, minD) {
  const rm = D.P.rooms[room];
  for (let k = 0; k < 60; k++) {
    const i = rm.i0 + 1 + Math.floor(Math.random() * (rm.i1 - rm.i0 - 1)), j = rm.j0 + 1 + Math.floor(Math.random() * (rm.j1 - rm.j0 - 1)), x = (i + 0.5) * DCS, z = (j + 0.5) * DCS;
    let ok = true; for (let b = -1; b <= 1 && ok; b++) for (let a = -1; a <= 1; a++) { const t = dAt(i + a, j + b); if (t !== DT.FLOOR && t !== DT.ICE) { ok = false; break; } }
    if (ok && Math.hypot(x - hero.x, z - hero.z) > minD) return [x, z];
  }
  return [rm.x, rm.z];
}
const BOSSAI = {
  golem(b, dt, d, aim) {
    const ph2 = b.hp <= b.max / 2;
    if (ph2 && !b.p2) { b.p2 = true; toast('IL GOLEM SI INFURIA!', '#ff8a5a'); for (const s of [-1, 1]) addDFoe('slime', b.x + s * 22, b.z + 8, D.P.bossRoom); }
    if (b.st === 'start') { b.pose = 0; if (b.t <= 0) { b.st = 'walk'; b.t = 2.4; } return; }
    if (b.st === 'walk') {
      b.pose = 0; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 3 * dt);
      const sp = (ph2 ? 15 : 11) * dt;
      if (d > 15) { stepBoss(b, Math.cos(b.yaw) * sp, Math.sin(b.yaw) * sp); b.walk += sp; if (Math.floor(b.walk / 9) !== b.step) { b.step = Math.floor(b.walk / 9); tone(70, 0.08, 'square', 0.05); quake = Math.max(quake, 0.15); bossDust(b, 2); } }
      if (b.t <= 0 || d < 24) { b.st = 'raise'; b.t = 0.95; const sx = b.x + Math.cos(b.yaw) * 8, sz = b.z + Math.sin(b.yaw) * 8; hazards.push({ x: sx, z: sz, r: 25, warn: 0.95, dmg: 4, k: 'slam' }); tone(200, 0.5, 'triangle', 0.04, 90); }
    } else if (b.st === 'raise') { b.pose = 1; if (b.t <= 0) { b.st = 'slam'; b.t = 0.3; if (ph2) for (let k = 0; k < 3; k++) { const a = Math.random() * TAU, r = Math.random() * 16; hazards.push({ x: hero.x + Math.cos(a) * r, z: hero.z + Math.sin(a) * r, r: 6, warn: 1.1 + k * 0.25, dmg: 2, k: 'rock' }); } } }
    else if (b.st === 'slam') { b.pose = 2; if (b.t <= 0) { b.st = 'stuck'; b.t = 2.5; b.vuln = true; } }
    else if (b.st === 'stuck') { b.pose = 3; if (b.t <= 0) { b.vuln = false; b.st = 'walk'; b.t = 2.4 + Math.random(); } }
  },
  serpent(b, dt, d, aim) {
    const ph2 = b.hp <= b.max / 2;
    if (b.st === 'start') { b.hide = true; if (b.t <= 0) { b.st = 'under'; b.t = 0.8; } return; }
    if (b.st === 'under') {
      b.hide = true;
      if (!b.next) { const opts = b.pools.filter(p => Math.hypot(p.x - b.x, p.z - b.z) > 5); b.next = opts[Math.floor(Math.random() * opts.length)] || b.pools[0]; }
      if (Math.random() < 0.5) fx.push({ k: 'drop', x: b.next.x + (Math.random() - 0.5) * 12, z: b.next.z + (Math.random() - 0.5) * 12, y: -1, vy: 10 + Math.random() * 8, t: 0.4, s: 0.4 });
      if (b.t <= 0) { b.x = b.next.x; b.z = b.next.z; b.next = null; b.st = 'rise'; b.t = 0.5; b.hide = false; for (let k = 0; k < 10; k++) fx.push({ k: 'drop', x: b.x + (Math.random() - 0.5) * 10, z: b.z + (Math.random() - 0.5) * 10, y: 0, vy: 14 + Math.random() * 10, t: 0.6, s: 0.45 }); tone(160, 0.3, 'triangle', 0.05, 320); }
    } else if (b.st === 'rise') { b.pose = 3; b.yaw = aim; if (b.t <= 0) { b.st = 'spit'; b.t = 0.7; b.n = ph2 ? 4 : 3; } }
    else if (b.st === 'spit') {
      b.pose = b.t < 0.3 ? 1 : 0; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 4 * dt);
      if (b.t <= 0) { for (const o of ph2 ? [-0.28, 0, 0.28] : [0]) shoot('bubble', b.x, b.z, aim + o, 36, 2, b); tone(420, 0.12, 'sine', 0.05, 200); b.n--; b.t = 1.15; if (b.n <= 0) { b.st = 'sink'; b.t = 0.7; } }
    } else if (b.st === 'sink') { b.pose = 3; if (b.t <= 0) { b.st = 'under'; b.t = 1.2; b.hide = true; } }
    else if (b.st === 'dizzy') { b.pose = 2; if (b.t <= 0) { b.vuln = false; b.st = 'sink'; b.t = 0.5; } }
  },
  scarab(b, dt, d, aim) {
    const ph2 = b.hp <= b.max / 2;
    if (b.st === 'start') { b.pose = 0; if (b.t <= 0) { b.st = 'turn'; b.t = 1; } return; }
    if (b.st === 'turn') { b.pose = Math.floor(time * 8) % 2; b.touch = 2; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 5 * dt); if (Math.random() < 0.4) bossDust(b, 1); if (b.t <= 0) { b.st = 'charge'; b.t = 3; b.dist = 0; b.touch = 4; tone(130, 0.4, 'sawtooth', 0.05, 260); } }
    else if (b.st === 'charge') {
      b.pose = 2; const sp = (ph2 ? 92 : 78) * dt;
      if (!stepBoss(b, Math.cos(b.yaw) * sp, Math.sin(b.yaw) * sp)) { b.st = 'flip'; b.t = 2.7; b.vuln = true; b.touch = 0; quake = 0.7; noise(0.4, 0.09); ringFx(b.x + Math.cos(b.yaw) * 10, b.z + Math.sin(b.yaw) * 10, 8); }
      else { b.dist += sp; if (Math.random() < 0.5) bossDust(b, 1); if (b.dist > 200 || b.t <= 0) { b.st = 'skid'; b.t = 0.6; b.touch = 2; } }
    } else if (b.st === 'skid') { b.pose = 0; if (b.t <= 0) { if (ph2 && Math.random() < 0.5) { b.st = 'burrow'; b.t = 2.2; b.hide = true; b.solid = false; ringFx(b.x, b.z, 8); } else { b.st = 'turn'; b.t = 0.9; } } }
    else if (b.st === 'flip') { b.pose = 3; if (b.t <= 0) { b.vuln = false; b.st = 'turn'; b.t = 0.8; } }
    else if (b.st === 'burrow') {
      const sp = 34 * dt, a = Math.atan2(hero.z - b.z, hero.x - b.x); stepBoss(b, Math.cos(a) * sp, Math.sin(a) * sp);
      if (Math.random() < 0.6) fx.push({ k: 'puff', x: b.x + (Math.random() - 0.5) * 6, z: b.z + (Math.random() - 0.5) * 6, y: 0.5, vy: 6, t: 0.5, s: 0.5 });
      if (b.t <= 0) { b.st = 'erupt'; b.t = 0.9; hazards.push({ x: b.x, z: b.z, r: 15, warn: 0.9, dmg: 4, k: 'erupt' }); }
    } else if (b.st === 'erupt') { if (b.t <= 0) { b.hide = false; b.solid = true; b.st = 'skid'; b.t = 0.8; } }
  },
  queen(b, dt, d, aim) {
    const ph2 = b.hp <= b.max / 2;
    b.y = b.st === 'tired' ? 0 : 3 + Math.sin(time * 2) * 1.2;
    if (b.second > 0) { b.second -= dt; if (b.second <= 0) for (let k = -2; k <= 2; k++) shoot('ice', b.x, b.z, aim + k * 0.2 + 0.1, 44, 2, b); }
    if (b.st === 'start') { b.pose = 0; if (b.t <= 0) { b.st = 'float'; b.t = 1.2; } return; }
    if (b.st === 'float') { b.pose = 0; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 3 * dt); if (b.t <= 0) { b.st = 'cast'; b.t = 0.9; tone(880, 0.6, 'triangle', 0.03, 1760); } }
    else if (b.st === 'cast') {
      b.pose = 1; b.yaw = aim; if (Math.random() < 0.6) fx.push({ k: 'glint', x: b.x + (Math.random() - 0.5) * 8, z: b.z + (Math.random() - 0.5) * 8, y: 12 + Math.random() * 8, vy: 4, t: 0.4, s: 0.3 });
      if (b.t <= 0) {
        const n = ph2 ? 7 : 5; for (let k = 0; k < n; k++) shoot('ice', b.x, b.z, aim + (k - (n - 1) / 2) * 0.2, 44, 2, b);
        if (ph2) b.second = 0.45; tone(1318, 0.15, 'square', 0.04, 660);
        b.n++; if (b.n % 3 === 0) { b.st = 'storm'; b.t = 1.5; for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + Math.random(), r = 9 + Math.random() * 10; hazards.push({ x: hero.x + Math.cos(a) * r, z: hero.z + Math.sin(a) * r, r: 7, warn: 1.0, dmg: 3, k: 'spike' }); } hazards.push({ x: hero.x, z: hero.z, r: 7, warn: 1.1, dmg: 3, k: 'spike' }); if (ph2 && foes.filter(e => e.st !== 'dead').length < 3) for (const s of [-1, 1]) addDFoe('icebat', b.x + s * 14, b.z, D.P.bossRoom); }
        else { b.st = 'blink'; b.t = 0.8; }
      }
    } else if (b.st === 'storm') { b.pose = 1; if (b.t <= 0) { b.st = 'tired'; b.t = 2.8; b.vuln = true; } }
    else if (b.st === 'tired') { b.pose = 2; if (b.t <= 0) { b.vuln = false; b.st = 'blink'; b.t = 0.8; } }
    else if (b.st === 'blink') {
      b.hide = b.t < 0.62 && b.t > 0.18; b.solid = !b.hide;
      if (b.t <= 0.4 && !b.moved) { b.moved = true; const [x, z] = freeSpot(D.P.bossRoom, 45); b.x = x; b.z = z; }
      if (b.t <= 0) { b.moved = false; b.hide = false; b.solid = true; b.st = 'float'; b.t = 0.9 + Math.random() * 0.8; }
    }
  },
  salamander(b, dt, d, aim) {
    const ph2 = b.hp <= b.max / 2;
    if (b.st === 'start') { b.pose = 0; if (b.t <= 0) { b.st = 'stalk'; b.t = 2; } return; }
    if (b.st === 'stalk') {
      b.pose = Math.floor(time * 6) % 2; b.touch = 3; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 3 * dt);
      const sp = (ph2 ? 30 : 22) * dt; if (d > 18) stepBoss(b, Math.cos(b.yaw) * sp, Math.sin(b.yaw) * sp);
      if (b.t <= 0) { if (Math.random() < 0.6) { b.st = 'inhale'; b.t = 0.95; tone(110, 0.9, 'sawtooth', 0.04, 330); } else { b.st = 'spit'; b.t = 0.5; b.n = 3; } }
    } else if (b.st === 'inhale') {
      b.pose = 2; b.yaw += angDiff(aim, b.yaw) * Math.min(1, 4 * dt);
      fx.push({ k: 'ember', x: b.x + Math.cos(b.yaw) * 16, z: b.z + Math.sin(b.yaw) * 16, y: 6, vy: 6, t: 0.3, s: 0.4 });
      if (b.t <= 0) { b.st = 'breath'; b.t = 1.3; }
    } else if (b.st === 'breath') {
      b.pose = 2; if (ph2) b.yaw += angDiff(aim, b.yaw) * Math.min(1, 1.1 * dt);
      for (let k = 0; k < 3; k++) { const a = b.yaw + (Math.random() - 0.5) * 0.7, r = 14 + Math.random() * 30; fx.push({ k: 'ember', x: b.x + Math.cos(a) * r, z: b.z + Math.sin(a) * r, y: 4 + Math.random() * 4, vy: 8, t: 0.35, s: 0.7 }); }
      if (Math.random() < 0.2) noise(0.12, 0.04);
      if (d < 44 && Math.abs(angDiff(aim, b.yaw)) < 0.42) hurtHero(2, b, true);
      if (b.t <= 0) { b.st = 'cool'; b.t = 2.7; b.vuln = true; b.touch = 0; }
    } else if (b.st === 'spit') {
      b.pose = 2; if (b.t <= 0) { const a = aim + (Math.random() - 0.5) * 0.4, far = Math.min(70, d + (Math.random() - 0.3) * 16); shoot('fire', b.x, b.z, a, 48, 2, b, { patch: true, life: Math.max(0.3, far / 48) }); tone(240, 0.12, 'sawtooth', 0.04, 120); b.n--; b.t = 0.45; if (b.n <= 0) { b.st = 'stalk'; b.t = 2; } }
    } else if (b.st === 'cool') { b.pose = 3; if (b.t <= 0) { b.vuln = false; b.st = 'stalk'; b.t = 2.2; } }
  },
};
function stunBoss(b) {
  if (b.type === 'serpent' && (b.st === 'spit' || b.st === 'rise')) { b.st = 'dizzy'; b.t = 3.4; b.vuln = true; }
  else if (b.type === 'queen' && (b.st === 'cast' || b.st === 'float')) { b.st = 'tired'; b.t = 2.8; b.vuln = true; }
  else if (b.type === 'salamander' && (b.st === 'stalk' || b.st === 'spit' || b.st === 'inhale')) { b.st = 'cool'; b.t = 2.7; b.vuln = true; b.touch = 0; }
  else return false;
  tone(1046, 0.08, 'square', 0.05); tone(523, 0.2, 'square', 0.04, null, 0.08); return true;
}
function bossUpdate(dt) {
  const b = boss; if (!b || b.dead) return;
  if (b.flash > 0) b.flash -= dt;
  if (b.st === 'die') {
    b.t -= dt; b.hide = false;
    if (Math.random() < 0.5) puffAt(b.x + (Math.random() - 0.5) * 20, b.z + (Math.random() - 0.5) * 20, 2, b.y + 3 + Math.random() * 12);
    if (Math.random() < 0.15) { noise(0.15, 0.05); fx.push({ k: 'spark', x: b.x, z: b.z, y: b.y + 8, vy: 14, t: 0.4, s: 0.6 }); }
    if (b.t <= 0) bossDefeated();
    return;
  }
  if (!b.on) {
    const bd = D.doors.find(q => q.kind === 'boss'), far = !bd || Math.hypot(hero.x - bd.cx, hero.z - bd.cz) > 18;
    if (D.room !== D.P.bossRoom || !far || st !== 'play') return;
    b.on = true; b.st = 'start'; b.t = 1.4; banner = { t: b.B.n, s: b.B.s, life: 3.2, c: '#ff8a5a' };
    tone(98, 0.9, 'sawtooth', 0.06, 49); tone(147, 0.9, 'square', 0.03, 73, 0.15);
    const H = { golem: 'QUANDO SI BLOCCA DOPO IL COLPO, COLPISCILO!', serpent: canReflect() ? 'RESPINGI LE BOLLE CON LO SCUDO DELLE RADICI!' : CLS.TXT.serpe[cls()] || 'EQUIPAGGIA LO SCUDO DELLE RADICI (START) PER RESPINGERE LE BOLLE!', scarab: 'FALLO SCHIANTARE CONTRO MURI E PILASTRI!', queen: CLS.TXT.regina[cls()], salamander: 'DOPO IL SOFFIO SI RAFFREDDA: È IL MOMENTO!' };
    toast(H[b.type], '#ffd23f');
  }
  const dx = hero.x - b.x, dz = hero.z - b.z, d = Math.hypot(dx, dz), aim = Math.atan2(dz, dx);
  b.t -= dt;
  BOSSAI[b.type](b, dt, d, aim);
  if (!b.vuln && !b.hide && b.touch && b.st !== 'start' && d < b.r + 2.6 && st === 'play') hurtHero(b.touch, b, true);
}
function bossHit(dmg = 1, far) {
  const b = boss; if (!b || b.dead || b.hide || b.st === 'die' || !b.on) return;
  for (let i = 0; i < 4; i++) fx.push({ k: 'spark', x: b.x + (hero.x - b.x) * 0.4, z: b.z + (hero.z - b.z) * 0.4, y: b.y + 5 + Math.random() * 4, vy: 9, t: 0.25, s: 0.35 });
  if (!b.vuln) { tone(1600, 0.05, 'square', 0.04); tone(1200, 0.06, 'square', 0.03, null, 0.04); if (!far) { const a = Math.atan2(hero.z - b.z, hero.x - b.x); hero.kx = Math.cos(a) * 34; hero.kz = Math.sin(a) * 34; hero.kb = 0.12; } return; }
  b.hp -= dmg; b.flash = 0.18; tone(200, 0.1, 'square', 0.06, 90); vib(25);
  if (b.hp <= 0) { b.st = 'die'; b.t = 2.4; b.vuln = false; b.solid = false; quake = 1; tone(150, 1.6, 'sawtooth', 0.06, 40); for (const e of foes) if (e.st !== 'dead') { e.st = 'dead'; e.fade = 0.5; puffAt(e.x, e.z, 5, e.y + 2); } }
}
function bossDefeated() {
  const b = boss, ds = dsave(D.id); b.dead = true; ds.boss = 1;
  ringFx(b.x, b.z, 12); fanfare(); boss = null; musQuiet = 4.5;
  D.gem = { x: D.rewardAt.x, z: D.rewardAt.z }; if (!ds.heart) D.heartP = { x: D.rewardAt.x + 16, z: D.rewardAt.z };
  banner = { t: b.B.n + ' SCONFITTO!', s: "PRENDI LA PIETRA DELL'ALBA", life: 4, c: '#ffd23f' }; writeSave();
  if (DS.family(D.id).some(k => DS.parse(k).doors.some(d => d.kind === 'seal'))) setTimeout(() => { if (D) toast('NELLE PROFONDITÀ UN SIGILLO SI È SPEZZATO...', '#7af0ff'); }, 5200);
}
function takeGem() {
  const ds = dsave(D.id); ds.done = 1; D.gem = null; D.portal = { x: D.rewardAt.x, z: D.rewardAt.z };
  if (gemsN() >= 5 && save.q.main === 4) save.q.main = 5;
  openLoot(D.def.gem); banner = { t: D.def.name + ' LIBERATO!', s: 'IL PORTALE DI LUCE TI RIPORTA FUORI', life: 4.5, c: '#ffd23f' }; writeSave();
}

// ---------- oggetti del santuario ----------
function dRoomCheck() {
  const r = dRoomAt(hero.x, hero.z);
  if (r < 0 || r === D.room) return;
  D.room = r; D.entry = { x: hero.x, z: hero.z, yaw: hero.yaw };
  const rm = D.P.rooms[r]; for (let j = rm.j0 - 1; j <= rm.j1 + 1; j++) for (let i = rm.i0 - 1; i <= rm.i1 + 1; i++) if (i >= 0 && j >= 0 && i < D.w && j < D.h) D.seen[j * D.w + i] = 1;
  // i massi di questa stanza tornano al loro posto (se l'enigma non è già risolto)
  const ds = dsave(D.id), solved = Object.keys(D.P.shut).some(g => D.P.shut[g].room === r && D.P.shut[g].type === 'plates' && ds.sol[g]);
  if (!solved) for (const b of D.blocks) if (b.room === r && !b.gone && !b.mv && (b.i !== b.si || b.j !== b.sj)) { puffAt(b.x, b.z, 4, 3); b.i = b.si; b.j = b.sj; b.x = (b.i + 0.5) * DCS; b.z = (b.j + 0.5) * DCS; }
}
function cellFreeFor(i, j, b) {
  const t = dAt(i, j); if (!(t === DT.FLOOR || t === DT.ICE || t === DT.SPIKE || t === DT.BRIDGE || t === DT.PIT || t === DT.WATER || (t === DT.TOGB && !D.togUp[j * D.w + i]))) return false;
  if (D.blocks.some(o => o !== b && !o.gone && o.i === i && o.j === j)) return false;
  const x = (i + 0.5) * DCS, z = (j + 0.5) * DCS;
  if (D.solids.some(o => (!o.on || o.on()) && Math.abs(o.x - x) < 5 && Math.abs(o.z - z) < 5)) return false;
  if (foes.some(e => e.st !== 'dead' && Math.abs(e.x - x) < 6 && Math.abs(e.z - z) < 6)) return false;
  return true;
}
function pushBlock(b, di, dj) {
  const ti = b.i + di, tj = b.j + dj; if (!cellFreeFor(ti, tj, b)) { tone(110, 0.06, 'square', 0.03); return false; }
  b.mv = { fx: b.x, fz: b.z, tx: (ti + 0.5) * DCS, tz: (tj + 0.5) * DCS, t: 0, di, dj, sp: dAt(b.i, b.j) === DT.ICE ? 5.5 : 3.6 }; b.i = ti; b.j = tj;
  noise(0.25, 0.04); return true;
}
function blocksUpdate(dt) {
  for (const b of D.blocks) {
    if (b.gone || !b.mv) continue;
    const m = b.mv; m.t = Math.min(1, m.t + dt * m.sp); b.x = m.fx + (m.tx - m.fx) * m.t; b.z = m.fz + (m.tz - m.fz) * m.t;
    if (m.t < 1) continue;
    b.mv = null; const k = b.j * D.w + b.i, t = D.cell[k];
    if (t === DT.PIT || t === DT.WATER) { b.gone = true; D.cell[k] = DT.FLOOR; D.filled.add(k); const ds2 = dsave(D.id); (ds2.fl = ds2.fl || {})[k] = b.si + ',' + b.sj; writeSave(); dUpload(); puffAt(b.x, b.z, 8, 1); tone(90, 0.3, 'sawtooth', 0.05, 50); jingle(); continue; }
    if (t === DT.ICE && cellFreeFor(b.i + m.di, b.j + m.dj, b) && dAt(b.i + m.di, b.j + m.dj) !== DT.PIT) { b.mv = { fx: b.x, fz: b.z, tx: (b.i + m.di + 0.5) * DCS, tz: (b.j + m.dj + 0.5) * DCS, t: 0, di: m.di, dj: m.dj, sp: 7 }; b.i += m.di; b.j += m.dj; }
    else tone(140, 0.08, 'square', 0.04);
  }
}
// Le pietre si spingono in due modi: camminandoci contro (conta dove si sta andando: va bene anche di sbieco, strisciando
// lungo la faccia) oppure mettendosi davanti e premendo A. Si muovono sempre di una casella, lungo la griglia.
function heroPush(dt, dir = hero.yaw, reach = 8.2) {
  const h = hero, fx2 = Math.cos(dir), fz2 = Math.sin(dir), ax = Math.abs(fx2) > Math.abs(fz2), di = ax ? Math.sign(fx2) : 0, dj = ax ? 0 : Math.sign(fz2);
  if (Math.max(Math.abs(fx2), Math.abs(fz2)) > 0.88) for (const b of D.blocks) {
    if (b.gone || b.mv) continue;
    const along = ax ? (b.x - h.x) * di : (b.z - h.z) * dj, side = ax ? Math.abs(b.z - h.z) : Math.abs(b.x - h.x);
    if (along > 4 && along < reach && side < 4.4) { h.pushT = (h.pushT || 0) + dt; if (h.pushT > 0.32) { h.pushT = 0; pushBlock(b, di, dj); } return true; }
  }
  h.pushT = 0; return false;
}
// la pietra che l'eroe ha davanti, a un passo: quella che A spinge. Restituisce anche da che parte andrebbe
function blockAhead() {
  const h = hero; let best = null, bd = 1e9;
  for (const b of D.blocks) {
    if (b.gone || b.mv) continue;
    const dx = b.x - h.x, dz = b.z - h.z, ax = Math.abs(dx) > Math.abs(dz), along = ax ? Math.abs(dx) : Math.abs(dz), side = ax ? Math.abs(dz) : Math.abs(dx);
    if (along > 10.6 || side > 4.6) continue;
    if (Math.cos(Math.atan2(dz, dx) - h.yaw) < 0.45) continue;                      // bisogna guardarla
    if (along < bd) { bd = along; best = { b, di: ax ? Math.sign(dx) : 0, dj: ax ? 0 : Math.sign(dz) }; }
  }
  return best;
}
function breakPot(p) {
  p.alive = false; puffAt(p.x, p.z, 6, 3); noise(0.2, 0.05); tone(700, 0.05, 'square', 0.03, 300);
  const r = Math.random();
  if (r < 0.35 && hero.hp < MAXHP()) drops.push({ k: 'heart', x: p.x, z: p.z, y: 3, vx: 0, vz: 0, vy: 18, t: 20 });
  else if (r < 0.8) drops.push({ k: 'coin', v: (1 + Math.floor(Math.random() * 4)) * (eqHas('luck') ? 2 : 1), x: p.x, z: p.z, y: 3, vx: (Math.random() - 0.5) * 10, vz: (Math.random() - 0.5) * 10, vy: 18, t: 20 });
}
function hitXtal(x) {
  if (x.cd > 0) return; x.cd = 0.6;
  const ds = dsave(D.id); ds.xs = 1 - ds.xs; seq(ds.xs ? [988, 1318] : [1318, 988], 0.05, 0.06);
  for (let i = 0; i < 6; i++) fx.push({ k: 'glint', x: x.x + (Math.random() - 0.5) * 5, z: x.z + (Math.random() - 0.5) * 5, y: 5 + Math.random() * 4, vy: 6, t: 0.4, s: 0.3 });
}
function hitCrack(i, j) {
  const k = j * D.w + i; D.crk[k] = (D.crk[k] || 0) + 1; puffAt((i + 0.5) * DCS, (j + 0.5) * DCS, 3, 6); tone(160, 0.08, 'square', 0.05, 80);
  if (D.crk[k] >= 3) { D.cell[k] = DT.FLOOR; dsave(D.id).br[k] = 1; dUpload(); puffAt((i + 0.5) * DCS, (j + 0.5) * DCS, 12, 5); noise(0.4, 0.07); jingle(); toast('UN PASSAGGIO SEGRETO!', '#ffd23f'); writeSave(); }
}
function dSwing(reach = 10.5, cosMin = 0.35, o = {}) {
  const h = hero, fx2 = Math.cos(h.yaw), fz2 = Math.sin(h.yaw);
  const front = (x, z, r) => { const dx = x - h.x, dz = z - h.z, d = Math.hypot(dx, dz); return d < r && (o.all || d < 3 || (dx * fx2 + dz * fz2) / d > cosMin); };
  if (!o.noBoss && boss && !boss.hide && front(boss.x, boss.z, reach + boss.r)) bossHit(o.boss || 1);
  for (const p of D.pots) if (p.alive && front(p.x, p.z, reach - 0.5)) breakPot(p);
  for (const x of D.xtals) if (front(x.x, x.z, reach)) hitXtal(x);
  // le crepe: davanti (o tutt'intorno, col colpo rotante)
  let done = false;
  for (const a of o.all ? [0, 1, 2, 3, 4, 5, 6, 7].map(k => h.yaw + k * TAU / 8) : [h.yaw]) { if (done) break; for (const dd of [5, 9]) { const i = Math.floor((h.x + Math.cos(a) * dd) / DCS), j = Math.floor((h.z + Math.sin(a) * dd) / DCS); if (dAt(i, j) === DT.CRACK) { hitCrack(i, j); done = true; break; } } }
}
function openDChest(c) {
  const ds = dsave(D.id); ds.ch[c.key] = 1;
  for (let i = 0; i < 6; i++) fx.push({ k: 'glint', x: c.x + (Math.random() - 0.5) * 6, z: c.z + (Math.random() - 0.5) * 6, y: 4, vy: 6 + Math.random() * 6, t: 1 });
  if (c.kind === 'k' || c.kind === 'q') { ds.keys++; loot = { id: 'chiave', t: 0, note: 'PICCOLE CHIAVI: ' + ds.keys }; jingle(); }
  else if (c.kind === 'K') { droot().big = 1; loot = { id: 'grandeChiave', t: 0, note: D.def.up ? 'APRE LA PORTA DEL GUARDIANO, AL PIANO DI SOPRA' : 'APRE LA PORTA DEL GUARDIANO' }; fanfare(); }
  else if (c.kind === 'C') { openLoot(D.def.item); if (vaultFloor()) { D.portal = vaultPortal(c, false); setTimeout(() => { if (D && D.portal) toast("SULLE RUNE SI È ACCESO UN PORTALE: RIPORTA ALL'APERTO.", '#7af0ff'); }, 2600); } }
  else { const [k, n] = (c.loot || 'monete:20').split(':'); if (k === 'monete') { save.coins += +n; loot = { id: 'monete', txt: n + ' MONETE', t: 0 }; seq([1318, 1760, 2093], 0.06, 0.06); } else openLoot(k, n ? +n : 1); }
  writeSave();
}
function useDoor(d) {
  const ds = dsave(D.id);
  if (d.kind === 'lock') { if (ds.keys > 0) { ds.keys--; ds.open[d.key] = 1; seq([392, 523, 659], 0.06, 0.07); toast('PORTA APERTA!', '#ffd86a'); writeSave(); } else say(null, ['LA PORTA È CHIUSA A CHIAVE. SERVE UNA PICCOLA CHIAVE: CERCALA SU QUESTO PIANO.']); }
  else if (d.kind === 'boss') { if (droot().big) { ds.open[d.key] = 1; seq([262, 330, 392, 523], 0.09, 0.09); writeSave(); } else say(null, ['UNA PORTA ENORME CON UNA SERRATURA DORATA. DA DIETRO ARRIVA UN RESPIRO PROFONDO...', D.def.down ? 'SERVE LA GRANDE CHIAVE: DICONO CHE SIA NASCOSTA AL PIANO DI SOTTO.' : 'SERVE LA GRANDE CHIAVE.']); }
  else if (d.kind === 'seal') say(null, ['UNA LASTRA DI PIETRA CON UN SIGILLO DI LUCE. OLTRE, UNA SCALA SCENDE ANCORA.', 'IL SIGILLO È LEGATO AL GUARDIANO DEL SANTUARIO: SI SPEZZERÀ QUANDO LUI CADRÀ.']);
  else say(null, [D.P.shut[d.g].type === 'plates' ? "LE SBARRE NON SI MUOVONO. DA QUALCHE PARTE C'È UN MECCANISMO..." : 'LE SBARRE SONO CALATE! SCONFIGGI TUTTI I NEMICI DELLA STANZA.']);
}
function solveGroup(g, S) {
  const ds = dsave(D.id); ds.sol[g] = 1; D.trap[g] = false;
  if (S.type === 'kill') ds.clr[S.room] = 1;
  jingle(); toast('SI È APERTO UN PASSAGGIO!', '#9af0b0'); writeSave();
}
function dungeonUpdate(dt) {
  const ds = dsave(D.id), h = hero;
  dRoomCheck();
  if (D.folk) for (const n of D.folk) { const nr = Math.hypot(h.x - n.x, h.z - n.z) < 36 || (dialog && dialog.id === n.id); n.yaw += angDiff(nr ? Math.atan2(h.z - n.z, h.x - n.x) : n.base, n.yaw) * Math.min(1, 4 * dt); }
  // piastre
  for (const p of D.plates) { const was = p.on; p.on = D.blocks.some(b => !b.gone && !b.mv && b.i === p.i && b.j === p.j) || (!p.heavy && !h.fall && Math.floor(h.x / DCS) === p.i && Math.floor(h.z / DCS) === p.j); if (was !== p.on && dt) tone(p.on ? 330 : 220, 0.06, 'square', 0.04); }
  // blocchi colorati e piattaforme
  const on = (i, j) => { const x0 = i * DCS, z0 = j * DCS, inn = (x, z, r) => x + r > x0 && x - r < x0 + DCS && z + r > z0 && z - r < z0 + DCS; return inn(h.x, h.z, 1.6) || foes.some(e => e.st !== 'dead' && inn(e.x, e.z, 2.5)) || D.blocks.some(b => !b.gone && b.i === i && b.j === j); };
  for (const t of D.togs) { const want = (t.c === 'r') === (ds.xs === 0); if (want && !t.up) { if (!on(t.i, t.j)) t.up = true; } else if (!want) t.up = false; D.togUp[t.k] = t.up ? 1 : 0; }
  for (const p of D.plats) D.platUp[p.k] = ((p.c === 'R') === (ds.xs === 0)) ? 1 : 0;
  for (const x of D.xtals) if (x.cd > 0) x.cd -= dt;
  // saracinesche: trappole e meccanismi
  for (const g in D.P.shut) {
    const S = D.P.shut[g]; if (ds.sol[g]) continue;
    if (S.type === 'kill') {
      const alive = foes.some(e => e.room === S.room && e.st !== 'dead');
      if (!alive) { solveGroup(g, S); continue; }
      if (!D.trap[g] && D.room === S.room) {
        let far = true; for (const d of D.doors) if (d.kind === 'shut' && d.g === +g) for (const [i, j] of d.cells) { const cx = Math.max(i * DCS, Math.min(h.x, i * DCS + DCS)), cz = Math.max(j * DCS, Math.min(h.z, j * DCS + DCS)); if (Math.hypot(h.x - cx, h.z - cz) < 3.2) far = false; }
        if (far) { D.trap[g] = true; tone(150, 0.3, 'sawtooth', 0.05, 90); toast('TRAPPOLA! SCONFIGGI TUTTI I NEMICI', '#ff8a5a'); }
      }
    } else { const pl = D.plates.filter(p => p.room === S.room); if (pl.length && pl.every(p => p.on)) solveGroup(g, S); }
  }
  for (const g in D.trap) if (D.trap[g]) { const R = D.P.shut[g].room, rm = D.P.rooms[R]; for (const e of foes) if (e.room === R && e.st !== 'dead' && dRoomAt(e.x, e.z) !== R) { e.x = rm.x; e.z = rm.z; puffAt(e.x, e.z, 5); } }
  // porte
  for (const d of D.doors) {
    let open;
    if (d.kind === 'open') open = true;
    else if (d.kind === 'lock') open = !!ds.open[d.key];
    else if (d.kind === 'boss') open = !!ds.open[d.key] && !(boss && boss.on && !boss.dead);
    else if (d.kind === 'seal') open = !!droot().boss;
    else open = !!ds.sol[d.g] || (D.P.shut[d.g].type === 'kill' && !D.trap[d.g]);
    if (d.anim < 0) d.anim = open ? 1 : 0;
    else { d.anim = Math.max(0, Math.min(1, d.anim + (open ? dt * 2 : -dt * 5))); if (open !== d.was && dt) { if (open) seq([330, 392], 0.06, 0.06); else noise(0.25, 0.06); } }
    d.was = open;
    const pass = d.anim > 0.8; for (const [i, j] of d.cells) D.doorOpen[j * D.w + i] = pass ? 1 : 0;
  }
  // forzieri che compaiono a stanza ripulita
  for (const c of D.chests) if (c.hidden && !foes.some(e => e.room === c.room && e.st !== 'dead')) { c.hidden = false; puffAt(c.x, c.z, 8, 2); jingle(); toast('È COMPARSO UN FORZIERE!', '#ffd23f'); }
  blocksUpdate(dt);
  // statue che sputano
  for (const t of D.turrets) {
    if (t.fl > 0) t.fl -= dt;
    if (D.room !== t.room || h.dead || st !== 'play') continue;
    const d = Math.hypot(h.x - t.x, h.z - t.z); if (d > 150) continue;
    t.yaw = Math.atan2(h.z - t.z, h.x - t.x); t.t -= dt;
    if (t.t <= 0) { t.t = 2.6; t.fl = 0.3; shoot(D.def.shot, t.x, t.z, t.yaw, 38, 2, t, { x: t.x + Math.cos(t.yaw) * 6, z: t.z + Math.sin(t.yaw) * 6 }); tone(300, 0.1, 'sawtooth', 0.04, 150); }
  }
  hazardsUpdate(dt);
  bossUpdate(dt);
  // premi del guardiano
  if (D.heartP && Math.hypot(h.x - D.heartP.x, h.z - D.heartP.z) < 5 && !loot) { D.heartP = null; ds.heart = 1; openLoot('cuore'); }
  if (D.portal && D.portal.arm === false && Math.hypot(h.x - D.portal.x, h.z - D.portal.z) > 12) D.portal.arm = true;
  if (D.portal && D.portal.arm !== false && !fade && Math.hypot(h.x - D.portal.x, h.z - D.portal.z) < 6.5 && st === 'play' && !loot && !dialog) { seq([523, 784, 1047, 1568], 0.07, 0.08); startFade(() => exitDungeon()); }
  if (quake > 0) quake = Math.max(0, quake - dt * 1.6);
}
function hazardsUpdate(dt) {
  for (const z of hazards) {
    if (z.warn > 0) { z.warn -= dt; if (z.warn <= 0) strike(z); continue; }
    z.life = (z.life || 0) - dt;
    if (z.k === 'fire' && z.life > 0) { if (Math.random() < 0.35) fx.push({ k: 'ember', x: z.x + (Math.random() - 0.5) * z.r * 1.6, z: z.z + (Math.random() - 0.5) * z.r * 1.6, y: 0.5, vy: 10, t: 0.4, s: 0.45 }); if (Math.hypot(hero.x - z.x, hero.z - z.z) < z.r && !fireProof()) hurtHero(z.dmg, null, true); }
  }
  hazards = hazards.filter(z => z.warn > 0 || z.life > 0);
}
function strike(z) {
  const inside = Math.hypot(hero.x - z.x, hero.z - z.z) < z.r && !hero.fall;
  if (z.k === 'slam') { quake = 0.7; noise(0.4, 0.09); tone(55, 0.4, 'sawtooth', 0.07, 30); ringFx(z.x, z.z, z.r * 0.6); ringFx(z.x, z.z, z.r); if (inside) hurtHero(z.dmg, z, true); }
  else if (z.k === 'rock') { puffAt(z.x, z.z, 6, 2); fx.push({ k: 'rockfx', x: z.x, z: z.z, y: 3, vy: 6, t: 0.4, s: 0.6 }); tone(120, 0.15, 'square', 0.05, 60); if (inside) hurtHero(z.dmg, null, true); }
  else if (z.k === 'spike') { for (let i = 0; i < 6; i++) fx.push({ k: 'icefx', x: z.x + (Math.random() - 0.5) * z.r, z: z.z + (Math.random() - 0.5) * z.r, y: 1, vy: 16 + Math.random() * 8, t: 0.45, s: 0.6 }); tone(1500, 0.1, 'square', 0.04, 700); if (inside) hurtHero(z.dmg, null, true); }
  else if (z.k === 'erupt') { quake = 0.6; ringFx(z.x, z.z, z.r * 0.7); noise(0.35, 0.08); if (inside) hurtHero(z.dmg, z, true); }
}

// ---------- proiettili (statue, piante, guardiani, raggio della lama del sole) ----------
// una preda colpita: cade, lascia la pelle (qualche moneta) e a volte un boccone che rimette in forze; conta per le battute di caccia
function preda(a) {
  const gy = Math.max(gH(a.x, a.z), W.WL), S = a.S;
  puffAt(a.x, a.z, 7, gy + 1.5); for (let i = 0; i < 5; i++) fx.push({ k: 'glint', x: a.x + (Math.random() - 0.5) * 4, z: a.z + (Math.random() - 0.5) * 4, y: gy + 2 + Math.random() * 3, vy: 6 + Math.random() * 5, t: 0.4, s: 0.26 });
  tone(520, 0.07, 'triangle', 0.05, 260); tone(784, 0.1, 'square', 0.03, null, 0.07); vib(25);
  fauna.fell(a, hero.x, hero.z);
  drops.push({ k: 'coin', v: Math.max(1, Math.round(S.r * a.sc * 2)) * (eqHas('luck') ? 2 : 1), x: a.x, z: a.z, y: gy + 2, vx: (Math.random() - 0.5) * 10, vz: (Math.random() - 0.5) * 10, vy: 18, t: 30 });
  if (hero.hp < MAXHP() && Math.random() < 0.4) drops.push({ k: 'heart', x: a.x, z: a.z, y: gy + 2, vx: 0, vz: 0, vy: 22, t: 30 });
  if (!jobHunt(a.k)) toast('PREDA: ' + S.n.toUpperCase(), '#9af0b0');
}
function poof(s) { s.dead = true; for (let i = 0; i < 3; i++) fx.push({ k: s.k === 'fire' ? 'ember' : s.k === 'bubble' ? 'drop' : 'spark', x: s.x, z: s.z, y: s.y, vy: 6 + Math.random() * 6, t: 0.3, s: 0.35 }); }
function shotsUpdate(dt) {
  for (const s of shots) {
    if (s.dead) continue;
    // frecce e dardi dell'eroe piegano un poco verso il bersaglio
    if (s.cls && s.turn && s.tg && s.tg.st !== 'dead' && !s.tg.dead && !s.tg.hide) { const sp = Math.hypot(s.vx, s.vz); s.yaw += Math.max(-s.turn * dt, Math.min(s.turn * dt, angDiff(Math.atan2(s.tg.z - s.z, s.tg.x - s.x), s.yaw))); s.vx = Math.cos(s.yaw) * sp; s.vz = Math.sin(s.yaw) * sp; }
    s.px = s.x; s.pz = s.z; s.life -= dt; s.x += s.vx * dt; s.z += s.vz * dt;
    if (s.life <= 0) { if (s.patch) hazards.push({ x: s.x, z: s.z, r: 6, warn: 0, life: 3.2, dmg: 2, k: 'fire' }); if (s.cls) shotEnd(s); if (s.k === 'arrow' && s.cls && !D) fauna.startle(s.x, s.z, 24, hero.x, hero.z); s.dead = true; continue; }
    if (s.from === 'hero' && D) { let hitX = false; for (const x of D.xtals) if (Math.hypot(x.x - s.x, x.z - s.z) < 5) { hitXtal(x); if (s.cls) shotEnd(s); poof(s); hitX = true; break; } if (hitX) continue; }
    let wall;
    if (D) wall = dBlocks(Math.floor(s.x / DCS), Math.floor(s.z / DCS), 'shot') || D.blocks.some(b => !b.gone && Math.abs(s.x - b.x) < 4.6 && Math.abs(s.z - b.z) < 4.6) || D.solids.some(o => (!o.on || o.on()) && Math.hypot(s.x - o.x, s.z - o.z) < o.r * 0.85);
    else if (s.cls) { const g = Math.max(W.ground(s.x, s.z), W.WL); wall = g - s.gy > 5.5 || !!W.inBox(s.x, s.z, 0); if (!wall) { s.gy = g; s.y = g + 4.6; } }      // seguono il terreno: le ferma solo una casa o una rupe
    else wall = W.ground(s.x, s.z) > s.y + 1 || !!W.inBox(s.x, s.z, 0);
    if (wall) { if (s.cls) { shotWall(s); shotEnd(s); } poof(s); continue; }
    if (s.from === 'foe') {
      const d = Math.hypot(hero.x - s.x, hero.z - s.z);
      if (d < s.r + 2.2 && !hero.dead && !hero.fall) {
        if ((canReflect() || (perfetta() && !s.rosso && (toast('PARATA PERFETTA!', '#ffe14a'), true))) && hero.atk <= 0 && Math.cos(Math.atan2(s.z - hero.z, s.x - hero.x) - hero.yaw) > 0.45) {
          const src = s.src, a = src ? Math.atan2(src.z - s.z, src.x - s.x) : Math.atan2(-s.vz, -s.vx), sp = Math.hypot(s.vx, s.vz) * 1.35;
          s.vx = Math.cos(a) * sp; s.vz = Math.sin(a) * sp; s.from = 'hero'; s.life = 3; s.refl = true; s.dmg = Math.max(2, s.dmg); s.patch = false;
          tone(1568, 0.06, 'square', 0.05); for (let i = 0; i < 4; i++) fx.push({ k: 'spark', x: s.x, z: s.z, y: s.y, vy: 8, t: 0.25, s: 0.35 });
        } else { hurtHero(s.dmg, s, s.hard); poof(s); }
      }
    } else if (s.cls) {
      // i colpi delle classi: possono trapassare, congelare, esplodere
      for (const e of foes) {
        if (e.st === 'dead' || (s.seen && s.seen.has(e)) || Math.hypot(e.x - s.x, e.z - s.z) >= FOE[e.type].r + s.r) continue;
        e.rage = 6; if (!s.boomOnly) { forzaOra = MODO && s.pow ? 3 : 0; hitFoe(e, s.dmg, Math.atan2(s.vz, s.vx)); forzaOra = 0; if (s.frz) freeze(e, s.frz); }
        if (s.pierce) { (s.seen || (s.seen = new Set())).add(e); continue; }
        shotEnd(s, e); poof(s); break;
      }
      // una freccia che incontra la selvaggina (e quella che le passa accanto fa scappare il branco)
      if (!s.dead && !D && s.k === 'arrow') fauna.startle(s.x - Math.cos(s.yaw) * 10, s.z - Math.sin(s.yaw) * 10, 12, hero.x, hero.z);
      if (!s.dead && !D && s.k === 'arrow') { const a = fauna.strike(s.px, s.pz, s.x, s.z, s.r + 0.6); if (a) { preda(a); if (!s.pierce) { poof(s); continue; } } }
      if (!s.dead && boss && !boss.hide && !boss.dead && boss.on && boss.st !== 'die' && !(s.seen && s.seen.has(boss)) && Math.hypot(boss.x - s.x, boss.z - s.z) < boss.r + s.r + 2) {
        if (!s.boomOnly && !(s.pow && classStun())) bossHit(boss.vuln ? (s.bossD || 1) : 0, true);
        if (s.pierce) (s.seen || (s.seen = new Set())).add(boss); else { shotEnd(s, boss); poof(s); }
      }
    } else {
      for (const e of foes) if (e.st !== 'dead' && Math.hypot(e.x - s.x, e.z - s.z) < FOE[e.type].r + s.r) { hitFoe(e, s.dmg, Math.atan2(s.vz, s.vx)); poof(s); break; }
      if (!s.dead && boss && !boss.hide && !boss.dead && boss.on && boss.st !== 'die' && Math.hypot(boss.x - s.x, boss.z - s.z) < boss.r + s.r + 2) {
        if (!stunBoss(boss) && boss.vuln) bossHit(1); else if (!boss.vuln) bossHit(0);
        poof(s);
      }
    }
  }
  shots = shots.filter(s => !s.dead);
}

// ---------- disegno ----------
function pushBB2(x, y, z, r, s, k = 1, fl = 0, tint) {
  if (!r) return; const n = pushBB2.n; if (n >= 1500) return;
  const w = r.w * s * (r.f || 1), h = r.h * s * (r.f || 1); let p = n * 44;
  const tr = tint ? tint[0] : k, tg = tint ? tint[1] : k, tb = tint ? tint[2] : k;
  const C = [-w / 2, 0, r.u0, r.v1, w / 2, 0, r.u1, r.v1, w / 2, h, r.u1, r.v0, -w / 2, h, r.u0, r.v0];
  for (let i = 0; i < 16; i += 4) { dynF2[p++] = x; dynF2[p++] = y; dynF2[p++] = z; dynF2[p++] = C[i]; dynF2[p++] = C[i + 1]; dynF2[p++] = C[i + 2]; dynF2[p++] = C[i + 3]; dynF2[p++] = tr; dynF2[p++] = tg; dynF2[p++] = tb; dynF2[p++] = fl; }
  pushBB2.n = n + 1;
}
pushBB2.n = 0;
const LP = new Float32Array(40), LC = new Float32Array(30);
function dLights() {
  const ds = dsave(D.id), cand = [];
  for (const l of D.lights) { const d2 = (l.x - hero.x) ** 2 + (l.z - hero.z) ** 2; if (d2 < 180 * 180) cand.push([d2, l]); }
  for (const g of [D.gem, D.portal]) if (g) cand.push([0, { x: g.x, y: 8, z: g.z, r: 70, c: hexf(D.def.glow) }]);
  cand.sort((a, b) => a[0] - b[0]);
  LP.fill(0); LC.fill(0);
  const lt = D.def.casa ? 0.3 : eqHas('light') ? 1.7 : 1;      // in bottega la luce c'è già: la lanterna dell'eroe quasi non serve
  LP[0] = hero.x; LP[1] = hero.y + 9; LP[2] = hero.z; LP[3] = 48 * lt; LC[0] = 0.44 * lt; LC[1] = 0.41 * lt; LC[2] = 0.36 * lt;
  let n = 1;
  for (const [, l] of cand) {
    if (n >= 10) break;
    const f = (l.flick ? 0.86 + 0.14 * Math.sin(time * 13 + l.x * 0.7) : 1) * (l.day ? Math.max(0.1, 1 - day.night) : 1), c = l.xt ? (ds.xs ? [0.35, 0.55, 1.2] : [1.2, 0.35, 0.35]) : l.c;
    LP[n * 4] = l.x; LP[n * 4 + 1] = l.y; LP[n * 4 + 2] = l.z; LP[n * 4 + 3] = l.r; LC[n * 3] = c[0] * f; LC[n * 3 + 1] = c[1] * f; LC[n * 3 + 2] = c[2] * f; n++;
  }
}
function buildDynMesh() {
  const a = [];
  for (const d of D.doors) {
    if (d.kind === 'open' || d.anim >= 0.999) continue;
    const tile = d.kind === 'lock' ? 31 : d.kind === 'boss' ? 32 : d.kind === 'seal' ? 58 : 33, k = d.anim;
    const y0 = d.kind === 'shut' ? k * DS.DH : -k * DS.DH, y1 = Math.min(DS.WH - 0.3, y0 + DS.DH);
    for (const [i, j] of d.cells) { const x0 = i * DCS, z0 = j * DCS; if (d.axis === 'x') DS.boxTo(a, x0, z0 + 3.8, x0 + DCS, z0 + 6.2, y0, y1, tile); else DS.boxTo(a, x0 + 3.8, z0, x0 + 6.2, z0 + DCS, y0, y1, tile); }
  }
  for (const t of D.togs) { const x0 = t.i * DCS, z0 = t.j * DCS; if (t.up) DS.boxTo(a, x0 + 0.4, z0 + 0.4, x0 + DCS - 0.4, z0 + DCS - 0.4, 0, 6, t.c === 'r' ? 37 : 38); else DS.flatTo(a, x0, z0, x0 + DCS, z0 + DCS, 0.05, t.c === 'r' ? 39 : 40); }
  for (const p of D.plats) if (D.platUp[p.k]) { const x0 = p.i * DCS, z0 = p.j * DCS; DS.boxTo(a, x0 + 0.3, z0 + 0.3, x0 + DCS - 0.3, z0 + DCS - 0.3, -4, 0, 42, p.c === 'R' ? 37 : 38); }
  for (const b of D.blocks) if (!b.gone) DS.boxTo(a, b.x - 4.6, b.z - 4.6, b.x + 4.6, b.z + 4.6, 0, 9.2, 36);
  for (const p of D.plates) { const x0 = p.i * DCS, z0 = p.j * DCS; DS.flatTo(a, x0 + 1, z0 + 1, x0 + DCS - 1, z0 + DCS - 1, p.on ? 0.06 : 0.3, p.heavy ? 46 : p.on ? 35 : 34); }
  dmN = Math.min(900, a.length / 32); dmF.set(a.length > dmF.length ? a.slice(0, dmF.length) : a);
}
const RK = { k: 0, q: 0, c: 1, Q: 1, K: 2, C: 3 };
function buildDynamicD() {
  const ds = dsave(D.id), R = 0.2 / SR, h = hero;
  if (h && (st === 'play' || st === 'dead')) {
    drawHero(R);
  }
  for (const e of foes) drawFoe(e);
  const b = boss;
  if (b && !b.hide && DCH.boss) {
    const blink = b.st === 'die' && Math.floor(time * 14) % 2;
    pushBB2(b.x, b.y - 0.6, b.z, DCH.boss[Math.min(b.pose, DCH.boss.length - 1)][dirOf(b.x, b.z, b.yaw)], b.B.bs / SR, 1, b.flash > 0 || blink ? 0.85 : 0);
    if (b.vuln) for (let k = 0; k < 3; k++) { const a = time * 4 + k * TAU / 3; pushBB(b.x + Math.cos(a) * 6, b.y + (b.B.h * b.B.bs) * 0.75, b.z + Math.sin(a) * 6, SPR.spark, 0.28, 1.2); }
  }
  for (const t of D.torches) { pushBB2(t.x, 0, t.z, DSP.brazier, 0.2); pushBB(t.x, 5.4, t.z, SPR.flame[Math.floor(time * 8 + t.x) % 2], 0.23, 1.2, 0, D.def.flame); }
  for (const o of D.decor) {
    if (o.c === '$') { pushBB2(o.x, 0, o.z, DSP.gold, 0.2, 1.12); if (Math.floor(time * 2.2 + o.ph) % 5 === 0) pushBB(o.x + Math.sin(o.ph * 3 + time) * 2.2, 2.6 + (o.ph % 3), o.z, SPR.glint, 0.24, 1.2); }
    else if (o.c === '*') pushBB2(o.x, 0, o.z, DSP.cluster, 0.2, 1.15 + 0.1 * Math.sin(time * 2 + o.ph));
    else if (o.c === 'A') pushBB2(o.x, 0, o.z, DSP.statue[dirOf(o.x, o.z, o.yaw)], 0.25 / SR);
    else pushBB2(o.x, 0, o.z, DSP.bones, 0.2);
  }
  if (DSP.clut) for (const o of D.clutter) { if (Math.abs(o.x - hero.x) > 150 || Math.abs(o.z - hero.z) > 150) continue; if (o.st) { pushBB2(o.x, 2.8, o.z, DSP.statue[dirOf(o.x, o.z, o.yaw)], 0.25 / SR); continue; } const L = DSP.clut[o.set]; if (L) pushBB2(o.x, 0, o.z, L[o.k], 0.2); }
  if (D.sprs) for (const p of D.sprs) {
    if (p.fl) { pushBB(p.x, p.y, p.z, SPR.flame[Math.floor(time * 8 + p.x) % 2], p.s || 0.4, 1.2); continue; }
    const S2 = SPR[p.k]; if (!S2) continue; pushBB(p.x, p.y, p.z, S2.r[Math.min(p.v, S2.r.length - 1)], p.s || S2.s);
    if (p.lux && Math.floor(time * 2.2 + p.x) % 4 === 0) pushBB(p.x + Math.sin(time * 1.7 + p.x) * 1.2, p.y + 2.6, p.z, SPR.glint, 0.24, 1.2);
  }
  if (D.folk) for (const n of D.folk) { const sh = CHR[n.id]; if (sh) pushBB(n.x, n.y - 0.5, n.z, sh[0][dirOf(n.x, n.z, n.yaw)], R); }
  for (const p of amb) { const L = SPR[p.k].length ? SPR[p.k] : [SPR[p.k]]; if (p.k === 'fly' && Math.sin(p.ph * 3 + p.v * 20) < -0.1) continue; pushBB(p.x, p.y, p.z, L[Math.floor(p.v * L.length) % L.length], p.k === 'dust' ? 0.4 : p.k === 'ember' ? 0.2 + 0.12 * p.v : 0.3, p.k === 'fly' || p.k === 'ember' ? 1.4 : 1.1); }
  for (const p of D.pots) if (p.alive) pushBB2(p.x, 0, p.z, DSP.pot, 0.2);
  for (const t of D.turrets) pushBB2(t.x, 0, t.z, DSP.turret[dirOf(t.x, t.z, t.yaw)], 0.4 / SR, t.fl > 0 ? 1.3 : 1);
  for (const x of D.xtals) pushBB2(x.x, 0, x.z, DSP.xtal[ds.xs], 0.2, 1.12, x.cd > 0.3 ? 0.6 : 0);
  for (const s of D.signs) pushBB2(s.x, 0, s.z, DSP.lapide, 0.2);
  for (const c of D.chests) if (!c.hidden) { pushBB(c.x, -0.3, c.z, CHR.chest[RK[c.kind]][ds.ch[c.key] ? 1 : 0][dirOf(c.x, c.z, c.yaw)], (c.kind === 'C' ? 0.32 : 0.25) / SR); if (!ds.ch[c.key] && (c.kind === 'C' || c.kind === 'K') && Math.floor(time * 3 + c.x) % 4 === 0) pushBB(c.x + Math.sin(time * 5) * 2, 7, c.z, SPR.glint, 0.3, 1.2); }
  if (D.gem) { pushBB2(D.gem.x, 3 + Math.sin(time * 2.5) * 1.2, D.gem.z, DSP.gem, 0.2, 1.3); if (Math.floor(time * 4) % 2) pushBB(D.gem.x + Math.sin(time * 3) * 3, 9, D.gem.z, SPR.glint, 0.3, 1.2); }
  if (D.portal) pushBB2(D.portal.x, 0, D.portal.z, DSP[D.portal.s ? 'portalS' : 'portal'][Math.floor(time * 6) % 2], D.portal.s || 0.2, 1.3);
  if (D.heartP) pushBB(D.heartP.x, 3 + Math.sin(time * 3), D.heartP.z, SPR.heart, 1, 1.25);
  for (const p of drops) pushBB(p.x, p.y, p.z, p.k === 'coin' ? SPR.coin : SPR.heart, 0.4, 1.15);
  for (const p of fx) pushBB(p.x, p.y, p.z, SPR[p.k], (p.s || 0.3) * (p.k === 'puff' ? 0.6 + p.t : 1), 1.1);
  for (const s of shots) drawShot(s);
  drawThings();
  drawAim();
}
function projectPt(x, y, z) {
  const m = VP, w = m[3] * x + m[7] * y + m[11] * z + m[15]; if (w <= 0.1) return null;
  return [((m[0] * x + m[4] * y + m[8] * z + m[12]) / w * 0.5 + 0.5) * W3, ((m[1] * x + m[5] * y + m[9] * z + m[13]) / w * 0.5 + 0.5) * H3];
}
function renderDungeon() {
  const P = G.P, fogC = D.fogC, fogN = 95, fogF = 270, ambK = D.def.casa ? 1 - 0.24 * day.night : 1;       // di notte le botteghe vivono dei loro lumi
  gl.viewport(0, 0, W3, H3);
  gl.clearColor(fogC[0], fogC[1], fogC[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const q = quake, qx = q ? (Math.random() - 0.5) * q * 2.4 : 0, qy = q ? (Math.random() - 0.5) * q * 2.4 : 0;
  const proj = SG.M4.persp(FOV, W3 / H3, 1.2, 420), view = SG.M4.look([cam.x + qx, cam.y + qy, cam.z], [cam.tx + qx, cam.ty + qy, cam.tz], [0, 1, 0]);
  VP = SG.M4.mul(proj, view);
  const yaw = Math.atan2(cam.tz - cam.z, cam.tx - cam.x); RX = -Math.sin(yaw); RZ = Math.cos(yaw);
  dLights();
  const hp = st === 'play' || st === 'dead' ? projectPt(hero.x, hero.y + 3, hero.z) : null;
  // finestra pulita nelle pareti davanti all'eroe: tutto ciò che è più vicino dei suoi piedi, dentro il cerchio
  const cut = hp ? [hp[0], hp[1], H3 * 0.21, Math.hypot(cam.x - hero.x, cam.y - hero.y, cam.z - hero.z) - 1] : [0, 0, 0, 0];
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);
  let p = P.dmesh; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform2f(p.u.uTiles, 8, 48);
  gl.uniform4fv(p.u.uLp, LP); gl.uniform3fv(p.u.uLc, LC); gl.uniform1f(p.u.uAmb, (D.def.amb + 0.05) * ambK);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TILES); gl.uniform1i(p.u.uTex, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  gl.uniform1f(p.u.uGhost, 0);
  const drawMesh = (buf, n, cutOn) => { if (!n) return; gl.uniform4f(p.u.uCut, cut[0], cut[1], cutOn ? cut[2] : 0, cut[3]); gl.bindBuffer(gl.ARRAY_BUFFER, buf); for (let q0 = 0; q0 < n; q0 += 16000) { G.attribs(p, [['aPos', 3], ['aT', 2], ['aL', 2], ['aSh', 1]], q0 * 4 * 32); gl.drawElements(gl.TRIANGLES, Math.min(16000, n - q0) * 6, gl.UNSIGNED_SHORT, 0); } };
  drawMesh(D.gl.floor, D.gl.nf, false);
  drawMesh(D.gl.wall, D.gl.nw, true);
  drawMesh(D.gl.deco, D.gl.nd, true);   // l'arredo dei muri: solo qui, non nella passata delle pareti trasparenti
  dmN = 0; buildDynMesh();
  if (dmN) { gl.bindBuffer(gl.ARRAY_BUFFER, dmBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dmF.subarray(0, dmN * 32)); drawMesh(dmBuf, dmN, true); }
  // ombre e segnali rossi a terra
  shN = 0;
  if (st === 'play' || st === 'dead') if (!hero.fall) pushShadow(hero.x, hero.z, 2.6, hero.y);
  for (const e of foes) if (e.st !== 'dead') pushShadow(e.x, e.z, FOE[e.type].r * 0.8, e.y - (FOE[e.type].fly || 0));
  if (D.folk) for (const n of D.folk) pushShadow(n.x, n.z, 2.5, n.y);
  if (boss && !boss.hide) pushShadow(boss.x, boss.z, boss.r * 0.9, 0);
  p = P.shadow; gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP, false, VP);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  const decal = (n, col, inn) => { gl.uniform4f(p.u.uCol, col[0], col[1], col[2], col[3]); gl.uniform1f(p.u.uIn, inn); gl.bindBuffer(gl.ARRAY_BUFFER, shBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, shF.subarray(0, n * 20)); G.attribs(p, [['aPos', 3], ['aUV', 2]]); gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, 0); };
  if (shN) decal(shN, [0.02, 0.02, 0.04, 0.45], 0);
  shN = 0; for (const z of hazards) if (z.warn > 0) pushShadow(z.x, z.z, z.r, gH(z.x, z.z) + 0.1);
  if (shN) { decal(shN, [1, 0.15, 0.08, 0.16 + 0.25 * (Math.floor(time * 10) % 2)], 0); decal(shN, [1, 0.3, 0.15, 0.7], 0.86); }
  shN = 0; for (const z of hazards) if (z.k === 'fire' && z.life > 0) pushShadow(z.x, z.z, z.r, 0.1);
  if (shN) decal(shN, [1, 0.45, 0.1, 0.35], 0);
  gl.disable(gl.POLYGON_OFFSET_FILL); gl.depthMask(true); gl.disable(gl.BLEND);
  // sprite: atlante principale e atlante del santuario
  p = P.dbb; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3f(p.u.uR, RX, 0, RZ); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC);
  gl.uniform4fv(p.u.uLp, LP); gl.uniform3fv(p.u.uLc, LC); gl.uniform1f(p.u.uAmb, (D.def.amb + 0.08) * ambK);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  pushBB.n = 0; pushBB2.n = 0; buildDynamicD();
  gl.activeTexture(gl.TEXTURE0); gl.uniform1i(p.u.uTex, 0);
  if (pushBB.n) { gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynF.subarray(0, pushBB.n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, pushBB.n * 6, gl.UNSIGNED_SHORT, 0); }
  if (pushBB2.n) { gl.bindTexture(gl.TEXTURE_2D, DTEX); gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf2); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynF2.subarray(0, pushBB2.n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, pushBB2.n * 6, gl.UNSIGNED_SHORT, 0); }
  // acqua e lava
  p = P.dwater; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform1f(p.u.uTime, time);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, DET); gl.uniform1i(p.u.uDet, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  if (D.gl.nwa) { gl.uniform1f(p.u.uY, -1); gl.uniform3fv(p.u.uWat, hexf(D.def.water)); gl.uniform3f(p.u.uHi, 0.85, 0.95, 1); gl.uniform1f(p.u.uA, 0.7); gl.uniform1f(p.u.uLight, 0.75); gl.bindBuffer(gl.ARRAY_BUFFER, D.gl.water); G.attribs(p, [['aP', 2]]); gl.drawElements(gl.TRIANGLES, D.gl.nwa * 6, gl.UNSIGNED_SHORT, 0); }
  if (D.gl.nl) { gl.uniform1f(p.u.uY, -0.6); gl.uniform3f(p.u.uWat, 1, 0.38, 0.08); gl.uniform3f(p.u.uHi, 1, 0.92, 0.45); gl.uniform1f(p.u.uA, 1); gl.uniform1f(p.u.uLight, 1.2); gl.bindBuffer(gl.ARRAY_BUFFER, D.gl.lava); G.attribs(p, [['aP', 2]]); gl.drawElements(gl.TRIANGLES, D.gl.nl * 6, gl.UNSIGNED_SHORT, 0); }
  // aloni che si sommano al colore: fiamme, cristalli, tesori, scale, sigilli
  { let n = 0; const ds = dsave(D.id), tc = D.def.torch, gc = hexf(D.def.glow);
    const halo = (x, y, z, r, c, it) => { if (n >= 160 || (x - hero.x) ** 2 + (z - hero.z) ** 2 > 230 * 230) return; let q = n * 44; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { glowF[q++] = x; glowF[q++] = y; glowF[q++] = z; glowF[q++] = a * r; glowF[q++] = b * r; glowF[q++] = a; glowF[q++] = b; glowF[q++] = c[0]; glowF[q++] = c[1]; glowF[q++] = c[2]; glowF[q++] = it; } n++; };
    for (const t of D.torches) halo(t.x, 7, t.z, 11, tc, 0.3 + 0.05 * Math.sin(time * 11 + t.x));
    if (D.lumi) for (const l of D.lumi) if (l.halo) halo(l.x, l.y, l.z, l.halo, l.hc, 0.24 + (l.flick ? 0.05 * Math.sin(time * 11 + l.x) : 0));
    for (const o of D.decor) if (o.c === '*') halo(o.x, 3.5, o.z, 10, gc, 0.3 + 0.08 * Math.sin(time * 2 + o.ph)); else if (o.c === '$') halo(o.x, 2, o.z, 6, [1, 0.8, 0.3], 0.16);
    for (const x of D.xtals) halo(x.x, 4, x.z, 8, ds.xs ? [0.35, 0.55, 1.2] : [1.2, 0.35, 0.35], 0.34);
    for (const c of D.chests) if (!c.hidden && !ds.ch[c.key] && (c.kind === 'C' || c.kind === 'K')) halo(c.x, 3, c.z, 12, [1, 0.78, 0.3], 0.3 + 0.1 * Math.sin(time * 3));
    if (D.P.stairs) halo(D.P.stairs.cx, 4, D.P.stairs.cz, 13, gc, 0.3);
    for (const d of D.doors) if (d.kind === 'seal' && d.anim < 0.9) halo(d.cx, 6, d.cz, 12, [0.45, 0.95, 1], 0.32 + 0.1 * Math.sin(time * 2.4));
    for (const g of [D.gem, D.portal]) if (g) halo(g.x, 6, g.z, 16, gc, 0.4);
    if (n) { p = P.glow; gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3f(p.u.uR, RX, 0, RZ); gl.uniform2f(p.u.uFog, fogN, fogF);
      gl.blendFunc(gl.ONE, gl.ONE); gl.bindBuffer(gl.ARRAY_BUFFER, glowBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowF.subarray(0, n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, 0); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } }
  // pareti tra la telecamera e l'eroe: trasparenti e pulite (seconda passata)
  p = P.dmesh; gl.useProgram(p.p); gl.uniform1f(p.u.uGhost, 1);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TILES); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  drawMesh(D.gl.wall, D.gl.nw, true); if (dmN) { gl.bindBuffer(gl.ARRAY_BUFFER, dmBuf); drawMesh(dmBuf, dmN, true); }
  gl.uniform1f(p.u.uGhost, 0);
  gl.depthMask(true); gl.disable(gl.BLEND);
}
function drawDungeonMap() {
  const ds = dsave(D.id);
  hg.fillStyle = 'rgba(8,10,16,.9)'; hg.fillRect(0, 0, Wr, Hr);
  const tag = floorTag(D.def), rt = droot();
  T(D.def.name + (tag ? ' - ' + tag : ''), Wr / 2, 5, '#ffd23f', 1, 'center');
  const s = Math.max(2, Math.floor(Math.min((Wr - insetL - insetR - 16) / D.w, (Hr - 36) / D.h))), x0 = Math.round(Wr / 2 - D.w * s / 2), y0 = 16;
  const COL = { [DT.WALL]: '#5a6478', [DT.CRACK]: '#5a6478', [DT.FLOOR]: '#26304a', [DT.PIT]: '#06070c', [DT.WATER]: '#2a5a9a', [DT.LAVA]: '#c8501a', [DT.ICE]: '#7ab8d8', [DT.SPIKE]: '#6a6a7a', [DT.BRIDGE]: '#7a5a3a', [DT.EXIT]: '#fff4b0', [DT.STAIR]: '#7af0ff', [DT.TOGB]: '#26304a', [DT.PLAT]: '#06070c', [DT.DOOR]: '#26304a' };
  for (let j = 0; j < D.h; j++) for (let i = 0; i < D.w; i++) { const k = j * D.w + i; if (!D.seen[k]) continue; const c = COL[D.cell[k]]; if (!c) continue; hg.fillStyle = D.P.room[k] === D.P.bossRoom && D.cell[k] === DT.FLOOR ? '#3a2430' : c; hg.fillRect(x0 + i * s, y0 + j * s, s, s); }
  for (const d of D.doors) { if (!d.cells.some(([i, j]) => D.seen[j * D.w + i])) continue; const open = d.anim > 0.8; hg.fillStyle = open ? '#3a4a68' : d.kind === 'lock' ? '#ffc83a' : d.kind === 'boss' ? '#ff6a5a' : d.kind === 'seal' ? '#3ab8e0' : '#a8a8b8'; for (const [i, j] of d.cells) hg.fillRect(x0 + i * s, y0 + j * s, s, s); }
  const dot = (x, z, c, r = 1) => { hg.fillStyle = c; hg.fillRect(Math.round(x0 + x / DCS * s) - r, Math.round(y0 + z / DCS * s) - r, r * 2 + 1, r * 2 + 1); };
  for (const c of D.chests) if (!c.hidden && !ds.ch[c.key] && D.seen[c.j * D.w + c.i]) dot(c.x, c.z, c.kind === 'C' ? '#ffb02e' : c.kind === 'K' ? '#ff6a5a' : '#ffd86a', c.kind === 'C' || c.kind === 'K' ? 2 : 1);
  if (D.P.bossAt && (rt.big || D.seen[D.P.bossAt.j * D.w + D.P.bossAt.i]) && !ds.done && Math.floor(time * 3) % 2) dot(D.P.bossAt.x, D.P.bossAt.z, '#ff3a3a', 2);
  // le scale lampeggiano: quella che porta avanti e quella del ritorno
  if (Math.floor(time * 2.5) % 2) { if (D.P.stairs && D.P.stairs.cells.some(([i, j]) => D.seen[j * D.w + i])) dot(D.P.stairs.cx, D.P.stairs.cz, '#eaffff', 1); if (D.def.up) dot(D.P.spawn.cx, D.P.spawn.cz, '#fff4b0', 1); if (D.portal && D.portal.s) dot(D.portal.x, D.portal.z, '#ffffff', 1); }
  const hx = x0 + hero.x / DCS * s, hz = y0 + hero.z / DCS * s;
  for (let i = -1; i <= 4; i++) { hg.fillStyle = i > 2 ? '#ff4a3a' : '#ffffff'; hg.fillRect(Math.round(hx + Math.cos(hero.yaw) * i) - 1, Math.round(hz + Math.sin(hero.yaw) * i) - 1, 3, 3); }
  const yb = Math.min(Hr - 10, y0 + D.h * s + 3);
  hg.drawImage(IKEY, x0, yb - 3); T('x' + ds.keys, x0 + 14, yb, '#ffd86a');
  if (DS.family(D.id).some(k => DS.DEF[k].boss)) T(rt.big ? 'GRANDE CHIAVE: SÌ' : 'GRANDE CHIAVE: NO', x0 + D.w * s, yb, rt.big ? '#ff8a6a' : '#5a6478', 1, 'right');
  else if (D.def.down || D.def.up) T(D.def.dir === 'up' ? (D.def.down ? 'LA SCALA SALE' : 'LA CIMA') : (D.def.down ? 'LA SCALA SCENDE' : 'IL FONDO'), x0 + D.w * s, yb, '#7af0ff', 1, 'right');
}
// ---------- nemici: quale disegno e quale atlante ----------
function foeFrame(e) {
  const k = FOE[e.type].k;
  if (k === 'slime') return (e.hop > 0.55 || e.st === 'wind') ? 1 : 0;
  if (k === 'bat') return Math.floor(time * 10 + e.hop * 5) % 2;
  if (k === 'beast') return e.st === 'wind' ? 3 : e.moving ? 1 + (Math.floor(e.walk / 4) % 2) : 0;
  if (k === 'plant') return e.open > 0 ? 1 : 0;
  if (k === 'crab') return e.moving ? Math.floor(e.walk / 3) % 2 : 0;
  return e.st === 'wind' ? (e.t > 0.2 ? 3 : 4) : e.moving ? 1 + (Math.floor(e.walk / 4) % 2) : 0;
}
function drawFoe(e) {
  const T2 = FOE[e.type], two = !!DCH[e.type] && !!D, set = two ? DCH[e.type] : CHR[T2.as || e.type]; if (!set) return;
  if (e.st === 'dead' && Math.floor(time * 20) % 2) return;
  const rosso = MODO && e.st === 'wind' && T2.rosso, k = e.st === 'dead' ? Math.max(0, e.fade * 2) : 1, fl = e.flash > 0 ? 0.8 : e.st === 'wind' ? (MODO ? (rosso ? 0.12 : 0.3 + 0.5 * Math.abs(Math.sin(time * 16))) : 0.25) : 0;
  const r = set[Math.min(foeFrame(e), set.length - 1)][dirOf(e.x, e.z, e.yaw)], sc = (T2.sc || 0.2) / SR, ice = e.frz > 0 && e.st !== 'dead';
  (two ? pushBB2 : pushBB)(e.x, e.y - 0.4, e.z, r, sc, k, ice ? 0.3 : fl, ice ? ICE_T : rosso ? [1.02, 0.3 + 0.25 * Math.abs(Math.sin(time * 16)), 0.25] : two ? undefined : T2.tint);
  if (e.stun > 0 && e.st !== 'dead') { const top = e.y + r.h * sc * (r.f || 1) * 0.92; if (ice) pushBB(e.x, e.y - 0.3, e.z, SPR.icefx, 0.5, 1.15); else for (let i = 0; i < 2; i++) { const a = time * 6 + i * Math.PI; pushBB(e.x + Math.cos(a) * 2.4, top + Math.sin(time * 9 + i) * 0.3, e.z + Math.sin(a) * 2.4, SPR.star, 0.3, 1.25); } }
}
// l'eroe: la posa dipende dalla classe e da quello che sta facendo
function heroAnim() {
  const h = hero;
  if (h.dash) return h.dash.k === 'balzo' ? 6 : 5;
  if (h.atk > 0) { const pre = !h.hitDone; if (h.act === 'spin') return 4; if (h.act === 'knives' || h.act === 'orb') return pre ? 5 : 6; if (h.act === 'cast') return cls() === 'cavaliere' ? 5 : pre ? 5 : 6; const g = MODO && (h.act === 'slash' || h.act === 'stab') ? h.gesto || 0 : 0; return pre ? [3, 9, 7][g] : [4, 10, 8][g]; }
  if (h.block) return 5;
  if (h.chg > 0) return cls() === 'cavaliere' ? 6 : 5;
  return h.moving ? 1 + (Math.floor(h.walk / 5) % 2) : 0;
}
function drawHero(R) {
  const h = hero;
  if (h.inv > 0 && Math.floor(time * 16) % 2 && !h.dead && !h.dash) return;
  const spin = h.atk > 0 && h.act === 'spin' ? (1 - h.atk / h.atkT) * TAU * 1.5 : 0, hop = h.dash && h.dash.k === 'balzo' ? Math.sin(Math.max(0, h.dash.t) / 0.25 * Math.PI) * 2.6 : 0;
  pushBB(h.x, h.y - 0.5 + hop, h.z, heroRects[heroAnim()][dirOf(h.x, h.z, h.yaw + spin)], R, 1, h.flash > 0 ? 0.7 : h.chg >= 1 ? (Math.floor(time * 12) % 2 ? 0.5 : 0.15) : h.chg > 0 ? h.chg * 0.2 : 0, h.hid > 0 ? [0.5, 0.52, 0.64] : null);
}
// la linea di mira: puntini fin dove arriva la freccia (o fino al primo ostacolo); se sulla linea c'è una preda o un nemico, diventa d'oro e lo segna
function drawAim() {
  const h = hero; if (!h || !h.aim || st !== 'play') return;
  const R = h.chg >= 1 ? AIM_R2 : AIM_R1, ca = Math.cos(h.yaw), sa = Math.sin(h.yaw), P = [];
  let gy = D ? 0 : Math.max(gH(h.x, h.z), W.WL), end = R;
  for (let t = 3; t <= R; t += 3) {
    const x = h.x + ca * t, z = h.z + sa * t; let wall;
    if (D) wall = dBlocks(Math.floor(x / DCS), Math.floor(z / DCS), 'shot');
    else { const g = Math.max(W.ground(x, z), W.WL); wall = g - gy > 5.5 || !!W.inBox(x, z, 0); if (!wall) gy = g; }
    if (wall) { end = t; break; }
    if (t >= 9 && t % 6 === 0) P.push([x, gy, z, t]);
  }
  // che cosa c'è sulla linea: la preda o il nemico più vicino
  const ex = h.x + ca * end, ez = h.z + sa * end; let hit = null, hd = end;
  const su = (x, z, r, y) => { const t = Math.max(0, Math.min(end, (x - h.x) * ca + (z - h.z) * sa)), d = Math.hypot(h.x + ca * t - x, h.z + sa * t - z); if (d < r && t < hd && t > 2) { hd = t; hit = [x, y, z]; } };
  if (!D) { const a = fauna.strike(h.x + ca * 4, h.z + sa * 4, ex, ez, 2.8); if (a) su(a.x, a.z, a.S.r * a.sc + 2.9, a.y + a.S.H * 0.2 * a.sc); }
  for (const e of foes) if (e.st !== 'dead' && (!D || e.room === D.room)) su(e.x, e.z, FOE[e.type].r + 2.2, e.y + 9);
  const lit = hit ? 1.7 : 1.15, tint = hit ? [1.9, 1.5, 0.4] : null;
  for (const p of P) { if (p[3] > hd) break; pushBB(p[0], p[1] + 1.3, p[2], SPR.mdot, 0.22 + p[3] * 0.0045, lit, 0, tint); }
  if (hit) pushBB(hit[0], hit[1] + 2 + Math.sin(time * 9) * 0.4, hit[2], SPR.mirino, 0.3 + hd * 0.004, 1.8, 0, [1.9, 1.5, 0.4]);
  else pushBB(ex, gy + 2.6, ez, SPR.mirino, 0.3 + end * 0.004, 1.3);
}
function drawShot(s) { const r = SPR.shot[s.k], dir = Array.isArray(r); pushBB(s.x, s.y - 1.5, s.z, dir ? r[dirOf(s.x, s.z, s.yaw)] : r, (dir ? 0.36 / SR : s.k === 'light' ? 0.6 : 0.42) * (s.big || 1), 1.2, 0, s.tint || undefined); }
function drawThings() {
  for (const t of things) {
    if (t.k === 'bomb') pushBB(t.x, t.y, t.z, SPR.bomb, 0.3, 1, t.fly <= 0 && Math.floor(t.t * (t.t < 0.4 ? 20 : 9)) % 2 ? 0.7 : 0);
    else if (t.k === 'trap') pushBB(t.x, gH(t.x, t.z) + 0.1, t.z, SPR.trap, 0.3, 1.05);
  }
}

// ---------- disegno 3D ----------
let VP = null, RX = 1, RZ = 0, planes = null, frameN = 0;
const MESHL = [['aPos', 3], ['aT', 2], ['aL', 2], ['aSh', 1]];
function boxVisible(x0, y0, z0, x1, y1, z1) {
  for (const p of planes) { const x = p[0] > 0 ? x1 : x0, y = p[1] > 0 ? y1 : y0, z = p[2] > 0 ? z1 : z0; if (p[0] * x + p[1] * y + p[2] * z + p[3] < 0) return false; }
  return true;
}
function pushBB(x, y, z, r, s, k = 1, fl = 0, tint) {
  if (!r) return;
  const n = pushBB.n; if (n >= 3000) return;
  const w = r.w * s * (r.f || 1), h = r.h * s * (r.f || 1); let p = n * 44;
  let tr = tint ? tint[0] : k, tg = tint ? tint[1] : k, tb = tint ? tint[2] : k;
  if (tr <= 1.05 && tg <= 1.05 && !D && W.GROTTE.length) { const q = W.grotta(x, z); if (q && q.bu > 0 && y < q.ce + 4) { const f = 1 - 0.56 * q.bu; tr *= f; tg *= f; tb *= f; } }   // sotto la volta di una grotta: in ombra (quel che brilla di suo resta com'è)
  const C = [-w / 2, 0, r.u0, r.v1, w / 2, 0, r.u1, r.v1, w / 2, h, r.u1, r.v0, -w / 2, h, r.u0, r.v0];
  for (let i = 0; i < 16; i += 4) { dynF[p++] = x; dynF[p++] = y; dynF[p++] = z; dynF[p++] = C[i]; dynF[p++] = C[i + 1]; dynF[p++] = C[i + 2]; dynF[p++] = C[i + 3]; dynF[p++] = tr; dynF[p++] = tg; dynF[p++] = tb; dynF[p++] = fl; }
  pushBB.n = n + 1;
}
pushBB.n = 0;
let shN = 0;
function pushShadow(x, z, r, y) { if (shN >= 400) return; const gy = (y !== undefined ? y : gH(x, z)) + 0.25; let p = shN * 20; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { shF[p++] = x + a * r; shF[p++] = gy; shF[p++] = z + b * r * 0.8; shF[p++] = a; shF[p++] = b; } shN++; }
const FOGC = [0, 0, 0], ZENC = [0, 0, 0];
let nearGlows = null;
// le otto luci più vicine (la prima è la lanterna dell'eroe) illuminano terreno, case e personaggi quando fa buio
function pickLights() {
  const ng = buio(), L = [], cx = hero && st !== 'title' ? hero.x : cam.tx, cz = hero && st !== 'title' ? hero.z : cam.tz;
  nearGlows = [];
  for (const g of W.glows) { const d = (g[0] - cx) ** 2 + (g[2] - cz) ** 2; if (d < 520 * 520) { nearGlows.push(g); if (d < 240 * 240) L.push([d, g]); } }
  WLQ.fill(0); let n = 0;
  if (ng < 0.02) return;
  if (hero && st !== 'title') { WLP[0] = hero.x; WLP[1] = hero.y + 5; WLP[2] = hero.z; WLP[3] = eqHas('light') ? 54 : 30; WLQ[0] = 0.6 * ng; WLQ[1] = 0.48 * ng; WLQ[2] = 0.3 * ng; n = 1; }
  L.sort((a, b) => a[0] - b[0]);
  for (let k = 0; k < L.length && n < 8; k++, n++) { const g = L[k][1]; WLP[n * 4] = g[0]; WLP[n * 4 + 1] = g[1]; WLP[n * 4 + 2] = g[2]; WLP[n * 4 + 3] = g[3] * 5.5; WLQ[n * 3] = g[4] * 0.9 * ng; WLQ[n * 3 + 1] = g[5] * 0.9 * ng; WLQ[n * 3 + 2] = g[6] * 0.9 * ng; }
}
function setWL(p) {
  gl.uniform4fv(p.u.uLp, WLP); gl.uniform3fv(p.u.uLq, WLQ); gl.uniform1f(p.u.uNt, buio() > 0.02 ? 1 : 0); gl.uniform3fv(p.u.uLc, day.lc); gl.uniform3f(p.u.uCl, (time * 0.021) % 6283.185, (time * 0.013) % 6283.185, 0.24 - 0.12 * day.night);
}
const dirOf = (x, z, yaw) => ((Math.round(angDiff(Math.atan2(z - cam.z, x - cam.x), yaw) / (TAU / 8)) % 8) + 8) % 8;
// ---------- le terre vicine: altri mondi nati dalla stessa fabbrica, posati accanto a quello dove si cammina (per ora solo nelle prove) ----------
const TERRE = []; let soloTerra = 0;
function terraNuova(ox, oz, scheda) { const m = SG.altroMondo(); if (scheda) SG.dentro(m, () => SG.terre[scheda](m)); const t = { m, W: m.world, ox, oz, scheda, gen: SG.nasce(m, null, SPR), ok: false }; TERRE.push(t); return t; }
function acquaTerre() {   // ogni terra ha il suo specchio d'acqua, largo fin dove comincia quello della vicina
  const tutte = [{ W, ox: 0, oz: 0 }].concat(TERRE.filter(t => t.ok));
  for (const a of tutte) {
    const B = a.W; let x0 = -3000, x1 = B.WS + 3000, z0 = B.Z0 - 3000, z1 = B.WS + 3000;
    for (const b of tutte) if (b !== a) { const dx = b.ox - a.ox, dz = b.oz - a.oz;
      if (Math.abs(dx) >= Math.abs(dz)) { if (dx > 0) x1 = Math.min(x1, dx); else x0 = Math.max(x0, dx + b.W.WS); }
      else if (dz > 0) z1 = Math.min(z1, dz + b.W.Z0); else z0 = Math.max(z0, dz + b.W.WS); }
    B.wat = G.buffer(new Float32Array([x0, z0, x1, z0, x1, z1, x0, z1]));
  }
}
function terreTick(ms) {   // una terra vicina nasce un poco per volta, mentre si gioca
  for (const t of TERRE) if (t.gen) {
    const t0 = performance.now();
    while (performance.now() - t0 < ms) if (t.gen.next().done) { t.gen = null; const B = t.W; B.shoreTex = G.texture({ w: B.N, h: B.NZ, data: B.shore }, { linear: true, lum: true }); B.shore = null; SG.dentro(t.m, () => B.upload(G)); t.ok = true; acquaTerre(); break; }
    return;
  }
}
// disegna una terra vicina: lo stesso disegno, con la visuale spostata di quanto la terra dista (fase 1: terreno, case, alberi; fase 2: acqua)
function passaTerra(t, fase) {
  const k = [W, VP, planes, RX, RZ, cam.x, cam.z, cam.tx, cam.tz];
  W = t.W; cam.x -= t.ox; cam.z -= t.oz; cam.tx -= t.ox; cam.tz -= t.oz; soloTerra = fase;
  try { render3D(); } finally { soloTerra = 0; W = k[0]; VP = k[1]; planes = k[2]; RX = k[3]; RZ = k[4]; cam.x = k[5]; cam.z = k[6]; cam.tx = k[7]; cam.tz = k[8]; }
}
function acqua3D(fogC, fogN, fogF) {
  const P = G.P; let p;
  // acqua
  p = P.water; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform1f(p.u.uY, W.WL); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform3fv(p.u.uWat, atm.wat);
  gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform1f(p.u.uTime, time); gl.uniform2f(p.u.uInvW, 1 / W.WS, 1 / W.WSZ); gl.uniform2f(p.u.uW0, 0, W.Z0); gl.uniform3f(p.u.uHi, 0.86 * (1 - day.night * 0.3), 0.95, 1); gl.uniform1f(p.u.uA, 0.74); setWL(p);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, W.shoreTex || SHORE); gl.uniform1i(p.u.uShore, 1);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, DET); gl.uniform1i(p.u.uDet, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
  gl.bindBuffer(gl.ARRAY_BUFFER, W.wat || W.waterBuf); G.attribs(p, [['aP', 2]]); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  // gli stagni in quota: la stessa acqua, più su, dentro il contorno della conca
  for (const q of W.PONDS) { if (Math.hypot(q.x - cam.x, q.z - cam.z) > fogF + 160) continue; gl.uniform1f(p.u.uY, q.y); gl.bindBuffer(gl.ARRAY_BUFFER, q.buf); G.attribs(p, [['aP', 2]]); gl.drawElements(gl.TRIANGLES, q.n * 6, gl.UNSIGNED_SHORT, 0); }
}
function render3D() {
  if (D) return renderDungeon();
  const P = G.P;
  gl.viewport(0, 0, W3, H3);
  const fogC = FOGC, zenC = ZENC; for (let i = 0; i < 3; i++) { fogC[i] = atm.fog[i] + (day.hor[i] - atm.fog[i]) * day.horK; zenC[i] = atm.zen[i] + (day.zen[i] - atm.zen[i]) * day.zenK; }
  if (!soloTerra) { gl.clearColor(fogC[0], fogC[1], fogC[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }
  const proj = SG.M4.persp(FOV, W3 / H3, 1.2, Math.max(900, atm.far + 200)), view = SG.M4.look([cam.x, cam.y, cam.z], [cam.tx, cam.ty, cam.tz], [0, 1, 0]);
  VP = SG.M4.mul(proj, view);
  const m = VP, row = i => [m[i], m[4 + i], m[8 + i], m[12 + i]], r0 = row(0), r1 = row(1), r2 = row(2), r3 = row(3);
  planes = [[1, r0], [-1, r0], [1, r1], [-1, r1], [-1, r2]].map(([s, r]) => [r3[0] + s * r[0], r3[1] + s * r[1], r3[2] + s * r[2], r3[3] + s * r[3]]);
  const yaw = Math.atan2(cam.tz - cam.z, cam.tx - cam.x), pitch = Math.atan2(cam.ty - cam.y, Math.hypot(cam.tx - cam.x, cam.tz - cam.z));
  RX = -Math.sin(yaw); RZ = Math.cos(yaw);
  const fogN = atm.near, fogF = atm.far;
  if (soloTerra === 2) { acqua3D(fogC, fogN, fogF); return; }
  let p;
  if (!soloTerra) {
  if (frameN % 10 === 0 || !nearGlows) pickLights();
  // cielo
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
  p = P.sky; gl.useProgram(p.p); gl.bindBuffer(gl.ARRAY_BUFFER, G.full); G.attribs(p, [['aP', 2]]);
  const foc = (H3 / 2) / Math.tan(FOV / 2);
  gl.uniform2f(p.u.uRes, W3, H3); gl.uniform1f(p.u.uHor, H3 / 2 - foc * Math.tan(pitch)); gl.uniform1f(p.u.uYaw, yaw); gl.uniform1f(p.u.uFovX, 2 * Math.atan(Math.tan(FOV / 2) * W3 / H3));
  gl.uniform1f(p.u.uPanoH, H3 * 0.3); gl.uniform1f(p.u.uTime, time); gl.uniform3fv(p.u.uZen, zenC); gl.uniform3fv(p.u.uHorC, fogC);
  { // sole e luna: nascono a est, tramontano a ovest; si vedono solo quando sono bassi sull'orizzonte
    const hor = H3 / 2 - foc * Math.tan(pitch), td = day.tod, put = (u, az, el, r) => { const d = angDiff(az, yaw); if (el < -0.03 || Math.abs(d) > 1.35) gl.uniform3f(u, 0, 0, 0); else gl.uniform3f(u, W3 / 2 + foc * Math.tan(d), hor + foc * Math.tan(el) + r * 0.4, r); };
    const sa = (td - 6) / 13 * Math.PI, se = Math.sin(sa) * 1.05, tm = (td + 5) % 24, ma = tm / 11 * Math.PI, me = Math.sin(ma) * 0.5;
    put(p.u.uSun, sa, td > 5.5 && td < 19.5 ? se : -1, Math.max(6, H3 * 0.045)); put(p.u.uMoon, ma, tm < 11 ? me : -1, Math.max(5, H3 * 0.034));
    const low = Math.max(0, Math.min(1, se / 0.5)); gl.uniform3f(p.u.uSunC, 1, 0.72 + 0.26 * low, 0.36 + 0.5 * low); gl.uniform1f(p.u.uStars, day.stars); gl.uniform3fv(p.u.uPanoC, day.pano);
  }
  { // i giganti del nord: da lontano il rilievo vero è oltre la foschia, e le cime si disegnano come sagome sul cielo
    const hor = H3 / 2 - foc * Math.tan(pitch), L = [];
    for (const g of GIANTS) { const dx = g[0] - cam.x, dz = g[1] - cam.z, d = Math.hypot(dx, dz), a = Math.max(0, Math.min(1, (d - (atm.far - 250)) / 550)), dd = angDiff(Math.atan2(dz, dx), yaw), cd = Math.cos(dd);
      if (a > 0 && Math.abs(dd) < 1.25 && g[2] > cam.y) L.push([d, W3 / 2 + foc * Math.tan(dd), hor + foc * (g[2] - cam.y) / (d * cd), foc * g[3] / (d * cd), a]); }
    L.sort((p, q) => q[0] - p[0]); PKS.fill(0); L.slice(-10).forEach((k, i) => { PKS[i * 4] = k[1]; PKS[i * 4 + 1] = k[2]; PKS[i * 4 + 2] = k[3]; PKS[i * 4 + 3] = k[4]; });
    gl.uniform4fv(p.u.uPk, PKS);
  }
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, PANO); gl.uniform1i(p.u.uPano, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);
  if (!soloTerra) for (const t of TERRE) if (t.ok) passaTerra(t, 1);   // le terre vicine, prima della nostra
  // terreno
  p = P.terrain; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform1f(p.u.uWS, W.WS); gl.uniform2f(p.u.uInvW, 1 / W.WS, 1 / W.WSZ); gl.uniform2f(p.u.uW0, 0, W.Z0);
  gl.uniform3fv(p.u.uFogC, fogC); gl.uniform1f(p.u.uTime, time); setWL(p); if (soloTerra) gl.uniform1f(p.u.uNt, 0);
  gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, W.tex.pav); gl.uniform1i(p.u.uPav, 3);
  gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, PAVT); gl.uniform1i(p.u.uPavT, 4);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, W.tex.col); gl.uniform1i(p.u.uCol, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, W.tex.mat); gl.uniform1i(p.u.uMat, 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, DET); gl.uniform1i(p.u.uDet, 2);
  const far = fogF + 60, vis = [];
  if (++frameN % 240 === 0) W.sweep(frameN);
  for (const c of W.chunks) {
    const d = Math.hypot(c.cx - cam.x, c.cz - cam.z);
    if (d > far + W.CS * 0.75) continue;
    if (!boxVisible(c.cx - W.CS / 2, c.lo - 2, c.cz - W.CS / 2, c.cx + W.CS / 2, c.hi + 30, c.cz + W.CS / 2)) continue;
    vis.push([c, d]); W.need(c, frameN);
    const L = W.lod[d < 520 || (c.fine && d < 1350) ? 0 : d < 950 ? 1 : 2];
    gl.bindBuffer(gl.ARRAY_BUFFER, c.buf); G.attribs(p, [['aPos', 3], ['aSh', 1], ['aG', 2]]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.buf); gl.drawElements(gl.TRIANGLES, L.n, gl.UNSIGNED_SHORT, 0);
  }
  // le volte delle grotte aperte: stessa roccia del terreno, sopra lo scavo
  for (const v of W.volte) { if (!v.buf || !v.n || Math.hypot(v.x - cam.x, v.z - cam.z) - v.r > far || !boxVisible(v.box[0], v.lo, v.box[1], v.box[2], v.hi, v.box[3])) continue; gl.bindBuffer(gl.ARRAY_BUFFER, v.buf); G.attribs(p, [['aPos', 3], ['aSh', 1], ['aG', 2]]); gl.drawArrays(gl.TRIANGLES, 0, v.n); }
  // edifici
  p = P.mesh; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform2f(p.u.uTiles, 8, 48); gl.uniform1f(p.u.uNight, day.night); gl.uniform3f(p.u.uFl, (time * 1.15) % 1, (time * 0.035) % 1, (time * 0.02) % 1); setWL(p);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TILES); gl.uniform1i(p.u.uTex, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, W.meshBuf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  for (const s of W.sites) {
    if (Math.hypot(s.x - cam.x, s.z - cam.z) - s.r > far || !boxVisible(s.x0, s.y0, s.z0, s.x1, s.y1, s.z1)) continue;
    for (let q0 = s.q0, q1 = s.q0 + s.n; q0 < q1; q0 += 16000) { G.attribs(p, MESHL, q0 * 128); gl.drawElements(gl.TRIANGLES, Math.min(16000, q1 - q0) * 6, gl.UNSIGNED_SHORT, 0); }
  }
  // ombre
  shN = 0;
  if (!soloTerra) {
  if (hero && st !== 'title') pushShadow(hero.x, hero.z, 2.6, hero.y);
  for (const s of W.bigShadows || []) if (near(s[0], s[1], 520)) pushShadow(s[0], s[1], s[2]);      // l'ombra della chioma dell'Albero Madre
  for (const e of foes) if (e.st !== 'dead' && near(e.x, e.z, 280)) pushShadow(e.x, e.z, FOE[e.type].r * 0.8, e.y - (FOE[e.type].fly || 0));
  for (const n of npcs) if (near(n.x, n.z, 280) && !npcHidden(n)) pushShadow(n.x, n.z, n.id === 'biscotto' ? 1.5 : 2.4);
  if (st !== 'title') fauna.shadows(cam);
  }
  if (shN) {
    p = P.shadow; gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP, false, VP);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4);
    gl.bindBuffer(gl.ARRAY_BUFFER, shBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, shF.subarray(0, shN * 20)); G.attribs(p, [['aPos', 3], ['aUV', 2]]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, shN * 6, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.depthMask(true); gl.disable(gl.BLEND);
  }
  // oggetti fissi (alberi, rocce, fiori)
  p = P.bb; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3f(p.u.uR, RX, 0, RZ); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform1f(p.u.uTime, time); setWL(p); if (soloTerra) gl.uniform1f(p.u.uNt, 0);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.uniform1i(p.u.uTex, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  const ghostOn = !soloTerra && !!hero && (st === 'play' || st === 'dead');
  gl.uniform1f(p.u.uNear, ghostOn ? 6 : 0); if (ghostOn) gl.uniform3f(p.u.uHero, hero.x, hero.y + 4.5, hero.z); gl.uniform1f(p.u.uGhost, 0);
  for (const [c, d] of vis) {
    if (c.big) { gl.bindBuffer(gl.ARRAY_BUFFER, c.big); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, c.nb * 6, gl.UNSIGNED_SHORT, 0); }
    if (c.small && d < 300) { gl.bindBuffer(gl.ARRAY_BUFFER, c.small); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, c.ns * 6, gl.UNSIGNED_SHORT, 0); }
  }
  if (soloTerra) return;
  // personaggi, forzieri, effetti
  pushBB.n = 0;
  buildDynamic();
  if (pushBB.n) {
    gl.uniform1f(p.u.uNear, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynF.subarray(0, pushBB.n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]);
    gl.drawElements(gl.TRIANGLES, pushBB.n * 6, gl.UNSIGNED_SHORT, 0);
  }
  // acqua: prima quella delle terre vicine, poi la nostra
  for (const t of TERRE) if (t.ok) passaTerra(t, 2);
  acqua3D(fogC, fogN, fogF);
  // aloni di lampioni, fuochi e fari: si sommano al colore (di notte forti, di giorno appena accennati)
  { let n = 0; const ng = buio();
    for (const g of nearGlows) { const it = (g[7] ? 0.22 + 0.78 * ng : ng) * (0.9 + 0.1 * Math.sin(time * 9 + g[0])) * 0.6; if (it < 0.03 || n >= 160) continue; const r = g[3]; let q = n * 44;
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { glowF[q++] = g[0]; glowF[q++] = g[1]; glowF[q++] = g[2]; glowF[q++] = a * r; glowF[q++] = b * r; glowF[q++] = a; glowF[q++] = b; glowF[q++] = g[4]; glowF[q++] = g[5]; glowF[q++] = g[6]; glowF[q++] = it; } n++; }
    if (n) { p = P.glow; gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3f(p.u.uR, RX, 0, RZ); gl.uniform2f(p.u.uFog, fogN, fogF);
      gl.blendFunc(gl.ONE, gl.ONE); gl.bindBuffer(gl.ARRAY_BUFFER, glowBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, glowF.subarray(0, n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, 0); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } }
  // alberi e rocce che coprono l'eroe: trasparenti e puliti (seconda passata)
  if (ghostOn) {
    p = P.bb; gl.useProgram(p.p); gl.uniform1f(p.u.uGhost, 0.34); gl.uniform1f(p.u.uNear, 6);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
    for (const [c, d] of vis) if (c.big && d < W.CS + 40) { gl.bindBuffer(gl.ARRAY_BUFFER, c.big); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, c.nb * 6, gl.UNSIGNED_SHORT, 0); }
    gl.uniform1f(p.u.uGhost, 0);
  }
  gl.depthMask(true); gl.disable(gl.BLEND);
}
const near = (x, z, r) => (x - cam.x) ** 2 + (z - cam.z) ** 2 < r * r;
function buildDynamic() {
  const R = 0.2 / SR;
  // eroe
  if (hero && (st === 'play' || st === 'dead')) {
    drawHero(R);
  }
  for (const n of npcs) {
    if (!near(n.x, n.z, 520) || npcHidden(n)) continue;
    const sh = CHR[n.id], a = n.moving ? 1 + (Math.floor(n.walk / 4) % (sh.length - 1)) : 0, sc = 0.2 / SR;
    const glow = n.id === 'spirito' ? 1.1 + Math.sin(time * 3) * 0.1 : 1;
    pushBB(n.x, gH(n.x, n.z) - 0.5 + (n.id === 'spirito' ? 1.5 + Math.sin(time * 2) : 0), n.z, sh[a][dirOf(n.x, n.z, n.yaw)], sc, glow);
  }
  const opened = id => save && save.chests[id], taken = p => save && save.oreTaken[p.x + ',' + p.z];
  for (const c of chests) { if (!near(c.x, c.z, 420)) continue; pushBB(c.x, gH(c.x, c.z) - 0.3, c.z, CHR.chest[c.r][opened(c.id) ? 1 : 0][dirOf(c.x, c.z, c.yaw)], 0.24 / SR); if (!opened(c.id) && c.r >= 2 && Math.floor(time * 3 + c.x) % 4 === 0) pushBB(c.x + Math.sin(time * 5) * 2, gH(c.x, c.z) + 6, c.z, SPR.glint, 0.3); }
  for (const e of foes) if (near(e.x, e.z, 520)) drawFoe(e);
  if (st !== 'title') fauna.draw(cam, time);
  for (const p of props) if (p.k === 'ore' && !taken(p) && near(p.x, p.z, 420)) { pushBB(p.x, gH(p.x, p.z) - 0.4, p.z, SPR.ore.r[0], SPR.ore.s); if (near(p.x, p.z, 200) && Math.floor(time * 2.5 + p.x) % 3 === 0) pushBB(p.x, gH(p.x, p.z) + 4, p.z, SPR.glint, 0.3); }
  for (const p of picks) { const js = jst(p.job); if (!js || js.s !== 1 || (js.got && js.got[p.i]) || !near(p.x, p.z, 420)) continue; const y = gH(p.x, p.z); pushBB(p.x, y - 0.2, p.z, SPR.pick[p.what], 0.46); if (near(p.x, p.z, 280) && Math.floor(time * 2.5 + p.x) % 3 === 0) pushBB(p.x, y + 4.4, p.z, SPR.glint, 0.3); }
  if (save) for (const b of W.BOARDS) if (near(b.x, b.z, 340)) { const m = boardMark(b.id); if (m) pushBB(b.x, gH(b.x, b.z) + 12.6 + Math.sin(time * 3.2) * 0.6, b.z, SPR.bang[m - 1], 0.36, 1.2); }
  for (const p of props) if ((p.k === 'torch' || p.k === 'campfire') && near(p.x, p.z, 900)) pushBB(p.x, gH(p.x, p.z) + (p.k === 'torch' ? 7.45 : 0.3), p.z, SPR.flame[Math.floor(time * 8 + p.x) % 2], p.k === 'torch' ? 0.25 : 0.27, 1.2);
  for (const d of doors) if (!d.cave && near(d.x, d.z, 300)) pushBB(d.x, gH(d.x, d.z) + 10 + Math.sin(time * 2) * 0.6, d.z, SPR.rune, 0.45, 1.2 + Math.sin(time * 3) * 0.2, 0, save && sanctDone(d.id) ? [0.9, 1.35, 0.9] : save && save.q.main >= 4 && d.id === nextSanct() ? [1.7, 1.25, 0.35] : null);
  for (const s2 of shots) drawShot(s2);
  drawThings();
  drawAim();
  for (const p of drops) pushBB(p.x, p.y, p.z, p.k === 'coin' ? SPR.coin : SPR.heart, 0.4, 1.15);
  for (const p of fx) pushBB(p.x, p.y, p.z, SPR[p.k], (p.s || 0.3) * (p.k === 'puff' ? 0.6 + p.t : p.k === 'smoke' ? 2.3 - p.t * 0.55 : 1), p.k === 'smoke' ? 0.98 : 1.1);
  for (const p of amb) { const L = SPR[p.k]; if (p.k === 'fly' && Math.sin(p.ph * 3 + p.v * 20) < -0.1) continue; pushBB(p.x, p.y, p.z, L[Math.floor(p.v * L.length) % L.length], p.k === 'dust' ? 0.4 : 0.3, p.k === 'fly' ? 1.4 : 1.02); }
  // bandiere in cima a torri e alberi maestri
  for (const f of W.flags) if (near(f[0], f[2], 620)) { const sp = SPR[f[3] === 2 ? 'flagblue' : 'flag']; pushBB(f[0] + RX * 3.2, f[1] - 3.4, f[2] + RZ * 3.2, sp.r[Math.floor(time * 5 + f[0] * 0.37) % 2], sp.s, 1.05); }
  // il drago
  if (near(dragon.x, dragon.z, 1600)) pushBB(dragon.x, dragon.y, dragon.z, CHR.dragon[Math.floor(time * 2.6) % 2][dirOf(dragon.x, dragon.z, dragon.yaw)], 0.8, 0.95);
}

// ---------- interfaccia (disegnata a bassa risoluzione sopra il 3D) ----------
const T = (s, x, y, c, k, al, sh) => A.text(hg, s, x, y, c || '#ffffff', sh === undefined ? '#0b0a12' : sh, k || 1, al || 'left');
function panel(x, y, w, h, edge = '#ffd23f') { hg.fillStyle = 'rgba(10,12,22,.9)'; hg.fillRect(x, y, w, h); hg.fillStyle = edge; hg.fillRect(x, y, w, 1); hg.fillRect(x, y + h - 1, w, 1); hg.fillRect(x, y, 1, h); hg.fillRect(x + w - 1, y, 1, h); hg.fillStyle = 'rgba(255,255,255,.08)'; hg.fillRect(x + 1, y + 1, w - 2, 1); }
const dialogW = () => Math.max(170, Math.min(320, Wr - insetL - insetR - 8));
function drawHearts(x, y) {
  const mx = MAXHP(); for (let i = 0; i < mx / 2; i++) { const v = hero.hp - i * 2, img = v >= 2 ? HEARTS[0] : v === 1 ? HEARTS[1] : HEARTS[2]; hg.drawImage(img, x + (i % 10) * 8, y + Math.floor(i / 10) * 8); }
}
function compass() {
  const cx = Math.round(Wr / 2), w = Math.min(150, Wr * 0.36), y = 4, yaw = cam.yaw;      // la bussola segue lo sguardo, non i piedi
  hg.fillStyle = 'rgba(10,12,22,.55)'; hg.fillRect(cx - w / 2, y, w, 11);
  const mark = (a, s, c, k = 1) => { const d = angDiff(a, yaw); if (Math.abs(d) > 1.35) return; const x = cx + d / 1.35 * (w / 2 - 4); T(s, x, y + 2, c, k, 'center'); };
  mark(-Math.PI / 2, 'N', '#ff6a5a'); mark(0, 'E', '#e6e9f2'); mark(Math.PI / 2, 'S', '#e6e9f2'); mark(Math.PI, 'O', '#e6e9f2');
  for (const a of [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4]) { const d = angDiff(a, yaw); if (Math.abs(d) < 1.35) { hg.fillStyle = '#8a96aa'; hg.fillRect(Math.round(cx + d / 1.35 * (w / 2 - 4)), y + 5, 1, 2); } }
  const q = curTrack(), tg = MODO ? (!D && save.segno ? save.segno : null) : q && !D ? questTarget(q) : null, tc = MODO ? '#ff8a2a' : '#ffd23f';
  if (tg) {
    const a = Math.atan2(tg[1] - hero.z, tg[0] - hero.x), d = angDiff(a, yaw), x = Math.round(cx + Math.max(-1, Math.min(1, d / 1.35)) * (w / 2 - 4));
    hg.fillStyle = '#0b0a12'; hg.fillRect(x - 3, y + 1, 7, 9); hg.fillStyle = tc; hg.fillRect(x - 1, y + 2, 3, 7); hg.fillRect(x - 2, y + 3, 5, 5);
    const dist = Math.hypot(tg[0] - hero.x, tg[1] - hero.z);
    if (dist > 40) T(Math.round(dist / 10) * 10 + ' M', cx, y + 13, tc, 1, 'center'); else if (MODO) T('SEI ARRIVATO', cx, y + 13, tc, 1, 'center');
  }
  hg.fillStyle = '#ffffff'; hg.fillRect(cx, y + 9, 1, 2);
}
function drawHUD() {
  hg.clearRect(0, 0, Wr, Hr);
  if (st === 'loading' || st === 'boot') return drawLoading();
  if (st === 'error') { hg.fillStyle = '#0b0d12'; hg.fillRect(0, 0, Wr, Hr); A.wrap(errMsg, Wr - 40).forEach((l, i) => T(l, Wr / 2, Hr / 2 - 20 + i * 10, '#ff8f8f', 1, 'center')); return; }
  if (st === 'title') return drawTitle();
  if (st === 'intro') return drawIntro();
  if (st === 'class') return drawClass();
  // indicatori
  drawHearts(6, 5);
  const hy0 = 6 + Math.ceil(MAXHP() / 2 / 10) * 8, hy = hy0 + (MODO ? 13 : 8);
  drawEnergy(6, hy0);
  if (MODO) { const f = hero.fi === undefined ? 1 : Math.max(0, hero.fi), low = hero.fiFl > 0 && Math.floor(time * 10) % 2; hg.fillStyle = '#0b0a12'; hg.fillRect(5, hy0 + 6, 42, 4); hg.fillStyle = low ? '#ff5a5a' : '#6fdc8a'; hg.fillRect(6, hy0 + 7, Math.round(40 * f), 2);
    let g = null, gd = 80; for (const e of foes) { const T2 = FOE[e.type]; if (!T2.gd || e.st === 'dead') continue; const d = Math.hypot(e.x - hero.x, e.z - hero.z); if (d < gd) { gd = d; g = e; } }
    if (g && !D) { const T2 = FOE[g.type], w = 110, x = Math.round(Wr / 2 - w / 2), y = 19, n = T2.gd, cur = g.rotto > 0 ? 0 : g.gd === undefined ? n : g.gd; T(T2.n + (g.rotto > 0 ? ' - SCOPERTO!' : ''), Wr / 2, y, g.rotto > 0 ? '#ffe14a' : '#ffb070', 1, 'center'); hg.fillStyle = '#1a0e14'; hg.fillRect(x - 1, y + 9, w + 2, 6); hg.fillStyle = '#4a1a22'; hg.fillRect(x, y + 10, w, 4); hg.fillStyle = '#ff8a3a'; hg.fillRect(x, y + 10, Math.round(w * Math.max(0, g.hp) / Math.max(1, Math.round(T2.hp * (T2.fermo ? 1 : diffK().hp)))), 4);
      for (let i = 0; i < n; i++) { hg.fillStyle = i < cur ? '#9ad0ff' : '#2a3448'; hg.fillRect(x + i * 9, y + 17, 7, 3); } } }
  hg.drawImage(ICOIN, 5, hy); T(String(save.coins), 19, hy + 3, '#ffd23f');
  hg.drawImage(IPOT, 5, hy + 12); T(String(save.pot), 19, hy + 15, '#ffb0c0');
  let ty = hy + 30;
  if (D && !D.def.casa) { const ds = dsave(D.id), tg = floorTag(D.def); hg.drawImage(IKEY, 5, hy + 24); T('x' + ds.keys, 19, hy + 27, '#ffd86a'); if (droot().big) hg.drawImage(IBKEY, 34, hy + 24); ty += 12; if (tg) { T(tg, 5, hy + 40, '#7af0ff'); ty += 12; } }
  compass();
  { const ch = D ? (!boss ? foes.find(e => FOE[e.type].champ && e.st !== 'dead' && e.room === D.room) : null) : foes.find(e => FOE[e.type].elite && e.st !== 'dead' && Math.hypot(e.x - hero.x, e.z - hero.z) < 130);
    if (ch) { const T2 = FOE[ch.type], w = Math.min(150, Wr * 0.38), x = Math.round(Wr / 2 - w / 2), y = 19; T(T2.n, Wr / 2, y, '#ffb070', 1, 'center'); hg.fillStyle = '#1a0e14'; hg.fillRect(x - 1, y + 9, w + 2, 6); hg.fillStyle = '#4a1a22'; hg.fillRect(x, y + 10, w, 4); hg.fillStyle = '#ff8a3a'; hg.fillRect(x, y + 10, Math.round(w * Math.max(0, ch.hp) / T2.hp), 4); } }
  if (boss && boss.on && !boss.dead && boss.st !== 'die') { const w = Math.min(170, Wr * 0.42), x = Math.round(Wr / 2 - w / 2), y = 19; T(boss.B.n, Wr / 2, y, '#ff8a5a', 1, 'center'); hg.fillStyle = '#1a0e14'; hg.fillRect(x - 1, y + 9, w + 2, 6); hg.fillStyle = '#4a1a22'; hg.fillRect(x, y + 10, w, 4); hg.fillStyle = boss.vuln ? '#ffd23f' : '#ff4a5a'; hg.fillRect(x, y + 10, Math.round(w * Math.max(0, boss.hp) / boss.max), 4); }
  toasts.forEach((t, i) => T(t.t, 6, ty + i * 10, t.c));
  if (banner) {
    const a = Math.min(1, banner.life * 2, (3.2 - banner.life) * 3 + 0.2), y = Math.round(Hr * 0.24);
    hg.globalAlpha = Math.max(0, Math.min(1, a));
    const w = A.textW(banner.t, 2) + 24; hg.fillStyle = 'rgba(10,12,22,.5)'; hg.fillRect(Wr / 2 - w / 2, y - 5, w, banner.s ? 32 : 24);
    T(banner.t, Wr / 2, y, banner.c, 2, 'center'); hg.fillStyle = banner.c; hg.fillRect(Wr / 2 - w / 2 + 8, y + 17, w - 16, 1);
    if (banner.s) T(banner.s, Wr / 2, y + 20, '#e6e9f2', 1, 'center');
    hg.globalAlpha = 1;
  }
  if (target && st === 'play') {
    const o = target.obj, ds2 = D ? dsave(D.id) : null;
    const lbl = { npc: 'PARLA', chest: 'APRI', door: o.cave || (save.q.main >= 4 && (o.id === nextSanct() || sanctDone(o.id))) ? 'ENTRA' : 'ESAMINA', shop: 'ENTRA', board: 'LEGGI GLI INCARICHI', ore: 'RACCOGLI', prop: o.k === 'sign' ? 'LEGGI' : o.k === 'well' ? 'BEVI' : 'GUARDA', dchest: 'APRI', ddoor: (o.kind === 'lock' && ds2 && ds2.keys > 0) || (o.kind === 'boss' && ds2 && ds2.big) ? 'APRI' : 'ESAMINA', sign: 'LEGGI', gem: 'PRENDI', block: 'SPINGI' }[target.kind];
    const s = 'A: ' + lbl, w = A.textW(s) + 10; panel(Math.round(Wr / 2 - w / 2), Hr - 22, w, 13, '#8a96aa'); T(s, Wr / 2, Hr - 19, '#ffffff', 1, 'center');
  }
  drawChip();
  if (help > 0) {
    const L = [ctrl8() ? 'LEVA: L\'EROE VA DOVE PREMI   B: CORRI' : 'CROCE: CAMMINA E GIRA   B: CORRI'].concat(freeAim() ? ['A: PARLA, APRI', 'A TENUTO: TENDI E MIRA (LEVA O DITO)   LASCIA: TIRA', "C: BALZO ALL'INDIETRO"] : CC().help, bowOn() ? ['MIRINO ACCANTO A C: MIRA AUTOMATICA O LIBERA'] : [], ['START: MENU   SELECT: MAPPA', 'DITO SULLO SCHERMO: GIRA LA VISUALE']), w = Math.max(...L.map(l => A.textW(l))) + 16, y0 = Math.round(Hr * 0.27);
    panel(Math.round(Wr / 2 - w / 2), y0, w, 8 + L.length * 10, '#8a96aa'); L.forEach((l, i) => T(l, Wr / 2, y0 + 5 + i * 10, i > 0 && i <= CC().help.length ? CC().col : '#e6e9f2', 1, 'center'));
  }
  if ((D ? dCellAt(hero.x, hero.z) === DT.LAVA : lavaAt(hero.x, hero.z)) && !fireProof() && Math.floor(time * 6) % 2) { hg.fillStyle = 'rgba(255,80,20,.18)'; hg.fillRect(0, 0, Wr, Hr); }
  if (hero.flash > 0) { hg.fillStyle = 'rgba(255,40,40,' + (hero.flash * 0.8).toFixed(2) + ')'; hg.fillRect(0, 0, Wr, Hr); }
  if (dialog) drawDialog();
  if (shop) (shop.board ? drawBoard : shop.sk ? drawSkills : drawShop)();
  if (loot) drawLoot();
  if (mapOpen) drawMap();
  if (save.opt.cnt && !menu && !mapOpen && !shop && MIS.fps) T(MIS.fps + ' FPS  MIN ' + MIS.min, Wr / 2, Hr - 8, MIS.min < 30 ? '#ffb070' : '#9af0b0', 1, 'center');
  if (menu) drawMenu();
  if (st === 'dead') drawDeath();
  if (fade) { hg.fillStyle = 'rgba(0,0,0,' + Math.max(0, Math.min(1, fade.ph === 0 ? fade.t / 0.35 : 1 - fade.t / 0.35)).toFixed(2) + ')'; hg.fillRect(0, 0, Wr, Hr); }
}
// la barra dell'energia (mana per il mago): un quadretto per punto
function drawEnergy(x, y) {
  const n = MAXEN(), low = hero.enFl > 0 && Math.floor(time * 10) % 2, c = CC().enC;
  hg.fillStyle = '#0b0a12'; hg.fillRect(x - 1, y - 1, n * 4 + 1, 6);
  for (let i = 0; i < n; i++) { hg.fillStyle = i < hero.en ? (low ? '#ff5a5a' : c) : (low ? '#5a2030' : '#2a2c3e'); hg.fillRect(x + i * 4, y, 3, 4); }
}
// il riquadro dell'abilità accanto al tasto C (un tocco la cambia) e la barra del colpo caricato
function drawChip() {
  chip = null; chipM = null;
  if (st !== 'play' || dialog || shop || loot || menu || mapOpen || inCasa() || !hero || hero.dead) return;
  const id = curSkill(), S = SKL[id], L = skillsOf(cls()), cw = 18, col = CC().col;
  const cx = btnC ? Math.round(btnC.x - cw - 4) : Wr - insetR - cw - 4, cy = btnC ? Math.round(btnC.y + btnC.w / 2 - cw / 2) : Hr - cw - 8;
  chip = { x: cx, y: cy, w: cw, h: cw };
  const ok = id === 'parata' ? hero.guard <= 0 : hero.en >= S.cost;
  panel(cx, cy, cw, cw, hero.block ? '#ffffff' : ok ? col : '#5a6478'); hg.globalAlpha = ok ? 1 : 0.4; hg.drawImage(skIcon(id), cx + 3, cy + 3); hg.globalAlpha = 1;
  if (S.cost) T(String(S.cost), cx - 2, cy + 6, ok ? CC().enC : '#ff8f8f', 1, 'right');
  if (L.length > 1) for (let i = 0; i < L.length; i++) { hg.fillStyle = L[i] === id ? col : '#5a6478'; hg.fillRect(Math.round(cx + cw / 2 - L.length * 2) + i * 4, cy + cw + 1, 3, 2); }
  // l'arciere ha un secondo riquadro, sopra: lo stile dell'arco (un tocco lo cambia). Mirino pieno: mira automatica; mirino aperto e dorato: mira libera
  if (bowOn()) {
    // la prima volta che compare, due parole su che cos'è
    if (!save.flags.miraTip) { save.flags.miraTip = 1; toasts.push({ t: "L'ARCO HA DUE STILI: IL MIRINO ACCANTO AL TASTO C PASSA ALLA MIRA LIBERA (PER LA CACCIA)", c: '#ffd23f', life: 14 }); }
    const my = cy - cw - 9, fr = freeAim(), c2 = fr ? '#ffd23f' : '#9aa6bd', mx = cx + 9, mc = my + 9;
    chipM = { x: cx, y: my, w: cw, h: cw }; panel(cx, my, cw, cw, c2); hg.fillStyle = c2;
    hg.fillRect(mx - 6, mc, 4, 1); hg.fillRect(mx + 3, mc, 4, 1); hg.fillRect(mx, mc - 6, 1, 4); hg.fillRect(mx, mc + 3, 1, 4);
    if (!fr) { hg.fillRect(mx - 1, mc - 1, 3, 3); hg.fillRect(mx - 4, mc - 4, 2, 1); hg.fillRect(mx - 4, mc - 4, 1, 2); hg.fillRect(mx + 3, mc - 4, 2, 1); hg.fillRect(mx + 4, mc - 4, 1, 2); hg.fillRect(mx - 4, mc + 4, 2, 1); hg.fillRect(mx - 4, mc + 3, 1, 2); hg.fillRect(mx + 3, mc + 4, 2, 1); hg.fillRect(mx + 4, mc + 3, 1, 2); }
    T(fr ? 'MIRA LIBERA' : 'MIRA AUTO', cx - 2, my + 6, c2, 1, 'right');
  }
  if (hero.chg > 0) { const w = 34, x = Math.round(Wr / 2 - w / 2), y = Hr - 31, full = hero.chg >= 1; hg.fillStyle = '#0b0a12'; hg.fillRect(x - 1, y - 1, w + 2, 5); hg.fillStyle = full && Math.floor(time * 12) % 2 ? '#ffffff' : col; hg.fillRect(x, y, Math.round(w * hero.chg), 3); }
}
function chipHit(x, y, c = chip) {
  if (st !== 'play' || !c || dialog || shop || loot || menu || mapOpen || fade) return false;
  const hx = (x - OX) / K, hy = (y - OY) / K; return hx > c.x - 5 && hx < c.x + c.w + 5 && hy > c.y - 4 && hy < c.y + c.h + 5;
}
function drawDialog() {
  const w = dialogW(), x = Math.round(Wr / 2 - w / 2), lines = dialog.lines[dialog.i], h = 14 + lines.length * 9 + (dialog.name ? 6 : 0), y = Hr - h - 6;
  panel(x, y, w, h);
  let yy = y + 5;
  if (dialog.name) { const nw = A.textW(dialog.name) + 8; panel(x + 6, y - 6, nw, 11, '#ffd23f'); T(dialog.name, x + 10, y - 4, '#ffd23f'); yy += 5; }
  let left = Math.floor(dialog.ch);
  for (const l of lines) { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; T(s, x + 8, yy, '#ffffff'); yy += 9; }
  const tot = lines.join(' ').length;
  if (dialog.opts && dialog.i === dialog.lines.length - 1 && dialog.ch >= tot) {
    let ow = 0; for (const o of dialog.opts) ow = Math.max(ow, A.textW(o)); ow += 22;
    const oh = dialog.opts.length * 10 + 7, ox = x + w - ow - 4, oy = y - oh - 3; panel(ox, oy, ow, oh);
    dialog.opts.forEach((o, i) => { if (i === dialog.sel) { hg.fillStyle = 'rgba(255,210,63,.18)'; hg.fillRect(ox + 2, oy + 3 + i * 10, ow - 4, 10); T('>', ox + 5, oy + 5 + i * 10, '#ffd23f'); } T(o, ox + 14, oy + 5 + i * 10, i === dialog.sel ? '#ffd23f' : '#e6e9f2'); });
  } else if (dialog.ch >= tot && Math.floor(time * 3) % 2) { hg.fillStyle = '#ffd23f'; hg.fillRect(x + w - 10, y + h - 7, 5, 2); hg.fillRect(x + w - 9, y + h - 5, 3, 1); }
}
function drawLoot() {
  const w = Math.min(260, dialogW()), h = 66, x = Math.round(Wr / 2 - w / 2), y = Math.round(Hr / 2 - h / 2) - 6, it = IT[loot.id];
  const r = it ? it.r : 0; panel(x, y, w, h, RAR[r]);
  T('HAI TROVATO', Wr / 2, y + 5, '#c9d3e6', 1, 'center');
  const ic = loot.id === 'monete' ? ICOIN : itemIcon(loot.id), name = loot.txt || it.n, nw = A.textW(name, 1) + 16;
  if (ic) hg.drawImage(ic, Math.round(Wr / 2 - nw / 2), y + 15);
  T(name, Math.round(Wr / 2 - nw / 2) + 16, y + 17, RAR[r]);
  if (it && it.r) T(RARN[r], Wr / 2, y + 28, RAR[r], 1, 'center');
  if (it && loot.id !== 'pozione') { const st2 = statLine(it); const L = A.wrap(it.d, w - 16); T(L[0], Wr / 2, y + 37, '#e6e9f2', 1, 'center'); if (st2) T(st2, Wr / 2, y + 46, '#9af0b0', 1, 'center'); }
  if (loot.note) T(loot.note, Wr / 2, y + 55, '#ffd23f', 1, 'center');
  if (loot.t > 0.6 && Math.floor(time * 2.5) % 2) T('A', x + w - 10, y + h - 9, '#ffffff');
  // un po' di scintille per i leggendari
  if (r === 3) for (let i = 0; i < 8; i++) { const a = time * 1.3 + i * TAU / 8; hg.fillStyle = i % 2 ? '#ffb02e' : '#fff4b0'; hg.fillRect(Math.round(Wr / 2 + Math.cos(a) * (w / 2 + 4)), Math.round(y + h / 2 + Math.sin(a) * (h / 2 + 4)), 2, 2); }
}
function drawShop() {
  const list = shopList(), rows = list.concat([['esci', 0]]), VIS = Math.max(4, Math.min(rows.length, Math.floor((Hr - 74) / 12)));
  if (shop.sel < shop.top) shop.top = shop.sel; if (shop.sel >= shop.top + VIS) shop.top = shop.sel - VIS + 1;
  const w = Math.min(270, dialogW()), h = 20 + VIS * 12 + 30, x = Math.round(Wr / 2 - w / 2), y = Math.round(Hr / 2 - h / 2);
  panel(x, y, w, h); T(SHOPS[shop.who].title, x + 8, y + 5, '#ffd23f'); hg.drawImage(ICOIN, x + w - 50, y + 3); T(String(save.coins), x + w - 36, y + 6, '#ffd23f');
  { const sc = sconto(shop.who); if (sc > 0) { const t2 = 'SCONTO ' + Math.round(sc * 100) + '%', tw = A.textW(t2) + 8; panel(x + w - tw - 4, y - 10, tw, 11, '#9af0b0'); T(t2, x + w - tw, y - 8, '#9af0b0'); } }
  for (let i = shop.top; i < Math.min(rows.length, shop.top + VIS); i++) {
    const [id, price] = rows[i], yy = y + 20 + (i - shop.top) * 12, on = i === shop.sel, owned = shopOwned(id);
    if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 2, w - 8, 11); }
    if (id === 'esci') { T('ESCI', x + 22, yy, on ? '#ffffff' : '#8a96aa'); continue; }
    hg.drawImage(itemIcon(id), x + 6, yy - 3);
    T(IT[id].n, x + 22, yy, owned ? '#5a6478' : on ? '#ffffff' : RAR[IT[id].r] === RAR[0] ? '#c9d3e6' : RAR[IT[id].r]);
    T(owned ? 'PRESO' : id === 'pozione' ? price + '  x' + save.pot : id === 'elisir' ? price + '  x' + (save.eli || 0) : price + '', x + w - 10, yy, owned ? '#5a6478' : save.coins >= price ? '#ffd23f' : '#ff8f8f', 1, 'right');
  }
  if (shop.top > 0) T('^', x + w - 10, y + 13, '#8a96aa', 1, 'right');
  if (shop.top + VIS < rows.length) T('v', x + w - 10, y + 20 + VIS * 12 - 3, '#8a96aa', 1, 'right');
  const sel = rows[shop.sel][0];
  if (sel !== 'esci') { const it = IT[sel], st2 = statLine(it), no = it.t === 'scudo' && !CC().shield; A.wrap(it.d, w - 16).slice(0, 1).forEach(l => T(l, Wr / 2, y + h - 22, '#a9c6e3', 1, 'center')); if (no) T('LO SCUDO LO PORTA SOLO IL CAVALIERE', Wr / 2, y + h - 11, '#ff8f8f', 1, 'center'); else if (st2) T(st2, Wr / 2, y + h - 11, '#9af0b0', 1, 'center'); }
}
// la bacheca di una città: i quattro incarichi, e sotto il foglio di quello scelto
function drawBoard() {
  const b = shop.board, ids = boardIds(b.id), w = Math.min(292, dialogW()), nl = Math.max(4, Math.min(6, Math.floor((Hr - 60 - ids.length * 13) / 9))), h = 26 + ids.length * 13 + nl * 9 + 24, x = Math.round(Wr / 2 - w / 2), y = Math.max(3, Math.round(Hr / 2 - h / 2));
  panel(x, y, w, h); T('BACHECA DI ' + b.city, x + 8, y + 5, '#ffd23f');
  const sc = Math.min(20, jobsDone(b.city) * 5), on2 = save.flags['on_' + b.id]; T('SCONTO ' + sc + '%' + (on2 ? ' ♥' : ''), x + w - 8, y + 5, sc ? '#9af0b0' : '#5a6478', 1, 'right');
  ids.forEach((id, i) => {
    const j = JOBS[id], s2 = jst(id), k = s2 ? s2.s : 0, yy = y + 21 + i * 13, on = i === shop.sel;
    if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 12); }
    hg.fillStyle = '#0b0a12'; hg.fillRect(x + 7, yy, 6, 6); hg.fillStyle = ['#ffd23f', '#7ab8ff', '#5af07a', '#4a5468'][k]; hg.fillRect(x + 8, yy + 1, 4, 4);
    T(j.n, x + 17, yy, k === 3 ? '#5a6478' : on ? '#ffffff' : j.base ? '#a8e0a0' : '#c9d3e6');
    if (k === 0) { hg.drawImage(ICOIN, x + w - 22, yy - 3); T(String(j.coins), x + w - 24, yy, '#ffd23f', 1, 'right'); }
    else T(k === 3 ? 'FATTO' : k === 2 ? 'PAGA!' : j.q ? Math.min(j.q, s2.n) + '/' + j.q : '...', x + w - 9, yy, k === 3 ? '#5a6478' : k === 2 ? '#5af07a' : '#7ab8ff', 1, 'right');
  });
  const id = ids[shop.sel]; if (!id) return;
  const j = JOBS[id], s2 = jst(id), k = s2 ? s2.s : 0, y2 = y + 24 + ids.length * 13;
  hg.fillStyle = '#3a4458'; hg.fillRect(x + 6, y2 - 3, w - 12, 1);
  A.wrap(k === 0 ? j.txt : k === 3 ? j.txt : jobLine(id), w - 16).slice(0, nl).forEach((l, i) => T(l, x + 8, y2 + i * 9, k === 3 ? '#5a6478' : '#a9c6e3', 1, 'left', null));
  T(on2 ? 'SEI CITTADINO ONORARIO DI ' + b.city : 'FIRMATO: ' + j.by, x + 8, y + h - 21, on2 ? '#ff8aa0' : '#8a96aa', 1, 'left', null);
  T(k === 0 ? "A: ACCETTA L'INCARICO" : k === 2 ? 'A: RISCUOTI ' + j.coins + ' MONETE' : k === 1 ? (j.k === 'consegna' ? 'IN CORSO: PAGA CHI RICEVE' : 'INCARICO IN CORSO') : 'INCARICO PAGATO', x + 8, y + h - 11, k === 0 || k === 2 ? '#ffd23f' : '#5a6478');
  T('B: CHIUDI', x + w - 8, y + h - 11, '#5a6478', 1, 'right');
}
function boardKey(name) {
  const ids = boardIds(shop.board.id);
  if (name === 'up' || name === 'down') { shop.sel = (shop.sel + (name === 'down' ? 1 : ids.length - 1)) % ids.length; tone(1318, 0.03); return; }
  if (name === 'b' || name === 'start') { shop = null; tone(660, 0.04); return; }
  if (name !== 'a') return;
  const id = ids[shop.sel], s2 = jst(id);
  if (!s2) jobAccept(id); else if (s2.s === 2) jobPay(id); else tone(200, 0.1, 'square', 0.03);
  shop.sel = Math.min(shop.sel, boardIds(shop.board.id).length - 1);
}
// riga con le statistiche di un oggetto
function statLine(it) { return it ? [it.att ? 'ATT ' + it.att : '', it.dif ? 'DIF ' + it.dif : '', it.hp ? '+' + it.hp / 2 + ' CUORE' : '', it.vel ? '+' + Math.round(it.vel * 100) + '% VEL' : '', it.regen ? 'RIGENERA' : '', it.luck ? 'MONETE x2' : ''].filter(Boolean).join('  ') : ''; }
// la mappa è una finestra sul mondo: una zona (4096 unità) oppure tutto. La croce la sposta, A cambia ingrandimento
const mapV = { x: 2048, z: 2048, span: 4096 };
function clampMap() { const h = MODO && mapV.span < W.WS ? 0 : mapV.span / 2; mapV.x = Math.max(h, Math.min(W.WS - h, mapV.x)); mapV.z = Math.max(W.Z0 + h, Math.min(W.WS - h, mapV.z)); }   // (nel Grande Viaggio il mirino arriva fino ai bordi della terra)
const mapMe = () => inCasa() ? { x: D.outX, z: D.outZ, yaw: D.outYaw } : hero;
function openMap() { mapOpen = true; if (hero && (!D || D.def.casa)) { const m = mapMe(); mapV.span = 4096; mapV.x = m.x; mapV.z = m.z; clampMap(); } }
function drawMap() {
  if (D && !D.def.casa) return drawDungeonMap();
  const hero = mapMe();
  const S = Math.min(Hr - 37, Wr - insetL - insetR - 10, 256), x0 = Math.round(Wr / 2 - S / 2), y0 = 16, span = mapV.span, k = S / span, wx0 = mapV.x - span / 2, wz0 = mapV.z - span / 2;
  hg.fillStyle = 'rgba(8,10,16,.88)'; hg.fillRect(0, 0, Wr, Hr);
  T(MODO ? (span < W.WS ? 'LA CARTA DI LUMEN' : 'TUTTA LA TERRA DI LUMEN') : span < W.WS ? 'LA MAPPA' : 'IL MONDO CONOSCIUTO', Wr / 2, 5, '#ffd23f', 1, 'center');
  const mk2 = W.mapImg.width / W.WS;
  hg.imageSmoothingEnabled = false; hg.drawImage(W.mapImg, wx0 * mk2, (wz0 - W.Z0) * mk2, span * mk2, span * mk2, x0, y0, S, S);
  const i0 = Math.floor(wx0 / 64), j0 = Math.floor(wz0 / 64), nc = Math.ceil(span / 64);
  for (let j = j0; j <= j0 + nc; j++) for (let i = i0; i <= i0 + nc; i++) {
    if (MODO || i < 0 || j < -MGN || i >= MG || j >= MG || seen[(j + MGN) * MG + i]) continue;
    const ax = Math.max(x0, Math.floor(x0 + (i * 64 - wx0) * k)), ay = Math.max(y0, Math.floor(y0 + (j * 64 - wz0) * k)), bx = Math.min(x0 + S, Math.ceil(x0 + (i * 64 + 64 - wx0) * k)), by = Math.min(y0 + S, Math.ceil(y0 + (j * 64 + 64 - wz0) * k));
    if (bx > ax && by > ay) { hg.fillStyle = (i + j) % 2 ? '#2a2638' : '#24202f'; hg.fillRect(ax, ay, bx - ax, by - ay); }
  }
  const PX = x => Math.round(x0 + (x - wx0) * k), PZ = z => Math.round(y0 + (z - wz0) * k), inV = (x, z) => x >= wx0 && z >= wz0 && x <= wx0 + span && z <= wz0 + span;
  const dot = (x, z, c, s = 2, edge) => {
    if (!inV(x, z)) { if (!edge) return; x = Math.max(wx0, Math.min(wx0 + span, x)); z = Math.max(wz0, Math.min(wz0 + span, z)); }
    hg.fillStyle = '#0b0a12'; hg.fillRect(PX(x) - s, PZ(z) - s, s * 2 + 1, s * 2 + 1); hg.fillStyle = c; hg.fillRect(PX(x) - s + 1, PZ(z) - s + 1, s * 2 - 1, s * 2 - 1);
  };
  const isSeen = (x, z) => MODO || seen[Math.max(0, Math.min(MGZ - 1, Math.floor(z / 64) + MGN)) * MG + Math.min(MG - 1, Math.floor(x / 64))];
  if (MODO) {   // nel Grande Viaggio la carta è completa da subito: i luoghi con il loro nome, il mirino al centro, il segnalino
    for (const p of W.PLACES) { if (W.TOWNS.some(t => t.name === p[3])) continue; dot(p[0], p[1], '#c9d3e6', 1); if (span < W.WS && inV(p[0], p[1])) T(p[3], Math.max(x0 + 2, Math.min(x0 + S - 2, PX(p[0]))), PZ(p[1]) - 10, '#c9d3e6', 1, 'center'); }
  }
  for (const t of W.TOWNS) if (t.home || isSeen(t.x, t.z)) { dot(t.x, t.z, t.big ? '#ffffff' : '#c9d3e6', t.big ? 2 : 1); if (span < W.WS && inV(t.x, t.z)) T(t.name, Math.max(x0 + 2, Math.min(x0 + S - 2, PX(t.x))), PZ(t.z) - 11, '#ffffff', 1, 'center'); }
  for (const d of doors) if (d.cave ? dsave(d.id).vis : isSeen(d.x, d.z)) dot(d.x, d.z, d.cave ? '#c8a0ff' : '#4ae0e8');
  if (save.flags.mappa) for (const c of chests) if (c.r >= 2 && !save.chests[c.id] && Math.floor(time * 3) % 2) dot(c.x, c.z, '#ffb02e', 2);
  const q = curTrack(), tg = MODO ? null : q ? questTarget(q) : null; if (tg && Math.floor(time * 4) % 2) dot(tg[0], tg[1], '#ffd23f', 3, true);
  if (MODO) { if (save.segno) dot(save.segno[0], save.segno[1], '#ff8a2a', 3, true); const mx = Math.round(x0 + S / 2), my = Math.round(y0 + S / 2); hg.fillStyle = '#0b0a12'; hg.fillRect(mx - 6, my - 1, 13, 3); hg.fillRect(mx - 1, my - 6, 3, 13); hg.fillStyle = '#ffffff'; hg.fillRect(mx - 5, my, 11, 1); hg.fillRect(mx, my - 5, 1, 11); }
  // freccia dell'eroe
  if (inV(hero.x, hero.z)) { const hx = x0 + (hero.x - wx0) * k, hz = y0 + (hero.z - wz0) * k; for (let i = -1; i <= 5; i++) { const px = hx + Math.cos(hero.yaw) * i, pz = hz + Math.sin(hero.yaw) * i; hg.fillStyle = i > 3 ? '#ff4a3a' : '#ffffff'; hg.fillRect(Math.round(px) - 1, Math.round(pz) - 1, 3, 3); } }
  else if (Math.floor(time * 4) % 2) dot(hero.x, hero.z, '#ff4a3a', 2, true);
  let n = 0, tot = 0; for (let i = 0; i < seen.length; i++) if (LAND[i]) { tot++; n += seen[i]; }
  T(MODO ? '' : curPlace || '', x0, y0 + S + 3, '#e6e9f2'); T(MODO ? (save.segno ? 'SEGNALINO A ' + Math.round(Math.hypot(save.segno[0] - hero.x, save.segno[1] - hero.z) / 10) * 10 + ' M' : 'NESSUN SEGNALINO') : 'ESPLORATO ' + Math.min(100, Math.round(n / Math.max(1, tot) * 100)) + '%', x0 + S, y0 + S + 3, MODO ? '#ff8a2a' : '#9af0b0', 1, 'right');
  T('A: ' + (span < W.WS ? 'MONDO' : 'ZONA') + (MODO ? '   C: SEGNALINO AL CENTRO' : '   CROCE: SPOSTA') + '   B: CHIUDI', Wr / 2, Hr - 9, MODO ? '#a9c6e3' : '#5a6478', 1, 'center', null);
}
const TABS = ['EROE', 'BORSA', 'MISSIONI', 'OPZIONI'];
function menuRows() {
  if (menu.tab === 0) return menu.pick ? save.inv.filter(id => IT[id].t === menu.pick).concat(['-']) : SLOTS.map(s => s[0]).concat(['abil']);
  if (menu.tab === 1) return ['pozione'].concat(save.eli ? ['elisir'] : [], save.flags.mappa ? ['mappa'] : [], save.flags.sigillo ? ['sigillo'] : []);
  if (menu.tab === 2) return MODO ? [] : QALL.filter(q => q === 'main' || save.q[q] > 0).concat(Object.keys(save.jobs || {}).filter(id => JOBS[id] && save.jobs[id].s < 3).map(id => 'J:' + id));
  return ['vol', 'mus', 'giorno', 'vib', 'comandi'].concat(bowOn() ? ['mira'] : [], ['misure', 'salva', 'esci']);
}
function drawMenu() {
  hg.fillStyle = 'rgba(8,10,16,.82)'; hg.fillRect(0, 0, Wr, Hr);
  const w = Math.min(300, Wr - insetL - insetR - 4), x = Math.round(Wr / 2 - w / 2), y = 6, h = Hr - 12;
  panel(x, y, w, h);
  let tx = x + 8; TABS.forEach((t, i) => { const on = i === menu.tab, tw = A.textW(t) + 8; if (on) { hg.fillStyle = '#ffd23f'; hg.fillRect(tx - 2, y + 4, tw, 11); } T(t, tx + 2, y + 6, on ? '#10121c' : '#8a96aa', 1, 'left', on ? null : undefined); tx += tw + 4; });
  T('< >', x + w - 8, y + 6, '#5a6478', 1, 'right');
  const rows = menuRows(), top = y + 22;
  if (menu.tab === 0) {
    T('ATT ' + ATT() + '   DIF ' + DIF() + '   CUORI ' + MAXHP() / 2 + '   VEL ' + Math.round(VEL() * 100) + '%', x + 8, top, '#9af0b0');
    if (!menu.pick) SLOTS.forEach(([k, n], i) => {
      const yy = top + 13 + i * 14, on = i === menu.sel, id = save.eq[k], it = id ? IT[id] : null;
      if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); }
      T(n, x + 8, yy, '#8a96aa'); if (k === 'scudo' && !CC().shield) T('SOLO IL CAVALIERE', x + 94, yy, '#5a6478'); else if (it) { hg.drawImage(itemIcon(id), x + 78, yy - 3); T(it.n, x + 94, yy, RAR[it.r]); } else T('-', x + 94, yy, '#5a6478');
    });
    // sotto l'equipaggiamento: la classe e la sua abilità (C)
    if (!menu.pick) { const i = SLOTS.length, yy = top + 13 + i * 14, on = i === menu.sel, id = curSkill(); if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); } T(CC().n, x + 8, yy, CC().col); hg.drawImage(skIcon(id), x + 78, yy - 3); T(SKL[id].n + '  (C)', x + 94, yy, '#ffffff'); }
    else { T('SCEGLI: ' + SLOTS.find(s => s[0] === menu.pick)[1], x + 8, top + 12, '#ffd23f');
      rows.forEach((id, i) => { const yy = top + 25 + i * 12, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 12); } if (id === '-') { T('TOGLI', x + 26, yy, on ? '#fff' : '#8a96aa'); return; } const it = IT[id]; hg.drawImage(itemIcon(id), x + 8, yy - 3); T(it.n + (save.eq[menu.pick] === id ? '  (IN USO)' : ''), x + 26, yy, RAR[it.r]); }); }
    const sel = menu.pick ? rows[menu.sel] : save.eq[rows[menu.sel]];
    if (sel && sel !== '-' && IT[sel]) { const it = IT[sel], s = statLine(it); A.wrap(it.d, w - 16).slice(0, 2).forEach((l, i) => T(l, x + 8, y + h - 30 + i * 9, '#a9c6e3')); if (s) T(s, x + w - 8, y + h - 12, '#9af0b0', 1, 'right'); }
    if (!menu.pick && rows[menu.sel] === 'abil') A.wrap(SKL[curSkill()].d, w - 16).slice(0, 2).forEach((l, i) => T(l, x + 8, y + h - 30 + i * 9, '#a9c6e3'));
    T(menu.pick ? 'A: USA   B: INDIETRO' : rows[menu.sel] === 'abil' ? 'A: CAMBIA ABILITÀ' : 'A: CAMBIA', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else if (menu.tab === 1) {
    rows.forEach((id, i) => { const yy = top + 4 + i * 14, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); } hg.drawImage(itemIcon(id), x + 8, yy - 3); T(id === 'pozione' ? 'POZIONI  x' + save.pot : id === 'elisir' ? 'ELISIR  x' + save.eli : IT[id].n, x + 26, yy, '#ffffff'); });
    let yy = top + 8 + rows.length * 14;
    hg.drawImage(ICOIN, x + 8, yy - 3); T('MONETE  ' + save.coins, x + 26, yy, '#ffd23f'); yy += 14;
    if (save.q.ferro === 1 || save.q.ferro === 2) { hg.drawImage(IORE, x + 8, yy - 3); T('MINERALE DI FERRO  ' + Math.min(3, save.ore) + '/3', x + 26, yy, '#ffb070'); yy += 14; }
    T('CUORI DI CRISTALLO TROVATI: ' + save.hearts, x + 8, yy + 2, '#ff8aa0');
    if (save.q.main >= 4) { yy += 14; T("PIETRE DELL'ALBA", x + 8, yy + 2, '#ffd23f'); DS.ORDER.forEach((id, i) => { hg.globalAlpha = sanctDone(id) ? 1 : 0.22; hg.drawImage(itemIcon(DS.DEF[id].gem), x + 104 + i * 15, yy - 1); hg.globalAlpha = 1; }); }
    T(rows[menu.sel] === 'pozione' ? 'A: BEVI UNA POZIONE (+3 CUORI)' : rows[menu.sel] === 'elisir' ? 'A: BEVI UN ELISIR (TUTTI I CUORI)' : rows[menu.sel] === 'mappa' ? 'I FORZIERI PIÙ RICCHI SONO SULLA MAPPA (SELECT)' : rows[menu.sel] === 'sigillo' ? 'APRE I SANTUARI, UNO ALLA VOLTA' : '', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else if (menu.tab === 2) {
    const VIS = Math.max(2, Math.floor((h - 38) / 26)); menu.top = Math.max(0, Math.min(menu.top || 0, rows.length - VIS)); if (menu.sel < menu.top) menu.top = menu.sel; if (menu.sel >= menu.top + VIS) menu.top = menu.sel - VIS + 1;
    rows.slice(menu.top, menu.top + VIS).forEach((q, k0) => { const i = k0 + menu.top, yy = top + 2 + k0 * 26, on = i === menu.sel, done = questDone(q), rdy = isJob(q) && jst(q.slice(2)).s === 2; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 24); } T((curTrack() === q ? '> ' : '') + qName(q), x + 8, yy, done ? '#5a6478' : q === 'main' ? '#ffd23f' : rdy ? '#9af0b0' : isJob(q) ? '#ffe8a0' : '#ffffff'); A.wrap(questLine(q), w - 20).slice(0, 2).forEach((l, k) => T(l, x + 14, yy + 9 + k * 8, done ? '#5a6478' : '#a9c6e3', 1, 'left', null)); });
    if (menu.top > 0) T('^', x + w - 10, top - 6, '#8a96aa', 1, 'right'); if (menu.top + VIS < rows.length) T('v', x + w - 10, top + VIS * 26 - 6, '#8a96aa', 1, 'right');
    T('A: SEGUI QUESTA MISSIONE', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else if (menu.mis) drawMisure(x, top, w, y + h);
  else {
    const V = ['SPENTO', 'MEDIO', 'ALTO'];
    const L = { vol: 'VOLUME: ' + V[volLevel], mus: 'MUSICA: ' + (MU.on ? 'SÌ' : 'NO'), giorno: 'GIORNO E NOTTE: ' + (save.opt.day !== false ? 'SÌ' : 'SEMPRE GIORNO'), vib: 'VIBRAZIONE: ' + (save.opt.vib ? 'SÌ' : 'NO'), comandi: 'COMANDI: ' + (ctrl8() ? 'LEVA A 8 DIREZIONI' : 'CLASSICI (L\'EROE RUOTA)'), mira: 'ARCO: MIRA ' + (freeAim() ? 'LIBERA (PER LA CACCIA)' : 'AUTOMATICA'), misure: 'MISURE DEL TELEFONO', salva: 'SALVA ORA', esci: 'TORNA AL MENU DI PIXEL BOX' };
    const ph = rows.length > 8 ? 12 : 14;
    rows.forEach((k, i) => { const yy = top + 4 + i * ph, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, ph - 1); } T(L[k], x + 10, yy, on ? '#ffffff' : '#c9d3e6'); });
    const hm = Math.floor(save.time / 3600), mm = Math.floor(save.time / 60) % 60;
    T('TEMPO DI GIOCO ' + hm + ':' + String(mm).padStart(2, '0'), x + 8, y + h - 24, '#8a96aa', 1, 'left', null);
    T('IL GIOCO SI SALVA DA SOLO', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  }
}
function misFrame() {
  const tn = performance.now(), f = MIS.fr;
  if (st === 'play' && !menu && !frozen && MIS.last) { const d = tn - MIS.last; if (d < 1000) f.push(tn, d); while (f.length && f[0] < tn - 10000) { f.shift(); f.shift(); } if (tn - MIS.ts > 500) { MIS.ts = tn; misStat(); } }
  MIS.last = tn;
}
function misStat() {
  const f = MIS.fr; if (f.length < 4) return;
  let sum = 0, worst = 0, sc = 0; for (let i = 1; i < f.length; i += 2) { const d = f[i]; sum += d; if (d > worst) worst = d; if (d > 50) sc++; }
  MIS.fps = Math.round(500 * f.length / sum); MIS.min = Math.round(1000 / worst); MIS.scatti = sc;
}
function misPeso() { let b = 0; for (const k in W) { const v = W[k]; if (v && v.BYTES_PER_ELEMENT && v.byteLength) b += v.byteLength; } MIS.dati = b; MIS.tex0 = MIS.tex; }
function misApri() {
  MIS.sp = null; MIS.pers = null; misStat();
  try { if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(e => { MIS.sp = e; }, () => { MIS.sp = false; }); else MIS.sp = false; } catch (e) { MIS.sp = false; }
  try { if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(p => { MIS.pers = !!p; }, () => { MIS.pers = false; }); else MIS.pers = false; } catch (e) { MIS.pers = false; }
  if (!MIS.gpu && gl) { try { const x = gl.getExtension('WEBGL_debug_renderer_info'); MIS.gpu = String(x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toUpperCase().replace(/[^A-Z0-9 .,()\/+-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 26) || '?'; MIS.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE); } catch (e) { MIS.gpu = '?'; } }
}
function drawMisure(x, top, w, bot) {
  const sec = v => (v / 1000).toFixed(1) + ' S', mb = b => b >= 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : (b / 1048576).toFixed(b < 10485760 ? 1 : 0) + ' MB', dpr = window.devicePixelRatio || 1;
  const L = [['IL MONDO NASCE IN', sec(MIS.wall)], ['  DI CUI CALCOLO', sec(MIS.calc)], ['  SOLO TERRE E OGGETTI', sec(MIS.fasi['MODELLO LE TERRE DI LUMEN'] || 0)],
    ['CONSERVATO', STO.stato === 'letto' ? 'SÌ, LETTO IN ' + sec(STO.letto) : STO.stato === 'spento' ? 'NON SI PUÒ' : STO.scritto ? 'DA ADESSO SÌ' : STO.err ? 'NO: ' + STO.err : 'LO STO SCRIVENDO'],
    ['IMMAGINI AL SECONDO', MIS.fps ? MIS.fps + ' (MINIMO ' + MIS.min + ')' : 'PRIMA GIOCA UN PO\''], ['SCATTI IN 10 SECONDI', MIS.fps ? String(MIS.scatti) : '-'],
    ['SCHERMO', Math.round(screen.width * dpr) + ' X ' + Math.round(screen.height * dpr)], ['DISEGNO 3D', W3 + ' X ' + H3], ['GRAFICA', (MIS.gpu || '?').slice(0, 16) + ', ' + (MIS.maxTex || '?')],
    ['MONDO IN MEMORIA', 'CIRCA ' + mb(MIS.tex0 + MIS.dati)], ['SPAZIO USATO', MIS.sp ? mb(MIS.sp.usage || 0) + ' DI ' + mb(MIS.sp.quota || 0) : MIS.sp === false ? 'NON SI SA' : '...'], ['SPAZIO PROTETTO', MIS.pers === null ? '...' : MIS.pers ? 'SÌ' : 'NO']];
  T('MISURE DEL TELEFONO', x + 8, top, '#ffd23f');
  L.forEach((l, i) => { const yy = top + 12 + i * 9; T(l[0], x + 8, yy, '#a9c6e3', 1, 'left', null); T(l[1], x + w - 8, yy, '#ffffff', 1, 'right', null); });
  T('A: CONTATORE SULLO SCHERMO: ' + (save.opt.cnt ? 'SÌ' : 'NO'), x + 8, bot - 24, '#9af0b0', 1, 'left', null);
  T('B: INDIETRO', x + 8, bot - 12, '#5a6478', 1, 'left', null);
}
function drawDeath() {
  death += 1 / 60;
  hg.fillStyle = 'rgba(30,0,8,' + Math.min(0.75, death).toFixed(2) + ')'; hg.fillRect(0, 0, Wr, Hr);
  if (death > 0.6) { T('SEI CADUTO...', Wr / 2, Hr / 2 - 22, '#ff6a6a', 2, 'center'); T(D ? (D.def.up ? "TI RISVEGLI ALL'INIZIO DEL PIANO." : "TI RISVEGLI ALL'INGRESSO.") : 'TI RISVEGLI AL POZZO DEL BORGO.', Wr / 2, Hr / 2, '#e6e9f2', 1, 'center'); if (Math.floor(time * 2.5) % 2) T('A: CONTINUA', Wr / 2, Hr / 2 + 16, '#ffd23f', 1, 'center'); }
}
function drawLoading() {
  hg.fillStyle = '#0b0d14'; hg.fillRect(0, 0, Wr, Hr);
  T(MODO ? 'IL GRANDE VIAGGIO' : 'PIXEL SAGA', Wr / 2, Hr / 2 - (MODO ? 28 : 34), '#ffd23f', MODO ? 2 : 3, 'center', '#7a2a10');
  T(MODO ? 'ANTEPRIMA: LA TERRA NUOVA DI LUMEN' : 'LE TERRE DI LUMEN', Wr / 2, Hr / 2 - 8, '#a9c6e3', 1, 'center');
  const w = Math.min(220, Wr - 80); hg.fillStyle = '#26304a'; hg.fillRect(Wr / 2 - w / 2, Hr / 2 + 10, w, 6); hg.fillStyle = '#4ade80'; hg.fillRect(Wr / 2 - w / 2, Hr / 2 + 10, Math.round(w * prog), 6);
  T(progMsg, Wr / 2, Hr / 2 + 22, '#8a96aa', 1, 'center');
  T('COSTRUISCO IL MONDO: CI VUOLE QUALCHE SECONDO', Wr / 2, Hr - 14, '#4a5468', 1, 'center', null);
}
function drawTitle() {
  title.t += 1 / 60;
  hg.fillStyle = 'rgba(8,10,20,.25)'; hg.fillRect(0, 0, Wr, Hr);
  T(MODO ? 'IL GRANDE VIAGGIO' : 'PIXEL SAGA', Wr / 2, Math.round(Hr * 0.16) + (MODO ? 8 : 0), '#ffd23f', MODO ? 2 : 4, 'center', '#7a2a10');
  T(MODO ? 'ANTEPRIMA: LA TERRA NUOVA DI LUMEN' : 'LE TERRE DI LUMEN', Wr / 2, Math.round(Hr * 0.16) + 34, '#ffffff', 1, 'center');
  const opts = title.opts;
  opts.forEach((o, i) => { const y = Math.round(Hr * 0.62) + i * 14, on = i === title.sel; if (on) { const w = A.textW(o) + 20; hg.fillStyle = 'rgba(10,12,22,.7)'; hg.fillRect(Wr / 2 - w / 2, y - 3, w, 13); } T((on ? '> ' : '') + o + (on ? ' <' : ''), Wr / 2, y, on ? '#ffffff' : '#a9b6cc', 1, 'center'); });
  if (title.confirm) { panel(Wr / 2 - 110, Hr / 2 - 22, 220, 44, '#ff8f8f'); T('CANCELLARE IL SALVATAGGIO?', Wr / 2, Hr / 2 - 14, '#ff8f8f', 1, 'center'); T('A: SÌ, RICOMINCIA    B: NO', Wr / 2, Hr / 2 + 4, '#ffffff', 1, 'center'); }
  T('CAPITOLI 1 E 2   -   A: SCEGLI', Wr / 2, Hr - 12, '#c9d3e6', 1, 'center');
}
const INTRO = ["TANTO TEMPO FA, CINQUE PIETRE DELL'ALBA PORTAVANO LUCE E PACE ALLE TERRE DI LUMEN.", 'UNA NOTTE LE PIETRE SPARIRONO. LE CREATURE SI FECERO INQUIETE E SUL PICCO A NORD SI SVEGLIÒ IL DRAGO.', 'TU SEI APPENA ARRIVATO A BORGO AURORA. NESSUNO TI CONOSCE ANCORA... MA LA TUA STORIA COMINCIA ADESSO.'];
function drawIntro() {
  hg.fillStyle = '#07080e'; hg.fillRect(0, 0, Wr, Hr);
  const L = A.wrap(INTRO[intro - 1], Math.min(300, Wr - 60));
  L.forEach((l, i) => T(l, Wr / 2, Hr / 2 - L.length * 5 + i * 11, '#e6e9f2', 1, 'center'));
  if (Math.floor(time * 2.5) % 2) T('A', Wr / 2, Hr - 20, '#ffd23f', 1, 'center');
}

// ---------- tasti ----------
function onKey(name) {
  if (st === 'title') {
    if (title.confirm) { if (name === 'a') { title.confirm = false; startGame(true); } else if (name === 'b') title.confirm = false; return; }
    if (name === 'up' || name === 'down') { title.sel = (title.sel + 1) % title.opts.length; tone(1318, 0.03); }
    else if (name === 'a' || name === 'start') {
      tone(1046, 0.06);
      if (title.opts[title.sel].startsWith('CONTINUA')) { save = loadSave(); startGame(false); }
      else if (loadSave()) title.confirm = true; else startGame(true);
    }
    return;
  }
  if (st === 'intro') { if (name === 'a' || name === 'start' || name === 'b') { tone(880, 0.04); intro++; if (intro > INTRO.length) { intro = 0; openClass('new'); } } return; }
  if (st === 'class') return classKey(name);
  if (st === 'dead') { if (name === 'a' && death > 1) { hero.dead = false; hero.hp = MAXHP(); hero.fall = 0; hero.vx = hero.vz = 0; hero.kb = 0; save.coins = Math.floor(save.coins * 0.8); st = 'play';
      hero.en = MAXEN(); hero.atk = 0; hero.dash = null; hero.block = false; hero.chg = 0; hero.aDown = false; hero.hid = 0; things = [];
      if (D) { hero.x = D.P.spawn.x; hero.z = D.P.spawn.z; hero.y = 0; hero.yaw = D.P.spawn.yaw; shots = []; hazards = []; quake = 0; D.trap = {}; D.room = -1; foes = []; spawnDungeonFoes(); makeBoss(); dRoomCheck(); }
      else { if (MODO) { const p = INIZIO(); hero.x = p.x; hero.z = p.z; } else { hero.x = 2005; hero.z = 2690; } hero.y = gH(hero.x, hero.z); hero.yaw = -Math.PI / 2; }
      camBehind(); writeSave(); } return; }
  if (st !== 'play') return;
  if (loot) { if ((name === 'a' || name === 'b') && loot.t > 0.5) { loot = null; tone(880, 0.04); } return; }
  if (dialog) {
    const totA = dialog.lines[dialog.i].join(' ').length;
    if (dialog.opts && dialog.i === dialog.lines.length - 1 && dialog.ch >= totA) {
      const n = dialog.opts.length;
      if (name === 'up') { dialog.sel = (dialog.sel + n - 1) % n; tone(700, 0.03); } else if (name === 'down') { dialog.sel = (dialog.sel + 1) % n; tone(700, 0.03); }
      else if (name === 'a' || name === 'b') { const pk = dialog.pick, i = name === 'b' ? n - 1 : dialog.sel; dialog = null; tone(880, 0.04); pk(i); }
      return;
    }
    if (name === 'a' || name === 'b') {
      const tot = dialog.lines[dialog.i].join(' ').length;
      if (dialog.ch < tot) dialog.ch = tot;
      else if (dialog.i < dialog.lines.length - 1) { dialog.i++; dialog.ch = 0; }
      else { const then = dialog.then; dialog = null; if (then) then(); }
    }
    return;
  }
  if (shop && shop.board) return boardKey(name);
  if (shop && shop.sk) return skillKey(name);
  if (shop) {
    const list = shopList(), rows = list.length + 1;
    if (name === 'up') { shop.sel = (shop.sel + rows - 1) % rows; tone(1318, 0.03); }
    else if (name === 'down') { shop.sel = (shop.sel + 1) % rows; tone(1318, 0.03); }
    else if (name === 'b' || name === 'start' || (name === 'a' && shop.sel === list.length)) shop = null;
    else if (name === 'a') {
      const [id, price] = list[shop.sel];
      if (shopOwned(id)) tone(200, 0.1, 'square', 0.03);
      else if (save.coins < price) { tone(160, 0.2, 'square', 0.04, 100); toast('MONETE INSUFFICIENTI', '#ff8f8f'); }
      else {
        save.coins -= price;
        if (id === 'pozione') { save.pot++; seq([659, 880], 0.06, 0.06); toast('+1 POZIONE', '#ffb0c0'); }
        else if (id === 'elisir') { save.eli = (save.eli || 0) + 1; seq([659, 988], 0.06, 0.06); toast('+1 ELISIR', '#9ac8ff'); }
        else { const s2 = shop; shop = null; openLoot(id); shop = s2; }
        writeSave();
      }
    }
    return;
  }
  if (mapOpen) {
    if (name === 'c' && MODO && !D) { const s = save.segno; if (s && Math.hypot(s[0] - mapV.x, s[1] - mapV.z) < mapV.span * 0.04) { save.segno = null; tone(520, 0.05); } else { save.segno = [Math.round(mapV.x), Math.round(mapV.z)]; seq([784, 1046], 0.06, 0.06); } writeSave(); }
    else if (name === 'a' && (!D || D.def.casa)) { const m = mapMe(); mapV.span = mapV.span < W.WS ? W.WS : 4096; if (mapV.span < W.WS) { mapV.x = m.x; mapV.z = m.z; } clampMap(); tone(880, 0.04); }
    else if (name === 'select' || name === 'b' || name === 'start' || name === 'a') { mapOpen = false; tone(660, 0.04); }
    return;
  }
  if (menu) { menuKey(name); return; }
  if (name === 'start') { menu = { tab: 0, sel: 0, pick: null }; tone(988, 0.05); return; }
  if (name === 'select') { openMap(); tone(988, 0.05); return; }
  if (name === 'a') {
    if (target) { interact(target); return; }
    heroAttack();
  }
  else if (name === 'c') heroSkill();
  else if (name === 'v') cycleSkill();
  else if (name === 'm') toggleAim();
}
function menuKey(name) {
  if (menu.mis) { if (name === 'a') { save.opt.cnt = !save.opt.cnt; tone(1046, 0.05); } else if (name === 'b' || name === 'start') { menu.mis = false; tone(660, 0.04); } return; }
  const rows = menuRows();
  if (name === 'start' || (name === 'b' && !menu.pick)) { menu = null; tone(660, 0.04); writeSave(); return; }
  if (name === 'b' && menu.pick) { menu.sel = SLOTS.findIndex(s => s[0] === menu.pick); menu.pick = null; tone(660, 0.04); return; }
  if (name === 'left' || name === 'right') { if (menu.pick) return; menu.tab = (menu.tab + (name === 'right' ? 1 : 3)) % 4; menu.sel = 0; tone(1318, 0.03); return; }
  if (name === 'up' || name === 'down') { if (rows.length) { menu.sel = (menu.sel + (name === 'down' ? 1 : rows.length - 1)) % rows.length; tone(1318, 0.03); } return; }
  if (name !== 'a') return;
  const r = rows[menu.sel];
  if (menu.tab === 0) {
    if (!menu.pick && r === 'abil') { cycleSkill(); return; }
    if (!menu.pick && r === 'scudo' && !CC().shield) { tone(200, 0.1, 'square', 0.03); return; }
    if (!menu.pick) { menu.pick = r; menu.sel = 0; tone(988, 0.04); }
    else { if (r === '-') { save.eq[menu.pick] = menu.pick === 'armatura' ? 'tunica' : null; hero.hp = Math.min(hero.hp, MAXHP()); drawHeroSprites(); } else equip(r); tone(1046, 0.06); menu.sel = SLOTS.findIndex(s => s[0] === menu.pick); menu.pick = null; }
  } else if (menu.tab === 1) {
    if (r === 'pozione') { if (save.pot > 0 && hero.hp < MAXHP()) { save.pot--; hero.hp = Math.min(MAXHP(), hero.hp + 6); seq([523, 659, 784], 0.07, 0.07); toast('+3 CUORI', '#ff8aa0'); } else tone(200, 0.1, 'square', 0.03); }
    else if (r === 'elisir') { if (save.eli > 0 && hero.hp < MAXHP()) { save.eli--; hero.hp = MAXHP(); seq([523, 659, 784, 1046], 0.07, 0.07); toast('CUORI PIENI!', '#9ac8ff'); if (!save.eli) menu.sel = 0; } else tone(200, 0.1, 'square', 0.03); }
    else if (r === 'mappa') { menu = null; openMap(); }
  } else if (menu.tab === 2) { trackQuest(r); tone(1046, 0.05); }
  else {
    if (r === 'vol') { setVolume((volLevel + 2) % 3); if (volLevel) tone(1318, 0.06); }
    else if (r === 'giorno') { save.opt.day = save.opt.day === false; tone(1046, 0.05); }
    else if (r === 'mus') { MU.on = !MU.on; try { localStorage.setItem('sg_mus', MU.on ? '1' : '0'); } catch (e) {} tone(1046, 0.05); }
    else if (r === 'vib') { save.opt.vib = !save.opt.vib; vib(40); }
    else if (r === 'comandi') { save.opt.ctrl = ctrl8() ? 'c' : '8'; orb.a = 0; orb.back = false; tone(1046, 0.05); toast(ctrl8() ? 'LEVA A 8 DIREZIONI: L\'EROE VA DOVE PREMI' : 'COMANDI CLASSICI: SINISTRA E DESTRA GIRANO L\'EROE', '#7af0ff'); }
    else if (r === 'mira') toggleAim();
    else if (r === 'misure') { menu.mis = true; misApri(); tone(1046, 0.05); }
    else if (r === 'salva') { writeSave(); toast('SALVATO!', '#9af0b0'); tone(1046, 0.06); }
    else if (r === 'esci') { writeSave(); menu = null; leave(); }
  }
}

// ---------- ciclo ----------
let lastWH = '', mTick = 0;
function measure(w, h) {
  // le misure dei tasti si rileggono quando cambia lo schermo e comunque una volta al secondo
  if (lastWH === w + 'x' + h && (++mTick % 60)) return; lastWH = w + 'x' + h;
  // pixel quadrati: l'immagine 3D si ingrandisce di un numero intero di volte
  K = Math.max(1, Math.round(h / 182)); Hr = Math.floor(h / K); Wr = Math.floor(w / K);
  OX = Math.floor((w - Wr * K) / 2); OY = Math.floor((h - Hr * K) / 2);
  // il mondo 3D ha pixel più piccoli dell'interfaccia: più dettaglio, scritte sempre leggibili
  K3 = Math.max(1, Math.round(h / 240)); H3 = Math.floor(h / K3); W3 = Math.floor(w / K3);
  OX3 = Math.floor((w - W3 * K3) / 2); OY3 = Math.floor((h - H3 * K3) / 2);
  if (hud.width !== Wr || hud.height !== Hr) { hud.width = Wr; hud.height = Hr; }
  try {
    const cr = $('scr').getBoundingClientRect(), sx = Wr / Math.max(1, cr.width);
    const l = $('cl').getBoundingClientRect(), r = $('cr').getBoundingClientRect();
    insetL = Math.max(40, Math.round((l.right - cr.left) * sx) + 4); insetR = Math.max(40, Math.round((cr.right - r.left) * sx) + 4);
    const c3 = $('bC').getBoundingClientRect(); btnC = c3.width > 4 ? { x: (c3.left - cr.left) * sx, y: (c3.top - cr.top) * sx, w: c3.width * sx } : null;
  } catch (e) {}
}
function toTitle() { st = 'title'; title.t = 0; title.sel = 0; title.confirm = false; title.opts = loadSave() ? ['CONTINUA L\'AVVENTURA', 'NUOVA AVVENTURA'] : ['NUOVA AVVENTURA']; }
function titleCam(dt) {
  title.t += dt; setDay(18.15);
  const a = -0.6 + title.t * 0.035, cx = INIZIO().x - 5, cz = INIZIO().z - 40;
  cam.x = cx + Math.cos(a) * 150; cam.z = cz + Math.sin(a) * 150; cam.y = gH(cx, cz) + 46;
  cam.tx = cx + Math.cos(a + Math.PI) * 120; cam.tz = cz + Math.sin(a + Math.PI) * 120; cam.ty = gH(cx, cz) + 10;
  const bw = W.atmo(cam.x, cam.z); for (let i = 0; i < 3; i++) { atm.fog[i] = ATMO[0][0][i]; atm.zen[i] = ATMO[0][1][i]; atm.wat[i] = ATMO[0][4][i]; } atm.near = 380; atm.far = 1250;
}
if (window.__SG_DEBUG) window.__sg = {
  get st() { return st; }, get prog() { return prog; }, get hero() { return hero; }, get save() { return save; }, get foes() { return foes; }, get npcs() { return npcs; }, get chests() { return chests; },
  get dialog() { return dialog; }, get shop() { return shop; }, get loot() { return loot; }, get target() { return target; }, get err() { return errMsg; }, get atlas() { return atlas; }, get BTN() { return BTN; }, SG, get mapOpen() { return mapOpen; }, get menu() { return menu; }, get MIS() { return MIS; }, STO, get MODO() { return MODO; }, get grK() { return grK; }, get fx() { return fx; }, salaMetti, salaVia, get forza() { return forzaOra; }, hurt(d, e) { hurtHero(d, e); }, get doors() { return doors; }, get musica() { return musicPick(); }, get cam() { return cam; }, va(x, z, yaw) { hero.x = x; hero.z = z; W.rif = -1e9; hero.y = gH(x, z); rifX = x; rifZ = z; hero.vx = hero.vz = 0; if (yaw !== undefined) hero.yaw = yaw; camBehind(); }, terra: (ox, oz, s) => terraNuova(ox, oz, s), get TERRE() { return TERRE; }, get SPR() { return SPR; }, get D() { return D; }, get boss() { return boss; }, get shots() { return shots; }, get hazards() { return hazards; }, get fade() { return fade; }, enter: id => enterDungeon(id), level: (id, from) => gotoLevel(id, from || 'up'), exit: () => exitDungeon(), load() { save = loadSave(); startGame(false); }, get title() { return title; }, ds: id => dsave(id), swing() { hero.atk = 0; heroAttack(); hero.aDown = false; },       // (prove) il colpo della classe: spada, freccia, pugnalata o dardo
   set freeze(v) { frozen = !!v; }, canStand: (x, z) => !!D && dCanStand(hero, x, z, 1.6), sight: (x0, z0, x1, z1) => !D || dSight(x0, z0, x1, z1), get things() { return things; }, get clsUI() { return clsUI; }, CLS, setClass: id => setClass(id), skill: id => { save.sk[id] = 1; save.skSel[cls()] = id; }, boom: (x, z, r, d, o) => boom(x, z, r, d, o), aim: r => aimAt(r), W, cam, atm, key: onKey, IT,
  set camFix(v) { camFix = v; }, get atm() { return atm; }, get atlasUse() { return atlasUse; }, orb, get fauna() { return fauna; }, NPC, FOE, day, openMapAll() { seen.fill(1); openMap(); },
  tp(x, z, yaw) { hero.x = x; hero.z = z; hero.y = gH(x, z); if (yaw !== undefined) hero.yaw = yaw; camBehind(); },
  step(n) { for (let i = 0; i < n; i++) playUpdate(1 / 60); }, give: id => give(id), dragon, get botteghe() { return botteghe; }, shopIn(k) { if (D) exitDungeon(); enterShop(W.SHOPS[k]); },
  get picks() { return picks; }, get camps() { return camps; }, get banner() { return banner; }, get toasts() { return toasts; }, JOBS, get aimFree() { return freeAim(); }, toggleAim, get chipM() { return chipM; }, get hud() { return { OX, OY, K }; }, get camYaw() { return cam.yaw; }, get menuRows() { return menu ? menuRows() : []; }, ptr: (t, x, y, id) => { if (t === 'down' && chipHit(x, y, chipM)) { toggleAim(); return; } camPointer(t, x, y, id); }, get shots() { return shots; }, get drops() { return drops; }, jobs: { hunt: huntOf, ids: boardIds, ground: huntGround, st: jst, accept: jobAccept, kill: jobKill, ready: jobReady, pay: jobPay, mark: boardMark, target: (id) => questTarget('J:' + id), line: jobLine, done: jobsDone }, hit: (e, d) => hitFoe(e, d, 0), track: () => curTrack(),
  // cammina verso un punto con le stesse regole dell'eroe (pendenza, acqua, ostacoli); restituisce la distanza rimasta
  drive(tx, tz, max = 4000) { let stuck = 0; for (let i = 0; i < max; i++) { const d = Math.hypot(tx - hero.x, tz - hero.z); if (d < 5) return 0; const a = Math.atan2(tz - hero.z, tx - hero.x); hero.yaw = a; const m = 25 / 60; if (!move(hero, Math.cos(a) * m, Math.sin(a) * m, 1.6)) { stuck++; const s2 = (stuck % 2 ? 1 : -1) * 1.2; if (!move(hero, Math.cos(a + s2) * m, Math.sin(a + s2) * m, 1.6) && stuck > 300) return d; } else stuck = Math.max(0, stuck - 1); hero.y = gH(hero.x, hero.z); } return Math.hypot(tx - hero.x, tz - hero.z); }, close() { dialog = null; loot = null; menu = null; shop = null; mapOpen = false; help = 0; banner = null; toasts = []; },
};
return {
  id: 'saga', name: 'PIXEL SAGA', desc: 'AVVENTURA FANTASY 3D', full: true, ownSelect: true, cbtn: true, pad8: true,
  // la leva serve a scegliere una voce (menu, bottega, dialogo, mappa, titolo) e non a camminare?
  padMenu: () => st !== 'play' || !!(dialog || shop || loot || menu || mapOpen || clsUI), aspect: 0,
  keys: [['D', 'cammina'], ['A', 'azione'], ['B', 'corri'], ['C', 'abilità'], ['START', 'menu']],
  icon(c, x, y, s) {
    drawIcon(c, ['cccccccccccccccc', 'cccccccwwccccccc', 'ccwwccccccccsccc', 'ccccccccccccsccc', 'ccccccrrcccssscc', 'cccccrrrrccsscwc', 'ccccrrrrrrccsccc', 'cccrryrryrrccscc', 'ccrrrrrrrrrrcgcc', 'ggggmmmmmmgggggg', 'gggmmdddmmgggggg', 'ggggmmdmmgggtggg', 'gtggggggggggtttg', 'tttggggggggggtgg', 'gtgggggbbgggggtg', 'ggggggbbbbgggggg'],
      { c: '#5aa0e0', w: '#ffffff', r: '#8a8c96', y: '#ffd86a', s: '#e8eef6', g: '#58b048', m: '#c8c4bc', d: '#3a2416', t: '#2e7a30', b: '#3a7ac8' }, x, y, s, '#5aa0e0');
  },
  modo: scegliModo,
  enter() {
    if (!scegliModo(this.terra || null)) return;
    if (st === 'boot') { st = 'loading'; prog = 0; gen = loader(); MIS.t0 = performance.now(); MIS.calc = 0; MIS.fasi = {}; }
    else if (st === 'play') { menu = null; }
  },
  leave() { MU.stop(); if (st === 'play' || st === 'dead') writeSave(); },
  hidden() { if (st === 'play') { writeSave(); if (!dialog && !loot && !shop && !mapOpen) menu = menu || { tab: 0, sel: 0, pick: null }; } },
  update(dt) {
    time += dt;
    musQuiet = Math.max(0, musQuiet - dt);
    MU.want(musicPick()); MU.tick(menu || mapOpen ? 0.55 : 1);
    if (st === 'loading') {
      const t0 = performance.now();
      try { while (performance.now() - t0 < 40) { const fase = progMsg, t1 = performance.now(), r = gen.next(), d = performance.now() - t1; MIS.calc += d; MIS.fasi[fase] = (MIS.fasi[fase] || 0) + d; if (r.done) { MIS.wall = performance.now() - MIS.t0; misPeso(); STO.ok(); toTitle(); break; } if (r.value < 0) break; prog = r.value; } }
      catch (e) { st = 'error'; errMsg = e.message === 'NOGL' ? 'QUESTO TELEFONO NON SUPPORTA LA GRAFICA 3D (WEBGL). PIXEL SAGA NON PUÒ PARTIRE.' : 'ERRORE: ' + e.message; console.error(e); }
      return;
    }
    if (st === 'title') { titleCam(dt); return; }
    if (st === 'class') { clsUI.t += dt; return; }
    if (frozen) return;                      // (solo per le prove) il gioco avanza soltanto a comando
    if (TERRE.length) terreTick(6);
    if (st === 'play' || st === 'dead') playUpdate(dt);
  },
  draw(c, w, h) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    if (h > w * 1.05) {
      c.fillStyle = '#0b0d14'; c.fillRect(0, 0, w, h);
      measure(Math.min(w, h * 2), Math.min(h, w)); hg.clearRect(0, 0, Wr, Hr);
      const u = Math.max(1, Math.floor(w / 150));
      c.save(); c.translate(w / 2, h / 2 - 30 * u); c.rotate(Math.sin(time * 2) * 0.4 - 0.4);
      c.fillStyle = '#c9d3e6'; c.fillRect(-12 * u, -20 * u, 24 * u, 40 * u); c.fillStyle = '#0b0d14'; c.fillRect(-10 * u, -16 * u, 20 * u, 30 * u); c.restore();
      const tc = A.mk(130, 42), tg2 = tc.getContext('2d'); A.text(tg2, 'RUOTA IL TELEFONO', 65, 4, '#ffd23f', '#000', 1, 'center'); A.text(tg2, 'PIXEL SAGA SI GIOCA', 65, 18, '#c9d3e6', null, 1, 'center'); A.text(tg2, 'IN ORIZZONTALE', 65, 28, '#c9d3e6', null, 1, 'center');
      c.drawImage(tc, Math.round(w / 2 - 65 * u), Math.round(h / 2 + 10 * u), 130 * u, 42 * u);
      return;
    }
    measure(w, h); scrW = w; scrH = h;
    misFrame();
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    if (G && (st === 'title' || st === 'play' || st === 'dead' || st === 'intro' || st === 'class')) {
      G.resize(W3, H3);
      if (st !== 'intro') { render3D(); c.drawImage(G.canvas, OX3, OY3, W3 * K3, H3 * K3); }
    }
    drawHUD();
    c.drawImage(hud, OX, OY, Wr * K, Hr * K);
  },
  button(name, down) { if (down) onKey(name); },
  // un tocco sul riquadro dell'abilità la cambia; tutto il resto dello schermo gira la visuale
  pointer(type, x, y, id) { if (type === 'down' && chipHit(x, y, chipM)) { toggleAim(); return; } if (type === 'down' && chipHit(x, y)) { cycleSkill(); return; } camPointer(type, x, y, id); },
};
})());
