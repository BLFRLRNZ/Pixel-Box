// ===================== PIXEL KART =====================
GAMES.push((() => {
const SW = 160, SH = 144, HOR = 46, MAP = 1536;      // schermo logico, orizzonte, lato del mondo (le piste nuove sono lunghe quasi il doppio)
// la definizione: ogni punto logico sono Q×Q punti veri. Il mondo (suolo, kart, oggetti, orizzonte) è disegnato a punti veri; testi, menu e indicatori
// restano a misura logica (il contesto è scalato di Q), così non cambia niente del loro disegno. SQ: quanto sono più fitte le figure (kart, alberi, icone).
const Q = 2, RW = SW * Q, RH = SH * Q, HQ = HOR * Q, SQ = 2, NANG = 32;
const TEXHI = (navigator.deviceMemory && navigator.deviceMemory < 4) ? 1 : 2;   // texel del suolo per unità di mondo, in gara (nei menu sempre 1: si costruisce più in fretta)
const CAM_D = 34, CAM_H = 24, FOC = 80, KS = 0.62;   // camera dietro al kart; KS = unità di mondo per pixel di sprite
let camH = CAM_H;                                    // altezza della camera: sale un po' quando il kart salta
const LAPS = 3, TAU = Math.PI * 2, GRAV = 230, PTS = [9, 6, 3, 1];
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const scr = mk(RW, RH), g = scr.getContext('2d'); g.scale(Q, Q);
const frame = g.createImageData(RW, RH), fb = new Uint32Array(frame.data.buffer);
const rq = v => Math.round(v * Q) / Q;   // al punto vero più vicino
const rgb = h => { const n = parseInt(h.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; };
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function crisp(c) {   // niente bordi sfumati: o pieno o trasparente
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] < 120 ? 0 : 255;
  x.putImageData(d, 0, 0); return c;
}
// Scale2x: raddoppia una figura a pixel smussando le scalette (ogni punto guarda i quattro vicini); resta a pixel, ma più fitta
function epx(src) {
  const w = src.width, h = src.height, s = new Uint32Array(src.getContext('2d').getImageData(0, 0, w, h).data.buffer), c = mk(w * 2, h * 2), x = c.getContext('2d'), o = x.createImageData(w * 2, h * 2), d = new Uint32Array(o.data.buffer);
  const at = (X, Y) => s[Math.max(0, Math.min(h - 1, Y)) * w + Math.max(0, Math.min(w - 1, X))];
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const P = at(X, y), A = at(X, y - 1), B = at(X + 1, y), C = at(X - 1, y), D = at(X, y + 1), k = y * 4 * w + X * 2;
    d[k] = C === A && C !== D && A !== B ? A : P; d[k + 1] = A === B && A !== C && B !== D ? B : P; d[k + w * 2] = D === C && D !== B && C !== A ? C : P; d[k + w * 2 + 1] = B === D && B !== A && D !== C ? D : P; }
  x.putImageData(o, 0, 0); return c;
}
// un filo scuro attorno alla figura: la stacca dallo sfondo
function orla(c, col = '#12141c') {
  const x = c.getContext('2d'), w = c.width, h = c.height, d = x.getImageData(0, 0, w, h), a = d.data, m = new Uint8Array(w * h), n = parseInt(col.slice(1), 16);
  for (let i = 0; i < w * h; i++) m[i] = a[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const i = y * w + X; if (m[i]) continue; if ((X > 0 && m[i - 1]) || (X < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) { a[i * 4] = n >> 16; a[i * 4 + 1] = (n >> 8) & 255; a[i * 4 + 2] = n & 255; a[i * 4 + 3] = 255; } }
  x.putImageData(d, 0, 0); return c;
}
function pix(rows, pal) {
  const c = mk(rows[0].length, rows.length), x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (pal[r[i]]) { x.fillStyle = pal[r[i]]; x.fillRect(i, j, 1, 1); } });
  return c;
}
const LS = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const SS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let opt = Object.assign({ auto: false, music: true, vib: true }, LS('pk_opt', {}));
let best = LS('pk2_best', {}), tt = LS('pk2_tt', {}), cups = LS('pk_cups', {}), unlocked = LS('pk_unlock', []);
const vib = ms => { if (opt.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };

// ---------- testo a pixel ----------
const XF = { '°': '010101010000000', "'": '010010000000000', ',': '000000000010100' };
const tw = (s, k = 1) => s.length * 4 * k - k;
function pt(s, x, y, k = 1, col = '#ffffff', align = 'left', sh = '#0b0d12') {
  s = String(s);
  const x0 = Math.round(align === 'center' ? x - tw(s, k) / 2 : align === 'right' ? x - tw(s, k) : x);
  const paint = (dx, dy, c) => {
    g.fillStyle = c;
    for (let i = 0; i < s.length; i++) {
      const f = XF[s[i]] || FONT[s[i]] || FONT['?'];
      for (let j = 0; j < 15; j++) if (f[j] === '1') g.fillRect(x0 + dx + i * 4 * k + (j % 3) * k, y + dy + Math.floor(j / 3) * k, k, k);
    }
  };
  if (sh) { paint(1, 0, sh); paint(0, 1, sh); paint(1, 1, sh); paint(-1, 0, sh); paint(0, -1, sh); }
  paint(0, 0, col);
}
const fmtT = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };

// ---------- piloti ----------
const DRV = [
  { name: 'VOLPE', kart: '#e0562b', head: '#f08a2c', kind: 'fox', top: 150, acc: 140, turn: 2.35, w: 1.0, pers: 'furba' },
  { name: 'RANA', kart: '#3fae3a', head: '#7ad650', kind: 'frog', top: 146, acc: 150, turn: 2.7, w: 0.9, pers: 'prudente' },
  { name: 'ORSO', kart: '#3b6fd6', head: '#8a5a32', kind: 'bear', top: 155, acc: 125, turn: 2.15, w: 1.3, pers: 'aggressivo' },
  { name: 'PINGUINO', kart: '#e2c234', head: '#2a2e38', kind: 'peng', top: 146, acc: 172, turn: 2.45, w: 0.85, pers: 'veloce' },
  { name: 'GATTO', kart: '#9a5ad8', head: '#b8bcc6', kind: 'cat', top: 152, acc: 160, turn: 2.6, w: 0.9, pers: 'furba', lock: 0 },
  { name: 'ROBOT', kart: '#7d8a9c', head: '#d0d8e4', kind: 'robot', top: 160, acc: 135, turn: 2.3, w: 1.4, pers: 'aggressivo', lock: 1 },
];
const isLocked = i => DRV[i].lock !== undefined && !unlocked.includes(DRV[i].name);
// caratteri degli avversari
const PERS = {
  furba: { sc: 0.7, dodge: 1, item: 'smart', pads: 0.9, drift: 0.5 },
  prudente: { sc: 0, dodge: 1, item: 'defensive', pads: 0.5, drift: 0.25, bendSlow: 0.85 },
  aggressivo: { sc: 0.4, dodge: 0.4, item: 'aggressive', pads: 0.5, drift: 0.4, bump: 1 },
  veloce: { sc: 0.3, dodge: 0.7, item: 'speed', pads: 1, drift: 1 },
};
// kart disegnato come piccolo modello 3D (scatole + sfere) visto da NANG angolazioni, a SQ punti per punto logico, con un filo scuro attorno
const PITCH = 0.5;
function kartSprite(dv, yaw) {
  const S = 30, c = mk(S * SQ, S * SQ), x = c.getContext('2d'); x.scale(SQ, SQ);
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const P = (X, Y, Z) => { const xr = X * cy - Y * sy, yr = X * sy + Y * cy; return [S / 2 - yr, S * 0.66 - (Z * cp + xr * sp), xr * cp - Z * sp]; };
  const L = [-0.55, 0.45, 0.7];
  const items = [];
  const box = (x0, x1, y0, y1, z0, z1, col) => {
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(p => P(...p));
    for (const [ix, n] of [[[4, 5, 6, 7], [0, 0, 1]], [[0, 1, 5, 4], [0, -1, 0]], [[2, 3, 7, 6], [0, 1, 0]], [[1, 2, 6, 5], [1, 0, 0]], [[3, 0, 4, 7], [-1, 0, 0]]]) {
      const nx = n[0] * cy - n[1] * sy, ny = n[0] * sy + n[1] * cy, nz = n[2];
      if (-nx * cp + nz * sp <= 0.02) continue;
      const lit = 0.68 + 0.42 * Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      items.push({ d: ix.reduce((s, i) => s + v[i][2], 0) / 4, f: () => { x.fillStyle = shade(col, lit); x.beginPath(); ix.forEach((i, k) => k ? x.lineTo(v[i][0], v[i][1]) : x.moveTo(v[i][0], v[i][1])); x.closePath(); x.fill(); } });
    }
  };
  const ball = (X, Y, Z, r, col) => {
    const [px, py, d] = P(X, Y, Z);
    items.push({ d, f: () => {
      x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
      if (r > 1.6) { x.fillStyle = shade(col, 1.25); x.beginPath(); x.arc(px - r * 0.3, py - r * 0.35, r * 0.5, 0, TAU); x.fill(); }
    } });
  };
  const k = dv.kart, tire = '#22242a', h = dv.head;
  box(-8, 8, -5.5, 5.5, 1.5, 4, k);
  box(8, 11, -3.5, 3.5, 1.5, 3.5, shade(k, 0.9));
  box(-10, -8, -3.5, 3.5, 2, 5, '#3a3d46');
  box(-6.5, -3.5, -3.2, 3.2, 4, 8.5, '#2b2e35');
  box(4, 8, 5.5, 8, 0, 3.5, tire); box(4, 8, -8, -5.5, 0, 3.5, tire);
  box(-8, -3, 5.5, 8.5, 0, 4.5, tire); box(-8, -3, -8.5, -5.5, 0, 4.5, tire);
  box(-4, 0, -2.6, 2.6, 4, 9, shade(k, 0.75));
  // i particolari che a punti fitti si vedono: alettone, muso con la striscia, fari, scarichi, cerchioni, volante
  box(-11, -9.2, -6, 6, 5.6, 6.5, shade(k, 0.8)); box(-10.4, -9.8, -5.2, -4.4, 4, 5.6, '#2b2e35'); box(-10.4, -9.8, 4.4, 5.2, 4, 5.6, '#2b2e35');
  box(8.1, 11.1, -1, 1, 3.5, 3.8, '#f4f4f4'); box(10.9, 11.3, -3, -1.6, 2.1, 3.1, '#fff4b8'); box(10.9, 11.3, 1.6, 3, 2.1, 3.1, '#fff4b8');
  box(-11.4, -10, -2.6, -1.6, 2.2, 3.2, '#9aa4b2'); box(-11.4, -10, 1.6, 2.6, 2.2, 3.2, '#9aa4b2');
  ball(6, 8.1, 1.8, 1.0, '#aab2c0'); ball(6, -8.1, 1.8, 1.0, '#aab2c0'); ball(-5.5, 8.6, 2.3, 1.3, '#aab2c0'); ball(-5.5, -8.6, 2.3, 1.3, '#aab2c0');
  box(1.2, 1.8, -1.8, 1.8, 5.6, 6.6, '#1c1e24');
  if (dv.kind === 'robot') { box(-4.2, 0.8, -3, 3, 9.2, 14.6, h); box(0.8, 1.3, -2.4, 2.4, 11.2, 13.2, '#3ab0ff'); box(-2.1, -1.5, -0.3, 0.3, 14.6, 16.8, '#9aa4b2'); ball(-1.8, 0, 17.4, 1.0, '#ff4a3a'); }
  else ball(-1.5, 0, 12, 3.6, h);
  if (dv.kind === 'fox') { ball(-2.4, 2.3, 15.2, 1.5, h); ball(-2.4, -2.3, 15.2, 1.5, h); ball(1.7, 0, 11.2, 1.7, '#f6ecdc'); ball(2.9, 0, 11.5, 0.7, '#1a1a1a'); ball(1.2, 1.3, 13, 0.6, '#1a1a1a'); ball(1.2, -1.3, 13, 0.6, '#1a1a1a'); }
  if (dv.kind === 'frog') { ball(-0.6, 2.1, 14.6, 1.7, h); ball(-0.6, -2.1, 14.6, 1.7, h); ball(0.7, 2.1, 14.9, 0.8, '#101010'); ball(0.7, -2.1, 14.9, 0.8, '#101010'); }
  if (dv.kind === 'bear') { ball(-2.2, 2.8, 14.8, 1.5, h); ball(-2.2, -2.8, 14.8, 1.5, h); ball(1.6, 0, 11.4, 1.6, '#c99a6a'); ball(2.9, 0, 11.9, 0.7, '#141414'); ball(1.1, 1.3, 13.1, 0.55, '#141414'); ball(1.1, -1.3, 13.1, 0.55, '#141414'); }
  if (dv.kind === 'peng') { ball(0.4, 0, 11.8, 2.7, '#f4f6f8'); ball(2.4, 0, 11.3, 1.1, '#f0a020'); ball(1.6, 1.1, 12.9, 0.55, '#101010'); ball(1.6, -1.1, 12.9, 0.55, '#101010'); }
  if (dv.kind === 'cat') { ball(-2.2, 2.4, 15.3, 1.4, h); ball(-2.2, -2.4, 15.3, 1.4, h); ball(-2, 2.4, 15.9, 0.7, '#f4a0b4'); ball(-2, -2.4, 15.9, 0.7, '#f4a0b4'); ball(1.7, 0, 11.3, 1.5, '#f6f6f6'); ball(2.9, 0, 11.7, 0.6, '#f07a9a'); ball(1.3, 1.3, 13, 0.6, '#3ac06a'); ball(1.3, -1.3, 13, 0.6, '#3ac06a'); }
  items.sort((a, b) => b.d - a.d).forEach(it => it.f());
  return orla(crisp(c));
}
let SPR = null;
function ensureSprites() { if (!SPR) SPR = DRV.map(dv => Array.from({ length: NANG }, (_, i) => kartSprite(dv, i / NANG * TAU))); }

// ---------- oggetti ----------
// (dalla 2.43 cinque in più: stella, fulmine, bomba, triplo turbo, fantasma)
const ITEMS = ['turbo', 'rocket', 'oil', 'shield', 'magnet', 'ink', 'spring', 'star', 'bolt', 'bomb', 'turbo3', 'ghost'];
// quanto spesso esce ogni oggetto, per posizione (primo ... quarto): chi è indietro pesca le cose forti
const ODDS = [[5, 0, 30, 28, 0, 10, 15, 0, 0, 7, 0, 5], [16, 16, 12, 12, 8, 8, 8, 2, 2, 8, 4, 4], [14, 18, 4, 8, 14, 8, 4, 6, 6, 6, 9, 3], [10, 16, 0, 4, 16, 4, 3, 14, 12, 5, 14, 2]];
const NOMI = { turbo: 'TURBO', rocket: 'RAZZO', oil: 'OLIO', shield: 'SCUDO', magnet: 'CALAMITA', ink: 'INCHIOSTRO', spring: 'MOLLA', star: 'STELLA', bolt: 'FULMINE', bomb: 'BOMBA', turbo3: 'TRIPLO TURBO', turbo2: 'TURBO X2', ghost: 'FANTASMA' };
const ICON = {
  turbo: pix(['....aa....', '...abba...', '..abccba..', '..abccba..', '.abcddcba.', '.abcddcba.', '..abccba..', '...abba...', '....aa....', '..........'], { a: '#d8401c', b: '#f07a20', c: '#ffc145', d: '#fff4b8' }),
  rocket: pix(['....aa....', '...abba...', '...bccb...', '...bccb...', '...bccb...', '..dbccbd..', '.dd.bb.dd.', '.d..ee..d.', '....ff....', '....e.....'], { a: '#e02a18', b: '#c9cfda', c: '#eef1f6', d: '#5a6378', e: '#ffc145', f: '#ff6b2a' }),
  oil: pix(['..........', '....a.....', '...aa.....', '...aba....', '..aabba...', '..abbba...', '..aaaaa...', '...aaa....', '.aaaaaaa..', 'aaaaaaaaa.'], { a: '#1c1c24', b: '#5b5b78' }),
  shield: pix(['..aaaaaa..', '.abbbbbba.', 'abbccbbbba', 'abcbbbbbba', 'abbbbbbbba', 'abbbbbbbba', 'abbbbbbbba', '.abbbbbba.', '..abbbba..', '...aaaa...'], { a: '#2a6fb0', b: '#7cc8f4', c: '#e6f6ff' }),
  magnet: pix(['.gg....gg.', '.gg....gg.', '.rr....rr.', '.rR....rR.', '.rR....rR.', '.rrR..rrR.', '..rrrrrR..', '...rRRR...', '..........', '..........'], { g: '#e6ecf4', r: '#e8302a', R: '#9a1a14' }),
  ink: pix(['....a.....', '..a.aa.a..', '...aaaa...', '.aaabbaaa.', '..aabbbaa.', '.aaaabaaa.', '..aaaaaa..', '.a.aaaa.a.', '....a.....', '..........'], { a: '#1a1a2a', b: '#6a4aa8' }),
  star: pix(['....aa....', '...abba...', '...abba...', 'aaaabbaaaa', 'abbbbbbbba', '.abbccbba.', '..abbbba..', '..abbbba..', '.abbaabba.', '.aa....aa.'], { a: '#c88a10', b: '#ffd23f', c: '#fff4b8' }),
  bolt: pix(['.....aaa..', '....abba..', '...abba...', '..abba....', '.abbbbba..', '..aabbba..', '....abba..', '...abba...', '..aba.....', '..aa......'], { a: '#b87a00', b: '#ffe14a' }),
  bomb: pix(['......c...', '.....d.c..', '....dd....', '..aaaaaa..', '.aabbaaaa.', '.abbaaaaa.', '.aaaaaaaa.', '.aaaaaaaa.', '..aaaaaa..', '...aaaa...'], { a: '#1c1c24', b: '#5b5b78', c: '#ffc145', d: '#8a6a44' }),
  ghost: pix(['...aaaa...', '..abbbba..', '.abbbbbba.', '.abcbbcba.', '.abcbbcba.', '.abbbbbba.', '.abbbbbba.', '.abbbbbba.', '.ababbaba.', '.a.a..a.a.'], { a: '#8a96b8', b: '#eef2fa', c: '#1c2030' }),
  spring: pix(['..aaaaaa..', '.b......b.', '..aaaaaa..', '.b......b.', '..aaaaaa..', '.b......b.', '..aaaaaa..', '.cccccccc.', '.cccccccc.', '..........'], { a: '#d8dee8', b: '#7a8496', c: '#d8401c' }),
};
const epxPix = (rows, pal) => epx(pix(rows, pal));
for (const k in ICON) ICON[k] = epx(ICON[k]);
ICON.turbo3 = ICON.turbo2 = ICON.turbo;   // (il numero lo scrive il riquadro)
const GEM = [0, 1, 2, 3].map(i => epxPix(['....a....', '...aba...', '..abcba..', '.abcccba.', 'abccdccba', '.abcccba.', '..abcba..', '...aba...', '....a....'],
  [{ a: '#7a2ad8', b: '#b06cf2', c: '#e0b8ff', d: '#ffffff' }, { a: '#1f8ad8', b: '#5cc0f4', c: '#bfe8ff', d: '#ffffff' }, { a: '#1c9a5a', b: '#4ad68a', c: '#bff4d6', d: '#ffffff' }, { a: '#d8901f', b: '#f4c050', c: '#ffe8a8', d: '#ffffff' }][i]));
const ROCKET = epxPix(['..aa..', '.abba.', '.bccb.', 'dbccbd', 'd.ee.d', '..ff..'], { a: '#e02a18', b: '#c9cfda', c: '#eef1f6', d: '#5a6378', e: '#ffc145', f: '#ff6b2a' });
const TROPHY = [['#c89a1c', '#ffe066'], ['#8a96a8', '#e6ecf4'], ['#9a5a2a', '#e8a060']].map(([a, b]) => epxPix(['.aaaaaaaa.', 'aabbbbbbaa', 'a.abbbba.a', 'a.abbbba.a', '.aabbbbaa.', '...abba...', '....aa....', '....aa....', '...aaaa...', '..aaaaaa..'], { a, b }));

// ---------- piste ----------
// (mondo di 1536 unità: i giri sono lunghi quasi il doppio di prima. sc: tra quali punti del tracciato corre la scorciatoia, scelti con /tmp/kt/piste.py:
// un taglio dritto che fa risparmiare tra 160 e 330 unità senza passare vicino ad altri tratti)
const TRACKS = [
  { name: 'PRATO', w: 72, off: 46, grip: 1.0, offSlow: 0.55, gapK: 'water', song: 0, sc: [570, 656], dirt: ['#8a6a44', '#6a4e30'], pts: [[480, 165], [800, 165], [1130, 195], [1335, 330], [1375, 560], [1260, 740], [1040, 760], [930, 920], [1040, 1090], [1270, 1110], [1390, 1260], [1290, 1400], [1010, 1410], [800, 1330], [640, 1380], [400, 1370], [220, 1230], [300, 1010], [520, 930], [600, 760], [460, 620], [240, 640], [150, 470], [190, 270], [300, 180]],
    sky: ['#5fb4ee', '#7ec8f0', '#a8dcf6'], haze: '#c8e8f6', off1: '#58b048', off2: '#4ea040', far: '#2d6e32', far2: '#25602a', road: '#8a8a92', deco: 'tree', hills: ['#5aa45a', '#3e8a46'], dust: '#7ab85a' },
  { name: 'SPIAGGIA', w: 66, off: 40, grip: 0.95, offSlow: 0.45, gapK: 'water', song: 1, sc: [412, 534], dirt: ['#c8a868', '#a88a50'], pts: [[500, 175], [900, 170], [1220, 210], [1380, 360], [1370, 560], [1180, 650], [900, 600], [760, 740], [900, 900], [1200, 900], [1380, 1040], [1360, 1300], [1140, 1400], [860, 1340], [700, 1160], [480, 1120], [380, 1300], [200, 1340], [120, 1140], [240, 900], [460, 860], [520, 660], [330, 560], [140, 640], [110, 420], [220, 250]],
    sky: ['#3fa4ec', '#62b8f0', '#a0d8f8'], haze: '#d6eefa', off1: '#ecd28c', off2: '#e0c47c', far: '#2f86d2', far2: '#4aa2e6', road: '#9a9aa2', deco: 'palm', hills: ['#7ab8e0', '#5a9ad0'], dust: '#f0dca0' },
  { name: 'GHIACCIO', w: 78, off: 44, grip: 0.38, offSlow: 0.5, gapK: 'crack', song: 2, snow: true, sc: [140, 252], dirt: ['#c8d4e2', '#a8b8cc'], pts: [[500, 190], [900, 180], [1260, 230], [1400, 430], [1300, 640], [1060, 700], [1000, 900], [1180, 1060], [1390, 1180], [1340, 1390], [1000, 1400], [760, 1300], [540, 1390], [300, 1360], [150, 1180], [230, 960], [470, 900], [560, 700], [400, 560], [180, 560], [130, 360], [250, 220]],
    sky: ['#8cb4dc', '#a8c8e8', '#d8e8f6'], haze: '#e8f0f8', off1: '#f2f6fa', off2: '#e0e8f2', far: '#c4d6e8', far2: '#b0c6dc', road: '#8aaed0', deco: 'pine', hills: ['#e8eef6', '#aac0d8'], dust: '#ffffff' },
  { name: 'VULCANO', w: 60, off: 36, grip: 0.9, offSlow: 0.4, gapK: 'lava', song: 3, lava: true, sc: [376, 474], dirt: ['#5a4840', '#3e322c'], pts: [[380, 150], [620, 140], [770, 280], [960, 170], [1220, 150], [1400, 280], [1380, 480], [1200, 560], [1000, 480], [840, 600], [960, 780], [1220, 760], [1400, 900], [1380, 1120], [1180, 1200], [1260, 1380], [1040, 1420], [860, 1280], [700, 1400], [460, 1400], [330, 1240], [480, 1080], [700, 1060], [760, 880], [600, 760], [400, 860], [220, 1020], [110, 860], [200, 660], [420, 600], [560, 460], [400, 340], [200, 400], [110, 250], [220, 160]],
    sky: ['#2a1022', '#4a1a2a', '#7a2a2a'], haze: '#8a3a2a', off1: '#4a3a3a', off2: '#3e3030', far: '#d8481c', far2: '#f08a20', road: '#5c5c66', deco: 'rock', hills: ['#3a1c22', '#5a2228'], dust: '#6a5a5a' },
  { name: 'CITTA', w: 64, off: 34, grip: 0.95, offSlow: 0.6, gapK: 'canal', song: 4, night: true, lanes: true, sc: [546, 664], scSlow: 0.95, dirt: ['#6a6058', '#564c44'], pts: [[420, 160], [890, 160], [960, 230], [960, 490], [1030, 560], [1290, 560], [1360, 630], [1360, 1290], [1290, 1360], [1030, 1360], [960, 1290], [960, 1030], [890, 960], [630, 960], [560, 1030], [560, 1290], [490, 1360], [230, 1360], [160, 1290], [160, 830], [230, 760], [290, 760], [360, 690], [360, 430], [290, 360], [230, 360], [160, 290], [160, 230], [230, 160]],
    sky: ['#070a1c', '#10163a', '#1c2450'], haze: '#283060', off1: '#7a7e8a', off2: '#6e727e', far: '#24262f', far2: '#3a3c48', road: '#4c4e5a', deco: 'city', hills: ['#1a1e3a', '#262c50'], dust: '#9a9ea8' },
  { name: 'DESERTO', w: 70, off: 42, grip: 0.92, offSlow: 0.45, gapK: 'quick', song: 5, sc: [292, 374], dirt: ['#b8945a', '#9a7a48'], pts: [[150, 820], [170, 480], [340, 230], [680, 160], [1000, 170], [1300, 220], [1420, 420], [1320, 620], [1080, 620], [900, 470], [700, 540], [600, 760], [780, 920], [1060, 880], [1320, 900], [1430, 1100], [1340, 1340], [1080, 1410], [860, 1290], [640, 1380], [400, 1400], [180, 1300], [130, 1060]],
    sky: ['#e07a3a', '#ec9a54', '#f6c88a'], haze: '#f8dcb0', off1: '#e8c27a', off2: '#dcb46a', far: '#b0542a', far2: '#8a3c1c', road: '#9c8c7c', deco: 'cactus', hills: ['#d89850', '#b8602a'], dust: '#e8c890' },
];
const GAPC = { water: ['#2f86d2', '#7cc8f4'], lava: ['#e8501c', '#ffc145'], crack: ['#24344e', '#3e5a80'], canal: ['#1e4a7a', '#4a86c0'], quick: ['#b88a50', '#8a6030'] };
const CUPS = [{ name: 'COPPA SOLE', t: [0, 1, 5] }, { name: 'COPPA LUNA', t: [2, 4, 3] }];
const DIFF = [{ name: 'FACILE', ai: 0.86, rs: 0.2 }, { name: 'NORMALE', ai: 0.94, rs: 0.4 }, { name: 'DIFFICILE', ai: 1.01, rs: 0.6 }];
function spline(P, step) {
  const dense = [], n = P.length;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let t = 0; t < 1; t += 0.02) {
      const t2 = t * t, t3 = t2 * t, q = j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      dense.push([q(0), q(1)]);
    }
  }
  const out = [dense[0]]; let acc = 0;
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length]; let seg = Math.hypot(b[0] - a[0], b[1] - a[1]), t0 = 0;
    while (acc + seg * (1 - t0) >= step) { const need = step - acc, f = t0 + need / seg; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); t0 = f; acc = 0; if (t0 >= 1) break; }
    acc += seg * (1 - t0);
  }
  if (Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < step * 0.5) out.pop();
  return out;
}
const DECO = {
  tree: () => pix(['.....aaaa.....', '...aabbbbaa...', '..abbbccbbba..', '.abbbccccbbba.', '.abbbbccbbbba.', 'abbbbbbbbbbbba', 'abbcbbbbbbbbba', 'abbbbbbbbcbbba', '.abbbbbbbbbba.', '.aabbbbbbbbaa.', '..aaabbbbaaa..', '....aaddaa....', '......dd......', '......dd......', '.....deed.....', '.....dddd.....'], { a: '#1f5a24', b: '#3e9a3a', c: '#6cc85a', d: '#6a4424', e: '#4a2e18' }),
  palm: () => pix(['..aa....aa....', '.abba..abba...', 'abbbbaabbbba..', '.aabbbbbbaa...', '...aabbbaa....', '..ab.cc.ba....', '.ab..cc..ba...', '.....cc.......', '.....dc.......', '......cd......', '......cc......', '......dc......', '.....cd.......', '.....cc.......', '.....dc.......', '....cccc......'], { a: '#1f6a2a', b: '#3eae4a', c: '#a8784a', d: '#7a5230' }),
  pine: () => pix(['......a.......', '.....aaa......', '....awbaa.....', '.....aba......', '....aabba.....', '...awbbbaa....', '....abbba.....', '...aabbbba....', '..awbbbbbaa...', '...abbbbba....', '..aabbbbbba...', '.awbbbbbbbaa..', '.aaaaaaaaaaa..', '......cc......', '......cc......', '.....cccc.....'], { a: '#1a4a3a', b: '#2e7a5a', w: '#f4f8fc', c: '#5a3a24' }),
  rock: () => pix(['....aaaa....', '..aabbbbaa..', '.abbbcbbbba.', '.abbbbbcbba.', 'abbcbbbbbbba', 'abbbbbbcbbba', 'abbbdbbbbbba', 'aaabbbbbdaaa'], { a: '#1e1414', b: '#3a2a2a', c: '#5a4444', d: '#f07a20' }),
  sandrock: () => pix(['....aaaa....', '..aabbbbaa..', '.abbbcbbbba.', '.abbbbbcbba.', 'abbcbbbbbbba', 'abbbbbbcbbba', 'abbbbbbbbbba', 'aaabbbbbbaaa'], { a: '#6a3418', b: '#a8582a', c: '#c87a44' }),
  cactus: () => pix(['.....aa.....', '....abba....', '....abba..a.', '.a..abba.aba', 'aba.abba.aba', 'aba.abba.aba', 'abaaabbaaaba', '.abbbbbbbba.', '..aaabbaaa..', '....abba....', '....abba....', '....abba....', '....abba....', '....abba....', '...cabbac...', '..cccccccc..'], { a: '#2a6a2a', b: '#4aa44a', c: '#c8a060' }),
  lamp: () => pix(['..aaaa..', '.abwwba.', '..aaaa..', '...cc...', ...Array(18).fill('...cc...'), '..cccc..', '.cccccc.'], { a: '#3a3c48', b: '#ffd86a', w: '#fff8c8', c: '#5a5e6c' }),
  building: R => { const w = 16, h = 30 + (R() * 12 | 0), rows = []; for (let y = 0; y < h; y++) { let r = ''; for (let x = 0; x < w; x++) r += (x === 0 || x === w - 1 || y === 0) ? 'a' : (y > 1 && y < h - 1 && x % 3 && y % 3) ? (R() < 0.45 ? 'w' : 'd') : 'b'; rows.push(r); } return pix(rows, { a: '#14161e', b: '#2a2e3e', d: '#1c2030', w: '#ffd86a' }); },
};
function skyStrip(T, R) {
  // la striscia dell'orizzonte, a punti veri (larga 256 punti logici, alta 30)
  const W = 256 * Q, H = 30 * Q, c = mk(W, H), x = c.getContext('2d');
  if (T.night) {   // la città: palazzi con le finestre accese
    for (let i = 0; i < W;) { const w = (8 + (R() * 18 | 0)) * Q, h = (8 + (R() * 20 | 0)) * Q, col = R() < 0.5 ? T.hills[0] : T.hills[1];
      x.fillStyle = col; x.fillRect(i, H - h, w, h); x.fillStyle = shade(col, 1.4); x.fillRect(i, H - h, w, 1); x.fillRect(i, H - h, 1, h);
      for (let wy = H - h + 3; wy < H - 2; wy += 4) for (let wx = i + 2; wx < i + w - 2; wx += 3) if (R() < 0.4) { x.fillStyle = R() < 0.82 ? '#ffd86a' : '#9ad0ff'; x.fillRect(wx, wy, 2, 2); }
      if (R() < 0.3) { x.fillStyle = '#ff5a4a'; x.fillRect(i + (w >> 1), H - h - 3, 1, 3); }
      i += w; }
    return c;
  }
  for (let layer = 0; layer < 2; layer++) {
    const col = T.hills[layer], orlo = shade(col, layer ? 1.22 : 1.12), buio = shade(col, 0.88);
    for (let i = 0; i < W; i++) {
      const u = i / Q; let hgt;
      if (T.deco === 'cactus') { const q = u % 128; hgt = layer === 0 ? 6 + 4 * Math.sin(u / 256 * TAU * 2) + 2 * Math.sin(u / 256 * TAU * 9) : (q > 40 && q < 70 ? 16 : q > 34 && q < 76 ? 16 - (q < 55 ? 40 - q : q - 70) * 2.6 : 0); }
      else hgt = layer === 0 ? 12 + 7 * Math.sin(u / 256 * TAU * 3) + 3 * Math.sin(u / 256 * TAU * 7) : 5 + 4 * Math.abs(Math.sin(u / 256 * TAU * 5 + 1)) + (T.lava && Math.abs(u - 128) < 30 ? 14 - Math.abs(u - 128) * 0.45 : 0);
      hgt = Math.max(0, Math.min(H, Math.round(hgt * Q))); if (!hgt) continue;
      x.fillStyle = col; x.fillRect(i, H - hgt, 1, hgt); x.fillStyle = orlo; x.fillRect(i, H - hgt, 1, Math.min(hgt, Q));
      if (hgt > 5 && (i * 7 + layer * 3) % 11 < 3) { x.fillStyle = buio; x.fillRect(i, H - hgt + 3 + ((i * 13) % Math.max(1, hgt - 4)), 1, 2); }   // qualche ombra sui fianchi
    }
  }
  if (!T.lava) { for (let k = 0; k < 6; k++) { const cx = R() * W | 0, cy = 4 + (R() * 14 | 0), w = 20 + (R() * 16 | 0); x.fillStyle = 'rgba(255,255,255,.92)'; x.fillRect(cx, cy, w, 3); x.fillRect(cx + 4, cy - 2, w - 10, 2); x.fillRect(cx + 9, cy - 3, w - 20, 1); x.fillStyle = 'rgba(200,220,240,.9)'; x.fillRect(cx + 2, cy + 3, w - 4, 1); } }
  else { x.fillStyle = '#f07a20'; x.fillRect(125 * Q, 6 * Q, 6 * Q, 2 * Q); x.fillStyle = '#ffc145'; x.fillRect(127 * Q, 7 * Q, 2 * Q, Q); x.fillStyle = '#fff4b8'; x.fillRect(128 * Q, 7 * Q, 1, 1); }
  return c;
}
let TR = null, tIdx = 0;
const mixC = (h1, h2, f) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16), m = sh => Math.round(((a >> sh) & 255) + (((b >> sh) & 255) - ((a >> sh) & 255)) * f); return (0xff000000 | (m(0) << 16) | (m(8) << 8) | m(16)) >>> 0; };
// ts: texel del suolo per unità di mondo (1 nei menu, TEXHI in gara). Il disegno è lo stesso; a 2 i bordi e la grana vengono più fini
function buildTrack(i, ts = 1) {
  const T = TRACKS[i], c = spline(T.pts, 8), n = c.length, R = rng(1234 + i * 77), TM = MAP * ts;
  const ang = c.map((p, j) => { const q = c[(j + 1) % n], o = c[(j - 1 + n) % n]; return Math.atan2(q[1] - o[1], q[0] - o[0]); });
  const nrm = ang.map(a => [-Math.sin(a), Math.cos(a)]);
  const path = x => { x.beginPath(); c.forEach((p, j) => j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.lineJoin = 'round'; x.lineCap = 'round'; };
  const quad = (x, j0, j1, l0, l1) => { const a = c[j0 % n], b = c[j1 % n], na = nrm[j0 % n], nb = nrm[j1 % n]; x.beginPath(); x.moveTo(a[0] + na[0] * l0, a[1] + na[1] * l0); x.lineTo(b[0] + nb[0] * l0, b[1] + nb[1] * l0); x.lineTo(b[0] + nb[0] * l1, b[1] + nb[1] * l1); x.lineTo(a[0] + na[0] * l1, a[1] + na[1] * l1); x.closePath(); };
  // i motivi si disegnano a misura di texel (lato in unità × ts) e si stendono senza ingrandirli: a ts 2 la grana è il doppio più fine
  const pat = (w, fn) => { const p = mk(w * ts, w * ts), px = p.getContext('2d'); fn(px, w * ts); return p; };
  const dots = (px, W, k, cols, lw = 1) => { for (let q = 0; q < k * ts * ts; q++) { px.fillStyle = cols[q % cols.length]; px.fillRect(R() * W | 0, R() * W | 0, lw, 1); } };
  // scorciatoia (sentiero dritto), poi rampe e strisce turbo nei tratti più dritti rimasti liberi
  const inR = (j, a, b) => ((j - a + n) % n) <= ((b - a + n) % n);
  const used = [[n - 14, 14]], avoid = j => used.some(([a, b]) => inR(j, a, b));
  const sc = T.sc && T.sc[1] < n ? { i: T.sc[0], j: T.sc[1] } : null;
  if (sc) used.push([sc.i - 16, sc.j + 16]);
  const curv = j => Math.abs(angDiff(ang[(j + 6) % n], ang[j % n]));
  const flat = (f0, f1) => { let bj = -1, bv = 9; for (let j = Math.floor(f0 * n); j < Math.floor(f1 * n); j++) { if (avoid(j) || avoid(j + 8)) continue; const v = curv(j) + curv(j + 6); if (v < bv) { bv = v; bj = j; } } return bj; };
  const ramps = [];
  for (const [f0, f1, f2, f3] of [[0.3, 0.46, 0.46, 0.56], [0.64, 0.8, 0.8, 0.9]]) {   // due salti per giro, ora che il giro è lungo
    let j = flat(f0, f1); if (j < 0) j = flat(f2, f3); if (j < 0 && !ramps.length) j = Math.floor(n * 0.4); if (j < 0) continue;
    used.push([j - 10, j + 14]); ramps.push({ j, g0: j + 3, g1: j + 5 });
  }
  const ramp = ramps[0], gap = { j0: ramp.g0, j1: ramp.g1 };
  const pads = [[0.05, 0.17], [0.2, 0.3], [0.5, 0.62], [0.9, 0.97]].map(([f0, f1], k) => {
    let j = flat(f0, f1); if (j < 0) j = flat(f0 - 0.06, f1 + 0.06); if (j < 0) return null;
    used.push([j - 6, j + 8]);
    return { j0: j, j1: (j + 3) % n, l: (k % 2 ? 1 : -1) * 0.22 * T.w, hw: 0.17 * T.w };
  }).filter(Boolean);
  // il sentiero: una striscia dritta, più larga dove si stacca dalla pista e dove ci rientra
  const scPath = (x, wd, style) => {
    const A = c[sc.i], B = c[sc.j], L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, e = Math.min(L / 2, T.w / 2 + T.off + 26);
    x.lineCap = 'round'; x.strokeStyle = style;
    x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(B[0], B[1]); x.lineWidth = wd; x.stroke();
    x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(A[0] + ux * e, A[1] + uy * e); x.moveTo(B[0], B[1]); x.lineTo(B[0] - ux * e, B[1] - uy * e); x.lineWidth = wd + 22; x.stroke();
  };
  // ---- aspetto ----
  const cv = mk(TM, TM), x = cv.getContext('2d'); x.scale(ts, ts);
  const P = cvs => { const p = x.createPattern(cvs, 'repeat'); if (ts !== 1 && p.setTransform) p.setTransform(new DOMMatrix([1 / ts, 0, 0, 1 / ts, 0, 0])); return p; };
  const farP = pat(32, (p, W) => { p.fillStyle = T.far; p.fillRect(0, 0, W, W); p.fillStyle = T.far2; for (let k = 0; k < 14; k++) p.fillRect(R() * W | 0, R() * W | 0, (T.deco === 'palm' ? 4 : 2) * ts, T.deco === 'palm' ? ts : 2 * ts);
    dots(p, W, 18, [shade(T.far, 1.12), shade(T.far, 0.9)]); if (T.night) { p.fillStyle = '#ffd86a'; for (let k = 0; k < 3; k++) p.fillRect(R() * W | 0, R() * W | 0, 1, 1); } });
  x.fillStyle = P(farP); x.fillRect(0, 0, MAP, MAP);
  const offP = pat(64, (p, W) => { p.fillStyle = T.off1; p.fillRect(0, 0, W, W); p.fillStyle = T.off2; p.fillRect(0, 0, W / 2, W / 2); p.fillRect(W / 2, W / 2, W / 2, W / 2);
    dots(p, W, 70, [shade(T.off1, 0.92), shade(T.off1, 1.07), shade(T.off2, 0.9)]);
    if (!T.night && !T.lava) dots(p, W, 22, [shade(T.off2, T.snow ? 0.94 : 0.8)], 2);   // ciuffi d'erba, righe nella sabbia, ombre nella neve
    if (T.night) { p.fillStyle = '#5e626e'; for (let k = 0; k < W; k += 8 * ts) { p.fillRect(k, 0, 1, W); p.fillRect(0, k, W, 1); } } });
  path(x); x.lineWidth = T.w + 2 * T.off + 5; x.strokeStyle = shade(T.off2, T.night ? 0.5 : 0.66); x.stroke();   // un bordo scuro dove finisce il fuori pista
  path(x); x.lineWidth = T.w + 2 * T.off; x.strokeStyle = P(offP); x.stroke();
  if (sc) {
    const dirtP = pat(16, (p, W) => { p.fillStyle = T.dirt[0]; p.fillRect(0, 0, W, W); dots(p, W, 14, [T.dirt[1], shade(T.dirt[0], 1.1)], 2); });
    scPath(x, 38, T.dirt[1]); scPath(x, 32, P(dirtP));
  }
  path(x); x.lineWidth = T.w + 10; x.setLineDash([12, 12]); x.strokeStyle = '#eef0f2'; x.stroke(); x.lineDashOffset = 12; x.strokeStyle = T.night ? '#3a6ad8' : '#d23a2a'; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
  const roadP = pat(32, (p, W) => { p.fillStyle = T.road; p.fillRect(0, 0, W, W); dots(p, W, 44, [shade(T.road, 0.9), shade(T.road, 1.08), shade(T.road, 0.95)]); });
  path(x); x.lineWidth = T.w; x.strokeStyle = P(roadP); x.stroke();
  // le righe bianche ai margini dell'asfalto (un filo), e la mezzeria in città
  path(x); x.lineWidth = T.w - 4; x.strokeStyle = T.snow ? '#eaf4ff' : '#e6e8ee'; x.stroke(); path(x); x.lineWidth = T.w - 7; x.strokeStyle = P(roadP); x.stroke();
  if (T.lanes) { path(x); x.lineWidth = 2; x.setLineDash([10, 14]); x.strokeStyle = '#e8e2b0'; x.stroke(); x.setLineDash([]); }
  // rampe (a strisce gialle e nere) e fossati
  const gc = GAPC[T.gapK], big0 = T.w / 2 + T.off;
  const stripes = pat(8, (p, W) => { p.fillStyle = '#ffd23f'; p.fillRect(0, 0, W, W); p.fillStyle = '#1c1c22'; for (let k = 0; k < W; k++) p.fillRect(k, (k + W / 2) % W, W / 2, 1); });
  const gapP = pat(16, (p, W) => { p.fillStyle = gc[0]; p.fillRect(0, 0, W, W); p.fillStyle = gc[1]; for (let k = 0; k < 7 * ts; k++) p.fillRect(R() * W | 0, R() * W | 0, 3 * ts, 1); dots(p, W, 6, [shade(gc[0], 0.85)]); });
  for (const r of ramps) { quad(x, r.j, r.j + 2, -big0, big0); x.fillStyle = P(stripes); x.fill(); quad(x, r.g0, r.g1, -big0, big0); x.fillStyle = P(gapP); x.fill(); }
  // strisce turbo
  for (const p of pads) {
    quad(x, p.j0, p.j1, p.l - p.hw, p.l + p.hw); x.fillStyle = '#ff9a2a'; x.fill();
    x.strokeStyle = '#fff4b8'; x.lineWidth = 2;
    for (let s = 0; s < 3; s++) { const j = (p.j0 + s) % n, q = c[j], f = [Math.cos(ang[j]), Math.sin(ang[j])], r = nrm[j]; x.beginPath(); x.moveTo(q[0] + r[0] * (p.l - p.hw * 0.7) - f[0] * 2, q[1] + r[1] * (p.l - p.hw * 0.7) - f[1] * 2); x.lineTo(q[0] + r[0] * p.l + f[0] * 4, q[1] + r[1] * p.l + f[1] * 4); x.lineTo(q[0] + r[0] * (p.l + p.hw * 0.7) - f[0] * 2, q[1] + r[1] * (p.l + p.hw * 0.7) - f[1] * 2); x.stroke(); }
  }
  // linea del traguardo a scacchi, e i quattro posti della griglia
  const s = 4, cols = Math.ceil(T.w / s);
  x.save(); x.translate(c[0][0], c[0][1]); x.rotate(ang[0]);
  for (let r = 0; r < 3; r++) for (let k = 0; k < cols; k++) { x.fillStyle = (r + k) % 2 ? '#111318' : '#f4f4f4'; x.fillRect(r * s - s * 1.5, -T.w / 2 + k * s, s, s); }
  x.restore();
  x.strokeStyle = '#e6e8ee'; x.lineWidth = 1.2;
  for (const [dj, l] of [[-6, 0.22], [-6, -0.22], [-11, 0.22], [-11, -0.22]]) { const j = (n + dj) % n, q = c[j], f = [Math.cos(ang[j]), Math.sin(ang[j])], r = nrm[j], cx = q[0] + r[0] * l * T.w + f[0] * 9, cy = q[1] + r[1] * l * T.w + f[1] * 9;
    x.beginPath(); x.moveTo(cx - r[0] * 7 - f[0] * 5, cy - r[1] * 7 - f[1] * 5); x.lineTo(cx - r[0] * 7, cy - r[1] * 7); x.lineTo(cx + r[0] * 7, cy + r[1] * 7); x.lineTo(cx + r[0] * 7 - f[0] * 5, cy + r[1] * 7 - f[1] * 5); x.stroke(); }
  // zone per la fisica (a un'unità per punto): rosso = 0 barriera, 1 fuori pista, 2 cordolo, 3 pista; blu = sentiero
  // seconda maschera: rosso = rampa, verde = fossato (valgono solo dove si può guidare)
  const zc = mk(MAP, MAP), zx = zc.getContext('2d'), mc = mk(MAP, MAP), mx2 = mc.getContext('2d');
  zx.fillStyle = '#000'; zx.fillRect(0, 0, MAP, MAP); mx2.fillStyle = '#000'; mx2.fillRect(0, 0, MAP, MAP);
  path(zx); zx.lineWidth = T.w + 2 * T.off; zx.strokeStyle = 'rgb(85,0,0)'; zx.stroke();
  if (sc) scPath(zx, 32, 'rgb(85,0,255)');
  path(zx); zx.lineWidth = T.w + 10; zx.strokeStyle = 'rgb(170,0,0)'; zx.stroke();
  path(zx); zx.lineWidth = T.w; zx.strokeStyle = 'rgb(255,0,0)'; zx.stroke();
  const big = T.w / 2 + T.off + 12;
  for (const r of ramps) { quad(mx2, r.j, r.j + 2, -big, big); mx2.fillStyle = 'rgb(255,0,0)'; mx2.fill(); quad(mx2, r.g0, r.g1, -big, big); mx2.fillStyle = 'rgb(0,255,0)'; mx2.fill(); }
  const zd = zx.getImageData(0, 0, MAP, MAP).data, md = mx2.getImageData(0, 0, MAP, MAP).data, zone = new Uint8Array(MAP * MAP);
  for (let k = 0, q = 0; k < zone.length; k++, q += 4) { const b = Math.round(zd[q] / 85); zone[k] = b ? b | (md[q + 1] > 128 ? 4 : 0) | (zd[q + 2] > 128 ? 8 : 0) | (md[q] > 128 ? 16 : 0) : 0; }
  zc.width = zc.height = mc.width = mc.height = 0;
  // decorazioni appena oltre il bordo
  const deco = [], kinds = T.deco === 'city' ? ['lamp', 'building'] : T.deco === 'cactus' ? ['cactus', 'sandrock'] : [T.deco];
  const sprs = {}; for (const k of kinds) sprs[k] = k === 'building' ? [0, 1, 2].map(() => epx(DECO.building(R))) : [epx(DECO[k](R))];
  x.globalCompositeOperation = 'lighter';
  for (let j = 0; j < n; j += 3) for (const side of [-1, 1]) {
    let kind = kinds[0], dist;
    if (T.deco === 'city') { kind = (j / 3) % 2 ? 'building' : 'lamp'; dist = T.w / 2 + T.off + (kind === 'lamp' ? 5 : 22 + R() * 30); }
    else { if (R() < 0.45) continue; kind = kinds[R() * kinds.length | 0]; dist = T.w / 2 + T.off + 8 + R() * 70; }
    const p = [c[j][0] + nrm[j][0] * side * dist, c[j][1] + nrm[j][1] * side * dist];
    if (p[0] < 4 || p[1] < 4 || p[0] > MAP - 4 || p[1] > MAP - 4 || zone[(p[1] | 0) * MAP + (p[0] | 0)] !== 0) continue;
    const list = sprs[kind];
    deco.push({ x: p[0], y: p[1], spr: list[R() * list.length | 0], bs: (kind === 'rock' || kind === 'sandrock' ? 1.6 : kind === 'building' ? 2.6 : kind === 'lamp' ? 1.5 : 1.9) / 2, glow: kind === 'lamp' });
    if (kind === 'lamp') { const gr = x.createRadialGradient(p[0], p[1], 2, p[0], p[1], 34); gr.addColorStop(0, 'rgba(120,100,40,.55)'); gr.addColorStop(1, 'rgba(120,100,40,0)'); x.fillStyle = gr; x.fillRect(p[0] - 34, p[1] - 34, 68, 68); }
  }
  x.globalCompositeOperation = 'source-over';
  // cristalli degli oggetti: tre file per giro, quattro per fila
  const gems = [];
  for (const f of [0.14, 0.44, 0.74]) { let j = Math.floor(f * n), giri = 0; while (ramps.some(r => inR(j, r.j - 12, r.j + 16)) && giri++ < 40) j = (j + 4) % n; for (const l of [-0.36, -0.12, 0.12, 0.36]) gems.push({ x: c[j][0] + nrm[j][0] * l * T.w, y: c[j][1] + nrm[j][1] * l * T.w, t: 0 }); }
  let mx0 = 1e9, my0 = 1e9, mx1 = -1e9, my1 = -1e9;
  for (const p of c) { mx0 = Math.min(mx0, p[0]); my0 = Math.min(my0, p[1]); mx1 = Math.max(mx1, p[0]); my1 = Math.max(my1, p[1]); }
  // il cielo: dalle tre tinte, una sfumatura a dodici fasce (riga per riga, a punti veri)
  const sky = []; for (let y = 0; y < HQ; y++) { const f = Math.floor(y / HQ * 12) / 11 * 2; sky.push(f < 1 ? mixC(T.sky[0], T.sky[1], f) : mixC(T.sky[1], T.sky[2], f - 1)); }
  const stars = T.night ? Array.from({ length: 80 }, () => [(R() * 1024 | 0) / 2, (R() * (HOR - 14) * 2 | 0) / 2, R() < 0.2 ? 1 : 0.5]) : null;
  // il suolo: il disegno intero, e due copie via via dimezzate per le righe lontane (dove ogni punto dello schermo copre più texel: senza, sfarfalla)
  const tex = new Uint32Array(x.getImageData(0, 0, TM, TM).data.buffer); cv.width = cv.height = 0;
  const mips = [{ t: tex, s: TM, k: ts }];
  for (let lv = 0; lv < 2; lv++) { const a = mips[lv], hs = a.s >> 1, o = new Uint32Array(hs * hs), src = a.t, S2 = a.s;
    for (let yy = 0, q = 0; yy < hs; yy++) { let r0 = yy * 2 * S2; for (let xx = 0; xx < hs; xx++, q++, r0 += 2) { const p0 = src[r0], p1 = src[r0 + 1], p2 = src[r0 + S2], p3 = src[r0 + S2 + 1];
      o[q] = (0xff000000 | ((((p0 >> 16 & 255) + (p1 >> 16 & 255) + (p2 >> 16 & 255) + (p3 >> 16 & 255)) >> 2) << 16) | ((((p0 >> 8 & 255) + (p1 >> 8 & 255) + (p2 >> 8 & 255) + (p3 >> 8 & 255)) >> 2) << 8) | (((p0 & 255) + (p1 & 255) + (p2 & 255) + (p3 & 255)) >> 2)) >>> 0; } }
    mips.push({ t: o, s: hs, k: a.k / 2 }); }
  TR = { i, ts, T, c, n, ang, nrm, w: T.w, mips, zone, deco, gems, pads, ramps, ramp, gap, sc,
    farC: rgb(T.far), sky, stars, strip: skyStrip(T, R), mini: { x0: mx0, y0: my0, s: 34 / Math.max(mx1 - mx0, my1 - my0) } };
}

// ---------- musica chiptune (generata da poche regole per ogni pista) ----------
const SCALES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], phr: [0, 1, 4, 5, 7, 8, 10] };
const SONGS = [
  { bpm: 140, root: 60, sc: 'maj', prog: [0, 4, 5, 3], seed: 11, bass: 'oct', dr: 'rock', arp: 1 },
  { bpm: 124, root: 65, sc: 'maj', prog: [0, 3, 4, 3], seed: 23, bass: 'cal', dr: 'latin', arp: 0 },
  { bpm: 108, root: 62, sc: 'min', prog: [0, 5, 2, 6], seed: 37, bass: 'long', dr: 'soft', arp: 1, bell: 1 },
  { bpm: 150, root: 64, sc: 'min', prog: [0, 6, 5, 4], seed: 41, bass: 'drive', dr: 'heavy', arp: 0 },
  { bpm: 128, root: 57, sc: 'min', prog: [0, 5, 6, 0], seed: 53, bass: 'oct', dr: 'disco', arp: 2 },
  { bpm: 116, root: 64, sc: 'phr', prog: [0, 1, 0, 6], seed: 67, bass: 'drive', dr: 'tribal', arp: 0 },
  { bpm: 120, root: 67, sc: 'maj', prog: [0, 5, 3, 4], seed: 71, bass: 'oct', dr: 'rock', arp: 1 },
];
const DRUMS = { rock: [[0, 8, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]], latin: [[0, 6, 8], [4, 12], [0, 3, 6, 8, 10, 11, 14]], soft: [[0], [12], [4, 8, 12]],
  heavy: [[0, 2, 8, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]], disco: [[0, 4, 8, 12], [4, 12], [2, 6, 10, 14]], tribal: [[0, 3, 8, 11], [6, 14], [4, 12]] };
