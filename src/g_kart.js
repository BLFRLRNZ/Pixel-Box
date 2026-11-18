// ===================== PIXEL KART =====================
GAMES.push((() => {
const SW = 160, SH = 144, HOR = 46, MAP = 1024;      // schermo logico, orizzonte, lato della mappa
const CAM_D = 34, CAM_H = 24, FOC = 80, KS = 0.62;   // camera dietro al kart; KS = unità di mondo per pixel di sprite
const LAPS = 3, TAU = Math.PI * 2;
const scr = document.createElement('canvas'); scr.width = SW; scr.height = SH;
const g = scr.getContext('2d');
const frame = g.createImageData(SW, SH), fb = new Uint32Array(frame.data.buffer);
const rgb = h => { const n = parseInt(h.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; };
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function crisp(c) {   // niente bordi sfumati: o pieno o trasparente
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] < 120 ? 0 : 255;
  x.putImageData(d, 0, 0); return c;
}
function pix(rows, pal) {
  const c = mk(rows[0].length, rows.length), x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (pal[r[i]]) { x.fillStyle = pal[r[i]]; x.fillRect(i, j, 1, 1); } });
  return c;
}

// ---------- testo a pixel ----------
const XF = { '°': '010101010000000', "'": '010010000000000' };
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
  { name: 'VOLPE', kart: '#e0562b', head: '#f08a2c', kind: 'fox', top: 150, acc: 140, turn: 2.35, w: 1.0 },
  { name: 'RANA', kart: '#3fae3a', head: '#7ad650', kind: 'frog', top: 146, acc: 150, turn: 2.7, w: 0.9 },
  { name: 'ORSO', kart: '#3b6fd6', head: '#8a5a32', kind: 'bear', top: 155, acc: 125, turn: 2.15, w: 1.3 },
  { name: 'PINGUINO', kart: '#e2c234', head: '#2a2e38', kind: 'peng', top: 146, acc: 172, turn: 2.45, w: 0.85 },
];
// kart disegnato come piccolo modello 3D (scatole + sfere) visto da 16 angolazioni
const PITCH = 0.5;
function kartSprite(dv, yaw) {
  const S = 30, c = mk(S, S), x = c.getContext('2d');
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const P = (X, Y, Z) => { const xr = X * cy - Y * sy, yr = X * sy + Y * cy; return [S / 2 - yr, S * 0.66 - (Z * cp + xr * sp), xr * cp - Z * sp]; };
  const L = [-0.55, 0.45, 0.7];   // luce in spazio camera (da dietro, sinistra, in alto)
  const items = [];
  const box = (x0, x1, y0, y1, z0, z1, col) => {
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(p => P(...p));
    for (const [ix, n] of [[[4, 5, 6, 7], [0, 0, 1]], [[0, 1, 5, 4], [0, -1, 0]], [[2, 3, 7, 6], [0, 1, 0]], [[1, 2, 6, 5], [1, 0, 0]], [[3, 0, 4, 7], [-1, 0, 0]]]) {
      const nx = n[0] * cy - n[1] * sy, ny = n[0] * sy + n[1] * cy, nz = n[2];
      if (-nx * cp + nz * sp <= 0.02) continue;          // faccia girata dall'altra parte
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
  const k = dv.kart, tire = '#22242a';
  box(-8, 8, -5.5, 5.5, 1.5, 4, k);
  box(8, 11, -3.5, 3.5, 1.5, 3.5, shade(k, 0.9));
  box(-10, -8, -3.5, 3.5, 2, 5, '#3a3d46');
  box(-6.5, -3.5, -3.2, 3.2, 4, 8.5, '#2b2e35');
  box(4, 8, 5.5, 8, 0, 3.5, tire); box(4, 8, -8, -5.5, 0, 3.5, tire);
  box(-8, -3, 5.5, 8.5, 0, 4.5, tire); box(-8, -3, -8.5, -5.5, 0, 4.5, tire);
  box(-4, 0, -2.6, 2.6, 4, 9, shade(k, 0.75));
  const h = dv.head;
  ball(-1.5, 0, 12, 3.6, h);
  if (dv.kind === 'fox') { ball(-2.4, 2.3, 15.2, 1.5, h); ball(-2.4, -2.3, 15.2, 1.5, h); ball(1.7, 0, 11.2, 1.7, '#f6ecdc'); ball(2.9, 0, 11.5, 0.7, '#1a1a1a'); ball(1.2, 1.3, 13, 0.6, '#1a1a1a'); ball(1.2, -1.3, 13, 0.6, '#1a1a1a'); }
  if (dv.kind === 'frog') { ball(-0.6, 2.1, 14.6, 1.7, h); ball(-0.6, -2.1, 14.6, 1.7, h); ball(0.7, 2.1, 14.9, 0.8, '#101010'); ball(0.7, -2.1, 14.9, 0.8, '#101010'); }
  if (dv.kind === 'bear') { ball(-2.2, 2.8, 14.8, 1.5, h); ball(-2.2, -2.8, 14.8, 1.5, h); ball(1.6, 0, 11.4, 1.6, '#c99a6a'); ball(2.9, 0, 11.9, 0.7, '#141414'); ball(1.1, 1.3, 13.1, 0.55, '#141414'); ball(1.1, -1.3, 13.1, 0.55, '#141414'); }
  if (dv.kind === 'peng') { ball(0.4, 0, 11.8, 2.7, '#f4f6f8'); ball(2.4, 0, 11.3, 1.1, '#f0a020'); ball(1.6, 1.1, 12.9, 0.55, '#101010'); ball(1.6, -1.1, 12.9, 0.55, '#101010'); }
  items.sort((a, b) => b.d - a.d).forEach(it => it.f());
  return crisp(c);
}
let SPR = null;   // [pilota][angolo]
function ensureSprites() {
  if (SPR) return;
  SPR = DRV.map(dv => Array.from({ length: 16 }, (_, i) => kartSprite(dv, i / 16 * TAU)));
}

// ---------- oggetti ----------
const ITEMS = ['turbo', 'rocket', 'oil', 'shield'];
const ICON = {
  turbo: pix(['....aa....', '...abba...', '..abccba..', '..abccba..', '.abcddcba.', '.abcddcba.', '..abccba..', '...abba...', '....aa....', '..........'], { a: '#d8401c', b: '#f07a20', c: '#ffc145', d: '#fff4b8' }),
  rocket: pix(['....aa....', '...abba...', '...bccb...', '...bccb...', '...bccb...', '..dbccbd..', '.dd.bb.dd.', '.d..ee..d.', '....ff....', '....e.....'], { a: '#e02a18', b: '#c9cfda', c: '#eef1f6', d: '#5a6378', e: '#ffc145', f: '#ff6b2a' }),
  oil: pix(['..........', '....a.....', '...aa.....', '...aba....', '..aabba...', '..abbba...', '..aaaaa...', '...aaa....', '.aaaaaaa..', 'aaaaaaaaa.'], { a: '#1c1c24', b: '#5b5b78' }),
  shield: pix(['..aaaaaa..', '.abbbbbba.', 'abbccbbbba', 'abcbbbbbba', 'abbbbbbbba', 'abbbbbbbba', 'abbbbbbbba', '.abbbbbba.', '..abbbba..', '...aaaa...'], { a: '#2a6fb0', b: '#7cc8f4', c: '#e6f6ff' }),
};
const GEM = [0, 1, 2, 3].map(i => pix(['....a....', '...aba...', '..abcba..', '.abcccba.', 'abccdccba', '.abcccba.', '..abcba..', '...aba...', '....a....'],
  [{ a: '#7a2ad8', b: '#b06cf2', c: '#e0b8ff', d: '#ffffff' }, { a: '#1f8ad8', b: '#5cc0f4', c: '#bfe8ff', d: '#ffffff' }, { a: '#1c9a5a', b: '#4ad68a', c: '#bff4d6', d: '#ffffff' }, { a: '#d8901f', b: '#f4c050', c: '#ffe8a8', d: '#ffffff' }][i]));
const ROCKET = pix(['..aa..', '.abba.', '.bccb.', 'dbccbd', 'd.ee.d', '..ff..'], { a: '#e02a18', b: '#c9cfda', c: '#eef1f6', d: '#5a6378', e: '#ffc145', f: '#ff6b2a' });

// ---------- piste ----------
const TRACKS = [
  { name: 'PRATO', w: 72, off: 46, grip: 1.0, offSlow: 0.55, pts: [[300, 150], [700, 150], [860, 260], [870, 480], [720, 560], [630, 700], [760, 830], [600, 905], [330, 885], [170, 740], [235, 560], [150, 380], [180, 220]],
    sky: ['#5fb4ee', '#7ec8f0', '#a8dcf6'], haze: '#c8e8f6', off1: '#58b048', off2: '#4ea040', far: '#2d6e32', far2: '#25602a', road: '#8a8a92', deco: 'tree', hills: ['#5aa45a', '#3e8a46'] },
  { name: 'SPIAGGIA', w: 66, off: 40, grip: 0.95, offSlow: 0.45, pts: [[160, 200], [520, 140], [880, 200], [905, 420], [640, 470], [570, 600], [860, 700], [880, 880], [520, 905], [300, 760], [140, 820], [100, 560], [240, 420], [120, 320]],
    sky: ['#3fa4ec', '#62b8f0', '#a0d8f8'], haze: '#d6eefa', off1: '#ecd28c', off2: '#e0c47c', far: '#2f86d2', far2: '#4aa2e6', road: '#9a9aa2', deco: 'palm', hills: ['#7ab8e0', '#5a9ad0'] },
  { name: 'GHIACCIO', w: 78, off: 44, grip: 0.38, offSlow: 0.5, pts: [[200, 180], [820, 180], [905, 340], [780, 500], [885, 660], [820, 860], [200, 860], [120, 700], [265, 520], [120, 340]],
    sky: ['#8cb4dc', '#a8c8e8', '#d8e8f6'], haze: '#e8f0f8', off1: '#f2f6fa', off2: '#e0e8f2', far: '#c4d6e8', far2: '#b0c6dc', road: '#8aaed0', deco: 'pine', hills: ['#e8eef6', '#aac0d8'] },
  { name: 'VULCANO', w: 60, off: 36, grip: 0.9, offSlow: 0.4, pts: [[180, 140], [460, 120], [560, 300], [760, 170], [905, 300], [830, 520], [610, 500], [520, 665], [780, 760], [865, 905], [480, 920], [300, 765], [120, 865], [90, 560], [265, 440], [110, 300]],
    sky: ['#2a1022', '#4a1a2a', '#7a2a2a'], haze: '#8a3a2a', off1: '#4a3a3a', off2: '#3e3030', far: '#d8481c', far2: '#f08a20', road: '#5c5c66', deco: 'rock', hills: ['#3a1c22', '#5a2228'] },
];
const DIFF = [{ name: 'FACILE', ai: 0.86 }, { name: 'NORMALE', ai: 0.94 }, { name: 'DIFFICILE', ai: 1.01 }];
function spline(P, step) {
  const dense = [], n = P.length;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let t = 0; t < 1; t += 0.02) {
      const t2 = t * t, t3 = t2 * t, q = j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      dense.push([q(0), q(1)]);
    }
  }
  const out = [dense[0]]; let acc = 0;   // ricampiona a passo costante
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length]; let seg = Math.hypot(b[0] - a[0], b[1] - a[1]), t0 = 0;
    while (acc + seg * (1 - t0) >= step) { const need = step - acc, f = t0 + need / seg; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); t0 = f; acc = 0; if (t0 >= 1) break; }
    acc += seg * (1 - t0);
  }
  if (Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < step * 0.5) out.pop();
  return out;
}
function decoSprite(kind) {
  if (kind === 'tree') return pix(['.....aaaa.....', '...aabbbbaa...', '..abbbccbbba..', '.abbbccccbbba.', '.abbbbccbbbba.', 'abbbbbbbbbbbba', 'abbcbbbbbbbbba', 'abbbbbbbbcbbba', '.abbbbbbbbbba.', '.aabbbbbbbbaa.', '..aaabbbbaaa..', '....aaddaa....', '......dd......', '......dd......', '.....deed.....', '.....dddd.....'],
    { a: '#1f5a24', b: '#3e9a3a', c: '#6cc85a', d: '#6a4424', e: '#4a2e18' });
  if (kind === 'palm') return pix(['..aa....aa....', '.abba..abba...', 'abbbbaabbbba..', '.aabbbbbbaa...', '...aabbbaa....', '..ab.cc.ba....', '.ab..cc..ba...', '.....cc.......', '.....dc.......', '......cd......', '......cc......', '......dc......', '.....cd.......', '.....cc.......', '.....dc.......', '....cccc......'],
    { a: '#1f6a2a', b: '#3eae4a', c: '#a8784a', d: '#7a5230' });
  if (kind === 'pine') return pix(['......a.......', '.....aaa......', '....awbaa.....', '.....aba......', '....aabba.....', '...awbbbaa....', '....abbba.....', '...aabbbba....', '..awbbbbbaa...', '...abbbbba....', '..aabbbbbba...', '.awbbbbbbbaa..', '.aaaaaaaaaaa..', '......cc......', '......cc......', '.....cccc.....'],
    { a: '#1a4a3a', b: '#2e7a5a', w: '#f4f8fc', c: '#5a3a24' });
  return pix(['....aaaa....', '..aabbbbaa..', '.abbbcbbbba.', '.abbbbbcbba.', 'abbcbbbbbbba', 'abbbbbbcbbba', 'abbbdbbbbbba', 'aaabbbbbdaaa'], { a: '#1e1414', b: '#3a2a2a', c: '#5a4444', d: '#f07a20' });
}
let TR = null, tIdx = 0;
function buildTrack(i) {
  const T = TRACKS[i], c = spline(T.pts, 8), n = c.length;
  const ang = c.map((p, j) => { const q = c[(j + 1) % n], o = c[(j - 1 + n) % n]; return Math.atan2(q[1] - o[1], q[0] - o[0]); });
  const nrm = ang.map(a => [-Math.sin(a), Math.cos(a)]);
  const path = x => { x.beginPath(); c.forEach((p, j) => j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.lineJoin = 'round'; x.lineCap = 'round'; };
  const R = rng(1234 + i * 77);
  const pat = (w, h, fn) => { const p = mk(w, h), px = p.getContext('2d'); fn(px); return p; };
  // aspetto
  const cv = mk(MAP, MAP), x = cv.getContext('2d');
  const farP = pat(32, 32, p => { p.fillStyle = T.far; p.fillRect(0, 0, 32, 32); p.fillStyle = T.far2; for (let k = 0; k < 14; k++) p.fillRect(R() * 32 | 0, R() * 32 | 0, T.deco === 'palm' ? 4 : 2, T.deco === 'palm' ? 1 : 2); });
  x.fillStyle = x.createPattern(farP, 'repeat'); x.fillRect(0, 0, MAP, MAP);
  const offP = pat(64, 64, p => { p.fillStyle = T.off1; p.fillRect(0, 0, 64, 64); p.fillStyle = T.off2; p.fillRect(0, 0, 32, 32); p.fillRect(32, 32, 32, 32); });
  path(x); x.lineWidth = T.w + 2 * T.off; x.strokeStyle = x.createPattern(offP, 'repeat'); x.stroke();
  path(x); x.lineWidth = T.w + 10; x.setLineDash([12, 12]); x.strokeStyle = '#eef0f2'; x.stroke(); x.lineDashOffset = 12; x.strokeStyle = '#d23a2a'; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
  const roadP = pat(32, 32, p => { p.fillStyle = T.road; p.fillRect(0, 0, 32, 32); for (let k = 0; k < 40; k++) { p.fillStyle = shade(T.road, R() < 0.5 ? 0.9 : 1.08); p.fillRect(R() * 32 | 0, R() * 32 | 0, 1, 1); } });
  path(x); x.lineWidth = T.w; x.strokeStyle = x.createPattern(roadP, 'repeat'); x.stroke();
  // linea del traguardo a scacchi
  const a0 = ang[0], s = 6, cols = Math.ceil(T.w / s);
  x.save(); x.translate(c[0][0], c[0][1]); x.rotate(a0);
  for (let r = 0; r < 2; r++) for (let k = 0; k < cols; k++) { x.fillStyle = (r + k) % 2 ? '#111318' : '#f4f4f4'; x.fillRect(r * s - s, -T.w / 2 + k * s, s, s); }
  x.restore();
  // zone per la fisica: 0 barriera, 1 fuori pista, 2 cordolo, 3 pista
  const zc = mk(MAP, MAP), zx = zc.getContext('2d');
  zx.fillStyle = '#000'; zx.fillRect(0, 0, MAP, MAP);
  path(zx); zx.lineWidth = T.w + 2 * T.off; zx.strokeStyle = 'rgb(85,85,85)'; zx.stroke();
  path(zx); zx.lineWidth = T.w + 10; zx.strokeStyle = 'rgb(170,170,170)'; zx.stroke();
  path(zx); zx.lineWidth = T.w; zx.strokeStyle = '#fff'; zx.stroke();
  const zd = zx.getImageData(0, 0, MAP, MAP).data, zone = new Uint8Array(MAP * MAP);
  for (let k = 0; k < zone.length; k++) zone[k] = Math.round(zd[k * 4] / 85);
  // decorazioni appena oltre il bordo
  const deco = [], dspr = decoSprite(T.deco);
  for (let j = 0; j < n; j += 3) for (const side of [-1, 1]) {
    if (R() < 0.45) continue;
    const dist = T.w / 2 + T.off + 8 + R() * 70, p = [c[j][0] + nrm[j][0] * side * dist, c[j][1] + nrm[j][1] * side * dist];
    if (p[0] < 4 || p[1] < 4 || p[0] > MAP - 4 || p[1] > MAP - 4) continue;
    if (zone[(p[1] | 0) * MAP + (p[0] | 0)] !== 0) continue;
    deco.push({ x: p[0], y: p[1], spr: dspr, bs: T.deco === 'rock' ? 1.6 : 1.9 });
  }
  // cristalli degli oggetti
  const gems = [];
  for (const f of [0.27, 0.62]) { const j = Math.floor(f * n); for (const l of [-0.3, 0, 0.3]) gems.push({ x: c[j][0] + nrm[j][0] * l * T.w, y: c[j][1] + nrm[j][1] * l * T.w, t: 0 }); }
  // minimappa
  let mx0 = 1e9, my0 = 1e9, mx1 = -1e9, my1 = -1e9;
  for (const p of c) { mx0 = Math.min(mx0, p[0]); my0 = Math.min(my0, p[1]); mx1 = Math.max(mx1, p[0]); my1 = Math.max(my1, p[1]); }
  const ms = 34 / Math.max(mx1 - mx0, my1 - my0);
  const sky = [];
  for (let y = 0; y < HOR; y++) sky.push(rgb(T.sky[Math.min(2, Math.floor(y / HOR * 3))]));
  TR = { i, T, c, n, ang, nrm, w: T.w, tex: new Uint32Array(x.getImageData(0, 0, MAP, MAP).data.buffer), zone, deco, gems,
    farC: rgb(T.far), sky, strip: hillStrip(T), mini: { x0: mx0, y0: my0, s: ms } };
}
function hillStrip(T) {
  const c = mk(256, 24), x = c.getContext('2d'), R = rng(99);
  for (let layer = 0; layer < 2; layer++) {
    x.fillStyle = T.hills[layer];
    for (let i = 0; i < 256; i++) {
      const hgt = layer === 0 ? 12 + 7 * Math.sin(i / 256 * TAU * 3) + 3 * Math.sin(i / 256 * TAU * 7)
        : 5 + 4 * Math.abs(Math.sin(i / 256 * TAU * 5 + 1)) + (T.deco === 'rock' && Math.abs(i - 128) < 30 ? 14 - Math.abs(i - 128) * 0.45 : 0);
      x.fillRect(i, 24 - Math.round(hgt), 1, Math.round(hgt));
    }
  }
  if (T.deco !== 'rock') { x.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k < 5; k++) { const cx = R() * 256 | 0, cy = 2 + R() * 6 | 0; x.fillRect(cx, cy, 14, 2); x.fillRect(cx + 3, cy - 1, 8, 1); } }
  else { x.fillStyle = '#f07a20'; x.fillRect(125, 0, 6, 2); x.fillStyle = '#ffc145'; x.fillRect(127, 1, 2, 1); }
  return c;
}

