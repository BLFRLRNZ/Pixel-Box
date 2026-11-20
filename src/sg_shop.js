// ===================== PIXEL SAGA · le botteghe =====================
// Le bancarelle sono diventate botteghe vere: una casa con l'insegna, e dentro una stanza con il banco, gli
// scaffali e il bottegaio. Qui stanno i riquadri nuovi (pavimenti, pareti, scaffali, insegne, bacheche), gli
// arredi e la pianta di ogni tipo di bottega. La stanza usa il motore dei santuari: è un «piano» senza nemici,
// con in più mobili (scatole e riquadri alle pareti), oggetti appoggiati, lumi e persone.
(() => {
const W = SG.world, A = SG.art, DS = SG.dun, TN = SG.town, TL = TN.TL, K = W.kit, CS = DS.CS, WH = DS.WH;
// ---------- riquadri nuovi (dal 128 in poi: la seconda metà del foglio) ----------
Object.assign(TL, { ASSI: 128, LASTRE: 129, TATAMI: 130, COTTO: 131, ZOCCOLO: 132, INTON: 133, TRAVI: 134, CARTA: 135, BUIO: 136, BANCO: 137, PIANO: 138,
  SC_POZ: 139, SC_ARMI: 140, SC_MERCI: 141, SC_STOFFE: 142, SC_GEMME: 143, SC_BOTTI: 144, SCUDI: 145, ERBE: 146, FINESTRA: 147, LIBRI: 148, CAMINO: 149, LETTO: 150,
  TAPPETO: 151, TAPPETO2: 152, QUADRO: 153, PESCI: 154, STUOIA: 155, ZOCC_T: 156, ZOCC_S: 157, ZOCC_B: 158, LETTO2: 159,
  I_LOCANDA: 160, I_ARMI: 161, I_ERBE: 162, I_EMPORIO: 163, I_ORAFO: 164, I_SARTO: 165, I_PESCE: 166, I_FUCINA: 167, BACHECA: 168, PERGAMENA: 169 });

function tilesOn(c, R) {
  const T = 32, g = c.getContext('2d'), rnd = n => Math.floor(R() * n);
  // schiarisce o scurisce un colore e lo restituisce ancora come #rrggbb (così si può ripassare più volte)
  const sh = (h, f) => { const n = parseInt(h.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0')).join(''); };
  const at = (i, fn) => { g.save(); g.translate((i % 8) * T, Math.floor(i / 8) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); g.clearRect(0, 0, T, T); fn(); g.restore(); };
  const P = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const speck = (col, n, v = 0.16) => { for (let k = 0; k < n; k++) P(sh(col, 1 + (R() - 0.5) * v), rnd(T), rnd(T), 1 + (R() < 0.3), 1); };
  const disc = (col, cx, cy, r) => { g.fillStyle = col; for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 < r * r) g.fillRect(x, y, 1, 1); };
  const DK = '#2e1c10', W1 = '#5a3a20', W2 = '#7a4e2a', W3 = '#9a6a3a', W4 = '#b8884e';
  // --- pavimenti ---
  at(TL.ASSI, () => { for (let y = 0; y < T; y += 8) { const c0 = sh('#a8733c', 0.92 + R() * 0.16); P(c0, 0, y, T, 8); P(sh(c0, 1.1), 0, y, T, 1); P(sh(c0, 0.78), 0, y + 7, T, 1); P(sh(c0, 0.8), (y / 8 % 2) ? 9 : 23, y, 1, 7); for (let k = 0; k < 3; k++) P(sh(c0, 0.94), rnd(T - 6), y + 2 + rnd(4), 4 + rnd(4), 1); } });
  at(TL.LASTRE, () => { P('#4a4640', 0, 0, T, T); for (const [x, y, w, h] of [[0, 0, 16, 16], [16, 0, 16, 16], [0, 16, 16, 16], [16, 16, 16, 16]]) { const c0 = sh('#9a968c', 0.88 + R() * 0.22); P(c0, x + 1, y + 1, w - 1, h - 1); P(sh(c0, 1.14), x + 1, y + 1, w - 1, 1); P(sh(c0, 0.8), x + 1, y + h - 1, w - 1, 1); for (let k = 0; k < 5; k++) P(sh(c0, 0.9), x + 2 + rnd(w - 4), y + 2 + rnd(h - 4), 2, 1); } });
  at(TL.TATAMI, () => { P('#b9b56a', 0, 0, T, T); for (let y = 0; y < T; y += 2) P(sh('#b9b56a', 0.9 + R() * 0.16), 0, y, T, 1); for (let k = 0; k < 30; k++) P('#cfcb84', rnd(T), rnd(T), 2, 1); P('#2e3a22', 0, 0, T, 2); P('#2e3a22', 0, 0, 2, T); P('#46562e', 0, 2, T, 1); P('#46562e', 2, 0, 1, T); });
  at(TL.COTTO, () => { P('#7a3e22', 0, 0, T, T); for (let y = 0; y < T; y += 8) for (let x = 0; x < T; x += 8) { const c0 = sh('#c9713c', 0.86 + R() * 0.26); P(c0, x + 1, y + 1, 7, 7); P(sh(c0, 1.16), x + 1, y + 1, 7, 1); P(sh(c0, 0.82), x + 7, y + 1, 1, 7); } });
  // --- pareti ---
  // lo zoccolo di legno ai piedi delle pareti (il riquadro si schiaccia: assi verticali, corrimano in alto)
  const zocc = (a, b, c2) => { P(a, 0, 0, T, T); for (let x = 0; x < T; x += 8) { P(sh(a, 0.9 + R() * 0.2), x + 1, 6, 7, 20); P(c2, x, 6, 1, 20); } P(b, 0, 0, T, 6); P(sh(b, 1.2), 0, 0, T, 2); P(c2, 0, 6, T, 1); P(c2, 0, 26, T, 6); P(sh(c2, 1.4), 0, 26, T, 1); };
  at(TL.ZOCCOLO, () => zocc(W2, W3, DK)); at(TL.ZOCC_T, () => zocc('#4a3424', '#6a4a30', '#20140c')); at(TL.ZOCC_S, () => zocc('#c9a268', '#e0bc80', '#8a6a3c')); at(TL.ZOCC_B, () => zocc('#3a5a7a', '#f0ece0', '#22384e'));
  at(TL.INTON, () => { P('#ece2c8', 0, 0, T, T); speck('#ece2c8', 70, 0.1); P('#d8ccac', 0, 0, T, 1); });
  at(TL.TRAVI, () => { P('#ece2c8', 0, 0, T, T); speck('#ece2c8', 60, 0.1); P(W1, 0, 0, 3, T); P(W1, 0, 0, T, 3); P(sh(W1, 1.3), 3, 3, T - 3, 1); P(sh(W1, 1.3), 3, 3, 1, T - 3); P(sh(W1, 0.7), 0, 0, 1, T); });
  at(TL.CARTA, () => { P('#4a2e1c', 0, 0, T, T); for (let y = 2; y < T; y += 10) for (let x = 2; x < T; x += 10) P(sh('#f6eed8', 0.95 + R() * 0.08), x, y, 8, 8); });
  at(TL.BUIO, () => { P('#17110c', 0, 0, T, T); speck('#17110c', 40, 0.5); });
  // --- banco e mobili ---
  at(TL.BANCO, () => { P(W2, 0, 0, T, T); P(W4, 0, 0, T, 3); P(sh(W4, 1.2), 0, 0, T, 1); P(DK, 0, 3, T, 1); for (const x of [2, 17]) { P(W1, x, 7, 13, 19); P(W3, x + 1, 8, 11, 17); P(sh(W3, 1.18), x + 1, 8, 11, 1); P(sh(W3, 0.82), x + 1, 24, 11, 1); } P(DK, 0, 29, T, 3); });
  at(TL.PIANO, () => { P(W4, 0, 0, T, T); for (let y = 3; y < T; y += 5) { P(sh(W4, 0.88), 0, y, T, 1); P(sh(W4, 1.1), rnd(20), y + 2, 6 + rnd(8), 1); } P(sh(W4, 0.7), 0, 0, T, 1); P(sh(W4, 0.7), 0, T - 1, T, 1); P(sh(W4, 0.7), 0, 0, 1, T); P(sh(W4, 0.7), T - 1, 0, 1, T); });
  // uno scaffale a tutta altezza: cornice, quattro ripiani, e la merce sopra (ognuna la disegna «roba»)
  const scaff = roba => { P(DK, 0, 0, T, T); P(W1, 1, 1, T - 2, T - 2); P('#24160c', 3, 3, T - 6, T - 5); for (const y of [9, 16, 23, 30]) { P(W3, 2, y, T - 4, 2); P(sh(W3, 1.2), 2, y, T - 4, 1); } P(W2, 1, 1, 2, T - 2); P(W2, T - 3, 1, 2, T - 2); P(sh(W2, 1.25), 1, 1, T - 2, 1); roba([9, 16, 23, 30]); };
  const bott = (x, y, c0, h = 5) => { P(c0, x, y - h, 3, h); P(sh(c0, 1.35), x, y - h, 1, h - 1); P('#d8c8a0', x + 1, y - h - 2, 1, 2); };
  at(TL.SC_POZ, () => scaff(ys => { const C = ['#e8364e', '#3a8ad8', '#3ab860', '#b060e0', '#f0c030', '#ff8a3a', '#5ad8d0']; ys.forEach((y, r) => { for (let x = 4 + (r % 2); x < 27; x += 4) { if (R() < 0.18) continue; if (R() < 0.25) { P('#c8a878', x, y - 4, 3, 4); P('#8a6a44', x, y - 4, 3, 1); } else bott(x, y, C[rnd(C.length)], 4 + rnd(2)); } }); }));
  at(TL.SC_ARMI, () => { P(DK, 0, 0, T, T); P(W1, 1, 1, T - 2, T - 2); for (let x = 2; x < T - 2; x += 7) P(sh(W1, 0.86), x, 1, 1, T - 2); P(W3, 1, 6, T - 2, 2); P(W3, 1, 26, T - 2, 2);
    const sword = (x, c0) => { P(c0, x, 3, 2, 17); P(sh(c0, 1.3), x, 3, 1, 17); P('#c8a040', x - 2, 20, 6, 2); P('#5a3a20', x, 22, 2, 5); P('#c8a040', x, 27, 2, 1); };
    sword(5, '#d8dce4'); sword(12, '#c0c6d2'); P('#7a5230', 19, 2, 2, 28); P('#c8d0dc', 17, 3, 6, 5); P('#e8eef6', 17, 3, 1, 5); P('#8a94a2', 22, 4, 1, 3); P('#7a5230', 26, 2, 1, 28); P('#d8dce4', 25, 1, 3, 4); P('#e8eef6', 26, 0, 1, 2); });
  at(TL.SC_MERCI, () => scaff(ys => { ys.forEach((y, r) => { let x = 4; while (x < 26) { const k = rnd(5); if (k === 0) { P('#b8623a', x, y - 5, 4, 5); P('#d8825a', x, y - 5, 1, 4); P('#8a4224', x, y - 5, 4, 1); x += 5; } else if (k === 1) { P('#c8a878', x, y - 4, 5, 4); P('#8a6a44', x, y - 3, 5, 1); P('#e0c898', x, y - 4, 5, 1); x += 6; } else if (k === 2) { P('#e8e0c8', x, y - 3, 6, 3); P('#b8342c', x + 2, y - 3, 2, 3); x += 7; } else if (k === 3) { bott(x, y, '#3a8ad8', 4); x += 4; } else { P('#8a5e34', x, y - 6, 4, 6); P('#3a3c48', x, y - 5, 4, 1); P('#3a3c48', x, y - 2, 4, 1); x += 5; } } }); }));
  at(TL.SC_STOFFE, () => scaff(ys => { const C = ['#c85a8a', '#3a6ab0', '#e8b42a', '#3a9a6a', '#8a4ab0', '#c8342c', '#f0ece0', '#5ac8d0']; ys.forEach((y, r) => { if (r === 3) { P('#e8e8f0', 4, y - 5, 11, 5); P('#c8d0dc', 4, y - 2, 11, 1); P('#9a7a5a', 17, y - 5, 10, 5); P('#7a5a3a', 17, y - 3, 10, 1); return; } for (let x = 4; x < 26; x += 6) { const c0 = C[rnd(C.length)]; P(c0, x, y - 5, 5, 5); P(sh(c0, 1.3), x, y - 5, 5, 1); P(sh(c0, 0.7), x + 2, y - 3, 1, 1); P(sh(c0, 0.75), x, y - 1, 5, 1); } }); }));
  at(TL.SC_GEMME, () => { P(DK, 0, 0, T, T); P(W1, 1, 1, T - 2, T - 2); P('#3a1e3a', 3, 3, T - 6, T - 6); for (const y of [12, 21]) P(W3, 2, y, T - 4, 1); P(sh(W1, 1.3), 1, 1, T - 2, 1);
    const G = ['#e8364e', '#3ad8e8', '#ffd23f', '#5af07a', '#c8a0ff']; for (const y of [8, 17, 26]) for (let x = 6; x < 27; x += 5) { const c0 = G[rnd(G.length)]; if (R() < 0.4) { P('#ffd23f', x - 1, y - 2, 3, 3); P('#3a1e3a', x, y - 1, 1, 1); P(c0, x, y - 3, 1, 1); } else { P(c0, x - 1, y - 2, 3, 2); P('#ffffff', x - 1, y - 2, 1, 1); P(sh(c0, 0.7), x, y, 1, 1); } }
    for (let x = 9; x < 24; x += 2) P('#ffd23f', x, 4 + (Math.abs(x - 16) < 4 ? 1 : 0), 1, 1); });
  at(TL.SC_BOTTI, () => { P(DK, 0, 0, T, T); P(W1, 1, 1, T - 2, T - 2); P('#24160c', 3, 3, T - 6, T - 5); P(W3, 2, 10, T - 4, 2); for (let x = 5; x < 26; x += 5) { P('#c8a878', x, 5, 3, 5); P('#f0ece0', x, 5, 3, 1); P('#8a6a44', x + 3, 6, 1, 3); }
    for (const cx of [9.5, 22.5]) { disc('#3a3c48', cx, 21, 6.6); disc(W3, cx, 21, 5.6); disc(W4, cx, 21, 4.2); P(W2, cx - 4, 20.5, 8, 1); P(W2, cx - 0.5, 17, 1, 8); P('#c8a040', cx - 1, 25, 2, 3); } P(W2, 2, 28, T - 4, 2); });
  // --- alle pareti: oggetti dal contorno ritagliato ---
  at(TL.SCUDI, () => { const blade = (x0, x1) => { for (let k = 0; k < 24; k++) { const x = Math.round(x0 + (x1 - x0) * k / 23), y = 4 + k; P('#d8dce4', x, y, 2, 1); } }; blade(5, 26); blade(26, 5); P('#c8a040', 3, 2, 4, 3); P('#c8a040', 26, 2, 4, 3);
    for (let y = 7; y < 27; y++) { const hw = y < 17 ? 8 : 8 - (y - 17) * 0.8; for (let x = Math.ceil(16 - hw); x < 16 + hw; x++) P(x < 16 ? '#b8342c' : '#8a1e1a', x, y, 1, 1); } P('#ffd23f', 15, 7, 2, 20); P('#ffd23f', 8, 13, 16, 2); P('#f0ece0', 8, 7, 16, 1); });
  at(TL.ERBE, () => { P(W1, 0, 2, T, 2); P(sh(W1, 1.3), 0, 2, T, 1); const C = ['#3e8a34', '#5aa844', '#8ab04a', '#b89a4a', '#7a9a3a']; for (let x = 2; x < 30; x += 6) { const c0 = C[rnd(C.length)], h = 12 + rnd(9); P('#8a6a44', x + 2, 4, 1, 4); for (let y = 0; y < h; y++) { const w = Math.min(5, 1 + Math.floor(y / 2)); P(sh(c0, 0.85 + R() * 0.3), x + 2 - Math.floor(w / 2), 8 + y, w, 1); } if (R() < 0.6) P(R() < 0.5 ? '#e8a0d0' : '#f0e060', x + 1, 8 + h - 2, 2, 2); } });
  at(TL.FINESTRA, () => { P(W1, 3, 2, 26, 26); P('#9ad0f0', 5, 4, 22, 22); P('#c8e8fa', 5, 4, 22, 9); P('#f4fbff', 7, 6, 6, 3); P('#7ab8e0', 5, 20, 22, 6); P(W1, 15, 4, 2, 22); P(W1, 5, 14, 22, 2); P(W3, 2, 28, 28, 3); P(sh(W3, 1.25), 2, 28, 28, 1); P(sh(W1, 1.3), 3, 2, 26, 1); });
  at(TL.LIBRI, () => scaff(ys => { const C = ['#8a2a2a', '#2a4a8a', '#2a6a3a', '#6a3a7a', '#a87a2a', '#3a3a44', '#c8b890']; ys.forEach(y => { let x = 4; while (x < 27) { const w = 1 + rnd(2), h = 4 + rnd(2), c0 = C[rnd(C.length)]; P(c0, x, y - h, w, h); P(sh(c0, 1.4), x, y - h + 1, w, 1); x += w + (R() < 0.15 ? 2 : 0); } }); }));
  at(TL.CAMINO, () => { const st = (x, y, w, h) => { const c0 = sh('#8a8478', 0.86 + R() * 0.26); P('#4a463e', x, y, w, h); P(c0, x + 1, y + 1, w - 1, h - 1); P(sh(c0, 1.18), x + 1, y + 1, w - 1, 1); };
    for (let y = 4; y < T; y += 7) { st(0, y, 7, 7); st(25, y, 7, 7); } for (let x = 0; x < T; x += 8) st(x, 4, 8, 6); P(W1, 0, 0, T, 4); P(sh(W1, 1.35), 0, 0, T, 1); P(DK, 0, 3, T, 1);
    for (let y = 10; y < T; y++) for (let x = 7; x < 25; x++) { if (y < 16 && Math.hypot(x + 0.5 - 16, y + 0.5 - 16) > 9) continue; P('#120c0a', x, y, 1, 1); } P('#3a2416', 9, 27, 14, 3); P('#5a3a20', 10, 26, 5, 2); P('#5a3a20', 16, 25, 6, 2); P('#ff7a1a', 11, 24, 3, 2); P('#ffc83a', 16, 23, 3, 2); });
  const letto = (c1, c2) => { P(W1, 0, 0, T, T); P(W2, 1, 1, T - 2, 4); P('#f0ece0', 3, 4, T - 6, T - 7); P('#fbf8f0', 5, 5, T - 10, 7); P('#d8d2c2', 5, 11, T - 10, 1); P(c1, 3, 14, T - 6, T - 17); P(sh(c1, 1.2), 3, 14, T - 6, 1); P(c2, 3, 18, T - 6, 2); P(c2, 3, 25, T - 6, 1); P(sh(c1, 0.8), 3, 28, T - 6, 1); P(W2, 1, T - 3, T - 2, 2); };
  at(TL.LETTO, () => letto('#b8342c', '#ffd23f')); at(TL.LETTO2, () => letto('#3a6ab0', '#f0ece0'));
  // tappeto a rombi: il motivo si ripete senza giunte
  const tapp = (a, b, c2) => { P(a, 0, 0, T, T); speck(a, 50, 0.14);
    for (const [cx, cy] of [[8, 8], [24, 8], [8, 24], [24, 24]]) { for (let d = 0; d <= 6; d++) { P(b, cx - d, cy - 6 + d, 1, 1); P(b, cx + d - 1, cy - 6 + d, 1, 1); P(b, cx - d, cy + 5 - d, 1, 1); P(b, cx + d - 1, cy + 5 - d, 1, 1); } P(c2, cx - 1, cy - 1, 2, 2); }
    for (const [cx, cy] of [[16, 16], [0, 0], [32, 0], [0, 32], [32, 32], [16, 0], [0, 16], [32, 16], [16, 32]]) P(c2, cx - 1, cy - 1, 2, 2); };
  at(TL.TAPPETO, () => tapp('#a02a2a', '#e8b42a', '#f0e0b0')); at(TL.TAPPETO2, () => tapp('#2a4a8a', '#c8d8f0', '#ffd23f'));
  at(TL.QUADRO, () => { P('#8a6a2a', 2, 4, 28, 24); P('#c8a040', 3, 5, 26, 22); P('#e8d8a8', 5, 7, 22, 18); P('#7ab0d8', 5, 7, 22, 6); P('#6a9a4a', 5, 17, 22, 8); P('#8a8a94', 12, 11, 8, 8); P('#a8a8b0', 14, 9, 4, 3); P('#e8eef6', 15, 8, 2, 2); P('#4a7a34', 6, 15, 5, 4); P('#4a7a34', 21, 14, 5, 5); });
  at(TL.PESCI, () => { P(W1, 0, 2, T, 2); P(sh(W1, 1.3), 0, 2, T, 1); for (const [x, h, c0] of [[4, 16, '#8ab0c8'], [13, 20, '#c8a878'], [22, 14, '#9ac0b0']]) { P('#3a3c48', x + 2, 4, 1, 3); for (let y = 0; y < h; y++) { const t = y / h, w = t < 0.15 ? 2 : t > 0.8 ? 1 + Math.round((t - 0.8) * 20) : Math.round(2 + 3 * Math.sin(Math.PI * (t - 0.1) / 0.75)); P(y % 3 === 1 ? sh(c0, 1.25) : c0, x + 2 - Math.floor(w / 2), 7 + y, w, 1); } P('#1a1418', x + 2, 9, 1, 1); } });
  at(TL.STUOIA, () => { P('#8a6a3a', 2, 6, 28, 20); for (let y = 6; y < 26; y += 2) P('#a8884e', 2, y, 28, 1); P('#5a4424', 2, 6, 28, 1); P('#5a4424', 2, 25, 28, 1); for (let x = 2; x < 30; x += 3) { P('#c8a868', x, 4, 1, 2); P('#c8a868', x, 26, 1, 2); } });
  // --- insegne: una tavola sagomata con il disegno della bottega ---
  const insegna = (bg, fn) => { for (let y = 2; y < 30; y++) for (let x = 2; x < 30; x++) { const cx = Math.min(x - 2, 29 - x), cy = Math.min(y - 2, 29 - y); if (cx + cy < 3) continue; P(cx === 0 || cy === 0 || cx + cy === 3 ? DK : bg, x, y, 1, 1); } P(sh(bg, 1.25), 5, 3, 22, 1); P('#3a3c48', 9, 0, 2, 3); P('#3a3c48', 21, 0, 2, 3); fn(); };
  at(TL.I_LOCANDA, () => insegna('#8a5e34', () => { P('#f0ece0', 9, 8, 11, 4); P('#fff8e8', 10, 7, 3, 2); P('#fff8e8', 14, 6, 4, 3); P('#e0a030', 9, 12, 11, 12); P('#f0c050', 10, 12, 2, 12); P('#b87a1c', 18, 12, 2, 12); P('#3a2416', 9, 15, 11, 1); P('#3a2416', 9, 21, 11, 1); P('#e0a030', 20, 14, 4, 2); P('#e0a030', 22, 16, 2, 5); P('#e0a030', 20, 20, 4, 2); P('#3a2416', 9, 24, 11, 1); }));
  at(TL.I_ARMI, () => insegna('#6a4a3a', () => { for (let k = 0; k < 17; k++) { P('#e8eef6', 7 + k, 23 - k, 2, 1); P('#c0c6d2', 8 + k, 24 - k, 1, 1); } P('#c8a040', 6, 21, 2, 5); P('#c8a040', 5, 23, 5, 2); P('#5a3a20', 4, 25, 3, 3);
    for (let y = 9; y < 25; y++) { const hw = y < 17 ? 6 : 6 - (y - 17) * 0.75; for (let x = Math.ceil(20 - hw); x < 20 + hw; x++) P(x < 20 ? '#3a6ab0' : '#2a4a8a', x, y, 1, 1); } P('#ffd23f', 19, 9, 2, 15); P('#ffd23f', 15, 14, 10, 2); }));
  at(TL.I_ERBE, () => insegna('#4a6a3a', () => { P('#d8c8a0', 15, 6, 3, 3); P('#8ad0f0', 14, 9, 5, 3); for (let y = 12; y < 25; y++) { const hw = y < 15 ? 3 + (y - 12) : y > 22 ? 6 - (y - 22) * 2 : 6; P('#e8364e', 16.5 - hw, y, hw * 2, 1); } P('#ff8a9a', 12, 15, 2, 6); P('#ffffff', 12, 15, 1, 2); P('#8ad0f0', 11, 12, 11, 1); for (const [x, y] of [[6, 20], [7, 18], [8, 22], [25, 9], [24, 11], [26, 12]]) P('#9af07a', x, y, 2, 2); }));
  at(TL.I_EMPORIO, () => insegna('#8a5e34', () => { for (let y = 11; y < 26; y++) { const hw = y < 14 ? 3 : Math.min(8, 4 + (y - 14)); P('#c8a868', 16 - hw, y, hw * 2, 1); } P('#e0c898', 9, 16, 2, 8); P('#8a6a3c', 21, 16, 2, 9); P('#5a3a20', 12, 11, 8, 2); P('#c8a868', 12, 7, 2, 4); P('#c8a868', 18, 7, 2, 4); P('#c8a868', 15, 8, 2, 3); disc('#ffd23f', 16, 19, 3.6); disc('#b8801a', 16, 19, 2.2); P('#ffd23f', 15.5, 17.5, 1, 3); }));
  at(TL.I_ORAFO, () => insegna('#4a3a6a', () => { for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) { const d = Math.hypot(x - 6, y - 6); if (d < 6.4 && d > 4) P(x < 6 ? '#ffd23f' : '#c8a040', 10 + x, 13 + y, 1, 1); } P('#fff0a0', 12, 15, 2, 1); for (let y = 0; y < 7; y++) { const hw = y < 2 ? 2 + y : 5 - y * 0.7; P(y < 3 ? '#9af0ff' : '#3ad8e8', Math.round(16.5 - hw), 6 + y, Math.round(hw * 2), 1); } P('#ffffff', 15, 7, 2, 1); P('#ffffff', 7, 9, 1, 3); P('#ffffff', 6, 10, 3, 1); P('#ffffff', 25, 20, 1, 3); P('#ffffff', 24, 21, 3, 1); }));
  at(TL.I_SARTO, () => insegna('#7a3a5a', () => { for (let k = 0; k < 13; k++) { P('#e8eef6', 8 + k, 8 + k, 2, 1); P('#e8eef6', 22 - k, 8 + k, 2, 1); } for (const cx of [9, 23]) { disc('#c8342c', cx, 24, 3.6); disc('#7a3a5a', cx, 24, 1.8); } P('#5a3a20', 15, 14, 3, 3); P('#ffd23f', 4, 6, 1, 6); P('#f0ece0', 5, 12, 1, 1); for (let x = 5; x < 12; x++) P('#f0ece0', x, 13 + Math.round(Math.sin(x) * 1.2), 1, 1); }));
  at(TL.I_PESCE, () => insegna('#3a6a8a', () => { for (let x = 0; x < 16; x++) { const hw = Math.round(1 + 4.5 * Math.sin(Math.PI * x / 16)); P('#c8d8e8', 6 + x, 16 - hw, 1, hw * 2); P('#f0f6ff', 6 + x, 16 - hw, 1, Math.max(1, hw - 1)); } for (let k = 0; k < 5; k++) { P('#c8d8e8', 22 + k, 16 - k, 1, 1 + k * 2); } P('#1a1418', 9, 14, 2, 2); P('#8ab0c8', 13, 13, 1, 6); P('#8ab0c8', 16, 13, 1, 6); for (const [x, y] of [[8, 24], [14, 26], [21, 24], [10, 7], [19, 8]]) { P('#9ad8f8', x, y, 3, 1); P('#9ad8f8', x + 1, y - 1, 1, 1); } }));
  at(TL.I_FUCINA, () => insegna('#5a4a44', () => { P('#3a3c48', 7, 19, 18, 3); P('#5a5c68', 7, 19, 18, 1); P('#3a3c48', 4, 19, 4, 2); P('#3a3c48', 11, 22, 10, 2); P('#3a3c48', 9, 24, 14, 3); P('#5a5c68', 9, 24, 14, 1); for (let k = 0; k < 9; k++) P('#8a5e34', 13 + k, 15 - k, 2, 2); P('#c8d0dc', 19, 4, 7, 5); P('#e8eef6', 19, 4, 7, 1); P('#8a94a2', 19, 8, 7, 1); for (const [x, y] of [[9, 14], [11, 11], [7, 10], [14, 16]]) P('#ffb02e', x, y, 2, 2); P('#fff0a0', 10, 13, 1, 1); }));
  // --- la bacheca: sughero, fogli appuntati, un sigillo ---
  at(TL.BACHECA, () => { P(W1, 0, 0, T, T); P('#b08a56', 2, 2, T - 4, T - 4); speck('#b08a56', 60, 0.2); P(sh(W1, 1.35), 0, 0, T, 1); P(sh(W1, 0.7), 0, T - 1, T, 1);
    const foglio = (x, y, w, h, c0, pin) => { P('rgba(0,0,0,.25)', x + 1, y + 1, w, h); P(c0, x, y, w, h); for (let k = 2; k < h - 1; k += 2) P(sh(c0, 0.62), x + 1, y + k, w - 2 - (k % 4 ? 2 : 0), 1); P(pin, x + (w >> 1), y, 1, 1); P(pin, x + (w >> 1) - 1, y + 1, 3, 1); };
    foglio(4, 4, 9, 11, '#f4ecd0', '#c8342c'); foglio(15, 3, 7, 8, '#e8dcb0', '#2a5ab0'); foglio(23, 5, 6, 10, '#f8f4e4', '#c8342c'); foglio(5, 17, 8, 10, '#e8dcb0', '#3a9a4a'); foglio(15, 13, 9, 14, '#f4ecd0', '#c8342c'); foglio(25, 17, 5, 9, '#f0e4c0', '#2a5ab0'); P('#c8342c', 18, 23, 3, 3); P('#e85a4a', 18, 23, 1, 1); });
  at(TL.PERGAMENA, () => { P('#e8dcb0', 3, 3, 26, 27); P('#f4ecd0', 4, 4, 24, 25); for (let y = 8; y < 26; y += 3) P('#8a7a5a', 7, y, 14 + rnd(6), 1); P('#b8342c', 21, 22, 4, 4); P('#8a6a2a', 2, 2, 28, 2); P('#8a6a2a', 2, 28, 28, 2); P('#c8a040', 1, 1, 3, 4); P('#c8a040', 28, 1, 3, 4); P('#c8a040', 1, 27, 3, 4); P('#c8a040', 28, 27, 3, 4); });
  return c;
}

// ---------- arredi che si appoggiano a terra o sul banco (stessa grana dei lampioni e delle botti) ----------
function sprites(set, A2, R) {
  const { fit } = A2, Cy = (a, b, r, c, k, rot) => ({ t: 'y', a, b, r, c, k, rot }), El = (o, r, c, k, z, rot) => ({ t: 'e', o, r, c, k, z, rot }), Bx = (b, c, k, rot) => ({ t: 'b', b, c, k, rot }), Kc = (a, b, r, r2, c, k, rot) => ({ t: 'k', a, b, r, r2, c, k, rot }), Ca = (a, b, r, c, k, rot) => ({ t: 'c', a, b, r, c, k, rot });
  const IR = '#3a3c48', WD = '#6a4424', WD2 = '#8a5e34', WD3 = '#a87a4a', Y = Math.PI - 0.5;
  set('stool', [fit([Cy([0, 0, 1.5], [0, 0, 1.85], 1.0, WD2), Ca([-0.6, -0.5, 0], [-0.4, -0.3, 1.5], 0.15, WD), Ca([0.6, -0.5, 0], [0.4, -0.3, 1.5], 0.15, WD), Ca([0, 0.7, 0], [0, 0.45, 1.5], 0.15, WD)], Y)], 0.2, 1);
  set('sack', [fit([El([0, 0, 1.1], [1.3, 1.2, 1.15], '#c8a878'), El([0.2, 0, 2.25], [0.55, 0.5, 0.36], '#b89868'), Cy([0.1, 0, 1.95], [0.1, 0, 2.12], 0.44, WD)], Y), fit([El([0, -0.9, 1.0], [1.2, 1.1, 1.05], '#c8a878'), El([0, 0.9, 0.9], [1.1, 1.15, 0.95], '#d8b888'), El([0.1, 0, 2.2], [1.1, 1.0, 0.85], '#b89868'), Cy([0.1, 0, 2.95], [0.1, 0, 3.1], 0.36, WD)], Y)], 0.2, 1.4);
  // il tavolo tondo dell'osteria, apparecchiato: boccali, un piatto, una candela
  const TB = [Cy([0, 0, 0], [0, 0, 0.3], 1.3, WD), Cy([0, 0, 0.3], [0, 0, 2.5], 0.34, WD), Cy([0, 0, 2.5], [0, 0, 2.85], 2.5, WD2), Cy([0, 0, 2.84], [0, 0, 2.9], 2.3, WD3)];
  const mug = (x, y) => [Cy([x, y, 2.9], [x, y, 3.6], 0.36, WD2), Cy([x, y, 3.55], [x, y, 3.66], 0.38, '#f6f0e0')];
  set('table', [fit([...TB, ...mug(-1.1, -0.8), ...mug(0.9, 1.1), El([0.9, -0.9, 3.0], [0.7, 0.7, 0.12], '#e8e0d0'), El([0.9, -0.9, 3.2], [0.42, 0.34, 0.24], '#c8903a'), Cy([-0.5, 0.9, 2.9], [-0.5, 0.9, 3.7], 0.14, '#f0ece0'), El([-0.5, 0.9, 3.95], [0.16, 0.16, 0.28], '#ffd870', 1.6)], Y),
    fit([...TB, ...mug(0.2, -1.2), El([-0.8, 0.6, 3.0], [0.8, 0.8, 0.12], '#e8e0d0'), El([-0.9, 0.5, 3.22], [0.34, 0.3, 0.2], '#b8623a'), El([-0.5, 0.9, 3.2], [0.3, 0.26, 0.18], '#e8c060'), Kc([1.0, 0.6, 2.9], [1.0, 0.6, 3.9], 0.3, 0.14, '#3a8a4a'), Cy([1.0, 0.6, 3.9], [1.0, 0.6, 4.2], 0.14, '#d8c8a0')], Y)], 0.2, 2.6);
  // manichino con l'armatura; manichino con il mantello
  set('dummy', [fit([Cy([0, 0, 0], [0, 0, 0.3], 1.0, WD), Cy([0, 0, 0.3], [0, 0, 3.4], 0.17, WD), El([0, 0, 4.4], [0.85, 1.25, 1.5], '#c8d0dc'), Cy([0, -1.5, 5.2], [0, 1.5, 5.2], 0.42, '#9aa4b2'), Cy([0, 0, 3.0], [0, 0, 3.3], 0.95, '#5a4a3a'), El([0, 0, 6.5], [0.72, 0.72, 0.78], '#9aa4b2'), Bx([0.5, 0.8, -0.34, 0.34, 6.3, 6.6], '#2a2a32'), Kc([0, 0, 7.2], [0, 0, 7.9], 0.2, 0.05, '#c8342c'), Bx([0.55, 0.9, -0.5, 0.5, 4.2, 5.0], '#ffd23f')], Math.PI - 0.35),
    fit([Cy([0, 0, 0], [0, 0, 0.3], 1.0, WD), Cy([0, 0, 0.3], [0, 0, 5.6], 0.17, WD), Kc([0, 0, 1.4], [0, 0, 5.4], 1.7, 0.9, '#3a7a30'), Cy([0, -1.3, 5.3], [0, 1.3, 5.3], 0.4, '#2e6a24'), El([0, 0, 6.3], [0.62, 0.62, 0.66], '#c8a878'), Kc([0, 0, 6.5], [0, 0, 7.5], 0.75, 0.1, '#2e6a24'), Bx([0.8, 1.0, -0.2, 0.2, 4.9, 5.3], '#ffd23f')], Math.PI - 0.35),
    fit([Cy([0, 0, 0], [0, 0, 0.3], 1.0, WD), Cy([0, 0, 0.3], [0, 0, 5.6], 0.17, WD), Kc([0, 0, 1.2], [0, 0, 5.4], 1.8, 1.0, '#e8e8f0'), Cy([0, -1.4, 5.3], [0, 1.4, 5.3], 0.5, '#f4f8ff'), El([0, 0, 6.3], [0.62, 0.62, 0.66], '#c8a878'), El([0, 0, 6.8], [0.8, 0.8, 0.5], '#c8d0dc'), Cy([0, 0, 2.6], [0, 0, 2.9], 1.55, '#6a4424')], Math.PI - 0.35)], 0.2, 1.5);
  set('cauldron', [fit([Ca([-1.2, -0.8, 0], [-0.9, -0.6, 1.0], 0.15, IR), Ca([1.2, -0.8, 0], [0.9, -0.6, 1.0], 0.15, IR), Ca([0, 1.3, 0], [0, 1.0, 1.0], 0.15, IR), El([0, 0, 1.8], [1.7, 1.7, 1.4], '#2a2a32'), Cy([0, 0, 2.5], [0, 0, 2.75], 1.5, '#3a3a44'), Cy([0, 0, 2.7], [0, 0, 2.78], 1.3, '#5af07a', 1.5), El([0.4, 0.3, 2.95], [0.26, 0.26, 0.2], '#c8ffd0', 1.6), El([-0.5, -0.2, 2.9], [0.2, 0.2, 0.16], '#c8ffd0', 1.6)], Y)], 0.2, 1.8);
  const fl = (x, y, c, h = 0.9) => [Cy([x, y, 0], [x, y, h], 0.34, c), Kc([x, y, h], [x, y, h + 0.45], 0.34, 0.12, c), Cy([x, y, h + 0.45], [x, y, h + 0.75], 0.13, '#d8c8a0')];
  set('bottles', [fit([...fl(0, -0.9, '#e8364e'), ...fl(0.1, 0, '#3a8ad8', 1.2), ...fl(-0.1, 0.9, '#3ab860')], Y), fit([...fl(0, -0.6, '#b060e0', 1.1), ...fl(0, 0.5, '#f0c030'), El([0.3, 1.4, 0.4], [0.5, 0.5, 0.4], '#c8a878'), Cy([0.3, 1.4, 0.7], [0.3, 1.4, 0.85], 0.36, '#8a6a44')], Y)], 0.2, 0);
  set('candle', [fit([Cy([0, 0, 0], [0, 0, 0.16], 0.55, '#c8a040'), Cy([0, 0, 0.16], [0, 0, 0.5], 0.16, '#c8a040'), Cy([0, 0, 0.5], [0, 0, 1.5], 0.2, '#f6f0e0'), El([0, 0, 1.85], [0.2, 0.2, 0.36], '#ffd870', 1.7)], Y)], 0.2, 0);
  // una botte piena di spade, lance e mazze
  set('rack', [fit([Cy([0, 0, 0], [0, 0, 0.6], 1.15, WD), Cy([0, 0, 0.6], [0, 0, 2.6], 1.3, WD2), Cy([0, 0, 0.55], [0, 0, 0.75], 1.34, IR), Cy([0, 0, 2.2], [0, 0, 2.4], 1.34, IR), Bx([-0.08, 0.08, -0.7, -0.4, 2.4, 5.4], '#d8dce4'), Bx([-0.14, 0.14, -0.9, -0.2, 5.4, 5.62], '#c8a040'), Bx([-0.1, 0.1, -0.63, -0.47, 5.62, 6.4], WD), Ca([0.2, 0.5, 2.2], [0.5, 0.9, 6.6], 0.09, WD), Kc([0.5, 0.9, 6.6], [0.56, 0.98, 7.4], 0.2, 0.02, '#d8dce4'), Ca([-0.3, 0.1, 2.2], [-0.7, 0.1, 5.6], 0.1, WD), El([-0.76, 0.1, 5.9], [0.42, 0.42, 0.46], '#6a6e78')], Y)], 0.2, 1.5);
  set('rolls', [fit([Cy([-0.5, -0.9, 0], [-0.5, -0.9, 3.4], 0.46, '#c85a8a'), Cy([0.1, 0, 0], [0.1, 0, 3.9], 0.46, '#3a6ab0'), Cy([-0.3, 0.9, 0], [-0.3, 0.9, 3.0], 0.46, '#e8b42a'), Cy([0.7, 0.8, 0], [0.7, 0.8, 2.4], 0.42, '#3a9a6a'), Cy([-0.5, -0.9, 3.38], [-0.5, -0.9, 3.42], 0.3, '#f0ece0'), Cy([0.1, 0, 3.88], [0.1, 0, 3.92], 0.3, '#f0ece0')], Y)], 0.2, 1.3);
  set('keg', [fit([Bx([-1.3, 1.3, -1.0, -0.7, 0, 0.9], WD), Bx([-1.3, 1.3, 0.7, 1.0, 0, 0.9], WD), Cy([0, -1.6, 1.9], [0, 1.6, 1.9], 1.35, WD2), Cy([0, -1.1, 1.9], [0, -0.9, 1.9], 1.4, IR), Cy([0, 0.9, 1.9], [0, 1.1, 1.9], 1.4, IR), Cy([0, 1.6, 1.9], [0, 1.66, 1.9], 1.1, WD3), Cy([0, 1.66, 1.3], [0, 2.1, 1.3], 0.13, '#c8a040')], Math.PI - 1.0)], 0.2, 1.6);
  set('goldchest', [fit([Bx([-1.0, 1.0, -1.4, 1.4, 0, 1.2], WD2), Bx([-1.05, 1.05, -1.45, 1.45, 1.0, 1.2], '#c8a040'), Bx([-0.9, 0.9, -1.3, 1.3, 1.2, 1.5], '#ffd23f', 1.3), El([0.2, -0.5, 1.6], [0.3, 0.3, 0.26], '#e8364e', 1.4), El([-0.2, 0.4, 1.6], [0.3, 0.3, 0.26], '#3ad8e8', 1.4), El([0.3, 0.7, 1.58], [0.24, 0.24, 0.22], '#5af07a', 1.4), Bx([1.0, 1.1, -0.2, 0.2, 0.5, 0.9], '#c8a040')], Y)], 0.2, 0);
}

// ---------- le città dentro casa: pavimenti, pareti e colori ----------
const STILI = {
  lumen: { floor: TL.ASSI, wall: TL.TRAVI, base: TL.ZOCCOLO, rug: TL.TAPPETO2, bed: TL.LETTO2, lume: [1, 0.78, 0.46] },
  ambra: { floor: TL.ASSI, wall: TL.TRAVI, base: TL.ZOCCOLO, rug: TL.TAPPETO, bed: TL.LETTO, lume: [1, 0.74, 0.4] },
  nord: { floor: TL.LASTRE, wall: TL.LOGS, base: TL.ZOCC_T, rug: TL.TAPPETO2, bed: TL.LETTO2, lume: [1, 0.7, 0.38] },
  sole: { floor: TL.COTTO, wall: TL.ADOBE, base: TL.ZOCC_S, rug: TL.TAPPETO, bed: TL.LETTO, lume: [1, 0.8, 0.44] },
  porto: { floor: TL.ASSI, wall: TL.INTON, base: TL.ZOCC_B, rug: TL.TAPPETO2, bed: TL.LETTO2, lume: [1, 0.8, 0.5] },
  fiore: { floor: TL.TATAMI, wall: TL.CARTA, base: TL.ZOCC_T, rug: TL.TAPPETO, bed: TL.LETTO, lume: [1, 0.76, 0.5] },
};
// tipi di bottega: insegna, riquadro dietro al banco, tendone
const TIPI = {
  locanda: { ins: TL.I_LOCANDA, n: 'LOCANDA' }, armeria: { ins: TL.I_ARMI, n: 'ARMERIA' }, fucina: { ins: TL.I_FUCINA, n: 'FUCINA' }, erboristeria: { ins: TL.I_ERBE, n: 'ERBORISTERIA' },
  emporio: { ins: TL.I_EMPORIO, n: 'EMPORIO' }, orafo: { ins: TL.I_ORAFO, n: 'OREFICERIA' }, sartoria: { ins: TL.I_SARTO, n: 'SARTORIA' }, pescheria: { ins: TL.I_PESCE, n: 'PESCHERIA' }, dojo: { ins: TL.I_ARMI, n: 'DOJO' },
};

// ---------- la pianta di una stanza ----------
// Le misure sono in unità dentro la stanza (0,0 = l'angolo a nord-ovest del pavimento). Chi arreda usa:
// box (mobile pieno), flat (tappeto), dec (riquadro su una parete), spr (oggetto appoggiato), lume, posto (dove sta una persona)
function Stanza(cw, ch, S) {
  const mesh = [], rects = [], sprs = [], lumi = [], posti = {}, O = CS, LW = cw * CS, LD = ch * CS;
  const s = {
    cw, ch, LW, LD, S, mesh, rects, sprs, lumi, posti,
    box(x0, z0, x1, z1, y0, y1, side, top, solid = true) { mesh.push(['box', O + x0, O + z0, O + x1, O + z1, y0, y1, side, top === undefined ? side : top]); if (solid) rects.push([O + x0, O + z0, O + x1, O + z1]); return s; },
    flat(x0, z0, x1, z1, tile, u = 1, v = 1, y = 0.05) { mesh.push(['flat', O + x0, O + z0, O + x1, O + z1, y, tile, u, v]); return s; },
    dec(side, a, tile, y0 = 0.5, h = 10.5, w = 9.6, lit) { mesh.push(['dec', side, a, tile, y0, h, w, lit ? 1 : 0]); return s; },
    spr(k, x, z, o = {}) { sprs.push(Object.assign({ k, x: O + x, z: O + z, y: 0, v: 0, r: 1.5 }, o)); return s; },
    // i lumi di una stanza sono tanti e vicini: ognuno dà poca luce (k), insieme fanno il tepore
    lume(x, y, z, c = S.lume, r = 64, o = {}) { const k = o.k || 0.3; lumi.push(Object.assign({ x: O + x, y, z: O + z, r, c: c.map(v => v * k), hc: c, halo: 6 }, o)); return s; },
    posto(k, x, z, yaw, y = 0) { posti[k] = [O + x, O + z, yaw, y]; return s; },
    // lume a muro: una candela su una mensolina
    applique(side, a, y = 8.4) { const p = side === 'n' ? [a, 1.2] : side === 's' ? [a, LD - 1.2] : side === 'w' ? [1.2, a] : [LW - 1.2, a]; s.box(p[0] - 0.7, p[1] - 0.7, p[0] + 0.7, p[1] + 0.7, y - 0.5, y, TL.PIANO, TL.PIANO, false); s.spr('candle', p[0], p[1], { y, r: 0 }); return s.lume(p[0], y + 1.6, p[1], S.lume, 62, { flick: true, halo: 5 }); },
  };
  return s;
}
const SUD = Math.PI / 2, NORD = -Math.PI / 2, EST = 0, OVEST = Math.PI, BH = 3.8, PED = 1.2;      // l'altezza del banco, e quella della pedana su cui sta il bottegaio
// la bottega: sei scaffali in fondo, il banco davanti, il bottegaio in mezzo. «cosa» dice quali scaffali e quali arredi
function bottega(tipo, S) {
  const s = Stanza(7, 6, S), X = s.LW, Z = s.LD;
  const SC = { armeria: [TL.SC_ARMI, TL.SCUDI, TL.SC_ARMI, TL.SC_ARMI, TL.SC_ARMI, TL.SCUDI, TL.SC_ARMI], fucina: [TL.SC_ARMI, TL.SCUDI, TL.SC_ARMI, TL.SC_ARMI, TL.SC_ARMI, TL.SCUDI, TL.SC_ARMI], dojo: [TL.SC_ARMI, TL.SC_ARMI, TL.PERGAMENA, TL.SC_ARMI, TL.PERGAMENA, TL.SC_ARMI, TL.SC_ARMI],
    erboristeria: [TL.SC_POZ, TL.LIBRI, TL.SC_POZ, TL.SC_POZ, TL.SC_POZ, TL.LIBRI, TL.SC_POZ], emporio: [TL.SC_MERCI, TL.SC_STOFFE, TL.SC_MERCI, TL.SC_POZ, TL.SC_MERCI, TL.LIBRI, TL.SC_MERCI],
    orafo: [TL.LIBRI, TL.SC_GEMME, TL.SC_GEMME, TL.QUADRO, TL.SC_GEMME, TL.SC_GEMME, TL.LIBRI], sartoria: [TL.SC_STOFFE, TL.SC_STOFFE, TL.SC_STOFFE, TL.QUADRO, TL.SC_STOFFE, TL.SC_STOFFE, TL.SC_STOFFE],
    pescheria: [TL.SC_MERCI, TL.PESCI, TL.SC_POZ, TL.PESCI, TL.SC_POZ, TL.PESCI, TL.SC_MERCI] }[tipo];
  SC.forEach((t, k) => { const pic = t === TL.SCUDI || t === TL.QUADRO || t === TL.PESCI || t === TL.PERGAMENA; s.dec('n', 5 + k * 10, t, pic ? 4.8 : 0.4, pic ? 7 : 11, pic ? 7 : 9.7); });
  // il banco (con il passaggio a destra) e chi ci sta dietro
  s.box(0, 0, X, 24, 0, PED, S.base, S.floor, false).box(0, 24, X, 28.2, 0, BH, TL.BANCO, TL.PIANO).posto('banco', 35, 19.4, SUD, PED);
  s.spr('candle', 12, 26.1, { y: BH, r: 0 }).lume(12, BH + 2.1, 26.1, S.lume, 58, { flick: true, halo: 5 });
  s.applique('n', 64.5, 8.6).applique('w', 45).applique('e', 45);
  s.dec('w', 14, TL.FINESTRA, 4.6, 6.6, 7.4, true).dec('e', 14, TL.FINESTRA, 4.6, 6.6, 7.4, true);
  s.lume(3, 8, 14, [0.62, 0.74, 0.95], 46, { day: 1, halo: 0 }).lume(X - 3, 8, 14, [0.62, 0.74, 0.95], 46, { day: 1, halo: 0 });
  s.flat(X / 2 - 7, Z - 12.5, X / 2 + 7, Z - 1.5, TL.STUOIA);
  if (tipo !== 'dojo') s.flat(18, 33, 52, 47, S.rug, 2.4, 1);
  if (tipo === 'armeria' || tipo === 'fucina' || tipo === 'dojo') {
    s.spr('dummy', 6, 34, { r: 1.6 }).spr('rack', 64, 34).spr('rack', 6, 54).spr('barrel', 63, 54).dec('s', 12, TL.SCUDI, 4.8, 7, 7).dec('s', 58, TL.SCUDI, 4.8, 7, 7);
    if (tipo === 'fucina') { s.dec('e', 30, TL.CAMINO, 0, 9.6, 10).spr('flame', X - 2.6, 30, { y: 0.9, s: 0.32, r: 0, fl: 1 }).lume(X - 5, 4, 30, [1, 0.5, 0.16], 78, { flick: true, halo: 9, k: 0.55 }).spr('anvil', 58, 40, { r: 2 }); }
  } else if (tipo === 'erboristeria') {
    s.spr('cauldron', 62, 36, { r: 2 }).lume(62, 5, 36, [0.3, 0.95, 0.45], 40, { halo: 6 }).spr('pot', 6, 34).spr('pot', 6, 54).spr('pot', 64, 54).spr('jar', 9, 44).dec('w', 30, TL.ERBE, 5, 8, 8).dec('e', 28, TL.ERBE, 5, 8, 8).dec('s', 12, TL.ERBE, 5, 8, 8).dec('s', 58, TL.LIBRI, 0.4, 11, 9.7);
    s.spr('bottles', 24, 26.1, { y: BH, r: 0 }).spr('bottles', 46, 26.1, { y: BH, r: 0, v: 1 });
  } else if (tipo === 'emporio') {
    s.spr('crate', 6, 34).spr('crate', 7, 54, { v: 1 }).spr('sack', 63, 36, { v: 1 }).spr('barrel', 64, 46).spr('sack', 62, 55).spr('jar', 12, 55).dec('w', 30, TL.QUADRO, 4.8, 7, 7).dec('s', 12, TL.SC_MERCI, 0.4, 11, 9.7).dec('s', 58, TL.SC_STOFFE, 0.4, 11, 9.7);
    s.spr('bottles', 46, 26.1, { y: BH, r: 0, v: 1 });
  } else if (tipo === 'orafo') {
    s.spr('goldchest', 24, 26.1, { y: BH, r: 0, lux: 1 }).spr('goldchest', 44, 26.1, { y: BH, r: 0, lux: 1 }).spr('pot', 6, 54).spr('pot', 64, 54).dec('w', 30, TL.QUADRO, 4.8, 7, 7).dec('e', 30, TL.SC_GEMME, 0.4, 11, 9.7).dec('s', 12, TL.LIBRI, 0.4, 11, 9.7).dec('s', 58, TL.LIBRI, 0.4, 11, 9.7);
  } else if (tipo === 'sartoria') {
    s.spr('dummy', 7, 35, { v: 1, r: 1.6 }).spr('dummy', 63, 35, { v: 2, r: 1.6 }).spr('rolls', 6, 54).spr('rolls', 64, 54).spr('crate', 62, 45).dec('s', 12, TL.SC_STOFFE, 0.4, 11, 9.7).dec('s', 58, TL.SC_STOFFE, 0.4, 11, 9.7);
  } else if (tipo === 'pescheria') {
    s.spr('barrel', 6, 34).spr('barrel', 9, 40).spr('crate', 6, 54, { v: 1 }).spr('barrel', 64, 36).spr('sack', 63, 54).spr('anchor', 62, 45, { r: 1 }).dec('w', 30, TL.PESCI, 5, 8, 8).dec('e', 30, TL.PESCI, 5, 8, 8).dec('s', 12, TL.SC_MERCI, 0.4, 11, 9.7);
    s.spr('bottles', 24, 26.1, { y: BH, r: 0 });
  }
  return s;
}
// la locanda: il bancone con le botti, il camino, i letti, i tavoli con chi beve
function locanda(S) {
  const s = Stanza(11, 8, S), X = s.LW, Z = s.LD;
  // bancone a est, botti e boccali alla parete
  [TL.SC_BOTTI, TL.SC_MERCI, TL.SC_BOTTI, TL.LIBRI].forEach((t, k) => s.dec('n', 75 + k * 10, t, 0.4, 11, 9.7));
  s.box(66, 0, X, 23, 0, PED, S.base, S.floor, false).box(62, 23, X, 27.2, 0, BH, TL.BANCO, TL.PIANO).box(62, 0, 66, 23, 0, BH, TL.BANCO, TL.PIANO).posto('banco', 86, 18.4, SUD, PED);
  s.spr('candle', 70, 25.1, { y: BH, r: 0 }).lume(70, BH + 2.1, 25.1, S.lume, 60, { flick: true, halo: 5 }).spr('bottles', 98, 25.1, { y: BH, r: 0, v: 1 }).spr('keg', 104, 7, { y: PED, r: 0 }).spr('stool', 71, 31.5, { r: 1 }).spr('stool', 78, 31.8, { r: 1 }).spr('stool', 99, 31.5, { r: 1 });
  // i letti, testa al muro, dietro un paravento
  for (let k = 0; k < 3; k++) { s.box(4 + k * 13, 2, 12.6 + k * 13, 17.5, 0, 2.6, S.base, S.bed); s.box(13.4 + k * 13, 2, 15.6 + k * 13, 4.6, 0, 3, TL.PIANO, TL.PIANO, false); }
  s.posto('letto', 14.2, 12, SUD).box(44, 0, 45.4, 20, 0, 8.5, S.base, TL.PIANO).dec('n', 21, TL.FINESTRA, 5.2, 6, 7, true).lume(21, 8, 4, [0.62, 0.74, 0.95], 44, { day: 1, halo: 0 });
  // il camino a ovest, il tappeto davanti
  s.dec('w', 46, TL.CAMINO, 0, 9.8, 11).spr('flame', 2.6, 46, { y: 0.9, s: 0.34, r: 0, fl: 1 }).lume(5, 4, 46, [1, 0.52, 0.18], 92, { flick: true, halo: 10, k: 0.55 });
  s.flat(9, 36, 27, 56, S.rug, 1.2, 1.4);
  // tavoli e sgabelli
  for (const [x, z, v] of [[36, 46, 0], [22, 68, 1], [74, 58, 1], [94, 46, 0], [92, 70, 1]]) { s.spr('table', x, z, { v, r: 2.7 }); for (const [dx, dz] of [[-4.6, 0.4], [4.6, -0.4], [0.4, 4.4]]) s.spr('stool', x + dx, z + dz, { r: 0.9 }); }
  s.posto('ospite1', 36, 41, SUD).posto('ospite2', 94, 41, SUD).posto('ospite3', 74, 53, SUD);
  s.spr('barrel', 105, 74).spr('barrel', 100, 76).spr('crate', 6, 75, { v: 1 }).spr('sack', 105, 62, { v: 1 });
  s.dec('s', 22, TL.FINESTRA, 4.8, 6.4, 7.4, true).dec('s', 88, TL.FINESTRA, 4.8, 6.4, 7.4, true).lume(22, 8, Z - 3, [0.62, 0.74, 0.95], 46, { day: 1, halo: 0 }).lume(88, 8, Z - 3, [0.62, 0.74, 0.95], 46, { day: 1, halo: 0 });
  s.dec('e', 44, TL.QUADRO, 4.8, 7, 7).dec('e', 64, TL.SCUDI, 4.8, 7, 7).dec('w', 68, TL.LIBRI, 0.4, 11, 9.7);
  s.applique('n', 60, 8.6).applique('e', 54).applique('s', 44).applique('s', 66).lume(55, 12, 46, S.lume, 70, { halo: 0 });
  s.flat(X / 2 - 7, Z - 12.5, X / 2 + 7, Z - 1.5, TL.STUOIA);
  return s;
}

// ---------- dalla pianta al «piano» che il motore dei santuari sa mostrare ----------
const LIT = { n: 0.9, s: 0.64, e: 0.72, w: 0.78 };       // quanto è chiara una parete vista da dentro (n = la parete in fondo)
function piano(shop) {
  const S = STILI[shop.style] || STILI.lumen, tipo = shop.kind, s = tipo === 'locanda' ? locanda(S) : bottega(tipo, S), cw = s.cw, ch = s.ch, dc = Math.ceil(cw / 2);
  const casa = { shop, s, base: S.base, top: TL.BUIO,
    // i mobili e i riquadri, aggiunti alla geometria della stanza
    build(api) {
      const { floor, wall, quadTo, boxTo, flatTo } = api, x0 = CS, z0 = CS, x1 = CS + s.LW, z1 = CS + s.LD, e = 0.14;
      for (const m of s.mesh) {
        if (m[0] === 'box') boxTo(wall, m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], 0.96);
        else if (m[0] === 'flat') flatTo(floor, m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], 0.9);
        else { const [, side, a, tile, y0, h, w, lit] = m, L = lit ? 1 : LIT[side], h0 = w / 2;
          if (side === 'n') quadTo(wall, [x0 + a - h0, y0, z0 + e], [x0 + a + h0, y0, z0 + e], [x0 + a + h0, y0 + h, z0 + e], [x0 + a - h0, y0 + h, z0 + e], tile, 1, 1, L);
          else if (side === 's') quadTo(wall, [x0 + a + h0, y0, z1 - e], [x0 + a - h0, y0, z1 - e], [x0 + a - h0, y0 + h, z1 - e], [x0 + a + h0, y0 + h, z1 - e], tile, 1, 1, L);
          else if (side === 'w') quadTo(wall, [x0 + e, y0, z0 + a + h0], [x0 + e, y0, z0 + a - h0], [x0 + e, y0 + h, z0 + a - h0], [x0 + e, y0 + h, z0 + a + h0], tile, 1, 1, L);
          else quadTo(wall, [x1 - e, y0, z0 + a - h0], [x1 - e, y0, z0 + a + h0], [x1 - e, y0 + h, z0 + a + h0], [x1 - e, y0 + h, z0 + a - h0], tile, 1, 1, L); }
      }
    },
    // ostacoli, oggetti, lumi e persone, una volta creato il piano
    setup(R, env) {
      R.rects = s.rects.slice(); R.sprs = s.sprs; R.lumi = s.lumi; R.folk = []; R.letto = s.posti.letto || null;
      for (const p of s.sprs) if (p.r > 0) R.solids.push({ x: p.x, z: p.z, r: p.r });
      for (const l of s.lumi) R.lights.push({ x: l.x, y: l.y, z: l.z, r: l.r, c: l.c, flick: l.flick, day: l.day });
      for (const id of shop.folk) { const f = W.FOLK[id] || {}, sp = s.posti[f.spot || 'banco']; if (!sp) continue; R.folk.push({ id, x: sp[0], z: sp[1], y: sp[3], yaw: sp[2], base: sp[2] }); if (f.spot && f.spot !== 'banco') R.solids.push({ x: sp[0], z: sp[1], r: 2.2 }); }
    } };
  return { name: shop.name, casa, floor: S.floor, wall: S.wall, fog: '#0d0906', amb: 0.6, water: '#2a6a8a', torch: S.lume, glow: '#ffd89a', pot: ['#b8623a', '#8a4224'], foes: {},
    make(m) { m.room(0, 0, cw + 1, ch + 1); m.at(dc, ch + 1, '@'); } };
}
// ogni bottega dichiarata dalle città diventa un piano «in_<chiave>»
W.SHOPS = W.SHOPS || {};
function registra() { for (const k in W.SHOPS) if (!DS.DEF['in_' + k]) DS.DEF['in_' + k] = piano(W.SHOPS[k]); }

