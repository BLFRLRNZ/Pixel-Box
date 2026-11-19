// ===================== PIXEL BOX · menu, comandi e ciclo =====================
let mode = 'boot', bootT = 0, cur = null, quitAsk = false, gtime = 0, msel = 0, menuRects = [], menuTap = null;
try { msel = clamp(+localStorage.getItem('px_sel') || 0, 0, GAMES.length - 1); } catch (e) {}

$('bzt').textContent = 'PIXEL BOX · ' + GAMES.length + ' GIOCHI';
function landscape() { return innerWidth > innerHeight && innerHeight < 560; }
function legendHTML(g) {
  const chip = k => k === 'D' ? '<span class="k d"></span>' : (k === 'A' || k === 'B') ? '<span class="k r">' + k + '</span>' : '<span class="k p">' + k + '</span>';
  const items = (g.keys || []).concat([['SELECT', 'menu']]);
  return '<div class="gt">' + g.name + '</div><div class="ks">' +
    items.map(([k, t]) => '<span class="it">' + chip(k) + t + '</span>').join('') + '</div>';
}
function layoutFor(g) {
  const con = $('console'), box = $('screenbox'), bz = $('bezel'), lg = $('legend');
  con.classList.remove('fit'); lg.className = ''; box.style.height = ''; bz.style.width = '';
  const asp = g && g.aspect ? g.aspect : 0;
  if (landscape()) {
    if (asp) {
      const r = box.getBoundingClientRect(), bzr = bz.getBoundingClientRect();
      const padW = bzr.width - r.width, want = r.height * asp + padW;
      const side = Math.max($('cl').getBoundingClientRect().width, $('cr').getBoundingClientRect().width) + 24;
      bz.style.width = Math.round(Math.min(innerWidth - 32 - 2 * side, want) - padW) + 'px';   // width è senza i margini interni
    }
  } else if (asp) {
    const r = box.getBoundingClientRect(), h = Math.round(r.width / asp);
    if (h < r.height - 40) {
      lg.innerHTML = legendHTML(g);
      con.classList.add('fit'); box.style.height = h + 'px';
      const lh = lg.getBoundingClientRect().height;
      if (lh < 110) lg.className = lh < 46 ? 'tiny' : 'compact';
    }
  }
  fitScreen();
}
function fitScreen() {
  const r = $('screenbox').getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  const nw = Math.max(16, Math.round(r.width * dpr)), nh = Math.max(16, Math.round(r.height * dpr));
  if (nw === W && nh === H && cv.width === nw) return;
  W = nw; H = nh; cv.width = W; cv.height = H;
  for (const g of GAMES) if (g.resize) g.resize(W, H);
}
addEventListener('resize', () => layoutFor(mode === 'game' ? cur : null));
if (window.ResizeObserver) new ResizeObserver(fitScreen).observe($('screenbox'));

// ---------- tasti: tocco + tastiera ----------
function syncBtn(name) {
  const v = !!(kbB[name] || tB[name]);
  if (v === BTN[name]) return;
  BTN[name] = v;
  const el = { a: 'bA', b: 'bB', start: 'bSta', select: 'bSel' }[name];
  if (el) $(el).classList.toggle('on', v);
  else {
    const rx = (BTN.up ? 13 : 0) - (BTN.down ? 13 : 0), ry = (BTN.right ? 13 : 0) - (BTN.left ? 13 : 0);
    $('dpin').style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  onButton(name, v);
}
const setKb = (n, v) => { kbB[n] = v; syncBtn(n); };
const setT = (n, v) => { tB[n] = v; syncBtn(n); };

const dpadEl = $('dpad'), dptr = new Map();
function dpadDir(e) {
  const r = dpadEl.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < r.width * 0.11) return { x: 0, y: 0 };
  let deg = Math.atan2(dy, dx) * 180 / Math.PI; if (deg < 0) deg += 360;
  const axis = Math.round(deg / 90) * 90, dev = Math.abs(deg - axis);
  if (dev > 30) { const d = Math.round((deg - 45) / 90) * 90 + 45, a = d * Math.PI / 180; return { x: Math.sign(Math.round(Math.cos(a) * 10)), y: Math.sign(Math.round(Math.sin(a) * 10)) }; }
  const a = axis * Math.PI / 180; return { x: Math.round(Math.cos(a)), y: Math.round(Math.sin(a)) };
}
function syncDpad() {
  let d = { x: 0, y: 0 }; for (const v of dptr.values()) d = v;
  setT('left', d.x < 0); setT('right', d.x > 0); setT('up', d.y < 0); setT('down', d.y > 0);
}
dpadEl.addEventListener('pointerdown', e => { e.preventDefault(); audioUnlock(); try { dpadEl.setPointerCapture(e.pointerId); } catch (_) {} dptr.set(e.pointerId, dpadDir(e)); syncDpad(); });
dpadEl.addEventListener('pointermove', e => { if (dptr.has(e.pointerId)) { dptr.set(e.pointerId, dpadDir(e)); syncDpad(); } });
const dpUp = e => { if (dptr.delete(e.pointerId)) syncDpad(); };
dpadEl.addEventListener('pointerup', dpUp); dpadEl.addEventListener('pointercancel', dpUp); dpadEl.addEventListener('lostpointercapture', dpUp);

