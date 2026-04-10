import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { FileText, Github, Linkedin, Mail, Home, Code2, BookOpen, Trophy, Users, MessageSquare, Sun, Moon, Download, Sparkles } from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { portfolio as portfolioData } from '@/data/portfolio';

const NAVIGATION = [
  { label: 'Home', section: 'hero', icon: Home },
  { label: 'About', section: 'about', icon: Users },
  { label: 'Projects', section: 'projects', icon: Code2 },
  { label: 'Skills', section: 'skills', icon: BookOpen },
  { label: 'Education', section: 'education', icon: FileText },
  { label: 'Achievements', section: 'achievements', icon: Trophy },
  { label: 'Blog', section: 'blog', icon: BookOpen },
  { label: 'FAQ', section: 'faq', icon: MessageSquare },
  { label: 'Contact', section: 'contact', icon: Mail },
];

const EXTERNAL_LINKS = [
  { label: 'GitHub', icon: Github, url: portfolioData.meta.github },
  { label: 'LinkedIn', icon: Linkedin, url: portfolioData.meta.linkedin },
  { label: 'Download Resume', icon: Download, url: portfolioData.meta.resumeURL },
  { label: 'Email', icon: Mail, action: () => window.location.href = `mailto:${portfolioData.meta.email}` },
];

const PROJECTS_QUICK = portfolioData.projects.map((p) => ({
  label: p.title,
  section: `/project/${p.id}`,
  icon: Code2,
}));

// Flatten skills for search
const ALL_SKILLS = Object.values(portfolioData.skills).flat().filter(Boolean);

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigate = (section: string) => {
    setOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
    } else {
      const el = document.getElementById(section);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExternalLink = (url?: string, action?: () => void) => {
    if (action) {
      action();
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Navigate, search skills, toggle theme..." 
        className="bg-transparent border-border-color text-text-primary placeholder:text-text-muted"
      />
      <CommandList className="bg-bg-surface text-text-primary">
        <CommandEmpty className="text-text-muted">No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions" className="text-text-muted">
          <CommandItem
            onSelect={handleThemeToggle}
            className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
          >
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-amber-400" /> : <Moon className="mr-2 h-4 w-4 text-indigo-400" />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleExternalLink(portfolioData.meta.resumeURL)}
            className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
          >
            <Download className="mr-2 h-4 w-4 text-accent-primary" />
            <span>Download Resume</span>
          </CommandItem>
        </CommandGroup>

        {/* Navigation */}
        <CommandGroup heading="Navigate" className="text-text-muted">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.section}
                onSelect={() => handleNavigate(item.section)}
                className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
              >
                <Icon className="mr-2 h-4 w-4 text-accent-primary" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Quick Projects */}
        {PROJECTS_QUICK.length > 0 && (
          <CommandGroup heading="Projects" className="text-text-muted">
            {PROJECTS_QUICK.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.label}
                  onSelect={() => handleNavigate(item.section)}
                  className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
                >
                  <Icon className="mr-2 h-4 w-4 text-accent-alt" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Skills Search */}
        <CommandGroup heading="Skills" className="text-text-muted">
          {ALL_SKILLS.map((skill) => (
            <CommandItem
              key={skill}
              onSelect={() => handleNavigate('skills')}
              className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
            >
              <Sparkles className="mr-2 h-4 w-4 text-accent-alt" />
              <span>{skill}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* External Links */}
        <CommandGroup heading="Links" className="text-text-muted">
          {EXTERNAL_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.label}
                onSelect={() => handleExternalLink(item.url, item.action)}
                className="cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-inset transition-colors"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Keyboard Shortcut Help */}
        <div className="border-t border-border-color px-4 py-3 text-xs text-text-muted space-y-1">
          <div>Press <kbd className="px-2 py-1 bg-bg-inset rounded text-text-primary">⌘</kbd> + <kbd className="px-2 py-1 bg-bg-inset rounded text-text-primary">K</kbd> to toggle • Type to search anything</div>
        </div>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
