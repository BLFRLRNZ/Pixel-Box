// ===================== PIXEL SAGA · città, castelli, ponti =====================
// Il kit di architettura (mura, torri, tetti, cupole, archi, navi), le texture dei nuovi edifici e il
// «geometra» che da poche righe (dove, quanto grande, che stile) disegna una città intera: mura con le
// porte, strade, piazza, isolati di case, botteghe, lampioni e abitanti. Tutto allineato agli assi.
(() => {
const W = SG.world, K = W.kit, { quad, walls, box, boxTop, gable, onWall, prism } = K, T8 = 8, TAU = Math.PI * 2;
// riquadri della texture (righe 8-15)
const TL = { MERL: 64, MERL_SAND: 65, MERL_DARK: 66, MERL_GREY: 67, ARCH_L: 68, ARCH_R: 69, DARK: 70, GATE_L: 71, GATE_R: 72, PORTC: 73, GLASS: 74, ROSE: 75,
  ROOF_BLUE: 76, ROOF_GREEN: 77, ROOF_ORANGE: 78, ROOF_DARK: 79, ROOF_SNOW: 80, ROOF_PURPLE: 81, WHITE: 82, OCHRE: 83, PINK: 84, ADOBE: 85, TIMBER2: 86, LOGS: 87,
  PAVING: 88, PLANKS: 89, HULL: 90, SAIL: 91, DOOR_BIG: 92, DOOR_BLUE: 93, DOOR_RED: 94, WIN_ARCH: 95, WIN_ROUND: 96, WIN_LATTICE: 97, WIN_PAPER: 98,
  AWN_BLUE: 99, AWN_GREEN: 100, AWN_YELLOW: 101, BAN_RED: 102, BAN_BLUE: 103, ARCADE: 104, TURQ: 105, GOLD: 106, IVY: 107, CLOCK: 108, STEPS: 109,
  DARKSTONE: 110, RUNEWIN: 111, CLOTH: 112, HAY: 113, CRATE: 114, WATER: 115, CREST: 116, BAN_PURPLE: 117, SHOJI: 118, ROOF_PINK: 119 };

// ---------- texture ----------
function tilesOn(c, R) {
  const T = 32, g = c.getContext('2d'), sh = SG.art.shade;
  const at = (i, fn) => { g.save(); g.translate((i % 8) * T, Math.floor(i / 8) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); g.clearRect(0, 0, T, T); fn(); g.restore(); };
  const P = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const fill = (col, n = 60, v = 0.14) => { P(col, 0, 0, T, T); for (let k = 0; k < n; k++) P(sh(col, 1 + (R() - 0.5) * v), R() * T | 0, R() * T | 0, 1 + (R() < 0.3), 1); };
  const bricks = (col, mortar, bw = 16, bh = 8) => { P(mortar, 0, 0, T, T); for (let y = 0; y < T; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0; for (let x = -bw; x < T; x += bw) { P(sh(col, 0.88 + R() * 0.24), x + off + 1, y + 1, bw - 1, bh - 1); P(sh(col, 1.12), x + off + 1, y + 1, bw - 1, 1); } } };
  const cut = fn => { g.globalCompositeOperation = 'destination-out'; fn(); g.globalCompositeOperation = 'source-over'; };
  const disc = (col, cx, cy, r) => { g.fillStyle = col; for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 < r * r) g.fillRect(x, y, 1, 1); };
  const roof = col => { P(sh(col, 0.6), 0, 0, T, T); for (let y = 0; y < T; y += 8) for (let x = ((y / 8) % 2) * 4 - 8; x < T; x += 8) { P(sh(col, 0.9 + R() * 0.2), x, y, 7, 7); P(sh(col, 1.2), x, y + 6, 7, 1); P(sh(col, 0.7), x + 6, y, 1, 7); } };
  // merli: metà alta del riquadro, con i vuoti trasparenti
  const merl = (col, mortar) => { bricks(col, mortar); cut(() => { g.fillRect(0, 16, T, 16); g.fillRect(10, 0, 6, 10); g.fillRect(26, 0, 6, 10); }); P(sh(col, 1.18), 0, 0, 10, 1); P(sh(col, 1.18), 16, 0, 10, 1); P(sh(col, 0.7), 0, 15, T, 1); };
  at(TL.MERL, () => merl('#b8b4a8', '#7a7670')); at(TL.MERL_SAND, () => merl('#d8b878', '#9a7a48')); at(TL.MERL_DARK, () => merl('#4c4458', '#241e2c')); at(TL.MERL_GREY, () => merl('#8a8c96', '#4a4a54'));
  // archi dei ponti: pietra con un quarto di cerchio scuro; porte delle mura: lo stesso, ma vuoto
  const arch = (cx, hole) => { bricks('#a8a498', '#6e6a64'); for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - T); if (d < 27) { if (hole) g.clearRect(x, y, 1, 1); else P(d > 24 ? '#2a3046' : '#141a2a', x, y, 1, 1); } else if (d < 31) P((Math.floor(Math.atan2(T - y, Math.abs(x - cx) + 0.01) * 5) % 2) ? '#c8c4b8' : '#b4b0a4', x, y, 1, 1); } };
  at(TL.ARCH_L, () => arch(T)); at(TL.ARCH_R, () => arch(0)); at(TL.DARK, () => { P('#141a2a', 0, 0, T, T); P('#1c2438', 0, 26, T, 6); });
  at(TL.GATE_L, () => arch(T, 1)); at(TL.GATE_R, () => arch(0, 1));
  at(TL.PORTC, () => { for (let x = 3; x < T; x += 7) { P('#3a3c48', x, 0, 2, 18); P('#5a5c68', x, 0, 1, 18); P('#3a3c48', x, 18, 2, 3); P('#3a3c48', x, 21, 1, 2); } for (const y of [4, 12]) { P('#3a3c48', 0, y, T, 2); P('#5a5c68', 0, y, T, 1); } });
  at(TL.GLASS, () => {
    bricks('#b8b4a8', '#7a7670'); const C = ['#e8364e', '#3a7ad8', '#ffc83a', '#3aa860', '#b060d8', '#5ad0e8'];
    for (let y = 3; y < 30; y++) for (let x = 8; x < 24; x++) { const top = y < 11 ? Math.abs(x + 0.5 - 16) < (y - 2) * 0.95 : true; if (!top) continue; const lead = (x - 8) % 5 === 0 || y % 6 === 2 || x === 23; P(lead ? '#1e1a2a' : C[(Math.floor((x - 8) / 5) * 3 + Math.floor(y / 6) * 2) % 6], x, y, 1, 1); }
    P('#8a867a', 7, 30, 18, 2);
  });
  at(TL.ROSE, () => { const C = ['#e8364e', '#3a7ad8', '#ffc83a', '#3aa860']; disc('#8a867a', 16, 16, 15.5); for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) { const dx = x + 0.5 - 16, dy = y + 0.5 - 16, d = Math.hypot(dx, dy); if (d < 13) { const s = Math.floor((Math.atan2(dy, dx) + Math.PI) / TAU * 8), lead = d > 12 || (d > 4.2 && d < 5.2) || Math.abs(((Math.atan2(dy, dx) + Math.PI) / TAU * 8) % 1 - 0.5) > 0.42; P(lead ? '#1e1a2a' : d < 4.2 ? '#ffc83a' : C[s % 4], x, y, 1, 1); } } });
  at(TL.ROOF_BLUE, () => roof('#3a5ab8')); at(TL.ROOF_GREEN, () => roof('#3a9a7a')); at(TL.ROOF_ORANGE, () => roof('#d8743a')); at(TL.ROOF_DARK, () => roof('#5a3e2a')); at(TL.ROOF_SNOW, () => { roof('#c8d8ec'); for (let k = 0; k < 30; k++) P('#ffffff', R() * T | 0, R() * T | 0, 3, 1); }); at(TL.ROOF_PURPLE, () => roof('#5a3a8a')); at(TL.ROOF_PINK, () => roof('#c85a7a'));
  const plaster = col => { fill(col, 90, 0.1); P('rgba(60,40,30,.16)', 0, T - 4, T, 4); };
  at(TL.WHITE, () => plaster('#f0ece0')); at(TL.OCHRE, () => plaster('#e8c070')); at(TL.PINK, () => plaster('#f0b8a8')); at(TL.ADOBE, () => { fill('#dcb478', 110, 0.14); P('rgba(110,70,30,.2)', 0, T - 3, T, 3); for (let k = 0; k < 5; k++) P('#c49a5e', R() * 28 | 0, R() * 28 | 0, 4, 1); });
  at(TL.TIMBER2, () => { fill('#f0e8d4', 60, 0.1); const w = '#4a2e1c'; P(w, 0, 0, T, 3); P(w, 0, T - 3, T, 3); P(w, 0, 0, 3, T); P(w, T - 3, 0, 3, T); P(w, 14, 0, 3, T); P(w, 0, 14, T, 3); for (let i = 3; i < 14; i++) { P(w, i, i, 2, 2); P(w, T - 2 - i, i, 2, 2); } });
  at(TL.LOGS, () => { for (let y = 0; y < T; y += 8) { P(sh('#7a5230', 0.9 + R() * 0.2), 0, y, T, 8); P('#9a6e44', 0, y + 1, T, 1); P('#3e2816', 0, y + 7, T, 1); for (let k = 0; k < 4; k++) P('#5a3a20', R() * T | 0, y + 3 + (R() * 3 | 0), 3, 1); } });
  at(TL.PAVING, () => { P('#5a5852', 0, 0, T, T); for (let y = 0; y < T; y += 8) for (let x = ((y / 8) % 2) * 4 - 8; x < T; x += 8) { P(sh('#9a9890', 0.88 + R() * 0.22), x + 1, y + 1, 7, 7); P('#b4b2aa', x + 1, y + 1, 7, 1); } });
  at(TL.PLANKS, () => { for (let y = 0; y < T; y += 8) { P(sh('#9a6e3e', 0.86 + R() * 0.28), 0, y, T, 8); P('#4a2e1a', 0, y, T, 1); for (let k = 0; k < 3; k++) P('#7a5230', R() * T | 0, y + 3 + (R() * 3 | 0), 4, 1); P('#3a2416', (y * 5 + 3) % T, y + 2, 1, 5); } });
  at(TL.HULL, () => { for (let y = 0; y < T; y += 6) { P(sh('#6a4424', 0.86 + R() * 0.26), 0, y, T, 6); P('#3a2416', 0, y, T, 1); } P('#c8342c', 0, 4, T, 4); P('#ffd23f', 0, 8, T, 1); });
  at(TL.SAIL, () => { fill('#f0e8d0', 40, 0.06); for (let y = 7; y < T; y += 8) P('#d0c4a4', 0, y, T, 1); P('#c8342c', 12, 10, 8, 12); P('#f0e8d0', 14, 12, 4, 8); });
  at(TL.DOOR_BIG, () => { bricks('#b8b4a8', '#7a7670'); for (let y = 2; y < T; y++) for (let x = 3; x < 29; x++) { if (y < 12 && Math.hypot(x + 0.5 - 16, y + 0.5 - 14) > 13) continue; P(x === 15 || x === 16 ? '#2a1a10' : (x % 4 === 3 ? '#4a2e1a' : sh('#7a4e2a', 0.9 + ((x * 7 + y) % 5) * 0.04)), x, y, 1, 1); } for (const y of [10, 20, 28]) { P('#5a5a66', 4, y, 24, 2); P('#8a8a96', 4, y, 24, 1); } P('#ffd23f', 12, 18, 2, 3); P('#ffd23f', 18, 18, 2, 3); });
  const adoor = (col, hi) => { for (let y = 2; y < T; y++) for (let x = 6; x < 26; x++) { if (y < 12 && Math.hypot(x + 0.5 - 16, y + 0.5 - 12) > 10) continue; const edge = x === 6 || x === 25 || (y < 12 && Math.hypot(x + 0.5 - 16, y + 0.5 - 12) > 8.6); P(edge ? sh(col, 0.5) : (x % 5 === 0 ? sh(col, 0.75) : col), x, y, 1, 1); } P(hi, 20, 18, 2, 2); };
  at(TL.DOOR_BLUE, () => { adoor('#2a6ab0', '#ffd23f'); P('#5a9ad8', 9, 14, 5, 6); P('#5a9ad8', 17, 14, 5, 6); }); at(TL.DOOR_RED, () => { adoor('#b8342c', '#ffd23f'); });
  at(TL.WIN_ARCH, () => { for (let y = 3; y < 28; y++) for (let x = 8; x < 24; x++) { const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 11); if (y < 11 && d > 8) continue; const fr = x < 10 || x > 21 || y > 25 || (y < 11 && d > 6) || x === 15 || x === 16 || y === 17; P(fr ? '#8a867a' : y < 14 ? '#5a8ad8' : '#3a6ab8', x, y, 1, 1); } P('#bfe0ff', 11, 8, 2, 3); P('#6e6a64', 7, 28, 18, 2); });
  at(TL.WIN_ROUND, () => { disc('#8a867a', 16, 16, 9); disc('#3a6ab8', 16, 16, 6.5); disc('#5a8ad8', 16, 14, 4); P('#8a867a', 15, 9, 2, 14); P('#8a867a', 9, 15, 14, 2); });
  at(TL.WIN_LATTICE, () => { for (let y = 3; y < 28; y++) for (let x = 8; x < 24; x++) { const d = Math.hypot(x + 0.5 - 16, y + 0.5 - 11); if (y < 11 && d > 8) continue; const fr = x < 10 || x > 21 || y > 25 || (y < 11 && d > 6); P(fr ? '#8a5a30' : ((x + y) % 4 === 0 || (x - y + 40) % 4 === 0) ? '#6a4424' : '#3a6ab8', x, y, 1, 1); } });
  at(TL.WIN_PAPER, () => { P('#4a2e1c', 6, 5, 20, 22); P('#5a8ad8', 8, 7, 16, 18); P('#3a6ab8', 8, 16, 16, 9); P('#4a2e1c', 15, 7, 2, 18); P('#4a2e1c', 8, 15, 16, 2); P('#bfe0ff', 9, 8, 2, 3); P('#c8342c', 5, 27, 22, 2); });
  const awn = (a, b) => { for (let x = 0; x < T; x += 4) P((x / 4) % 2 ? a : b, x, 0, 4, T); P('rgba(0,0,0,.25)', 0, T - 3, T, 3); };
  at(TL.AWN_BLUE, () => awn('#f0ece0', '#2a6ab0')); at(TL.AWN_GREEN, () => awn('#f0ece0', '#3a8a4a')); at(TL.AWN_YELLOW, () => awn('#e8a02a', '#f8e0a0'));
  const ban = (col, emb) => { P(col, 6, 0, 20, 26); P(sh(col, 0.75), 6, 0, 2, 26); P(sh(col, 1.2), 24, 0, 2, 26); for (let i = 0; i < 6; i++) { P(col, 6, 26 + i, 10 - i, 1); P(col, 16 + i, 26 + i, 10 - i, 1); } P('#ffd23f', 6, 0, 20, 2); disc(emb, 16, 12, 5); disc(col, 16, 12, 2.6); for (const [x, y] of [[16, 5], [16, 19], [9, 12], [23, 12]]) P(emb, x - 1, y - 1, 2, 2); };
  at(TL.BAN_RED, () => ban('#c8342c', '#ffd23f')); at(TL.BAN_BLUE, () => ban('#2a5ab0', '#f0ece0')); at(TL.BAN_PURPLE, () => ban('#5a2a7a', '#c8a0ff'));
  at(TL.ARCADE, () => { bricks('#d8d0bc', '#9a927e'); cut(() => { for (let y = 8; y < T; y++) for (let x = 5; x < 27; x++) if (y > 18 || Math.hypot(x + 0.5 - 16, y + 0.5 - 19) < 11) g.fillRect(x, y, 1, 1); }); P('#f0e8d4', 2, 28, 4, 4); P('#f0e8d4', 26, 28, 4, 4); });
  at(TL.TURQ, () => { P('#1e8a8a', 0, 0, T, T); for (let y = 0; y < T; y += 4) for (let x = (y / 4 % 2) * 2; x < T; x += 4) P(sh('#3ac8c0', 0.85 + R() * 0.3), x, y, 3, 3); });
  at(TL.GOLD, () => { fill('#e8b42a', 80, 0.3); for (let k = 0; k < 14; k++) P('#fff0a0', R() * T | 0, R() * T | 0, 2, 1); });
  at(TL.IVY, () => { for (let k = 0; k < 150; k++) { const x = R() * T, y = R() * T * (0.5 + 0.5 * Math.abs(Math.sin(x * 0.4))); P(R() < 0.5 ? '#2e6a2a' : R() < 0.5 ? '#3e8a34' : '#5aa844', x | 0, y | 0, 2, 2); } });
  at(TL.CLOCK, () => { disc('#5a3e2a', 16, 16, 14); disc('#f0ece0', 16, 16, 11.5); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P('#2a1a10', Math.round(16 + Math.cos(a) * 9.5 - 0.5), Math.round(16 + Math.sin(a) * 9.5 - 0.5), k % 3 ? 1 : 2, k % 3 ? 1 : 2); } P('#2a1a10', 15, 8, 2, 9); P('#2a1a10', 15, 15, 7, 2); P('#c8342c', 15, 15, 2, 2); });
  at(TL.STEPS, () => { for (let y = 0; y < T; y += 8) { P(sh('#b0aca0', 0.92 + R() * 0.12), 0, y, T, 8); P('#d0ccc0', 0, y, T, 2); P('#6e6a64', 0, y + 7, T, 1); } });
  at(TL.DARKSTONE, () => bricks('#4c4458', '#1e1826')); at(TL.RUNEWIN, () => { P('#1a1420', 11, 4, 10, 24); P('#b060ff', 13, 6, 6, 20); P('#e8c8ff', 15, 8, 2, 14); });
  at(TL.CLOTH, () => { fill('#b8342c', 30, 0.1); P('#ffd23f', 0, 0, T, 2); P('#ffd23f', 0, T - 2, T, 2); for (let x = 6; x < T; x += 10) { P('#ffd23f', x, 13, 4, 4); P('#b8342c', x + 1, 14, 2, 2); } });
  at(TL.HAY, () => { fill('#d8b44a', 0); for (let k = 0; k < 170; k++) P(R() < 0.5 ? '#b89234' : '#f0d470', R() * T | 0, R() * T | 0, 3 + (R() * 3 | 0), 1); });
  at(TL.CRATE, () => { P('#8a5e34', 0, 0, T, T); for (let x = 0; x < T; x += 8) P('#6a4424', x, 0, 1, T); P('#4a2e1a', 0, 0, T, 3); P('#4a2e1a', 0, T - 3, T, 3); P('#4a2e1a', 0, 0, 3, T); P('#4a2e1a', T - 3, 0, 3, T); for (let i = 3; i < T - 3; i++) P('#5a3a20', i, i, 2, 2); });
  at(TL.WATER, () => { fill('#3a9ad8', 0); for (let k = 0; k < 26; k++) P(R() < 0.5 ? '#7ac8f0' : '#e0f4ff', R() * T | 0, R() * T | 0, 3 + (R() * 3 | 0), 1); });
  at(TL.CREST, () => { for (let y = 3; y < 29; y++) for (let x = 5; x < 27; x++) { const hw = y < 16 ? 11 : 11 - (y - 16) * 0.85; if (Math.abs(x + 0.5 - 16) > hw) continue; const ed = Math.abs(x + 0.5 - 16) > hw - 1.6 || y < 5; P(ed ? '#ffd23f' : x < 16 ? '#c8342c' : '#2a5ab0', x, y, 1, 1); } disc('#ffd23f', 16, 13, 4); disc('#fff4b0', 16, 13, 2); });
  at(TL.SHOJI, () => { P('#4a2e1c', 4, 3, 24, 26); P('#f8f0dc', 6, 5, 20, 22); for (let x = 12; x < 26; x += 7) P('#4a2e1c', x, 5, 1, 22); for (let y = 12; y < 27; y += 7) P('#4a2e1c', 6, y, 20, 1); P('#3a6ab8', 6, 5, 6, 7); });
  return c;
}

