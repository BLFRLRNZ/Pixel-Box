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

// ---------- modellini 3D a pixel (X avanti, Y sinistra, Z su) ----------
// Ogni pixel cerca la superficie più vicina tra scatole ('b'), ellissoidi ('e', 'o'), capsule ('c')
// e coni arrotondati ('k'): così le forme sono tonde. La luce cade a bande nette, come nella pixel art,
// e alla fine finish() aggiunge il contorno scuro.
const RGB = {};
function rgbOf(c) {
  if (RGB[c]) return RGB[c];
  let v;
  if (c[0] === '#') { const n = parseInt(c.slice(1), 16); v = [n >> 16, (n >> 8) & 255, n & 255]; }
  else { const m = c.match(/\d+/g); v = [+m[0], +m[1], +m[2]]; }
  return RGB[c] = v;
}
function rotP(v, R) {
  let X = v[0], Y = v[1], Z = v[2];
  for (const r of R) {
    if (r[0] === 't') { X += r[1]; Y += r[2]; Z += r[3]; continue; }
    const ca = Math.cos(r[1]), sa = Math.sin(r[1]); X -= r[2]; Y -= r[3]; Z -= r[4];
    if (r[0] === 'y') { const nx = X * ca - Z * sa, nz = X * sa + Z * ca; X = nx; Z = nz; }
    else if (r[0] === 'x') { const ny = Y * ca - Z * sa, nz = Y * sa + Z * ca; Y = ny; Z = nz; }
    else { const nx = X * ca - Y * sa, ny = X * sa + Y * ca; X = nx; Y = ny; }
    X += r[2]; Y += r[3]; Z += r[4];
  }
  return [X, Y, Z];
}
const NRM = [0, 0, 0], SL = [0, 0];
// intersezione del raggio (o + t·d) con una sfera; restituisce t o 1e9
function hitSphere(ox, oy, oz, d, cx, cy, cz, r) {
  const qx = ox - cx, qy = oy - cy, qz = oz - cz, b = qx * d[0] + qy * d[1] + qz * d[2], c = qx * qx + qy * qy + qz * qz - r * r, h = b * b - c;
  return h < 0 ? 1e9 : -b - Math.sqrt(h);
}
// prepara una parte: trasformazione, funzione di intersezione e sfera che la contiene
function prepPart(p) {
  const T = p.rot ? v => rotP(v, p.rot) : v => v;
  const t0 = T([0, 0, 0]), a0 = T([1, 0, 0]), a1 = T([0, 1, 0]), a2 = T([0, 0, 1]);
  const M = [a0[0] - t0[0], a0[1] - t0[1], a0[2] - t0[2], a1[0] - t0[0], a1[1] - t0[1], a1[2] - t0[2], a2[0] - t0[0], a2[1] - t0[1], a2[2] - t0[2]];
  let hit, cen, rad;
  if (p.t === 'b') {
    const b = p.b, lo = [Math.min(b[0], b[1]), Math.min(b[2], b[3]), Math.min(b[4], b[5])], hi = [Math.max(b[0], b[1]), Math.max(b[2], b[3]), Math.max(b[4], b[5])];
    cen = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2]; rad = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2;
    const slab = (o, k, d) => { if (Math.abs(d[k]) < 1e-9) return o < lo[k] || o > hi[k] ? null : 0; let a = (lo[k] - o) / d[k], bb = (hi[k] - o) / d[k]; if (a > bb) { const q = a; a = bb; bb = q; } SL[0] = a; SL[1] = bb; return 1; };
    hit = (ox, oy, oz, d) => {
      let tmin = -1e9, tmax = 1e9, ax = -1, r;
      r = slab(ox, 0, d); if (r === null) return 1e9; if (r) { if (SL[0] > tmin) { tmin = SL[0]; ax = 0; } if (SL[1] < tmax) tmax = SL[1]; }
      r = slab(oy, 1, d); if (r === null) return 1e9; if (r) { if (SL[0] > tmin) { tmin = SL[0]; ax = 1; } if (SL[1] < tmax) tmax = SL[1]; }
      r = slab(oz, 2, d); if (r === null) return 1e9; if (r) { if (SL[0] > tmin) { tmin = SL[0]; ax = 2; } if (SL[1] < tmax) tmax = SL[1]; }
      if (tmin > tmax || ax < 0) return 1e9;
      NRM[0] = NRM[1] = NRM[2] = 0; NRM[ax] = d[ax] > 0 ? -1 : 1; return tmin;
    };
  } else if (p.t === 'o' || p.t === 'e') {
    const c = p.o, r = p.t === 'o' ? [p.r, p.r, p.rz || p.r] : p.r, ir = [1 / r[0], 1 / r[1], 1 / r[2]];
    cen = c; rad = Math.max(r[0], r[1], r[2]);
    hit = (ox, oy, oz, d) => {
      const dx = d[0] * ir[0], dy = d[1] * ir[1], dz = d[2] * ir[2], A = dx * dx + dy * dy + dz * dz;
      const qx = (ox - c[0]) * ir[0], qy = (oy - c[1]) * ir[1], qz = (oz - c[2]) * ir[2];
      const B = qx * dx + qy * dy + qz * dz, C = qx * qx + qy * qy + qz * qz - 1, h = B * B - A * C;
      if (h < 0) return 1e9;
      const t = (-B - Math.sqrt(h)) / A;
      NRM[0] = (ox + t * d[0] - c[0]) * ir[0] * ir[0]; NRM[1] = (oy + t * d[1] - c[1]) * ir[1] * ir[1]; NRM[2] = (oz + t * d[2] - c[2]) * ir[2] * ir[2];
      return t;
    };
  } else if (p.t === 'c') {
    const a = p.a, e = p.b, r = p.r, ba = [e[0] - a[0], e[1] - a[1], e[2] - a[2]], baba = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2] || 1e-6;
    cen = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2]; rad = Math.sqrt(baba) / 2 + r;
    hit = (ox, oy, oz, d) => {
      const oax = ox - a[0], oay = oy - a[1], oaz = oz - a[2], bard = ba[0] * d[0] + ba[1] * d[1] + ba[2] * d[2], A = baba - bard * bard;
      let best = 1e9;
      if (A > 1e-9) {
        const baoa = ba[0] * oax + ba[1] * oay + ba[2] * oaz, rdoa = d[0] * oax + d[1] * oay + d[2] * oaz, oaoa = oax * oax + oay * oay + oaz * oaz;
        const B = baba * rdoa - baoa * bard, C = baba * oaoa - baoa * baoa - r * r * baba, h = B * B - A * C;
        if (h >= 0) { const t = (-B - Math.sqrt(h)) / A, y = baoa + t * bard; if (y > 0 && y < baba) best = t; }
      }
      const t1 = hitSphere(ox, oy, oz, d, a[0], a[1], a[2], r), t2 = hitSphere(ox, oy, oz, d, e[0], e[1], e[2], r);
      if (t1 < best) best = t1; if (t2 < best) best = t2;
      if (best >= 1e9) return 1e9;
      const px = ox + best * d[0] - a[0], py = oy + best * d[1] - a[1], pz = oz + best * d[2] - a[2], hh = Math.max(0, Math.min(1, (px * ba[0] + py * ba[1] + pz * ba[2]) / baba));
      NRM[0] = px - hh * ba[0]; NRM[1] = py - hh * ba[1]; NRM[2] = pz - hh * ba[2];
      return best;
    };
  } else if (p.t === 'y') {
    const a = p.a, e = p.b, r = p.r, ca = [e[0] - a[0], e[1] - a[1], e[2] - a[2]], caca = ca[0] * ca[0] + ca[1] * ca[1] + ca[2] * ca[2] || 1e-6;
    cen = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2]; rad = Math.sqrt(caca) / 2 + r;
    hit = (ox, oy, oz, d) => {
      const ocx = ox - a[0], ocy = oy - a[1], ocz = oz - a[2], card = ca[0] * d[0] + ca[1] * d[1] + ca[2] * d[2], caoc = ca[0] * ocx + ca[1] * ocy + ca[2] * ocz;
      const A2 = caca - card * card, B2 = caca * (ocx * d[0] + ocy * d[1] + ocz * d[2]) - caoc * card, C2 = caca * (ocx * ocx + ocy * ocy + ocz * ocz) - caoc * caoc - r * r * caca;
      if (A2 < 1e-9) { if (C2 > 0 || Math.abs(card) < 1e-9) return 1e9; const t0 = -caoc / card, t1 = (caca - caoc) / card, sg = t0 < t1 ? -1 : 1; NRM[0] = ca[0] * sg; NRM[1] = ca[1] * sg; NRM[2] = ca[2] * sg; return Math.min(t0, t1); }
      let h = B2 * B2 - A2 * C2;
      if (h < 0) return 1e9;
      h = Math.sqrt(h);
      let t = (-B2 - h) / A2;
      const y = caoc + t * card;
      if (y > 0 && y < caca) { const k = y / caca; NRM[0] = ocx + t * d[0] - ca[0] * k; NRM[1] = ocy + t * d[1] - ca[1] * k; NRM[2] = ocz + t * d[2] - ca[2] * k; return t; }
      if (Math.abs(card) < 1e-9) return 1e9;
      t = ((y < 0 ? 0 : caca) - caoc) / card;
      if (Math.abs(B2 + A2 * t) < h) { const sg = y < 0 ? -1 : 1; NRM[0] = ca[0] * sg; NRM[1] = ca[1] * sg; NRM[2] = ca[2] * sg; return t; }
      return 1e9;
    };
  } else {
    // 'k': cono arrotondato (due sfere unite da un cono tangente), calcolato esatto: superficie liscia
    const a = p.a, e = p.b, ra = p.r, rb = p.r2 !== undefined ? p.r2 : p.r, ba = [e[0] - a[0], e[1] - a[1], e[2] - a[2]], m0 = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2], rr = ra - rb, d2 = m0 - rr * rr;
    cen = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2]; rad = Math.sqrt(m0) / 2 + Math.max(ra, rb);
    if (d2 <= 1e-6) { const big = ra >= rb ? a : e, R2 = Math.max(ra, rb); hit = (ox, oy, oz, d) => { const t = hitSphere(ox, oy, oz, d, big[0], big[1], big[2], R2); if (t < 1e9) { NRM[0] = ox + t * d[0] - big[0]; NRM[1] = oy + t * d[1] - big[1]; NRM[2] = oz + t * d[2] - big[2]; } return t; }; }
    else hit = (ox, oy, oz, d) => {
      const oax = ox - a[0], oay = oy - a[1], oaz = oz - a[2], obx = ox - e[0], oby = oy - e[1], obz = oz - e[2];
      const m1 = ba[0] * oax + ba[1] * oay + ba[2] * oaz, m2 = ba[0] * d[0] + ba[1] * d[1] + ba[2] * d[2], m3 = d[0] * oax + d[1] * oay + d[2] * oaz;
      const m5 = oax * oax + oay * oay + oaz * oaz, m6 = obx * d[0] + oby * d[1] + obz * d[2], m7 = obx * obx + oby * oby + obz * obz;
      const k2 = d2 - m2 * m2, k1 = d2 * m3 - m1 * m2 + m2 * rr * ra, k0 = d2 * m5 - m1 * m1 + m1 * rr * ra * 2 - m0 * ra * ra, h = k1 * k1 - k0 * k2;
      if (h < 0) return 1e9;
      if (Math.abs(k2) > 1e-9) {
        const sq = Math.sqrt(h), t = Math.min((-k1 - sq) / k2, (-k1 + sq) / k2), y = m1 - ra * rr + t * m2;
        if (y > 0 && y < d2) { NRM[0] = d2 * (oax + t * d[0]) - ba[0] * y; NRM[1] = d2 * (oay + t * d[1]) - ba[1] * y; NRM[2] = d2 * (oaz + t * d[2]) - ba[2] * y; return t; }
      }
      const h1 = m3 * m3 - m5 + ra * ra, h2 = m6 * m6 - m7 + rb * rb;
      if (h1 < 0 && h2 < 0) return 1e9;
      let best = 1e9;
      if (h1 > 0) { const t = -m3 - Math.sqrt(h1); best = t; NRM[0] = oax + t * d[0]; NRM[1] = oay + t * d[1]; NRM[2] = oaz + t * d[2]; }
      if (h2 > 0) { const t = -m6 - Math.sqrt(h2); if (t < best) { best = t; NRM[0] = obx + t * d[0]; NRM[1] = oby + t * d[1]; NRM[2] = obz + t * d[2]; } }
      return best;
    };
  }
  return { p, M, t0, hit, cen: T(cen), rad, rgb: rgbOf(p.c), k: p.k || 1, z: p.z || 0 };
}
function figure(parts, yaw, W, H, o = {}) {
  const pitch = o.pitch !== undefined ? o.pitch : 0.34, sc = o.sc || 1, base = o.base !== undefined ? o.base : H - 3;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const V = [cy * cp, -sy * cp, -sp], Rg = [-sy, -cy, 0], U = [cy * sp, -sy * sp, cp];
  const L = [-0.5 * Rg[0] + 0.8 * U[0] - 0.42 * V[0], -0.5 * Rg[1] + 0.8 * U[1] - 0.42 * V[1], -0.5 * Rg[2] + 0.8 * U[2] - 0.42 * V[2]], ll = Math.hypot(...L);
  L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const c = mk(W, H), ctx = c.getContext('2d'), img = ctx.createImageData(W, H), px = img.data, zb = new Float32Array(W * H).fill(1e9), S0 = -300;
  for (const p of parts) {
    const q = prepPart(p), M = q.M, mt = v => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
    const Rl = mt(Rg), Ul = mt(U), Dl = mt(V), tl = mt(q.t0), O0 = [S0 * Dl[0] - tl[0], S0 * Dl[1] - tl[1], S0 * Dl[2] - tl[2]];
    const ru = q.cen[0] * Rg[0] + q.cen[1] * Rg[1] + q.cen[2] * Rg[2], uu = q.cen[0] * U[0] + q.cen[1] * U[1] + q.cen[2] * U[2], rad = q.rad, r2 = rad * rad;
    const xa = Math.max(0, Math.floor(W / 2 + (ru - rad) * sc)), xb = Math.min(W - 1, Math.ceil(W / 2 + (ru + rad) * sc));
    const ya = Math.max(0, Math.floor(base - (uu + rad) * sc)), yb = Math.min(H - 1, Math.ceil(base - (uu - rad) * sc));
    const [cr, cg, cb] = q.rgb;
    for (let yy = ya; yy <= yb; yy++) {
      const up = (base - yy - 0.5) / sc;
      for (let xx = xa; xx <= xb; xx++) {
        const right = (xx + 0.5 - W / 2) / sc;
        if ((right - ru) * (right - ru) + (up - uu) * (up - uu) > r2) continue;
        const t = q.hit(right * Rl[0] + up * Ul[0] + O0[0], right * Rl[1] + up * Ul[1] + O0[1], right * Rl[2] + up * Ul[2] + O0[2], Dl);
        if (t >= 1e9) continue;
        const idx = yy * W + xx, tt = t - q.z;
        if (tt >= zb[idx]) continue;
        zb[idx] = tt;
        // normale nello spazio del modello e luce a bande
        let nx = M[0] * NRM[0] + M[3] * NRM[1] + M[6] * NRM[2], ny = M[1] * NRM[0] + M[4] * NRM[1] + M[7] * NRM[2], nz = M[2] * NRM[0] + M[5] * NRM[1] + M[8] * NRM[2];
        const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        const lum = nx * L[0] + ny * L[1] + nz * L[2], face = -(nx * V[0] + ny * V[1] + nz * V[2]);
        let f = lum > 0.55 ? 1.2 : lum > 0.12 ? 1 : lum > -0.3 ? 0.8 : 0.64;
        if (face < 0.2) f *= 0.84;
        f *= q.k;
        const j = idx * 4;
        if (f > 1) { const g2 = f - 1; px[j] = cr + (255 - cr) * g2; px[j + 1] = cg + (255 - cg) * g2; px[j + 2] = cb + (255 - cb) * g2; }
        else { px[j] = cr * f; px[j + 1] = cg * f; px[j + 2] = cb * f; }
        px[j + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return finish(c, o.outline !== false);
}

// ---------- persone: tonde e tozze ----------
const EYE = '#1a1420';
function weapon(B, C, E, w, rot, y) {
  if (!w) return;
  if (w.kind === 'axe') { C([0, y, -4], [0, y, 11], 0.55, '#7a5230', rot); E([2.2, y, -2.6], [2.6, 0.55, 2.6], w.col, rot, 1.1); return; }
  if (w.kind === 'spear') { C([0, y, -8], [0, y, 17], 0.48, '#7a5a3a', rot); P2(C, E, [0, y, 17], [0, y, 21.5], 1.1, 0.25, '#c8d0dc', rot); return; }
  if (w.kind === 'club') { P2(C, E, [0, y, 10], [0, y, -2], 0.7, 1.6, '#7a5230', rot); return; }
  if (w.kind === 'hammer') { C([0, y, -2], [0, y, 11], 0.5, '#7a5230', rot); B([-1.5, 1.5, y - 2.9, y + 2.9, -4.8, -1.4], w.col, rot, 1.05); return; }
  if (w.kind === 'staff') { C([0, y, -8], [0, y, 13], 0.45, '#7a5a3a', rot); E([0, y, 14.4], [1.5, 1.5, 1.5], w.col, rot, 1.3); return; }
  C([0, y, 9.2], [0, y, 11.2], 0.55, '#5a3a20', rot);
  B([-1.9, 1.9, y - 0.75, y + 0.75, 8.2, 9.1], w.guard || '#c8a040', rot);
  B([-0.7, 0.7, y - 0.55, y + 0.55, -3.8 - (w.len || 0), 8.2], w.col, rot, 1.12);
  if (w.glow) B([-0.25, 0.25, y - 0.6, y + 0.6, -3.2 - (w.len || 0), 7.6], w.glow, rot, 1.3);
}
// cono arrotondato (da a a b, raggio da r1 a r2)
function P2(C, E, a, b, r1, r2, c, rot) { C.k(a, b, r1, r2, c, rot); }
function human(o, pose = {}) {
  const P = [], L = pose.leg || 0, AL = pose.armL !== undefined ? pose.armL : -L * 0.85, AR = pose.armR !== undefined ? pose.armR : L * 0.85 + 0.25;
  const B = (b, c, rot, k) => P.push({ t: 'b', b, c, rot, k });
  const E = (c0, r, c, rot, k, z) => P.push({ t: 'e', o: c0, r, c, rot, k, z });
  const C = (a, b, r, c, rot, k) => P.push({ t: 'c', a, b, r, c, rot, k });
  C.k = (a, b, r, r2, c, rot, k) => P.push({ t: 'k', a, b, r, r2, c, rot, k });
  const hip = 9.5, sh = 18.6, bob = pose.bob || 0, wide = o.wide || 0;
  // gambe e scarpe
  for (const s of [1, -1]) {
    const rot = [['y', s > 0 ? L : -L, 0, s * 1.8, hip]];
    C([0, s * 1.8, hip + 0.3], [0.1, s * 1.8, 2.8], 1.65, o.pants, rot);
    E([0.75, s * 1.85, 1.45], [2.45, 1.7, 1.5], o.boots, rot);
  }
  if (o.robe) C.k([0, 0, 11], [0, 0, 2.6], 3.4 + wide, 4.6 + wide, o.robe);
  // busto
  E([0, 0, 13.9], [2.95 + wide * 0.3, 4.25 + wide, 5.4], o.shirt);
  if (o.plate) E([1.05, 0, 14.6], [2.2, 3.55 + wide, 3.7], o.plate, null, 1.1);
  if (o.belt) E([0, 0, 10.2], [3.1 + wide * 0.3, 4.4 + wide, 1.0], o.belt);
  if (o.apron) E([1.7, 0, 11.6], [1.55, 3.3, 5], o.apron);
  if (o.cape) E([-2.75 - wide * 0.3, 0, 12.6], [0.8, 4.5 + wide, 6.9], o.cape, [['y', -0.12 - (pose.cape || 0), -2.4, 0, sh]]);
  if (o.pack) E([-3.4, 0, 14.2], [1.9, 3.1, 3.5], o.pack);
  // braccia
  for (const s of [1, -1]) {
    const rot = [['y', s > 0 ? AL : AR, 0, s * 5.3, sh]], y = s * (5.25 + wide);
    C([0, y, sh - 0.3], [0, y, 11.6], 1.38, o.sleeve || o.shirt, rot);
    E([0, y, 10.5], [1.4, 1.35, 1.4], o.hand || o.skin, rot);
    if (o.pauldron) E([0, s * (5.1 + wide), sh - 0.1], [2.25, 2.05, 1.75], o.pauldron, rot, 1.08);
    if (s < 0) weapon(B, C, E, o.weapon, rot, y);
    if (s < 0 && o.staff) { C([1.4, y, -1.5], [1.4, y, 25], 0.6, o.staff, rot); if (o.orb) E([1.4, y, 26.4], [1.75, 1.75, 1.75], o.orb, rot, 1.15); }
    if (s > 0 && o.shield) { E([0, y + 2.1, 14], [3.4, 0.75, 3.8], o.shield, rot); if (o.emblem) E([0, y + 2.75, 14], [1.4, 0.35, 1.6], o.emblem, rot, 1.2); }
  }
  // testa
  const hs = (o.head || 3.6) * 1.08, hc = sh + 0.6 + bob + hs * 0.93, fx = 0.25;
  E([fx, 0, hc], [hs, hs * 0.98, hs * 0.97], o.skin);
  const ex = fx + hs * 0.9;
  if (o.skull) {
    for (const s of [1, -1]) E([ex - 0.15, s * 1.45, hc + 0.3], [0.7, 0.95, 1.05], EYE, null, 1, 0.3);
    E([ex + 0.1, 0, hc - 1.0], [0.4, 0.5, 0.5], EYE, null, 1, 0.3);
    E([ex - 0.6, 0, hc - 2.3], [0.6, 1.9, 0.45], '#3a3428', null, 1, 0.2);
  } else for (const s of [1, -1]) E([ex - 0.05, s * 1.4, hc + 0.35], [0.5, 0.55, 0.9], o.eyes || EYE, null, o.eyes ? 1.35 : 1, 0.25);
  if (o.beard) E([fx + 2.4, 0, hc - 2.4], [1.75, 2.75, 2.2], o.beard);
  const hcol = o.hair, st = o.hairStyle;
  if (st === 'short' || st === 'bun' || st === 'tails' || st === 'long') {
    E([fx - 0.7, 0, hc + 1.15], [hs * 1.05, hs * 1.07, hs * 0.82], hcol);
    if (st === 'long') E([fx - 1.8, 0, hc - 1.9], [2.2, hs * 1.02, hs * 1.15], hcol);
    if (st === 'bun') E([fx - 2.8, 0, hc + hs * 0.85], [2.1, 2.1, 2.1], hcol);
    if (st === 'tails') for (const s of [1, -1]) E([fx - 1, s * (hs + 1.1), hc - 0.6], [1.6, 1.5, 2.1], hcol);
  }
  if (o.hood) { E([fx - 1.25, 0, hc + 0.6], [hs * 1.15, hs * 1.16, hs * 1.1], o.hood); E([fx - 2.3, 0, hc - 3.2], [1.9, 3.9, 3.4], o.hood); }
  if (o.helm) {
    const m = o.helm;
    E([fx - 0.65, 0, hc + 1.25], [hs * 1.1, hs * 1.12, hs * 0.86], m.c, null, 1.05);
    if (m.nose) B([ex + 0.15, ex + 0.7, -0.45, 0.45, hc - 1.4, hc + 2], m.c);
    if (m.wings) for (const s of [1, -1]) E([fx - 1, s * (hs + 0.9), hc + 1.9], [1.9, 0.4, 2.5], m.wings, [['y', -0.5, fx - 1, s * (hs + 0.9), hc + 1.9]]);
    if (m.spike) C([fx - 0.4, 0, hc + hs * 0.9], [fx - 0.4, 0, hc + hs + 3.2], 0.55, m.c);
    if (m.plume) E([fx - 1.5, 0, hc + hs + 1.2], [2.5, 1.1, 1.9], m.plume);
    if (m.crown) { E([fx, 0, hc + hs * 0.7], [hs * 0.98, hs * 0.98, 0.85], m.c, null, 1.12); for (const [a, b] of [[1, 0], [0, 1], [0, -1], [-1, 0]]) C([fx + a * hs * 0.8, b * hs * 0.8, hc + hs * 0.75], [fx + a * hs * 0.85, b * hs * 0.85, hc + hs + 1.7], 0.6, m.c, null, 1.15); E([fx + hs * 0.95, 0, hc + hs * 0.7], [0.65, 0.65, 0.65], m.gem || '#e8304a', null, 1.25, 0.2); }
  }
  if (o.hat) { E([fx, 0, hc + hs * 0.6], [hs + 2, hs + 2, 0.5], o.hat); E([fx - 0.2, 0, hc + hs * 0.95], [hs * 0.82, hs * 0.82, 1.9], o.hat, null, 0.92); }
  // corona (una fascia d'oro con le punte) e turbante (una palla schiacciata con la gemma)
  if (o.crown) { E([fx, 0, hc + hs * 0.72], [hs * 0.9, hs * 0.9, 0.9], o.crown, null, 1.15); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; E([fx + Math.cos(a) * hs * 0.74, Math.sin(a) * hs * 0.74, hc + hs * 0.72 + 1.3], [0.5, 0.5, 0.9], o.crown, null, 1.2); } }
  if (o.turban) { E([fx - 0.2, 0, hc + hs * 0.55], [hs * 1.12, hs * 1.14, hs * 0.7], o.turban); E([fx - 0.3, 0, hc + hs * 1.0], [hs * 0.7, hs * 0.72, hs * 0.5], o.turban, null, 1.08); E([fx + hs * 0.95, 0, hc + hs * 0.6], [0.5, 0.6, 0.6], o.gem || '#e8364e', null, 1.2); }
  if (o.ears) for (const s of [1, -1]) C.k([fx - 0.3, s * hs * 0.85, hc + 0.2], [fx - 0.8, s * (hs + 3.2), hc + 1.8], 1.1, 0.35, o.skin);
  if (o.horns) for (const s of [1, -1]) C.k([fx - 0.3, s * 1.8, hc + hs * 0.75], [fx - 1.8, s * 2.7, hc + hs + 2.8], 0.8, 0.25, o.horns);
  if (o.antlers) for (const s of [1, -1]) { C.k([fx - 0.2, s * 2, hc + hs * 0.75], [fx - 0.5, s * 3, hc + hs + 4.2], 0.6, 0.4, o.antlers); C.k([fx - 0.3, s * 2.5, hc + hs + 2], [fx + 1.4, s * 3.9, hc + hs + 3.6], 0.45, 0.3, o.antlers); }
  return P;
}
// ---------- animali e mostri ----------
function beast(o, pose = {}) {
  const P = [], L = pose.leg || 0, s = o.s || 1, lunge = pose.lunge || 0;
  const S = v => v.map(q => q * s), SR = rot => rot && rot.map(q => [q[0], q[1], q[2] * s, q[3] * s, q[4] * s]);
  const E = (c0, r, c, rot, k, z) => P.push({ t: 'e', o: S(c0), r: S(r), c, rot: SR(rot), k, z });
  const C = (a, b, r, c, rot, k, r2) => P.push({ t: r2 !== undefined ? 'k' : 'c', a: S(a), b: S(b), r: r * s, r2: r2 !== undefined ? r2 * s : undefined, c, rot: SR(rot), k });
  E([0, 0, 8.3], [6.6, 3.05, 3.15], o.c);
  E([0.4, 0, 6.8], [5.4, 2.45, 1.9], o.c2);
  E([5.3 + lunge * 0.5, 0, 9.5], [3.1, 2.75, 3.05], o.c);
  E([9.7 + lunge, 0, 11.7], [3.2, 2.6, 2.55], o.c);
  E([12.7 + lunge, 0, 10.7], [2.05, 1.35, 1.25], o.c2);
  E([14.5 + lunge, 0, 11.1], [0.6, 0.7, 0.55], EYE);
  for (const t of [1, -1]) {
    C([8.7 + lunge, t * 1.45, 13.4], [8.1 + lunge, t * 1.85, 16.4], 1.0, o.c, null, 1, 0.35);
    E([11.6 + lunge, t * 1.25, 12.4], [0.45, 0.42, 0.55], o.eye || '#ffd23f', null, 1.35, 0.2);
  }
  C([-6, 0, 9.4], [-10.8, 0, 9.8 + (o.tailUp || 0.5) * 4 + (pose.tail || 0) * 3], 1.35, o.c, null, 1, 0.8);
  for (const [fx, fy, a] of [[4, 1.6, L], [4, -1.6, -L], [-4, 1.6, -L], [-4, -1.6, L]]) {
    const rot = [['y', a, fx, fy, 6.6]];
    C([fx, fy, 7], [fx, fy, 1.1], 1.2, o.leg || o.c, rot);
    E([fx + 0.55, fy, 0.85], [1.45, 1.05, 0.8], o.leg || o.c, rot);
  }
  return P;
}
function slime(o, f) {
  const q = f ? 1.22 : 1, P = [];
  P.push({ t: 'e', o: [0, 0, 5.4 / q], r: [7.2 * q, 7.2 * q, 5.8 / q], c: o.c });
  P.push({ t: 'e', o: [2.6, 2.4, 9.6 / q], r: [1.5, 1.3, 0.9], c: '#ffffff', k: 1.1, z: 1 });
  for (const s of [1, -1]) P.push({ t: 'e', o: [5.9 * q, s * 2.3, 6.2 / q], r: [0.6, 0.8, 1.15], c: EYE, z: 1 });
  if (o.crown) P.push({ t: 'b', b: [-2.5, 2.5, -2.5, 2.5, 11 / q, 13.5 / q], c: '#ffc83a' });
  return P;
}
function bat(f, c = '#4a3a6a', c2 = '#3a2a54', eye = '#ff4a4a') {
  const P = [], a = f ? 0.7 : -0.5;
  P.push({ t: 'e', o: [0, 0, 14], r: [3, 3, 3.3], c });
  for (const s of [1, -1]) {
    const rot = [['x', s * a, 0, s * 2.4, 14]];
    P.push({ t: 'e', o: [-0.4, s * 6.6, 14], r: [2.6, 4.6, 0.35], c: c2, rot });
    P.push({ t: 'e', o: [-1.6, s * 10.2, 14.1], r: [1.9, 2.4, 0.3], c: c2, rot });
    P.push({ t: 'k', a: [0.4, s * 1.3, 16.4], b: [-0.2, s * 1.9, 19], r: 0.85, r2: 0.25, c });
    P.push({ t: 'e', o: [2.7, s * 1.15, 14.6], r: [0.4, 0.45, 0.55], c: eye, k: 1.35, z: 0.3 });
  }
  return P;
}
function dragon(f) {
  const P = [], c = '#c8342c', c2 = '#f0b040', d = '#7a1a18', m = '#e0603a', wa = f ? 0.65 : -0.4;
  const E = (o, r, col, rot, k, z) => P.push({ t: 'e', o, r, c: col, rot, k, z }), K = (a, b, r, r2, col, rot, k) => P.push({ t: 'k', a, b, r, r2, c: col, rot, k }), C = (a, b, r, col, rot, k) => P.push({ t: 'c', a, b, r, c: col, rot, k });
  E([0, 0, 1], [12.5, 6.3, 5.6], c); E([1.5, 0, -2.3], [10, 4.6, 2.7], c2);
  K([9, 0, 2], [19.5, 0, 9.2], 4.4, 3, c);
  E([22.2, 0, 9.6], [4.6, 3.4, 3.1], c); E([26.4, 0, 8.7], [2.9, 2.4, 1.9], c); E([24.6, 0, 6.9], [3.4, 2.1, 1.1], d);
  for (const s of [1, -1]) { E([24.6, s * 2.2, 10.7], [0.75, 0.5, 0.6], '#ffe14a', null, 1.4, 0.3); K([20.6, s * 1.8, 11.9], [16.8, s * 2.9, 15.8], 0.9, 0.25, '#f4e8c8'); E([28.4, s * 1, 9.3], [0.35, 0.35, 0.3], d, null, 1, 0.2); }
  for (const x of [-8, -3, 2, 7]) K([x, 0, 6], [x - 1.5, 0, 8.6], 0.9, 0.2, c2);
  K([-11, 0, 1], [-34, 0, -1.5], 4.2, 0.9, c); E([-35.5, 0, -1.5], [2.6, 0.5, 2.3], d);
  for (const s of [1, -1]) {
    const rot = [['x', s * wa, 0, s * 5, 4]];
    C([0, s * 5, 4.5], [-3, s * 31, 6.5], 0.9, d, rot);
    E([-4, s * 13, 4.6], [8.5, 7.5, 0.4], m, rot); E([-9, s * 23, 5], [6.5, 8.5, 0.35], m, rot); E([-13, s * 29, 5.4], [3.5, 3.5, 0.3], m, rot);
    for (const fx of [6, -6]) { C([fx, s * 3.6, -2], [fx, s * 4, -8.2], 1.45, d); E([fx + 1, s * 4, -8.6], [1.6, 1.1, 0.6], '#f4e8c8'); }
  }
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
// acacia: chioma piatta e larga su un tronco a forcella
function acacia(R, W, H, pal) {
  const c = mk(W, H), g = c.getContext('2d'), tp = ['#4a3420', '#6a4a2c', '#8a6238'];
  trunk(g, W / 2, H * 0.45, H - 1, Math.max(3, W * 0.07), tp, 0.5);
  for (const s of [-1, 1]) for (let i = 0; i < W * 0.3; i++) { g.fillStyle = tp[1]; g.fillRect(Math.round(W / 2 + s * i), Math.round(H * 0.5 - i * 0.55), 2, 2); }
  const blobs = [];
  for (let i = 0; i < 9; i++) blobs.push([W * (0.14 + 0.72 * i / 8) + (R() - 0.5) * 3, H * (0.2 + (R() - 0.5) * 0.08) + Math.abs(i - 4) * H * 0.012, H * (0.13 + R() * 0.05)]);
  canopy(g, blobs, pal, R);
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
// ---------- oggetti del mondo: modellini tondi, con la stessa grana di pixel del resto ----------
const PD = 5;   // pixel per unità del mondo (0,2 unità per pixel)
const Cy = (a, b, r, c, k, rot) => ({ t: 'y', a, b, r, c, k, rot }), Ca = (a, b, r, c, k, rot) => ({ t: 'c', a, b, r, c, k, rot });
const El = (o, r, c, k, z, rot) => ({ t: 'e', o, r, c, k, z, rot }), Bx = (b, c, k, rot) => ({ t: 'b', b, c, k, rot }), Kc = (a, b, r, r2, c, k, rot) => ({ t: 'k', a, b, r, r2, c, k, rot });
// disegna il modellino e ritaglia la tela attorno: centro in orizzontale, appoggiato in basso
function fit(parts, yaw, o = {}) {
  const W = o.W || 180, H = o.H || 200, c = figure(parts, yaw, W, H, Object.assign({ sc: PD, base: Math.round(H * 0.8) }, o));
  const d = c.getContext('2d').getImageData(0, 0, W, H).data;
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return mk(2, 2);
  const cw = Math.ceil(Math.max(W / 2 - x0, x1 + 1 - W / 2)) * 2, ch = y1 - y0 + 1, out = mk(cw, ch);
  out.getContext('2d').drawImage(c, W / 2 - cw / 2, y0, cw, ch, 0, 0, cw, ch);
  return out;
}
const WOOD = '#6a4424', WOOD2 = '#8a5e34', IRON = '#4a4a56';
// fiamma a goccia, due fotogrammi: il nucleo chiaro, il bordo rosso
function flame(R, f, W = 12, H = 18) {
  const c = mk(W, H), g = c.getContext('2d'), r = W * 0.36, cyB = H - r - 0.5, sway = (f ? 1 : -1) * W * 0.08;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x + 0.5, py = y + 0.5;
    let q, v;
    if (py >= cyB) { const dy = py - cyB, hw = Math.sqrt(Math.max(0, r * r - dy * dy)); if (hw < 0.3) continue; q = Math.abs(px - W / 2) / hw; v = 0; }
    else { const u = (cyB - py) / (cyB - 0.5); if (u > 1) continue; const hw = r * Math.pow(1 - u, 0.8), ax = W / 2 + sway * u * u + Math.sin(u * 4.5 + (f ? 1.7 : 0)) * W * 0.05 * u; if (hw < 0.4) continue; q = Math.abs(px - ax) / hw; v = u; }
    if (q > 1) continue;
    const t = (1 - q) * (1 - v * 0.75) + (v < 0.25 ? 0.12 : 0);
    g.fillStyle = t > 0.6 ? '#fff6c8' : t > 0.32 ? '#ffc145' : '#ff6b2a'; g.fillRect(x, y, 1, 1);
  }
  return finish(c, true, '#a8280e');
}
// la torcia è solo il palo: la fiamma animata si disegna sopra (in cima, a 7,5 unità)
function torch() {
  return fit([Cy([0, 0, 0], [0, 0, 7.1], 0.34, '#5a3a20'), Cy([0, 0, 5.3], [0, 0, 5.7], 0.42, '#3a2a1a'), Cy([0, 0, 0.9], [0, 0, 1.2], 0.42, '#3a2a1a'),
    Kc([0, 0, 6.8], [0, 0, 7.2], 0.32, 0.62, '#3a3c48'), Cy([0, 0, 7.15], [0, 0, 7.75], 0.82, '#4a4c58'), Cy([0, 0, 7.74], [0, 0, 7.8], 0.66, '#ff8a2a', 1.3)], Math.PI - 0.4);
}
function well() {
  const P = [Cy([0, 0, 0], [0, 0, 0.85], 3.4, '#7a7a84'), Cy([0, 0, 0.85], [0, 0, 1.65], 3.44, '#8c8c96'), Cy([0, 0, 1.65], [0, 0, 2.35], 3.4, '#7a7a84'),
    Cy([0, 0, 2.3], [0, 0, 2.75], 3.7, '#a8a8b2'), Cy([0, 0, 2.74], [0, 0, 2.8], 2.75, '#1c2636'),
    Cy([0, -3.5, 6.1], [0, 3.5, 6.1], 0.22, '#5a3a20'), Cy([0, 0, 6.1], [0, 0, 4.4], 0.1, '#d8c090'), Cy([0, 0, 3.5], [0, 0, 4.4], 0.62, '#7a5230'), Cy([0, 0, 4.0], [0, 0, 4.15], 0.66, IRON),
    Cy([0, -4.4, 7.95], [0, 4.4, 7.95], 0.3, '#7a2a20')];
  for (const sd of [1, -1]) {
    P.push(Cy([0, sd * 3.1, 2.6], [0, sd * 3.1, 7.6], 0.34, WOOD));
    P.push(Bx([0, sd * 3.7, -4.3, 4.3, 7.55, 7.95], '#b8402c', 1, [['y', -sd * 0.62, 0, 0, 7.75]]));
  }
  return fit(P, Math.PI - 0.55);
}
function sign() {
  const ink = '#6a4a2a';
  return fit([Cy([0, 0, 0], [0, 0, 4.2], 0.3, WOOD2), Bx([-0.25, 0.25, -2.5, 2.5, 3.1, 5.7], '#c89a5a'), Bx([-0.32, 0.32, -2.6, 2.6, 5.55, 5.85], '#5a3a20'), Bx([-0.32, 0.32, -2.6, 2.6, 2.95, 3.25], '#5a3a20'),
    Bx([0.26, 0.31, -1.9, -0.3, 4.75, 5.0], ink), Bx([0.26, 0.31, 0.2, 1.9, 4.75, 5.0], ink), Bx([0.26, 0.31, -1.9, 0.9, 3.85, 4.1], ink)], Math.PI - 0.35);
}
function banner(col, emb) {
  return fit([Cy([0, -2, 0], [0, -2, 19.2], 0.36, '#5a4a3a'), El([0, -2, 19.5], [0.55, 0.55, 0.55], '#c8a040', 1.1), Cy([0, -2.2, 18.6], [0, 3.4, 18.6], 0.2, '#5a4a3a'),
    Bx([-0.12, 0.12, -1.4, 3.2, 9.8, 18.5], col), Bx([-0.12, 0.12, 0.9 - 1.63, 0.9 + 1.63, 9.8 - 1.63, 9.8 + 1.63], col, 1, [['x', 0.785, 0, 0.9, 9.8]]),
    Bx([0.13, 0.2, 0.3, 1.5, 13.6, 15.2], emb, 1.1), Bx([0.13, 0.2, 0.6, 1.2, 13.1, 15.7], emb, 1.1)], Math.PI - 0.25);
}
function tent(col) {
  const W = 96, H = 62, c = mk(W, H), g = c.getContext('2d'), st = Math.round(6 * H / 26);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const hw = (y + 1) / H * W / 2, dx = x + 0.5 - W / 2; if (Math.abs(dx) > hw) continue;
    const s = (dx + hw) / (2 * hw), dw = (y - H * 0.4) * 0.42, door = Math.abs(dx) < dw;
    let k = s < 0.3 ? 1.15 : s > 0.7 ? 0.78 : 1; if (y % st === st - 1) k *= 0.86;
    g.fillStyle = door ? (Math.abs(dx) > dw - 1.5 ? shade(col, 0.6) : '#2a1e14') : shade(col, k); g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = '#5a3a20'; g.fillRect(W / 2 - 1, 0, 2, 3);
  return finish(c);
}
function snowman() {
  const sn = '#f4f8ff', ey = '#1a1420';
  return fit([El([0, 0, 1.8], [2.3, 2.3, 1.9], sn), El([0, 0, 4.4], [1.7, 1.7, 1.4], sn), El([0, 0, 6.3], [1.2, 1.2, 1.1], sn), El([0, 0, 5.4], [1.35, 1.35, 0.36], '#c8342c'),
    El([1.02, 0.4, 6.6], [0.17, 0.17, 0.17], ey, 1, 1), El([1.02, -0.4, 6.6], [0.17, 0.17, 0.17], ey, 1, 1), Kc([1.05, 0, 6.3], [2.1, 0, 6.2], 0.22, 0.06, '#f07a20'),
    El([1.62, 0, 4.7], [0.17, 0.17, 0.17], ey, 1, 1), El([1.66, 0, 4.15], [0.17, 0.17, 0.17], ey, 1, 1),
    Ca([0, 1.4, 4.7], [0.2, 3.0, 5.8], 0.13, WOOD), Ca([0, -1.4, 4.7], [0.2, -3.0, 5.8], 0.13, WOOD),
    Cy([0, 0, 7.2], [0, 0, 7.35], 1.0, '#2a2430'), Cy([0, 0, 7.3], [0, 0, 8.3], 0.7, '#2a2430'), Cy([0, 0, 7.35], [0, 0, 7.6], 0.72, '#c8342c')], Math.PI - 0.3);
}
function anvil() {
  const m = '#5a5a66';
  return fit([Cy([0, 0, 0], [0, 0, 1.1], 1.25, '#6a4a2e'), Bx([-0.8, 0.8, -1.0, 1.0, 1.1, 1.6], '#2a2a32'), Bx([-0.5, 0.5, -0.7, 0.7, 1.6, 2.3], '#3a3a44'),
    Bx([-0.9, 0.9, -1.7, 1.3, 2.3, 3.1], m, 1.05), Kc([0, 1.3, 2.75], [0, 2.6, 2.9], 0.42, 0.1, m)], Math.PI - 0.6);
}
// il fuoco da campo è legna e sassi: la fiamma animata si disegna sopra
function campfire() {
  const P = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; P.push(El([Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0.32], [0.55, 0.5, 0.4], i % 2 ? '#6a6a74' : '#7c7c86')); }
  P.push(Ca([-1.3, -0.9, 0.45], [1.3, 0.9, 0.45], 0.3, '#5a3a1e'), Ca([-1.3, 0.9, 0.5], [1.3, -0.9, 0.5], 0.3, '#4a2e16'), Ca([0, -1.5, 0.4], [0, 1.5, 0.4], 0.28, WOOD), El([0, 0, 0.55], [0.8, 0.8, 0.3], '#ff6a1a', 1.35));
  return fit(P, Math.PI - 0.4);
}
function bones() {
  const b = '#ece6d4', d = '#2a2420';
  return fit([Ca([-0.4, -1.9, 0.3], [0.6, 1.7, 0.3], 0.2, b), El([-0.4, -1.9, 0.3], [0.34, 0.34, 0.3], b), El([0.6, 1.7, 0.3], [0.34, 0.34, 0.3], b),
    Ca([0.8, -1.5, 0.28], [-0.5, 1.3, 0.28], 0.2, b), El([0.8, -1.5, 0.28], [0.34, 0.34, 0.3], b), El([-0.5, 1.3, 0.28], [0.34, 0.34, 0.3], b),
    El([0.15, 0, 1.15], [1.0, 0.9, 0.85], b), El([0.5, 0, 0.5], [0.62, 0.62, 0.36], b),
    El([0.95, 0.38, 1.2], [0.2, 0.25, 0.25], d, 1, 1), El([0.95, -0.38, 1.2], [0.2, 0.25, 0.25], d, 1, 1), El([1.0, 0, 0.85], [0.12, 0.12, 0.14], d, 1, 1)], Math.PI - 0.5);
}
// piante piccole, disegnate pixel per pixel alla stessa grana
function flower(col) { return finish(pix(['.a.a.', 'aabaa', '.aaa.', '..c..', '.cc..', '..cc.', '..c..', '..c..'], { a: col, b: '#ffe46a', c: '#3e8a3a' })); }
function tuft(pal, W = 10, H = 8) {
  const c = mk(W, H), g = c.getContext('2d'); let sd = W * 7 + H * 13 + pal[0].charCodeAt(2);
  const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const n = Math.round(W * 0.8);
  for (let i = 0; i < n; i++) {
    const x0 = 1 + R() * (W - 2), h = Math.max(2, Math.round(H * (0.4 + R() * 0.6))), lean = (R() - 0.5) * 0.9;
    for (let t = 0; t < h; t++) { g.fillStyle = t > h - 2 ? shade(pal[1], 1.12) : pal[i % 2]; g.fillRect(Math.round(x0 - 0.5 + lean * t * t / h), H - 1 - t, 1, 1); }
  }
  return finish(c, false);
}
function reeds() {
  const W = 14, H = 18, c = mk(W, H), g = c.getContext('2d');
  for (const [x0, h, lean, head] of [[3, 16, -0.12, 1], [6, 12, 0.08, 0], [8, 17, 0.14, 1], [11, 11, 0.3, 0], [5, 9, -0.3, 0], [10, 14, 0.18, 1]]) {
    for (let t = 0; t < h; t++) { g.fillStyle = t % 5 === 4 ? '#3a6a2e' : '#4a7a3a'; g.fillRect(Math.round(x0 + lean * t), H - 1 - t, 1, 1); }
    if (head) { const x = Math.round(x0 + lean * (h - 2)); g.fillStyle = '#6a4424'; g.fillRect(x - 1, H - h - 2, 2, 4); g.fillStyle = '#8a5e34'; g.fillRect(x - 1, H - h - 2, 1, 2); }
  }
  return finish(c, true, '#2a4a24');
}

// ---------- effetti e oggetti piccoli, tondi e alla stessa grana ----------
// disco sfumato a bande con riflesso: base per monete, palline, bolle
function orb(D, c, hi, o = {}) {
  const c0 = mk(D, D), g = c0.getContext('2d'), r = D / 2 - 0.5;
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = (x + 0.5 - D / 2) / r, dy = (y + 0.5 - D / 2) / r, q = dx * dx + dy * dy; if (q > 1) continue;
    if (o.ring && q < o.ring) continue;
    const l = -dx * 0.55 - dy * 0.75 + Math.sqrt(1 - q) * 0.6;
    g.fillStyle = l > 0.75 ? hi : shade(c, l > 0.35 ? 1.12 : l > -0.1 ? 1 : 0.78); g.fillRect(x, y, 1, 1);
  }
  if (o.spot) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(D * 0.3), Math.round(D * 0.26), Math.max(1, Math.round(D / 8)), Math.max(1, Math.round(D / 8))); }
  return finish(c0, o.outline !== false, o.oc);
}
function coin() {
  const D = 9, c = mk(D, D), g = c.getContext('2d');
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = (x + 0.5 - D / 2) / 4, dy = (y + 0.5 - D / 2) / 4, q = dx * dx + dy * dy; if (q > 1) continue;
    g.fillStyle = q > 0.62 ? (dx + dy < 0 ? '#ffe07a' : '#c8901a') : q > 0.3 && dx + dy > 0.2 ? '#e8a828' : '#ffc83a'; g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = '#fff4b0'; g.fillRect(3, 2, 1, 2); g.fillRect(2, 3, 1, 1);
  return finish(c, true, '#5a3a08');
}
function heartBig() {
  const W = 11, H = 10, c = mk(W, H), g = c.getContext('2d');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x + 0.5, py = y + 0.5, l = Math.hypot(px - 3.2, py - 3.4) < 2.8, r = Math.hypot(px - 7.8, py - 3.4) < 2.8, t = py >= 3.4 && Math.abs(px - 5.5) < (9.4 - py) * 1.05;
    if (!(l || r || t)) continue;
    g.fillStyle = px + py < 6.5 ? '#ff9aa8' : px - py > 4.5 || py > 7 ? '#c8283e' : '#ff4a6a'; g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = '#ffffff'; g.fillRect(2, 2, 2, 1); g.fillRect(2, 3, 1, 1);
  return finish(c, true, '#3a0e18');
}
function puff() {
  const D = 12, c = mk(D, D), g = c.getContext('2d');
  for (const [cx, cy, r] of [[4.2, 7, 3.4], [7.6, 6.6, 3.6], [6, 4.2, 3.4]]) for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (dx * dx + dy * dy > r * r) continue;
    g.fillStyle = dx + dy < -1.2 ? '#ffffff' : dx + dy > 2.2 ? '#c8c8d4' : '#eceef6'; g.fillRect(x, y, 1, 1);
  }
  return finish(c, false);
}
// gemma vista di fronte: rombo a facce
function shard(D, c1, c2) {
  const c = mk(D, D), g = c.getContext('2d'), h = D / 2;
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = x + 0.5 - h, dy = y + 0.5 - h; if (Math.abs(dx) + Math.abs(dy) > h - 0.3) continue;
    g.fillStyle = dx < 0 && dy < 0 ? '#ffffff' : dx < 0 ? c2 : dy < 0 ? c2 : c1; if (Math.abs(dx) + Math.abs(dy) < h * 0.35) g.fillStyle = c2; g.fillRect(x, y, 1, 1);
  }
  return finish(c, true, shade(c1, 0.45));
}

