import { Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './About.css';

const About = () => {
  const { data } = useData();
  const { about } = data;
  const bioParagraphs = about.bio.split('\n\n').filter(p => p.trim());

  return (
    <section id="about" className="about section container">
      <div className="about-header text-center flex-col items-center">
        <h2 className="section-title">{about.heading}</h2>
        <div className="about-bio text-secondary">
          {bioParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {data.hero.showResumeButton && data.hero.resumeUrl?.trim() && (
            <div className="about-resume-container flex justify-center">
              <a
                href={data.hero.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-resume-btn flex items-center gap-xs"
              >
                <Download size={18} aria-hidden="true" />
                <span>{data.hero.resumeButtonText || 'Download Resume'}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