// ---------- fuori: l'insegna sopra la porta e quella a bandiera ----------
// side: da che parte guarda la porta; c: il centro della porta lungo il muro; y0: la soglia
function insegna(side, x0, z0, x1, z1, c, y0, tipo, h) {
  const tile = (TIPI[tipo] || TIPI.emporio).ins, ys = y0 + Math.min(8.8, h - 6.2), off = 6.4, len = 5.2;
  if (h >= 16.6) K.onWall(side, x0, z0, x1, z1, c, y0 + 11.6, 5, 5, tile);        // sopra il tendone, se la facciata è abbastanza alta
  const X = side === 'n' || side === 's', sg = side === 's' || side === 'e' ? 1 : -1, wall0 = side === 's' ? z1 : side === 'n' ? z0 : side === 'e' ? x1 : x0;
  const a = c + off, b0 = wall0, b1 = wall0 + sg * len;
  if (X) { K.box(a - 0.22, Math.min(b0, b1), a + 0.22, Math.max(b0, b1), ys + 5.1, ys + 5.5, 3); TN.decal(a, ys, (b0 + b1) / 2 + sg * 0.3, 0, 1, 4.6, 4.6, tile, false, 0); }
  else { K.box(Math.min(b0, b1), a - 0.22, Math.max(b0, b1), a + 0.22, ys + 5.1, ys + 5.5, 3); TN.decal((b0 + b1) / 2 + sg * 0.3, ys, a, 1, 0, 4.6, 4.6, tile, false, 0); }
  const dx = X ? c : wall0 + sg * 1.6, dz = X ? wall0 + sg * 1.6 : c;
  W.glows.push([dx + (X ? -off : 0), y0 + 8.6, dz + (X ? 0 : -off), 4.2, 1, 0.76, 0.4, 1]);
}
// la facciata di una bottega: insegne, e la soglia (dove si entra, dove ci si ritrova uscendo)
function fronte(key, side, x0, z0, x1, z1, c, y0, h) {
  const sh = W.SHOPS[key]; if (!sh) return;
  insegna(side, x0, z0, x1, z1, c, y0, sh.kind, h);
  const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[side], X = side === 'n' || side === 's', wx = X ? c : (side === 'e' ? x1 : x0), wz = X ? (side === 's' ? z1 : z0) : c;
  sh.x = wx + v[0] * 2; sh.z = wz + v[1] * 2; sh.ox = wx + v[0] * 7; sh.oz = wz + v[1] * 7; sh.oyaw = Math.atan2(v[1], v[0]);
}
// la bacheca degli incarichi: due pali, il tabellone con i fogli sulle due facce, un tettuccio
function bacheca(x, z, y, b, roof) {
  K.box(x - 5.1, z - 0.4, x - 4.4, z + 0.4, y - 1, y + 9, 3); K.box(x + 4.4, z - 0.4, x + 5.1, z + 0.4, y - 1, y + 9, 3);
  K.box(x - 4.4, z - 0.3, x + 4.4, z + 0.3, y + 2.4, y + 8.4, 3);
  TN.decal(x, y + 2.7, z + 0.3, 1, 0, 8.2, 5.4, TL.BACHECA, false, 0.06); TN.decal(x, y + 2.7, z - 0.3, -1, 0, 8.2, 5.4, TL.BACHECA, false, 0.06);
  K.gable(x - 5.6, z - 1.5, x + 5.6, z + 1.5, y + 9.4, 1.8, roof || 4, 3, 0.6);
  W.addBox(x - 5.1, z - 0.7, x + 5.1, z + 0.7, y + 9, b); W.glows.push([x, y + 8.6, z + 1.8, 3.6, 1, 0.8, 0.46, 0]);
}
registra();
SG.shop = { tilesOn, sprites, STILI, TIPI, piano, registra, insegna, fronte, bacheca };
})();
