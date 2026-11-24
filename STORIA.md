# La Compagnia dell'Alba — Libro primo: le quattro luci di Lumen

Struttura della storia del Grande Viaggio (bozza concordata il 24/11/2026; da implementare a tappe, un capitolo per versione).

**A che punto siamo:** 2.41: l'impianto (tappe, scene, Lanterna, soste al fuoco, voci) + il Prologo + il Capitolo 1 (Vespa). Da fare: capitoli 2-5, il finale, gli incarichi di viaggio delle bacheche, i battibecchi tra compagni (servono almeno due compagni). Il testo e i luoghi sono in `src/sv_lumen8.js`, il motore in `src/g_saga.js` («la storia a capitoli»).

**Differenze dalla bozza nel capitolo 1:** la tappa della Cala delle Conchiglie è solo di passaggio (si va dal Faro alla Grotta delle Maree lungo la costa); i contrabbandieri della grotta sono i predoni e i granchi che c'erano già.
La cartina dei viaggi: `mappa_della_storia.png` (fatta con `/tmp/dg/carta.py` + `carta_disegna.py`).

## Il fondo (la verità, che si scopre a pezzi)

- Mille anni fa cadde Solis: «una notte il sole non tornò per tre giorni; quando tornò, la città era vuota». La gente di Solis non morì: andò a nord, dietro a qualcosa che la chiamava. Sono i primi **Spenti**.
- Prima di cadere, Solis divise la sua luce in quattro e l'affidò ai popoli di Lumen: il **Faro del Sud** (umani), l'**Albero d'Argento** (elfi), il **fuoco di Fucinafonda** (nani), la **Brace** (orchi, oltre il Valico).
- Ora le luci si spengono una dopo l'altra: qualcosa, nei Monti del Cielo oltre il Valico dei Giganti, le chiama di nuovo. Chi va a cercare il perché non torna, o torna spento: vuoto, senz'ombra, e spegne quel che tocca.
- Il drago del Picco «non dorme: aspetta», e «non è lui il nemico» (già nei racconti del mondo): resta un filo per il Libro secondo.

## Chi ha perso chi

| Compagno | Chi ha perso | Dove |
|---|---|---|
| Vespa (umana, furfante) | il padre Tullio, guardiano del Faro: sparito la notte in cui la luce tremò; il Borgo dà la colpa a lui | per mare, poi a nord |
| Faela (elfa, arciera) | la sorella Lirel: gli elfi non dormono, e lei dorme da quando è caduta la terza foglia | al Villaggio, addormentata |
| Korga (orchessa, sciamana) | la madre Urgra, capotribù: Korga lesse male le ossa, la tribù entrò tra i Giganti e non tornò. Korga fu cacciata | oltre il Valico |
| Dorno (nano, cavaliere) | il fratello Brando: trent'anni fa Dorno chiuse la porta dietro di lui. Brando è **lo Spento** | sotto il monte |
| Re Aldric | la figlia, la principessa **Alba**, partita a nord coi suoi cavalieri. La frana del Valico l'ha voluta lui, per paura; per non guardare a nord costruisce un ponte a levante | oltre il Valico |

