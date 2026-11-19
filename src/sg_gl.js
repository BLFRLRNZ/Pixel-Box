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
vec3 dith(vec3 c) { return floor(c * 40.0 + 0.5) / 40.0; }
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
const SRC = {
  terrain: [`
attribute vec3 aPos; attribute float aSh; attribute vec2 aG;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog; uniform float uWS;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH;
void main() { gl_Position = uVP * vec4(aPos, 1.0); vUV = aPos.xz / uWS; vW = aPos.xz; vSh = aSh; vD = distance(aPos, uCam); vG = aG; vH = aPos.y;
  vFog = clamp((vD - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + `
uniform sampler2D uCol, uMat, uDet; uniform vec3 uFogC; uniform float uLight, uTime, uInvWS;
varying vec2 vUV, vW, vG; varying float vSh, vFog, vD, vH;
void main() {
  // i colori del terreno cambiano a quadretti allineati ai pixel del dettaglio: passaggi netti, niente sfumature morbide
  vec2 uv = (floor(vW * 4.0) + 0.5) * 0.25 * uInvWS;
  vec4 b = texture2D(uCol, uv), w = texture2D(uMat, uv), d = texture2D(uDet, vW * 0.0625);
  // sulle pareti ripide la grana si proietta di lato (lungo la parete e in altezza): niente strisce stirate
  float sl = length(vG);
  if (sl > 0.8) { vec2 dir = vG / sl; vec4 d2 = texture2D(uDet, vec2(dot(vW, vec2(-dir.y, dir.x)), vH) * 0.0625); d = mix(d, d2, smoothstep(0.8, 1.5, sl)); }
  // luce a gradini netti, come sui personaggi
  vec3 c = b.rgb * (0.74 + 0.52 * mix(0.48, dot(d, w), clamp(1.7 - vD / 75.0, 0.0, 1.0))) * (floor(vSh * 12.0 + 0.5) / 12.0) * uLight;
  if (b.a > 0.04) { float g = texture2D(uDet, vW * 0.031 + vec2(uTime * 0.013, uTime * 0.005)).g; c = mix(c, b.rgb * (0.85 + 0.6 * g), b.a); }
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), 1.0); }`],
  bb: [`
attribute vec3 aC; attribute vec2 aO; attribute vec2 aUV; attribute vec4 aK;
uniform mat4 uVP; uniform vec3 uCam, uR, uHero; uniform vec2 uFog; uniform float uNear;
varying vec2 vUV; varying vec4 vK; varying float vFog, vOcc;
void main() { vec3 p = aC + uR * aO.x + vec3(0.0, aO.y, 0.0); gl_Position = uVP * vec4(p, 1.0);
  vUV = aUV; vK = vec4(aK.rgb, max(aK.a, 0.0)); vFog = clamp((distance(p, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0);
  // copre l'eroe? (tra la telecamera e l'eroe, abbastanza alto da nasconderlo; l'altezza arriva in aK.a, negativa)
  float occ = 0.0;
  if (uNear > 0.0) {
    vec2 rel = aC.xz - uCam.xz, ch = uHero.xz - uCam.xz; float L = max(length(ch), 0.001); vec2 dir = ch / L;
    float along = dot(rel, dir), perp = abs(rel.x * dir.y - rel.y * dir.x), top = aC.y + max(-aK.a, 0.0);
    if (along > 0.0 && along < L - 1.0 && perp < abs(aO.x) + 1.0 && top > mix(uCam.y, uHero.y, clamp(along / L, 0.0, 1.0)) - 0.5) occ = 1.0;
    if (length(rel) < uNear) occ = 1.0;
  }
  vOcc = occ; }`, PREC + DITHER + `
uniform sampler2D uTex; uniform vec3 uFogC; uniform float uLight, uGhost;
varying vec2 vUV; varying vec4 vK; varying float vFog, vOcc;
void main() { vec4 t = texture2D(uTex, vUV); if (t.a < 0.5) discard;
  if ((uGhost > 0.0) != (vOcc > 0.5)) discard;
  vec3 c = mix(t.rgb * vK.rgb * uLight, vec3(1.0), vK.a);
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), uGhost > 0.0 ? uGhost : 1.0); }`],
  mesh: [`
