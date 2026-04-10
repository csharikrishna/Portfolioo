import useSectionObserver from '@/hooks/useSectionObserver';
import useParallax from '@/hooks/useParallax';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { portfolio as portfolioData } from '@/data/portfolio';

// Skill proficiency levels (1-100)
const SKILL_PROFICIENCY: Record<string, number> = {
  // Languages
  Python: 95, Java: 80, JavaScript: 85, SQL: 90, HTML: 80, CSS: 75,
  // Frameworks
  'Node.js': 85, 'Express.js': 85, 'React.js': 80, Flask: 85,
  // Tools
  Docker: 80, Git: 90, GitHub: 90, Linux: 85, Postman: 75, Figma: 70, 'IBM WatsonX AI': 80,
  // Databases
  PostgreSQL: 90, MongoDB: 85, MySQL: 80, Supabase: 80, 'Neo4j': 90, Weaviate: 95, 'MongoDB Atlas': 85,
  // AI/ML
  'REST APIs': 90, Authentication: 85, 'System Design': 90,
  PyTorch: 90, TensorFlow: 85, RAG: 95, CNNs: 90, 'Vector Search': 95, 'Transfer Learning': 90,
  'Deep Learning': 90, NLP: 85, 'Prompt Engineering': 85, 'Large Language Models': 85,
  'Computer Vision': 90, 'Grad-CAM': 80, DINOv2: 85,
  // Soft Skills
  'Problem Solving': 95, Teamwork: 90, Communication: 85, Leadership: 85,
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Python: 'Primary language for ML, backend, data processing',
  Java: 'Object-oriented programming, data structures, algorithms',
  JavaScript: 'Full-stack scripting, async patterns, DOM manipulation',
  SQL: 'Relational queries, joins, indexing strategies',
  RAG: 'Specialized in low-latency retrieval-augmented generation',
  Weaviate: 'Vector DB expertise for semantic search',
  'Neo4j': 'Graph reasoning & multi-hop knowledge retrieval',
  'System Design': 'Scalable architecture, microservices, bottleneck analysis',
  'Vector Search': 'Semantic similarity, embeddings, hybrid retrieval',
  TensorFlow: 'Deep learning, CNNs, model training & deployment',
  PyTorch: 'Research-grade ML, custom loss functions, DINOv2 fine-tuning',
  Docker: 'Containerization, multi-stage builds, orchestration',
  'Node.js': 'Backend APIs, async patterns, Streams',
  'React.js': 'Frontend, hooks, state management',
  Flask: 'REST API deployment, ML model serving',
  PostgreSQL: 'Advanced queries, RBAC, production databases',
  MongoDB: 'NoSQL, Atlas, document modeling',
  'Deep Learning': 'CNNs, Vision Transformers, transfer learning workflows',
  NLP: 'Text analysis, language understanding, tokenization',
  'Large Language Models': 'Prompt engineering, IBM WatsonX, LLM applications',
  'Computer Vision': 'Image classification, SAR imagery, object detection',
  'Problem Solving': 'Analytical thinking, debugging complex systems',
  Leadership: 'Team management, mentorship, community building',
  Git: 'Version control, branching strategies, code review',
  Linux: 'Shell scripting, server administration, process management',
};

const CATEGORIES = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'tools', label: 'Tools' },
  { key: 'databases', label: 'Databases' },
  { key: 'aiMl', label: 'AI / ML' },
  { key: 'other', label: 'Other & APIs' },
  { key: 'softSkills', label: 'Soft Skills' },
] as const;

const SkillBadge = ({ skill }: { skill: string }) => {
  const proficiency = SKILL_PROFICIENCY[skill] ?? 70;
  const description = SKILL_DESCRIPTIONS[skill] ?? `Experienced with ${skill}`;
  
  // Determine color based on proficiency
  const getColor = (level: number) => {
    if (level >= 90) return 'text-accent-primary';
    if (level >= 80) return 'text-accent-alt';
    return 'text-text-secondary';
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          className={`font-mono-label text-[12px] bg-bg-inset text-text-secondary px-4 py-2 cursor-pointer skill-pill transition-all hover:border-accent-primary hover:text-accent-primary`}
          style={{ borderRadius: '4px', border: '2px solid transparent' }}
        >
          {skill}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 bg-bg-surface border-border-color" align="center" sideOffset={8}>
        <div className="space-y-2">
          <h4 className="font-display text-sm text-text-primary">{skill}</h4>
          <p className="font-mono-body text-xs text-text-secondary">{description}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-mono-label text-xs text-text-muted">Proficiency</span>
              <span className={`font-mono-label text-xs ${getColor(proficiency)}`}>{proficiency}%</span>
            </div>
            <Progress value={proficiency} className="h-2" />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const Skills = () => {
  const ref = useSectionObserver();
  const headingOffset = useParallax(0.08);
  const { skills } = portfolioData;

  return (
    <section
      id="skills"
      ref={ref}
      className="py-24 content-section"
      role="region"
      aria-labelledby="skills-heading"
    >
      <div className="max-w-[1200px] mx-auto" style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
        <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-text-muted block mb-4 stagger-child">
          05 —
        </span>
        <h2
          id="skills-heading"
          className="font-display text-text-primary mb-12 stagger-child"
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            transform: `translateY(${Math.max(-30, Math.min(30, headingOffset))}px)`,
          }}
        >
          Skills & Expertise
        </h2>

        <p className="font-mono-body text-text-muted mb-12 stagger-child max-w-[600px]" style={{ fontSize: '14px' }}>
          Hover over any skill to see proficiency level and context. I focus on production-grade systems with measurable results.
        </p>

        <div className="space-y-10">
          {CATEGORIES.map((cat) => {
            const items = skills[cat.key as keyof typeof skills];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat.key} className="stagger-child">
                <span className="font-mono-label text-[12px] uppercase tracking-[0.12em] text-text-muted block mb-4">
                  {cat.label}
                </span>
                <div className="flex flex-wrap gap-3">
                  {items.map((skill, j) => (
                    <SkillBadge key={j} skill={skill} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
