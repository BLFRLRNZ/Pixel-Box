// ===================== PIXEL SAGA · grafica a pixel =====================
// Carattere 5x7, personaggi come modellini a scatole visti da 8 lati, alberi e oggetti disegnati pixel per pixel.
(() => {
const TAU = Math.PI * 2;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
function shade(h, f) {
  const c = hex(h).map(v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const mixc = (a, b, t) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
// niente bordi sfumati e un contorno scuro di un pixel: si legge bene anche in mezzo all'erba
function finish(c, outline = true, oc = '#16121c') {
  const w = c.width, h = c.height, x = c.getContext('2d'), d = x.getImageData(0, 0, w, h), a = d.data;
  for (let i = 3; i < a.length; i += 4) a[i] = a[i] < 110 ? 0 : 255;
  if (outline) {
    const o = hex(oc), m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = a[i * 4 + 3] ? 1 : 0;
    for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
      const i = y * w + X; if (m[i]) continue;
      if ((X > 0 && m[i - 1]) || (X < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) { a[i * 4] = o[0]; a[i * 4 + 1] = o[1]; a[i * 4 + 2] = o[2]; a[i * 4 + 3] = 255; }
    }
  }
  x.putImageData(d, 0, 0); return c;
}
function pix(rows, pal) {
  const c = mk(rows[0].length, rows.length), x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (pal[r[i]]) { x.fillStyle = pal[r[i]]; x.fillRect(i, j, 1, 1); } });
  return c;
}

// ---------- carattere 5x7 a larghezza variabile ----------
const FSRC = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.', E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#', I: '###|.#.|.#.|.#.|.#.|.#.|###',
  J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....', Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '####.|....#|....#|.###.|....#|....#|####.', 4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...', 8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  ' ': '...|...|...|...|...|...|...', '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', ':': '.|.|#|.|.|#|.', ';': '..|..|.#|..|..|.#|#.',
  '!': '#|#|#|#|#|.|#', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', "'": '#|#|.|.|.|.|.', '"': '#.#|#.#|...|...|...|...|...',
  '-': '...|...|...|###|...|...|...', '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '/': '....#|...#.|...#.|..#..|.#...|.#...|#....',
  '(': '..#|.#.|#..|#..|#..|.#.|..#', ')': '#..|.#.|..#|..#|..#|.#.|#..', '=': '....|....|####|....|####|....|....',
  '<': '...#|..#.|.#..|#...|.#..|..#.|...#', '>': '#...|.#..|..#.|...#|..#.|.#..|#...', '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....',
  '%': '##..#|##.#.|...#.|..#..|.#...|.#.##|#..##', '#': '.#.#.|#####|.#.#.|.#.#.|.#.#.|#####|.#.#.',
  'À': '.#...|..#..|.###.|#...#|#####|#...#|#...#', 'È': '.#...|..#..|#####|#....|####.|#....|#####', 'É': '...#.|..#..|#####|#....|####.|#....|#####',
  'Ì': '#..|.#.|###|.#.|.#.|.#.|###', 'Ò': '.#...|..#..|.###.|#...#|#...#|#...#|.###.', 'Ù': '.#...|..#..|#...#|#...#|#...#|#...#|.###.',
  '↑': '..#..|.###.|#.#.#|..#..|..#..|..#..|..#..', '↓': '..#..|..#..|..#..|..#..|#.#.#|.###.|..#..',
  '←': '.......|..#....|.#.....|#######|.#.....|..#....|.......', '→': '.......|....#..|.....#.|#######|.....#.|....#..|.......',
  '♥': '.....|##.##|#####|#####|.###.|..#..|.....',
};
const GL = {}; for (const k in FSRC) { const rows = FSRC[k].split('|'); GL[k] = { w: rows[0].length, rows }; }
const sheets = {};
function sheet(col) {
  if (sheets[col]) return sheets[col];
  const keys = Object.keys(GL), pos = {}; let x = 0;
  for (const k of keys) { pos[k] = x; x += GL[k].w + 1; }
  const c = mk(x, 7), g = c.getContext('2d'); g.fillStyle = col;
  for (const k of keys) GL[k].rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.fillRect(pos[k] + i, j, 1, 1); });
  return sheets[col] = { c, pos };
}
const up = s => String(s).toUpperCase();
function textW(s, k = 1) { s = up(s); let w = 0; for (const ch of s) w += ((GL[ch] || GL['?']).w + 1) * k; return Math.max(0, w - k); }
function text(g, s, x, y, col = '#ffffff', sh = '#0b0a12', k = 1, align = 'left') {
  s = up(s); x = Math.round(align === 'center' ? x - textW(s, k) / 2 : align === 'right' ? x - textW(s, k) : x); y = Math.round(y);
  const pass = (c, dx, dy) => { const S = sheet(c); let cx = x; for (const ch of s) { const G = GL[ch] || GL['?'], p = S.pos[GL[ch] ? ch : '?']; g.drawImage(S.c, p, 0, G.w, 7, cx + dx, y + dy, G.w * k, 7 * k); cx += (G.w + 1) * k; } };
  if (sh) { pass(sh, k, 0); pass(sh, 0, k); pass(sh, k, k); }
  pass(col, 0, 0);
}
function wrap(s, maxW) {
  const out = []; for (const para of up(s).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (textW(t) > maxW && line) { out.push(line); line = w; } else line = t; }
    out.push(line);
  }
  return out;
}

// ---------- modellini a scatole e sfere visti da un lato (X avanti, Y sinistra, Z su) ----------
function figure(parts, yaw, W, H, o = {}) {
  const pitch = o.pitch !== undefined ? o.pitch : 0.34, sc = o.sc || 1, base = o.base !== undefined ? o.base : H - 3;
  const c = mk(W, H), x = c.getContext('2d');
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const proj = (X, Y, Z) => { X *= sc; Y *= sc; Z *= sc; const xr = X * cy - Y * sy, yr = X * sy + Y * cy; return [W / 2 - yr, base - (Z * cp + xr * sp), xr * cp - Z * sp]; };
  const L = [-0.55, 0.45, 0.7], items = [];
  const rotv = (v, R, withPiv) => {
    let [X, Y, Z] = v;
    for (const r of R) {
      const ax = r[0], ca = Math.cos(r[1]), sa = Math.sin(r[1]);
      if (withPiv) { X -= r[2]; Y -= r[3]; Z -= r[4]; }
      if (ax === 'y') { const nx = X * ca - Z * sa, nz = X * sa + Z * ca; X = nx; Z = nz; }
      else if (ax === 'x') { const ny = Y * ca - Z * sa, nz = Y * sa + Z * ca; Y = ny; Z = nz; }
      else { const nx = X * ca - Y * sa, ny = X * sa + Y * ca; X = nx; Y = ny; }
      if (withPiv) { X += r[2]; Y += r[3]; Z += r[4]; }
    }
    return [X, Y, Z];
  };
  const FACES = [[[4, 5, 6, 7], [0, 0, 1]], [[3, 2, 1, 0], [0, 0, -1]], [[0, 1, 5, 4], [0, -1, 0]], [[2, 3, 7, 6], [0, 1, 0]], [[1, 2, 6, 5], [1, 0, 0]], [[3, 0, 4, 7], [-1, 0, 0]]];
  for (const p of parts) {
    const R = p.rot;
    if (p.t === 'b') {
      const [x0, x1, y0, y1, z0, z1] = p.b;
      const cs = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(v => proj(...(R ? rotv(v, R, true) : v)));
      for (const [ix, n0] of FACES) {
        const n = R ? rotv(n0, R, false) : n0, nx = n[0] * cy - n[1] * sy, ny = n[0] * sy + n[1] * cy, nz = n[2];
        if (-nx * cp + nz * sp <= 0.02) continue;
        const col = shade(p.c, (0.6 + 0.5 * Math.max(0, nx * L[0] + ny * L[1] + nz * L[2])) * (p.k || 1));
        items.push({ d: (cs[ix[0]][2] + cs[ix[1]][2] + cs[ix[2]][2] + cs[ix[3]][2]) / 4 - (p.z || 0), f: () => { x.fillStyle = col; x.beginPath(); x.moveTo(cs[ix[0]][0], cs[ix[0]][1]); for (let k = 1; k < 4; k++) x.lineTo(cs[ix[k]][0], cs[ix[k]][1]); x.closePath(); x.fill(); } });
      }
    } else {
      const v = R ? rotv(p.o, R, true) : p.o, [px, py, d] = proj(v[0], v[1], v[2]), r = p.r * sc, rz = (p.rz || p.r) * sc;
      items.push({ d: d - (p.z || 0), f: () => {
        x.fillStyle = p.c; x.beginPath(); x.ellipse(px, py, Math.max(0.6, r), Math.max(0.6, rz * cp + r * Math.abs(sp) * 0.35), 0, 0, TAU); x.fill();
        if (r > 1.6 && !p.flat) { x.fillStyle = shade(p.c, 1.28); x.beginPath(); x.ellipse(px - r * 0.3, py - rz * 0.38, r * 0.42, rz * 0.36, 0, 0, TAU); x.fill(); }
      } });
    }
  }
  items.sort((a, b) => b.d - a.d).forEach(it => it.f());
  return finish(c, o.outline !== false);
}

