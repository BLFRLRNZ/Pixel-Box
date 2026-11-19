// ===================== PIXEL SAGA · la musica =====================
// Ogni luogo ha il suo brano, scritto a mano come una piccola partitura: melodia, accordi,
// giro di basso, arpeggi e ritmi. Gli strumenti (flauti, liuti, archi, ottoni, campane, tamburi…)
// sono sintetizzati al volo con WebAudio. SG.music.want(id) sceglie il brano, SG.music.tick()
// lo suona: quando si cambia luogo un brano sfuma nell'altro e, tornando indietro, riprende da dov'era.
(() => {
// ---------- note e accordi ----------
const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const acc = s => s === '#' ? 1 : s === 'b' ? -1 : 0;
const mod12 = x => ((x % 12) + 12) % 12;
const NOTE = {}, CHORD = {};
function midiOf(tk) {
  if (tk in NOTE) return NOTE[tk];
  const m = /^([a-g])([#b]?)(\d)$/.exec(tk);
  if (!m) throw new Error('nota sconosciuta "' + tk + '"');
  return (NOTE[tk] = 12 * (+m[3] + 1) + PC[m[1]] + acc(m[2]));
}
// intervalli dalla fondamentale: terza, quinta, settima (il basso usa questi ruoli)
const QUAL = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
  dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], aug: [0, 4, 8], sus4: [0, 5, 7], sus2: [0, 2, 7], 5: [0, 7], add9: [0, 4, 7, 14] };
function chordOf(tk) {
  if (tk in CHORD) return CHORD[tk];
  const m = /^([A-G])([#b]?)([a-z0-9]*)(?:\/([A-G])([#b]?))?$/.exec(tk);
  if (!m || !(m[3] in QUAL)) throw new Error('accordo sconosciuto "' + tk + '"');
  const r = mod12(PC[m[1].toLowerCase()] + acc(m[2])), iv = QUAL[m[3]];
  return (CHORD[tk] = { tk, r, iv, b: m[4] ? mod12(PC[m[4].toLowerCase()] + acc(m[5])) : r, pcs: [...new Set(iv.map(mod12))].sort((a, b) => a - b) });
}
// la nota di quel nome (0-11) più vicina al centro c
const near = (pc, c) => c + mod12(pc - c + 6) - 6;
// le note dell'accordo strette intorno al centro c, dalla più grave
const voicing = (ch, tr, c) => ch.pcs.map(p => near(mod12(ch.r + p + tr), c)).sort((a, b) => a - b);

// ---------- dalla partitura agli eventi ----------
// righe di note: "d5*2 e5 f5 | ..." (un simbolo per passo, *n lo tiene n passi, '.' tiene, '-' tace,
// "e5/d5" è un'acciaccatura, "c5+e5" due note insieme, '!' accento, '?' piano). '|' separa le battute.
function expand(s, where) {
  const out = [];
  for (const raw of s.trim().split(/\s+/)) {
    if (!raw) continue;
    const k = raw.indexOf('*'), tk = k < 0 ? raw : raw.slice(0, k), n = k < 0 ? 1 : +raw.slice(k + 1);
    if (!(n >= 1 && n === Math.floor(n))) throw new Error(where + ': durata sbagliata "' + raw + '"');
    out.push(tk);
    for (let i = 1; i < n; i++) out.push(tk === '-' ? '-' : '.');
  }
  return out;
}
function barsOf(s, nb, bar, where) {
  const B = s.split('|'), out = [];
  if (B.length !== nb) throw new Error(where + ': ' + B.length + ' battute, ne servono ' + nb);
  B.forEach((b, i) => { const e = expand(b, where); if (e.length !== bar) throw new Error(where + ', battuta ' + (i + 1) + ': ' + e.length + ' passi, ne servono ' + bar); out.push(...e); });
  return out;
}
// che cosa suona ogni voce: melodia scritta (mel), basso (b), arpeggio (a), accordi strimpellati (s),
// tappeto (pad), bordone (d), batteria (p) o note sparse a caso (r)
const kindOf = v => v.b ? 'bass' : v.a ? 'arp' : v.s ? 'strum' : v.pad ? 'pad' : v.d ? 'drone' : v.p ? 'drum' : v.r ? 'rand' : 'mel';
const VEL = { x: 1, X: 1.35, o: 0.5 };
function compile(id) {
  const [tid, vid] = id.split(':'), T = TRACKS[tid];
  if (!T) throw new Error('brano sconosciuto ' + id);
  const V = (vid && T.var && T.var[vid]) || {};
  if (vid && !(T.var && T.var[vid])) throw new Error('variante sconosciuta ' + id);
  const div = T.div || 2, bar = div * (T.beats || 4), tr = (T.t || 0) + (V.t || 0);
  const names = Object.keys(T.v), ev = [], starts = [], chs = [];
  let base = 0;
  for (const sid of T.o) {
    const S = T.S[sid], where = id + '/' + sid;
    if (!S) throw new Error(where + ': sezione mancante');
    const CB = S.c.split('|'), nb = CB.length, n = nb * bar, ch = [];
    CB.forEach((b, i) => {
      const t = b.trim().split(/\s+/);
      if (bar % t.length) throw new Error(where + ', accordi della battuta ' + (i + 1));
      for (const x of t) { const c = x === '.' ? ch[ch.length - 1] : chordOf(x); if (!c) throw new Error(where + ': manca un accordo'); for (let k = 0; k < bar / t.length; k++) ch.push(c); }
    });
    starts.push(base); chs.push(...ch);
    const mute = ((S.m || '') + ' ' + (V.m || '')).split(/\s+/);
    names.forEach((nm, vi) => {
      if (mute.includes(nm)) return;
      const v = T.v[nm], kd = kindOf(v), x = (S.x && S.x[nm]) || {}, w = where + '/' + nm;
      const ins = x.i || (V.i && V.i[nm]) || v.i, vt = tr + (v.t || 0) + (x.t || 0), g0 = x.g || 1;
      if (kd !== 'drum' && !INS[ins]) throw new Error(w + ': strumento sconosciuto ' + ins);
      const put = (j, e) => { e.v = vi; e.i = ins; (ev[base + j] || (ev[base + j] = [])).push(e); };
      const holds = (at, j) => { let d = 1; while (j + d < n && at(j + d) === '.') d++; return d; };
      if (kd === 'mel') {
        if (!S[nm]) return;
        const tk = barsOf(S[nm], nb, bar, w);
        for (let j = 0; j < n; j++) {
          let t = tk[j]; if (t === '.' || t === '-') continue;
          let g = g0;
          if (t.endsWith('!')) { g *= 1.25; t = t.slice(0, -1); } else if (t.endsWith('?')) { g *= 0.6; t = t.slice(0, -1); }
          let gr = null; const sl = t.indexOf('/');
          if (sl >= 0) { gr = midiOf(t.slice(0, sl)) + vt; t = t.slice(sl + 1); }
          put(j, { n: t.split('+').map(q => midiOf(q) + vt), d: holds(k => tk[k], j), g, gr });
        }
      } else if (kd === 'drum') {
        const P = Object.assign({}, v.p, V.dr || {}, S.dr || {}), H = Object.assign({}, P, S.head || {}), F = Object.assign({}, P, S.fill || {});
        for (const k of new Set([...Object.keys(P), ...Object.keys(H), ...Object.keys(F)])) for (let j = 0; j < n; j++) {
          const pat = (j >= n - bar ? F : j < bar ? H : P)[k];
          if (!pat) continue;
          if (pat.length % bar && bar % pat.length) throw new Error(w + ': ritmo "' + k + '" lungo ' + pat.length);
          const gv = VEL[pat[j % pat.length]];
          if (gv) put(j, { k, g: gv * g0, n: [near(mod12(ch[j].b + tr), 41)] });
        }
      } else if (kd === 'pad') {
        for (let j = 0; j < n; j++) {
          if (j && ch[j] === ch[j - 1] && !(v.pad === 2 && j % bar === 0)) continue;
          let d = 1; while (j + d < n && ch[j + d] === ch[j] && !(v.pad === 2 && (j + d) % bar === 0)) d++;
          put(j, { n: voicing(ch[j], vt, v.o), d, g: g0 });
        }
      } else if (kd === 'drone') {
        put(0, { n: v.d.split(' ').map(q => midiOf(q) + vt), d: n, g: g0 });
      } else if (kd === 'rand') {
        const notes = v.r.n.split(' ').map(q => midiOf(q) + vt);
        for (let j = 0; j < n; j += v.r.e || 1) put(j, { n: notes, d: v.r.d || 1, g: g0, rnd: v.r.p });
      } else {   // basso, arpeggio e accordi seguono l'accordo del momento
        const pat = x.b || x.a || x.s || v.b || v.a || v.s, L = pat.length;
        if (L % bar && bar % L) throw new Error(w + ': ritmo lungo ' + L);
        for (let j = 0; j < n; j++) {
          const c = pat[j % L]; if (c === '.' || c === '-') continue;
          const C = ch[j], d = holds(k => pat[k % L], j), R0 = near(mod12(C.r + vt), v.o);
          let notes;
          if (kd === 'bass') notes = [c === 'r' ? near(mod12(C.b + vt), v.o) : c === '8' ? R0 + 12 : c === 'l' ? R0 - 5 : R0 + ({ 3: C.iv[1], 5: C.iv[2] ?? 7, 7: C.iv[3] ?? 10 })[c]];
          else if (kd === 'arp') { const P = C.pcs, k = +c; notes = [R0 + P[k % P.length] + 12 * Math.floor(k / P.length)]; }
          else { const vc = voicing(C, vt, v.o); notes = c === 'u' ? vc : c === 'x' ? [near(mod12(C.b + vt), v.o - 12)].concat(vc) : [NaN]; }
          if (notes.some(q => !(q >= 0))) throw new Error(w + ': simbolo "' + c + '"');
          put(j, { n: notes, d, g: g0 * (c === 'u' ? 0.7 : 1) });
        }
      }
    });
    base += n;
  }
  return { id, T, V, steps: base, ev, bar, div, spb: 60 / (V.bpm || T.bpm) / div, lp: starts[T.lp || 0], sw: T.sw || 0,
    rev: V.rev ?? T.rev ?? 0.25, echo: T.echo || null, g: (T.g || 1) * (V.g || 1), names, starts, ch: chs };
}

// ---------- gli strumenti ----------
// w: armoniche (ampiezze dalla fondamentale in su), a/d/s/r: attacco, decadimento, sostegno, rilascio,
// lp: filtro [inizio, picco, tempo del picco, fine, tau] in multipli della frequenza, u: seconda voce
// stonata di u cent, vib: [cent, ritardo], ch: soffio all'attacco, ring: quanto vibra una corda, lv: volume
const sawH = (n, p) => Array.from({ length: n }, (_, k) => 1 / Math.pow(k + 1, p));
const pluckH = (pos, n, p) => Array.from({ length: n }, (_, k) => Math.abs(Math.sin((k + 1) * Math.PI * pos)) / Math.pow(k + 1, p));
const pulseH = (duty, n) => Array.from({ length: n }, (_, k) => Math.abs(Math.sin((k + 1) * Math.PI * duty)) / (k + 1));
const INS = {
  flauto:      { w: [1, .16, .05, .02], a: .05, d: .5, s: .85, r: .14, vib: [13, .22], ch: .12, lv: 1 },
  dolce:       { w: [1, .1, .26, .04, .08, .02, .02], a: .025, d: .3, s: .8, r: .1, vib: [8, .28], ch: .16, lv: .95 },
  ney:         { w: [1, .14, .06, .02], a: .07, d: .6, s: .85, r: .18, vib: [24, .16], ch: .3, lv: 1 },
  ciaramella:  { w: pulseH(.32, 18), a: .03, d: .3, s: .85, r: .08, lp: [5, 5, 0, 4.5, .2], q: 1.6, vib: [10, .2], lv: .75 },
  fagotto:     { w: [1, .75, .6, .5, .35, .25, .15, .1], a: .04, d: .3, s: .85, r: .1, lp: [4, 4, 0, 3, .2], vib: [7, .3], lv: 1.4 },
  liuto:       { w: pluckH(.18, 20, 1), a: .003, d: .5, s: 0, r: .12, lp: [14, 14, 0, 3.5, .18], ring: .5, lv: 1.15 },
  oud:         { w: pluckH(.22, 16, 1.1), a: .004, d: .55, s: 0, r: .12, lp: [9, 9, 0, 2.5, .2], ring: .5, lv: 1.25 },
  mandolino:   { w: pluckH(.12, 24, .9), a: .002, d: .2, s: 0, r: .05, lp: [18, 18, 0, 5, .1], trem: .075, lv: 1.6 },
  arpa:        { w: pluckH(.3, 12, 1.5), a: .004, d: 1.1, s: 0, r: .3, lp: [9, 9, 0, 3, .5], ring: 1, lv: 1.1 },
  cembalo:     { w: pluckH(.07, 28, .7), a: .002, d: .6, s: 0, r: .07, lp: [24, 24, 0, 7, .35], ring: .45, lv: 2 },
  archi:       { w: sawH(24, 1), a: .3, d: 1, s: 1, r: .45, lp: [3, 3, 0, 3, 1], u: 9, vib: [7, .35], leg: 1, lv: .75 },
  spicc:       { w: sawH(20, 1), a: .008, d: .1, s: .25, r: .06, lp: [6, 6, 0, 3, .08], u: 6, lv: 2 },
  violino:     { w: sawH(24, .9), a: .05, d: .5, s: .9, r: .12, lp: [6, 6, 0, 5, .3], vib: [16, .14], lv: 1.5 },
  ottoni:      { w: sawH(20, .85), a: .035, d: .3, s: .85, r: .12, lp: [1.2, 7, .07, 4, .3], vib: [8, .35], lv: 1.7 },
  corno:       { w: sawH(14, 1.3), a: .06, d: .4, s: .9, r: .22, lp: [1, 4, .1, 2.5, .3], vib: [6, .4], lv: .9 },
  organo:      { w: [1, .8, .45, .55, 0, .3, 0, .35, 0, 0, 0, .15, 0, 0, 0, .1], a: .012, d: 1, s: 1, r: .09, leg: 1, lv: .5 },
  fisarmonica: { w: pulseH(.42, 20), a: .03, d: .5, s: .9, r: .09, lp: [6, 6, 0, 5, .3], u: 12, lv: 1.4 },
  coro:        { w: [1, .9, .75, .6, .5, .42, .32, .22, .14, .08, .05], a: .4, d: 1, s: 1, r: .6, lp: [3.2, 3.2, 0, 3.2, 1], u: 7, vib: [10, .25], leg: 1, lv: .8 },
  vetro:       { w: [1, 0, 0, .3, 0, 0, 0, .12], a: .5, d: 1, s: 1, r: .9, leg: 1, lv: .55 },
  celesta:     { w: [1, 0, 0, .45, 0, 0, 0, .12], a: .002, d: .7, s: 0, r: .4, lp: [16, 16, 0, 5, .12], ring: .8, lv: 1.4 },
  marimba:     { w: [1, 0, 0, .3, 0, 0, 0, 0, 0, .08], a: .002, d: .3, s: 0, r: .1, lp: [12, 12, 0, 4, .08], ring: .4, lv: 1.1 },
  campana:     { fm: [3.5, 2.4, .4], a: .002, d: 1.2, s: 0, r: .6, ring: 1.5, lv: .7 },
  basso:       { w: [1, .5, .3, .15, .08, .04], a: .008, d: .45, s: .5, r: .09, lp: [7, 7, 0, 3, .25], lv: 1.3 },
  pizz:        { w: [1, .45, .25, .12, .06], a: .004, d: .25, s: 0, r: .08, lp: [8, 8, 0, 3, .1], ring: .3, lv: 1.3 },
  bordone:     { w: sawH(16, 1.1), a: .6, d: 1, s: 1, r: .7, lp: [3, 3, 0, 3, 1], u: 5, leg: 1, lv: .45 },
};
for (const k in INS) INS[k].id = k;

// ---------- i brani ----------
const TRACKS = {}, bar1 = n => 'X' + '.'.repeat(n - 1);

// il tema di Pixel Saga, per la schermata del titolo: ottoni, arpa e timpani
{
  const A = { c: 'D | G | Bm | A | D | G | Em A7 | D',
    mel: 'a4*6 d5*2 d5*4 e5*2 f#5*2 | g5*8 f#5*2 e5*2 d5*4 | f#5*6 e5*2 d5*4 c#5*2 b4*2 | a4*12 -*4 | a4*6 d5*2 d5*4 e5*2 f#5*2 | g5*6 a5*2 b5*4 a5*2 g5*2 | g5*4 f#5*2 e5*2 a5*4 g5*2 e5*2 | f#5*3 e5 d5*12',
    alt: 'f#4*8 a4*8 | g4*8 b4*8 | f#4*8 d4*8 | e4*8 c#4*8 | f#4*8 a4*8 | b4*8 d5*8 | b4*8 c#5*8 | a4*16',
    head: { c: bar1(16) } };
  TRACKS.title = { bpm: 88, g: 0.53, div: 4, rev: .3, echo: [3, .28],
    v: {
      mel: { i: 'ottoni', vol: .5, e: .22 },
      alt: { i: 'corno', vol: .3, pan: -.15 },
      arp: { i: 'arpa', a: '0.1.2.3.4.3.2.1.', o: 55, vol: .3, pan: -.3 },
      pad: { i: 'archi', pad: 1, o: 62, vol: .26, pan: .25 },
      bass: { i: 'basso', b: 'r.......5.......', o: 40, vol: .45 },
      dr: { p: { m: 'x.......x.......' }, vol: .5 },
    },
    S: {
      I: { c: 'D | Asus4 A', m: 'arp bass', mel: 'a4*3 a4 d5*4 f#5*4 a5*4 | a5*8 g5*4 e5*4', alt: 'd4*16 | e4*8 c#4*8',
        head: { c: bar1(16), m: 'X.......x.......' }, fill: { m: 'x...x...x.x.xxxx' } },
      A,
      B: { c: 'Bm | G | Em | A | Bm | G | A | A7', x: { mel: { i: 'violino' } },
        mel: 'd5*4 c#5*2 b4*2 f#5*8 | g5*4 f#5*2 e5*2 d5*8 | e5*4 f#5*2 g5*2 b5*8 | a5*8 -*2 a4*2 c#5*2 e5*2 | f#5*4 e5*2 d5*2 f#5*8 | g5*4 a5*2 b5*2 d6*8 | c#6*4 b5*2 a5*2 e5*4 g5*4 | a5*12 -*4',
        fill: { m: 'x.......x...xxxx' } },
      A2: { ...A, x: { alt: { i: 'archi' } }, dr: { s: '....o.......o.oo' } },
    },
    o: ['I', 'A', 'B', 'A2'], lp: 1 };
}

// Borgo Aurora: una danza medievale in re dorico, flauto dolce, liuto, bordone e tamburello;
// al secondo giro entra la ciaramella
{
  const A = { c: 'Dm | C | Dm | C | Dm | C | Dm C | Dm',
    mel: 'd5*2 a4 d5*2 e5 | e5*2 d5 c5*2 e5 | f5*2 g5 a5*2 f5 | g5*3 e5*3 | a5*2 g5 f5*2 e5 | g5*2 f5 e5*2 c5 | d5*2 f5 e5*2 c5 | e5/d5*6' };
  const B = { c: 'F | G | F | C | Dm | G | C | Dm', m: 'drone',
    mel: 'a5*2 c6 a5*2 f5 | g5*2 b5 d6*2 b5 | a5*2 g5 f5*2 a5 | g5*3 e5*2 g5 | f5*2 e5 d5*2 f5 | g5*2 a5 b5*2 g5 | e5*2 f5 g5*2 e5 | e5/d5*6' };
  const sh = { mel: { i: 'ciaramella', t: -12 } };
  TRACKS.borgo = { bpm: 70, g: 0.58, div: 3, beats: 2, rev: .22, echo: [3, .22],
    v: {
      mel: { i: 'dolce', vol: .5, e: .15 },
      alt: { i: 'dolce', vol: .26, pan: .2 },
      lute: { i: 'liuto', s: 'x.ux.u', o: 57, vol: .3, pan: -.25 },
      bass: { i: 'pizz', b: 'r..5..', o: 40, vol: .4 },
      drone: { i: 'bordone', d: 'd3 a3', vol: .16 },
      dr: { p: { b: 'X..x..', t: 'x.ox.o' }, vol: .45 },
    },
    S: { A, B, A2: { ...A, alt: A.mel, x: sh }, B2: { ...B, alt: B.mel, x: sh, dr: { t: 'xoxxox' } } },
    o: ['A', 'B', 'A2', 'B2'] };
}

// Rocca di Lumen: marcia di corte con ottoni, clavicembalo e timpani
{
  const A = { c: 'G | D/F# | Em | C D | G | C | Am D | G',
    mel: 'g4*3 a4 b4*3 c5 d5*4 g5*4 | f#5*6 e5*2 d5*4 a4*4 | b4*3 c5 d5*3 e5 e5*6 d5*2 | c5*4 e5*4 d5*8 | g4*3 a4 b4*3 c5 d5*4 g5*4 | g5*4 a5*2 g5*2 e5*8 | c5*4 e5*4 f#5*4 a5*4 | g5*12 -*4',
    alt: 'b3*8 d4*8 | a3*8 f#4*8 | g3*8 b3*8 | g3*8 f#3*8 | b3*8 d4*8 | c4*8 e4*8 | e4*8 d4*8 | d4*16',
    head: { c: bar1(16) } };
  TRACKS.rocca = { bpm: 92, g: 0.6, div: 4, rev: .32, echo: [3, .2],
    v: {
      mel: { i: 'ottoni', vol: .45, e: .2 },
      alt: { i: 'corno', vol: .28, pan: -.2 },
      harp: { i: 'cembalo', a: '0.2.1.2.0.2.1.2.', o: 55, vol: .3, pan: -.25 },
      pad: { i: 'archi', pad: 1, o: 60, vol: .26, pan: .25 },
      bass: { i: 'basso', b: 'r...5...r...5...', o: 40, vol: .45 },
      dr: { p: { m: 'X.......x.......', s: '............o.oo' }, vol: .5 },
    },
    S: {
      A,
      B: { c: 'Em | Bm | C | D | Em | Am | D7 | D7', x: { mel: { i: 'violino' } },
        mel: 'e5*6 f#5*2 g5*4 e5*4 | f#5*6 d5*2 b4*8 | c5*4 e5*4 g5*4 c6*4 | a5*4 f#5*4 d5*4 a4*4 | g5*6 f#5*2 e5*4 b4*4 | c5*6 d5*2 e5*4 a5*4 | f#5*4 g5*2 a5*2 c6*4 a5*4 | d6*8 c6*2 b5*2 a5*4',
        alt: 'b3*16 | b3*16 | c4*16 | a3*16 | b3*16 | c4*16 | c4*16 | d4*8 c4*8',
        fill: { s: '....x...x.x.xxxx' } },
      A2: { ...A, x: { harp: { a: '0121012101210121' } }, dr: { s: '....x.......x.oo' } },
    },
    o: ['A', 'B', 'A2'] };
}

// Prati di Lumen: il tema dei campi aperti, flauto e arpa (al ritorno lo accompagna il violino)
{
  const A = { c: 'F | C/E | Dm | Bb C | F | Am | Bb | C | F | C/E | Dm | Bb | Gm | C7 | F | F',
    mel: 'c5*2 f5*2 a5*3 g5 | g5*4 e5*2 c5*2 | d5*2 f5*2 a5*2 g5*2 | f5*2 d5*2 e5*2 g5*2 | a5*2 c6*2 a5*3 f5 | e5*4 c5*2 e5*2 | d5*2 f5*2 bb5*3 a5 | g5*6 -*2 | c5*2 f5*2 a5*3 g5 | g5*4 e5*2 c5*2 | d5*2 f5*2 a5*2 d6*2 | d6*3 c6 bb5*2 f5*2 | g5*2 bb5*2 d6*3 c6 | bb5*4 g5*2 e5*2 | a5*3 g5 f5*4 | f5*4 -*4' };
  const B = { c: 'Bb | F/A | Gm | Dm | Bb | F | Gm | C', x: { mel: { i: 'violino' } },
    mel: 'd5*4 f5*4 | c5*4 a4*4 | bb4*2 d5*2 g5*4 | f5*6 e5*2 | d5*4 f5*2 bb5*2 | a5*4 g5*2 f5*2 | g5*2 a5*2 bb5*2 d6*2 | c6*6 -*2' };
  TRACKS.prati = { bpm: 104, g: 0.56, div: 2, rev: .2, echo: [3, .25],
    v: {
      mel: { i: 'flauto', vol: .55, e: .22 },
      alt: { i: 'violino', vol: .22, pan: .3 },
      arp: { i: 'arpa', a: '01234321', o: 53, vol: .3, pan: -.3 },
      pad: { i: 'archi', pad: 1, o: 62, vol: .2, pan: .25 },
      bass: { i: 'pizz', b: 'r...5...', o: 41, vol: .45 },
      dr: { p: { k: 'x.......', z: '.o.o.o.o', t: '..o...o.' }, vol: .4 },
    },
    S: { A, B, A2: { ...A, alt: 'a4*8 | g4*8 | f4*8 | f4*4 e4*4 | c5*8 | c5*8 | bb4*8 | g4*4 e4*4 | a4*8 | g4*8 | a4*8 | f4*8 | bb4*8 | bb4*4 g4*4 | a4*8 | f4*4 -*4' } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Campi Dorati: una giga allegra, violino e zufolo, liuto e tamburo a cornice
{
  const A = { c: 'G | G | C | D7 | G | G | Am D | G',
    mel: 'b4 a4 g4 d4 g4 b4 | d5 e5 d5 b4 g4 b4 | c5 e5 g5 e5 c5 e5 | d5 f#5 a5 f#5 d5 c5 | b4 a4 g4 d4 g4 b4 | d5 e5 d5 b4 g4 b4 | c5 b4 a4 d5 c5 a4 | g4*3 g4*2 d5' };
  const B = { c: 'G | C | G | D | G | C | Am D | G',
    mel: 'g5 f#5 g5 d5 b4 d5 | e5 d5 e5 g5*2 e5 | d5 b4 g4 b4 d5 g5 | f#5 e5 f#5 a5*2 f#5 | g5 f#5 g5 d5 b4 d5 | e5 d5 e5 g5 a5 b5 | c6 b5 a5 f#5 e5 d5 | g5*3 g5*2 -' };
  TRACKS.campi = { bpm: 108, g: 0.66, div: 3, beats: 2, rev: .18,
    v: {
      mel: { i: 'violino', vol: .42, e: .08 },
      alt: { i: 'dolce', t: 12, vol: .22, pan: .25 },
      lute: { i: 'liuto', s: 'x.ux.u', o: 55, vol: .28, pan: -.25 },
      bass: { i: 'pizz', b: 'r..5..', o: 40, vol: .45 },
      dr: { p: { b: 'Xoox.o', z: '..o..o' }, vol: .45 },
    },
    S: { A, B, A2: { ...A, alt: A.mel }, B2: { ...B, alt: B.mel } },
    o: ['A', 'A2', 'B', 'B2'] };
}

// Bosco Antico: misterioso, in mi dorico, flauto con eco, arpa e lucciole di celesta
{
  const A = { c: 'Em | A/E | Em | A/E | C | D | Em | Bm',
    mel: 'b4*3 e5*2 f#5 | c#5*3 e5*2 a5 | b5*3 a5 g5*2 | e5*3 c#5*2 a4 | e5*3 g5*2 c6 | a5*3 f#5*2 d5 | e5*3 g5 f#5 e5 | b4*6' };
  const B = { c: 'C | G | D | Em | C | G | Am B | Em', dr: { w: '...o..' },
    mel: 'g5*3 e5*2 g5 | b5*3 d6*2 b5 | a5*3 f#5*2 d5 | e5*3 g5*2 b5 | c6*3 b5 a5 g5 | b5*3 a5 g5 d5 | a5*2 c6 b5*2 d#5 | e5*6' };
  TRACKS.bosco = { bpm: 84, g: 0.6, div: 2, beats: 3, rev: .38, echo: [3, .38],
    v: {
      mel: { i: 'flauto', vol: .5, e: .35 },
      arp: { i: 'arpa', a: '012321', o: 52, vol: .3, pan: -.3 },
      pad: { i: 'coro', pad: 1, o: 64, vol: .14, pan: .25 },
      bass: { i: 'basso', b: 'r.....', o: 40, vol: .32 },
      spark: { i: 'celesta', r: { p: .1, n: 'e6 f#6 g6 b6 d7 e7' }, vol: .2, pan: .35, e: .5 },
      dr: { p: {}, vol: .35 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'dolce' } } }, B2: { ...B, x: { pad: { g: 1.4 } }, dr: { w: '...o.o' } } },
    o: ['A', 'B', 'A2', 'B2'] };
}

// Lago di Cristallo: sognante, fa lidio, celesta e campane sull'acqua
{
  const A = { c: 'Fmaj7 | G/F | Fmaj7 | G/F | Am | G | Fmaj7 | G', head: { c: 'x.......' },
    mel: 'a5*4 c6*2 e6*2 | d6*4 b5*2 g5*2 | a5*4 f5*2 c6*2 | b5*6 -*2 | c6*4 e6*2 a5*2 | d6*4 b5*2 g5*2 | a5*3 g5 f5*2 e5*2 | g5*6 -*2' };
  const B = { c: 'Dm | Em | F | G | Dm | Em | F | G', x: { mel: { i: 'flauto' } },
    mel: 'f5*4 a5*2 d6*2 | e6*4 b5*2 g5*2 | a5*4 c6*2 f6*2 | d6*3 c6 b5*2 g5*2 | a5*4 f5*2 d5*2 | g5*4 e5*2 b4*2 | c5*4 e5*2 a5*2 | b5*8' };
  TRACKS.lago = { bpm: 72, g: 0.67, div: 2, rev: .45, echo: [3, .4],
    v: {
      mel: { i: 'celesta', vol: .5, e: .4 },
      arp: { i: 'arpa', a: '01234321', o: 53, vol: .3, pan: -.35 },
      pad: { i: 'vetro', pad: 1, o: 65, vol: .2, pan: .3 },
      bass: { i: 'basso', b: 'r.......', o: 41, vol: .3 },
      spark: { i: 'campana', r: { p: .05, n: 'c7 e7 g7 a6 b6' }, vol: .14, pan: -.4, e: .5 },
      dr: { p: {}, vol: .3 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'campana', t: -12 } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Monti e Picco del Drago: epico, corni e cori, archi incalzanti e timpani
{
  const A = { c: 'Dm | Bb | C | Dm | Dm | Bb | Gm | A', head: { g: bar1(16) },
    mel: 'd5*6 a4*2 d5*4 e5*4 | f5*12 e5*2 d5*2 | e5*6 c5*2 g5*8 | f5*4 e5*4 d5*8 | a5*6 g5*2 f5*4 a5*4 | bb5*8 a5*4 f5*4 | g5*6 f5*2 g5*4 bb5*4 | a5*12 -*4' };
  const B = { c: 'Bb | F | C | Dm | Bb | F | Gm A | Dm', x: { mel: { i: 'ottoni' } }, head: { c: bar1(16) }, fill: { m: 'x.......x.x.xxxx' },
    mel: 'd6*8 c6*4 bb5*4 | a5*8 f5*4 c5*4 | e5*6 f5*2 g5*8 | a5*12 f5*2 e5*2 | d5*6 f5*2 bb5*8 | c6*6 a5*2 f5*8 | g5*4 bb5*4 a5*4 c#6*4 | d6*12 -*4' };
  TRACKS.monti = { bpm: 80, g: 0.61, div: 4, rev: .35, echo: [6, .25],
    v: {
      mel: { i: 'corno', vol: .5, e: .2 },
      ost: { i: 'spicc', b: 'r-r-r-r-8-r-r-5-', o: 50, vol: .26, pan: -.2 },
      pad: { i: 'coro', pad: 1, o: 62, vol: .18, pan: .25 },
      bass: { i: 'basso', b: 'r.......r.......', o: 38, vol: .42 },
      dr: { p: { m: 'X.......x.....x.' }, vol: .55 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'violino' } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Rupi e Nido del Grifone: una cavalcata in la minore, archi al galoppo
{
  const A = { c: 'Am | F | G | Em | Am | F | G | E', head: { c: bar1(16) },
    mel: 'a4*4 c5*2 e5*2 a5*8 | a5*4 g5*2 f5*2 c5*8 | b4*4 d5*2 g5*2 b5*6 a5*2 | g5*8 e5*8 | a4*4 c5*2 e5*2 a5*6 b5*2 | c6*8 a5*4 f5*4 | d6*4 c6*2 b5*2 g5*4 b5*4 | g#5*8 e5*4 b4*4' };
  const B = { c: 'F | G | Em | Am | F | G | Am E | Am', fill: { s: '....x.......xxxx' },
    mel: 'f5*6 g5*2 a5*8 | g5*6 a5*2 b5*8 | b5*6 a5*2 g5*4 e5*4 | a5*12 -*4 | c6*6 b5*2 a5*4 f5*4 | d6*6 c6*2 b5*4 g5*4 | c6*4 a5*4 b5*4 g#5*4 | a5*12 -*4' };
  TRACKS.rupi = { bpm: 120, g: 0.61, div: 4, rev: .25, echo: [3, .2],
    v: {
      mel: { i: 'ottoni', vol: .45, e: .15 },
      gal: { i: 'spicc', b: 'r.rrr.rrr.rrr.rr', o: 52, vol: .28, pan: -.2 },
      pad: { i: 'archi', pad: 1, o: 64, vol: .2, pan: .25 },
      bass: { i: 'basso', b: 'r.......r...5...', o: 40, vol: .42 },
      dr: { p: { k: 'x.......x.......', s: '....x.......x...', h: 'o.ooo.ooo.ooo.oo' }, vol: .45 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'corno' } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Valle Gelata: celesta e vetro, un valzer lento in si minore
{
  const A = { c: 'Bm | G | Em | F# | Bm | D | G | F#',
    mel: 'f#5*4 b5*2 | d6*4 b5*2 | e6*2 d6*2 b5*2 | a#5*6 | d6*3 c#6 b5*2 | a5*4 f#5*2 | g5*2 b5*2 d6*2 | c#6*6' };
  const B = { c: 'G | D | Em | Bm | G | D | Em F# | Bm', x: { mel: { i: 'flauto', t: -12 } }, dr: { j: 'o.....' },
    mel: 'b5*4 d6*2 | f#6*4 e6*2 | e6*2 g6*2 e6*2 | d6*4 b5*2 | g5*4 b5*2 | a5*4 f#5*2 | g5*2 b5 a#5*3 | b5*6' };
  TRACKS.gelo = { bpm: 66, g: 0.73, div: 2, beats: 3, rev: .45, echo: [3, .4],
    v: {
      mel: { i: 'celesta', vol: .5, e: .4 },
      arp: { i: 'arpa', a: '012321', o: 59, vol: .24, pan: -.3 },
      pad: { i: 'vetro', pad: 1, o: 66, vol: .2, pan: .3 },
      bass: { i: 'basso', b: 'r.....', o: 44, vol: .3 },
      spark: { i: 'celesta', r: { p: .1, n: 'b6 c#7 d7 f#7 a6' }, vol: .16, pan: .4, e: .5 },
      dr: { p: {}, vol: .35 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'campana', t: -12 } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Deserto di Solis: scala hijaz, ney, oud e darbuka (al secondo giro la zurna)
{
  const a = { c: 'E | F | E | Dm E',
    mel: 'f5/e5*4 f5*2 g#5*2 a5*4 g#5*2 f5*2 | f5*6 e5*2 f5*2 a5*2 c6*4 | b5*4 a5*2 g#5*2 f5*4 e5*4 | d5*4 f5*4 f5/e5*8',
    oud: 'e3*2 f3*2 g#3*2 a3*2 g#3*2 f3*2 e3*4 | f3*2 a3*2 c4*2 a3*2 f3*2 e3*2 f3*4 | e3*2 f3*2 g#3*2 a3*2 b3*2 a3*2 g#3*2 f3*2 | d3*2 f3*2 a3*2 f3*2 e3*2 g#3*2 b3*2 g#3*2' };
  const b = { c: 'Am | G | F | E', m: 'drone',
    mel: 'c6*4 b5*2 a5*2 e5*8 | d6*4 c6*2 b5*2 g5*8 | c6*4 b5*2 a5*2 f5*4 a5*4 | g#5*6 f5*2 f5/e5*8',
    oud: 'a3*2 c4*2 e4*2 c4*2 a3*2 e3*2 a3*4 | g3*2 b3*2 d4*2 b3*2 g3*2 d3*2 g3*4 | f3*2 a3*2 c4*2 a3*2 f3*2 c3*2 f3*4 | e3*2 f3*2 g#3*2 f3*2 e3*8' };
  const c = { c: 'E | E | F | E', dr: { e: '..o...o.....o...' },
    mel: 'b5*16 | a5*2 g#5*6 f5*4 e5*4 | f5*8 a5*8 | g#5*12 -*4',
    oud: 'e3*16 | e3*4 b3*4 e3*4 b3*4 | f3*16 | e3*16' };
  const zurna = { mel: { i: 'ciaramella' } };
  TRACKS.deserto = { bpm: 96, g: 0.57, div: 4, rev: .3, echo: [3, .3],
    v: {
      mel: { i: 'ney', vol: .5, e: .25 },
      oud: { i: 'oud', vol: .32, pan: -.25 },
      drone: { i: 'bordone', d: 'e2 b2', vol: .14 },
      bass: { i: 'basso', b: 'r.......r.......', o: 40, vol: .28 },
      dr: { p: { d: 'X.......x.......', e: '..x...x...o.x.o.', t: '....o.......o...' }, vol: .5 },
    },
    S: { a, b, a2: { ...a, x: zurna }, b2: { ...b, x: zurna }, c },
    o: ['a', 'b', 'a2', 'b2', 'c'] };
}

// Palude d'Ombra: un fagotto furtivo su un basso cromatico, rane di marimba
{
  const A = { c: 'Cm | Cm/B | Cm7/Bb | Am7b5 | Ab | G7 | Cm | G7',
    mel: 'c5*3 eb5 g5*4 | g5*3 f5 eb5*4 | c5*4 bb4*2 g4*2 | eb5*3 c5 a4*4 | ab4*2 c5*2 eb5*2 ab5*2 | g5*3 f5 d5*2 b4*2 | c5*2 eb5*2 g5*3 f#5 | g5*4 f5*2 d5*2' };
  const B = { c: 'Fm | Cm | Db | G7 | Fm | Cm | Ab G7 | Cm', x: { mel: { i: 'celesta', t: 12 } },
    mel: 'ab5*4 g5*2 f5*2 | g5*4 eb5*2 c5*2 | f5*4 db5*2 ab4*2 | b4*4 d5*2 f5*2 | c6*4 ab5*2 f5*2 | eb6*4 c6*2 g5*2 | c6*2 ab5*2 b5*2 g5*2 | c6*6 -*2' };
  TRACKS.palude = { bpm: 76, g: 0.74, div: 2, rev: .35, echo: [3, .3],
    v: {
      mel: { i: 'fagotto', t: -12, vol: .5, e: .2 },
      bass: { i: 'pizz', b: 'r...l...', o: 43, vol: .45 },
      pad: { i: 'coro', pad: 1, o: 60, vol: .14, pan: .25 },
      frog: { i: 'marimba', r: { p: .1, n: 'c4 eb4 g4 bb3 f4' }, vol: .14, pan: -.35 },
      dr: { p: { k: 'o...o...', w: '..o...o.' }, vol: .4 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'coro' } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Monte Brace: incalzante, ottoni e organo su archi martellati
{
  const A = { c: 'Dm | Eb | Dm | C | Bb | C | Dm | Eb A', head: { g: bar1(16) },
    mel: 'd5*2 -*2 d5*2 f5*2 a5*6 g5*2 | bb5*8 g5*4 eb5*4 | a5*6 g5*2 f5*4 d5*4 | e5*8 g5*4 c6*4 | d6*6 c6*2 bb5*4 f5*4 | c6*6 bb5*2 g5*4 e5*4 | f5*6 e5*2 d5*4 a5*4 | g5*4 bb5*4 a5*4 c#6*4' };
  const B = { c: 'Gm | Dm | Eb | A | Gm | Dm | Eb | A', fill: { o: '........o.o.OOOO' },
    mel: 'g5*4 bb5*4 d6*8 | f5*4 a5*4 d6*8 | eb6*6 d6*2 bb5*4 g5*4 | a5*4 c#6*4 e6*8 | g5*4 bb5*4 d6*4 g6*4 | f6*6 e6*2 d6*4 a5*4 | eb6*4 d6*2 c6*2 bb5*4 g5*4 | a5*12 -*4' };
  TRACKS.brace = { bpm: 132, g: 0.61, div: 4, rev: .28, echo: [3, .2],
    v: {
      mel: { i: 'ottoni', vol: .42, e: .14 },
      ost: { i: 'spicc', b: 'r-r-r-r-r-r-r-r-', o: 50, vol: .24, pan: -.2 },
      pad: { i: 'organo', pad: 1, o: 62, vol: .18, pan: .25 },
      bass: { i: 'basso', b: 'r...r...r...r.r.', o: 38, vol: .42 },
      dr: { p: { k: 'X.....x.x.....x.', s: '....x.......x...', h: 'o.o.o.o.o.o.o.o.' }, vol: .45 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'violino' } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// Costa delle Conchiglie e Faro: un valzer di mare, mandolino e fisarmonica
{
  const A = { c: 'D | Bm | G | A7 | D | Bm | Em A | D',
    mel: 'a4*2 d5*2 f#5*2 | f#5*4 e5 d5 | d5*2 g5*2 b5*2 | a5*4 g5 e5 | f#5*2 a5*2 d6*2 | d6*3 c#6 b5*2 | b5*2 g5 a5*2 c#5 | d5*6' };
  const B = { c: 'G | A | F#m | Bm | G | A | D A7 | D',
    mel: 'b5*4 a5 g5 | c#6*4 b5 a5 | a5*2 c#6*2 f#6*2 | f#6*3 e6 d6*2 | d6*2 b5*2 g5*2 | e6*2 c#6*2 a5*2 | f#5*2 a5 e5*2 g5 | d5*6' };
  TRACKS.costa = { bpm: 132, g: 0.87, div: 2, beats: 3, rev: .22, echo: [2, .2],
    v: {
      mel: { i: 'mandolino', vol: .45, e: .12 },
      acc: { i: 'fisarmonica', s: '--u-u-', o: 62, vol: .2, pan: .2 },
      bass: { i: 'basso', b: 'r.....5.....', o: 40, vol: .38 },
      dr: { p: { t: '..o.o.', k: 'o.....' }, vol: .4 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'fisarmonica' }, acc: { i: 'mandolino' } } }, B2: { ...B, x: { mel: { i: 'flauto' } } } },
    o: ['A', 'B', 'A2', 'B2'] };
}

// i santuari del bosco, del lago e del ghiaccio: arpa inquieta, coro lontano
TRACKS.santuario = { bpm: 88, g: 0.56, div: 2, rev: .42, echo: [3, .35],
  v: {
    mel: { i: 'flauto', vol: .45, e: .32 },
    arp: { i: 'arpa', a: '01210121', o: 57, vol: .26, pan: -.3 },
    pad: { i: 'coro', pad: 1, o: 60, vol: .15, pan: .25 },
    bass: { i: 'basso', b: 'r.......', o: 40, vol: .34 },
    spark: { i: 'celesta', r: { p: .07, n: 'a5 c6 e6 g6 b6' }, vol: .18, pan: .35, e: .5 },
    dr: { p: { w: '....o...' }, vol: .4 },
  },
  S: {
    A: { c: 'Am | F | Dm | E | Am | F | Dm Bdim | E',
      mel: 'e5*6 d5 c5 | a4*6 c5 f5 | d5*4 f5*2 a5*2 | g#5*6 -*2 | a5*4 g5*2 e5*2 | f5*4 e5*2 c5*2 | d5*2 f5*2 b4*2 d5*2 | e5*8' },
    B: { c: 'F | G | Em | Am | F | G | E | E7',
      mel: 'c6*6 b5 a5 | b5*6 a5 g5 | g5*4 e5*2 b4*2 | c5*6 -*2 | a5*4 c6*2 f6*2 | d6*4 b5*2 g5*2 | g#5*4 b5*2 e6*2 | d6*4 b5*2 g#5*2' },
  },
  o: ['A', 'B'],
  var: {
    bosco: {},
    lago: { t: 3, bpm: 80, rev: .5, g: 1.29, i: { mel: 'celesta', pad: 'vetro', spark: 'campana' }, dr: { w: '' } },
    ghiaccio: { t: 5, bpm: 76, g: 1.36, i: { mel: 'celesta', pad: 'vetro' }, dr: { w: '', j: 'o.......' } },
  } };

// i templi del sole e del fuoco: ostinato teso, ottoni e organo
TRACKS.tempio = { bpm: 104, g: 0.64, div: 4, rev: .38, echo: [3, .25],
  v: {
    mel: { i: 'ottoni', vol: .42, e: .2 },
    ost: { i: 'spicc', a: '0-1-2-1-0-1-2-1-', o: 52, vol: .22, pan: -.25 },
    pad: { i: 'organo', pad: 1, o: 60, vol: .16, pan: .25 },
    bass: { i: 'basso', b: 'r...r...r...r.r.', o: 40, vol: .4 },
    dr: { p: { k: 'x.......x.......', s: '....o.......o...', h: '..o...o...o...o.', m: 'x...............' }, vol: .45 },
  },
  S: {
    A: { c: 'Em | C | Am | B | Em | C | Am B | Em', head: { c: bar1(16) },
      mel: 'e5*6 f#5*2 g5*4 b5*4 | c6*6 b5*2 g5*8 | a5*6 g5*2 e5*4 c5*4 | b4*4 d#5*4 f#5*8 | g5*6 a5*2 b5*4 e6*4 | e6*6 d6*2 c6*4 g5*4 | c6*4 a5*4 b5*4 d#6*4 | e6*12 -*4' },
    B: { c: 'C | D | Bm | Em | C | D | B | B7', fill: { o: '........o.o.OOOO' },
      mel: 'g5*6 e5*2 c5*8 | a5*6 f#5*2 d5*8 | b5*6 f#5*2 d5*4 b4*4 | e5*6 g5*2 b5*8 | c6*4 b5*4 g5*4 e5*4 | d6*4 c6*4 a5*4 f#5*4 | d#6*4 f#6*4 b5*8 | a5*8 f#5*4 d#5*4' },
  },
  o: ['A', 'B'],
  var: {
    sole: { bpm: 96, i: { mel: 'ney', pad: 'coro', ost: 'oud' }, dr: { k: '', s: '', h: '', m: '', d: 'X.......x.......', e: '..x...x.....x...', t: '....o.......o...' } },
    fuoco: { t: -2, bpm: 112, dr: { g: bar1(64) } },
  } };

// le grotte: gocce di celesta, un bordone e un flauto lontano
TRACKS.grotta = { bpm: 70, g: 0.63, div: 2, rev: .55, echo: [3, .4],
  v: {
    mel: { i: 'flauto', vol: .4, e: .4 },
    pad: { i: 'coro', pad: 1, o: 57, vol: .13, pan: .25 },
    drone: { i: 'bordone', d: 'd3 a3', vol: .12 },
    bass: { i: 'basso', b: 'r.......', o: 40, vol: .28 },
    drip: { i: 'celesta', r: { p: .14, n: 'd6 f6 a6 c7 e6 g6' }, vol: .22, pan: .3, e: .55 },
  },
  S: {
    A: { c: 'Dm | C | Bb | A | Dm | C | Gm A | Dm',
      mel: 'a4*6 d5 e5 | g5*4 e5*2 c5*2 | d5*6 f5 d5 | c#5*8 | f5*4 e5*2 d5*2 | e5*4 g5*2 c6*2 | bb5*4 a5*2 e5*2 | d5*8' },
    B: { c: 'Bb | A | Gm | A | Bb | C | A | A',
      mel: 'f5*8 | e5*6 c#5*2 | d5*8 | e5*8 | d5*4 f5*4 | e5*4 g5*4 | a5*8 | c#5*4 e5*4' },
  },
  o: ['A', 'B'],
  var: {
    funghi: { t: 2, bpm: 78, i: { mel: 'dolce', drip: 'marimba' } },
    mare: { t: -2, rev: .5, g: 1.05, i: { drip: 'arpa' } },
    cristalli: { t: 5, g: 1.65, i: { mel: 'celesta', pad: 'vetro', drip: 'campana' } },
    gelo: { t: -3, bpm: 64, g: 1.7, i: { mel: 'celesta', pad: 'vetro' } },
  } };

// i guardiani: battaglia in do diesis minore
{
  const A = { c: 'C#m | C#m | A | B | C#m | C#m | A B | G#', head: { c: bar1(16) },
    mel: 'c#5*3 c#5*3 e5*2 g#5*6 f#5*2 | e5*3 e5*3 g#5*2 c#6*8 | c#6*3 b5*3 a5*2 e5*8 | d#5*3 f#5*3 b5*2 a5*4 f#5*4 | g#5*3 g#5*3 b5*2 c#6*6 b5*2 | e6*8 d#6*2 c#6*2 b5*2 g#5*2 | a5*4 c#6*4 b5*4 d#6*4 | g#5*6 c6*2 d#6*8' };
  const B = { c: 'A | B | G#m | C#m | A | B | G# | G#7', fill: { s: '....X...x.x.xxxx', o: '........o.o.OOOO' },
    mel: 'e5*2 a5*2 c#6*4 b5*4 a5*4 | f#5*2 b5*2 d#6*4 c#6*4 b5*4 | d#6*6 b5*2 g#5*8 | e6*6 d#6*2 c#6*8 | e6*4 c#6*4 a5*4 c#6*4 | f#6*4 d#6*4 b5*4 d#6*4 | c6*4 d#6*4 g#5*4 c6*4 | d#6*12 -*4' };
  TRACKS.guardiano = { bpm: 150, g: 0.66, div: 4, rev: .25, echo: [3, .15],
    v: {
      mel: { i: 'ottoni', vol: .44, e: .12 },
      arp: { i: 'spicc', a: '0121012101210121', o: 56, vol: .2, pan: -.2 },
      pad: { i: 'organo', pad: 1, o: 60, vol: .17, pan: .25 },
      bass: { i: 'basso', b: 'r.r.r.r.8.r.r.r.', o: 40, vol: .44 },
      dr: { p: { k: 'X.....x.x.....x.', s: '....X.......X...', h: 'o.o.o.o.o.o.o.o.', m: 'x.......x.......' }, vol: .34 },
    },
    S: { A, B, A2: { ...A, x: { mel: { i: 'violino' } } } },
    o: ['A', 'B', 'A2', 'B'] };
}

// ---------- suono ----------
let G = null;              // il grafo audio in uso: contesto, uscita, riverbero, rumore, forme d'onda
const BASE = 0.5;
function graphFor(X, dest) {
  const bus = X.createGain(); bus.gain.value = BASE; bus.connect(dest);
  // riverbero: rumore che si spegne e diventa più scuro, come in una sala di pietra
  const sr = X.sampleRate, n = Math.floor(sr * 2.2), ir = X.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c); let y = 0;
    for (let i = Math.floor(sr * 0.012); i < n; i++) { const t = i / sr; y += (0.85 - 0.7 * Math.min(1, t / 1.6)) * (Math.random() * 2 - 1 - y); d[i] = y * Math.exp(-t / 0.36); }
  }
  const rin = X.createBiquadFilter(), rvb = X.createConvolver();
  rin.type = 'highpass'; rin.frequency.value = 260; rvb.buffer = ir;
  rin.connect(rvb); rvb.connect(bus);
  const noise = X.createBuffer(1, sr * 2.5, sr), nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  return { x: X, bus, rin, noise, waves: {}, tgt: BASE };
}
function waveOf(I) {
  if (G.waves[I.id]) return G.waves[I.id];
  const N = I.w.length + 1, re = new Float32Array(N), im = new Float32Array(N);
  for (let k = 1; k < N; k++) im[k] = I.w[k - 1];
  return (G.waves[I.id] = G.x.createPeriodicWave(re, im));
}
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
// una nota: oscillatori → filtro → inviluppo → voce
function note(V, I, m, t, dur, g) {
  const X = G.x, f = mf(m), pk = g * I.lv * 0.2 * (I.u ? 0.62 : 1);
  const env = X.createGain(), eg = env.gain, end = Math.max(t + dur, t + I.a + 0.01, t + (I.ring || 0));
  eg.setValueAtTime(0, t); eg.linearRampToValueAtTime(pk, t + I.a);
  if (I.s < 1) eg.setTargetAtTime(pk * I.s, t + I.a, I.d);
  eg.setTargetAtTime(0, end, I.r / 3);
  const stop = I.s === 0 ? Math.min(end + I.r * 2.2, t + I.a + I.d * 6.5) + 0.03 : end + I.r * 2.2 + 0.03;
  env.connect(V.bus);
  let into = env;
  if (I.lp) {
    const fl = X.createBiquadFilter(), L = I.lp, fp = fl.frequency, cl = k => Math.max(80, Math.min(15000, k * f));
    fl.type = 'lowpass'; fl.Q.value = I.q || 0.7;
    fp.setValueAtTime(cl(L[0]), t);
    if (L[2] > 0) fp.linearRampToValueAtTime(cl(L[1]), t + L[2]);
    fp.setTargetAtTime(cl(L[3]), t + L[2], L[4]);
    fl.connect(env); into = fl;
  }
  const os = [];
  if (I.fm) {   // campana: modulazione di frequenza, armoniche non intere
    const c = X.createOscillator(), mo = X.createOscillator(), mg = X.createGain();
    c.frequency.value = f; mo.frequency.value = f * I.fm[0];
    mg.gain.setValueAtTime(f * I.fm[1], t); mg.gain.setTargetAtTime(0, t, I.fm[2]);
    mo.connect(mg); mg.connect(c.frequency); c.connect(into); os.push(c, mo);
  } else {
    for (let k = 0; k < (I.u ? 2 : 1); k++) {
      const o = X.createOscillator();
      o.setPeriodicWave(waveOf(I)); o.frequency.value = f;
      if (I.u) o.detune.value = k ? I.u : -I.u;
      o.connect(into); os.push(o);
    }
    if (I.vib) {   // vibrato che arriva dopo l'attacco, come un fiatista vero
      const lfo = X.createOscillator(), vg = X.createGain();
      lfo.frequency.value = 4.8 + Math.random() * 1.2;
      vg.gain.setValueAtTime(0, t + I.vib[1]); vg.gain.linearRampToValueAtTime(I.vib[0], t + I.vib[1] + 0.3);
      lfo.connect(vg); for (const o of os) vg.connect(o.detune); os.push(lfo);
    }
  }
  if (I.ch) {   // il soffio all'attacco di flauti e canne
    const s = X.createBufferSource(), bp = X.createBiquadFilter(), ng = X.createGain();
    s.buffer = G.noise; bp.type = 'bandpass'; bp.frequency.value = Math.min(9000, f * 2.2); bp.Q.value = 1.1;
    ng.gain.setValueAtTime(pk * I.ch * 4, t); ng.gain.setTargetAtTime(0, t + 0.012, 0.03);
    s.connect(bp); bp.connect(ng); ng.connect(V.bus); s.start(t, Math.random() * 0.8); s.stop(t + 0.15);
  }
  for (const o of os) { o.start(t); o.stop(stop); }
}
// tamburi e percussioni
function noiseHit(V, t, type, fq, q, vol, tau, len) {
  const X = G.x, s = X.createBufferSource(), fl = X.createBiquadFilter(), e = X.createGain();
  s.buffer = G.noise; fl.type = type; fl.frequency.value = fq; fl.Q.value = q;
  e.gain.setValueAtTime(vol, t); e.gain.setTargetAtTime(0, t + 0.004, tau);
  s.connect(fl); fl.connect(e); e.connect(V.bus); s.start(t, Math.random() * 0.5); s.stop(t + Math.min(1.9, len || tau * 6));
}
function toneHit(V, t, f0, f1, ft, vol, tau) {
  const X = G.x, o = X.createOscillator(), e = X.createGain();
  o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + ft);
  e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(vol, t + 0.003); e.gain.setTargetAtTime(0, t + 0.006, tau);
  o.connect(e); e.connect(V.bus); o.start(t); o.stop(t + tau * 6 + 0.02);
}
function drum(V, k, t, g, n, spb) {
  switch (k) {
    case 'k': toneHit(V, t, 120, 45, 0.12, 0.7 * g, 0.12); break;                                                                           // grancassa
    case 's': noiseHit(V, t, 'bandpass', 1900, 0.8, 0.35 * g, 0.06); toneHit(V, t, 190, 160, 0.05, 0.15 * g, 0.04); break;                   // rullante
    case 'r': for (let i = 0; i < 4; i++) noiseHit(V, t + i * spb / 4, 'bandpass', 2000, 0.8, (0.12 + i * 0.04) * g, 0.03); break;         // rullo
    case 'h': noiseHit(V, t, 'highpass', 7500, 0.7, 0.22 * g, 0.014); break;                                                                // charleston
    case 'z': noiseHit(V, t, 'bandpass', 5500, 1.4, 0.2 * g, 0.03); break;                                                                  // shaker
    case 't': noiseHit(V, t, 'bandpass', 9000, 2.5, 0.25 * g, 0.045); noiseHit(V, t + 0.02, 'bandpass', 10500, 3, 0.14 * g, 0.04); break;    // tamburello
    case 'j': for (let i = 0; i < 3; i++) noiseHit(V, t + i * 0.028, 'bandpass', 8600 + i * 600, 6, 0.3 * g, 0.03); break;                  // sonagli
    case 'b': toneHit(V, t, 100, 62, 0.1, 0.6 * g, 0.09); noiseHit(V, t, 'lowpass', 900, 0.7, 0.25 * g, 0.025); break;                      // tamburo a cornice
    case 'd': toneHit(V, t, 125, 75, 0.12, 0.65 * g, 0.13); noiseHit(V, t, 'lowpass', 600, 0.7, 0.2 * g, 0.03); break;                       // darbuka, colpo grave
    case 'e': noiseHit(V, t, 'bandpass', 3300, 1.3, 0.35 * g, 0.022); toneHit(V, t, 920, 900, 0.01, 0.12 * g, 0.012); break;                 // darbuka, colpo secco
    case 'w': toneHit(V, t, 1050, 1000, 0.02, 0.35 * g, 0.025); toneHit(V, t, 2350, 2300, 0.02, 0.12 * g, 0.012); break;                    // legnetto
    case 'c': noiseHit(V, t, 'highpass', 6500, 0.6, 0.16 * g, 0.32); break;                                                            // piatto
    case 'o': toneHit(V, t, 200, 120, 0.1, 0.45 * g, 0.14); break;                                                                           // tom
    case 'O': toneHit(V, t, 140, 80, 0.12, 0.5 * g, 0.18); break;                                                                           // tom grave
    case 'm': { const f = mf(n[0]); toneHit(V, t, f * 1.05, f, 0.08, 0.4 * g, 0.42); toneHit(V, t, f * 1.52, f * 1.5, 0.08, 0.12 * g, 0.18); noiseHit(V, t, 'lowpass', 350, 0.7, 0.15 * g, 0.03); break; } // timpano
    case 'g': { const X = G.x, c = X.createOscillator(), mo = X.createOscillator(), mg = X.createGain(), e = X.createGain();             // gong
      c.frequency.value = 74; mo.frequency.value = 74 * 1.41; mg.gain.setValueAtTime(74 * 3, t); mg.gain.setTargetAtTime(74 * 0.6, t, 1.2);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.3 * g, t + 0.03); e.gain.setTargetAtTime(0, t + 0.05, 1.3);
      mo.connect(mg); mg.connect(c.frequency); c.connect(e); e.connect(V.bus); c.start(t); mo.start(t); c.stop(t + 7); mo.stop(t + 7); break; }
  }
}
function play(dk, e, t, s) {
  const V = dk.vo[e.v], C = dk.C;
  if (e.k) return drum(V, e.k, t, e.g, e.n, C.spb);
  const I = INS[e.i];
  let notes = e.n, dur = e.d * C.spb, g = e.g * (0.9 + Math.random() * 0.18) * (s % C.bar ? 1 : 1.08);
  if (e.rnd) { if (Math.random() > e.rnd) return; notes = [notes[Math.floor(Math.random() * notes.length)]]; }
  t += Math.random() * 0.006;
  if (e.gr != null) { const gd = Math.min(0.07, C.spb * 0.35); note(V, I, e.gr, t, gd, g * 0.75); t += gd; dur -= gd; }
  const sp = notes.length > 1 && I.s === 0 ? 0.018 : 0;   // gli accordi pizzicati si arpeggiano appena
  notes.forEach((m, k) => {
    if (I.trem && dur > I.trem * 1.8) for (let u = 0; u < dur - 0.03; u += I.trem) note(V, I, m, t + u + k * sp, I.trem * 1.4, g * (u ? 0.72 : 1));
    else note(V, I, m, t + k * sp, I.leg ? dur : dur - Math.min(dur * 0.08, 0.05), g);
  });
}

// ---------- i lettori: uno per brano, quello vecchio sfuma mentre entra il nuovo ----------
const M = { want: null, on: true, cur: null, old: [], pos: {}, comp: {}, duck: 0 };
const comp = id => M.comp[id] || (M.comp[id] = compile(id));
function deckNew(id, now, delay) {
  const C = comp(id), T = C.T, X = G.x, nodes = [];
  const out = X.createGain(); out.gain.value = 0; out.connect(G.bus);
  const rs = X.createGain(); rs.gain.value = C.rev; out.connect(rs); rs.connect(G.rin); nodes.push(out, rs);
  let ein = null;
  if (C.echo) {   // l'eco a tempo, come nelle vecchie console
    ein = X.createGain(); const dl = X.createDelay(2), fb = X.createGain(), lp = X.createBiquadFilter();
    dl.delayTime.value = Math.min(1.9, C.echo[0] * C.spb); fb.gain.value = C.echo[1]; lp.type = 'lowpass'; lp.frequency.value = 2400;
    ein.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(out); nodes.push(ein, dl, fb, lp);
  }
  const vo = C.names.map(nm => {
    const v = T.v[nm], bus = X.createGain(); bus.gain.value = v.vol ?? 0.5;
    let tail = bus; nodes.push(bus);
    if (v.pan && X.createStereoPanner) { const p = X.createStereoPanner(); p.pan.value = v.pan; bus.connect(p); tail = p; nodes.push(p); }
    tail.connect(out);
    if (v.e && ein) { const s = X.createGain(); s.gain.value = v.e; tail.connect(s); s.connect(ein); nodes.push(s); }
    return { bus };
  });
  const p = M.pos[id], step = p && now - p.t < 150 && p.s < C.steps ? p.s : 0;   // tornando presto, riprende da dov'era
  out.gain.setValueAtTime(0, now); out.gain.setTargetAtTime(C.g, now + delay, step ? 0.7 : delay > 0.1 ? 0.3 : 0.03);
  return { id, C, out, nodes, vo, step, next: now + delay + 0.04, end: 0 };
}
function deckFade(dk, now, tau) {
  const gp = dk.out.gain; gp.cancelScheduledValues(now); gp.setValueAtTime(gp.value, now); gp.setTargetAtTime(0, now, tau);
  dk.end = now + tau * 6;
  M.pos[dk.id] = { s: dk.step - dk.step % dk.C.bar, t: now };
}
function stepDeck(dk) {
  const C = dk.C, s = dk.step, t = dk.next + (s & 1 ? C.sw * C.spb : 0), E = C.ev[s];
  if (E) for (const e of E) play(dk, e, t, s);
  dk.step = s + 1 < C.steps ? s + 1 : C.lp;
  dk.next += C.spb;
}
const LA = 0.3;   // quanto avanti si preparano le note (secondi)
function tick(mul) {
  if (typeof actx === 'undefined' || !actx || !master) return;
  if (!G || G.x !== actx) { G = graphFor(actx, master); M.cur = null; M.old = []; }
  const now = actx.currentTime, want = M.on ? M.want : null, cid = M.cur ? M.cur.id : null;
  if (cid !== want) {
    if (M.cur) { deckFade(M.cur, now, 0.45); M.old.push(M.cur); M.cur = null; }
    const back = want && M.old.find(d => d.id === want);
    if (back) {   // si torna sui propri passi prima che il brano sia sparito: lo si riprende
      M.old.splice(M.old.indexOf(back), 1); back.end = 0;
      const gp = back.out.gain; gp.cancelScheduledValues(now); gp.setValueAtTime(gp.value, now); gp.setTargetAtTime(back.C.g, now, 0.4);
      M.cur = back;
    } else if (want) M.cur = deckNew(want, now, cid ? 0.9 : 0.05);
  }
  // più piano nei menu e mentre suonano le fanfare
  const tg = BASE * (mul ?? 1) * (now < M.duck ? 0.3 : 1);
  if (Math.abs(tg - G.tgt) > 0.001) { G.tgt = tg; G.bus.gain.setTargetAtTime(tg, now, 0.12); }
  const live = aok();
  for (const dk of M.cur ? [M.cur, ...M.old] : M.old) {
    if (!live) { dk.next = Math.max(dk.next, now + 0.05); continue; }
    if (dk.next < now - 0.25) dk.next = now + 0.05;   // fermo per un po' (scheda nascosta): riparte da adesso
    const lim = dk.end ? Math.min(dk.end, now + LA) : now + LA;
    while (dk.next < lim) stepDeck(dk);
  }
  M.old = M.old.filter(dk => { if (now < dk.end) return true; for (const nd of dk.nodes) try { nd.disconnect(); } catch (e) {} return false; });
}
// prova senza altoparlanti: suona un brano in un contesto offline e ne misura il volume
async function render(id, sec, rate, solo, raw) {
  const sr = rate || 22050, X = new OfflineAudioContext(2, Math.ceil(sr * sec), sr), keep = G;
  G = graphFor(X, X.destination);
  const dk = deckNew(id, 0, 0); dk.out.gain.cancelScheduledValues(0); dk.out.gain.setValueAtTime(dk.C.g, 0);
  if (solo) dk.C.names.forEach((nm, i) => { if (nm !== solo) dk.vo[i].bus.gain.value = 0; });
  try { while (dk.next < sec) stepDeck(dk); } finally { G = keep; }
  const b = await X.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1), win = Math.floor(sr * 0.4);
  // volume "da telefono": senza i bassi profondi che un altoparlante piccolo non suona
  let peak = 0, sum = 0, hsum = 0, wmax = 0, ws = 0, x0 = 0, y = 0;
  const k = Math.exp(-2 * Math.PI * 200 / sr);
  for (let i = 0; i < L.length; i++) {
    const v = (L[i] + R[i]) / 2; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); sum += v * v;
    y = k * (y + v - x0); x0 = v; hsum += y * y; ws += y * y;
    if (i % win === win - 1) { wmax = Math.max(wmax, Math.sqrt(ws / win)); ws = 0; }
  }
  return { id, peak, rms: Math.sqrt(sum / L.length), hp: Math.sqrt(hsum / L.length), wmax, len: dk.C.steps * dk.C.spb, loop: (dk.C.steps - dk.C.lp) * dk.C.spb,
    data: raw ? Array.from(L, (v, i) => (v + R[i]) / 2) : null };
}

SG.music = {
  want(id) { M.want = id || null; },
  tick,
  stop() { M.want = null; if (G && M.cur && typeof actx !== 'undefined' && actx) { deckFade(M.cur, actx.currentTime, 0.25); M.old.push(M.cur); M.cur = null; } },
  duck(sec) { if (typeof actx !== 'undefined' && actx) M.duck = Math.max(M.duck, actx.currentTime + sec); },
  get on() { return M.on; },
  set on(v) { M.on = !!v; },
  get playing() { return M.cur ? M.cur.id : null; },
  ids() { const out = []; for (const k in TRACKS) { if (TRACKS[k].var) for (const v in TRACKS[k].var) out.push(k + ':' + v); else out.push(k); } return out; },
  _compile: compile, _render: render, _tracks: TRACKS, _ins: INS, _state: () => ({ cur: M.cur && M.cur.id, step: M.cur && M.cur.step, old: M.old.map(d => d.id), want: M.want }),
};
})();
