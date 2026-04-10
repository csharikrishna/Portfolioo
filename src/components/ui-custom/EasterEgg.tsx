import { useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { toast } from 'sonner';

// ── Palette ─────────────────────────────────────────────────────────────────
const PALETTE = [
  '#ff6b35', '#4a90d9', '#e63946', '#2a9d8f',
  '#f4a261', '#7b2cbf', '#06d6a0', '#ff006e',
  '#ffd60a', '#fb5607', '#8338ec', '#3a86ff',
];

export interface EasterEggHandle {
  trigger: (options?: { title?: string; description?: string }) => void;
}

// ── Types ────────────────────────────────────────────────────────────────────
type Shape = 'rect' | 'circle' | 'ribbon' | 'triangle' | 'star';
const SHAPES: Shape[] = ['rect', 'circle', 'ribbon', 'triangle', 'star'];

interface Particle {
  x: number;  y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  shape: Shape;
  rotation: number;  rotationV: number;
  wobble: number;    wobbleV: number;
  gravity: number;
  drag: number;
  opacity: number;
  fade: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function spawn(x: number, y: number, angle: number, speed: number): Particle {
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: rand(6, 16), // Slightly larger for better visibility
    color: pick(PALETTE),
    shape: pick(SHAPES),
    rotation: rand(0, Math.PI * 2),
    rotationV: rand(-0.06, 0.06), // Slower, more elegant tumbling
    wobble: rand(0, Math.PI * 2),
    wobbleV: rand(0.01, 0.03), // Lazy, organic swaying
    gravity: rand(0.03, 0.09), // Drastic reduction: floats rather than falls
    drag: rand(0.93, 0.98), // High air resistance creates natural hang-time
    opacity: 1,
    fade: rand(0.003, 0.008), // Fade out much slower
  };
}

function burst(
  out: Particle[],
  x: number, y: number, count: number,
  angleMid: number, spread: number,
  sMin: number, sMax: number,
) {
  for (let i = 0; i < count; i++) {
    out.push(spawn(x, y, angleMid + (Math.random() - 0.5) * spread, rand(sMin, sMax)));
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.opacity);
  ctx.fillStyle   = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  const s = p.size;

  switch (p.shape) {
    case 'rect':
      ctx.fillRect(-s / 2, -s * 0.35, s, s * 0.7);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ribbon':
      // Long thin streamer — most visually satisfying shape
      ctx.fillRect(-s, -s * 0.15, s * 2, s * 0.3);
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55);
      ctx.lineTo(s * 0.55, s * 0.45);
      ctx.lineTo(-s * 0.55, s * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s * 0.5 : s * 0.22;
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        i === 0
          ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
          : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ── Component ────────────────────────────────────────────────────────────────
const EasterEgg = forwardRef<EasterEggHandle>((_, ref) => {
  // BUG FIX #2 — ref instead of state: no re-renders, no stale closures
  const cooldownRef  = useRef(false);
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const rafRef       = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  // BUG FIX #3 — track every timer for cleanup
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cleanup = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (canvasRef.current) { canvasRef.current.remove(); canvasRef.current = null; }
    particlesRef.current = [];
  }, []);

  // BUG FIX #3 — cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const fireConfetti = useCallback((options?: { title?: string; description?: string }) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    timersRef.current.push(
      setTimeout(() => { cooldownRef.current = false; }, 8000)
    );

    // Trigger haptic vibration on mobile devices
    if ('vibrate' in navigator) {
      // Pop pattern: short burst, brief pause, longer blast
      navigator.vibrate([40, 50, 100]);
    }

    toast(options?.title || '🎉 You found the secret!', {
      description: options?.description || 'The magic of curiosity — keep exploring.',
      duration: 3000,
      action: {
        label: 'Close',
        onClick: () => {}
      }
    });

    // BUG FIX #4 — respect OS motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cleanup(); // tear down any prior run before starting fresh

    // ── Canvas setup ──────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;

    // ── Wave 1 — Massive organic burst from lower-center ──────────────────
    burst(particlesRef.current, W * 0.5, H * 0.9, 100, -Math.PI / 2, Math.PI * 0.6, 20, 50);
    
    // ── Wave 2 — Gentle side cannons after a slight delay ─────────────────
    timersRef.current.push(setTimeout(() => {
      if (!canvasRef.current) return;
      burst(particlesRef.current, W * 0.05, H * 0.7,  50, -Math.PI * 0.25, Math.PI * 0.4, 15, 35);
      burst(particlesRef.current, W * 0.95, H * 0.7,  50, -Math.PI * 0.75, Math.PI * 0.4, 15, 35);
    }, 200));

    // ── Wave 3 — Dreamy slow-falling cascade from top ─────────────────────
    timersRef.current.push(setTimeout(() => {
      if (!canvasRef.current) return;
      for (let i = 0; i < 8; i++) {
        timersRef.current.push(setTimeout(() => {
          if (!canvasRef.current) return;
          burst(
            particlesRef.current,
            rand(W * 0.1, W * 0.9), -20,
            18, Math.PI / 2, Math.PI * 0.2, 5, 12,
          );
        }, i * 180));
      }
    }, 500));

    // ── Soft ambient flash ────────────────────────────────────────────────
    const flash = document.createElement('div');
    flash.style.cssText = `
      position:fixed;inset:0;z-index:99998;pointer-events:none;
      background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
      opacity: 0;
      transition: opacity 1.2s cubic-bezier(0.22,1,0.36,1);
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });
    timersRef.current.push(setTimeout(() => { flash.style.opacity = '0'; }, 100));
    timersRef.current.push(setTimeout(() => flash.remove(), 1300));

    // ── RAF physics loop ──────────────────────────────────────────────────
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Cull off-screen and fully transparent particles
      particlesRef.current = particlesRef.current.filter(
        (p) => p.opacity > 0.02 && p.y < H + 80,
      );

      for (const p of particlesRef.current) {
        // Apply gravity + air drag
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        
        // Stronger horizontal wobble drift for the "leaf falling" effect
        p.wobble += p.wobbleV;
        p.vx += Math.sin(p.wobble) * 0.45;
        
        // Integrate position
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationV;
        p.opacity  -= p.fade;

        drawParticle(ctx, p);
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        cleanup();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    // Hard safety cleanup after 12s regardless
    timersRef.current.push(setTimeout(cleanup, 12000));

  }, [cleanup]);

  useImperativeHandle(ref, () => ({ trigger: fireConfetti }));

  return null;
});

EasterEgg.displayName = 'EasterEgg';
export default EasterEgg;