import { useEffect, useRef } from 'react';

// All mutable cursor state lives here — no React re-renders
type CursorState = {
  hovering: boolean;
  clicking: boolean;
  visible: boolean;
};

const CustomCursor = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: -100, y: -100 });
  const ring    = useRef({ x: -100, y: -100 });
  const scale   = useRef(1); // lerped separately to avoid transform conflict
  const cur     = useRef<CursorState>({ hovering: false, clicking: false, visible: false });

  useEffect(() => {
    // Guard: touch devices and reduced-motion
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dot  = dotRef.current;
    const ring = ringRef.current; // shadow the outer ref here for local brevity
    if (!dot || !ring) return;

    // ── DOM updaters (called directly, no setState) ──────────────────────────

    const syncDot = () => {
      const { hovering, visible } = cur.current;
      dot.style.opacity = visible ? '1' : '0';
      dot.style.width   = hovering ? '0px' : '8px';
      dot.style.height  = hovering ? '0px' : '8px';
    };

    const syncRing = () => {
      const { hovering, visible } = cur.current;
      ring.style.opacity     = visible ? '1' : '0';
      ring.style.width       = hovering ? '56px' : '36px';
      ring.style.height      = hovering ? '56px' : '36px';
      ring.style.borderColor = `hsl(var(--accent-primary) / ${hovering ? 0.6 : 0.35})`;
      ring.style.background  = hovering ? 'hsl(var(--accent-primary) / 0.08)' : 'transparent';
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const isInteractive = (el: EventTarget | null): boolean =>
      !!(el as HTMLElement | null)?.closest(
        'a, button, [role="button"], .project-card-glass, .skill-pill, input, textarea, select'
      );

    // ── Event handlers ────────────────────────────────────────────────────────

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Dot follows cursor instantly (no lerp)
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      if (!cur.current.visible) {
        cur.current.visible = true;
        syncDot();
        syncRing();
      }
    };

    const onDown = () => { cur.current.clicking = true;  };
    const onUp   = () => { cur.current.clicking = false; };

    const onOver = (e: MouseEvent) => {
      if (!cur.current.hovering && isInteractive(e.target)) {
        cur.current.hovering = true;
        syncDot();
        syncRing();
      }
    };

    const onOut = (e: MouseEvent) => {
      // Only clear hover when LEAVING the interactive zone entirely,
      // not when crossing into a child element within it.
      if (cur.current.hovering && isInteractive(e.target) && !isInteractive(e.relatedTarget)) {
        cur.current.hovering = false;
        syncDot();
        syncRing();
      }
    };

    const onLeave = () => {
      cur.current.visible = false;
      syncDot();
      syncRing();
    };

    // ── Scroll pause ──────────────────────────────────────────────────────────

    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
    };

    // ── Event wiring ──────────────────────────────────────────────────────────

    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mousedown',  onDown);
    document.addEventListener('mouseup',    onUp);
    document.addEventListener('mouseover',  onOver);
    document.addEventListener('mouseout',   onOut);
    // mouseenter doesn't bubble — use documentElement for the leave/enter pair
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── RAF loop ──────────────────────────────────────────────────────────────

    let raf: number;
    const mousePos  = mouse; // alias to avoid shadowing
    const ringPos   = { x: -100, y: -100 };

    const loop = () => {
      if (!isScrolling) {
        // Lerp ring position
        ringPos.x = lerp(ringPos.x, mousePos.current.x, prefersReduced ? 1 : 0.15);
        ringPos.y = lerp(ringPos.y, mousePos.current.y, prefersReduced ? 1 : 0.15);

        // Lerp scale — resolves the clicking transform conflict
        const targetScale = cur.current.clicking ? 0.85 : 1;
        scale.current = lerp(scale.current, targetScale, 0.2);

        ring.style.transform =
          `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${scale.current.toFixed(4)})`;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    // ── Hide default cursor ───────────────────────────────────────────────────

    document.documentElement.style.cursor = 'none';
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-cursor-hide';
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    // ── Cleanup ───────────────────────────────────────────────────────────────

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = '';
      document.getElementById('custom-cursor-hide')?.remove();
    };
  }, []); // ← stable: no deps, no re-registration

  // SSR guard — runs only on client
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Dot — initial state matches ref defaults (invisible, 8px) */}
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: 'hsl(var(--accent-primary))',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0, // syncDot() reveals it on first mousemove
          transition: 'width 250ms ease, height 250ms ease, opacity 200ms ease',
          willChange: 'transform',
        }}
      />
      {/* Ring — transform driven by RAF, scale composed inline */}
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '36px', height: '36px',
          borderRadius: '50%',
          border: '1.5px solid hsl(var(--accent-primary) / 0.35)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          // transform is NOT listed here — it's driven entirely by RAF
          transition: [
            'width 300ms cubic-bezier(0.22,1,0.36,1)',
            'height 300ms cubic-bezier(0.22,1,0.36,1)',
            'border-color 300ms ease',
            'background 300ms ease',
            'opacity 200ms ease',
          ].join(', '),
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;