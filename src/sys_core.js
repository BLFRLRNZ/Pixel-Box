// ===================== PIXEL BOX · sistema comune =====================
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const overlap = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const GAMES = [];

// ---------- audio condiviso ----------
let actx = null, master = null, noiseBuf = null, muted = false, volLevel = 2;   // volume: 0 spento, 1 medio, 2 alto
const VOLS = [0, 0.8, 1.6];
try { const v = localStorage.getItem('px_vol'); volLevel = v !== null ? clamp(parseInt(v, 10) || 0, 0, 2) : (localStorage.getItem('px_muted') === '1' ? 0 : 2); } catch (e) {}
muted = volLevel === 0;
// su iPhone "playback" fa suonare i giochi anche con il tasto silenzioso; da spento non interrompe la musica
function audioSession() { try { if (navigator.audioSession) navigator.audioSession.type = muted ? 'ambient' : 'playback'; } catch (e) {} }
function setVolume(l) {
  volLevel = l; muted = l === 0;
  if (master) master.gain.setTargetAtTime(VOLS[l], actx.currentTime, 0.02);
  audioSession();
  try { localStorage.setItem('px_vol', String(l)); } catch (e) {}
}
// I telefoni accendono l'audio solo dentro un gesto completo (dito che si stacca, tap, tasto):
// audioUnlock viene chiamata a ogni tocco finché il suono non è attivo davvero.
function audioUnlock() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.12;
      master = actx.createGain(); master.gain.value = VOLS[volLevel];
      master.connect(comp); comp.connect(actx.destination);
      noiseBuf = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.8), actx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      audioSession();
    } catch (e) { actx = null; }
  }
  if (actx && actx.state !== 'running') {
    actx.resume().catch(() => {});
    try { const s = actx.createBufferSource(); s.buffer = actx.createBuffer(1, 1, 22050); s.connect(actx.destination); s.start(0); } catch (e) {}
  }
}
const aok = () => !muted && actx && actx.state === 'running';
function tone(f, dur, type = 'square', vol = 0.035, to = null, delay = 0) {
  if (!aok()) return;
  const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * 0.85); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol) {
  if (!aok()) return;
  const t = actx.currentTime, s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(200, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + Math.min(dur, 0.78) + 0.02);
}
const seq = (n, d, gap, vol = 0.04) => n.forEach((f, i) => tone(f, d, 'square', vol, null, i * gap));

// ---------- carattere 3×5 e schermo LCD ----------
const FONT = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '111101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', ' ': '000000000000000', '!': '010010010000010', '.': '000000000000010', ':': '000010000010000',
  '-': '000000111000000', '+': '000010111010000', '/': '001001010100100', '?': '111001010000010', 'x': '000101010101000',
  '<': '001010100010001', '>': '100010001010100', '=': '000111000111000'
};
function S(rows) { const h = rows.length, w = rows[0].length, d = new Uint8Array(w * h); rows.forEach((r, y) => { for (let x = 0; x < w; x++) d[y * w + x] = r[x] === '#' ? 1 : 0; }); return { w, h, d }; }
const HEART = S(['#.#', '###', '.#.']), HEART5 = S(['.#.#.', '#####', '#####', '.###.', '..#..']);
const LCD_BG = '#c5cf80', LCD_PIX = '#222b15';

