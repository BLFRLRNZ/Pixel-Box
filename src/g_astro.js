// ===================== ASTRO RAID =====================
GAMES.push((() => {
const SW = 84, SH = 48, PT = 6;
const SCROLL = 16;
const LCD = makeLCD(SW, SH);
const { fb, px, unpx, spr, text, textW, ctext, clearBox, frame } = LCD;
const banner = lines => LCD.banner(lines, PT);
let lastHit = 0, lastE = 0;
// ---------- sprite (disegni originali) ----------
function S(rows) { const h = rows.length, w = rows[0].length, d = new Uint8Array(w * h); rows.forEach((r, y) => { for (let x = 0; x < w; x++) d[y * w + x] = r[x] === '#' ? 1 : 0; }); return { w, h, d }; }
const SPR = {
  ship: S(['##......', '.####...', '.#######', '.####...', '##......']),
  A: S(['....###', '..####.', '#######', '..####.', '....###']),
  B0: S(['#.....#', '.#...#.', '..###..', '.#####.', '##.#.##', '.......']),
  B1: S(['.......', '..###..', '.#####.', '##.#.##', '.#...#.', '#.....#']),
  C: S(['....####', '..######', '########', '#.#.####', '..######', '....####']),
  D0: S(['#.#.#', '.###.', '##.##', '.###.', '#.#.#']),
  D1: S(['..#..', '.###.', '##.##', '.###.', '..#..']),
  E: S(['#......', '.##....', '..####.', '.######', '#######']),
  F: S(['###...', '.#####', '..####', '.#####', '###...']),
  G: S(['..##..', '.####.', '##..##', '##..##', '.####.', '..##..']),
  R: S(['..####..', '.##.###.', '###.####', '########', '#.######', '.######.', '..####..']),
  missile: S(['##...', '#####', '##...']),
  heart: S(['#.#', '###', '.#.']),
  heart5: S(['.#.#.', '#####', '#####', '.###.', '..#..']),
  boss1: S(['......####......', '....########....', '...##..##..##...', '..############..', '.##############.', '################', '#..##..##..##..#', '################', '.#.#.#.#.#.#.#.#', '.#..#..#..#..#..', '#...#..#..#..#..', '....#.....#.....']),
  boss2: S(['##..............', '###.....####....', '.###..########..', '..#..##########.', '....###.##.#####', '...####.##.#####', '..##############', '..##############', '...####.##.#####', '....###.##.#####', '..#..##########.', '.###..########..', '###.....####....', '##..............']),
  boss3: S(['......#########.', '....############', '..###..#########', '.####..#########', '################', '##.#############', '.......#########', '##.#############', '################', '.###############', '...#############', '......#######...']),
  boss4: S(['.....######.....', '...##########...', '..###.####.###..', '.##############.', '.####......####.', '####..####..####', '###..######..###', '###..##..##..###', '###..##..##..###', '###..######..###', '####..####..####', '.####......####.', '.##############.', '..###.####.###..', '...##########...', '.....######.....']),
  boss5: S(['........######....', '......##########..', '....###..####..###', '..################', '.###.#.#.#.#.#.###', '##################', '....##....##....##', '##################', '#..#..#..#..#..#..', '##################', '....##....##....##', '##################', '.###.#.#.#.#.#.###', '..################', '....###..####..###', '......##########..'])
};

// ---------- livelli ----------
const LV = [
  { name: 'SPAZIO PROFONDO', stars: true, bossT: 61, waves: [
    [2, 'A', 12, 3, .5], [5, 'A', 30, 3, .5], [8, 'B', 20, 4, .6], [12, 'C', 22], [15, 'A', 10, 3, .5], [15.5, 'A', 34, 3, .5],
    [19, 'B', 14, 5, .6, 0, 'M'], [24, 'C', 12], [25, 'C', 32], [28, 'A', 22, 5, .4], [32, 'B', 26, 5, .6], [34, 'C', 18, 1, 0, 0, 'V'],
    [37, 'C', 30, 2, 1.5], [40, 'A', 9, 4, .5, 5], [44, 'B', 20, 6, .5, 0, 'L'], [48, 'C', 15], [48.5, 'A', 32, 3, .5],
    [52, 'B', 12, 4, .6], [52.5, 'B', 30, 4, .6], [56, 'A', 20, 5, .4]] },
  { name: 'MONTI ROCCIOSI', stars: true, terrain: 'karst', bossT: 66, waves: [
    [2, 'B', 15, 4, .6], [5, 'E'], [7, 'A', 12, 3, .5], [9, 'D', 20, 2, 1.5], [12, 'E', 0, 2, 2], [14, 'C', 16],
    [17, 'B', 22, 5, .6, 0, 'W'], [21, 'D', 14, 3, 1], [23, 'E'], [23.5, 'A', 10, 4, .5], [27, 'C', 12], [28, 'C', 28],
    [31, 'B', 18, 5, .6], [34, 'E', 0, 3, 1.5], [37, 'D', 25, 3, .8, 0, 'M'], [41, 'A', 9, 5, .5, 4], [45, 'C', 20, 2, 1, 0, 'V'],
    [49, 'B', 14, 6, .5], [53, 'E', 0, 2, 2], [54, 'D', 18, 2, 1], [57, 'A', 12, 3, .5], [57.5, 'A', 28, 3, .5], [61, 'C', 18]] },
  { name: 'LE CAVERNE', terrain: 'cave', bossT: 66, waves: [
    [2, 'A', 20, 3, .5], [5, 'F', 16, 2, 1], [8, 'D', 22, 3, 1], [11, 'E', 0, 2, 2], [13, 'B', 20, 4, .6, 0, 'L'], [17, 'F', 14, 3, .8],
    [20, 'C', 22], [23, 'A', 18, 5, .4], [27, 'D', 16, 2, 1], [27.5, 'E'], [30, 'F', 24, 3, .8, 0, 'W'], [34, 'C', 18], [35, 'C', 26],
    [38, 'B', 20, 6, .5], [42, 'F', 14, 2, .8], [42.5, 'F', 28, 2, .8], [45, 'A', 22, 5, .4, -2, 'V'], [49, 'E', 0, 3, 1.2],
    [52, 'D', 20, 4, .7], [56, 'C', 20, 2, 1.2], [60, 'F', 18, 4, .6]] },
  { name: 'PIOGGIA DI ASTEROIDI', stars: true, bossT: 66, waves: [
    [2, 'R', 15], [4, 'G', 12, 3, .7], [7, 'R', 28], [8, 'R', 10], [10, 'C', 20], [13, 'G', 30, 4, .6, 0, 'M'], [16, 'R', 14, 3, 1.2, 6],
    [20, 'A', 12, 4, .5], [20.5, 'A', 30, 4, .5], [24, 'C', 14], [25, 'C', 28], [27, 'G', 20, 5, .5], [31, 'R', 12], [32, 'R', 26],
    [33, 'R', 18], [35, 'B', 20, 6, .5, 0, 'L'], [39, 'C', 20, 3, 1], [43, 'G', 10, 4, .6], [44, 'G', 30, 4, .6, 0, 'V'],
    [47, 'R', 22, 3, .9], [51, 'A', 9, 6, .4, 4], [55, 'C', 15], [55.5, 'C', 30], [59, 'G', 20, 6, .4]] },
  { name: 'LA BASE NEMICA', stars: true, terrain: 'base', bossT: 70, waves: [
    [2, 'A', 12, 4, .5], [4, 'E', 0, 2, 1.5], [6, 'B', 20, 5, .6], [9, 'C', 14], [9.5, 'C', 28], [12, 'F', 18, 3, .7],
    [15, 'D', 22, 3, .8, 0, 'W'], [18, 'E', 0, 3, 1], [20, 'G', 15, 4, .6], [23, 'C', 20, 2, 1], [26, 'A', 9, 6, .4, 4],
    [29, 'B', 14, 5, .6], [30, 'B', 28, 5, .6], [33, 'R', 18], [33.5, 'F', 26, 3, .7], [36, 'E', 0, 2, 2], [37, 'C', 16, 1, 0, 0, 'M'],
    [40, 'G', 22, 6, .45], [44, 'C', 12], [45, 'C', 22, 1, 0, 0, 'V'], [46, 'C', 32], [48, 'F', 15, 4, .5], [51, 'D', 18, 4, .6],
    [54, 'A', 10, 5, .4], [54.5, 'A', 30, 5, .4], [58, 'B', 20, 8, .4, 0, 'L'], [62, 'C', 20, 3, .8]] }
];
const EDEF = {
  A: { spr: ['A'], hp: 1, score: 10 }, B: { spr: ['B0', 'B1'], hp: 1, score: 15 }, C: { spr: ['C'], hp: 3, score: 30 },
  D: { spr: ['D0', 'D1'], hp: 2, score: 20 }, E: { spr: ['E'], hp: 2, score: 25 }, F: { spr: ['F'], hp: 1, score: 20 },
  G: { spr: ['G'], hp: 2, score: 20 }, R: { spr: ['R'], hp: 5, score: 15 }
};
const BOSS = [
  { spr: 'boss1', hp: 30, amp: 11, freq: 1.0, fire: [{ type: 'aim', every: 1.2 }] },
  { spr: 'boss2', hp: 45, amp: 12, freq: 0.8, fire: [{ type: 'spread3', every: 1.6 }] },
  { spr: 'boss3', hp: 55, amp: 9, freq: 1.3, fire: [{ type: 'burst', every: 1.9 }], minion: { type: 'A', every: 4 } },
  { spr: 'boss4', hp: 70, amp: 10, freq: 0.7, fire: [{ type: 'aim', every: 1.0 }], minion: { type: 'D', every: 3.5 } },
  { spr: 'boss5', hp: 100, amp: 10, freq: 0.9, fire: [{ type: 'spread3', every: 1.5 }, { type: 'aim', every: 1.1 }], rage: { type: 'spread5', every: 1.7 } }
];

// ---------- terreno ----------
function genKarst(seed, len, minH, maxH, flatFrom) {
  const r = rng(seed), h = new Array(len); let cur = minH, target = minH, run = 0;
  for (let x = 0; x < len; x++) {
    if (x < 110 || x >= flatFrom) { h[x] = minH; cur = minH; continue; }
    if (run <= 0) { target = minH + Math.floor(r() * (maxH - minH + 1)); run = 2 + Math.floor(r() * 8); }
    run--;
    if (cur < target && r() < 0.75) cur++; else if (cur > target && r() < 0.75) cur--;
    let v = cur; if (r() < 0.12) v = Math.min(maxH, v + 1 + Math.floor(r() * 2));
    h[x] = v;
  }
  return h;
}
function genBase(seed, len, flatFrom) {
  const r = rng(seed), h = new Array(len); let x = 0;
  while (x < len) {
    const w = 5 + Math.floor(r() * 10), v = (x < 110 || x >= flatFrom) ? 2 : [2, 3, 5, 7][Math.floor(r() * 4)];
    for (let i = 0; i < w && x < len; i++, x++) h[x] = v;
  }
  return h;
}
let terrB = null, terrT = null;
const hAt = (arr, wx) => !arr ? 0 : arr[clamp(Math.floor(wx), 0, arr.length - 1)];
const hB = wx => hAt(terrB, wx), hT = wx => hAt(terrT, wx);
function solidAt(x, y) {
  const wx = Math.floor(scroll) + Math.round(x); y = Math.round(y);
  return (terrB && y >= SH - hB(wx)) || (terrT && y < PT + hT(wx));
}

const sfx = {
  shoot() { tone(1600, 0.03, 'square', 0.022, 1100); },
  hit() { if (!actx) return; const n = actx.currentTime; if (n - lastHit < 0.04) return; lastHit = n; tone(520, 0.03, 'square', 0.03); },
  boom() { noise(0.16, 0.16); tone(240, 0.12, 'square', 0.035, 60); },
  die() { noise(0.55, 0.25); tone(700, 0.6, 'square', 0.045, 50); },
  pick() { seq([988, 1319, 1760], 0.06, 0.05); },
  life() { seq([784, 988, 1175, 1568], 0.08, 0.07); },
  missile() { tone(300, 0.15, 'square', 0.04, 1200); },
  laser() { tone(2000, 0.4, 'square', 0.028, 600); },
  wall() { tone(150, 0.2, 'square', 0.05, 500); },
  eshoot() { if (!actx) return; const n = actx.currentTime; if (n - lastE < 0.06) return; lastE = n; tone(420, 0.04, 'square', 0.016, 300); },
  warn() { seq([880, 660, 880, 660, 880, 660], 0.12, 0.16); },
  bigBoom() { noise(0.8, 0.3); tone(300, 0.8, 'square', 0.045, 40); },
  clear() { seq([523, 659, 784, 1047, 784, 1047], 0.1, 0.1); },
  over() { seq([659, 587, 523, 392, 330], 0.2, 0.18); },
  win() { seq([523, 523, 784, 784, 880, 1047, 1047], 0.14, 0.14, 0.045); },
  start() { seq([1047, 1319, 1568], 0.07, 0.07); }
};

// ---------- stato di gioco ----------
let state = 'title', stateT = 0, paused = false, time = 0;
let lvl = 0, levelTime = 0, scroll = 0, score = 0, best = 0, lives = 3;
let player = null, special = { type: null, n: 0 };
let enemies = [], bullets = [], ebullets = [], pickups = [], parts = [], walls = [], laser = null, boss = null, bossSpawned = false;
let waves = [], stars = [], warned = false;
try { best = parseInt(localStorage.getItem('ar_best')) || 0; } catch (e) {}
function saveBest() { best = Math.max(best, score); try { localStorage.setItem('ar_best', best); } catch (e) {} }

const midY = () => Math.round(PT + (SH - PT) / 2 - 2);
function startGame() { score = 0; lives = 3; special = { type: null, n: 0 }; sfx.start(); loadLevel(0); }
function loadLevel(i) {
  lvl = i; const L = LV[i]; levelTime = 0; scroll = 0; warned = false;
  enemies = []; bullets = []; ebullets = []; pickups = []; parts = []; walls = []; laser = null; boss = null; bossSpawned = false;
  waves = L.waves.map(a => ({ t: a[0], type: a[1], y: a[2] || 0, n: a[3] || 1, gap: a[4] || 0.6, dy: a[5] || 0, drop: a[6] || null, done: 0 }));
  const len = Math.ceil((L.bossT + 120) * SCROLL) + SW + 50, flat = Math.floor((L.bossT - 3) * SCROLL) + SW;
  terrB = L.terrain === 'karst' ? genKarst(i * 977 + 3, len, 1, 9, flat) : L.terrain === 'cave' ? genKarst(i * 977 + 5, len, 1, 8, flat) : L.terrain === 'base' ? genBase(i * 977 + 7, len, flat) : null;
  terrT = L.terrain === 'cave' ? genKarst(i * 977 + 11, len, 1, 7, flat) : null;
  stars = []; if (L.stars) for (let j = 0; j < 16; j++) stars.push({ x: Math.random() * SW, y: PT + 1 + Math.random() * (SH - PT - 2), v: Math.random() < 0.5 ? 5 : 10 });
  player = { x: -9, y: midY(), alive: true, inv: 0, cool: 0, dead: 0 };
  state = 'intro'; stateT = 0;
}

function spawnEnemy(w, i, x = SW + 1, y = null) {
  const d = EDEF[w.type], s = SPR[d.spr[0]];
  const e = { type: w.type, x, y: y ?? (w.y + w.dy * i), hp: d.hp, t: 0, ph: i * 0.8, fireT: 0.7 + Math.random() * 1.2, w: s.w, h: s.h, flash: 0, drop: (w.drop && i === w.n - 1) ? w.drop : null };
  e.baseY = e.y;
  if (w.type === 'E') e.wx = Math.floor(scroll) + Math.round(x);
  if (w.type === 'G') e.vy = (i % 2 ? 1 : -1) * 20;
  if (w.type === 'F') e.mode = 0;
  enemies.push(e);
}
function explosion(x, y, n, sp = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (8 + Math.random() * 22) * sp;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25 + Math.random() * 0.35 });
  }
}
function aimed(x, y, sp) {
  const dx = player.x + 4 - x, dy = player.y + 2 - y, d = Math.hypot(dx, dy) || 1;
  ebullets.push({ x, y, vx: dx / d * sp, vy: dy / d * sp });
}
const bspeed = () => 30 + lvl * 3;

