// ---------- IL GRANDE VIAGGIO A PASTELLI ----------
// Lo stesso Grande Viaggio (stessa terra, stessa storia), disegnato a pastelli: contorni netti, colori vivi, scritte disegnate.
// È un mondo a parte nel menu, con la sua partita: non tocca quella del Grande Viaggio a pixel.
GAMES.push((() => {
  const S = GAMES.find(g => g.id === 'saga'), G2 = Object.create(S);
  return Object.assign(G2, {
    id: 'pastelli', name: 'VIAGGIO A PASTELLI', desc: 'IL GRANDE VIAGGIO, DISEGNATO', terra: 'lumen', pastelli: true,
    full: S.full, ownSelect: S.ownSelect, cbtn: S.cbtn, pad8: S.pad8, pad360: S.pad360, padMenu: S.padMenu, aspect: S.aspect, keys: S.keys,
    icon(c, x, y, s) {
      drawIcon(c, ['cccccccccccccckk', 'cccccccwwcccckkk', 'ccwwccccccccqqcc', 'ccccccccccckkccc', 'ccccccrrcckksscc', 'cccccrrrrppsscwc', 'ccccrrrrrrccsccc', 'cccrryrryrrccscc', 'ccrrrrrrrrrrcgcc', 'ggggmmmmmmgggggg', 'gggmmdddmmgggggg', 'ggggmmdmmgggtggg', 'gtggggggggggtttg', 'tttggggggggggtgg', 'gtgggggbbgggggtg', 'ggggggbbbbgggggg'],
        { c: '#a8d4f4', w: '#ffffff', r: '#b4b0c8', y: '#ffe08a', s: '#eef2fa', g: '#98d48a', m: '#dcd6cc', d: '#7a5a4a', t: '#5aa860', b: '#7ab0e8', k: '#ff7aa8', q: '#fff4dc', p: '#ffc0d8' }, x, y, s, '#a8d4f4');
    },
    enter() { S.enter.call(G2); }, leave() { S.leave(); }, hidden() { S.hidden(); }, update(dt) { S.update(dt); }, draw(c, w, h) { S.draw(c, w, h); },
  });
})());
