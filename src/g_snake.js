// ===================== SNAKE =====================
GAMES.push((() => {
const SW = 84, SH = 48;
const LCD = makeLCD(SW, SH);
const { fb, px, unpx, spr, text, textW, ctext, clearBox, frame } = LCD;
const banner = (l, t) => LCD.banner(l, t);
const blink = (rate = 2.5) => Math.floor(time * rate) % 2 === 0;
const COLS = 27, ROWS = 13, GX = 1, GY = 8;
const SPEEDS = [0.45, 0.38, 0.32, 0.27, 0.23, 0.195, 0.165, 0.135, 0.11];   // secondi per passo, livello 1-9
function cells(rects) { const a = []; for (const [x0, y0, x1, y1] of rects) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) a.push([x, y]); return a; }
const MAZES = [
  { name: 'APERTO', wrap: true, walls: [], start: [4, 6] },
  { name: 'BORDO', wrap: false, walls: [], start: [4, 6] },
  { name: 'CROCE', wrap: false, walls: cells([[13, 3, 13, 9], [7, 6, 19, 6]]), start: [4, 1] },
  { name: 'FINESTRE', wrap: true, walls: cells([[5, 3, 10, 3], [16, 3, 21, 3], [5, 9, 10, 9], [16, 9, 21, 9], [13, 0, 13, 2], [13, 10, 13, 12]]), start: [4, 6] },
  { name: 'CORRIDOI', wrap: false, walls: cells([[7, 0, 7, 7], [19, 0, 19, 7], [13, 5, 13, 12]]), start: [4, 10] }
];
const FOOD = S(['.#.', '#.#', '.#.']);
const BONUS = [S(['#.##.#', '######', '.#..#.']), S(['.####.', '#.##.#', '##..##']), S(['##..##', '.####.', '#.##.#'])];
const HEAD = { n: S(['###', '#.#', '###']), R: S(['###', '#..', '###']), L: S(['###', '..#', '###']), U: S(['#.#', '#.#', '###']), D: S(['###', '#.#', '#.#']) };

let state = 'menu', stateT = 0, paused = false, time = 0;
let speed = 5, mazeIdx = 0, menuSel = 0, best = 0, newRec = false;
let snake = [], dir = { x: 1, y: 0 }, queue = [], pending = 0, food = null, bonus = null, eaten = 0, score = 0, tickAcc = 0;
const wall = new Uint8Array(COLS * ROWS);
try {
  best = +localStorage.getItem('sn_best') || 0;
  speed = clamp(+localStorage.getItem('sn_speed') || 5, 1, 9);
  mazeIdx = clamp(+localStorage.getItem('sn_maze') || 0, 0, MAZES.length - 1);
} catch (e) {}
function savePrefs() { try { localStorage.setItem('sn_best', best); localStorage.setItem('sn_speed', speed); localStorage.setItem('sn_maze', mazeIdx); } catch (e) {} }

const sfx = {
  eat() { tone(1046, 0.05, 'square', 0.04); },
  bonusIn() { seq([1568, 1760], 0.05, 0.09); },
  bonus() { seq([784, 1046, 1318, 1568], 0.06, 0.05); },
  die() { noise(0.4, 0.2); tone(600, 0.5, 'square', 0.04, 80); },
  over() { seq([523, 440, 349, 262], 0.18, 0.16); },
  menu() { tone(1318, 0.03, 'square', 0.03); },
  start() { seq([784, 1046, 1318], 0.07, 0.07); }
};

function startGame() {
  const m = MAZES[mazeIdx];
  wall.fill(0); for (const [x, y] of m.walls) wall[y * COLS + x] = 1;
  const [sx, sy] = m.start;
  snake = []; for (let i = 0; i < 4; i++) snake.push({ x: sx - i, y: sy });
  dir = { x: 1, y: 0 }; queue = []; pending = 0; bonus = null; eaten = 0; score = 0; tickAcc = 0; newRec = false;
  placeFood(); state = 'play'; stateT = 0; paused = false; sfx.start(); savePrefs();
}
function free(x, y) {
  if (wall[y * COLS + x]) return false;
  for (const s of snake) if (s.x === x && s.y === y) return false;
  if (food && food.x === x && food.y === y) return false;
  if (bonus && bonus.y === y && (bonus.x === x || bonus.x + 1 === x)) return false;
  return true;
}
function placeFood() {
  food = null; const o = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (free(x, y)) o.push({ x, y });
  food = o.length ? o[Math.floor(Math.random() * o.length)] : null;
}
function spawnBonus() {
  const o = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS - 1; x++) if (free(x, y) && free(x + 1, y)) o.push({ x, y });
  if (!o.length) return;
  const c = o[Math.floor(Math.random() * o.length)];
  bonus = { x: c.x, y: c.y, left: 20, kind: Math.floor(Math.random() * BONUS.length) };
  sfx.bonusIn();
}
function dirPress(d) {
  audioUnlock();
  if (state === 'menu') {
    if (d.y) menuSel = menuSel ? 0 : 1;
    else if (menuSel === 0) speed = clamp(speed + d.x, 1, 9);
    else mazeIdx = (mazeIdx + d.x + MAZES.length) % MAZES.length;
    sfx.menu(); savePrefs(); return;
  }
  if (state === 'play' && !paused && queue.length < 3) queue.push(d);
}
function okPress() {
  audioUnlock();
  if (state === 'menu') startGame();
  else if (state === 'over' && stateT > 0.8) { state = 'menu'; stateT = 0; }
  else if (state === 'play' && paused) paused = false;
}
function togglePause() { if (state === 'play') paused = !paused; }
function die() { state = 'dying'; stateT = 0; sfx.die(); }
function tick() {
  while (queue.length) {
    const d = queue.shift();
    if ((d.x === -dir.x && d.y === -dir.y) || (d.x === dir.x && d.y === dir.y)) continue;
    dir = d; break;
  }
  const m = MAZES[mazeIdx];
  let nx = snake[0].x + dir.x, ny = snake[0].y + dir.y;
  if (m.wrap) { nx = (nx + COLS) % COLS; ny = (ny + ROWS) % ROWS; }
  else if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return die();
  if (wall[ny * COLS + nx]) return die();
  const grow = pending > 0;
  for (let i = 0; i < snake.length - (grow ? 0 : 1); i++) if (snake[i].x === nx && snake[i].y === ny) return die();
  snake.unshift({ x: nx, y: ny });
  if (grow) pending--; else snake.pop();
  if (food && food.x === nx && food.y === ny) {
    score += speed; pending++; eaten++; sfx.eat(); placeFood();
    if (eaten % 5 === 0 && !bonus) spawnBonus();
  }
  if (bonus) {
    if (bonus.y === ny && (bonus.x === nx || bonus.x + 1 === nx)) { score += speed * (5 + Math.ceil(bonus.left / 2)); bonus = null; sfx.bonus(); }
    else if (--bonus.left <= 0) bonus = null;
  }
}
function step(dt) {
  time += dt; stateT += dt;
  if (state === 'play' && !paused) {
    tickAcc += dt; const iv = SPEEDS[speed - 1];
    while (tickAcc >= iv && state === 'play') { tickAcc -= iv; tick(); }
  } else if (state === 'dying' && stateT > 1.3) {
    state = 'over'; stateT = 0;
    if (score > best) { best = score; newRec = true; }
    savePrefs(); sfx.over();
  }
}

// ---------- disegno ----------
const cx = x => GX + x * 3, cy = y => GY + y * 3;
function body2(ox, oy) { px(ox, oy); px(ox + 1, oy); px(ox, oy + 1); px(ox + 1, oy + 1); }
function drawSnake() {
  for (let i = snake.length - 1; i >= 1; i--) {
    const s = snake[i], ox = cx(s.x), oy = cy(s.y);
    body2(ox, oy);
    for (const nb of [snake[i - 1], snake[i + 1]]) {
      if (!nb) continue;
      const dx = nb.x - s.x, dy = nb.y - s.y;
      if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
      if (dx === 1) { px(ox + 2, oy); px(ox + 2, oy + 1); }
      else if (dx === -1) { px(ox - 1, oy); px(ox - 1, oy + 1); }
      else if (dy === 1) { px(ox, oy + 2); px(ox + 1, oy + 2); }
      else { px(ox, oy - 1); px(ox + 1, oy - 1); }
    }
  }
  const h = snake[0], m = MAZES[mazeIdx];
  let ax = h.x + dir.x, ay = h.y + dir.y;
  if (m.wrap) { ax = (ax + COLS) % COLS; ay = (ay + ROWS) % ROWS; }
  const ahead = (food && food.x === ax && food.y === ay) || (bonus && bonus.y === ay && (bonus.x === ax || bonus.x + 1 === ax));
  const key = !ahead ? 'n' : dir.x === 1 ? 'R' : dir.x === -1 ? 'L' : dir.y === -1 ? 'U' : 'D';
  spr(HEAD[key], cx(h.x), cy(h.y));
}
function drawField() {
  const m = MAZES[mazeIdx];
  text(String(score).padStart(4, '0'), 0, 0);
  if (bonus) { spr(BONUS[bonus.kind], 62, 0); text(String(bonus.left).padStart(2, '0'), 71, 0); }
  for (let x = 0; x <= 82; x++) if (!m.wrap || x % 2 === 0) { px(x, 7); px(x, 47); }
  for (let y = 7; y <= 47; y++) if (!m.wrap || y % 2 === 1) { px(0, y); px(82, y); }
  for (let i = 0; i < wall.length; i++) if (wall[i]) {
    const ox = cx(i % COLS), oy = cy((i / COLS) | 0);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) px(ox + a, oy + b);
  }
  if (food) spr(FOOD, cx(food.x), cy(food.y));
  if (bonus) spr(BONUS[bonus.kind], cx(bonus.x), cy(bonus.y));
  if (!(state === 'dying' && Math.floor(stateT * 6) % 2)) drawSnake();
}
function drawMenu() {
  ctext('SNAKE', 1, 2);
  const head = Math.floor(time * 7) % 36 - 4;
  for (let i = 6; i >= 0; i--) {
    const c = head - i; if (c < 0 || c > 27) continue;
    const ox = c * 3, oy = 13;
    if (i === 0) spr(HEAD.n, ox, oy); else { body2(ox, oy); px(ox + 2, oy); px(ox + 2, oy + 1); }
  }
  const opts = [['VELOCITA', String(speed)], ['CAMPO', MAZES[mazeIdx].name]];
  opts.forEach(([l, v], i) => {
    const y = 20 + i * 7, sel = menuSel === i, on = sel && blink(3);
    if (sel) text('>', 0, y);
    text(l, 5, y);
    const val = (on ? '<' : ' ') + v + (on ? '>' : ' ');
    text(val, SW - 1 - textW(val), y);
  });
  if (blink()) ctext('PREMI A PER GIOCARE', 35);
  ctext('RECORD ' + String(best).padStart(4, '0'), 42);
}
function drawOver() {
  ctext('GAME OVER', 3, 2);
  ctext('PUNTI ' + String(score).padStart(4, '0'), 18);
  ctext('RECORD ' + String(best).padStart(4, '0'), 25);
  if (newRec && blink(4)) ctext('NUOVO RECORD!', 32);
  if (stateT > 0.8 && blink()) ctext('PREMI A', 40);
}
function compose() {
  fb.fill(0);
  if (state === 'menu') return drawMenu();
  if (state === 'over') return drawOver();
  drawField();
  if (paused) banner(['PAUSA', 'PREMI A'], 7);
}


