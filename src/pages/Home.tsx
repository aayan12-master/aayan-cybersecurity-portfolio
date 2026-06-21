import { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Services from '../components/Services';
import Projects from '../components/Projects';
import Certifications from '../components/Certifications';
import Roadmap from '../components/Roadmap';
import FutureProjects from '../components/FutureProjects';
import Contact from '../components/Contact';
import { useData } from '../contexts/DataContext';
import { motion, useScroll, useSpring } from 'framer-motion';

const Home = () => {
  const { data, incrementVisitors } = useData();
  const { sectionVisibility } = data;
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    incrementVisitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamically update SEO metadata from Supabase
  useEffect(() => {
    const settings = data.siteSettings;
    const currentOrigin = window.location.origin;

    // Dynamically update canonical link and social URLs based on current host origin
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', currentOrigin + '/');

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentOrigin + '/');

    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', currentOrigin + '/');

    if (settings.seoTitle) {
      document.title = settings.seoTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', settings.seoTitle);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', settings.seoTitle);
    }
    if (settings.metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', settings.metaDescription);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', settings.metaDescription);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', settings.metaDescription);
    }

    // Fallback to origin-absolute path if settings.ogImage is empty/unconfigured
    const targetOgImage = settings.ogImage || (currentOrigin + '/og-image.png');
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', targetOgImage);
    const twitterImg = document.querySelector('meta[name="twitter:image"]');
    if (twitterImg) twitterImg.setAttribute('content', targetOgImage);
  }, [data.siteSettings]);

  return (
    <div className="home-page">
      <motion.div
        className="progress-bar"
        style={{ scaleX }}
      />
      {sectionVisibility.hero && <Hero />}
      {sectionVisibility.about && <About />}
      {sectionVisibility.skills && <Skills />}
      {sectionVisibility.services && <Services />}
      {sectionVisibility.projects && <Projects />}
      {sectionVisibility.certifications && <Certifications />}
      {sectionVisibility.roadmap && <Roadmap />}
      {sectionVisibility.futureProjects && <FutureProjects />}
      {sectionVisibility.contact && <Contact />}
    </div>
  );
};

export default Home;
