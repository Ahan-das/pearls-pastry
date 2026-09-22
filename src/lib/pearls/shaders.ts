/**
 * Tapioca pearls and crumbs drawn as shaded impostors: one instanced quad each,
 * the sphere is reconstructed per pixel. No meshes, no textures.
 *
 * Why a shader and not CSS gradients: every pearl is lit by the same moving lamp
 * (the cursor), so the glint slides across each one according to where it sits
 * relative to the pointer. That is one uniform here and dozens of per-element
 * gradient rewrites in CSS.
 */

export const VERT = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;     // -1..1 quad corner
layout(location = 1) in vec4 aPearl;      // x, y (css px), radius (css px), blur 0..1
layout(location = 2) in vec4 aMeta;       // kind (0 pearl, 1 crumb), seed, alpha, spin

uniform vec2 uView;                        // canvas size in css px

out vec2 vUv;
out vec2 vCenter;
out float vRadius;
out float vBlur;
out float vKind;
out float vSeed;
out float vAlpha;
out float vSpin;

void main() {
  float pad = 1.0 + aPearl.w * 0.55 + 0.06;      // room for the soft edge
  vec2 p = aPearl.xy + aCorner * aPearl.z * pad;
  vUv = aCorner * pad;
  vCenter = aPearl.xy;
  vRadius = aPearl.z;
  vBlur = aPearl.w;
  vKind = aMeta.x;
  vSeed = aMeta.y;
  vAlpha = aMeta.z;
  vSpin = aMeta.w;
  vec2 clip = (p / uView) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
in vec2 vCenter;
in float vRadius;
in float vBlur;
in float vKind;
in float vSeed;
in float vAlpha;
in float vSpin;

uniform vec3 uLamp;       // lamp position: x, y in css px, z = height in css px
uniform float uGlobal;    // layer fade
uniform vec3 uBack;       // backdrop colour (what the rim reflects)

out vec4 outColor;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec2 p = vUv;
  float d = length(p);
  float edge = mix(0.018, 0.5, vBlur);   // soft edge grows with defocus
  float r = 1.0;

  if (vKind > 0.5) {
    // crumb: a lumpy outline, rotated by its spin
    float a = atan(p.y, p.x) + vSpin;
    r = 1.0 + 0.16 * sin(3.0 * a + vSeed * 6.0) + 0.09 * sin(5.0 * a + vSeed * 11.0) + 0.05 * sin(9.0 * a + vSeed * 3.0);
  }

  float cover = 1.0 - smoothstep(r - edge, r + edge * 0.6, d);
  if (cover <= 0.001) discard;

  float q = clamp(d / r, 0.0, 1.0);
  float z = sqrt(max(0.0, 1.0 - q * q));
  vec3 n = normalize(vec3(p.x / r, -p.y / r, z));

  // light comes from the lamp, per pearl, so each glint faces the cursor
  vec3 toLamp = vec3(uLamp.x - vCenter.x, -(uLamp.y - vCenter.y), uLamp.z);
  vec3 L = normalize(toLamp);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float ndl = max(dot(n, L), 0.0);
  float ndh = max(dot(n, H), 0.0);
  float fres = pow(1.0 - z, 3.0);

  vec3 col;
  if (vKind < 0.5) {
    // tapioca: near-black brown, translucent core, lacquer gloss
    vec3 base = vec3(0.075, 0.038, 0.022);
    vec3 core = vec3(0.36, 0.17, 0.07);
    // light entering the far side glows back out through the body
    float through = pow(max(dot(n, -L) * 0.5 + 0.5, 0.0), 3.0) * (1.0 - z * 0.6);
    col = base + core * (0.18 * ndl + 0.55 * through * 0.35);
    float sharp = mix(1.0, 0.18, vBlur);
    float spec = pow(ndh, mix(140.0, 18.0, vBlur)) * 1.9 * sharp + pow(ndh, 14.0) * 0.12;
    col += vec3(1.0, 0.96, 0.9) * spec;
    col += uBack * fres * 0.42;
    // a second, softer window reflection opposite the lamp keeps pearls round
    vec3 L2 = normalize(vec3(-L.x * 0.6, -L.y * 0.6 - 0.4, 0.8));
    col += vec3(0.95, 0.85, 0.72) * pow(max(dot(n, normalize(L2 + V)), 0.0), 40.0) * 0.18 * sharp;
  } else {
    // crumb: toasted sugar crust, matte
    vec3 base = mix(vec3(0.79, 0.56, 0.31), vec3(0.62, 0.38, 0.18), hash(vSeed * 7.0));
    float grain = hash(floor((p.x + 3.0) * 7.0) + floor((p.y + 3.0) * 7.0) * 13.0 + vSeed * 91.0);
    col = base * (0.55 + 0.55 * ndl) * (0.9 + 0.2 * grain);
    col += vec3(1.0, 0.92, 0.8) * pow(ndh, 10.0) * 0.12;
  }

  // defocus flattens contrast toward the average tone
  col = mix(col, col * 0.75 + uBack * 0.08, vBlur * 0.35);

  float a = cover * vAlpha * uGlobal;
  outColor = vec4(col * a, a);   // premultiplied
}
`;
