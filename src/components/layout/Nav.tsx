import { useState, useEffect, useRef } from 'react';
import { Home, User, Code2, BookOpen, Mail, Sun, Moon } from 'lucide-react';
import useScrollSpy from '@/hooks/useScrollSpy';
import useTheme from '@/hooks/useTheme';
import { portfolio as portfolioData } from '@/data/portfolio';

const SECTIONS = ['hero', 'about', 'experience', 'projects', 'skills', 'education', 'achievements', 'blog', 'faq', 'contact'];

const NAV_LINKS = [
  { id: 'about', label: 'About', icon: User },
  { id: 'projects', label: 'Projects', icon: Code2 },
  { id: 'skills', label: 'Skills', icon: BookOpen },
  { id: 'education', label: 'Edu', icon: BookOpen },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const DESKTOP_NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
];

const Nav = () => {
  const activeSection = useScrollSpy(SECTIONS, 100);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const themeToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    toggleTheme(x, y);
  };

  return (
    <>
      {/* Desktop nav */}
      <nav
        className="fixed top-1 left-0 right-0 z-50 hidden md:block nav-entrance"
        style={{
          height: '64px',
          background: scrolled
            ? 'hsl(var(--glass-bg))'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'hsl(var(--glass-border))' : 'transparent'}`,
          boxShadow: scrolled ? 'inset 0 -1px 0 hsl(var(--glass-border))' : 'none',
          transition: 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
        }}
      >
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
          <button onClick={() => scrollTo('hero')} className="font-display text-text-primary text-xl hover:text-accent-primary transition-colors">
            {portfolioData.meta.name.split(' ').slice(-2).join(' ')}
          </button>
          <div className="flex items-center gap-8">
            {DESKTOP_NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="font-mono-label text-xs uppercase tracking-[0.12em] transition-colors relative group"
                style={{
                  color: activeSection === link.id
                    ? 'hsl(var(--accent-primary))'
                    : 'hsl(var(--text-muted))',
                }}
              >
                {link.label}
                {/* Active indicator line */}
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-primary transition-all duration-300"
                  style={{
                    transform: activeSection === link.id ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                  }}
                  aria-hidden="true"
                />
              </button>
            ))}
            <span className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-text-muted border border-border-color px-2 py-1 opacity-60">
              ⌘K
            </span>
            {/* Theme toggle */}
            <button
              ref={themeToggleRef}
              onClick={handleThemeToggle}
              aria-label="Toggle dark mode"
              className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-full hover:bg-bg-surface"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav — rebuilt with icons + centered layout */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-effect mobile-safe-bottom"
        style={{
          borderTop: '1px solid hsl(var(--glass-border))',
        }}
      >
        <div className="flex items-center justify-around px-2 h-16 w-full max-w-md mx-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-h-[44px] relative transition-colors"
                style={{
                  color: isActive
                    ? 'hsl(var(--accent-primary))'
                    : 'hsl(var(--text-muted))',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span
                  className="font-mono-label uppercase tracking-[0.06em]"
                  style={{ fontSize: '9px' }}
                >
                  {link.label}
                </span>
                {/* Active pill indicator */}
                <span
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent-primary transition-all duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateX(-50%) scaleX(${isActive ? 1 : 0})`,
                  }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
          <button
            onClick={handleThemeToggle}
            aria-label="Toggle dark mode"
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-h-[44px] text-text-muted transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-mono-label uppercase tracking-[0.06em]" style={{ fontSize: '9px' }}>
              Theme
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Nav;
