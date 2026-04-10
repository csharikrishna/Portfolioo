import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center relative overflow-hidden grain-overlay"
      style={{ background: 'hsl(var(--bg-base))' }}
    >
      {/* Decorative background number */}
      <div
        className="absolute font-display select-none pointer-events-none text-center"
        aria-hidden="true"
        style={{
          fontSize: 'clamp(150px, 30vw, 400px)',
          lineHeight: 1,
          opacity: 0.04,
          color: 'hsl(var(--text-primary))',
        }}
      >
        404
      </div>

      <div className="text-center relative z-10 px-6 max-w-lg">
        {/* Animated 404 */}
        <h1
          className="font-display text-accent-primary mb-4"
          style={{ fontSize: 'clamp(64px, 15vw, 120px)', lineHeight: 1 }}
        >
          404
        </h1>

        <p className="font-display text-text-primary text-2xl mb-3">
          Page not found
        </p>

        <p className="font-mono-body text-text-muted text-[13px] leading-[1.75] mb-8">
          The page <code className="px-2 py-0.5 bg-bg-inset text-accent-primary text-[12px]">{location.pathname}</code> doesn't exist.
          It might have been moved or deleted.
        </p>

        {/* Navigation suggestions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="font-mono-label text-xs uppercase tracking-[0.12em] bg-accent-primary text-bg-base px-6 flex items-center gap-2 transition-colors hover:opacity-90"
            style={{ height: '44px' }}
          >
            <Home size={14} aria-hidden="true" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="font-mono-label text-xs uppercase tracking-[0.12em] border border-border-strong text-text-secondary px-6 flex items-center gap-2 transition-colors hover:text-text-primary hover:border-text-primary"
            style={{ height: '44px' }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 flex items-center justify-center gap-6">
          {['about', 'projects', 'contact'].map((id) => (
            <Link
              key={id}
              to={`/#${id}`}
              className="font-mono-body text-xs text-text-muted hover:text-accent-primary transition-colors capitalize"
            >
              {id}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
