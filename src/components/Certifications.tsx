import { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, Building2, Hash, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import { getCertStatusStyle } from '../utils/certStatus';
import { DetailModal } from './DetailModal';
import './Certifications.css';

const CertCardItem = ({ cert, index }: { cert: any; index: number }) => {
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
  }, [cert.description]);

  return (
    <>
      <motion.div
        key={cert.id}
        className="cert-card-static"
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
          <span className={`cert-status ${getCertStatusStyle(cert.status).publicClass}`}>
            {cert.status}
          </span>
        </div>

        {/* Meta Info */}
        <div className="cert-meta">
          {(cert.issuer || cert.issueDate) && (
            <div className="cert-meta-group">
              {cert.issuer && (
                <div className="cert-meta-item" title={cert.issuer}>
                  <Building2 size={13} className="meta-icon" aria-hidden="true" />
                  <span className="cert-issuer" title={cert.issuer}>{cert.issuer}</span>
                </div>
              )}
              {cert.issueDate && (
                <div className="cert-meta-item">
                  <Calendar size={13} className="meta-icon" aria-hidden="true" />
                  <span>{cert.issueDate}</span>
                </div>
              )}
            </div>
          )}
          {!isOverflowing && cert.credentialId && (
            <div className="cert-meta-id-row">
              <div className="cert-meta-item" title={`Credential ID: ${cert.credentialId}`}>
                <Hash size={13} className="meta-icon" aria-hidden="true" />
                <span className="credential-id" title={cert.credentialId}>{cert.credentialId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="cert-title">{cert.title}</h3>
        {cert.description && (
          <p ref={descRef} className="cert-desc text-secondary">
            {cert.description}
          </p>
        )}

        {/* Actions */}
        {isOverflowing ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="view-details-link"
          >
            View Details <ArrowRight size={14} aria-hidden="true" />
          </button>
        ) : (
          <div className="cert-actions">
            {cert.verificationLink && (
              <a
                href={sanitizeUrl(cert.verificationLink)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
              >
                <ExternalLink size={14} aria-hidden="true" />
                Verify Certificate
              </a>
            )}
            {cert.imageUrl && (
              <a
                href={sanitizeUrl(cert.imageUrl)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
              >
                <ExternalLink size={14} aria-hidden="true" />
                View Image
              </a>
            )}
            {cert.pdfUrl && (
              <a
                href={sanitizeUrl(cert.pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
              >
                <ExternalLink size={14} aria-hidden="true" />
                View PDF
              </a>
            )}
          </div>
        )}
      </motion.div>

      <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={cert.title}>
        <div className="cert-modal-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="detail-modal-header">
            <div className="cert-header" style={{ border: 'none', padding: 0, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="cert-icon-wrap" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-accent)' }}>
                <Award size={32} aria-hidden="true" />
              </div>
              <span className={`cert-status ${getCertStatusStyle(cert.status).publicClass}`}>
                {cert.status}
              </span>
            </div>

            <h3 className="cert-title" style={{ fontSize: '1.6rem', marginTop: '0.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>{cert.title}</h3>

            <div className="cert-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: 'none', padding: 0 }}>
              {cert.issuer && (
                <div className="cert-meta-item" style={{ fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={15} className="text-secondary" aria-hidden="true" />
                  <strong>Issuer:</strong> <span className="text-secondary">{cert.issuer}</span>
                </div>
              )}
              {cert.issueDate && (
                <div className="cert-meta-item" style={{ fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} className="text-secondary" aria-hidden="true" />
                  <strong>Date:</strong> <span className="text-secondary">{cert.issueDate}</span>
                </div>
              )}
              {cert.credentialId && (
                <div className="cert-meta-item" style={{ fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Hash size={15} className="text-secondary" aria-hidden="true" />
                  <strong>Certificate ID:</strong> <span className="text-secondary" style={{ wordBreak: 'break-all' }}>{cert.credentialId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-modal-body">
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
              {cert.description}
            </p>
          </div>

          <div className="detail-modal-footer cert-actions" style={{ display: 'flex', gap: '0.75rem', margin: 0 }}>
            {cert.verificationLink && (
              <a
                href={sanitizeUrl(cert.verificationLink)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
                style={{ flex: '1 1 0px', textAlign: 'center', justifyContent: 'center' }}
              >
                <ExternalLink size={14} aria-hidden="true" />
                Verify Certificate
              </a>
            )}
            {cert.imageUrl && (
              <a
                href={sanitizeUrl(cert.imageUrl)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
                style={{ flex: '1 1 0px', textAlign: 'center', justifyContent: 'center' }}
              >
                <ExternalLink size={14} aria-hidden="true" />
                View Image
              </a>
            )}
            {cert.pdfUrl && (
              <a
                href={sanitizeUrl(cert.pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="cert-verify-btn"
                style={{ flex: '1 1 0px', textAlign: 'center', justifyContent: 'center' }}
              >
                <ExternalLink size={14} aria-hidden="true" />
                View PDF
              </a>
            )}
          </div>
        </div>
      </DetailModal>
    </>
  );
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
          <CertCardItem key={cert.id} cert={cert} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Certifications;