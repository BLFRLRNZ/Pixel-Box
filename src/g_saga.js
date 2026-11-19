// ===================== PIXEL SAGA · il gioco =====================
// Avventura fantasy in un mondo aperto: si esplora a schermo intero, in orizzontale.
GAMES.push((() => {
const A = SG.art, W = SG.world, TAU = Math.PI * 2;
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const hexf = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const RAR = ['#e6e9f2', '#5cb8ff', '#c77dff', '#ffb02e'], RARN = ['COMUNE', 'RARO', 'EPICO', 'LEGGENDARIO'];
const SAVEKEY = 'sg_save1';

// ---------- oggetti ----------
const IT = {
  legno: { n: 'SPADA DI LEGNO', t: 'arma', r: 0, att: 2, d: 'UN BASTONE CON LE AMBIZIONI DI UNA SPADA.', look: { col: '#b8885a', guard: '#6a4424' } },
  ferro: { n: 'SPADA DI FERRO', t: 'arma', r: 0, att: 4, d: 'FORGIATA DA BRUNO, IL FABBRO DEL BORGO.', look: { col: '#c8d0dc', guard: '#8a8a92' } },
  argento: { n: "SPADA D'ARGENTO", t: 'arma', r: 1, att: 6, d: 'LEGGERA E LUCENTE COME LA LUNA.', look: { col: '#f0f6ff', guard: '#c8a040', len: 1 } },
  runica: { n: 'SPADA RUNICA', t: 'arma', r: 2, att: 9, d: 'LE RUNE SULLA LAMA VIBRANO NEL BUIO.', look: { col: '#9a7af0', guard: '#4a3a7a', glow: '#e8dcff', len: 2 } },
  ascia: { n: 'ASCIA DEL GIGANTE', t: 'arma', r: 2, att: 10, d: 'PESANTE COME UN MACIGNO.', look: { kind: 'axe', col: '#c8d0dc' } },
  aurora: { n: "LAMA DELL'AURORA", t: 'arma', r: 3, att: 14, d: 'FORGIATA CON LA PRIMA LUCE DEL MONDO.', look: { col: '#ffe8a0', guard: '#ffb02e', glow: '#ffffff', len: 3 } },
  tunica: { n: 'TUNICA DA VIAGGIO', t: 'armatura', r: 0, dif: 0, d: 'COMODA, MA NON FERMA NEMMENO UNA SPINA.', look: { shirt: '#3e8a4a', pants: '#4a5a7a', belt: '#6a4424' } },
  giaco: { n: 'GIACO DI CUOIO', t: 'armatura', r: 0, dif: 1, d: 'CUOIO SPESSO E BEN CUCITO.', look: { shirt: '#8a5a34', sleeve: '#6a4424', belt: '#3a2a1a', pants: '#5a4a3a' } },
  cotta: { n: 'COTTA DI MAGLIA', t: 'armatura', r: 1, dif: 2, d: 'MIGLIAIA DI ANELLI DI FERRO INTRECCIATI.', look: { shirt: '#9aa4b2', sleeve: '#8a94a2', belt: '#4a3a2a', pants: '#4a4a5a', cape: '#3a5a9a' } },
  acciaio: { n: "ARMATURA D'ACCIAIO", t: 'armatura', r: 2, dif: 3, d: 'LA PORTAVANO I CAVALIERI DELLA ROCCA.', look: { shirt: '#c8d0dc', plate: '#e8eef6', pauldron: '#c8d0dc', belt: '#5a4a3a', pants: '#5a6070', cape: '#8a2a2a' } },
  drago: { n: 'ARMATURA DEL DRAGO', t: 'armatura', r: 3, dif: 5, fire: true, d: 'SCAGLIE CHE NESSUNA FIAMMA PUÒ BRUCIARE.', look: { shirt: '#c8342c', plate: '#f0b040', pauldron: '#8a1e1a', belt: '#f0b040', pants: '#5a1e1a', cape: '#3a1414' } },
  elmoFerro: { n: 'ELMO DI FERRO', t: 'elmo', r: 1, dif: 1, d: 'UN ELMO SOLIDO, CON IL PARANASO.', look: { helm: { c: '#9aa4b2', nose: true } } },
  alato: { n: 'ELMO ALATO', t: 'elmo', r: 2, dif: 2, d: "LE ALI D'ARGENTO SEMBRANO VERE.", look: { helm: { c: '#c8d0dc', wings: '#ffffff' } } },
  corona: { n: 'CORONA DEL RE ANTICO', t: 'elmo', r: 3, dif: 2, hp: 2, d: 'APPARTENEVA AL PRIMO RE DI LUMEN. +1 CUORE.', look: { helm: { c: '#ffc83a', crown: true, gem: '#e8304a' } } },
  scudoLegno: { n: 'SCUDO DI LEGNO', t: 'scudo', r: 0, dif: 1, d: 'IL VECCHIO SCUDO DI OTTO.', look: { shield: '#8a5e34' } },
  scudoFerro: { n: 'SCUDO DI FERRO', t: 'scudo', r: 1, dif: 2, d: 'AMMACCATO, MA ANCORA FORTE.', look: { shield: '#9aa4b2', emblem: '#c8342c' } },
  grifone: { n: 'SCUDO DEL GRIFONE', t: 'scudo', r: 3, dif: 4, d: 'LE PIUME DORATE DEVIANO OGNI COLPO.', look: { shield: '#3a6ab0', emblem: '#ffc83a' } },
  anelloVita: { n: 'ANELLO DI VITA', t: 'acc', r: 1, hp: 2, d: 'BRILLA DI UNA LUCE CALDA. +1 CUORE.', ico: 'ring' },
  anello2: { n: 'ANELLO DEL FALCO', t: 'acc', r: 1, vel: 0.15, d: 'CHI LO PORTA CORRE PIÙ SVELTO. +15% VELOCITÀ.', ico: 'ring' },
  vento: { n: 'STIVALI DEL VENTO', t: 'acc', r: 2, vel: 0.35, d: 'PIÙ VELOCI DEL VENTO. +35% VELOCITÀ.', ico: 'boots' },
  luna: { n: 'AMULETO DELLA LUNA', t: 'acc', r: 3, regen: 1, d: 'LA LUCE DELLA LUNA RICUCE OGNI FERITA.', ico: 'amulet' },
  cuore: { n: 'CUORE DI CRISTALLO', t: 'cuore', r: 1, d: 'UN CUORE IN PIÙ, PER SEMPRE.' },
  pozione: { n: 'POZIONE', t: 'pozione', r: 0, d: 'RIDÀ 3 CUORI. SI USA DAL MENU (START).' },
  mappa: { n: 'MAPPA DEI TESORI', t: 'mappa', r: 2, d: 'SEGNA SULLA MAPPA I FORZIERI LEGGENDARI.' },
};
const SLOTS = [['arma', 'ARMA'], ['armatura', 'ARMATURA'], ['elmo', 'ELMO'], ['scudo', 'SCUDO'], ['acc', 'ACCESSORIO']];
function itemIcon(id) {
  const it = IT[id]; if (!it) return null;
  if (iconCache[id]) return iconCache[id];
  let c;
  if (it.t === 'arma') c = A.icon('sword', it.look.col, it.look.guard || '#c8a040');
  else if (it.t === 'armatura') c = A.icon('armor', it.look.shirt, it.look.plate || '#fff4b0');
  else if (it.t === 'elmo') c = A.icon('helm', it.look.helm ? it.look.helm.c : '#3e6a3a', '#ffe14a');
  else if (it.t === 'scudo') c = A.icon('shield', it.look.shield, it.look.emblem || '#e8d0a0');
  else if (it.t === 'acc') c = A.icon(it.ico, it.r === 3 ? '#cfe8ff' : '#ffc83a', '#e8304a');
  else if (it.t === 'cuore') c = A.icon('heart', '#ff4a6a', '#ffd0d8');
  else if (it.t === 'pozione') c = A.icon('potion', '#e8304a', '#ffb0c0');
  else c = A.icon('map', '#e8d8a8', '#8a3a2a');
  return iconCache[id] = c;
}
const iconCache = {};
const ICOIN = A.icon('coin', '#ffc83a', '#fff4b0'), IORE = A.icon('ore', '#8a8a92', '#ff9a3a'), IPOT = A.icon('potion', '#e8304a', '#ffb0c0'), IKEY = A.icon('key', '#ffc83a');
const HEARTS = [A.pix(['.aa.aa.', 'abbabba', 'abbbbba', 'abbbbba', '.abbba.', '..aba..', '...a...'], { a: '#1a0e14', b: '#ff4a6a' }),
  A.pix(['.aa.aa.', 'abbacca', 'abbccca', 'abbccca', '.abcca.', '..aca..', '...a...'], { a: '#1a0e14', b: '#ff4a6a', c: '#4a2a36' }),
  A.pix(['.aa.aa.', 'acca.ca', 'acccc.a', 'acccc.a', '.acca..', '..aca..', '...a...'], { a: '#1a0e14', c: '#4a2a36' })];

// ---------- abitanti ----------
const SKIN = '#f0c49a';
const NPC = {
  mirta: { n: 'ANZIANA MIRTA', look: { skin: '#e8c0a0', hairStyle: 'bun', hair: '#e0e0ea', robe: '#6a4a8a', shirt: '#7a5a9a', pants: '#5a3a6a', boots: '#3a2a2a', staff: '#7a5230', orb: '#8ae0ff' } },
  bruno: { n: 'BRUNO IL FABBRO', look: { skin: '#d8a07a', hairStyle: 'short', hair: '#3a2a1a', beard: '#3a2a1a', shirt: '#8a3a2a', apron: '#4a3a30', pants: '#3a3a44', boots: '#2a2a2a', wide: 0.6 } },
  lia: { n: 'PICCOLA LIA', sc: 0.78, look: { skin: SKIN, hairStyle: 'tails', hair: '#c8642a', shirt: '#e85a8a', pants: '#4a6ab0', boots: '#6a3a2a' } },
  otto: { n: 'GUARDIA OTTO', look: { skin: '#e0b088', helm: { c: '#9aa4b2', spike: true }, shirt: '#3a5a9a', plate: '#c8d0dc', pants: '#3a3a4a', boots: '#2a2a2a', weapon: { kind: 'spear' }, shield: '#3a5a9a', emblem: '#ffd23f' } },
  nino: { n: 'NINO IL MERCANTE', look: { skin: '#e8b890', hat: '#6a3a2a', shirt: '#c89a3a', pack: '#8a5a30', beard: '#8a6a4a', pants: '#5a4a3a', boots: '#3a2a1a', hairStyle: 'short', hair: '#8a6a4a' } },
  viandante: { n: 'IL VIANDANTE', look: { skin: '#d8a882', hood: '#4a4a5a', cape: '#5a5a6a', shirt: '#6a6a7a', pants: '#4a4a52', boots: '#2a2a2a', staff: '#7a5230' } },
  pescatore: { n: 'IL PESCATORE', look: { skin: '#e0a880', hat: '#d8b85a', shirt: '#4a7aa8', pants: '#6a5a3a', boots: '#3a3a3a', beard: '#c8c8d0', hairStyle: 'short', hair: '#c8c8d0' } },
  spirito: { n: 'SPIRITO DEL BOSCO', sc: 1.18, look: { skin: '#9af0b0', shirt: '#3aa860', robe: '#2a8a50', pants: '#2a8a50', boots: '#1e6a3a', antlers: '#f0e8d0', eyes: '#ffffff' } },
  ardea: { n: 'CAPITANO ARDEA', look: { skin: '#e8b890', helm: { c: '#c8d0dc', plume: '#c8342c' }, shirt: '#c8d0dc', plate: '#e8eef6', pauldron: '#c8d0dc', pants: '#5a6070', boots: '#3a3a44', cape: '#c8342c', weapon: { col: '#e8eef6', guard: '#c8a040' }, shield: '#c8342c', emblem: '#ffd23f' } },
  nomade: { n: 'LA NOMADE', look: { skin: '#b07a50', hood: '#d8b878', robe: '#c89a5a', shirt: '#e0c080', pants: '#a87a4a', boots: '#6a4a2a' } },
  eremita: { n: "L'EREMITA", look: { skin: '#e0b8a0', hood: '#8a8a9a', robe: '#6a6a7a', shirt: '#7a7a8a', pants: '#5a5a6a', boots: '#3a3a44', beard: '#e8e8f0', staff: '#8a6a4a' } },
  contadino: { n: 'IL CONTADINO', look: { skin: '#d89a70', hat: '#d8b85a', shirt: '#8aaa5a', pants: '#6a5a3a', boots: '#4a3a2a', hairStyle: 'short', hair: '#5a3a1a', weapon: { kind: 'spear' } } },
};
// ---------- nemici ----------
const FOE = {
  slime: { n: 'MELMA', hp: 3, dmg: 1, sp: 15, aggro: 50, range: 6, r: 3, coins: [1, 3] },
  wolf: { n: 'LUPO', hp: 6, dmg: 2, sp: 34, aggro: 75, range: 8, r: 3.5, coins: [3, 6] },
  goblin: { n: 'GOBLIN', hp: 8, dmg: 2, sp: 24, aggro: 65, range: 8, r: 3, coins: [4, 8] },
  skel: { n: 'SCHELETRO', hp: 12, dmg: 3, sp: 22, aggro: 70, range: 9, r: 3, coins: [6, 12] },
  imp: { n: 'DIAVOLETTO', hp: 14, dmg: 3, sp: 30, aggro: 80, range: 10, r: 3, coins: [8, 14] },
  icewolf: { n: 'LUPO DEI GHIACCI', hp: 12, dmg: 3, sp: 40, aggro: 85, range: 8, r: 3.5, coins: [7, 12] },
  bat: { n: 'PIPISTRELLO', hp: 4, dmg: 1, sp: 32, aggro: 60, range: 6, r: 2.5, coins: [2, 4], fly: 7 },
};
// ---------- aria delle regioni: nebbia, cielo, distanza, acqua ----------
const ATMO = [
  ['#bcd8ee', '#4a92dc', 380, 1250, '#3a7ac8'], ['#c4dcee', '#4a92dc', 380, 1250, '#3a7ac8'], ['#a8c8b4', '#4a8ac0', 240, 900, '#3a6aa0'], ['#c8d6e8', '#3a7ccc', 450, 1450, '#3a72b8'],
  ['#dce6f2', '#7aa4d4', 200, 860, '#5a8ac0'], ['#f0d8a8', '#5a9cdc', 400, 1300, '#3a8ab8'], ['#8a9a7a', '#4a5a4e', 70, 480, '#4a5e46'], ['#b8786a', '#4a2424', 190, 820, '#5a3a3a'],
].map(a => [hexf(a[0]), hexf(a[1]), a[2], a[3], hexf(a[4])]);

// ---------- stato ----------
let G = null, gl = null, st = 'boot', gen = null, prog = 0, progMsg = '', errMsg = '';
let atlas = null, ATEX = null, TILES = null, DET = null, PANO = null, SPR = {}, CHR = {}, heroRects = null;
let save = null, hero = null, npcs = [], chests = [], foes = [], camps = [], drops = [], fx = [], props = [], doors = [];
let time = 0, saveT = 0, seenT = 0, placeT = 0, curPlace = '', placeCand = '', placeHold = 0, banner = null, toasts = [], target = null;
let dialog = null, menu = null, shop = null, loot = null, mapOpen = false, help = 0, death = 0, intro = 0, title = { sel: 0, t: 0 };
const cam = { x: 2000, y: 60, z: 2700, yaw: -1.57, tx: 2000, ty: 30, tz: 2600 };
const atm = { fog: [0.74, 0.85, 0.93], zen: [0.3, 0.57, 0.86], near: 380, far: 1250, wat: [0.23, 0.48, 0.78] };
let Wr = 320, Hr = 180, K = 1, OX = 0, OY = 0, insetL = 70, insetR = 70;
const hud = document.createElement('canvas'), hg = hud.getContext('2d');
let dynF = new Float32Array(3000 * 44), shF = new Float32Array(400 * 20), dynBuf = null, shBuf = null;
const dragon = { a: 0, x: 2300, y: 600, z: 440, yaw: 0 };

// ---------- salvataggio ----------
function newSave() {
  return { v: 1, x: 2005, z: 2700, yaw: -Math.PI / 2, hp: 6, hearts: 0, coins: 10, pot: 1, ore: 0, slimes: 0, oreTaken: {},
    eq: { arma: null, armatura: 'tunica', elmo: null, scudo: null, acc: null }, inv: ['tunica'], q: { main: 0, ferro: 0, gatto: 0, melme: 0 }, track: 'main',
    chests: {}, flags: {}, seen: '', time: 0, hint: 0, opt: { vib: true } };
}
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVEKEY)); if (s && s.v === 1) return Object.assign(newSave(), s); } catch (e) {} return null; }
function writeSave() {
  if (!save || !hero) return;
  save.x = hero.x; save.z = hero.z; save.yaw = hero.yaw; save.hp = hero.hp; save.time = Math.round(save.time);
  save.seen = b64(seen);
  try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) {}
}
const seen = new Uint8Array(64 * 64), LAND = new Uint8Array(64 * 64);
function b64(u) { let s = ''; for (let i = 0; i < u.length; i += 8) { let b = 0; for (let k = 0; k < 8; k++) if (u[i + k]) b |= 1 << k; s += String.fromCharCode(b); } return btoa(s); }
function unb64(str, u) { try { const s = atob(str); for (let i = 0; i < s.length; i++) { const b = s.charCodeAt(i); for (let k = 0; k < 8; k++) u[i * 8 + k] = (b >> k) & 1; } } catch (e) {} }