// ---------- stato ----------
let state = 'title', paused = false, time = 0, sel = 0, diff = 1, raceT = 0, count = 0, endT = 0, msg = null, wrongT = 0;
let karts = [], player = null, rockets = [], oils = [], finishOrder = [], best = {};
try { best = JSON.parse(localStorage.getItem('pk_best')) || {}; } catch (e) {}
try { const s = JSON.parse(localStorage.getItem('pk_sel')); if (s) { sel = s.d | 0; tIdx = s.t | 0; diff = s.f ?? 1; } } catch (e) {}
const saveSel = () => { try { localStorage.setItem('pk_sel', JSON.stringify({ d: sel, t: tIdx, f: diff })); localStorage.setItem('pk_best', JSON.stringify(best)); } catch (e) {} };
const cam = { x: 0, y: 0, a: 0 };
let demo = { j: 0, a: 0 };

function newRace() {
  buildTrack(tIdx); ensureSprites();
  const order = [sel, ...[0, 1, 2, 3].filter(i => i !== sel)];
  const slots = [[-6, 0.22], [-6, -0.22], [-11, 0.22], [-11, -0.22]];
  const grid = [order[1], order[2], order[0], order[3]];   // il giocatore parte terzo
  karts = grid.map((di, gi) => {
    const j = (TR.n + slots[gi][0]) % TR.n, p = TR.c[j], l = slots[gi][1] * TR.w;
    return { di, d: DRV[di], x: p[0] + TR.nrm[j][0] * l, y: p[1] + TR.nrm[j][1] * l, a: TR.ang[j], ma: TR.ang[j], spd: 0, idx: j, lap: 0, cp: 3,
      item: null, roul: 0, itemT: 0, spin: 0, boost: 0, shield: 0, drift: 0, dt: 0, charge: 0, fin: 0, ftime: 0, skill: 1, isP: di === sel,
      phase: gi * 1.7, lane: 0.6 + gi * 0.15, base: DIFF[diff].ai * (0.985 + gi * 0.012) };
  });
  player = karts.find(k => k.isP);
  for (const k of karts) if (k.isP) k.base = 1;
  rockets = []; oils = []; finishOrder = []; raceT = 0; count = 3.2; endT = 0; msg = null; wrongT = 0;
  cam.a = player.a; placeCam();
  state = 'count'; paused = false;
}
function placeCam() { cam.x = player.x - Math.cos(cam.a) * CAM_D; cam.y = player.y - Math.sin(cam.a) * CAM_D; }
const zoneAt = (x, y) => { const ix = x | 0, iy = y | 0; return (ix < 0 || iy < 0 || ix >= MAP || iy >= MAP) ? 0 : TR.zone[iy * MAP + ix]; };
const prog = k => k.lap * TR.n + k.idx;
function trackIdx(k) {
  const n = TR.n; let best = 1e18, bi = k.idx;
  for (let o = -8; o <= 14; o++) { const i = (k.idx + o + n) % n, p = TR.c[i], d = (p[0] - k.x) ** 2 + (p[1] - k.y) ** 2; if (d < best) { best = d; bi = i; } }
  if (best > (TR.w * 2) ** 2) for (let i = 0; i < n; i++) { const p = TR.c[i], d = (p[0] - k.x) ** 2 + (p[1] - k.y) ** 2; if (d < best) { best = d; bi = i; } }
  if (k.idx > n * 0.8 && bi < n * 0.2) { if (k.cp >= 3) { k.lap++; k.cp = 0; onLap(k); } }
  else if (k.idx < n * 0.2 && bi > n * 0.8) { k.lap--; k.cp = 3; }
  const q = Math.floor(bi / n * 4); if (q === k.cp + 1) k.cp = q;
  k.idx = bi;
}
function onLap(k) {
  if (k.lap > LAPS && !k.fin) {
    k.fin = finishOrder.length + 1; k.ftime = raceT; finishOrder.push(k);
    if (k.isP) { state = 'end'; endT = 0; msg = { t: 'ARRIVO!', c: '#ffd23f', life: 3 }; seq([784, 988, 1175, 1568], 0.12, 0.1, 0.05); saveBest(); }
  } else if (k.isP && k.lap >= 2) {
    if (k.lap === LAPS) { msg = { t: 'ULTIMO GIRO!', c: '#ff6b5e', life: 2 }; seq([659, 784, 988, 1319], 0.1, 0.08, 0.05); }
    else { msg = { t: 'GIRO ' + k.lap, c: '#ffffff', life: 1.5 }; seq([784, 1047], 0.08, 0.08, 0.045); }
  }
}
function saveBest() { const key = tIdx + '-' + diff; if (!best[key] || raceT < best[key]) best[key] = raceT; saveSel(); }
function places() {
  const live = karts.filter(k => !k.fin).sort((a, b) => prog(b) - prog(a));
  return [...finishOrder, ...live];
}