function genSong(S) {
  const R = rng(S.seed), sc = SCALES[S.sc];
  const m = i => S.root + Math.floor(i / 7) * 12 + sc[((i % 7) + 7) % 7];
  const chord = step => S.prog[Math.floor(step / 32) % 4];
  const inChord = (i, d) => { const r = ((i - d) % 7 + 7) % 7; return r === 0 || r === 2 || r === 4; };
  const RHY = [[0, 4, 6, 8, 12, 14], [0, 2, 4, 8, 10, 12], [0, 3, 6, 8, 11, 14], [0, 4, 8, 10, 12], [0, 2, 3, 4, 8, 12, 14], [0, 6, 8, 12]];
  const phrase = () => { const out = []; let p = 7 + (R() * 3 | 0); for (let b = 0; b < 2; b++) { const r = RHY[R() * RHY.length | 0]; for (const s of r) { p = Math.max(3, Math.min(13, p + [-2, -1, -1, 0, 1, 1, 2, 3, -3][R() * 9 | 0])); out.push([b * 16 + s, p]); } } return out; };
  const A = phrase(), B = phrase(), A2 = A.map(([s, p], k) => [s, k >= A.length - 2 ? p + (R() < 0.5 ? 2 : -2) : p]);
  const lead = new Array(128).fill(null), bass = new Array(128).fill(null), arp = new Array(128).fill(null);
  [[A, 0], [A2, 32], [B, 64], [A, 96]].forEach(([ph, off]) => ph.forEach(([s, p]) => {
    const st = off + s;
    if (s % 8 === 0) for (const dq of [0, 1, -1, 2, -2, 3]) if (inChord(p + dq, chord(st))) { p += dq; break; }
    lead[st] = m(p);
  }));
  for (let st = 0; st < 128; st++) if (lead[st] !== null) { let d = 1; while (d < 6 && st + d < 128 && lead[st + d] === null) d++; lead[st] = [lead[st], d]; }
  const BP = { oct: [[0, 0], [2, 7], [4, 0], [6, 7], [8, 0], [10, 7], [12, 0], [14, 7]], drive: [[0, 0], [2, 0], [4, 0], [6, 4], [8, 0], [10, 0], [12, 0], [14, 4]], long: [[0, 0, 8], [8, 4, 8]], cal: [[0, 0], [3, 0], [6, 4], [8, 0], [11, 7], [14, 4]] }[S.bass];
  for (let bar = 0; bar < 8; bar++) { const d = S.prog[Math.floor(bar / 2) % 4]; for (const [s, deg, dur] of BP) bass[bar * 16 + s] = [m(d + deg) - 24, dur || 2]; }
  if (S.arp) for (let st = 0; st < 128; st += 2) { const d = chord(st), k = (st / 2) % 4, seq4 = S.arp === 2 ? [0, 2, 4, 2] : [0, 2, 4, 7]; arp[st] = m(d + seq4[k]) + 12; }
  return { bpm: S.bpm, bell: S.bell, lead, bass, arp, dr: DRUMS[S.dr] };
}
const MUS = { on: false, song: null, step: 0, next: 0, out: null, mul: 1, waves: null, cache: {} };
const mfreq = n => 440 * Math.pow(2, (n - 69) / 12);
function musicStart(i) {
  if (!actx || !master) return;
  if (!MUS.out) { MUS.out = actx.createGain(); MUS.out.connect(master); }
  if (!MUS.waves) {
    const pw = duty => { const N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let k = 1; k < N; k++) re[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty); return actx.createPeriodicWave(re, im); };
    MUS.waves = { p25: pw(0.25), p12: pw(0.125) };
  }
  MUS.song = MUS.cache[i] || (MUS.cache[i] = genSong(SONGS[i]));
  MUS.out.gain.cancelScheduledValues(actx.currentTime); MUS.out.gain.value = 0.3;
  MUS.step = 0; MUS.next = actx.currentTime + 0.08; MUS.mul = 1; MUS.on = true; MUS.id = i;
}
function musicStop() { MUS.on = false; if (MUS.out && actx) MUS.out.gain.setTargetAtTime(0, actx.currentTime, 0.05); }
function mNote(wave, type, f, t, dur, vol) {
  const o = actx.createOscillator(), gn = actx.createGain();
  if (wave) o.setPeriodicWave(wave); else o.type = type;
  o.frequency.setValueAtTime(f, t);
  gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(vol, t + 0.006);
  gn.gain.setValueAtTime(vol, t + Math.max(0.012, dur - 0.03)); gn.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(gn); gn.connect(MUS.out); o.start(t); o.stop(t + dur + 0.02);
}
function mDrum(kind, t) {
  if (kind === 0) { const o = actx.createOscillator(), gn = actx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.09); gn.gain.setValueAtTime(0.5, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(gn); gn.connect(MUS.out); o.start(t); o.stop(t + 0.14); return; }
  if (!noiseBuf) return;
  const s = actx.createBufferSource(), f = actx.createBiquadFilter(), gn = actx.createGain(), dur = kind === 1 ? 0.11 : 0.035;
  s.buffer = noiseBuf; f.type = kind === 1 ? 'bandpass' : 'highpass'; f.frequency.value = kind === 1 ? 1800 : 7000;
  gn.gain.setValueAtTime(kind === 1 ? 0.22 : 0.07, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(gn); gn.connect(MUS.out); s.start(t); s.stop(t + dur + 0.01);
}
function musicTick() {
  if (!MUS.on || !MUS.song || !actx) return;
  if (!(opt.music && aok() && !paused)) { MUS.next = actx.currentTime + 0.1; return; }
  const S = MUS.song, spb = 60 / (S.bpm * MUS.mul) / 4;
  if (MUS.next < actx.currentTime - 0.2) MUS.next = actx.currentTime + 0.05;
  while (MUS.next < actx.currentTime + 0.12) {
    const st = MUS.step, t = MUS.next, b = st % 16;
    if (S.lead[st]) mNote(S.bell ? null : MUS.waves.p25, 'triangle', mfreq(S.lead[st][0] + (S.bell ? 12 : 0)), t, S.lead[st][1] * spb * 0.9, S.bell ? 0.09 : 0.055);
    if (S.bass[st]) mNote(null, 'triangle', mfreq(S.bass[st][0]), t, S.bass[st][1] * spb * 0.85, 0.13);
    if (S.arp[st] !== null) mNote(MUS.waves.p12, null, mfreq(S.arp[st]), t, spb * 1.6, 0.022);
    if (S.dr[0].includes(b)) mDrum(0, t);
    if (S.dr[1].includes(b) || (st >= 112 && b >= 12)) mDrum(1, t);
    if (S.dr[2].includes(b)) mDrum(2, t);
    MUS.step = (st + 1) % 128; MUS.next += spb;
  }
}

// ---------- stato ----------
let state = 'title', paused = false, time = 0, sel = 0, diff = 1, mode = 'gara', menuI = 0, optI = 0, cupI = 0;
let raceT = 0, count = 0, endT = 0, msg = null, wrongT = 0, frameN = 0;
let karts = [], player = null, rockets = [], oils = [], finishOrder = [], parts = [], flakes = [], blobs = [], shakeT = 0, bombs = [], booms = [], flashT = 0, camPull = 0;
let cup = null, ghost = null, curLap = [], lapStart = 0, laps = [], newRec = null, unlockMsg = null, podiumT = 0;
{ const s = LS('pk_sel', null); if (s) { sel = s.d | 0; tIdx = Math.min(TRACKS.length - 1, s.t | 0); diff = s.f ?? 1; cupI = (s.c | 0) % CUPS.length; } if (sel >= DRV.length || isLocked(sel)) sel = 0; }
const saveAll = () => { SS('pk_sel', { d: sel, t: tIdx, f: diff, c: cupI }); SS('pk2_best', best); SS('pk2_tt', tt); SS('pk_cups', cups); SS('pk_unlock', unlocked); SS('pk_opt', opt); };
const cam = { x: 0, y: 0, a: 0, pa: 0 };
const demo = { j: 0, a: 0 };

function mkKart(di, gi, isP) {
  const slots = [[-6, 0.22], [-6, -0.22], [-11, 0.22], [-11, -0.22]];
  const j = (TR.n + slots[gi][0]) % TR.n, p = TR.c[j], l = slots[gi][1] * TR.w;
  return { di, d: DRV[di], x: p[0] + TR.nrm[j][0] * l, y: p[1] + TR.nrm[j][1] * l, a: TR.ang[j], ma: TR.ang[j], spd: 0, idx: j, lap: 0, cp: 3,
    z: 0, vz: 0, toIdx: j, toX: p[0], toY: p[1], item: null, roul: 0, itemT: 0, spin: 0, boost: 0, shield: 0, mag: 0, magT: null, ink: 0, blink: 0,
    drift: 0, dt: 0, charge: 0, st: 0, star: 0, small: 0, ghostT: 0, scia: 0, airT: 0, nameT: 0, fin: 0, ftime: 0, skill: 1, isP, phase: gi * 1.7, lane: 0.6 + gi * 0.15, base: 1, scMode: 0, scTake: false, adt: 0, adone: false, rev: 0, aFirst: null };
}
const rivalPool = () => DRV.map((d, i) => i).filter(i => i !== sel && !isLocked(i)).sort(() => Math.random() - 0.5).slice(0, 3);
const wantSc = k => !!TR.sc && Math.random() < PERS[k.d.pers].sc * (TR.T.grip < 0.5 ? 0.4 : 1);
// in gara il suolo è a TEXHI texel per unità: ci vuole un momento, quindi prima si mostra «PREPARO LA PISTA» e poi si costruisce (carica)
let daFare = null, daFareN = 0;
function carica(fn) { daFare = fn; daFareN = 2; }
function avviso() { if (!daFare) return; panel(54, 34); pt('PREPARO LA PISTA...', SW / 2, 67, 1, '#ffd23f', 'center'); }
function newRace() {
  if (!TR || TR.i !== tIdx || TR.ts !== TEXHI) { try { buildTrack(tIdx, TEXHI); } catch (e) { buildTrack(tIdx, 1); } }
  ensureSprites();
  rockets = []; oils = []; finishOrder = []; parts = []; blobs = []; bombs = []; booms = []; flashT = 0; camPull = 0; raceT = 0; count = 3.2; endT = 0; msg = null; wrongT = 0; newRec = null;
  if (mode === 'tempo') {
    karts = [mkKart(sel, 2, true)];
    karts[0].item = 'turbo';
    const gh = LS('pk2_ghost_' + tIdx, null); ghost = gh && gh.p && gh.p.length > 30 ? gh : null;
    curLap = []; lapStart = 0; laps = [];
  } else {
    const rv = cup ? cup.rivals : rivalPool();
    const grid = [rv[0], rv[1], sel, rv[2]];
    karts = grid.map((di, gi) => mkKart(di, gi, di === sel));
    for (const k of karts) if (!k.isP) { k.base = DIFF[diff].ai * (0.985 + k.phase * 0.007); k.scTake = wantSc(k); }
    ghost = null;
  }
  player = karts.find(k => k.isP);
  for (const gm of TR.gems) gm.t = 0;
  flakes = TR.T.snow ? Array.from({ length: 46 }, () => ({ x: Math.random() * SW, y: Math.random() * SH, v: 18 + Math.random() * 26 })) : [];
  cam.a = cam.pa = player.a; placeCam();
  state = 'count'; paused = false;
  musicStart(TR.T.song);
}
function placeCam() { const d = CAM_D + camPull; cam.x = player.x - Math.cos(cam.a) * d; cam.y = player.y - Math.sin(cam.a) * d; }   // (camPull: la camera si allontana un filo quando si va forte)
const zoneAt = (x, y) => { const ix = x | 0, iy = y | 0; return (ix < 0 || iy < 0 || ix >= MAP || iy >= MAP) ? 0 : TR.zone[iy * MAP + ix]; };
const prog = k => k.lap * TR.n + k.idx;
const inRange = (i, a, b) => ((i - a + TR.n) % TR.n) <= ((b - a + TR.n) % TR.n);
const latAt = (x, y, j) => (x - TR.c[j][0]) * TR.nrm[j][0] + (y - TR.c[j][1]) * TR.nrm[j][1];
const latOf = k => latAt(k.x, k.y, k.idx);
function trackIdx(k) {
  const n = TR.n; let bd = 1e18, bi = k.idx;
  for (let o = -8; o <= 14; o++) { const i = (k.idx + o + n) % n, p = TR.c[i], d = (p[0] - k.x) ** 2 + (p[1] - k.y) ** 2; if (d < bd) { bd = d; bi = i; } }
  if (bd > (TR.w / 2 + TR.T.off + 6) ** 2) for (let o = -8; o <= n / 2; o++) { const i = (k.idx + o + n) % n, p = TR.c[i], d = (p[0] - k.x) ** 2 + (p[1] - k.y) ** 2; if (d < bd) { bd = d; bi = i; } }
  if (k.idx > n * 0.8 && bi < n * 0.2) { if (k.cp >= 3) { k.lap++; k.cp = 0; onLap(k); } }
  else if (k.idx < n * 0.2 && bi > n * 0.8) { k.lap--; k.cp = 3; }
  const q = Math.floor(bi / n * 4); if (q > k.cp && q <= k.cp + 2) k.cp = q;   // la scorciatoia può saltare un quarto di pista
  k.idx = bi;
}
function setIdx(k, j) { k.idx = j; const q = Math.floor(j / TR.n * 4); if (q > k.cp && q <= k.cp + 2) k.cp = q; }
function onLap(k) {
  if (!k.isP) k.scTake = wantSc(k);
  if (k.isP && mode === 'tempo' && k.lap >= 2) {
    const lt = raceT - lapStart; laps.push(lt);
    const rec = tt[tIdx] || {};
    if (!rec.lap || lt < rec.lap) { rec.lap = lt; tt[tIdx] = rec; SS('pk2_ghost_' + tIdx, { d: sel, lap: lt, p: curLap }); newRec = 'GIRO RECORD!'; seq([988, 1319, 1568], 0.08, 0.07, 0.045); }
    curLap = []; lapStart = raceT;
  }
  if (k.lap > LAPS && !k.fin) {
    k.fin = finishOrder.length + 1; k.ftime = raceT; finishOrder.push(k);
    if (k.isP) {
      state = 'end'; endT = 0; msg = { t: 'ARRIVO!', c: '#ffd23f', life: 3 }; musicStop(); seq([784, 988, 1175, 1568], 0.12, 0.1, 0.05);
      if (mode === 'tempo') { const rec = tt[tIdx] || {}; if (!rec.race || raceT < rec.race) { rec.race = raceT; tt[tIdx] = rec; newRec = 'NUOVO RECORD!'; } }
      else { const key = tIdx + '-' + diff; if (!best[key] || raceT < best[key]) best[key] = raceT; }
      saveAll();
    }
  } else if (k.isP && k.lap >= 2) {
    if (k.lap === LAPS) { msg = { t: 'ULTIMO GIRO!', c: '#ff6b5e', life: 2 }; MUS.mul = 1.12; seq([659, 784, 988, 1319], 0.1, 0.08, 0.05); }
    else { msg = { t: 'GIRO ' + k.lap, c: '#ffffff', life: 1.5 }; seq([784, 1047], 0.08, 0.08, 0.045); }
  }
}
function places() { return [...finishOrder, ...karts.filter(k => !k.fin).sort((a, b) => prog(b) - prog(a))]; }

// ---------- effetti ----------
function puff(k, n, col, up = 30) {
  if (parts.length > 140) return;
  for (let i = 0; i < n; i++) parts.push({ x: k.x - Math.cos(k.ma) * 6 + (Math.random() - 0.5) * 8, y: k.y - Math.sin(k.ma) * 6 + (Math.random() - 0.5) * 8, z: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 30 - Math.cos(k.ma) * 20, vy: (Math.random() - 0.5) * 30 - Math.sin(k.ma) * 20, vz: up * (0.5 + Math.random()), life: 0.4 + Math.random() * 0.35, col, sz: 1.4 + Math.random() });
}
function shake(t) { shakeT = Math.max(shakeT, t); }
let lastScrape = 0;
function scrape(k) {
  if (!k.isP) return;
  puff(k, 2, '#ffd23f', 40);
  if (time - lastScrape > 0.15) { lastScrape = time; noise(0.05, 0.04); vib(10); }
}
function respawn(k) {
  k.x = k.toX; k.y = k.toY; k.idx = k.toIdx; k.a = k.ma = TR.ang[k.toIdx]; k.spd = 0; k.z = 0; k.vz = 0; k.blink = 1.2; k.drift = 0;
  if (k.isP) { msg = { t: 'OPS!', c: '#ffffff', life: 1 }; tone(400, 0.3, 'square', 0.04, 150); vib(40); }
}
function respawnAt(k, j) {
  k.toIdx = j; k.toX = TR.c[j][0]; k.toY = TR.c[j][1]; respawn(k);
}
function inkBlobs() { blobs = Array.from({ length: 6 }, () => ({ x: 18 + Math.random() * 124, y: 34 + Math.random() * 90, r: 10 + Math.random() * 14 })); }

// ---------- guida ----------
const NOIN = { steer: 0, gas: false, brake: false };
// la derapata si carica in tre gradi (scintille azzurre, arancio, viola): più si tiene, più spinge all'uscita
function endDrift(k) {
  if (k.charge > 1.9) { k.boost = Math.max(k.boost, 1.3); if (k.isP) { tone(600, 0.3, 'sawtooth', 0.04, 1400); vib(20); } }
  else if (k.charge > 1.1) { k.boost = Math.max(k.boost, 0.9); if (k.isP) tone(500, 0.25, 'sawtooth', 0.035, 1100); }
  else if (k.charge > 0.5) { k.boost = Math.max(k.boost, 0.5); if (k.isP) tone(400, 0.18, 'sawtooth', 0.03, 800); }
  k.drift = 0; k.dt = 0; k.charge = 0;
}
function jump(k, vz) { k.vz = vz; k.z = 0.6; k.airT = 0; k.toIdx = k.idx; k.toX = TR.c[k.idx][0]; k.toY = TR.c[k.idx][1]; k.drift = 0; k.dt = 0; }
function stepKart(k, inp, dt) {
  const d = k.d, T = TR.T, n = TR.n;
  if (k.blink > 0) k.blink -= dt;
  if (k.spin > 0) { k.spin -= dt; k.spd *= Math.exp(-2.6 * dt); k.a += 12 * dt; inp = NOIN; if (k.spin <= 0) k.a = k.ma; }
  if (k.ink > 0) k.ink -= dt;
  if (k.shield > 0) k.shield -= dt;
  if (k.star > 0) k.star -= dt;
  if (k.small > 0) k.small -= dt;
  if (k.ghostT > 0) k.ghostT -= dt;
  const air = k.z > 0.5, z = zoneAt(k.x, k.y), base = z & 3;
  let top = d.top * k.skill;
  if (!air) {
    if (z & 8) top *= T.scSlow || 0.8;
    else if (base === 1) top *= T.offSlow;
    else if (base === 2) top *= 0.96;
    if (z & 4) {
      if (T.gapK === 'lava') { puff(k, 8, '#ffc145', 60); if (k.isP) { noise(0.3, 0.1); shake(0.3); } { let r = TR.ramps[0]; for (const q of TR.ramps) if ((k.idx - q.j + n) % n < (k.idx - r.j + n) % n) r = q; respawnAt(k, (r.j - 5 + n) % n); } return; }
      top *= 0.35; if (Math.random() < 0.5) puff(k, 1, GAPC[T.gapK][1], 50);
    }
    else if ((base === 1 || (z & 8)) && k.spd > 40 && Math.random() < (k.isP ? 0.6 : 0.15)) puff(k, 1, z & 8 ? '#8a6a44' : T.dust);
  }
  if (k.mag > 0) { k.mag -= dt; top *= 1.18; }
  if (k.star > 0) top *= 1.2;
  if (k.small > 0) top *= 0.72;
  if (k.scia > 0.7) top *= 1.07;   // la scia: dietro a un altro kart l'aria tira
  if (k.boost > 0) { k.boost -= dt; top *= 1.32; k.spd = Math.max(k.spd, top * 0.9); }
  if (inp.gas) { if (k.spd < top) k.spd = Math.min(top, k.spd + d.acc * (k.scia > 0.7 || k.star > 0 ? 1.3 : 1) * dt * (1 - 0.5 * Math.max(0, k.spd) / top)); }
  else if (!inp.brake) k.spd -= Math.sign(k.spd) * Math.min(Math.abs(k.spd), 60 * dt);
  if (inp.brake) k.spd = Math.max(-top * 0.35, k.spd - 280 * dt);
  if (k.spd > top) k.spd = Math.max(top, k.spd - (air ? 40 : 200) * dt);
  const f = Math.max(-1, Math.min(1, k.spd / 55)) * (air ? 0.35 : 1);
  // lo sterzo è meno pronto vicino alla velocità massima: per chiudere una curva stretta bisogna alzare il piede
  const und = 1 - 0.2 * Math.max(0, Math.min(1, (k.spd - top * 0.62) / (top * 0.38)));
  let stretta = 0;
  if (k.isP && k.spin <= 0 && !air) {   // derapata: sterzo tenuto a tutta velocità; una volta partita, con la leva si stringe o si allarga
    const as = Math.abs(inp.steer);
    if (!k.drift) { if (as > 0.85 && inp.gas && k.spd > top * 0.55) { k.dt += dt; if (k.dt > 0.3) { k.drift = Math.sign(inp.steer); k.charge = 0; } } else k.dt = 0; }
    else if (Math.sign(inp.steer) === k.drift && as > 0.45 && inp.gas && k.spd > top * 0.45) { stretta = (as - 0.45) / 0.55; k.charge += dt * (0.75 + 0.5 * stretta); if (Math.random() < 0.3) puff(k, 1, '#d8dce4', 15); }
    else endDrift(k);
  }
  k.a += (k.drift ? d.turn * (0.92 + 0.42 * stretta) * k.drift * f : d.turn * inp.steer * f * und) * dt;
  // l'aderenza: la direzione in cui si va insegue il muso, più piano in derapata, sul ghiaccio, in volo e fuori pista
  k.ma += angDiff(k.a, k.ma) * Math.min(1, (k.drift ? 3.2 : 9) * T.grip * (air ? 0.2 : 1) * (base === 1 && !air ? 0.8 : 1) * dt);
  // andare di traverso costa velocità: a sterzo tutto girato si perde un decimo, in derapata un po' meno (e poi la spinta all'uscita ripaga)
  if (!air && k.spd > 30 && !(k.boost > 0)) k.spd -= k.spd * Math.min(0.5, Math.abs(angDiff(k.a, k.ma))) * (k.drift ? 0.9 : 2.1) * T.grip * dt;
  if (k.mag > 0 && k.magT && !k.magT.fin) { const want = Math.atan2(k.magT.y - k.y, k.magT.x - k.x), r = Math.min(1, 1.6 * dt); k.ma += angDiff(want, k.ma) * r; k.a += angDiff(want, k.a) * r; }
  const vx = Math.cos(k.ma) * k.spd, vy = Math.sin(k.ma) * k.spd, nx = k.x + vx * dt, ny = k.y + vy * dt;
  if (air || zoneAt(nx, ny) || !zoneAt(k.x, k.y)) { k.x = Math.max(2, Math.min(MAP - 2, nx)); k.y = Math.max(2, Math.min(MAP - 2, ny)); }
  else {
    // contro la barriera: si cerca da che parte è libero (sedici punti attorno al kart), si toglie la spinta contro il muro, se ne rende un terzo (il rimbalzo) e lungo il muro si striscia
    let fx = 0, fy = 0; for (let q = 0; q < 16; q++) { const ca = Math.cos(q * 0.3927), sa = Math.sin(q * 0.3927); if (zoneAt(k.x + ca * 7, k.y + sa * 7)) { fx += ca; fy += sa; } }
    const l = Math.hypot(fx, fy); if (l > 0.01) { fx /= l; fy /= l; }
    const vn = l > 0.01 ? vx * fx + vy * fy : 0; let bx = vx, by = vy;
    if (l > 0.01 && vn < 0) {
      const at = 1 - Math.min(0.5, 1.3 * dt), dietro = k.spd < 0, forte = -vn > 45;   // (at: l'attrito dello strisciare, a tempo e non a fotogramma)
      bx = (vx - vn * fx) * at - vn * 0.32 * fx; by = (vy - vn * fy) * at - vn * 0.32 * fy; const sp = Math.hypot(bx, by);
      k.spd = (dietro ? -sp : sp) * (forte ? 0.8 : 1); if (sp > 1) { const na = Math.atan2(by, bx) + (dietro ? Math.PI : 0); k.ma = na; k.a += angDiff(na, k.a) * Math.min(1, (forte ? 14 : 5) * dt); }
      if (forte) { if (k.drift) endDrift(k); if (k.isP) { noise(0.08, 0.06); vib(25); shake(0.15); } } else scrape(k);
    } else k.spd *= 1 - Math.min(0.5, 2 * dt);
    // poi ci si muove dove si può: lungo la spinta nuova, o su un asse solo, o (incastrati in uno spigolo) un passo verso il libero; solo se niente riesce si rimbalza indietro
    const mx = k.x + bx * dt, my = k.y + by * dt;
    if (zoneAt(mx, my)) { k.x = mx; k.y = my; } else if (zoneAt(mx, k.y)) k.x = mx; else if (zoneAt(k.x, my)) k.y = my;
    else if (l > 0.01 && zoneAt(k.x + fx * 1.5, k.y + fy * 1.5)) { k.x += fx * 1.5; k.y += fy * 1.5; }
    else { k.spd *= -0.3; if (k.isP) { noise(0.08, 0.06); vib(25); shake(0.15); } }
  }
  if (k.z > 0 || k.vz > 0) {   // in volo
    k.vz -= GRAV * dt; k.z += k.vz * dt; k.airT += dt;
    if (k.z <= 0) {
      const hard = k.vz < -70; k.z = 0; k.vz = 0;
      if (zoneAt(k.x, k.y) === 0) respawn(k);
      else if (k.airT > 0.55 && inp.gas && (zoneAt(k.x, k.y) & 3) >= 2 && Math.abs(angDiff(k.a, TR.ang[k.idx])) < 0.5) { k.boost = Math.max(k.boost, 0.35); puff(k, 5, '#ffe9a0', 30); if (k.isP) tone(520, 0.14, 'sawtooth', 0.03, 900); }   // atterraggio dritto e a gas aperto: una spintarella
      else if (hard) { puff(k, 6, T.dust, 40); if (k.isP) { vib(20); tone(120, 0.08, 'triangle', 0.05, 70); } }
    }
  }
  trackIdx(k);
  if (k.z === 0 && k.spin <= 0) {
    if ((zoneAt(k.x, k.y) & 16) && k.spd > 50 && Math.abs(angDiff(k.ma, TR.ang[k.idx])) < 1.2) { jump(k, 30 + k.spd * 0.4); if (k.isP) tone(300, 0.25, 'square', 0.04, 700); }
    const lat = latOf(k);
    for (const p of TR.pads) if (inRange(k.idx, p.j0, p.j1) && Math.abs(lat - p.l) < p.hw) { if (k.isP && k.boost < 0.4) tone(500, 0.2, 'sawtooth', 0.03, 1000); k.boost = Math.max(k.boost, 0.7); }
  }
}
function aiInput(k) {
  const n = TR.n, P = PERS[k.d.pers], S = TR.sc;
  let tx, ty;
  if (S) {
    const A = TR.c[S.i], B = TR.c[S.j], ux = B[0] - A[0], uy = B[1] - A[1], L = Math.hypot(ux, uy);
    if (k.scMode === 0 && k.scTake && inRange(k.idx, (S.i - 12 + n) % n, S.i)) k.scMode = 2;
    if (k.scMode === 2) {
      const along = ((k.x - A[0]) * ux + (k.y - A[1]) * uy) / L, on = inRange(k.idx, S.j, (S.j + 10) % n);
      if (along > L - 14 || on) { if (!on) setIdx(k, S.j); k.scMode = 0; }
      else { const off = Math.abs(((k.x - A[0]) * uy - (k.y - A[1]) * ux) / L), t = Math.max(0, Math.min(L, along + (off > 7 ? 22 : 40))) / L; tx = A[0] + ux * t; ty = A[1] + uy * t; }
    }
  }
  if (!k.scMode) {
    const look = 7 + (k.spd > 110 ? 3 : 0), i = (k.idx + look) % n, p = TR.c[i];
    let lane = Math.sin(time * 0.35 + k.phase) * 0.26 * TR.w * k.lane;
    if (k.phase * 0.31 % 1 < P.pads) for (const pd of TR.pads) { const dd = (pd.j0 - k.idx + n) % n; if (dd > 0 && dd < 16) { lane = pd.l; break; } }
    if (P.dodge > 0.5) for (const o of oils) { const dd = (o.idx - k.idx + n) % n; if (dd > 0 && dd < 10 && Math.abs(o.lat - lane) < 16) lane = o.lat + (o.lat > 0 ? -24 : 24); }
    if (P.bump) for (const o of karts) if (o !== k && (o.x - k.x) ** 2 + (o.y - k.y) ** 2 < 900) { lane = latOf(o); break; }
    lane = Math.max(-TR.w * 0.38, Math.min(TR.w * 0.38, lane));
    tx = p[0] + TR.nrm[i][0] * lane; ty = p[1] + TR.nrm[i][1] * lane;
  }
  let df = angDiff(Math.atan2(ty - k.y, tx - k.x), k.a);
  if (k.ink > 0) df += Math.sin(time * 7 + k.phase) * 0.5;
  // bloccato: retromarcia; se succede ancora sul sentiero lo abbandona; dopo 6 secondi riparte sulla pista
  if (!k.chk || time - k.chk.t >= 0.5) {
    const moved = k.chk ? Math.hypot(k.x - k.chk.x, k.y - k.chk.y) : 99;
    k.stk = moved < 12 && k.spin <= 0 && !k.fin ? (k.stk || 0) + 0.5 : 0; k.chk = { t: time, x: k.x, y: k.y };
    if (moved > 40) k.stuckN = 0;
  }
  if (k.stk >= 6) { k.stk = 0; k.scMode = 0; respawnAt(k, k.idx); return NOIN; }
  if (!(k.rev > 0)) {
    if (k.stk >= 1 && k.stk % 1 === 0) { k.rev = 0.6; k.revHard = true; k.stuckN = (k.stuckN || 0) + 1; if (k.scMode && k.stuckN >= 2) { k.scMode = 0; k.scTake = false; } }
    else if (k.spd < 30 && Math.abs(df) > 1.6) { k.rev = 0.7; k.revHard = false; }
  }
  if (k.rev > 0) { k.rev -= 1 / 60; if (!k.revHard && Math.abs(df) < 0.9) k.rev = 0; return { steer: -Math.sign(df), gas: false, brake: true }; }
  const bend = Math.abs(angDiff(TR.ang[(k.idx + 14) % n], TR.ang[k.idx]));
  const fast = k.scMode ? Math.abs(df) > 0.5 && k.spd > k.d.top * 0.6 : bend > 0.85 * (P.bendSlow || 1) && k.spd > k.d.top * 0.7 * TR.T.grip ** 0.3;
  const steer = Math.max(-1, Math.min(1, df * 2.4));
  if (Math.abs(steer) > 0.55 && k.spd > k.d.top * 0.6) { k.adt += 1 / 60; if (k.adt > 0.9 && !k.adone) { k.adone = true; if (Math.random() < P.drift) k.boost = Math.max(k.boost, 0.45); } }
  else { k.adt = 0; k.adone = false; }
  return { steer, gas: !fast && (Math.abs(df) < 1.4 || k.spd < 45), brake: !!k.scMode && Math.abs(df) > 0.75 && k.spd > k.d.top * 0.55 };
}
function giveItem(k) {
  const odds = ODDS[Math.max(0, Math.min(3, places().indexOf(k)))];
  let r = Math.random() * odds.reduce((s, v) => s + v, 0), it = 0;
  while (r > odds[it]) { r -= odds[it]; it++; }
  return ITEMS[Math.min(it, ITEMS.length - 1)];
}
function useItem(k) {
  if (!k.item || k.roul > 0) return;
  const it = k.item; k.item = null; k.itemT = 0;
  const near = k.isP || Math.hypot(k.x - player.x, k.y - player.y) < 220;
  if (it === 'turbo') { k.boost = Math.max(k.boost, 1.2); if (near) tone(300, 0.35, 'sawtooth', 0.04, 900); }
  else if (it === 'shield') { k.shield = 7; if (k.isP) seq([880, 1320], 0.08, 0.06, 0.035); }
  else if (it === 'oil') { const o = { x: k.x - Math.cos(k.a) * 14, y: k.y - Math.sin(k.a) * 14, life: 30, idx: k.idx, lat: 0 }; o.lat = latAt(o.x, o.y, k.idx); oils.push(o); if (near) tone(160, 0.15, 'square', 0.04, 90); }
  else if (it === 'rocket') {
    const pl = places(), i = pl.indexOf(k);
    rockets.push({ x: k.x + Math.cos(k.a) * 10, y: k.y + Math.sin(k.a) * 10, a: k.a, spd: Math.max(150, k.spd) + 95, owner: k, target: i > 0 ? pl[i - 1] : null, life: 4, age: 0 });
    if (near) noise(0.25, 0.05);
  }
  else if (it === 'magnet') { const pl = places(), i = pl.indexOf(k); k.magT = i > 0 ? pl[i - 1] : null; k.mag = 2.6; if (near) tone(200, 0.4, 'sine', 0.05, 600); }
  else if (it === 'ink') {
    const my = prog(k);
    for (const o of karts) if (o !== k && my - prog(o) > 0 && my - prog(o) < 32 && !(o.shield > 0) && !(o.star > 0) && !(o.ghostT > 0)) { o.ink = 3; if (o.isP) { inkBlobs(); tone(180, 0.4, 'triangle', 0.05, 80); vib(30); } }
    if (near) noise(0.3, 0.05);
  }
  else if (it === 'spring') { if (k.z === 0) { jump(k, 125); if (near) tone(260, 0.3, 'square', 0.04, 900); } }
  // triplo turbo: tre spinte più corte, una per volta (l'oggetto resta in mano e scala)
  else if (it === 'turbo3' || it === 'turbo2') { k.boost = Math.max(k.boost, 0.85); k.item = it === 'turbo3' ? 'turbo2' : 'turbo'; if (near) tone(340, 0.28, 'sawtooth', 0.04, 950); }
  // stella: sei secondi senza danni e più veloci; chi viene toccato si gira
  else if (it === 'star') { k.star = 6; k.small = 0; k.ink = 0; if (k.spin > 0) { k.spin = 0; k.a = k.ma; } if (k.isP) seq([784, 988, 1175, 1568, 1976], 0.07, 0.07, 0.04); }
  // fulmine: chi sta davanti rimpicciolisce e rallenta per tre secondi e mezzo (se davanti non c'è nessuno, tutti gli altri)
  else if (it === 'bolt') {
    const my = prog(k), dav = karts.filter(o => o !== k && !o.fin && prog(o) > my), chi = dav.length ? dav : karts.filter(o => o !== k && !o.fin);
    for (const o of chi) { if (o.star > 0 || o.ghostT > 0) continue; if (o.shield > 0) { o.shield = 0; continue; } o.small = 3.5; o.boost = 0; if (o.isP) { vib(60); tone(900, 0.5, 'sawtooth', 0.05, 90); } }
    flashT = 0.35; noise(0.35, 0.09); shake(0.2);
  }
  // bomba: si lancia in avanti; scoppia dopo un secondo da terra, o prima se qualcuno la tocca. Lo scoppio prende tutti lì attorno, anche chi l'ha lanciata
  else if (it === 'bomb') { const v = Math.max(60, k.spd) + 120; bombs.push({ x: k.x + Math.cos(k.a) * 12, y: k.y + Math.sin(k.a) * 12, z: 6, vx: Math.cos(k.a) * v, vy: Math.sin(k.a) * v, vz: 78, t: 1.0, owner: k, age: 0 }); if (near) tone(220, 0.25, 'square', 0.04, 500); }
  // fantasma: cinque secondi in cui niente lo tocca (kart, olio, razzi, bombe, inchiostro, fulmine), e ruba l'oggetto al primo che ne ha uno tra quelli davanti
  else if (it === 'ghost') {
    k.ghostT = 5; const pl = places(), i = pl.indexOf(k);
    for (let q = i - 1; q >= 0; q--) { const o = pl[q]; if (o.item && !(o.roul > 0) && !o.fin) { k.item = o.item; o.item = null; if (k.isP) { msg = { t: 'RUBATO: ' + NOMI[k.item] + '!', c: '#cfe0ff', life: 1.6 }; player.nameT = 0; } else if (o.isP) msg = { t: 'TI HANNO RUBATO L\'OGGETTO!', c: '#ff6b5e', life: 1.6 }; break; } }
    if (near) tone(700, 0.5, 'sine', 0.05, 250);
  }
}
function hit(k, lava) {
  if (k.spin > 0 || k.blink > 0 || k.star > 0 || k.ghostT > 0) return;
  if (k.shield > 0 && !lava) { k.shield = 0; if (k.isP) tone(1200, 0.12, 'square', 0.04, 600); return; }
  k.spin = 1.1; k.drift = 0; k.dt = 0; k.charge = 0; k.boost = 0; k.spd *= lava ? 0.3 : 0.5;
  if (k.isP) { noise(0.3, 0.12); tone(600, 0.4, 'square', 0.04, 120); vib(70); shake(0.35); }
}
function aiItems(k, dt) {
  if (!k.item || k.roul > 0) return;
  k.itemT += dt;
  const P = PERS[k.d.pers], pl = places(), i = pl.indexOf(k);
  const ahead = i > 0 ? pl[i - 1] : null, behind = i < pl.length - 1 ? pl[i + 1] : null;
  const gapA = ahead ? prog(ahead) - prog(k) : 1e9, gapB = behind ? prog(k) - prog(behind) : 1e9;
  const straight = Math.abs(angDiff(TR.ang[(k.idx + 12) % TR.n], TR.ang[k.idx])) < 0.25;
  const threat = rockets.some(r => r.target === k && Math.hypot(r.x - k.x, r.y - k.y) < 120) || oils.some(o => { const dd = (o.idx - k.idx + TR.n) % TR.n; return dd > 0 && dd < 6 && Math.abs(o.lat - latOf(k)) < 14; });
  const agg = P.item === 'aggressive', def = P.item === 'defensive';
  let use = k.itemT > 10;
  if (k.item === 'turbo') use = use || (straight && k.itemT > (P.item === 'speed' ? 0.3 : 1)) || k.scMode === 2;
  else if (k.item === 'shield') use = use || def || threat || k.itemT > 5;
  else if (k.item === 'rocket') use = use || (ahead && (agg ? gapA < 60 : gapA < 35) && k.itemT > (def ? 4 : 0.8));
  else if (k.item === 'oil') use = use || (behind && gapB < (agg ? 18 : 10) && k.itemT > 0.8);
  else if (k.item === 'magnet') use = use || (ahead && gapA < 28 && gapA > 3 && k.itemT > 0.5);
  else if (k.item === 'ink') use = use || (behind && gapB < 16 && k.itemT > 0.6);
  else if (k.item === 'spring') use = use || threat || (k.itemT > 6 && straight);
  else if (k.item === 'turbo3' || k.item === 'turbo2') use = use || (straight && k.itemT > 0.9 && !(k.boost > 0));
  else if (k.item === 'star') use = use || threat || (i > 0 && k.itemT > 1.5) || k.itemT > 5;
  else if (k.item === 'bolt') use = use || (i > 0 && k.itemT > (agg ? 0.8 : 2));
  else if (k.item === 'ghost') use = use || threat || (ahead && ahead.item && gapA < 60 && k.itemT > 0.6) || k.itemT > 6;
  else if (k.item === 'bomb') { let davanti = false; for (const o of karts) if (o !== k) { const dx = o.x - k.x, dy = o.y - k.y, dd = Math.hypot(dx, dy); if (dd > 60 && dd < 190 && Math.abs(angDiff(Math.atan2(dy, dx), k.a)) < 0.16) davanti = true; } use = use || (davanti && k.itemT > 0.5); }
  if (use) useItem(k);
}
const MENUS = ['title', 'mode', 'options', 'driver', 'cup', 'track'];
function step(dt) {
  time += dt; frameN++;
  if (shakeT > 0) shakeT -= dt;
  if (MENUS.includes(state)) { demoCam(dt); return; }
  if (state === 'podium') { podiumT += dt; return; }
  if (paused || state === 'results' || state === 'standings') return;
  if (state === 'count') {
    // partenza a razzo: premi A durante l'"1"
    if (BTN.a) { if (player.aFirst === null) player.aFirst = count; } else player.aFirst = null;
    const before = Math.ceil(count); count -= dt;
    if (Math.ceil(count) !== before && before >= 1 && before <= 3) tone(before === 1 ? 660 : 440, 0.15, 'square', 0.04);
    if (count <= 0) {
      state = 'race'; tone(880, 0.35, 'square', 0.045); msg = { t: 'VIA!', c: '#4ade80', life: 0.9 };
      if (BTN.a && player.aFirst !== null) {
        if (player.aFirst <= 1.05 && player.aFirst >= 0.25) { player.boost = 1.0; msg = { t: 'PARTENZA A RAZZO!', c: '#ffd23f', life: 1.4 }; tone(300, 0.4, 'sawtooth', 0.045, 1200); vib(40); }
        else if (player.aFirst > 1.05) { player.spin = 0.7; msg = { t: 'TROPPO PRESTO!', c: '#ff6b5e', life: 1.4 }; noise(0.4, 0.08); }
      }
      for (const k of karts) if (!k.isP && Math.random() < DIFF[diff].rs) k.boost = 0.9;
    }
    cam.a = cam.pa = player.a; placeCam(); return;
  }
  raceT += dt;
  const T = TR.T;
  // comandi del giocatore: sterzo graduale e gas automatico (se attivo)
  // con la leva (al tocco) lo sterzo è proporzionale: poco spinta, curva larga; a fondo, curva stretta (e derapata). Con le frecce resta com'era
  const an = STICK.on, tgt = an ? Math.sign(STICK.x) * Math.min(1, Math.abs(STICK.x) * 1.12) ** 1.35 : (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0), rate = an ? 14 : (tgt === 0 || Math.sign(tgt) !== Math.sign(player.st)) ? 10 : 6;
  player.st += Math.max(-rate * dt, Math.min(rate * dt, tgt - player.st));
  const frena = an ? STICK.y > 0.72 && Math.abs(STICK.x) < 0.6 : BTN.down;   // (la leva tirata indietro frena; di lato no)
  let pIn = { steer: player.st, gas: opt.auto ? !frena : BTN.a, brake: frena };
  if (window.__pk && window.__pk.auto) { const ai = aiInput(player); pIn = { steer: Math.abs(ai.steer) > 0.3 ? Math.sign(ai.steer) : 0, gas: ai.gas, brake: ai.brake }; }
  for (const k of karts) {
    if (k.isP && state === 'race') { k.skill = 1; stepKart(k, pIn, dt); continue; }
    const dp = prog(k) - prog(player);
    k.skill = k.isP ? 0.9 : k.base * Math.max(0.9, Math.min(1.07, 1 - dp * 0.0016)) * (k.ink > 0 ? 0.9 : 1);
    stepKart(k, aiInput(k), dt);
    if (!k.isP) aiItems(k, dt);
  }
  if (mode === 'tempo' && frameN % 2 === 0 && state === 'race') curLap.push(Math.round(player.x), Math.round(player.y), Math.round(player.a * 100));
  for (let i = 0; i < karts.length; i++) for (let j = i + 1; j < karts.length; j++) {   // urti tra kart
    const a = karts[i], b = karts[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
    if (d2 > 0.01 && d2 < 144 && Math.abs(a.z - b.z) < 6) {
      if (a.ghostT > 0 || b.ghostT > 0) continue;                     // il fantasma passa attraverso
      if ((a.star > 0) !== (b.star > 0)) hit(a.star > 0 ? b : a);       // la stella fa girare chi tocca
      const d = Math.sqrt(d2), o = 12 - d, nx = dx / d, ny = dy / d, wa = a.d.w * (a.small > 0 ? 0.5 : 1), wb = b.d.w * (b.small > 0 ? 0.5 : 1);
      const ax = a.x - nx * o * wb / (wa + wb), ay = a.y - ny * o * wb / (wa + wb), bx = b.x + nx * o * wa / (wa + wb), by = b.y + ny * o * wa / (wa + wb);
      if (a.z > 0.5 || zoneAt(ax, ay)) { a.x = ax; a.y = ay; }
      if (b.z > 0.5 || zoneAt(bx, by)) { b.x = bx; b.y = by; }
      // lungo la linea dell'urto i due si scambiano la spinta: il più pesante sposta il più leggero. Cambia dove vanno, non dove guardano: poi l'aderenza li raddrizza
      const avx = Math.cos(a.ma) * a.spd, avy = Math.sin(a.ma) * a.spd, bvx = Math.cos(b.ma) * b.spd, bvy = Math.sin(b.ma) * b.spd, rel = (bvx - avx) * nx + (bvy - avy) * ny;
      if (rel < 0) {
        const J = -1.45 * rel / (1 / wa + 1 / wb), dai = (k, ux, uy) => { const sp = Math.hypot(ux, uy); if (k.spd < 0) { k.spd = -sp; if (sp > 1) k.ma = Math.atan2(uy, ux) + Math.PI; } else { k.spd = sp; if (sp > 1) k.ma = Math.atan2(uy, ux); } };
        if (!(a.spin > 0)) dai(a, avx - J / wa * nx, avy - J / wa * ny); if (!(b.spin > 0)) dai(b, bvx + J / wb * nx, bvy + J / wb * ny);
        if ((a.isP || b.isP) && rel < -12) { noise(0.06, 0.05); vib(rel < -40 ? 30 : 15); if (rel < -40) shake(0.12); }
      }
    }
  }
  // la scia: chi sta dietro a un altro, in fila e vicino, dopo un attimo va un po' più forte
  for (const k of karts) {
    let dentro = false;
    if (k.z < 1 && k.spd > 80 && !k.fin) for (const o of karts) { if (o === k || o.ghostT > 0) continue; const dx = o.x - k.x, dy = o.y - k.y, dd = Math.hypot(dx, dy);
      if (dd > 16 && dd < 85 && o.spd > 70 && Math.abs(angDiff(Math.atan2(dy, dx), k.ma)) < 0.2 && Math.abs(angDiff(o.ma, k.ma)) < 0.5) { dentro = true; break; } }
    const prima = k.scia; k.scia = Math.max(0, Math.min(1.6, k.scia + (dentro ? dt : -2.5 * dt)));
    if (k.isP && prima <= 0.7 && k.scia > 0.7) { msg = { t: 'SCIA!', c: '#9fe0ff', life: 0.8 }; tone(700, 0.2, 'sine', 0.03, 1100); }
  }
  // le bombe: in volo, poi a terra con la miccia; scoppiano allo scadere o se qualcuno le tocca
  for (const bm of bombs) {
    bm.age += dt;
    if (bm.z > 0 || bm.vz > 0) { bm.x += bm.vx * dt; bm.y += bm.vy * dt; bm.vz -= GRAV * dt; bm.z += bm.vz * dt; if (bm.z <= 0) { bm.z = 0; bm.vz = 0; if (!zoneAt(bm.x, bm.y)) bm.t = 0; } }
    else bm.t -= dt;
    let scoppia = bm.t <= 0;
    if (!scoppia && bm.z < 5) for (const k of karts) if ((k !== bm.owner || bm.age > 0.9) && k.z < 6 && !(k.ghostT > 0) && Math.hypot(k.x - bm.x, k.y - bm.y) < 10) { scoppia = true; break; }
    if (scoppia) {
      bm.dead = true; booms.push({ x: bm.x, y: bm.y, t: 0.45 });
      for (const k of karts) if (k.z < 10 && Math.hypot(k.x - bm.x, k.y - bm.y) < 34) hit(k);
      for (let q = 0; q < 14 && parts.length < 160; q++) { const a = Math.random() * TAU, v = 30 + Math.random() * 70; parts.push({ x: bm.x, y: bm.y, z: 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 30 + Math.random() * 60, life: 0.5 + Math.random() * 0.4, col: q % 3 ? '#ffc145' : '#ff6b2a', sz: 2 + Math.random() * 1.5 }); }
      const dp = Math.hypot(bm.x - player.x, bm.y - player.y); if (dp < 260) { noise(0.4, dp < 80 ? 0.14 : 0.07); if (dp < 80) { shake(0.4); vib(60); } }
    }
  }
  bombs = bombs.filter(bm => !bm.dead);
  for (const bo of booms) bo.t -= dt; booms = booms.filter(bo => bo.t > 0);
  if (flashT > 0) flashT -= dt;
  if (player.nameT > 0) player.nameT -= dt;
  { const top = player.d.top, vuole = (player.boost > 0 || player.star > 0 ? 7 : 0) + Math.max(0, Math.min(1, (player.spd - top * 0.8) / (top * 0.25))) * 3; camPull += (vuole - camPull) * Math.min(1, 4 * dt); }
  if (mode !== 'tempo') for (const gm of TR.gems) {   // cristalli
    if (gm.t > 0) { gm.t -= dt; continue; }
    for (const k of karts) if (k.z < 6 && Math.hypot(k.x - gm.x, k.y - gm.y) < 10) {
      gm.t = 3;
      if (!k.item && !k.roul) { if (k.isP) { k.roul = 1.1; k.item = giveItem(k); tone(1320, 0.05, 'square', 0.03); vib(10); } else { k.item = giveItem(k); k.itemT = 0; } }
      break;
    }
  }
  if (player.roul > 0) { const b = player.roul; player.roul -= dt; if (Math.floor(b * 12) !== Math.floor(player.roul * 12)) tone(1500, 0.02, 'square', 0.02); if (player.roul <= 0) { player.roul = 0; player.nameT = 1.8; tone(1760, 0.08, 'square', 0.035); } }
  for (const r of rockets) {
    r.age += dt; r.life -= dt;
    if (r.target && !r.target.fin) r.a += Math.max(-3.4 * dt, Math.min(3.4 * dt, angDiff(Math.atan2(r.target.y - r.y, r.target.x - r.x), r.a)));
    r.x += Math.cos(r.a) * r.spd * dt; r.y += Math.sin(r.a) * r.spd * dt;
    if (!zoneAt(r.x, r.y)) r.life = 0;
    for (const k of karts) if ((k !== r.owner || r.age > 0.5) && k.z < 6 && !(k.ghostT > 0) && Math.hypot(k.x - r.x, k.y - r.y) < 9) { hit(k); r.life = 0; break; }
  }
  rockets = rockets.filter(r => r.life > 0);
  for (const o of oils) { o.life -= dt; for (const k of karts) if (k.z < 2 && !(k.ghostT > 0) && Math.hypot(k.x - o.x, k.y - o.y) < 8) { hit(k); o.life = 0; break; } }
  oils = oils.filter(o => o.life > 0);
  // particelle, bolle di lava, neve
  for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vz -= 120 * dt; p.z = Math.max(0, p.z + p.vz * dt); p.life -= dt; }
  parts = parts.filter(p => p.life > 0);
  if (T.lava && frameN % 7 === 0 && parts.length < 140) {
    const j = (player.idx + 3 + (Math.random() * 18 | 0)) % TR.n, side = Math.random() < 0.5 ? -1 : 1, dd = TR.w / 2 + T.off + 6 + Math.random() * 40;
    const bx = TR.c[j][0] + TR.nrm[j][0] * side * dd, by = TR.c[j][1] + TR.nrm[j][1] * side * dd;
    if (zoneAt(bx, by) === 0) parts.push({ x: bx, y: by, z: 0, vx: 0, vy: 0, vz: 8, life: 0.9, col: '#ffc145', sz: 2.5, bub: true });
  }
  const turn = angDiff(cam.a, cam.pa);
  for (const fl of flakes) { fl.y += fl.v * dt; fl.x += Math.sin(time + fl.v) * 8 * dt - turn * 90; if (fl.y > SH) { fl.y = HOR - 20; fl.x = Math.random() * SW; } fl.x = (fl.x + SW) % SW; }
  cam.pa = cam.a;
  if (state === 'race' && !(zoneAt(player.x, player.y) & 8) && Math.abs(angDiff(player.ma, TR.ang[player.idx])) > 2 && player.spd > 25 && player.z === 0) wrongT += dt; else wrongT = 0;
  if (msg && (msg.life -= dt) <= 0) msg = null;
  cam.a += angDiff(player.spin > 0 ? cam.a : player.ma, cam.a) * Math.min(1, 7 * dt);
  placeCam();
  if (state === 'end') {
    endT += dt;
    if (endT > 5 || finishOrder.length === karts.length) {
      for (const k of places()) if (!k.fin) { k.fin = finishOrder.length + 1; k.ftime = raceT + (TR.n * (LAPS + 1) - prog(k)) * 8 / (k.d.top * 0.85); finishOrder.push(k); }
      if (cup) { cup.last = {}; finishOrder.forEach((k, i) => { cup.pts[k.di] = (cup.pts[k.di] || 0) + PTS[i]; cup.last[k.di] = PTS[i]; }); }
      state = 'results'; endT = 0;
    }
  }
}
function demoCam(dt) {
  if (!TR || TR.i !== tIdx) buildTrack(tIdx, 1);
  demo.j = (demo.j + dt * 110 / 8) % TR.n;
  const j = demo.j | 0, p = TR.c[j], q = TR.c[(j + 1) % TR.n], f = demo.j - j;
  demo.a += angDiff(TR.ang[(j + 4) % TR.n], demo.a) * Math.min(1, 3 * dt);
  cam.a = demo.a; cam.x = p[0] + (q[0] - p[0]) * f - Math.cos(cam.a) * CAM_D; cam.y = p[1] + (q[1] - p[1]) * f - Math.sin(cam.a) * CAM_D;
}
function startCup() {
  cup = { c: cupI, race: 0, pts: {}, last: {}, rivals: rivalPool() };
  tIdx = CUPS[cupI].t[0]; carica(newRace);
}
const cupRanking = () => karts.map(k => k.di).sort((a, b) => (cup.pts[b] || 0) - (cup.pts[a] || 0) || finishOrder.findIndex(k => k.di === a) - finishOrder.findIndex(k => k.di === b));
function nextCupRace() {
  if (cup.race < 2) { cup.race++; tIdx = CUPS[cup.c].t[cup.race]; carica(newRace); return; }
  const rank = cupRanking(), pos = rank.indexOf(sel) + 1, key = cup.c + '-' + diff;
  if (pos <= 3 && (!cups[key] || pos < cups[key])) cups[key] = pos;
  unlockMsg = null;
  if (pos === 1) for (const dv of DRV) if (dv.lock === cup.c && !unlocked.includes(dv.name)) { unlocked.push(dv.name); unlockMsg = 'NUOVO PILOTA: ' + dv.name + '!'; }
  saveAll(); state = 'podium'; podiumT = 0; musicStart(6);
  seq(pos === 1 ? [523, 659, 784, 1047, 784, 1047, 1319] : [523, 659, 784, 1047], 0.14, 0.12, 0.05);
}

// ---------- disegno ----------
let CX, CY, FX, FY, RX, RY;
function proj(x, y) {
  const dx = x - CX, dy = y - CY, z = dx * FX + dy * FY;
  if (z < 5) return null;
  const s = FOC / z;
  return { z, s, sx: SW / 2 + (dx * RX + dy * RY) * s, sy: HOR + camH * s };
}
const VIGN = (() => { const c = mk(RW, RH), x = c.getContext('2d'); x.scale(Q, Q); const gr = x.createRadialGradient(SW / 2, SH * 0.62, 30, SW / 2, SH * 0.62, 110); gr.addColorStop(0, 'rgba(4,6,24,0)'); gr.addColorStop(1, 'rgba(4,6,24,.6)'); x.fillStyle = gr; x.fillRect(0, 0, SW, SH); return c; })();
function ghostKart() {
  if (!ghost || mode !== 'tempo' || state === 'count' || !player) return null;
  const i = Math.floor((raceT - lapStart) * 30) * 3;
  if (i + 2 >= ghost.p.length) return null;
  return { x: ghost.p[i], y: ghost.p[i + 1], a: ghost.p[i + 2] / 100, di: ghost.d, d: DRV[ghost.d], z: 0, spd: 100, phase: 0, ghost: true };
}
function renderWorld(withKarts) {
  CX = cam.x; CY = cam.y; FX = Math.cos(cam.a); FY = Math.sin(cam.a); RX = -FY; RY = FX;
  camH = CAM_H + (withKarts && player ? player.z * 0.5 : 0);
  const M = TR.mips, farC = TR.farC, T = TR.T;
  for (let y = 0; y < HQ; y++) fb.fill(TR.sky[y], y * RW, y * RW + RW);
  for (let y = HQ; y < RH; y++) {
    // z: quanto è lontana la riga; k: unità di mondo per punto logico; u: per punto vero. Per ogni riga si usa la copia del suolo che ha circa un texel per punto
    const z = Math.min(1600, camH * FOC / ((y - HQ + 0.6) / Q)), k = z / FOC, u = k / Q;
    let m = 0; while (m < M.length - 1 && u * M[m].k > 1.45) m++;
    const t = M[m].t, sz = M[m].s, kk = M[m].k;
    let wx = (CX + FX * z - RX * k * SW / 2) * kk, wy = (CY + FY * z - RY * k * SW / 2) * kk;
    const sx = RX * u * kk, sy = RY * u * kk;
    let o = y * RW;
    for (let x = 0; x < RW; x++, o++) { const ix = wx | 0, iy = wy | 0; fb[o] = (ix >= 0 && iy >= 0 && ix < sz && iy < sz) ? t[iy * sz + ix] : farC; wx += sx; wy += sy; }
  }
  g.putImageData(frame, 0, 0);
  const off = -(((cam.a / TAU) * 512) % 256 + 256) % 256;
  if (TR.stars) { g.fillStyle = '#e8ecff'; for (const [sx, sy, sd] of TR.stars) { const xx = ((sx + off * 2) % 512 + 512) % 512; if (xx < SW && (sy * 2 + frameN) % 97) g.fillRect(xx, sy, sd, sd); } }
  for (let x = off; x < SW; x += 256) g.drawImage(TR.strip, rq(x), HOR - 30, 256, 30);
  g.fillStyle = T.haze;
  for (let i = 0; i < 20; i++) { g.globalAlpha = 0.6 * (1 - i / 20) ** 1.6; g.fillRect(0, HOR + i / 2, SW, 0.5); }   // la foschia all'orizzonte, a mezze righe
  g.globalAlpha = 1;
  const L = [];
  for (const d of TR.deco) { const p = proj(d.x, d.y); if (p && p.z < 700) L.push({ p, k: 0, o: d }); }
  if (mode !== 'tempo' || !withKarts) for (const gm of TR.gems) if (gm.t <= 0) { const p = proj(gm.x, gm.y); if (p && p.z < 600) L.push({ p, k: 1, o: gm }); }
  if (withKarts) {
    for (const o of oils) { const p = proj(o.x, o.y); if (p && p.z < 500) L.push({ p, k: 2, o }); }
    for (const r of rockets) { const p = proj(r.x, r.y); if (p && p.z < 600) L.push({ p, k: 3, o: r }); }
    for (const bm of bombs) { const p = proj(bm.x, bm.y); if (p && p.z < 600) L.push({ p, k: 7, o: bm }); }
    for (const bo of booms) { const p = proj(bo.x, bo.y); if (p && p.z < 600) L.push({ p, k: 8, o: bo }); }
    for (const q of parts) { const p = proj(q.x, q.y); if (p && p.z < 400) L.push({ p, k: 5, o: q }); }
    for (const kt of karts) { const p = proj(kt.x, kt.y); if (p && p.z < 700 && (kt.isP || p.z > 22)) L.push({ p, k: 4, o: kt }); }
    const gk = ghostKart(); if (gk) { const p = proj(gk.x, gk.y); if (p && p.z < 700 && p.z > 22) L.push({ p, k: 6, o: gk }); }
  }
  L.sort((a, b) => b.p.z - a.p.z);
  for (const { p, k, o } of L) {
    if (k === 0) { const sc = p.s * o.bs, w = o.spr.width * sc, h = o.spr.height * sc; if (h >= 1 && p.sx + w / 2 > 0 && p.sx - w / 2 < SW) { g.drawImage(o.spr, p.sx - w / 2, p.sy - h, w, h); if (o.glow) { g.globalAlpha = 0.35; g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(p.sx, p.sy - h + 2 * sc, Math.max(1.5, 5 * sc), 0, TAU); g.fill(); g.globalAlpha = 1; } } }
    else if (k === 1) { const sc = p.s * 0.45, sp = GEM[Math.floor(time * 6) % 4], w = sp.width * sc, h = sp.height * sc; g.drawImage(sp, p.sx - w / 2, p.sy - h - (4 + Math.sin(time * 4) * 1.5) * p.s, w, h); }
    else if (k === 2) { const w = 13 * p.s, h = Math.max(1, w * camH * p.s / FOC); g.fillStyle = '#1c1c24'; g.beginPath(); g.ellipse(p.sx, p.sy, w / 2, h / 2, 0, 0, TAU); g.fill(); g.fillStyle = '#4a4a66'; g.fillRect(p.sx - w * 0.15, p.sy - h * 0.2, Math.max(1, w * 0.18), 1); }
    else if (k === 3) { const sc = p.s * 0.45, w = ROCKET.width * sc, h = ROCKET.height * sc; g.drawImage(ROCKET, p.sx - w / 2, p.sy - h - 3 * p.s, w, h); }
    else if (k === 5) {
      const s = Math.max(1, Math.round(o.sz * p.s * (o.bub ? 1 + (0.9 - o.life) : 1))), yy = p.sy - o.z * p.s;
      if (o.bub) { g.fillStyle = o.life < 0.15 ? '#fff4b8' : '#ff8a2a'; g.beginPath(); g.arc(p.sx, yy, s, 0, TAU); g.fill(); g.fillStyle = '#ffc145'; g.fillRect(p.sx - s * 0.4, yy - s * 0.5, Math.max(1, s * 0.5), Math.max(1, s * 0.4)); }
      else { g.fillStyle = o.col; g.fillRect(Math.round(p.sx - s / 2), Math.round(yy - s / 2), s, s); }
    }
    else if (k === 6) { g.globalAlpha = 0.45; drawKart(o, p); g.globalAlpha = 1; }
    else if (k === 7) { const sc = p.s * 0.5, w = 20 * sc, sw = 9 * p.s / (1 + o.z / 30); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p.sx, p.sy, sw / 2, Math.max(0.5, sw * camH * p.s / FOC / 2), 0, 0, TAU); g.fill();
      g.drawImage(ICON.bomb, p.sx - w / 2, p.sy - w - o.z * p.s, w, w); if (o.z === 0 && Math.floor(o.t * 10) % 2) { g.fillStyle = '#ff4a3a'; g.fillRect(rq(p.sx - sc), rq(p.sy - w * 0.55), Math.max(0.5, 2 * sc), Math.max(0.5, 2 * sc)); } }
    else if (k === 8) { const f = 1 - o.t / 0.45, r = 34 * p.s * (0.25 + 0.75 * f); g.globalAlpha = Math.max(0, 1 - f * f); for (const [kr, col] of [[1, '#ff6b2a'], [0.72, '#ffc145'], [0.4, '#fff4b8']]) { g.fillStyle = col; g.beginPath(); g.ellipse(p.sx, p.sy - r * kr * 0.35, r * kr, r * kr * 0.62, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; }
    else drawKart(o, p);
  }
}
function drawKart(k, p) {
  if (k.blink > 0 && Math.floor(time * 16) % 2) return;
  const phi = Math.atan2(k.y - CY, k.x - CX);
  const yi = ((Math.round(angDiff(phi, k.a) / (TAU / NANG)) % NANG) + NANG) % NANG;
  const sp = SPR[k.di][yi], S = sp.width / SQ, sc = p.s * KS * (k.small > 0 ? 0.6 : 1), zy = (k.z || 0) * p.s;
  const w = 15 * p.s / (1 + (k.z || 0) / 30), h = Math.max(1, w * camH * p.s / FOC);
  if (!k.ghost) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p.sx, p.sy, w / 2, h / 2, 0, 0, TAU); g.fill(); }
  const bob = k.spd > 20 && !k.z && Math.floor(time * 18 + k.phase * 3) % 2 ? 0.5 : 0;
  const kx = rq(p.sx - S / 2 * sc), ky = rq(p.sy - S * 0.66 * sc - zy) - bob, kw = rq(S * sc), fant = k.ghostT > 0 && !k.ghost;
  if (fant) g.globalAlpha = k.ghostT < 1 && Math.floor(time * 10) % 2 ? 0.75 : 0.42;
  g.drawImage(sp, kx, ky, kw, kw);
  if (fant) g.globalAlpha = 1;
  if (k.ghost) return;
  if (k.star > 0) { const col = ['#ffe14a', '#7fe0ff', '#ff8ad8', '#9af0b0'][Math.floor(time * 12) % 4]; g.globalAlpha = k.star < 1.2 && Math.floor(time * 10) % 2 ? 0.15 : 0.55; g.drawImage(tinta(sp, col), kx, ky, kw, kw); g.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#ffffff' : col; const a = time * 7 + i * 2.1; g.fillRect(rq(p.sx + Math.cos(a) * 9 * sc), rq(p.sy - zy - (8 + Math.sin(a * 1.3) * 7) * sc), 1, 1); } }
  const by = p.sy - zy;
  if (k.boost > 0) for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#ffc145' : '#ff6b2a'; g.fillRect(Math.round(p.sx - 1 + (Math.random() - 0.5) * 4 * sc), Math.round(by - 2 * sc + Math.random() * 3), 2, 2); }
  const sparks = k.isP ? k.drift : (k.adt > 0.4 && !k.adone);
  if (sparks) {
    const col = k.isP ? (k.charge > 1.9 ? '#d06cff' : k.charge > 1.1 ? '#ff8a2a' : k.charge > 0.5 ? '#4ab8ff' : '#e8eef6') : '#4ab8ff', quante = k.isP && k.charge > 1.9 ? 4 : k.isP && k.charge > 1.1 ? 3 : 2;
    for (const sd of [-1, 1]) for (let i = 0; i < quante; i++) { g.fillStyle = col; g.fillRect(Math.round(p.sx + sd * 7 * sc + (Math.random() - 0.5) * 4), Math.round(by - 1 - Math.random() * 3), 1 + (Math.random() < 0.4), 1); }
  }
  if (k.shield > 0 && (k.shield > 1.5 || Math.floor(time * 10) % 2)) { g.strokeStyle = '#9fe0ff'; g.lineWidth = 1; g.beginPath(); g.arc(p.sx, by - 9 * sc, 11 * sc, 0, TAU); g.stroke(); }
  if (k.mag > 0) { const s2 = Math.max(0.5, sc * 0.8); g.drawImage(ICON.magnet, p.sx - 5 * s2, by - 30 * sc, 10 * s2, 10 * s2); }
  if (k.ink > 0 && !k.isP) { g.fillStyle = '#1a1a2a'; g.fillRect(Math.round(p.sx - 3 * sc), Math.round(by - 13 * sc), Math.max(1, Math.round(6 * sc)), Math.max(1, Math.round(2 * sc))); }
}
// la figura tinta di un colore (per il lampeggio della stella): si fa una volta per figura e colore
const TINTE = new Map();
function tinta(sp, col) { let m = TINTE.get(sp); if (!m) TINTE.set(sp, m = {}); if (!m[col]) { const c = mk(sp.width, sp.height), x = c.getContext('2d'); x.drawImage(sp, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); m[col] = c; } return m[col]; }
function itemBox(x, y, it, spin) {
  g.fillStyle = '#10141c'; g.fillRect(x, y, 16, 14); g.fillStyle = '#ffd23f'; g.fillRect(x, y, 16, 1); g.fillRect(x, y + 13, 16, 1); g.fillRect(x, y, 1, 14); g.fillRect(x + 15, y, 1, 14);
  const ic = spin ? ICON[ITEMS[Math.floor(time * 14) % ITEMS.length]] : it ? ICON[it] : null;
  if (ic) g.drawImage(ic, x + 3, y + 2, 10, 10);
  if (!spin && (it === 'turbo3' || it === 'turbo2')) pt(it === 'turbo3' ? '3' : '2', x + 10, y + 7, 1, '#ffffff');
}
function hud() {
  const T = TR.T;
  // effetti sullo schermo: neve, buio della notte, linee di velocità, inchiostro
  if (flakes.length) { g.fillStyle = '#ffffff'; for (const fl of flakes) g.fillRect(Math.round(fl.x), Math.round(fl.y), fl.v > 34 ? 2 : 1, fl.v > 34 ? 2 : 1); }
  if (T.night) g.drawImage(VIGN, 0, 0, SW, SH);
  if (flashT > 0) { g.globalAlpha = Math.min(0.8, flashT / 0.35); g.fillStyle = '#fffbe0'; g.fillRect(0, 0, SW, SH); g.globalAlpha = 1; }   // il lampo del fulmine
  if ((player.boost > 0 || player.mag > 0 || player.star > 0 || player.scia > 0.7) && state !== 'count') {
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, y = HOR + 10 + Math.random() * (SH - HOR - 14), x = SW / 2 + side * (52 + Math.random() * 28), len = 6 + Math.random() * 10; g.fillRect(Math.round(side > 0 ? x : x - len), Math.round(y), Math.round(len), 1); }
  }
  if (player.ink > 0 && blobs.length) {
    g.globalAlpha = Math.min(1, player.ink / 0.6) * 0.92; g.fillStyle = '#14141e';
    for (const b of blobs) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); g.fillRect(b.x - 2, b.y, 4, b.r + 6 + (b.r % 5)); g.beginPath(); g.arc(b.x + b.r * 0.8, b.y - b.r * 0.6, b.r * 0.35, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  }
  // indicatori
  pt('GIRO ' + Math.max(1, Math.min(LAPS, player.lap)) + '/' + LAPS, 3, 3, 1, '#ffffff');
  pt(fmtT(player.fin ? player.ftime : mode === 'tempo' ? raceT - lapStart : raceT), 3, 10, 1, player.fin ? '#ffd23f' : '#c9d3e6');
  if (cup) pt('GARA ' + (cup.race + 1) + '/3', 3, 17, 1, '#ffd23f');
  itemBox(SW / 2 - 8, 2, player.item, player.roul > 0);
  if (player.item && player.nameT > 0 && !(player.roul > 0)) pt(NOMI[player.item], SW / 2, 18, 1, '#ffd23f', 'center');   // il nome dell'oggetto appena pescato
  if (mode === 'tempo') {
    const rec = tt[tIdx] || {};
    pt('GIRO REC', SW - 3, 3, 1, '#ffd23f', 'right'); pt(rec.lap ? fmtT(rec.lap) : '--', SW - 3, 10, 1, '#ffffff', 'right');
    pt(fmtT(raceT), SW - 3, 17, 1, '#c9d3e6', 'right');
  } else {
    const pos = places().indexOf(player) + 1, pc = ['#ffd23f', '#e6e9f2', '#e8a060', '#c9cede'][pos - 1];
    pt(String(pos), SW - 10, 3, 3, pc, 'right'); pt('°', SW - 8, 2, 2, pc, 'left');
  }
  // minimappa
  const m = TR.mini, mx = 3, my = SH - 38;
  g.fillStyle = 'rgba(10,12,18,.35)'; g.fillRect(mx - 1, my - 1, 37, 37);
  g.fillStyle = '#e8eef6';
  for (let j = 0; j < TR.n; j += 2) { const p = TR.c[j]; g.fillRect(mx + Math.round((p[0] - m.x0) * m.s), my + Math.round((p[1] - m.y0) * m.s), 1, 1); }
  if (TR.sc) { g.fillStyle = '#c8a070'; const a = TR.c[TR.sc.i], b = TR.c[TR.sc.j]; for (let s = 0; s <= 1; s += 0.1) g.fillRect(mx + Math.round((a[0] + (b[0] - a[0]) * s - m.x0) * m.s), my + Math.round((a[1] + (b[1] - a[1]) * s - m.y0) * m.s), 1, 1); }
  const gk = ghostKart(); if (gk) { g.fillStyle = '#0b0d12'; g.fillRect(mx + Math.round((gk.x - m.x0) * m.s) - 2, my + Math.round((gk.y - m.y0) * m.s) - 2, 5, 5); g.fillStyle = '#7fe0ff'; g.fillRect(mx + Math.round((gk.x - m.x0) * m.s) - 1, my + Math.round((gk.y - m.y0) * m.s) - 1, 3, 3); }
  for (const k of karts) { if (k.isP && Math.floor(time * 6) % 2) continue; g.fillStyle = k.d.kart; g.fillRect(mx + Math.round((k.x - m.x0) * m.s) - 1, my + Math.round((k.y - m.y0) * m.s) - 1, 3, 3); }
  // radar: chi arriva da dietro
  if (state === 'race') for (const k of karts) {
    if (k.isP) continue;
    const dx = k.x - player.x, dy = k.y - player.y, fwd = dx * Math.cos(cam.a) + dy * Math.sin(cam.a), lat = -dx * Math.sin(cam.a) + dy * Math.cos(cam.a);
    if (fwd > -4 || fwd < -80) continue;
    if (fwd > -28 && Math.floor(time * 8) % 2) continue;
    const ax = Math.round(Math.max(44, Math.min(SW - 6, SW / 2 + lat * 1.6)));
    g.fillStyle = '#0b0d12'; g.fillRect(ax - 4, SH - 7, 9, 6);
    g.fillStyle = k.d.kart; g.fillRect(ax - 3, SH - 6, 7, 1); g.fillRect(ax - 2, SH - 5, 5, 1); g.fillRect(ax - 1, SH - 4, 3, 1); g.fillRect(ax, SH - 3, 1, 1);
  }
  if (rockets.some(r => r.target === player) && Math.floor(time * 6) % 2) { pt('!', SW / 2, SH - 18, 2, '#ff4a3a', 'center'); if (frameN % 12 === 0) tone(1800, 0.03, 'square', 0.02); }
  if (state === 'count') { const c = Math.ceil(count); if (c >= 1 && c <= 3) pt(String(c), SW / 2, 44, 5, '#ffd23f', 'center'); if (c === 1) pt('A AL MOMENTO GIUSTO!', SW / 2, 74, 1, '#ffffff', 'center'); }
  const over = state === 'results' || state === 'standings';
  if (msg && !over) pt(msg.t, SW / 2, 46, tw(msg.t, 3) < SW - 6 ? 3 : tw(msg.t, 2) < SW - 6 ? 2 : 1, msg.c, 'center');
  if (newRec && state !== 'results') pt(newRec, SW / 2, 34, 1, '#ffd23f', 'center');
  if (wrongT > 1 && !over && Math.floor(time * 4) % 2) pt('CONTROMANO!', SW / 2, 70, 2, '#ff6b5e', 'center');
}
function panel(y, h) { g.fillStyle = 'rgba(10,12,20,.93)'; g.fillRect(8, y, SW - 16, h); g.fillStyle = '#ffd23f'; g.fillRect(8, y, SW - 16, 1); g.fillRect(8, y + h - 1, SW - 16, 1); }
function bar(x, y, v) { g.fillStyle = '#2a3040'; g.fillRect(x, y, 30, 3); g.fillStyle = '#4ade80'; g.fillRect(x, y, Math.round(30 * Math.max(0.05, Math.min(1, v))), 3); }
function medal(x, y, r) { if (r) g.drawImage(TROPHY[r - 1], x, y, 10, 10); else { g.fillStyle = '#2a3040'; g.fillRect(x + 2, y + 1, 6, 5); g.fillRect(x + 4, y + 6, 2, 3); } }
const MINI = {};
function miniTrack(t, cx, top, size) {
  const T = TRACKS[t]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of T.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = size / Math.max(x1 - x0, y1 - y0), ox = cx - (x1 - x0) * s / 2;
  const pts = MINI[t] || (MINI[t] = spline(T.pts, 16));
  g.fillStyle = T.road; for (const p of pts) g.fillRect(Math.round(ox + (p[0] - x0) * s) - 1, Math.round(top + (p[1] - y0) * s) - 1, 3, 3);
  g.fillStyle = '#ffffff'; g.fillRect(Math.round(ox + (pts[0][0] - x0) * s) - 1, Math.round(top + (pts[0][1] - y0) * s) - 2, 3, 5);
}
const MODES = [['GRAN PREMIO', '3 PISTE A PUNTI, VINCI LE COPPE'], ['GARA SINGOLA', 'UNA CORSA SULLA PISTA CHE VUOI'], ['PROVA A TEMPO', 'SFIDA IL FANTASMA DEL TUO RECORD'], ['OPZIONI', 'GAS, MUSICA E VIBRAZIONE']];
function drawMenus() {
  renderWorld(false);
  if (state === 'title') {
    pt('PIXEL', SW / 2, 14, 4, '#ffd23f', 'center', '#7a2a10');
    pt('KART', SW / 2, 38, 4, '#ff6b2a', 'center', '#5a1a08');
    if (Math.floor(time * 2.5) % 2 === 0) pt('A: GIOCA', SW / 2, 104, 2, '#ffffff', 'center');
    pt(opt.auto ? 'GAS AUTOMATICO  A/B OGGETTO' : 'A GAS  B OGGETTO  GIU FRENA', SW / 2, 126, 1, '#e6ecf6', 'center');
    pt('STERZA A FONDO PER DERAPARE', SW / 2, 134, 1, '#b8c4d8', 'center');
    return;
  }
  panel(8, 128);
  if (state === 'mode') {
    pt('PIXEL KART', SW / 2, 14, 2, '#ffd23f', 'center');
    MODES.forEach(([t], i) => { const y = 34 + i * 16, on = i === menuI; if (on) { g.fillStyle = '#26384d'; g.fillRect(14, y - 4, SW - 28, 13); } pt((on ? '> ' : '  ') + t, 22, y, 1, on ? '#ffffff' : '#8a96aa', 'left', null); });
    pt(MODES[menuI][1], SW / 2, 104, 1, '#a9c6e3', 'center', null);
    pt('SU/GIU SCEGLI   A: OK', SW / 2, 126, 1, '#6f7c94', 'center', null);
    return;
  }
  if (state === 'options') {
    pt('OPZIONI', SW / 2, 14, 2, '#ffd23f', 'center');
    [['GAS AUTOMATICO', opt.auto], ['MUSICA', opt.music], ['VIBRAZIONE', opt.vib]].forEach(([t, v], i) => { const y = 38 + i * 16, on = i === optI; if (on) { g.fillStyle = '#26384d'; g.fillRect(14, y - 4, SW - 28, 13); } pt(t, 20, y, 1, on ? '#ffffff' : '#8a96aa', 'left', null); pt(v ? 'SI' : 'NO', SW - 20, y, 1, v ? '#4ade80' : '#ff8f8f', 'right', null); });
    pt(optI === 0 ? (opt.auto ? 'ACCELERA DA SOLO, A E B OGGETTO' : 'TIENI PREMUTO A PER ACCELERARE') : optI === 1 ? 'UN MOTIVETTO PER OGNI PISTA' : 'IL TELEFONO VIBRA NEGLI URTI', SW / 2, 100, 1, '#a9c6e3', 'center', null);
    pt('A: CAMBIA   B: INDIETRO', SW / 2, 126, 1, '#6f7c94', 'center', null);
    return;
  }
  if (state === 'driver') {
    pt('SCEGLI IL PILOTA', SW / 2, 12, 1, '#ffd23f', 'center');
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = (i / 3) | 0, cx = 34 + col * 46, y = 19 + row * 40, on = i === sel, lk = isLocked(i);
      if (on) { g.fillStyle = '#26384d'; g.fillRect(cx - 21, y - 1, 42, 39); g.fillStyle = Math.floor(time * 3) % 2 ? '#ffd23f' : '#ffe680'; g.fillRect(cx - 21, y - 1, 42, 1); g.fillRect(cx - 21, y + 37, 42, 1); }
      if (lk) { const tmp = mk(30 * SQ, 30 * SQ), tx = tmp.getContext('2d'); tx.drawImage(SPR[i][NANG / 2], 0, 0); tx.globalCompositeOperation = 'source-atop'; tx.fillStyle = '#1a2030'; tx.fillRect(0, 0, 30 * SQ, 30 * SQ); g.drawImage(tmp, cx - 15, y, 30, 30); pt('?', cx, y + 9, 2, '#8a96aa', 'center', null); }
      else g.drawImage(SPR[i][on ? Math.floor(time * 12) % NANG : NANG / 2], cx - 15, y, 30, 30);
      pt(lk ? '???' : DRV[i].name, cx, y + 31, 1, on ? '#ffffff' : '#8a96aa', 'center', null);
    }
    const d = DRV[sel];
    if (isLocked(sel)) { pt('BLOCCATO', SW / 2, 101, 1, '#ff8f8f', 'center', null); pt('VINCI LA ' + CUPS[d.lock].name, SW / 2, 110, 1, '#ffd23f', 'center', null); pt('PER SBLOCCARLO', SW / 2, 117, 1, '#a9c6e3', 'center', null); }
    else { pt('VELOCITA', 26, 101, 1, '#a9b6cc', 'left', null); bar(96, 102, (d.top - 140) / 22); pt('SCATTO', 26, 109, 1, '#a9b6cc', 'left', null); bar(96, 110, (d.acc - 110) / 70); pt('CURVE', 26, 117, 1, '#a9b6cc', 'left', null); bar(96, 118, (d.turn - 2) / 0.75); }
    pt('LEVA: SCEGLI   A: OK', SW / 2, 127, 1, '#6f7c94', 'center', null);
    return;
  }
  if (state === 'cup') {
    pt('GRAN PREMIO', SW / 2, 13, 1, '#ffd23f', 'center');
    pt('< ' + CUPS[cupI].name + ' >', SW / 2, 22, 1, '#ffffff', 'center');
    CUPS[cupI].t.forEach((t, k) => { miniTrack(t, 30 + k * 50, 34, 26); pt(TRACKS[t].name, 30 + k * 50, 64, 1, '#c9d3e6', 'center', null); });
    DIFF.forEach((df, k) => { const y = 78 + k * 12, on = k === diff; if (on) { g.fillStyle = '#26384d'; g.fillRect(30, y - 3, SW - 60, 11); } pt(df.name, 40, y, 1, on ? '#ffffff' : '#8a96aa', 'left', null); medal(SW - 50, y - 2, cups[cupI + '-' + k]); });
    pt('SU/GIU DIFFICOLTA  A: VIA', SW / 2, 127, 1, '#6f7c94', 'center', null);
    return;
  }
  if (state === 'track') {
    pt(mode === 'tempo' ? 'PROVA A TEMPO' : 'SCEGLI LA PISTA', SW / 2, 13, 1, '#ffd23f', 'center');
    pt('< ' + TRACKS[tIdx].name + ' >', SW / 2, 22, 2, '#ffffff', 'center');
    miniTrack(tIdx, SW / 2, 38, 50);
    if (mode === 'tempo') {
      const rec = tt[tIdx] || {};
      pt('RECORD ' + (rec.race ? fmtT(rec.race) : '--'), SW / 2, 98, 1, '#ffd23f', 'center', null);
      pt('GIRO RECORD ' + (rec.lap ? fmtT(rec.lap) : '--'), SW / 2, 107, 1, '#ffffff', 'center', null);
      pt(rec.lap ? 'IL TUO FANTASMA TI ASPETTA' : 'NESSUN FANTASMA ANCORA', SW / 2, 116, 1, '#a9c6e3', 'center', null);
      pt('A: VIA   B: INDIETRO', SW / 2, 127, 1, '#6f7c94', 'center', null);
    } else {
      pt(DIFF[diff].name, SW / 2, 100, 1, '#ffffff', 'center');
      for (let i = 0; i < 3; i++) { g.fillStyle = i <= diff ? '#4ade80' : '#2a3040'; g.fillRect(SW / 2 + 22 + i * 4, 101, 3, 3); }
      const b = best[tIdx + '-' + diff];
      pt('RECORD ' + (b ? fmtT(b) : '--'), SW / 2, 110, 1, '#ffd23f', 'center', null);
      pt('SU/GIU DIFFICOLTA  A: VIA', SW / 2, 127, 1, '#6f7c94', 'center', null);
    }
  }
}
function drawResults() {
  panel(16, 112);
  if (mode === 'tempo') {
    pt('ARRIVO', SW / 2, 22, 2, '#ffd23f', 'center');
    const bl = Math.min(...laps);
    laps.forEach((l, i) => pt('GIRO ' + (i + 1) + '   ' + fmtT(l), SW / 2, 42 + i * 10, 1, l === bl ? '#4ade80' : '#e6e9f2', 'center'));
    pt('TOTALE ' + fmtT(player.ftime), SW / 2, 76, 1, '#ffffff', 'center');
    const rec = tt[tIdx] || {};
    pt('RECORD ' + (rec.race ? fmtT(rec.race) : '--') + '  GIRO ' + (rec.lap ? fmtT(rec.lap) : '--'), SW / 2, 88, 1, '#ffd23f', 'center', null);
    if (newRec) pt(newRec, SW / 2, 99, 1, '#4ade80', 'center');
    if (Math.floor(time * 2.5) % 2 === 0) pt('A: RIPROVA   B: MENU', SW / 2, 113, 1, '#ffffff', 'center');
    return;
  }
  pt(cup ? 'GARA ' + (cup.race + 1) + ' DI 3' : 'ARRIVO', SW / 2, 22, 2, '#ffd23f', 'center');
  finishOrder.forEach((k, i) => {
    const y = 40 + i * 14, col = k.isP ? '#ffd23f' : '#e6e9f2';
    if (k.isP) { g.fillStyle = '#26384d'; g.fillRect(12, y - 3, SW - 24, 12); }
    pt((i + 1) + '°', 16, y, 1, col); g.drawImage(SPR[k.di][NANG / 2], 26, y - 9, 18, 18);
    pt(k.d.name, 46, y, 1, col); pt(cup ? '+' + PTS[i] : fmtT(k.ftime), SW - 16, y, 1, col, 'right');
  });
  const pos = finishOrder.indexOf(player) + 1;
  pt(pos === 1 ? 'HAI VINTO!' : pos <= 3 ? 'SUL PODIO!' : 'RITENTA!', SW / 2, 98, 1, pos === 1 ? '#4ade80' : '#ffffff', 'center');
  if (Math.floor(time * 2.5) % 2 === 0) pt(cup ? 'A: CLASSIFICA' : 'A: PISTA DOPO   B: MENU', SW / 2, 112, 1, '#ffffff', 'center');
}
function drawStandings() {
  panel(16, 112);
  pt('CLASSIFICA', SW / 2, 22, 2, '#ffd23f', 'center');
  cupRanking().forEach((di, i) => {
    const y = 40 + i * 14, isP = di === sel, col = isP ? '#ffd23f' : '#e6e9f2';
    if (isP) { g.fillStyle = '#26384d'; g.fillRect(12, y - 3, SW - 24, 12); }
    pt((i + 1) + '°', 16, y, 1, col); g.drawImage(SPR[di][NANG / 2], 26, y - 9, 18, 18);
    pt(DRV[di].name, 46, y, 1, col); pt(String(cup.pts[di] || 0), SW - 30, y, 1, col, 'right'); pt('+' + (cup.last[di] || 0), SW - 14, y, 1, '#4ade80', 'right', null);
  });
  if (Math.floor(time * 2.5) % 2 === 0) pt(cup.race < 2 ? 'A: PROSSIMA GARA' : 'A: PREMIAZIONE', SW / 2, 112, 1, '#ffffff', 'center');
}
function drawPodium() {
  const T = TRACKS[1];
  for (let y = 0; y < SH; y++) { g.fillStyle = y < 96 ? T.sky[Math.min(2, (y / 32) | 0)] : '#58b048'; g.fillRect(0, y, SW, 1); }
  const rank = cupRanking(), spots = [[SW / 2, 74, 1], [SW / 2 - 40, 84, 2], [SW / 2 + 40, 92, 3]];
  for (const [x, y, n] of spots) { g.fillStyle = n === 1 ? '#ffd23f' : n === 2 ? '#c9d3e6' : '#e0a060'; g.fillRect(x - 17, y, 34, 100); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 12, y, 5, 100); pt(String(n), x, y + 8, 2, '#3a2a10', 'center', null); }
  spots.forEach(([x, y], i) => { const di = rank[i], s = SPR[di][Math.floor(podiumT * 10 + i * 10) % NANG]; g.drawImage(s, x - 18, y - 32, 36, 36); });
  for (let i = 0; i < 30; i++) { const t = podiumT * (40 + i * 3) + i * 37; g.fillStyle = ['#ffd23f', '#ff6b5e', '#4ab8ff', '#4ade80'][i % 4]; g.fillRect(Math.round((i * 53 + Math.sin(t * 0.05) * 6) % SW), Math.round(t % SH), 2, 2); }
  const pos = rank.indexOf(sel) + 1;
  pt(CUPS[cup.c].name, SW / 2, 6, 1, '#ffffff', 'center');
  pt(pos === 1 ? 'COPPA VINTA!' : pos + '° POSTO', SW / 2, 15, 2, pos === 1 ? '#ffd23f' : '#ffffff', 'center');
  if (pos <= 3) g.drawImage(TROPHY[pos - 1], SW / 2 - 5, 30, 10, 10);
  if (unlockMsg && Math.floor(podiumT * 3) % 2 === 0) pt(unlockMsg, SW / 2, 122, 1, '#ffd23f', 'center');
  if (podiumT > 2 && Math.floor(time * 2.5) % 2 === 0) pt('A: CONTINUA', SW / 2, 132, 1, '#ffffff', 'center');
}
function render() {
  g.imageSmoothingEnabled = false;
  ensureSprites();
  if (MENUS.includes(state)) { if (!TR || TR.i !== tIdx) buildTrack(tIdx, 1); drawMenus(); return avviso(); }
  if (state === 'podium') return drawPodium();
  renderWorld(true);
  hud();
  if (paused) { panel(44, 48); pt('PAUSA', SW / 2, 52, 3, '#ffd23f', 'center'); pt('START: RIPRENDI', SW / 2, 72, 1, '#ffffff', 'center'); pt('B: ESCI DALLA GARA', SW / 2, 81, 1, '#ffffff', 'center'); }
  if (state === 'results') drawResults();
  if (state === 'standings') drawStandings();
  avviso();
}

