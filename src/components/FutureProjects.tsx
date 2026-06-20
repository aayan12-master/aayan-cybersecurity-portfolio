import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './FutureProjects.css';

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
          <motion.div
            key={project.id}
            className="future-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="future-icon text-accent">
              <Rocket size={24} />
            </div>
            <h3 className="future-title">{project.title}</h3>
            <p className="future-desc text-secondary">{project.description}</p>
            <div className="coming-soon-badge">{project.status}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FutureProjects;
