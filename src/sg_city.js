// ===================== PIXEL SAGA · il geometra delle città =====================
// city({...}) prepara tutto prima che nasca il terreno (spianata, strade, piazza, isolati, case, lampioni,
// abitanti); poi, quando il rilievo esiste, il costruttore alza mura, torri, porte, case ed edifici speciali.
(() => {
const W = SG.world, K = W.kit, TN = SG.town, TL = TN.TL, { quad, walls, box, boxTop, gable, onWall, prism } = K, TAU = Math.PI * 2;
const { merl, merlBox, wallSeg, oct, faceDecal, cone, pyramid, hip, dome, tower, decal, gate, awning, house, fountain, ship, g0 } = TN;

// ---------- stili: muri, tetti, finestre, mura ----------
const STYLES = {
  lumen: { walls: [0, 1, 1, 2, 16, TL.TIMBER2], roofs: [4, 4, 5, TL.ROOF_BLUE], rt: ['gable', 'gable', 'gable', 'hip'], h: [10, 17], wd: [16, 26], chim: 0.7, win: [8, 8, TL.WIN_ARCH], dr: [7], aw: [13, TL.AWN_BLUE], cw: 9, cm: TL.MERL, tr: TL.ROOF_BLUE, pave: 'g', trees: ['oak', 'birch'], lamp: 'lamp', yard: ['barrel', 'crate', 'haybale', 'pot'], band: 2, flag: 1, ban: TL.BAN_RED },
  ambra: { walls: [1, TL.TIMBER2, TL.TIMBER2, 3, 16], roofs: [4, TL.ROOF_ORANGE, TL.ROOF_DARK], rt: ['gable'], steep: 0.62, h: [11, 18], wd: [15, 24], chim: 0.8, win: [8, TL.WIN_PAPER], dr: [7], aw: [13, TL.AWN_GREEN], cw: 2, cm: TL.MERL_GREY, tr: 4, pave: 'g', trees: ['oakred', 'oakgold'], lamp: 'lamp', yard: ['barrel', 'haybale', 'cart', 'crate'], flag: 1, ban: TL.BAN_RED },
  nord: { walls: [TL.LOGS, TL.LOGS, 2, 2], roofs: [TL.ROOF_SNOW, 5, TL.ROOF_SNOW], rt: ['gable'], steep: 0.72, h: [10, 15], wd: [16, 24], chim: 1, win: [8], dr: [7], aw: [], cw: 2, cm: TL.MERL_GREY, tr: TL.ROOF_SNOW, pave: 'g', trees: ['snowpine'], lamp: 'lamp', yard: ['barrel', 'crate'], flag: 2, ban: TL.BAN_BLUE },
  sole: { walls: [TL.ADOBE, TL.ADOBE, 10, TL.WHITE], roofs: [TL.ADOBE, 10], rt: ['flat', 'flat', 'flat', 'dome'], h: [9, 16], wd: [16, 26], chim: 0, win: [TL.WIN_LATTICE], dr: [TL.DOOR_BLUE], aw: [TL.AWN_YELLOW, TL.AWN_BLUE, TL.CLOTH], cw: 10, cm: TL.MERL_SAND, tr: TL.TURQ, pave: 'b', trees: ['palm'], lamp: 'lamp', yard: ['jar', 'pot', 'crate'], flag: 1, ban: TL.BAN_BLUE },
  porto: { walls: [TL.WHITE, TL.WHITE, TL.OCHRE, TL.PINK, 0], roofs: [TL.ROOF_ORANGE, TL.ROOF_ORANGE, 4], rt: ['gable', 'hip'], h: [10, 19], wd: [15, 24], chim: 0.5, win: [8, TL.WIN_ARCH], dr: [7, TL.DOOR_BLUE], aw: [TL.AWN_BLUE, 13], cw: 9, cm: TL.MERL, tr: TL.ROOF_ORANGE, pave: 'g', trees: ['palm', 'oak'], lamp: 'lamp', yard: ['barrel', 'crate', 'anchor', 'pot'], flag: 2, ban: TL.BAN_BLUE },
  // la città dei monti: marmo bianco, tetti azzurri e verdi, cupole
  marmo: { walls: [TL.MARBLE, TL.MARBLE, TL.WHITE, TL.MARBLE], roofs: [TL.ROOF_BLUE, TL.ROOF_TEAL, TL.ROOF_BLUE], rt: ['hip', 'gable', 'hip', 'dome'], h: [11, 18], wd: [16, 26], chim: 0.25, win: [TL.MARBLE_WIN, TL.MARBLE_WIN, TL.WIN_ARCH], dr: [TL.MARBLE_DOOR], aw: [TL.AWN_BLUE, TL.CLOTH], cw: TL.MARBLE, cm: TL.MERL, tr: TL.ROOF_BLUE, pave: 'b', trees: ['pine', 'birch'], lamp: 'lamp', yard: ['pot', 'pot', 'jar', 'bench'], flag: 2, ban: TL.BAN_BLUE },
  fiore: { walls: [TL.WHITE, TL.PINK, 3, TL.TIMBER2], roofs: [TL.ROOF_PINK, TL.ROOF_DARK, TL.ROOF_PURPLE], rt: ['hip', 'gable'], h: [9, 14], wd: [16, 24], chim: 0.3, win: [TL.SHOJI, TL.WIN_PAPER], dr: [TL.DOOR_RED], aw: [], cw: 9, cm: TL.MERL, tr: TL.ROOF_PINK, pave: 'b', trees: ['cherry', 'cherrywhite', 'cherry'], lamp: 'lantern', yard: ['pot', 'pot', 'bench'], flag: 1, ban: TL.BAN_RED },
};
// ---------- abitanti: gli aspetti si condividono (uno sprite per tipo, non per persona) ----------
const P0 = '#3a3a44', B0 = '#2a2a2a';
const LOOKS = {
  guardia: { skin: '#e0b088', helm: { c: '#c8d0dc', plume: '#2a5ab0' }, shirt: '#2a5ab0', plate: '#c8d0dc', pants: P0, boots: B0, weapon: { kind: 'spear' }, shield: '#2a5ab0', emblem: '#ffd23f' },
  dama: { skin: '#f0c49a', hairStyle: 'bun', hair: '#8a4a2a', robe: '#8a2a4a', shirt: '#a83a5a', pants: '#6a1e3a', boots: '#3a2a2a' },
  borghese: { walk: 1, skin: '#e8b890', hat: '#3a5a3a', shirt: '#4a7a4a', pants: '#5a4a3a', boots: '#3a2a1a', hairStyle: 'short', hair: '#5a3a1a' },
  oste: { skin: '#e0a880', hairStyle: 'short', hair: '#5a3a1a', beard: '#5a3a1a', shirt: '#e8e0d0', apron: '#8a3a2a', pants: '#4a3a30', boots: B0, wide: 0.6 },
  bimbo: { walk: 1, sc: 0.76, skin: '#f0c49a', hairStyle: 'short', hair: '#c8a03a', shirt: '#3a8ad8', pants: '#6a4a2a', boots: '#3a2a1a' },
  monaco: { skin: '#e8c0a0', hood: '#6a4a2a', robe: '#7a5a34', shirt: '#8a6a44', pants: '#5a4024', boots: '#3a2a1a', staff: '#7a5230' },
  re: { sc: 1.08, skin: '#e8b890', crown: '#ffd23f', beard: '#e8e8f0', hairStyle: 'short', hair: '#e8e8f0', robe: '#8a1e2a', shirt: '#b8342c', cape: '#2a5ab0', pants: '#5a1420', boots: '#3a2a2a', staff: '#c8a040', orb: '#ffe46a' },
  boscaiolo: { skin: '#d8a07a', hairStyle: 'short', hair: '#6a3a1a', beard: '#6a3a1a', shirt: '#a83a1c', pants: '#4a3a2a', boots: B0, weapon: { kind: 'axe', col: '#c8d0dc' } },
  mercantessa: { walk: 1, skin: '#f0c49a', hairStyle: 'tails', hair: '#c8642a', shirt: '#d8a02a', apron: '#6a3a1a', pants: '#5a3a2a', boots: '#3a2a1a' },
  borgomastro: { skin: '#e8b890', hat: '#5a1e1e', hairStyle: 'short', hair: '#c8c8d0', beard: '#c8c8d0', robe: '#7a2a1e', shirt: '#a84a2a', cape: '#d8a02a', pants: '#4a2a1a', boots: B0, wide: 0.5 },
  montanaro: { walk: 1, skin: '#f0c8a8', hood: '#e8e8f0', robe: '#4a6a8a', shirt: '#5a7a9a', pants: '#3a4a5a', boots: '#e8e8f0', beard: '#c8a05a' },
  minatore: { skin: '#e0b088', helm: { c: '#8a8a96' }, beard: '#3a2a1a', shirt: '#7a5a3a', pants: '#4a4a52', boots: B0, weapon: { kind: 'hammer', col: '#6a6e78' } },
  thane: { sc: 1.08, skin: '#f0c8a8', helm: { c: '#c8d0dc', wings: '#ffffff' }, beard: '#e8c06a', shirt: '#4a6a8a', plate: '#c8d0dc', pauldron: '#e8e8f0', cape: '#e8e8f0', pants: '#3a4a5a', boots: '#e8e8f0', weapon: { kind: 'axe', col: '#c8d0dc' } },
  mercante: { walk: 1, skin: '#b07a50', turban: '#f0ece0', gem: '#e8364e', beard: '#2a1a10', robe: '#2a6ab0', shirt: '#3a8ad8', pants: '#f0ece0', boots: '#8a5a30' },
  donna: { skin: '#a86a44', hood: '#d83a6a', robe: '#e8a02a', shirt: '#f0c060', pants: '#c8802a', boots: '#6a4a2a' },
  lanciere: { skin: '#9a6a44', turban: '#c8342c', shirt: '#f0ece0', plate: '#e8b42a', pants: '#c8342c', boots: '#6a4a2a', weapon: { kind: 'spear' }, shield: '#e8b42a', emblem: '#c8342c' },
  emira: { sc: 1.05, skin: '#a86a44', crown: '#ffd23f', hairStyle: 'bun', hair: '#1a1014', robe: '#1e8a8a', shirt: '#3ac8c0', cape: '#e8b42a', pants: '#1e6a6a', boots: '#e8b42a' },
  marinaio: { walk: 1, skin: '#d89a70', hat: '#f0ece0', beard: '#8a6a4a', shirt: '#2a5ab0', pants: '#f0ece0', boots: '#3a2a1a' },
  pescivendola: { skin: '#e8b890', hairStyle: 'bun', hair: '#3a2a1a', shirt: '#3aa8a0', apron: '#f0ece0', pants: '#2a6a6a', boots: '#3a2a1a' },
  capitano: { sc: 1.05, skin: '#d8a07a', hat: '#1a2a4a', beard: '#e8e8f0', shirt: '#1a2a4a', cape: '#1a2a4a', pauldron: '#ffd23f', pants: '#f0ece0', boots: B0 },
  fioraia: { walk: 1, skin: '#f0d0b0', hairStyle: 'bun', hair: '#2a1a2a', robe: '#f0a8c8', shirt: '#f8c8dc', pants: '#c86a9a', boots: '#6a3a4a' },
  saggio: { skin: '#e8c8a8', hairStyle: 'bun', hair: '#e8e8f0', beard: '#e8e8f0', robe: '#6a4a8a', shirt: '#8a6ab0', pants: '#4a3a6a', boots: '#3a2a3a', staff: '#7a5230' },
  spadaccino: { skin: '#f0d0b0', helm: { c: '#3a2a3a', spike: true }, shirt: '#8a2a4a', plate: '#3a2a3a', pauldron: '#c8342c', pants: '#2a2a3a', boots: B0, weapon: { col: '#f0f6ff', guard: '#c8a040', len: 1 } },
  dama2: { sc: 1.04, skin: '#f0d0b0', crown: '#f8a8c8', hairStyle: 'bun', hair: '#2a1a2a', robe: '#f8ecf2', shirt: '#f0a8c8', cape: '#c85a7a', pants: '#e07aa8', boots: '#6a3a4a' },
  maestro: { skin: '#e0b088', hairStyle: 'short', hair: '#d8d8e0', beard: '#d8d8e0', shirt: '#8a2a2a', plate: '#c8a040', pauldron: '#c8a040', cape: '#2a3a6a', belt: '#3a2a1a', pants: '#3a3a4a', boots: B0, weapon: { col: '#e8eef6', guard: '#c8a040', len: 1 } },
  ostessa: { skin: '#f0c49a', hairStyle: 'bun', hair: '#8a4a2a', shirt: '#e8e0d0', apron: '#3a7a4a', pants: '#5a3a2a', boots: '#3a2a1a' },
  fabbro: { skin: '#d8a07a', beard: '#3a2a1a', shirt: '#7a6a5a', apron: '#4a3428', pants: '#3a3a44', boots: B0, wide: 0.6, weapon: { kind: 'hammer', col: '#6a6e78' } },
  traghettatore: { skin: '#d89a70', hood: '#3a5a6a', beard: '#c8c8d0', robe: '#4a6a7a', shirt: '#5a7a8a', pants: '#3a4a52', boots: B0, staff: '#7a5230' },
};
// nomi e righe che si ripetono (riga a caso tra queste quando una persona non ha le sue)
let seq = 0;
// chi sta dentro una bottega (extra.in) non compare per strada: lo mette al suo posto la stanza
function folk(look, n, x, z, yaw, lines, extra) { const id = (extra && extra.id) || 'f' + (seq++); W.FOLK[id] = Object.assign({ n, look, lines }, extra || {}); if (extra && extra.in) W.SHOPS[extra.in].folk.push(id); else W.NPCS.push([id, x, z, yaw]); return id; }
// tendone di ogni tipo di bottega
const TENDA = { locanda: 13, armeria: TL.AWN_BLUE, fucina: TL.AWN_BLUE, dojo: TL.AWN_BLUE, erboristeria: TL.AWN_GREEN, emporio: TL.AWN_YELLOW, pescheria: TL.AWN_BLUE, orafo: TL.CLOTH, sartoria: TL.CLOTH };
W.SHOPS = W.SHOPS || {}; W.BOARDS = W.BOARDS || [];
function bottega(key, kind, name, city, style) { return W.SHOPS[key] = { key, kind, name, city, style, folk: [] }; }

// ---------- il piano di una città ----------
function city(o) {
  const S = STYLES[o.style], R = rng(Math.round(o.x * 7 + o.z * 3) + 11), rr = (a, b) => a + R() * (b - a), pick = L => L[Math.floor(R() * L.length)];
  const hw = o.w / 2, hd = o.d / 2, x0 = o.x - hw, x1 = o.x + hw, z0 = o.z - hd, z1 = o.z + hd, open = !!o.open, IN = open ? 5 : 15, MS = 11, SS = 7;
  const pl = Object.assign({ dx: 0, dz: 0, w: 84, d: 76 }, o.plaza || {}), px = o.x + pl.dx, pz = o.z + pl.dz, y = o.y === undefined ? null : o.y, gates = o.gates || '', ch = S.pave;
  const occ = [], free = (a, b, c, d, m = 2) => { for (const q of occ) if (a < q[2] + m && c > q[0] - m && b < q[3] + m && d > q[1] - m) return false; return true; };
  const plan = { o, S, x0, x1, z0, z1, px, pz, pl, y, houses: [], specials: [], gates: [], open };
  // terreno, nomi, pavimenti
  if (!o.noTerra) {   // (la città dei monti si scava i suoi gradoni da sola)
    W.FLAT.push([o.x, o.z, Math.hypot(hw, hd) + 80, y]);
    W.TERRA.push({ x0: x0 - 6, z0: z0 - 6, x1: x1 + 6, z1: z1 + 6, y, rx: o.x, rz: o.z, soft: open ? 32 : 48 });
  }
  W.CLEAR.push([x0 - 18, z0 - 18, x1 + 18, z1 + 18]); W.URBAN.push([x0 - 16, z0 - 16, x1 + 16, z1 + 16]);
  W.PLACES.push([o.x, o.z, Math.max(hw, hd) + 34, o.name]); W.TOWNS.push({ x: o.x, z: o.z, name: o.name, big: !o.small });
  const prect = [px - pl.w / 2, pz - pl.d / 2, px + pl.w / 2, pz + pl.d / 2];
  W.PAVE.push([ch, 'rect', ...prect], [ch, 'line', MS * 2, [[x0 - (gates.includes('w') ? 22 : -4), pz], [x1 + (gates.includes('e') ? 22 : -4), pz]], 1], [ch, 'line', MS * 2, [[px, z0 - (gates.includes('n') ? 22 : -4)], [px, z1 + (gates.includes('s') ? 22 : -4)]], 1]);
  occ.push(prect);
  for (const r of o.reserve || []) occ.push([o.x + r[0], o.z + r[1], o.x + r[2], o.z + r[3]]);
  for (const s of gates) plan.gates.push({ side: s, x: s === 'w' ? x0 : s === 'e' ? x1 : px, z: s === 'n' ? z0 : s === 's' ? z1 : pz });
  // edifici speciali: [tipo, dx, dz, w, d, porta, extra]
  for (const sp of o.specials || []) { const q = { k: sp[0], x: o.x + sp[1], z: o.z + sp[2], w: sp[3], d: sp[4], door: sp[5], o: sp[6] || {} }; plan.specials.push(q); const m = q.o.m || 1; occ.push([q.x - q.w / 2 - m, q.z - q.d / 2 - m, q.x + q.w / 2 + m, q.z + q.d / 2 + m]); }
  // botteghe: [chiave, tipo, nome, posto, opzioni] — posto: uno degli otto attorno alla piazza ('n1' 'n2' 's1' 's2' 'w1' 'w2' 'e1' 'e2',
  // 1 = a ovest o a nord dell'incrocio), oppure [dx, dz, larghezza, profondità, porta] dal centro della città
  const posto = (code, w, d) => { const side = code[0], k = code[1] === '1' ? -1 : 1, off = MS + 2 + w / 2;
    if (side === 'n' || side === 's') return [px + k * off, pz + (side === 'n' ? -1 : 1) * (pl.d / 2 + 1.5 + d / 2), w, d, side === 'n' ? 's' : 'n'];
    return [px + (side === 'w' ? -1 : 1) * (pl.w / 2 + 1.5 + d / 2), pz + k * off, d, w, side === 'w' ? 'e' : 'w']; };
  for (const [key, kind, name, at, opt] of o.shops || []) {
    bottega(key, kind, name, o.name, o.style);
    if (typeof at === 'number') { plan.specials[at].o.shop = key; continue; }       // un edificio speciale già in pianta (il bazar)
    const oo = opt || {}, r = typeof at === 'string' ? posto(at, oo.fw || 26, oo.fd || 19) : [o.x + at[0], o.z + at[1], at[2], at[3], at[4]];
    const q = { k: 'big', x: r[0], z: r[1], w: r[2], d: r[3], door: r[4], o: Object.assign({ shop: key, aw: TENDA[kind] || 13, chim: S.chim > 0 }, oo, { h: Math.max(17, oo.h || 0) }) }; plan.specials.push(q); occ.push([q.x - q.w / 2 - 1, q.z - q.d / 2 - 1, q.x + q.w / 2 + 1, q.z + q.d / 2 + 1]);
    // due vasi (o due botti) ai lati della porta
    const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[q.door], fx = q.x + v[0] * (q.w / 2 + 1.6), fz = q.z + v[1] * (q.d / 2 + 1.6);
    for (const sg of [-1, 1]) W.PROPS.push([kind === 'locanda' || kind === 'pescheria' ? 'barrel' : kind === 'armeria' || kind === 'fucina' ? 'crate' : 'pot', fx + (v[0] ? 0 : sg * 9.4), fz + (v[1] ? 0 : sg * 9.4)]);
  }
  // davanti a ogni porta di bottega resta libero un corridoio: niente case, alberi, panchine o carri sulla soglia
  const vie = [];
  for (const q of plan.specials) if (q.o.shop && q.door) { const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[q.door], wx = q.x + v[0] * q.w / 2, wz = q.z + v[1] * q.d / 2, L = 17, hw = 5.5;
    const r = v[0] ? [Math.min(wx, wx + v[0] * L), wz - hw, Math.max(wx, wx + v[0] * L), wz + hw] : [wx - hw, Math.min(wz, wz + v[1] * L), wx + hw, Math.max(wz, wz + v[1] * L)]; vie.push(r); occ.push(r); }
  const sgombro = (x, z, r) => vie.every(q => x + r < q[0] || x - r > q[2] || z + r < q[1] || z - r > q[3]);
  const primo = (L, r) => L.find(([x, z]) => sgombro(x, z, r) && Math.abs(x - px) < pl.w / 2 - 3 && Math.abs(z - pz) < pl.d / 2 - 3 && Math.hypot(x - px, z - pz) > 13 + r);
  // la bacheca degli incarichi, in piazza: [dx, dz] dal centro della piazza
  if (o.board) { const sx = Math.sign(o.board[0]), sz = Math.sign(o.board[1]), B0 = primo([[Math.abs(o.board[0]), Math.abs(o.board[1])], [30, 13], [13, 27], [31, 28], [24, 10]].map(([a, b]) => [px + sx * a, pz + sz * b]), 6.5) || [px + o.board[0], pz + o.board[1]], bx = B0[0], bz = B0[1]; plan.board = { x: bx, z: bz }; W.BOARDS.push({ id: o.id, city: o.name, x: bx, z: bz }); occ.push([bx - 6, bz - 2, bx + 6, bz + 2]);
    // nell'angolo opposto il carro del mercato con le sue casse; negli altri due un albero con la panchina
    const M = primo([[-23, -20], [-15, -29], [-33, -13], [-17, -16], [-31, -29]].map(([a, b]) => [px + sx * a, pz + sz * b]), 8);
    if (M) { const [mx, mz] = M; W.PROPS.push(['cart', mx, mz], ['crate', mx + 5.5, mz + 3], ['sack', mx - 5, mz + 3.5], ['barrel', mx + 4.5, mz - 4.5], ['haybale', mx - 5.5, mz - 4], ['jar', mx + 1, mz + 6]); plan.mercato = M; }
    for (const [qx, qz] of [[sx, -sz], [-sx, sz]]) { const T = primo([[25, 22], [15, 29], [33, 14], [17, 17], [32, 30]].map(([a, b]) => [px + qx * a, pz + qz * b]), 4.5); if (T) W.PROPS.push([S.trees[0], T[0], T[1]], ['bench', T[0] - qx * 6, T[1] + qz * 2]); }
 }
  if (o.pre) o.pre(plan, occ);
  // isolati: i quattro quarti attorno all'incrocio, tagliati da vicoli se sono grandi
  const blocks = [];
  for (const q of [[x0 + IN, z0 + IN, px - MS, pz - MS], [px + MS, z0 + IN, x1 - IN, pz - MS], [x0 + IN, pz + MS, px - MS, z1 - IN], [px + MS, pz + MS, x1 - IN, z1 - IN]]) {
    const w = q[2] - q[0], d = q[3] - q[1]; if (w < 22 || d < 22) continue;
    const xs = w > 116 ? [q[0], Math.round(q[0] + w * rr(0.44, 0.56)), q[2]] : [q[0], q[2]], zs = d > 104 ? [q[1], Math.round(q[1] + d * rr(0.44, 0.56)), q[3]] : [q[1], q[3]];
    if (xs.length === 3) W.PAVE.push([ch, 'line', SS * 2, [[xs[1], q[1] - 2], [xs[1], q[3] + 2]], 1]);
    if (zs.length === 3) W.PAVE.push([ch, 'line', SS * 2, [[q[0] - 2, zs[1]], [q[2] + 2, zs[1]]], 1]);
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) blocks.push([xs[i] + (i ? SS : 0), zs[j] + (j ? SS : 0), xs[i + 1] - (i < xs.length - 2 ? SS : 0), zs[j + 1] - (j < zs.length - 2 ? SS : 0)]);
  }
  const mk = (r, side, shop) => {
    const rt = pick(S.rt), w = r[2] - r[0], d = r[3] - r[1], h = Math.round(rr(S.h[0], S.h[1]));
    const b = { x: (r[0] + r[2]) / 2, z: (r[1] + r[3]) / 2, w, d, h, wall: pick(S.walls), roof: pick(S.roofs), door: side, rt, steep: S.steep, win: pick(S.win), dr: pick(S.dr), chim: R() < S.chim, band: S.band && R() < 0.4 ? S.band : 0 };
    if ((shop || R() < 0.22) && S.aw.length) b.aw = pick(S.aw);
    if (R() < 0.16) b.ivy = pick(['n', 's', 'e', 'w'].filter(s => s !== side));
    if (rt === 'dome') { b.h = Math.min(b.h, 12); b.dome = R() < 0.5 ? TL.TURQ : TL.WHITE; }
    return b;
  };
  const row = (bl, side) => {
    const [bx0, bz0, bx1, bz1] = bl, X = side === 'n' || side === 's', a1 = X ? bx1 : bz1; let a = (X ? bx0 : bz0) + rr(0, 3), tries = 0;
    while (a < a1 - 12 && tries++ < 80) {
      const w = Math.round(Math.min(rr(S.wd[0], S.wd[1]), a1 - a)), d = Math.round(rr(13, 19)); if (w < 12) break;
      const r = side === 'n' ? [a, bz0 + 1, a + w, bz0 + 1 + d] : side === 's' ? [a, bz1 - 1 - d, a + w, bz1 - 1] : side === 'w' ? [bx0 + 1, a, bx0 + 1 + d, a + w] : [bx1 - 1 - d, a, bx1 - 1, a + w];
      if (r[2] > bx1 + 0.01 || r[3] > bz1 + 0.01 || r[0] < bx0 - 0.01 || r[1] < bz0 - 0.01 || !free(r[0], r[1], r[2], r[3], 1.5)) { a += 4; continue; }
      const nearPlaza = Math.abs((r[0] + r[2]) / 2 - px) < pl.w / 2 + 30 && Math.abs((r[1] + r[3]) / 2 - pz) < pl.d / 2 + 30;
      occ.push(r); plan.houses.push(mk(r, side, nearPlaza)); a += w + rr(1.5, 5);
    }
  };
  for (const bl of blocks) {
    if (open || bl[1] > z0 + IN + 0.5) row(bl, 'n'); if (open || bl[3] < z1 - IN - 0.5) row(bl, 's'); if (open || bl[0] > x0 + IN + 0.5) row(bl, 'w'); if (open || bl[2] < x1 - IN - 0.5) row(bl, 'e');
    // cortili: alberi, botti, carri
    const n = Math.round((bl[2] - bl[0]) * (bl[3] - bl[1]) / 1500);
    for (let k = 0; k < n * 3; k++) { const x = rr(bl[0] + 4, bl[2] - 4), z = rr(bl[1] + 4, bl[3] - 4); if (!free(x - 3, z - 3, x + 3, z + 3, 1.5)) continue; const tree = R() < 0.55; W.PROPS.push([tree ? pick(S.trees) : pick(S.yard), x, z]); occ.push([x - 2, z - 2, x + 2, z + 2]); }
  }
  // lampioni lungo le strade maestre, panchine e vasi in piazza
  for (let a = x0 + 24, k = 0; a < x1 - 20; a += 46, k++) { const z = pz + (k % 2 ? 1 : -1) * (MS - 1.4); if (a > prect[0] - 4 && a < prect[2] + 4) continue; if (free(a - 1, z - 1, a + 1, z + 1, 0)) W.PROPS.push([S.lamp, a, z]); }
  for (let a = z0 + 24, k = 0; a < z1 - 20; a += 46, k++) { const x = px + (k % 2 ? 1 : -1) * (MS - 1.4); if (a > prect[1] - 4 && a < prect[3] + 4) continue; if (free(x - 1, a - 1, x + 1, a + 1, 0)) W.PROPS.push([S.lamp, x, a]); }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = px + sx * (pl.w / 2 - 3), cz = pz + sz * (pl.d / 2 - 3); if (sgombro(cx, cz, 1.2)) W.PROPS.push([S.lamp, cx, cz]);
    for (const [k, a, b] of [['bench', 14, 0], ['pot', 22, 0]]) { const c = [[cx - sx * a, cz], [cx, cz - sz * a], [cx - sx * (a - 8), cz]].find(([x, z]) => sgombro(x, z, 3)); if (c) W.PROPS.push([k, c[0], c[1]]); } }
  // bancarelle del mercato (con il loro posto per il venditore)
  plan.stalls = [];
  (o.stalls || []).forEach(([dx, dz, cloth], i) => { const b = { k: 'stall', x: px + dx, z: pz + dz, w: 14, d: 8, h: 7, cloth: cloth || pick([13, TL.AWN_BLUE, TL.AWN_GREEN, TL.AWN_YELLOW]) }; W.BUILD.push(b); plan.stalls.push(b); W.PROPS.push([pick(['crate', 'barrel']), b.x + 9.5, b.z - 1]); });
  // abitanti: [aspetto, nome, righe, dove] — dove: 'p' piazza, 'd' davanti a una casa, [dx, dz, direzione], 's'+n dietro la bancarella n
  let pk = 0, hk = 0;
  for (const f of o.people || []) {
    const [look, n, lines, at, extra] = f; let x, z, yaw;
    if (typeof at === 'string' && at.startsWith('in:')) { const [, key, spot] = at.split(':'); folk(look, n, 0, 0, 0, lines, Object.assign({ in: key, spot: spot || 'banco' }, extra)); continue; }
    if (Array.isArray(at)) { x = o.x + at[0]; z = o.z + at[1]; yaw = at[2] === undefined ? Math.atan2(pz - z, px - x) : at[2]; }
    else if (typeof at === 'string' && at[0] === 's') { const b = plan.stalls[+at.slice(1)]; x = b.x; z = b.z - 6; yaw = Math.PI / 2; }
    else if (at === 'p' || !plan.houses.length) { const a = (pk++ * 2.4 + 0.6), r = Math.min(pl.w, pl.d) * 0.33; x = px + Math.cos(a) * r; z = pz + Math.sin(a) * r; yaw = a + Math.PI; }
    else { const b = plan.houses[(hk++ * 7 + 3) % plan.houses.length], v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[b.door]; x = b.x + v[0] * (b.w / 2 + 5.5) + (v[0] ? 0 : 5); z = b.z + v[1] * (b.d / 2 + 5.5) + (v[1] ? 0 : 5); yaw = Math.atan2(v[1], v[0]); }
    folk(look, n, x, z, yaw, lines, extra);
  }
  // il maestro della gilda degli eroi riceve in piazza, accanto alla bacheca: cambia la classe e insegna le abilità
  if (o.guild && plan.board) { const b = plan.board, P0 = primo([[b.x + 12, b.z], [b.x - 12, b.z], [b.x, b.z + 9], [b.x, b.z - 9]], 3) || [b.x + 12, b.z]; folk('maestro', 'MAESTRO DELLA GILDA', P0[0], P0[1], Math.atan2(pz - P0[1], px - P0[0]), ['BENVENUTO ALLA GILDA DEGLI EROI DI ' + o.name + '. QUI SI CAMBIA MESTIERE E SI IMPARA.'], { role: 'guild', id: 'maestro_' + o.id }); }
  if (o.center === 'statue') W.PROPS.push(['kingstatue', px, pz]);
  W.BUILD.push({ k: 'city', x: o.x, z: o.z, plan });
  return plan;
}