function makeLCD(SW, SH) {
  const fb = new Uint8Array(SW * SH), fbDim = new Uint8Array(SW * SH), ghost = new Float32Array(SW * SH);
  function px(x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SW && y >= 0 && y < SH) fb[y * SW + x] = 1; }
  function unpx(x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SW && y >= 0 && y < SH) fb[y * SW + x] = 0; }
  function spr(s, x, y) { x = Math.round(x); y = Math.round(y); for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) if (s.d[j * s.w + i]) px(x + i, y + j); }
  function text(str, x, y, sc = 1) {
    x = Math.round(x); y = Math.round(y);
    for (let n = 0; n < str.length; n++) {
      const g = FONT[str[n]] || FONT['?'];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1')
        for (let a = 0; a < sc; a++) for (let b = 0; b < sc; b++) px(x + n * 4 * sc + c * sc + a, y + r * sc + b);
    }
  }
  const textW = (str, sc = 1) => (str.length * 4 - 1) * sc;
  const ctext = (str, y, sc = 1) => text(str, Math.round((SW - textW(str, sc)) / 2), y, sc);
  function clearBox(x, y, w, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) unpx(i, j); }
  function frame(x, y, w, h) { for (let i = x; i < x + w; i++) { px(i, y); px(i, y + h - 1); } for (let j = y; j < y + h; j++) { px(x, j); px(x + w - 1, j); } }
  function banner(lines, top = 6) {
    const w = Math.min(SW, Math.max(...lines.map(l => textW(l))) + 8), h = lines.length * 7 + 5;
    const x = Math.round((SW - w) / 2), y = Math.round(top + (SH - top - h) / 2);
    clearBox(x, y, w, h); frame(x, y, w, h);
    lines.forEach((l, i) => ctext(l, y + 3 + i * 7));
  }
  // disegna il framebuffer su tutto lo schermo della console, con scie e ombre dei cristalli liquidi
  function render(c, W, H) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = LCD_BG; c.fillRect(0, 0, W, H);
    const gl = c.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.05, W / 2, H / 2, Math.max(W, H) * 0.62);
    gl.addColorStop(0, 'rgba(255,255,215,0.28)'); gl.addColorStop(0.6, 'rgba(255,255,215,0.06)'); gl.addColorStop(1, 'rgba(40,50,10,0.16)');
    c.fillStyle = gl; c.fillRect(0, 0, W, H);
    const k = Math.min((W - 8) / SW, (H - 8) / SH), ox = Math.round((W - SW * k) / 2), oy = Math.round((H - SH * k) / 2);
    const gap = k >= 5 ? Math.max(1, Math.round(k * 0.09)) : 0, sh = Math.max(1, Math.round(k * 0.16));
    const X = new Int32Array(SW + 1), Y = new Int32Array(SH + 1);
    for (let i = 0; i <= SW; i++) X[i] = ox + Math.round(i * k);
    for (let j = 0; j <= SH; j++) Y[j] = oy + Math.round(j * k);
    for (let i = 0; i < fb.length; i++) ghost[i] = fb[i] ? 1 : ghost[i] * 0.45;
    const pass = (style, test, off) => {
      c.fillStyle = style; c.beginPath();
      for (let i = 0; i < fb.length; i++) if (test(i)) { const x = i % SW, y = (i / SW) | 0; c.rect(X[x] + off, Y[y] + off, X[x + 1] - X[x] - gap, Y[y + 1] - Y[y] - gap); }
      c.fill();
    };
    pass('rgba(30,40,12,0.15)', i => fb[i], sh);
    pass('rgba(34,43,21,0.38)', i => !fb[i] && ghost[i] > 0.3, 0);
    pass('rgba(34,43,21,0.16)', i => !fb[i] && ghost[i] > 0.1 && ghost[i] <= 0.3, 0);
    pass('rgba(34,43,21,0.12)', i => !fb[i] && fbDim[i], 0);
    pass(LCD_PIX, i => fb[i], 0);
    if (gap) {
      c.fillStyle = 'rgba(70,80,30,0.07)';
      for (let x = 1; x <= SW; x++) c.fillRect(X[x] - gap, Y[0], gap, Y[SH] - Y[0]);
      for (let y = 1; y <= SH; y++) c.fillRect(X[0], Y[y] - gap, X[SW] - X[0], gap);
    }
  }
  return { SW, SH, fb, fbDim, ghost, px, unpx, spr, text, textW, ctext, clearBox, frame, banner, render };
}
// piccola icona a pixel per il menu: righe di caratteri, ogni carattere = un colore
function drawIcon(c, rows, pal, x, y, s, bg) {
  const n = rows.length, p = s / n;
  if (bg) { c.fillStyle = bg; c.fillRect(x, y, s, s); }
  for (let j = 0; j < n; j++) for (let i = 0; i < rows[j].length; i++) {
    const col = pal[rows[j][i]]; if (!col) continue;
    c.fillStyle = col; c.fillRect(Math.round(x + i * p), Math.round(y + j * p), Math.ceil(p), Math.ceil(p));
  }
}

// ---------- schermo e tasti della console ----------
const cv = $('scr'), ctx = cv.getContext('2d');
let W = 320, H = 288, dpr = 1;
const BTN = { up: false, down: false, left: false, right: false, a: false, b: false, c: false, v: false, m: false, start: false, select: false };
const kbB = {}, tB = {};
const PF = s => Math.max(6, Math.round(s)) + 'px "Press Start 2P", monospace';
