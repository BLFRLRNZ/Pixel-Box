// Bot a ricerca a fascio: verifica che ogni livello si possa finire senza morire.
const R = require('./rbh.js');
const ACTS = [{ right: 1 }, { right: 1, a: 1 }, { left: 1 }, { left: 1, a: 1 }, {}, { a: 1 }];
const solid = c => c === '#' || c === 'B' || c === '^' || c === 'v';
function field(L, targets) {
  const d = new Int32Array(L.W * L.H).fill(1e6), q = [];
  for (const [x, y] of targets) if (x >= 0 && y >= 0 && x < L.W && y < L.H) { d[y * L.W + x] = 0; q.push([x, y]); }
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i], v = d[y * L.W + x];
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= L.W || ny >= L.H || solid(L.g[ny][nx])) continue;
      if (d[ny * L.W + nx] > v + 1) { d[ny * L.W + nx] = v + 1; q.push([nx, ny]); }
    }
  }
  return d;
}
function run(li, opt = {}) {
  R.loadLevel(li);
  const L = R.L, lvl = R.LEVELS[li];
  const rings = L.objs.map((o, i) => [o, i]).filter(([o]) => o.t === 'ring');
  const rf = rings.map(([o]) => field(L, [[o.x, o.y], [o.x, o.y + 1]]));
  const ex = L.objs.find(o => o.t === 'exit'), ef = field(L, [[ex.x, ex.y], [ex.x, ex.y + 1]]);
  const wps = (lvl.wp || WP[li + 1] || []).map(([x, y]) => ({ x, y, f: field(L, [[x, y]]) }));
  const W = opt.beam || 90, maxIt = opt.maxIt || 3000;
  const fit = (b, wi) => {
    const t = Math.floor(b.x), u = Math.floor(b.y), k = clampI(u, 0, L.H - 1) * L.W + clampI(t, 0, L.W - 1);
    let d;
    if (wi < wps.length) d = wps[wi].f[k];
    else {
      d = 1e6; let any = false;
      rings.forEach(([o, i], j) => { if (!R.L.objs[i].got) { any = true; d = Math.min(d, rf[j][k]); } });
      if (!any) d = ef[k];
    }
    return wi * 20000 + R.rg * 2000 - d * 10;
  };
  let beam = [{ s: R.snap(), wi: 0, f: 0 }];
  for (let it = 0; it < maxIt; it++) {
    const next = [], seen = new Set();
    for (const c of beam) for (const a of ACTS) {
      R.restore(c.s);
      Object.assign(R.BTN, { left: !!a.left, right: !!a.right, a: !!a.a, up: false });
      let dead = false, done = false;
      for (let i = 0; i < 24; i++) { R.step(1 / 240); if (R.state === 'dead' || R.state === 'over') { dead = true; break; } if (R.state === 'complete') { done = true; break; } }
      if (dead) continue;
      if (done) { console.log(`L${li + 1} ${lvl.name}: OK in ${(it / 10).toFixed(1)}s di gioco, anelli ${R.rg}/${R.rt}`); return true; }
      const b = R.ball; let wi = c.wi;
      if (wi < wps.length && Math.abs(b.x - (wps[wi].x + 0.5)) < 1 && Math.abs(b.y - (wps[wi].y + 0.5)) < 1.2) wi++;
      const mask = R.L.objs.map(o => o.got ? 1 : 0).join('');
      const key = [Math.round(b.x * 2), Math.round(b.y * 2), Math.round(b.vx / 2), mask, b.big ? 1 : 0, wi].join(',');
      if (seen.has(key)) continue; seen.add(key);
      next.push({ s: R.snap(), wi, f: fit(b, wi) + Math.random() * 3, x: b.x, y: b.y });
    }
    if (!next.length) { console.log(`L${li + 1} ${lvl.name}: BLOCCATO (fascio vuoto) a it ${it}`); return false; }
    next.sort((p, q) => q.f - p.f); beam = next.slice(0, W);
    if (opt.v && it % 100 === 0) console.log(`  it ${it} x ${beam[0].x.toFixed(1)} y ${beam[0].y.toFixed(1)} wi ${beam[0].wi} f ${beam[0].f.toFixed(0)}`);
  }
  const b0 = beam[0];
  R.restore(beam[0].s); console.log(`L${li + 1} ${lvl.name}: NON finito; migliore x ${b0.x.toFixed(1)} y ${b0.y.toFixed(1)} wi ${b0.wi} f ${b0.f.toFixed(0)} grande ${R.ball.big} mancano`, R.L.objs.filter(o => o.t === 'ring' && !o.got).map(o => o.x + ',' + o.y).join(' '));
  return false;
}
const WP = {
  9: [[13, 37], [19, 35], [12, 31], [5, 29], [10, 25], [18, 23], [12, 19], [4, 17], [10, 13], [16, 11], [12, 7]],
  15: [[46, 15], [67, 8], [76, 7], [80, 7], [95, 15]],
};
function clampI(v, a, b) { return v < a ? a : v > b ? b : v; }
module.exports = run;
if (require.main === module) {
  const which = process.argv.slice(2).map(Number);
  const list = which.length ? which.map(n => n - 1) : R.LEVELS.map((_, i) => i);
  const t0 = Date.now();
  for (const li of list) run(li, { v: !!process.env.V });
  console.log('tempo', ((Date.now() - t0) / 1000).toFixed(1), 's');
}
