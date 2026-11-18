// ===================== ROLL DOWN =====================
GAMES.push((() => {
const SW = 96, SH = 65;
const LCD = makeLCD(SW, SH);
const { fb, px, unpx, spr, text, textW, ctext, clearBox, frame } = LCD;
const banner = (l, t) => LCD.banner(l, t);
const blink = (rate = 2.5) => Math.floor(time * rate) % 2 === 0;
const PT = 9;                                   // sotto il soffitto di spine
const BALLF = [S(['.##.', '#.##', '####', '.##.']), S(['.##.', '##.#', '####', '.##.']), S(['.##.', '####', '##.#', '.##.']), S(['.##.', '####', '#.##', '.##.'])];
const BALL = BALLF[0];
const ACC = 140, AIR_ACC = 130, MAXV = 56, FRIC = 180, AIR_FRIC = 80, BRAKE = 650, KICK = 18;
let state = 'menu', stateT = 0, paused = false, time = 0;
let plats = [], ball = null, lives = 3, score = 0, scoreF = 0, best = 0, newRec = false;
let elapsed = 0, spawnAcc = 0, nextGap = 12, lastSpike = false, parts = [], speedLvl = 1, lastLand = 0, speedFlash = 0;
try { best = +localStorage.getItem('rr_best') || 0; } catch (e) {}

const sfx = {
  land() { if (time - lastLand < 0.06) return; lastLand = time; tone(260, 0.025, 'square', 0.025); },
  life() { seq([784, 988, 1175, 1568], 0.08, 0.07); },
  die() { noise(0.45, 0.22); tone(500, 0.5, 'square', 0.04, 70); },
  faster() { seq([1046, 1318], 0.06, 0.07); },
  over() { seq([659, 523, 440, 330], 0.2, 0.17); },
  start() { seq([784, 1046, 1318], 0.07, 0.07); }
};

function addPlat(y, safe) {
  const w = 13 + Math.floor(Math.random() * 11), x = Math.floor(Math.random() * (SW - w + 1));
  const pS = Math.min(0.33, 0.08 + elapsed * 0.003);
  const spike = !safe && !lastSpike && Math.random() < pS;
  lastSpike = spike;
  const heart = !spike && !safe && lives < 9 && Math.random() < 0.045;
  const p = { x, y, py: y, w, spike, heart, touched: false };
  plats.push(p); return p;
}
function startGame() {
  plats = []; lastSpike = false; elapsed = 0; spawnAcc = 0; nextGap = 12; lives = 3; score = 0; scoreF = 0;
  newRec = false; parts = []; speedLvl = 1; speedFlash = 0;
  const p0 = { x: SW / 2 - 12, y: SH - 22, py: SH - 22, w: 24, spike: false, heart: false, touched: true };
  plats.push(p0); addPlat(SH - 36, true); addPlat(SH - 50, true); addPlat(SH - 8, true);
  ball = { x: SW / 2 - 2, y: p0.y - 4, vx: 0, vy: 0, roll: 0, on: p0 };
  state = 'ready'; stateT = 0; paused = false; sfx.start();
}
function die() {
  state = 'dead'; stateT = 0; lives--; ball.on = null;
  for (let i = 0; i < 18; i++) { const a = Math.random() * Math.PI * 2, s = 8 + Math.random() * 22; parts.push({ x: ball.x + 2, y: ball.y + 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.4 }); }
  sfx.die();
}
function respawn() {
  let best_ = null;
  const mid = SH * 0.58;
  for (const p of plats) if (!p.spike && p.y >= SH * 0.4 && p.y <= SH * 0.78 && (!best_ || Math.abs(p.y - mid) < Math.abs(best_.y - mid))) best_ = p;
  if (!best_) { best_ = addPlat(Math.round(mid), true); best_.x = SW / 2 - 12; best_.w = 24; }
  best_.heart = false;
  ball = { x: Math.round(best_.x + best_.w / 2 - 2), y: best_.y - 4, vx: 0, vy: 0, roll: 0, on: best_ };
  state = 'ready'; stateT = 0;
}
function gameOver() {
  state = 'over'; stateT = 0;
  if (score > best) { best = score; newRec = true; try { localStorage.setItem('rr_best', best); } catch (e) {} }
  sfx.over();
}
function okPress() {
  audioUnlock();
  if (paused) { paused = false; return; }
  if (state === 'menu') startGame();
  else if (state === 'over' && stateT > 0.8) { state = 'menu'; stateT = 0; }
}
function togglePause() { if (['play', 'ready', 'dead'].includes(state)) paused = !paused; }

const kb = { l: false, r: false }, tch = { l: false, r: false };
function step(dt) {
  time += dt; stateT += dt;
  for (const q of parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  if (parts.length) parts = parts.filter(q => q.life > 0);
  if (paused || state === 'menu' || state === 'over') return;
  if (state === 'ready') { if (stateT > 1.2) { state = 'play'; stateT = 0; } return; }

  if (state === 'play') elapsed += dt;
  const v = Math.min(26, 8 + elapsed * 0.12);
  const lv = 1 + Math.floor(elapsed / 25);
  if (lv > speedLvl) { speedLvl = lv; speedFlash = 1.6; sfx.faster(); }
  if (speedFlash > 0) speedFlash -= dt;
  for (const p of plats) { p.py = p.y; p.y -= v * dt; }
  plats = plats.filter(p => p.y > PT - 4);
  spawnAcc += v * dt;
  while (spawnAcc >= nextGap) { spawnAcc -= nextGap; nextGap = 10 + Math.random() * 6; addPlat(SH + 1 - spawnAcc, false); }

  if (state === 'dead') { if (stateT > 1.1) { if (lives <= 0) gameOver(); else respawn(); } return; }

  const dir = ((kb.r || tch.r) ? 1 : 0) - ((kb.l || tch.l) ? 1 : 0);
  if (dir) {
    if (ball.vx * dir < 0) ball.vx += dir * BRAKE * dt;                    // inversione rapida, anche in aria
    else if (Math.abs(ball.vx) < KICK) ball.vx = dir * KICK;               // risposta immediata al tasto
    ball.vx += dir * (ball.on ? ACC : AIR_ACC) * dt;                       // poi prende slancio
  } else {
    const f = (ball.on ? FRIC : AIR_FRIC) * dt;
    ball.vx = Math.abs(ball.vx) <= f ? 0 : ball.vx - Math.sign(ball.vx) * f;
  }
  ball.vx = clamp(ball.vx, -MAXV, MAXV);
  ball.x += ball.vx * dt; ball.roll += ball.vx * dt;
  if (ball.x < 0) { ball.x = 0; ball.vx = Math.abs(ball.vx) * 0.3; }
  if (ball.x > SW - 4) { ball.x = SW - 4; ball.vx = -Math.abs(ball.vx) * 0.3; }
  if (ball.on && !plats.includes(ball.on)) ball.on = null;
  if (ball.on) {
    const p = ball.on; ball.y = p.y - 4;
    if (ball.x + 2 <= p.x || ball.x + 1 >= p.x + p.w) { ball.on = null; ball.vy = 0; }
  }
  if (!ball.on) {
    const pb = ball.y + 4;
    ball.vy = Math.min(60 + (speedLvl - 1) * 7, ball.vy + (150 + (speedLvl - 1) * 10) * dt); ball.y += ball.vy * dt;
    const nb = ball.y + 4;
    for (const p of plats) {
      const top = p.spike ? p.y - 2 : p.y, ptop = p.spike ? p.py - 2 : p.py;
      if (pb <= ptop + 0.01 && nb >= top && ball.x + 2 > p.x && ball.x + 1 < p.x + p.w) {
        if (p.spike) { ball.y = top - 4; die(); return; }
        ball.on = p; ball.y = p.y - 4; ball.vy = 0; sfx.land();
        if (!p.touched) { p.touched = true; scoreF += 2; }
        break;
      }
    }
  }
  for (const p of plats) if (p.heart) {
    const hx = Math.round(p.x + p.w / 2 - 2), hy = p.y - 5;
    if (overlap(ball.x, ball.y, 4, 4, hx, hy, 5, 5)) { p.heart = false; lives = Math.min(9, lives + 1); sfx.life(); }
  }
  if (ball.y < PT || ball.y > SH) { die(); return; }
  scoreF += v * dt * 0.25; score = Math.floor(scoreF);
}

// ---------- disegno ----------
function drawHUD() {
  const lv = Math.max(0, lives);
  if (lv <= 6) for (let i = 0; i < lv; i++) spr(HEART, i * 4, 1); else { spr(HEART, 0, 1); text('x' + lv, 4, 0); }
  text(String(Math.min(99999, score)).padStart(5, '0'), SW - 19, 0);
  const lt = 'LIV ' + speedLvl; text(lt, Math.round((SW - textW(lt)) / 2), 0);
  for (let x = 0; x < SW; x++) { px(x, 6); if (x % 4 !== 3) px(x, 7); if (x % 4 === 1) px(x, 8); }
}
function drawPlat(p) {
  const y = Math.round(p.y);
  for (let i = 0; i < p.w; i++) {
    const x = p.x + i;
    px(x, y); if (i % 2 === 0) px(x, y + 1);
    if (p.spike) { if (i % 3 !== 2) px(x, y - 1); if (i % 3 === 1) px(x, y - 2); }
  }
  if (p.heart) spr(HEART5, Math.round(p.x + p.w / 2 - 2), y - 5);
}
function drawMenu() {
  ctext('ROLL', 4, 2); ctext('DOWN', 17, 2);
  for (let x = 16; x < SW - 16; x++) { px(x, 41); if (x % 2 === 0) px(x, 42); }
  const bx = 16 + (Math.sin(time * 1.6) * 0.5 + 0.5) * (SW - 36);
  spr(BALLF[((Math.floor(bx / 1.5) % 4) + 4) % 4], bx, 37);
  if (blink()) ctext('PREMI A PER GIOCARE', 48);
  ctext('RECORD ' + String(best).padStart(5, '0'), 56);
}
function drawOver() {
  ctext('GAME OVER', 5, 2);
  ctext('PUNTI ' + String(score).padStart(5, '0'), 24);
  ctext('RECORD ' + String(best).padStart(5, '0'), 32);
  if (newRec && blink(4)) ctext('NUOVO RECORD!', 40);
  if (stateT > 0.8 && blink()) ctext('PREMI A', 52);
}
function compose() {
  fb.fill(0);
  if (state === 'menu') return drawMenu();
  if (state === 'over') { drawOver(); for (const q of parts) px(q.x, q.y); return; }
  drawHUD();
  for (const p of plats) drawPlat(p);
  if (state !== 'dead' && !(state === 'ready' && Math.floor(stateT * 8) % 2)) spr(BALLF[((Math.floor(ball.roll / 1.5) % 4) + 4) % 4], ball.x, ball.y);
  if (state === 'play' && speedFlash > 0 && Math.floor(speedFlash * 6) % 2 === 0) ctext('PIU VELOCE!', PT + 3);
  for (const q of parts) px(q.x, q.y);
  if (paused) banner(['PAUSA', 'PREMI A'], PT);
}


// ---------- comandi: croce ◀▶ (o tieni premuta una metà dello schermo), A = OK, START = pausa ----------
const holds = new Map();
function syncHolds() { tch.l = tch.r = false; for (const v of holds.values()) tch[v] = true; }
const ICON = ['................', '#.#.#.#.#.#.#.#.', '.#.#.#.#.#.#.#.#', '................', '..........####..', '................', '......##........', '.....####.......', '.....####.......', '......##........', '...#########....', '................', '................', '.........#######', '................', '..######........'];
return {
  id: 'roll', name: 'ROLL DOWN', desc: 'SCENDI E NON CADERE',
  aspect: SW / SH,
  keys: [['D', 'rotola'], ['A', 'via'], ['START', 'pausa']],
  icon(c, x, y, sz) { drawIcon(c, ICON, { '#': LCD_PIX }, x, y, sz, LCD_BG); },
  enter() { state = 'menu'; stateT = 0; paused = false; holds.clear(); syncHolds(); },
  leave() { paused = false; holds.clear(); syncHolds(); },
  hidden() { if (['play', 'ready', 'dead'].includes(state)) paused = true; },
  update(dt) { kb.l = BTN.left; kb.r = BTN.right; step(dt); },
  draw(c, w, h) { compose(); LCD.render(c, w, h); },
  button(name, down) {
    if (!down) return;
    if (name === 'a') okPress();
    else if (name === 'start') { if (state === 'menu' || state === 'over') okPress(); else togglePause(); }
  },
  pointer(type, x, y, id) {
    if (type === 'down') {
      if (state === 'menu' || state === 'over' || paused) { okPress(); return; }
      holds.set(id, x < W / 2 ? 'l' : 'r'); syncHolds();
    } else if (type === 'move') { if (holds.has(id)) { holds.set(id, x < W / 2 ? 'l' : 'r'); syncHolds(); } }
    else { holds.delete(id); syncHolds(); }
  }
};
})());
