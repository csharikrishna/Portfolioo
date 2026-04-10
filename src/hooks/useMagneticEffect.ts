import { useEffect, RefObject } from 'react';

const useMagneticEffect = (
  ref: RefObject<HTMLElement>,
  strength = 0.3
) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable for touch devices & reduced motion users
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rect = el.getBoundingClientRect();
    let rafId: number | null = null;

    const padding = 40;

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    const applyTransform = (x: number, y: number) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = Math.max(-12, Math.min(12, (x - centerX) * strength));
      const dy = Math.max(-8, Math.min(8, (y - centerY) * strength));

      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };

    const resetTransform = () => {
      el.style.transition =
        'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translate3d(0, 0, 0)';

      const timeout = setTimeout(() => {
        el.style.transition = '';
      }, 400);

      return () => clearTimeout(timeout);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const withinBounds =
          e.clientX > rect.left - padding &&
          e.clientX < rect.right + padding &&
          e.clientY > rect.top - padding &&
          e.clientY < rect.bottom + padding;

        if (withinBounds) {
          applyTransform(e.clientX, e.clientY);
        } else {
          resetTransform();
        }

        rafId = null;
      });
    };

    // Update rect on resize / scroll (important!)
    const onResizeOrScroll = () => updateRect();

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onResizeOrScroll, true);
    window.addEventListener('resize', onResizeOrScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onResizeOrScroll, true);
      window.removeEventListener('resize', onResizeOrScroll);
    };
  }, [ref, strength]);
};

export default useMagneticEffect;