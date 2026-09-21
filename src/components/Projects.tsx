import { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, ExternalLink, ArrowRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import { DetailModal } from './DetailModal';
import './Projects.css';

const ProjectCardItem = ({ project, index }: { project: any; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (descRef.current) {
        const element = descRef.current;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setIsOverflowing(hasOverflow);
      }
    };

    checkOverflow();
    const timer = setTimeout(checkOverflow, 100);

    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [project.description]);

  const hasThumbnail = project.thumbnail && project.thumbnail.trim() !== '' && project.thumbnail !== 'https://example.com/image.png';

  return (
    <>
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
          <p
            ref={descRef}
            className="project-desc text-secondary"
          >
            {project.description}
          </p>
          
          {isOverflowing && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="view-details-link"
            >
              View Details <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="project-link flex items-center gap-sm" style={{ marginTop: '1rem' }}>
          {project.githubUrl && (
            <a href={sanitizeUrl(project.githubUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm" style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
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

      <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={project.title}>
        <div className="project-modal-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="detail-modal-header">
            <div className="project-icon text-accent" style={{ marginBottom: '0.5rem' }}>
              <FolderGit2 size={32} aria-hidden="true" />
            </div>
            <span className="project-category text-accent" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {project.category}
            </span>
            <h3 className="project-title" style={{ fontSize: '1.75rem', marginTop: '0.25rem', marginBottom: 0 }}>{project.title}</h3>
          </div>
          
          <div className="detail-modal-body">
            {hasThumbnail && (
              <div className="project-modal-thumbnail-wrapper" style={{ width: '100%', maxHeight: '240px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
              {project.description}
            </p>
          </div>

          <div className="detail-modal-footer project-link flex items-center gap-md" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {project.githubUrl && (
              <a href={sanitizeUrl(project.githubUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                <FaGithub size={18} aria-hidden="true" /> <span>GitHub</span>
              </a>
            )}
            {project.demoLink && (
              <a href={sanitizeUrl(project.demoLink)} target="_blank" rel="noreferrer" className="flex items-center gap-sm" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                <ExternalLink size={18} aria-hidden="true" /> <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </DetailModal>
    </>
  );
};

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
            <ProjectCardItem key={project.id} project={project} index={index} />
          ))
        )}
      </div>
    </section>
  );
};

export default Projects;
