// ===================== PIXEL SAGA · le profondità =====================
// I piani sotto i santuari e in fondo alle grotte, la Torre dell'Eclisse e il Tempio della Laguna.
// Ogni piano nasce da una scaletta scritta a mano (che stanze, in che ordine, dove stanno chiavi e tesori) e da un seme:
// la scaletta decide il gioco, il seme decide la pianta, i pilastri e dove stanno i nemici. Lo stesso seme dà sempre lo stesso piano.
(() => {
const DS = SG.dun, DEF = DS.DEF;
const SW = 13, SH = 11;      // passo delle stanze, in celle: i muri sono in comune
const rng = seed => { let s = Math.imul(seed + 1, 2654435761) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };

// ---------- la pianta: caselle, stanze, porte ----------
function tryLayout(G, R, main, sides) {
  const [cols, rows] = G.grid, occ = new Map(), rooms = [], links = [], key = (a, b) => a + ',' + b;
  const free = (a, b) => a >= 0 && b >= 0 && a < cols && b < rows && !occ.has(key(a, b));
  const inGrid = (a, b) => a >= 0 && b >= 0 && a < cols && b < rows;
  const add = (a0, b0, a1, b1, o) => { const r = Object.assign({ i: rooms.length, a0, b0, a1, b1, doors: [], x0: a0 * SW, y0: b0 * SH, x1: (a1 + 1) * SW, y1: (b1 + 1) * SH }, o); rooms.push(r); for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) occ.set(key(a, b), r); return r; };
  const link = (A, B, sa, sb, o) => {
    let cells, sideA;
    if (sa[1] === sb[1]) { const x = Math.max(sa[0], sb[0]) * SW, y = sa[1] * SH + 5; cells = [[x, y], [x, y + 1]]; sideA = sb[0] > sa[0] ? 'e' : 'w'; }
    else { const y = Math.max(sa[1], sb[1]) * SH, x = sa[0] * SW + 6; cells = [[x, y], [x + 1, y]]; sideA = sb[1] > sa[1] ? 's' : 'n'; }
    const l = Object.assign({ A, B, cells, glyph: '+' }, o); links.push(l);
    A.doors.push({ side: sideA, cells, link: l, to: B }); B.doors.push({ side: OPP[sideA], cells, link: l, to: A });
    return l;
  };
  const NB = [[0, -1, 3], [1, 0, 2], [-1, 0, 2], [0, 1, 0.7]];
  // partenza in fondo; nei piani col sigillo, accanto, la stanza della scala
  const sa = G.seal ? (R() < 0.5 ? 1 : cols - 2) : 1 + Math.floor(R() * Math.max(1, cols - 2));
  const S = add(sa, rows - 1, sa, rows - 1, { kind: 'start', main: 0 });
  if (G.seal) { const za = sa === 1 ? 0 : cols - 1, Z = add(za, rows - 1, za, rows - 1, { kind: 'sealroom', stair: za === 0 ? 'w' : 'e' }); link(S, Z, [sa, rows - 1], [za, rows - 1], { glyph: 'G' }); }
  let cur = S;
  for (let i = 1; i < main.length; i++) {
    const mm = main[i], c = [];
    for (let b = cur.b0; b <= cur.b1; b++) for (let a = cur.a0; a <= cur.a1; a++) for (const [da, db, w] of NB) {
      const na = a + da, nb = b + db; if (!free(na, nb)) continue;
      if (mm.kind === 'vault') {
        // una sala alta due caselle, con la tesoreria sopra: si entra dalla casella in basso
        if (db === 1 || !free(na, nb - 1) || (inGrid(na, nb - 2) && occ.has(key(na, nb - 2)))) continue;
        c.push({ from: [a, b], to: [na, nb], rect: [na, nb - 1, na, nb], w });
      } else if (mm.kind === 'hall') {
        if (!free(na + da, nb + db)) continue;
        c.push({ from: [a, b], to: [na, nb], rect: [Math.min(na, na + da), Math.min(nb, nb + db), Math.max(na, na + da), Math.max(nb, nb + db)], w });
      } else c.push({ from: [a, b], to: [na, nb], rect: [na, nb, na, nb], w });
    }
    if (!c.length) return null;
    let t = R() * c.reduce((s, q) => s + q.w, 0), pk = c[0]; for (const q of c) { t -= q.w; if (t <= 0) { pk = q; break; } }
    const r = add(pk.rect[0], pk.rect[1], pk.rect[2], pk.rect[3], { kind: mm.kind, arg: mm.arg, main: i });
    link(cur, r, pk.from, pk.to, { lock: !!main[i - 1].lock });
    cur = r;
  }
  const E = cur;
  if (E.kind === 'vault' && inGrid(E.a0, E.b0 - 1)) occ.set(key(E.a0, E.b0 - 1), 'x');
  if (E.kind === 'stairs') {
    const opt = [['n', 0, -1], ['e', 1, 0], ['w', -1, 0]].filter(([s, da, db]) => !E.doors.some(d => d.side === s) && (!inGrid(E.a0 + da, E.b0 + db) || free(E.a0 + da, E.b0 + db)));
    if (!opt.length) return null;
    const [s, da, db] = opt[0]; E.stair = s; if (inGrid(E.a0 + da, E.b0 + db)) occ.set(key(E.a0 + da, E.b0 + db), 'x');
  }
  // stanze laterali
  for (const sd of sides) {
    const host = rooms.find(r => r.main === sd.at), c = [];
    for (let b = host.b0; b <= host.b1; b++) for (let a = host.a0; a <= host.a1; a++) for (const [da, db] of NB) if (free(a + da, b + db)) c.push([[a, b], [a + da, b + db]]);
    if (!c.length) return null;
    const [from, to] = c[Math.floor(R() * c.length)], r = add(to[0], to[1], to[0], to[1], { kind: 'side', sk: sd.kind, arg: sd.arg });
    link(host, r, from, to, { glyph: sd.kind === 'secret' ? '%' : '+' });
  }
  // la scorciatoia: dalla stanza della grande chiave si torna verso l'ingresso
  const L = { rooms, links, S, E, shortcut: null };
  if (E.kind === 'bigkey') {
    for (const tgt of [S, rooms.find(r => r.main === 1), rooms.find(r => r.main === 2)]) {
      if (!tgt || L.shortcut || tgt === E || links.some(l => (l.A === E && l.B === tgt) || (l.B === E && l.A === tgt))) continue;
      for (const [da, db] of NB) { const o = occ.get(key(E.a0 + da, E.b0 + db)); if (o === tgt) { link(E, tgt, [E.a0, E.b0], [E.a0 + da, E.b0 + db], { glyph: 'shortcut' }); L.shortcut = tgt; break; } }
    }
  }
  return L;
}
function layout(G, R) {
  const main = [{ kind: 'start' }], sides = [];
  for (const b of G.beats) {
    const [k, ...rest] = b.split(':');
    if (k === 'lock') main[main.length - 1].lock = true;
    else if (k === 'side') sides.push({ at: main.length - 1, kind: rest[0], arg: rest.slice(1).join(':') });
    else main.push({ kind: k, arg: rest.join(':') });
  }
  main.push({ kind: G.end });
  let best = null;
  for (let attempt = 0; attempt < 400; attempt++) {
    const L = tryLayout(G, R, main, sides);
    if (!L) continue;
    if (G.end !== 'bigkey' || L.shortcut === L.S) return L;
    if (!best || (L.shortcut && !best.shortcut)) best = L;
  }
  if (!best) throw new Error('PIANO ' + G.id + ': NON TROVO UNA PIANTA');
  return best;
}
// le porte: a chiave, sbarre delle trappole, sbarre degli enigmi
function doors(G, L) {
  let gN = 0; const grp = () => { if (++gN > 9) throw new Error('PIANO ' + G.id + ': TROPPE SARACINESCHE'); return String(gN); };
  for (const r of L.rooms) if (r.kind === 'trap' || r.kind === 'vault' || (r.kind === 'side' && r.sk === 'trap')) r.g = grp();
  for (const r of L.rooms) if (r.kind === 'plates') r.pg = grp();
  for (const l of L.links) {
    if (l.glyph === 'G' || l.glyph === '%') continue;
    if (l.glyph === 'shortcut') { l.g = grp(); l.glyph = l.g; l.plates = true; continue; }
    const tr = [l.A, l.B].filter(r => r.g), pz = l.A.kind === 'plates' && l.B.main === l.A.main + 1;
    if (l.lock) { if (tr.length || pz) throw new Error('PIANO ' + G.id + ': PORTA A CHIAVE ACCANTO A UNA TRAPPOLA'); l.glyph = 'D'; continue; }
    if (tr.length > 1 || (tr.length && pz)) throw new Error('PIANO ' + G.id + ': DUE SARACINESCHE SULLA STESSA PORTA');
    if (tr.length) l.glyph = tr[0].g; else if (pz) l.glyph = l.A.pg;
  }
}

// ---------- l'arredo di una stanza ----------
function furnish(m, r, G, R, L) {
  const ix0 = r.x0 + 1, ix1 = r.x1 - 1, iy0 = r.y0 + 1, iy1 = r.y1 - 1, w = ix1 - ix0 + 1, h = iy1 - iy0 + 1, cx = r.x0 + 6, cy = r.y0 + 5;
  const K = (x, y) => x + ',' + y, keep = new Set(), ri = n => Math.floor(R() * n), pick = a => a[ri(a.length)];
  const apron = d => { const out = []; for (const [x, y] of d.cells) for (let k = 1; k <= 2; k++) out.push(d.side === 'n' ? [x, y + k] : d.side === 's' ? [x, y - k] : d.side === 'w' ? [x + k, y] : [x - k, y]); return out; };
  for (const d of r.doors) for (const [x, y] of apron(d)) keep.add(K(x, y));
  const inn = (x, y) => x >= ix0 && x <= ix1 && y >= iy0 && y <= iy1;
  const isFree = (x, y) => inn(x, y) && m.get(x, y) === '.' && !keep.has(K(x, y));
  const put = (x, y, c) => m.at(x, y, c);
  const tryPut = (x, y, c) => { if (!isFree(x, y)) return false; m.at(x, y, c); return true; };
  const cells = f => { const out = []; for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) if (isFree(x, y) && (!f || f(x, y))) out.push([x, y]); return out; };
  const entry = r.doors.find(d => r.main !== undefined ? d.to.main === r.main - 1 : true) || r.doors[0];
  const exit = r.main !== undefined ? r.doors.find(d => d.to.main === r.main + 1) : null;
  const far = (x, y, d, n) => !d || Math.min(...d.cells.map(c => Math.abs(c[0] - x) + Math.abs(c[1] - y))) >= n;
  // i nemici si mettono per ultimi, e solo dove l'eroe può arrivare a piedi dalla porta: mai chiusi dietro un arredo
  const pend = [], foes = (str, f) => pend.push([str, f]);
  const placeFoes = () => {
    const open = (x, y) => inn(x, y) && '.:;pP=I'.includes(m.get(x, y)), reg = new Set(), q = [];
    for (const [x, y] of apron(entry)) if (open(x, y)) { reg.add(K(x, y)); q.push([x, y]); }
    while (q.length) { const [x, y] = q.pop(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!reg.has(K(x + a, y + b)) && open(x + a, y + b)) { reg.add(K(x + a, y + b)); q.push([x + a, y + b]); } }
    for (const [str, f] of pend) for (const c of str) { const L2 = cells((x, y) => reg.has(K(x, y)) && far(x, y, entry, c === 'g' ? 3 : 4) && (!f || f(x, y))); if (L2.length) { const [x, y] = pick(L2); put(x, y, c); } }
  };
  const pool = n => { let s = ''; for (let k = 0; k < n; k++) s += G.pool[ri(G.pool.length)]; return s; };
  const corners = [[ix0, iy0], [ix1, iy0], [ix0, iy1], [ix1, iy1]];
  const rim = () => cells((x, y) => x === ix0 || x === ix1 || y === iy0 || y === iy1);
  const loot = (x, y, ch, what) => { m.chest(x, y, ch, what || undefined); };
  // una fascia parallela al muro dell'uscita: t = posizione lungo il muro, s = distanza (0 = primo filare della fascia, < 0 = verso l'uscita)
  const X = exit ? exit.side : 'n', lat = X === 'n' || X === 's' ? w : h, DEPTH = 2;
  const C = (t, s) => X === 'n' ? [ix0 + t, iy0 + DEPTH + s] : X === 's' ? [ix0 + t, iy1 - DEPTH - s] : X === 'w' ? [ix0 + DEPTH + s, iy0 + t] : [ix1 - DEPTH - s, iy0 + t];
  const band = (thick, ch, gap) => { for (let t = 0; t < lat; t++) for (let s = 0; s < thick; s++) { const [x, y] = C(t, s); if ((gap && gap(t, s)) || keep.has(K(x, y))) continue; put(x, y, ch); } };
  const nearSide = thick => (x, y) => { const s = X === 'n' ? y - iy0 - DEPTH : X === 's' ? iy1 - DEPTH - y : X === 'w' ? x - ix0 - DEPTH : ix1 - DEPTH - x; return s >= thick + 1; };
  const lane = (X === 'n' || X === 's') ? [3, 8] : [3, 6];         // posizioni lungo la fascia lontane dalle porte laterali
  const tLane = () => lane[0] + ri(lane[1] - lane[0] + 1);
  const twoCrystals = thick => { const a = cells(nearSide(thick + 1)); if (a.length) { const [x, y] = pick(a); put(x, y, 'x'); } const [fx, fy] = C(R() < 0.5 ? 0 : lat - 1, -DEPTH); put(fx, fy, 'x'); };
  const torch = (x, y) => tryPut(x, y, 't');
  const k = r.kind === 'side' ? 'side:' + r.sk : r.kind;
  let thick = 0, lights = 0;

  if (k === 'start') {
    put(cx, r.y1, '@'); put(cx + 1, r.y1, '@'); keep.add(K(cx, iy1)); keep.add(K(cx + 1, iy1)); keep.add(K(cx, iy1 - 1)); keep.add(K(cx + 1, iy1 - 1));
    if (G.sign) m.sign(ix0 + 2, iy1 - 2, G.sign);
    const sd = r.doors.find(d => d.link.glyph === 'G');
    if (sd) for (const [x, y] of apron(sd)) put(x, y, ';');
    if (sd) { const sx = sd.side === 'w' ? ix0 : ix1; tryPut(sx, sd.cells[0][1] - 2, 'A'); tryPut(sx, sd.cells[1][1] + 2, 'A'); }
  } else if (k === 'sealroom') {
    const wx = r.stair === 'w' ? r.x0 : r.x1; put(wx, cy, '>'); put(wx, cy + 1, '>');
    const ax = r.stair === 'w' ? ix0 : ix1, dx = r.stair === 'w' ? 1 : -1;
    for (let y = cy; y <= cy + 1; y++) for (let q = 0; q < 4; q++) { put(ax + dx * q, y, ';'); keep.add(K(ax + dx * q, y)); }
    tryPut(ax, cy - 2, 'A'); tryPut(ax, cy + 3, 'A'); tryPut(ax + dx * 4, iy0, '*'); tryPut(ax + dx * 4, iy1, '*');
  } else if (k === 'fight' || k === 'trap' || k === 'side:trap') {
    const v = k === 'fight' ? ri(5) : 3 + ri(2);
    if (v === 0) for (const [x, y] of [[ix0 + 2, iy0 + 2], [ix1 - 2, iy0 + 2], [ix0 + 2, iy1 - 2], [ix1 - 2, iy1 - 2]]) tryPut(x, y, '#');
    else if (v === 1) for (const [x, y] of [[cx, cy], [cx + 1, cy], [cx, cy + 1], [cx + 1, cy + 1]]) tryPut(x, y, '#');
    else if (v === 2) for (const [x, y] of [[ix0 + 2, iy0 + 2], [ix0 + 2, iy1 - 2], [cx, iy0 + 2], [cx + 1, iy1 - 2], [ix1 - 2, iy0 + 2], [ix1 - 2, iy1 - 2]]) tryPut(x, y, '#');
    else if (v === 3) for (const [qx, qy] of corners) { const sx = qx === ix0 ? 1 : -1, sy = qy === iy0 ? 1 : -1; for (const [a, b] of [[0, 0], [1, 0], [0, 1]]) tryPut(qx + sx * a, qy + sy * b, '#'); }
    if (k === 'fight') foes(r.arg || pool(3 + ri(2)));
    else {
      const what = r.arg || 'key';
      loot(cx + (v === 1 ? 2 : 0), cy + (v === 1 ? 2 : 0), what === 'key' ? 'q' : 'Q', what === 'key' ? null : what);
      foes(pool(4));
    }
  } else if (k === 'moat' || k === 'water') {
    thick = 2; const b = 1 + ri(lat - 3); band(2, k === 'moat' ? '_' : '~', t => t === b || t === b + 1);
    for (let s = 0; s < 2; s++) for (const t of [b, b + 1]) { const [x, y] = C(t, s); put(x, y, '='); }
    foes('g' + pool(1), nearSide(2));
  } else if (k === 'boulder') {
    thick = 1; band(1, '_'); const t = tLane(), d = 2 + ri(2);
    for (let s = 1; s <= d + 1; s++) { const [x, y] = C(t, s); keep.add(K(x, y)); }
    { const [x, y] = C(t, d); put(x, y, 'O'); }
    foes('g' + pool(1), nearSide(1));
  } else if (k === 'toggle') {
    thick = 1; const up = L.tog++ % 2 === 0; band(1, up ? 'r' : 'u'); twoCrystals(1); foes(pool(2), nearSide(1));
  } else if (k === 'platforms') {
    thick = 2; const up = L.tog++ % 2 === 0, b = 1 + ri(lat - 3); band(2, '_');
    for (let s = 0; s < 2; s++) for (const t of [b, b + 1]) { const [x, y] = C(t, s); put(x, y, up ? 'U' : 'R'); }
    twoCrystals(2); foes('g' + pool(1), nearSide(2));
  } else if (k === 'lava') {
    thick = 2 + ri(2); const b = 1 + ri(lat - 3); band(thick, 'L', t => t === b || t === b + 1); foes(pool(2), nearSide(thick));
  } else if (k === 'spikes') {
    thick = 2; const b = 1 + ri(lat - 2); band(2, '^', t => t === b);
    for (let q = 0; q < 4; q++) { const a = cells(nearSide(3)); if (a.length) { const [x, y] = pick(a); put(x, y, '^'); } }
    foes(pool(2), nearSide(2));
  } else if (k === 'plates') {
    // massi da spingere fino alle piastre contro il muro; con due piastre, sulla seconda ci sali tu
    const rows = [iy0 + 2, iy0 + 7].filter(y => !r.doors.some(d => (d.side === 'w' || d.side === 'e') && Math.abs(d.cells[0][1] - y) < 2)), two = R() < 0.5;
    const y = pick(rows), west = R() < 0.5, px = west ? ix0 : ix1, dx = west ? 1 : -1, d = 3 + ri(3);
    put(px, y, two ? 'p' : 'P'); for (let q = 1; q <= d + 1; q++) keep.add(K(px + dx * q, y)); put(px + dx * d, y, 'O');
    if (two) { const a = cells((x, yy) => Math.abs(yy - y) > 2 && x > ix0 + 1 && x < ix1 - 1); const [x2, y2] = pick(a); put(x2, y2, 'p'); }
    foes(pool(2), (x, yy) => Math.abs(yy - y) > 1);
  } else if (k === 'turrets') {
    const c = corners.filter(([x, y]) => isFree(x, y)); for (let q = 0; q < 2 && c.length; q++) { const [x, y] = c.splice(ri(c.length), 1)[0]; put(x, y, 'T'); }
    for (let q = 0; q < 5; q++) { const a = cells((x, y) => x > ix0 + 1 && x < ix1 - 1 && y > iy0 + 1 && y < iy1 - 1); if (a.length) { const [x, y] = pick(a); put(x, y, '^'); } }
    foes(pool(2));
  } else if (k === 'ice') {
    for (let y = iy0 + 2; y <= iy1 - 2; y++) for (let x = ix0 + 2; x <= ix1 - 2; x++) if (isFree(x, y)) put(x, y, 'I');
    for (const [x, y] of [[ix0 + 3, iy0 + 3], [ix1 - 3, iy1 - 3]]) put(x, y, '#');
    foes(pool(3), (x, y) => x <= ix0 + 1 || x >= ix1 - 1 || y <= iy0 + 1 || y >= iy1 - 1);
  } else if (k === 'pool') {
    const ch = G.liquid || '~'; for (let y = cy - 1; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 3; x++) if (isFree(x, y)) put(x, y, ch);
    foes(pool(3));
  } else if (k === 'hall') {
    // una sala grande il doppio, con il colonnato
    const wide = w > h * 1.5;
    if (wide) { for (let x = ix0 + 3; x <= ix1 - 3; x += 4) { tryPut(x, iy0 + 2, '#'); tryPut(x, iy1 - 2, '#'); } }
    else { for (let y = iy0 + 3; y <= iy1 - 3; y += 4) { tryPut(ix0 + 2, y, '#'); tryPut(ix1 - 2, y, '#'); } }
    foes(r.arg || pool(5));
  } else if (k === 'side:key' || k === 'side:loot' || k === 'side:heart' || k === 'side:secret') {
    const d = r.doors[0], [fx, fy] = d.side === 'w' ? [ix1 - 1, cy] : d.side === 'e' ? [ix0 + 1, cy] : d.side === 'n' ? [cx, iy1 - 1] : [cx, iy0 + 1];
    const what = k === 'side:key' ? null : k === 'side:heart' ? 'cuore' : r.arg;
    loot(fx, fy, k === 'side:key' ? 'k' : 'c', what);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) if (isFree(fx + a, fy + b)) put(fx + a, fy + b, ';');
    if (k === 'side:secret' || k === 'side:heart') { for (const [a, b] of [[-2, -2], [2, 2], [-2, 2], [2, -2]]) tryPut(fx + a, fy + b, '$'); tryPut(fx - 2, fy, 'A') || tryPut(fx, fy - 2, 'A'); tryPut(fx + 2, fy, 'A') || tryPut(fx, fy + 2, 'A'); }
    if (k !== 'side:secret') foes(pool(2));
  } else if (k === 'side:swim' || k === 'side:lava') {
    // il forziere sta su un'isola: ci arriva chi respira sott'acqua, o chi non teme la lava
    const ch = k === 'side:swim' ? '~' : 'L', d = r.doors[0];
    const [fx, fy] = d.side === 'w' ? [ix1 - 2, cy] : d.side === 'e' ? [ix0 + 2, cy] : d.side === 'n' ? [cx, iy1 - 2] : [cx, iy0 + 2];
    const dry = (x, y) => keep.has(K(x, y)) || (Math.abs(x - fx) <= 1 && Math.abs(y - fy) <= 1) || (d.side === 'w' && x <= ix0 + 2) || (d.side === 'e' && x >= ix1 - 2) || (d.side === 'n' && y <= iy0 + 2) || (d.side === 's' && y >= iy1 - 2);
    for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) if (!dry(x, y)) put(x, y, ch);
    loot(fx, fy, 'c', r.arg);
    for (const [a, b] of [[-1, -1], [1, 1]]) if (m.get(fx + a, fy + b) === '.') put(fx + a, fy + b, '$');
  } else if (k === 'bigkey') {
    const d = entry, [fx, fy] = d.side === 's' ? [cx, iy0 + 2] : d.side === 'n' ? [cx, iy1 - 2] : d.side === 'w' ? [ix1 - 2, cy] : [ix0 + 2, cy];
    loot(fx, fy, 'K'); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) if (isFree(fx + a, fy + b)) put(fx + a, fy + b, ';');
    tryPut(fx - 2, fy - 2, 'A'); tryPut(fx + 2, fy - 2, 'A'); tryPut(fx - 2, fy + 2, '$'); tryPut(fx + 2, fy + 2, '$');
    const sc = r.doors.find(q => q.link.plates);
    if (sc) { const a = apron(sc), [px, py] = a[1]; put(px, py, 'p'); }
    foes(r.arg || pool(3));
  } else if (k === 'stairs') {
    const s = r.stair, c = s === 'n' ? [[cx, r.y0], [cx + 1, r.y0]] : s === 'e' ? [[r.x1, cy], [r.x1, cy + 1]] : [[r.x0, cy], [r.x0, cy + 1]];
    for (const [x, y] of c) put(x, y, '>');
    for (const [x, y] of c) for (let q = 1; q <= 3; q++) { const p = s === 'n' ? [x, y + q] : s === 'e' ? [x - q, y] : [x + q, y]; put(p[0], p[1], ';'); keep.add(K(p[0], p[1])); }
    if (s === 'n') { tryPut(cx - 2, iy0, 'A'); tryPut(cx + 3, iy0, 'A'); } else { const ax = s === 'e' ? ix1 : ix0; tryPut(ax, cy - 2, 'A'); tryPut(ax, cy + 3, 'A'); }
    foes(r.arg || pool(2));
  } else if (k === 'vault') {
    // la sala del campione: colonnato, tappeto, e in fondo la tesoreria chiusa dalle sbarre finché lui è in piedi
    for (let y = iy0 + 2; y <= iy1 - 2; y += 3) { tryPut(ix0 + 2, y, '#'); tryPut(ix1 - 2, y, '#'); }
    for (let y = iy0; y <= iy1; y++) for (const x of [cx, cx + 1]) if (m.get(x, y) === '.') put(x, y, ':');
    for (const [x, y] of [[cx, iy0], [cx + 1, iy0], [cx, iy0 + 1], [cx + 1, iy0 + 1]]) keep.add(K(x, y));
    m.room(r.x0 + 3, r.y0 - 5, r.x0 + 10, r.y0); put(cx, r.y0, r.g); put(cx + 1, r.y0, r.g);
    const ty = r.y0 - 3; loot(cx, ty, 'C'); put(cx + 1, ty, ';'); put(cx, ty + 1, ';'); put(cx + 1, ty + 1, ';'); put(cx, ty + 2, ':'); put(cx + 1, ty + 2, ':');
    put(r.x0 + 4, r.y0 - 4, 'A'); put(r.x0 + 9, r.y0 - 4, 'A'); put(r.x0 + 4, r.y0 - 2, '$'); put(r.x0 + 9, r.y0 - 2, '$'); put(r.x0 + 5, r.y0 - 4, '$'); put(r.x0 + 8, r.y0 - 4, '$'); put(cx + 1, r.y0 - 4, '$');
    put(cx - 1, iy0 + 4, 'j');
    foes(r.arg || pool(3), (x, y) => y < iy0 + 12);
    for (const [x, y] of [[ix0, iy0], [ix1, iy0], [ix0, iy1], [ix1, iy1], [ix0, iy0 + 10], [ix1, iy0 + 10]]) if (torch(x, y)) lights++;
    tryPut(ix0, iy0 + 5, 'A'); tryPut(ix1, iy0 + 5, 'A'); tryPut(ix0, iy0 + 15, 'A'); tryPut(ix1, iy0 + 15, 'A');
  } else throw new Error('PIANO ' + G.id + ': STANZA SCONOSCIUTA ' + k);

  // luci e arredi: bracieri negli angoli, vasi, e quello che il piano ha di suo (cristalli, ossa, oro)
  const cs = corners.filter(([x, y]) => isFree(x, y));
  while (cs.length && lights < (k === 'start' || k === 'sealroom' ? 4 : 2 + ri(2))) { const [x, y] = cs.splice(ri(cs.length), 1)[0]; if (torch(x, y)) lights++; }
  for (let q = 0, n = k === 'start' ? 2 : ri(3); q < n; q++) { const a = rim(); if (a.length) { const [x, y] = pick(a); put(x, y, 'v'); } }
  if (G.decor) for (const d of G.decor) { if (R() < 0.75) { const a = rim(); if (a.length) { const [x, y] = pick(a); put(x, y, d); } } }
  placeFoes();
}

