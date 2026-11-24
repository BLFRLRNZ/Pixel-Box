// ===================== PIXEL SAGA · motore 3D (WebGL) =====================
// Disegna il mondo a bassa risoluzione: la console poi lo ingrandisce a pixel netti.
// Tutti i pezzi di Pixel Saga vivono dentro l'oggetto SG.
const SG = {};
(() => {
const M4 = {
  persp(fy, a, n, f) { const t = 1 / Math.tan(fy / 2), r = 1 / (n - f); return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (n + f) * r, -1, 0, 0, 2 * n * f * r, 0]); },
  look(e, c, u) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
  },
  mul(a, b) { const o = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
};

// retinatura ordinata 4x4 e pochi livelli di colore: l'aspetto "a pixel" anche nelle sfumature
// uMorb (e uMorbC per le nuvole): la luce morbida, che si accende solo col disegno a pastelli. A 1 la luce non va più a gradini e i colori
// non si riducono a pochi livelli: così il tratto dei pastelli non trova più una riga da ripassare a ogni gradino. A 0 tutto resta com'era.
const DITHER = `
uniform float uMorb;
float bay(vec2 p) { vec2 q = mod(floor(p), 4.0), h = floor(q / 2.0), l = q - 2.0 * h;
  return (4.0 * mod(2.0 * l.x + 3.0 * l.y, 4.0) + mod(2.0 * h.x + 3.0 * h.y, 4.0) + 0.5) / 16.0; }
vec3 grade(vec3 c) { float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, 1.0 + 0.55 * (1.0 - (mx - mn))); c = c + (c - 0.5) * 0.08; return clamp(c, 0.0, 1.0); }
vec3 dith(vec3 c) { c = grade(c); return uMorb > 0.5 ? c : floor(c * 40.0 + 0.5) / 40.0; }
vec3 band(vec3 l, float n) { if (uMorb > 0.5) return l; float m = max(l.r, max(l.g, l.b)); return l * (floor(m * n + 0.5) / n / max(m, 0.001)); }
float grad(float v, float n) { return uMorb > 0.5 ? v : floor(v * n + 0.5) / n; }
float fogk(float f) { return f * f * (3.0 - 2.0 * f); }
`;
const DLIGHT = `
uniform vec4 uLp[10]; uniform vec3 uLc[10]; uniform float uAmb;
vec3 lightAt(vec3 p) { vec3 l = vec3(uAmb); for (int i = 0; i < 10; i++) { vec3 d = uLp[i].xyz - p; float k = max(0.0, 1.0 - dot(d, d) / (uLp[i].w * uLp[i].w + 0.001)); l += uLc[i] * k * k; } return l; }
`;
const PREC = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;
// luci del mondo aperto: il colore del giorno (uLc), l'ombra delle nuvole che corrono, lampioni e finestre di notte
// PTL: lampioni e lanterne (si calcolano solo quando è buio). CLD: colore dell'ora e ombra delle nuvole.
const PTL = `
uniform vec4 uLp[8]; uniform vec3 uLq[8]; uniform float uNt;
vec3 ptLights(vec3 p) { vec3 l = vec3(0.0); if (uNt > 0.5) { for (int i = 0; i < 8; i++) { vec3 d = uLp[i].xyz - p; float k = max(0.0, 1.0 - dot(d, d) / (uLp[i].w * uLp[i].w + 0.001)); l += uLq[i] * k * k; } } return l; }
`;
const CLD = `
uniform vec3 uCl; uniform float uMorbC;
float cloudSh(vec2 w) { vec2 q = w * 0.0052 + uCl.xy; float f = sin(q.x + 1.7 * sin(q.y * 0.61)) + sin(q.y * 1.31 - 0.9 * sin(q.x * 0.47 + 2.0)) + 0.6 * sin((q.x + q.y) * 0.73 + 4.0);
  float ric = step(0.9, uCl.z), s = uCl.z - ric, k = 0.45 * mix(step(0.95, f), smoothstep(0.75, 1.15, f), uMorbC) + 0.55 * mix(step(1.15, f), smoothstep(0.95, 1.35, f), uMorbC);   // (morbida: l'ombra delle nuvole ha il bordo sfumato)
  if (ric > 0.5) { vec2 r = w * 0.0155 + uCl.xy * 2.98 + 7.3; float g = sin(r.x + 1.4 * sin(r.y * 0.67)) + sin(r.y * 1.23 - 1.1 * sin(r.x * 0.53 + 1.0)); k = max(k, 0.5 * mix(step(1.02, g), smoothstep(0.82, 1.22, g), uMorbC) + 0.3 * mix(step(1.32, g), smoothstep(1.12, 1.52, g), uMorbC)); }
  return 1.0 - s * k; }
`;
const WLIGHT = PTL + CLD + `
uniform vec3 uLc;
vec3 worldLight(vec3 p) { return uLc * cloudSh(p.xz) + band(ptLights(p), 5.0); }
`;
// A PASTELLI: le figure non si sfocano e non restano a quadretti. Ogni pixel del disegno guarda i vicini (xBR, di Hyllian):
// dove trova un bordo in diagonale lo taglia con una linea dritta, così scale e gradini diventano contorni puliti e i colori restano pieni.
const VOTO = `
uniform vec2 uTs; uniform float uVoto;
vec4 xdf(vec4 a, vec4 b) { return abs(a - b); }
vec4 xeq(vec4 a, vec4 b) { return vec4(lessThan(abs(a - b), vec4(15.0))); }
vec4 xne(vec4 a, vec4 b) { return vec4(notEqual(a, b)); }
vec4 xwd(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h) { return abs(a - b) + abs(a - c) + abs(d - e) + abs(d - f) + 4.0 * abs(g - h); }
float xy(vec4 c) { return 48.0 * (c.a * dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)) + (1.0 - c.a) * 2.0); }
float xcd(vec4 a, vec4 b) { vec4 d = abs(a - b); return d.r + d.g + d.b + d.a; }
// il riquadro si ripete: o = il suo angolo, n = la sua misura, q = il punto (tutto in pixel del foglio). Per gli sprite è il foglio intero, per muri e tetti la piastrella
vec4 xbrQ(sampler2D t, vec2 o, vec2 n, vec2 q) {
  vec2 s = 1.0 / uTs, fp = fract(q), c0 = floor(q);
#define XF(X, Y) texture2D(t, (o + mod(c0 + vec2(X, Y), n) + 0.5) * s)
  vec4 A1 = XF(-1.0, -2.0), B1 = XF(0.0, -2.0), C1 = XF(1.0, -2.0);
  vec4 A0 = XF(-2.0, -1.0), A = XF(-1.0, -1.0), B = XF(0.0, -1.0), C = XF(1.0, -1.0), C4 = XF(2.0, -1.0);
  vec4 D0 = XF(-2.0, 0.0), D = XF(-1.0, 0.0), E = XF(0.0, 0.0), F = XF(1.0, 0.0), F4 = XF(2.0, 0.0);
  vec4 G0 = XF(-2.0, 1.0), G = XF(-1.0, 1.0), H = XF(0.0, 1.0), I = XF(1.0, 1.0), I4 = XF(2.0, 1.0);
  vec4 G5 = XF(-1.0, 2.0), H5 = XF(0.0, 2.0), I5 = XF(1.0, 2.0);
  vec4 b = vec4(xy(B), xy(D), xy(H), xy(F)), c = vec4(xy(C), xy(A), xy(G), xy(I)), e = vec4(xy(E));
  vec4 d = b.yzwx, f = b.wxyz, g = c.zwxy, h = b.zwxy, i = c.wxyz;
  vec4 i4 = vec4(xy(I4), xy(C1), xy(A0), xy(G5)), i5 = vec4(xy(I5), xy(C4), xy(A1), xy(G0)), h5 = vec4(xy(H5), xy(F4), xy(B1), xy(D0)), f4 = h5.yzwx;
  vec4 fx = vec4(1.0, -1.0, -1.0, 1.0) * fp.y + vec4(1.0, 1.0, -1.0, -1.0) * fp.x;
  vec4 fxl = vec4(1.0, -1.0, -1.0, 1.0) * fp.y + vec4(0.5, 2.0, -0.5, -2.0) * fp.x;
  vec4 fxu = vec4(1.0, -1.0, -1.0, 1.0) * fp.y + vec4(2.0, 0.5, -2.0, -0.5) * fp.x;
  vec4 lv0 = xne(e, f) * xne(e, h);
  vec4 lv1 = lv0 * clamp((1.0 - xeq(f, b)) * (1.0 - xeq(f, c)) + (1.0 - xeq(h, d)) * (1.0 - xeq(h, g)) + xeq(e, i) * ((1.0 - xeq(f, f4)) * (1.0 - xeq(f, i4)) + (1.0 - xeq(h, h5)) * (1.0 - xeq(h, i5))) + xeq(e, g) + xeq(e, c), 0.0, 1.0);
  vec4 lv2l = xne(e, g) * xne(d, g), lv2u = xne(e, c) * xne(b, c);
  vec4 dl = vec4(0.12), dL = vec4(0.06, 0.12, 0.06, 0.12), dU = dL.yxwz;
  vec4 f45i = clamp((fx + dl - vec4(1.5, 0.5, -0.5, 0.5) - 0.25) / (2.0 * dl), 0.0, 1.0);
  vec4 f45 = clamp((fx + dl - vec4(1.5, 0.5, -0.5, 0.5)) / (2.0 * dl), 0.0, 1.0);
  vec4 f30 = clamp((fxl + dL - vec4(1.0, 1.0, -0.5, 0.0)) / (2.0 * dL), 0.0, 1.0);
  vec4 f60 = clamp((fxu + dU - vec4(2.0, 0.0, -1.0, 0.5)) / (2.0 * dU), 0.0, 1.0);
  vec4 wd1 = xwd(e, c, g, i, h5, f4, h, f), wd2 = xwd(h, d, i5, f, i4, b, e, i);
  vec4 edri = vec4(lessThanEqual(wd1, wd2)) * lv0, edr = vec4(lessThan(wd1, wd2)) * lv1;
  vec4 edl = vec4(lessThanEqual(2.0 * xdf(f, g), xdf(h, c))) * lv2l * edr, edu = vec4(greaterThanEqual(xdf(f, g), 2.0 * xdf(h, c))) * lv2u * edr;
  vec4 px = vec4(lessThanEqual(xdf(e, f), xdf(e, h)));
  vec4 mx = max(max(edl * f30, edu * f60), max(edr * f45, edri * f45i));
  vec4 r1 = mix(E, mix(H, F, px.x), mx.x); r1 = mix(r1, mix(B, D, px.z), mx.z);
  vec4 r2 = mix(E, mix(F, B, px.y), mx.y); r2 = mix(r2, mix(D, H, px.w), mx.w);
  return mix(r1, r2, step(xcd(E, r1), xcd(E, r2))); }
vec4 tex2(sampler2D t, vec2 uv) { if (uVoto < 0.5) return texture2D(t, uv); return xbrQ(t, vec2(0.0), uTs, uv * uTs); }
// le piastrelle di muri, tetti e pavimenti: cell = la piastrella nel foglio, l = il punto (la parte intera conta solo per ripetere), tiles = piastrelle per lato
vec4 tex2T(sampler2D t, vec2 cell, vec2 l, vec2 tiles) { if (uVoto < 0.5) return texture2D(t, (cell + fract(l)) / tiles); vec2 n = uTs / tiles; return xbrQ(t, cell * n, n, fract(l) * n); }
`;
const SRC = {
  terrain: [`
attribute vec3 aPos; attribute float aSh; attribute vec2 aG;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog; uniform float uWS;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH; varying vec3 vPL;
` + PTL + `
void main() { gl_Position = uVP * vec4(aPos, 1.0); vUV = aPos.xz / uWS; vW = aPos.xz; vSh = aSh; vD = distance(aPos, uCam); vG = aG; vH = aPos.y; vPL = ptLights(aPos + vec3(0.0, 1.5, 0.0));
  vFog = clamp((vD - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + CLD + `
uniform sampler2D uCol, uMat, uDet, uPav, uPavT; uniform vec3 uFogC, uLc; uniform float uTime, uPast; uniform vec2 uInvW, uW0;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH; varying vec3 vPL;
void main() {
  // i colori del terreno cambiano a quadretti allineati ai pixel del dettaglio: passaggi netti, niente sfumature morbide
  vec2 uv = ((uPast > 0.5 ? vW : (floor(vW * 4.0) + 0.5) * 0.25) - uW0) * uInvW;   // a pastelli: niente quadretti
  vec4 b = texture2D(uCol, uv), w = texture2D(uMat, uv), d = texture2D(uDet, vW * 0.0625);
  // sulle pareti ripide la grana si proietta di lato (lungo la parete e in altezza): niente strisce stirate
  float sl = length(vG);
  if (sl > 0.8) { vec2 dir = vG / sl; vec4 d2 = texture2D(uDet, vec2(dot(vW, vec2(-dir.y, dir.x)), vH) * 0.0625); d = mix(d, d2, smoothstep(0.8, 1.5, sl)); }
  // luce a gradini netti, come sui personaggi
  float nk = clamp(1.7 - vD / 75.0, 0.0, 1.0);
  float gr = 0.74 + 0.52 * mix(0.48, dot(d, w), nk);
  vec3 base = b.rgb * mix(gr, 1.0 + (gr - 1.0) * 0.3, uMorb);   // (morbida: la grana dell'erba e della terra stacca molto meno)
  // il selciato antico delle strade maestre: pietroni che compaiono dove la strada è più forte della soglia di ogni pietra (da lontano, una fascia chiara)
  float pv = texture2D(uPav, uv).r;
  if (pv > 0.2) { vec4 st = texture2D(uPavT, (floor(vW * 4.0) + 0.5) * 0.015625); if (pv > mix(0.5, st.a, nk)) base = mix(vec3(0.62, 0.6, 0.55), st.rgb, nk); }
  vec3 c = base * (grad(vSh, 12.0) * uLc * cloudSh(vW) + band(vPL, 5.0));
  if (b.a > 0.04) { float g = texture2D(uDet, vW * 0.031 + vec2(uTime * 0.013, uTime * 0.005)).g; c = mix(c, b.rgb * (0.85 + 0.6 * g), b.a); }
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), 1.0); }`],
  bb: [`