// ---------- persone ----------
const EYE = '#1a1420';
function weapon(B, w, rot) {
  const y0 = -6.05, y1 = -4.55;
  if (!w) return;
  if (w.kind === 'axe') { B([-0.5, 0.5, y0 + 0.2, y1 - 0.2, -4, 11], '#7a5230', rot); B([0.4, 4.8, y0 - 0.1, y1 + 0.1, -4, 1.4], w.col, rot, 1.1); B([-2.2, -0.4, y0, y1, -3.2, 0.4], w.col, rot); return; }
  if (w.kind === 'spear') { B([-0.45, 0.45, y0 + 0.2, y1 - 0.2, -8, 17], '#7a5a3a', rot); B([-0.9, 0.9, y0, y1, 17, 21], '#c8d0dc', rot, 1.15); return; }
  if (w.kind === 'club') { B([-0.6, 0.6, y0 + 0.1, y1 - 0.1, 2, 11], '#6a4424', rot); B([-1.4, 1.4, y0 - 0.3, y1 + 0.3, -2, 3], '#7a5230', rot); return; }
  B([-0.5, 0.5, y0 + 0.2, y1 - 0.2, 9, 11.2], '#5a3a20', rot);
  B([-1.9, 1.9, y0, y1, 8.2, 9.1], w.guard || '#c8a040', rot);
  B([-0.7, 0.7, y0 + 0.15, y1 - 0.15, -3.8 - (w.len || 0), 8.2], w.col, rot, 1.12);
  if (w.glow) B([-0.25, 0.25, y0 + 0.1, y1 - 0.1, -3.2 - (w.len || 0), 7.6], w.glow, rot, 1.3);
}
function human(o, pose = {}) {
  const P = [], L = pose.leg || 0, AL = pose.armL !== undefined ? pose.armL : -L * 0.85, AR = pose.armR !== undefined ? pose.armR : L * 0.85 + 0.25;
  const B = (b, c, rot, k) => P.push({ t: 'b', b, c, rot, k }), O = (p, r, c, rot, rz, flat) => P.push({ t: 'o', o: p, r, c, rot, rz, flat });
  const hip = 9.5, sh = 18.6, bob = pose.bob || 0, wide = o.wide || 0;
  for (const s of [1, -1]) {
    const rot = [['y', s > 0 ? L : -L, 0, s * 1.8, hip]];
    B([-1.5, 1.5, s > 0 ? 0.3 : -3.3, s > 0 ? 3.3 : -0.3, 2.6, hip + 0.6], o.pants, rot);
    B([-1.8, 2.2, s > 0 ? 0.2 : -3.4, s > 0 ? 3.4 : -0.2, 0, 2.8], o.boots, rot);
  }
  if (o.robe) B([-2.9, 2.9, -4.4, 4.4, 2.5, hip + 1], o.robe);
  B([-2.3 - wide, 2.3 + wide, -4 - wide, 4 + wide, hip - 0.4, sh + 0.6], o.shirt);
  if (o.plate) B([2.25 + wide, 2.6 + wide, -3.2, 3.2, hip + 2, sh - 0.5], o.plate, null, 1.1);
  if (o.belt) B([-2.45 - wide, 2.45 + wide, -4.1 - wide, 4.1 + wide, hip + 0.6, hip + 1.8], o.belt);
  if (o.apron) B([2.3, 2.7, -3.1, 3.1, 4.5, sh - 1.5], o.apron);
  if (o.cape) B([-3.4 - wide, -2.4 - wide, -3.9, 3.9, 6, sh + 0.2], o.cape, [['y', -0.16 - (pose.cape || 0), -2.4, 0, sh]]);
  if (o.pack) B([-4.6, -2.3, -2.8, 2.8, hip + 1, sh - 0.4], o.pack);
  for (const s of [1, -1]) {
    const rot = [['y', s > 0 ? AL : AR, 0, s * 5.3, sh]], y0 = s > 0 ? 4 + wide : -6.6 - wide, y1 = s > 0 ? 6.6 + wide : -4 - wide;
    B([-1.3, 1.3, y0, y1, 11, sh + 0.7], o.sleeve || o.shirt, rot);
    if (o.pauldron) B([-1.9, 1.9, y0 - 0.4, y1 + 0.4, sh - 1.4, sh + 1.5], o.pauldron, rot, 1.08);
    B([-1.2, 1.2, y0 + 0.1, y1 - 0.1, 9.4, 11.2], o.hand || o.skin, rot);
    if (s < 0) weapon(B, o.weapon, rot);
    if (s < 0 && o.staff) { B([0.8, 1.9, -6, -4.6, -1.5, 25], o.staff, rot); if (o.orb) O([1.35, -5.3, 26.2], 1.6, o.orb, rot); }
    if (s > 0 && o.shield) { B([-2.7, 2.7, 6.7, 7.7, 10.4, 17.6], o.shield, rot); if (o.emblem) B([-1, 1, 7.7, 8, 12.5, 15.5], o.emblem, rot, 1.2); }
  }
  const hz = sh + 0.6 + bob, hs = o.head || 3.6;
  B([-hs, hs, -hs, hs, hz, hz + hs * 2], o.skin);
  if (o.skull) { B([hs - 0.05, hs + 0.15, 0.6, 2.4, hz + 2.6, hz + 4.8], EYE); B([hs - 0.05, hs + 0.15, -2.4, -0.6, hz + 2.6, hz + 4.8], EYE); B([hs - 0.05, hs + 0.15, -1.6, 1.6, hz + 0.6, hz + 1.4], EYE); }
  else { B([hs - 0.05, hs + 0.15, 0.8, 2.1, hz + 2.6, hz + 4.3], o.eyes || EYE); B([hs - 0.05, hs + 0.15, -2.1, -0.8, hz + 2.6, hz + 4.3], o.eyes || EYE); }
  if (o.beard) B([hs - 0.4, hs + 0.5, -2.8, 2.8, hz - 0.6, hz + 2.4], o.beard);
  const hc = o.hair, top = hz + hs * 2;
  if (o.hairStyle === 'short' || o.hairStyle === 'bun' || o.hairStyle === 'tails' || o.hairStyle === 'long') {
    B([-hs - 0.3, hs - 1.1, -hs - 0.3, hs + 0.3, top - 2, top + 0.8], hc);
    B([-hs - 0.3, -hs + 0.9, -hs - 0.3, hs + 0.3, o.hairStyle === 'long' ? hz - 3.5 : hz + 2, top + 0.8], hc);
    if (o.hairStyle === 'bun') O([-2.4, 0, top + 1.6], 2.2, hc);
    if (o.hairStyle === 'tails') { O([-1.2, hs + 1.4, hz + 4], 1.7, hc); O([-1.2, -hs - 1.4, hz + 4], 1.7, hc); }
  }
  if (o.hood) { B([-hs - 0.5, hs - 0.6, -hs - 0.5, hs + 0.5, hz + 3.6, top + 1.2], o.hood); B([-hs - 0.5, -hs + 1, -hs - 0.5, hs + 0.5, hz - 1.5, top + 1.2], o.hood); }
  if (o.helm) {
    const m = o.helm;
    B([-hs - 0.35, hs + 0.35, -hs - 0.35, hs + 0.35, hz + 4.2, top + 1], m.c, null, 1.05);
    B([-hs - 0.35, -hs + 1.2, -hs - 0.35, hs + 0.35, hz + 1, top + 1], m.c);
    if (m.nose) B([hs + 0.2, hs + 0.7, -0.5, 0.5, hz + 2.2, hz + 5], m.c);
    if (m.wings) for (const s of [1, -1]) B([-1.4, 1.2, s > 0 ? hs + 0.3 : -hs - 1.1, s > 0 ? hs + 1.1 : -hs - 0.3, hz + 4.5, top + 3.5], m.wings, [['y', -0.5, 0, 0, top]]);
    if (m.spike) B([-0.5, 0.5, -0.5, 0.5, top + 1, top + 3.4], m.c);
    if (m.plume) O([-1.5, 0, top + 2.6], 1.9, m.plume);
    if (m.crown) { for (const [px, py] of [[2.6, 0], [0, 2.6], [0, -2.6], [-2.6, 0]]) B([px - 0.6, px + 0.6, py - 0.6, py + 0.6, top + 1, top + 3], m.c, null, 1.15); O([hs + 0.3, 0, top - 0.4], 0.9, m.gem || '#e8304a', null, null, true); }
  }
  if (o.hat) { B([-hs - 2, hs + 2, -hs - 2, hs + 2, top - 0.6, top + 0.2], o.hat); B([-hs + 0.3, hs - 0.3, -hs + 0.3, hs - 0.3, top + 0.2, top + 3.4], o.hat, null, 0.9); }
  if (o.ears) for (const s of [1, -1]) B([-1, 1, s > 0 ? hs : -hs - 3, s > 0 ? hs + 3 : -hs, hz + 3, hz + 5], o.skin, [['x', s * 0.5, 0, s * hs, hz + 4]]);
  if (o.horns) for (const s of [1, -1]) B([-0.6, 0.8, s * 2 - 0.6, s * 2 + 0.6, top, top + 3], o.horns, [['y', -0.35, 0, 0, top]]);
  if (o.antlers) for (const s of [1, -1]) { B([-0.5, 0.5, s * 2.2 - 0.4, s * 2.2 + 0.4, top, top + 5], o.antlers); B([-0.4, 0.4, s * 2.2 - 0.3 + s * 1.2, s * 2.2 + 0.3 + s * 1.2, top + 3, top + 7], o.antlers, [['x', s * 0.6, 0, s * 2.2, top + 3]]); B([0.2, 2.6, s * 2.2 - 0.3, s * 2.2 + 0.3, top + 4, top + 4.8], o.antlers); }
  return P;
}
// ---------- animali e mostri ----------
function beast(o, pose = {}) {
  const P = [], L = pose.leg || 0, s = o.s || 1, B = (b, c, rot, k) => P.push({ t: 'b', b: b.map(v => v * s), c, rot: rot && rot.map(r => [r[0], r[1], r[2] * s, r[3] * s, r[4] * s]), k });
  B([-6, 6, -2.6, 2.6, 5, 10.5], o.c);
  B([-5, 5, -2.2, 2.2, 4.6, 5.4], o.c2);
  const lunge = pose.lunge || 0;
  B([5.5 + lunge, 10.5 + lunge, -2.6, 2.6, 8, 13], o.c);
  B([10.4 + lunge, 13.6 + lunge, -1.3, 1.3, 8.2, 10.6], o.c2);
  B([13.5 + lunge, 14.1 + lunge, -0.6, 0.6, 9.6, 10.6], EYE);
  for (const t of [1, -1]) { B([6.4 + lunge, 8.2 + lunge, t > 0 ? 0.9 : -2.5, t > 0 ? 2.5 : -0.9, 13, 15.8], o.c); B([10.45 + lunge, 10.65 + lunge, t > 0 ? 0.7 : -1.8, t > 0 ? 1.8 : -0.7, 10.8, 12], o.eye || '#ffd23f'); }
  B([-10.5, -6, -0.9, 0.9, 8.6, 10.2], o.c, [['y', (o.tailUp || 0.5) + (pose.tail || 0), -6, 0, 9.5]]);
  for (const [fx, fy, a] of [[4, 1.6, L], [4, -1.6, -L], [-4, 1.6, -L], [-4, -1.6, L]]) B([fx - 1.1, fx + 1.1, fy - 1, fy + 1, 0, 5.6], o.leg || o.c, [['y', a, fx, fy, 5.6]]);
  return P;
}
function slime(o, f) {
  const q = f ? 1.22 : 1, P = [];
  P.push({ t: 'o', o: [0, 0, 5.4 / q], r: 7.2 * q, rz: 5.8 / q, c: o.c });
  P.push({ t: 'o', o: [5.6 * q, 2.3, 6.2 / q], r: 1.15, c: EYE, flat: true, z: 2 });
  P.push({ t: 'o', o: [5.6 * q, -2.3, 6.2 / q], r: 1.15, c: EYE, flat: true, z: 2 });
  if (o.crown) P.push({ t: 'b', b: [-2.5, 2.5, -2.5, 2.5, 11 / q, 13.5 / q], c: '#ffc83a' });
  return P;
}
function bat(f) {
  const P = [], a = f ? 0.7 : -0.5, c = '#4a3a6a';
  P.push({ t: 'o', o: [0, 0, 14], r: 3.2, c });
  for (const s of [1, -1]) P.push({ t: 'b', b: [-2.5, 2.5, s > 0 ? 2.5 : -11, s > 0 ? 11 : -2.5, 13.6, 14.2], c: '#3a2a54', rot: [['x', s * a, 0, s * 2.5, 14]] });
  P.push({ t: 'b', b: [2.8, 3.1, 0.6, 1.6, 14.4, 15.4], c: '#ff4a4a' }, { t: 'b', b: [2.8, 3.1, -1.6, -0.6, 14.4, 15.4], c: '#ff4a4a' });
  return P;
}
function dragon(f) {
  const P = [], c = '#c8342c', c2 = '#f0b040', d = '#7a1a18', wa = f ? 0.65 : -0.4, B = (b, col, rot, k) => P.push({ t: 'b', b, c: col, rot, k });
  B([-12, 12, -6, 6, -4, 6], c); B([-10, 10, -5, 5, -4.8, -3.8], c2);
  B([10, 19, -2.6, 2.6, -1, 5], c, [['y', -0.55, 10, 0, 2]]);
  B([17, 26, -3.4, 3.4, 5, 11], c); B([18, 27.5, -2.6, 2.6, 3.2, 5.3], d);
  for (const s of [1, -1]) { B([15.5, 18, s * 1.6 - 0.6, s * 1.6 + 0.6, 10, 15], '#f4e8c8', [['y', -0.7, 17, 0, 11]]); B([25.9, 26.2, s > 0 ? 1.1 : -2.4, s > 0 ? 2.4 : -1.1, 8.2, 9.6], '#ffe14a'); }
  B([-26, -12, -2.1, 2.1, -1, 3.2], c, [['y', 0.18, -12, 0, 1]]); B([-33, -25.5, -1.3, 1.3, -2, 1.6], d, [['y', 0.35, -12, 0, 1]]);
  for (const s of [1, -1]) {
    const rot = [['x', s * wa, 0, s * 6, 4]];
    B([-9, 7, s > 0 ? 6 : -32, s > 0 ? 32 : -6, 3.2, 3.9], '#e0603a', rot);
    B([-1, 8.5, s > 0 ? 6 : -32, s > 0 ? 32 : -6, 3.9, 5.2], d, rot);
    for (const t of [-6, 1]) B([t - 0.4, t + 0.4, s > 0 ? 6 : -30, s > 0 ? 30 : -6, 3.9, 4.6], d, rot);
  }
  for (const s of [1, -1]) for (const fx of [6, -6]) B([fx - 1.5, fx + 1.5, s * 3.5 - 1.2, s * 3.5 + 1.2, -8.5, -3.5], d);
  return P;
}
function chest(r, open) {
  const wood = ['#8a5a30', '#3c6aa8', '#6a3a9a', '#b8862a'][r], band = ['#6a6a76', '#d0dcec', '#f0c860', '#fff4b0'][r], P = [];
  const B = (b, c, rot, k) => P.push({ t: 'b', b, c, rot, k });
  B([-5, 5, -3.6, 3.6, 0, 5.4], wood);
  for (const y of [-2.6, 1.8]) B([-5.15, 5.15, y, y + 0.8, -0.1, 5.5], band);
  const lid = open ? [['y', -1.9, -5, 0, 5.4]] : null;
  B([-5, 5, -3.6, 3.6, 5.4, 8.2], wood, lid, 1.1);
  for (const y of [-2.6, 1.8]) B([-5.15, 5.15, y, y + 0.8, 5.3, 8.35], band, lid);
  if (open) B([-4.6, 4.6, -3.2, 3.2, 4.9, 5.5], '#fff2a8', null, 1.3);
  else B([5, 5.7, -0.9, 0.9, 4.2, 6.6], band, null, 1.2);
  return P;
}