attribute vec3 aPos; attribute vec2 aT; attribute vec2 aL; attribute float aSh;
uniform mat4 uVP; uniform vec3 uCam; uniform vec2 uFog;
varying vec2 vT, vL; varying float vSh, vFog;
void main() { gl_Position = uVP * vec4(aPos, 1.0); vT = aT; vL = aL; vSh = aSh;
  vFog = clamp((distance(aPos, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0); }`, PREC + DITHER + `
uniform sampler2D uTex; uniform vec3 uFogC; uniform float uLight; uniform vec2 uTiles;
varying vec2 vT, vL; varying float vSh, vFog;
void main() { vec4 t = texture2D(uTex, (vT + fract(vL)) / uTiles); if (t.a < 0.5) discard;
  vec3 c = t.rgb * vSh * mix(uLight, 1.0, step(0.99, vSh));
  gl_FragColor = vec4(dith(mix(c, uFogC, fogk(vFog))), 1.0); }`],
  water: [`
attribute vec2 aP; uniform mat4 uVP; uniform float uY; varying vec3 vP;
void main() { vP = vec3(aP.x, uY, aP.y); gl_Position = uVP * vec4(vP, 1.0); }`, PREC + DITHER + `
uniform sampler2D uDet; uniform vec3 uCam, uFogC, uWat, uHi; uniform vec2 uFog; uniform float uLight, uTime, uA;
varying vec3 vP;
void main() { vec2 w = vP.xz;
  float a = texture2D(uDet, w * 0.041 + vec2(uTime * 0.011, uTime * 0.006)).g, b = texture2D(uDet, w * 0.027 - vec2(uTime * 0.008, -uTime * 0.004)).g, k = mix(0.26, a * b, clamp(1.8 - distance(vP, uCam) / 110.0, 0.0, 1.0));
  vec3 c = uWat * (0.78 + 0.6 * k) * uLight; if (k > 0.6) c = mix(c, uHi * uLight, 0.5);
  float f = fogk(clamp((distance(vP, uCam) - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0));
  gl_FragColor = vec4(dith(mix(c, uFogC, f)), mix(uA, 1.0, f)); }`],
  sky: [`
attribute vec2 aP; void main() { gl_Position = vec4(aP, 0.9999, 1.0); }`, PREC + DITHER + `
uniform vec2 uRes; uniform float uHor, uYaw, uFovX, uPanoH, uTime; uniform vec3 uZen, uHorC; uniform sampler2D uPano;
void main() { vec2 f = gl_FragCoord.xy;
  float t = clamp((f.y - uHor) / (uRes.y * 0.75), 0.0, 1.0);
  vec3 c = mix(uHorC, uZen, sqrt(t));
  float u = uYaw / 6.2831853 + (f.x / uRes.x - 0.5) * uFovX / 6.2831853, v = (f.y - uHor) / uPanoH;
  if (v > 0.0 && v < 1.0) { vec4 p = texture2D(uPano, vec2(u + (v > 0.45 ? uTime * 0.002 : 0.0), 1.0 - v)); c = mix(c, mix(p.rgb, uHorC, 0.3 * (1.0 - v)), p.a); }
  gl_FragColor = vec4(dith(c), 1.0); }`],
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
  vec3 L = floor(lightAt(vP) * 6.0 + 0.5) / 6.0;
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
  vec3 L = (vK.r > 1.05 || vK.g > 1.05) ? vec3(1.0) : min(floor(vLi * 6.0 + 0.5) / 6.0, vec3(1.25));
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
    texture(src, { linear = false, repeat = false } = {}) {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (src.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.w, src.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src.data);
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
