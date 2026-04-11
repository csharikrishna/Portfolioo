import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SKILL_CHIPS = ['AI', 'Deep Learning', 'NLP', 'Gen AI', 'ML', 'Backend'];

/* ─── Shaders ─────────────────────────────────────────────────────────────── */

// Optimized vertex shader — fewer trig calls, same organic feel
const vertexShader = `
uniform float uTime;
uniform float uAmplitudeMorph;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying float vDisplace;

void main() {
  vUv = uv;
  vec3 pos = position;

  float t = uTime;

  // Layer 1: big slow undulation
  float w1 = sin(pos.x * 1.8 + t * 0.9) * cos(pos.z * 1.6 + t * 0.7);
  // Layer 2: mid-frequency roll
  float w2 = sin(pos.y * 2.8 + t * 1.4) * sin(pos.x * 2.2 + t * 1.1);
  // Layer 3: surface ripple
  float w3 = cos(pos.z * 4.5 + t * 2.0) * sin(pos.y * 3.8 + t * 1.7);
  // Layer 4: diagonal tension
  float w4 = sin((pos.x * 1.1 + pos.z * 1.3) * 1.6 + t * 2.2);

  float amp = uAmplitudeMorph;
  float displacement =
    w1 * 0.11 * amp +
    w2 * 0.07 * amp +
    w3 * 0.04 * amp +
    w4 * 0.035 * amp;

  vDisplace = displacement;
  vec3 newPos = pos + normal * displacement;

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Liquid metal / iridescent fragment shader
const fragmentShader = `
uniform float uTime;
uniform vec3 uColorCore;
uniform vec3 uColorMid;
uniform vec3 uColorRim;
uniform vec3 uColorSpec;
uniform vec2 uPointer;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying float vDisplace;

// Simple noise helper
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // ── Iridescent base: angle-dependent hue shift ──────────────────
  float vdn = abs(dot(viewDir, n));              // 1 at front, 0 at edge
  float fresnel = pow(1.0 - vdn, 2.2);          // classic fresnel

  // Flowing stripe / flow lines (cheap, no texture)
  float flow = uTime * 0.07;
  float stripeA = sin((uv.x * 12.0 + uv.y * 8.0) + sin(uv.y * 18.0 + flow) + vDisplace * 22.0);
  float stripeB = cos((uv.y * 9.0  - uv.x * 6.0) + cos(uv.x * 14.0 - flow * 1.1));
  float flowMask = smoothstep(-0.3, 0.7, stripeA * 0.55 + stripeB * 0.45);

  // Core color mix — liquid metal palette
  vec3 col = mix(uColorCore, uColorMid, flowMask);

  // Iridescent rim — shifts between rim color and spec at glancing angles
  float iriShift = sin(fresnel * 6.28 + uTime * 0.15) * 0.5 + 0.5;
  vec3 iriColor = mix(uColorRim, uColorSpec, iriShift);
  col = mix(col, iriColor, fresnel * 0.75);

  // ── Specular highlight (Blinn-Phong style) ───────────────────────
  vec3 lightDir = normalize(vec3(1.8, 2.5, 1.2));
  vec3 halfVec  = normalize(lightDir + viewDir);
  float spec    = pow(max(0.0, dot(n, halfVec)), 64.0);
  col += uColorSpec * spec * 0.55;

  // Secondary fill light (cool, from left)
  vec3 fillDir  = normalize(vec3(-1.5, 0.5, 0.8));
  float fill    = pow(max(0.0, dot(n, fillDir)), 12.0);
  col += vec3(0.3, 0.55, 1.0) * fill * 0.18;

  // ── Pointer glow ─────────────────────────────────────────────────
  vec2 p = uv * 2.0 - 1.0;
  float glow = smoothstep(0.9, 0.0, length(p - uPointer));
  col += uColorSpec * glow * 0.28;
  col += vec3(1.0) * pow(glow, 4.0) * 0.12;

  // ── Diffuse base lighting ────────────────────────────────────────
  float diff = max(0.28, dot(n, lightDir));
  col *= (diff * 0.75 + 0.35);

  // ── Subtle micro-shimmer on surface ─────────────────────────────
  float shimmer = hash(uv * 180.0 + uTime * 0.5) * 0.025;
  col += shimmer;

  // ── Depth darkening at poles ─────────────────────────────────────
  float pole = smoothstep(0.0, 0.4, abs(vWorldNormal.y));
  col *= mix(1.0, 0.72, pole * 0.4);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/* ─── Blob-local moving constellation (blended with page) ───────────────── */

