// ===================== PALLINE E BLOCCHI =====================
GAMES.push((() => {
const GW = 700, CELL = 100, COLS = 7, LAST = 8, GH = 9 * CELL + 130;
const R = 11, GAP = 5, SZ = CELL - 2 * GAP, FLOOR = GH - R - 6, SPEED = 16, MINVY = 0.17;
const AMIN = 0.18, AMAX = Math.PI - 0.18;

let blocks = [], pickups = [], balls = [], particles = [];
let ballCount = 1, level = 1, launchX = GW / 2, pendingExtra = 0, best = 1;
let state = 'aim', aiming = false, aimX = 0, aimY = 0, shootDir = null, aimAngle = Math.PI / 2, aimHold = 0, touchAim = false;
let toLaunch = 0, launchTimer = 0, firstLand = null, shootTime = 0, anim = 0, tick = 0;
let streak = 0, clearedThisTurn = false, banner = null, restartAsk = 0;
let scale = 1, ox = 0, oy = 0, aimPtr = null;

// ---------- suoni (morbidi, come nella versione originale) ----------
let lastHit = 0, lastLaunch = 0;
function tone(freq, dur, type = 'sine', vol = 0.15, slideTo = null, delay = 0) {
  if (!aok()) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.03);
}
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
const sfx = {
  hit(hp) { if (!actx) return; const now = actx.currentTime; if (now - lastHit < 0.035) return; lastHit = now; tone(SCALE[hp % SCALE.length], 0.09, 'triangle', 0.12); },
  pop() { tone(900, 0.16, 'square', 0.07, 180); tone(1400, 0.08, 'sine', 0.08); },
  launch() { if (!actx) return; const now = actx.currentTime; if (now - lastLaunch < 0.06) return; lastLaunch = now; tone(320, 0.04, 'sine', 0.05); },
  pickup() { tone(660, 0.09, 'sine', 0.14); tone(990, 0.14, 'sine', 0.14, null, 0.07); },
  clear(n) {
    const base = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568], len = Math.min(base.length, 3 + n);
    for (let i = 0; i < len; i++) tone(base[i], 0.22, 'triangle', 0.16, null, i * 0.08);
    tone(base[len - 1] * 2, 0.4, 'sine', 0.08, null, len * 0.08);
  },
  over() { tone(440, 0.35, 'sawtooth', 0.08, 110); tone(330, 0.5, 'triangle', 0.1, 82, 0.2); },
  aim() { tone(1600, 0.012, 'square', 0.015); }
};

// ---------- salvataggio ----------
try { best = parseInt(localStorage.getItem('pb_best')) || 1; } catch (e) {}
function save() { try { localStorage.setItem('pb_best', best); localStorage.setItem('pb_state', JSON.stringify({ blocks, pickups, ballCount, level, launchX, streak })); } catch (e) {} }
function clearSave() { try { localStorage.removeItem('pb_state'); localStorage.setItem('pb_best', best); } catch (e) {} }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem('pb_state'));
    if (s && Array.isArray(s.blocks)) { blocks = s.blocks; pickups = s.pickups || []; ballCount = s.ballCount; level = s.level; launchX = s.launchX; streak = s.streak || 0; return true; }
  } catch (e) {}
  return false;
}
function newGame() {
  blocks = []; pickups = []; balls = []; particles = [];
  ballCount = 1; level = 1; launchX = GW / 2; pendingExtra = 0;
  streak = 0; clearedThisTurn = false; banner = null; aimAngle = Math.PI / 2;
  spawnRow(1, level); state = 'aim'; save();
}
function spawnRow(r, lvl) {
  const cols = [...Array(COLS).keys()].sort(() => Math.random() - 0.5);
  const maxN = lvl < 4 ? 3 : lvl < 15 ? 5 : 6, n = 1 + Math.floor(Math.random() * maxN);
  for (let i = 0; i < n; i++) blocks.push({ c: cols[i], r, hp: (lvl >= 5 && Math.random() < 0.25) ? lvl * 2 : lvl });
  pickups.push({ c: cols[n], r });
}