function bindBtn(id, name) {
  const el = $(id), ids = new Set();
  el.addEventListener('pointerdown', e => { e.preventDefault(); audioUnlock(); try { el.setPointerCapture(e.pointerId); } catch (_) {} ids.add(e.pointerId); setT(name, true); });
  const up = e => { if (ids.delete(e.pointerId) && !ids.size) setT(name, false); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
bindBtn('bA', 'a'); bindBtn('bB', 'b'); bindBtn('bSta', 'start'); bindBtn('bSel', 'select');

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Digit2: 'up', Numpad2: 'up', Digit8: 'down', Numpad8: 'down', Digit4: 'left', Numpad4: 'left', Digit6: 'right', Numpad6: 'right',
  KeyX: 'a', KeyK: 'a', Space: 'a', Digit5: 'a', Numpad5: 'a', KeyZ: 'b', KeyJ: 'b', Digit0: 'b', Numpad0: 'b',
  Enter: 'start', KeyP: 'start', Escape: 'select', Backspace: 'select', ShiftRight: 'select'
};
addEventListener('keydown', e => { const n = KEYS[e.code]; if (!n) return; e.preventDefault(); audioUnlock(); if (!e.repeat) setKb(n, true); });
addEventListener('keyup', e => { const n = KEYS[e.code]; if (n) setKb(n, false); });
addEventListener('blur', () => { for (const n in BTN) { kbB[n] = false; tB[n] = false; syncBtn(n); } dptr.clear(); });
for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) document.addEventListener(ev, audioUnlock, { capture: true, passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden && cur && cur.hidden) cur.hidden(); });

// icona del volume a pixel: alto, medio, spento
const VOLICON = [
  ['.....#.......', '....##.......', '...###.......', '######.#...#.', '######..#.#..', '######...#...', '######..#.#..', '######.#...#.', '...###.......', '....##.......', '.....#.......'],
  ['.....#.......', '....##.......', '...###.......', '######..#....', '######...#...', '######...#...', '######...#...', '######..#....', '...###.......', '....##.......', '.....#.......'],
  ['.....#.......', '....##...#...', '...###....#..', '######..#..#.', '######...#.#.', '######...#.#.', '######...#.#.', '######..#..#.', '...###....#..', '....##...#...', '.....#.......']];
function pixSvg(rows, k) {
  let d = '';
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') d += 'M' + x + ' ' + y + 'h1v1h-1z'; });
  return '<svg viewBox="0 0 ' + rows[0].length + ' ' + rows.length + '" width="' + rows[0].length * k + '" height="' + rows.length * k + '" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="' + d + '"/></svg>';
}
function volIcon() {
  const b = $('vol'); b.innerHTML = pixSvg(VOLICON[volLevel], 2);
  b.classList.toggle('off', volLevel === 0); b.title = ['Audio spento', 'Audio medio', 'Audio alto'][volLevel];
}
volIcon();
$('vol').addEventListener('click', () => { audioUnlock(); setVolume((volLevel + 2) % 3); volIcon(); if (volLevel) tone(1318, 0.07); });

