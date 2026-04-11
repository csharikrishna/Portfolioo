import { useEffect, useMemo, useState } from 'react';
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

type MediumFeedItem = {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  categories?: string[];
};

function normalizeMediumUsername(input: string) {
  const value = input.trim();
  if (!value) return '';

  // Accept any of these in .env: username, @username, medium.com/@username, full URL.
  const cleaned = value
    .replace(/^https?:\/\/(www\.)?medium\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\?.*$/, '')
    .replace(/\/$/, '');

  if (!cleaned) return '';

  // If using publication URL format (e.g. publication-name), keep it as-is.
  return cleaned;
}

const MEDIUM_USERNAME = normalizeMediumUsername(import.meta.env.VITE_MEDIUM_USERNAME ?? '');

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function formatMediumDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const Blog = () => {
  const sectionRef = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const fallbackArticles = useMemo(() => (portfolioData.articles ?? []) as Article[], []);
  const [mediumArticles, setMediumArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!MEDIUM_USERNAME) return;

    const controller = new AbortController();

    const fetchMediumArticles = async () => {
      try {
        const isPublication = MEDIUM_USERNAME.includes('/') || !/^[A-Za-z0-9_-]+$/.test(MEDIUM_USERNAME);
        const rssPath = isPublication ? MEDIUM_USERNAME : `@${MEDIUM_USERNAME}`;
        const rssUrl = `https://medium.com/feed/${rssPath}`;
        // Note: rss2json count parameter requires a paid API key, so keep it client-side.
        const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        const items = ((payload?.items ?? []) as MediumFeedItem[]).slice(0, 6);

        const mapped = items
          .map((item) => {
            const summary = stripHtml(item.description ?? '');
            return {
              title: item.title,
              excerpt: summary.slice(0, 190) + (summary.length > 190 ? '...' : ''),
              date: formatMediumDate(item.pubDate),
              readingTime: estimateReadTime(summary),
              tags: (item.categories ?? []).slice(0, 3),
              url: item.link,
            } satisfies Article;
          })
          .filter((article) => article.title && article.url);

        setMediumArticles(mapped);
      } catch {
        // Silent fallback to local article data when Medium feed fails.
      }
    };

    fetchMediumArticles();
    return () => controller.abort();
  }, []);

  const articles = mediumArticles.length > 0 ? mediumArticles : fallbackArticles;

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

        {MEDIUM_USERNAME && mediumArticles.length > 0 && (
          <p className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-text-muted -mt-8 mb-8 stagger-child">
            Synced from Medium
          </p>
        )}

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