// ---------- mira ----------
const dirOf = a => ({ x: Math.cos(a), y: -Math.sin(a) });
function angleFromPoint(x, y) {
  const dx = x - launchX, dy = y - FLOOR;
  if (dy > -30) return null;
  return clamp(Math.atan2(-dy, dx), AMIN, AMAX);
}
function shoot(d) {
  state = 'shoot'; shootDir = d; toLaunch = ballCount; launchTimer = 0;
  firstLand = null; shootTime = 0; balls = []; clearedThisTurn = false;
}
function recall() {
  if (state !== 'shoot') return;
  toLaunch = 0; if (firstLand === null) firstLand = launchX;
  for (const b of balls) b.st = 'done';
  endTurn();
}
function onBoardCleared() {
  clearedThisTurn = true;
  const s = streak + 1, bonus = Math.min(s, 3);
  pendingExtra += bonus;
  banner = { text: s >= 2 ? 'SERIE X' + s + '!' : 'PULITO!', sub: '+' + bonus + (bonus === 1 ? ' PALLINA BONUS' : ' PALLINE BONUS'), t: 0 };
  for (let i = 0; i < 5; i++) burst(80 + Math.random() * (GW - 160), 150 + Math.random() * 500, blockColor(Math.random()), 12);
  sfx.clear(s);
}
function endTurn() {
  balls = [];
  streak = clearedThisTurn ? streak + 1 : 0; clearedThisTurn = false;
  launchX = Math.max(R, Math.min(GW - R, firstLand ?? launchX));
  ballCount += pendingExtra; pendingExtra = 0;
  level++;
  for (const k of blocks) k.r++;
  for (const p of pickups) p.r++;
  pickups = pickups.filter(p => p.r <= LAST);
  spawnRow(1, level);
  state = 'advance'; anim = 0;
}
function gameOver() { state = 'over'; sfx.over(); best = Math.max(best, level); clearSave(); }

