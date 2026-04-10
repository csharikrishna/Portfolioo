import { useEffect, RefObject } from 'react';

const useCardTilt = (ref: RefObject<HTMLElement>, maxTilt = 8) => {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = -y * maxTilt;
      const rotateY = x * maxTilt;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    };
    const onMouseLeave = () => {
      el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms ease';
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    };
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [ref, maxTilt]);
};

export default useCardTilt;
