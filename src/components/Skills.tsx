import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { Award, Code2, Terminal, Shield, Cpu, Network, Flame, Settings } from 'lucide-react';
import './Skills.css';

const categoryIconMap: Record<string, React.ReactNode> = {
  'Foundation': <Network size={20} aria-hidden="true" />,
  'Operating Systems': <Cpu size={20} aria-hidden="true" />,
  'Programming': <Code2 size={20} aria-hidden="true" />,
  'Security Tools': <Terminal size={20} aria-hidden="true" />,
  'Practice Platforms': <Flame size={20} aria-hidden="true" />,
  'Security Domains': <Shield size={20} aria-hidden="true" />,
  'Tools': <Settings size={20} aria-hidden="true" />,
  'Other': <Award size={20} aria-hidden="true" />,
};

const CATEGORIES = [
  'Foundation',
  'Operating Systems',
  'Programming',
  'Security Tools',
  'Practice Platforms',
  'Security Domains',
  'Tools',
  'Other'
];

export const COMPETENCY_MAP = [
  { label: 'Foundation', value: 15, className: 'comp-foundation' },
  { label: 'Learning', value: 35, className: 'comp-learning' },
  { label: 'Practicing', value: 55, className: 'comp-practicing' },
  { label: 'Hands-On', value: 75, className: 'comp-handson' },
  { label: 'Building', value: 90, className: 'comp-building' },
  { label: 'Active', value: 100, className: 'comp-active' }
];

export const getCompetency = (level: number) => {
  if (!level) return COMPETENCY_MAP[0];
  return COMPETENCY_MAP.reduce((prev, curr) => 
    Math.abs(curr.value - level) < Math.abs(prev.value - level) ? curr : prev
  );
};

const Skills = () => {
  const { data } = useData();
  const skills = [...data.skills].sort((a, b) => a.order - b.order);

  if (skills.length === 0) return null;

  // Group skills by category
  const groupedSkills = CATEGORIES.reduce<Record<string, typeof skills>>((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length > 0) {
      acc[cat] = items;
    }
    return acc;
  }, {});

  const activeCategories = Object.keys(groupedSkills);

  if (activeCategories.length === 0) return null;

  return (
    <section id="skills" className="skills section container">
      <div className="section-header text-center flex-col items-center">
        <h2 className="section-title">Technical Skills</h2>
        <div className="title-underline"></div>
      </div>

      <div className="skills-grid">
        {activeCategories.map((category, catIndex) => (
          <motion.div
            key={category}
            className="skills-category-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: catIndex * 0.08 }}
          >
            <div className="skills-category-header flex items-center gap-sm">
              <div className="skills-category-icon text-accent">
                {categoryIconMap[category] || <Award size={20} aria-hidden="true" />}
              </div>
              <h3 className="skills-category-title">{category}</h3>
            </div>
            
            <div className="skills-badges-wrap">
              {groupedSkills[category].map((skill) => {
                const comp = getCompetency(skill.level);
                return (
                  <span key={skill.id} className="skill-badge">
                    <span className="skill-name">{skill.name}</span>
                    <span className={`competency-tag ${comp.className}`}>
                      {comp.label}
                    </span>
                  </span>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