// ---------- fisica ----------
function collide(b) {
  for (const k of blocks) {
    if (k.hp <= 0) continue;
    const x0 = k.c * CELL + GAP, y0 = k.r * CELL + GAP, x1 = x0 + SZ, y1 = y0 + SZ;
    const nx = clamp(b.x, x0, x1), ny = clamp(b.y, y0, y1);
    const dx = b.x - nx, dy = b.y - ny, d2 = dx * dx + dy * dy;
    if (d2 >= R * R) continue;
    let nX, nY, pen;
    if (d2 < 1e-9) {
      const l = b.x - x0, r = x1 - b.x, t = b.y - y0, bo = y1 - b.y, m = Math.min(l, r, t, bo);
      if (m === l) { nX = -1; nY = 0; } else if (m === r) { nX = 1; nY = 0; } else if (m === t) { nX = 0; nY = -1; } else { nX = 0; nY = 1; }
      pen = m + R;
    } else { const d = Math.sqrt(d2); nX = dx / d; nY = dy / d; pen = R - d; }
    b.x += nX * pen; b.y += nY * pen;
    const dot = b.vx * nX + b.vy * nY;
    if (dot < 0) {
      b.vx -= 2 * dot * nX; b.vy -= 2 * dot * nY;
      k.hp--; k.flash = 5;
      if (k.hp <= 0) { burst(x0 + SZ / 2, y0 + SZ / 2, blockColor(1), 14); sfx.pop(); } else sfx.hit(k.hp);
    }
  }
}
function pickupCheck(b) {
  for (const p of pickups) {
    if (p.got) continue;
    const cx = p.c * CELL + CELL / 2, cy = p.r * CELL + CELL / 2;
    if ((b.x - cx) ** 2 + (b.y - cy) ** 2 < (R + 18) ** 2) { p.got = true; pendingExtra++; burst(cx, cy, '#4ade80', 10); sfx.pickup(); }
  }
}
function fixAngle(b) {
  const min = MINVY * SPEED;
  if (Math.abs(b.vy) < min) { b.vy = (b.vy >= 0 ? 1 : -1) * min; b.vx = (b.vx >= 0 ? 1 : -1) * Math.sqrt(SPEED * SPEED - min * min); }
  else { const s = Math.hypot(b.vx, b.vy) || 1; b.vx *= SPEED / s; b.vy *= SPEED / s; }
}
function physicsFrame() {
  if (toLaunch > 0) {
    if (launchTimer <= 0) { balls.push({ x: launchX, y: FLOOR, vx: shootDir.x * SPEED, vy: shootDir.y * SPEED, st: 'fly' }); toLaunch--; launchTimer = 4; sfx.launch(); }
    else launchTimer--;
  }
  const SUB = 4;
  for (const b of balls) {
    if (b.st === 'fly') {
      for (let i = 0; i < SUB && b.st === 'fly'; i++) {
        b.x += b.vx / SUB; b.y += b.vy / SUB;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
        if (b.x > GW - R) { b.x = GW - R; b.vx = -Math.abs(b.vx); }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
        collide(b); pickupCheck(b);
        if (b.vy > 0 && b.y >= FLOOR) { b.y = FLOOR; if (firstLand === null) { firstLand = b.x; b.st = 'done'; } else b.st = 'ret'; }
      }
      if (b.st === 'fly') fixAngle(b);
    } else if (b.st === 'ret') {
      const dx = firstLand - b.x;
      if (Math.abs(dx) <= 22) b.st = 'done'; else b.x += Math.sign(dx) * 22;
    }
  }
  if (blocks.some(k => k.hp <= 0)) { blocks = blocks.filter(k => k.hp > 0); if (blocks.length === 0 && !clearedThisTurn) onBoardCleared(); }
  if (pickups.some(p => p.got)) pickups = pickups.filter(p => !p.got);
  if (toLaunch === 0 && balls.every(b => b.st === 'done')) endTurn();
}
const speedMult = () => shootTime > 480 ? 3 : shootTime > 240 ? 2 : 1;
function update(dt) {
  tick++;
  if (restartAsk > 0) restartAsk -= dt;
  if (state === 'aim' && !touchAim) {
    const d = (BTN.left ? 1 : 0) - (BTN.right ? 1 : 0);
    if (d) {
      aimHold += dt;
      const rate = aimHold < 0.35 ? 0.45 : aimHold < 1 ? 1.0 : 1.7;
      const before = aimAngle;
      aimAngle = clamp(aimAngle + d * rate * dt, AMIN, AMAX);
      if (Math.floor(before * 40) !== Math.floor(aimAngle * 40)) sfx.aim();
    } else aimHold = 0;
  }
  if (state === 'shoot') { shootTime++; const m = speedMult(); for (let i = 0; i < m && state === 'shoot'; i++) physicsFrame(); }
  else if (state === 'advance') { anim++; if (anim >= 12) { if (blocks.some(k => k.r > LAST)) gameOver(); else { state = 'aim'; save(); } } }
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--; }
  particles = particles.filter(p => p.life > 0);
  for (const k of blocks) if (k.flash) k.flash--;
  if (banner && ++banner.t > 110) banner = null;
}
function burst(x, y, col, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5; particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 24 + Math.random() * 14, col }); }
}

// ---------- disegno a pixel: 1 pixel = 5 unità del mondo (140 × 206), ingrandito senza sfocare ----------
const PX = 5, PW = GW / PX, PH = GH / PX;
const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
const g = pc.getContext('2d');
const BG = '#1b1b2b';
const PAL = [   // dal blocco più debole al più forte: [base, luce, ombra]
  ['#ffe066', '#fff4b8', '#c7a530'], ['#ffc145', '#ffe196', '#c88a1e'], ['#ff9b3d', '#ffc78e', '#c1621c'],
  ['#ff6b4a', '#ffa592', '#bd3d25'], ['#f2496b', '#ff92a8', '#ad2547'], ['#d6428c', '#f28ec1', '#932464'],
  ['#a64fbf', '#d096e2', '#6f3184'], ['#7b5cd6', '#ae99f1', '#4e379b']];
