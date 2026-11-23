// ---------- IL GRANDE VIAGGIO · Terra I: Lumen — la vita dei paesi e le scuderie ----------
// Qui sta la gente che non ha un nome: i passanti che girano per le città e i villaggi (vanno in piazza, guardano le bancarelle,
// entrano nelle botteghe e alla locanda, la sera tornano a casa), i clienti che si trovano dentro le botteghe, le bancarelle
// del mercato, i tavoli all'aperto, e le due scuderie dove si affitta o si compra un cavallo.
// Come si muovono lo decide il gioco (g_saga.js, «la vita dei paesi»): qui ci sono solo gli elenchi e le frasi.
(() => {
SG.terre = SG.terre || {};
SG.terre.lumenVita = (m, L) => {
  const W = m.world, C = m.city, TN = m.town, TL = TN.TL, K = W.kit, LK = C.LOOKS, { BORGO, ROCCA } = L;
  const P = (...a) => W.PROPS.push(...a);
  W.TESTI = W.TESTI || {};

  // ================= ASPETTI =================
  // chi passeggia deve saper camminare (tre figure invece di una): dame, donne e marinai imparano adesso
  for (const k of ['dama', 'donna', 'marinaio']) if (LK[k]) LK[k].walk = 1;
  Object.assign(LK, {
    signore: { walk: 1, skin: '#e8b890', hat: '#2a2a3a', hairStyle: 'short', hair: '#3a2a1a', beard: '#3a2a1a', shirt: '#3a3a5a', belt: '#b89030', pants: '#2a2a34', boots: '#1e1a1a' },
    stalliere: { skin: '#d8a07a', hat: '#c8a04a', hairStyle: 'short', hair: '#6a3a1a', shirt: '#8a4a2a', sleeve: '#e8dcc0', belt: '#3a2a1a', pants: '#5a4a3a', boots: '#3a2418' } });

  // ================= I PASSANTI =================
  // per ogni paese: quanti, e con che aspetto. Il nome dice solo chi sono; quel che dicono dipende da quel che stanno facendo (W.VITA.detti)
  const NOMI = { borghese: ['UN BORGHESE'], donna: ['UNA DONNA DEL PAESE', 'UNA MASSAIA'], contadino: ['UN CONTADINO'], mercantessa: ['UNA MERCANTESSA'], bimbo: ['UN BAMBINO', 'UNA BAMBINA'], signore: ['UN SIGNORE', 'UN NOTAIO'],
    dama: ['UNA DAMA', 'UNA GENTILDONNA'], pastore: ['UN PASTORE'], mercante: ['UN MERCANTE'], fioraia: ['UNA RAGAZZA'], elfa: ["UN'ELFA"], elfo: ['UN ELFO'], marinaio: ['UN MARINAIO', 'UN PESCATORE'] };
  const PAESI = {
    borgo: [10, ['borghese', 'donna', 'contadino', 'mercantessa', 'bimbo', 'signore', 'dama', 'pastore', 'donna', 'bimbo']],
    rocca: [16, ['dama', 'signore', 'borghese', 'mercante', 'mercantessa', 'donna', 'bimbo', 'fioraia', 'dama', 'signore', 'borghese', 'donna', 'bimbo', 'mercante', 'contadino', 'dama']],
    elfi: [4, ['elfa', 'elfo', 'elfa', 'elfo']],
    pratolungo: [4, ['contadino', 'donna', 'pastore', 'bimbo']], cala: [4, ['marinaio', 'donna', 'bimbo', 'marinaio']],
    girasole: [4, ['contadino', 'donna', 'fioraia', 'mercante']], faro: [3, ['marinaio', 'donna', 'borghese']] };
  const piani = {}; for (const b of W.BUILD) if (b.k === 'city' && b.plan) piani[b.plan.o.id] = b.plan;
  let conta = 0;
  for (const id in PAESI) { const pl = piani[id]; if (!pl) continue; const [n, looks] = PAESI[id], r = Math.min(pl.pl.w, pl.pl.d) * 0.42;
    for (let i = 0; i < n; i++) { const look = looks[i % looks.length], nomi = NOMI[look] || ['UN PASSANTE'], a = i / n * Math.PI * 2 + 0.4;
      C.folk(look, nomi[(conta++) % nomi.length], pl.px + Math.cos(a) * r, pl.pz + Math.sin(a) * r, a + Math.PI, ['BUONGIORNO, VIANDANTE.'], { id: 'v_' + id + '_' + i, walk: 1, vita: id, nott: i % 4 === 1 }); } }

  // quel che dice un passante, secondo quel che sta facendo ({citta} diventa il nome del paese). Le dice chiunque, uomo o donna: niente parole che cambiano col genere
  const detti = {
    giro: ['DUE PASSI FANNO BENE, DOPO UNA GIORNATA COSÌ.', 'VADO DI FRETTA: SCUSA, VIANDANTE!', 'OGGI C\'È PIÙ GENTE DEL SOLITO, IN GIRO.', 'CERCO MIO CUGINO. SE VEDI UNO CHE MI SOMIGLIA, DIGLI CHE LO ASPETTO IN PIAZZA.', 'A {citta} CI SI CONOSCE TUTTI. TU, PERÒ, NON TI HO MAI VISTO.'],
    piazza: ['IN PIAZZA SI SANNO TUTTE LE NOVITÀ. BASTA FERMARSI E ASCOLTARE.', 'ASPETTO UN\'AMICA. È SEMPRE IN RITARDO.', 'GUARDO PASSARE LA GENTE: È IL MIO PASSATEMPO PREFERITO.', 'DICONO CHE IL RE VOGLIA COSTRUIRE UN PONTE LUNGO COME UN FIUME. CHISSÀ.'],
    fontana: ['L\'ACQUA DELLA FONTANA È LA PIÙ FRESCA DEL PAESE.', 'MI RIPOSO UN MOMENTO. LE GAMBE NON SONO PIÙ QUELLE DI UNA VOLTA.'],
    bancarella: ['STO SCEGLIENDO. NON MI METTERE FRETTA!', 'QUESTE MELE SONO PIÙ CARE DI IERI, MA SONO ANCHE PIÙ BELLE.', 'IL FORMAGGIO DI PRATOLUNGO È IL MIGLIORE. NE PRENDO SEMPRE UNA FORMA.', 'CERCO UN REGALO PER MIA MADRE. TU CHE DICI: UN NASTRO O UN PETTINE?'],
    vetrina: ['GUARDO SOLTANTO. I PREZZI, QUI, SONO DA SIGNORI.', 'VORREI ENTRARE, MA POI FINISCE CHE COMPRO.', 'CHE BELLA ROBA HANNO MESSO FUORI OGGI.'],
    tavolo: ['UN BICCHIERE DI SIDRO ALL\'ARIA APERTA: NON CHIEDO DI MEGLIO.', 'ALLA TUA SALUTE, VIANDANTE!', 'L\'OSTE DICE CHE LA ZUPPA DI OGGI È LA PIÙ BUONA DELL\'ANNO. LO DICE TUTTI I GIORNI.', 'MI SIEDO UN ATTIMO: SE PASSA QUALCUNO DI CASA MIA, NON MI HAI VISTO.'],
    chiacchiera: ['STAVAMO PARLANDO DEL TEMPO. DOMANI PIOVE, TE LO DICE IL MIO GINOCCHIO.', 'SHH: STO SENTENDO UNA STORIA INTERESSANTE.', 'HAI SAPUTO? ALLA ROCCA CERCANO GENTE PER IL PONTE.', 'CHIACCHIERE, CHIACCHIERE... E INTANTO IL PANE SI RAFFREDDA.'],
    porta: ['ASPETTO IL CARRO DI MIO FRATELLO. DOVEVA ARRIVARE A MEZZOGIORNO.', 'DA QUI SI VEDE CHI ARRIVA. OGGI SEI ARRIVATO TU.'],
    casa: ['TORNO A CASA: HO LASCIATO LA PENTOLA SUL FUOCO.', 'ABITO QUI. BEL POSTO, NO?'],
    sera: ['SI FA SERA: È ORA DI RIENTRARE.', 'LA SERA LE STRADE NON SONO PIÙ SICURE COME UNA VOLTA. BUONANOTTE!', 'DOMANI SI LAVORA. BUONANOTTE, VIANDANTE.'],
    notte: ['UN ULTIMO BICCHIERE E POI A LETTO. FORSE.', 'DI NOTTE {citta} È UN\'ALTRA COSA. SENTI CHE SILENZIO?'],
    bimbo: ['GIOCHIAMO A NASCONDINO? CONTO IO!', 'DA GRANDE AVRÒ UNA SPADA COME LA TUA!', 'LA MAMMA DICE DI NON PARLARE CON GLI SCONOSCIUTI. TU PERÒ HAI LA FACCIA BUONA.', 'HO VISTO UN GATTO GRANDE COSÌ!'],
    cavallo: ['CHE BEL CAVALLO! È TUO?', 'ATTENTO A NON TRAVOLGERE NESSUNO, CON QUELLA BESTIA.'],
    // usciti da una bottega
    esce: { sartoria: ['HO APPENA PRESO LA STOFFA PER UN MANTELLO NUOVO. LA SARTA HA LE MANI D\'ORO.', 'LA SARTA MI HA PRESO LE MISURE. FRA TRE GIORNI È PRONTO.'], locanda: ['HO MANGIATO COME UN RE. ADESSO DUE PASSI, O MI ADDORMENTO.', 'UN BOCCALE E VIA. NON DIRLO IN GIRO.'],
      emporio: ['HO COMPRATO SALE, SPAGO E CANDELE. LE SOLITE COSE.', 'ALL\'EMPORIO SI TROVA TUTTO, TRANNE QUEL CHE CERCAVO.'], armeria: ['HO FATTO AFFILARE IL COLTELLO DI CASA. ADESSO TAGLIA ANCHE I PENSIERI.', 'UN ELMO COSTA QUANTO UNA MUCCA. HO SOLO GUARDATO.'],
      fucina: ['HO FATTO AFFILARE LA FALCE: FRA POCO SI MIETE.', 'IL FABBRO DICE CHE IL FERRO BUONO SCARSEGGIA.'], erboristeria: ['HO PRESO UN INFUSO PER LA TOSSE. SA DI FIENO BAGNATO.', 'L\'ERBORISTA HA UN RIMEDIO PER TUTTO. PER LA POVERTÀ, PERÒ, NO.'], orafo: ['HO GUARDATO GLI ANELLI. SOLO GUARDATO.', 'PER LE NOZZE DI MIA FIGLIA CI VUOLE UN GIOIELLO. E UN PRESTITO.'] },
    // dentro una bottega (i passanti entrati e i clienti di passaggio)
    dentro: { sartoria: ['QUESTO COLORE MI STA BENE, O MI FA LA FACCIA GIALLA?', 'CERCO UNA STOFFA CHE NON SI SCIUPI: HO TRE FIGLI.', 'LA SETA DI ZAFIRA NON ARRIVA PIÙ. BISOGNA ACCONTENTARSI DELLA LANA.', 'UN CAPPUCCIO PER L\'INVERNO: QUELLO DELL\'ANNO SCORSO SE L\'È MANGIATO LA CAPRA.'],
      locanda: ['LA ZUPPA È CALDA E IL BOCCALE È PIENO. CHE VUOI DI PIÙ?', 'ALLA SALUTE DEL RE! E ANCHE ALLA NOSTRA.', 'VENGO QUI OGNI SERA. A CASA MIA NON C\'È IL CAMINO.', 'L\'OSTE SA TUTTO DI TUTTI. MA NON GLIELO CHIEDERE A STOMACO VUOTO.', 'STO ASPETTANDO UN AMICO. INTANTO BEVO ANCHE PER LUI.', 'HAI LA FACCIA DI UNO CHE HA CAMMINATO TANTO. SIEDITI!'],
      emporio: ['MI SERVE UNA CORDA LUNGA. MOLTO LUNGA. NON CHIEDERMI PERCHÉ.', 'GUARDO I PREZZI E POI TORNO DOMANI. FORSE.', 'QUI DENTRO C\'È ODORE DI SPEZIE E DI SAPONE. MI PIACE.'],
      armeria: ['QUESTA LAMA È BEN BILANCIATA. PECCATO IL PREZZO.', 'NON SO USARE LA SPADA, MA MI PIACE GUARDARLE.', 'CERCO UNO SCUDO PER MIO FIGLIO: PARTE CON LA GUARDIA DEL RE.'],
      fucina: ['ASPETTO CHE IL FABBRO MI AGGIUSTI IL VOMERE.', 'SENTI CHE CALDO, QUI DENTRO! D\'INVERNO CI VERREI A DORMIRE.', 'UNA BUONA LAMA SI RICONOSCE DAL SUONO. ASCOLTA!'],
      erboristeria: ['CERCO QUALCOSA PER DORMIRE. LE RANE, DA ME, CANTANO TUTTA LA NOTTE.', 'QUELLE BOCCETTE VERDI FANNO MIRACOLI. O ALMENO COSÌ DICONO.', 'MIA NONNA CURAVA TUTTO CON IL MIELE. ERA PIÙ BUONO.'],
      orafo: ['GUARDA COME BRILLA QUELLA PIETRA. COSTA QUANTO LA MIA CASA.', 'CERCO UN ANELLO. NON PER ME: PER UNA PERSONA.', 'DICONO CHE CERTI AMULETI PORTINO DAVVERO FORTUNA.'] } };

  // ================= I CLIENTI DI PASSAGGIO =================
  // gente che non gira per strada: la si trova solo dentro, ogni tanto. Per ogni tipo di bottega, qualche aspetto
  const CL = { locanda: ['borghese', 'contadino', 'mercante', 'signore', 'donna', 'pastore', 'marinaio'], sartoria: ['dama', 'donna', 'signore', 'mercantessa'], emporio: ['donna', 'contadino', 'borghese', 'mercantessa'],
    armeria: ['signore', 'borghese', 'contadino'], fucina: ['contadino', 'borghese', 'pastore'], erboristeria: ['donna', 'dama', 'contadino'], orafo: ['dama', 'signore', 'mercante'] };
  const clienti = {};
  for (const kind in CL) clienti[kind] = CL[kind].map((look, i) => { const id = 'cl_' + kind + '_' + i, nomi = NOMI[look] || ['UN CLIENTE']; W.FOLK[id] = { n: nomi[i % nomi.length], look, lines: detti.dentro[kind], cliente: kind }; return id; });

  // ================= BANCARELLE E TAVOLI =================
  const bancarelle = {}, tavoli = {};
  const banco = (id, dx, dz, cloth, look, nome, righe, roba) => { const pl = piani[id]; if (!pl) return; const x = pl.px + dx, z = pl.pz + dz;
    W.BUILD.push({ k: 'stall', x, z, w: 14, d: 8, h: 7, cloth }); P([roba || 'crate', x + 9.5, z - 1], ['sack', x - 9.5, z - 0.5]);
    C.folk(look, nome, x, z - 6, Math.PI / 2, righe, { sveglio: 0 }); (bancarelle[id] = bancarelle[id] || []).push([x, z + 7.5]); };
  banco('borgo', -24, 18, TL.AWN_GREEN, 'contadino', "L'ORTOLANO", ['CAVOLI, RAPE E CIPOLLE DEGLI ORTI DEL BORGO. TUTTA ROBA DI STAMATTINA.', 'IL MULINO HA RIPRESO A MACINARE: FRA POCO AVREMO ANCHE IL PANE BUONO.'], 'barrel');
  banco('borgo', 24, 18, TL.AWN_YELLOW, 'donna', 'LA FORNAIA', ['PANE CALDO! FOCACCE! CHI PRIMA ARRIVA, MEGLIO MANGIA.', 'IL SEGRETO È IL LIEVITO DI MIA NONNA. HA PIÙ ANNI DI ME.'], 'crate');
  banco('rocca', -46, 34, TL.AWN_BLUE, 'pescivendola', 'LA PESCIVENDOLA', ['PESCE DELLA CALA, ARRIVATO STANOTTE COL CARRO DEL GHIACCIO!', 'LE CONCHIGLIE LE REGALO AI BAMBINI. I PESCI NO.'], 'barrel');
  banco('rocca', 46, 34, 13, 'mercante', 'IL VENDITORE DI NASTRI', ['NASTRI, BOTTONI, PETTINI D\'OSSO! TUTTO QUEL CHE SERVE A UNA DAMA.', 'LA SARTA COMPRA DA ME, MA NON DIRLO IN GIRO: POI ALZA I PREZZI.'], 'crate');
  banco('rocca', 46, -34, TL.AWN_GREEN, 'contadino', 'IL FORMAGGIAIO', ['FORMAGGIO DI PRATOLUNGO, STAGIONATO NELLE GROTTE. ASSAGGIA!', 'IL CUOCO DEL RE NE PRENDE TRE FORME ALLA SETTIMANA.'], 'crate');
  // i tavoli all'aperto davanti alla Locanda del Leone
  { const pl = piani.rocca; if (pl) { tavoli.rocca = []; for (const [dx, dz] of [[-51, -43], [-53, -30]]) { const x = pl.px + dx, z = pl.pz + dz; P(['table', x, z], ['stool', x - 4.6, z + 0.4], ['stool', x + 4.6, z - 0.4], ['stool', x + 0.4, z + 4.6]); tavoli.rocca.push([x, z]); } P(['barrel', pl.px - 60, pl.pz - 37]); } }

  // ================= LE SCUDERIE =================
  // un recinto di legno: pali e due correnti, con un varco. b: { x, z, w, d, varco: [lato, da, a] }
  W.builders.recinto = (b, gy) => { const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y = gy(b.x, b.z), [vl, va, vb] = b.varco || [];
    const tratto = (ax, az, bx, bz, lato) => { const Ln = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(Ln / 6));
      for (let i = 0; i < n; i++) { const t0 = i / n * Ln, t1 = (i + 1) / n * Ln; if (lato === vl && t0 >= va - 0.01 && t1 <= vb + 0.01) continue;
        const px0 = ax + (bx - ax) * t0 / Ln, pz0 = az + (bz - az) * t0 / Ln, px1 = ax + (bx - ax) * t1 / Ln, pz1 = az + (bz - az) * t1 / Ln;
        for (const [qx, qz] of [[px0, pz0], [px1, pz1]]) K.box(qx - 0.45, qz - 0.45, qx + 0.45, qz + 0.45, y - 1.5, y + 4.4, 3);
        for (const h of [1.5, 3.2]) K.box(Math.min(px0, px1) - 0.2, Math.min(pz0, pz1) - 0.2, Math.max(px0, px1) + 0.2, Math.max(pz0, pz1) + 0.2, y + h, y + h + 0.6, 3);
        W.addBox(Math.min(px0, px1) - 0.5, Math.min(pz0, pz1) - 0.5, Math.max(px0, px1) + 0.5, Math.max(pz0, pz1) + 0.5, y + 4, b); } };
    tratto(x0, z0, x1, z0, 'n'); tratto(x0, z1, x1, z1, 's'); tratto(x0, z0, x0, z1, 'w'); tratto(x1, z0, x1, z1, 'e'); };
  W.CAVALLI = [];        // i cavalli nei recinti (solo da guardare): [x, z, verso, manto]
  const scuderia = (x, z, nome, muro, tetto, chi, righe) => {
    W.FLAT.push([x, z, 52, null]); W.CLEAR.push([x - 46, z - 40, x + 46, z + 42]); W.PLACES.push([x, z, 62, nome, 0]);
    W.BUILD.push({ k: 'house', x: x - 8, z: z - 20, w: 34, d: 15, h: 11, wall: muro, roof: tetto, door: 's', chim: false });        // la stalla
    W.BUILD.push({ k: 'recinto', x: x - 8, z: z + 6, w: 40, d: 26, varco: ['e', 6, 18] });                                           // il recinto, col varco a levante
    P(['haybale', x - 22, z - 2], ['haybale', x - 17, z - 4], ['haybale', x + 16, z - 22], ['barrel', x + 15, z - 14], ['cart', x + 27, z - 18], ['sack', x + 21, z - 12], ['lantern', x + 14, z + 2], ['sign', x + 24, z + 30]);
    W.TESTI[(x + 24) + ',' + (z + 30)] = [nome + '. CAVALLI A GIORNATA E DA COMPRARE.', 'CHI HA UN CAVALLO LO CHIAMA COL FISCHIO: IL FERRO DI CAVALLO ACCANTO AL TASTO C.'];
    W.CAVALLI.push([x - 18, z + 8, 0.4, 1], [x - 2, z + 12, 2.6, 2]);
    C.folk('stalliere', chi, x + 19, z + 12, Math.PI / 2, righe, { role: 'scuderia', posto: [x + 26, z + 16] });
  };
  scuderia(BORGO[0] + 281, BORGO[1] - 50, 'SCUDERIA DEL BORGO', 1, 4, 'LO STALLIERE DEL BORGO', ['CAVALLI BUONI, FERRATI DI FRESCO. A PIEDI, DI QUI ALLA ROCCA, CI VUOLE MEZZA GIORNATA: IN SELLA, UN\'ORA.']);
  scuderia(ROCCA[0] - 500, ROCCA[1] + 130, 'SCUDERIE DEL RE', 16, 5, 'IL MAESTRO DI STALLA', ['LE SCUDERIE DEL RE SERVONO ANCHE I VIANDANTI, PURCHÉ PAGHINO. I NOSTRI CAVALLI CONOSCONO OGNI STRADA DI LUMEN.']);

  W.VITA = { paesi: PAESI, detti, clienti, bancarelle, tavoli };
  W.PLACES.sort((a, b) => a[2] - b[2]);
};
})();
