import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Bug, Lock, BookOpen, Terminal, Globe, Eye, Cpu, Database } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import './Services.css';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Shield,
  Server,
  Bug,
  Lock,
  BookOpen,
  Terminal,
  Globe,
  Eye,
  Cpu,
  Database,
};

const Services = () => {
  const { data } = useData();
  const services = [...data.services].sort((a, b) => a.order - b.order);
  const [toast, setToast] = useState<string | null>(null);

  const handleCtaClick = (service: typeof services[0]) => {
    const actionType = service.actionType || 'inquiry';

    if (actionType === 'inquiry') {
      const subject = service.inquirySubject || `Inquiry: ${service.title}`;
      window.dispatchEvent(new CustomEvent('service-inquiry', { detail: { subject } }));
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (actionType === 'external') {
      if (service.externalUrl) {
        window.open(sanitizeUrl(service.externalUrl), '_blank', 'noopener,noreferrer');
      }
    } else if (actionType === 'coming_soon') {
      setToast(`"${service.title}" is coming soon!`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <section id="services" className="services section container">
      <div className="section-header">
        <h2 className="section-title">Services</h2>
        <div className="title-underline"></div>
      </div>

      <div className="services-list">
        {services.length === 0 ? (
          <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>No services added yet.</p>
        ) : (
          services.map((service, index) => {
            const IconComponent = iconMap[service.iconName] || Shield;
            return (
              <motion.div
                key={service.id}
                className="service-item flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="service-info flex items-center gap-md">
                  <div className="service-icon">
                    <IconComponent size={32} aria-hidden="true" />
                  </div>
                  <div className="service-text">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-desc text-secondary">{service.description}</p>
                  </div>
                </div>
                <div className="service-action">
                  <button className="btn-outline" onClick={() => handleCtaClick(service)}>
                    {service.ctaText || 'Learn More'}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {toast && (
        <div className="services-toast">
          {toast}
        </div>
      )}
    </section>
  );
};

export default Services;
