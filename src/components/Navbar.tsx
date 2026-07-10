import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './Navbar.css';

const Navbar = () => {
  const { data } = useData();
  const { sectionVisibility } = data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container container flex justify-between items-center">
        <Link to="/" className="navbar-logo flex items-center gap-sm" onClick={() => setMobileMenuOpen(false)}>
          <Shield className="text-accent" size={28} aria-hidden="true" />
          <span>Aayan G. Sayyad</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {sectionVisibility.about && <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>}
          {sectionVisibility.skills && data.skills.length > 0 && <a href="#skills" onClick={() => setMobileMenuOpen(false)}>Skills</a>}
          {sectionVisibility.services && <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>}
          {sectionVisibility.projects && <a href="#projects" onClick={() => setMobileMenuOpen(false)}>Projects</a>}
          {sectionVisibility.certifications && data.certifications.length > 0 && <a href="#certifications" onClick={() => setMobileMenuOpen(false)}>Certifications</a>}
          {sectionVisibility.roadmap && <a href="#roadmap" onClick={() => setMobileMenuOpen(false)}>Roadmap</a>}
          {sectionVisibility.contact && <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;