function damage(e, d) {
  if (e.hp <= 0) return;
  e.hp -= d; e.flash = 0.08; sfx.hit();
  if (e.hp <= 0) {
    explosion(e.x + e.w / 2, e.y + e.h / 2, 10); sfx.boom(); score += EDEF[e.type].score;
    if (e.drop) pickups.push({ kind: e.drop, x: e.x, y: clamp(e.y, PT + 1, SH - 9), t: 0 });
  }
}
function hitBoss(d) {
  if (!boss || boss.dying || boss.state !== 'fight') return;
  boss.hp -= d; boss.flash = 0.08; sfx.hit();
  if (boss.hp <= 0) { boss.hp = 0; boss.dying = true; boss.dieT = 0; score += 500; ebullets = []; sfx.bigBoom(); }
}
function killPlayer() {
  if (!player.alive || player.inv > 0) return;
  player.alive = false; player.dead = 1.8; lives--; laser = null;
  explosion(player.x + 4, player.y + 2, 26, 1.4); sfx.die();
}
function respawn() { player.alive = true; player.x = 4; player.y = midY(); player.inv = 2.5; ebullets = []; }
function gameOver() { state = 'over'; stateT = 0; saveBest(); sfx.over(); }
function playerHits() {
  for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++)
    if (SPR.ship.d[j * 8 + i] && solidAt(player.x + i, player.y + j)) return true;
  return false;
}
function fireSpecial() {
  if (!player.alive || !special.n) return;
  if (special.type === 'M') { bullets.push({ kind: 'm', x: player.x + 5, y: player.y + 1, vx: 70, vy: 0, dmg: 4 }); sfx.missile(); }
  else if (special.type === 'L') { laser = { t: 0.45, tick: 0 }; sfx.laser(); }
  else if (special.type === 'W') { walls.push({ x: player.x + 9, y: clamp(Math.round(player.y - 5), PT, SH - 15), h: 15 }); sfx.wall(); }
  special.n--; if (!special.n) special.type = null;
}

