// ===================== PIXEL SAGA · l'arredo dei sotterranei =====================
// Santuari, grotte, cripte, torre e laguna non sono più spogli: zoccolo e fregio sui muri, lesene, stendardi, bassorilievi,
// nicchie, lumi, rampicanti e ghiaccioli, pavimenti consumati e un medaglione al centro delle sale, più qualche cosa
// piccola ai piedi dei muri. È tutto e soltanto da vedere: nessun arredo ferma l'eroe, i massi, i nemici o i colpi,
// e ogni cosa nasce dalla posizione della cella (non da una sequenza), così rompere un muro non rimescola il resto.
(() => {
const A = SG.art, DS = SG.dun, CS = DS.CS, WH = DS.WH, DH = DS.DH, T = DS.T, sh = A.shade, TAU = Math.PI * 2;
const SETS = ['plant', 'water', 'sun', 'ice', 'fire', 'crystal', 'crypt'], FLOORS = [18, 20, 22, 24, 26, 49, 54, 62], W0 = 256, F0 = 300;
const WT = (set, k) => W0 + SETS.indexOf(set) * 6 + k;       // 0 lesena, 1 fasce (zoccolo e fregio), 2 stendardi, 3 riquadri, 4 crescita, 5 pendagli
const FT = (floor, k) => F0 + FLOORS.indexOf(floor) * 4 + k;  // quattro varianti per ogni pavimento
const PAL = {
  plant: { st: '#6a7660', dk: '#2e3628', lt: '#8e9c80', ac: '#4a8a3a', ac2: '#7ab84e', gold: '#d8b84a', cloth: '#2f6a34', cloth2: '#7a5a2a', emb: 'foglia', glow: '#9aff8a' },
  water: { st: '#4e6e8e', dk: '#22324a', lt: '#7c9cba', ac: '#3f9ab8', ac2: '#bfe9ff', gold: '#e8d27a', cloth: '#1f5a8a', cloth2: '#2a8a8a', emb: 'goccia', glow: '#9ae0ff' },
  sun: { st: '#d4ac6c', dk: '#8a6a3a', lt: '#f0d49c', ac: '#a8321e', ac2: '#e8b830', gold: '#ffd23f', cloth: '#a8321e', cloth2: '#2a5a8a', emb: 'sole', glow: '#ffe07a' },
  ice: { st: '#9ac0e0', dk: '#4a6a8a', lt: '#d8ecfa', ac: '#2a4a7a', ac2: '#ffffff', gold: '#d4e2f0', cloth: '#2a4a7a', cloth2: '#5a3a8a', emb: 'fiocco', glow: '#d8f8ff' },
  fire: { st: '#6a3a30', dk: '#1a0a08', lt: '#8a5a48', ac: '#ff7a2a', ac2: '#ffc040', gold: '#e8a020', cloth: '#8a1a14', cloth2: '#3a2a2a', emb: 'fiamma', glow: '#ffa040' },
  crystal: { st: '#5a5068', dk: '#1e1a26', lt: '#7c7090', ac: '#a070e8', ac2: '#f0e0ff', gold: '#c8a0ff', cloth: '#4a2a8a', cloth2: '#2a2a5a', emb: 'gemma', glow: '#d8b8ff' },
  crypt: { st: '#4a4456', dk: '#16121e', lt: '#6e6880', ac: '#c89a2a', ac2: '#ffd86a', gold: '#e8c24a', cloth: '#3a1a4a', cloth2: '#5a1a1a', emb: 'teschio', glow: '#c88aff' },
};
const rng = seed => { let s = Math.imul(seed + 1, 2654435761) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// ---------- i riquadri (dal 256 in su: l'atlante è stato allungato apposta) ----------
function tilesOn(c) {
  const S = 32, g = c.getContext('2d'), R = rng(4711), q = n => Math.floor(R() * n);
  const at = (i, fn, clear) => { g.save(); g.translate((i % 8) * S, Math.floor(i / 8) * S); g.beginPath(); g.rect(0, 0, S, S); g.clip(); if (clear) g.clearRect(0, 0, S, S); fn(); g.restore(); };
  const P = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const disc = (col, cx, cy, r) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) P(col, x, y); };
  const walk = (cols, x, y, n, dx, dy, wob = 0.5) => { for (let i = 0; i < n; i++) { P(cols[i % cols.length], (x % S + S) % S, y); y += dy; if (R() < wob) x += R() < 0.5 ? -1 : 1; x += dx; if (y < 0 || y >= S) break; } };
  const blob = (cols, cx, cy, r) => { for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) if (Math.hypot(x, y * 1.2) <= r + (R() - 0.5) * 1.6) P(cols[q(cols.length)], ((cx + x) % S + S) % S, ((cy + y) % S + S) % S); };
  const base = f => g.drawImage(c, (f % 8) * S, Math.floor(f / 8) * S, S, S, 0, 0, S, S);
  // gli stemmi, in un quadrato di 12 attorno a (cx, cy)
  const emb = (k, cx, cy, c1, c2) => {
    if (k === 'foglia') { const w = [1, 2, 3, 4, 4, 4, 3, 3, 2, 1]; for (let d = 0; d < 10; d++) P(c1, cx - w[d], cy - 5 + d, w[d] * 2, 1); P(c2, cx, cy - 4, 1, 9); for (const d of [-2, 0, 2]) { P(c2, cx - 2, cy + d, 2, 1); P(c2, cx + 1, cy + d - 1, 2, 1); } P(c1, cx, cy + 5, 1, 2); }
    else if (k === 'goccia') { P(c1, cx - 1, cy - 6, 2, 3); P(c1, cx - 2, cy - 3, 4, 2); P(c1, cx - 3, cy - 1, 6, 2); disc(c1, cx, cy + 2, 3.7); P(c2, cx - 2, cy, 1, 3); }
    else if (k === 'sole') { disc(c1, cx, cy, 3.4); disc(c2, cx, cy, 1.7); for (const [dx, dy, w, h] of [[-1, -7, 2, 2], [-1, 5, 2, 2], [-7, -1, 2, 2], [5, -1, 2, 2], [-5, -5, 1, 1], [-6, -6, 1, 1], [4, -5, 1, 1], [5, -6, 1, 1], [-5, 4, 1, 1], [-6, 5, 1, 1], [4, 4, 1, 1], [5, 5, 1, 1]]) P(c1, cx + dx, cy + dy, w, h); }
    else if (k === 'fiocco') { P(c1, cx - 1, cy - 6, 2, 12); P(c1, cx - 6, cy - 1, 12, 2); for (let d = 1; d <= 4; d++) for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) P(c1, cx + (a > 0 ? d - 1 : -d), cy + (b > 0 ? d - 1 : -d), 1, 1); for (const [dx, dy] of [[-3, -6], [2, -6], [-3, 5], [2, 5], [-6, -3], [-6, 2], [5, -3], [5, 2]]) P(c1, cx + dx, cy + dy, 1, 1); P(c2, cx - 1, cy - 1, 2, 2); }
    else if (k === 'fiamma') { P(c1, cx - 1, cy - 7, 1, 2); P(c1, cx - 1, cy - 5, 2, 2); P(c1, cx - 2, cy - 3, 4, 2); P(c1, cx - 3, cy - 1, 6, 4); P(c1, cx - 2, cy + 3, 4, 2); P(c2, cx - 1, cy - 1, 2, 4); P(c2, cx, cy - 3, 1, 2); }
    else if (k === 'gemma') { for (let d = -5; d <= 5; d++) { const w = d < -3 ? 3 + (d + 5) : Math.max(1, Math.round(5 - (d + 3) * 0.62)); P(c1, cx - w, cy + d, w * 2, 1); } P(c2, cx - 4, cy - 3, 8, 1); P(c2, cx - 2, cy - 5, 2, 2); P(c2, cx - 1, cy - 2, 1, 5); }
    else { disc(c1, cx, cy - 1, 4.3); P(c1, cx - 2, cy + 3, 4, 2); P(c2, cx - 3, cy - 2, 2, 2); P(c2, cx + 1, cy - 2, 2, 2); P(c2, cx - 0, cy + 1, 1, 1); P(c2, cx - 1, cy + 4, 1, 1); P(c2, cx + 1, cy + 4, 1, 1); }
  };
  // le cose piccole nelle nicchie
  const cosa = (k, cx, by, p) => {
    if (k === 'foglia') { P('#e8e0c8', cx, by - 3, 1, 3); P('#c83a2a', cx - 2, by - 5, 5, 2); P('#e85a3a', cx - 1, by - 6, 3, 1); P('#fff', cx - 1, by - 5, 1, 1); P('#e8e0c8', cx + 3, by - 2, 1, 2); P('#d8562a', cx + 2, by - 3, 3, 1); }
    else if (k === 'goccia') { disc('#f0d8c8', cx, by - 2.5, 2.6); P('#e8a8a0', cx - 1, by - 4, 1, 3); P('#e8a8a0', cx + 1, by - 4, 1, 3); P('#c88a80', cx - 2, by - 1, 5, 1); }
    else if (k === 'sole') { disc('#b8562a', cx, by - 2.6, 2.7); P('#a04a22', cx - 1, by - 7, 3, 2); P('#e8b830', cx - 2, by - 3, 5, 1); P('#8a3a1a', cx - 2, by - 1, 5, 1); }
    else if (k === 'fiocco') { for (let d = 0; d < 6; d++) P(d < 2 ? '#ffffff' : '#bfe6ff', cx - (d >> 1) + 1 - 1, by - 6 + d, Math.max(1, d), 1); P('#e6f6ff', cx - 3, by - 2, 2, 2); P('#9ad0f0', cx + 2, by - 3, 2, 3); }
    else if (k === 'fiamma') { P('#e8dcc0', cx - 1, by - 3, 2, 3); P('#ffc040', cx - 1, by - 5, 2, 2); P('#fff6c0', cx, by - 5, 1, 1); P('#ff7a2a', cx - 1, by - 6, 1, 1); P('#5a4a3a', cx - 2, by, 4, 1); }
    else if (k === 'gemma') { P(p.ac, cx - 1, by - 6, 2, 1); P(p.ac, cx - 2, by - 5, 4, 2); P(p.ac, cx - 1, by - 3, 2, 2); P(p.ac, cx, by - 1, 1, 1); P(p.ac2, cx - 1, by - 5, 1, 2); }
    else { disc('#e8e2d0', cx, by - 3, 2.6); P('#e8e2d0', cx - 1, by - 1, 3, 1); P('#1a1418', cx - 2, by - 4, 1, 2); P('#1a1418', cx + 1, by - 4, 1, 2); P('#1a1418', cx, by - 2, 1, 1); }
  };
  for (const s of SETS) { const p = PAL[s];
    // 0: il fusto della lesena, scanalato (si ripete ogni 16 punti)
    at(WT(s, 0), () => { P(p.st, 0, 0, S, S); for (let x = 0; x < S; x += 16) { P(p.dk, x, 0, 1, S); P(sh(p.st, 0.8), x + 1, 0, 1, S); P(p.lt, x + 3, 0, 2, S); P(sh(p.st, 0.86), x + 6, 0, 1, S); P(p.lt, x + 8, 0, 2, S); P(sh(p.st, 0.86), x + 11, 0, 1, S); P(sh(p.st, 0.72), x + 13, 0, 2, S); P(p.dk, x + 15, 0, 1, S); }
      P(sh(p.st, 0.66), 0, 15, S, 1); P(sh(p.st, 0.66), 0, 31, S, 1); if (s === 'crypt' || s === 'sun') { P(p.gold, 0, 3, S, 1); P(sh(p.gold, 0.7), 0, 4, S, 1); }
      for (let k = 0; k < 14; k++) P(s === 'plant' ? p.ac : s === 'ice' ? '#ffffff' : s === 'fire' ? p.ac : s === 'water' ? '#3f9a8a' : sh(p.st, 0.7), q(S), s === 'ice' ? q(10) : 20 + q(12), 1 + q(2), 1); });
    // 1: le fasce. Righe 0-9 lo zoccolo a grandi conci, righe 10-17 il fregio col motivo del luogo
    at(WT(s, 1), () => { P(sh(p.st, 0.74), 0, 0, S, S); P(p.lt, 0, 0, S, 1); P(sh(p.st, 0.92), 0, 1, S, 1); P(p.dk, 0, 9, S, 1); for (const x of [7, 23]) P(p.dk, x, 2, 1, 7); for (let k = 0; k < 16; k++) P(sh(p.st, 0.62), q(S), 2 + q(7), 2, 1);
      P(sh(p.cloth, 0.72), 0, 10, S, 8); P(p.gold, 0, 10, S, 1); P(sh(p.gold, 0.7), 0, 17, S, 1);
      for (let x = 0; x < S; x += 8) {
        if (s === 'plant') { P(p.ac2, x + 1, 14, 3, 1); P(p.ac2, x + 4, 13, 2, 1); P(p.ac2, x + 5, 15, 2, 1); P(p.gold, x + 7, 14, 1, 1); }
        else if (s === 'water') for (let i = 0; i < 8; i++) P(p.ac2, x + i, 13.5 + Math.sin(i / 8 * TAU) * 1.4, 1, 1);
        else if (s === 'sun') { for (let k = 0; k < 4; k++) { P(p.gold, x + k, 15 - k, 1, 1); P(p.gold, x + 4 + k, 12 + k, 1, 1); } }
        else if (s === 'ice') { P(p.ac2, x + 3, 12, 2, 1); P(p.ac2, x + 2, 13, 4, 2); P(p.ac2, x + 3, 15, 2, 1); }
        else if (s === 'fire') for (const o of [0, 4]) { P(p.ac, x + o + 1, 14, 2, 2); P(p.ac2, x + o + 1, 13, 1, 1); P(p.ac, x + o + 2, 12, 1, 1); }
        else if (s === 'crystal') { P(p.ac, x + 1, 15, 5, 1); P(p.ac, x + 2, 14, 3, 1); P(p.ac2, x + 3, 13, 1, 1); P(p.ac, x + 3, 12, 1, 1); }
        else { P(p.gold, x, 12, 6, 1); P(p.gold, x, 12, 1, 4); P(p.gold, x, 15, 4, 1); P(p.gold, x + 3, 14, 1, 1); P(p.gold, x + 5, 12, 1, 3); }
      } });
    // 2: due stendardi (a sinistra quello con lo stemma, a destra uno più stretto e sfrangiato)
    at(WT(s, 2), () => {
      const drappo = (x0, w, col, edge, stemma, sfr) => { P('#5a3a1e', x0 - 1, 0, w + 2, 1); P(p.gold, x0 - 1, 1, w + 2, 1);
        for (let x = 0; x < w; x++) { const tail = sfr ? 22 + q(8) : 30 - Math.round(Math.abs(x - (w - 1) / 2) < w / 2 ? 5 - Math.abs(x - (w - 1) / 2) * 10 / w : 0), c = x === 0 || x === w - 1 ? edge : x >= w - 3 ? sh(col, 0.8) : col; P(c, x0 + x, 2, 1, Math.max(4, tail - 2)); }
        P(edge, x0, 4, w, 1); if (stemma) { emb(p.emb, x0 + w / 2, 14, edge, '#ffffff'); P(edge, x0 + 1, 22, w - 2, 1); } else { P(edge, x0 + 1, 8, w - 2, 1); P(edge, x0 + 1, 12, w - 2, 1); P(p.gold, x0 + w / 2 - 1, 16, 2, 2); } };
      drappo(2, 12, p.cloth, p.gold, true, false); drappo(19, 10, p.cloth2, sh(p.gold, 0.85), false, true); }, true);
    // 3: quattro riquadri da 16: bassorilievo, nicchia, lume da muro (acceso), stemma di chiave d'arco (acceso)
    at(WT(s, 3), () => {
      P(p.dk, 0, 0, 16, 16); P(p.lt, 1, 1, 14, 14); P(sh(p.st, 0.88), 2, 2, 12, 12); P(sh(p.st, 0.7), 2, 13, 12, 1); P(sh(p.st, 0.7), 13, 2, 1, 12); emb(p.emb, 8, 8, sh(p.st, 0.56), p.lt);
      P(p.dk, 16, 0, 16, 16); P(p.lt, 17, 1, 14, 14); P(p.st, 18, 2, 12, 12); for (let y = 2; y < 14; y++) for (let x = 19; x < 29; x++) if (y >= 7 || Math.hypot(x + 0.5 - 24, y + 0.5 - 7) < 5) P(y > 11 ? '#16121a' : '#0a080e', x, y); P(p.lt, 18, 13, 12, 1); cosa(p.emb, 24, 13, p);
      P('#3a3038', 7, 27, 2, 4); P('#5a4a50', 4, 25, 8, 2); P('#2a2228', 5, 27, 6, 1); disc(p.glow, 8, 21.5, 3); disc('#ffffff', 8, 22, 1.4); P(p.glow, 7, 17, 2, 2); P(p.glow, 8, 16, 1, 1);
      disc(p.dk, 24, 24, 7.6); disc(p.gold, 24, 24, 6.6); disc(sh(p.cloth, 0.8), 24, 24, 5.4); emb(p.emb, 24, 24, p.glow, '#ffffff'); }, true);
    // 4: quel che cresce sui muri, a tutta parete
    at(WT(s, 4), () => {
      if (s === 'plant') { for (let k = 0; k < 4; k++) { let x = 3 + q(26), y = S - 1; const top = q(12); while (y > top) { P('#3a5a24', x, y); if (y % 3 === 0) { const d = R() < 0.5 ? -2 : 1; P(R() < 0.5 ? p.ac : p.ac2, x + d, y, 2, 1); P(p.ac, x + d + (d < 0 ? 0 : 1), y - 1, 1, 1); } y--; if (R() < 0.4) x += R() < 0.5 ? -1 : 1; x = Math.max(1, Math.min(S - 3, x)); } if (R() < 0.6) P('#f0e0a0', x, y, 2, 2); } }
      else if (s === 'water') { for (let k = 0; k < 5; k++) walk(['#8fd0f6', '#58aee8', '#8fd0f6', '#eaf8ff'], 2 + q(28), q(8), 12 + q(18), 0, 1, 0.2); for (let k = 0; k < 5; k++) blob(['#2f7f66', '#3f9a7a', '#2a6a5a'], q(S), 24 + q(8), 1 + q(2)); for (let k = 0; k < 10; k++) P('#e8e0d0', q(S), 14 + q(18), 1, 1); }
      else if (s === 'sun') { for (const x of [5, 15, 25]) for (let y = 3; y < 29; y += 5) { const k = q(5), c = R() < 0.25 ? p.gold : sh(p.dk, 0.9); if (k === 0) { P(c, x - 2, y, 5, 1); P(c, x, y - 1, 1, 3); } else if (k === 1) { P(c, x - 1, y - 1, 3, 3); P(p.st, x, y, 1, 1); } else if (k === 2) { for (let i = 0; i < 5; i++) P(c, x - 2 + i, y - (i % 2), 1, 1); } else if (k === 3) { P(c, x - 1, y - 2, 3, 2); P(c, x, y, 1, 3); P(c, x - 2, y, 5, 1); } else { P(c, x - 2, y, 5, 1); P(c, x - 1, y - 1, 3, 1); P(p.st, x, y, 1, 1); } } }
      else if (s === 'ice') { for (let k = 0; k < 7; k++) { const x = q(S), y = q(S); for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const n = 2 + q(5); for (let i = 0; i < n; i++) P(i < 2 ? '#ffffff' : '#d8ecfa', ((x + a * i) % S + S) % S, ((y + b * i) % S + S) % S); } } for (let k = 0; k < 20; k++) P('#ffffff', q(S), q(S), 1, 1); }
      else if (s === 'fire') { for (let k = 0; k < 4; k++) { let x = 3 + q(26), y = q(6); const n = 14 + q(16); for (let i = 0; i < n && y < S; i++) { P(i % 4 === 1 ? '#fff08a' : i % 3 ? '#ff7a1a' : '#ffb02a', x, y); if (R() < 0.25) P('#c8401a', x + (R() < 0.5 ? -1 : 1), y); y++; if (R() < 0.55) x += R() < 0.5 ? -1 : 1; x = Math.max(0, Math.min(S - 1, x)); } } }
      else if (s === 'crystal') { for (let k = 0; k < 3; k++) walk([p.ac, sh(p.ac, 0.8)], 3 + q(26), q(6), 18 + q(12), 0, 1, 0.6); for (let k = 0; k < 6; k++) { const x = 3 + q(26), y = 3 + q(26); P(p.ac, x, y - 1, 1, 1); P(p.ac, x - 1, y, 3, 1); P(p.ac2, x, y, 1, 1); P(p.ac, x, y + 1, 1, 2); } }
      else { for (let k = 0; k < 3; k++) walk(['#0c0810'], 3 + q(26), q(8), 12 + q(16), 0, 1, 0.6); const web = (cx, cy, sx, sy) => { for (const a of [0.1, 0.5, 0.9, 1.3]) for (let r = 1; r < 12; r++) P('#b8b4c4', cx + sx * Math.cos(a) * r, cy + sy * Math.sin(a) * r); for (const r of [4, 7, 10]) for (let a = 0; a < 1.5; a += 0.12) P('#9a96a8', cx + sx * Math.cos(a) * r, cy + sy * Math.sin(a) * r); }; web(0, 0, 1, 1); if (R() < 0.7) web(S - 1, 0, -1, 1); }
    }, true);
    // 5: quel che pende dall'alto
    at(WT(s, 5), () => {
      if (s === 'plant') { for (let x = 1; x < S; x += 3 + q(3)) { const n = 6 + q(22); let xx = x; for (let y = 0; y < n; y++) { P(y < n * 0.5 ? '#5a3e24' : '#7a5632', Math.max(0, Math.min(S - 1, xx)), y, y < 3 ? 2 : 1, 1); if (R() < 0.3) xx += R() < 0.5 ? -1 : 1; if (y > 4 && R() < 0.12) P(p.ac2, xx + 1, y, 2, 1); } } }
      else if (s === 'water') { for (let x = 0; x < S; x += 2 + q(2)) { const n = 3 + q(14); for (let y = 0; y < n; y++) P(y % 3 ? '#2f7f66' : '#3f9a7a', x, y, y < 2 ? 2 : 1, 1); if (R() < 0.4) P('#bfe9ff', x, n + 1 + q(4), 1, 2); } }
      else if (s === 'sun' || s === 'fire' || s === 'crypt') { const cc = s === 'sun' ? [p.gold, sh(p.gold, 0.7)] : ['#6a6a74', '#3a3a44']; for (const x of s === 'crypt' ? [9, 22] : [5, 16, 27]) { const n = 9 + q(14); for (let y = 0; y < n; y++) P(cc[y % 2], x + (y % 4 < 2 ? 0 : 1), y, 1, 1); if (s === 'sun') { disc(p.gold, x + 0.5, n + 2.5, 2.6); P('#fff6c0', x - 1, n + 1, 1, 1); } else { P(cc[0], x - 1, n, 4, 1); P(cc[0], x - 1, n, 1, 4); P(cc[0], x + 2, n, 1, 4); P(cc[1], x - 1, n + 3, 4, 1); } }
        if (s === 'crypt') { for (const [cx, sx] of [[0, 1], [S - 1, -1]]) { for (const a of [0.15, 0.6, 1.05, 1.45]) for (let r = 1; r < 13; r++) P('#b8b4c4', cx + sx * Math.cos(a) * r, Math.sin(a) * r); for (const r of [4, 8, 11]) for (let a = 0; a < 1.5; a += 0.1) P('#9a96a8', cx + sx * Math.cos(a) * r, Math.sin(a) * r); } } }
      else { const cc = s === 'ice' ? ['#bfe6ff', '#eaf8ff', '#ffffff'] : [p.ac, sh(p.ac, 1.2), p.ac2]; for (let x = 0; x < S; x += 4) { const n = (s === 'ice' ? 6 : 4) + q(s === 'ice' ? 20 : 13); for (let y = 0; y < n; y++) { const w = y < n * 0.45 ? 3 : y < n * 0.8 ? 2 : 1; P(cc[y < 2 ? 2 : (x + y) % 2], x + ((3 - w) >> 1), y, w, 1); } } }
    }, true);
  }
  // ---------- i pavimenti: ognuno ha tre varianti e un medaglione (o una quarta variante), dipinti sopra il pavimento vero ----------
  const crepe = (col, n = 2) => { for (let k = 0; k < n; k++) { walk([col], 4 + q(24), q(10), 12 + q(14), 0, 1, 0.7); if (R() < 0.6) walk([col], 4 + q(24), 8 + q(16), 5 + q(6), R() < 0.5 ? 1 : -1, 0, 0.1); } };
  const sparsi = (cols, n, w = 2, h = 1) => { for (let k = 0; k < n; k++) P(cols[q(cols.length)], q(S - 2), q(S - 2), R() < 0.5 ? w : h, R() < 0.5 ? h : w); };
  const medaglione = s => { const p = PAL[s]; disc(p.dk, 16, 16, 14); disc(p.lt, 16, 16, 13); disc(sh(p.st, 0.8), 16, 16, 11.6); disc(p.gold, 16, 16, 10); disc(sh(p.cloth, 0.75), 16, 16, 8.8); emb(p.emb, 16, 16, p.gold, p.lt); for (let a = 0; a < 8; a++) P(p.dk, 16 + Math.cos(a / 8 * TAU) * 12.3 - 0.5, 16 + Math.sin(a / 8 * TAU) * 12.3 - 0.5, 1, 1); };
  const FV = {
    18: [() => { crepe('#2a3424'); for (let k = 0; k < 5; k++) blob(['#4a8a3a', '#3a6a2a', '#6aa84a'], q(S), q(S), 1 + q(2)); }, () => sparsi(['#c8a83a', '#a87a2a', '#6aa84a', '#d86a2a', '#8a5a1a'], 16), () => { for (let k = 0; k < 3; k++) walk(['#5a3e24', '#7a5632'], q(S), q(S), 10 + q(14), R() < 0.5 ? 1 : -1, R() < 0.5 ? 1 : 0, 0.5); for (let k = 0; k < 3; k++) { const x = 3 + q(26), y = 4 + q(24); P('#e8e0c8', x, y, 1, 2); P('#c83a2a', x - 1, y - 1, 3, 1); } }, () => medaglione('plant')],
    20: [() => { blob(['#6ab8e0', '#5aa8d4', '#7ac4e8'], 15, 16, 8); for (let k = 0; k < 6; k++) P('#cfeaff', 9 + q(13), 11 + q(10), 2 + q(3), 1); }, () => { crepe('#26384a'); for (let k = 0; k < 4; k++) { const x = 3 + q(26), y = 3 + q(26); P('#f0d8c8', x, y, 2, 2); P('#e8a8a0', x, y, 1, 1); } }, () => { for (let k = 0; k < 6; k++) blob(['#2f7f66', '#3f9a7a'], q(S), q(S), 1 + q(2)); sparsi(['#bfe9ff'], 6, 1, 1); }, () => medaglione('water')],
    22: [() => { for (let k = 0; k < 4; k++) blob(['#ecd9a8', '#e0c890', '#f4e4b8'], q(S), q(S), 3 + q(3)); }, () => crepe('#8a6430', 3), () => { sparsi(['#b85a2a', '#8a3a1a', '#c86a3a'], 9, 2, 2); sparsi(['#ffd23f'], 4, 1, 1); }, () => medaglione('sun')],
    24: [() => { for (let k = 0; k < 4; k++) blob(['#f4fbff', '#dcecf8', '#ffffff'], q(S), q(S), 3 + q(3)); }, () => { crepe('#e8f6ff', 3); crepe('#5a6e82', 1); }, () => { for (let k = 0; k < 8; k++) { const x = 2 + q(27), y = 2 + q(27); P('#bfe6ff', x, y, 2, 1); P('#ffffff', x + 1, y - 1, 1, 1); } }, () => medaglione('ice')],
    26: [() => { for (let k = 0; k < 3; k++) walk(['#ff6a1a', '#ffb030', '#ff6a1a', '#c8401a'], 4 + q(24), q(10), 12 + q(16), 0, 1, 0.7); }, () => { for (let k = 0; k < 4; k++) blob(['#1a1010', '#2a1a1a', '#241414'], q(S), q(S), 2 + q(3)); }, () => { sparsi(['#6a5a56', '#3a2e2c', '#7a6a66'], 9, 2, 2); for (let k = 0; k < 3; k++) { const x = 3 + q(24), y = 3 + q(26); P('#d8d0c0', x, y, 4, 1); P('#d8d0c0', x - 1, y - 1, 1, 3); P('#d8d0c0', x + 4, y - 1, 1, 3); } }, () => medaglione('fire')],
    49: [() => crepe('#2a2018', 3), () => { for (let k = 0; k < 6; k++) blob(['#4a8a3a', '#3a6a2a', '#5a9a44'], q(S), q(S), 1 + q(3)); }, () => { for (let k = 0; k < 7; k++) { const x = 3 + q(26), y = 3 + q(26), r = 1 + R() * 1.2; disc(['#7a6a58', '#8a7a68', '#6a5c4c'][q(3)], x, y, r); P('#3e3228', x - 1, y + Math.round(r), 2, 1); } }, () => { for (let k = 0; k < 7; k++) { const x = 3 + q(26), y = 4 + q(25); P('#a070e8', x, y - 2, 1, 1); P('#a070e8', x - 1, y - 1, 3, 2); P('#f0e0ff', x, y - 1, 1, 1); P('#6a40b8', x - 1, y + 1, 3, 1); } }],
    54: [() => { for (let k = 0; k < 5; k++) { const x = 3 + q(26), y = 3 + q(26); P('#f4ece0', x, y, 3, 2); P('#e8a8a0', x, y, 1, 1); P('#a08860', x, y + 2, 3, 1); } }, () => { for (let k = 0; k < 8; k++) { const x = 3 + q(26), y = 3 + q(26); disc(['#8a8690', '#6a6670', '#a8a4ae'][q(3)], x, y, 1 + R()); } }, () => { for (let k = 0; k < 4; k++) walk(['#2f7f46', '#3f9a5a'], q(S), q(S), 8 + q(10), 0, 1, 0.8); }, () => { for (let a = 0; a < 5; a++) for (let r = 0; r < 6; r++) P(r < 2 ? '#f08a3a' : '#e86a2a', 16 + Math.cos(a / 5 * TAU - 1.57) * r, 16 + Math.sin(a / 5 * TAU - 1.57) * r, 2, 2); P('#ffd0a0', 16, 16, 1, 1); for (let x = 0; x < S; x += 2) P('#b89e70', x, 5 + Math.sin(x / S * TAU * 2) * 1.5, 2, 1); }],
    62: [() => crepe('#0c0810', 3), () => { for (let k = 0; k < 3; k++) { const x = 4 + q(22), y = 4 + q(24); P('#d8d0c0', x, y, 4, 1); P('#d8d0c0', x - 1, y - 1, 1, 3); P('#d8d0c0', x + 4, y - 1, 1, 3); } disc('#e8e2d0', 22, 9, 2.4); P('#1a1418', 21, 8, 1, 1); P('#1a1418', 23, 8, 1, 1); }, () => { for (let k = 0; k < 5; k++) blob(['#5a5468', '#6a6478'], q(S), q(S), 1 + q(2)); sparsi(['#e8c24a', '#c89a2a'], 5, 2, 1); }, () => medaglione('crypt')],
  };
  for (const f of FLOORS) FV[f].forEach((fn, k) => at(FT(f, k), () => { base(f); fn(); }));
  return c;
}