// ---------- dal seme alla mappa ----------
function build(m, G) {
  const R = rng(G.seed), L = layout(G, R); L.tog = 0;
  doors(G, L);
  for (const r of L.rooms) m.room(r.x0, r.y0, r.x1, r.y1);
  for (const l of L.links) { if (l.glyph === '%') m.at(l.cells[0][0], l.cells[0][1], '%'); else for (const [x, y] of l.cells) m.at(x, y, l.glyph); }
  for (const r of L.rooms) furnish(m, r, G, R, L);
  // chi apre le sbarre: una cella sicura della stanza (davanti alla sua prima porta)
  const anchor = r => { const d = r.doors[0], [x, y] = d.cells[0]; return d.side === 'n' ? [x, y + 1] : d.side === 's' ? [x, y - 1] : d.side === 'w' ? [x + 1, y] : [x - 1, y]; };
  for (const r of L.rooms) { if (r.g) m.trig(+r.g, 'kill', ...anchor(r)); if (r.pg) m.trig(+r.pg, 'plates', ...anchor(r)); }
  for (const l of L.links) if (l.plates) m.trig(+l.g, 'plates', ...anchor(L.E));
  return L;
}

// ---------- i piani ----------
// level(id, { base, name, lv, seed, grid, end, beats, pool, foes, look, ... }): un piano generato, appeso al santuario "base"
function level(id, o) {
  const B = DEF[o.base || id] || {}, G = Object.assign({ id }, o);
  const d = { name: o.name, base: o.base, lv: o.lv, cave: !!B.cave, boss: null, item: o.item, foes: o.foes,
    floor: B.floor, wall: B.wall, crack: B.crack, fog: B.fog, amb: B.amb, water: B.water, torch: B.torch, shot: B.shot, pot: B.pot, glow: B.glow, dir: B.dir, air: B.air, flame: B.flame, music: B.music,
    gen: G, make: m => build(m, G) };
  DEF[id] = Object.assign(d, o.look || {});
  return d;
}
const chain = (...ids) => ids.forEach((id, i) => { if (i) DEF[id].up = ids[i - 1]; if (i < ids.length - 1) DEF[id].down = ids[i + 1]; DEF[id].lv = i + 1; if (i) DEF[id].base = ids[0]; });
// aria e fiamme: ogni luogo ha il suo pulviscolo, le cripte hanno fuochi colorati
const AIR = { bosco: { fly: 8, mote: 8 }, lago: { mote: 14 }, sole: { dust: 12 }, ghiaccio: { snow: 14 }, fuoco: { ember: 20 }, funghi: { fly: 6, mote: 10 }, mare: { mote: 10 }, cristalli: { mote: 14 }, gelo: { snow: 10 } };
for (const k in AIR) DEF[k].air = AIR[k];
const dark = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const CRYPT = { floor: 62, wall: 61 };