// ---------- kit: pezzi nuovi ----------
const g0 = (g, x0, z0, x1, z1) => Math.min(g(x0, z0), g(x1, z0), g(x0, z1), g(x1, z1), g((x0 + x1) / 2, (z0 + z1) / 2));
// striscia di merli lungo un bordo (un solo riquadro per lato, con i vuoti trasparenti)
function merl(x0, z0, x1, z1, y, tile) { const L = Math.hypot(x1 - x0, z1 - z0); quad([x0, y, z0], [x1, y, z1], [x1, y + 4, z1], [x0, y + 4, z0], tile, Math.max(1, Math.round(L / 8)), 0.5); }
function merlBox(x0, z0, x1, z1, y, tile) { merl(x0, z1, x1, z1, y, tile); merl(x1, z0, x0, z0, y, tile); merl(x1, z1, x1, z0, y, tile); merl(x0, z0, x0, z1, y, tile); }
// tratto di mura: un parallelepipedo con il cammino di ronda e i merli sui due bordi lunghi
function wallSeg(x0, z0, x1, z1, yb, yt, tile, mt, b) {
  box(x0, z0, x1, z1, yb, yt, tile, TL.PAVING);
  if (x1 - x0 > z1 - z0) { merl(x0, z1, x1, z1, yt, mt); merl(x1, z0, x0, z0, yt, mt); } else { merl(x1, z1, x1, z0, yt, mt); merl(x0, z0, x0, z1, yt, mt); }
  W.addBox(x0, z0, x1, z1, yt, b);
}
// fusto a otto facce, con le facce (non gli spigoli) rivolte ai punti cardinali: comodo per porte, finestre e stendardi
function oct(cx, cz, r, y0, y1, tile) { for (let k = 0; k < 8; k++) { const a0 = (k - 0.5) / 8 * TAU, a1 = (k + 0.5) / 8 * TAU; quad([cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], tile, Math.max(1, Math.round(TAU * r / 8 / 8)), (y1 - y0) / 8); } }
// riquadro sulla faccia k (0 = est, 2 = sud, 4 = ovest, 6 = nord) di un fusto a otto facce
function faceDecal(cx, cz, r, k, y, w, h, tile, glow) { const a = k / 8 * TAU, ca = Math.cos(a), sa = Math.sin(a); decal(cx + ca * r * 0.924, y, cz + sa * r * 0.924, sa, -ca, w, h, tile, glow, 0.2); }
// tetto a punta sopra una torre (cono a 8 facce) o a piramide sopra una torre quadra
function cone(cx, cz, r, y, h, tile, sides = 8) { for (let k = 0; k < sides; k++) { const a0 = (k - 0.5) / sides * TAU, a1 = (k + 0.5) / sides * TAU; quad([cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r], [cx, y + h, cz], [cx, y + h, cz], tile, Math.max(1, Math.round(r * 0.78 / 4) / 2), Math.max(1, Math.round(Math.hypot(h, r) / 8))); } }
function pyramid(x0, z0, x1, z1, y, h, tile, o = 1.2) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, t = [cx, y + h, cz], a = [x0 - o, y, z0 - o], b = [x1 + o, y, z0 - o], c = [x1 + o, y, z1 + o], d = [x0 - o, y, z1 + o], u = (x1 - x0) / 8, v = Math.hypot(h, (z1 - z0) / 2) / 8; quad(d, c, t, t, tile, u, v); quad(b, a, t, t, tile, u, v); quad(c, b, t, t, tile, u, v); quad(a, d, t, t, tile, u, v); }
// tetto a padiglione: quattro falde, colmo lungo il lato più lungo
function hip(x0, z0, x1, z1, y, rh, tile, o = 1.6) {
  const X = (x1 - x0) >= (z1 - z0), xa = x0 - o, xb = x1 + o, za = z0 - o, zb = z1 + o, yb = y - 0.8, yt = y + rh;
  if (X) { const zm = (z0 + z1) / 2, in2 = (z1 - z0) / 2 + o, sl = Math.hypot(in2, rh) / 8; let ra = xa + in2, rb = xb - in2; if (ra > rb) ra = rb = (xa + xb) / 2;
    quad([xa, yb, zb], [xb, yb, zb], [rb, yt, zm], [ra, yt, zm], tile, (xb - xa) / 8, sl); quad([xb, yb, za], [xa, yb, za], [ra, yt, zm], [rb, yt, zm], tile, (xb - xa) / 8, sl);
    quad([xb, yb, zb], [xb, yb, za], [rb, yt, zm], [rb, yt, zm], tile, (zb - za) / 8, sl); quad([xa, yb, za], [xa, yb, zb], [ra, yt, zm], [ra, yt, zm], tile, (zb - za) / 8, sl);
  } else { const xm = (x0 + x1) / 2, in2 = (x1 - x0) / 2 + o, sl = Math.hypot(in2, rh) / 8; let ra = za + in2, rb = zb - in2; if (ra > rb) ra = rb = (za + zb) / 2;
    quad([xb, yb, zb], [xb, yb, za], [xm, yt, ra], [xm, yt, rb], tile, (zb - za) / 8, sl); quad([xa, yb, za], [xa, yb, zb], [xm, yt, rb], [xm, yt, ra], tile, (zb - za) / 8, sl);
    quad([xa, yb, zb], [xb, yb, zb], [xm, yt, rb], [xm, yt, rb], tile, (xb - xa) / 8, sl); quad([xb, yb, za], [xa, yb, za], [xm, yt, ra], [xm, yt, ra], tile, (xb - xa) / 8, sl); }
}
// cupola a spicchi (tre anelli) con un pinnacolo
function dome(cx, cz, r, y, tile, tip = TL.GOLD, sides = 8) {
  const ring = [[1, 0], [0.86, 0.5], [0.52, 0.86], [0.001, 1]];
  for (let q = 0; q < 3; q++) for (let k = 0; k < sides; k++) { const a0 = k / sides * TAU, a1 = (k + 1) / sides * TAU, [r0, h0] = ring[q], [r1, h1] = ring[q + 1];
    quad([cx + Math.cos(a1) * r * r0, y + r * h0, cz + Math.sin(a1) * r * r0], [cx + Math.cos(a0) * r * r0, y + r * h0, cz + Math.sin(a0) * r * r0], [cx + Math.cos(a0) * r * r1, y + r * h1, cz + Math.sin(a0) * r * r1], [cx + Math.cos(a1) * r * r1, y + r * h1, cz + Math.sin(a1) * r * r1], tile, Math.max(1, Math.round(r * r0 * 0.78 / 4) / 2 || 1), 1); }
  box(cx - 0.4, cz - 0.4, cx + 0.4, cz + 0.4, y + r, y + r + 3, tip);
}
// torre tonda: fusto, corona sporgente con i merli oppure tetto a punta; qualche feritoia
function tower(cx, cz, r, yb, yt, tile, o = {}) {
  oct(cx, cz, r, yb, yt, tile); oct(cx, cz, r + 1.2, yt - 3, yt, tile);
  if (o.roof) { cone(cx, cz, r + 2.6, yt - 0.2, o.rh || r * 1.9, o.roof); if (o.flag) W.flags.push([cx, yt + (o.rh || r * 1.9), cz, o.flag]); }
  else { const R2 = r + 1.2; for (let k = 0; k < 8; k++) { const a0 = (k - 0.5) / 8 * TAU, a1 = (k + 0.5) / 8 * TAU; merl(cx + Math.cos(a1) * R2, cz + Math.sin(a1) * R2, cx + Math.cos(a0) * R2, cz + Math.sin(a0) * R2, yt, o.merl || TL.MERL); }
    const tp = []; for (let k = 0; k < 8; k++) tp.push([cx + Math.cos((k - 0.5) / 8 * TAU) * R2, yt - 0.1, cz + Math.sin((k - 0.5) / 8 * TAU) * R2]); for (let k = 1; k < 7; k += 2) quad(tp[0], tp[k], tp[k + 1], tp[(k + 2) % 8], TL.PAVING, 1, 1, 0.8); }
  if (o.win) for (const k of [0, 2, 4, 6]) faceDecal(cx, cz, r, k, yt - 15, 3.2, 7, o.win, true);
  if (!o.free) W.addBox(cx - r * 0.86, cz - r * 0.86, cx + r * 0.86, cz + r * 0.86, yt, o.b);
}
// decalcomania su un piano qualsiasi (centro in basso p, direzione u lungo il muro)
function decal(px, py, pz, ux, uz, w, h, tile, glow, e = 0.2) {
  const nx = -uz, nz = ux, n0 = W.mesh.length, ax = px + nx * e - ux * w / 2, az = pz + nz * e - uz * w / 2, bx = px + nx * e + ux * w / 2, bz = pz + nz * e + uz * w / 2;
  quad([ax, py, az], [bx, py, bz], [bx, py + h, bz], [ax, py + h, az], tile, 1, 1);
  for (let i = n0 + 7; i < W.mesh.length; i += 8) W.mesh[i] += glow ? 4 : 2;
}
// porta nelle mura: due torri, l'architrave con i merli, l'arco e la saracinesca alzata. dir: verso l'esterno
function gate(x, z, side, yb, y, hh, tile, mt, o = {}) {
  const X = side === 'w' || side === 'e', out = side === 'e' || side === 's' ? 1 : -1, hw = o.hw || 9, th = o.th || 8, tr = o.tr || 10, tt = y + hh + (o.up || 10);
  for (const s of [-1, 1]) { const tx = X ? x : x + s * (hw + tr - 1), tz = X ? z + s * (hw + tr - 1) : z; tower(tx, tz, tr, yb, tt, tile, { roof: o.roof, merl: mt, win: TL.WIN_ARCH, b: o.b, flag: o.flag });
    if (o.ban) faceDecal(tx, tz, tr, side === 'e' ? 0 : side === 's' ? 2 : side === 'w' ? 4 : 6, y + hh - 12, 4.5, 11, o.ban); }
  const lo = y + 15, a0 = (X ? z : x) - hw, a1 = (X ? z : x) + hw, c0 = (X ? x : z) - th / 2, c1 = (X ? x : z) + th / 2;
  if (X) { box(c0, a0, c1, a1, lo, y + hh + 4, tile, TL.PAVING); merl(c1, a1, c1, a0, y + hh + 4, mt); merl(c0, a0, c0, a1, y + hh + 4, mt); quad([c0, lo, a0], [c1, lo, a0], [c1, lo, a1], [c0, lo, a1], tile, 1, hw / 4, 0.55); }
  else { box(a0, c0, a1, c1, lo, y + hh + 4, tile, TL.PAVING); merl(a0, c1, a1, c1, y + hh + 4, mt); merl(a1, c0, a0, c0, y + hh + 4, mt); quad([a0, lo, c0], [a0, lo, c1], [a1, lo, c1], [a1, lo, c0], tile, 1, hw / 4, 0.55); }
  // arco e saracinesca sui due lati
  for (const f of [-1, 1]) { const off = f * (th / 2 + 0.25);
    for (const s of [-1, 1]) { const m = (X ? z : x) + s * hw / 2, px = X ? x + off : m, pz = X ? z + s * hw / 2 : z + off; decal(px, lo - hw, pz, X ? 0 : f, X ? -f : 0, hw, hw, (s * f * (X ? -1 : 1) < 0) ? TL.GATE_L : TL.GATE_R, false, 0); }
    if (f === out) { decal(X ? x + off * 0.5 : x, lo - 5, X ? z : z + off * 0.5, X ? 0 : f, X ? -f : 0, hw * 2, 5, TL.PORTC, false, 0); if (o.crest) decal(X ? x + off : x, lo + 2, X ? z : z + off, X ? 0 : f, X ? -f : 0, 6, 6, TL.CREST); } }
}
// tettoia a strisce sopra una porta
function awning(side, x0, z0, x1, z1, c, y, w, tile) {
  const a = c - w / 2, b = c + w / 2, d = 4.2, h = 2.4;
  if (side === 's') quad([a, y, z1 + d], [b, y, z1 + d], [b, y + h, z1], [a, y + h, z1], tile, w / 8, 0.6);
  if (side === 'n') quad([b, y, z0 - d], [a, y, z0 - d], [a, y + h, z0], [b, y + h, z0], tile, w / 8, 0.6);
  if (side === 'e') quad([x1 + d, y, b], [x1 + d, y, a], [x1, y + h, a], [x1, y + h, b], tile, w / 8, 0.6);
  if (side === 'w') quad([x0 - d, y, a], [x0 - d, y, b], [x0, y + h, b], [x0, y + h, a], tile, w / 8, 0.6);
}