// ---------- guida ----------
const NOIN = { steer: 0, gas: false, brake: false };
function endDrift(k) {
  if (k.charge > 1.0) { k.boost = Math.max(k.boost, 0.9); if (k.isP) tone(500, 0.25, 'sawtooth', 0.035, 1100); }
  else if (k.charge > 0.5) { k.boost = Math.max(k.boost, 0.5); if (k.isP) tone(400, 0.18, 'sawtooth', 0.03, 800); }
  k.drift = 0; k.dt = 0; k.charge = 0;
}
function stepKart(k, inp, dt) {
  const d = k.d, T = TR.T;
  if (k.spin > 0) { k.spin -= dt; k.spd *= Math.exp(-2.6 * dt); k.a += 12 * dt; inp = NOIN; if (k.spin <= 0) k.a = k.ma; }
  const z = zoneAt(k.x, k.y);
  let top = d.top * k.skill;
  if (z === 1) top *= T.offSlow; else if (z === 2) top *= 0.96;
  if (k.boost > 0) { k.boost -= dt; top *= 1.32; k.spd = Math.max(k.spd, top * 0.9); }
  if (k.shield > 0) k.shield -= dt;
  if (inp.gas) { if (k.spd < top) k.spd = Math.min(top, k.spd + d.acc * dt * (1 - 0.5 * Math.max(0, k.spd) / top)); }
  else if (!inp.brake) k.spd -= Math.sign(k.spd) * Math.min(Math.abs(k.spd), 60 * dt);
  if (inp.brake) k.spd = Math.max(-top * 0.35, k.spd - 280 * dt);
  if (k.spd > top) k.spd = Math.max(top, k.spd - 200 * dt);
  const f = Math.max(-1, Math.min(1, k.spd / 55));
  // derapata (solo il giocatore): sterzo tenuto a tutta velocità
  if (k.isP && k.spin <= 0) {
    if (inp.steer && inp.gas && k.spd > top * 0.55) {
      if (!k.drift) { k.dt += dt; if (k.dt > 0.3) { k.drift = Math.sign(inp.steer); k.charge = 0; } }
      else if (Math.sign(inp.steer) === k.drift) k.charge += dt;
      else endDrift(k);
    } else if (k.drift) endDrift(k); else k.dt = 0;
  }
  const turn = k.drift ? d.turn * 1.2 * k.drift * f : d.turn * inp.steer * f;
  k.a += turn * dt;
  const grip = (k.drift ? 3.2 : 9) * T.grip;
  k.ma += angDiff(k.a, k.ma) * Math.min(1, grip * dt);
  const nx = k.x + Math.cos(k.ma) * k.spd * dt, ny = k.y + Math.sin(k.ma) * k.spd * dt;
  if (zoneAt(nx, ny)) { k.x = nx; k.y = ny; }
  else if (zoneAt(nx, k.y)) { k.x = nx; k.spd *= 0.9; }
  else if (zoneAt(k.x, ny)) { k.y = ny; k.spd *= 0.9; }
  else { k.spd *= -0.3; if (k.isP) noise(0.08, 0.06); }
  trackIdx(k);
}
function aiInput(k) {
  const n = TR.n, look = 7 + (k.spd > 110 ? 3 : 0), i = (k.idx + look) % n, p = TR.c[i];
  const lane = Math.sin(time * 0.35 + k.phase) * 0.26 * TR.w * k.lane;
  const tx = p[0] + TR.nrm[i][0] * lane, ty = p[1] + TR.nrm[i][1] * lane;
  const df = angDiff(Math.atan2(ty - k.y, tx - k.x), k.a);
  // fermo e girato di traverso: retromarcia sterzando, poi riparte
  if (k.spd < 30 && Math.abs(df) > 1.6 && !(k.rev > 0)) k.rev = 0.7;
  if (k.rev > 0) { k.rev -= 1 / 60; if (Math.abs(df) < 0.9) k.rev = 0; return { steer: -Math.sign(df), gas: false, brake: true }; }
  const bend = Math.abs(angDiff(TR.ang[(k.idx + 14) % n], TR.ang[k.idx]));
  const fast = bend > 0.85 && k.spd > k.d.top * 0.7 * TR.T.grip ** 0.3;
  return { steer: Math.max(-1, Math.min(1, df * 2.4)), gas: !fast && (Math.abs(df) < 1.4 || k.spd < 45), brake: false };
}
function giveItem(k) {
  const pl = places().indexOf(k);
  const odds = [[10, 0, 50, 40], [30, 25, 25, 20], [35, 40, 10, 15], [45, 45, 0, 10]][Math.max(0, Math.min(3, pl))];
  let r = Math.random() * 100, it = 0;
  while (r > odds[it]) { r -= odds[it]; it++; }
  return ITEMS[it];
}
function useItem(k) {
  if (!k.item || k.roul > 0) return;
  const it = k.item; k.item = null; k.itemT = 0;
  if (it === 'turbo') { k.boost = Math.max(k.boost, 1.2); if (k.isP) tone(300, 0.35, 'sawtooth', 0.04, 900); }
  else if (it === 'shield') { k.shield = 7; if (k.isP) seq([880, 1320], 0.08, 0.06, 0.035); }
  else if (it === 'oil') { oils.push({ x: k.x - Math.cos(k.a) * 14, y: k.y - Math.sin(k.a) * 14, life: 30 }); if (k.isP) tone(160, 0.15, 'square', 0.04, 90); }
  else if (it === 'rocket') {
    const pl = places(), i = pl.indexOf(k), target = i > 0 ? pl[i - 1] : null;
    rockets.push({ x: k.x + Math.cos(k.a) * 10, y: k.y + Math.sin(k.a) * 10, a: k.a, spd: Math.max(150, k.spd) + 95, owner: k, target, life: 4, age: 0 });
    if (k.isP || Math.hypot(k.x - player.x, k.y - player.y) < 200) noise(0.25, 0.05);
  }
}
function hit(k) {
  if (k.spin > 0) return;
  if (k.shield > 0) { k.shield = 0; if (k.isP) tone(1200, 0.12, 'square', 0.04, 600); return; }
  k.spin = 1.1; k.drift = 0; k.dt = 0; k.charge = 0; k.boost = 0; k.spd *= 0.5;
  if (k.isP) { noise(0.3, 0.12); tone(600, 0.4, 'square', 0.04, 120); }
}
function aiItems(k, dt) {
  if (!k.item || k.roul > 0) return;
  k.itemT += dt;
  const pl = places(), i = pl.indexOf(k);
  const ahead = i > 0 ? pl[i - 1] : null, behind = i < pl.length - 1 ? pl[i + 1] : null;
  const straight = Math.abs(angDiff(TR.ang[(k.idx + 12) % TR.n], TR.ang[k.idx])) < 0.25;
  if (k.item === 'shield' || k.itemT > 9
    || (k.item === 'turbo' && straight && k.itemT > 1)
    || (k.item === 'rocket' && ahead && prog(ahead) - prog(k) < 45 && k.itemT > 1)
    || (k.item === 'oil' && behind && prog(k) - prog(behind) < 14 && k.itemT > 1)) useItem(k);
}
function step(dt) {
  time += dt;
  if (state === 'title' || state === 'driver' || state === 'track') { demoCam(dt); return; }
  if (paused || state === 'results') return;
  if (state === 'count') {
    const before = Math.ceil(count); count -= dt;
    if (Math.ceil(count) !== before && before >= 1 && before <= 3) tone(before === 1 ? 660 : 440, 0.15, 'square', 0.04);
    if (count <= 0) { state = 'race'; tone(880, 0.35, 'square', 0.045); msg = { t: 'VIA!', c: '#4ade80', life: 0.9 }; }
    cam.a = player.a; placeCam(); return;
  }
  raceT += dt;
  let pIn = { steer: (BTN.right ? 1 : 0) - (BTN.left ? 1 : 0), gas: BTN.a, brake: BTN.down };
  if (window.__pk && window.__pk.auto) { const ai = aiInput(player); pIn = { steer: Math.abs(ai.steer) > 0.3 ? Math.sign(ai.steer) : 0, gas: ai.gas, brake: ai.brake }; }
  // avversari: un po' più lenti se sono molto avanti, un po' più veloci se sono indietro
  for (const k of karts) {
    if (k.isP && state === 'race') { k.skill = 1; stepKart(k, pIn, dt); continue; }
    const dp = prog(k) - prog(player);
    k.skill = k.isP ? 0.9 : k.base * Math.max(0.9, Math.min(1.07, 1 - dp * 0.0016));
    stepKart(k, aiInput(k), dt);
    if (!k.isP) aiItems(k, dt);
  }
  // urti tra kart
  for (let i = 0; i < karts.length; i++) for (let j = i + 1; j < karts.length; j++) {
    const a = karts[i], b = karts[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
    if (d2 > 0.01 && d2 < 144) {
      const d = Math.sqrt(d2), o = 12 - d, nx = dx / d, ny = dy / d, wa = a.d.w, wb = b.d.w;
      a.x -= nx * o * wb / (wa + wb); a.y -= ny * o * wb / (wa + wb); b.x += nx * o * wa / (wa + wb); b.y += ny * o * wa / (wa + wb);
      a.spd *= 0.97; b.spd *= 0.97;
      if ((a.isP || b.isP) && Math.random() < 0.3) noise(0.05, 0.05);
    }
  }
  // cristalli
  for (const gm of TR.gems) {
    if (gm.t > 0) { gm.t -= dt; continue; }
    for (const k of karts) if (Math.hypot(k.x - gm.x, k.y - gm.y) < 10) {
      gm.t = 3;
      if (!k.item && !k.roul) { if (k.isP) { k.roul = 1.1; k.item = giveItem(k); tone(1320, 0.05, 'square', 0.03); } else { k.item = giveItem(k); k.itemT = 0; } }
      break;
    }
  }
  if (player.roul > 0) { const b = player.roul; player.roul -= dt; if (Math.floor(b * 12) !== Math.floor(player.roul * 12)) tone(1500, 0.02, 'square', 0.02); if (player.roul <= 0) { player.roul = 0; tone(1760, 0.08, 'square', 0.035); } }
  // razzi e macchie d'olio
  for (const r of rockets) {
    r.age += dt; r.life -= dt;
    if (r.target && !r.target.fin) r.a += Math.max(-3.4 * dt, Math.min(3.4 * dt, angDiff(Math.atan2(r.target.y - r.y, r.target.x - r.x), r.a)));
    r.x += Math.cos(r.a) * r.spd * dt; r.y += Math.sin(r.a) * r.spd * dt;
    if (!zoneAt(r.x, r.y)) r.life = 0;
    for (const k of karts) if ((k !== r.owner || r.age > 0.5) && Math.hypot(k.x - r.x, k.y - r.y) < 9) { hit(k); r.life = 0; break; }
  }
  rockets = rockets.filter(r => r.life > 0);
  for (const o of oils) { o.life -= dt; for (const k of karts) if (Math.hypot(k.x - o.x, k.y - o.y) < 8) { hit(k); o.life = 0; break; } }
  oils = oils.filter(o => o.life > 0);
  // contromano
  if (state === 'race' && Math.abs(angDiff(player.ma, TR.ang[player.idx])) > 2 && player.spd > 25) wrongT += dt; else wrongT = 0;
  if (msg && (msg.life -= dt) <= 0) msg = null;
  // camera: segue la direzione di marcia con un po' di ritardo (così si vede la derapata)
  cam.a += angDiff(player.spin > 0 ? cam.a : player.ma, cam.a) * Math.min(1, 7 * dt);
  placeCam();
  if (state === 'end') {
    endT += dt;
    if (endT > 5 || finishOrder.length === karts.length) {
      for (const k of places()) if (!k.fin) { k.fin = finishOrder.length + 1; k.ftime = raceT + (TR.n * (LAPS + 1) - prog(k)) * 8 / (k.d.top * 0.85); finishOrder.push(k); }
      state = 'results'; endT = 0;
    }
  }
}
function demoCam(dt) {
  if (!TR || TR.i !== tIdx) buildTrack(tIdx);
  demo.j = (demo.j + dt * 110 / 8) % TR.n;
  const j = demo.j | 0, p = TR.c[j], q = TR.c[(j + 1) % TR.n], f = demo.j - j;
  const want = TR.ang[(j + 4) % TR.n];
  demo.a += angDiff(want, demo.a) * Math.min(1, 3 * dt);
  cam.a = demo.a; cam.x = p[0] + (q[0] - p[0]) * f - Math.cos(cam.a) * CAM_D; cam.y = p[1] + (q[1] - p[1]) * f - Math.sin(cam.a) * CAM_D;
}

// ---------- disegno ----------
let CX, CY, FX, FY, RX, RY;
function proj(x, y) {
  const dx = x - CX, dy = y - CY, z = dx * FX + dy * FY;
  if (z < 5) return null;
  const s = FOC / z;
  return { z, s, sx: SW / 2 + (dx * RX + dy * RY) * s, sy: HOR + CAM_H * s };
}
function renderWorld(withKarts) {
  CX = cam.x; CY = cam.y; FX = Math.cos(cam.a); FY = Math.sin(cam.a); RX = -FY; RY = FX;
  const tex = TR.tex, farC = TR.farC;
  for (let y = 0; y < HOR; y++) fb.fill(TR.sky[y], y * SW, y * SW + SW);
  for (let y = HOR; y < SH; y++) {
    const z = Math.min(1600, CAM_H * FOC / (y - HOR + 0.6)), k = z / FOC;
    let wx = CX + FX * z - RX * k * SW / 2, wy = CY + FY * z - RY * k * SW / 2;
    const sx = RX * k, sy = RY * k;
    let o = y * SW;
    for (let x = 0; x < SW; x++, o++) {
      const ix = wx | 0, iy = wy | 0;
      fb[o] = (ix >= 0 && iy >= 0 && ix < MAP && iy < MAP) ? tex[iy * MAP + ix] : farC;
      wx += sx; wy += sy;
    }
  }
  g.putImageData(frame, 0, 0);
  // colline lontane che scorrono quando giri
  const off = -(((cam.a / TAU) * 512) % 256 + 256) % 256;
  for (let x = off; x < SW; x += 256) g.drawImage(TR.strip, Math.round(x), HOR - 24);
  g.fillStyle = TR.T.haze;
  for (let i = 0; i < 8; i++) { g.globalAlpha = 0.55 * (1 - i / 8); g.fillRect(0, HOR + i, SW, 1); }
  g.globalAlpha = 1;
  // sprite in ordine di distanza
  const L = [];
  for (const d of TR.deco) { const p = proj(d.x, d.y); if (p && p.z < 700) L.push({ p, k: 0, o: d }); }
  for (const gm of TR.gems) if (gm.t <= 0) { const p = proj(gm.x, gm.y); if (p && p.z < 600) L.push({ p, k: 1, o: gm }); }
  for (const o of oils) { const p = proj(o.x, o.y); if (p && p.z < 500) L.push({ p, k: 2, o }); }
  for (const r of rockets) { const p = proj(r.x, r.y); if (p && p.z < 600) L.push({ p, k: 3, o: r }); }
  if (withKarts) for (const kt of karts) { const p = proj(kt.x, kt.y); if (p && p.z < 700) L.push({ p, k: 4, o: kt }); }
  L.sort((a, b) => b.p.z - a.p.z);
  for (const { p, k, o } of L) {
    if (k === 0) { const sc = p.s * o.bs, w = o.spr.width * sc, h = o.spr.height * sc; if (h >= 1 && p.sx + w / 2 > 0 && p.sx - w / 2 < SW) g.drawImage(o.spr, p.sx - w / 2, p.sy - h, w, h); }
    else if (k === 1) { const sc = p.s * 0.9, sp = GEM[Math.floor(time * 6) % 4], w = sp.width * sc, h = sp.height * sc; g.drawImage(sp, p.sx - w / 2, p.sy - h - (4 + Math.sin(time * 4) * 1.5) * p.s, w, h); }
    else if (k === 2) { const w = 13 * p.s, h = Math.max(1, w * CAM_H * p.s / FOC); g.fillStyle = '#1c1c24'; g.beginPath(); g.ellipse(p.sx, p.sy, w / 2, h / 2, 0, 0, TAU); g.fill(); g.fillStyle = '#4a4a66'; g.fillRect(p.sx - w * 0.15, p.sy - h * 0.2, Math.max(1, w * 0.18), 1); }
    else if (k === 3) { const sc = p.s * 0.9, w = ROCKET.width * sc, h = ROCKET.height * sc; g.drawImage(ROCKET, p.sx - w / 2, p.sy - h - 3 * p.s, w, h); }
    else drawKart(o, p);
  }
}
function drawKart(k, p) {
  const phi = Math.atan2(k.y - CY, k.x - CX);
  const yi = ((Math.round(angDiff(phi, k.a) / (TAU / 16)) % 16) + 16) % 16;
  const sp = SPR[k.di][yi], S = sp.width, sc = p.s * KS;
  const w = 15 * p.s, h = Math.max(1, w * CAM_H * p.s / FOC);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p.sx, p.sy, w / 2, h / 2, 0, 0, TAU); g.fill();
  const bob = k.spd > 20 && Math.floor(time * 18 + k.phase * 3) % 2 ? 1 : 0;
  g.drawImage(sp, Math.round(p.sx - S / 2 * sc), Math.round(p.sy - S * 0.66 * sc) - bob, Math.round(S * sc), Math.round(S * sc));
  if (k.boost > 0) for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#ffc145' : '#ff6b2a'; g.fillRect(Math.round(p.sx - 1 + (Math.random() - 0.5) * 4 * sc), Math.round(p.sy - 2 * sc + Math.random() * 3), 2, 2); }
  if (k.isP && k.drift) {
    const col = k.charge > 1.0 ? '#ff8a2a' : k.charge > 0.5 ? '#4ab8ff' : '#e8eef6';
    for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { g.fillStyle = col; g.fillRect(Math.round(p.sx + sd * 7 * sc + (Math.random() - 0.5) * 4), Math.round(p.sy - 1 - Math.random() * 3), 1 + (Math.random() < 0.4), 1); }
  }
  if (k.shield > 0 && (k.shield > 1.5 || Math.floor(time * 10) % 2)) { g.strokeStyle = '#9fe0ff'; g.lineWidth = 1; g.beginPath(); g.arc(p.sx, p.sy - 9 * sc, 11 * sc, 0, TAU); g.stroke(); }
}
function itemBox(x, y, it, spin) {
  g.fillStyle = '#10141c'; g.fillRect(x, y, 16, 14); g.fillStyle = '#ffd23f'; g.fillRect(x, y, 16, 1); g.fillRect(x, y + 13, 16, 1); g.fillRect(x, y, 1, 14); g.fillRect(x + 15, y, 1, 14);
  const ic = spin ? ICON[ITEMS[Math.floor(time * 14) % 4]] : it ? ICON[it] : null;
  if (ic) g.drawImage(ic, x + 3, y + 2);
}
function hud() {
  const pl = places(), pos = pl.indexOf(player) + 1;
  pt('GIRO ' + Math.max(1, Math.min(LAPS, player.lap)) + '/' + LAPS, 3, 3, 1, '#ffffff');
  pt(fmtT(raceT), 3, 10, 1, '#c9d3e6');
  itemBox(SW / 2 - 8, 2, player.item, player.roul > 0);
  const pc = ['#ffd23f', '#e6e9f2', '#e8a060', '#c9cede'][pos - 1];
  pt(String(pos), SW - 10, 3, 3, pc, 'right'); pt('°', SW - 8, 2, 2, pc, 'left');
  // minimappa
  const m = TR.mini, mx = 3, my = SH - 38;
  g.fillStyle = 'rgba(10,12,18,.35)'; g.fillRect(mx - 1, my - 1, 37, 37);
  g.fillStyle = '#e8eef6';
  for (let j = 0; j < TR.n; j += 2) { const p = TR.c[j]; g.fillRect(mx + Math.round((p[0] - m.x0) * m.s), my + Math.round((p[1] - m.y0) * m.s), 1, 1); }
  for (const k of karts) { if (k.isP && Math.floor(time * 6) % 2) continue; g.fillStyle = k.d.kart; g.fillRect(mx + Math.round((k.x - m.x0) * m.s) - 1, my + Math.round((k.y - m.y0) * m.s) - 1, 3, 3); }
  if (state === 'count') { const c = Math.ceil(count); if (c >= 1 && c <= 3) pt(String(c), SW / 2, 44, 5, '#ffd23f', 'center'); }
  if (msg) pt(msg.t, SW / 2, 46, tw(msg.t, 3) < SW - 6 ? 3 : 2, msg.c, 'center');
  if (wrongT > 1 && Math.floor(time * 4) % 2) pt('CONTROMANO!', SW / 2, 70, 2, '#ff6b5e', 'center');
}
function panel(y, h) { g.fillStyle = 'rgba(10,12,20,.86)'; g.fillRect(8, y, SW - 16, h); g.fillStyle = '#ffd23f'; g.fillRect(8, y, SW - 16, 1); g.fillRect(8, y + h - 1, SW - 16, 1); }
function bar(x, y, v) { g.fillStyle = '#2a3040'; g.fillRect(x, y, 30, 3); g.fillStyle = '#4ade80'; g.fillRect(x, y, Math.round(30 * v), 3); }
function drawMenus() {
  if (state === 'title') {
    renderWorld(false);
    pt('PIXEL', SW / 2, 14, 4, '#ffd23f', 'center', '#7a2a10');
    pt('KART', SW / 2, 38, 4, '#ff6b2a', 'center', '#5a1a08');
    if (Math.floor(time * 2.5) % 2 === 0) pt('A: GIOCA', SW / 2, 104, 2, '#ffffff', 'center');
    pt('A GAS  B OGGETTO  GIU FRENA', SW / 2, 126, 1, '#e6ecf6', 'center');
    pt('STERZA A LUNGO PER DERAPARE', SW / 2, 134, 1, '#b8c4d8', 'center');
    return;
  }
  if (state === 'driver') {
    renderWorld(false);
    panel(8, 128);
    pt('SCEGLI IL PILOTA', SW / 2, 14, 1, '#ffd23f', 'center');
    for (let i = 0; i < 4; i++) {
      const x = 14 + i * 34 + 2, on = i === sel;
      if (on) { g.fillStyle = '#26384d'; g.fillRect(x - 3, 24, 34, 50); g.fillStyle = Math.floor(time * 3) % 2 ? '#ffd23f' : '#ffe680'; g.fillRect(x - 3, 24, 34, 1); g.fillRect(x - 3, 73, 34, 1); }
      const yi = on ? Math.floor(time * 6) % 16 : 8, sp = SPR[i][yi];
      g.drawImage(sp, x - 1, 28, 30, 30);
      pt(DRV[i].name, x + 14, 64, 1, on ? '#ffffff' : '#8a96aa', 'center', null);
    }
    const d = DRV[sel];
    pt(d.name, SW / 2, 82, 2, '#ffffff', 'center');
    pt('VELOCITA', 30, 98, 1, '#a9b6cc'); bar(92, 99, (d.top - 140) / 20);
    pt('SCATTO', 30, 106, 1, '#a9b6cc'); bar(92, 107, (d.acc - 110) / 70);
    pt('CURVE', 30, 114, 1, '#a9b6cc'); bar(92, 115, (d.turn - 2) / 0.75);
    pt('< >  SCEGLI    A: OK', SW / 2, 126, 1, '#6f7c94', 'center', null);
    return;
  }
  if (state === 'track') {
    renderWorld(false);
    panel(8, 128);
    pt('SCEGLI LA PISTA', SW / 2, 14, 1, '#ffd23f', 'center');
    const T = TRACKS[tIdx];
    pt('< ' + T.name + ' >', SW / 2, 24, 2, '#ffffff', 'center');
    // disegno della pista
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of T.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const s = 52 / Math.max(x1 - x0, y1 - y0), ox = SW / 2 - (x1 - x0) * s / 2, oy = 40;
    if (TR && TR.i === tIdx) {
      g.fillStyle = T.road;
      for (let j = 0; j < TR.n; j++) { const p = TR.c[j]; g.fillRect(Math.round(ox + (p[0] - x0) * s) - 1, Math.round(oy + (p[1] - y0) * s) - 1, 3, 3); }
      g.fillStyle = '#ffffff'; const p0 = TR.c[0]; g.fillRect(Math.round(ox + (p0[0] - x0) * s) - 1, Math.round(oy + (p0[1] - y0) * s) - 2, 3, 5);
    }
    pt('DIFFICOLTA', SW / 2, 100, 1, '#a9b6cc', 'center', null);
    pt(DIFF[diff].name, SW / 2, 107, 1, '#ffffff', 'center');
    for (let i = 0; i < 3; i++) { g.fillStyle = i <= diff ? '#4ade80' : '#2a3040'; g.fillRect(SW / 2 + 22 + i * 4, 108, 3, 3); }
    const b = best[tIdx + '-' + diff];
    pt('RECORD ' + (b ? fmtT(b) : '--'), SW / 2, 116, 1, '#ffd23f', 'center', null);
    pt('SU/GIU DIFFICOLTA  A: VIA', SW / 2, 126, 1, '#6f7c94', 'center', null);
    return;
  }
}
function render() {
  g.imageSmoothingEnabled = false;
  if (state === 'title' || state === 'driver' || state === 'track') { ensureSprites(); if (!TR || TR.i !== tIdx) buildTrack(tIdx); return drawMenus(); }
  renderWorld(true);
  hud();
  if (paused) { panel(44, 48); pt('PAUSA', SW / 2, 52, 3, '#ffd23f', 'center'); pt('START: RIPRENDI', SW / 2, 72, 1, '#ffffff', 'center'); pt('B: ESCI DALLA GARA', SW / 2, 81, 1, '#ffffff', 'center'); }
  if (state === 'results') {
    panel(18, 108);
    pt('ARRIVO', SW / 2, 24, 2, '#ffd23f', 'center');
    finishOrder.forEach((k, i) => {
      const y = 42 + i * 14, col = k.isP ? '#ffd23f' : '#e6e9f2';
      if (k.isP) { g.fillStyle = '#26384d'; g.fillRect(12, y - 3, SW - 24, 12); }
      pt((i + 1) + '°', 16, y, 1, col); g.drawImage(SPR[k.di][8], 26, y - 9, 18, 18);
      pt(k.d.name, 46, y, 1, col); pt(fmtT(k.ftime), SW - 16, y, 1, col, 'right');
    });
    const pos = finishOrder.indexOf(player) + 1;
    pt(pos === 1 ? 'HAI VINTO!' : pos <= 3 ? 'SUL PODIO!' : 'RITENTA!', SW / 2, 100, 1, pos === 1 ? '#4ade80' : '#ffffff', 'center');
    if (Math.floor(time * 2.5) % 2 === 0) pt('A: PISTA DOPO   B: MENU', SW / 2, 112, 1, '#ffffff', 'center');
  }
}