attribute vec3 aC; attribute vec2 aO; attribute vec2 aUV; attribute vec4 aK;
uniform mat4 uVP; uniform vec3 uCam, uR, uHero; uniform vec2 uFog; uniform float uNear, uTime;
varying vec2 vUV; varying vec4 vK; varying float vFog, vOcc, vCs; varying vec3 vPL;
` + PTL + CLD + `
void main() {
  // il vento: negli oggetti fissi l'altezza arriva in aK.a (negativa), più 1000 per gli alberi e 2000 per erba e cespugli
  float raw = max(-aK.a, 0.0), sw = floor(raw / 1000.0 + 0.01), hh = raw - 1000.0 * sw;
  float bend = sin(uTime * 1.7 + aC.x * 0.23 + aC.z * 0.19) + 0.5 * sin(uTime * 3.1 + aC.x * 0.11);
  vec3 p = aC + uR * (aO.x + bend * aO.y * (sw > 1.5 ? 0.075 : 0.016) * step(0.5, sw)) + vec3(0.0, aO.y, 0.0); gl_Position = uVP * vec4(p, 1.0);
  vUV = aUV; vK = vec4(aK.rgb, max(aK.a, 0.0)); vCs = cloudSh(aC.xz); vPL = ptLights(aC + vec3(0.0, 3.0, 0.0)); vFog = clamp((distance(p, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0);
  // copre l'eroe? (tra la telecamera e l'eroe, abbastanza alto da nasconderlo)
  float occ = 0.0;
  if (uNear > 0.0) {
    vec2 rel = aC.xz - uCam.xz, ch = uHero.xz - uCam.xz; float L = max(length(ch), 0.001); vec2 dir = ch / L;
    float along = dot(rel, dir), perp = abs(rel.x * dir.y - rel.y * dir.x), top = aC.y + hh, line = mix(uCam.y, uHero.y, clamp(along / L, 0.0, 1.0));
    float wd = abs(aO.x) * ((line - aC.y) / max(hh, 0.1) < 0.4 ? 0.14 : 1.0);
    if (along > 0.0 && along < L - 1.0 && perp - wd < 3.0 * along / L + 0.4 && top > line - 0.5) occ = 1.0;
    if (length(rel) < uNear) occ = 1.0;
    if (length(rel) < 3.2) occ = 2.0;   // addosso alla telecamera: non si disegna (niente pixel giganti)
  }
  vOcc = occ; }`, PREC + DITHER + VOTO + `
uniform sampler2D uTex; uniform vec3 uFogC, uLc; uniform float uGhost;
varying vec2 vUV; varying vec4 vK; varying float vFog, vOcc, vCs; varying vec3 vPL;
void main() { vec4 t = tex2(uTex, vUV); if (t.a < 0.5) discard;
  if (vOcc > 1.5 || (uGhost > 0.0) != (vOcc > 0.5)) discard;
  vec3 L = vK.r > 1.05 ? vec3(1.0) : uLc * vCs + band(vPL, 5.0);
  vec3 c = mix(t.rgb * vK.rgb * L, vec3(1.0), vK.a);
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), uGhost > 0.0 ? uGhost : 1.0); }`],
  mesh: [`
