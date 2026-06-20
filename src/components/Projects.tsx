import { motion } from 'framer-motion';
import { FolderGit2, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import './Projects.css';

const Projects = () => {
  const { data } = useData();
  const projects = [...data.projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="projects section container">
      <div className="section-header">
        <h2 className="section-title">Featured Work</h2>
        <div className="title-underline"></div>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>No projects added yet.</p>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="project-content">
                <div className="project-icon">
                  <FolderGit2 size={24} aria-hidden="true" />
                </div>
                <span className="project-category text-accent">{project.category}</span>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc text-secondary">{project.description}</p>
              </div>

              <div className="project-link flex items-center gap-sm" style={{ marginTop: '1rem' }}>
                {project.githubLink && (
                  <a href={sanitizeUrl(project.githubLink)} target="_blank" rel="noreferrer" className="flex items-center gap-sm" style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                    <FaGithub size={16} aria-hidden="true" /> <span>GitHub</span>
                  </a>
                )}
                {project.demoLink && (
                  <a href={sanitizeUrl(project.demoLink)} target="_blank" rel="noreferrer" className="flex items-center gap-sm" style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                    <ExternalLink size={16} aria-hidden="true" /> <span>Demo</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default Projects;
