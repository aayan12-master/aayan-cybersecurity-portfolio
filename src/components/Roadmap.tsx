import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import './Roadmap.css';

const Roadmap = () => {
  const { data } = useData();
  const steps = [...data.roadmap].sort((a, b) => a.order - b.order);

  return (
    <section id="roadmap" className="roadmap section container">
      <div className="section-header text-center flex-col items-center">
        <h2 className="section-title">Learning Roadmap</h2>
        <div className="title-underline"></div>
      </div>

      <div className="timeline">
        {steps.length === 0 ? (
          <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>No roadmap items yet.</p>
        ) : (
          steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="timeline-content">
                <span className="timeline-year text-accent">{step.year}</span>
                <h3 className="timeline-title">{step.title}</h3>
                <p className="timeline-desc text-secondary">{step.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default Roadmap;