// ----- i cinque santuari: sotto il piano d'ingresso, il piano della grande chiave; più sotto, la cripta dei tesori -----
const SEAL = '\nUN SIGILLO DI PIETRA CHIUDE LA SCALA PIÙ BASSA: SI SPEZZERÀ SOLTANTO QUANDO IL GUARDIANO CADRÀ.';
level('bosco2', { base: 'bosco', name: 'LE RADICI PROFONDE', seed: 11, grid: [5, 4], end: 'bigkey', seal: true, pool: 'eefgh', decor: ['*'],
  beats: ['fight', 'trap:key', 'boulder', 'lock', 'moat', 'side:loot:elisir', 'plates', 'spikes'],
  foes: { e: 'slime', f: 'goblin', g: 'bat', h: 'plant' }, sign: 'LE RADICI PROFONDE.\nQUI SOTTO RIPOSA LA GRANDE CHIAVE DEL GUARDIANO.' + SEAL,
  look: { fog: dark(DEF.bosco.fog, 0.8), amb: 0.31, air: { fly: 14, mote: 10 } } });
level('bosco3', { base: 'bosco', name: 'LA CRIPTA DELLE RADICI', seed: 23, grid: [5, 5], end: 'vault', item: 'aurora', pool: 'eeffgh', decor: ['b', '*', '$'],
  beats: ['hall', 'toggle', 'side:heart', 'trap:key', 'moat', 'lock', 'platforms', 'side:secret:monete:250', 'fight'],
  foes: { e: 'wolf', f: 'skel', g: 'bat', h: 'plant', j: 'troll' }, sign: 'LA CRIPTA DELLE RADICI.\nI TESORI DEL SANTUARIO DORMONO QUI, E CHI LI SORVEGLIA NON DORME MAI.',
  look: Object.assign({ fog: '#060c08', amb: 0.25, torch: [0.55, 1, 0.5], flame: [0.5, 1.6, 0.9], air: { fly: 18, mote: 14 } }, CRYPT) });