// ---------- alberi, rocce e piante disegnati pixel per pixel ----------
function canopy(g, blobs, pal, R, lx = -0.62, ly = -0.78) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [cx, cy, r] of blobs) { x0 = Math.min(x0, cx - r); y0 = Math.min(y0, cy - r); x1 = Math.max(x1, cx + r); y1 = Math.max(y1, cy + r); }
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
    let best = -1, bb = null;
    for (const b of blobs) { const d = Math.hypot(x + 0.5 - b[0], y + 0.5 - b[1]) / b[2]; if (d < 1 && 1 - d > best) { best = 1 - d; bb = b; } }
    if (!bb) continue;
    const nx = (x + 0.5 - bb[0]) / bb[2], ny = (y + 0.5 - bb[1]) / bb[2];
    let t = 0.5 - 0.6 * (nx * lx + ny * ly) + (best < 0.18 ? -0.18 : 0) + ((x + y) & 1 ? 0.06 : -0.06) + (R() - 0.5) * 0.16;
    g.fillStyle = pal[t > 0.95 ? 3 : t > 0.62 ? 2 : t > 0.3 ? 1 : 0]; g.fillRect(x, y, 1, 1);
  }
}
function trunk(g, cx, top, bot, w, pal, flare = 0.8) {
  for (let y = Math.floor(top); y < bot; y++) {
    const ww = w + (y > bot - 6 ? (y - (bot - 6)) * flare : 0), l = cx - ww / 2;
    for (let x = Math.floor(l); x < l + ww; x++) { const s = (x - l) / ww; g.fillStyle = s < 0.28 ? pal[2] : s > 0.68 ? pal[0] : pal[1]; g.fillRect(x, y, 1, 1); }
  }
}
const TRUNK = ['#4a2e1a', '#6a4424', '#8a5e34'], BIRCH = ['#8a8a88', '#e4e2da', '#ffffff'];
function oak(R, W, H, pal, tp = TRUNK, nb = 9) {
  const c = mk(W, H), g = c.getContext('2d');
  trunk(g, W / 2, H * 0.42, H - 1, Math.max(3, W * 0.13), tp);
  for (let k = 0; k < 2; k++) { const s = k ? 1 : -1; g.fillStyle = tp[1]; for (let i = 0; i < W * 0.18; i++) g.fillRect(Math.round(W / 2 + s * i), Math.round(H * 0.5 - i * 0.7), 2, 2); }
  const blobs = [];
  for (let i = 0; i < nb; i++) { const a = R() * TAU, d = R() * W * 0.2; blobs.push([W / 2 + Math.cos(a) * d * 1.25, H * 0.33 + Math.sin(a) * d * 0.75 - R() * H * 0.04, W * (0.17 + R() * 0.1)]); }
  canopy(g, blobs, pal, R);
  return finish(c);
}
function giantTree(R, W, H) {
  const c = mk(W, H), g = c.getContext('2d'), tp = ['#3a2414', '#5a3a1e', '#7a5430'];
  const tw = W * 0.2, top = H * 0.4;
  for (let y = Math.floor(top); y < H; y++) {
    const f = (y - top) / (H - top), ww = tw * (1 + Math.pow(f, 3) * 1.8), l = W / 2 - ww / 2;
    for (let x = Math.floor(l); x < l + ww; x++) { const s = (x - l) / ww, bark = ((x * 7 + (y >> 2) * 3) % 11 === 0) ? -1 : 0; g.fillStyle = tp[Math.max(0, (s < 0.25 ? 2 : s > 0.7 ? 0 : 1) + bark)]; g.fillRect(x, y, 1, 1); }
  }
  for (let k = 0; k < 6; k++) { const s = k < 3 ? -1 : 1, a = 0.25 + (k % 3) * 0.28; for (let i = 0; i < W * 0.3; i++) { const x = W / 2 + s * (tw * 0.35 + i), y = H - 2 - i * a * 0.5 + Math.sin(i * 0.3) * 1.5; g.fillStyle = tp[i % 7 ? 1 : 0]; g.fillRect(Math.round(x), Math.round(y), 3, 3); } }
  for (let k = 0; k < 4; k++) { const s = k % 2 ? 1 : -1; for (let i = 0; i < W * 0.24; i++) { g.fillStyle = tp[1]; g.fillRect(Math.round(W / 2 + s * i), Math.round(top + 6 - i * (0.6 + k * 0.15)), 4, 4); } }
  const blobs = [];
  for (let i = 0; i < 34; i++) { const a = R() * TAU, d = Math.sqrt(R()) * W * 0.36; blobs.push([W / 2 + Math.cos(a) * d * 1.15, H * 0.27 + Math.sin(a) * d * 0.5, W * (0.09 + R() * 0.07)]); }
  canopy(g, blobs, ['#1e4a24', '#2e7a30', '#4aa040', '#8ad860'], R);
  g.fillStyle = '#ffe9a0'; for (let i = 0; i < 40; i++) { const a = R() * TAU, d = Math.sqrt(R()) * W * 0.34; g.fillRect(Math.round(W / 2 + Math.cos(a) * d * 1.1), Math.round(H * 0.27 + Math.sin(a) * d * 0.45), 1, 1); }
  return finish(c);
}
function pine(R, W, H, pal, snow) {
  const c = mk(W, H), g = c.getContext('2d');
  trunk(g, W / 2, H * 0.7, H - 1, Math.max(2, W * 0.12), TRUNK, 0.3);
  const tiers = 4;
  for (let t = 0; t < tiers; t++) {
    const yt = H * (0.03 + t * 0.18), yb = H * (0.34 + t * 0.15), hw = W * (0.2 + t * 0.09);
    for (let y = Math.floor(yt); y < yb; y++) {
      const f = (y - yt) / (yb - yt), w = hw * f + 1;
      for (let x = Math.floor(W / 2 - w); x <= W / 2 + w; x++) {
        const s = (x - (W / 2 - w)) / (2 * w);
        let k = s < 0.35 ? 2 : s > 0.7 ? 0 : 1; if (y > yb - 2 && R() < 0.5) k = 0; if ((x + y) % 5 === 0 && k > 0) k--;
        g.fillStyle = snow && (f < 0.22 || (y < yb - 1 && R() < 0.12 && s < 0.6)) ? (s > 0.6 ? '#c8d6e8' : '#f4f8ff') : pal[k]; g.fillRect(x, y, 1, 1);
      }
    }
  }
  return finish(c);
}
function palm(R, W, H) {
  const c = mk(W, H), g = c.getContext('2d'), bend = (R() - 0.5) * W * 0.4;
  let px0 = W / 2 + bend, py0 = H * 0.2;
  for (let y = H - 1; y > H * 0.2; y--) { const f = (H - y) / (H * 0.8), x = W / 2 + bend * f * f; g.fillStyle = (y % 4 === 0) ? '#6a4a2a' : '#a8784a'; g.fillRect(Math.round(x - 1.5), y, 4, 1); g.fillStyle = '#7a5230'; g.fillRect(Math.round(x + 1.5), y, 1, 1); px0 = x; }
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.55 + (R() - 0.5) * 0.2, len = W * (0.32 + R() * 0.12);
    for (let i = 0; i < len; i++) { const t = i / len, x = px0 + Math.cos(a) * i, y = py0 + Math.sin(a) * i * 0.6 + t * t * len * 0.55; g.fillStyle = t < 0.5 ? '#3eae4a' : '#2a8a3a'; g.fillRect(Math.round(x), Math.round(y), 2, 2); if (i % 3 === 0) { g.fillStyle = '#1f6a2a'; g.fillRect(Math.round(x), Math.round(y + 2), 1, 2); } }
  }
  g.fillStyle = '#5a3a20'; g.fillRect(Math.round(px0 - 2), Math.round(py0 + 1), 3, 3);
  return finish(c);
}
function deadTree(R, W, H, col = '#4a3a34', col2 = '#6a5a50') {
  const c = mk(W, H), g = c.getContext('2d');
  const branch = (x, y, a, len, w, d) => {
    for (let i = 0; i < len; i++) { x += Math.cos(a); y += Math.sin(a); g.fillStyle = i % 4 ? col : col2; g.fillRect(Math.round(x - w / 2), Math.round(y), Math.max(1, Math.round(w)), 2); a += (R() - 0.5) * 0.25; }
    if (d > 0) for (let k = 0; k < 2; k++) branch(x, y, a + (k ? 0.6 : -0.6) + (R() - 0.5) * 0.3, len * 0.62, Math.max(1, w * 0.6), d - 1);
  };
  branch(W / 2, H - 1, -Math.PI / 2, H * 0.42, Math.max(3, W * 0.12), 3);
  return finish(c);
}
function willow(R, W, H) {
  const c = mk(W, H), g = c.getContext('2d');
  trunk(g, W / 2, H * 0.4, H - 1, Math.max(3, W * 0.12), ['#3a2e24', '#54443a', '#6a5a4a']);
  const blobs = []; for (let i = 0; i < 7; i++) blobs.push([W / 2 + (R() - 0.5) * W * 0.5, H * 0.28 + (R() - 0.5) * H * 0.12, W * (0.18 + R() * 0.08)]);
  const pal = ['#2e4a2a', '#3e6234', '#5a7a44', '#7a9a5a'];
  canopy(g, blobs, pal, R);
  for (let i = 0; i < W * 0.8; i++) { const x = Math.round(W * 0.12 + R() * W * 0.76), y0 = Math.round(H * 0.3 + R() * H * 0.1), l = H * (0.18 + R() * 0.25); for (let y = y0; y < y0 + l; y++) { g.fillStyle = pal[(y + x) % 3]; g.fillRect(x, y, 1, 1); } }
  return finish(c);
}
function bush(R, W, H, pal, berries) {
  const c = mk(W, H), g = c.getContext('2d'), blobs = [];
  for (let i = 0; i < 5; i++) blobs.push([W / 2 + (R() - 0.5) * W * 0.5, H * 0.6 + (R() - 0.5) * H * 0.2, W * (0.22 + R() * 0.1)]);
  canopy(g, blobs, pal, R);
  if (berries) { g.fillStyle = berries; for (let i = 0; i < 6; i++) g.fillRect(Math.round(W * 0.2 + R() * W * 0.6), Math.round(H * 0.35 + R() * H * 0.45), 2, 2); }
  return finish(c);
}
function cactus(R, W, H) {
  const c = mk(W, H), g = c.getContext('2d'), col = ['#2a6a2a', '#3e8a3a', '#5aaa4a'];
  const bar = (x, y0, y1, w) => { for (let y = y0; y < y1; y++) for (let i = 0; i < w; i++) { const s = i / w; g.fillStyle = s < 0.3 ? col[2] : s > 0.7 ? col[0] : col[1]; g.fillRect(x + i, y, 1, 1); } };
  const w = Math.max(4, Math.round(W * 0.28)), cx = Math.round(W / 2 - w / 2);
  bar(cx, 2, H - 1, w);
  const a1 = Math.round(H * (0.35 + R() * 0.15)); bar(cx - w, a1, a1 + 3, w); bar(cx - w, Math.round(a1 - H * 0.2), a1 + 2, Math.max(3, w - 1));
  const a2 = Math.round(H * (0.25 + R() * 0.15)); bar(cx + w, a2, a2 + 3, w); bar(cx + w + 1, Math.round(a2 - H * 0.16), a2 + 2, Math.max(3, w - 1));
  g.fillStyle = '#ffd86a'; if (R() < 0.6) g.fillRect(cx + 1, 0, w - 2, 2);
  return finish(c);
}
function rock(R, W, H, pal, spots) {
  const c = mk(W, H), g = c.getContext('2d'), n = 9, rad = [];
  for (let i = 0; i < n; i++) rad.push(0.72 + R() * 0.28);
  const cx = W / 2, cy = H * 0.62, rx = W * 0.47, ry = H * 0.55;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dy > 0.75) continue;
    const a = (Math.atan2(dy, dx) + TAU) % TAU, f = a / TAU * n, i0 = Math.floor(f) % n, i1 = (i0 + 1) % n, rr = rad[i0] + (rad[i1] - rad[i0]) * (f - Math.floor(f)), d = Math.hypot(dx, dy);
    if (d > rr) continue;
    let t = 0.55 - 0.65 * (dx * -0.6 + dy * -0.8) / rr + (d > rr - 0.12 ? -0.2 : 0) + ((x * 3 + y * 5) % 7 === 0 ? -0.18 : 0);
    g.fillStyle = pal[t > 0.95 ? 3 : t > 0.6 ? 2 : t > 0.28 ? 1 : 0]; g.fillRect(x, y, 1, 1);
  }
  if (spots) for (let i = 0; i < 7; i++) { const x = Math.round(W * 0.2 + R() * W * 0.6), y = Math.round(H * 0.25 + R() * H * 0.45); g.fillStyle = spots[i % spots.length]; g.fillRect(x, y, 2, 1); g.fillRect(x, y + 1, 1, 1); }
  return finish(c);
}
function crystal(R, W, H, pal) {
  const c = mk(W, H), g = c.getContext('2d');
  const spike = (cx, w, h, lean) => { for (let y = 0; y < h; y++) { const f = y / h, hw = Math.max(0.6, w * Math.min(1, f * 2.5)), x0 = cx + lean * (h - y) - hw; for (let x = Math.floor(x0); x < x0 + hw * 2; x++) { const s = (x - x0) / (hw * 2); g.fillStyle = s < 0.3 ? pal[2] : s > 0.7 ? pal[0] : pal[1]; g.fillRect(x, H - h + y, 1, 1); } } g.fillStyle = pal[3]; g.fillRect(Math.round(cx + lean * h * 0.7 - 1), Math.round(H - h * 0.75), 1, Math.max(2, Math.round(h * 0.3))); };
  spike(W / 2, W * 0.16, H * 0.95, 0); spike(W * 0.28, W * 0.12, H * 0.6, -0.15); spike(W * 0.72, W * 0.12, H * 0.68, 0.15);
  return finish(c);
}
function mushroom(R, W, H, cap) {
  const c = mk(W, H), g = c.getContext('2d');
  g.fillStyle = '#f0e6d0'; g.fillRect(Math.round(W / 2 - 1.5), Math.round(H * 0.45), 3, Math.round(H * 0.55));
  for (let y = 0; y < H * 0.5; y++) for (let x = 0; x < W; x++) { const dx = (x + 0.5 - W / 2) / (W / 2), dy = (y + 0.5 - H * 0.5) / (H * 0.48); if (dx * dx + dy * dy > 1 || dy > 0) continue; g.fillStyle = dx < -0.3 ? shade(cap, 1.2) : dx > 0.4 ? shade(cap, 0.75) : cap; g.fillRect(x, y, 1, 1); }
  g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) g.fillRect(Math.round(W * 0.2 + R() * W * 0.55), Math.round(H * 0.12 + R() * H * 0.25), 1, 1);
  return finish(c);
}
function flower(col) { return finish(pix(['.a.', 'aba', '.a.', '.c.', 'cc.', '.c.'], { a: col, b: '#ffe46a', c: '#3e8a3a' })); }
function tuft(pal) { return finish(pix(['.a..b', 'ba.ab', '.bab.', 'bbabb'], { a: pal[0], b: pal[1] }), false); }
function reeds() { return finish(pix(['.a...a', '.a..ba', '.b..b.', 'bb.bb.', '.b.b..', '.bbb..', '..b...'], { a: '#6a4424', b: '#4a7a3a' })); }
function pillar(R, W, H, pal, broken) {
  const c = mk(W, H), g = c.getContext('2d'), top = broken ? H * (0.25 + R() * 0.35) : 3;
  for (let y = Math.floor(top); y < H; y++) for (let x = 2; x < W - 2; x++) {
    const s = (x - 2) / (W - 4); let k = s < 0.25 ? 2 : s > 0.72 ? 0 : 1; if ((y % 9 === 0) || ((x + 1) % 4 === 0 && s > 0.15 && s < 0.85 && k > 0)) k = Math.max(0, k - 1);
    if (broken && y < top + 4 && R() < 0.5) continue;
    g.fillStyle = pal[k]; g.fillRect(x, y, 1, 1);
  }
  if (!broken) { g.fillStyle = pal[2]; g.fillRect(0, 0, W, 3); g.fillStyle = pal[0]; g.fillRect(0, 3, W, 1); }
  g.fillStyle = pal[2]; g.fillRect(0, H - 4, W, 3); g.fillStyle = pal[0]; g.fillRect(0, H - 1, W, 1);
  return finish(c);
}
function sign() { return finish(pix(['aaaaaaaaaaa', 'abbbbbbbbba', 'abcccbcccba', 'abbbbbbbbba', 'abccbcccbba', 'abbbbbbbbba', 'aaaaaaaaaaa', '....ada....', '....ada....', '....ada....', '....ada....', '....ada....'], { a: '#4a2e1a', b: '#c89a5a', c: '#7a5a3a', d: '#8a5e34' })); }
function flame(R, f) {
  const c = mk(8, 12), g = c.getContext('2d');
  for (let y = 0; y < 12; y++) for (let x = 0; x < 8; x++) { const dx = (x + 0.5 - 4) / (3.6 * (y / 12 + 0.15)), dy = y / 12; if (Math.abs(dx) > 1 || (dy < 0.15 && R() < 0.5)) continue; const t = (1 - Math.abs(dx)) * dy + (f ? 0.1 : -0.05) * Math.sin(y + x); g.fillStyle = t > 0.6 ? '#fff4b8' : t > 0.32 ? '#ffc145' : '#ff6b2a'; g.fillRect(x, y, 1, 1); }
  return finish(c, false);
}
function torch(R, f) {
  const c = mk(10, 30), g = c.getContext('2d');
  g.fillStyle = '#4a2e1a'; g.fillRect(4, 10, 2, 20); g.fillStyle = '#6a4424'; g.fillRect(4, 10, 1, 20); g.fillStyle = '#3a3c48'; g.fillRect(3, 9, 4, 2);
  g.drawImage(flame(R, f), 1, 0);
  return finish(c);
}
function banner(col, emb) {
  const c = mk(14, 40), g = c.getContext('2d');
  g.fillStyle = '#5a4a3a'; g.fillRect(1, 0, 2, 40); g.fillStyle = '#c8a040'; g.fillRect(0, 0, 4, 2);
  for (let y = 3; y < 24; y++) for (let x = 3; x < 13; x++) { if (y > 20 && Math.abs(x - 8) < y - 19) continue; g.fillStyle = x < 5 ? shade(col, 1.15) : x > 10 ? shade(col, 0.8) : col; g.fillRect(x, y, 1, 1); }
  g.fillStyle = emb; g.fillRect(6, 8, 4, 4); g.fillRect(7, 7, 2, 6);
  return finish(c);
}
function tent(col) {
  const c = mk(40, 26), g = c.getContext('2d');
  for (let y = 0; y < 26; y++) for (let x = 0; x < 40; x++) { const hw = (y + 1) * 0.78; if (Math.abs(x + 0.5 - 20) > hw) continue; const s = (x + 0.5 - (20 - hw)) / (2 * hw); g.fillStyle = Math.abs(x + 0.5 - 20) < 3 && y > 12 ? '#3a2a1a' : s < 0.3 ? shade(col, 1.15) : s > 0.7 ? shade(col, 0.78) : col; if (y % 6 === 5) g.fillStyle = shade(col, 0.85); g.fillRect(x, y, 1, 1); }
  return finish(c);
}
function bones() { return finish(pix(['..aaa..', '.aaaaa.', '.abaaba', '.aaaaa.', '..a.a..', 'a.....a', '.a...a.', '..aaa..', '.a...a.'], { a: '#ece6d4', b: '#2a2420' })); }
function well() { return finish(pix(['..aaaaaaaaaa..', '.abbbbbbbbbba.', 'abbbbbbbbbbbba', '..c........c..', '..c...dd...c..', '..c...d....c..', '..c...dd...c..', 'eeeeeeeeeeeeee', 'efefefefefefef', 'eeeeeeeeeeeeee', 'efefefefefefef', 'eeeeeeeeeeeeee'], { a: '#7a2a20', b: '#b8402c', c: '#6a4424', d: '#8a8a92', e: '#8a8a92', f: '#5a5a66' })); }
function snowman() { return finish(pix(['....aaa....', '...aaaaa...', '...abaab...', '...aacaa...', '....aaa....', '..aaaaaaa..', 'd.aaadaaa.d', '.daaaaaaad.', '..aaadaaa..', '.aaaaaaaaa.', 'aaaaaaaaaaa', 'aaaaaaaaaaa', '.aaaaaaaaa.', '..aaaaaaa..'], { a: '#f4f8ff', b: '#1a1420', c: '#f07a20', d: '#6a4424' })); }