// ---------- statistiche dell'eroe ----------
const eqIt = s => save.eq[s] ? IT[save.eq[s]] : null;
const ATT = () => { const w = eqIt('arma'); return w ? w.att : 1; };
const DIF = () => ['armatura', 'elmo', 'scudo'].reduce((s, k) => s + ((eqIt(k) || {}).dif || 0), 0);
const MAXHP = () => 6 + save.hearts * 2 + ['elmo', 'acc'].reduce((s, k) => s + ((eqIt(k) || {}).hp || 0), 0);
const VEL = () => 1 + ((eqIt('acc') || {}).vel || 0);
function heroLook() {
  const L = { skin: SKIN, hairStyle: 'short', hair: '#6a4024', boots: '#5a3a22' };
  Object.assign(L, IT.tunica.look);
  for (const s of ['armatura', 'elmo', 'scudo']) { const it = eqIt(s); if (it && it.look) Object.assign(L, it.look); }
  if (L.helm) L.hairStyle = 'none';
  const w = eqIt('arma'); L.weapon = w ? w.look : null;
  if (save.eq.acc === 'vento') L.boots = '#e8eef6';
  return L;
}

// ---------- sprite ----------
const POSE_HERO = [{}, { leg: 0.55 }, { leg: -0.55 }, { armR: 3.1, leg: 0.15 }, { armR: 1.45, leg: -0.25, armL: -0.4 }];
const POSE_NPC = [{}, { leg: 0.45 }, { leg: -0.45 }];
const POSE_FOE = [{}, { leg: 0.5 }, { leg: -0.5 }, { armR: 3.0 }, { armR: 1.4, leg: -0.3 }];
function dirs(make, w, h, o) { const out = []; for (let d = 0; d < 8; d++) out.push(atlas.add(A.figure(make(), d / 8 * TAU, w, h, o))); return out; }
function buildStatics() {
  const R = rng(99), S = SPR;
  const set = (k, list, s, col, small) => { S[k] = { r: list.map(c => atlas.add(c)), s, col, small }; };
  const LEAF = ['#2a5a24', '#3e8a34', '#5aa844', '#8ac85a'], LEAF2 = ['#2e5a2e', '#3a7a3a', '#56a050', '#7ac06a'], BIR = ['#4a7a2a', '#6a9a3a', '#8aba4a', '#b8d86a'];
  set('oak', [A.oak(R, 40, 52, LEAF), A.oak(R, 40, 52, LEAF2), A.oak(R, 36, 48, LEAF)], 0.42, 2);
  set('oakbig', [A.oak(R, 56, 72, LEAF, A.TRUNK, 12), A.oak(R, 56, 72, LEAF2, A.TRUNK, 12)], 0.46, 2.6);
  set('birch', [A.oak(R, 32, 54, BIR, A.BIRCH, 7), A.oak(R, 30, 50, BIR, A.BIRCH, 6)], 0.42, 1.4);
  set('bush', [A.bush(R, 24, 18, LEAF), A.bush(R, 24, 18, LEAF2, '#e8304a')], 0.34);
  set('flower', ['#ff6a8a', '#ffe14a', '#ffffff', '#8a7aff', '#ff9a3a'].map(c => A.flower(c)), 0.32, 0, true);
  set('tuft', [A.tuft(['#3e8a34', '#6ac04a']), A.tuft(['#4a9a3a', '#86c858'])], 0.38, 0, true);
  set('fern', [A.tuft(['#2a6a2a', '#4a9a3a'])], 0.55, 0, true);
  set('rock', [A.rock(R, 20, 14, ['#4a4a52', '#6a6a74', '#8a8a94', '#acacb4']), A.rock(R, 26, 18, ['#4a4844', '#6a6660', '#8a8680', '#aca8a0'])], 0.42, 2.6);
  set('rocksnow', [A.rock(R, 22, 16, ['#5a6a7a', '#8a9aaa', '#c8d6e4', '#f4f8ff'])], 0.42, 2.6);
  set('sandrock', [A.rock(R, 24, 16, ['#8a5a30', '#b07a44', '#d09a5a', '#e8bc7a']), A.rock(R, 18, 22, ['#8a5a30', '#b07a44', '#d09a5a', '#e8bc7a'])], 0.45, 2.6);
  set('lavarock', [A.rock(R, 22, 16, ['#1a1416', '#2e2628', '#46383a', '#5e4a4a'], ['#ff6a1a', '#ffc145'])], 0.45, 2.6);
  set('pine', [A.pine(R, 30, 56, ['#1e4a34', '#2e6a44', '#4a8a5a']), A.pine(R, 26, 50, ['#1e4a34', '#2e6a44', '#4a8a5a'])], 0.46, 1.8);
  set('snowpine', [A.pine(R, 30, 56, ['#1e4a3a', '#2e6a4a', '#4a8a5a'], true), A.pine(R, 26, 48, ['#1e4a3a', '#2e6a4a', '#4a8a5a'], true)], 0.46, 1.8);
  set('palm', [A.palm(R, 40, 58), A.palm(R, 40, 52)], 0.42, 1.2);
  set('cactus', [A.cactus(R, 22, 32), A.cactus(R, 20, 26)], 0.42, 1.4);
  set('drybush', [A.bush(R, 22, 14, ['#6a5a2a', '#8a7a3a', '#a89a4a', '#c8b86a'])], 0.34);
  set('deadtree', [A.deadTree(R, 36, 50), A.deadTree(R, 30, 44)], 0.46, 1.4);
  set('burnt', [A.deadTree(R, 34, 46, '#1e1818', '#3a2a2a')], 0.46, 1.4);
  set('willow', [A.willow(R, 46, 54), A.willow(R, 40, 50)], 0.46, 2);
  set('reeds', [A.reeds()], 0.5, 0, true);
  set('mushroom', [A.mushroom(R, 10, 10, '#e8304a'), A.mushroom(R, 9, 9, '#c8642a')], 0.32, 0, true);
  set('crystal', [A.crystal(R, 18, 28, ['#2a8aa8', '#4ac8e8', '#a8f0ff', '#ffffff']), A.crystal(R, 16, 24, ['#6a3aa8', '#9a6ae8', '#d0b0ff', '#ffffff'])], 0.42, 1.4);
  set('icecrystal', [A.crystal(R, 18, 26, ['#5a8ac8', '#8ab8f0', '#d0e8ff', '#ffffff'])], 0.42, 1.4);
  set('bones', [A.bones()], 0.4, 0, true);
  set('giant', [A.giantTree(rng(7), 220, 200)], 0.62, 17);
  set('stepstone', [A.rock(R, 16, 7, ['#6a7a80', '#9aa8b0', '#c8d4d8', '#eef4f6'])], 0.5);
  set('well', [A.well()], 0.62, 6);
  set('torch', [A.torch(R, 0)], 0.36, 1);
  set('anvil', [A.pix(['..........', 'aaaaaaaaa.', '.abbbbbbaa', '..abbbba..', '...abba...', '...abba...', '..aaaaaa..'], { a: '#1a1a22', b: '#5a5a66' })], 0.42, 2);
  set('sign', [A.sign()], 0.48, 1.2);
  set('statue', [A.figure([{ t: 'b', b: [-5, 5, -5, 5, -6, 0], c: '#7a7a82' }, ...A.human({ skin: '#a8a8b0', helm: { c: '#9a9aa2', plume: '#8a8a92' }, shirt: '#9a9aa2', plate: '#b0b0b8', pants: '#8a8a92', boots: '#7a7a82', cape: '#8a8a92', weapon: { col: '#b8b8c0', guard: '#8a8a92' }, shield: '#9a9aa2', emblem: '#b8b8c0' }, { armR: 1.0 })], Math.PI, 48, 52, { base: 46 })], 0.42, 4);
  set('menhir', [A.rock(R, 12, 34, ['#4a4a56', '#66667a', '#86869a', '#a8a8ba']), A.rock(R, 14, 30, ['#4a4a56', '#66667a', '#86869a', '#a8a8ba'])], 0.62, 3);
  set('tent', [A.tent('#c8642a')], 0.48, 9);
  set('campfire', [A.pix(['...ab...', '..abba..', '..abca..', '.abccba.', '.dbccbd.', 'deedeedd', '.dd..dd.'], { a: '#ff6a2a', b: '#ffc145', c: '#fff4b8', d: '#5a3a1e', e: '#3a2414' })], 0.4, 2);
  set('snowman', [A.snowman()], 0.48, 3.5);
  set('banner', [A.banner('#c8342c', '#ffd23f')], 0.5, 1);
  set('ore', [A.rock(R, 22, 16, ['#3a3a44', '#5a5a66', '#7a7a88', '#9a9aa8'], ['#ff9a3a', '#ffd06a', '#e8eef6'])], 0.48, 3.5);
  // effetti
  SPR.puff = atlas.add(A.pix(['..aaa..', '.abbba.', 'abbbbba', 'abbbbba', 'abbbbba', '.abbba.', '..aaa..'], { a: '#c8c8d4', b: '#f4f4fa' }));
  SPR.spark = atlas.add(A.pix(['..a..', '..a..', 'aabaa', '..a..', '..a..'], { a: '#ffd23f', b: '#ffffff' }));
  SPR.glint = atlas.add(A.pix(['...a...', '...a...', '..aba..', 'aabbbaa', '..aba..', '...a...', '...a...'], { a: '#fff4b0', b: '#ffffff' }));
  SPR.drop = atlas.add(A.pix(['.a.', 'aba', '.a.'], { a: '#7ac8f0', b: '#e0f4ff' }));
  SPR.ember = atlas.add(A.pix(['.a.', 'aba', '.a.'], { a: '#ff6a1a', b: '#ffe14a' }));
  SPR.coin = atlas.add(A.pix(['.aaa.', 'abbba', 'abcba', 'abbba', '.aaa.'], { a: '#8a5a10', b: '#ffc83a', c: '#fff4b0' }));
  SPR.heart = atlas.add(HEARTS[0]);
  SPR.flame = [atlas.add(A.flame(R, 0)), atlas.add(A.flame(R, 1))];
  SPR.rune = atlas.add(A.pix(['..aaa..', '.a...a.', 'a..b..a', 'a.bbb.a', 'a..b..a', '.a...a.', '..aaa..'], { a: '#4ae0e8', b: '#b8f8ff' }));
}
function* buildCharacters() {
  CHR.hero = null; heroRects = [];
  for (let p = 0; p < POSE_HERO.length; p++) { const row = []; for (let d = 0; d < 8; d++) row.push(atlas.add(A.mk(48, 48))); heroRects.push(row); }
  yield 0.05;
  const ids = Object.keys(NPC); let k = 0;
  for (const id of ids) { const N = NPC[id]; CHR[id] = POSE_NPC.slice(0, id === 'contadino' ? 3 : 2).map(p => dirs(() => A.human(N.look, p), 44, 52, { sc: N.sc || 1 })); k++; yield 0.05 + 0.45 * k / ids.length; }
  CHR.biscotto = [{}, { leg: 0.5 }].map(p => dirs(() => A.beast({ c: '#f0a050', c2: '#ffe0b0', eye: '#4ade80', s: 0.45, tailUp: 1.3 }, p), 26, 20));
  CHR.slime = [0, 1].map(f => dirs(() => A.slime({ c: '#5ad070' }, f), 34, 26));
  CHR.wolf = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#7a7a86', c2: '#b8b8c4' }, p), 44, 32));
  yield 0.6;
  CHR.icewolf = [{}, { leg: 0.5 }, { leg: -0.5 }, { lunge: 2.6, leg: 0.4 }].map(p => dirs(() => A.beast({ c: '#d0e2f4', c2: '#ffffff', eye: '#4ae0ff' }, p), 44, 32));
  CHR.goblin = POSE_FOE.map(p => dirs(() => A.human({ skin: '#6aa83e', shirt: '#6a4a2a', pants: '#4a3a2a', boots: '#2a2a2a', ears: true, weapon: { kind: 'club' }, eyes: '#ffe14a' }, p), 44, 48, { sc: 0.85 }));
  yield 0.7;
  CHR.skel = POSE_FOE.map(p => dirs(() => A.human({ skin: '#ece6d4', hand: '#ece6d4', skull: true, shirt: '#cfc8b4', sleeve: '#ece6d4', pants: '#cfc8b4', boots: '#a8a290', weapon: { col: '#8a8a7a', guard: '#5a5a4a' } }, p), 44, 48));
  CHR.imp = POSE_FOE.map(p => dirs(() => A.human({ skin: '#d84a2a', hand: '#d84a2a', horns: '#2a1a1a', shirt: '#8a1e1a', pants: '#5a1414', boots: '#2a1414', eyes: '#ffe14a', weapon: { kind: 'spear' } }, p), 44, 52, { sc: 0.85 }));
  yield 0.8;
  CHR.bat = [0, 1].map(f => dirs(() => A.bat(f), 40, 30));
  CHR.dragon = [0, 1].map(f => dirs(() => A.dragon(f), 128, 96, { pitch: -0.3, base: 60 }));
  CHR.chest = [0, 1, 2, 3].map(r => [0, 1].map(o => dirs(() => A.chest(r, o), 28, 26)));
  yield 1;
}
function drawHeroSprites() {
  const L = heroLook();
  for (let p = 0; p < POSE_HERO.length; p++) for (let d = 0; d < 8; d++) atlas.put(A.figure(A.human(L, POSE_HERO[p]), d / 8 * TAU, 48, 48), heroRects[p][d]);
  if (ATEX) { gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.c); }
}