interface BlobParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

function BlobConstellation({ isDarkTheme }: { isDarkTheme: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<BlobParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const CONNECTION_DISTANCE = 44;
    const PARTICLE_COUNT = 14;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(parent.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(parent.clientHeight * dpr));
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const getBlobExclusion = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      return {
        cx: w * 0.5,
        cy: h * 0.55,
        rx: w * 0.25,
        ry: h * 0.34,
      };
    };

    const isInsideBlobExclusion = (x: number, y: number, padding = 0) => {
      const { cx, cy, rx, ry } = getBlobExclusion();
      const nx = (x - cx) / Math.max(1, rx + padding);
      const ny = (y - cy) / Math.max(1, ry + padding);
      return nx * nx + ny * ny <= 1;
    };

    const initParticles = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w * 0.5;
      const cy = h * 0.5;

      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        let x = cx;
        let y = cy;
        let angle = 0;

        for (let attempt = 0; attempt < 20; attempt += 1) {
          angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.65 + attempt * 0.21;
          const r = Math.min(w, h) * (0.34 + Math.random() * 0.24);
          x = cx + Math.cos(angle) * r;
          y = cy + Math.sin(angle) * r;

          if (!isInsideBlobExclusion(x, y, 10)) break;
        }

        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 0.7 + Math.random() * 1.2,
          alpha: 0.14 + Math.random() * 0.28,
        };
      });
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const lineColor = isDarkTheme ? '245,150,78' : '226,122,52';
      const dotColor = isDarkTheme ? '255,186,124' : '242,138,72';
      const particles = particlesRef.current;

      const minX = w * 0.08;
      const maxX = w * 0.92;
      const minY = h * 0.08;
      const maxY = h * 0.92;
      const { cx, cy, rx, ry } = getBlobExclusion();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (p.x < minX || p.x > maxX) p.vx *= -1;
        if (p.y < minY || p.y > maxY) p.vy *= -1;

        p.x = Math.max(minX, Math.min(maxX, p.x));
        p.y = Math.max(minY, Math.min(maxY, p.y));

        if (isInsideBlobExclusion(p.x, p.y, 4)) {
          const ang = Math.atan2(p.y - cy || 0.001, p.x - cx || 0.001);
          p.x = cx + Math.cos(ang) * (rx + 6);
          p.y = cy + Math.sin(ang) * (ry + 6);
          p.vx += Math.cos(ang) * 0.05;
          p.vy += Math.sin(ang) * 0.05;
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          if (
            isInsideBlobExclusion(particles[i].x, particles[i].y, 6) ||
            isInsideBlobExclusion(particles[j].x, particles[j].y, 6)
          ) {
            continue;
          }

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * (isDarkTheme ? 0.16 : 0.14);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        if (isInsideBlobExclusion(p.x, p.y, 3)) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${p.alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.58,
        mixBlendMode: 'screen',
      }}
    />
  );
}

/* ─── Chip label ─────────────────────────────────────────────────────────── */

interface ChipPos { x: number; y: number; }