attribute vec3 aPos; attribute vec2 aT; attribute vec2 aL; attribute float aSh;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog;
varying vec2 vT, vL; varying float vSh, vFog, vGl; varying vec3 vP;
void main() { float f = floor(aSh / 2.0 + 0.01), dec = min(f, 1.0); gl_Position = uVP * vec4(aPos, 1.0); gl_Position.z -= dec * 0.0005 * gl_Position.w; vT = aT; vL = aL; vSh = aSh - 2.0 * f; vGl = f - 1.0; vP = aPos;
  vFog = clamp((distance(aPos, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + WLIGHT + VOTO + `
uniform sampler2D uTex; uniform vec3 uFogC, uFl; uniform vec2 uTiles; uniform float uNight;
varying vec2 vT, vL; varying float vSh, vFog, vGl; varying vec3 vP;
void main() { vec2 l = vL; if (vGl > 2.5) l += vGl > 3.5 ? uFl.yz : vec2(0.0, 1.0 - uFl.x);   // l'acqua che cade (3) e quella che scorre piano (4): uFl porta già le frazioni, piccole e precise
  vec4 t = tex2T(uTex, vT, l, uTiles); if (t.a < 0.5) discard;
  vec3 c = vSh > 0.99 ? t.rgb : t.rgb * vSh * worldLight(vP);
  // di notte le finestre si accendono: il vetro azzurro diventa luce calda, le vetrate colorate brillano
  if (vGl > 0.5 && uNight > 0.0) { float mx = max(t.r, max(t.g, t.b)), mn = min(t.r, min(t.g, t.b));
    if (vGl > 1.5) { if (mx - mn > 0.3) c = mix(c, t.rgb * 1.45, uNight); } else if (t.b > t.r + 0.06) c = mix(c, t.bgr * vec3(1.55, 1.35, 0.9) + vec3(0.14, 0.07, 0.0), uNight); }
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), 1.0); }`],
  water: [`
attribute vec2 aP; uniform mat4 uVP; uniform float uY; varying vec3 vP;
void main() { vP = vec3(aP.x, uY, aP.y); gl_Position = uVP * vec4(vP, 1.0); }`, PREC + DITHER + WLIGHT + `
uniform sampler2D uDet, uShore; uniform vec3 uCam, uFogC, uWat, uHi; uniform vec2 uFog, uInvW, uW0; uniform float uTime, uA;
varying vec3 vP;
void main() { vec2 w = vP.xz; float dist = distance(vP, uCam);
  float a = texture2D(uDet, w * 0.041 + vec2(uTime * 0.011, uTime * 0.006)).g, b = texture2D(uDet, w * 0.027 - vec2(uTime * 0.008, -uTime * 0.004)).g, k = mix(0.26, a * b, clamp(1.8 - dist / 110.0, 0.0, 1.0));
  vec3 L = uLc * (0.5 + 0.5 * cloudSh(w)) + band(ptLights(vP), 5.0);
  vec3 c = uWat * (0.78 + 0.6 * k) * L; if (k > 0.6) c = mix(c, uHi * L, 0.5);
  // schiuma: una fascia bianca che respira lungo la riva e un'onda che corre verso terra
  float s = texture2D(uShore, (w - uW0) * uInvW).r, al = uA;
  if (s > 0.42 && dist < 420.0) { float n = texture2D(uDet, floor(w * 2.0) * 0.5 * 0.057).r, wv = fract(s * 2.2 + uTime * 0.11 + n * 0.25);
    float foam = step(0.8 - 0.06 * sin(uTime * 1.3 + n * 6.0), s) + step(0.88, wv) * step(0.5, s) * step(0.3, n);
    if (foam > 0.5) { c = mix(c, vec3(0.96, 0.98, 1.0) * L, 0.82); al = max(al, 0.9); } else { c = mix(c, uHi * L, 0.25 * smoothstep(0.42, 0.9, s)); } }
  float f = fogk(clamp((dist - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0));
  gl_FragColor = vec4(dith(mix(c, uFogC, f)), mix(al, 1.0, f)); }`],
  sky: [`
attribute vec2 aP; void main() { gl_Position = vec4(aP, 0.9999, 1.0); }`, PREC + DITHER + `
uniform vec2 uRes; uniform float uHor, uYaw, uFovX, uPanoH, uTime, uStars; uniform vec3 uZen, uHorC, uSun, uSunC, uMoon, uPanoC; uniform sampler2D uPano; uniform vec4 uPk[10];
void main() { vec2 f = gl_FragCoord.xy;
  float t = clamp((f.y - uHor) / (uRes.y * 0.75), 0.0, 1.0);
  vec3 c = mix(uHorC, uZen, sqrt(t));
  float u = uYaw / 6.2831853 + (f.x / uRes.x - 0.5) * uFovX / 6.2831853, v = (f.y - uHor) / uPanoH;
  // stelle: un punto ogni tanto, che tremola
  if (uStars > 0.0 && f.y > uHor) { vec2 sp = floor(vec2(u * 1100.0, (f.y - uHor) * 0.5)); float h = fract(sin(dot(sp, vec2(12.9898, 78.233))) * 43758.5453);
    if (h > 0.9935) c += uStars * (0.55 + 0.45 * sin(uTime * 2.2 + h * 900.0)) * vec3(0.85, 0.9, 1.0) * (h > 0.998 ? 1.0 : 0.6); }
  // sole e luna: un disco netto con due aloni a gradini
  float ds = length(floor(f) + 0.5 - uSun.xy);
  if (uSun.z > 0.0) { if (ds < uSun.z) c = uSunC; else if (uMorb > 0.5) { float q = clamp(1.0 - (ds - uSun.z) / (uSun.z * 2.1), 0.0, 1.0); c = mix(c, uSunC, 0.5 * q * q); } else if (ds < uSun.z * 1.7) c = mix(c, uSunC, 0.42); else if (ds < uSun.z * 2.8) c = mix(c, uSunC, 0.16); }
  float dm = length(floor(f) + 0.5 - uMoon.xy);
  if (uMoon.z > 0.0) { if (dm < uMoon.z) { c = vec3(0.93, 0.95, 1.0); if (length(floor(f) + 0.5 - uMoon.xy - vec2(uMoon.z * 0.3, uMoon.z * 0.25)) < uMoon.z * 0.3 || length(floor(f) + 0.5 - uMoon.xy + vec2(uMoon.z * 0.35, uMoon.z * 0.3)) < uMoon.z * 0.2) c = vec3(0.76, 0.8, 0.9); } else if (uMorb > 0.5) { float q = clamp(1.0 - (dm - uMoon.z) / (uMoon.z * 1.3), 0.0, 1.0); c = mix(c, vec3(0.7, 0.8, 1.0), 0.26 * q * q); } else if (dm < uMoon.z * 1.8) c = mix(c, vec3(0.7, 0.8, 1.0), 0.2); }
  if (v > 0.0 && v < 1.0) { vec4 p = texture2D(uPano, vec2(u + (v > 0.45 ? uTime * 0.002 : 0.0), 1.0 - v)); c = mix(c, mix(p.rgb * uPanoC, uHorC, 0.3 * (1.0 - v)), p.a); }
  // i giganti del nord, oltre la foschia: sagome di cime innevate (x, cima, mezza larghezza in pixel; dal più lontano al più vicino)
  if (f.y > uHor - 1.0) for (int i = 0; i < 10; i++) { vec4 k = uPk[i]; if (k.w <= 0.0) continue;
    float dx = floor(f.x) + 0.5 - k.x, q = 1.0 - abs(dx) / k.z; if (q <= 0.0) continue;
    float fi = float(i), hh = k.y - uHor, top = uHor + hh * (q * (0.6 + 0.4 * q) + 0.06 * q * sin(dx * 0.19 + fi * 2.7) + 0.035 * q * sin(dx * 0.47 + fi));
    if (f.y < top) { float rel = (f.y - uHor) / max(1.0, hh);
      vec3 m = rel > 0.6 + 0.09 * sin(dx * 0.33 + fi * 1.3) - 0.2 * q * q ? mix(uHorC, uPanoC, 0.82) : mix(uHorC, uHorC * vec3(0.56, 0.66, 0.86), 0.3 + 0.6 * rel);
      if (dx > hh * 0.04 * sin(f.y * 0.21 + fi)) m *= 0.9;
      c = mix(c, m, k.w); } }
  gl_FragColor = vec4(dith(c), 1.0); }`],
  // aloni di luce (lampioni, fuochi, finestre grandi): dischi a gradini che si sommano al colore
  glow: [`
attribute vec3 aC; attribute vec2 aO; attribute vec2 aUV; attribute vec4 aK;
uniform mat4 uVP; uniform vec3 uCam, uR; uniform vec2 uFog;
varying vec2 vUV; varying vec4 vK;
void main() { vec3 p = aC + uR * aO.x + vec3(0.0, aO.y, 0.0); gl_Position = uVP * vec4(p, 1.0); vUV = aUV;
  vK = vec4(aK.rgb, aK.a * (1.0 - clamp((distance(p, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0))); }`, PREC + `
uniform float uMorb; varying vec2 vUV; varying vec4 vK;
void main() { float r = length(vUV); if (r > 1.0) discard; float a = 1.0 - r; a = uMorb > 0.5 ? a * a * 1.08 : floor(a * a * 4.0 + 0.7) / 4.0; gl_FragColor = vec4(vK.rgb * a * vK.a, 1.0); }`],
  // la luce ricca (solo a richiesta): dall'immagine finita si prende il chiaro, lo si sfoca e lo si rimette sopra; in più una vignetta agli angoli
  lumi: [`
attribute vec2 aP; varying vec2 vUV; void main() { gl_Position = vec4(aP, 0.0, 1.0); vUV = aP * 0.5 + 0.5; }`, PREC + `
uniform sampler2D uT; uniform vec2 uPx; uniform float uThr, uSat; varying vec2 vUV;
void main() { vec3 c = (texture2D(uT, vUV + uPx * vec2(-1.0, -1.0)).rgb + texture2D(uT, vUV + uPx * vec2(1.0, -1.0)).rgb + texture2D(uT, vUV + uPx * vec2(-1.0, 1.0)).rgb + texture2D(uT, vUV + uPx * vec2(1.0, 1.0)).rgb) * 0.25;   // un quarto di misura: quattro prese che coprono il quadretto di 4 x 4
  float l = dot(c, vec3(0.299, 0.587, 0.114)), k = max(0.0, l - uThr) / max(l, 0.001), mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
  k *= mix(1.0, min(2.2, (mx - mn) / max(mx, 0.001) * 2.6), uSat); gl_FragColor = vec4(c * k * 2.3, 1.0); }`],
  sfoca: [`
attribute vec2 aP; varying vec2 vUV; void main() { gl_Position = vec4(aP, 0.0, 1.0); vUV = aP * 0.5 + 0.5; }`, PREC + `
uniform sampler2D uT; uniform vec2 uDir; varying vec2 vUV;
void main() { vec3 c = texture2D(uT, vUV).rgb * 0.2270; c += (texture2D(uT, vUV + uDir * 1.385).rgb + texture2D(uT, vUV - uDir * 1.385).rgb) * 0.3162; c += (texture2D(uT, vUV + uDir * 3.231).rgb + texture2D(uT, vUV - uDir * 3.231).rgb) * 0.0703; gl_FragColor = vec4(c, 1.0); }`],
  luce: [`
attribute vec2 aP; varying vec2 vUV; void main() { gl_Position = vec4(aP, 0.0, 1.0); vUV = aP * 0.5 + 0.5; }`, PREC + `
uniform sampler2D uT, uB; uniform vec3 uK; uniform float uMorb; varying vec2 vUV;
void main() { vec3 c = texture2D(uT, vUV).rgb, b = texture2D(uB, vUV).rgb * uK.x;
  if (uMorb < 0.5) b = floor(b * 16.0 + 0.5) / 16.0;                       // il bagliore a gradini, come il resto della luce
  float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, 1.06); c += (c - 0.5) * 0.05 + (l - 0.5) * vec3(0.024, 0.006, -0.03);   // un filo più di colore e di stacco; caldo nei chiari, freddo negli scuri
  c = clamp(c, 0.0, 1.0); c = 1.0 - (1.0 - c) * (1.0 - min(b, vec3(uK.z)));       // si somma senza bruciare (e mai oltre un certo segno: di notte, accanto a un lampione, la piazza non deve diventare bianca)
  vec2 q = (vUV - 0.5) * vec2(1.2, 1.0); c *= 1.0 - uK.y * smoothstep(0.38, 0.92, length(q));
  gl_FragColor = vec4(c, 1.0); }`],
  // A PASTELLI (il Grande Viaggio a pastelli): dall'immagine finita si stende il colore a chiazze morbide e vive
  // e si ripassano i contorni con un tratto scuro che trema appena, come un disegno fatto a mano
  pastello: [`
attribute vec2 aP; varying vec2 vUV; void main() { gl_Position = vec4(aP, 0.0, 1.0); vUV = aP * 0.5 + 0.5; }`, PREC + `
uniform sampler2D uT; uniform vec2 uPx; uniform vec4 uP; uniform float uInk; varying vec2 vUV;
vec3 T(vec2 o) { return texture2D(uT, vUV + o * uPx).rgb; }
float lu(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
// un quarto della finestra di Kuwahara: media e varietà del colore
vec4 quarto(vec2 o, vec2 d) { vec3 a = vec3(0.0), b = vec3(0.0);
  for (int j = 0; j <= 1; j++) for (int i = 0; i <= 1; i++) { vec3 c = T(o + d * vec2(float(i), float(j))); a += c; b += c * c; }
  a *= 0.25; vec3 v = b * 0.25 - a * a; return vec4(a, v.r + v.g + v.b); }
void main() {
  // (il tratto non trema più: l'immagine sta ferma, e niente si sfoca)
  vec2 wb = vec2(0.0);
  // il colore steso a chiazze (Kuwahara morbido: le quattro finestre pesano secondo quanto sono uniformi)
  vec4 q0 = quarto(wb, vec2(-1.0, -1.0)), q1 = quarto(wb, vec2(1.0, -1.0)), q2 = quarto(wb, vec2(-1.0, 1.0)), q3 = quarto(wb, vec2(1.0, 1.0));
  vec4 w = 1.0 / pow(vec4(q0.a, q1.a, q2.a, q3.a) * 60.0 + 1.0, vec4(3.0));
  vec3 c = (q0.rgb * w.x + q1.rgb * w.y + q2.rgb * w.z + q3.rgb * w.w) / (w.x + w.y + w.z + w.w);
  // i contorni: dove il colore cambia di colpo. I punti di confronto stanno sui pixel veri (a 0,62 pixel il confronto si sfocava
  // e il tratto spariva): il tratto è largo un pixel, e lo fanno fine la soglia e il colore, non lo sfocato
  const float D = 1.0;
  vec3 a1 = T(wb + vec2(-D, D)), a2 = T(wb + vec2(0.0, D)), a3 = T(wb + vec2(D, D)), b1 = T(wb + vec2(-D, 0.0)), b3 = T(wb + vec2(D, 0.0)), c1 = T(wb + vec2(-D, -D)), c2 = T(wb + vec2(0.0, -D)), c3 = T(wb + vec2(D, -D));
  vec3 gx = a3 + 2.0 * b3 + c3 - a1 - 2.0 * b1 - c1, gy = a1 + 2.0 * a2 + a3 - c1 - 2.0 * c2 - c3;
  float e = sqrt(dot(gx, gx) + dot(gy, gy));
  // colori pieni e vivi: un po' più di saturazione e di stacco (niente trama sopra: la grana stava ferma sullo schermo e si vedeva come un'impronta)
  float l = lu(c);
  c = clamp(mix(vec3(l), c, uP.x), 0.0, 1.0); c = clamp(c + (c - 0.5) * uP.y, 0.0, 1.0);
  float ln = smoothstep(uP.z, uP.z + 0.45, e);
  c = mix(c, mix(vec3(0.16, 0.11, 0.15), c * 0.38, uInk), ln * uP.w);   // il tratto prende il colore di quel che ripassa, scurito (uInk: quanto; FINI più chiaro, NETTI quasi nero)
  gl_FragColor = vec4(c, 1.0); }`],
  // A PASTELLI: ingrandisce una volta per tutte le icone e i ritratti dell'interfaccia con lo stesso xBR delle figure del mondo
  xbrsu: [`
attribute vec2 aP; varying vec2 vUV; void main() { gl_Position = vec4(aP, 0.0, 1.0); vUV = aP * 0.5 + 0.5; }`, PREC + VOTO + `
uniform sampler2D uTex; varying vec2 vUV; void main() { gl_FragColor = tex2(uTex, vUV); }`],
  // acqua e lava dei santuari (luce fissa, niente schiuma)
  dwater: [`
attribute vec2 aP; uniform mat4 uVP; uniform float uY; varying vec3 vP;
void main() { vP = vec3(aP.x, uY, aP.y); gl_Position = uVP * vec4(vP, 1.0); }`, PREC + DITHER + `
uniform sampler2D uDet; uniform vec3 uCam, uFogC, uWat, uHi; uniform vec2 uFog; uniform float uLight, uTime, uA;
varying vec3 vP;
void main() { vec2 w = vP.xz;
  float a = texture2D(uDet, w * 0.041 + vec2(uTime * 0.011, uTime * 0.006)).g, b = texture2D(uDet, w * 0.027 - vec2(uTime * 0.008, -uTime * 0.004)).g, k = mix(0.26, a * b, clamp(1.8 - distance(vP, uCam) / 110.0, 0.0, 1.0));
  vec3 c = uWat * (0.78 + 0.6 * k) * uLight; if (k > 0.6) c = mix(c, uHi * uLight, 0.5);
  float f = fogk(clamp((distance(vP, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0));
  gl_FragColor = vec4(dith(mix(c, uFogC, f)), mix(uA, 1.0, f)); }`],
  shadow: [`
attribute vec3 aPos; attribute vec2 aUV; uniform mat4 uVP; varying vec2 vUV;
void main() { gl_Position = uVP * vec4(aPos, 1.0); vUV = aUV; }`, PREC + `
uniform vec4 uCol; uniform float uIn;
varying vec2 vUV; void main() { float r = length(vUV); if (r > 1.0 || r < uIn) discard; gl_FragColor = uCol; }`],
  // santuari: muri e pavimenti illuminati dalle torce; i muri tra l'eroe e la telecamera si diradano
  dmesh: [`
attribute vec3 aPos; attribute vec2 aT; attribute vec2 aL; attribute float aSh;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog;
varying vec2 vT, vL; varying float vSh, vFog, vDist; varying vec3 vP;
void main() { gl_Position = uVP * vec4(aPos, 1.0); vT = aT; vL = aL; vSh = aSh; vP = aPos; vDist = distance(aPos, uCam);
  vFog = clamp((vDist - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + DLIGHT + VOTO + `
uniform sampler2D uTex; uniform vec3 uFogC; uniform vec2 uTiles; uniform vec4 uCut; uniform float uGhost;
varying vec2 vT, vL; varying float vSh, vFog, vDist; varying vec3 vP;
void main() { vec4 t = tex2T(uTex, vT, vL, uTiles); if (t.a < 0.5) discard;
  float a = 1.0;
  if (uCut.z > 0.0) {
    float e = length(gl_FragCoord.xy - uCut.xy) / uCut.z;
    if (vDist < uCut.w && e < 1.0) a = e < 0.72 ? 0.0 : 0.35;
    a = min(a, vDist < 14.0 ? 0.0 : vDist < 18.0 ? 0.35 : 1.0);
  }
  if (a < 0.01 || (uGhost > 0.0 ? a > 0.99 : a < 0.99)) discard;
  vec3 L = band(lightAt(vP), 6.0);
  vec3 c = vSh > 0.995 ? t.rgb : t.rgb * vSh * L;
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), a); }`],
  dbb: [`
attribute vec3 aC; attribute vec2 aO; attribute vec2 aUV; attribute vec4 aK;
uniform mat4 uVP; uniform vec3 uCam, uR; uniform vec2 uFog;
varying vec2 vUV; varying vec4 vK; varying float vFog; varying vec3 vLi;
` + DLIGHT + `
void main() { vec3 p = aC + uR * aO.x + vec3(0.0, aO.y, 0.0); gl_Position = uVP * vec4(p, 1.0);
  vUV = aUV; vK = aK; vLi = lightAt(p + vec3(0.0, 1.0, 0.0)); vFog = clamp((distance(p, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + VOTO + `
uniform sampler2D uTex; uniform vec3 uFogC;
varying vec2 vUV; varying vec4 vK; varying float vFog; varying vec3 vLi;
void main() { vec4 t = tex2(uTex, vUV); if (t.a < 0.5) discard;
  vec3 L = (vK.r > 1.05 || vK.g > 1.05) ? vec3(1.0) : min(band(vLi, 6.0), vec3(1.25));
  vec3 c = mix(t.rgb * vK.rgb * L, vec3(1.0), vK.a);
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), 1.0); }`],
};

function compile(gl, vs, fs) {
  const mk = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src); return s; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const a = {}, u = {};
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); i < n; i++) { const x = gl.getActiveAttrib(p, i); a[x.name] = gl.getAttribLocation(p, x.name); }
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const x = gl.getActiveUniform(p, i); u[x.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, x.name); }
  return { p, a, u };
}

