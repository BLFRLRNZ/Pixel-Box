// ===================== OVETTO =====================
GAMES.push((() => {
const SW = 48, SH = 40;
const LCD = makeLCD(SW, SH);
const { fb, fbDim, px, unpx, spr, text, textW, ctext, clearBox, frame } = LCD;
const blink = (rate = 2.5) => Math.floor(time * rate) % 2 === 0;
// ===================== OVETTO: cucciolo virtuale =====================
const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const BASE = 31;                                  // riga più bassa dell'area principale (y 8..31)

// ---------- disegni (originali) ----------
const ICONS = [
  S(['...#...', '..#....', '.##.##.', '#######', '#######', '.#####.', '..###..']),   // cibo
  S(['..###..', '.#...#.', '.#...#.', '.#...#.', '..#.#..', '..###..', '..###..']),   // luce
  S(['..###..', '.#.#.#.', '#..#..#', '#######', '#..#..#', '.#.#.#.', '..###..']),   // gioco
  S(['..###..', '..#.#..', '###.###', '#.....#', '###.###', '..#.#..', '..###..']),   // medicina
  S(['.....#.', '....#..', '...#...', '..###..', '.#####.', '.#.#.#.', '.#.#.#.']),   // pulizia
  S(['.......', '.....#.', '...#.#.', '...#.#.', '.#.#.#.', '.#.#.#.', '#######']),   // stato
  S(['#######', '#..#..#', '#..#..#', '#.....#', '#..#..#', '#######', '.##....']),   // sgrida
  S(['...#...', '..###..', '.#####.', '.#####.', '.#####.', '#######', '...#...'])    // richiamo
];
const ACTIONS = ['food', 'light', 'game', 'med', 'clean', 'status', 'scold'];
const EGG = S(['....####....', '..##....##..', '.#........#.', '.#..##....#.', '#..####....#', '#...##.....#', '#......##..#',
  '#.....####.#', '#......##..#', '.#........#.', '.#........#.', '..#......#..', '...######...']);
const FORMS = {
  baby: { name: 'PUNTINO', s: S(['..#####..', '.#.....#.', '#.......#', '#.......#', '#.......#', '.#.....#.', '..#####..']), eyes: [[3, 3], [5, 3]], mouth: [4, 5, 1] },
  child: { name: 'CODINO', s: S(['.....#.....', '....#.#....', '.....#.....', '...#####...', '..#.....#..', '.#.......#.', '.#.......#.', '.#.......#.', '..#.....#..', '...#####...', '...#...#...', '..##...##..']), eyes: [[4, 5], [6, 5]], mouth: [5, 7, 1] },
  teenA: { name: 'SALTINO', s: S(['.#........#.', '..#......#..', '...######...', '..#......#..', '.#........#.', '.#........#.', '.#........#.', '.#........#.', '..#......#..', '...######...', '...#....#...', '..##....##..']), eyes: [[4, 5], [7, 5]], mouth: [5, 7, 2] },
  teenB: { name: 'MUSONE', s: S(['.....##.....', '....#..#....', '..########..', '.#........#.', '#..........#', '#..........#', '#..........#', '.#........#.', '..########..', '...#....#...', '...#....#...', '..##....##..']), eyes: [[4, 5], [7, 5]], mouth: [5, 7, 2], mood: 'angry' },
  adultA: { name: 'STELLINO', s: S(['.#..........#.', '###........###', '.#.########.#.', '..#........#..', '.#..........#.', '#............#', '#............#', '#............#', '#............#', '.#..........#.', '..##########..', '...#......#...', '..##......##..']), eyes: [[4, 6], [9, 6]], mouth: [6, 8, 2], tall: true },
  adultB: { name: 'CICCIO', s: S(['.....######.....', '...##......##...', '..#..........#..', '.#............#.', '#..............#', '#..............#', '#..............#', '#..............#', '.#............#.', '..#..........#..', '...##......##...', '.....######.....', '....##....##....']), eyes: [[5, 5], [10, 5]], mouth: [7, 8, 2], tall: true },
  adultC: { name: 'BRONTOLO', s: S(['.#.#..##..#.#.', '#.#.##..##.#.#', '.############.', '.#..........#.', '.#..........#.', '.#..........#.', '.#..........#.', '.#..........#.', '..#........#..', '...########...', '..#.#....#.#..', '.##........##.']), eyes: [[4, 5], [9, 5]], mouth: [6, 7, 2], mood: 'angry' }
};
const UFO = S(['....###....', '...#...#...', '.#########.', '#.#.#.#.#.#', '.#########.', '..#.....#..']);
const MEAL = S(['.#.#.#.', '#######', '#.....#', '.#...#.', '..###..']);
const SNACK = S(['..#...', '.###..', '######', '#.#.##', '######']);
const POOP = S(['..#..', '.##..', '.###.', '#####']);
const GERM = S(['#.#.#', '.###.', '##.##', '.###.', '#.#.#']);
const HEARTE = S(['.#.#.', '#.#.#', '#...#', '.#.#.', '..#..']);
const ARROWL = S(['..#..', '.#...', '#####', '.#...', '..#..']), ARROWR = S(['..#..', '...#.', '#####', '...#.', '..#..']);
const PILL = S(['.##.', '#..#', '####', '####', '.##.']);

// ---------- regole ----------
const RATES = { baby: { hunger: 3, happy: 4, poop: 8 }, child: { hunger: 30, happy: 35, poop: 120 }, teen: { hunger: 45, happy: 50, poop: 150 }, adult: { hunger: 60, happy: 60, poop: 180 } };
const STAGE_LEN = { baby: 60 * MIN, child: 12 * HOUR, teen: 24 * HOUR };
const LIFE = { adultA: 10, adultB: 7, adultC: 4 };            // giorni da adulto
const BASEW = { baby: 5, child: 10, teen: 20, adult: 30 };
const stageOf = f => f.startsWith('teen') ? 'teen' : f.startsWith('adult') ? 'adult' : f;
const SLEEP = { child: [20, 8], teen: [21, 9], adult: [22, 8] };

let pet = null;
let state = 'run', time = 0, mode = 'main', sel = -1, sub = 0, page = 0, anim = null, game = null, clockT = 0;
let petX = 18, facing = 1, moveT = 0, simT = 0, saveT = 0, started = false;
let cloudRef = null, cloudDirty = false, cloudWriting = false, cloudTimer = null, cloudPending = true;

const sfx = {
  beep() { tone(2200, 0.03, 'square', 0.022); },
  call() { seq([2093, 1760, 2093, 1760], 0.07, 0.11, 0.035); },
  eat() { seq([523, 659, 523, 659], 0.06, 0.25, 0.03); },
  happy() { seq([784, 988, 1175, 1568], 0.08, 0.08); },
  sad() { seq([392, 330], 0.15, 0.16); },
  nope() { tone(220, 0.18, 'square', 0.035); },
  win() { seq([1046, 1318], 0.06, 0.07); },
  lose() { tone(200, 0.16, 'square', 0.03); },
  hatch() { seq([523, 659, 784, 1046, 784, 1046], 0.09, 0.09); },
  evolve() { seq([523, 587, 659, 698, 784, 880, 988, 1046], 0.07, 0.07); },
  leave() { seq([784, 659, 523, 392, 330, 262], 0.2, 0.22); },
  flush() { noise(0.7, 0.1); },
  med() { tone(1568, 0.25, 'sine', 0.04, 2093); },
  sleep() { seq([523, 392, 262], 0.15, 0.15); },
  wake() { seq([262, 392, 523], 0.1, 0.1); }
};

// ---------- vita del cucciolo ----------
function newEgg(now) {
  const gen = pet && pet.gen ? pet.gen + 1 : 1;
  pet = { v: 1, form: 'egg', created: now, hatchAt: now + 45000, born: 0, stageAt: 0, hunger: 1, happy: 2, disc: 0, weight: 5,
    poops: 0, poopSince: 0, sick: false, sickSince: 0, doses: 0, asleep: false, sleepSince: 0, light: true, lightMiss: false,
    mistakes: 0, call: null, neglect: 0, nextHunger: 0, nextHappy: 0, nextPoop: 0, lifeEnd: 0, gone: null, gen, lastTick: now, saved: now };
  mode = 'main'; sel = -1; anim = null; game = null;
}
function setRates(t) {
  const R = RATES[stageOf(pet.form)];
  pet.nextHunger = t + R.hunger * MIN; pet.nextHappy = t + R.happy * MIN; pet.nextPoop = t + R.poop * MIN * (0.6 + Math.random() * 0.5);
}
function hatch(t, live) {
  pet.form = 'baby'; pet.born = t; pet.stageAt = t; pet.weight = BASEW.baby; setRates(t); markDirty();
  if (live) { startAnim('hatch', 2.6); sfx.hatch(); }
}
const ageOf = t => pet.born ? Math.floor((t - pet.born) / DAY) : 0;
function isNight(t) {
  const h = SLEEP[stageOf(pet.form)]; if (!h) return false;
  const d = new Date(t), hr = d.getHours() + d.getMinutes() / 60;
  return hr >= h[0] || hr < h[1];
}
function leave(t, why, live) {
  pet.gone = { at: t, why, age: ageOf(t), form: pet.form }; pet.call = null; mode = 'main'; sel = -1; game = null; markDirty();
  if (live) sfx.leave();
}
function checkStage(t, live) {
  const st = stageOf(pet.form);
  if (st === 'adult') { if (t >= pet.lifeEnd) leave(t, 'old', live); return; }
  if (t < pet.stageAt + STAGE_LEN[st] || (pet.asleep && st !== 'baby')) return;
  const nf = st === 'baby' ? 'child' : st === 'child' ? (pet.mistakes <= 3 ? 'teenA' : 'teenB')
    : (pet.mistakes <= 4 && pet.disc >= 3) ? 'adultA' : pet.mistakes <= 10 ? 'adultB' : 'adultC';
  pet.form = nf; pet.stageAt = t; pet.weight = Math.max(pet.weight, BASEW[stageOf(nf)]); setRates(t);
  if (stageOf(nf) === 'adult') pet.lifeEnd = t + LIFE[nf] * DAY;
  markDirty();
  if (live) { startAnim('evolve', 2.4); sfx.evolve(); }
}
function simStep(t, live) {
  const p = pet; if (!p || p.gone || p.form === 'egg') return;
  const st = stageOf(p.form), R = RATES[st], night = isNight(t);
  if (night && !p.asleep) { p.asleep = true; p.sleepSince = t; p.lightMiss = false; p.call = null; if (live) sfx.sleep(); }
  if (!night && p.asleep) { p.asleep = false; p.light = true; setRates(t); if (live) sfx.wake(); }
  if (p.asleep) {
    if (p.light && !p.lightMiss && t - p.sleepSince > 15 * MIN) { p.lightMiss = true; p.mistakes++; markDirty(); }
    checkStage(t, live); return;
  }
  if (t >= p.nextHunger) { p.hunger = Math.max(0, p.hunger - 1); p.nextHunger = t + R.hunger * MIN; }
  if (t >= p.nextHappy) { p.happy = Math.max(0, p.happy - 1); p.nextHappy = t + R.happy * MIN; }
  if (t >= p.nextPoop) {
    if (p.poops < 4) { p.poops++; if (!p.poopSince) p.poopSince = t; }
    p.nextPoop = t + R.poop * MIN * (0.7 + Math.random() * 0.6);
  }
  if (!p.sick) {
    let ch = 0.0004;
    if (p.poops && t - p.poopSince > 30 * MIN) ch += 0.002 * p.poops;
    if (p.weight > BASEW[st] + 15) ch += 0.001;
    if (Math.random() < ch) { p.sick = true; p.sickSince = t; p.doses = Math.random() < 0.4 ? 2 : 1; markDirty(); }
  }
  const need = p.hunger === 0 || p.happy === 0 || p.sick;
  if (need && (!p.call || p.call.type !== 'need')) { p.call = { type: 'need', since: t, counted: false }; if (live) sfx.call(); }
  if (!need && p.call && p.call.type === 'need') p.call = null;
  if (p.call && p.call.type === 'need' && !p.call.counted && t - p.call.since > 15 * MIN) { p.call.counted = true; p.mistakes++; markDirty(); }
  if (p.call && p.call.type === 'fake' && t - p.call.since > 15 * MIN) p.call = null;
  if (!p.call && (st === 'child' || st === 'teen') && Math.random() < 0.004) { p.call = { type: 'fake', since: t }; if (live) sfx.call(); }
  p.neglect = (p.hunger === 0 && p.happy === 0) ? p.neglect + MIN : 0;
  if (p.neglect > 12 * HOUR) return leave(t, 'neglect', live);
  if (p.sick && t - p.sickSince > 10 * HOUR) return leave(t, 'sick', live);
  checkStage(t, live);
}
function simulate(now, live) {
  if (!pet || pet.gone) return;
  if (pet.form === 'egg') {
    if (now < pet.hatchAt) { pet.lastTick = now; return; }
    hatch(pet.hatchAt, live && now - pet.hatchAt < 5000); pet.lastTick = pet.hatchAt;
  }
  let n = 0;
  while (pet.lastTick + MIN <= now && n < 60 * 24 * 40) {
    pet.lastTick += MIN; n++;
    simStep(pet.lastTick, live && now - pet.lastTick < 2 * MIN);
    if (pet.gone) { pet.lastTick = now; break; }
  }
}
function refreshCall() { const p = pet; if (p.call && p.call.type === 'need' && !(p.hunger === 0 || p.happy === 0 || p.sick)) p.call = null; }

// ---------- salvataggio: telefono + account ----------
function saveLocal() { try { if (pet) localStorage.setItem('ov_pet', JSON.stringify(pet)); } catch (e) {} }
function markDirty() { cloudDirty = true; scheduleCloud(); }
function touch() { if (!pet) return; pet.saved = Date.now(); saveLocal(); markDirty(); }
function scheduleCloud() { if (!cloudRef) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(flushCloud, 2500); }
async function flushCloud() {
  if (!cloudRef || cloudWriting || !cloudDirty || !pet) return;
  cloudWriting = true; cloudDirty = false;
  try { await cloudRef.set({ pet: JSON.parse(JSON.stringify(pet)), saved: pet.saved || 0 }); }
  catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'quota_exceeded')) cloudRef = null; else cloudDirty = true; }
  cloudWriting = false;
}
async function initCloud() {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') { await new Promise(r => setTimeout(r, 1500)); if (!window.claude || typeof window.claude.use !== 'function') return; }
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    const ref = db.doc('data/users/' + id + '/ovetto');
    const snap = await Promise.race([ref.get(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
    if (snap && snap.exists) {
      const d = snap.data();
      if (d && d.pet && (!pet || (d.pet.saved || 0) > (pet.saved || 0))) {
        pet = JSON.parse(JSON.stringify(d.pet)); mode = 'main'; sel = -1; anim = null; game = null;
        simulate(Date.now(), false); saveLocal(); started = true;
      }
    }
    cloudRef = ref;
    if (pet && (cloudDirty || !(snap && snap.exists))) { cloudDirty = true; scheduleCloud(); }
  } catch (e) {}
  finally { cloudPending = false; }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { saveLocal(); if (cloudDirty) flushCloud(); }
  else if (pet) simulate(Date.now(), false);
});

// ---------- azioni ----------
function startAnim(type, dur, data = {}, done = null) { anim = { type, t: 0, dur, data, done }; }
function press(btn, d = 1) {
  audioUnlock(); sfx.beep();
  if (!started) { if (btn === 'B' && !cloudPending) { started = true; if (!pet) { newEgg(Date.now()); touch(); } } return; }
  if (anim) return;
  if (pet.gone) { if (btn === 'B') { newEgg(Date.now()); touch(); } return; }
  if (pet.form === 'egg') { if (btn === 'C') { mode = mode === 'clock' ? 'main' : 'clock'; clockT = 5; } return; }
  switch (mode) {
    case 'main':
      if (btn === 'A') sel = d > 0 ? (sel + 1) % ACTIONS.length : (sel <= 0 ? ACTIONS.length - 1 : sel - 1);
      else if (btn === 'B') { if (sel >= 0) openAction(ACTIONS[sel]); }
      else { if (sel >= 0) sel = -1; else { mode = 'clock'; clockT = 5; } }
      break;
    case 'clock': mode = 'main'; break;
    case 'food':
      if (btn === 'A') sub = 1 - sub; else if (btn === 'B') doFeed(sub); else mode = 'main';
      break;
    case 'light':
      if (btn === 'A') sub = 1 - sub;
      else if (btn === 'B') { pet.light = sub === 0; touch(); mode = 'main'; }
      else mode = 'main';
      break;
    case 'game': gameInput(btn); break;
    case 'status': if (btn === 'C') mode = 'main'; else page = (page + (btn === 'A' && d < 0 ? 4 : 1)) % 5; break;
  }
}
function openAction(a) {
  const dark = pet.asleep || !pet.light;
  if (dark && a !== 'light' && a !== 'status') { startAnim('nope', 1.2); sfx.nope(); return; }
  if (a === 'food') { mode = 'food'; sub = 0; }
  else if (a === 'light') { mode = 'light'; sub = pet.light ? 0 : 1; }
  else if (a === 'game') { mode = 'game'; game = { round: 0, wins: 0, phase: 'ask', t: 0, guess: 0, dir: 0 }; }
  else if (a === 'med') doMed();
  else if (a === 'clean') { startAnim('clean', 1.7, {}, () => { pet.poops = 0; pet.poopSince = 0; touch(); }); sfx.flush(); }
  else if (a === 'status') { mode = 'status'; page = 0; }
  else if (a === 'scold') doScold();
}
function doFeed(kind) {
  if (kind === 0) {
    if (pet.hunger >= 4) { startAnim('nope', 1.4); sfx.nope(); return; }
    pet.hunger++; pet.weight++;
  } else { pet.happy = Math.min(4, pet.happy + 1); pet.weight += 2; }
  refreshCall(); touch();
  startAnim('eat', 2.4, { food: kind ? SNACK : MEAL }); sfx.eat();
}
function doMed() {
  if (!pet.sick) { startAnim('nope', 1.4); sfx.nope(); return; }
  pet.doses--;
  const cured = pet.doses <= 0; if (cured) pet.sick = false;
  refreshCall(); touch();
  startAnim('med', 2.0, { cured }, cured ? () => { startAnim('happy', 1.6); sfx.happy(); } : null); sfx.med();
}
function doScold() {
  if (pet.call && pet.call.type === 'fake') { pet.disc = Math.min(4, pet.disc + 1); pet.call = null; startAnim('scolded', 1.6); sfx.sad(); }
  else { pet.happy = Math.max(0, pet.happy - 1); refreshCall(); startAnim('nope', 1.4); sfx.nope(); }
  touch();
}
function gameInput(btn) {
  if (btn === 'C') { mode = 'main'; game = null; return; }
  if (game.phase !== 'ask' || (btn !== 'A' && btn !== 'B')) return;
  game.guess = btn === 'A' ? -1 : 1; game.dir = Math.random() < 0.5 ? -1 : 1; game.phase = 'show'; game.t = 0;
  if (game.guess === game.dir) { game.wins++; sfx.win(); } else sfx.lose();
}

// ---------- ciclo ----------
function step(dt) {
  time += dt;
  simT += dt; saveT += dt;
  if (simT >= 1) { simT = 0; if (pet && started) simulate(Date.now(), true); }
  if (saveT >= 15) { saveT = 0; saveLocal(); }
  if (anim) { anim.t += dt; if (anim.t >= anim.dur) { const d = anim.done; anim = null; if (d) d(); } }
  if (mode === 'clock') { clockT -= dt; if (clockT <= 0) mode = 'main'; }
  if (game) {
    game.t += dt;
    if (game.phase === 'show' && game.t > 1.3) {
      game.round++; game.t = 0;
      if (game.round >= 5) {
        game.phase = 'end';
        const won = game.wins >= 3;
        if (won) pet.happy = Math.min(4, pet.happy + 1);
        pet.weight = Math.max(BASEW[stageOf(pet.form)], pet.weight - 1);
        refreshCall(); touch(); won ? sfx.happy() : sfx.sad();
      } else game.phase = 'ask';
    } else if (game.phase === 'end' && game.t > 2.4) { game = null; mode = 'main'; }
  }
  // passeggiata
  if (pet && started && !pet.gone && pet.form !== 'egg' && mode === 'main' && !anim && !pet.asleep) {
    moveT += dt;
    if (moveT > 0.7) {
      moveT = 0;
      const w = FORMS[pet.form].s.w, maxX = 47 - w - Math.min(pet.poops, 4) * 6;
      const r = Math.random(), d = r < 0.35 ? -2 : r < 0.7 ? 2 : 0;
      if (d) facing = d > 0 ? 1 : -1;
      petX = clamp(petX + d, 1, Math.max(1, maxX));
    }
  }
}

// ---------- disegno ----------
function drawS(s, x, y, flip = false, dim = false) {
  x = Math.round(x); y = Math.round(y);
  const buf = dim ? fbDim : fb;
  for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) if (s.d[j * s.w + i]) {
    const xx = x + (flip ? s.w - 1 - i : i), yy = y + j;
    if (xx >= 0 && xx < SW && yy >= 0 && yy < SH) buf[yy * SW + xx] = 1;
  }
}
function textInv(str, x, y) {
  for (let n = 0; n < str.length; n++) { const g = FONT[str[n]] || FONT['?']; for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') unpx(x + n * 4 + c, y + r); }
}
function drawPet(form, x, y, flip, expr) {
  const F = FORMS[form], s = F.s; drawS(s, x, y, flip);
  const P = (a, b) => px(x + (flip ? s.w - 1 - a : a), y + b);
  for (const [ex, ey] of F.eyes) {
    if (expr === 'happy') { P(ex - 1, ey + 1); P(ex, ey); P(ex + 1, ey + 1); }
    else if (expr === 'sleep') { P(ex - 1, ey + 1); P(ex, ey + 1); P(ex + 1, ey + 1); }
    else if (expr === 'sick') { P(ex - 1, ey - 1); P(ex + 1, ey - 1); P(ex, ey); P(ex - 1, ey + 1); P(ex + 1, ey + 1); }
    else { P(ex, ey); if (F.tall) P(ex, ey + 1); }
  }
  if ((F.mood === 'angry' || expr === 'angry') && expr !== 'sleep' && expr !== 'happy') {
    const [[lx, ly], [rx, ry]] = F.eyes;
    P(lx - 1, ly - 2); P(lx, ly - 1); P(rx + 1, ry - 2); P(rx, ry - 1);
  }
  const [mx, my, mw] = F.mouth;
  if (expr === 'happy') { P(mx - 1, my); for (let i = 0; i < mw; i++) P(mx + i, my + 1); P(mx + mw, my); }
  else if (expr === 'eat') {
    if (mw === 1) { P(mx, my); P(mx, my + 1); }
    else { for (let i = 0; i < mw; i++) { P(mx + i, my - 1); P(mx + i, my + 1); } P(mx - 1, my); P(mx + mw, my); }
  }
  else if (expr === 'sad' || expr === 'sick') { P(mx - 1, my + 1); for (let i = 0; i < mw; i++) P(mx + i, my); P(mx + mw, my + 1); }
  else if (expr !== 'sleep') for (let i = 0; i < mw; i++) P(mx + i, my);
}
function petY(form) { return BASE - FORMS[form].s.h + 1; }
function exprNow() { if (pet.asleep) return 'sleep'; if (pet.sick) return 'sick'; if (pet.hunger === 0 || pet.happy === 0) return 'sad'; return 'normal'; }
function drawIcons() {
  for (let i = 0; i < 8; i++) {
    const x = 2 + (i % 4) * 12, y = i < 4 ? 0 : 33;
    let on = i < 7 ? sel === i : !!(pet && pet.call && !pet.gone && (pet.call.type === 'fake' || blink(2)));
    drawS(ICONS[i], x, y, false, !on);
  }
}
function drawPoops(limitX = 99) {
  const n = Math.min(pet.poops, 4);
  for (let i = 0; i < n; i++) {
    const x = 42 - i * 6; if (x >= limitX) continue;
    drawS(POOP, x, 28);
    const f = Math.floor(time * 3 + i) % 2; px(x + 1 + f, 26 - f); px(x + 3 - f, 25 + f);
  }
}
function drawMain() {
  const F = FORMS[pet.form], s = F.s, y = petY(pet.form);
  if (!pet.light) {
    for (let yy = 8; yy <= 31; yy++) for (let xx = 0; xx < SW; xx++) px(xx, yy);
    if (pet.asleep) { const f = Math.floor(time * 1.5) % 3; textInv('Z', 30 + f, 18 - f * 3); textInv('Z', 36, 12 + f); }
    return;
  }
  drawPoops();
  const bounce = pet.asleep ? 0 : Math.floor(time * 2) % 2;
  drawPet(pet.form, petX, y - bounce, facing < 0, exprNow());
  if (pet.asleep) { const f = Math.floor(time * 1.5) % 3; text('Z', petX + s.w + 1 + f, y - 2 - f * 2); }
  if (pet.sick && blink(2)) drawS(GERM, 1, 9);
  if (pet.call && !pet.asleep && blink(3)) text('!', Math.min(44, petX + s.w + 1), y - 1);
}
function drawEgg(t, crack) {
  const wob = Math.floor(t * (crack ? 10 : 2)) % 2 ? 1 : -1, x = 18 + (Math.floor(t * 1.2) % 2 ? wob : 0), y = BASE - EGG.h + 1;
  drawS(EGG, x, y);
  if (crack) { const pts = [[1, 6], [3, 5], [5, 7], [7, 5], [9, 7], [10, 6]]; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; for (let k2 = 0; k2 <= 4; k2++) px(x + ax + (bx - ax) * k2 / 4, y + ay + (by - ay) * k2 / 4); } }
}
function drawAnim() {
  const a = anim, F = pet.form !== 'egg' ? FORMS[pet.form] : null, y = F ? petY(pet.form) : 0;
  switch (a.type) {
    case 'hatch':
      if (a.t < 2.0) drawEgg(a.t, true);
      else if (Math.floor(a.t * 12) % 2) for (let yy = 8; yy <= 31; yy++) for (let xx = 0; xx < SW; xx++) px(xx, yy);
      else drawPet('baby', 20, petY('baby'), false, 'happy');
      break;
    case 'evolve':
      if (Math.floor(a.t * 8) % 2) for (let yy = 8; yy <= 31; yy++) for (let xx = 0; xx < SW; xx++) px(xx, yy);
      else drawPet(pet.form, 24 - Math.floor(F.s.w / 2), y, false, a.t > 1.6 ? 'happy' : 'normal');
      break;
    case 'eat': {
      const x0 = 22, food = a.data.food, bites = Math.min(3, Math.floor(a.t / 0.6));
      drawPet(pet.form, x0, y, true, Math.floor(a.t / 0.3) % 2 ? 'eat' : 'normal');
      const fx = x0 - food.w - 2, fy = BASE - food.h + 1;
      drawS(food, fx, fy);
      for (let b = 0; b < bites; b++) for (let yy = 0; yy < food.h; yy++) for (let xx = 0; xx < 2; xx++) unpx(fx + food.w - 1 - b * 2 - xx, fy + yy);
      break;
    }
    case 'nope':
      drawPoops();
      drawPet(pet.form, petX, y, Math.floor(a.t * 7) % 2 === 0, 'sad');
      break;
    case 'med': {
      drawPet(pet.form, 26, y, true, a.t > 1.2 && a.data.cured ? 'happy' : 'sick');
      const px0 = 4 + Math.min(1, a.t / 0.9) * 14; drawS(PILL, px0, 20);
      if (a.t > 1.0) for (let i = 0; i < 4; i++) { const ang = a.t * 6 + i * 1.57; px(30 + Math.cos(ang) * 9, 22 + Math.sin(ang) * 6); }
      break;
    }
    case 'clean': {
      const lx = Math.round(47 - (a.t / a.dur) * 48);
      drawPoops(lx);
      drawPet(pet.form, petX, y, facing < 0, 'normal');
      for (let yy = 8; yy <= 31; yy++) { px(lx, yy); if (yy % 2) px(lx + 1, yy); }
      break;
    }
    case 'scolded':
      drawPet(pet.form, petX, y, facing < 0, 'sad');
      if (blink(4)) text('!', Math.min(44, petX + F.s.w + 1), y - 1);
      break;
    case 'happy': {
      const j = Math.abs(Math.sin(a.t * 9)) * 3;
      drawPet(pet.form, petX, y - j, facing < 0, 'happy');
      for (let i = 0; i < 3; i++) { const sx = petX - 4 + i * 8 + Math.floor(a.t * 4) % 2, sy = y - 4 - (i % 2) * 2; px(sx, sy); px(sx - 1, sy + 1); px(sx + 1, sy + 1); px(sx, sy + 2); }
      break;
    }
  }
}
function drawHearts(n, y) { for (let i = 0; i < 4; i++) drawS(i < n ? HEART5 : HEARTE, 6 + i * 9, y); }
function drawStatus() {
  if (page === 0) {
    ctext(FORMS[pet.form].name, 9);
    const a = ageOf(Date.now()); ctext('ETA ' + a + (a === 1 ? ' ANNO' : ' ANNI'), 17);
    ctext('GEN ' + pet.gen, 25);
  } else if (page === 1) { ctext('PESO', 11); ctext(pet.weight + ' G', 20); }
  else if (page === 2) {
    ctext('DISCIPLINA', 10);
    frame(7, 19, 34, 7); for (let i = 0; i < pet.disc; i++) for (let xx = 0; xx < 7; xx++) for (let yy = 0; yy < 3; yy++) px(9 + i * 8 + xx, 21 + yy);
  } else if (page === 3) { ctext('FAME', 10); drawHearts(pet.hunger, 19); }
  else { ctext('FELICITA', 10); drawHearts(pet.happy, 19); }
}
function drawMenu2(opts, icon) {
  opts.forEach((o, i) => text((sub === i ? '>' : ' ') + o, 1, 11 + i * 9));
  if (icon) drawS(icon, 47 - icon.w - 1, 31 - icon.h - 2);
}
function drawGame() {
  const F = FORMS[pet.form], y = petY(pet.form), x = 24 - Math.floor(F.s.w / 2);
  text((Math.min(game.round + 1, 5)) + '/5', 1, 9);
  if (game.phase === 'ask') {
    drawPet(pet.form, x, y, false, 'normal');
    if (blink(3)) text('?', x + F.s.w + 1, y - 2);
    drawS(ARROWL, 1, 24); drawS(ARROWR, 42, 24);
  } else if (game.phase === 'show') {
    drawPet(pet.form, x + game.dir * 4, y, game.dir < 0, game.guess === game.dir ? 'happy' : 'sad');
    drawS(game.dir < 0 ? ARROWL : ARROWR, game.dir < 0 ? 1 : 42, 24);
    text(game.guess === game.dir ? 'SI!' : 'NO', 35, 9);
  } else {
    const won = game.wins >= 3;
    drawPet(pet.form, x, y - (won ? Math.abs(Math.sin(time * 9)) * 2 : 0), false, won ? 'happy' : 'sad');
    text(game.wins + '-' + (5 - game.wins), 33, 9);
  }
}
function drawGone() {
  for (let i = 0; i < 9; i++) { const sx = (i * 17 + 5) % 46 + 1, sy = 9 + (i * 7) % 20; if ((Math.floor(time * 2) + i) % 3) px(sx, sy); }
  const ux = 18 + Math.sin(time * 1.3) * 4, uy = 17 + Math.sin(time * 2.1) * 1.5;
  drawS(UFO, ux, uy);
  const msgs = ['BUON VIAGGIO', 'ETA ' + pet.gone.age + (pet.gone.age === 1 ? ' ANNO' : ' ANNI'), FORMS[pet.gone.form] ? FORMS[pet.gone.form].name : ''];
  ctext(msgs[Math.floor(time / 3) % msgs.length], 9);
  ctext('A=NUOVO UOVO', 26);
}
function drawClock() {
  const d = new Date(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  text(hh, 5, 13, 2); text(mm, 27, 13, 2);
  if (d.getSeconds() % 2 === 0) { px(23, 16); px(24, 16); px(23, 17); px(24, 17); px(23, 20); px(24, 20); px(23, 21); px(24, 21); }
}
function compose() {
  fb.fill(0); fbDim.fill(0);
  drawIcons();
  if (!started) {
    drawEgg(time, false);
    if (blink()) ctext(cloudPending ? 'ATTENDI...' : 'A=INIZIA', 9);
    return;
  }
  if (pet.gone) return drawGone();
  if (mode === 'clock') return drawClock();
  if (pet.form === 'egg') { drawEgg(time, pet.hatchAt - Date.now() < 8000); return; }
  if (anim) return drawAnim();
  if (mode === 'food') return drawMenu2(['PASTO', 'DOLCE'], sub ? SNACK : MEAL);
  if (mode === 'light') return drawMenu2(['ACCESA', 'SPENTA'], ICONS[1]);
  if (mode === 'status') return drawStatus();
  if (mode === 'game' && game) return drawGame();
  drawMain();
}

// ---------- avvio ----------
try { const s = localStorage.getItem('ov_pet'); if (s) { const p = JSON.parse(s); if (p && p.v === 1) pet = p; } } catch (e) {}
if (pet) { simulate(Date.now(), false); started = true; }
initCloud();

// ---------- comandi: croce = scegli, A = conferma, B = indietro, START = orologio ----------
let bgT = 0, bgSave = 0;
const ICON = ['................', '......####......', '....##....##....', '...#........#...', '..#..##......#..', '..#.####.....#..', '.#...##.......#.', '.#.......##...#.', '.#......####..#.', '.#.......##...#.', '.#............#.', '..#..........#..', '..#..........#..', '...##......##...', '.....######.....', '................'];
return {
  id: 'ovetto', name: 'OVETTO', desc: 'IL TUO CUCCIOLO VIRTUALE',
  aspect: SW / SH,
  keys: [['D', 'scegli'], ['A', 'ok'], ['B', 'indietro'], ['START', 'ora']],
  icon(c, x, y, sz) { drawIcon(c, ICON, { '#': LCD_PIX }, x, y, sz, LCD_BG); },
  enter() { if (pet && started) simulate(Date.now(), false); if (mode === 'game') { mode = 'main'; game = null; } },
  leave() { saveLocal(); if (cloudDirty) flushCloud(); },
  update: step,
  draw(c, w, h) { compose(); LCD.render(c, w, h); },
  background(dt, active) {
    if (active) return;
    bgT += dt; bgSave += dt;
    if (bgT >= 1) { bgT = 0; if (pet && started) simulate(Date.now(), false); }
    if (bgSave >= 15) { bgSave = 0; saveLocal(); }
  },
  alert() { return !!(pet && started && !pet.gone && pet.form !== 'egg' && pet.call && pet.call.type === 'need'); },
  button(name, down) {
    if (!down) return;
    if (mode === 'game' && game) {
      if (name === 'left') gameInput('A'); else if (name === 'right') gameInput('B'); else if (name === 'b') gameInput('C');
      return;
    }
    if (name === 'left' || name === 'up') press('A', -1);
    else if (name === 'right' || name === 'down') press('A', 1);
    else if (name === 'a') press('B');
    else if (name === 'b') press('C');
    else if (name === 'start') {
      if (!started || anim || (pet && pet.gone)) return;
      if (mode === 'clock') mode = 'main'; else if (mode === 'main') { sel = -1; mode = 'clock'; clockT = 5; }
    }
  }
};
})());