// ---------- case ----------
// b: { x, z, w, d, h, wall, roof, door, rt: 'gable' | 'hip' | 'flat' | 'dome', win, dr, chim, aw, ivy, tower }
function house(b, g) {
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, y0 = g0(g, x0, z0, x1, z1), base = y0 - 3, top = y0 + b.h, rt = b.rt || 'gable', win = b.win || 8, NS = b.door === 'n' || b.door === 's';
  walls(x0, z0, x1, z1, base, top, b.wall);
  if (b.band) walls(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3, base, y0 + 2.2, b.band);
  if (rt === 'gable') gable(x0, z0, x1, z1, top, Math.min(b.w, b.d) * (b.steep || 0.5), b.roof, b.gw || b.wall);
  else if (rt === 'hip') hip(x0, z0, x1, z1, top, Math.min(b.w, b.d) * (b.steep || 0.42), b.roof);
  else { walls(x0, z0, x1, z1, top, top + 1.8, b.wall); boxTop(x0 + 0.01, z0 + 0.01, x1 - 0.01, z1 - 0.01, top + 0.5, b.roof); if (rt === 'dome') dome(b.x, b.z, Math.min(b.w, b.d) * 0.36, top + 0.5, b.dome || TL.TURQ); }
  const c = NS ? b.x : b.z;
  if (b.door) { onWall(b.door, x0, z0, x1, z1, c, y0, b.dw || 5, b.dh || 8.5, b.dr || 7); if (b.aw) awning(b.door, x0, z0, x1, z1, c, y0 + 9, Math.min(NS ? b.w : b.d, 14) - 2, b.aw); }
  const rows = b.h >= 15 ? [3.5, 10.2] : [3.5];
  for (const s of ['n', 's', 'e', 'w']) { const len = (s === 'n' || s === 's') ? b.w : b.d, cc = (s === 'n' || s === 's') ? b.x : b.z; if (len <= 12) continue;
    const offs = len > 30 ? [-0.36, -0.12, 0.12, 0.36] : [-0.3, 0.3];
    for (const ry of rows) for (const off of offs) { if (s === b.door && ry < 5 && (len < 22 || Math.abs(off) < 0.2)) continue; onWall(s, x0, z0, x1, z1, cc + off * len, y0 + ry, 4.5, 4.5, win, true); } }
  if (b.chim && rt !== 'flat' && rt !== 'dome') { const cx = b.x + (b.w > b.d ? b.w * 0.28 : 0), cz = b.z + (b.w > b.d ? 0 : b.d * 0.28), ch = Math.min(b.w, b.d) * 0.5 + 3; box(cx - 1.3, cz - 1.3, cx + 1.3, cz + 1.3, top, top + ch, 16, 14); W.smokes.push([cx, top + ch + 0.5, cz]); }
  if (b.ivy) { const s = b.ivy, len = (s === 'n' || s === 's') ? b.w : b.d; onWall(s, x0, z0, x1, z1, ((s === 'n' || s === 's') ? b.x : b.z) + len * 0.34, y0 + 1, 6, Math.min(b.h - 1, 10), TL.IVY); }
  W.addBox(x0, z0, x1, z1, top, b);
  return { y0, top };
}
W.builders.house = house;