// ---------- texture degli edifici: 8x8 riquadri da 32 pixel ----------
function tiles(R) {
  const T = 32, c = mk(T * 8, T * 8), g = c.getContext('2d');
  const at = (i, fn) => { g.save(); g.translate((i % 8) * T, Math.floor(i / 8) * T); fn(); g.restore(); };
  const fill = (col, n, v) => { g.fillStyle = col; g.fillRect(0, 0, T, T); for (let k = 0; k < n; k++) { g.fillStyle = shade(col, 1 + (R() - 0.5) * v); g.fillRect(R() * T | 0, R() * T | 0, 1 + (R() < 0.3), 1); } };
  const bricks = (col, mortar, bw, bh) => { g.fillStyle = mortar; g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0; for (let x = -bw; x < T; x += bw) { g.fillStyle = shade(col, 0.88 + R() * 0.24); g.fillRect(x + off + 1, y + 1, bw - 1, bh - 1); g.fillStyle = shade(col, 1.12); g.fillRect(x + off + 1, y + 1, bw - 1, 1); } } };
  at(0, () => { fill('#e6d8b8', 90, 0.12); g.fillStyle = 'rgba(90,70,50,.18)'; g.fillRect(0, T - 4, T, 4); });
  at(1, () => { fill('#e6d8b8', 70, 0.12); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, T, 3); g.fillRect(0, T - 3, T, 3); g.fillRect(0, 0, 3, T); g.fillRect(T - 3, 0, 3, T); for (let i = 0; i < T; i++) { g.fillRect(i, Math.round(i * 0.95), 2, 2); } });
  at(2, () => bricks('#8a8c96', '#4a4a54', 10, 6));
  at(3, () => { for (let x = 0; x < T; x += 6) { g.fillStyle = shade('#8a5e34', 0.85 + R() * 0.3); g.fillRect(x, 0, 6, T); g.fillStyle = '#4a2e1a'; g.fillRect(x, 0, 1, T); for (let k = 0; k < 5; k++) { g.fillStyle = '#6a4424'; g.fillRect(x + 2 + (R() * 3 | 0), R() * T | 0, 1, 3); } } });
  const roof = (col) => { g.fillStyle = shade(col, 0.6); g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += 6) for (let x = ((y / 6) % 2) * 4 - 4; x < T; x += 8) { g.fillStyle = shade(col, 0.9 + R() * 0.2); g.fillRect(x, y, 7, 5); g.fillStyle = shade(col, 1.2); g.fillRect(x, y + 4, 7, 1); g.fillStyle = shade(col, 0.7); g.fillRect(x + 6, y, 1, 5); } };
  at(4, () => roof('#b8402c'));
  at(5, () => roof('#4a5a7a'));
  at(6, () => { fill('#c8a04a', 0, 0); for (let k = 0; k < 160; k++) { g.fillStyle = R() < 0.5 ? '#a8803a' : '#e0c070'; g.fillRect(R() * T | 0, R() * T | 0, 1, 3 + (R() * 3 | 0)); } g.fillStyle = '#8a6a2a'; for (let y = 5; y < T; y += 8) g.fillRect(0, y, T, 1); });
  at(7, () => { g.fillStyle = '#3a2416'; g.fillRect(0, 0, T, T); for (let x = 2; x < T - 2; x += 7) { g.fillStyle = shade('#7a4e2a', 0.85 + R() * 0.3); g.fillRect(x, 3, 6, T - 3); } g.fillStyle = '#2a1a10'; g.fillRect(0, 0, T, 3); g.fillStyle = '#c8a040'; g.fillRect(T - 9, 17, 3, 3); g.fillStyle = '#5a5a66'; for (const y of [8, 24]) g.fillRect(2, y, T - 4, 2); });
  at(8, () => { fill('#e6d8b8', 60, 0.1); g.fillStyle = '#3a2416'; g.fillRect(7, 6, 18, 20); g.fillStyle = '#5a8ac8'; g.fillRect(9, 8, 14, 16); g.fillStyle = '#9ac4f0'; g.fillRect(10, 9, 4, 6); g.fillStyle = '#3a2416'; g.fillRect(15, 8, 2, 16); g.fillRect(9, 15, 14, 2); g.fillStyle = '#6a8a3a'; g.fillRect(6, 26, 20, 3); g.fillStyle = '#d84a4a'; for (let i = 0; i < 4; i++) g.fillRect(8 + i * 5, 25, 2, 2); });
  at(9, () => bricks('#b8b4a8', '#7a7670', 16, 8));
  at(10, () => bricks('#d8b878', '#9a7a48', 12, 7));
  at(11, () => { bricks('#7a8a7a', '#3a443a', 11, 7); for (let k = 0; k < 40; k++) { g.fillStyle = R() < 0.5 ? '#4a7a3a' : '#5a9a44'; g.fillRect(R() * T | 0, R() * T | 0, 2, 1 + (R() < 0.4)); } });
  at(12, () => { g.fillStyle = '#2a2a3a'; g.fillRect(0, 0, T, T); g.fillStyle = '#1a1a26'; g.fillRect(0, 0, T, 2); g.fillRect(0, 0, 2, T); g.fillRect(T - 2, 0, 2, T); g.strokeStyle = '#4ae0e8'; g.lineWidth = 1; g.beginPath(); g.arc(16, 15, 8, 0, TAU); g.stroke(); g.fillStyle = '#4ae0e8'; for (const [x, y] of [[16, 5], [6, 15], [26, 15], [16, 25], [11, 10], [21, 20]]) g.fillRect(x - 1, y - 1, 2, 2); g.fillStyle = '#b8f8ff'; g.fillRect(15, 14, 2, 2); });
  at(13, () => { for (let x = 0; x < T; x += 4) { g.fillStyle = (x / 4) % 2 ? '#e8e0d0' : '#c8342c'; g.fillRect(x, 0, 4, T); } g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, T - 3, T, 3); });
  at(14, () => fill('#5a4a40', 60, 0.25));
  at(15, () => { fill('#3a3a46', 50, 0.2); g.fillStyle = '#ffc145'; g.fillRect(14, 10, 4, 8); g.fillStyle = '#fff4b8'; g.fillRect(15, 12, 2, 4); });
  at(16, () => bricks('#9a6a4a', '#5a3a2a', 10, 6));
  at(17, () => { fill('#e8e2d0', 30, 0.08); g.fillStyle = '#c8a040'; g.fillRect(0, 0, T, 2); g.fillRect(0, T - 2, T, 2); });
  return c;
}

