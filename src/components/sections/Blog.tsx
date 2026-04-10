import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

type Article = {
  title: string;
  excerpt: string;
  date: string;
  readingTime?: string;
  tags?: string[];
  url?: string;
};

const Blog = () => {
  const sectionRef = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const articles = (portfolioData.articles ?? []) as Article[];

  if (articles.length === 0) return null;

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="py-24 content-section"
      role="region"
      aria-labelledby="blog-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          08 —
        </span>
        <h2
          id="blog-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Blog & Articles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {articles.map((article, i: number) => {
            const hasUrl = article.url && article.url.trim() !== '';
            const Tag = hasUrl ? 'a' : 'div';
            const linkProps = hasUrl
              ? { href: article.url, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <Tag
                key={i}
                {...linkProps}
                className={`project-card-glass p-6 block group stagger-child ${hasUrl ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono-label text-[11px] text-text-muted">
                    {article.date}
                  </span>
                  {article.readingTime && (
                    <>
                      <span className="text-border-strong">·</span>
                      <span className="font-mono-label text-[11px] text-text-muted">
                        {article.readingTime}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="font-display text-text-primary text-[20px] mb-2 group-hover:text-accent-primary transition-colors">
                  {article.title}
                </h3>
                <p className="font-mono-body text-text-secondary text-[13px] leading-[1.75] mb-4">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.tags?.map((tag: string, j: number) => (
                    <span
                      key={j}
                      className="font-mono-label text-[10px] bg-bg-inset text-text-muted px-2 py-0.5"
                      style={{ border: '1px solid hsl(var(--border-color))' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {!hasUrl && (
                  <span className="font-mono-label text-[10px] text-text-muted mt-3 block">
                    Coming soon
                  </span>
                )}
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Blog;