// ---------- ponti ----------
// o: { axis: 'x' | 'z', a0, a1, c, y, towers, lamp } — una diga stretta di terreno vestita da ponte di pietra ad archi
function addBridge(o) {
  const X = o.axis === 'x', y = o.y === undefined ? 10 : o.y, hw = 12, r = X ? [o.a0, o.c - hw, o.a1, o.c + hw] : [o.c - hw, o.a0, o.c + hw, o.a1];
  W.TERRA.push({ x0: r[0], z0: r[1], x1: r[2], z1: r[3], y });
  if (o.ramps !== false) for (const a of [o.a0 - 26, o.a1 + 26]) W.FLAT.push(X ? [a, o.c, 64, y] : [o.c, a, 64, y]);
  W.PAVE.push(['g', 'rect', r[0] - (X ? 30 : 0), r[1] - (X ? 0 : 30), r[2] + (X ? 30 : 0), r[3] + (X ? 0 : 30)]);
  W.CLEAR.push([r[0] - 30, r[1] - 30, r[2] + 30, r[3] + 30]);
  W.BUILD.push(Object.assign({ k: 'bridge', x: (r[0] + r[2]) / 2, z: (r[1] + r[3]) / 2, y }, o));
  if (o.lamp !== false) for (let a = o.a0 + 16, k = 0; a < o.a1 - 8; a += 48, k++) for (const s of [-1, 1]) W.PROPS.push(X ? ['lamp', a, o.c + s * 8.4] : ['lamp', o.c + s * 8.4, a]);
}
W.builders.bridge = (b, g) => {
  const X = b.axis === 'x', y = b.y, L = b.a1 - b.a0, P = (a, c, yy) => X ? [a, yy, c] : [c, yy, a];
  // il piano di calpestio copre la diga di terreno
  quad(P(b.a0, b.c + (X ? 11 : -11), y + 0.07), P(b.a1, b.c + (X ? 11 : -11), y + 0.07), P(b.a1, b.c - (X ? 11 : -11), y + 0.07), P(b.a0, b.c - (X ? 11 : -11), y + 0.07), TL.PAVING, L / 8, 22 / 8, 0.94);
  for (const s of [-1, 1]) {
    const c0 = b.c + s * 9.2, c1 = b.c + s * 11.4, lo = Math.min(c0, c1), hi = Math.max(c0, c1);
    if (X) box(b.a0, lo, b.a1, hi, -7, y + 2.6, 9); else box(lo, b.a0, hi, b.a1, -7, y + 2.6, 9);
    if (X) W.addBox(b.a0, b.c + (s > 0 ? 8.3 : -12), b.a1, b.c + (s > 0 ? 12 : -8.3), y + 2.6, b); else W.addBox(b.c + (s > 0 ? 8.3 : -12), b.a0, b.c + (s > 0 ? 12 : -8.3), b.a1, y + 2.6, b);
    // archi sul fianco esterno: una campata ogni 24 unità
    const n = Math.max(1, Math.floor((L - 8) / 24)), st = (L - n * 24) / 2, ux = X ? -s : 0, uz = X ? 0 : s;
    for (let k = 0; k < n; k++) { const a = b.a0 + st + k * 24 + 12;
      for (const h of [-1, 1]) { const m = a + h * 4, px = X ? m : c1, pz = X ? c1 : m; decal(px, y - 9, pz, ux, uz, 8, 8, (h * (X ? -s : s) > 0) ? TL.ARCH_R : TL.ARCH_L, false, 0.12); }
      decal(X ? a : c1, -7, X ? c1 : a, ux, uz, 16, y - 9 + 7, TL.DARK, false, 0.12); }
  }
  // torrette alle due teste
  if (b.towers !== false) for (const a of [b.a0 + 5, b.a1 - 5]) for (const s of [-1, 1]) { const c = b.c + s * 15.5; tower(X ? a : c, X ? c : a, 5.5, -6, y + 24, 9, { roof: b.roof || TL.ROOF_BLUE, rh: 12, b, flag: s > 0 && b.flag ? b.flag : 0 }); W.glows.push([X ? a : c, y + 13, X ? c : a, 5, 1, 0.8, 0.45, 1]); }
};