// ---------- texture di dettaglio del terreno (64x64, 4 motivi nei 4 canali) ----------
function detail(R) {
  const S = 64, d = new Uint8Array(S * S * 4);
  const vn = (() => { const g = []; for (let i = 0; i < 64; i++) g.push(R()); return (x, y, f) => { const X = x * f / S, Y = y * f / S, i0 = Math.floor(X), j0 = Math.floor(Y), u = X - i0, v = Y - j0, s = t => t * t * (3 - 2 * t), at = (i, j) => g[((i % f + f) % f) + ((j % f + f) % f) * 8]; return at(i0, j0) * (1 - s(u)) * (1 - s(v)) + at(i0 + 1, j0) * s(u) * (1 - s(v)) + at(i0, j0 + 1) * (1 - s(u)) * s(v) + at(i0 + 1, j0 + 1) * s(u) * s(v); }; })();
  for (let i = 0; i < S * S; i++) { d[i * 4] = 120; d[i * 4 + 1] = 128; d[i * 4 + 3] = 0; }
  for (let k = 0; k < 330; k++) { const x = R() * S | 0, y = R() * S | 0, l = 2 + (R() * 3 | 0), v = R() < 0.55 ? 205 : 55; for (let j = 0; j < l; j++) d[(((y + j) % S) * S + x) * 4] = v - j * 10; }
  for (let i = 0; i < S * S; i++) { const r = R(); d[i * 4 + 1] = r < 0.12 ? 225 : r < 0.24 ? 40 : 110 + (R() * 40 | 0); }
  const pts = []; for (let k = 0; k < 20; k++) pts.push([R() * S, R() * S, (R() - 0.5) * 60]);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let d1 = 1e9, d2 = 1e9, best = null;
    for (const p of pts) for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const dd = Math.hypot(x + 0.5 - p[0] - ox, y + 0.5 - p[1] - oy); if (dd < d1) { d2 = d1; d1 = dd; best = p; } else if (dd < d2) d2 = dd; }
    const i = (y * S + x) * 4;
    d[i + 2] = d2 - d1 < 1.3 ? 45 : Math.max(60, Math.min(220, 140 + best[2] - d1 * 2));
    d[i + 3] = Math.round(100 + 60 * vn(x, y, 4) + 25 * vn(x, y, 8));
  }
  return { w: S, h: S, data: d };
}

