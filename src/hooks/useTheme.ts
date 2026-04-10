import { useState, useEffect, useCallback } from 'react';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    const transitionDocument = document as ViewTransitionDocument;
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    // Check if View Transition API is supported and motion is OK
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced && transitionDocument.startViewTransition && x !== undefined && y !== undefined) {
      // Calculate the max radius needed to cover the entire screen
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      // Set CSS custom properties for the animation origin
      document.documentElement.style.setProperty('--theme-x', `${x}px`);
      document.documentElement.style.setProperty('--theme-y', `${y}px`);
      document.documentElement.style.setProperty('--theme-radius', `${maxRadius}px`);

      transitionDocument.startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  }, [theme]);

  return { theme, toggleTheme };
};

export default useTheme;