// ---------- fontana, nave, molo ----------
function fountain(x, z, y, r = 9, b) {
  prism(x, z, r, y - 2, y + 2.4, 9, 8);
  const tp = []; for (let k = 0; k < 8; k++) tp.push([x + Math.cos(k / 8 * TAU) * (r - 0.8), y + 1.7, z + Math.sin(k / 8 * TAU) * (r - 0.8)]);
  for (let k = 1; k < 7; k += 2) quad(tp[0], tp[k], tp[k + 1], tp[(k + 2) % 8], TL.WATER, 2, 2, 1.0);
  prism(x, z, 1.5, y, y + 7, 9, 8); prism(x, z, 3.4, y + 6.4, y + 7.6, 9, 8); prism(x, z, 0.9, y + 7.6, y + 10, 9, 8);
  W.addBox(x - r * 0.8, z - r * 0.8, x + r * 0.8, z + r * 0.8, y + 2.4, b); W.sprays.push([x, y + 10.4, z, r]);
}
// veliero all'ormeggio: scafo con prua a punta, cassero, alberi e vele. dir: 'n','s','e','w' dove guarda la prua
function ship(x, z, dir, o = {}) {
  const L = o.L || 46, B = o.B || 13, X = dir === 'e' || dir === 'w', f = dir === 'e' || dir === 's' ? 1 : -1, wy = -1.2, dk = 4.2;
  const P = (a, c, y) => X ? [x + a * f, y, z + c] : [x + c, y, z + a * f];
  const A0 = -L / 2, A1 = L / 2 - 12, hb = B / 2;
  // fianchi, poppa, prua a V, ponte
  quad(P(A0, hb, wy), P(A1, hb, wy), P(A1, hb, dk + 1.6), P(A0, hb, dk + 1.6), TL.HULL, (A1 - A0) / 8, 1); quad(P(A1, -hb, wy), P(A0, -hb, wy), P(A0, -hb, dk + 1.6), P(A1, -hb, dk + 1.6), TL.HULL, (A1 - A0) / 8, 1);
  quad(P(A0, -hb, wy), P(A0, hb, wy), P(A0, hb, dk + 6), P(A0, -hb, dk + 6), TL.HULL, B / 8, 1.4);
  quad(P(A1, hb, wy), P(L / 2, 0, wy), P(L / 2 + 2, 0, dk + 3.4), P(A1, hb, dk + 1.6), TL.HULL, 1.6, 1); quad(P(L / 2, 0, wy), P(A1, -hb, wy), P(A1, -hb, dk + 1.6), P(L / 2 + 2, 0, dk + 3.4), TL.HULL, 1.6, 1);
  quad(P(A0, hb, dk), P(A1, hb, dk), P(A1, -hb, dk), P(A0, -hb, dk), TL.PLANKS, (A1 - A0) / 8, B / 8, 0.9); quad(P(A1, hb, dk), P(L / 2 + 1, 0, dk + 0.6), P(L / 2 + 1, 0, dk + 0.6), P(A1, -hb, dk), TL.PLANKS, 1.5, B / 8, 0.9);
  // cassero di poppa
  const c0 = A0, c1 = A0 + 11;
  quad(P(c0, hb, dk), P(c1, hb, dk), P(c1, hb, dk + 6), P(c0, hb, dk + 6), 3, 1.4, 0.75); quad(P(c1, -hb, dk), P(c0, -hb, dk), P(c0, -hb, dk + 6), P(c1, -hb, dk + 6), 3, 1.4, 0.75);
  quad(P(c1, hb, dk), P(c1, -hb, dk), P(c1, -hb, dk + 6), P(c1, hb, dk + 6), 3, B / 8, 0.75); quad(P(c0, hb, dk + 6), P(c1, hb, dk + 6), P(c1, -hb, dk + 6), P(c0, -hb, dk + 6), TL.PLANKS, 1.4, B / 8, 0.95);
  // alberi e vele
  const mast = (a, h) => { const m = P(a, 0, 0), q = 0.6; box(m[0] - q, m[2] - q, m[0] + q, m[2] + q, dk, dk + h, 3); for (const [sy, sw, shh] of [[h * 0.3, B * 1.5, h * 0.3], [h * 0.64, B * 1.15, h * 0.24]]) { quad(P(a + 0.9, sw / 2, dk + sy), P(a + 0.9, -sw / 2, dk + sy), P(a + 2.2, -sw / 2 * 0.92, dk + sy + shh), P(a + 2.2, sw / 2 * 0.92, dk + sy + shh), TL.SAIL, 2, 1.5, 0.96); } W.flags.push([m[0], dk + h, m[2], o.flag || 1]); };
  mast(A0 + L * 0.36, o.mh || 34); if (L > 40) mast(A0 + L * 0.66, (o.mh || 34) * 0.82);
  const bx = P(A0, -hb - 1, 0), bz = P(L / 2, hb + 1, 0); W.addBox(Math.min(bx[0], bz[0]), Math.min(bx[2], bz[2]), Math.max(bx[0], bz[0]), Math.max(bx[2], bz[2]), dk + 6, o.b);
}
// molo di legno: una striscia di terreno appena sopra l'acqua, coperta di assi, con i pali
function addPier(o) {
  const X = o.axis === 'x', hw = o.hw || 8, y = o.y || 2.6, r = X ? [o.a0, o.c - hw, o.a1, o.c + hw] : [o.c - hw, o.a0, o.c + hw, o.a1];
  W.TERRA.push({ x0: r[0], z0: r[1], x1: r[2], z1: r[3], y }); W.CLEAR.push([r[0] - 10, r[1] - 10, r[2] + 10, r[3] + 10]);
  W.BUILD.push(Object.assign({ k: 'pier', x: (r[0] + r[2]) / 2, z: (r[1] + r[3]) / 2, r, y, site: o.site }, o));
}
W.builders.pier = b => {
  const [x0, z0, x1, z1] = b.r, y = b.y, X = b.axis === 'x', e = 2.6;
  box(x0 - (X ? 0 : e), z0 - (X ? e : 0), x1 + (X ? 0 : e), z1 + (X ? e : 0), -5, y + 0.08, 3, TL.PLANKS);
  const L = X ? x1 - x0 : z1 - z0;
  for (let a = 4; a < L; a += 16) for (const s of [-1, 1]) { const px = X ? x0 + a : (s < 0 ? x0 - e : x1 + e), pz = X ? (s < 0 ? z0 - e : z1 + e) : z0 + a; box(px - 0.7, pz - 0.7, px + 0.7, pz + 0.7, -5, y + 3, 3); }
};

