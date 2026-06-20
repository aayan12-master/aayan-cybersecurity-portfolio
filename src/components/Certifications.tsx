import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, Building2, Hash } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import './Certifications.css';

const statusClassMap: Record<string, string> = {
  'In Progress': 'status-active',
  'Completed': 'status-completed',
  'Planned': 'status-pending',
  'Future Goal': 'status-pending',
};

const Certifications = () => {
  const { data } = useData();
  const certs = [...data.certifications].sort((a, b) => a.order - b.order);

  if (certs.length === 0) return null;

  return (
    <section id="certifications" className="certifications section container">
      <div className="section-header text-center flex-col items-center">
        <h2 className="section-title">Certifications</h2>
        <div className="title-underline"></div>
      </div>

      <div className="certs-grid">
        {certs.map((cert, index) => (
          <motion.div
            key={cert.id}
            className="cert-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            {/* Card Header */}
            <div className="cert-header">
              <div className="cert-icon-wrap">
                <Award size={28} className="text-accent" aria-hidden="true" />
              </div>
              <span className={`cert-status ${statusClassMap[cert.status] || 'status-pending'}`}>
                {cert.status}
              </span>
            </div>

            {/* Meta Info */}
            <div className="cert-meta">
              {cert.issuer && (
                <div className="cert-meta-item">
                  <Building2 size={13} className="meta-icon" aria-hidden="true" />
                  <span>{cert.issuer}</span>
                </div>
              )}
              {cert.issueDate && (
                <div className="cert-meta-item">
                  <Calendar size={13} className="meta-icon" aria-hidden="true" />
                  <span>{cert.issueDate}</span>
                </div>
              )}
              {cert.credentialId && (
                <div className="cert-meta-item">
                  <Hash size={13} className="meta-icon" aria-hidden="true" />
                  <span className="credential-id">{cert.credentialId}</span>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="cert-title">{cert.title}</h3>
            {cert.description && (
              <p className="cert-desc text-secondary">{cert.description}</p>
            )}

            {/* Actions */}
            <div className="cert-actions">
              {cert.verificationLink && (
                <a
                  href={sanitizeUrl(cert.verificationLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="cert-verify-btn"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Verify Credential
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;