// ---------- suono del motore ----------
let eng = null;
function engine() {
  const want = (state === 'count' || state === 'race' || state === 'end') && !paused && aok();
  if (want && !eng && actx) {
    const o = actx.createOscillator(), f = actx.createBiquadFilter(), gn = actx.createGain();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 600; gn.gain.value = 0;
    o.connect(f); f.connect(gn); gn.connect(master); o.start(); eng = { o, gn };
  }
  if (!eng) return;
  const t = actx.currentTime;
  eng.gn.gain.setTargetAtTime(want ? 0.03 : 0, t, 0.06);
  eng.o.frequency.setTargetAtTime(48 + Math.abs(player ? player.spd : 0) * 0.7 + (player && player.boost > 0 ? 30 : 0), t, 0.05);
  if (!want && state !== 'race' && state !== 'count' && state !== 'end') { const e = eng; eng = null; setTimeout(() => { try { e.o.stop(); } catch (err) {} }, 300); }
}

const MICON = ['cccccccccccccccc', 'cccccccccccccccc', 'cccwwccccccccccc', 'cccccccccccwwccc', 'gggggggggggggggg', 'ggggggrrrrgggggg', 'gggggrrrrrrggggg', 'ggggrrrhhrrrgggg',
  'gggrrrrhhrrrrggg', 'ggrrrbbbbbbrrrgg', 'grrkkbbbbbbkkrrg', 'grrkkbbbbbbkkrrg', 'rrrkkrrrrrrkkrrr', 'rrrrrrrrrrrrrrrr', 'rwwrrrwwrrrwwrrr', 'rrrrrrrrrrrrrrrr'];