// ---------- suono del motore ----------
let eng = null;
function engine() {
  const racing = state === 'count' || state === 'race' || state === 'end', want = racing && !paused && aok();
  if (want && !eng && actx) {
    const o = actx.createOscillator(), f = actx.createBiquadFilter(), gn = actx.createGain();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 600; gn.gain.value = 0;
    o.connect(f); f.connect(gn); gn.connect(master); o.start(); eng = { o, gn };
  }
  if (!eng) return;
  const t = actx.currentTime;
  eng.gn.gain.setTargetAtTime(want ? (opt.music ? 0.018 : 0.03) : 0, t, 0.06);
  eng.o.frequency.setTargetAtTime(48 + Math.abs(player ? player.spd : 0) * 0.7 + (player && player.boost > 0 ? 30 : 0), t, 0.05);
  if (!racing) { const e = eng; eng = null; setTimeout(() => { try { e.o.stop(); } catch (err) {} }, 300); }
}

const MICON = ['cccccccccccccccc', 'cccccccccccccccc', 'cccwwccccccccccc', 'cccccccccccwwccc', 'gggggggggggggggg', 'ggggggrrrrgggggg', 'gggggrrrrrrggggg', 'ggggrrrhhrrrgggg',
  'gggrrrrhhrrrrggg', 'ggrrrbbbbbbrrrgg', 'grrkkbbbbbbkkrrg', 'grrkkbbbbbbkkrrg', 'rrrkkrrrrrrkkrrr', 'rrrrrrrrrrrrrrrr', 'rwwrrrwwrrrwwrrr', 'rrrrrrrrrrrrrrrr'];