chain('bosco', 'bosco2', 'bosco3');

level('lago2', { base: 'lago', name: 'LE CISTERNE', seed: 31, grid: [5, 4], end: 'bigkey', seal: true, pool: 'eeffgh', decor: ['*'], liquid: '~',
  beats: ['water', 'fight', 'side:swim:monete:120', 'trap:key', 'toggle', 'lock', 'pool', 'side:loot:elisir', 'platforms'],
  foes: { e: 'slimeB', f: 'crab', g: 'bat', h: 'skel' }, sign: 'LE CISTERNE.\nL\'ACQUA DEL LAGO SCENDE FIN QUAGGIÙ, E CON LEI LA GRANDE CHIAVE.' + SEAL,
  look: { fog: dark(DEF.lago.fog, 0.8), amb: 0.33, air: { mote: 18 } } });
level('lago3', { base: 'lago', name: 'LA CRIPTA SOMMERSA', seed: 37, grid: [5, 5], end: 'vault', item: 'grifone', pool: 'eeffgh', decor: ['b', '*', '$'], liquid: '~',
  beats: ['hall', 'water', 'side:heart', 'trap:key', 'platforms', 'lock', 'pool', 'side:swim:monete:300', 'toggle', 'spikes'],
  foes: { e: 'crab', f: 'skel', g: 'bat', h: 'wraith', j: 'tritone' }, sign: 'LA CRIPTA SOMMERSA.\nSOTTO L\'ACQUA NERA LUCCICA L\'ORO DEI RE DEL LAGO.',
  look: Object.assign({ fog: '#04090f', amb: 0.26, torch: [0.45, 0.8, 1], flame: [0.4, 1.2, 4], air: { mote: 22 } }, CRYPT) });
