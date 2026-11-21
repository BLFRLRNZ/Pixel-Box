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
const DITHER = `
float bay(vec2 p) { vec2 q = mod(floor(p), 4.0), h = floor(q / 2.0), l = q - 2.0 * h;
  return (4.0 * mod(2.0 * l.x + 3.0 * l.y, 4.0) + mod(2.0 * h.x + 3.0 * h.y, 4.0) + 0.5) / 16.0; }
vec3 grade(vec3 c) { float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, 1.0 + 0.55 * (1.0 - (mx - mn))); c = c + (c - 0.5) * 0.08; return clamp(c, 0.0, 1.0); }
vec3 dith(vec3 c) { return floor(grade(c) * 40.0 + 0.5) / 40.0; }
vec3 band(vec3 l, float n) { float m = max(l.r, max(l.g, l.b)); return l * (floor(m * n + 0.5) / n / max(m, 0.001)); }
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
uniform vec3 uCl;
float cloudSh(vec2 w) { vec2 q = w * 0.0052 + uCl.xy; float f = sin(q.x + 1.7 * sin(q.y * 0.61)) + sin(q.y * 1.31 - 0.9 * sin(q.x * 0.47 + 2.0)) + 0.6 * sin((q.x + q.y) * 0.73 + 4.0);
  return 1.0 - uCl.z * (0.45 * step(0.95, f) + 0.55 * step(1.15, f)); }
`;
const WLIGHT = PTL + CLD + `
uniform vec3 uLc;
vec3 worldLight(vec3 p) { return uLc * cloudSh(p.xz) + band(ptLights(p), 5.0); }
`;
const SRC = {
  terrain: [`
attribute vec3 aPos; attribute float aSh; attribute vec2 aG;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog; uniform float uWS;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH; varying vec3 vPL;
` + PTL + `
void main() { gl_Position = uVP * vec4(aPos, 1.0); vUV = aPos.xz / uWS; vW = aPos.xz; vSh = aSh; vD = distance(aPos, uCam); vG = aG; vH = aPos.y; vPL = ptLights(aPos + vec3(0.0, 1.5, 0.0));
  vFog = clamp((vD - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + CLD + `
uniform sampler2D uCol, uMat, uDet, uPav, uPavT; uniform vec3 uFogC, uLc; uniform float uTime; uniform vec2 uInvW, uW0;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH; varying vec3 vPL;
void main() {
  // i colori del terreno cambiano a quadretti allineati ai pixel del dettaglio: passaggi netti, niente sfumature morbide
  vec2 uv = ((floor(vW * 4.0) + 0.5) * 0.25 - uW0) * uInvW;
  vec4 b = texture2D(uCol, uv), w = texture2D(uMat, uv), d = texture2D(uDet, vW * 0.0625);
  // sulle pareti ripide la grana si proietta di lato (lungo la parete e in altezza): niente strisce stirate
  float sl = length(vG);
  if (sl > 0.8) { vec2 dir = vG / sl; vec4 d2 = texture2D(uDet, vec2(dot(vW, vec2(-dir.y, dir.x)), vH) * 0.0625); d = mix(d, d2, smoothstep(0.8, 1.5, sl)); }
  // luce a gradini netti, come sui personaggi
  float nk = clamp(1.7 - vD / 75.0, 0.0, 1.0);
  vec3 base = b.rgb * (0.74 + 0.52 * mix(0.48, dot(d, w), nk));
  // il selciato antico delle strade maestre: pietroni che compaiono dove la strada è più forte della soglia di ogni pietra (da lontano, una fascia chiara)
  float pv = texture2D(uPav, uv).r;
  if (pv > 0.2) { vec4 st = texture2D(uPavT, (floor(vW * 4.0) + 0.5) * 0.015625); if (pv > mix(0.5, st.a, nk)) base = mix(vec3(0.62, 0.6, 0.55), st.rgb, nk); }
  vec3 c = base * ((floor(vSh * 12.0 + 0.5) / 12.0) * uLc * cloudSh(vW) + band(vPL, 5.0));
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
  vOcc = occ; }`, PREC + DITHER + `
uniform sampler2D uTex; uniform vec3 uFogC, uLc; uniform float uGhost;
varying vec2 vUV; varying vec4 vK; varying float vFog, vOcc, vCs; varying vec3 vPL;
void main() { vec4 t = texture2D(uTex, vUV); if (t.a < 0.5) discard;
  if (vOcc > 1.5 || (uGhost > 0.0) != (vOcc > 0.5)) discard;
  vec3 L = vK.r > 1.05 ? vec3(1.0) : uLc * vCs + band(vPL, 5.0);
  vec3 c = mix(t.rgb * vK.rgb * L, vec3(1.0), vK.a);
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), uGhost > 0.0 ? uGhost : 1.0); }`],
  mesh: [`