// ---------- panorama lontano: monti in basso, nuvole in alto ----------
function pano(R, cols) {
  const c = mk(512, 64), g = c.getContext('2d');
  for (let layer = 0; layer < 2; layer++) {
    const base = layer ? 30 : 22, amp = layer ? 12 : 18;
    for (let x = 0; x < 512; x++) {
      const t = x / 512 * TAU, h = Math.max(1, Math.round(base * 0.35 + amp * (0.5 + 0.3 * Math.sin(t * 3 + layer) + 0.2 * Math.sin(t * 7 + 2 * layer) + 0.12 * Math.sin(t * 17)) - layer * 6));
      for (let y = 64 - h; y < 64; y++) { g.fillStyle = (layer === 0 && y < 64 - h + 3 && h > 14) ? cols[2] : cols[layer]; g.fillRect(x, y, 1, 1); }
    }
  }
  for (let k = 0; k < 9; k++) {
    const cx = R() * 512, cy = 6 + R() * 18, w = 20 + R() * 40;
    for (let i = 0; i < 6; i++) { const bx = cx + (R() - 0.5) * w, by = cy + (R() - 0.5) * 4, r = 3 + R() * 5; for (let y = -r; y < r * 0.5; y++) for (let x = -r * 1.6; x < r * 1.6; x++) if ((x / 1.6) ** 2 + y * y < r * r) { const X = ((Math.round(bx + x) % 512) + 512) % 512; g.fillStyle = y < -r * 0.3 ? '#ffffff' : '#e4ecf6'; g.fillRect(X, Math.round(by + y), 1, 1); } }
  }
  return c;
}