chain('lago', 'lago2', 'lago3');

level('sole2', { base: 'sole', name: 'LE GALLERIE DEI RE', seed: 41, grid: [5, 4], end: 'bigkey', seal: true, pool: 'eefgh', decor: ['b'],
  beats: ['turrets', 'side:key', 'spikes', 'lock', 'platforms', 'trap:monete:150', 'moat', 'side:loot:elisir', 'plates', 'fight'],
  foes: { e: 'skel', f: 'mummy', g: 'bat', h: 'jackal' }, sign: 'LE GALLERIE DEI RE.\nI RE DI SOLIS NASCOSERO LA GRANDE CHIAVE SOTTO LA SABBIA.' + SEAL,
  look: { fog: dark(DEF.sole.fog, 0.8), amb: 0.34, air: { dust: 16 } } });
level('sole3', { base: 'sole', name: 'LA CAMERA DEL TESORO', seed: 47, grid: [5, 5], end: 'vault', item: 'corona', pool: 'eeffgh', decor: ['b', '$', '$'],
  beats: ['hall', 'turrets', 'side:heart', 'trap:key', 'spikes', 'lock', 'platforms', 'side:secret:monete:300', 'toggle', 'side:swim:elisir', 'moat'],
  foes: { e: 'jackal', f: 'mummy', g: 'firebat', h: 'bandit', j: 'faraone' }, sign: 'LA CAMERA DEL TESORO.\nL\'ORO DI SOLIS NON HA MAI VISTO IL SOLE. IL SUO ULTIMO RE LO CUSTODISCE ANCORA.',
  look: Object.assign({ fog: '#0f0a05', amb: 0.27, torch: [1, 0.82, 0.4], air: { dust: 20 } }, CRYPT) });
