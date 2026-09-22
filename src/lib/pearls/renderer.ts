import { FRAG, VERT } from "./shaders";

/** One instance on screen. Positions and radius are in css px of the canvas. */
export type PearlSprite = {
  x: number;
  y: number;
  r: number;
  blur: number;
  kind: 0 | 1;
  seed: number;
  alpha: number;
  spin: number;
};

const STRIDE = 8; // floats per instance

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`pearl shader: ${log}`);
  }
  return s;
}

/**
 * A single canvas of pearls. The hero uses two: one behind the art and copy,
 * one in front of everything, so pearls can pass on both sides of the cup.
 */
export class PearlLayer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private inst: WebGLBuffer;
  private data: Float32Array;
  private uView: WebGLUniformLocation;
  private uLamp: WebGLUniformLocation;
  private uGlobal: WebGLUniformLocation;
  private uBack: WebGLUniformLocation;
  private w = 1;
  private h = 1;
  private dpr = 1;

  static supported() {
    try {
      const c = document.createElement("canvas");
      return !!c.getContext("webgl2");
    } catch {
      return false;
    }
  }

  constructor(private canvas: HTMLCanvasElement, capacity: number) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: "low-power" });
    if (!gl) throw new Error("webgl2 unavailable");
    this.gl = gl;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`pearl link: ${gl.getProgramInfoLog(prog)}`);
    this.prog = prog;

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    const quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.data = new Float32Array(capacity * STRIDE);
    this.inst = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, STRIDE * 4, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE * 4, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    this.uView = gl.getUniformLocation(prog, "uView")!;
    this.uLamp = gl.getUniformLocation(prog, "uLamp")!;
    this.uGlobal = gl.getUniformLocation(prog, "uGlobal")!;
    this.uBack = gl.getUniformLocation(prog, "uBack")!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }

  resize(w: number, h: number) {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }

  draw(sprites: PearlSprite[], lamp: { x: number; y: number; z: number }, fade: number) {
    const { gl } = this;
    const n = Math.min(sprites.length, this.data.length / STRIDE);
    for (let i = 0; i < n; i++) {
      const s = sprites[i];
      const o = i * STRIDE;
      this.data[o] = s.x;
      this.data[o + 1] = s.y;
      this.data[o + 2] = s.r;
      this.data[o + 3] = s.blur;
      this.data[o + 4] = s.kind;
      this.data[o + 5] = s.seed;
      this.data[o + 6] = s.alpha;
      this.data[o + 7] = s.spin;
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!n || fade <= 0.001) return;
    gl.useProgram(this.prog);
    gl.uniform2f(this.uView, this.w, this.h);
    gl.uniform3f(this.uLamp, lamp.x, lamp.y, lamp.z);
    gl.uniform1f(this.uGlobal, fade);
    gl.uniform3f(this.uBack, 0.96, 0.9, 0.84);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, n * STRIDE);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    gl.bindVertexArray(null);
  }

  destroy() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