// ---------- icone dell'interfaccia (12x12) ----------
const ICO = {
  sword: ['..........aa', '.........aba', '........aba.', '.......aba..', '......aba...', '.....aba....', '.c..aba.....', '..cada......', '..ddc.......', '.dd.cc......', 'dd....c.....', 'd...........'],
  armor: ['..aa....aa..', '.abbaaaabba.', '.abbbbbbbba.', 'aabbbbbbbbaa', 'a.abbbbbba.a', '..abbccbba..', '..abbbbbba..', '..abbccbba..', '..abbbbbba..', '..abbbbbba..', '...aaaaaa...', '............'],
  helm: ['............', '....aaaa....', '..aabbbbaa..', '.abbbbbbbba.', '.abbbbbbbba.', 'abbbbbbbbbba', 'abbaaaaaabba', 'abba.cc.abba', 'abba.cc.abba', '.aa......aa.', '............', '............'],
  shield: ['.aaaaaaaaaa.', 'abbbbbbbbbba', 'abbbbccbbbba', 'abbbbccbbbba', 'abccccccccba', 'abbbbccbbbba', 'abbbbccbbbba', '.abbbccbbba.', '.abbbbbbbba.', '..abbbbbba..', '...abbbba...', '....aaaa....'],
  ring: ['............', '.....aa.....', '....abba....', '.....aa.....', '...cccccc...', '..cc....cc..', '.cc......cc.', '.c........c.', '.cc......cc.', '..cc....cc..', '...cccccc...', '............'],
  boots: ['............', '..aaaa......', '..abba......', '..abba......', '..abba......', '..abba......', '..abbaaaa...', '..abbbbbba..', '.abbbbbbbba.', '.aaaaaaaaaa.', '............', '............'],
  amulet: ['.a........a.', '..a......a..', '...a....a...', '....a..a....', '.....aa.....', '....bbbb....', '...bccccb...', '...bcddcb...', '...bcddcb...', '...bccccb...', '....bbbb....', '............'],
  potion: ['....aaaa....', '....abba....', '.....aa.....', '....abba....', '...abbbba...', '..abccccba..', '.abccdcccba.', '.abccccccba.', '.abcccccdba.', '..abccccba..', '...aaaaaa...', '............'],
  heart: ['............', '.aaa...aaa..', 'abbba.abbba.', 'abcbbabbbba.', 'abbbbbbbbba.', 'abbbbbbbbba.', '.abbbbbbba..', '..abbbbba...', '...abbba....', '....aba.....', '.....a......', '............'],
  ore: ['............', '....aaaa....', '..aabbbbaa..', '.abbcbbbbba.', '.abbbbbcbba.', 'abbcbbbbbbba', 'abbbbbcbbbba', 'abcbbbbbbcba', '.abbbbcbbba.', '..aaaaaaaa..', '............', '............'],
  map: ['............', '.aaaaaaaaaa.', 'abbbbbbbbbba', 'abcbbbbddbba', 'abbcbbbdbbba', 'abbbcccbbbba', 'abbbbbbbcbba', 'abddbbbbbcba', 'abdbbbbbbbba', 'abbbbbbbbbba', '.aaaaaaaaaa.', '............'],
  coin: ['............', '....aaaa....', '..aabbbbaa..', '.abbcccbbba.', '.abcbbbbbba.', 'abbcbbbbbbba', 'abbcbbbbbbba', 'abbbbbbbbbba', '.abbbbbbbba.', '.aabbbbbbaa.', '...aaaaaa...', '............'],
  key: ['............', '..aaaa......', '.abbbba.....', '.ab..ba.....', '.abbbbaaaaaa', '..aaaabbbbba', '.......ab.ba', '.......a..a.', '............', '............', '............', '............'],
  fish: ['............', '............', '..aaaa....a.', '.abbbba..aa.', 'abcbbbbaaba.', 'abbbbbbbbba.', '.abbbba..aa.', '..aaaa....a.', '............', '............', '............', '............'],
};
function icon(name, c1, c2 = '#fff4b0') {
  const base = { a: '#141018', b: c1, c: c2, d: shade(c1, 0.6) };
  return pix(ICO[name], base);
}