// ---------- versione e aggiornamenti (solo nell'app installata) ----------
let infoOpen = false;
const upd = { st: 'idle', remote: null, last: 0 };
async function checkUpdate(manual) {
  if (!APP.pwa || upd.st === 'checking' || upd.st === 'updating') return;
  upd.st = 'checking'; upd.last = Date.now();
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json(); upd.remote = j;
    upd.st = j.id && j.id !== APP.id ? 'new' : 'ok';
    if (upd.st === 'new') seq([784, 1047, 1319], 0.08, 0.08, 0.04);
  } catch (e) { upd.st = manual ? 'err' : 'idle'; }
}
async function applyUpdate() {
  if (upd.st === 'updating') return;
  upd.st = 'updating';
  try { if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) {}
  try { if (window.caches) for (const k of await caches.keys()) await caches.delete(k); } catch (e) {}
  location.replace(location.pathname + '?agg=' + Date.now());   // indirizzo nuovo: niente copie vecchie
}
if (APP.pwa) {
  if (location.search.indexOf('agg=') >= 0) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  setTimeout(() => checkUpdate(false), 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - upd.last > 10 * 60 * 1000) checkUpdate(false); });
}
function infoButton(name) {
  if (name === 'a') { if (!APP.pwa) return; if (upd.st === 'new') applyUpdate(); else checkUpdate(true); tone(1046, 0.05); }
  else if (name === 'b' || name === 'select' || name === 'start') { infoOpen = false; tone(660, 0.04); }
}

// tocco sullo schermo
const toDev = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); audioUnlock(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  const [x, y] = toDev(e);
  if (mode === 'boot') { bootT = 99; return; }
  if (quitAsk) return;
  if (mode === 'menu') { menuTap = { x, y, id: e.pointerId }; return; }
  if (cur && cur.pointer) cur.pointer('down', x, y, e.pointerId);
});
cv.addEventListener('pointermove', e => { if (mode === 'game' && !quitAsk && cur && cur.pointer) { const [x, y] = toDev(e); cur.pointer('move', x, y, e.pointerId); } });
cv.addEventListener('pointerup', e => {
  const [x, y] = toDev(e);
  if (mode === 'menu' && infoOpen && menuTap && menuTap.id === e.pointerId) { menuTap = null; infoButton(upd.st === 'new' ? 'a' : 'b'); return; }
  if (mode === 'menu' && menuTap && menuTap.id === e.pointerId) {
    menuTap = null;
    const i = menuRects.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (i >= 0) { msel = i; launch(i); }
    return;
  }
  if (mode === 'game' && !quitAsk && cur && cur.pointer) cur.pointer('up', x, y, e.pointerId);
});
cv.addEventListener('pointercancel', e => { menuTap = null; if (mode === 'game' && cur && cur.pointer) cur.pointer('cancel', 0, 0, e.pointerId); });

// ---------- smistamento dei tasti ----------
function onButton(name, down) {
  if (down) audioUnlock();
  if (mode === 'boot') { if (down) bootT = 99; return; }
  if (quitAsk) {
    if (!down) return;
    if (name === 'a') { quitAsk = false; leave(); }
    else if (name === 'b' || name === 'select' || name === 'start') { quitAsk = false; tone(660, 0.04); }
    return;
  }
  if (mode === 'menu') { if (down) menuButton(name); return; }
  if (name === 'select') { if (down) { quitAsk = true; tone(880, 0.05); } return; }
  if (cur) cur.button(name, down);
}
function launch(i) {
  msel = i; try { localStorage.setItem('px_sel', i); } catch (e) {}
  cur = GAMES[i]; mode = 'game'; quitAsk = false;
  seq([1046, 1568], 0.06, 0.07);
  cur.enter();
  layoutFor(cur);
}
function leave() {
  if (cur) cur.leave();
  cur = null; mode = 'menu';
  layoutFor(null);
  tone(523, 0.06);
}
function menuCols() { return W / H > 1.15 ? 2 : 1; }
function menuButton(name) {
  if (infoOpen) return infoButton(name);
  if (name === 'select') { infoOpen = true; tone(988, 0.05); if (APP.pwa && upd.st !== 'new') checkUpdate(true); return; }
  const n = GAMES.length, cols = menuCols();
  let s = msel;
  if (name === 'up') s -= cols; else if (name === 'down') s += cols;
  else if (name === 'left' && cols > 1) s -= 1; else if (name === 'right' && cols > 1) s += 1;
  else if (name === 'a' || name === 'start') { launch(msel); return; }
  else return;
  s = (s + n) % n;
  if (s !== msel) { msel = s; tone(1318, 0.03, 'square', 0.03); }
}

