# Pixel Box

Sei giochi classici in una console tascabile in stile Game Boy: un'unica pagina web che si installa sul telefono e funziona anche senza connessione.

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

## Installarla sul telefono

- **Android (Chrome):** apri l'indirizzo, poi menu ⋮ → «Installa app» (o «Aggiungi a schermata Home»).
- **iPhone (Safari):** apri l'indirizzo, poi Condividi → «Aggiungi alla schermata Home».

Dopo la prima apertura funziona anche offline. I salvataggi restano sul telefono.

## Comandi

Croce direzionale, A, B, START e SELECT (torna al menu). Sotto lo schermo c'è sempre l'elenco dei tasti del gioco in corso.
Sul computer: frecce, X = A, Z = B, Invio = START, Esc = SELECT.

## Com'è fatto

- `index.html`: l'app completa, generata dai sorgenti (non modificarla a mano).
- `src/`: i sorgenti. `shell.html` è la console con i tasti, `sys_core.js` e `sys_main.js` contengono suoni, carattere a pixel, menu e ciclo di gioco, poi c'è un file per ogni gioco (`g_*.js`).
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

Se cambi icone o manifest, aumenta `VERSIONE` in `sw.js` così i telefoni scaricano i file nuovi.