// ---------- comandi (croce, A = fuoco, B = arma speciale, START = pausa) ----------
let specQ = false, firePrev = false;
function readInput() {
  return { x: (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0), y: (BTN.down ? 1 : 0) - (BTN.up ? 1 : 0), fire: BTN.a };
}
function togglePause() { if (['play', 'intro', 'clear'].includes(state)) paused = !paused; }

// ---------- logica ----------
function step(dt) {
  time += dt; stateT += dt;
  const inp = readInput(), pressed = inp.fire && !firePrev; firePrev = inp.fire;
  if (state === 'title') { if (pressed) startGame(); specQ = false; return; }
  if (state === 'over' || state === 'win') { if (pressed && stateT > 1) { state = 'title'; stateT = 0; } updateParts(dt); specQ = false; return; }
  if (paused) { if (pressed) paused = false; specQ = false; return; }
  updateParts(dt);
  for (const s of stars) { s.x -= s.v * dt; if (s.x < 0) { s.x += SW; s.y = PT + 1 + Math.random() * (SH - PT - 2); } }
  if (state === 'intro') {
    scroll += SCROLL * dt;
    player.x = -9 + Math.min(1, stateT / 1.2) * 13;
    if (stateT > 2.4) { state = 'play'; stateT = 0; }
    specQ = false; return;
  }
  if (state === 'clear') {
    scroll += SCROLL * dt;
    if (stateT > 0.8) player.x += 55 * dt;
    updateShots(dt);
    if (stateT > 3) { if (lvl + 1 < LV.length) loadLevel(lvl + 1); else { state = 'win'; stateT = 0; saveBest(); sfx.win(); } }
    specQ = false; return;
  }

  // --- in gioco ---
  levelTime += dt; scroll += SCROLL * dt;
  const L = LV[lvl];
  for (const w of waves) while (w.done < w.n && levelTime >= w.t + w.done * w.gap) { spawnEnemy(w, w.done); w.done++; }
  if (!warned && levelTime >= L.bossT - 2.5) { warned = true; sfx.warn(); }
  if (!bossSpawned && levelTime >= L.bossT) {
    bossSpawned = true;
    const d = BOSS[lvl], s = SPR[d.spr];
    boss = { d, s, w: s.w, h: s.h, x: SW + 2, cy: PT + (SH - PT - s.h) / 2, hp: d.hp, max: d.hp, t: 0, state: 'enter',
      fire: d.fire.map(f => ({ ...f, cd: f.every })), minCd: d.minion ? d.minion.every : 0, burst: 0, burstCd: 0, flash: 0, dying: false, raged: false };
    boss.y = boss.cy;
  }

  // giocatore
  if (player.alive) {
    let mx = inp.x, my = inp.y; if (mx && my) { mx *= 0.7071; my *= 0.7071; }
    player.x = clamp(player.x + mx * 36 * dt, 0, SW - 8);
    player.y = clamp(player.y + my * 36 * dt, PT, SH - 5);
    player.cool -= dt;
    if (inp.fire && player.cool <= 0 && bullets.filter(b => b.kind === 'b').length < 4) {
      bullets.push({ kind: 'b', x: player.x + 8, y: player.y + 2, vx: 95, vy: 0, dmg: 1 }); player.cool = 0.2; sfx.shoot();
    }
    if (specQ) fireSpecial();
    if (player.inv > 0) player.inv -= dt;
    else if (playerHits()) killPlayer();
  } else {
    player.dead -= dt;
    if (player.dead <= 0) { if (lives > 0) respawn(); else { gameOver(); return; } }
  }
  specQ = false;

  updateEnemies(dt);
  updateBoss(dt);
  updateShots(dt);
  collisions(dt);
}