// ---------- texture degli edifici: 8x8 riquadri da 32 pixel ----------
function tiles(R) {
  const T = 32, c = mk(T * 8, T * 16), g = c.getContext('2d');
  const at = (i, fn) => { g.save(); g.translate((i % 8) * T, Math.floor(i / 8) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); fn(); g.restore(); };
  const fill = (col, n, v) => { g.fillStyle = col; g.fillRect(0, 0, T, T); for (let k = 0; k < n; k++) { g.fillStyle = shade(col, 1 + (R() - 0.5) * v); g.fillRect(R() * T | 0, R() * T | 0, 1 + (R() < 0.3), 1); } };
  const bricks = (col, mortar, bw, bh) => { g.fillStyle = mortar; g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0; for (let x = -bw; x < T; x += bw) { g.fillStyle = shade(col, 0.88 + R() * 0.24); g.fillRect(x + off + 1, y + 1, bw - 1, bh - 1); g.fillStyle = shade(col, 1.12); g.fillRect(x + off + 1, y + 1, bw - 1, 1); } } };
  at(0, () => { fill('#e6d8b8', 90, 0.12); g.fillStyle = 'rgba(90,70,50,.18)'; g.fillRect(0, T - 4, T, 4); });
  at(1, () => { fill('#e6d8b8', 70, 0.12); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, T, 3); g.fillRect(0, T - 3, T, 3); g.fillRect(0, 0, 3, T); g.fillRect(T - 3, 0, 3, T); for (let i = 0; i < T; i++) { g.fillRect(i, Math.round(i * 0.95), 2, 2); } });
  at(2, () => bricks('#8a8c96', '#4a4a54', 16, 8));
  at(3, () => { for (let x = 0; x < T; x += 8) { g.fillStyle = shade('#8a5e34', 0.85 + R() * 0.3); g.fillRect(x, 0, 8, T); g.fillStyle = '#4a2e1a'; g.fillRect(x, 0, 1, T); for (let k = 0; k < 5; k++) { g.fillStyle = '#6a4424'; g.fillRect(x + 2 + (R() * 3 | 0), R() * T | 0, 1, 3); } } });
  const roof = (col) => { g.fillStyle = shade(col, 0.6); g.fillRect(0, 0, T, T); for (let y = 0; y < T; y += 8) for (let x = ((y / 8) % 2) * 4 - 8; x < T; x += 8) { g.fillStyle = shade(col, 0.9 + R() * 0.2); g.fillRect(x, y, 7, 7); g.fillStyle = shade(col, 1.2); g.fillRect(x, y + 6, 7, 1); g.fillStyle = shade(col, 0.7); g.fillRect(x + 6, y, 1, 7); } };
  at(4, () => roof('#b8402c'));
  at(5, () => roof('#4a5a7a'));
  at(6, () => { fill('#c8a04a', 0, 0); for (let k = 0; k < 160; k++) { g.fillStyle = R() < 0.5 ? '#a8803a' : '#e0c070'; g.fillRect(R() * T | 0, R() * T | 0, 1, 3 + (R() * 3 | 0)); } g.fillStyle = '#8a6a2a'; for (let y = 5; y < T; y += 8) g.fillRect(0, y, T, 1); });
  at(7, () => { g.fillStyle = '#3a2416'; g.fillRect(0, 0, T, T); for (let x = 2; x < T - 2; x += 7) { g.fillStyle = shade('#7a4e2a', 0.85 + R() * 0.3); g.fillRect(x, 3, 6, T - 3); } g.fillStyle = '#2a1a10'; g.fillRect(0, 0, T, 3); g.fillStyle = '#c8a040'; g.fillRect(T - 9, 17, 3, 3); g.fillStyle = '#5a5a66'; for (const y of [8, 24]) g.fillRect(2, y, T - 4, 2); });
  at(8, () => {
    g.clearRect(0, 0, T, T);
    for (const x0 of [1, 25]) { g.fillStyle = '#1e3a24'; g.fillRect(x0, 4, 6, 23); g.fillStyle = '#3a8a4a'; g.fillRect(x0 + 1, 5, 4, 21); g.fillStyle = '#2a6a38'; for (let y = 7; y < 26; y += 3) g.fillRect(x0 + 1, y, 4, 1); }
    g.fillStyle = '#3a2416'; g.fillRect(7, 3, 18, 25);
    g.fillStyle = '#3a6ab8'; g.fillRect(9, 5, 14, 21); g.fillStyle = '#5a8ad8'; g.fillRect(9, 5, 14, 9);
    g.fillStyle = '#bfe0ff'; g.fillRect(10, 6, 2, 4); g.fillRect(12, 6, 1, 2); g.fillRect(18, 17, 2, 3);
    g.fillStyle = '#3a2416'; g.fillRect(15, 5, 2, 21); g.fillRect(9, 14, 14, 2);
    g.fillStyle = '#a07a52'; g.fillRect(5, 27, 22, 2); g.fillStyle = '#c89a6a'; g.fillRect(5, 27, 22, 1);
    g.fillStyle = '#6a4424'; g.fillRect(7, 29, 18, 3);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ffd23f' : '#e8364e'; g.fillRect(8 + i * 3, 25 + (i % 2), 2, 2); g.fillStyle = '#3e8a3a'; g.fillRect(8 + i * 3, 27 + (i % 2), 1, 2); }
  });
  at(9, () => bricks('#b8b4a8', '#7a7670', 16, 8));
  at(10, () => bricks('#d8b878', '#9a7a48', 16, 8));
  at(11, () => { bricks('#7a8a7a', '#3a443a', 16, 8); for (let k = 0; k < 40; k++) { g.fillStyle = R() < 0.5 ? '#4a7a3a' : '#5a9a44'; g.fillRect(R() * T | 0, R() * T | 0, 2, 1 + (R() < 0.4)); } });
  at(12, () => { g.fillStyle = '#2a2a3a'; g.fillRect(0, 0, T, T); g.fillStyle = '#1a1a26'; g.fillRect(0, 0, T, 2); g.fillRect(0, 0, 2, T); g.fillRect(T - 2, 0, 2, T); g.strokeStyle = '#4ae0e8'; g.lineWidth = 1; g.beginPath(); g.arc(16, 15, 8, 0, TAU); g.stroke(); g.fillStyle = '#4ae0e8'; for (const [x, y] of [[16, 5], [6, 15], [26, 15], [16, 25], [11, 10], [21, 20]]) g.fillRect(x - 1, y - 1, 2, 2); g.fillStyle = '#b8f8ff'; g.fillRect(15, 14, 2, 2); });
  at(13, () => { for (let x = 0; x < T; x += 4) { g.fillStyle = (x / 4) % 2 ? '#e8e0d0' : '#c8342c'; g.fillRect(x, 0, 4, T); } g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, T - 3, T, 3); });
  at(14, () => fill('#5a4a40', 60, 0.25));
  at(15, () => { fill('#3a3a46', 50, 0.2); g.fillStyle = '#ffc145'; g.fillRect(14, 10, 4, 8); g.fillStyle = '#fff4b8'; g.fillRect(15, 12, 2, 4); });
  at(16, () => bricks('#9a6a4a', '#5a3a2a', 8, 4));
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
  bigkey: ['............', '.aaaa.......', 'abbbba......', 'abccba......', 'abbbbaaaaaaa', '.aaaabbbbbba', '......abaaba', '......aba.ba', '.......a..a.', '............', '............', '............'],
  gem: ['.....a......', '....aba.....', '...abcba....', '..abccdba...', '.abcccddba..', 'abccccddbba.', '.abcccdbba..', '..abccbba...', '...abbba....', '....aba.....', '.....a......', '............'],
  seal: ['............', '...aaaaaa...', '..abbbbbba..', '.abbccccbba.', '.abcbbbbcba.', '.abcbddbcba.', '.abcbddbcba.', '.abcbbbbcba.', '.abbccccbba.', '..abbbbbba..', '...aaaaaa...', '............'],
  axe: ['............', '..aaaa......', '.abbbba.....', 'abbbbbaa....', 'abbbbaccaa..', '.abbbacca...', '..aaa.acca..', '.......acca.', '........acca', '.........aca', '..........a.', '............'],
  spear: ['..........a.', '.........aba', '........abba', '.......abba.', '......acaa..', '.....aca....', '....aca.....', '...aca......', '..aca.......', '.aca........', '.aa.........', '............'],
  hammer: ['............', '..aaaaaaaa..', '..abbbbbba..', '..abbbbbba..', '..adddddda..', '..aaaacaaa..', '.....aca....', '.....aca....', '.....aca....', '.....aca....', '.....aaa....', '............'],
  staff: ['........aaa.', '.......abbba', '.......abcba', '.......abbba', '......acaaa.', '.....aca....', '....aca.....', '...aca......', '..aca.......', '.aca........', '.aa.........', '............'],
  hood: ['............', '....aaaa....', '...abbbba...', '..abbbbbba..', '..abbaaabba.', '.abba...abba', '.abba...abba', '.abbba.abbba', '..abbbabbba.', '...aaaaaaa..', '............', '............'],
  hat: ['......a.....', '.....aba....', '.....abba...', '....abbba...', '....abcbba..', '...abbbbba..', '...abbbbbba.', '..abbbbbbba.', 'aaaaaaaaaaaa', 'abbbbbbbbbba', 'aaaaaaaaaaaa', '............'],
  clover: ['............', '..aa....aa..', '.abba..abba.', '.abbbaabbba.', '..abbbbbba..', '...abccba...', '..abbccbba..', '.abbbaabbba.', '.abba.aabba.', '..aa..ada...', '.......ad...', '............'],
  feather: ['.........aa.', '........abba', '.......abbca', '......abbca.', '.....abbca..', '....abbca...', '...abbca....', '..abbca.....', '..abca......', '.adaa.......', '.da.........', 'a...........'],
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
    add(img) { const r = this.room(img.width, img.height); g.drawImage(img, r.x, r.y); return r; },
    // solo lo spazio, senza disegnarci niente (per gli sprite che arrivano dopo)
    room(w, h) {
      if (x + w + 1 > AW) { x = 1; y += rowH + 2; rowH = 0; }
      if (y + h + 1 > AH) throw new Error('atlante pieno');
      const r = { x, y, w, h, u0: x / AW, v0: y / AH, u1: (x + w) / AW, v1: (y + h) / AH };
      x += w + 2; rowH = Math.max(rowH, h); return r;
    },
    put(img, r) { g.clearRect(r.x, r.y, r.w, r.h); g.drawImage(img, r.x, r.y); },
    get used() { return y + rowH; },
  };
}

// gli sprite di personaggi, creature e alberi si disegnano 1,5 volte più grandi: stessa densità di pixel del mondo 3D
const SR = 1.5;
SG.art = { SR, mk, shade, mixc, finish, pix, text, textW, wrap, figure, human, beast, slime, bat, dragon, chest,
  oak, acacia, giantTree, pine, palm, deadTree, willow, bush, cactus, rock, crystal, mushroom, flower, tuft, reeds, pillar, sign, torch, flame, banner, tent, bones, well, snowman, anvil, campfire, fit, PD, orb, coin, heartBig, puff, shard,
  tiles, detail, pano, icon, Atlas, TRUNK, BIRCH };
})();