chain('sole', 'sole2', 'sole3');

level('ghiaccio2', { base: 'ghiaccio', name: 'LE VENE DI GHIACCIO', seed: 53, grid: [5, 4], end: 'bigkey', seal: true, pool: 'eefg', decor: ['*'],
  beats: ['ice', 'toggle', 'side:key', 'lock', 'moat', 'trap:monete:180', 'spikes', 'side:loot:elisir', 'plates', 'ice'],
  foes: { e: 'icewolf', f: 'iceskel', g: 'icebat' }, sign: 'LE VENE DI GHIACCIO.\nLA GRANDE CHIAVE È RIMASTA PRIGIONIERA DEL GELO, QUAGGIÙ.' + SEAL,
  look: { fog: dark(DEF.ghiaccio.fog, 0.8), amb: 0.36, air: { snow: 18 } } });
level('ghiaccio3', { base: 'ghiaccio', name: 'LA CRIPTA D\'INVERNO', seed: 59, grid: [5, 5], end: 'vault', item: 'zanna', pool: 'eeffgh', decor: ['b', '*', '$'], liquid: '~',
  beats: ['hall', 'ice', 'side:heart', 'trap:key', 'platforms', 'lock', 'water', 'side:swim:monete:350', 'toggle', 'side:secret:elisir', 'spikes'],
  foes: { e: 'icewolf', f: 'iceskel', g: 'icebat', h: 'wraith', j: 'jarl' }, sign: 'LA CRIPTA D\'INVERNO.\nUN RE DI GHIACCIO SIEDE ANCORA SUL SUO TESORO, E NON HA MAI SMESSO DI ASPETTARE.',
  look: Object.assign({ fog: '#070c14', amb: 0.29, torch: [0.6, 0.85, 1], flame: [0.8, 1.4, 4.5], air: { snow: 24 } }, CRYPT) });