const palOf = t => PAL[clamp(Math.floor(t * PAL.length), 0, PAL.length - 1)];
const blockColor = t => palOf(t)[0];
function sprite(rows, pal) {
  const cv = document.createElement('canvas'); cv.width = rows[0].length; cv.height = rows.length;
  const x = cv.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (pal[r[i]]) { x.fillStyle = pal[r[i]]; x.fillRect(i, j, 1, 1); } });
  return cv;
}
function ringSprite(rad) {
  const n = rad * 2 + 1, rows = [];
  for (let y = 0; y < n; y++) {
    let r = '';
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - rad, y - rad);
      const plus = (x === rad && Math.abs(y - rad) <= 1) || (y === rad && Math.abs(x - rad) <= 1);
      r += Math.abs(d - rad) < 0.55 ? 'g' : plus ? 'w' : '.';
    }
    rows.push(r);
  }
  return sprite(rows, { g: '#4ade80', w: '#d9ffe6' });
}
const SPR = {
  ball: sprite(['.aaa.', 'aaaab', 'aaaab', 'aaabb', '.bbb.'], { a: '#ffffff', b: '#b8c1d6' }),
  ghost: sprite(['.aaa.', 'a...a', 'a...a', 'a...a', '.aaa.'], { a: '#7d8499' }),
  ring: [ringSprite(4), ringSprite(5)],
  flame: sprite(['..a..', '.aa..', '.aba.', 'abbba', 'abcba', '.aaa.'], { a: '#ff6b2a', b: '#ffc145', c: '#fff4b8' }),
};
const tw = (s, k = 1) => s.length * 4 * k - k;
function pt(s, x, y, k = 1, col = '#ffffff', align = 'left', outline = null) {
  s = String(s);
  const x0 = align === 'center' ? Math.round(x - tw(s, k) / 2) : align === 'right' ? x - tw(s, k) : x;
  const paint = (dx, dy, c) => {
    g.fillStyle = c;
    for (let i = 0; i < s.length; i++) {
      const f = FONT[s[i]] || FONT['?'];
      for (let j = 0; j < 15; j++) if (f[j] === '1') g.fillRect(x0 + dx + i * 4 * k + (j % 3) * k, y + dy + Math.floor(j / 3) * k, k, k);
    }
  };
  if (outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) paint(dx, dy, outline);
  paint(0, 0, col);
}
const P = v => Math.round(v / PX);
function hitsBlockAt(x, y) {
  for (const k of blocks) { const x0 = k.c * CELL + GAP, y0 = k.r * CELL + GAP, nx = clamp(x, x0, x0 + SZ), ny = clamp(y, y0, y0 + SZ); if ((x - nx) ** 2 + (y - ny) ** 2 < R * R) return true; }
  return false;
}
function drawPreview(d) {
  let x = launchX, y = FLOOR, vx = d.x, vy = d.y, len = 0, next = 0;
  const pts = [];
  for (let i = 0; i < 200; i++) {
    x += vx * 5; y += vy * 5; len += 5;
    if (x < R) { x = R; vx = -vx; } if (x > GW - R) { x = GW - R; vx = -vx; } if (y < R) { y = R; vy = -vy; }
    if (hitsBlockAt(x, y) || y > FLOOR) break;
    if (len >= next) { pts.push([x, y]); next += 30; }
  }
  const shades = ['#ffffff', '#e6e9f2', '#c9cede', '#aab1c6', '#8c94ab', '#71798f', '#5b6378'];
  pts.forEach(([px, py], i) => {
    g.fillStyle = shades[Math.min(shades.length - 1, Math.floor(i / Math.max(1, pts.length) * shades.length))];
    const s = i < pts.length * 0.4 ? 2 : 1;
    g.fillRect(P(px) - (s > 1 ? 1 : 0), P(py) - (s > 1 ? 1 : 0), s, s);
  });
  if (pts.length) g.drawImage(SPR.ghost, P(x) - 2, P(y) - 2);
}
const ballAt = (x, y) => g.drawImage(SPR.ball, P(x) - 2, P(y) - 2);
function render() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = BG; g.fillRect(0, 0, PW, PH);
  // puntini della griglia e fascia dei punteggi
  g.fillStyle = '#25253a';
  for (let r = 1; r <= LAST + 1; r++) for (let cc = 1; cc < COLS; cc++) g.fillRect(cc * 20, r * 20, 1, 1);
  g.fillStyle = '#161624'; g.fillRect(0, 0, PW, 19);
  g.fillStyle = '#2c2c44'; g.fillRect(0, 19, PW, 1);
  // linea del pericolo e pavimento
  g.fillStyle = '#5b2a3c';
  for (let x = 0; x < PW; x += 6) g.fillRect(x, (LAST + 1) * 20, 3, 1);
  const fy = P(FLOOR + R);
  g.fillStyle = '#2b2b42'; g.fillRect(0, fy, PW, PH - fy);
  g.fillStyle = '#3d3d5c'; g.fillRect(0, fy, PW, 1);
  // punteggi
  pt('LIVELLO', 4, 3, 1, '#7f88a3');
  pt(String(level), 4, 9, 2, '#ffffff');
  pt('RECORD', PW / 2, 3, 1, '#7f88a3', 'center');
  pt(String(Math.max(best, level)), PW / 2, 9, 1, '#aab4cc', 'center');
  const cnt = 'x' + ballCount;
  pt(cnt, PW - 4, 9, 2, '#ffffff', 'right');
  g.drawImage(SPR.ball, PW - 4 - tw(cnt, 2) - 7, 11);
  if (pendingExtra) pt('+' + pendingExtra, PW - 4, 3, 1, '#4ade80', 'right');
  // blocchi
  const e = state === 'advance' ? Math.min(1, anim / 12) : 1, off = P(-CELL * (1 - (1 - (1 - e) * (1 - e))));
  for (const k of blocks) {
    const x = k.c * 20 + 1, y = k.r * 20 + 1 + off, s = 18;
    const [base, lite, dark] = k.flash ? ['#ffffff', '#ffffff', '#d7dbe8'] : palOf(k.hp / (level * 2));
    g.fillStyle = dark; g.fillRect(x, y, s, s);
    g.fillStyle = base; g.fillRect(x, y, s - 1, s - 1);
    g.fillStyle = lite; g.fillRect(x, y, s - 1, 1); g.fillRect(x, y, 1, s - 1);
    const t = String(k.hp), big = t.length <= 2;
    pt(t, x + 9, y + (big ? 4 : 7), big ? 2 : 1, '#1a1a26', 'center');
  }
  // palline extra da raccogliere
  for (const p of pickups) {
    const sp = SPR.ring[Math.floor(tick / 14) % 2];
    g.drawImage(sp, p.c * 20 + 10 - (sp.width >> 1), p.r * 20 + 10 + off - (sp.height >> 1));
  }
  for (const p of particles) { g.fillStyle = p.col; const s = p.life > 16 ? 2 : 1; g.fillRect(P(p.x), P(p.y), s, s); }
  if (state === 'aim') drawPreview(dirOf(aimAngle));
  for (const b of balls) if (b.st !== 'done') ballAt(b.x, b.y);
  const ly = P(FLOOR) - 10;
  if (state === 'aim' || state === 'advance') { ballAt(launchX, FLOOR); pt('x' + ballCount, clamp(P(launchX), 10, PW - 10), ly, 1, '#ffffff', 'center'); }
  else if (state === 'shoot') {
    if (toLaunch > 0) { ballAt(launchX, FLOOR); pt('x' + toLaunch, clamp(P(launchX), 10, PW - 10), ly, 1, '#ffffff', 'center'); }
    if (firstLand !== null) ballAt(firstLand, FLOOR);
    const m = speedMult();
    pt((m > 1 ? '>>X' + m + '  ' : '') + 'B: RICHIAMA', PW - 3, fy - 7, 1, '#6f7894', 'right');
  }
  if (streak > 0 && state !== 'over') { g.drawImage(SPR.flame, 3, fy - 8); pt('SERIE ' + streak, 10, fy - 7, 1, '#ffc145'); }
  if (banner) {
    const t = banner.t;
    if (t < 80 || Math.floor(t / 4) % 2 === 0) {
      const by = 80 - (t < 10 ? Math.round((10 - t) * 1.5) : 0);
      const col = Math.floor(t / 5) % 2 ? '#ffc145' : '#ffe066';
      const k = tw(banner.text, 3) <= PW - 6 ? 3 : 2;
      pt(banner.text, PW / 2, by, k, col, 'center', '#12121c');
      pt(banner.sub, PW / 2, by + 5 * k + 5, 1, '#4ade80', 'center', '#12121c');
    }
  }
  if (state === 'aim' && level === 1 && !balls.length) {
    pt('< > MIRA   A TIRA', PW / 2, 160, 1, '#9aa3bd', 'center');
    pt('O TRASCINA SULLO SCHERMO', PW / 2, 168, 1, '#6f7894', 'center');
  }
  if (restartAsk > 0) {
    g.fillStyle = 'rgba(8,8,14,.85)'; g.fillRect(0, 90, PW, 26);
    pt('PREMI DI NUOVO START', PW / 2, 95, 1, '#ffd23f', 'center');
    pt('PER RICOMINCIARE', PW / 2, 104, 1, '#ffffff', 'center');
  }
  if (state === 'over') {
    g.fillStyle = 'rgba(8,8,14,.82)'; g.fillRect(0, 0, PW, PH);
    pt('PARTITA', PW / 2, 62, 2, '#ffffff', 'center', '#12121c');
    pt('FINITA', PW / 2, 76, 2, '#ffffff', 'center', '#12121c');
    pt('LIVELLO ' + level, PW / 2, 100, 1, '#c9cede', 'center');
    pt('RECORD ' + best, PW / 2, 109, 1, '#c9cede', 'center');
    if (Math.floor(tick / 20) % 2 === 0) pt('A: RIGIOCA', PW / 2, 128, 2, '#4ade80', 'center', '#12121c');
  }
}
function draw(cc, w, h) {
  render();
  let k = Math.min(w / PW, h / PH);
  const ki = Math.floor(k); if (ki >= 2 && ki / k > 0.985) k = ki;
  const dw = Math.round(PW * k), dh = Math.round(PH * k);
  ox = Math.round((w - dw) / 2); oy = Math.round((h - dh) / 2); scale = dw / GW;
  cc.setTransform(1, 0, 0, 1, 0, 0);
  cc.fillStyle = BG; cc.fillRect(0, 0, w, h);
  cc.imageSmoothingEnabled = false;
  cc.drawImage(pc, ox, oy, dw, dh);
}
function toWorld(x, y) { return [(x - ox) / scale, (y - oy) / scale]; }