// ---------- comandi: croce = gira, A = OK, START = pausa; anche scorrendo il dito sullo schermo ----------
let sw = null;
const ICON = ['................', '..#.............', '.#.#............', '..#.............', '................', '.....#########..', '.....#########..', '............##..', '............##..', '...###########..', '...###########..', '...##...........', '...##...........', '...#########.#..', '...###########..', '................'];
return {
  id: 'snake', name: 'SNAKE', desc: 'IL SERPENTE AFFAMATO',
  aspect: SW / SH,
  keys: [['D', 'gira'], ['A', 'via'], ['START', 'pausa']],
  icon(c, x, y, sz) { drawIcon(c, ICON, { '#': LCD_PIX }, x, y, sz, LCD_BG); },
  enter() { state = 'menu'; stateT = 0; paused = false; queue = []; },
  leave() { savePrefs(); paused = false; },
  hidden() { if (state === 'play') paused = true; },
  update: step,
  draw(c, w, h) { compose(); LCD.render(c, w, h); },
  button(name, down) {
    if (!down) return;
    if (name === 'up') dirPress({ x: 0, y: -1 });
    else if (name === 'down') dirPress({ x: 0, y: 1 });
    else if (name === 'left') dirPress({ x: -1, y: 0 });
    else if (name === 'right') dirPress({ x: 1, y: 0 });
    else if (name === 'a') okPress();
    else if (name === 'start') { if (state === 'play') togglePause(); else okPress(); }
  },
  pointer(type, x, y, id) {
    if (type === 'down') { sw = { id, x, y, moved: false }; return; }
    if (!sw || sw.id !== id) return;
    if (type === 'move') {
      const dx = x - sw.x, dy = y - sw.y;
      if (Math.hypot(dx, dy) < 18 * dpr) return;
      dirPress(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
      sw.x = x; sw.y = y; sw.moved = true;
    } else { if (type === 'up' && !sw.moved && state !== 'play') okPress(); sw = null; }
  }
};
})());