if (window.__PK_DEBUG) window.__pk = { get state() { return state; }, get karts() { return karts; }, get player() { return player; }, get TR() { return TR; }, set: o => { if ('t' in o) tIdx = o.t; if ('d' in o) sel = o.d; if ('f' in o) diff = o.f; }, newRace, step, places, buildTrack, TRACKS };
let ox = 0, oy = 0;
return {
  id: 'kart', name: 'PIXEL KART', desc: 'CORSE SUI KART',
  aspect: SW / SH,
  keys: [['D', 'sterza'], ['A', 'gas'], ['B', 'oggetto'], ['START', 'pausa']],
  icon(c, x, y, s) { drawIcon(c, MICON, { c: '#7ec8f0', w: '#ffffff', g: '#58b048', r: '#8a8a92', h: '#f08a2c', b: '#e0562b', k: '#22242a' }, x, y, s, '#7ec8f0'); },
  enter() { if (state === 'race' || state === 'count' || state === 'end') paused = true; else if (state === 'results') state = 'track'; },
  leave() { paused = state === 'race' || state === 'count' || state === 'end'; engine(); saveSel(); },
  hidden() { if (state === 'race' || state === 'count' || state === 'end') paused = true; },
  update(dt) { step(dt); engine(); },
  draw(c, w, h) {
    render();
    let k = Math.min(w / SW, h / SH);
    const ki = Math.floor(k); if (ki >= 2 && ki / k > 0.8) k = ki;
    const dw = Math.round(SW * k), dh = Math.round(SH * k);
    ox = Math.round((w - dw) / 2); oy = Math.round((h - dh) / 2);
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0d12'; c.fillRect(0, 0, w, h);
    c.imageSmoothingEnabled = false; c.drawImage(scr, ox, oy, dw, dh);
  },
  button(name, down) {
    if (!down) return;
    const ok = name === 'a' || name === 'start';
    if (state === 'title') { if (ok) { state = 'driver'; ensureSprites(); tone(1046, 0.06, 'square', 0.035); } return; }
    if (state === 'driver') {
      if (name === 'left') { sel = (sel + 3) % 4; tone(1318, 0.03); }
      else if (name === 'right') { sel = (sel + 1) % 4; tone(1318, 0.03); }
      else if (ok) { state = 'track'; tone(1046, 0.06, 'square', 0.035); }
      else if (name === 'b') state = 'title';
      return;
    }
    if (state === 'track') {
      if (name === 'left') { tIdx = (tIdx + 3) % 4; buildTrack(tIdx); demo.j = 0; tone(1318, 0.03); }
      else if (name === 'right') { tIdx = (tIdx + 1) % 4; buildTrack(tIdx); demo.j = 0; tone(1318, 0.03); }
      else if (name === 'up') { diff = Math.min(2, diff + 1); tone(1568, 0.03); }
      else if (name === 'down') { diff = Math.max(0, diff - 1); tone(1175, 0.03); }
      else if (ok) { saveSel(); newRace(); }
      else if (name === 'b') state = 'driver';
      return;
    }
    if (state === 'results') {
      if (ok) { tIdx = (tIdx + 1) % 4; saveSel(); newRace(); }
      else if (name === 'b') { state = 'track'; buildTrack(tIdx); }
      return;
    }
    if (paused) {
      if (name === 'start' || name === 'a') paused = false;
      else if (name === 'b') { paused = false; state = 'track'; buildTrack(tIdx); }
      return;
    }
    if (name === 'start') { paused = true; return; }
    if (name === 'b' && state === 'race') useItem(player);
  }
};
})());