function updateParts(dt) {
  for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  if (parts.length) parts = parts.filter(p => p.life > 0);
}

function updateEnemies(dt) {
  const tb = terrB ? 10 : 0, tt = terrT ? 8 : 0;
  for (const e of enemies) {
    e.t += dt; if (e.flash > 0) e.flash -= dt;
    switch (e.type) {
      case 'A': e.x -= 26 * dt; break;
      case 'B': e.x -= 20 * dt; e.y = e.baseY + Math.sin(e.t * 4 + e.ph) * 5; break;
      case 'C': e.x -= 12 * dt; break;
      case 'D': e.x -= (SCROLL + 4) * dt; e.y += clamp(player.y + 2 - (e.y + 2), -1, 1) * 6 * dt; break;
      case 'E': {
        e.x = e.wx - scroll; let m = 0;
        for (let i = 0; i < e.w; i++) m = Math.max(m, hB(e.wx + i));
        e.y = SH - m - e.h; break;
      }
      case 'F':
        if (e.mode === 0) { e.x -= 28 * dt; if (e.x < 58) { e.mode = 1; e.vy = Math.sign(player.y - e.y) * 26; } }
        else { e.x -= 34 * dt; e.y += e.vy * dt; }
        break;
      case 'G':
        e.x -= 18 * dt; e.y += e.vy * dt;
        if (e.y < PT + 1 + tt) { e.y = PT + 1 + tt; e.vy = Math.abs(e.vy); }
        if (e.y > SH - e.h - 1 - tb) { e.y = SH - e.h - 1 - tb; e.vy = -Math.abs(e.vy); }
        break;
      case 'R': e.x -= 11 * dt; break;
    }
    if (player.alive && e.x < SW - 4 && e.x > 8 && 'CEGB'.includes(e.type)) {
      e.fireT -= dt;
      if (e.fireT <= 0) {
        if (e.type === 'C') { ebullets.push({ x: e.x - 2, y: e.y + 2, vx: -(bspeed() + 8), vy: 0 }); e.fireT = 1.7; sfx.eshoot(); }
        else if (e.type === 'E') { aimed(e.x, e.y, bspeed()); e.fireT = 2.3; sfx.eshoot(); }
        else if (e.type === 'G') { aimed(e.x, e.y + 2, bspeed()); e.fireT = 2.8; sfx.eshoot(); }
        else { if (Math.random() < 0.4) { ebullets.push({ x: e.x, y: e.y + 3, vx: -bspeed(), vy: 0 }); sfx.eshoot(); } e.fireT = 1.6; }
      }
    }
  }
  enemies = enemies.filter(e => e.hp > 0 && e.x > -e.w - 3 && e.y > -12 && e.y < SH + 6);
}

