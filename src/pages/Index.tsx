import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Education from '@/components/sections/Education';
import Achievements from '@/components/sections/Achievements';
import Blog from '@/components/sections/Blog';
import FAQ from '@/components/sections/FAQ';
import Contact from '@/components/sections/Contact';
import { portfolio as portfolioData } from '@/data/portfolio';
import { safeJsonLd } from '@/lib/safeJsonLd';

const SectionDivider = () => <div className="section-divider" />;

const Index = () => {
  const { meta, faq, projects, education } = portfolioData;

  // Build comprehensive Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CS Hari Krishna',
    url: meta.portfolio,
    email: meta.email,
    telephone: meta.phone,
    location: {
      '@type': 'Place',
      name: meta.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Andhra Pradesh',
        addressCountry: 'IN',
      },
    },
    sameAs: [meta.github, meta.linkedin],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Career Opportunities',
      email: meta.email,
      telephone: meta.phone,
    },
  };

  // Enhanced Person schema
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: meta.name,
    url: meta.portfolio,
    email: meta.email,
    telephone: meta.phone,
    jobTitle: meta.tagline,
    description:
      'Computer Science undergraduate specializing in AI systems and backend engineering, with experience building low-latency RAG pipelines, scalable APIs, and production deep learning systems.',
    worksFor: {
      '@type': 'Organization',
      name: 'Vellore Institute of Technology, AP',
    },
    sameAs: [meta.github, meta.linkedin],
    knows: [
      { '@type': 'Thing', name: 'AI Systems' },
      { '@type': 'Thing', name: 'Backend Engineering' },
      { '@type': 'Thing', name: 'RAG Pipelines' },
      { '@type': 'Thing', name: 'Deep Learning' },
      { '@type': 'Thing', name: 'System Design' },
    ],
  };

  // Education schema
  const educationSchema = education.map((edu) => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: edu.degree,
    educationalLevel: 'Bachelor',
    provider: {
      '@type': 'Organization',
      name: edu.institution,
    },
    knowsAbout: edu.coursework,
  }));

  // Project schemas
  const projectSchemas = projects.map((project) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    url: project.liveURL || project.githubURL || meta.portfolio,
    codeRepository: project.githubURL,
    author: {
      '@type': 'Person',
      name: meta.name,
    },
    keywords: project.techStack.join(', '),
  }));

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(organizationSchema),
        }}
      />

      {/* Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(personSchema),
        }}
      />

      {/* Education Schemas */}
      {educationSchema.map((schema, i) => (
        <script
          key={`edu-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(schema),
          }}
        />
      ))}

      {/* Project Schemas */}
      {projectSchemas.map((schema, i) => (
        <script
          key={`project-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(schema),
          }}
        />
      ))}

      {/* FAQ Schema */}
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            }),
          }}
        />
      )}

      <a href="#about" className="skip-to-content">
        Skip to content
      </a>

      <Nav />

      {/* Vertical sienna rule - desktop only */}
      <div
        className="hidden md:block fixed top-0 bottom-0 left-[32px] z-10 pointer-events-none"
        style={{
          width: '2px',
          background: 'hsl(var(--accent-primary))',
          opacity: 0.4,
        }}
      />

      <main>
        <Hero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Education />
        <SectionDivider />
        <Achievements />
        <SectionDivider />
        <Blog />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <Contact />
      </main>

      <Footer />
    </>
  );
};

export default Index;