// ---------- caricamento ----------
function* loader() {
  progMsg = 'PREPARO LA GRAFICA 3D'; yield 0.005;
  G = SG.createGL();
  if (!G) throw new Error('NOGL');
  gl = G.gl;
  atlas = A.Atlas(2048, 2048);
  progMsg = 'DISEGNO ALBERI, ROCCE E FIORI'; yield 0.01;
  buildStatics();
  progMsg = 'MODELLO LE TERRE DI LUMEN';
  for (const p of W.build(atlas, SPR)) yield 0.02 + p * 0.62;
  progMsg = 'DISEGNO ABITANTI E CREATURE';
  for (const p of buildCharacters()) yield 0.66 + p * 0.24;
  progMsg = 'PREPARO IL VIAGGIO'; yield 0.92;
  ATEX = G.texture(atlas.c);
  TILES = G.texture(A.tiles(rng(5)));
  DET = G.texture(A.detail(rng(3)), { repeat: true });
  PANO = G.texture(A.pano(rng(8), ['#8aa0c0', '#6a82a8', '#e8eef8']), { repeat: true });
  W.upload(G);
  dynBuf = G.buffer(dynF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
  shBuf = G.buffer(shF, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
  setupWorld();
  yield 1;
}
// i punti fissati a mano devono stare all'asciutto e fuori dai muri
function fixSpot(x, z, r = 3) {
  const ok = (a, b) => W.ground(a, b) > 0.4 && !W.blocked(a, b, r) && W.slope(a, b) < 0.9;
  if (ok(x, z)) return [x, z];
  for (let rad = 4; rad < 90; rad += 4) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, X = x + Math.cos(a) * rad, Z = z + Math.sin(a) * rad; if (ok(X, Z)) return [X, Z]; }
  return [x, z];
}
function setupWorld() {
  npcs = W.NPCS.map(([id, x, z, yaw]) => { const [X, Z] = id === 'biscotto' ? [x, z] : fixSpot(x, z); return { id, x: X, z: Z, yaw, base: yaw, hx: X, hz: Z, t: Math.random() * 3, walk: 0, moving: false }; });
  chests = W.CHESTS.map(([id, x, z, c, r]) => { const fixed = ['c06', 'c07', 'c09', 'c10'].includes(id); const [X, Z] = fixed ? [x, z] : fixSpot(x, z, 4); return { id, x: X, z: Z, c, r, yaw: Math.atan2(2650 - Z, 2000 - X) }; });
  for (const c of chests) W.addCircle(c.x, c.z, 3);
  camps = W.CAMPS.map(([x, z, type, n, r]) => { const [X, Z] = fixSpot(x, z, 4); return { x: X, z: Z, type, n, r, alive: [], dead: 0, cool: 0, on: false }; });
  props = W.PROPS.map(([k, x, z]) => ({ k, x, z }));
  doors = W.lights.filter(l => l.id);
  for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) LAND[j * 64 + i] = W.ground(i * 64 + 32, j * 64 + 32) > 0 ? 1 : 0;
}
function startGame(fresh) {
  if (fresh) { save = newSave(); seen.fill(0); try { localStorage.removeItem(SAVEKEY); } catch (e) {} }
  else { seen.fill(0); unb64(save.seen || '', seen); }
  hero = { x: save.x, z: save.z, y: W.ground(save.x, save.z), yaw: save.yaw, hp: Math.min(save.hp, MAXHP()), atk: 0, hitDone: true, walk: 0, moving: false, kb: 0, kx: 0, kz: 0, inv: 0, burnT: 0, dead: false, regenT: 0, wade: false };
  if (hero.hp <= 0) hero.hp = MAXHP();
  cam.yaw = hero.yaw; placeCam(1);
  foes = []; drops = []; fx = []; for (const c of camps) { c.alive = []; c.on = false; c.dead = 0; }
  curPlace = ''; placeCand = ''; banner = null; toasts = []; dialog = null; menu = null; shop = null; loot = null; mapOpen = false; death = 0;
  drawHeroSprites();
  help = fresh ? 9 : 0;
  st = 'play';
  if (fresh) { intro = 1; st = 'intro'; }
  writeSave();
}

// ---------- missioni ----------
const QN = { main: "LE PIETRE DELL'ALBA", ferro: 'FERRO PER LA FORGIA', gatto: 'IL GATTO BISCOTTO', melme: 'MELME NEI CAMPI' };
function questLine(q) {
  const s = save.q[q];
  if (q === 'main') return ['PARLA CON L\'ANZIANA MIRTA, NEL BORGO.', "RAGGIUNGI L'ALBERO MADRE NEL BOSCO ANTICO (NORD-OVEST).", 'PARLA CON IL CAPITANO ARDEA ALLA ROCCA DI LUMEN (SUD-EST).', 'CAPITOLO 1 COMPLETATO. IL SEGUITO NEL CAPITOLO 2!'][s];
  if (q === 'ferro') return ['', 'TROVA 3 MINERALI DI FERRO A NORD-EST DEL BORGO (' + Math.min(3, save.ore) + '/3).', 'PORTA IL FERRO A BRUNO IL FABBRO.', 'COMPLETATA'][s];
  if (q === 'gatto') return ['', 'CERCA BISCOTTO LUNGO LA STRADA PER IL BOSCO.', 'TORNA DA LIA.', 'COMPLETATA'][s];
  if (q === 'melme') return ['', 'SCONFIGGI 6 MELME NEI CAMPI DORATI (' + Math.min(6, save.slimes) + '/6).', 'TORNA DA OTTO, LA GUARDIA.', 'COMPLETATA'][s];
  return '';
}
const questDone = q => (q === 'main' ? save.q.main >= 3 : save.q[q] >= 3);
function questTarget(q) {
  const s = save.q[q], np = id => { const n = npcs.find(e => e.id === id); return n ? [n.x, n.z] : null; };
  if (q === 'main') return [np('mirta'), np('spirito'), np('ardea'), null][s];
  if (q === 'ferro') { if (s === 1) { let best = null, bd = 1e9; for (const p of props) if (p.k === 'ore' && !save.oreTaken[p.x + ',' + p.z]) { const d = Math.hypot(p.x - hero.x, p.z - hero.z); if (d < bd) { bd = d; best = [p.x, p.z]; } } return best; } return s === 2 ? np('bruno') : null; }
  if (q === 'gatto') return s === 1 ? np('biscotto') : s === 2 ? np('lia') : null;
  if (q === 'melme') return s === 1 ? [2420, 2840] : s === 2 ? np('otto') : null;
  return null;
}
function trackQuest(q) { save.track = q; }
function curTrack() {
  const active = q => q === 'main' ? save.q.main < 3 : save.q[q] > 0 && save.q[q] < 3;
  if (save.track && active(save.track)) return save.track;
  for (const q of ['main', 'ferro', 'gatto', 'melme']) if (active(q)) return q;
  return null;
}

// ---------- dare oggetti ----------
function give(id, quiet) {
  const it = IT[id];
  if (it.t === 'cuore') { save.hearts++; hero.hp = MAXHP(); if (!quiet) toast('+1 CUORE!', '#ff6a8a'); return 'UN CUORE IN PIÙ!'; }
  if (it.t === 'pozione') { save.pot++; return null; }
  if (it.t === 'mappa') { save.flags.mappa = 1; return 'I FORZIERI LEGGENDARI SONO SEGNATI SULLA MAPPA.'; }
  if (!save.inv.includes(id)) save.inv.push(id);
  const cur = eqIt(it.t), score = x => x ? (x.att || 0) * 3 + (x.dif || 0) * 3 + (x.hp || 0) * 2 + (x.vel || 0) * 10 + (x.regen || 0) * 6 + x.r : -1;
  if (score(it) > score(cur)) { equip(id); return 'EQUIPAGGIATO!'; }
  return 'MESSO NELLA BORSA (START).';
}
function equip(id) {
  const it = IT[id]; save.eq[it.t] = id;
  hero.hp = Math.min(hero.hp, MAXHP());
  drawHeroSprites();
}
function toast(t, c = '#ffffff') { toasts.push({ t, c, life: 3 }); if (toasts.length > 4) toasts.shift(); }

// ---------- dialoghi ----------
function say(id, lines, then) { dialog = { id, name: id && NPC[id] ? NPC[id].n : id === 'biscotto' ? 'BISCOTTO' : '', lines: lines.map(l => A.wrap(l, Math.max(120, dialogW() - 16))), i: 0, ch: 0, then }; }
function talk(n) {
  const q = save.q, id = n.id;
  if (id === 'mirta') {
    if (q.main === 0) return say(id, ['BENVENUTO A BORGO AURORA, VIAGGIATORE. IO SONO MIRTA, LA PIÙ ANZIANA DEL VILLAGGIO.', "DA QUANDO LE CINQUE PIETRE DELL'ALBA SONO SPARITE, LE CREATURE DI LUMEN SI SONO FATTE INQUIETE.", 'E SUL PICCO A NORD SI È SVEGLIATO IL DRAGO. DALLE RIVE DEL LAGO LO SI VEDE VOLARE.', "LO SPIRITO DEL BOSCO SA DOVE SONO NASCOSTE LE PIETRE. VIVE SOTTO L'ALBERO MADRE, NEL BOSCO ANTICO, A NORD-OVEST.", 'NON PUOI ANDARCI A MANI NUDE: PRENDI QUESTA SPADA DI LEGNO E DUE POZIONI.'], () => { give('legno'); save.pot += 2; q.main = 1; trackQuest('main'); toast("MISSIONE: LE PIETRE DELL'ALBA", '#ffd23f'); jingle(); });
    if (q.main === 1) return say(id, ["L'ALBERO MADRE È NEL BOSCO ANTICO, A NORD-OVEST. SEGUI LA STRADA CHE PARTE DALLA PIAZZA.", 'SE TI PERDI, PREMI SELECT PER GUARDARE LA MAPPA. IL ROMBO GIALLO IN ALTO TI INDICA LA DIREZIONE.']);
    if (q.main === 2) return say(id, ['LO SPIRITO TI HA MANDATO ALLA ROCCA? ALLORA LA COSA È SERIA.', 'LA ROCCA DI LUMEN È A SUD-EST, OLTRE IL GUADO DEL FIUME.']);
    return say(id, ['GLI ANTICHI SIGILLI... SERVIRÀ TEMPO PER DECIFRARLI.', 'INTANTO ESPLORA: LUMEN È PIENA DI SEGRETI. E SE SEI FERITO, BEVI AL POZZO DELLA PIAZZA.']);
  }
  if (id === 'bruno') {
    if (q.ferro === 0) return say(id, ['BENVENUTO NELLA MIA FUCINA! PECCATO CHE IL FUOCO SIA QUASI SPENTO: MI MANCA IL FERRO.', 'SULLE COLLINE A NORD-EST DEL BORGO CI SONO ROCCE CON VENATURE DI FERRO. LUCCICANO TRA L\'ERBA.', 'PORTAMENE TRE E TI FORGIO UNA SPADA VERA.'], () => { q.ferro = 1; trackQuest('ferro'); toast('MISSIONE: FERRO PER LA FORGIA', '#ffd23f'); jingle(); });
    if (q.ferro === 1 && save.ore < 3) return say(id, ['MINERALE DI FERRO: NE HAI ' + save.ore + ' SU 3.', 'LE ROCCE CON IL FERRO SONO A NORD-EST DEL BORGO, TRA LE COLLINE.']);
    if (q.ferro <= 2) return say(id, ['CHE BEL FERRO! DAMMI UN MOMENTO...', 'ECCO: UNA SPADA DI FERRO, TEMPRATA A DOVERE. MOLTO MEGLIO DI QUEL BASTONE!'], () => { q.ferro = 3; openLoot('ferro'); });
    if (save.inv.includes('aurora')) return say(id, ["QUELLA... È LA LAMA DELL'AURORA?! NON CREDEVO DI VEDERLA CON I MIEI OCCHI!", 'TIENILA CARA. NESSUN FABBRO AL MONDO SAPREBBE FORGIARNE UN\'ALTRA.']);
    return say(id, ['SE UN GIORNO TROVI UN\'ARMA LEGGENDARIA, PORTAMELA: VOGLIO SOLO GUARDARLA, GIURO!']);
  }
  if (id === 'lia') {
    if (q.gatto === 0) return say(id, ['IL MIO GATTO BISCOTTO È SCAPPATO VERSO IL BOSCO! È ARANCIONE E HA PAURA DI TUTTO...', 'MI AIUTI A TROVARLO? L\'HO VISTO CORRERE LUNGO LA STRADA PER IL BOSCO ANTICO.'], () => { q.gatto = 1; trackQuest('gatto'); toast('MISSIONE: IL GATTO BISCOTTO', '#ffd23f'); jingle(); });
    if (q.gatto === 1) return say(id, ['BISCOTTO È ANCORA LÀ FUORI... TI PREGO, CERCALO LUNGO LA STRADA DEL BOSCO!']);
    if (q.gatto === 2) return say(id, ['BISCOTTO È TORNATO! HA FATTO TUTTA LA STRADA DA SOLO, SPORCO DI FANGO.', "GRAZIE! TIENI, L'HO TROVATO IN FONDO AL POZZO: È UN ANELLO CHE BRILLA."], () => { q.gatto = 3; openLoot('anelloVita'); });
    return say(id, ['BISCOTTO ADESSO DORME SEMPRE VICINO AL POZZO. OGNI TANTO SOGNA I TOPI DEL BOSCO.']);
  }
  if (id === 'biscotto') {
    if (q.gatto === 1) return say(id, ['MIAO!', 'BISCOTTO TI ANNUSA LA MANO... POI CORRE A TUTTA VELOCITÀ VERSO IL BORGO!'], () => { q.gatto = 2; n.x = n.hx = 2032; n.z = n.hz = 2660; puffAt(n.x, n.z); toast('BISCOTTO È TORNATO A CASA!', '#ffd23f'); jingle(); });
    return say(id, [q.gatto >= 2 ? 'PRRR... PRRR...' : 'MIAO?']);
  }
  if (id === 'otto') {
    if (q.melme === 0) return say(id, ['ALT! AH, SEI UN VIAGGIATORE. SCUSA, SONO UN PO\' NERVOSO.', 'LE MELME HANNO INVASO I CAMPI DORATI, QUI A EST. IO NON POSSO LASCIARE IL POSTO DI GUARDIA...', 'NE SCONFIGGI SEI PER ME? TI RICOMPENSERÒ.'], () => { q.melme = 1; save.slimes = 0; trackQuest('melme'); toast('MISSIONE: MELME NEI CAMPI', '#ffd23f'); jingle(); });
    if (q.melme === 1) return say(id, ['MELME SCONFITTE: ' + save.slimes + ' SU 6. SONO NEI CAMPI A EST, OLTRE IL GUADO DEL FIUME.']);
    if (q.melme === 2) return say(id, ['SEI MELME! I CONTADINI TI RINGRAZIANO.', 'PRENDI IL MIO VECCHIO SCUDO. E ANCHE QUESTE CINQUANTA MONETE.'], () => { q.melme = 3; save.coins += 50; openLoot('scudoLegno'); });
    return say(id, ['DA QUANDO I CAMPI SONO PULITI IL GRANO CRESCE DORATO COME NON MAI.']);
  }
  if (id === 'nino') return say(id, ['BENVENUTO! MERCI DA TUTTA LUMEN, PREZZI ONESTI... QUASI.'], () => { shop = { sel: 0 }; });
  if (id === 'viandante') {
    const H = ['HO GIRATO TUTTA LUMEN. SAPEVI CHE SULL\'ISOLA DEL LAGO DI CRISTALLO C\'È UN ANTICO SANTUARIO?', "L'ACQUA DEL LAGO È PROFONDA... MA DALLA RIVA SUD-OVEST HO VISTO UN PUNTO DOVE SEMBRA PIÙ CHIARA.",
      'IN CIMA AL PICCO DEL DRAGO C\'È UN TESORO. IL SENTIERO PARTE DALLA RIVA NORD DEL LAGO: È RIPIDO, MA SI SALE.', 'LE RUPI DEL GRIFONE, A NORD-EST, SEMBRANO IMPOSSIBILI DA SCALARE. MA DAL DESERTO, TRA LE ROCCE, QUALCUNO CI È RIUSCITO.',
      "NEL CUORE DELLA PALUDE D'OMBRA BRILLA QUALCOSA. LE POZZE SONO BASSE: SI POSSONO GUADARE.", 'NEL CERCHIO DI PIETRE, A SUD-OVEST DEL BORGO, GLI ANTICHI LASCIAVANO DONI AGLI DEI.',
      'DIETRO AL GRANDE ALBERO DEL BOSCO, TRA LE RADICI, I BAMBINI DICONO DI AVER VISTO UN FORZIERE.'];
    const h = H[save.hint % H.length]; save.hint++;
    return say(id, [h]);
  }
  if (id === 'pescatore') return say(id, ['IL LAGO È PROFONDO E I PESCI SONO FURBI.', "L'ALTRO GIORNO HO VISTO DELLE PIETRE CHIARE SOTT'ACQUA, PARTIVANO DALLA STRADA A OVEST DI QUI E ANDAVANO VERSO L'ISOLA."]);
  if (id === 'spirito') {
    if (q.main === 0) return say(id, ['...NON SEI ANCORA PRONTO. PARLA PRIMA CON LA SAGGIA DEL BORGO.']);
    if (q.main === 1) return say(id, ['...UN CUORE CORAGGIOSO. FINALMENTE.', "LE CINQUE PIETRE DELL'ALBA RIPOSANO NEI SANTUARI: NEL BOSCO, NEL DESERTO, TRA I GHIACCI, NEL VULCANO E SULL'ISOLA DEL LAGO.", 'OGNI SANTUARIO È CHIUSO DA UN SIGILLO CHE SOLO IL SANGUE DEI RE DI LUMEN SA SPEZZARE.', "VA' ALLA ROCCA, A SUD-EST DEL BORGO, E PARLA CON IL CAPITANO ARDEA. E PRENDI QUESTO CUORE DI CRISTALLO: TI DARÀ FORZA."], () => { q.main = 2; trackQuest('main'); openLoot('cuore'); });
    return say(id, ['IL BOSCO TI OSSERVA, PICCOLO EROE. TORNA QUANDO I SIGILLI SARANNO SPEZZATI.']);
  }
  if (id === 'ardea') {
    if (q.main < 2) return say(id, ['QUESTA È LA ROCCA DI LUMEN. SENZA UN BUON MOTIVO NON SI ENTRA NEL MASTIO.']);
    if (q.main === 2) return say(id, ['TI MANDA LO SPIRITO DEL BOSCO? ALLORA I SIGILLI SI STANNO INDEBOLENDO...', 'IL RE È PARTITO PER LE TERRE DEL NORD IN CERCA DEGLI ANTICHI SAPIENTI: SOLO LORO SANNO LEGGERE LE RUNE DEI SANTUARI.', 'FINCHÉ NON TORNA, ALLENATI. ESPLORA LUMEN, TROVA EQUIPAGGIAMENTO DEGNO DI UN EROE E AIUTA LA GENTE.', 'PRENDI QUESTE CENTO MONETE PER IL VIAGGIO. E STAI LONTANO DAL DRAGO... PER ORA.'], () => { q.main = 3; save.coins += 100; toast('+100 MONETE', '#ffd23f'); banner = { t: 'CAPITOLO 1 COMPLETATO', s: 'IL SEGUITO NEL CAPITOLO 2', life: 5, c: '#ffd23f' }; fanfare(); writeSave(); });
    return say(id, ['IL RE NON È ANCORA TORNATO. QUANDO I SAPIENTI AVRANNO DECIFRATO LE RUNE, TI MANDERÒ A CHIAMARE.']);
  }
  if (id === 'nomade') return say(id, ['LE ROVINE DI SOLIS CUSTODISCONO IL SANTUARIO DEL SOLE. GLI SCHELETRI LÀ DENTRO NON DORMONO MAI.', 'A NORD, OLTRE LE DUNE, LE ROCCE SALGONO VERSO LE RUPI DEL GRIFONE. HO VISTO UN SENTIERO, MA NESSUNO TORNA A RACCONTARLO.']);
  if (id === 'eremita') return say(id, ["IL DRAGO... L'HO VISTO DA VICINO, UNA VOLTA. LE SUE SCAGLIE RESISTONO A TUTTO.", "DICONO CHE SOLO LA LAMA DELL'AURORA POSSA FERIRLO. MA QUELLA LAMA È PERDUTA DA SECOLI... FORSE.", 'SE HAI FREDDO AI PIEDI, GUARDA DIETRO AL PUPAZZO DI NEVE.']);
  if (id === 'contadino') return say(id, [q.melme >= 3 ? 'CHE RACCOLTO, QUEST\'ANNO! GRAZIE A TE, VIAGGIATORE.' : 'LE MELME SI MANGIANO IL GRANO! SE LE SCACCI, OTTO SARÀ CONTENTO.']);
}
const SIGNS = {
  '1996,2470': '↑ LAGO DI CRISTALLO   ← BOSCO ANTICO\n→ ROCCA DI LUMEN   ↓ BORGO AURORA', '2120,1680': 'LAGO DI CRISTALLO\n↑ PICCO DEL DRAGO: IL SENTIERO GIRA A OVEST DEL LAGO',
  '2655,2925': 'ROCCA DI LUMEN\n↗ DESERTO DI SOLIS   ↘ MONTE BRACE', '3220,1980': '↑ ROVINE DI SOLIS\nATTENZIONE: SCHELETRI!', '1180,1600': "BOSCO ANTICO\n↑ L'ALBERO MADRE   ↖ VALLE GELATA", '900,2660': "PALUDE D'OMBRA\nNON ANDARE OLTRE AL TRAMONTO",
};
const PROPTXT = { well: 'IL POZZO DEL BORGO. BEVI UN SORSO DI ACQUA FRESCA...', statue: 'UNA STATUA DI PIETRA. SUL BASAMENTO: "RE AURELIO, PRIMO SIGNORE DI LUMEN".', menhir: 'UNA PIETRA ANTICA COPERTA DI RUNE CONSUMATE DAL TEMPO.',
  snowman: 'UN PUPAZZO DI NEVE CON UNA CAROTA PER NASO. SEMBRA SORRIDERE.', giant: "L'ALBERO MADRE. IL SUO TRONCO È LARGO COME UNA CASA E LE RADICI AFFONDANO FINO AL CENTRO DEL MONDO.", tent: 'LA TENDA DELLA NOMADE. PROFUMA DI SPEZIE.', campfire: 'UN FUOCO SCOPPIETTANTE.', anvil: "L'INCUDINE DI BRUNO. È ANCORA TIEPIDA." };