function updateBoss(dt) {
  const b = boss; if (!b) return;
  b.t += dt; if (b.flash > 0) b.flash -= dt;
  if (b.dying) {
    b.dieT += dt;
    if (Math.random() < dt * 12) { explosion(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 6); sfx.boom(); }
    if (b.dieT > 1.6) { explosion(b.x + b.w / 2, b.y + b.h / 2, 34, 1.6); boss = null; state = 'clear'; stateT = 0; laser = null; sfx.clear(); }
    return;
  }
  if (b.state === 'enter') { b.x -= 12 * dt; if (b.x <= SW - b.w - 3) { b.x = SW - b.w - 3; b.state = 'fight'; b.t = 0; } return; }
  const d = b.d;
  b.y = clamp(b.cy + Math.sin(b.t * d.freq) * d.amp, PT + 1, SH - b.h - 1);
  if (lvl === 2) b.x = SW - b.w - 3 - (Math.sin(b.t * 0.7) * 0.5 + 0.5) * 10;
  if (d.rage && !b.raged && b.hp < b.max / 2) { b.raged = true; b.fire.push({ ...d.rage, cd: 0.6 }); }
  if (!player.alive) return;
  const ox = b.x, oy = b.y + b.h / 2 - 0.5, sp = bspeed();
  for (const f of b.fire) {
    f.cd -= dt;
    if (f.cd > 0) continue;
    f.cd = f.every; sfx.eshoot();
    if (f.type === 'aim') aimed(ox, oy, sp + 2);
    else if (f.type === 'burst') { b.burst = 3; b.burstCd = 0; }
    else {
      const offs = f.type === 'spread5' ? [-0.6, -0.3, 0, 0.3, 0.6] : [-0.35, 0, 0.35];
      for (const o of offs) { const a = Math.PI + o; ebullets.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
    }
  }
  if (b.burst > 0) { b.burstCd -= dt; if (b.burstCd <= 0) { ebullets.push({ x: ox, y: oy, vx: -(sp + 8), vy: 0 }); b.burst--; b.burstCd = 0.14; } }
  if (d.minion) { b.minCd -= dt; if (b.minCd <= 0) { b.minCd = d.minion.every; spawnEnemy({ type: d.minion.type, y: 0, dy: 0, n: 1 }, 0, b.x - 4, clamp(oy - 2, PT + 1, SH - 8)); } }
}

function updateShots(dt) {
  for (const b of bullets) {
    if (b.kind === 'm') {
      let best_ = null, bd = 1e9;
      for (const e of enemies) if (e.x > b.x) { const d = e.x - b.x; if (d < bd) { bd = d; best_ = e.y + e.h / 2; } }
      if (boss && boss.state === 'fight' && best_ === null) best_ = boss.y + boss.h / 2;
      if (best_ !== null) b.vy = clamp(b.vy + clamp(best_ - (b.y + 1.5), -1, 1) * 70 * dt, -24, 24);
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x > SW + 2 || b.y < PT - 4 || b.y > SH) b.dead = true;
    else if (solidAt(b.x + (b.kind === 'm' ? 4 : 2), b.y + (b.kind === 'm' ? 1 : 0))) { b.dead = true; explosion(b.x + 2, b.y, 3, 0.5); }
  }
  bullets = bullets.filter(b => !b.dead);
  for (const e of ebullets) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (e.x < -3 || e.x > SW + 3 || e.y < PT - 2 || e.y > SH + 1 || solidAt(e.x, e.y)) e.dead = true;
  }
  ebullets = ebullets.filter(e => !e.dead);
  for (const w of walls) { w.x += 40 * dt; if (w.x > SW) w.dead = true; }
  walls = walls.filter(w => !w.dead);
  for (const p of pickups) { p.t += dt; p.x -= 14 * dt; if (p.x < -8) p.dead = true; }
  pickups = pickups.filter(p => !p.dead);
}

