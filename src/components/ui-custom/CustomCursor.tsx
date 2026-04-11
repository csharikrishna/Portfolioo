import { useEffect, useRef } from 'react';

type CursorState = {
  hovering: boolean;
  clicking: boolean;
  visible: boolean;
};

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
  '.cursor-pointer',
  '.project-card-glass',
  '.skill-pill',
  'input',
  'textarea',
  'select',
  'summary',
  'label',
].join(', ');

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const pointer = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  const dotScale = useRef(1);
  const ringScale = useRef(1);
  const dotTargetScale = useRef(1);
  const ringTargetScale = useRef(1);

  const state = useRef<CursorState>({ hovering: false, clicking: false, visible: false });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

    const getInteractiveHost = (target: EventTarget | null): HTMLElement | null => {
      const element = target instanceof Element ? target : null;
      if (!element) return null;

      const matched = element.closest(INTERACTIVE_SELECTOR);
      if (matched instanceof HTMLElement) return matched;

      let cursorProbe: Element | null = element;
      while (cursorProbe && cursorProbe !== document.body) {
        const cursor = window.getComputedStyle(cursorProbe).cursor;
        if (cursor === 'pointer') {
          return cursorProbe as HTMLElement;
        }
        cursorProbe = cursorProbe.parentElement;
      }

      return null;
    };

    const setHoverState = (nextHovering: boolean) => {
      if (state.current.hovering === nextHovering) return;
      state.current.hovering = nextHovering;

      ring.style.width = nextHovering ? '46px' : '34px';
      ring.style.height = nextHovering ? '46px' : '34px';
      ring.style.borderColor = `hsl(var(--accent-primary) / ${nextHovering ? 0.7 : 0.36})`;
      ring.style.background = nextHovering
        ? 'hsl(var(--accent-primary) / 0.11)'
        : 'hsl(var(--accent-primary) / 0.04)';
      ring.style.boxShadow = nextHovering
        ? '0 0 20px hsl(var(--accent-primary) / 0.22), 0 0 0 1px hsl(var(--accent-primary) / 0.16)'
        : '0 0 10px hsl(var(--accent-primary) / 0.12), 0 0 0 1px hsl(var(--accent-primary) / 0.1)';

      const nextDotScale = nextHovering ? 0.72 : 1;
      dotTargetScale.current = state.current.clicking ? nextDotScale * 0.84 : nextDotScale;
      ringTargetScale.current = state.current.clicking
        ? (nextHovering ? 1.2 : 0.92)
        : (nextHovering ? 1.34 : 1);
    };

    const setVisibleState = (nextVisible: boolean) => {
      if (state.current.visible === nextVisible) return;
      state.current.visible = nextVisible;
      dot.style.opacity = nextVisible ? '1' : '0';
      ring.style.opacity = nextVisible ? '1' : '0';
    };

    const setClickState = (nextClicking: boolean) => {
      if (state.current.clicking === nextClicking) return;
      state.current.clicking = nextClicking;

      const hoverScale = state.current.hovering ? 0.72 : 1;
      dotTargetScale.current = nextClicking ? hoverScale * 0.84 : hoverScale;
      ringTargetScale.current = nextClicking
        ? (state.current.hovering ? 1.2 : 0.92)
        : (state.current.hovering ? 1.34 : 1);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;

      setVisibleState(true);
      setHoverState(Boolean(getInteractiveHost(event.target)));
    };

    const handlePointerDown = (event: PointerEvent) => {
      setVisibleState(true);
      setHoverState(Boolean(getInteractiveHost(event.target)));
      setClickState(true);
    };

    const handlePointerUp = (event: PointerEvent) => {
      setHoverState(Boolean(getInteractiveHost(event.target)));
      setClickState(false);
    };

    const handlePointerLeave = () => {
      setVisibleState(false);
      setClickState(false);
    };

    const handlePointerEnter = () => {
      if (pointer.current.x < 0 || pointer.current.y < 0) return;
      setVisibleState(true);
    };

    const handleWindowBlur = () => {
      setVisibleState(false);
      setClickState(false);
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.documentElement.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('blur', handleWindowBlur);

    const styleEl = document.createElement('style');
    styleEl.id = 'custom-cursor-hide';
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    let rafId = 0;
    let lastHoverSampleAt = 0;

    const animate = (now: number) => {
      const fast = prefersReduced ? 1 : 0.45;
      const smooth = prefersReduced ? 1 : 0.16;
      const scaleLerp = prefersReduced ? 1 : 0.22;

      dotPos.current.x = lerp(dotPos.current.x, pointer.current.x, fast);
      dotPos.current.y = lerp(dotPos.current.y, pointer.current.y, fast);
      ringPos.current.x = lerp(ringPos.current.x, pointer.current.x, smooth);
      ringPos.current.y = lerp(ringPos.current.y, pointer.current.y, smooth);

      dotScale.current = lerp(dotScale.current, dotTargetScale.current, scaleLerp);
      ringScale.current = lerp(ringScale.current, ringTargetScale.current, scaleLerp);

      dot.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%) scale(${dotScale.current.toFixed(4)})`;
      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) scale(${ringScale.current.toFixed(4)})`;

      if (state.current.visible && now - lastHoverSampleAt > 90) {
        lastHoverSampleAt = now;
        const target = document.elementFromPoint(pointer.current.x, pointer.current.y);
        setHoverState(Boolean(getInteractiveHost(target)));
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.documentElement.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('blur', handleWindowBlur);
      cancelAnimationFrame(rafId);
      document.getElementById('custom-cursor-hide')?.remove();
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'hsl(var(--accent-primary))',
          boxShadow: '0 0 8px hsl(var(--accent-primary) / 0.45)',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          transition: 'opacity 180ms ease',
          willChange: 'transform',
        }}
      />

      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1.5px solid hsl(var(--accent-primary) / 0.36)',
          background: 'hsl(var(--accent-primary) / 0.04)',
          boxShadow: '0 0 10px hsl(var(--accent-primary) / 0.12), 0 0 0 1px hsl(var(--accent-primary) / 0.1)',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transition: [
            'width 220ms cubic-bezier(0.22,1,0.36,1)',
            'height 220ms cubic-bezier(0.22,1,0.36,1)',
            'border-color 220ms ease',
            'background 220ms ease',
            'box-shadow 220ms ease',
            'opacity 180ms ease',
          ].join(', '),
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