const SANCT = { bosco: 'SANTUARIO DEL BOSCO', sole: 'SANTUARIO DEL SOLE', ghiaccio: 'SANTUARIO DEL GHIACCIO', fuoco: 'SANTUARIO DEL FUOCO', lago: 'SANTUARIO DEL LAGO' };
const SHOP = [['pozione', 20], ['giaco', 60], ['scudoLegno', 45], ['mappa', 150]];

// ---------- suoni ----------
const jingle = () => seq([784, 988, 1175, 1568], 0.09, 0.08, 0.04);
const fanfare = () => seq([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.12, 0.11, 0.045);
const vib = ms => { if (save && save.opt.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };

// ---------- forzieri e bottino ----------
function openLoot(id, qty) {
  const it = IT[id];
  if (id === 'pozione') { save.pot += qty || 1; loot = { id, txt: qty > 1 ? qty + ' POZIONI' : 'UNA POZIONE', note: 'POZIONI NELLA BORSA: ' + save.pot, t: 0 }; seq([659, 880], 0.08, 0.08); return; }
  const note = give(id);
  loot = { id, t: 0, note };
  if (it.r === 3) fanfare(); else jingle();
  vib(30); writeSave();
}
function openChest(c) {
  save.chests[c.id] = 1;
  const [k, n] = c.c.split(':');
  for (let i = 0; i < 6; i++) fx.push({ k: 'glint', x: c.x + (Math.random() - 0.5) * 6, z: c.z + (Math.random() - 0.5) * 6, y: W.ground(c.x, c.z) + 4, vy: 6 + Math.random() * 6, t: 1 });
  if (k === 'monete') { const v = +n; save.coins += v; loot = { id: 'monete', txt: v + ' MONETE', t: 0 }; seq([1318, 1760, 2093], 0.06, 0.06); writeSave(); return; }
  openLoot(k, n ? +n : 1);
}

// ---------- telecamera ----------
const CAM_D = 25, CAM_H = 11, LOOK_F = 9, LOOK_H = 6.5, FOVY = 0.95;
function placeCam(snap) {
  const fx = Math.cos(cam.yaw), fz = Math.sin(cam.yaw);
  let d = CAM_D;
  for (let t = 1; t > 0.25; t -= 0.08) { const ex = hero.x - fx * CAM_D * t, ez = hero.z - fz * CAM_D * t; if (!W.inBox(ex, ez, 1.5)) { d = CAM_D * t; break; } d = CAM_D * t; }
  const ex = hero.x - fx * d, ez = hero.z - fz * d;
  let ey = hero.y + CAM_H;
  ey = Math.max(ey, W.ground(ex, ez) + 2.5, W.ground((ex + hero.x) / 2, (ez + hero.z) / 2) + 2);
  const k = snap ? 1 : 0.25;
  cam.x += (ex - cam.x) * k; cam.y += (ey - cam.y) * k; cam.z += (ez - cam.z) * k;
  cam.tx = hero.x + fx * LOOK_F; cam.ty = hero.y + LOOK_H; cam.tz = hero.z + fz * LOOK_F;
}

// ---------- movimento con collisioni ----------
function canStand(e, nx, nz, r, steep) {
  if (nx < 10 || nz < 10 || nx > W.WS - 10 || nz > W.WS - 10) return false;
  const h0 = W.ground(e.x, e.z), h1 = W.ground(nx, nz), d = Math.hypot(nx - e.x, nz - e.z) || 1e-6;
  if (h1 < W.WL - 2.2) return false;
  if ((h1 - h0) / d > steep) return false;
  return !W.blocked(nx, nz, r);
}
function move(e, dx, dz, r, steep = 1.25) {
  if (canStand(e, e.x + dx, e.z + dz, r, steep)) { e.x += dx; e.z += dz; return true; }
  if (Math.abs(dx) > 1e-4 && canStand(e, e.x + dx, e.z, r, steep)) { e.x += dx; return true; }
  if (Math.abs(dz) > 1e-4 && canStand(e, e.x, e.z + dz, r, steep)) { e.z += dz; return true; }
  return false;
}
function puffAt(x, z, n = 6, y) { const gy = y !== undefined ? y : W.ground(x, z) + 2; for (let i = 0; i < n; i++) fx.push({ k: 'puff', x: x + (Math.random() - 0.5) * 4, z: z + (Math.random() - 0.5) * 4, y: gy, vy: 3 + Math.random() * 5, t: 0.6 + Math.random() * 0.3, s: 0.45 }); }

// ---------- eroe ----------
function hurtHero(dmg, src) {
  if (hero.inv > 0 || hero.dead) return;
  const red = Math.floor(DIF() / 3), d = Math.max(1, dmg - red);
  hero.hp -= d; hero.inv = 0.9; hero.flash = 0.25;
  if (src) { const a = Math.atan2(hero.z - src.z, hero.x - src.x); hero.kx = Math.cos(a) * 46; hero.kz = Math.sin(a) * 46; hero.kb = 0.18; }
  tone(170, 0.18, 'sawtooth', 0.06, 70); vib(60);
  if (hero.hp <= 0) { hero.hp = 0; hero.dead = true; death = 0; st = 'dead'; noise(0.5, 0.08); }
}
function heroUpdate(dt) {
  const h = hero;
  if (h.inv > 0) h.inv -= dt; if (h.flash > 0) h.flash -= dt;
  const busy = dialog || shop || loot || menu || mapOpen;
  let f = 0, turn = 0;
  if (!busy) { turn = (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0); f = BTN.up ? 1 : BTN.down ? -0.55 : 0; }
  h.yaw += turn * 2.45 * dt;
  const gy = W.ground(h.x, h.z);
  h.wade = gy < W.WL - 0.35;
  let sp = 25 * VEL() * (BTN.b && f > 0 ? 1.65 : 1) * (h.wade ? 0.55 : 1) * (h.atk > 0 ? 0.35 : 1);
  if (h.kb > 0) { h.kb -= dt; move(h, h.kx * dt, h.kz * dt, 1.6); }
  h.moving = false;
  if (f !== 0) {
    const dx = Math.cos(h.yaw) * f * sp * dt, dz = Math.sin(h.yaw) * f * sp * dt;
    if (move(h, dx, dz, 1.6)) { h.moving = true; h.walk += Math.hypot(dx, dz); }
    if (h.wade && Math.random() < 0.3) fx.push({ k: 'drop', x: h.x, z: h.z, y: W.WL + 0.3, vy: 8 + Math.random() * 6, t: 0.4, s: 0.35 });
  }
  // spinta via dagli abitanti
  for (const n of npcs) { const dx = h.x - n.x, dz = h.z - n.z, d = Math.hypot(dx, dz); if (d < 4.2 && d > 0.01) { move(h, dx / d * (4.2 - d), dz / d * (4.2 - d), 1.6); } }
  h.y += (W.ground(h.x, h.z) - h.y) * Math.min(1, 18 * dt);
  // attacco
  if (h.atk > 0) {
    h.atk -= dt;
    if (!h.hitDone && h.atk < 0.27) {
      h.hitDone = true;
      for (const e of foes) {
        if (e.st === 'dead') continue;
        const dx = e.x - h.x, dz = e.z - h.z, d = Math.hypot(dx, dz);
        if (d < 10.5 + FOE[e.type].r && Math.cos(Math.atan2(dz, dx) - h.yaw) > 0.35) hitFoe(e, ATT(), Math.atan2(dz, dx));
      }
    }
  }
  // lava
  const lava = lavaAt(h.x, h.z);
  if (lava && !h.wade && !(eqIt('armatura') || {}).fire) { h.burnT -= dt; if (h.burnT <= 0) { h.burnT = 0.7; hurtHero(1, null); toast('SCOTTA! LA LAVA BRUCIA!', '#ff8a4a'); } if (Math.random() < 0.3) fx.push({ k: 'ember', x: h.x, z: h.z, y: h.y + 1, vy: 10, t: 0.5, s: 0.4 }); }
  // amuleto della luna
  if ((eqIt('acc') || {}).regen && h.hp < MAXHP()) { h.regenT += dt; if (h.regenT > 8) { h.regenT = 0; h.hp++; } }
}
function lavaAt(x, z) { const i = Math.max(0, Math.min(W.TEX - 1, Math.floor(x / (W.WS / W.TEX)))), j = Math.max(0, Math.min(W.TEX - 1, Math.floor(z / (W.WS / W.TEX)))); return W.col[(j * W.TEX + i) * 4 + 3] > 140; }

// ---------- nemici ----------
function hitFoe(e, dmg, a) {
  const T = FOE[e.type];
  e.hp -= dmg; e.flash = 0.16; e.kb = 0.18; e.kx = Math.cos(a) * 60; e.kz = Math.sin(a) * 60; e.st = 'chase';
  for (let i = 0; i < 3; i++) fx.push({ k: 'spark', x: e.x, z: e.z, y: e.y + 3 + Math.random() * 2, vy: 8, t: 0.22, s: 0.3 });
  tone(240, 0.07, 'square', 0.05, 120); vib(15);
  if (e.hp <= 0) {
    e.st = 'dead'; e.fade = 0.5; puffAt(e.x, e.z, 8, e.y + 2); seq([523, 392, 262], 0.05, 0.05, 0.035);
    const n = T.coins[0] + Math.floor(Math.random() * (T.coins[1] - T.coins[0] + 1));
    for (let i = 0; i < Math.min(5, Math.ceil(n / 2)); i++) drops.push({ k: 'coin', v: Math.ceil(n / Math.min(5, Math.ceil(n / 2))), x: e.x, z: e.z, y: e.y + 2, vx: (Math.random() - 0.5) * 18, vz: (Math.random() - 0.5) * 18, vy: 20, t: 20 });
    if (hero.hp < MAXHP() && Math.random() < 0.3) drops.push({ k: 'heart', x: e.x, z: e.z, y: e.y + 2, vx: 0, vz: 0, vy: 22, t: 20 });
    if (e.type === 'slime' && save.q.melme === 1) { save.slimes++; toast('MELME: ' + Math.min(6, save.slimes) + '/6', '#9af0b0'); if (save.slimes >= 6) { save.q.melme = 2; toast('TORNA DA OTTO!', '#ffd23f'); jingle(); } }
  }
}
function spawnCamp(c) {
  const T = FOE[c.type];
  for (let i = c.alive.length; i < c.n - c.dead; i++) {
    for (let tries = 0; tries < 10; tries++) {
      const a = Math.random() * TAU, r = Math.random() * c.r * 0.7, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      if (W.ground(x, z) < 0.3 || W.blocked(x, z, T.r)) continue;
      const e = { type: c.type, camp: c, x, z, y: W.ground(x, z), yaw: Math.random() * TAU, hp: T.hp, st: 'idle', t: Math.random() * 2, cd: 0, flash: 0, kb: 0, walk: 0, hop: Math.random(), wx: x, wz: z };
      foes.push(e); c.alive.push(e); break;
    }
  }
}
function campsUpdate(dt) {
  for (const c of camps) {
    const d = Math.hypot(c.x - hero.x, c.z - hero.z);
    if (c.cool > 0) c.cool -= dt;
    if (!c.on && d < 330) { if (c.dead >= c.n && c.cool <= 0) c.dead = 0; c.on = true; spawnCamp(c); }
    else if (c.on && d > 480) { c.on = false; for (const e of c.alive) e.gone = true; c.alive = []; if (c.dead >= c.n) c.cool = 90; }
  }
  foes = foes.filter(e => !e.gone && !(e.st === 'dead' && e.fade <= 0));
}
function foeUpdate(e, dt) {
  const T = FOE[e.type], dx = hero.x - e.x, dz = hero.z - e.z, d = Math.hypot(dx, dz), homeD = Math.hypot(e.camp.x - e.x, e.camp.z - e.z), leash = e.camp.r * 2.6;
  if (e.flash > 0) e.flash -= dt; if (e.cd > 0) e.cd -= dt; e.t -= dt;
  if (e.st === 'dead') { e.fade -= dt; if (e.fade <= 0 && !e.counted) { e.counted = true; e.camp.dead++; e.camp.alive = e.camp.alive.filter(x => x !== e); } return; }
  const fly = T.fly ? T.fly + Math.sin(time * 4 + e.hop * 9) * 1.5 : 0;
  e.y += (W.ground(e.x, e.z) + fly - e.y) * Math.min(1, 12 * dt);
  if (e.kb > 0) { e.kb -= dt; move(e, e.kx * dt, e.kz * dt, T.r, 3); return; }
  if (e.st === 'wind') { e.yaw = Math.atan2(dz, dx); if (e.t <= 0) { if (d < T.range + 3 && st === 'play') hurtHero(T.dmg, e); e.st = 'chase'; e.cd = 1.1; } return; }
  const calm = st !== 'play' || hero.dead || dialog || shop || loot;
  if (!calm && d < T.aggro && homeD < leash) e.st = 'chase';
  else if (e.st === 'chase' && (calm || d > T.aggro * 1.7 || homeD > leash)) e.st = 'home';
  let tx = null, tz = null, sp = T.sp;
  if (e.st === 'chase') { if (d < T.range && e.cd <= 0) { e.st = 'wind'; e.t = e.type === 'slime' ? 0.35 : 0.45; return; } if (d > T.range * 0.7) { tx = hero.x; tz = hero.z; } else e.yaw = Math.atan2(dz, dx); }
  else if (e.st === 'home') { tx = e.camp.x; tz = e.camp.z; sp *= 0.7; if (homeD < e.camp.r * 0.5) e.st = 'idle'; }
  else { if (e.t <= 0) { e.t = 2 + Math.random() * 3; const a = Math.random() * TAU, r = Math.random() * e.camp.r * 0.6; e.wx = e.camp.x + Math.cos(a) * r; e.wz = e.camp.z + Math.sin(a) * r; } if (Math.hypot(e.wx - e.x, e.wz - e.z) > 3) { tx = e.wx; tz = e.wz; sp *= 0.35; } }
  e.moving = false;
  if (tx !== null) {
    const a = Math.atan2(tz - e.z, tx - e.x); e.yaw += angDiff(a, e.yaw) * Math.min(1, 8 * dt);
    if (e.type === 'slime') { e.hop = (e.hop + dt * 1.3) % 1; if (e.hop > 0.55) return; }
    const m = sp * dt;
    if (move(e, Math.cos(e.yaw) * m, Math.sin(e.yaw) * m, T.r, 1.6)) { e.moving = true; e.walk += m; }
  }
  // non si sovrappongono
  for (const o of foes) if (o !== e && o.st !== 'dead') { const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz); if (od < 5 && od > 0.01) { e.x += ox / od * (5 - od) * 0.5; e.z += oz / od * (5 - od) * 0.5; } }
}

// ---------- abitanti, monete, effetti ----------
function npcsUpdate(dt) {
  for (const n of npcs) {
    n.t -= dt;
    const d = Math.hypot(hero.x - n.x, hero.z - n.z);
    if (n.id === 'biscotto' && save.q.gatto >= 2) { n.x = n.hx = 2032; n.z = n.hz = 2662; }
    if (d < 22 || (dialog && dialog.id === n.id)) { n.yaw += angDiff(Math.atan2(hero.z - n.z, hero.x - n.x), n.yaw) * Math.min(1, 5 * dt); n.moving = false; continue; }
    if (n.id === 'contadino' || n.id === 'biscotto') {
      if (n.t <= 0) { n.t = 3 + Math.random() * 4; const a = Math.random() * TAU; n.wx = n.hx + Math.cos(a) * 30; n.wz = n.hz + Math.sin(a) * 30; }
      if (n.wx !== undefined && Math.hypot(n.wx - n.x, n.wz - n.z) > 2) { const a = Math.atan2(n.wz - n.z, n.wx - n.x); n.yaw += angDiff(a, n.yaw) * Math.min(1, 6 * dt); const m = (n.id === 'biscotto' ? 9 : 7) * dt; n.moving = move(n, Math.cos(n.yaw) * m, Math.sin(n.yaw) * m, 1.5); n.walk += m; }
      else n.moving = false;
    } else n.yaw += angDiff(n.base, n.yaw) * Math.min(1, 2 * dt);
  }
}
function dropsUpdate(dt) {
  for (const p of drops) {
    p.t -= dt; p.vy -= 60 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= 0.96; p.vz *= 0.96;
    const g = W.ground(p.x, p.z) + 1; if (p.y < g) { p.y = g; p.vy = Math.abs(p.vy) > 6 ? -p.vy * 0.4 : 0; }
    const d = Math.hypot(hero.x - p.x, hero.z - p.z);
    if (d < 16 && p.t < 19.6) { p.x += (hero.x - p.x) * Math.min(1, 6 * dt); p.z += (hero.z - p.z) * Math.min(1, 6 * dt); }
    if (d < 3.5 && p.t < 19.7) { p.t = 0; if (p.k === 'coin') { save.coins += p.v; tone(1318, 0.04, 'square', 0.03); tone(1760, 0.07, 'square', 0.03, null, 0.04); } else { hero.hp = Math.min(MAXHP(), hero.hp + 2); tone(880, 0.06); tone(1318, 0.1, 'square', 0.035, null, 0.06); } }
  }
  drops = drops.filter(p => p.t > 0);
}
function fxUpdate(dt) {
  for (const p of fx) { p.t -= dt; p.y += p.vy * dt; p.vy -= (p.k === 'puff' || p.k === 'glint' ? 4 : 30) * dt; }
  fx = fx.filter(p => p.t > 0);
  if (fx.length > 300) fx.splice(0, fx.length - 300);
}

// ---------- interazione: cosa c'è davanti all'eroe? ----------
function findTarget() {
  let best = null, bs = -1;
  const consider = (x, z, kind, obj, r = 11) => {
    const dx = x - hero.x, dz = z - hero.z, d = Math.hypot(dx, dz); if (d > r) return;
    const c = d < 4 ? 1 : Math.cos(Math.atan2(dz, dx) - hero.yaw); if (c < 0.3) return;
    const s = c * 2 - d / r; if (s > bs) { bs = s; best = { kind, obj, x, z }; }
  };
  for (const n of npcs) consider(n.x, n.z, 'npc', n, n.id === 'nino' ? 14 : 11);
  for (const c of chests) if (!save.chests[c.id]) consider(c.x, c.z, 'chest', c, 9);
  for (const p of props) {
    if (p.k === 'sign' || p.k === 'statue' || p.k === 'menhir' || p.k === 'well' || p.k === 'snowman' || p.k === 'giant' || p.k === 'anvil' || p.k === 'tent') consider(p.x, p.z, 'prop', p, p.k === 'giant' ? 26 : p.k === 'well' ? 11 : 9);
    if (p.k === 'ore' && !save.oreTaken[p.x + ',' + p.z]) consider(p.x, p.z, 'ore', p, 9);
  }
  for (const d of doors) consider(d.x, d.z, 'door', d, 12);
  return best;
}
function interact(t) {
  if (t.kind === 'npc') { talk(t.obj); tone(660, 0.04); return; }
  if (t.kind === 'chest') { openChest(t.obj); return; }
  if (t.kind === 'door') { say(null, ['UN ANTICO SIGILLO CHIUDE LA PORTA DEL ' + SANCT[t.obj.id] + '. LE RUNE BRILLANO DEBOLMENTE.', '(LO APRIRAI NEL CAPITOLO 2.)']); return; }
  if (t.kind === 'ore') {
    if (save.q.ferro === 1) { save.oreTaken[t.obj.x + ',' + t.obj.z] = 1; save.ore++; puffAt(t.obj.x, t.obj.z, 5); toast('MINERALE DI FERRO ' + Math.min(3, save.ore) + '/3', '#ffb070'); seq([523, 784], 0.06, 0.06); if (save.ore >= 3) { save.q.ferro = 2; toast('TORNA DA BRUNO!', '#ffd23f'); jingle(); } }
    else say(null, ['UNA ROCCIA CON VENATURE DI FERRO. AL FABBRO DEL BORGO FAREBBE COMODO.']);
    return;
  }
  const p = t.obj;
  if (p.k === 'sign') { say(null, [SIGNS[p.x + ',' + p.z] || 'UN CARTELLO ROVINATO DALLA PIOGGIA.']); return; }
  if (p.k === 'well') { say(null, [PROPTXT.well, hero.hp < MAXHP() ? 'TI SENTI RINVIGORITO! TUTTI I CUORI SONO PIENI.' : 'È FRESCA E LIMPIDA.']); hero.hp = MAXHP(); return; }
  if (p.k === 'statue' && Math.hypot(p.x - 2760, p.z - 2960) < 120) { say(null, ['UNA GUARDIA DI PIETRA VEGLIA SULLA ROCCA DA CENTO ANNI.']); return; }
  say(null, [PROPTXT[p.k] || '...']);
}

// ---------- aggiornamento ----------
function playUpdate(dt) {
  save.time += dt;
  if (st === 'play' && !dialog && !shop && !loot && !menu && !mapOpen) heroUpdate(dt);
  else hero.moving = false;
  campsUpdate(dt);
  for (const e of foes) foeUpdate(e, dt);
  npcsUpdate(dt); dropsUpdate(dt); fxUpdate(dt);
  // il drago gira intorno al picco
  dragon.a += dt * 0.07; dragon.x = 2250 + Math.cos(dragon.a) * 430; dragon.z = 760 + Math.sin(dragon.a) * 360; dragon.y += (Math.max(125, W.ground(dragon.x, dragon.z) + 85) + Math.sin(dragon.a * 3) * 15 - dragon.y) * Math.min(1, dt * 0.8); dragon.yaw = dragon.a + Math.PI / 2;
  if (Math.random() < dt * 0.05 && Math.hypot(hero.x - dragon.x, hero.z - dragon.z) < 900) { tone(90, 0.9, 'sawtooth', 0.05, 45); tone(70, 1.1, 'square', 0.03, 40, 0.1); }
  // luci del vulcano
  if (Math.hypot(hero.x - 3350, hero.z - 3150) < 500 && Math.random() < 0.5) { const a = Math.random() * TAU, r = Math.random() * 90; fx.push({ k: 'ember', x: 3350 + Math.cos(a) * r, z: 3150 + Math.sin(a) * r, y: W.ground(3350 + Math.cos(a) * r, 3150 + Math.sin(a) * r) + 2, vy: 18 + Math.random() * 20, t: 1.4, s: 0.6 }); }
  // aria della regione
  placeT -= dt;
  if (placeT <= 0) {
    placeT = 0.35;
    const bw = W.atmo(hero.x, hero.z), tgt = { fog: [0, 0, 0], zen: [0, 0, 0], near: 0, far: 0, wat: [0, 0, 0] };
    for (let b = 0; b < 8; b++) { const w = bw[b], a = ATMO[b]; for (let i = 0; i < 3; i++) { tgt.fog[i] += a[0][i] * w; tgt.zen[i] += a[1][i] * w; tgt.wat[i] += a[4][i] * w; } tgt.near += a[2] * w; tgt.far += a[3] * w; }
    atm.tgt = tgt;
    const name = W.placeName(hero.x, hero.z);
    if (name !== curPlace) { if (name === placeCand) { placeHold += 0.35; if (placeHold > 0.7) { curPlace = name; banner = { t: name, life: 3.2, c: '#ffffff' }; } } else { placeCand = name; placeHold = 0; } }
  }
  if (atm.tgt) { const k = Math.min(1, dt * 1.5), T = atm.tgt; for (let i = 0; i < 3; i++) { atm.fog[i] += (T.fog[i] - atm.fog[i]) * k; atm.zen[i] += (T.zen[i] - atm.zen[i]) * k; atm.wat[i] += (T.wat[i] - atm.wat[i]) * k; } atm.near += (T.near - atm.near) * k; atm.far += (T.far - atm.far) * k; }
  // mappa esplorata
  seenT -= dt;
  if (seenT <= 0) { seenT = 0.5; const ci = Math.floor(hero.x / 64), cj = Math.floor(hero.z / 64); for (let j = cj - 3; j <= cj + 3; j++) for (let i = ci - 3; i <= ci + 3; i++) if (i >= 0 && j >= 0 && i < 64 && j < 64 && (i - ci) ** 2 + (j - cj) ** 2 <= 10) seen[j * 64 + i] = 1; }
  if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
  for (const t of toasts) t.life -= dt; toasts = toasts.filter(t => t.life > 0);
  if (help > 0) help -= dt;
  target = (!dialog && !shop && !loot && !menu && !mapOpen) ? findTarget() : null;
  saveT += dt; if (saveT > 20) { saveT = 0; writeSave(); }
  cam.yaw += angDiff(hero.yaw, cam.yaw) * Math.min(1, 4.2 * dt);
  placeCam(false);
  if (dialog) { const L = dialog.lines[dialog.i]; const tot = L.join(' ').length; if (dialog.ch < tot) { dialog.ch = Math.min(tot, dialog.ch + dt * 70); if (Math.floor(dialog.ch) % 3 === 0) tone(820 + Math.random() * 120, 0.012, 'square', 0.012); } }
  if (loot) loot.t += dt;
}

// ---------- disegno 3D ----------
let VP = null, RX = 1, RZ = 0, planes = null;
function boxVisible(x0, y0, z0, x1, y1, z1) {
  for (const p of planes) { const x = p[0] > 0 ? x1 : x0, y = p[1] > 0 ? y1 : y0, z = p[2] > 0 ? z1 : z0; if (p[0] * x + p[1] * y + p[2] * z + p[3] < 0) return false; }
  return true;
}
function pushBB(x, y, z, r, s, k = 1, fl = 0, tint) {
  if (!r) return;
  const n = pushBB.n; if (n >= 3000) return;
  const w = r.w * s, h = r.h * s; let p = n * 44;
  const tr = tint ? tint[0] : k, tg = tint ? tint[1] : k, tb = tint ? tint[2] : k;
  const C = [-w / 2, 0, r.u0, r.v1, w / 2, 0, r.u1, r.v1, w / 2, h, r.u1, r.v0, -w / 2, h, r.u0, r.v0];
  for (let i = 0; i < 16; i += 4) { dynF[p++] = x; dynF[p++] = y; dynF[p++] = z; dynF[p++] = C[i]; dynF[p++] = C[i + 1]; dynF[p++] = C[i + 2]; dynF[p++] = C[i + 3]; dynF[p++] = tr; dynF[p++] = tg; dynF[p++] = tb; dynF[p++] = fl; }
  pushBB.n = n + 1;
}
pushBB.n = 0;
let shN = 0;
function pushShadow(x, z, r, y) { if (shN >= 400) return; const gy = (y !== undefined ? y : W.ground(x, z)) + 0.25; let p = shN * 20; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { shF[p++] = x + a * r; shF[p++] = gy; shF[p++] = z + b * r * 0.8; shF[p++] = a; shF[p++] = b; } shN++; }
const dirOf = (x, z, yaw) => ((Math.round(angDiff(Math.atan2(z - cam.z, x - cam.x), yaw) / (TAU / 8)) % 8) + 8) % 8;
function render3D() {
  const P = G.P;
  gl.viewport(0, 0, Wr, Hr);
  gl.clearColor(atm.fog[0], atm.fog[1], atm.fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const proj = SG.M4.persp(FOVY, Wr / Hr, 1.2, Math.max(900, atm.far + 200)), view = SG.M4.look([cam.x, cam.y, cam.z], [cam.tx, cam.ty, cam.tz], [0, 1, 0]);
  VP = SG.M4.mul(proj, view);
  const m = VP, row = i => [m[i], m[4 + i], m[8 + i], m[12 + i]], r0 = row(0), r1 = row(1), r2 = row(2), r3 = row(3);
  planes = [[1, r0], [-1, r0], [1, r1], [-1, r1], [-1, r2]].map(([s, r]) => [r3[0] + s * r[0], r3[1] + s * r[1], r3[2] + s * r[2], r3[3] + s * r[3]]);
  const yaw = Math.atan2(cam.tz - cam.z, cam.tx - cam.x), pitch = Math.atan2(cam.ty - cam.y, Math.hypot(cam.tx - cam.x, cam.tz - cam.z));
  RX = -Math.sin(yaw); RZ = Math.cos(yaw);
  const light = 1, fogN = atm.near, fogF = atm.far, fogC = atm.fog;
  // cielo
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
  let p = P.sky; gl.useProgram(p.p); gl.bindBuffer(gl.ARRAY_BUFFER, G.full); G.attribs(p, [['aP', 2]]);
  const foc = (Hr / 2) / Math.tan(FOVY / 2);
  gl.uniform2f(p.u.uRes, Wr, Hr); gl.uniform1f(p.u.uHor, Hr / 2 - foc * Math.tan(pitch)); gl.uniform1f(p.u.uYaw, yaw); gl.uniform1f(p.u.uFovX, 2 * Math.atan(Math.tan(FOVY / 2) * Wr / Hr));
  gl.uniform1f(p.u.uPanoH, Hr * 0.3); gl.uniform1f(p.u.uTime, time); gl.uniform3fv(p.u.uZen, atm.zen); gl.uniform3fv(p.u.uHorC, fogC);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, PANO); gl.uniform1i(p.u.uPano, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
  // terreno
  p = P.terrain; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform1f(p.u.uWS, W.WS);
  gl.uniform3fv(p.u.uFogC, fogC); gl.uniform1f(p.u.uLight, light); gl.uniform1f(p.u.uTime, time);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, W.tex.col); gl.uniform1i(p.u.uCol, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, W.tex.mat); gl.uniform1i(p.u.uMat, 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, DET); gl.uniform1i(p.u.uDet, 2);
  const far = fogF + 60, vis = [];
  for (const c of W.chunks) {
    const d = Math.hypot(c.cx - cam.x, c.cz - cam.z);
    if (d > far + W.CS * 0.75) continue;
    if (!boxVisible(c.cx - W.CS / 2, c.lo - 2, c.cz - W.CS / 2, c.cx + W.CS / 2, c.hi + 30, c.cz + W.CS / 2)) continue;
    vis.push([c, d]);
    const L = W.lod[d < 520 ? 0 : d < 950 ? 1 : 2];
    gl.bindBuffer(gl.ARRAY_BUFFER, c.buf); G.attribs(p, [['aPos', 3], ['aSh', 1]]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.buf); gl.drawElements(gl.TRIANGLES, L.n, gl.UNSIGNED_SHORT, 0);
  }
  // edifici
  p = P.mesh; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform1f(p.u.uLight, light); gl.uniform2f(p.u.uTiles, 8, 8);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TILES); gl.uniform1i(p.u.uTex, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, W.meshBuf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  for (let q0 = 0; q0 < W.meshQuads; q0 += 16000) { G.attribs(p, [['aPos', 3], ['aT', 2], ['aL', 2], ['aSh', 1]], q0 * 4 * 32); gl.drawElements(gl.TRIANGLES, Math.min(16000, W.meshQuads - q0) * 6, gl.UNSIGNED_SHORT, 0); }
  // ombre
  shN = 0;
  if (hero && st !== 'title') pushShadow(hero.x, hero.z, 2.6, hero.y);
  for (const e of foes) if (e.st !== 'dead' && near(e.x, e.z, 280)) pushShadow(e.x, e.z, FOE[e.type].r * 0.8, e.y - (FOE[e.type].fly || 0));
  for (const n of npcs) if (near(n.x, n.z, 280)) pushShadow(n.x, n.z, n.id === 'biscotto' ? 1.5 : 2.4);
  if (shN) {
    p = P.shadow; gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP, false, VP);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4);
    gl.bindBuffer(gl.ARRAY_BUFFER, shBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, shF.subarray(0, shN * 20)); G.attribs(p, [['aPos', 3], ['aUV', 2]]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, shN * 6, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.depthMask(true); gl.disable(gl.BLEND);
  }
  // oggetti fissi (alberi, rocce, fiori)
  p = P.bb; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3f(p.u.uR, RX, 0, RZ); gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform1f(p.u.uLight, light);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.uniform1i(p.u.uTex, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx);
  gl.uniform1f(p.u.uNear, 17);
  for (const [c, d] of vis) {
    if (c.big) { gl.bindBuffer(gl.ARRAY_BUFFER, c.big); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, c.nb * 6, gl.UNSIGNED_SHORT, 0); }
    if (c.small && d < 300) { gl.bindBuffer(gl.ARRAY_BUFFER, c.small); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]); gl.drawElements(gl.TRIANGLES, c.ns * 6, gl.UNSIGNED_SHORT, 0); }
  }
  // personaggi, forzieri, effetti
  pushBB.n = 0;
  buildDynamic();
  if (pushBB.n) {
    gl.uniform1f(p.u.uNear, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynF.subarray(0, pushBB.n * 44)); G.attribs(p, [['aC', 3], ['aO', 2], ['aUV', 2], ['aK', 4]]);
    gl.drawElements(gl.TRIANGLES, pushBB.n * 6, gl.UNSIGNED_SHORT, 0);
  }
  // acqua
  p = P.water; gl.useProgram(p.p);
  gl.uniformMatrix4fv(p.u.uVP, false, VP); gl.uniform1f(p.u.uY, W.WL); gl.uniform3f(p.u.uCam, cam.x, cam.y, cam.z); gl.uniform3fv(p.u.uFogC, fogC); gl.uniform3fv(p.u.uWat, atm.wat);
  gl.uniform2f(p.u.uFog, fogN, fogF); gl.uniform1f(p.u.uLight, light); gl.uniform1f(p.u.uTime, time);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, DET); gl.uniform1i(p.u.uDet, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
  gl.bindBuffer(gl.ARRAY_BUFFER, W.waterBuf); G.attribs(p, [['aP', 2]]); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, G.quadIdx); gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  gl.depthMask(true); gl.disable(gl.BLEND);
}
const near = (x, z, r) => (x - cam.x) ** 2 + (z - cam.z) ** 2 < r * r;
function buildDynamic() {
  const R = 0.2;
  // eroe
  if (hero && (st === 'play' || st === 'dead')) {
    const h = hero, anim = h.atk > 0.27 ? 3 : h.atk > 0 ? 4 : h.moving ? 1 + (Math.floor(h.walk / 5) % 2) : 0;
    if (!(h.inv > 0 && Math.floor(time * 16) % 2) || h.dead) pushBB(h.x, h.y - 0.5, h.z, heroRects[anim][dirOf(h.x, h.z, h.yaw)], R, 1, h.flash > 0 ? 0.7 : 0);
  }
  for (const n of npcs) {
    if (!near(n.x, n.z, 520)) continue;
    const sh = CHR[n.id], a = n.moving ? 1 + (Math.floor(n.walk / 4) % (sh.length - 1)) : 0, sc = n.id === 'biscotto' ? 0.2 : 0.2;
    const glow = n.id === 'spirito' ? 1.1 + Math.sin(time * 3) * 0.1 : 1;
    pushBB(n.x, W.ground(n.x, n.z) - 0.5 + (n.id === 'spirito' ? 1.5 + Math.sin(time * 2) : 0), n.z, sh[a][dirOf(n.x, n.z, n.yaw)], sc, glow);
  }
  const opened = id => save && save.chests[id], taken = p => save && save.oreTaken[p.x + ',' + p.z];
  for (const c of chests) { if (!near(c.x, c.z, 420)) continue; pushBB(c.x, W.ground(c.x, c.z) - 0.3, c.z, CHR.chest[c.r][opened(c.id) ? 1 : 0][dirOf(c.x, c.z, c.yaw)], 0.24); if (!opened(c.id) && c.r >= 2 && Math.floor(time * 3 + c.x) % 4 === 0) pushBB(c.x + Math.sin(time * 5) * 2, W.ground(c.x, c.z) + 6, c.z, SPR.glint, 0.3); }
  for (const e of foes) {
    if (!near(e.x, e.z, 520)) continue;
    const sh = CHR[e.type]; let a = 0;
    if (e.type === 'slime') a = (e.hop > 0.55 || e.st === 'wind') ? 1 : 0;
    else if (e.type === 'bat') a = Math.floor(time * 10 + e.hop * 5) % 2;
    else if (e.type === 'wolf' || e.type === 'icewolf') a = e.st === 'wind' ? 3 : e.moving ? 1 + (Math.floor(e.walk / 4) % 2) : 0;
    else a = e.st === 'wind' ? (e.t > 0.2 ? 3 : 4) : e.moving ? 1 + (Math.floor(e.walk / 4) % 2) : 0;
    const k = e.st === 'dead' ? Math.max(0, e.fade * 2) : 1;
    if (e.st === 'dead' && Math.floor(time * 20) % 2) continue;
    pushBB(e.x, e.y - 0.4, e.z, sh[a][dirOf(e.x, e.z, e.yaw)], e.type === 'wolf' || e.type === 'icewolf' ? 0.22 : 0.2, k, e.flash > 0 ? 0.8 : e.st === 'wind' ? 0.25 : 0);
  }
  for (const p of props) if (p.k === 'ore' && !taken(p) && near(p.x, p.z, 420)) { pushBB(p.x, W.ground(p.x, p.z) - 0.4, p.z, SPR.ore.r[0], SPR.ore.s); if (near(p.x, p.z, 200) && Math.floor(time * 2.5 + p.x) % 3 === 0) pushBB(p.x, W.ground(p.x, p.z) + 4, p.z, SPR.glint, 0.3); }
  for (const p of props) if ((p.k === 'torch' || p.k === 'campfire') && near(p.x, p.z, 300)) pushBB(p.x, W.ground(p.x, p.z) + (p.k === 'torch' ? 9.2 : 1.2), p.z, SPR.flame[Math.floor(time * 8 + p.x) % 2], p.k === 'torch' ? 0.32 : 0.36, 1.2);
  for (const d of doors) if (near(d.x, d.z, 300)) pushBB(d.x, W.ground(d.x, d.z) + 10 + Math.sin(time * 2) * 0.6, d.z, SPR.rune, 0.45, 1.2 + Math.sin(time * 3) * 0.2);
  for (const p of drops) pushBB(p.x, p.y, p.z, p.k === 'coin' ? SPR.coin : SPR.heart, 0.4, 1.15);
  for (const p of fx) pushBB(p.x, p.y, p.z, SPR[p.k], (p.s || 0.3) * (p.k === 'puff' ? 0.6 + p.t : 1), 1.1);
  // il drago
  if (near(dragon.x, dragon.z, 1600)) pushBB(dragon.x, dragon.y, dragon.z, CHR.dragon[Math.floor(time * 2.6) % 2][dirOf(dragon.x, dragon.z, dragon.yaw)], 0.8, 0.95);
}