function collisions(dt) {
  const bf = boss && boss.state === 'fight' && !boss.dying;
  for (const b of bullets) {
    const bw = b.kind === 'm' ? 5 : 3, bh = b.kind === 'm' ? 3 : 1;
    for (const e of enemies) if (e.hp > 0 && overlap(b.x, b.y, bw, bh, e.x, e.y, e.w, e.h)) { damage(e, b.dmg); b.dead = true; if (b.kind === 'm') explosion(b.x + 4, b.y + 1, 6); break; }
    if (!b.dead && bf && overlap(b.x, b.y, bw, bh, boss.x + 1, boss.y + 1, boss.w - 2, boss.h - 2)) { hitBoss(b.dmg); b.dead = true; if (b.kind === 'm') explosion(b.x + 4, b.y + 1, 6); }
  }
  bullets = bullets.filter(b => !b.dead);

  for (const w of walls) {
    for (const e of enemies) if (e.hp > 0 && overlap(w.x, w.y, 2, w.h, e.x, e.y, e.w, e.h)) damage(e, 99);
    for (const eb of ebullets) if (overlap(w.x - 1, w.y, 4, w.h, eb.x, eb.y, 2, 1)) eb.dead = true;
    if (bf && overlap(w.x, w.y, 2, w.h, boss.x, boss.y, boss.w, boss.h)) { hitBoss(6); w.dead = true; explosion(w.x, w.y + w.h / 2, 10); }
  }
  walls = walls.filter(w => !w.dead);

  if (laser && player.alive) {
    laser.t -= dt; laser.tick -= dt;
    const ly = player.y + 2, lx = player.x + 8;
    if (laser.tick <= 0) {
      laser.tick = 0.07;
      for (const e of enemies) if (e.hp > 0 && e.x + e.w > lx && e.y <= ly + 1 && e.y + e.h >= ly - 1) damage(e, 1);
      if (bf && boss.y <= ly + 1 && boss.y + boss.h >= ly - 1) hitBoss(1);
    }
    for (const eb of ebullets) if (eb.x > lx && Math.abs(eb.y - ly) < 1.5) eb.dead = true;
    if (laser.t <= 0) laser = null;
  }
  ebullets = ebullets.filter(e => !e.dead);
  enemies = enemies.filter(e => e.hp > 0);

  if (!player.alive) return;
  const hx = player.x + 1, hy = player.y + 1, hw = 6, hh = 3;
  for (const p of pickups) {
    if (!overlap(player.x, player.y, 8, 5, p.x, p.y, 7, 7)) continue;
    p.dead = true; score += 50;
    if (p.kind === 'V') { lives = Math.min(9, lives + 1); sfx.life(); }
    else { const amt = p.kind === 'M' ? 5 : 3; if (special.type === p.kind) special.n += amt; else special = { type: p.kind, n: amt }; sfx.pick(); }
  }
  pickups = pickups.filter(p => !p.dead);
  if (player.inv > 0) return;
  for (const eb of ebullets) if (overlap(hx, hy, hw, hh, eb.x, eb.y, 2, 1)) { eb.dead = true; killPlayer(); return; }
  for (const e of enemies) if (overlap(hx, hy, hw, hh, e.x, e.y, e.w, e.h)) { damage(e, 2); killPlayer(); return; }
  if (boss && !boss.dying && overlap(hx, hy, hw, hh, boss.x + 1, boss.y + 1, boss.w - 2, boss.h - 2)) killPlayer();
}

