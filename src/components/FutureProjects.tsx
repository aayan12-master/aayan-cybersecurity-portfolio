import { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { DetailModal } from './DetailModal';
import './FutureProjects.css';

const getStageClass = (status: string) => {
  const lower = (status || '').toLowerCase();
  if (lower.includes('research')) return 'stage-researching';
  if (lower.includes('plan')) return 'stage-planning';
  if (lower.includes('build')) return 'stage-building';
  if (lower.includes('test')) return 'stage-testing';
  if (lower.includes('launch')) return 'stage-launching';
  return 'stage-default';
};

const FutureProjectCardItem = ({ project, index }: { project: any; index: number }) => {
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

  return (
    <>
      <motion.div
        key={project.id}
        className="future-card-static"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="future-icon text-accent">
          <Rocket size={24} />
        </div>
        <h3 className="future-title">{project.title}</h3>
        <p ref={descRef} className="future-desc text-secondary">
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
        
        <div className={`coming-soon-badge ${getStageClass(project.status)}`}>
          {project.status}
        </div>
      </motion.div>

      <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={project.title}>
        <div className="future-modal-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="detail-modal-header">
            <div className="future-icon text-accent" style={{ marginBottom: '1rem' }}>
              <Rocket size={32} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="future-title" style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{project.title}</h3>
              <span className={`coming-soon-badge ${getStageClass(project.status)}`} style={{ position: 'static', margin: 0 }}>
                {project.status}
              </span>
            </div>
          </div>

          <div className="detail-modal-body">
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
              {project.description}
            </p>
          </div>
        </div>
      </DetailModal>
    </>
  );
};

const FutureProjects = () => {
  const { data } = useData();
  const projects = [...data.futureProjects].sort((a, b) => a.order - b.order);

  if (projects.length === 0) return null;

  return (
    <section className="future-projects section container">
      <div className="section-header">
        <h2 className="section-title">Coming Soon</h2>
        <div className="title-underline"></div>
      </div>

      <div className="future-grid">
        {projects.map((project, index) => (
          <FutureProjectCardItem key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
};

export default FutureProjects;