chain('ghiaccio', 'ghiaccio2', 'ghiaccio3');

level('fuoco2', { base: 'fuoco', name: 'LE FUCINE SPENTE', seed: 61, grid: [5, 4], end: 'bigkey', seal: true, pool: 'eeffg', decor: ['b'], liquid: 'L',
  beats: ['lava', 'fight', 'side:key', 'lock', 'platforms', 'trap:monete:200', 'turrets', 'side:lava:elisir', 'plates', 'lava'],
  foes: { e: 'imp', f: 'slimeR', g: 'firebat' }, sign: 'LE FUCINE SPENTE.\nQUI SI FORGIÒ LA GRANDE CHIAVE, E QUI È RIMASTA.' + SEAL,
  look: { fog: dark(DEF.fuoco.fog, 0.8), amb: 0.28, air: { ember: 26 } } });
level('fuoco3', { base: 'fuoco', name: 'IL CUORE DEL VULCANO', seed: 67, grid: [6, 5], end: 'vault', item: 'drago', pool: 'eeffgh', decor: ['b', '$', '*'], liquid: 'L',
  beats: ['hall', 'lava', 'side:heart', 'trap:key', 'platforms', 'lock', 'turrets', 'side:lava:luna', 'toggle', 'side:secret:monete:400', 'pool', 'spikes'],
  foes: { e: 'imp', f: 'slimeR', g: 'firebat', h: 'wraith', j: 'demone' }, sign: 'IL CUORE DEL VULCANO.\nPIÙ GIÙ DI COSÌ NON È MAI SCESO NESSUNO. I TESORI PIÙ GRANDI STANNO DOVE BRUCIA DI PIÙ.',
  look: Object.assign({ fog: '#100403', amb: 0.24, torch: [1, 0.45, 0.25], flame: [1.4, 0.7, 0.5], air: { ember: 34 } }, CRYPT) });
chain('fuoco', 'fuoco2', 'fuoco3');

// ----- in fondo alle grotte -----
level('funghi2', { base: 'funghi', name: 'IL NIDO DEI GOBLIN', seed: 71, grid: [4, 4], end: 'vault', item: 'guanti', pool: 'eeffgh', decor: ['*', 'b'],
  beats: ['fight', 'boulder', 'side:loot:monete:80', 'trap:pozione:3', 'moat'],
  foes: { e: 'slime', f: 'goblin', g: 'bat', h: 'plant', j: 'capo' }, sign: 'IL NIDO DEI GOBLIN.\nTUTTO QUELLO CHE SPARISCE DAI CAMPI FINISCE QUAGGIÙ.',
  look: { fog: dark(DEF.funghi.fog, 0.8), amb: 0.29, air: { fly: 10, mote: 14 } } });
chain('funghi', 'funghi2');
level('mare2', { base: 'mare', name: 'IL COVO DEL CAPITANO', seed: 73, grid: [4, 4], end: 'vault', item: 'calamita', pool: 'eeffgh', decor: ['$', 'b'], liquid: '~',
  beats: ['water', 'fight', 'side:loot:monete:150', 'trap:elisir', 'pool'],
  foes: { e: 'slimeB', f: 'crab', g: 'bat', h: 'bandit', j: 'pirata' }, sign: 'IL COVO DEL CAPITANO.\nIL CONTRABBANDIERE NON SI È MAI FIDATO DELLE BANCHE.',
  look: { fog: dark(DEF.mare.fog, 0.8), amb: 0.32, air: { mote: 14 } } });
chain('mare', 'mare2');
level('cristalli2', { base: 'cristalli', name: 'LA VENA MADRE', seed: 79, grid: [4, 4], end: 'vault', item: 'lanterna', pool: 'eeffg', decor: ['*', '*'],
  beats: ['fight', 'toggle', 'side:loot:monete:120', 'trap:elisir', 'platforms'],
  foes: { e: 'skel', f: 'slime2', g: 'bat', j: 'minatore' }, sign: 'LA VENA MADRE.\nI MINATORI SCAVARONO TROPPO IN FONDO. IL LORO CAPO È ANCORA AL LAVORO.',
  look: { fog: dark(DEF.cristalli.fog, 0.8), amb: 0.3, air: { mote: 20 } } });
