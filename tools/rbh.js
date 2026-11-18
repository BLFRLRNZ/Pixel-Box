// Harness: carica sys_core + g_rimbalzo in Node e espone gli interni del gioco.
const fs = require('fs');
const noop = () => {};
const P = () => new Proxy(function () {}, { get: (t, k) => k === 'getContext' ? () => P() : k === 'getChannelData' ? () => new Float32Array(10) : k === 'classList' ? { toggle: noop, add: noop, remove: noop } : k === 'style' ? {} : (k === 'width' || k === 'height') ? 100 : P(), apply: () => P(), set: () => true });
global.document = { getElementById: () => P(), createElement: () => P(), addEventListener: noop };
global.window = global; global.addEventListener = noop; global.requestAnimationFrame = noop; global.performance = { now: () => 0 };
global.localStorage = { getItem: () => null, setItem: noop };
const dir = process.env.PBDIR || require('path').join(__dirname, '..', 'src') + '/';
let mod = fs.readFileSync(dir + 'g_rimbalzo.js', 'utf8');
const hook = `globalThis.__rb = { loadLevel, step, LEVELS, BTN,
  get ball() { return ball; }, get state() { return state; }, get L() { return L; }, get rg() { return ringsGot; }, get rt() { return ringsTotal; },
  snap() { return { ball: { ...ball }, enemies: enemies.map(e => ({ ...e })), objs: L.objs.map(o => ({ ...o })), ringsGot, lives, respawn: { ...respawn }, state, deadT, score, waterCD, doorCD, time }; },
  restore(s) { ball = { ...s.ball }; enemies = s.enemies.map(e => ({ ...e })); L.objs = s.objs.map(o => ({ ...o })); ringsGot = s.ringsGot; lives = s.lives; respawn = { ...s.respawn }; state = s.state; deadT = s.deadT; score = s.score; waterCD = s.waterCD; doorCD = s.doorCD; time = s.time; } };
return {
  id: 'rimbalzo'`;
mod = mod.replace("return {\n  id: 'rimbalzo'", hook);
if (!mod.includes('globalThis.__rb')) throw new Error('hook not injected');
const src = fs.readFileSync(dir + 'sys_core.js', 'utf8') + '\n' + mod;
new Function(src)();
module.exports = globalThis.__rb;
