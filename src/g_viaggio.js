// ---------- IL GRANDE VIAGGIO (anteprima) ----------
// Lo stesso motore di Pixel Saga, acceso sulla terra nuova di Lumen. Per ora si cammina e basta: niente storia, niente gente, niente nemici.
GAMES.push((() => {
  const S = GAMES.find(g => g.id === 'saga'), G2 = Object.create(S);
  return Object.assign(G2, {
    id: 'viaggio', name: 'IL GRANDE VIAGGIO', desc: 'ANTEPRIMA: LA TERRA NUOVA', terra: 'lumen',
    full: S.full, ownSelect: S.ownSelect, cbtn: S.cbtn, pad8: S.pad8, padMenu: S.padMenu, aspect: S.aspect, keys: S.keys,
    icon(c, x, y, s) { S.icon(c, x, y, s); },
    enter() { S.enter.call(G2); }, leave() { S.leave(); }, hidden() { S.hidden(); }, update(dt) { S.update(dt); }, draw(c, w, h) { S.draw(c, w, h); },
  });
})());