function SkillChip({
  label, pos, index, visible, isDarkTheme,
}: {
  label: string; pos: ChipPos; index: number; visible: boolean; isDarkTheme: boolean;
}) {
  return (
    <>
      <style>{`
        @keyframes chipIn {
          0%   { opacity: 0; transform: translate(calc(-50% + ${pos.x * 0.1}px), calc(-50% + ${pos.y * 0.1}px)) scale(0.4); filter: blur(4px); }
          100% { opacity: 1; transform: translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1);   filter: blur(0); }
        }
        @keyframes chipIdle_${index} {
          0%, 100% { transform: translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) translateY(0px); }
          50%       { transform: translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) translateY(${-3 - (index % 3)}px); }
        }
      `}</style>
      <span
        style={{
          position:          'absolute',
          left:              '50%',
          top:               '50%',
          transform:          visible
            ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1)`
            : `translate(calc(-50% + ${pos.x * 0.1}px), calc(-50% + ${pos.y * 0.1}px)) scale(0.2)`,
          opacity:            visible ? 1 : 0,
          transition:         visible
            ? `transform 480ms cubic-bezier(0.16,1,0.36,1) ${index * 35}ms, opacity 300ms ease ${index * 25}ms, filter 300ms ease`
            : `transform 300ms ease, opacity 200ms ease`,
          filter:            visible ? 'blur(0px)' : 'blur(6px)',
          pointerEvents:    'none',
          // Chip design: pill with metallic border + glass fill
          padding:          '5px 12px',
          borderRadius:     '2px',
          border:           '1px solid rgba(200,225,255,0.22)',
          background:       isDarkTheme ? 'rgba(8,10,18,0.72)' : 'rgba(252,245,236,0.78)',
          backdropFilter:   'blur(8px)',
          boxShadow:        [
            '0 2px 12px rgba(0,0,0,0.4)',
            isDarkTheme ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.45)',
            isDarkTheme ? '0 0 14px rgba(140,200,255,0.06)' : '0 0 14px rgba(255,140,90,0.14)',
          ].join(', '),
          // Typography
          fontFamily:       "'DM Mono', 'Fira Code', monospace",
          fontSize:         '10px',
          fontWeight:       500,
          letterSpacing:    '0.14em',
          textTransform:    'uppercase',
          color:            isDarkTheme ? 'rgba(180,215,255,0.88)' : 'rgba(35,25,12,0.82)',
          whiteSpace:       'nowrap',
          // Idle float animation when visible
          animation:         visible
            ? `chipIdle_${index} ${3.2 + index * 0.4}s ${index * 0.3}s ease-in-out infinite`
            : undefined,
        }}
      >
        {/* Accent dot */}
        <span style={{
          display:       'inline-block',
          width:          '4px',
          height:         '4px',
          borderRadius:  '50%',
          background:    'rgba(140,200,255,0.8)',
          boxShadow:     isDarkTheme ? '0 0 5px rgba(140,200,255,0.9)' : '0 0 5px rgba(255,140,90,0.8)',
          marginRight:   '7px',
          verticalAlign: 'middle',
          marginBottom:  '1px',
        }} />
        {label}
      </span>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

const CHIP_POSITIONS: ChipPos[] = [
  { x: 0,   y: -58 },
  { x: 52,  y: -30 },
  { x: 58,  y: 18  },
  { x: 22,  y: 54  },
  { x: -28, y: 52  },
  { x: -56, y: 8   },
];

const HeroTextureBlob = () => {
  const mountRef    = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkTheme(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias:         true,
      alpha:             true,
      powerPreference:  'high-performance',
      precision:        'mediump',          // ← key perf win
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2)); // cap lower
    mountNode.appendChild(renderer.domElement);

    /* ── Scene ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 100);
    camera.position.set(2.0, 1.4, 3.0);
    camera.lookAt(0, 0, 0);

    /* ── Lights (minimal — shader handles most lighting) ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
    mainLight.position.set(2, 3, 2);
    scene.add(mainLight);

    /* ── Geometry — 96 segs is plenty for this morph ── */
    const geometry = new THREE.SphereGeometry(0.84, 96, 96);

    /* ── Uniforms ── */
    const uniforms = {
      uTime:          { value: 0 },
      uAmplitudeMorph:{ value: 1.0 },
      // Theme-driven palette values are applied after creation.
      uColorCore:  { value: new THREE.Color('#1a1d2e') },
      uColorMid:   { value: new THREE.Color('#3a3f55') },
      uColorRim:   { value: new THREE.Color('#a0c8ff') },
      uColorSpec:  { value: new THREE.Color('#ffd580') },
      uPointer:    { value: new THREE.Vector2(0.15, -0.08) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
      side:        THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const getThemeColor = (cssVar: string, fallback: string) => {
      const value = window.getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return value ? `hsl(${value})` : fallback;
    };

    const applyThemePalette = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const accentPrimary = getThemeColor('--accent-primary', '#ff7a29');
      const accentAlt = getThemeColor('--accent-alt', '#6bb4ff');
      const textPrimary = getThemeColor('--text-primary', '#1a1a1a');

      if (isDark) {
        uniforms.uColorCore.value.set('#0a0f1c');
        uniforms.uColorMid.value.set('#172845');
        uniforms.uColorRim.value.set(accentAlt);
        uniforms.uColorSpec.value.set(accentPrimary);
        mainLight.color.set('#cfe1ff');
        mainLight.intensity = 0.56;
      } else {
        uniforms.uColorCore.value.set('#f2e7d7');
        uniforms.uColorMid.value.set('#e7bf8f');
        uniforms.uColorRim.value.set(accentPrimary);
        uniforms.uColorSpec.value.set(textPrimary);
        mainLight.color.set('#ffd8b4');
        mainLight.intensity = 0.48;
      }
    };

    applyThemePalette();
    const themeObserver = new MutationObserver(() => applyThemePalette());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    /* ── Pointer interaction ── */
    const targetPtr = new THREE.Vector2(0.15, -0.08);
    const currPtr   = new THREE.Vector2(0.15, -0.08);
    let targetRotX = 0.12, targetRotY = 0.24;
    let currentRotX = 0.12, currentRotY = 0.24;
    let inertiaX = 0, inertiaY = 0;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let downX = 0, downY = 0, movedDist = 0;

    const getUV = (e: PointerEvent) => {
      const r = mountNode.getBoundingClientRect();
      return {
        x: THREE.MathUtils.clamp(((e.clientX - r.left) / r.width)  * 2 - 1, -1, 1),
        y: THREE.MathUtils.clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1),
      };
    };

    const onDown = (e: PointerEvent) => {
      isDragging = true; lastX = e.clientX; lastY = e.clientY;
      downX = e.clientX; downY = e.clientY; movedDist = 0;
      const uv = getUV(e); targetPtr.set(uv.x, uv.y);
      mountNode.style.cursor = 'grabbing';
      mountNode.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const uv = getUV(e); targetPtr.set(uv.x, uv.y);
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      movedDist += Math.abs(dx) + Math.abs(dy);
      targetRotY += dx * 0.008; targetRotX += dy * 0.006;
      targetRotX = THREE.MathUtils.clamp(targetRotX, -0.9, 0.9);
      inertiaY = dx * 0.0008; inertiaX = dy * 0.0007;
    };

    const onUp = (e: PointerEvent) => {
      const d = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
      isDragging = false;
      mountNode.style.cursor = 'grab';
      if (mountNode.hasPointerCapture(e.pointerId)) mountNode.releasePointerCapture(e.pointerId);
      if (d < 8 && movedDist < 18) setExpanded(p => !p);
      targetPtr.set(0.15, -0.08);
    };

    mountNode.style.cursor = 'grab';
    mountNode.addEventListener('pointerdown',   onDown);
    mountNode.addEventListener('pointermove',   onMove);
    mountNode.addEventListener('pointerup',     onUp);
    mountNode.addEventListener('pointercancel', onUp);
    mountNode.addEventListener('pointerleave',  onUp);

    /* ── Resize ── */
    const resize = () => {
      const w = mountNode.clientWidth, h = mountNode.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Animation loop — throttle uniform updates ── */
    let rafId: number | null = null;
    let lastFrame = 0;
    const FPS_CAP = 1000 / 55; // ~55 fps cap to ease GPU

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (now - lastFrame < FPS_CAP) return;
      lastFrame = now;

      const t = now * 0.001;
      uniforms.uTime.value = t;

      if (!isDragging) {
        targetRotY += 0.0018 + inertiaY;
        targetRotX += inertiaX;
        targetRotX = THREE.MathUtils.clamp(targetRotX, -0.55, 0.55);
      }
      inertiaX *= 0.93; inertiaY *= 0.93;

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currPtr.lerp(targetPtr, 0.10);

      mesh.rotation.x = currentRotX;
      mesh.rotation.y = currentRotY;
      uniforms.uPointer.value.copy(currPtr);

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener('resize', resize);
      themeObserver.disconnect();
      mountNode.removeEventListener('pointerdown',   onDown);
      mountNode.removeEventListener('pointermove',   onMove);
      mountNode.removeEventListener('pointerup',     onUp);
      mountNode.removeEventListener('pointercancel', onUp);
      mountNode.removeEventListener('pointerleave',  onUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Google Font for chips */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Blob-local constellation */}
      <BlobConstellation isDarkTheme={isDarkTheme} />

      {/* Three.js canvas */}
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%' }}
        aria-label="Interactive 3D liquid metal blob — click to reveal skills"
      />

      {/* Skill chips */}
      {SKILL_CHIPS.map((chip, i) => (
        <SkillChip
          key={chip}
          label={chip}
          pos={CHIP_POSITIONS[i % CHIP_POSITIONS.length]}
          index={i}
          visible={expanded}
          isDarkTheme={isDarkTheme}
        />
      ))}

      {/* Hint text */}
      <div
        style={{
          position:      'absolute',
          bottom:        '-28px',
          left:           '50%',
          transform:     'translateX(-50%)',
          fontFamily:   "'DM Mono', monospace",
          fontSize:      '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         isDarkTheme ? 'rgba(160,200,255,0.4)' : 'rgba(120,85,45,0.55)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          transition:    'opacity 0.4s ease',
          opacity:        expanded ? 0 : 0.7,
        }}
      >
        click to expand · drag to rotate
      </div>
    </div>
  );
};

export default HeroTextureBlob;
