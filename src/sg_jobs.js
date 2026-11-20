// ===================== PIXEL SAGA · gli incarichi delle bacheche =====================
// Ogni città ha la sua bacheca con quattro incarichi. Cinque generi:
//   caccia   — abbattere q nemici di un tipo (ovunque)
//   taglia   — un nemico con un nome, grosso e cattivo, che compare in un punto solo a incarico accettato
//   consegna — portare qualcosa a una persona (paga lei, sul posto)
//   raccolta — trovare q cose sparse in una zona (compaiono solo a incarico accettato)
//   visita   — raggiungere un luogo
// Tranne le consegne, la paga si riscuote alla bacheca. Chi sbriga tutti e quattro gli incarichi di una città
// ne diventa cittadino onorario (un cuore di cristallo); e ogni incarico pagato vale uno sconto nelle sue botteghe.
(() => {
const LIST = {
  // ---------- Borgo Aurora ----------
  b1: { c: 'borgo', n: 'LUPI SULLA STRADA DEL BOSCO', by: 'I PASTORI DEL BORGO', k: 'caccia', foe: 'wolf', pl: 'LUPI', q: 5, coins: 60,
    txt: 'I LUPI DEL BOSCO ANTICO SCENDONO FINO ALLA STRADA E SI PORTANO VIA LE PECORE. CHI NE ABBATTE CINQUE AVRÀ LA NOSTRA GRATITUDINE, E SESSANTA MONETE.' },
  b2: { c: 'borgo', n: 'FUNGHI PER LA ZUPPA', by: 'OSTESSA GEMMA, LOCANDA DEL GALLO', k: 'raccolta', what: 'fungo', label: 'FUNGHI', q: 5, coins: 40, gift: ['pozione', 2],
    pts: [[1560, 2080], [1420, 1960], [1330, 1840], [1500, 1880], [1250, 1760], [1620, 1960], [1380, 2080]], where: 'LUNGO LA STRADA DEL BOSCO ANTICO, A NORD-OVEST',
    txt: 'LA ZUPPA DEL GALLO SENZA I FUNGHI ROSSI DEL BOSCO NON È LA ZUPPA DEL GALLO. NE SERVONO CINQUE: CRESCONO AI LATI DELLA STRADA PER IL BOSCO ANTICO. PAGO IN MONETE E IN POZIONI.' },
  b3: { c: 'borgo', n: 'UN PACCO PER LA ROCCA', by: 'NINO IL MERCANTE', k: 'consegna', to: 'orafo', toN: "IL MASTRO ORAFO, ALLA ROCCA DI LUMEN", coins: 70,
    txt: "HO UN PACCO PER IL MASTRO ORAFO DELLA ROCCA DI LUMEN, E DUE GAMBE CHE NON SONO PIÙ QUELLE DI UNA VOLTA. LA SUA BOTTEGA DÀ SULLA PIAZZA DELLA ROCCA, A SUD-EST. PAGA LUI, ALLA CONSEGNA.",
    thanks: ['IL PACCO DI NINO! LO ASPETTAVO DA UNA LUNA INTERA.', 'ECCO LE TUE SETTANTA MONETE. E SALUTAMI QUEL VECCHIO BRONTOLONE.'] },
  b4: { c: 'borgo', n: 'TAGLIA: IL RE DELLE MELME', by: 'GUARDIA OTTO', k: 'taglia', coins: 120, where: 'NEI CAMPI DORATI, A EST DEL FIUME',
    boss: { n: 'IL RE DELLE MELME', as: 'slime', x: 2500, z: 2590, sc: 0.46, hp: 34, dmg: 2, sp: 15, r: 5.5, range: 9, tint: [1.04, 0.6, 0.66] },
    txt: "NEI CAMPI DORATI SI AGGIRA UNA MELMA GRANDE COME UN CARRO. I CONTADINI LA CHIAMANO IL RE. IO LA CHIAMO UN PROBLEMA. CENTOVENTI MONETE A CHI LO RISOLVE." },
  // ---------- Rocca di Lumen ----------
  r1: { c: 'rocca', n: 'SCHELETRI SULLA VIA DEL DESERTO', by: 'IL CAPITANO ARDEA', k: 'caccia', foe: 'skel', pl: 'SCHELETRI', q: 6, coins: 130,
    txt: 'GLI SCHELETRI DI SOLIS SI SPINGONO OGNI NOTTE PIÙ VICINO ALLA STRADA. LA ROCCA PAGA CENTOTRENTA MONETE A CHI NE RIMANDA SEI A DORMIRE SOTTO LA SABBIA.' },
  r2: { c: 'rocca', n: 'IL FARO SPENTO', by: 'I PESCATORI DELLA FOCE', k: 'visita', x: 1310, z: 3640, r: 44, at: 'IL FARO DEL SUD', coins: 90, where: 'SULLA COSTA A SUD-OVEST',
    txt: "DA TRE NOTTI IL VECCHIO FARO DEL SUD NON SI ACCENDE, E LE BARCHE NON TROVANO LA FOCE. QUALCUNO VADA A VEDERE: LA TORRE È SULLA COSTA, A SUD-OVEST DEL BORGO.",
    found: 'LA LANTERNA ERA SOLO INCROSTATA DI SALSEDINE: UNA BELLA STROFINATA, E IL FARO TORNA A VEDERSI.' },
  r3: { c: 'rocca', n: 'UN RIMEDIO PER MIRTA', by: "L'ERBORISTA DELLA ROCCA", k: 'consegna', to: 'mirta', toN: "L'ANZIANA MIRTA, A BORGO AURORA", coins: 60, gift: ['elisir', 1],
    txt: "L'ANZIANA MIRTA DI BORGO AURORA ASPETTA IL SUO DECOTTO PER LE OSSA. È PRONTO DA GIORNI, MA NESSUNO PASSA DI LÀ. PORTAGLIELO: SAPRÀ RICOMPENSARTI.",
    thanks: ["IL DECOTTO DELL'ERBORISTA! LE MIE POVERE GINOCCHIA TI RINGRAZIANO.", "PRENDI: SESSANTA MONETE, E UN ELISIR CHE TENEVO DA PARTE PER UN'OCCASIONE."] },
  r4: { c: 'rocca', n: 'TAGLIA: GRINFIA, CAPO DEI GOBLIN', by: 'RE ALDRIC DI LUMEN', k: 'taglia', coins: 200, where: "AI MARGINI DELLA PALUDE D'OMBRA, A OVEST",
    boss: { n: 'GRINFIA', as: 'goblin', x: 1010, z: 2690, sc: 0.3, hp: 55, dmg: 3, sp: 27, r: 4.5, range: 10, tint: [1.04, 0.74, 0.5] },
    txt: "I GOBLIN DELLA PALUDE HANNO UN CAPO: GRINFIA. È LUI CHE LI MANDA A RUBARE NEI CAMPI. DUECENTO MONETE DAL TESORO DEL RE A CHI LO FERMA." },
  // ---------- Castelrosso ----------
  c1: { c: 'castelrosso', n: 'PREDONI SULLA VIA DEL BOSCO', by: 'IL BORGOMASTRO ULDERICO', k: 'caccia', foe: 'bandit', pl: 'PREDONI', q: 6, coins: 170,
    txt: "I PREDONI ASSALTANO I CARRI TRA IL PONTE E LA CITTÀ. CASTELROSSO PAGA CENTOSETTANTA MONETE PER SEI DI LORO MESSI IN FUGA PER SEMPRE." },
  c2: { c: 'castelrosso', n: "RESINA D'AMBRA", by: 'FRATE ERBOLARIO', k: 'raccolta', what: 'resina', label: 'RESINA', q: 5, coins: 150, where: "NEL BOSCO D'AMBRA, ATTORNO ALLE MURA",
    pts: [[5460, 3040], [5380, 3270], [5560, 3640], [6070, 3190], [6100, 3470], [5900, 3020], [5640, 3050]],
    txt: "DAGLI ALBERI ROSSI COLA UNA RESINA CHE GUARISCE LE FERITE. ME NE SERVONO CINQUE GOCCE, DI QUELLE GROSSE: LE TROVI AI PIEDI DEGLI ALBERI, TUTT'ATTORNO ALLE MURA." },
  c3: { c: 'castelrosso', n: 'FARINA PER MEZZAVIA', by: 'IL MUGNAIO', k: 'consegna', to: 'fattore', toN: 'IL FATTORE, A MEZZAVIA', coins: 120,
    txt: "IL FATTORE DI MEZZAVIA HA ORDINATO TRE SACCHI DI FARINA E IL MIO CARRO HA UNA RUOTA ROTTA. MEZZAVIA È SULLA STRADA PER PORTO SERENO, A SUD. PAGA LUI.",
    thanks: ['LA FARINA DEL MUGNAIO, FINALMENTE! STASERA A MEZZAVIA SI FA IL PANE.', 'CENTOVENTI MONETE, COME PATTUITO. E GRAZIE PER LA STRADA CHE HAI FATTO.'] },
  c4: { c: 'castelrosso', n: 'TAGLIA: IL LUPO ROSSO', by: 'I BOSCAIOLI', k: 'taglia', coins: 280, where: 'A NORD-EST, DOVE IL BOSCO SI FA FITTO',
    boss: { n: 'IL LUPO ROSSO', as: 'wolf', x: 6140, z: 2880, sc: 0.36, hp: 85, dmg: 4, sp: 38, r: 5, range: 10, tint: [1.04, 0.52, 0.42] },
    txt: "È GROSSO IL DOPPIO DEGLI ALTRI E HA IL PELO COLOR DELLE FOGLIE. TRE DI NOI NON SONO TORNATI DAL BOSCO. DUECENTOTTANTA MONETE PER LA SUA PELLE." },
  // ---------- Altabrina ----------
  a1: { c: 'altabrina', n: 'LUPI DEI GHIACCI', by: 'IL PASTORE', k: 'caccia', foe: 'icewolf', pl: 'LUPI DEI GHIACCI', q: 8, coins: 190,
    txt: "LE MIE CAPRE NON DORMONO PIÙ, E NEMMENO IO. OTTO LUPI DEI GHIACCI IN MENO, E SULL'ALTOPIANO TORNA LA PACE. CENTONOVANTA MONETE, TUTTE QUELLE CHE HO." },
  a2: { c: 'altabrina', n: 'LA BANDIERA SULLA CIMA', by: 'THANE BRUNILDE', k: 'visita', x: 6440, z: 965, r: 46, at: 'IL PIANORO DELLA CIMA GRANDE', coins: 150, where: 'IN CIMA AL SENTIERO DIETRO LA CITTÀ',
    txt: "OGNI ANNO UNO DI NOI PORTA LA BANDIERA DI ALTABRINA SUL PIANORO DELLA CIMA GRANDE. QUEST'ANNO IL SENTIERO È PIENO DI LUPI. SALE DIETRO LA CITTÀ, VERSO NORD-EST.",
    found: 'PIANTI LA BANDIERA DI ALTABRINA TRA LE ROCCE. IL VENTO LA APRE SUBITO: DA QUI SI VEDE MEZZO MONDO.' },
  a3: { c: 'altabrina', n: 'PELLICCE PER CASTELROSSO', by: 'LA PELLICCIAIA', k: 'consegna', to: 'merciaia', toN: 'LA MERCIAIA, A CASTELROSSO', coins: 150,
    txt: "LA MERCIAIA DI CASTELROSSO ASPETTA LE PELLICCE PER L'INVERNO. LA SUA SARTORIA DÀ SULLA PIAZZA. A ME BASTA CHE ARRIVINO ASCIUTTE: PAGA LEI.",
    thanks: ['LE PELLICCE DEL NORD! MORBIDE COME LE RICORDAVO.', 'CENTOCINQUANTA MONETE PER IL DISTURBO. LA STRADA DALLE NEVI È LUNGA, LO SO.'] },
  a4: { c: 'altabrina', n: 'TAGLIA: IL VECCHIO BIANCO', by: 'I MINATORI', k: 'taglia', coins: 320, where: "A EST, SULL'ALTOPIANO BIANCO",
    boss: { n: 'IL VECCHIO BIANCO', as: 'icewolf', x: 6860, z: 1330, sc: 0.38, hp: 105, dmg: 5, sp: 42, r: 5, range: 10, tint: [0.78, 0.9, 1.04] },
    txt: "UN LUPO BIANCO GRANDE COME UN ORSO GUIDA IL BRANCO DELL'ALTOPIANO. HA UNA CICATRICE SU UN OCCHIO: GLIEL'HA FATTA MIO PADRE. TRECENTOVENTI MONETE." },
  // ---------- Zafira ----------
  z1: { c: 'zafira', n: 'MUMMIE TRA LE DUNE', by: "LA GUARDIA DELL'EMIRA", k: 'caccia', foe: 'mummy', pl: 'MUMMIE', q: 6, coins: 220,
    txt: "LE MUMMIE ESCONO DALLE TOMBE A NORD E SEGUONO LE CAROVANE. L'EMIRA PAGA DUECENTOVENTI MONETE A CHI NE RIMETTE SEI NEI LORO SARCOFAGI." },
  z2: { c: 'zafira', n: 'ROSE DEL DESERTO', by: 'LA SPEZIALE', k: 'raccolta', what: 'rosa', label: 'ROSE DEL DESERTO', q: 5, coins: 190, where: 'TRA LE DUNE E GLI ALTOPIANI, A NORD',
    pts: [[7300, 2700], [7480, 2420], [7600, 2260], [7250, 2360], [7420, 2160], [7010, 2610], [7150, 2540]],
    txt: "LA ROSA DEL DESERTO NON È UN FIORE: È UNA PIETRA CHE IL VENTO SCOLPISCE NELLA SABBIA. TRITATA FINE, CURA QUASI TUTTO. ME NE SERVONO CINQUE, DALLE DUNE A NORD." },
  z3: { c: 'zafira', n: 'TAPPETI PER IL PORTO', by: 'LA TESSITRICE', k: 'consegna', to: 'armatore', toN: "L'ARMATORE, A PORTO SERENO", coins: 180,
    txt: "L'ARMATORE DI PORTO SERENO HA COMPRATO DIECI DEI MIEI TAPPETI, MA NESSUN CAMMELLIERE SCENDE FINO AL MARE. LA SUA BOTTEGA È SULLA PIAZZA DEL PORTO. PAGA LUI.",
    thanks: ['I TAPPETI DI ZAFIRA! OLTREMARE LI PAGANO A PESO D\'ORO.', 'A TE NE DO CENTOTTANTA, DI MONETE. NON DIRLO ALLA TESSITRICE.'] },
  z4: { c: 'zafira', n: 'TAGLIA: IL RE SCIACALLO', by: "L'EMIRA SAHAR", k: 'taglia', coins: 340, where: 'A SUD-EST, TRA I GRADONI DELLE TERRE ROSSE',
    boss: { n: 'IL RE SCIACALLO', as: 'jackal', x: 7470, z: 3580, sc: 0.36, hp: 100, dmg: 5, sp: 44, r: 5, range: 10, tint: [1.04, 0.82, 0.4] },
    txt: "TRA I GRADONI A SUD-EST REGNA UNO SCIACALLO DAL PELO D'ORO. I SUOI BRANCHI CI RUBANO IL BESTIAME. ZAFIRA OFFRE TRECENTOQUARANTA MONETE PER LA SUA CORONA." },
  // ---------- Porto Sereno ----------
  p1: { c: 'porto', n: 'TIGRI NELLA SELVA', by: 'IL CAPITANO NEREO', k: 'caccia', foe: 'tiger', pl: 'TIGRI', q: 5, coins: 250,
    txt: "LA STRADA PER IL TEMPIO DELLA LAGUNA PASSA DALLA SELVA, E NELLA SELVA CI SONO LE TIGRI. CINQUE IN MENO, E I MIEI MARINAI TORNANO A FARE LEGNA. DUECENTOCINQUANTA MONETE." },
  p2: { c: 'porto', n: 'CONCHIGLIE DELLA BAIA', by: 'LA PESCIVENDOLA', k: 'raccolta', what: 'conchiglia', label: 'CONCHIGLIE', q: 5, coins: 160, where: 'SULLE SPIAGGE DELLA BAIA, A NORD E A SUD DEL PORTO',
    pts: [[5270, 5130], [5200, 4970], [5340, 5650], [5270, 5800], [5430, 5770], [5215, 5050], [5180, 5890]],
    txt: "LE CONCHIGLIE ROSA DELLA BAIA DI ZAFFIRO, MACINATE, FANNO LA ZUPPA DENSA COME PIACE AI MARINAI. ME NE SERVONO CINQUE: IL MARE LE LASCIA SULLE SPIAGGE FUORI DAL PORTO." },
  p3: { c: 'porto', n: 'IL TEMPIO NELLA LAGUNA', by: "L'ARMATORE", k: 'visita', x: 6800, z: 5500, r: 56, at: 'IL TEMPIO DELLA LAGUNA', coins: 170, where: 'NELLA SELVA SMERALDO, IN FONDO ALLA STRADA A EST',
    txt: "SULLE MIE CARTE IL TEMPIO DELLA LAGUNA È UN PUNTO INTERROGATIVO. VAI A VEDERE SE ESISTE DAVVERO: È IN FONDO ALLA STRADA CHE ESCE DALLA PORTA EST. NON TI CHIEDO DI ENTRARCI.",
    found: "IL TEMPIO ESISTE, ED È PIÙ GRANDE DI QUANTO DICANO LE CARTE. SEGNI IL PUNTO SULLA MAPPA DELL'ARMATORE." },
  p4: { c: 'porto', n: 'TAGLIA: BARBANERA', by: 'IL NOSTROMO', k: 'taglia', coins: 360, where: 'A EST DEL PORTO, VERSO LA SELVA',
    boss: { n: 'BARBANERA', as: 'bandit', x: 6340, z: 5170, sc: 0.3, hp: 115, dmg: 5, sp: 30, r: 4.5, range: 10, tint: [0.62, 0.62, 0.7] },
    txt: "ERA IL MIO CAPITANO, PRIMA DI DARSI ALLA MACCHIA CON LA CASSA DELLA NAVE. ORA COMANDA I PREDONI A EST DEL PORTO. TRECENTOSESSANTA MONETE, E NON VOGLIO SAPERE COME." },
  // ---------- Fioralba ----------
  f1: { c: 'fioralba', n: 'SPETTRI NELLA BRUGHIERA', by: 'LA SENTINELLA', k: 'caccia', foe: 'wraith', pl: 'SPETTRI', q: 6, coins: 280,
    txt: "DI NOTTE GLI SPETTRI DELLA BRUGHIERA NERA ARRIVANO FINO AI NOSTRI CILIEGI. CHI NE DISPERDE SEI AVRÀ DUECENTOTTANTA MONETE E IL SONNO DEI NOSTRI BAMBINI." },
  f2: { c: 'fioralba', n: 'FIORI DI LOTO', by: 'LA FIORAIA', k: 'raccolta', what: 'loto', label: 'FIORI DI LOTO', q: 5, coins: 160, where: 'SULLE RIVE DEL LAGO DEI PETALI, A NORD-EST',
    pts: [[2850, 5125], [2670, 5040], [3040, 5020], [2760, 4862], [2960, 4872], [2650, 4950], [3050, 4940]],
    txt: "IL LOTO DEL LAGO DEI PETALI FIORISCE UNA VOLTA SOLA, E IO HO LA SERRA VUOTA. CINQUE FIORI, COLTI SULLA RIVA: IL LAGO È A NORD-EST DELLA CITTÀ." },
  f3: { c: 'fioralba', n: 'TÈ PER IL GUARDIANO DEL FARO', by: 'LA LOCANDIERA DEL TÈ', k: 'consegna', to: 'guardiano_faro', toN: "IL GUARDIANO DEL FARO, ALL'APPRODO DEL FARO", coins: 170,
    txt: "IL GUARDIANO DEL FARO DI LUMEN BEVE SOLO IL NOSTRO TÈ DEI PETALI. IL TRAGHETTO PARTE DALL'APPRODO DEI PETALI, A NORD-OVEST. PAGA LUI: È UN UOMO DI PAROLA.",
    thanks: ['IL TÈ DEI PETALI! SENZA, LE NOTTI AL FARO NON PASSANO MAI.', 'CENTOSETTANTA MONETE. E SE TI SERVE UN PASSAGGIO, IL TRAGHETTATORE È MIO CUGINO.'] },
  f4: { c: 'fioralba', n: 'TAGLIA: IL CAVALIERE SENZA NOME', by: 'DAMA SAKURA', k: 'taglia', coins: 400, where: 'NELLA BRUGHIERA NERA, A SUD',
    boss: { n: 'IL CAVALIERE SENZA NOME', as: 'skel', x: 2440, z: 6640, sc: 0.31, hp: 125, dmg: 6, sp: 26, r: 4.5, range: 11, tint: [0.7, 0.62, 1.04] },
    txt: "NELLA BRUGHIERA CAMMINA UN CAVALIERE MORTO DA CENTO ANNI, E NON RICORDA PIÙ PER CHI COMBATTEVA. DAGLI LA PACE. FIORALBA TI DARÀ QUATTROCENTO MONETE." },
};
const CITY = {}; for (const id in LIST) { LIST[id].id = id; (CITY[LIST[id].c] = CITY[LIST[id].c] || []).push(id); }
// il nome di ogni città (per la bacheca, lo sconto, il diploma)
const NOME = { borgo: 'BORGO AURORA', rocca: 'ROCCA DI LUMEN', castelrosso: 'CASTELROSSO', altabrina: 'ALTABRINA', zafira: 'ZAFIRA', porto: 'PORTO SERENO', fioralba: 'FIORALBA' };
SG.jobs = { LIST, CITY, NOME };
})();
