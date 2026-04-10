import { useEffect, useState } from 'react';

const useParallax = (speed: number) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Respect user preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number | null = null;
    let enabled = window.innerWidth >= 768;

    const update = () => {
      setOffset(window.scrollY * speed);
      rafId = null;
    };

    const onScroll = () => {
      if (!enabled) return;
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      enabled = window.innerWidth >= 768;
    };

    // Initial sync (important)
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [speed]);

  return offset;
};

export default useParallax;