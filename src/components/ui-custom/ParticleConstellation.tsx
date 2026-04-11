import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface AvoidZone {
  enabled: boolean;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const ParticleConstellation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const accentHSLRef = useRef<string>('');
  const avoidZoneRef = useRef<AvoidZone>({
    enabled: false,
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
  });

  useEffect(() => {
    // Bail out on mobile/touch or reduced motion
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const CONNECTION_DIST = 126;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

    const MOUSE_RADIUS = 200;
    const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

    const PARTICLE_COUNT = 100;

    // Cache accent color once
    const root = getComputedStyle(document.documentElement);
    accentHSLRef.current = root.getPropertyValue('--accent-primary').trim();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;

      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const shouldUseAvoidZone = w >= 1240;

      avoidZoneRef.current = shouldUseAvoidZone
        ? {
            enabled: true,
            cx: w * 0.83,
            cy: h * 0.56,
            rx: Math.max(120, w * 0.14),
            ry: Math.max(130, h * 0.23),
          }
        : {
            enabled: false,
            cx: 0,
            cy: 0,
            rx: 0,
            ry: 0,
          };
    };

    const isInsideAvoidZone = (x: number, y: number, padding = 0) => {
      const zone = avoidZoneRef.current;
      if (!zone.enabled) return false;

      const nx = (x - zone.cx) / Math.max(1, zone.rx + padding);
      const ny = (y - zone.cy) / Math.max(1, zone.ry + padding);
      return nx * nx + ny * ny <= 1;
    };

    const initParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
        let x = 0;
        let y = 0;

        for (let attempt = 0; attempt < 30; attempt += 1) {
          x = Math.random() * canvas.clientWidth;
          y = Math.random() * canvas.clientHeight;
          if (!isInsideAvoidZone(x, y, 10)) break;
        }

        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.25 + 0.45,
          opacity: Math.random() * 0.28 + 0.08,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      const particles = particlesRef.current;
      const accentHSL = accentHSLRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0 || p.x > canvas.clientWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.clientHeight) p.vy *= -1;

        p.x = Math.max(0, Math.min(canvas.clientWidth, p.x));
        p.y = Math.max(0, Math.min(canvas.clientHeight, p.y));

        if (isInsideAvoidZone(p.x, p.y, 6)) {
          const zone = avoidZoneRef.current;
          const angle = Math.atan2(p.y - zone.cy || 0.001, p.x - zone.cx || 0.001);
          p.x = zone.cx + Math.cos(angle) * (zone.rx + 8);
          p.y = zone.cy + Math.sin(angle) * (zone.ry + 8);
          p.vx += Math.cos(angle) * 0.06;
          p.vy += Math.sin(angle) * 0.06;
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          if (
            isInsideAvoidZone(particles[i].x, particles[i].y, 4) ||
            isInsideAvoidZone(particles[j].x, particles[j].y, 4)
          ) {
            continue;
          }

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < CONNECTION_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / CONNECTION_DIST) * 0.11;

            ctx.strokeStyle = `hsl(${accentHSL} / ${opacity})`;
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Mouse interaction
        const dmx = particles[i].x - mx;
        const dmy = particles[i].y - my;
        const mouseDistSq = dmx * dmx + dmy * dmy;

        if (mouseDistSq < MOUSE_RADIUS_SQ) {
          const mouseDist = Math.sqrt(mouseDistSq);
          const opacity = (1 - mouseDist / MOUSE_RADIUS) * 0.35;

          ctx.strokeStyle = `hsl(${accentHSL} / ${opacity})`;
          ctx.lineWidth = 0.8;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mx, my);
          ctx.stroke();

          if (mouseDist > 0.001) {
            const force = (1 - mouseDist / MOUSE_RADIUS) * 0.5;
            particles[i].x += (dmx / mouseDist) * force;
            particles[i].y += (dmy / mouseDist) * force;
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        if (isInsideAvoidZone(p.x, p.y, 3)) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${accentHSL} / ${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const handleResize = () => {
      resize();
      initParticles();
    };

    resize();
    initParticles();
    draw();

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Avoid rendering on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    />
  );
};

export default ParticleConstellation;