// ---------- interfaccia (disegnata a bassa risoluzione sopra il 3D) ----------
const T = (s, x, y, c, k, al, sh) => A.text(hg, s, x, y, c || '#ffffff', sh === undefined ? '#0b0a12' : sh, k || 1, al || 'left');
function panel(x, y, w, h, edge = '#ffd23f') { hg.fillStyle = 'rgba(10,12,22,.9)'; hg.fillRect(x, y, w, h); hg.fillStyle = edge; hg.fillRect(x, y, w, 1); hg.fillRect(x, y + h - 1, w, 1); hg.fillRect(x, y, 1, h); hg.fillRect(x + w - 1, y, 1, h); hg.fillStyle = 'rgba(255,255,255,.08)'; hg.fillRect(x + 1, y + 1, w - 2, 1); }
const dialogW = () => Math.max(170, Math.min(320, Wr - insetL - insetR - 8));
function drawHearts(x, y) {
  const mx = MAXHP(); for (let i = 0; i < mx / 2; i++) { const v = hero.hp - i * 2, img = v >= 2 ? HEARTS[0] : v === 1 ? HEARTS[1] : HEARTS[2]; hg.drawImage(img, x + (i % 10) * 8, y + Math.floor(i / 10) * 8); }
}
function compass() {
  const cx = Math.round(Wr / 2), w = Math.min(150, Wr * 0.36), y = 4, yaw = hero.yaw;
  hg.fillStyle = 'rgba(10,12,22,.55)'; hg.fillRect(cx - w / 2, y, w, 11);
  const mark = (a, s, c, k = 1) => { const d = angDiff(a, yaw); if (Math.abs(d) > 1.35) return; const x = cx + d / 1.35 * (w / 2 - 4); T(s, x, y + 2, c, k, 'center'); };
  mark(-Math.PI / 2, 'N', '#ff6a5a'); mark(0, 'E', '#e6e9f2'); mark(Math.PI / 2, 'S', '#e6e9f2'); mark(Math.PI, 'O', '#e6e9f2');
  for (const a of [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4]) { const d = angDiff(a, yaw); if (Math.abs(d) < 1.35) { hg.fillStyle = '#8a96aa'; hg.fillRect(Math.round(cx + d / 1.35 * (w / 2 - 4)), y + 5, 1, 2); } }
  const q = curTrack(), tg = q ? questTarget(q) : null;
  if (tg) {
    const a = Math.atan2(tg[1] - hero.z, tg[0] - hero.x), d = angDiff(a, yaw), x = Math.round(cx + Math.max(-1, Math.min(1, d / 1.35)) * (w / 2 - 4));
    hg.fillStyle = '#0b0a12'; hg.fillRect(x - 3, y + 1, 7, 9); hg.fillStyle = '#ffd23f'; hg.fillRect(x - 1, y + 2, 3, 7); hg.fillRect(x - 2, y + 3, 5, 5);
    const dist = Math.hypot(tg[0] - hero.x, tg[1] - hero.z);
    if (dist > 40) T(Math.round(dist / 10) * 10 + ' M', cx, y + 13, '#ffd23f', 1, 'center');
  }
  hg.fillStyle = '#ffffff'; hg.fillRect(cx, y + 9, 1, 2);
}
function drawHUD() {
  hg.clearRect(0, 0, Wr, Hr);
  if (st === 'loading' || st === 'boot') return drawLoading();
  if (st === 'error') { hg.fillStyle = '#0b0d12'; hg.fillRect(0, 0, Wr, Hr); A.wrap(errMsg, Wr - 40).forEach((l, i) => T(l, Wr / 2, Hr / 2 - 20 + i * 10, '#ff8f8f', 1, 'center')); return; }
  if (st === 'title') return drawTitle();
  if (st === 'intro') return drawIntro();
  // indicatori
  drawHearts(6, 5);
  const hy = 6 + Math.ceil(MAXHP() / 2 / 10) * 8;
  hg.drawImage(ICOIN, 5, hy); T(String(save.coins), 19, hy + 3, '#ffd23f');
  hg.drawImage(IPOT, 5, hy + 12); T(String(save.pot), 19, hy + 15, '#ffb0c0');
  compass();
  toasts.forEach((t, i) => T(t.t, 6, hy + 30 + i * 10, t.c));
  if (banner) {
    const a = Math.min(1, banner.life * 2, (3.2 - banner.life) * 3 + 0.2), y = Math.round(Hr * 0.24);
    hg.globalAlpha = Math.max(0, Math.min(1, a));
    const w = A.textW(banner.t, 2) + 24; hg.fillStyle = 'rgba(10,12,22,.5)'; hg.fillRect(Wr / 2 - w / 2, y - 5, w, banner.s ? 32 : 24);
    T(banner.t, Wr / 2, y, banner.c, 2, 'center'); hg.fillStyle = banner.c; hg.fillRect(Wr / 2 - w / 2 + 8, y + 17, w - 16, 1);
    if (banner.s) T(banner.s, Wr / 2, y + 20, '#e6e9f2', 1, 'center');
    hg.globalAlpha = 1;
  }
  if (target && st === 'play') {
    const lbl = { npc: 'PARLA', chest: 'APRI', door: 'ESAMINA', ore: 'RACCOGLI', prop: target.obj.k === 'sign' ? 'LEGGI' : target.obj.k === 'well' ? 'BEVI' : 'GUARDA' }[target.kind];
    const s = 'A: ' + lbl, w = A.textW(s) + 10; panel(Math.round(Wr / 2 - w / 2), Hr - 22, w, 13, '#8a96aa'); T(s, Wr / 2, Hr - 19, '#ffffff', 1, 'center');
  }
  if (help > 0) {
    const L = ['CROCE: CAMMINA E GIRA   B: CORRI', 'A: PARLA, APRI, COLPISCI', 'START: MENU   SELECT: MAPPA'], w = 190;
    panel(Wr / 2 - w / 2, Math.round(Hr * 0.3), w, 38, '#8a96aa'); L.forEach((l, i) => T(l, Wr / 2, Math.round(Hr * 0.3) + 5 + i * 10, '#e6e9f2', 1, 'center'));
  }
  if (lavaAt(hero.x, hero.z) && Math.floor(time * 6) % 2) { hg.fillStyle = 'rgba(255,80,20,.18)'; hg.fillRect(0, 0, Wr, Hr); }
  if (hero.flash > 0) { hg.fillStyle = 'rgba(255,40,40,' + (hero.flash * 0.8).toFixed(2) + ')'; hg.fillRect(0, 0, Wr, Hr); }
  if (dialog) drawDialog();
  if (shop) drawShop();
  if (loot) drawLoot();
  if (mapOpen) drawMap();
  if (menu) drawMenu();
  if (st === 'dead') drawDeath();
}
function drawDialog() {
  const w = dialogW(), x = Math.round(Wr / 2 - w / 2), lines = dialog.lines[dialog.i], h = 14 + lines.length * 9 + (dialog.name ? 6 : 0), y = Hr - h - 6;
  panel(x, y, w, h);
  let yy = y + 5;
  if (dialog.name) { const nw = A.textW(dialog.name) + 8; panel(x + 6, y - 6, nw, 11, '#ffd23f'); T(dialog.name, x + 10, y - 4, '#ffd23f'); yy += 5; }
  let left = Math.floor(dialog.ch);
  for (const l of lines) { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; T(s, x + 8, yy, '#ffffff'); yy += 9; }
  const tot = lines.join(' ').length;
  if (dialog.ch >= tot && Math.floor(time * 3) % 2) { hg.fillStyle = '#ffd23f'; hg.fillRect(x + w - 10, y + h - 7, 5, 2); hg.fillRect(x + w - 9, y + h - 5, 3, 1); }
}
function drawLoot() {
  const w = Math.min(260, dialogW()), h = 66, x = Math.round(Wr / 2 - w / 2), y = Math.round(Hr / 2 - h / 2) - 6, it = IT[loot.id];
  const r = it ? it.r : 0; panel(x, y, w, h, RAR[r]);
  T('HAI TROVATO', Wr / 2, y + 5, '#c9d3e6', 1, 'center');
  const ic = loot.id === 'monete' ? ICOIN : itemIcon(loot.id), name = loot.txt || it.n, nw = A.textW(name, 1) + 16;
  if (ic) hg.drawImage(ic, Math.round(Wr / 2 - nw / 2), y + 15);
  T(name, Math.round(Wr / 2 - nw / 2) + 16, y + 17, RAR[r]);
  if (it && it.r) T(RARN[r], Wr / 2, y + 28, RAR[r], 1, 'center');
  if (it && loot.id !== 'pozione') { const st2 = [it.att ? 'ATT ' + it.att : '', it.dif ? 'DIF ' + it.dif : '', it.hp ? '+' + it.hp / 2 + ' CUORE' : '', it.vel ? '+' + Math.round(it.vel * 100) + '% VEL' : ''].filter(Boolean).join('  '); const L = A.wrap(it.d, w - 16); T(L[0], Wr / 2, y + 37, '#e6e9f2', 1, 'center'); if (st2) T(st2, Wr / 2, y + 46, '#9af0b0', 1, 'center'); }
  if (loot.note) T(loot.note, Wr / 2, y + 55, '#ffd23f', 1, 'center');
  if (loot.t > 0.6 && Math.floor(time * 2.5) % 2) T('A', x + w - 10, y + h - 9, '#ffffff');
  // un po' di scintille per i leggendari
  if (r === 3) for (let i = 0; i < 8; i++) { const a = time * 1.3 + i * TAU / 8; hg.fillStyle = i % 2 ? '#ffb02e' : '#fff4b0'; hg.fillRect(Math.round(Wr / 2 + Math.cos(a) * (w / 2 + 4)), Math.round(y + h / 2 + Math.sin(a) * (h / 2 + 4)), 2, 2); }
}
function drawShop() {
  const w = Math.min(260, dialogW()), h = 20 + (SHOP.length + 1) * 12 + 16, x = Math.round(Wr / 2 - w / 2), y = Math.round(Hr / 2 - h / 2);
  panel(x, y, w, h); T('NINO IL MERCANTE', x + 8, y + 5, '#ffd23f'); hg.drawImage(ICOIN, x + w - 50, y + 3); T(String(save.coins), x + w - 36, y + 6, '#ffd23f');
  const rows = SHOP.concat([['esci', 0]]);
  rows.forEach(([id, price], i) => {
    const yy = y + 20 + i * 12, on = i === shop.sel, owned = id !== 'pozione' && id !== 'esci' && (id === 'mappa' ? save.flags.mappa : save.inv.includes(id));
    if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 2, w - 8, 11); }
    if (id === 'esci') { T('ESCI', x + 22, yy, on ? '#ffffff' : '#8a96aa'); return; }
    hg.drawImage(itemIcon(id), x + 6, yy - 3);
    T(IT[id].n, x + 22, yy, owned ? '#5a6478' : on ? '#ffffff' : '#c9d3e6');
    T(owned ? 'PRESO' : price + '', x + w - 10, yy, owned ? '#5a6478' : save.coins >= price ? '#ffd23f' : '#ff8f8f', 1, 'right');
  });
  const sel = rows[shop.sel][0]; if (sel !== 'esci') T(IT[sel].d, Wr / 2, y + h - 11, '#a9c6e3', 1, 'center');
}
function drawMap() {
  const S = Math.min(Hr - 26, Wr - insetL - insetR - 10, 256), x0 = Math.round(Wr / 2 - S / 2), y0 = 16, k = S / W.WS;
  hg.fillStyle = 'rgba(8,10,16,.88)'; hg.fillRect(0, 0, Wr, Hr);
  T('TERRE DI LUMEN', Wr / 2, 5, '#ffd23f', 1, 'center');
  hg.imageSmoothingEnabled = false; hg.drawImage(W.mapImg, x0, y0, S, S);
  const cs = S / 64;
  for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) if (!seen[j * 64 + i]) { hg.fillStyle = (i + j) % 2 ? '#2a2638' : '#24202f'; hg.fillRect(Math.floor(x0 + i * cs), Math.floor(y0 + j * cs), Math.ceil(cs), Math.ceil(cs)); }
  const dot = (x, z, c, s = 2) => { hg.fillStyle = '#0b0a12'; hg.fillRect(Math.round(x0 + x * k) - s, Math.round(y0 + z * k) - s, s * 2 + 1, s * 2 + 1); hg.fillStyle = c; hg.fillRect(Math.round(x0 + x * k) - s + 1, Math.round(y0 + z * k) - s + 1, s * 2 - 1, s * 2 - 1); };
  const isSeen = (x, z) => seen[Math.min(63, Math.floor(z / 64)) * 64 + Math.min(63, Math.floor(x / 64))];
  dot(2000, 2650, '#ffffff'); dot(2760, 2960, '#c9d3e6');
  for (const d of doors) if (isSeen(d.x, d.z)) dot(d.x, d.z, '#4ae0e8');
  if (save.flags.mappa) for (const c of chests) if (c.r === 3 && !save.chests[c.id] && Math.floor(time * 3) % 2) dot(c.x, c.z, '#ffb02e', 2);
  const q = curTrack(), tg = q ? questTarget(q) : null; if (tg && Math.floor(time * 4) % 2) dot(tg[0], tg[1], '#ffd23f', 3);
  // freccia dell'eroe
  const hx = x0 + hero.x * k, hz = y0 + hero.z * k;
  for (let i = -1; i <= 5; i++) { const px = hx + Math.cos(hero.yaw) * i, pz = hz + Math.sin(hero.yaw) * i; hg.fillStyle = i > 3 ? '#ff4a3a' : '#ffffff'; hg.fillRect(Math.round(px) - 1, Math.round(pz) - 1, 3, 3); }
  let n = 0, tot = 0; for (let i = 0; i < seen.length; i++) if (LAND[i]) { tot++; n += seen[i]; }
  T(curPlace || '', x0, y0 + S + 3, '#e6e9f2'); T('ESPLORATO ' + Math.min(100, Math.round(n / Math.max(1, tot) * 100)) + '%', x0 + S, y0 + S + 3, '#9af0b0', 1, 'right');
  T('SELECT/B: CHIUDI', Wr / 2, Hr - 9 < y0 + S + 3 ? Hr - 1 : y0 + S + 3, '#5a6478', 1, 'center', null);
}
const TABS = ['EROE', 'BORSA', 'MISSIONI', 'OPZIONI'];
function menuRows() {
  if (menu.tab === 0) return menu.pick ? save.inv.filter(id => IT[id].t === menu.pick).concat(['-']) : SLOTS.map(s => s[0]);
  if (menu.tab === 1) return ['pozione'].concat(save.flags.mappa ? ['mappa'] : []);
  if (menu.tab === 2) return ['main', 'ferro', 'gatto', 'melme'].filter(q => q === 'main' || save.q[q] > 0);
  return ['vol', 'vib', 'salva', 'esci'];
}
function drawMenu() {
  hg.fillStyle = 'rgba(8,10,16,.82)'; hg.fillRect(0, 0, Wr, Hr);
  const w = Math.min(300, Wr - insetL - insetR - 4), x = Math.round(Wr / 2 - w / 2), y = 6, h = Hr - 12;
  panel(x, y, w, h);
  let tx = x + 8; TABS.forEach((t, i) => { const on = i === menu.tab, tw = A.textW(t) + 8; if (on) { hg.fillStyle = '#ffd23f'; hg.fillRect(tx - 2, y + 4, tw, 11); } T(t, tx + 2, y + 6, on ? '#10121c' : '#8a96aa', 1, 'left', on ? null : undefined); tx += tw + 4; });
  T('< >', x + w - 8, y + 6, '#5a6478', 1, 'right');
  const rows = menuRows(), top = y + 22;
  if (menu.tab === 0) {
    T('ATT ' + ATT() + '   DIF ' + DIF() + '   CUORI ' + MAXHP() / 2 + '   VEL ' + Math.round(VEL() * 100) + '%', x + 8, top, '#9af0b0');
    if (!menu.pick) SLOTS.forEach(([k, n], i) => {
      const yy = top + 13 + i * 14, on = i === menu.sel, id = save.eq[k], it = id ? IT[id] : null;
      if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); }
      T(n, x + 8, yy, '#8a96aa'); if (it) { hg.drawImage(itemIcon(id), x + 78, yy - 3); T(it.n, x + 94, yy, RAR[it.r]); } else T('-', x + 94, yy, '#5a6478');
    });
    else { T('SCEGLI: ' + SLOTS.find(s => s[0] === menu.pick)[1], x + 8, top + 12, '#ffd23f');
      rows.forEach((id, i) => { const yy = top + 25 + i * 12, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 12); } if (id === '-') { T('TOGLI', x + 26, yy, on ? '#fff' : '#8a96aa'); return; } const it = IT[id]; hg.drawImage(itemIcon(id), x + 8, yy - 3); T(it.n + (save.eq[menu.pick] === id ? '  (IN USO)' : ''), x + 26, yy, RAR[it.r]); }); }
    const sel = menu.pick ? rows[menu.sel] : save.eq[rows[menu.sel]];
    if (sel && sel !== '-' && IT[sel]) { const it = IT[sel], s = [it.att ? 'ATT ' + it.att : '', it.dif ? 'DIF ' + it.dif : '', it.hp ? '+' + it.hp / 2 + ' CUORE' : '', it.vel ? '+' + Math.round(it.vel * 100) + '% VEL' : ''].filter(Boolean).join('  '); A.wrap(it.d, w - 16).slice(0, 2).forEach((l, i) => T(l, x + 8, y + h - 30 + i * 9, '#a9c6e3')); if (s) T(s, x + w - 8, y + h - 12, '#9af0b0', 1, 'right'); }
    T(menu.pick ? 'A: USA   B: INDIETRO' : 'A: CAMBIA', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else if (menu.tab === 1) {
    rows.forEach((id, i) => { const yy = top + 4 + i * 14, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); } hg.drawImage(itemIcon(id), x + 8, yy - 3); T(id === 'pozione' ? 'POZIONI  x' + save.pot : IT[id].n, x + 26, yy, '#ffffff'); });
    let yy = top + 8 + rows.length * 14;
    hg.drawImage(ICOIN, x + 8, yy - 3); T('MONETE  ' + save.coins, x + 26, yy, '#ffd23f'); yy += 14;
    if (save.q.ferro === 1 || save.q.ferro === 2) { hg.drawImage(IORE, x + 8, yy - 3); T('MINERALE DI FERRO  ' + Math.min(3, save.ore) + '/3', x + 26, yy, '#ffb070'); yy += 14; }
    T('CUORI DI CRISTALLO TROVATI: ' + save.hearts, x + 8, yy + 2, '#ff8aa0');
    T(rows[menu.sel] === 'pozione' ? 'A: BEVI UNA POZIONE (+3 CUORI)' : rows[menu.sel] === 'mappa' ? 'I FORZIERI LEGGENDARI SONO SULLA MAPPA (SELECT)' : '', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else if (menu.tab === 2) {
    rows.forEach((q, i) => { const yy = top + 2 + i * 26, on = i === menu.sel, done = questDone(q); if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 24); } T((curTrack() === q ? '> ' : '') + QN[q], x + 8, yy, done ? '#5a6478' : q === 'main' ? '#ffd23f' : '#ffffff'); A.wrap(questLine(q), w - 20).slice(0, 2).forEach((l, k) => T(l, x + 14, yy + 9 + k * 8, done ? '#5a6478' : '#a9c6e3', 1, 'left', null)); });
    T('A: SEGUI QUESTA MISSIONE', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  } else {
    const V = ['SPENTO', 'MEDIO', 'ALTO'];
    const L = { vol: 'VOLUME: ' + V[volLevel], vib: 'VIBRAZIONE: ' + (save.opt.vib ? 'SÌ' : 'NO'), salva: 'SALVA ORA', esci: 'TORNA AL MENU DI PIXEL BOX' };
    rows.forEach((k, i) => { const yy = top + 4 + i * 14, on = i === menu.sel; if (on) { hg.fillStyle = '#26384d'; hg.fillRect(x + 4, yy - 3, w - 8, 13); } T(L[k], x + 10, yy, on ? '#ffffff' : '#c9d3e6'); });
    const hm = Math.floor(save.time / 3600), mm = Math.floor(save.time / 60) % 60;
    T('TEMPO DI GIOCO ' + hm + ':' + String(mm).padStart(2, '0'), x + 8, y + h - 24, '#8a96aa', 1, 'left', null);
    T('IL GIOCO SI SALVA DA SOLO', x + 8, y + h - 12, '#5a6478', 1, 'left', null);
  }
}
function drawDeath() {
  death += 1 / 60;
  hg.fillStyle = 'rgba(30,0,8,' + Math.min(0.75, death).toFixed(2) + ')'; hg.fillRect(0, 0, Wr, Hr);
  if (death > 0.6) { T('SEI CADUTO...', Wr / 2, Hr / 2 - 22, '#ff6a6a', 2, 'center'); T('TI RISVEGLI AL POZZO DEL BORGO.', Wr / 2, Hr / 2, '#e6e9f2', 1, 'center'); if (Math.floor(time * 2.5) % 2) T('A: CONTINUA', Wr / 2, Hr / 2 + 16, '#ffd23f', 1, 'center'); }
}
function drawLoading() {
  hg.fillStyle = '#0b0d14'; hg.fillRect(0, 0, Wr, Hr);
  T('PIXEL SAGA', Wr / 2, Hr / 2 - 34, '#ffd23f', 3, 'center', '#7a2a10');
  T('LE TERRE DI LUMEN', Wr / 2, Hr / 2 - 8, '#a9c6e3', 1, 'center');
  const w = Math.min(220, Wr - 80); hg.fillStyle = '#26304a'; hg.fillRect(Wr / 2 - w / 2, Hr / 2 + 10, w, 6); hg.fillStyle = '#4ade80'; hg.fillRect(Wr / 2 - w / 2, Hr / 2 + 10, Math.round(w * prog), 6);
  T(progMsg, Wr / 2, Hr / 2 + 22, '#8a96aa', 1, 'center');
  T('COSTRUISCO IL MONDO: CI VUOLE QUALCHE SECONDO', Wr / 2, Hr - 14, '#4a5468', 1, 'center', null);
}
function drawTitle() {
  title.t += 1 / 60;
  hg.fillStyle = 'rgba(8,10,20,.25)'; hg.fillRect(0, 0, Wr, Hr);
  T('PIXEL SAGA', Wr / 2, Math.round(Hr * 0.16), '#ffd23f', 4, 'center', '#7a2a10');
  T('LE TERRE DI LUMEN', Wr / 2, Math.round(Hr * 0.16) + 34, '#ffffff', 1, 'center');
  const opts = title.opts;
  opts.forEach((o, i) => { const y = Math.round(Hr * 0.62) + i * 14, on = i === title.sel; if (on) { const w = A.textW(o) + 20; hg.fillStyle = 'rgba(10,12,22,.7)'; hg.fillRect(Wr / 2 - w / 2, y - 3, w, 13); } T((on ? '> ' : '') + o + (on ? ' <' : ''), Wr / 2, y, on ? '#ffffff' : '#a9b6cc', 1, 'center'); });
  if (title.confirm) { panel(Wr / 2 - 110, Hr / 2 - 22, 220, 44, '#ff8f8f'); T('CANCELLARE IL SALVATAGGIO?', Wr / 2, Hr / 2 - 14, '#ff8f8f', 1, 'center'); T('A: SÌ, RICOMINCIA    B: NO', Wr / 2, Hr / 2 + 4, '#ffffff', 1, 'center'); }
  T('CAPITOLO 1   -   A: SCEGLI', Wr / 2, Hr - 12, '#c9d3e6', 1, 'center');
}
const INTRO = ["TANTO TEMPO FA, CINQUE PIETRE DELL'ALBA PORTAVANO LUCE E PACE ALLE TERRE DI LUMEN.", 'UNA NOTTE LE PIETRE SPARIRONO. LE CREATURE SI FECERO INQUIETE E SUL PICCO A NORD SI SVEGLIÒ IL DRAGO.', 'TU SEI APPENA ARRIVATO A BORGO AURORA. NESSUNO TI CONOSCE ANCORA... MA LA TUA STORIA COMINCIA ADESSO.'];
function drawIntro() {
  hg.fillStyle = '#07080e'; hg.fillRect(0, 0, Wr, Hr);
  const L = A.wrap(INTRO[intro - 1], Math.min(300, Wr - 60));
  L.forEach((l, i) => T(l, Wr / 2, Hr / 2 - L.length * 5 + i * 11, '#e6e9f2', 1, 'center'));
  if (Math.floor(time * 2.5) % 2) T('A', Wr / 2, Hr - 20, '#ffd23f', 1, 'center');
}