attribute vec3 aPos; attribute vec2 aT; attribute vec2 aL; attribute float aSh;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog;
varying vec2 vT, vL; varying float vSh, vFog, vGl; varying vec3 vP;
void main() { float f = floor(aSh / 2.0 + 0.01), dec = min(f, 1.0); gl_Position = uVP * vec4(aPos, 1.0); gl_Position.z -= dec * 0.0005 * gl_Position.w; vT = aT; vL = aL; vSh = aSh - 2.0 * f; vGl = f - 1.0; vP = aPos;
  vFog = clamp((distance(aPos, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + WLIGHT + `
uniform sampler2D uTex; uniform vec3 uFogC, uFl; uniform vec2 uTiles; uniform float uNight;
varying vec2 vT, vL; varying float vSh, vFog, vGl; varying vec3 vP;
void main() { vec2 l = vL; if (vGl > 2.5) l += vGl > 3.5 ? uFl.yz : vec2(0.0, 1.0 - uFl.x);   // l'acqua che cade (3) e quella che scorre piano (4): uFl porta già le frazioni, piccole e precise
  vec4 t = texture2D(uTex, (vT + fract(l)) / uTiles); if (t.a < 0.5) discard;
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
  if (uSun.z > 0.0) { if (ds < uSun.z) c = uSunC; else if (ds < uSun.z * 1.7) c = mix(c, uSunC, 0.42); else if (ds < uSun.z * 2.8) c = mix(c, uSunC, 0.16); }
  float dm = length(floor(f) + 0.5 - uMoon.xy);
  if (uMoon.z > 0.0) { if (dm < uMoon.z) { c = vec3(0.93, 0.95, 1.0); if (length(floor(f) + 0.5 - uMoon.xy - vec2(uMoon.z * 0.3, uMoon.z * 0.25)) < uMoon.z * 0.3 || length(floor(f) + 0.5 - uMoon.xy + vec2(uMoon.z * 0.35, uMoon.z * 0.3)) < uMoon.z * 0.2) c = vec3(0.76, 0.8, 0.9); } else if (dm < uMoon.z * 1.8) c = mix(c, vec3(0.7, 0.8, 1.0), 0.2); }
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
varying vec2 vUV; varying vec4 vK;
void main() { float r = length(vUV); if (r > 1.0) discard; float a = 1.0 - r; a = floor(a * a * 4.0 + 0.7) / 4.0; gl_FragColor = vec4(vK.rgb * a * vK.a, 1.0); }`],
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
  vFog = clamp((vDist - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + DLIGHT + `
uniform sampler2D uTex; uniform vec3 uFogC; uniform vec2 uTiles; uniform vec4 uCut; uniform float uGhost;
varying vec2 vT, vL; varying float vSh, vFog, vDist; varying vec3 vP;
void main() { vec4 t = texture2D(uTex, (vT + fract(vL)) / uTiles); if (t.a < 0.5) discard;
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
  vUV = aUV; vK = aK; vLi = lightAt(p + vec3(0.0, 1.0, 0.0)); vFog = clamp((distance(p, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + `
uniform sampler2D uTex; uniform vec3 uFogC;
varying vec2 vUV; varying vec4 vK; varying float vFog; varying vec3 vLi;
void main() { vec4 t = texture2D(uTex, vUV); if (t.a < 0.5) discard;
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