// ---------- oggetti di città (sprite) ----------
function sprites(set, A, R) {
  const { fit } = A, Cy = (a, b, r, c, k, rot) => ({ t: 'y', a, b, r, c, k, rot }), El = (o, r, c, k, z, rot) => ({ t: 'e', o, r, c, k, z, rot }), Bx = (b, c, k, rot) => ({ t: 'b', b, c, k, rot }), Kc = (a, b, r, r2, c, k, rot) => ({ t: 'k', a, b, r, r2, c, k, rot }), Ca = (a, b, r, c, k, rot) => ({ t: 'c', a, b, r, c, k, rot });
  const IR = '#3a3c48', WD = '#6a4424', WD2 = '#8a5e34';
  set('lamp', [fit([Cy([0, 0, 0], [0, 0, 0.5], 0.9, IR), Cy([0, 0, 0.5], [0, 0, 8.6], 0.26, IR), Cy([0, 0, 8.5], [0, 0, 8.8], 0.7, IR), Bx([-0.62, 0.62, -0.62, 0.62, 8.8, 10.4], '#ffd870', 1.5), Kc([0, 0, 10.4], [0, 0, 11.3], 0.95, 0.15, IR), Cy([0, 0, 8.75], [0, 0, 8.95], 0.92, IR)], Math.PI - 0.4)], 0.2, 0.8);
  set('lantern', [fit([Cy([0, 0, 0], [0, 0, 6.6], 0.22, '#4a2e1c'), Bx([-0.2, 0.2, -0.2, 1.9, 6.4, 6.8], '#4a2e1c'), El([0, 1.6, 5.2], [0.95, 0.95, 1.15], '#ff8a6a', 1.5), Cy([0, 1.6, 6.2], [0, 1.6, 6.45], 0.5, '#2a1a10'), Cy([0, 1.6, 3.95], [0, 1.6, 4.2], 0.5, '#2a1a10')], Math.PI - 0.4)], 0.2, 0.8);
  set('barrel', [fit([Cy([0, 0, 0], [0, 0, 0.6], 1.15, WD), Cy([0, 0, 0.6], [0, 0, 2.2], 1.35, WD2), Cy([0, 0, 2.2], [0, 0, 2.8], 1.15, WD), Cy([0, 0, 0.55], [0, 0, 0.75], 1.38, IR), Cy([0, 0, 2.05], [0, 0, 2.25], 1.38, IR), Cy([0, 0, 2.78], [0, 0, 2.84], 0.95, '#5a3a20')], Math.PI - 0.5)], 0.2, 1.4);
  set('crate', [fit([Bx([-1.3, 1.3, -1.3, 1.3, 0, 2.6], WD2), Bx([-1.36, 1.36, -1.36, 1.36, 0, 0.3], WD), Bx([-1.36, 1.36, -1.36, 1.36, 2.3, 2.6], WD), Bx([-1.36, -1.1, -1.36, 1.36, 0, 2.6], WD), Bx([1.1, 1.36, -1.36, 1.36, 0, 2.6], WD)], Math.PI - 0.6), fit([Bx([-1.3, 1.3, -1.3, 1.3, 0, 2.6], WD2), Bx([-1.36, 1.36, -1.36, 1.36, 2.3, 2.6], WD), Bx([-1.0, 1.0, -1.0, 1.0, 2.6, 4.4], '#a87a4a'), Bx([-1.06, 1.06, -1.06, 1.06, 4.1, 4.4], WD)], Math.PI - 0.5)], 0.2, 1.5);
  set('bench', [fit([Bx([-0.7, 0.7, -2.4, 2.4, 1.3, 1.6], WD2), Bx([-0.6, -0.3, -2.2, -1.9, 0, 1.3], WD), Bx([0.3, 0.6, -2.2, -1.9, 0, 1.3], WD), Bx([-0.6, -0.3, 1.9, 2.2, 0, 1.3], WD), Bx([0.3, 0.6, 1.9, 2.2, 0, 1.3], WD), Bx([-0.75, -0.55, -2.4, 2.4, 1.6, 3], WD2)], Math.PI - 0.5)], 0.2, 1.2);
  set('cart', [fit([Bx([-1.6, 1.6, -3, 3, 1.6, 2], WD2), Bx([-1.7, -1.5, -3, 3, 2, 3.4], WD), Bx([1.5, 1.7, -3, 3, 2, 3.4], WD), Bx([-1.6, 1.6, -3.1, -2.9, 2, 3.4], WD), Cy([-1.9, -1.2, 1.5], [-1.5, -1.2, 1.5], 1.5, '#4a2e1a'), Cy([1.5, -1.2, 1.5], [1.9, -1.2, 1.5], 1.5, '#4a2e1a'), Ca([-1, 3, 2], [-1.2, 6.4, 1.2], 0.18, WD), Ca([1, 3, 2], [1.2, 6.4, 1.2], 0.18, WD), El([0, 0, 3.4], [1.3, 2.4, 1.1], '#d8b44a')], Math.PI - 0.7)], 0.2, 3);
  set('haybale', [fit([Cy([0, -1.6, 1.5], [0, 1.6, 1.5], 1.5, '#d8b44a'), Cy([0, -0.5, 1.5], [0, -0.3, 1.5], 1.54, '#a8843a'), Cy([0, 0.5, 1.5], [0, 0.7, 1.5], 1.54, '#a8843a')], Math.PI - 0.8)], 0.2, 1.6);
  set('pot', [fit([Kc([0, 0, 0], [0, 0, 1.4], 0.7, 1.05, '#b8623a'), Cy([0, 0, 1.4], [0, 0, 1.6], 1.12, '#c8724a'), El([0, 0, 2.3], [1.2, 1.2, 0.9], '#3e8a34'), El([0.5, 0.3, 2.9], [0.4, 0.4, 0.4], '#ff6a8a', 1.1), El([-0.4, -0.5, 2.8], [0.4, 0.4, 0.4], '#ffe14a', 1.1), El([-0.3, 0.6, 3.0], [0.36, 0.36, 0.36], '#ffffff', 1.1)], Math.PI - 0.5)], 0.2, 1);
  set('jar', [fit([Kc([0, 0, 0], [0, 0, 1.2], 0.6, 1.2, '#c88a4a'), Kc([0, 0, 1.2], [0, 0, 2.6], 1.2, 0.55, '#d89a5a'), Cy([0, 0, 2.6], [0, 0, 3.1], 0.6, '#c88a4a'), Cy([0, 0, 1.15], [0, 0, 1.35], 1.24, '#2a6ab0')], Math.PI - 0.5)], 0.2, 1);
  set('boat', [fit([Bx([-0.2, 0.2, -3.6, 3.6, 0.2, 1.3], WD2), Bx([-1.5, 1.5, -3.0, 3.0, 0, 0.3], WD), Bx([-1.6, -1.3, -3.0, 3.0, 0.2, 1.3], WD2), Bx([1.3, 1.6, -3.0, 3.0, 0.2, 1.3], WD2), Kc([0, 3.0, 0.7], [0, 4.6, 1.2], 1.5, 0.2, WD2), Kc([0, -3.0, 0.7], [0, -4.0, 1.0], 1.5, 0.5, WD2), Bx([-1.4, 1.4, -0.4, 0.4, 0.9, 1.1], '#a87a4a')], Math.PI - 0.9)], 0.2, 0);
  set('anchor', [fit([Cy([0, 0, 0.6], [0, 0, 4], 0.22, IR), Cy([0, -0.9, 3.4], [0, 0.9, 3.4], 0.2, IR), Ca([0, -1.5, 1.2], [0, 0, 0.5], 0.24, IR), Ca([0, 1.5, 1.2], [0, 0, 0.5], 0.24, IR), El([0, 0, 4.3], [0.2, 0.5, 0.5], IR)], Math.PI - 1.2)], 0.2, 1);
  set('target', [fit([Cy([-0.3, 0, 3.2], [0.3, 0, 3.2], 2.2, '#f0ece0'), Cy([0.3, 0, 3.2], [0.36, 0, 3.2], 1.5, '#c8342c'), Cy([0.36, 0, 3.2], [0.42, 0, 3.2], 0.7, '#ffd23f'), Ca([0, -1.4, 0], [0, -0.6, 2], 0.2, WD), Ca([0, 1.4, 0], [0, 0.6, 2], 0.2, WD)], Math.PI - 0.3)], 0.2, 1.4);
  set('kingstatue', [A.figure([{ t: 'b', b: [-7, 7, -7, 7, -10, 0], c: '#8a867a' }, { t: 'b', b: [-8, 8, -8, 8, -11.5, -9.5], c: '#a8a498' }, ...A.human({ skin: '#b8b4a8', crown: '#d8c890', shirt: '#a8a498', plate: '#c0bcb0', pants: '#98948a', boots: '#8a867a', cape: '#98948a', beard: '#c0bcb0', weapon: { col: '#c8c4b8', guard: '#a8a498' }, shield: '#a8a498', emblem: '#c8c4b8' }, { armR: 2.9 })], Math.PI, Math.round(70 * A.SR), Math.round(96 * A.SR), { base: Math.round(78 * A.SR), sc: A.SR * 1.25 })], 0.52 / A.SR, 6);
  set('flag', [0, 1].map(f => A.pix(f ? ['aaaaaaaab...', 'acccaaaaab..', 'acbcaaaaaab.', 'acccaaaaab..', 'aaaaaaaab...', '.aaaaaab....'] : ['.aaaaaaab...', 'aacccaaaab..', 'aacbcaaaaab.', 'aacccaaaab..', '.aaaaaaab...', '..aaaaab....'], { a: '#c8342c', b: '#8a1e1a', c: '#ffd23f' })), 0.55, 0);
  set('flagblue', [0, 1].map(f => A.pix(f ? ['aaaaaaaab...', 'acccaaaaab..', 'acbcaaaaaab.', 'acccaaaaab..', 'aaaaaaaab...', '.aaaaaab....'] : ['.aaaaaaab...', 'aacccaaaab..', 'aacbcaaaaab.', 'aacccaaaab..', '.aaaaaaab...', '..aaaaab....'], { a: '#2a5ab0', b: '#1a3a7a', c: '#f0ece0' })), 0.55, 0);
}

W.flags = []; W.sprays = []; W.TOWNS = [{ x: 2000, z: 2650, name: 'BORGO AURORA', big: true, home: true }]; W.FOLK = {};
SG.town = { TL, tilesOn, sprites, merl, merlBox, wallSeg, oct, faceDecal, cone, pyramid, hip, dome, tower, decal, gate, awning, house, addBridge, addPier, fountain, ship, g0 };
})();