// ---------- disegno nel framebuffer ----------
function drawTerrain() {
  const s = Math.floor(scroll);
  for (let x = 0; x < SW; x++) {
    const wx = s + x;
    if (terrB) {
      const h = hB(wx), hl = hB(wx - 1), hr = hB(wx + 1);
      for (let i = 0; i < h; i++) {
        const y = SH - 1 - i;
        if (i === h - 1 || i >= hl || i >= hr || ((wx + y) % 2 === 0 && y % 2 === 0)) px(x, y);
      }
    }
    if (terrT) {
      const h = hT(wx), hl = hT(wx - 1), hr = hT(wx + 1);
      for (let i = 0; i < h; i++) {
        const y = PT + i;
        if (i === h - 1 || i >= hl || i >= hr || ((wx + y) % 2 === 0 && y % 2 === 1)) px(x, y);
      }
    }
  }
}
function drawHUD() {
  const lv = Math.max(0, lives);
  if (lv <= 5) for (let i = 0; i < lv; i++) spr(SPR.heart, 1 + i * 4, 1);
  else { spr(SPR.heart, 1, 1); text('x' + lv, 5, 0); }
  if (special.type) { text(special.type, 23, 0); text(String(special.n), 27, 0); }
  if (boss && !boss.dying) {
    frame(35, 0, 24, 5);
    const f = Math.ceil(22 * boss.hp / boss.max);
    for (let i = 0; i < f; i++) for (let j = 1; j < 4; j++) px(36 + i, j);
  }
  text(String(Math.min(99999, score)).padStart(5, '0'), SW - 19, 0);
  for (let x = 0; x < SW; x++) px(x, 5);
}
function drawGame() {
  for (const s of stars) px(s.x, s.y);
  drawTerrain();
  for (const p of pickups) {
    const x = Math.round(p.x), y = Math.round(p.y);
    clearBox(x, y, 7, 7);
    if (Math.floor(p.t * 5) % 2 === 0) frame(x, y, 7, 7); else { px(x, y); px(x + 6, y); px(x, y + 6); px(x + 6, y + 6); }
    if (p.kind === 'V') spr(SPR.heart5, x + 1, y + 1); else text(p.kind, x + 2, y + 1);
  }
  for (const e of enemies) {
    if (e.flash > 0 && Math.floor(time * 30) % 2) continue;
    const d = EDEF[e.type], s = SPR[d.spr[d.spr.length > 1 ? Math.floor(e.t * 4) % 2 : 0]];
    spr(s, e.x, e.y);
  }
  if (boss && !(boss.flash > 0 && Math.floor(time * 30) % 2) && !(boss.dying && Math.floor(time * 16) % 2)) spr(boss.s, boss.x, boss.y);
  for (const w of walls) for (let j = 0; j < w.h; j++) { if (j % 3 !== 2) px(w.x, w.y + j); if ((j + 1) % 3 !== 2) px(w.x + 1, w.y + j); }
  if (laser && player.alive) {
    const ly = Math.round(player.y + 2), f = Math.floor(time * 30) % 2;
    for (let x = Math.round(player.x + 8); x < SW; x++) { px(x, ly); if ((x + f) % 2) px(x, f ? ly - 1 : ly + 1); }
  }
  for (const b of bullets) { if (b.kind === 'm') spr(SPR.missile, b.x, b.y); else { px(b.x, b.y); px(b.x + 1, b.y); px(b.x + 2, b.y); } }
  for (const e of ebullets) { px(e.x, e.y); px(e.x + 1, e.y); }
  if (player.alive && !(player.inv > 0 && Math.floor(player.inv * 10) % 2)) spr(SPR.ship, player.x, player.y);
  for (const p of parts) px(p.x, p.y);
  drawHUD();
}
function drawTitle() {
  ctext('ASTRO', 3, 2);
  ctext('RAID', 15, 2);
  const sx = ((time * 22) % (SW + 30)) - 15;
  spr(SPR.ship, sx, 27);
  for (let i = 1; i <= 3; i++) { const bx = sx + 8 + ((time * 60 + i * 12) % 36); if (bx < SW) { px(bx, 29); px(bx + 1, 29); px(bx + 2, 29); } }
  if (Math.floor(time * 2.5) % 2 === 0) ctext('PREMI A PER GIOCARE', 35);
  ctext('RECORD ' + String(best).padStart(5, '0'), 42);
}
function drawEnd(win) {
  ctext(win ? 'VITTORIA!' : 'GAME OVER', 5, 2);
  if (win) { ctext('HAI SALVATO', 19); ctext('LA GALASSIA!', 25); }
  ctext('PUNTI ' + String(score).padStart(5, '0'), win ? 31 : 21);
  ctext('RECORD ' + String(best).padStart(5, '0'), win ? 37 : 28);
  if (stateT > 1 && Math.floor(time * 2.5) % 2 === 0) ctext('PREMI A', win ? 43 : 39);
  for (const p of parts) px(p.x, p.y);
}
function compose() {
  fb.fill(0);
  if (state === 'title') { drawTitle(); return; }
  if (state === 'over') { drawEnd(false); return; }
  if (state === 'win') { drawEnd(true); return; }
  drawGame();
  if (state === 'intro') banner(['LIVELLO ' + (lvl + 1), LV[lvl].name]);
  else if (state === 'clear' && stateT > 0.6) banner(['LIVELLO', 'COMPLETATO!', '+500']);
  else if (state === 'play' && warned && !bossSpawned && Math.floor(time * 4) % 2 === 0) banner(['ATTENZIONE!']);
  if (paused) banner(['PAUSA', 'PREMI START']);
}

const ICON = ['................', '................', '...........#.#..', '............#...', '..........#####.', '............#...', '...........#.#..',
  '................', '##..............', '.####...........', '.#######.###.##.', '.####...........', '##..............', '................', '################', '#.#.#.#.#.#.#.#.'];
return {
  id: 'astro', name: 'ASTRO RAID', desc: 'SPARATUTTO NELLO SPAZIO',
  aspect: SW / SH,
  keys: [['D', 'muovi'], ['A', 'spara'], ['B', 'speciale'], ['START', 'pausa']],
  icon(c, x, y, s) { drawIcon(c, ICON, { '#': LCD_PIX }, x, y, s, LCD_BG); },
  enter() { state = 'title'; stateT = 0; paused = false; firePrev = true; specQ = false; },
  leave() { if (state !== 'title') saveBest(); paused = false; },
  hidden() { if (['play', 'intro', 'clear'].includes(state)) paused = true; },
  update: step,
  draw(c, w, h) { compose(); LCD.render(c, w, h); },
  button(name, down) {
    if (!down) return;
    if (name === 'b') specQ = true;
    else if (name === 'start') { if (state === 'title') startGame(); else togglePause(); }
  }
};
})());
