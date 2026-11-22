// ===================== PIXEL SAGA · le classi dell'eroe =====================
// Quattro mestieri: ognuno ha il suo modo di colpire (A), un colpo caricato (A tenuto premuto e poi lasciato)
// e tre abilità (C): la prima la sa da subito, le altre due le insegna il maestro della gilda.
// Le armi sono le stesse per tutti, ma ogni classe le impugna a modo suo: la spada di ferro del cavaliere
// è l'arco ferrato dell'arciere, i pugnali di ferro del furfante, il bastone ferrato del mago.
SG.cls = (() => {
const ORD = ['cavaliere', 'arciere', 'furfante', 'mago'];
// pose dell'eroe: ferma, due passi, colpo (prima e dopo), carica o guardia, mossa speciale
const CL = {
  cavaliere: { n: 'CAVALIERE', d: 'SPADA E SCUDO. È IL PIÙ ROBUSTO: PARA I COLPI E TRAVOLGE I NEMICI.',
    tr: ['+1 CUORE E DIFESA +1', "È L'UNICO A PORTARE LO SCUDO", 'A TENUTO: COLPO ROTANTE', 'C: PARATA CON LO SCUDO'],
    hp: 2, dif: 1, vel: 0, en: 10, regen: 1.4, shield: true, enC: '#ffc83a', bar: [3, 3, 1, 1], col: '#ffd23f',
    look: {}, demo: { shield: '#8a5e34' }, skills: ['parata', 'carica', 'grido'],
    poses: [{}, { leg: 0.55 }, { leg: -0.55 }, { armR: 3.1, leg: 0.15 }, { armR: 1.45, leg: -0.25, armL: -0.4 }, { armL: 1.2, armR: 0.5, leg: 0.14, guard: 1 }, { armR: -1.1, armL: 0.6, leg: 0.32 },
      { armR: 1.5, armRz: 1.3, leg: 0.22, armL: 0.35 }, { armR: 1.5, armRz: -1.0, leg: -0.28, armL: -0.55 }, { armR: 2.55, armRz: 0.85, leg: 0.16 }, { armR: 0.7, armRz: -0.8, leg: -0.26, armL: -0.4 }],   // orizzontale (carica, colpo), diagonale (carica, colpo)
    help: ['A: PARLA, APRI, COLPISCI', 'A TENUTO E LASCIATO: COLPO ROTANTE', 'C TENUTO: PARI CON LO SCUDO'] },
  arciere: { n: 'ARCIERE', d: 'ARCO E FRECCE. COLPISCE DA LONTANO E NON SI FA RAGGIUNGERE.',
    tr: ['LE FRECCE CERCANO IL NEMICO DA SOLE', '+10% VELOCITÀ', 'A TENUTO: FRECCIA CHE TRAPASSA', "C: BALZO ALL'INDIETRO"],
    hp: 0, dif: 0, vel: 0.1, en: 10, regen: 1.4, enC: '#8ae06a', bar: [2, 1, 2, 3], col: '#8ae06a',
    look: { shirt: '#5a7a34', sleeve: '#4a6a2a', pants: '#6a5438', belt: '#3a2a1a', cap: '#3a6a2a', feather: '#e8304a', quiver: '#7a4a24' }, skills: ['balzo', 'fgelo', 'pioggia'],
    poses: [{}, { leg: 0.55 }, { leg: -0.55 }, { armR: 1.55, armL: 1.3, nock: 1 }, { armR: 1.55, armL: 0.6, leg: -0.15 }, { armR: 1.55, armL: 1.3, nock: 1, leg: 0.28 }, { armR: 1.9, armL: 1.5, leg: 0.75, nock: 1 }, { armR: 1.55, armL: 1.3, nock: 1 }, { armR: 1.55, armL: 0.6, leg: -0.15 }, { armR: 1.55, armL: 1.3, nock: 1 }, { armR: 1.55, armL: 0.6, leg: -0.15 }],
    help: ['A: PARLA, APRI, SCOCCA UNA FRECCIA', 'A TENUTO E LASCIATO: FRECCIA CHE TRAPASSA', "C: BALZO ALL'INDIETRO"] },
  furfante: { n: 'FURFANTE', d: 'PUGNALI, BOMBE E TRAPPOLE. SVELTO E ASTUTO, COLPISCE ALLE SPALLE.',
    tr: ['COLPI RAPIDI: ALLE SPALLE VALGONO DOPPIO', '+20% VELOCITÀ, PIÙ MONETE DAI NEMICI', 'A TENUTO: LANCIO DEI PUGNALI', 'C: BOMBA'],
    hp: 0, dif: 0, vel: 0.2, en: 10, regen: 1.4, dual: true, coins: 1.3, enC: '#c8a0ff', bar: [2, 1, 3, 2], col: '#c8a0ff',
    look: { shirt: '#4a4458', sleeve: '#3a3448', pants: '#2e2a38', belt: '#8a2a2a', hood: '#3a3448', mask: '#26222e', boots: '#2a2630' }, skills: ['bomba', 'fumo', 'trappola'],
    poses: [{}, { leg: 0.55 }, { leg: -0.55 }, { armR: -0.7, armL: 1.0, leg: 0.22 }, { armR: 1.6, armL: -0.5, leg: -0.3 }, { armR: 2.7, armL: 2.5, leg: 0.16 }, { armR: 1.35, armL: 1.5, leg: -0.28 }, { armL: -0.7, armR: 1.0, leg: -0.22 }, { armL: 1.6, armR: -0.5, leg: 0.3 }, { armR: -0.7, armL: 1.0, leg: 0.22 }, { armR: 1.6, armL: -0.5, leg: -0.3 }],   // l'altra mano, poi la solita
    help: ['A: PARLA, APRI, PUGNALA', 'A TENUTO E LASCIATO: LANCIO DEI PUGNALI', 'C: LANCIA UNA BOMBA'] },
  mago: { n: 'MAGO', d: 'BASTONE E INCANTESIMI: FUOCO, GELO E CURA. IL MANA TORNA DA SOLO.',
    tr: ['I DARDI MAGICI INSEGUONO IL NEMICO', 'PIÙ MANA PER GLI INCANTESIMI', 'A TENUTO: SFERA CHE ESPLODE', 'C: PALLA DI FUOCO'],
    hp: 0, dif: 0, vel: 0, en: 16, regen: 1.0, enC: '#5ab8ff', bar: [3, 1, 1, 3], col: '#7ac8ff',
    look: { shirt: '#3a4aaa', sleeve: '#3444a0', pants: '#2a3270', belt: '#e0b040', hat: '#3a4aaa', hatPoint: true, hatBand: '#e0b040', robe: '#2e3c96' }, skills: ['fuoco', 'gelo', 'cura'],
    poses: [{}, { leg: 0.55 }, { leg: -0.55 }, { armR: 2.8, leg: 0.1 }, { armR: 1.5, armL: -0.3, leg: -0.2 }, { armR: 2.9, armL: 2.5, leg: 0.1 }, { armR: 1.5, armL: 1.5, leg: -0.16 }, { armR: 2.8, leg: 0.1 }, { armR: 1.5, armL: -0.3, leg: -0.2 }, { armR: 2.8, leg: 0.1 }, { armR: 1.5, armL: -0.3, leg: -0.2 }],
    help: ['A: PARLA, APRI, LANCIA UN DARDO', 'A TENUTO E LASCIATO: SFERA CHE ESPLODE', 'C: PALLA DI FUOCO'] },
};
for (const k of ORD) CL[k].id = k;
// le quattro barre della scheda: forza, difesa, velocità, distanza
const BAR = ['FORZA', 'DIFESA', 'VELOCITÀ', 'DISTANZA'];

// abilità: nome, costo in energia, prezzo dal maestro (0: la sa da subito), icona e colori
const SK = {
  parata: { n: 'PARATA', cost: 0, price: 0, ico: 'shield', c: ['#9aa4b2', '#ffd23f'], d: 'TIENI PREMUTO C: LO SCUDO FERMA I COLPI CHE ARRIVANO DI FRONTE.' },
  carica: { n: 'CARICA', cost: 4, price: 150, ico: 's_carica', c: ['#ffc83a', '#ffffff'], d: 'UNO SCATTO IN AVANTI CHE TRAVOLGE E STORDISCE CHI INCONTRA.' },
  grido: { n: 'GRIDO DI GUERRA', cost: 6, price: 400, ico: 's_grido', c: ['#e8a03a', '#ffe8a0'], d: 'UN URLO CHE LASCIA STORDITI TUTTI I NEMICI VICINI.' },
  balzo: { n: 'BALZO', cost: 3, price: 0, ico: 's_balzo', c: ['#8ae06a', '#ffffff'], d: "UN SALTO ALL'INDIETRO, SCOCCANDO UNA FRECCIA AL VOLO." },
  fgelo: { n: 'FRECCIA DI GHIACCIO', cost: 4, price: 150, ico: 's_fgelo', c: ['#9ad8ff', '#ffffff'], d: 'CONGELA PER QUALCHE ISTANTE IL NEMICO CHE COLPISCE.' },
  pioggia: { n: 'PIOGGIA DI FRECCE', cost: 7, price: 400, ico: 's_pioggia', c: ['#c8d0dc', '#8ae06a'], d: 'UNA SALVA CHE CADE DAL CIELO SUI NEMICI DAVANTI A TE.' },
  bomba: { n: 'BOMBA', cost: 4, price: 0, ico: 's_bomba', c: ['#4a4a5a', '#ffb02e'], d: 'ESPLODE DOPO UN ATTIMO: FERISCE TUTTI E APRE I MURI CREPATI.' },
  fumo: { n: 'FUMOGENO', cost: 5, price: 150, ico: 's_fumo', c: ['#b8b8c8', '#ffffff'], d: 'I NEMICI TI PERDONO DI VISTA: IL PRIMO COLPO È ALLE SPALLE.' },
  trappola: { n: 'TAGLIOLA', cost: 4, price: 400, ico: 's_trappola', c: ['#9aa4b2', '#5a3a20'], d: 'LA POSI A TERRA: CHI CI METTE IL PIEDE RESTA BLOCCATO.' },
  fuoco: { n: 'PALLA DI FUOCO', cost: 4, price: 0, ico: 's_fuoco', c: ['#ff7a2a', '#ffe14a'], d: 'ESPLODE DOVE ARRIVA E LASCIA I NEMICI IN FIAMME.' },
  gelo: { n: 'NOVA DI GELO', cost: 5, price: 150, ico: 's_gelo', c: ['#9ad8ff', '#ffffff'], d: 'CONGELA PER QUALCHE ISTANTE TUTTI I NEMICI INTORNO A TE.' },
  cura: { n: 'CURA', cost: 8, price: 400, ico: 's_cura', c: ['#5af07a', '#ffffff'], d: 'LA MAGIA RICUCE LE FERITE: RIDÀ DUE CUORI.' },
};
for (const k in SK) SK[k].id = k;

// le armi come le impugna ogni classe (il cavaliere usa quelle di sempre)
const bow = (n, d, col, grip, glow) => ({ n, d, look: { kind: 'bow', col, grip: grip || '#5a3a20', glow } });
const dag = (n, d, col, guard, glow, len) => ({ n, d, look: { kind: 'dagger', col, guard, glow, len: len || 0 } });
const wand = (n, d, col, wood, ring, glow, len) => ({ n, d, look: { kind: 'wand', col, wood, ring, glow, len: len || 0 } });
const ARMI = {
  arciere: {
    legno: bow('ARCO DI LEGNO', 'UN RAMO PIEGATO E UNO SPAGO: PER COMINCIARE BASTA.', '#b8885a', '#6a4424'),
    pugnale: bow('ARCO DEL LADRO', 'PICCOLO E SILENZIOSO: STA SOTTO IL MANTELLO.', '#6a5a4a', '#3a2a20'),
    ferro: bow('ARCO FERRATO', 'BRUNO NE HA RINFORZATO I FLETTENTI COL FERRO.', '#9aa4b2'),
    argento: bow("ARCO D'ARGENTO", 'LEGGERO E LUCENTE COME LA LUNA.', '#e8eef6', '#c8a040'),
    lancia: bow('ARCO DEL CACCIATORE', 'LO USAVANO I CACCIATORI DI LUPI DEL BOSCO.', '#7a5230', '#3e6a3a'),
    mazza: bow('ARCO PESANTE', 'DURO DA TENDERE, MA LE SUE FRECCE FANNO MALE.', '#6a6e78', '#3a3a44'),
    bastone: bow('ARCO DEL SAGGIO', 'IL SUO LEGNO ANTICO RICUCE LE FERITE A POCO A POCO.', '#7a5a3a', '#4a3a2a', '#7ae0ff'),
    runica: bow('ARCO RUNICO', 'LE RUNE SUI FLETTENTI VIBRANO NEL BUIO.', '#9a7af0', '#4a3a7a', '#e8dcff'),
    ascia: bow('ARCO DEL GIGANTE', 'ALTO QUANTO TE: CI VUOLE UN BRACCIO DI FERRO.', '#8a6a4a', '#c8d0dc'),
    tridente: bow('ARCO DEL NOSTROMO', 'LEGNO DI NAVE E CORDA DI CANAPA. +10% VELOCITÀ.', '#5ad0e8', '#3a6a8a'),
    scimitarra: bow('ARCO DI ZAFIRA', 'CORNO E NERVO, CURVO COME LE DUNE.', '#e8b42a', '#8a2a2a'),
    martello: bow('ARCO DI BRUNO', "IL CAPOLAVORO DELLA FUCINA: FLETTENTI D'ACCIAIO.", '#c8d0dc'),
    aurora: bow("ARCO DELL'AURORA", 'TESO CON LA PRIMA LUCE DEL MONDO, E SEPOLTO DOVE LA LUCE NON ARRIVA.', '#ffe8a0', '#ffb02e', '#ffffff'),
    katana: bow('ARCO DEI PETALI', 'LA SUA FRECCIA COGLIE UN PETALO CHE CADE. +12% VELOCITÀ.', '#f8f8ff', '#c85a7a', '#ffd8e8'),
    solare: bow('ARCO DEL SOLE', 'LE SUE FRECCE SONO RAGGI DI LUCE: TRAPASSANO OGNI NEMICO.', '#fff0a0', '#ffb02e', '#ffffff'),
    zanna: bow("ARCO DELL'INVERNO", 'LE SUE FRECCE DI GHIACCIO TRAPASSANO OGNI NEMICO.', '#cfeaff', '#5a8ac0', '#ffffff'),
  },
  furfante: {
    legno: dag('PUGNALI DI LEGNO', 'DUE PALETTI APPUNTITI. MEGLIO DI NIENTE.', '#b8885a', '#6a4424'),
    pugnale: dag('PUGNALI DEL LADRO', 'CORTI E AFFILATI: I FERRI DEL MESTIERE.', '#d8dce4', '#5a3a20'),
    ferro: dag('PUGNALI DI FERRO', 'FORGIATI DA BRUNO, IL FABBRO DEL BORGO.', '#c8d0dc', '#8a8a92'),
    argento: dag("PUGNALI D'ARGENTO", 'LEGGERI E LUCENTI COME LA LUNA.', '#f0f6ff', '#c8a040'),
    lancia: dag('COLTELLI DEL CACCIATORE', 'LI USAVANO I CACCIATORI DI LUPI DEL BOSCO.', '#c8d0dc', '#3e6a3a'),
    mazza: dag('MANNAIE', 'NON SONO ELEGANTI, MA FANNO IL LORO LAVORO.', '#6a6e78', '#3a3a44'),
    bastone: dag('PUGNALI DEL SAGGIO', 'LA PIETRA SUL POMOLO RICUCE LE FERITE A POCO A POCO.', '#7ae0ff', '#7a5a3a'),
    runica: dag('PUGNALI RUNICI', 'LE RUNE SULLE LAME VIBRANO NEL BUIO.', '#9a7af0', '#4a3a7a', '#e8dcff'),
    ascia: dag('ZANNE DEL GIGANTE', 'DUE DENTI DI GIGANTE, AFFILATI COME RASOI.', '#f0e8d0', '#7a5230', null, 1),
    tridente: dag('UNCINI DEL NOSTROMO', 'BUONI PER I PESCI E PER I PREDONI. +10% VELOCITÀ.', '#5ad0e8', '#3a6a8a'),
    scimitarra: dag('PUGNALI DI ZAFIRA', 'LAME CURVE TEMPRATE NELLA SABBIA ROVENTE.', '#e8eef6', '#e8b42a', null, 1),
    martello: dag('LAME DI BRUNO', 'IL CAPOLAVORO DELLA FUCINA: TAGLIANO IL FERRO.', '#c8d0dc', '#5a3a20', null, 1),
    aurora: dag("PUGNALI DELL'AURORA", 'FORGIATI CON LA PRIMA LUCE DEL MONDO, E SEPOLTI DOVE LA LUCE NON ARRIVA.', '#ffe8a0', '#ffb02e', '#ffffff', 1.5),
    katana: dag('LAME DEI PETALI', 'TAGLIANO UN PETALO CHE CADE SENZA FERMARLO. +12% VELOCITÀ.', '#f8f8ff', '#c85a7a', '#ffd8e8', 1.5),
    solare: dag('PUGNALI DEL SOLE', 'A OGNI COLPO LANCIANO UN RAGGIO DI LUCE CHE ARRIVA LONTANO.', '#fff0a0', '#ffb02e', '#ffffff', 1.5),
    zanna: dag("ZANNE DELL'INVERNO", 'GHIACCIO CHE NON SI SCIOGLIE. A OGNI COLPO LANCIANO UN RAGGIO GELIDO.', '#cfeaff', '#5a8ac0', '#ffffff', 1.5),
  },
  mago: {
    legno: wand('BACCHETTA DI LEGNO', 'UN RAMETTO CHE SA FARE UNA SOLA SCINTILLA. PER ORA.', '#ffd86a', '#b8885a'),
    pugnale: wand('BACCHETTA DEL LADRO', 'RUBATA A UN MAGO CHE DORMIVA.', '#d8dce4', '#5a3a20'),
    ferro: wand('BASTONE FERRATO', 'BRUNO CI HA MESSO UNA GHIERA DI FERRO: REGGE MAGIE PIÙ FORTI.', '#ff9a3a', '#6a4a30', '#9aa4b2'),
    argento: wand("BASTONE D'ARGENTO", 'LEGGERO E LUCENTE COME LA LUNA.', '#f0f6ff', '#c8d0dc', '#c8a040'),
    lancia: wand('BASTONE DEL CACCIATORE', 'INTAGLIATO DAI CACCIATORI DI LUPI DEL BOSCO.', '#8ae06a', '#7a5230'),
    mazza: wand('VERGA FERRATA', 'NON È ELEGANTE, MA FA IL SUO LAVORO.', '#b8b8c4', '#3a3a44', '#6a6e78'),
    bastone: wand('BASTONE DEL SAGGIO', 'LA SFERA IN CIMA RICUCE LE FERITE A POCO A POCO.', '#7ae0ff', '#7a5a3a'),
    runica: wand('BASTONE RUNICO', "LE RUNE SULL'ASTA VIBRANO NEL BUIO.", '#9a7af0', '#4a3a7a', null, '#e8dcff'),
    ascia: wand('BASTONE DEL GIGANTE', 'UN TRONCO CON UN MACIGNO IN CIMA.', '#c8d0dc', '#7a5230', null, null, 1.5),
    tridente: wand('BASTONE DEL NOSTROMO', 'LEGNO DI NAVE CON UNA PERLA IN PUNTA. +10% VELOCITÀ.', '#5ad0e8', '#3a6a8a'),
    scimitarra: wand('SCETTRO DI ZAFIRA', 'UN RUBINO GRANDE COME UN DATTERO, SU ORO DEL DESERTO.', '#e8364e', '#e8b42a', '#ffe8a0'),
    martello: wand('SCETTRO DI BRUNO', 'IL CAPOLAVORO DELLA FUCINA: ACCIAIO E UN CUORE DI BRACE.', '#ff6a2a', '#c8d0dc', '#5a3a20'),
    aurora: wand("SCETTRO DELL'AURORA", 'ACCESO CON LA PRIMA LUCE DEL MONDO, E SEPOLTO DOVE LA LUCE NON ARRIVA.', '#ffe8a0', '#ffb02e', '#ffffff', '#ffffff', 1),
    katana: wand('BASTONE DEI PETALI', 'UN RAMO DI CILIEGIO SEMPRE IN FIORE. +12% VELOCITÀ.', '#ffb8d8', '#7a4a5a', null, '#ffffff'),
    solare: wand('SCETTRO DEL SOLE', 'I SUOI DARDI SONO RAGGI DI LUCE: TRAPASSANO OGNI NEMICO.', '#fff0a0', '#ffb02e', '#ffffff', '#ffffff', 1),
    zanna: wand("SCETTRO DELL'INVERNO", 'I SUOI DARDI DI GHIACCIO TRAPASSANO OGNI NEMICO.', '#cfeaff', '#5a8ac0', '#ffffff', '#ffffff', 1),
  },
};

// le frasi della storia che nominano un'arma cambiano con la classe
const TXT = {
  mirta: { cavaliere: 'NON PUOI ANDARCI A MANI NUDE: PRENDI QUESTA SPADA DI LEGNO E DUE POZIONI.', arciere: "NON PUOI ANDARCI A MANI NUDE: PRENDI QUEST'ARCO DI LEGNO E DUE POZIONI.",
    furfante: 'NON PUOI ANDARCI A MANI NUDE: PRENDI QUESTI PUGNALI DI LEGNO E DUE POZIONI.', mago: 'NON PUOI ANDARCI A MANI NUDE: PRENDI QUESTA BACCHETTA DI LEGNO E DUE POZIONI.' },
  bruno1: { cavaliere: 'PORTAMENE TRE E TI FORGIO UNA SPADA VERA.', arciere: 'PORTAMENE TRE E TI FACCIO UN ARCO COME SI DEVE.', furfante: 'PORTAMENE TRE E TI FORGIO DUE PUGNALI VERI.', mago: 'PORTAMENE TRE E TI FACCIO UN BASTONE COME SI DEVE.' },
  bruno2: { cavaliere: 'ECCO: UNA SPADA DI FERRO, TEMPRATA A DOVERE. MOLTO MEGLIO DI QUEL BASTONE!', arciere: 'ECCO: UN ARCO FERRATO, TESO A DOVERE. MOLTO MEGLIO DI QUEL RAMETTO!',
    furfante: 'ECCO: DUE PUGNALI DI FERRO, TEMPRATI A DOVERE. MOLTO MEGLIO DI QUEI PALETTI!', mago: 'ECCO: UN BASTONE FERRATO, FATTO A DOVERE. MOLTO MEGLIO DI QUEL RAMETTO!' },
  bruno3: { cavaliere: "QUELLA... È LA LAMA DELL'AURORA?! NON CREDEVO DI VEDERLA CON I MIEI OCCHI!", arciere: "QUELLO... È L'ARCO DELL'AURORA?! NON CREDEVO DI VEDERLO CON I MIEI OCCHI!",
    furfante: "QUELLI... SONO I PUGNALI DELL'AURORA?! NON CREDEVO DI VEDERLI CON I MIEI OCCHI!", mago: "QUELLO... È LO SCETTRO DELL'AURORA?! NON CREDEVO DI VEDERLO CON I MIEI OCCHI!" },
  eremita: { cavaliere: "DICONO CHE SOLO LA LAMA DELL'AURORA POSSA FERIRLO. MA QUELLA LAMA È PERDUTA DA SECOLI... O FORSE DORME NELLA CRIPTA SOTTO IL SANTUARIO DEL BOSCO.",
    arciere: "DICONO CHE SOLO L'ARCO DELL'AURORA POSSA FERIRLO. MA QUELL'ARCO È PERDUTO DA SECOLI... O FORSE DORME NELLA CRIPTA SOTTO IL SANTUARIO DEL BOSCO.",
    furfante: "DICONO CHE SOLO I PUGNALI DELL'AURORA POSSANO FERIRLO. MA SONO PERDUTI DA SECOLI... O FORSE DORMONO NELLA CRIPTA SOTTO IL SANTUARIO DEL BOSCO.",
    mago: "DICONO CHE SOLO LO SCETTRO DELL'AURORA POSSA FERIRLO. MA È PERDUTO DA SECOLI... O FORSE DORME NELLA CRIPTA SOTTO IL SANTUARIO DEL BOSCO." },
  // i guardiani: come si interrompe il serpente (e chi non ha lo scudo che respinge)
  serpe: { cavaliere: '', arciere: 'MENTRE SPUTA LE BOLLE, COLPISCILO CON UNA FRECCIA CARICATA (A TENUTO)!', furfante: 'MENTRE SPUTA LE BOLLE, COLPISCILO CON I PUGNALI LANCIATI (A TENUTO) O CON UNA BOMBA!', mago: 'MENTRE SPUTA LE BOLLE, COLPISCILO CON LA SFERA (A TENUTO) O CON UNA PALLA DI FUOCO!' },
  regina: { cavaliere: 'QUANDO È STANCA, COLPISCILA. IL RAGGIO LA INTERROMPE MENTRE LANCIA.', arciere: 'QUANDO È STANCA, COLPISCILA. UNA FRECCIA CARICATA LA INTERROMPE MENTRE LANCIA.', furfante: 'QUANDO È STANCA, COLPISCILA. I PUGNALI LANCIATI LA INTERROMPONO MENTRE LANCIA.', mago: 'QUANDO È STANCA, COLPISCILA. LA SFERA CARICATA LA INTERROMPE MENTRE LANCIA.' },
};
return { ORD, CL, BAR, SK, ARMI, TXT };
})();
