import { useState } from 'react';
import { useData, type SectionVisibility } from '../../contexts/DataContext';
import { Eye, EyeOff, CheckCircle, Save } from 'lucide-react';
import '../admin-shared.css';

const SECTIONS: { key: keyof SectionVisibility; label: string; desc: string }[] = [
  { key: 'hero', label: 'Hero Section', desc: 'Main banner with name, title and photo.' },
  { key: 'about', label: 'About', desc: 'Bio, career goal and mission statement.' },
  { key: 'skills', label: 'Skills', desc: 'Skill bars and categories.' },
  { key: 'services', label: 'Services', desc: 'Services you offer.' },
  { key: 'projects', label: 'Projects', desc: 'Featured work and code projects.' },
  { key: 'certifications', label: 'Certifications', desc: 'Certifications and badges (auto-hides if empty).' },
  { key: 'roadmap', label: 'Learning Roadmap', desc: 'Timeline of your learning journey.' },
  { key: 'futureProjects', label: 'Future Projects', desc: 'Upcoming projects and ideas.' },
  { key: 'contact', label: 'Contact', desc: 'Contact form and social links.' },
];

const SectionVisibilityEditor = () => {
  const { data, updateSectionVisibility } = useData();
  const [visibility, setVisibility] = useState<SectionVisibility>({ ...data.sectionVisibility });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof SectionVisibility) =>
    setVisibility(v => ({ ...v, [key]: !v[key] }));

  const handleSave = () => {
    updateSectionVisibility(visibility);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Section Visibility</h1>
        <p>Show or hide any section of your portfolio without touching code.</p>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <h2><Eye size={16} /> Sections ({visibleCount}/{SECTIONS.length} visible)</h2>
          <button className="btn-admin-primary" onClick={handleSave}>
            <Save size={15} /> Save Visibility
          </button>
        </div>

        {saved && (
          <div style={{ marginBottom: '1rem' }}>
            <span className="save-success"><CheckCircle size={14} /> Visibility saved!</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {SECTIONS.map(section => (
            <div key={section.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: visibility[section.key] ? 'rgba(124,111,247,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${visibility[section.key] ? 'rgba(124,111,247,0.2)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 10, padding: '0.9rem 1.1rem', transition: 'all 0.2s'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: visibility[section.key] ? '#e8e8f0' : '#55556a' }}>
                  {section.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#55556a', marginTop: '0.15rem' }}>{section.desc}</div>
              </div>

              <button
                onClick={() => toggle(section.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: visibility[section.key] ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${visibility[section.key] ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.2)'}`,
                  color: visibility[section.key] ? '#4ade80' : '#f87171',
                  borderRadius: 8, padding: '0.45rem 0.9rem', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem',
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
              >
                {visibility[section.key]
                  ? <><Eye size={14} /> Visible</>
                  : <><EyeOff size={14} /> Hidden</>
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionVisibilityEditor;
