import { motion } from 'framer-motion';
import { Mail, Award, Hexagon, Box, Bug, Terminal, Globe } from 'lucide-react';
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaDiscord, FaTelegram, FaGitlab, FaMedium } from 'react-icons/fa6';
import { useData } from '../contexts/DataContext';
import { sanitizeUrl } from '../utils/sanitize';
import portraitImg from '../assets/portrait.webp';
import './Hero.css';

const getSocialIcon = (platform: string) => {
  const norm = platform.toLowerCase().trim();
  switch (norm) {
    case 'github': return <FaGithub size={20} aria-hidden="true" />;
    case 'linkedin': return <FaLinkedin size={20} aria-hidden="true" />;
    case 'x':
    case 'twitter': return <FaXTwitter size={20} aria-hidden="true" />;
    case 'tryhackme': return <Hexagon size={20} aria-hidden="true" />;
    case 'hack the box':
    case 'hackthebox': return <Box size={20} aria-hidden="true" />;
    case 'instagram': return <FaInstagram size={20} aria-hidden="true" />;
    case 'facebook': return <FaFacebook size={20} aria-hidden="true" />;
    case 'medium': return <FaMedium size={20} aria-hidden="true" />;
    case 'youtube': return <FaYoutube size={20} aria-hidden="true" />;
    case 'discord': return <FaDiscord size={20} aria-hidden="true" />;
    case 'telegram': return <FaTelegram size={20} aria-hidden="true" />;
    case 'gitlab': return <FaGitlab size={20} aria-hidden="true" />;
    case 'hackerone': return <Terminal size={20} aria-hidden="true" />;
    case 'bugcrowd': return <Bug size={20} aria-hidden="true" />;
    default: return <Globe size={20} aria-hidden="true" />;
  }
};

const Hero = () => {
  const { data } = useData();
  const { hero, socialLinks } = data;
  const subtitleLines = hero.subtitle.split('\n');

  return (
    <section className="hero container section flex items-center justify-between">

      {/* Left Side */}
      <motion.div
        className="hero-left flex-col gap-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="greeting text-accent">Hello There,</span>
        <h1 className="hero-title">I'm {hero.name}</h1>
        <p className="hero-subtitle text-secondary">
          {subtitleLines.map((line, i) => (
            <span key={i}>{line}{i < subtitleLines.length - 1 && <br />}</span>
          ))}
        </p>

        <div className="hero-contact flex items-center gap-sm">
          <Mail className="text-secondary" size={20} aria-hidden="true" />
          <a href={`mailto:${hero.email}`} className="email-link">{hero.email}</a>
        </div>



        <div className="learning-counter">
          <span className="counter-number text-accent">{hero.heroStatValue || '2-3'}</span>
          <span className="counter-text text-secondary">{hero.heroStatLabel || 'Hours Daily Learning Journey'}</span>
        </div>
      </motion.div>

      {/* Center Side */}
      <motion.div
        className="hero-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="portrait-container">
          <div className="portrait-bg"></div>
          <img src={portraitImg} alt={hero.name} className="portrait-image" />
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div
        className="hero-right flex-col gap-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="intro-card">
          <p className="text-secondary">
            {hero.description}
          </p>
        </div>

        {/* Social Links */}
        <div className="social-links flex-col gap-sm">
          <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Connect</span>
          <div className="social-grid">
            {[...socialLinks].sort((a, b) => a.order - b.order).map(link => (
              <a
                key={link.id}
                href={sanitizeUrl(link.url)}
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                title={link.platform}
                aria-label={link.platform}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        </div>

        {hero.showProfileBadge !== false && (
          <div className="cert-badge flex items-center gap-sm">
            <div className="badge-icon">
              <Award size={24} className="text-accent" aria-hidden="true" />
            </div>
            <div className="badge-info">
              <span className="badge-title">{hero.badgeTitle || 'Training'}</span>
              <span className="badge-desc text-secondary">{hero.badgeSubtitle || 'Skill Rise Academy'}</span>
            </div>
          </div>
        )}
      </motion.div>

    </section>
  );
};

export default Hero;
