// ---------- LA SALA D'ARMI ----------
// La prova del combattimento nuovo: stesso motore e stessa terra del Grande Viaggio, ma si parte nella sala, davanti al maestro, con un salvataggio a parte.
GAMES.push((() => {
  const S = GAMES.find(g => g.id === 'saga'), G3 = Object.create(S);
  return Object.assign(G3, {
    id: 'sala', name: "LA SALA D'ARMI", desc: 'PROVA: IL COMBATTIMENTO NUOVO', terra: 'lumen', sala: true,
    full: S.full, ownSelect: S.ownSelect, cbtn: S.cbtn, pad8: S.pad8, padMenu: S.padMenu, aspect: S.aspect, keys: S.keys,
    icon(c, x, y, s) { S.icon(c, x, y, s); },
    enter() { S.enter.call(G3); }, leave() { S.leave(); }, hidden() { S.hidden(); }, update(dt) { S.update(dt); }, draw(c, w, h) { S.draw(c, w, h); },
  });
})());