// ---------- tasti ----------
function onKey(name) {
  if (st === 'title') {
    if (title.confirm) { if (name === 'a') { title.confirm = false; startGame(true); } else if (name === 'b') title.confirm = false; return; }
    if (name === 'up' || name === 'down') { title.sel = (title.sel + 1) % title.opts.length; tone(1318, 0.03); }
    else if (name === 'a' || name === 'start') {
      tone(1046, 0.06);
      if (title.opts[title.sel].startsWith('CONTINUA')) { save = loadSave(); startGame(false); }
      else if (loadSave()) title.confirm = true; else startGame(true);
    }
    return;
  }
  if (st === 'intro') { if (name === 'a' || name === 'start' || name === 'b') { tone(880, 0.04); intro++; if (intro > INTRO.length) { st = 'play'; intro = 0; toast("PARLA CON L'ANZIANA MIRTA (A)", '#ffd23f'); } } return; }
  if (st === 'dead') { if (name === 'a' && death > 1) { hero.dead = false; hero.hp = MAXHP(); hero.x = 2005; hero.z = 2690; hero.y = W.ground(hero.x, hero.z); hero.yaw = -Math.PI / 2; save.coins = Math.floor(save.coins * 0.8); st = 'play'; cam.yaw = hero.yaw; placeCam(true); writeSave(); } return; }
  if (st !== 'play') return;
  if (loot) { if ((name === 'a' || name === 'b') && loot.t > 0.5) { loot = null; tone(880, 0.04); } return; }
  if (dialog) {
    if (name === 'a' || name === 'b') {
      const tot = dialog.lines[dialog.i].join(' ').length;
      if (dialog.ch < tot) dialog.ch = tot;
      else if (dialog.i < dialog.lines.length - 1) { dialog.i++; dialog.ch = 0; }
      else { const then = dialog.then; dialog = null; if (then) then(); }
    }
    return;
  }
  if (shop) {
    const rows = SHOP.length + 1;
    if (name === 'up') { shop.sel = (shop.sel + rows - 1) % rows; tone(1318, 0.03); }
    else if (name === 'down') { shop.sel = (shop.sel + 1) % rows; tone(1318, 0.03); }
    else if (name === 'b' || name === 'start' || (name === 'a' && shop.sel === SHOP.length)) shop = null;
    else if (name === 'a') {
      const [id, price] = SHOP[shop.sel], owned = id !== 'pozione' && (id === 'mappa' ? save.flags.mappa : save.inv.includes(id));
      if (owned) tone(200, 0.1, 'square', 0.03);
      else if (save.coins < price) { tone(160, 0.2, 'square', 0.04, 100); toast('MONETE INSUFFICIENTI', '#ff8f8f'); }
      else { save.coins -= price; if (id === 'pozione') { save.pot++; seq([659, 880], 0.06, 0.06); toast('+1 POZIONE', '#ffb0c0'); } else { const s = shop; shop = null; openLoot(id); shop = s; } writeSave(); }
    }
    return;
  }
  if (mapOpen) { if (name === 'select' || name === 'b' || name === 'start' || name === 'a') { mapOpen = false; tone(660, 0.04); } return; }
  if (menu) { menuKey(name); return; }
  if (name === 'start') { menu = { tab: 0, sel: 0, pick: null }; tone(988, 0.05); return; }
  if (name === 'select') { mapOpen = true; tone(988, 0.05); return; }
  if (name === 'a') {
    if (target) { interact(target); return; }
    if (hero.atk <= 0) { hero.atk = 0.42; hero.hitDone = false; noise(0.1, 0.04); tone(420, 0.08, 'triangle', 0.03, 200); }
  }
}
function menuKey(name) {
  const rows = menuRows();
  if (name === 'start' || (name === 'b' && !menu.pick)) { menu = null; tone(660, 0.04); writeSave(); return; }
  if (name === 'b' && menu.pick) { menu.sel = SLOTS.findIndex(s => s[0] === menu.pick); menu.pick = null; tone(660, 0.04); return; }
  if (name === 'left' || name === 'right') { if (menu.pick) return; menu.tab = (menu.tab + (name === 'right' ? 1 : 3)) % 4; menu.sel = 0; tone(1318, 0.03); return; }
  if (name === 'up' || name === 'down') { if (rows.length) { menu.sel = (menu.sel + (name === 'down' ? 1 : rows.length - 1)) % rows.length; tone(1318, 0.03); } return; }
  if (name !== 'a') return;
  const r = rows[menu.sel];
  if (menu.tab === 0) {
    if (!menu.pick) { menu.pick = r; menu.sel = 0; tone(988, 0.04); }
    else { if (r === '-') { save.eq[menu.pick] = menu.pick === 'armatura' ? 'tunica' : null; hero.hp = Math.min(hero.hp, MAXHP()); drawHeroSprites(); } else equip(r); tone(1046, 0.06); menu.sel = SLOTS.findIndex(s => s[0] === menu.pick); menu.pick = null; }
  } else if (menu.tab === 1) {
    if (r === 'pozione') { if (save.pot > 0 && hero.hp < MAXHP()) { save.pot--; hero.hp = Math.min(MAXHP(), hero.hp + 6); seq([523, 659, 784], 0.07, 0.07); toast('+3 CUORI', '#ff8aa0'); } else tone(200, 0.1, 'square', 0.03); }
    else if (r === 'mappa') { menu = null; mapOpen = true; }
  } else if (menu.tab === 2) { trackQuest(r); tone(1046, 0.05); }
  else {
    if (r === 'vol') { setVolume((volLevel + 2) % 3); if (volLevel) tone(1318, 0.06); }
    else if (r === 'vib') { save.opt.vib = !save.opt.vib; vib(40); }
    else if (r === 'salva') { writeSave(); toast('SALVATO!', '#9af0b0'); tone(1046, 0.06); }
    else if (r === 'esci') { writeSave(); menu = null; leave(); }
  }
}