// ---------- a chi tocca cosa ----------
const WSET = { 19: 'plant', 21: 'water', 23: 'sun', 25: 'ice', 27: 'fire', 61: 'crypt', 50: 'plant', 53: 'water', 52: 'crystal', 51: 'ice' }, NAT = { 50: 1, 51: 1, 52: 1, 53: 1 };
const DOORISH = t => t === T.DOOR || t === T.EXIT || t === T.STAIR;
// le note di un piano (una volta sola): stile, seme, celle con oggetti, soglie, medaglioni
function note(P) {
  if (P.deco !== undefined) return P.deco;
  const d = P.def, set = d.casa ? null : WSET[d.wall];
  if (!set) return P.deco = null;
  let seed = 7; for (const ch of P.id) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
  const N = { set, nat: !!NAT[d.wall], seed, obj: new Set(), apr: new Set(), med: new Set() }, w = P.w, h = P.h;
  for (const o of P.objs) N.obj.add(o.j * w + o.i);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (DOORISH(P.cell[j * w + i])) for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) { const x = i + a, y = j + b; if (x >= 0 && y >= 0 && x < w && y < h) N.apr.add(y * w + x); }
  // il medaglione: al centro delle sale grandi, se lì il pavimento è libero
  if (!N.nat && FLOORS.includes(d.floor) && d.floor !== 49 && d.floor !== 54) for (let r = 0; r < P.rooms.length; r++) { const m = P.rooms[r]; if (r === P.bossRoom || m.i1 - m.i0 < 4 || m.j1 - m.j0 < 4) continue;
    const ci = (m.i0 + m.i1) >> 1, cj = (m.j0 + m.j1) >> 1, k = cj * w + ci; if (P.cell[k] === T.FLOOR && P.room[k] === r && !N.obj.has(k) && !P.tiles[k]) N.med.add(k); }
  return P.deco = N;
}
const hsh = (N, i, j, s) => { let h = (N.seed ^ Math.imul(i + 11, 73856093) ^ Math.imul(j + 7, 19349663) ^ Math.imul(s + 3, 83492791)) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// una statua su basamento, accostata al muro: nelle sale costruite, davanti a pavimento libero, mai accanto a una porta o al posto di una lesena.
// Si decide sulla pianta com'era all'inizio, così basamento e statua vanno sempre insieme.
const N4 = [[0, -1, 'n', 0], [0, 1, 's', 1], [1, 0, 'e', 2], [-1, 0, 'w', 3]];
function statua(N, P, i, j, q) {
  if (N.nat) return false;
  const w = P.w, c0 = (x, y) => (x >= 0 && y >= 0 && x < w && y < P.h) ? P.cell[y * w + x] : T.ROCK, [a, b, s, si] = q, ns = s === 'n' || s === 's', k = (j + b) * w + i + a;
  if (c0(i + a, j + b) !== T.FLOOR || N.obj.has(k) || N.apr.has(k) || N.med.has(k) || (ns ? i % 3 === 1 : j % 3 === 1)) return false;
  if (ns ? DOORISH(c0(i - 1, j)) || DOORISH(c0(i + 1, j)) : DOORISH(c0(i, j - 1)) || DOORISH(c0(i, j + 1))) return false;
  return hsh(N, i, j, si + 60) < 0.085;
}

// ---------- il pavimento di una cella: 0 = quello di sempre ----------
function floorVar(P, i, j, k) {
  const N = note(P); if (!N) return 0;
  const f = P.def.floor; if (!FLOORS.includes(f) || N.obj.has(k) || (P.room[k] === P.bossRoom && P.bossRoom >= 0)) return 0;
  if (N.med.has(k)) return FT(f, 3);
  const h = hsh(N, i, j, 9), L = f === 49 ? (N.set === 'crystal' ? [0, 3, 2] : N.set === 'plant' ? [0, 1, 2] : [0, 2]) : f === 54 ? [0, 1, 2, 3] : [0, 1, 2];
  return h < 0.2 ? FT(f, L[Math.floor(h / 0.2 * L.length)]) : 0;
}

// ---------- i muri ----------
function walls(P, at, wall) {
  const N = note(P); if (!N) return;
  const D = P.def, LIT = DS.LIT, isSolid = DS.isSolid, isFlat = DS.isFlat, lit = N.set === 'fire' || N.set === 'crystal';
  const push = (p0, p1, p2, p3, tile, u0, v0, u1, v1, L) => { const tx = tile % 8, ty = Math.floor(tile / 8); wall.push(p0[0], p0[1], p0[2], tx, ty, u0, v1, L, p1[0], p1[1], p1[2], tx, ty, u1, v1, L, p2[0], p2[1], p2[2], tx, ty, u1, v0, L, p3[0], p3[1], p3[2], tx, ty, u0, v0, L); };
  // un riquadro sulla faccia «s» della cella (i, j): da c0 a c1 lungo il muro (da sinistra a destra per chi lo guarda), da y0 a y1, staccato di e
  const face = (i, j, s, c0, c1, y0, y1, e, tile, u0, v0, u1, v1, L) => { const x0 = i * CS, z0 = j * CS, x1 = x0 + CS, z1 = z0 + CS, k = L === undefined ? LIT[s] : L;
    if (s === 's') push([x0 + c0, y0, z1 + e], [x0 + c1, y0, z1 + e], [x0 + c1, y1, z1 + e], [x0 + c0, y1, z1 + e], tile, u0, v0, u1, v1, k);
    else if (s === 'n') push([x1 - c0, y0, z0 - e], [x1 - c1, y0, z0 - e], [x1 - c1, y1, z0 - e], [x1 - c0, y1, z0 - e], tile, u0, v0, u1, v1, k);
    else if (s === 'e') push([x1 + e, y0, z1 - c0], [x1 + e, y0, z1 - c1], [x1 + e, y1, z1 - c1], [x1 + e, y1, z1 - c0], tile, u0, v0, u1, v1, k);
    else push([x0 - e, y0, z0 + c0], [x0 - e, y0, z0 + c1], [x0 - e, y1, z0 + c1], [x0 - e, y1, z0 + c0], tile, u0, v0, u1, v1, k); };
  // una scatola che sporge dalla faccia: da c0 a c1, profonda d
  const sporge = (i, j, s, c0, c1, d, y0, y1, tile) => { const x0 = i * CS, z0 = j * CS, x1 = x0 + CS, z1 = z0 + CS;
    if (s === 's') DS.boxTo(wall, x0 + c0, z1, x0 + c1, z1 + d, y0, y1, tile); else if (s === 'n') DS.boxTo(wall, x0 + c0, z0 - d, x0 + c1, z0, y0, y1, tile);
    else if (s === 'e') DS.boxTo(wall, x1, z0 + c0, x1 + d, z0 + c1, y0, y1, tile); else DS.boxTo(wall, x0 - d, z0 + c0, x0, z0 + c1, y0, y1, tile); };
  const E = 0.003, bands = WT(N.set, 1), col = WT(N.set, 0), ban = WT(N.set, 2), pan = WT(N.set, 3), ovA = WT(N.set, 4), ovB = WT(N.set, 5);
  for (let j = 0; j < P.h; j++) for (let i = 0; i < P.w; i++) {
    if (at(i, j) !== T.WALL) continue;
    for (const q of N4) { const [a, b, s, si] = q;
      const n = at(i + a, j + b); if (isSolid(n) || DOORISH(n)) continue;
      const flat = isFlat(n) || n === T.FLOOR, h = hsh(N, i, j, si), ns = s === 'n' || s === 's';
      if (N.nat) {
        // grotte: speroni di roccia, quel che cresce sulla parete, quel che pende dalla volta
        if (flat && h < 0.13) { const c0 = 1.6 + hsh(N, i, j, si + 20) * 2.4, hh = 5 + hsh(N, i, j, si + 30) * 4; sporge(i, j, s, c0, c0 + 4.4, 1.5, 0, hh, D.wall); sporge(i, j, s, c0 + 1, c0 + 3.6, 0.9, hh, hh + 2.5 + hsh(N, i, j, si + 40) * 3, D.wall); }
        else if (h < 0.34) face(i, j, s, 0, CS, 1.2, 11.2, 0.1, ovA, E, E, 1 - E, 1 - E, lit ? 1 : undefined);
        else if (h < 0.5) face(i, j, s, 0, CS, WH - 10, WH, 0.1, ovB, E, E, 1 - E, 1 - E);
        continue;
      }
      // sale costruite: zoccolo in basso, fregio in alto
      if (flat) face(i, j, s, 0, CS, 0, 3.1, 0.08, bands, 0, E, 1, 10 / 32 - E);
      face(i, j, s, 0, CS, 11.4, 13.9, 0.08, bands, 0, 10 / 32 + E, 1, 18 / 32 - E);
      const doorAdj = ns ? DOORISH(at(i - 1, j)) || DOORISH(at(i + 1, j)) : DOORISH(at(i, j - 1)) || DOORISH(at(i, j + 1));
      if (n === T.FLOOR && statua(N, P, i, j, q)) { sporge(i, j, s, 3.2, 6.8, 1.2, 0, 2.3, D.wall); sporge(i, j, s, 2.9, 7.1, 1.4, 2.3, 2.8, col); continue; }   // il basamento: la statua è una figura (vedi clutter)
      if (flat && !doorAdj && (ns ? i % 3 === 1 : j % 3 === 1)) {     // una lesena ogni tre celle
        sporge(i, j, s, 3, 7, 0.9, 0, 1.8, D.wall); sporge(i, j, s, 3.4, 6.6, 0.7, 1.8, 10.2, col); sporge(i, j, s, 3, 7, 0.9, 10.2, 11.4, D.wall);
      } else if (doorAdj || h < 0.09) { const v = doorAdj ? 0 : hsh(N, i, j, si + 50) < 0.5 ? 0 : 1; face(i, j, s, 2.5, 7.5, 1.4, 11.4, 0.22, ban, v * 0.5 + E, E, v * 0.5 + 0.5 - E, 1 - E); }
      else if (h < 0.16) face(i, j, s, 2.5, 7.5, 4.6, 9.6, 0.1, pan, E, E, 0.5 - E, 0.5 - E);
      else if (h < 0.21) face(i, j, s, 2.5, 7.5, 4.6, 9.6, 0.1, pan, 0.5 + E, E, 1 - E, 0.5 - E);
      else if (h < 0.27) face(i, j, s, 2.8, 7.2, 6, 10.4, 0.3, pan, E, 0.5 + E, 0.5 - E, 1 - E, 1);
      else if (h < 0.41) face(i, j, s, 0, CS, 1.2, 11.2, 0.1, ovA, E, E, 1 - E, 1 - E, lit ? 1 : undefined);
      else if (h < 0.52) face(i, j, s, 0, CS, 1.4, 11.4, 0.1, ovB, E, E, 1 - E, 1 - E);
    }
  }
  // sopra ogni porta, sui due lati, lo stemma acceso della chiave d'arco
  if (!N.nat) for (const d of P.doors) { const y0 = DH + 0.15, y1 = DH + 3.35, hw = 1.6, e = CS / 2 + 0.1;
    if (d.axis === 'x') { push([d.cx - hw, y0, d.cz + e], [d.cx + hw, y0, d.cz + e], [d.cx + hw, y1, d.cz + e], [d.cx - hw, y1, d.cz + e], pan, 0.5 + E, 0.5 + E, 1 - E, 1 - E, 1); push([d.cx + hw, y0, d.cz - e], [d.cx - hw, y0, d.cz - e], [d.cx - hw, y1, d.cz - e], [d.cx + hw, y1, d.cz - e], pan, 0.5 + E, 0.5 + E, 1 - E, 1 - E, 1); }
    else { push([d.cx + e, y0, d.cz + hw], [d.cx + e, y0, d.cz - hw], [d.cx + e, y1, d.cz - hw], [d.cx + e, y1, d.cz + hw], pan, 0.5 + E, 0.5 + E, 1 - E, 1 - E, 1); push([d.cx - e, y0, d.cz - hw], [d.cx - e, y0, d.cz + hw], [d.cx - e, y1, d.cz + hw], [d.cx - e, y1, d.cz - hw], pan, 0.5 + E, 0.5 + E, 1 - E, 1 - E, 1); } }
}

// ---------- le cose piccole ai piedi dei muri (figure, senza ingombro) ----------
const Cy = (a, b, r, c, k) => ({ t: 'y', a, b, r, c, k }), El = (o, r, c, k) => ({ t: 'e', o, r, c, k }), Kc = (a, b, r, r2, c, k) => ({ t: 'k', a, b, r, r2, c, k }), Bx = (b, c) => ({ t: 'b', b, c });
const COSE = {
  plant: [() => [Cy([0, 0, 0], [0, 0, 1.6], 0.35, '#e8e0c8'), El([0, 0, 1.9], [1.3, 1.3, 0.7], '#c83a2a'), El([0.5, -0.3, 2.3], [0.25, 0.25, 0.15], '#ffffff'), Cy([1.5, 0.6, 0], [1.5, 0.6, 0.9], 0.25, '#e8e0c8'), El([1.5, 0.6, 1.1], [0.8, 0.8, 0.45], '#d8562a')],
    () => [Kc([0, 0, 0], [1.0, 0, 2.6], 0.5, 0.05, '#3f8a34'), Kc([0, 0, 0], [-1.0, 0.3, 2.3], 0.5, 0.05, '#57a844'), Kc([0, 0, 0], [0.1, -1.0, 2.0], 0.45, 0.05, '#3f8a34'), Kc([0, 0, 0], [-0.2, 1.0, 1.8], 0.45, 0.05, '#6aba4e')],
    () => [El([0, 0, 0.7], [1.6, 1.3, 0.9], '#6a6e62'), El([0.2, 0, 1.25], [1.1, 0.9, 0.45], '#4f8a3c')]],
  water: [() => [El([0, 0, 0.6], [1.2, 1.0, 0.7], '#f0d8c8'), El([0.5, 0, 0.9], [0.6, 0.6, 0.5], '#e8a8a0')],
    () => [Cy([0, 0, 0], [0, 0, 1.8], 0.3, '#e86a7a'), Cy([0, 0, 1.0], [0.9, 0, 2.2], 0.24, '#f08a94'), Cy([0, 0, 0.8], [-0.8, 0.3, 1.9], 0.24, '#e86a7a'), El([0, 0, 0.2], [0.8, 0.8, 0.3], '#5a7a8a')],
    () => [El([0, 0, 0.6], [1.5, 1.2, 0.8], '#4a6a7e'), El([-0.3, 0.2, 1.05], [0.5, 0.4, 0.2], '#9ad0ee')]],
  sun: [() => [El([0, 0, 1.0], [1.2, 1.2, 1.1], '#b8562a'), Cy([0, 0, 1.8], [0, 0, 2.3], 0.6, '#a04a22'), Cy([0, 0, 1.1], [0, 0, 1.3], 1.22, '#e8b830')],
    () => [El([0, 0, 0.4], [1.9, 1.6, 0.6], '#e8d29a'), El([0.4, 0.2, 0.75], [1.0, 0.9, 0.4], '#f4e4b8')],
    () => [Bx([-1.2, -0.2, -0.6, 0.3, 0, 0.5], '#b8562a'), Bx([0.3, 1.1, -0.2, 0.7, 0, 0.35], '#8a3a1a'), Bx([-0.4, 0.4, 0.5, 1.2, 0, 0.7], '#c86a3a'), El([0.9, -0.8, 0.25], [0.3, 0.3, 0.25], '#ffd23f')]],
  ice: [() => [Kc([0, 0, 0], [0.3, 0, 2.8], 0.7, 0.05, '#bfe6ff', 1.15), Kc([-0.8, 0.4, 0], [-1.3, 0.6, 1.7], 0.5, 0.05, '#e6f6ff', 1.15), Kc([0.8, -0.3, 0], [1.3, -0.5, 1.3], 0.45, 0.05, '#9ad0f0', 1.15)],
    () => [El([0, 0, 0.5], [1.9, 1.6, 0.8], '#f4fbff'), El([0.5, 0.3, 0.95], [0.9, 0.8, 0.5], '#ffffff')],
    () => [El([0, 0, 0.7], [1.5, 1.2, 0.9], '#8aa8c4'), El([0, 0, 1.3], [1.2, 1.0, 0.4], '#f4fbff')]],
  fire: [() => [El([0, 0, 0.7], [1.5, 1.3, 0.9], '#3a2a2a'), El([0.3, 0, 1.1], [0.6, 0.5, 0.3], '#ff7a2a', 1.5), El([-0.6, 0.4, 0.7], [0.3, 0.3, 0.2], '#ffc040', 1.6)],
    () => [Kc([0, 0, 0], [0, 0, 3], 0.9, 0.1, '#4a3632'), Kc([0.9, 0.4, 0], [1.0, 0.5, 1.6], 0.55, 0.08, '#3a2a28')],
    () => [El([0, 0, 0.8], [0.95, 0.9, 0.8], '#e0d8c4'), Bx([0.7, 1.0, -0.6, -0.2, 0.8, 1.2], '#1a1418'), Bx([0.7, 1.0, 0.2, 0.6, 0.8, 1.2], '#1a1418'), Bx([-1.6, 1.4, -1.5, -1.1, 0, 0.4], '#d8d0c0')]],
  crystal: [() => [Kc([0, 0, 0], [0.2, 0, 3.2], 0.75, 0.05, '#a070e8', 1.3), Kc([-0.7, 0.5, 0], [-1.4, 0.8, 1.9], 0.5, 0.05, '#c8a0ff', 1.3), Kc([0.7, -0.4, 0], [1.3, -0.6, 1.5], 0.45, 0.05, '#8050c8', 1.3)],
    () => [El([0, 0, 0.7], [1.5, 1.2, 0.9], '#4a4258'), El([0.3, 0, 1.0], [0.8, 0.7, 0.5], '#c8a0ff', 1.3)],
    () => [El([0, 0, 0.4], [1.0, 0.8, 0.5], '#5a5068'), El([1.2, 0.5, 0.3], [0.6, 0.5, 0.35], '#6a6080')]],
  crypt: [() => [El([0, 0, 0.9], [1.0, 0.95, 0.9], '#e8e2d0'), Bx([0.75, 1.05, -0.6, -0.2, 0.9, 1.3], '#1a1418'), Bx([0.75, 1.05, 0.2, 0.6, 0.9, 1.3], '#1a1418'), Bx([0.6, 0.95, -0.4, 0.4, 0.1, 0.4], '#c8c0ac')],
    () => [Cy([0, 0, 0], [0, 0, 0.2], 0.7, '#5a4a3a'), Cy([0, 0, 0.2], [0, 0, 1.5], 0.33, '#e8dcc0'), El([0, 0, 1.9], [0.24, 0.24, 0.45], '#ffd86a', 1.8)],
    () => [El([0, 0, 1.0], [1.0, 1.0, 1.1], '#5a4a6a'), Cy([0, 0, 1.9], [0, 0, 2.3], 0.5, '#c89a2a'), Cy([0, 0, 0], [0, 0, 0.3], 0.7, '#3a2e44')]],
};
// le figure che servono a una famiglia di piani (lo stile del santuario e quello delle sue cripte)
function sprites(ids, atlas) {
  const out = {};
  for (const id of ids) { const d = DS.DEF[id], set = d && !d.casa ? WSET[d.wall] : null; if (set && !out[set]) out[set] = COSE[set].map((f, k) => atlas.add(A.fit(f(), 0.6 + k * 0.9))); }
  return out;
}
// dove stanno, in un piano: nelle celle di pavimento libere accostate a un muro, mai sulle soglie
function clutter(P) {
  const N = note(P), out = []; if (!N) return out;
  const w = P.w, at = (i, j) => (i >= 0 && j >= 0 && i < w && j < P.h) ? P.cell[j * w + i] : T.ROCK, solid = t => t === T.WALL || t === T.ROCK || t === T.CRACK;
  for (let j = 0; j < P.h; j++) for (let i = 0; i < w; i++) { const k = j * w + i; if (at(i, j) !== T.FLOOR || N.obj.has(k) || N.apr.has(k) || N.med.has(k)) continue;
    const wx = (solid(at(i + 1, j)) ? 1 : 0) - (solid(at(i - 1, j)) ? 1 : 0), wz = (solid(at(i, j + 1)) ? 1 : 0) - (solid(at(i, j - 1)) ? 1 : 0); if (!wx && !wz) continue;
    const h = hsh(N, i, j, 70); if (h > (wx && wz ? 0.5 : 0.2)) continue;
    const t = (hsh(N, i, j, 71) - 0.5) * 6;
    out.push({ x: (i + 0.5) * CS + (wx ? wx * 3.3 : t), z: (j + 0.5) * CS + (wz ? wz * 3.3 : t), set: N.set, k: Math.floor(hsh(N, i, j, 72) * 3) }); }
  // le statue sui basamenti: guardano la sala
  for (let j = 0; j < P.h; j++) for (let i = 0; i < w; i++) if (at(i, j) === T.WALL) for (const q of N4) if (statua(N, P, i, j, q)) { const [a, b] = q; out.push({ x: (i + 0.5 + a * 0.57) * CS, z: (j + 0.5 + b * 0.57) * CS, st: 1, yaw: Math.atan2(b, a) }); }
  return out;
}
SG.decor = { tilesOn, floorVar, walls, sprites, clutter, note };
})();
