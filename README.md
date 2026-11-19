# Pixel Box

Otto giochi in una console tascabile in stile Game Boy: un'unica pagina web che si installa sul telefono e funziona anche senza connessione.

**Gioca:** https://blfrlrnz.github.io/Pixel-Box/

## I giochi

| Gioco | Di cosa si tratta |
| --- | --- |
| Palline | Tira le palline e abbatti i blocchi numerati, in pixel art |
| Rimbalzo | La pallina rossa: 15 livelli con anelli, acqua, gomma, spine e nemici |
| Astro Raid | Sparatutto nello spazio su schermo LCD verde |
| Snake | Il serpente affamato |
| Roll Down | Scendi di piattaforma in piattaforma senza cadere |
| Ovetto | Il cucciolo virtuale da accudire: vive anche quando l'app è chiusa |
| Pixel Kart | Corse sui kart in prospettiva: Gran Premio a punti, gara singola e prova a tempo col fantasma, 6 piste, 6 piloti (2 da sbloccare) |
| Pixel Saga | Avventura fantasy in un mondo aperto in 3D a pixel: 12 regioni, missioni, nemici, forzieri con equipaggiamento leggendario. Si gioca a schermo intero in orizzontale |

## Installarla sul telefono

- **Android (Chrome):** apri l'indirizzo, poi menu ⋮ → «Installa app» (o «Aggiungi a schermata Home»).
- **iPhone (Safari):** apri l'indirizzo, poi Condividi → «Aggiungi alla schermata Home».

Dopo la prima apertura funziona anche offline. I salvataggi restano sul telefono.

## Aggiornamenti

All'avvio l'app controlla da sola se su GitHub c'è una versione nuova: nel menu compare «NUOVA VERSIONE! PREMI SELECT».
Premendo SELECT nel menu vedi la versione installata e puoi cercare gli aggiornamenti a mano; «A: AGGIORNA ORA» scarica la versione nuova. I salvataggi restano.

## Pixel Kart

- **Gran Premio:** due coppe (Sole e Luna) da tre piste. Punti 9, 6, 3, 1 a ogni gara, poi il podio. Vincere la Coppa Sole sblocca il Gatto, la Coppa Luna il Robot.
- **Prova a tempo:** da solo con un turbo. Il giro migliore resta salvato e la volta dopo corre accanto a te come fantasma.
- **Piste:** Prato, Spiaggia, Ghiaccio, Vulcano, Città (di notte) e Deserto. Ognuna ha una rampa con un fossato da saltare, tre strisce turbo e una scorciatoia sterrata.
- **Partenza a razzo:** premi A durante l'«1» del via. Se lo premi prima, il kart si pianta.
- **Derapata:** tieni sterzato a fondo in velocità; le scintille passano da bianche ad azzurre ad arancioni e quando lasci parte il turbo.
- **Oggetti:** turbo, razzo, olio, scudo, calamita (ti tira verso chi ti precede), inchiostro (sporca la vista a chi ti segue) e molla (salta).
- **Avversari:** ognuno ha un carattere: chi prende le scorciatoie, chi spinge, chi usa gli oggetti con giudizio.
- **Opzioni:** gas automatico (A e B usano l'oggetto), musica, vibrazione. Ogni pista ha il suo motivetto, che accelera all'ultimo giro.
- In basso le frecce colorate del radar mostrano chi ti arriva dietro; un «!» rosso avvisa di un razzo in arrivo.

## Pixel Saga

Un'avventura fantasy in un mondo aperto, vista da dietro l'eroe come in Pixel Kart. Si gioca a schermo intero con il telefono in orizzontale: i tasti della console compaiono sopra l'immagine (croce a sinistra, A e B a destra, SELECT e START in alto a destra).

- **Il mondo:** un'isola grande, disegnata a mano e sempre uguale, divisa in 12 regioni: Prati di Lumen, Campi Dorati, Bosco Antico, Lago di Cristallo, Monti e Picco del Drago, Rupi del Grifone, Valle Gelata, Deserto di Solis, Palude d'Ombra, Monte Brace, Rocca di Lumen e Costa delle Conchiglie. Ogni regione ha il suo cielo, la sua luce e la sua nebbia.
- **Missioni:** la storia del capitolo 1 e tre missioni secondarie, con 13 personaggi da incontrare tra il borgo, la rocca e le terre selvagge.
- **Nemici:** melme, lupi, goblin, scheletri, diavoletti, lupi dei ghiacci e pipistrelli, a gruppi intorno ai loro accampamenti.
- **Tesori:** 28 forzieri, alcuni ben nascosti. Armi, armature, elmi, scudi e amuleti comuni, rari, epici e leggendari; i pezzi leggendari hanno poteri speciali.
- **Segreti:** sentieri nascosti, un'isola nel lago raggiungibile solo da chi trova la strada, e un drago che volteggia intorno al Picco del Drago.
- **Comandi:** croce per camminare e girare, B per correre, A per parlare, aprire e colpire, START per il menu (eroe, borsa, missioni, opzioni), SELECT per la mappa, che si scopre man mano che esplori.
- **Tornare a Pixel Box:** START → OPZIONI → «TORNA AL MENU DI PIXEL BOX». Il gioco si salva da solo ogni 20 secondi.
- **In arrivo:** nel capitolo 2 i cinque santuari sigillati diventano dungeon con i loro guardiani; nel capitolo 3 le creature leggendarie, la musica, il giorno e la notte.

## Comandi

Croce direzionale, A, B, START e SELECT (torna al menu; in Pixel Saga apre la mappa). Sotto lo schermo c'è sempre l'elenco dei tasti del gioco in corso.
Sul computer: frecce, X = A, Z = B, Invio = START, Esc = SELECT.
Il pulsante dell'altoparlante in alto a destra cambia il volume: alto, medio, spento.

## Com'è fatto

- `index.html`: l'app completa, generata dai sorgenti (non modificarla a mano).
- `src/`: i sorgenti. `shell.html` è la console con i tasti, `sys_core.js` e `sys_main.js` contengono suoni, carattere a pixel, menu e ciclo di gioco, poi c'è un file per ogni gioco (`g_*.js`).
  Pixel Kart disegna la pista in prospettiva riga per riga e i kart come piccoli modelli 3D visti da 16 angolazioni.
  Pixel Saga usa WebGL a bassa risoluzione: `sg_gl.js` (shader e matematica 3D), `sg_art.js` (tutta la pixel art, disegnata dal codice), `sg_world.js` (la mappa: rilievi, regioni, strade, edifici, oggetti) e `g_saga.js` (il gioco). Il mondo viene costruito all'avvio, in qualche secondo.
- `tools/build.py`: ricostruisce `index.html` dai sorgenti.
- `tools/rimbalzo_livelli.py`: le mappe ASCII dei livelli 5-15 di Rimbalzo. `tools/rbbot.js` è un bot che verifica che ogni livello si possa finire.
- `tools/icone.py`: disegna le icone a pixel.
- `manifest.webmanifest`, `sw.js`, `icons/`: installazione e funzionamento offline.

## Modificare

```sh
python3 tools/build.py                        # dopo ogni modifica in src/
python3 tools/rimbalzo_livelli.py --scrivi    # dopo aver cambiato le mappe di Rimbalzo
node tools/rbbot.js 5 6 7                     # verifica i livelli indicati
```

Per pubblicare una novità: aumenta il numero in `VERSION`, esegui `python3 tools/build.py` e carica insieme `index.html` e `version.json`.
Se cambi icone o manifest, aumenta anche `VERSIONE` in `sw.js` così i telefoni scaricano i file nuovi.