// ---------- la costruzione ----------
W.builders.city = (b, g) => {
  const P = b.plan, { o, S, x0, x1, z0, z1, px, pz } = P, y = g(px, pz), wt = 7, wh = o.wallH || 22, top = y + wh, cw = S.cw, cm = S.cm;
  // mura: per ogni lato i «nodi» (torri d'angolo, torri di mezzo, porte) e i tratti che li uniscono
  if (!P.open) {
    const skip = o.noWall || '';
    for (const side of ['n', 's', 'w', 'e']) {
      if (skip.includes(side)) continue;
      const X = side === 'n' || side === 's', a0 = X ? x0 : z0, a1 = X ? x1 : z1, c = side === 'n' ? z0 : side === 's' ? z1 : side === 'w' ? x0 : x1, gt = P.gates.find(q => q.side === side), gp = gt ? (X ? gt.x : gt.z) : null, gw = 9 + 10 - 1;
      const nodes = [a0]; const L = a1 - a0, n = Math.max(1, Math.round(L / 105));
      for (let k = 1; k < n; k++) { const a = a0 + L * k / n; if (gp === null || Math.abs(a - gp) > gw + 34) nodes.push(a); }
      if (gp !== null) nodes.push(gp); nodes.push(a1); nodes.sort((p, q) => p - q);
      for (let k = 0; k < nodes.length - 1; k++) {
        const s = nodes[k] === gp ? gp + gw : nodes[k], e = nodes[k + 1] === gp ? gp - gw : nodes[k + 1]; if (e - s < 2) continue;
        const r = X ? [s, side === 'n' ? c : c - wt, e, side === 'n' ? c + wt : c] : [side === 'w' ? c : c - wt, s, side === 'w' ? c + wt : c, e];
        wallSeg(r[0], r[1], r[2], r[3], Math.min(g(r[0], r[1]), g(r[2], r[3]), g((r[0] + r[2]) / 2, (r[1] + r[3]) / 2), y) - 5, top, cw, cm, b);
      }
      for (let k = 1; k < nodes.length - 1; k++) if (nodes[k] !== gp) { const tx = X ? nodes[k] : c, tz = X ? c : nodes[k]; tower(tx, tz, 9, Math.min(g(tx, tz), y) - 6, top + 6, cw, { merl: cm, win: TL.WIN_ARCH, b }); }
      if (gt) gate(gt.x, gt.z, side, y - 6, y, wh, cw, cm, { roof: S.tr, ban: S.ban, crest: 1, b, flag: S.flag });
    }
    for (const [tx, tz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { if ((skip.includes('w') && tx === x0) || (skip.includes('e') && tx === x1)) { tower(tx, tz, 9, Math.min(g(tx, tz), y) - 6, top + 6, cw, { merl: cm, b }); continue; } tower(tx, tz, 12, Math.min(g(tx, tz), y) - 6, top + 14, cw, { roof: S.tr, win: TL.WIN_ARCH, b, flag: S.flag }); }
  }
  for (const h of P.houses) house(h, g);
  if (o.center !== 'none' && o.center !== 'statue') fountain(px, pz, y, 9, b);
  for (const sp of P.specials) (SPECIAL[sp.k] || SPECIAL.big)(sp, g, S, b);
  if (P.board) SG.shop.bacheca(P.board.x, P.board.z, g(P.board.x, P.board.z), b, S.tr);
  if (!P.open && !o.small) for (const gt of P.gates) fuoriPorta(P, gt, g);
  if (o.post) o.post(P, g, y, b);
};

// ---------- le case fuori porta ----------
// Le città crescono anche oltre le mura: fuori da ogni porta, ai lati della strada, qualche casa di contadini con il suo fieno.
// Si costruisce solo dove il terreno è asciutto e quasi piano, lontano da strade, altri edifici, forzieri, nascondigli e tane.
function fuoriPorta(P, gt, g) {
  const { o, S } = P, R = rng(Math.round(gt.x * 13 + gt.z * 7) + 5), pick = L => L[Math.floor(R() * L.length)], X = gt.side === 'w' || gt.side === 'e', sg = gt.side === 'w' || gt.side === 'n' ? -1 : 1;
  const lontano = (L, x, z, d, ix = 0, iz = 1) => L.every(q => Math.abs(q[ix] - x) > d || Math.abs(q[iz] - z) > d);
  let n = 0;
  for (const [du, dv] of [[46, 28], [46, -28], [74, -31], [74, 31], [102, 28], [102, -28], [58, 56], [58, -56], [88, -58], [88, 58], [130, 30], [130, -30]]) {
    if (n >= 5) break;
    const fw = Math.round(16 + R() * 7), fd = Math.round(13 + R() * 4), ju = (R() - 0.5) * 6, cx = X ? gt.x + sg * (du + ju) : gt.x + dv, cz = X ? gt.z + dv : gt.z + sg * (du + ju), w = X ? fw : fd, d = X ? fd : fw;
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2; let ok = true, lo = 1e9, hi = -1e9;
    for (let a = 0; a <= 4 && ok; a++) for (let c = 0; c <= 4 && ok; c++) { const x = x0 - 4 + (w + 8) * a / 4, z = z0 - 4 + (d + 8) * c / 4, h = g(x, z); lo = Math.min(lo, h); hi = Math.max(hi, h); if (h < 1.6 || W.roadAt(x, z) > 0.04 || W.inBox(x, z, 5)) ok = false; }
    if (!ok || hi - lo > 4.5) continue;
    if (!lontano(W.CHESTS, cx, cz, 34, 1, 2) || !lontano(W.NOOKS, cx, cz, 34) || !lontano(W.PROPS, cx, cz, Math.max(w, d) / 2 + 6, 1, 2) || !lontano(W.NPCS, cx, cz, Math.max(w, d) / 2 + 7, 1, 2) || !W.CAMPS.every(c => Math.hypot(c[0] - cx, c[1] - cz) > c[4] + 70)) continue;
    const door = X ? (dv < 0 ? 's' : 'n') : (dv < 0 ? 'e' : 'w'), rt = pick(S.rt);
    house({ x: cx, z: cz, w, d, h: Math.round(9 + R() * 4), wall: pick(S.walls), roof: pick(S.roofs), door, rt: rt === 'dome' ? 'flat' : rt, steep: S.steep, win: pick(S.win), dr: pick(S.dr), chim: R() < S.chim }, g);
    // l'aia: fieno, un carro o una botte dal lato opposto alla porta
    const bx = X ? cx + (R() < 0.5 ? -1 : 1) * (w / 2 + 4) : cx + (dv < 0 ? -1 : 1) * (w / 2 + 4), bz = X ? cz + (dv < 0 ? -1 : 1) * (d / 2 + 4) : cz + (R() < 0.5 ? -1 : 1) * (d / 2 + 4);
    if (g(bx, bz) > 1.6 && W.roadAt(bx, bz) < 0.04 && !W.inBox(bx, bz, 3)) W.PROPS.push([pick(['haybale', 'haybale', 'barrel', 'crate', 'sack', 'cart']), bx, bz]);
    n++;
  }
}

// ---------- edifici speciali ----------
const sides = (sp, fn) => { for (const s of ['n', 's', 'e', 'w']) fn(s, (s === 'n' || s === 's') ? sp.w : sp.d, (s === 'n' || s === 's') ? sp.x : sp.z); };
const rectOf = sp => [sp.x - sp.w / 2, sp.z - sp.d / 2, sp.x + sp.w / 2, sp.z + sp.d / 2];
const SPECIAL = {
  // casa grande qualsiasi (locanda, magazzino, caserma): campi come per le case
  big(sp, g, S) { return house(Object.assign({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, door: sp.door, h: 16, wall: S.walls[0], roof: S.roofs[0], win: S.win[0], dr: S.dr[0], chim: S.chim > 0, steep: S.steep, rt: S.rt[0] }, sp.o), g); },
  // municipio: corpo a due piani e torre dell'orologio
  hall(sp, g, S, b) {
    const { top } = SPECIAL.big(sp, g, S), t = 6, cx = sp.x, cz = sp.z, th = top + 22, wl = sp.o.wall || S.walls[0];
    box(cx - t, cz - t, cx + t, cz + t, top - 2, th, wl); pyramid(cx - t, cz - t, cx + t, cz + t, th, 14, sp.o.roof || S.roofs[0]);
    for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) decal(cx - uz * t, th - 9.5, cz + ux * t, ux, uz, 7, 7, TL.CLOCK, true);
    W.flags.push([cx, th + 14, cz, S.flag]);
  },
  // chiesa: navata alta con le vetrate, rosone in facciata, campanile con la guglia
  church(sp, g, S, b) {
    const [x0, z0, x1, z1] = rectOf(sp), y0 = g0(g, x0, z0, x1, z1), h = 24, top = y0 + h, wl = sp.o.wall || 9, rf = sp.o.roof || TL.ROOF_BLUE, X = sp.door === 'e' || sp.door === 'w';
    walls(x0, z0, x1, z1, y0 - 3, top, wl); gable(x0, z0, x1, z1, top, (X ? sp.d : sp.w) * 0.6, rf, wl);
    onWall(sp.door, x0, z0, x1, z1, X ? sp.z : sp.x, y0, 8, 11, TL.DOOR_BIG); onWall(sp.door, x0, z0, x1, z1, X ? sp.z : sp.x, y0 + 14, 7, 7, TL.ROSE, true);
    for (const s of X ? ['n', 's'] : ['e', 'w']) { const len = X ? sp.w : sp.d, c = X ? sp.x : sp.z; for (let k = 0; k < Math.floor(len / 11); k++) onWall(s, x0, z0, x1, z1, c - len / 2 + 8 + k * 11, y0 + 5, 5, 12, TL.GLASS, true); }
    const f = sp.door === 'e' || sp.door === 's' ? -1 : 1, bx = X ? sp.x + f * (sp.w / 2 - 7) : x1 + 7, bz = X ? z1 + 7 : sp.z + f * (sp.d / 2 - 7), bt = top + 30;
    box(bx - 7, bz - 7, bx + 7, bz + 7, y0 - 3, bt, wl); pyramid(bx - 7, bz - 7, bx + 7, bz + 7, bt, 26, rf);
    for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) decal(bx - uz * 7, bt - 12, bz + ux * 7, ux, uz, 5, 9, TL.WIN_ARCH, true);
    W.addBox(x0, z0, x1, z1, top, b); W.addBox(bx - 7, bz - 7, bx + 7, bz + 7, bt, b);
  },
  // bazar: una grande sala con portici e cupole
  bazaar(sp, g, S, b) {
    const [x0, z0, x1, z1] = rectOf(sp), y0 = g0(g, x0, z0, x1, z1), top = y0 + 14, wl = sp.o.wall || TL.ADOBE;
    walls(x0, z0, x1, z1, y0 - 3, top, wl); walls(x0, z0, x1, z1, top, top + 2, wl); boxTop(x0 + 0.01, z0 + 0.01, x1 - 0.01, z1 - 0.01, top + 0.6, 10); merlBox(x0, z0, x1, z1, top + 2, TL.MERL_SAND);
    sides(sp, (s, len, c) => { for (let k = 0; k < Math.floor(len / 10); k++) onWall(s, x0, z0, x1, z1, c - len / 2 + 5 + (len - Math.floor(len / 10) * 10) / 2 + k * 10, y0, 9, 10, s === sp.door && Math.abs(k - (Math.floor(len / 10) - 1) / 2) < 0.6 ? TL.DOOR_BLUE : TL.ARCADE); });
    dome(sp.x, sp.z, Math.min(sp.w, sp.d) * 0.3, top + 0.6, sp.o.dome || TL.TURQ);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dome(sp.x + sx * (sp.w / 2 - 6), sp.z + sz * (sp.d / 2 - 6), 4.5, top + 0.6, TL.WHITE);
    if (sp.o.shop) SG.shop.fronte(sp.o.shop, sp.door, x0, z0, x1, z1, (sp.door === 'n' || sp.door === 's') ? sp.x : sp.z, y0, 20);
    W.addBox(x0, z0, x1, z1, top, b);
  },
  // palazzo: come il bazar, più alto, cupola d'oro e quattro minareti
  palace(sp, g, S, b) {
    const [x0, z0, x1, z1] = rectOf(sp), y0 = g0(g, x0, z0, x1, z1), top = y0 + 24, wl = TL.WHITE;
    walls(x0, z0, x1, z1, y0 - 3, top, wl); walls(x0, z0, x1, z1, top, top + 2, wl); boxTop(x0 + 0.01, z0 + 0.01, x1 - 0.01, z1 - 0.01, top + 0.6, 10); merlBox(x0, z0, x1, z1, top + 2, TL.MERL);
    sides(sp, (s, len, c) => { const n = Math.floor(len / 12); for (let k = 0; k < n; k++) { const a = c - len / 2 + 6 + (len - n * 12) / 2 + k * 12, mid = s === sp.door && Math.abs(k - (n - 1) / 2) < 0.6; if (mid) onWall(s, x0, z0, x1, z1, a, y0, 9, 13, TL.DOOR_BIG); else onWall(s, x0, z0, x1, z1, a, y0 + 3, 5, 8, TL.WIN_LATTICE, true); onWall(s, x0, z0, x1, z1, a, y0 + 14, 5, 7, TL.WIN_ARCH, true); } });
    dome(sp.x, sp.z, Math.min(sp.w, sp.d) * 0.34, top + 0.6, TL.GOLD);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = sp.x + sx * (sp.w / 2 + 2), tz = sp.z + sz * (sp.d / 2 + 2); prism(tx, tz, 3.4, y0 - 3, top + 22, wl, 8); prism(tx, tz, 4.6, top + 14, top + 16, wl, 8); dome(tx, tz, 3.8, top + 22, TL.TURQ); W.addBox(tx - 3, tz - 3, tx + 3, tz + 3, top + 22, b); }
    W.addBox(x0, z0, x1, z1, top, b); W.glows.push([sp.x, top + 14, sp.z, 12, 1, 0.85, 0.4, 0]);
  },
  // faro: torre bianca a fasce rosse con la lanterna
  lighthouse(sp, g, S, b) {
    const y0 = g(sp.x, sp.z) - 3, r = sp.w / 2, h = sp.o.h || 70;
    for (let k = 0; k < 5; k++) oct(sp.x, sp.z, r - k * 0.5, y0 + h * k / 5, y0 + h * (k + 1) / 5, k % 2 ? TL.CLOTH : TL.WHITE);
    oct(sp.x, sp.z, r + 0.6, y0 + h, y0 + h + 1.4, 9); oct(sp.x, sp.z, r - 3.4, y0 + h + 1.4, y0 + h + 7, TL.GOLD); cone(sp.x, sp.z, r - 1.4, y0 + h + 7, 9, sp.o.roof || 4);
    faceDecal(sp.x, sp.z, r, sp.door === 'e' ? 0 : sp.door === 'w' ? 4 : sp.door === 'n' ? 6 : 2, y0 + 3, 5, 8, 7);
    W.lights.push({ x: sp.x, z: sp.z, y: y0 + h + 4, beacon: true }); W.glows.push([sp.x, y0 + h + 4, sp.z, 14, 1, 0.9, 0.55, 1]);
    W.addBox(sp.x - r * 0.9, sp.z - r * 0.9, sp.x + r * 0.9, sp.z + r * 0.9, y0 + h, b);
  },
  // pagoda: tre piani che si restringono, ognuno con il suo tetto
  pagoda(sp, g, S, b) {
    const y0 = g0(g, ...rectOf(sp)); let w = sp.w / 2, d = sp.d / 2, y = y0 - 3;
    for (let k = 0; k < (sp.o.tiers || 3); k++) { const hh = k ? 9 : 13; walls(sp.x - w, sp.z - d, sp.x + w, sp.z + d, y, y + hh, k ? TL.WHITE : 3); hip(sp.x - w, sp.z - d, sp.x + w, sp.z + d, y + hh, 5.5, sp.o.roof || TL.ROOF_PINK, 4.5);
      if (k === 0) onWall(sp.door, sp.x - w, sp.z - d, sp.x + w, sp.z + d, (sp.door === 'n' || sp.door === 's') ? sp.x : sp.z, y0, 6, 9, TL.DOOR_RED);
      sides(sp, (s, len, c) => { if (k || s !== sp.door) onWall(s, sp.x - w, sp.z - d, sp.x + w, sp.z + d, c, y + (k ? 2 : 6), 5, 5, TL.SHOJI, true); });
      y += hh + 3.2; w -= 3.6; d -= 3.6; if (k < (sp.o.tiers || 3) - 1) walls(sp.x - w, sp.z - d, sp.x + w, sp.z + d, y - 3.4, y, TL.WHITE); }
    box(sp.x - 0.5, sp.z - 0.5, sp.x + 0.5, sp.z + 0.5, y - 1, y + 7, TL.GOLD);
    W.addBox(...rectOf(sp), y0 + 13, b);
  },
  // mulino a vento: torre che si stringe, tetto a punta e quattro pale
  mill(sp, g, S, b) {
    const y0 = g(sp.x, sp.z) - 3, r = sp.w / 2, h = 30;
    oct(sp.x, sp.z, r, y0, y0 + h * 0.5, 2); oct(sp.x, sp.z, r * 0.84, y0 + h * 0.5, y0 + h, TL.WHITE); cone(sp.x, sp.z, r * 0.84 + 1.6, y0 + h, 10, sp.o.roof || TL.ROOF_DARK);
    faceDecal(sp.x, sp.z, r, 0, y0 + 3, 5, 8, 7);
    const hx = sp.x, hy = y0 + h - 3, hz = sp.z + r + 1.2;
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.5, ca = Math.cos(a), sa = Math.sin(a), ua = -sa, va = ca; quad([hx + ca * 2 + ua * 0.4, hy + sa * 2 + va * 0.4, hz], [hx + ca * 19 + ua * 0.4, hy + sa * 19 + va * 0.4, hz], [hx + ca * 19 + ua * 5, hy + sa * 19 + va * 5, hz], [hx + ca * 2 + ua * 5, hy + sa * 2 + va * 5, hz], TL.SAIL, 2, 0.6, 0.95); quad([hx + ca * 0, hy + sa * 0, hz + 0.1], [hx + ca * 20, hy + sa * 20, hz + 0.1], [hx + ca * 20 + ua * 0.8, hy + sa * 20 + va * 0.8, hz + 0.1], [hx + ua * 0.8, hy + va * 0.8, hz + 0.1], 3, 2, 0.2, 0.8); }
    W.addBox(sp.x - r * 0.9, sp.z - r * 0.9, sp.x + r * 0.9, sp.z + r * 0.9, y0 + h, b);
  },
  // vasca d'acqua con il bordo di pietra (lo scavo è già nel terreno)
  pool(sp, g) { const [x0, z0, x1, z1] = rectOf(sp), y = g(x0 - 3, z0 - 3); for (const r of [[x0 - 2, z0 - 2, x1 + 2, z0], [x0 - 2, z1, x1 + 2, z1 + 2], [x0 - 2, z0, x0, z1], [x1, z0, x1 + 2, z1]]) box(r[0], r[1], r[2], r[3], y - 4, y + 1.2, 9); quad([x0, y + 0.5, z1], [x1, y + 0.5, z1], [x1, y + 0.5, z0], [x0, y + 0.5, z0], TL.WATER, sp.w / 8, sp.d / 8, 1.0); W.addBox(x0 - 2, z0 - 2, x1 + 2, z1 + 2, y + 1.2, null); },
  // portale rosso sulla strada (due pali e due travi)
  torii(sp, g) { const y = g(sp.x, sp.z), X = sp.door === 'e' || sp.door === 'w', hw = 9, c = 4; for (const s of [-1, 1]) { const px = X ? sp.x : sp.x + s * hw, pz = X ? sp.z + s * hw : sp.z; box(px - 0.9, pz - 0.9, px + 0.9, pz + 0.9, y - 2, y + 17, c); W.addBox(px - 1.2, pz - 1.2, px + 1.2, pz + 1.2, y + 17, null); }
    if (X) { box(sp.x - 1.1, sp.z - hw - 3.5, sp.x + 1.1, sp.z + hw + 3.5, y + 17, y + 19, c, TL.ROOF_DARK); box(sp.x - 0.7, sp.z - hw - 1, sp.x + 0.7, sp.z + hw + 1, y + 13, y + 14.4, c); } else { box(sp.x - hw - 3.5, sp.z - 1.1, sp.x + hw + 3.5, sp.z + 1.1, y + 17, y + 19, c, TL.ROOF_DARK); box(sp.x - hw - 1, sp.z - 0.7, sp.x + hw + 1, sp.z + 0.7, y + 13, y + 14.4, c); } },
};
// un edificio speciale da solo, fuori dalle città: { k: 'special', sk: 'mill', x, z, w, d, door, style, o }
W.builders.special = (b, g) => (SPECIAL[b.sk] || SPECIAL.big)({ k: b.sk, x: b.x, z: b.z, w: b.w, d: b.d, door: b.door, o: b.o || {} }, g, STYLES[b.style || 'lumen'], b);
SG.city = { city, folk, bottega, STYLES, LOOKS, SPECIAL, TENDA };
})();
