import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Code2, BookOpen, Mail, Sun, Moon } from 'lucide-react';
import useScrollSpy from '@/hooks/useScrollSpy';
import useTheme from '@/hooks/useTheme';
import { portfolio as portfolioData } from '@/data/portfolio';

const SECTIONS = [
  'hero', 'about', 'experience', 'projects', 'skills',
  'education', 'achievements', 'blog', 'faq', 'contact',
];

// Renamed from NAV_LINKS for clarity — all 5 links shown (Contact was being cut off)
const MOBILE_NAV_LINKS = [
  { id: 'about',    label: 'About',    icon: User },
  { id: 'projects', label: 'Projects', icon: Code2 },
  { id: 'skills',   label: 'Skills',   icon: BookOpen },
  { id: 'education',label: 'Edu',      icon: BookOpen },
  { id: 'contact',  label: 'Contact',  icon: Mail },
];

const DESKTOP_NAV_LINKS = [
  { id: 'about',     label: 'About' },
  { id: 'projects',  label: 'Projects' },
  { id: 'skills',    label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'blog',      label: 'Blog' },
  { id: 'contact',   label: 'Contact' },
];

const NAV_IDLE_TIMEOUT_MS = 2600;

const Nav = () => {
  const activeSection = useScrollSpy(SECTIONS, 140);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled]           = useState(false);
  const [isMobile, setIsMobile]           = useState(false); // FIX 1: Start false (SSR-safe)
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [isUserActive, setIsUserActive]   = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef     = useRef(false);   // FIX 2: Use ref, not closure variable
  const idleTimerRef   = useRef<number | null>(null);

  // FIX 3: SSR-safe mobile detection, no deprecated addListener
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 920px), (pointer: coarse)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Desktop scroll-shadow detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide navbar after a short idle period; show again when user moves/interacts
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsUserActive(true);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(
        () => setIsUserActive(false),
        NAV_IDLE_TIMEOUT_MS
      );
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'pointermove',
      'scroll',
      'touchstart',
      'keydown',
    ];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Mobile nav hide/show on scroll
  useEffect(() => {
    if (!isMobile) {
      setMobileNavVisible(true);
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const currentY   = window.scrollY;
        const delta      = currentY - lastScrollYRef.current;
        const nearTop    = currentY < 80;
        const nearBottom =
          window.innerHeight + currentY >=
          document.documentElement.scrollHeight - 260;

        // Always show nav near top or bottom; hide only on significant scroll-down
        if (nearTop || nearBottom) setMobileNavVisible(true);
        else if (delta < -8)       setMobileNavVisible(true);
        else if (delta > 12)       setMobileNavVisible(false);

        lastScrollYRef.current = currentY;
        tickingRef.current     = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Sync initial state immediately
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  // FIX 4: Different offset for mobile (nav is at BOTTOM, no top offset needed)
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = isMobile ? 20 : -80;
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [isMobile]);

  const handleThemeToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [toggleTheme]);

  const showDesktopNav = isUserActive;
  const showMobileNav  = isUserActive && mobileNavVisible;

  return (
    <>
      {/* ===== DESKTOP NAV ===== */}
      {!isMobile && (
        <nav
          className="fixed top-0 left-0 right-0 z-[120] transition-all duration-300" // FIX 5: top-0 not top-1
          style={{
            height: '64px',
            pointerEvents: showDesktopNav ? 'auto' : 'none',
            opacity: showDesktopNav ? 1 : 0,
            transform: showDesktopNav ? 'translateY(0)' : 'translateY(-110%)',
            background: 'linear-gradient(120deg, hsl(var(--glass-bg) / 0.92), hsl(var(--glass-bg) / 0.7))',
            backdropFilter: 'blur(18px) saturate(140%)',
            WebkitBackdropFilter: 'blur(18px) saturate(140%)', // Safari support
            borderBottom: `1px solid ${scrolled ? 'hsl(var(--glass-border))' : 'hsl(var(--glass-border) / 0.8)'}`,
            boxShadow: scrolled
              ? '0 10px 30px rgba(15, 23, 42, 0.18)'
              : '0 4px 16px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
            <button
              onClick={() => scrollTo('hero')}
              className="text-lg font-semibold hover:opacity-80 transition-opacity"
            >
              {portfolioData.meta.name.split(' ').slice(-2).join(' ')}
            </button>

            <div className="flex items-center gap-6">
              {DESKTOP_NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-sm transition-colors duration-200"
                  style={{
                    color: activeSection === link.id
                      ? 'hsl(var(--accent-primary))'
                      : 'hsl(var(--text-muted))',
                  }}
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* ===== MOBILE NAV ===== */}
      {isMobile && (
        <nav
          className="fixed z-[120]"
          style={{
            left:   '12px',
            right:  '12px',
            bottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 12px))',
            borderRadius: '16px',
            backdropFilter:       'blur(20px) saturate(145%)',
            WebkitBackdropFilter: 'blur(20px) saturate(145%)',
            background:  'linear-gradient(135deg, hsl(var(--glass-bg) / 0.95), hsl(var(--glass-bg) / 0.78))',
            border:      '1px solid hsl(var(--glass-border))',
            boxShadow:   '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
            pointerEvents: showMobileNav ? 'auto' : 'none',
            opacity:       showMobileNav ? 1 : 0,
            transform:     showMobileNav
              ? 'translateY(0)'
              : 'translateY(calc(100% + 24px))',
            transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease',
          }}
        >
          <div className="flex items-center justify-between px-1 py-2">
            {/* FIX 7: Show all 5 links — Contact was getting cut off with slice(0,4) */}
            {MOBILE_NAV_LINKS.map((link) => {
              const Icon     = link.icon;
              const isActive = activeSection === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all duration-200"
                  style={{
                    color: isActive
                      ? 'hsl(var(--accent-primary))'
                      : 'hsl(var(--text-muted))',
                    background: isActive
                      ? 'hsl(var(--accent-primary) / 0.12)'
                      : 'transparent',
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] mt-0.5 uppercase tracking-wide font-medium">
                    {link.label}
                  </span>
                </button>
              );
            })}

            {/* Theme toggle replaces the old 5th slot — now a 6th slot */}
            <button
              onClick={handleThemeToggle}
              className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-colors duration-200"
              style={{ color: 'hsl(var(--text-muted))' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-[10px] mt-0.5 uppercase tracking-wide font-medium">
                Theme
              </span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Nav;