// ---------- ciclo ----------
let lastWH = '', mTick = 0;
function measure(w, h) {
  // le misure dei tasti si rileggono quando cambia lo schermo e comunque una volta al secondo
  if (lastWH === w + 'x' + h && (++mTick % 60)) return; lastWH = w + 'x' + h;
  // pixel quadrati: l'immagine 3D si ingrandisce di un numero intero di volte
  K = Math.max(1, Math.round(h / 182)); Hr = Math.floor(h / K); Wr = Math.floor(w / K);
  OX = Math.floor((w - Wr * K) / 2); OY = Math.floor((h - Hr * K) / 2);
  if (hud.width !== Wr || hud.height !== Hr) { hud.width = Wr; hud.height = Hr; }
  try {
    const cr = $('scr').getBoundingClientRect(), sx = Wr / Math.max(1, cr.width);
    const l = $('cl').getBoundingClientRect(), r = $('cr').getBoundingClientRect();
    insetL = Math.max(40, Math.round((l.right - cr.left) * sx) + 4); insetR = Math.max(40, Math.round((cr.right - r.left) * sx) + 4);
  } catch (e) {}
}
function toTitle() { st = 'title'; title.t = 0; title.sel = 0; title.confirm = false; title.opts = loadSave() ? ['CONTINUA L\'AVVENTURA', 'NUOVA AVVENTURA'] : ['NUOVA AVVENTURA']; }
function titleCam(dt) {
  title.t += dt;
  const a = -0.6 + title.t * 0.035, cx = 2000, cz = 2660;
  cam.x = cx + Math.cos(a) * 150; cam.z = cz + Math.sin(a) * 150; cam.y = W.ground(cx, cz) + 46;
  cam.tx = cx + Math.cos(a + Math.PI) * 120; cam.tz = cz + Math.sin(a + Math.PI) * 120; cam.ty = W.ground(cx, cz) + 10;
  const bw = W.atmo(cam.x, cam.z); for (let i = 0; i < 3; i++) { atm.fog[i] = ATMO[0][0][i]; atm.zen[i] = ATMO[0][1][i]; atm.wat[i] = ATMO[0][4][i]; } atm.near = 380; atm.far = 1250;
}
if (window.__SG_DEBUG) window.__sg = {
  get st() { return st; }, get prog() { return prog; }, get hero() { return hero; }, get save() { return save; }, get foes() { return foes; }, get npcs() { return npcs; }, get chests() { return chests; },
  get dialog() { return dialog; }, get loot() { return loot; }, get target() { return target; }, get err() { return errMsg; }, W, cam, atm, key: onKey, IT,
  tp(x, z, yaw) { hero.x = x; hero.z = z; hero.y = W.ground(x, z); if (yaw !== undefined) hero.yaw = yaw; cam.yaw = hero.yaw; placeCam(true); },
  step(n) { for (let i = 0; i < n; i++) playUpdate(1 / 60); }, give: id => give(id), dragon,
  // cammina verso un punto con le stesse regole dell'eroe (pendenza, acqua, ostacoli); restituisce la distanza rimasta
  drive(tx, tz, max = 4000) { let stuck = 0; for (let i = 0; i < max; i++) { const d = Math.hypot(tx - hero.x, tz - hero.z); if (d < 5) return 0; const a = Math.atan2(tz - hero.z, tx - hero.x); hero.yaw = a; const m = 25 / 60; if (!move(hero, Math.cos(a) * m, Math.sin(a) * m, 1.6)) { stuck++; const s2 = (stuck % 2 ? 1 : -1) * 1.2; if (!move(hero, Math.cos(a + s2) * m, Math.sin(a + s2) * m, 1.6) && stuck > 300) return d; } else stuck = Math.max(0, stuck - 1); hero.y = W.ground(hero.x, hero.z); } return Math.hypot(tx - hero.x, tz - hero.z); }, close() { dialog = null; loot = null; menu = null; shop = null; mapOpen = false; },
};
return {
  id: 'saga', name: 'PIXEL SAGA', desc: 'AVVENTURA FANTASY 3D', full: true, ownSelect: true, aspect: 0,
  keys: [['D', 'cammina'], ['A', 'azione'], ['B', 'corri'], ['START', 'menu']],
  icon(c, x, y, s) {
    drawIcon(c, ['cccccccccccccccc', 'cccccccwwccccccc', 'ccwwccccccccsccc', 'ccccccccccccsccc', 'ccccccrrcccssscc', 'cccccrrrrccsscwc', 'ccccrrrrrrccsccc', 'cccrryrryrrccscc', 'ccrrrrrrrrrrcgcc', 'ggggmmmmmmgggggg', 'gggmmdddmmgggggg', 'ggggmmdmmgggtggg', 'gtggggggggggtttg', 'tttggggggggggtgg', 'gtgggggbbgggggtg', 'ggggggbbbbgggggg'],
      { c: '#5aa0e0', w: '#ffffff', r: '#8a8c96', y: '#ffd86a', s: '#e8eef6', g: '#58b048', m: '#c8c4bc', d: '#3a2416', t: '#2e7a30', b: '#3a7ac8' }, x, y, s, '#5aa0e0');
  },
  enter() {
    if (st === 'boot') { st = 'loading'; prog = 0; gen = loader(); }
    else if (st === 'play') { menu = null; }
  },
  leave() { if (st === 'play' || st === 'dead') writeSave(); },
  hidden() { if (st === 'play') { writeSave(); if (!dialog && !loot && !shop && !mapOpen) menu = menu || { tab: 0, sel: 0, pick: null }; } },
  update(dt) {
    time += dt;
    if (st === 'loading') {
      const t0 = performance.now();
      try { while (performance.now() - t0 < 40) { const r = gen.next(); if (r.done) { toTitle(); break; } prog = r.value; } }
      catch (e) { st = 'error'; errMsg = e.message === 'NOGL' ? 'QUESTO TELEFONO NON SUPPORTA LA GRAFICA 3D (WEBGL). PIXEL SAGA NON PUÒ PARTIRE.' : 'ERRORE: ' + e.message; console.error(e); }
      return;
    }
    if (st === 'title') { titleCam(dt); return; }
    if (st === 'play' || st === 'dead') playUpdate(dt);
  },
  draw(c, w, h) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    if (h > w * 1.05) {
      c.fillStyle = '#0b0d14'; c.fillRect(0, 0, w, h);
      measure(Math.min(w, h * 2), Math.min(h, w)); hg.clearRect(0, 0, Wr, Hr);
      const u = Math.max(1, Math.floor(w / 150));
      c.save(); c.translate(w / 2, h / 2 - 30 * u); c.rotate(Math.sin(time * 2) * 0.4 - 0.4);
      c.fillStyle = '#c9d3e6'; c.fillRect(-12 * u, -20 * u, 24 * u, 40 * u); c.fillStyle = '#0b0d14'; c.fillRect(-10 * u, -16 * u, 20 * u, 30 * u); c.restore();
      const tc = A.mk(130, 42), tg2 = tc.getContext('2d'); A.text(tg2, 'RUOTA IL TELEFONO', 65, 4, '#ffd23f', '#000', 1, 'center'); A.text(tg2, 'PIXEL SAGA SI GIOCA', 65, 18, '#c9d3e6', null, 1, 'center'); A.text(tg2, 'IN ORIZZONTALE', 65, 28, '#c9d3e6', null, 1, 'center');
      c.drawImage(tc, Math.round(w / 2 - 65 * u), Math.round(h / 2 + 10 * u), 130 * u, 42 * u);
      return;
    }
    measure(w, h);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    if (G && (st === 'title' || st === 'play' || st === 'dead' || st === 'intro')) {
      G.resize(Wr, Hr);
      if (st !== 'intro') { render3D(); c.drawImage(G.canvas, OX, OY, Wr * K, Hr * K); }
    }
    drawHUD();
    c.drawImage(hud, OX, OY, Wr * K, Hr * K);
  },
  button(name, down) { if (down) onKey(name); },
};
})());
