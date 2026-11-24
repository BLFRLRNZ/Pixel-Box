// ===================== IL GRANDE VIAGGIO: LA COMPAGNIA =====================
// I quattro compagni (uno per mestiere, di genti diverse): chi sono, dove aspettano, che cosa dicono, la prova che portano con sé;
// e le parole del primo atto (Mirta apre, il Re chiude). Qui ci sono solo i dati: come seguono, combattono e si guidano
// sta nel gioco (g_saga.js, «la compagnia»). Le loro figure stanno sul secondo foglio.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenCompagnia = (m, { BORGO, ROCCA, ELFI }) => {
  const W = m.world;
  // aspetto: posti negli elenchi del gioco (capelli, colore, barba, pelle, occhi, sciarpa, segno); eq: quel che portano addosso quando arrivano
  // casa: dove aspettano [x, z, verso]; prova: la prima impresa da fare insieme (luogo | nemico | forziere | raccolta); premio: monete e una cosa
  W.COMPAGNI = {
    vespa: { n: 'VESPA', chi: 'UMANA, FURFANTE', cls: 'furfante', razza: 'umano', aspetto: { cap: 3, col: 3, bar: 0, pel: 1, occ: 2, sci: 7, seg: 3 },
      eq: { arma: 'pugnale', armatura: 'giaco', elmo: null, scudo: null, acc: null }, casa: [BORGO[0] + 34, BORGO[1] + 44, Math.PI * 0.75], dove: 'NEL BORGO, VICINO AL POZZO',
      incontro: ['PSST. TU SEI QUELLO NUOVO, VERO? IO SONO VESPA. NEL BORGO DICONO CHE HO LE MANI LESTE. È VERO, MA SOLO CON CHI SE LO MERITA.',
        'MIRTA CERCA GENTE PER UN VIAGGIO LUNGO. IO QUI HO FINITO LE TASCHE DA GUARDARE: VENGO CON TE.',
        'UNA COSA, PRIMA. HO LASCIATO LA MIA BORSA IN FONDO ALLA TANA DEL TASSO, A NORD-OVEST DEL BORGO. DA SOLA NON CI TORNO: ACCOMPAGNAMI.'],
      prova: { tipo: 'luogo', x: 3650, z: 4400, r: 30, sotto: 1, n: 'LA BORSA DI VESPA', riga: 'ACCOMPAGNA VESPA IN FONDO ALLA TANA DEL TASSO (A NORD-OVEST DEL BORGO).',
        fatto: ['ECCOLA! ESATTAMENTE DOVE L\'AVEVO LASCIATA. E DENTRO C\'È ANCORA TUTTO.', 'TIENI: METÀ È TUA. UNA LADRA PAGA SEMPRE I SUOI DEBITI. QUASI SEMPRE.'] },
      premio: { monete: 80, cosa: 'trifoglio' },
      dice: ['SE SENTI TINTINNARE, NON SONO IO. IO NON TINTINNO MAI.', 'NELLE CITTÀ GRANDI MI TROVO MEGLIO: PIÙ TASCHE, MENO DOMANDE.', 'DAMMI LE SPALLE DI UN NEMICO E TI FACCIO VEDERE.'] },
    faela: { n: 'FAELA', chi: 'ELFA, ARCIERA', cls: 'arciere', razza: 'elfo', aspetto: { cap: 2, col: 2, bar: 0, pel: 0, occ: 2, sci: 3, seg: 4 },
      eq: { arma: 'lancia', armatura: 'mantello', elmo: null, scudo: null, acc: null }, casa: [ELFI[0] + 15, ELFI[1] + 17, Math.PI * 0.5], dove: "AL VILLAGGIO DEGLI ELFI, SOTTO L'ALBERO D'ARGENTO",
      incontro: ['IL BOSCO MI HA DETTO CHE SARESTI ARRIVATO. IO SONO FAELA, SENTINELLA DEL VILLAGGIO.',
        "GLI ELFI NON LASCIANO IL BOSCO VOLENTIERI. MA L'ALBERO D'ARGENTO HA PERSO TRE FOGLIE IN UNA NOTTE: LONTANO DA QUI QUALCOSA STA CAMBIANDO. VENGO A VEDERE.",
        'PRIMA, PERÒ: A NORD DEL VILLAGGIO IL VECCHIO GRIGIO GUIDA IL SUO BRANCO CONTRO CHI PASSA. DA SOLA NON L\'HO MAI FERMATO. IN DUE, FORSE.'],
      prova: { tipo: 'nemico', chi: 'grigio', x: 1458, z: 2538, n: 'IL VECCHIO GRIGIO', riga: 'CON FAELA, FERMA IL VECCHIO GRIGIO E IL SUO BRANCO (A NORD DEL VILLAGGIO DEGLI ELFI).',
        fatto: ['È FINITA. IL SENTIERO DEL NORD È DI NUOVO DI TUTTI.', 'ERA UN LUPO VALOROSO. GLI ELFI LO RICORDERANNO. E RICORDERANNO TE.'] },
      premio: { monete: 100, cosa: 'pozione' },
      dice: ['SENTI? NO, CERTO CHE NO. GLI ALBERI PARLANO PIANO.', 'TIENIMI I NEMICI LONTANI E NON NE SBAGLIO UNO.', 'FUORI DAL BOSCO IL CIELO È TROPPO GRANDE. MI CI ABITUERÒ.'] },
    korga: { n: 'KORGA', chi: 'ORCHESSA, SCIAMANA', cls: 'mago', razza: 'orco', aspetto: { cap: 4, col: 1, bar: 0, pel: 1, occ: 3, sci: 5, seg: 2 },
      eq: { arma: 'ferro', armatura: 'giaco', elmo: null, scudo: null, acc: 'talismano' }, casa: [5520, 3350, Math.PI], dove: 'ACCAMPATA AL MARGINE DI GIRASOLE (A NORD-EST DEL BORGO)',
      incontro: ['NON SCAPPI? BENE. QUI SCAPPANO TUTTI, QUANDO VEDONO LE ZANNE. SONO KORGA, E VENGO DA OLTRE IL VALICO DEI GIGANTI.',
        'LE MIE OSSA DICONO CHE UNA COMPAGNIA SI STA FORMANDO. LE OSSA NON SBAGLIANO: SBAGLIO IO A LEGGERLE, A VOLTE. VENGO CON TE.',
        'MA PER IL MIO DECOTTO SERVONO TRE FUNGHI DI BOSCO. RACCOGLIAMOLI PER STRADA, E TI FARÒ VEDERE CHE COSA SA FARE UNA SCIAMANA.'],
      prova: { tipo: 'raccolta', k: 'fungo', quanti: 3, n: 'IL DECOTTO DI KORGA', riga: 'RACCOGLI TRE FUNGHI DI BOSCO PER IL DECOTTO DI KORGA (NEI BOSCHI E NELLE PALUDI).',
        fatto: ['TRE FUNGHI, UN PIZZICO DI CENERE, E... ECCO. NON ANNUSARLO.', 'UN SORSO RIMETTE IN PIEDI UN ORCO. A TE NE BASTERÀ MEZZO: TIENILO PER I GIORNI BRUTTI.'] },
      premio: { monete: 60, cosa: 'elisir' },
      dice: ['OLTRE IL VALICO LA TERRA È DIVERSA. PIÙ GRANDE. PIÙ AFFAMATA.', 'IL FUOCO ASCOLTA CHI GLI PARLA CON RISPETTO. IO GLI PARLO FORTE.', 'DA NOI CHI È PICCOLO PORTA LA LEGNA. TU SARESTI UN BUON PORTATORE DI LEGNA.'] },
    dorno: { n: 'DORNO', chi: 'NANO, CAVALIERE', cls: 'cavaliere', razza: 'nano', aspetto: { cap: 1, col: 3, bar: 2, pel: 1, occ: 0, sci: 2, seg: 0 },
      eq: { arma: 'mazza', armatura: 'cotta', elmo: 'elmoFerro', scudo: 'scudoFerro', acc: null }, casa: [5052, 628, 0], dove: 'ALLA PORTA DI FUCINAFONDA, SUI MONTI A NORD',
      incontro: ["ALT! ...AH, NO, SCUSA. L'ABITUDINE. DORNO, GUARDIA DELLA PORTA DA TRENT'ANNI.",
        "TRENT'ANNI A GUARDARE CHI PARTE. STAVOLTA PARTO IO. IL MIO SCUDO È TUO, SE TI SERVE QUALCUNO CHE STIA DAVANTI.",
        "PRIMA DI ANDARE: MIO NONNO LASCIÒ UN FORZIERE ALLA VENA D'ORO, IN FONDO ALLA MINIERA DI BARBAROSSA. ANDIAMO A VEDERE SE C'È ANCORA."],
      prova: { tipo: 'forziere', id: 'gv_vena', x: 4372, z: 1176, n: 'IL FORZIERE DEL NONNO', riga: "CON DORNO, APRI IL FORZIERE DELLA VENA D'ORO, IN FONDO ALLA MINIERA DI BARBAROSSA.",
        fatto: ['PER LA BARBA DI MIO NONNO: È ANCORA QUI! E NON È VUOTO.', "LUI DICEVA: «L'ORO SI DIVIDE CON CHI HA SCAVATO CON TE». ABBIAMO SCAVATO. DIVIDIAMO."] },
      premio: { monete: 120, cosa: 'pozione' },
      dice: ['STAMMI DIETRO. NO: PROPRIO DIETRO.', "QUESTO SCUDO HA FERMATO UN TROLL DI GROTTA. IL TROLL NON L'HA PRESA BENE.", 'ALL\'APERTO NON C\'È IL SOFFITTO. MI FA UN CERTO EFFETTO.'] } };
  W.COMP_ORD = ['vespa', 'faela', 'korga', 'dorno'];
  // la gilda degli eroi: un maestro al Borgo (sulla via che dal punto di partenza sale alla piazza, sul lato destro: ci si passa accanto) e uno alla Rocca (in piazza, verso la fontana). (Nelle città il maestro nasce accanto alla bacheca degli incarichi; qui la bacheca
  // non c'è ancora, e senza di lei il maestro non nasceva: la gilda, di cui il gioco parla, non si trovava.) Cambia il mestiere e insegna le abilità.
  m.city.folk('maestro', 'MAESTRO DELLA GILDA', BORGO[0] + 8, BORGO[1] + 42, 2.2, ['BENVENUTO, VIAGGIATORE. LA GILDA DEGLI EROI HA UN MAESTRO IN OGNI CITTÀ, E UNO ANCHE QUI AL BORGO. QUI SI CAMBIA MESTIERE E SI IMPARA.'], { role: 'guild', id: 'maestro_borgo' });
  m.city.folk('maestro', 'MAESTRO DELLA GILDA', ROCCA[0] - 36, ROCCA[1] + 30, -0.4, ['BENVENUTO ALLA GILDA DEGLI EROI DELLA ROCCA DI LUMEN. QUI SI CAMBIA MESTIERE E SI IMPARA.'], { role: 'guild', id: 'maestro_rocca' });
};
})();