const ICON = ['................', '.yyyy.oooo.pppp.', '.yyyy.oooo.pppp.', '.yyyy.oooo.pppp.', '.yyyy.oooo.pppp.', '................', '......rrrr.yyyy.', '......rrrr.yyyy.', '......rrrr.yyyy.',
  '......rrrr.yyyy.', '................', '..........gg....', '.........g..g...', '..........gg....', '.......ww.......', '.......ww.......'];
if (!load()) newGame();
return {
  id: 'palline', name: 'PALLINE', desc: 'TIRA E ABBATTI I BLOCCHI',
  aspect: GW / GH,
  keys: [['D', 'mira'], ['A', 'tira'], ['B', 'richiama'], ['START', 'ricomincia']],
  icon(cc, x, y, s) { drawIcon(cc, ICON, { y: '#facc15', o: '#fb923c', p: '#f472b6', r: '#ef4444', g: '#4ade80', w: '#ffffff' }, x, y, s, '#1c1c29'); },
  enter() { if (state === 'over') newGame(); restartAsk = 0; aimHold = 0; },
  leave() { if (state === 'aim') save(); },
  update,
  draw,
  button(name, down) {
    if (!down) return;
    if (state === 'over') { if (name === 'a' || name === 'start') newGame(); return; }
    if (name === 'a' && state === 'aim') shoot(dirOf(aimAngle));
    else if (name === 'b' && state === 'shoot') recall();
    else if (name === 'start') { if (restartAsk > 0) { restartAsk = 0; clearSave(); newGame(); } else restartAsk = 2.2; }
  },
  pointer(type, x, y, id) {
    if (state === 'over') { if (type === 'up') newGame(); return; }
    if (state !== 'aim') return;
    const [wx, wy] = toWorld(x, y);
    if (type === 'down') { aimPtr = id; touchAim = true; const a = angleFromPoint(wx, wy); if (a !== null) aimAngle = a; }
    else if (id !== aimPtr) return;
    else if (type === 'move') { const a = angleFromPoint(wx, wy); if (a !== null) aimAngle = a; }
    else if (type === 'up') { aimPtr = null; touchAim = false; const a = angleFromPoint(wx, wy); if (a !== null) { aimAngle = a; shoot(dirOf(a)); } }
    else { aimPtr = null; touchAim = false; }
  }
};
})());