// ---------- atlante: tutti gli sprite in un'unica immagine ----------
function Atlas(AW, AH) {
  const c = mk(AW, AH), g = c.getContext('2d'); let x = 1, y = 1, rowH = 0;
  return {
    c, AW, AH,
    add(img) {
      const w = img.width, h = img.height;
      if (x + w + 1 > AW) { x = 1; y += rowH + 2; rowH = 0; }
      if (y + h + 1 > AH) throw new Error('atlante pieno');
      g.drawImage(img, x, y);
      const r = { x, y, w, h, u0: x / AW, v0: y / AH, u1: (x + w) / AW, v1: (y + h) / AH };
      x += w + 2; rowH = Math.max(rowH, h); return r;
    },
    put(img, r) { g.clearRect(r.x, r.y, r.w, r.h); g.drawImage(img, r.x, r.y); },
  };
}

SG.art = { mk, shade, mixc, finish, pix, text, textW, wrap, figure, human, beast, slime, bat, dragon, chest,
  oak, giantTree, pine, palm, deadTree, willow, bush, cactus, rock, crystal, mushroom, flower, tuft, reeds, pillar, sign, torch, flame, banner, tent, bones, well, snowman,
  tiles, detail, pano, icon, Atlas, TRUNK, BIRCH };
})();
