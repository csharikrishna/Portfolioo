import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { portfolio as portfolioData } from '@/data/portfolio';

const Contact = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { meta } = portfolioData;
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(meta.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      window.prompt('Copy this email:', meta.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errs: Record<string, string> = {};
    if (!formState.name.trim()) errs.name = 'Name is required';
    if (!formState.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) errs.email = 'Valid email is required';
    if (!formState.message.trim()) errs.message = 'Message is required';
    if (formState.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      // Send data to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          name: formState.name,
          email: formState.email,
          message: formState.message,
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message. Please try again.');
      }

      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      setCharCount(0);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = meta.name.split(' ').pop();

  return (
    <section
      id="contact"
      ref={ref}
      className="py-24 pb-32 md:pb-24 content-section"
      role="region"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          09 —
        </span>
        <h2
          id="contact-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Contact
        </h2>

        {submitted ? (
          <div className="stagger-child max-w-lg">
            <div className="flex items-center gap-2 mb-3 text-accent-primary">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span className="font-mono-label text-[11px] uppercase tracking-[0.12em]">Sent Successfully</span>
            </div>
            <p className="font-display text-text-primary text-[22px] mb-3">
              Message received. I'll get back to you soon. — {firstName}
            </p>
            <p className="font-mono-body text-[13px] text-text-muted mb-6">
              I typically reply within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="font-mono-label text-xs uppercase tracking-[0.12em] text-accent-primary hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Left - Contact details */}
            <div className="space-y-6 stagger-child">
              <div>
                <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-1">
                  Email
                </span>
                <button onClick={copyEmail} className="font-mono-body text-text-primary text-sm hover:text-accent-primary transition-colors">
                  {copied ? '✓ Copied!' : meta.email}
                </button>
              </div>
              <div>
                <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-1">
                  LinkedIn
                </span>
                <a href={meta.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono-body text-text-primary text-sm hover:text-accent-alt transition-colors">
                  {meta.linkedin.replace('https://', '')}
                </a>
              </div>
              <div>
                <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-1">
                  GitHub
                </span>
                <a href={meta.github} target="_blank" rel="noopener noreferrer" className="font-mono-body text-text-primary text-sm hover:text-accent-alt transition-colors">
                  {meta.github.replace('https://', '')}
                </a>
              </div>
              <div className="project-card-glass p-4">
                <p className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-accent-primary mb-2">
                  Response Promise
                </p>
                <p className="font-mono-body text-[13px] text-text-secondary leading-[1.7]">
                  Every message is read manually. Typical response within 24 hours on weekdays.
                </p>
              </div>
            </div>

            {/* Right - Form */}
            <form onSubmit={handleSubmit} className="space-y-6 stagger-child" noValidate>
              {(['name', 'email'] as const).map((field) => (
                <div key={field} className="relative">
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder=" "
                    value={formState[field]}
                    onChange={(e) => {
                      setFormState((s) => ({ ...s, [field]: e.target.value }));
                      setErrors((er) => ({ ...er, [field]: '' }));
                    }}
                    className="peer w-full font-mono-body text-[13px] text-text-primary bg-bg-inset border border-border-color px-4 py-3 placeholder:text-text-muted focus:outline-none floating-input focus:border-accent-primary"
                    style={{ borderColor: errors[field] ? 'hsl(var(--accent-primary))' : undefined }}
                    aria-invalid={!!errors[field]}
                    aria-describedby={errors[field] ? `${field}-error` : undefined}
                  />
                  <label className={`absolute left-4 top-3.5 font-mono-label text-[13px] text-text-muted pointer-events-none floating-label peer-focus:floating-label-active ${formState[field] ? 'floating-label-active' : ''}`}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {errors[field] && (
                    <span id={`${field}-error`} className="font-mono-label text-[11px] text-accent-primary mt-1 block animate-slideDown" role="alert">
                      {errors[field]}
                    </span>
                  )}
                </div>
              ))}
              <div className="relative">
                <textarea
                  placeholder=" "
                  rows={5}
                  value={formState.message}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, message: e.target.value }));
                    setErrors((er) => ({ ...er, message: '' }));
                    setCharCount(e.target.value.length);
                  }}
                  className="peer w-full font-mono-body text-[13px] text-text-primary bg-bg-inset border border-border-color px-4 py-3 placeholder:text-text-muted focus:outline-none resize-none floating-input focus:border-accent-primary"
                  style={{ borderColor: errors.message ? 'hsl(var(--accent-primary))' : undefined }}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                <label className={`absolute left-4 top-3.5 font-mono-label text-[13px] text-text-muted pointer-events-none floating-label peer-focus:floating-label-active ${formState.message ? 'floating-label-active' : ''}`}>
                  Message
                </label>
                {/* Character counter */}
                <span className="absolute right-3 bottom-3 font-mono-label text-[10px] text-text-muted">
                  {charCount > 0 && `${charCount} chars`}
                </span>
                {errors.message && (
                  <span id="message-error" className="font-mono-label text-[11px] text-accent-primary mt-1 block animate-slideDown" role="alert">
                    {errors.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="font-mono-label text-xs uppercase tracking-[0.12em] bg-accent-primary text-bg-base px-8 hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: '48px', boxShadow: submitting ? 'none' : '0 4px 16px hsl(var(--accent-primary) / 0.2)' }}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
              <p className="font-mono-body text-[12px] text-text-muted" aria-live="polite">
                By sending this form, you agree to be contacted back by email.
              </p>
              {submitError && (
                <div className="flex items-start gap-2 text-accent-primary" role="alert">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="font-mono-body text-[12px]">{submitError}</p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