if (window.__PK_DEBUG) window.__pk = {
  get state() { return state; }, get karts() { return karts; }, get player() { return player; }, get TR() { return TR; }, get cup() { return cup; }, get laps() { return laps; },
  set: o => { if ('t' in o) tIdx = o.t; if ('d' in o) sel = o.d; if ('f' in o) diff = o.f; if ('m' in o) mode = o.m; if ('c' in o) cupI = o.c; if ('s' in o) state = o.s; },
  newRace, startCup, nextCup: () => { if (state === 'results') state = 'standings'; else if (state === 'standings') nextCupRace(); }, step, places, buildTrack, TRACKS, DRV, unlocked, opt, MUS, get BTN() { return BTN; }, ink: () => { player.ink = 3; inkBlobs(); }, usa: it => { player.item = it; player.roul = 0; useItem(player); }, get bombs() { return bombs; }, get booms() { return booms; }, stepKart, genSong: i => genSong(SONGS[i]),
};
let ox = 0, oy = 0;
const racing = () => state === 'race' || state === 'count' || state === 'end';
return {
  id: 'kart', name: 'PIXEL KART', desc: 'CORSE SUI KART',
  aspect: SW / SH, pad8: true, pad360: true, padMenu: () => !(state === 'race' || state === 'end') || paused,   // in gara la leva è libera (sterzo proporzionale)
  get keys() { return opt.auto ? [['D', 'sterza'], ['A', 'oggetto'], ['B', 'oggetto'], ['START', 'pausa']] : [['D', 'sterza'], ['A', 'gas'], ['B', 'oggetto'], ['START', 'pausa']]; },
  icon(c, x, y, s) { drawIcon(c, MICON, { c: '#7ec8f0', w: '#ffffff', g: '#58b048', r: '#8a8a92', h: '#f08a2c', b: '#e0562b', k: '#22242a' }, x, y, s, '#7ec8f0'); },
  enter() {
    if (racing()) { paused = true; if (TR) musicStart(TR.T.song); }
    else if (MENUS.includes(state) || state === 'podium') musicStart(6);
  },
  leave() { if (racing()) paused = true; musicStop(); engine(); saveAll(); },
  hidden() { if (racing()) paused = true; },
  update(dt) {
    if (daFare) { if (--daFareN <= 0) { const f = daFare; daFare = null; f(); } musicTick(); return; }   // (un fotogramma con l'avviso, poi il lavoro)
    if (!MUS.on && actx && master && opt.music && MENUS.includes(state)) musicStart(6); step(dt); engine(); musicTick(); },
  draw(c, w, h) {
    render();
    let k = Math.min(w / SW, h / SH);
    const ki = Math.floor(k); if (ki >= 2 && ki / k > 0.985) k = ki;
    const dw = Math.round(SW * k), dh = Math.round(SH * k);
    ox = Math.round((w - dw) / 2); oy = Math.round((h - dh) / 2);
    const sx = shakeT > 0 ? Math.round((Math.random() - 0.5) * 4 * k) : 0, sy = shakeT > 0 ? Math.round((Math.random() - 0.5) * 4 * k) : 0;
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = TR ? TR.T.sky[0] : '#0b0d12'; c.fillRect(0, 0, w, h);
    c.imageSmoothingEnabled = false; c.drawImage(scr, ox + sx, oy + sy, dw, dh);
  },
  button(name, down) {
    if (!down || daFare) return;
    const ok = name === 'a' || name === 'start', click = () => tone(1046, 0.06, 'square', 0.035), tick = () => tone(1318, 0.03);
    if (state === 'title') { if (ok) { state = 'mode'; click(); } return; }
    if (state === 'mode') {
      if (name === 'up') { menuI = (menuI + 3) % 4; tick(); }
      else if (name === 'down') { menuI = (menuI + 1) % 4; tick(); }
      else if (ok) { click(); if (menuI === 3) { state = 'options'; optI = 0; } else { mode = ['coppa', 'gara', 'tempo'][menuI]; state = 'driver'; } }
      else if (name === 'b') state = 'title';
      return;
    }
    if (state === 'options') {
      if (name === 'up') { optI = (optI + 2) % 3; tick(); }
      else if (name === 'down') { optI = (optI + 1) % 3; tick(); }
      else if (name === 'a' || name === 'left' || name === 'right') {
        const key = ['auto', 'music', 'vib'][optI]; opt[key] = !opt[key]; click(); saveAll();
        if (key === 'music') { if (opt.music) musicStart(6); else musicStop(); }
        if (key === 'vib' && opt.vib) vib(40);
      }
      else if (name === 'b' || name === 'start') state = 'mode';
      return;
    }
    if (state === 'driver') {
      const col = sel % 3, row = (sel / 3) | 0;
      if (name === 'left') { sel = row * 3 + (col + 2) % 3; tick(); }
      else if (name === 'right') { sel = row * 3 + (col + 1) % 3; tick(); }
      else if (name === 'up' || name === 'down') { sel = (1 - row) * 3 + col; tick(); }
      else if (ok) { if (isLocked(sel)) { tone(160, 0.2, 'square', 0.04, 100); return; } click(); state = mode === 'coppa' ? 'cup' : 'track'; if (mode === 'coppa') tIdx = CUPS[cupI].t[0]; }
      else if (name === 'b') state = 'mode';
      return;
    }
    if (state === 'cup') {
      if (name === 'left' || name === 'right') { cupI = 1 - cupI; tIdx = CUPS[cupI].t[0]; demo.j = 0; tick(); }
      else if (name === 'up') { diff = Math.max(0, diff - 1); tick(); }
      else if (name === 'down') { diff = Math.min(2, diff + 1); tick(); }
      else if (ok) { saveAll(); startCup(); }
      else if (name === 'b') state = 'driver';
      return;
    }
    if (state === 'track') {
      if (name === 'left') { tIdx = (tIdx + TRACKS.length - 1) % TRACKS.length; demo.j = 0; tick(); }
      else if (name === 'right') { tIdx = (tIdx + 1) % TRACKS.length; demo.j = 0; tick(); }
      else if (name === 'up' && mode !== 'tempo') { diff = Math.max(0, diff - 1); tick(); }
      else if (name === 'down' && mode !== 'tempo') { diff = Math.min(2, diff + 1); tick(); }
      else if (ok) { saveAll(); cup = null; carica(newRace); }
      else if (name === 'b') state = 'driver';
      return;
    }
    if (state === 'results') {
      if (cup) { if (ok) { state = 'standings'; click(); } return; }
      if (ok) { if (mode === 'gara') tIdx = (tIdx + 1) % TRACKS.length; saveAll(); carica(newRace); }
      else if (name === 'b') { state = 'track'; musicStart(6); }
      return;
    }
    if (state === 'standings') { if (ok) { click(); nextCupRace(); } return; }
    if (state === 'podium') { if (ok && podiumT > 2) { cup = null; state = 'mode'; click(); } return; }
    if (paused) {
      if (name === 'start' || name === 'a') paused = false;
      else if (name === 'b') { paused = false; cup = null; state = 'mode'; musicStart(6); }
      return;
    }
    if (name === 'start') { paused = true; return; }
    if ((name === 'b' || (name === 'a' && opt.auto)) && state === 'race') useItem(player);
  }
};
})());