// crea il contesto e i programmi; restituisce null se il telefono non ha la grafica 3D
function create() {
  const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180;
  let gl = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: true, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }) || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
  if (!gl) return null;
  const P = {}; for (const k in SRC) P[k] = compile(gl, SRC[k][0], SRC[k][1]);
  let enabled = [];
  const G = {
    canvas, gl, P, M4,
    buffer(data, kind = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW) { const b = gl.createBuffer(); gl.bindBuffer(kind, b); gl.bufferData(kind, data, usage); return b; },
    texture(src, { linear = false, repeat = false, lum = false } = {}) {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (lum) { gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, src.w, src.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, src.data); }
      else if (src.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.w, src.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src.data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      t.w = src.w || src.width; t.h = src.h || src.height;
      const f = linear ? gl.LINEAR : gl.NEAREST, w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
      return t;
    },
    // collega gli attributi del buffer corrente: layout = [['aPos', 3], ['aSh', 1]]
    attribs(prog, layout, base = 0) {
      let stride = 0; for (const l of layout) stride += l[1] * 4;
      let off = 0; const now = [];
      for (const [name, n] of layout) { const loc = prog.a[name]; if (loc !== undefined && loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, stride, base + off); now.push(loc); } off += n * 4; }
      for (const l of enabled) if (now.indexOf(l) < 0) gl.disableVertexAttribArray(l);
      enabled = now;
    },
    resize(w, h) { if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } },
  };
  // indici condivisi per i quadrati (fino a 16384 per disegno)
  const qi = new Uint16Array(16384 * 6);
  for (let i = 0; i < 16384; i++) { const v = i * 4, o = i * 6; qi[o] = v; qi[o + 1] = v + 1; qi[o + 2] = v + 2; qi[o + 3] = v; qi[o + 4] = v + 2; qi[o + 5] = v + 3; }
  G.quadIdx = G.buffer(qi, gl.ELEMENT_ARRAY_BUFFER);
  G.full = G.buffer(new Float32Array([-1, -1, 3, -1, -1, 3]));
  return G;
}
SG.M4 = M4;
SG.createGL = create;
})();
