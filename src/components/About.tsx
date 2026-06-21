import { motion } from 'framer-motion';
import { ShieldCheck, Target, Lightbulb, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './About.css';

const About = () => {
  const { data } = useData();
  const { about } = data;
  const bioParagraphs = about.bio.split('\n\n').filter(p => p.trim());

  const items = [
    { icon: <ShieldCheck aria-hidden="true" />, title: "Cyber Security Focus", desc: "Building practical knowledge in security concepts and hands-on labs through structured training." },
    { icon: <Target aria-hidden="true" />, title: "Career Goal", desc: about.careerGoal },
    { icon: <Lightbulb aria-hidden="true" />, title: "Mission", desc: about.missionStatement },
  ];

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

      <div className="about-grid mt-lg">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="about-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="about-icon text-accent">
              {item.icon}
            </div>
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-card-desc text-secondary">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default About;