chain('cristalli', 'cristalli2');
level('gelo2', { base: 'gelo', name: 'IL CUORE DEL GHIACCIAIO', seed: 83, grid: [4, 4], end: 'vault', item: 'ombra', pool: 'eeffg', decor: ['*', 'b'],
  beats: ['ice', 'spikes', 'side:loot:monete:150', 'trap:elisir', 'moat'],
  foes: { e: 'icewolf', f: 'iceskel', g: 'icebat', j: 'yeti' }, sign: 'IL CUORE DEL GHIACCIAIO.\nQUALCOSA DI MOLTO GRANDE, QUAGGIÙ, HA FATTO LA TANA.',
  look: { fog: dark(DEF.gelo.fog, 0.8), amb: 0.36, air: { snow: 16 } } });
chain('gelo', 'gelo2');

// ----- le terre nuove: una torre che sale e un tempio che scende -----
const TORRE = { floor: 62, wall: 61, crack: 41, fog: '#0a0612', amb: 0.3, water: '#5a3a9a', torch: [0.85, 0.55, 1], flame: [1.1, 0.6, 4], shot: 'ice', pot: ['#6a5a8a', '#3a2a5a'], glow: '#c88aff', dir: 'up', cave: true, music: 'grotta:cristalli', air: { mote: 16 } };
level('torre', { name: 'TORRE DELL\'ECLISSE', seed: 89, grid: [4, 4], end: 'stairs', pool: 'eeffgh', decor: ['b', '*'],
  beats: ['fight', 'spikes', 'side:loot:monete:120', 'trap:key', 'moat', 'lock', 'turrets'],
  foes: { e: 'skel', f: 'bandit', g: 'bat', h: 'wraith' }, sign: 'TORRE DELL\'ECLISSE.\nCHI LA COSTRUÌ VOLEVA TOCCARE LA LUNA. I TESORI LI PORTÒ CON SÉ, IN CIMA.', look: TORRE });
level('torre2', { base: 'torre', name: 'LE SALE ALTE', seed: 97, grid: [5, 4], end: 'stairs', pool: 'eeffgh', decor: ['b', '*'],
  beats: ['hall', 'toggle', 'side:secret:katana', 'trap:key', 'platforms', 'lock', 'spikes', 'side:loot:elisir', 'turrets'],
  foes: { e: 'skel', f: 'bandit', g: 'bat', h: 'wraith' }, sign: 'LE SALE ALTE.\nIL VENTO FISCHIA TRA LE FERITOIE. MANCA ANCORA UN PIANO.', look: { amb: 0.28, air: { mote: 20 } } });
level('torre3', { base: 'torre', name: 'LA CIMA DELLA TORRE', seed: 101, grid: [4, 5], end: 'vault', item: 'eclisse', pool: 'eeffgh', decor: ['b', '$', '*'],
  beats: ['fight', 'platforms', 'side:heart', 'trap:monete:300', 'moat', 'toggle'],
  foes: { e: 'skel', f: 'bandit', g: 'bat', h: 'wraith', j: 'lich' }, sign: 'LA CIMA DELLA TORRE.\nQUI LA LUNA È COSÌ VICINA CHE FA OMBRA. E NELL\'OMBRA C\'È QUALCUNO.', look: { amb: 0.26, air: { mote: 24 } } });
chain('torre', 'torre2', 'torre3');
const LAGUNA = { floor: 20, wall: 21, crack: 41, fog: '#06120f', amb: 0.34, water: '#2a9a8a', torch: [0.5, 1, 0.85], flame: [0.5, 1.5, 1.6], shot: 'bubble', pot: ['#5ab89a', '#2a6a5a'], glow: '#5af0c8', cave: true, music: 'santuario:lago', air: { fly: 8, mote: 10 } };
level('laguna', { name: 'TEMPIO DELLA LAGUNA', seed: 103, grid: [4, 4], end: 'stairs', pool: 'eeffgh', decor: ['*'], liquid: '~',
  beats: ['water', 'fight', 'side:loot:monete:100', 'trap:key', 'pool', 'lock', 'spikes'],
  foes: { e: 'slime2', f: 'crab', g: 'bat', h: 'tiger' }, sign: 'TEMPIO DELLA LAGUNA.\nI GRADINI SCENDONO SOTTO IL LIVELLO DEL MARE. LA PERLA STA NEL PUNTO PIÙ BASSO.', look: LAGUNA });
level('laguna2', { base: 'laguna', name: 'LE VASCHE DI GIADA', seed: 107, grid: [5, 4], end: 'stairs', pool: 'eeffgh', decor: ['*', 'b'], liquid: '~',
  beats: ['hall', 'water', 'side:loot:elisir', 'trap:key', 'platforms', 'lock', 'toggle', 'side:secret:monete:300', 'moat'],
  foes: { e: 'slime2', f: 'crab', g: 'bat', h: 'tiger' }, sign: 'LE VASCHE DI GIADA.\nL\'ACQUA È FERMA DA MILLE ANNI. MANCA ANCORA UN PIANO.', look: { amb: 0.3, air: { fly: 10, mote: 14 } } });
level('laguna3', { base: 'laguna', name: 'LA CAMERA DELLA PERLA', seed: 109, grid: [4, 5], end: 'vault', item: 'perla', pool: 'eeffgh', decor: ['$', '*', 'b'], liquid: '~',
  beats: ['fight', 'water', 'side:heart', 'trap:monete:250', 'platforms', 'spikes'],
  foes: { e: 'slime2', f: 'crab', g: 'bat', h: 'tiger', j: 'idolo' }, sign: 'LA CAMERA DELLA PERLA.\nUN IDOLO DI GIADA VEGLIA SULLA PERLA. NON HA MAI CHIUSO GLI OCCHI.', look: Object.assign({ amb: 0.27, air: { fly: 12, mote: 18 } }, CRYPT) });
chain('laguna', 'laguna2', 'laguna3');
DS.deep = { level, chain, build, layout, SW, SH };
})();
