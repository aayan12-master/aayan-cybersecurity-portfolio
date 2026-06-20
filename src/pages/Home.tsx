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
    if (settings.ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', settings.ogImage);
      const twitterImg = document.querySelector('meta[name="twitter:image"]');
      if (twitterImg) twitterImg.setAttribute('content', settings.ogImage);
    }
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