Mirta (l'anziana del Borgo) ha cresciuto Vespa ed è l'ultima che ricorda la storia delle quattro luci. Dà all'eroe la **Lanterna dell'Alba**: prende una fiamma a ogni capitolo.

## I capitoli (ordine fisso; ogni capitolo porta al successivo)

### Prologo — La lanterna di Mirta (Borgo Aurora)
Mirta chiede una cosa piccola: portare l'olio al Faro, che da giorni trema; il carrettiere non si fida più della strada del sud. Vespa ruba la borsa dell'olio.

### 1 · Vespa, la figlia del guardiano — il sud
1. Inseguimento fino alla **Tana del Tasso**: è il suo nascondiglio; ruba per i piccoli del Borgo. *Pipistrelli, melme.*
2. Strada del sud, **Torre di Mezzogiorno**: i banditi del Guercio tengono la torre. *Banditi, capo: il Guercio.*
3. **Approdo del Faro**: al nome di suo padre la gente sputa per terra.
4. **Faro del Sud**: la spiaggia (*granchi*), la lanterna, il diario di Tullio. Prima apparizione dello Spento: spegne il fuoco e fugge. *Spettri.* Vespa riaccende: **prima fiamma**.
5. **Cala delle Conchiglie** e **Grotta delle Maree**: la barca di Tullio e l'ultima lettera («vado dove va la luce. Perdonami»). *Granchi, contrabbandieri.*
6. Ritorno al Borgo: Vespa restituisce il maltolto. Mirta: anche l'albero degli elfi perde le foglie.

### 2 · Faela, le tre foglie — ponente e nord-ovest
1. **Pratolungo**: nessuno entra più nel bosco. *Lupi sulla strada.*
2. **Villaggio degli Elfi**: Lirel dorme sotto l'Albero d'Argento. Gli anziani: «gli elfi non dormono».
3. **Pozzo della Luna**: l'acqua che tiene in vita chi dorme. *Melme, pipistrelli, uno spettro.*
4. **Albero Madre**: la radice annerita. *Piante.* Il Vecchio Grigio, che Faela nutriva da bambina, le fa la guardia.
5. **Tana del Vecchio Grigio**: fermarlo è il momento duro del capitolo. *Lupi, il Grigio.*
6. Il gelo viene da nord: **Torre Spezzata** → **Grotta del Gelo** (Lago di Ghiaccio, Sala degli Specchi). Negli specchi lo Spento, con una foglia d'argento. *Lupi, pipistrelli e scheletri di ghiaccio.*
7. Ritorno: la foglia non sveglia Lirel ma ferma la caduta: **seconda fiamma**. Gli anziani vietano di partire; Faela parte di notte.

### 3 · Korga, la straniera — levante e sud-est
1. **Girasole**: i girasoli non si voltano più, la fonte è guasta, un bambino (Nino) è malato; il villaggio accusa l'orchessa accampata fuori. L'eroe la difende.
2. Il decotto: funghi di bosco (restano i tre funghi, ma ora hanno un motivo). Nino si riprende.
3. **Fonte dei Girasoli** → **Cisterna di Solis**: da lì viene il guasto. *Scheletri, mummie.*
4. **Rovine di Solis**: gli Spenti di mille anni fa; *capo: il Console senz'ombra.* Al fuoco, la confessione di Korga.
5. Passando dalla **Rocca di Lumen**: le guardie del Re; il Valico «è chiuso dalla frana».
6. **Cratere del Brace** (Romitorio, Lago del Cratere): Korga riaccende l'ultima brace della sua tribù: **terza fiamma**. *Melme, goblin.*
7. Ritorno a Girasole: i girasoli si voltano; Nino le regala un girasole.

### 4 · Dorno, trent'anni alla porta — il nord
1. **Torre del Lago** → **Altare dei Monti** → **Porta di Fucinafonda**: «ALT!». *Lupi, goblin sulla via.*
2. **Fucinafonda**: il fuoco della Fucina si raffredda; il Re sotto il Monte non vuole aiuto.
3. **Ossa del Drago / Forra del Drago**: il carbone di drago per ravvivare la Fucina. *Scheletri, pipistrelli.*
4. **Miniera di Barbarossa**: Galleria dei Carrelli, Sala dei Cristalli, **Vena d'Oro**: l'elmo di Brando e la scritta (ha scavato verso nord). Lo Spento nel buio. *Goblin del profondo, capo.*
5. Ritorno: la Fucina riarde: **quarta fiamma**. Dorno consegna la chiave della porta a un giovane.

### 5 · Il Re e la frana — levante e nord
1. **Rocca di Lumen**: Re Aldric guarda a levante (il Ponte), non a nord.
2. **Colle dei Re**: lo Spento fa alzare gli otto re morti. *Scheletri, i re.* Il Re vede che il buio è alla sua porta.
3. **Cantiere del Ponte dei Re** → **Vedetta Caduta** → **Nido del Grifone**: il grifone di Alba è tornato solo, con la sua bandiera. *Banditi, spettri.*
4. Ritorno alla Rocca: la confessione del Re. Dà il nome alla Compagnia: **dell'Alba**, come sua figlia.
5. **Torre del Valico** → **Valico dei Giganti**: la frana non si passa. Nel diario di Alba, la vecchia via di Solis sotto il monte; Dorno riconosce il segno di suo fratello.

### Finale — La Via Sepolta
1. **Valle Nascosta** → **Via Sepolta** (Bosco di Sotto, Pozzo dei Cristalli).
2. **Cripta del Sole**: la porta si apre con le quattro fiamme. Lo Spento è Brando. *Scontro finale.*
3. Dorno lo chiama per nome: «Ce ne sono altri come me. Si possono riaccendere.» Brando resta di guardia alla porta («è il mestiere di famiglia»): Dorno, dopo trent'anni, è libero.
4. L'ultima notte al fuoco, gli addii (Mirta, Lirel, Nino, la porta), l'uscita dall'altra parte: i Monti del Cielo. Un'ombra passa in volo verso nord: il drago.

## Per affezionarsi

- **Soste al fuoco:** a ogni accampamento un compagno racconta un pezzo di sé (si sbloccano coi capitoli).
- **Battibecchi in cammino:** Dorno e Faela non si sopportano, poi si coprono le spalle; Vespa ruba la pipa a Dorno; Korga legge le ossa a tutti.
- **Gli addii:** ognuno lascia qualcuno a casa.
- **La Lanterna dell'Alba:** quattro fiamme, una per capitolo, visibili.
- **Lo Spento** compare e sfugge in ogni capitolo.

## Incarichi delle bacheche (viaggi lunghi, con imboscate)

- L'olio del Faro: Borgo → Faro del Sud.
- Il sale per la Fucina: Le Saline → Fucinafonda (da costa a monti).
- La posta degli elfi: Villaggio degli Elfi → Rocca di Lumen.
- Il carro di Pratolungo: scorta Pratolungo → Girasole.
- I mattoni del Ponte: Miniera di Barbarossa → Cantiere del Ponte dei Re.
- Le torri: liberare Torre di Levante, Torre della Costa, Torre del Lago.
- La caccia al branco: Capanno del Cacciatore (lupi di ghiaccio).
- La campana del Tempio Affondato; le lucciole per la Vecchia.

## Da costruire

- Incarichi a più tappe (parla / vai / sconfiggi / raccogli / esamina), con la meta sulla bussola.
- Scene con più personaggi che parlano, e una scelta dove serve (difendere Korga).
- Soste al fuoco e battibecchi in cammino.
- La Lanterna sull'HUD.
- Lo Spento e i capi (il Guercio, il Console senz'ombra, i re del Colle): figure sul secondo foglio.
- Imboscate lungo le strade per gli incarichi di bacheca.
- I giganti, come nemici, non esistono ancora (Libro secondo).
