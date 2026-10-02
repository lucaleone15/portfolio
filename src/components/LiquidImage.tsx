import { CSSProperties, useEffect, useRef } from 'react';
import type { Mesh, Program, Renderer } from 'ogl';

/**
 * Project image that comes alive under the pointer: a WebGL layer (OGL) pushes the pixels
 * along the pointer's motion, adds a soft ripple and a velocity-driven RGB split.
 *
 * - The plain <img> is always rendered (prerender, SEO, no-WebGL, touch, reduced motion).
 * - The canvas is created lazily on first hover and only renders while active, so idle
 *   cards cost nothing. At rest the shader draws the image exactly like `object-cover`,
 *   which makes the swap between <img> and canvas invisible.
 * - OGL itself is downloaded on the first hover (shared by every card), not with the page.
 */

let oglModule: Promise<typeof import('ogl')> | null = null;
const loadOgl = () => (oglModule ??= import('ogl'));

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uMouse;        // pointer in uv space
  uniform vec2 uVelocity;     // smoothed pointer velocity (uv / frame)
  uniform float uHover;       // 0 → 1
  uniform float uTime;
  uniform float uPlaneAspect;
  uniform float uImageAspect;
  varying vec2 vUv;

  // Same framing as CSS object-fit: cover; object-position: center
  vec2 cover(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uPlaneAspect > uImageAspect) scale.y = uImageAspect / uPlaneAspect;
    else scale.x = uPlaneAspect / uImageAspect;
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    // Slight zoom on hover (like the old CSS scale)
    vec2 uv = (vUv - 0.5) / (1.0 + 0.035 * uHover) + 0.5;

    vec2 toPointer = vUv - uMouse;
    toPointer.x *= uPlaneAspect;
    float dist = length(toPointer);
    float influence = smoothstep(0.42, 0.0, dist) * uHover;

    // Pixels are dragged along the pointer's motion, strongest near the pointer
    uv -= uVelocity * influence * 2.2;
    // Soft ripple around the pointer
    uv += normalize(toPointer + 1e-5) * sin(dist * 30.0 - uTime * 3.0) * 0.0025 * influence;

    // RGB split grows with speed
    float split = min(length(uVelocity) * influence * 0.9, 0.012);
    vec2 offset = vec2(split, 0.0);
    float r = texture2D(tMap, cover(uv + offset)).r;
    vec4 base = texture2D(tMap, cover(uv));
    float b = texture2D(tMap, cover(uv - offset)).b;
    gl_FragColor = vec4(r, base.g, b, base.a);
  }
`;

interface LiquidImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export function LiquidImage({ src, alt, width, height, className = '', style }: LiquidImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    let raf = 0;
    let running = false;
    let hovered = false;
    let ready = false;

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    const velocity = { x: 0, y: 0 };
    let hover = 0;
    const start = performance.now();

    const resize = () => {
      if (!renderer || !program) return;
      const { width: w, height: h } = root.getBoundingClientRect();
      if (!w || !h) return;
      renderer.setSize(w, h);
      program.uniforms.uPlaneAspect.value = w / h;
    };

    const init = (ogl: typeof import('ogl')) => {
      if (renderer) return true;
      const { Renderer, Program, Mesh, Texture, Triangle } = ogl;
      try {
        renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true, antialias: false });
      } catch {
        return false; // no WebGL: the plain image stays
      }
      const gl = renderer.gl;
      gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 150ms ease-out;';
      host.appendChild(gl.canvas);

      const texture = new Texture(gl, { generateMipmaps: false });
      program = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: {
          tMap: { value: texture },
          uMouse: { value: [0.5, 0.5] },
          uVelocity: { value: [0, 0] },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uPlaneAspect: { value: 1 },
          uImageAspect: { value: 1 },
        },
      });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        texture.image = image;
        program!.uniforms.uImageAspect.value = image.naturalWidth / image.naturalHeight;
        ready = true;
        if (hovered) loop();
      };
      image.src = src;
      resize();
      return true;
    };

    const loop = () => {
      if (running || !ready) return;
      running = true;
      const frame = () => {
        if (!renderer || !program || !mesh) return;
        // Ease the pointer and decay the velocity: motion keeps a little momentum
        const nx = mouse.x + (target.x - mouse.x) * 0.18;
        const ny = mouse.y + (target.y - mouse.y) * 0.18;
        velocity.x = velocity.x * 0.85 + (nx - mouse.x) * 0.15;
        velocity.y = velocity.y * 0.85 + (ny - mouse.y) * 0.15;
        mouse.x = nx;
        mouse.y = ny;
        hover += ((hovered ? 1 : 0) - hover) * 0.12;

        const u = program.uniforms;
        u.uMouse.value = [mouse.x, mouse.y];
        u.uVelocity.value = [velocity.x * 6, velocity.y * 6];
        u.uHover.value = hover;
        u.uTime.value = (performance.now() - start) / 1000;
        renderer.render({ scene: mesh });

        const settled = !hovered && hover < 0.002 && Math.abs(velocity.x) + Math.abs(velocity.y) < 1e-5;
        if (settled) {
          // Back to rest: show the plain <img> again and stop rendering
          renderer.gl.canvas.style.opacity = '0';
          running = false;
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      renderer!.gl.canvas.style.opacity = '1';
      raf = requestAnimationFrame(frame);
    };

    const toUv = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / rect.width, y: 1 - (e.clientY - rect.top) / rect.height };
    };

    let disposed = false;
    const onEnter = (e: PointerEvent) => {
      hovered = true;
      const p = toUv(e);
      target.x = mouse.x = p.x;
      target.y = mouse.y = p.y;
      loadOgl()
        .then((ogl) => {
          if (disposed || !init(ogl)) return;
          if (hovered) loop();
        })
        .catch(() => {
          // Network/WebGL problem: the plain image simply stays
        });
    };
    const onMove = (e: PointerEvent) => {
      const p = toUv(e);
      target.x = p.x;
      target.y = p.y;
    };
    const onLeave = () => {
      hovered = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (renderer) {
        renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
        renderer.gl.canvas.remove();
      }
    };
  }, [src]);

  return (
    <div ref={rootRef} className={`relative w-full h-full ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover object-center"
      />
      <div ref={hostRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
