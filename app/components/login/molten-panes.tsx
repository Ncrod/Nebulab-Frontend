"use client";

import { useEffect, useRef } from "react";

/* Login hero: a row of glass panes over a glow that rises from the bottom in brand black and white,
   each pane catching it at a different height as noise-shaped waves roll across and a swell
   wanders from side to side on a random path, or follows the pointer while it's over the panel.
   Our own full-screen fragment shader (plain WebGL, no three.js), inspired by getdesign.md's
   "Molten Panes". */

type Props = {
  colors?: [string, string, string];
  background?: string;
  /** 1 = default pace. */
  speed?: number;
  /** Target width of a pane in CSS px. The count is always whole, so panes stretch slightly to fill. */
  paneWidth?: number;
  /** Upper bound on the pane count (ultrawide screens). */
  maxPanes?: number;
};

// Module-level so the default array keeps its identity across renders (it's an effect dependency).
const MVP_COLORS: [string, string, string] = ["#262626", "#8c8c8c", "#e0e0e0"];

const vertexSource = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const fragmentSource = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uPanes;
  uniform vec3 uBackground;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  // xy = eased pointer position (0–1, origin bottom-left), z = how much the pointer is in control (0–1).
  uniform vec3 uPointer;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotate = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotate * p * 2.03;
      amplitude *= 0.42;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float t = uTime;

    float column = uv.x * uPanes;
    float index = floor(column);
    float across = fract(column);

    // Every pane looks at the liquid through its own slab of glass: the view inside a pane is
    // compressed toward its centre and nudged up or down, so the glow steps from pane to pane.
    float sampleX = (index + 0.5 + (across - 0.5) * 0.35) / uPanes;
    float y = uv.y + (hash(vec2(index, 7.0)) - 0.5) * 0.1;

    // How high the glow climbs in this column. The waves travel across the panes, but their shape
    // comes from noise rather than sines, so crests and troughs keep changing instead of repeating.
    float travelling = noise(vec2(sampleX * 3.2 - t * 0.55, t * 0.18)) - 0.5;
    float ripple = noise(vec2(sampleX * 7.5 + t * 0.4, t * 0.3 + 11.0)) - 0.5;
    // The slow drift is the difference between two points of the same field half a screen apart:
    // if the field rises everywhere at once the two cancel out, so the panes can never all be high
    // (or all low) together and there is always contrast across the row.
    float driftHere = fbm(vec2(sampleX * 2.4 - t * 0.1, t * 0.35));
    float driftAcross = fbm(vec2(sampleX * 2.4 - t * 0.1 + 1.2, t * 0.35));
    float shape = (driftHere - driftAcross) * 0.45 + travelling * 0.42 + ripple * 0.14;
    // Stretch the extremes so the highs read higher and the lows lower.
    shape = sign(shape) * pow(abs(shape) * 2.0, 0.8) * 0.5;
    float level = 0.38 + shape + (hash(vec2(index, 3.0)) - 0.5) * 0.06;

    // A swell that wanders across the panes on a random path, rising higher some passes than others.
    // While the pointer is over the panel it takes over: the swell follows it sideways and its
    // crest climbs (or drops) to the pointer's height. Leaving hands control back smoothly.
    float autoX = 0.5 + (fbm(vec2(t * 0.16, 3.7)) - 0.45) * 2.2;
    float swellX = mix(autoX, uPointer.x, uPointer.z);
    float swellHeight = 0.14 + 0.2 * fbm(vec2(t * 0.22, 9.1));
    float distance = (sampleX - swellX) * uResolution.x / uResolution.y;
    float pointerLift = clamp(uPointer.y + 0.06 - level, -0.12, 0.7);
    float lift = exp(-distance * distance / 0.035) * mix(swellHeight, pointerLift, uPointer.z);
    level += lift;

    float body = smoothstep(level + 0.22, level - 0.28, y);

    // Soft rising folds inside the glow, strongest near the bottom.
    float folds = fbm(vec2(sampleX * 4.0, y * 2.2 - t * 1.8));
    float heat = body * (0.4 + 0.5 * folds) + smoothstep(0.5, 0.0, uv.y) * 0.25 * body + lift * body * 0.8;
    float intensity = clamp(heat, 0.0, 1.0);

    // Near-black → deep purple → violet → magenta → lilac.
    vec3 lilac = mix(uColor3, vec3(1.0), 0.28);
    // Purple and violet hold most of the glow; magenta and lilac only toward the bottom.
    vec3 color = mix(uBackground, uColor1, smoothstep(0.0, 0.32, intensity));
    color = mix(color, uColor2, smoothstep(0.3, 0.66, intensity));
    color = mix(color, uColor3, smoothstep(0.64, 0.86, intensity));
    color = mix(color, lilac, smoothstep(0.84, 0.95, intensity));

    // Past the lilac the glow burns white, added on top like a plus-lighter blend so it reads as
    // light, not paint. Uses the unclamped heat, so only the hottest spots (a fold peaking, the
    // wandering swell) cross into it and the rest of the glow keeps its colour.
    float bloom = smoothstep(0.95, 1.4, heat);
    bloom *= bloom; // ease in, so the white fades up out of the lilac instead of starting at a line
    color += vec3(1.0) * bloom * 0.75;

    color = min(color, vec3(1.0));

    // Glass, no dark seams: each pane is a touch brighter on its left side, with a fine light
    // edge that stays faintly visible even over the black top.
    color *= 0.86 + 0.14 * smoothstep(1.0, 0.0, across);
    float edgeLine = smoothstep(0.04, 0.0, across);
    color += edgeLine * (0.025 + 0.12 * intensity);

    // Where the wandering swell is high, its base flares white. Added last, after the glass
    // shading, so it stays pure light (plus-lighter) instead of turning grey; it fades up from
    // the bottom so the brightest moment travels with the wave while the other panes stay calm.
    // Wider than the swell itself and kept low. Measured on the continuous x (not per pane) with
    // long, gentle falloffs, so it reads as a blurred glow instead of a white block.
    float glowDistance = (uv.x - swellX) * uResolution.x / uResolution.y;
    float spread = exp(-glowDistance * glowDistance / 0.34);
    float rise = smoothstep(0.32, 0.0, uv.y);
    float flare = spread * rise * rise * rise;
    color += vec3(1.0) * flare * 0.55;
    color = min(color, vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

export default function MoltenPanes({
  colors = MVP_COLORS,
  background = "#050505",
  speed = 1.1,
  // 12 panes across the 1390px hero of a 1920px-wide window, 17 on ultrawide.
  paneWidth = 116,
  maxPanes = 17,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    // One triangle that covers the whole viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = uniform("uResolution");
    const uTime = uniform("uTime");
    const uPointer = uniform("uPointer");
    const uPanes = uniform("uPanes");
    gl.uniform3fv(uniform("uBackground"), hexToRgb(background));
    gl.uniform3fv(uniform("uColor1"), hexToRgb(colors[0]));
    gl.uniform3fv(uniform("uColor2"), hexToRgb(colors[1]));
    gl.uniform3fv(uniform("uColor3"), hexToRgb(colors[2]));

    // The look is soft on purpose, so a capped pixel ratio costs nothing visually.
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      // Whole panes only: all of them share the width equally, none is cut at the edge.
      gl.uniform1f(uPanes, Math.min(maxPanes, Math.max(1, Math.round(canvas.clientWidth / paneWidth))));
    };
    // Resizing re-picks the pane count for the new width.
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pointer target in canvas space; the value sent to the shader eases toward it every frame.
    const target = { x: 0.5, y: 0.5, control: 0 };
    const pointer = { x: 0.5, y: 0.5, control: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (inside) {
        target.x = x;
        target.y = y;
      }
      target.control = inside ? 1 : 0;
    };
    const onPointerLeave = () => {
      target.control = 0;
    };
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    const start = performance.now();
    let last = start;
    let frame = 0;
    const draw = (now: number) => {
      // Frame-rate independent easing: drifts after the pointer, hands back control even slower.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const follow = 1 - Math.exp(-dt * 1.8);
      pointer.x += (target.x - pointer.x) * follow;
      pointer.y += (target.y - pointer.y) * follow;
      pointer.control += (target.control - pointer.control) * (1 - Math.exp(-dt * (target.control ? 2 : 0.9)));

      gl.uniform1f(uTime, ((now - start) / 1000) * 0.45 * speed + 12.0);
      gl.uniform3f(uPointer, pointer.x, pointer.y, pointer.control);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // requestAnimationFrame already pauses while the tab is hidden.
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [colors, background, speed, paneWidth, maxPanes]);

  return <canvas ref={canvasRef} aria-hidden style={{ display: "block", width: "100%", height: "100%" }} />;
}