// ---------- disegno del menu ----------
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fitFont(str, maxW, size) { ctx.font = PF(size); let s = size; while (s > 6 && ctx.measureText(str).width > maxW) { s -= 1; ctx.font = PF(s); } return s; }
function shadowText(str, x, y, size, col, sh, align = 'left') {
  ctx.font = PF(size); ctx.textAlign = align; ctx.textBaseline = 'top';
  if (sh) { ctx.fillStyle = sh; ctx.fillText(str, x + Math.max(1, size * 0.08), y + Math.max(1, size * 0.08)); }
  ctx.fillStyle = col; ctx.fillText(str, x, y);
}
const BELL = ['..##..', '.####.', '.####.', '######', '..##..'];
function drawMenu() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#16202c'); bg.addColorStop(1, '#0c1118');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const n = GAMES.length, cols = menuCols(), rows = Math.ceil(n / cols);
  const u = Math.min(W / (cols === 1 ? 21 : 32), H / (rows * 3.7 + 6.2));
  const top = u * 4.6, pad = u * 0.7, gap = u * 0.45;
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const ch = Math.min(u * 3.4, (H - top - u * 1.9 - gap * (rows - 1)) / rows);
  const ts = fitFont('PIXEL BOX', W - pad * 2, u * 1.45);
  shadowText('PIXEL BOX', W / 2, u * 0.9, ts, '#ffd23f', '#c83a24', 'center');
  shadowText('SCEGLI UN GIOCO', W / 2, u * 0.9 + ts * 1.45, Math.min(u * 0.5, ts * 0.45), '#8fa3b8', null, 'center');
  menuRects = [];
  for (let i = 0; i < n; i++) {
    const g = GAMES[i], x = pad + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), sel = i === msel;
    menuRects.push({ x, y, w: cw, h: ch });
    rrect(x, y, cw, ch, u * 0.35); ctx.fillStyle = sel ? '#26384d' : '#1a2430'; ctx.fill();
    if (sel) { ctx.lineWidth = Math.max(2, u * 0.13); ctx.strokeStyle = Math.floor(gtime * 3) % 2 ? '#ffd23f' : '#ffe680'; ctx.stroke(); }
    const isz = ch - u * 0.7, ix = x + u * 0.35, iy = y + u * 0.35;
    g.icon(ctx, ix, iy, isz);
    ctx.lineWidth = Math.max(1, u * 0.06); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.strokeRect(ix, iy, isz, isz);
    const tx = ix + isz + u * 0.55, tw = x + cw - tx - u * 0.4;
    const ns = fitFont(g.name, tw, u * 0.72);
    shadowText(g.name, tx, y + ch * 0.26, ns, sel ? '#ffffff' : '#d9e2ec', '#000000');
    const ds = fitFont(g.desc, tw, u * 0.42);
    shadowText(g.desc, tx, y + ch * 0.26 + ns * 1.55, ds, sel ? '#a9c6e3' : '#7f93a8', null);
    if (g.alert && g.alert() && Math.floor(gtime * 2) % 2 === 0) {
      const bs = u * 0.9; drawIcon(ctx, BELL, { '#': '#ffd23f' }, x + cw - bs - u * 0.3, y + u * 0.25, bs);
    }
  }
  if (upd.st === 'new') {
    const t = 'NUOVA VERSIONE! PREMI SELECT', hs = fitFont(t, W - pad * 2, u * 0.5);
    if (Math.floor(gtime * 2.5) % 2 === 0) shadowText(t, W / 2, H - u * 1.3, hs, '#ffd23f', '#000000', 'center');
  } else {
    const t = cols > 1 ? 'CROCE: SCEGLI   A: GIOCA   SELECT: INFO' : '▲▼ SCEGLI   A GIOCA   SELECT INFO';
    shadowText(t, W / 2, H - u * 1.25, fitFont(t, W - pad * 2, Math.min(u * 0.42, W / 34)), '#6f849b', null, 'center');
  }
  if (infoOpen) drawInfo();
}
function drawInfo() {
  ctx.fillStyle = 'rgba(6,9,14,.82)'; ctx.fillRect(0, 0, W, H);
  const bw = Math.min(W * 0.9, H * 1.25), bh = Math.min(H * 0.62, bw * 0.78), bx = (W - bw) / 2, by = (H - bh) / 2, u = bh / 10;
  rrect(bx, by, bw, bh, u * 0.4); ctx.fillStyle = '#16202c'; ctx.fill(); ctx.lineWidth = Math.max(2, u * 0.12); ctx.strokeStyle = '#ffd23f'; ctx.stroke();
  const line = (t, y, sz, col) => shadowText(t, W / 2, by + u * y, fitFont(t, bw * 0.86, u * sz), col, '#000000', 'center');
  line('PIXEL BOX', 0.9, 1.25, '#ffd23f');
  line('VERSIONE ' + APP.v + ' · ' + APP.date, 2.6, 0.55, '#c9d3e6');
  const st = !APP.pwa ? ['QUESTA PAGINA SI AGGIORNA DA SOLA', '#8fa3b8'] : {
    idle: ['', '#fff'], checking: ['CONTROLLO IN CORSO...', '#c9d3e6'], ok: ['SEI AGGIORNATO!', '#4ade80'],
    new: ['NUOVA VERSIONE ' + (upd.remote && upd.remote.v || '') + ' PRONTA!', '#ffd23f'], err: ['NESSUNA CONNESSIONE: RIPROVA PIU TARDI', '#ff8f8f'], updating: ['AGGIORNAMENTO...', '#ffd23f'] }[upd.st];
  if (st[0]) line(st[0], 4.4, 0.5, st[1]);
  if (APP.pwa) line(upd.st === 'new' ? 'A: AGGIORNA ORA' : 'A: CERCA AGGIORNAMENTI', 6.2, 0.6, upd.st === 'new' ? '#ffd23f' : '#ffffff');
  line('B: INDIETRO', 7.8, 0.5, '#8fa3b8');
}
function drawBoot() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#d9dccb'; ctx.fillRect(0, 0, W, H);
  const u = Math.min(W / 16, H / 12), ts = fitFont('PIXEL BOX', W * 0.86, u * 1.5);
  const y = Math.min(1, bootT / 1.1) * (H / 2 - ts) - ts * 1.2 * (1 - Math.min(1, bootT / 1.1));
  shadowText('PIXEL BOX', W / 2, y, ts, '#2c3a7a', '#a9adb8', 'center');
  if (bootT > 1.2) shadowText(GAMES.length + ' GIOCHI DEI RICORDI', W / 2, H / 2 + ts * 0.6, Math.min(u * 0.5, ts * 0.42), '#5b6488', null, 'center');
  if (bootT > 1.2) shadowText('VERSIONE ' + APP.v, W / 2, H - u * 0.9, u * 0.32, '#8a8fa0', null, 'center');
}
function drawQuit() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(6,10,14,.74)'; ctx.fillRect(0, 0, W, H);
  const u = Math.min(W / 18, H / 12), bw = Math.min(W - u, u * 15), bh = u * 6.4, bx = (W - bw) / 2, by = (H - bh) / 2;
  rrect(bx, by, bw, bh, u * 0.4); ctx.fillStyle = '#1a2430'; ctx.fill(); ctx.lineWidth = Math.max(2, u * 0.14); ctx.strokeStyle = '#ffd23f'; ctx.stroke();
  const s = fitFont('TORNARE AL MENU?', bw - u, u * 0.62);
  shadowText('TORNARE AL MENU?', W / 2, by + u * 1.3, s, '#ffffff', '#000', 'center');
  shadowText('A: SI     B: NO', W / 2, by + u * 3.9, s, '#ffd23f', '#000', 'center');
}

// ---------- ciclo principale ----------
let last = performance.now(), acc = 0, bootDing = false;
const DT = 1 / 60;
function tick(dt) {
  gtime += dt;
  for (const g of GAMES) if (g.background) g.background(dt, g === cur && mode === 'game');
  if (mode === 'boot') {
    bootT += dt;
    if (!bootDing && bootT > 1.1 && bootT < 5) { bootDing = true; tone(1046, 0.08, 'square', 0.04); tone(2093, 0.5, 'square', 0.035, null, 0.1); }
    if (bootT > 2.4) mode = 'menu';
  } else if (mode === 'game' && cur && !quitAsk) cur.update(dt);
}
function frameDraw() {
  if (mode === 'boot') drawBoot();
  else if (mode === 'menu') drawMenu();
  else if (cur) { cur.draw(ctx, W, H); if (quitAsk) drawQuit(); }
}
function loop(t) {
  acc += Math.min(0.1, (t - last) / 1000); last = t;
  while (acc >= DT) { tick(DT); acc -= DT; }
  frameDraw();
  requestAnimationFrame(loop);
}
layoutFor(null);
requestAnimationFrame(loop);
