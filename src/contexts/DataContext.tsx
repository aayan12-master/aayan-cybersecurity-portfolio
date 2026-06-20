import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface HeroContent {
  name: string;
  title: string;
  subtitle: string;
  email: string;
  location: string;
  description: string;
  learningHours: string;
  trainingBadge: string;
}

export interface AboutContent {
  heading: string;
  bio: string;
  careerGoal: string;
  missionStatement: string;
}

export interface Education {
  degree: string;
  college: string;
  completionYear: string;
}

export interface Training {
  institute: string;
  location: string;
  duration: string;
  mode: string;
  status: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  ctaText?: string;
  actionType?: 'inquiry' | 'external' | 'coming_soon';
  inquirySubject?: string;
  externalUrl?: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  githubLink: string;
  demoLink: string;
  thumbnail: string;
  order: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  status: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  verificationLink: string;
  credentialId: string;
  order: number;
}

export interface RoadmapItem {
  id: string;
  year: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  order: number;
}

export interface FutureProject {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  resolved: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order: number;
}

export interface SiteSettings {
  seoTitle: string;
  metaDescription: string;
  ogImage: string;
  analyticsId: string;
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  education: boolean;
  training: boolean;
  skills: boolean;
  services: boolean;
  projects: boolean;
  certifications: boolean;
  roadmap: boolean;
  futureProjects: boolean;
  contact: boolean;
}

export interface SiteData {
  hero: HeroContent;
  about: AboutContent;
  education: Education;
  training: Training;
  skills: Skill[];
  services: Service[];
  projects: Project[];
  certifications: Certification[];
  roadmap: RoadmapItem[];
  futureProjects: FutureProject[];
  contactMessages: ContactMessage[];
  socialLinks: SocialLink[];
  siteSettings: SiteSettings;
  sectionVisibility: SectionVisibility;
  visitors: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_DATA: SiteData = {
  visitors: 0,
  hero: {
    name: 'Aayan G. Sayyad',
    title: 'Cyber Security Student | Cyber Security Enthusiast',
    subtitle: 'Cyber Security Student\nCyber Security Enthusiast',
    email: 'aayansayyad168@gmail.com',
    location: 'Ahmednagar, Maharashtra, India',
    description:
      'Currently building strong foundations in cybersecurity through structured training, hands-on practice, and continuous learning.',
    learningHours: '2-3',
    trainingBadge: 'Skill Rise Academy',
  },
  about: {
    heading: 'About Me',
    bio: 'I am Aayan G. Sayyad, a Cyber Security Student and Cyber Security Enthusiast from Ahmednagar, Maharashtra, India. I completed my Bachelor of Science (B.Sc.) in Computer Science in 2026 from Marutraoji Ghule Patil College.\n\nCurrently, I am pursuing a Cyber Security Training Program at Skill Rise Academy in Hyderabad, where I am building practical knowledge in networking, Linux, security concepts, and hands-on cybersecurity labs.\n\nMy interest in cybersecurity comes from solving security challenges and continuously learning how technology can be secured against modern threats. My long-term vision is to build a cybersecurity company and contribute meaningful solutions to the cybersecurity industry.',
    careerGoal:
      'Build strong cybersecurity foundations, gain practical experience, secure a cybersecurity role, and eventually build a cybersecurity company.',
    missionStatement:
      'To continuously learn, grow, and contribute meaningful solutions to the cybersecurity industry while helping make digital spaces safer for everyone.',
  },
  education: {
    degree: 'Bachelor of Science (B.Sc.) in Computer Science',
    college: 'Marutraoji Ghule Patil College',
    completionYear: '2026',
  },
  training: {
    institute: 'Skill Rise Academy',
    location: 'Hyderabad, Telangana, India',
    duration: '7-8 Months',
    mode: 'Offline Classroom Training',
    status: 'Ongoing',
  },
  skills: [
    { id: uid(), name: 'Networking', category: 'Foundation', level: 60, order: 0 },
    { id: uid(), name: 'Linux', category: 'Operating Systems', level: 55, order: 1 },
    { id: uid(), name: 'Windows', category: 'Operating Systems', level: 65, order: 2 },
    { id: uid(), name: 'Python', category: 'Programming', level: 50, order: 3 },
    { id: uid(), name: 'Bash Scripting', category: 'Programming', level: 45, order: 4 },
    { id: uid(), name: 'Wireshark', category: 'Security Tools', level: 55, order: 5 },
    { id: uid(), name: 'Nmap', category: 'Security Tools', level: 60, order: 6 },
    { id: uid(), name: 'Burp Suite', category: 'Security Tools', level: 45, order: 7 },
    { id: uid(), name: 'TryHackMe', category: 'Practice Platforms', level: 50, order: 8 },
    { id: uid(), name: 'Web Security', category: 'Security Domains', level: 40, order: 9 },
    { id: uid(), name: 'OSINT', category: 'Security Domains', level: 50, order: 10 },
    { id: uid(), name: 'Git / GitHub', category: 'Tools', level: 60, order: 11 },
  ],
  services: [
    { id: uid(), title: 'Network Security', description: 'Securing perimeters, monitoring traffic, and preventing unauthorized access.', iconName: 'Shield', ctaText: 'Learn More', actionType: 'inquiry', inquirySubject: 'Inquiry: Network Security', externalUrl: '', order: 0 },
    { id: uid(), title: 'Linux Administration', description: 'Managing, hardening, and maintaining secure Linux server environments.', iconName: 'Server', ctaText: 'Learn More', actionType: 'inquiry', inquirySubject: 'Inquiry: Linux Administration', externalUrl: '', order: 1 },
    { id: uid(), title: 'Security Research', description: 'Investigating emerging threats, zero-days, and advanced persistent threats.', iconName: 'Bug', ctaText: 'Learn More', actionType: 'inquiry', inquirySubject: 'Inquiry: Security Research', externalUrl: '', order: 2 },
    { id: uid(), title: 'Vulnerability Assessment', description: 'Identifying and mitigating security flaws in applications and networks.', iconName: 'Lock', ctaText: 'Learn More', actionType: 'inquiry', inquirySubject: 'Inquiry: Vulnerability Assessment', externalUrl: '', order: 3 },
    { id: uid(), title: 'Security Awareness', description: 'Educating users and teams on best practices to prevent social engineering.', iconName: 'BookOpen', ctaText: 'Learn More', actionType: 'inquiry', inquirySubject: 'Inquiry: Security Awareness', externalUrl: '', order: 4 },
  ],
  projects: [
    { id: uid(), title: 'Network Traffic Analyzer', category: 'Python Tool', description: 'A custom packet sniffer built with Scapy to identify suspicious network behaviors.', githubLink: '#', demoLink: '', thumbnail: '', order: 0 },
    { id: uid(), title: 'Automated Linux Hardening', category: 'Bash Script', description: 'A script that automatically applies CIS benchmarks to secure Ubuntu servers.', githubLink: '#', demoLink: '', thumbnail: '', order: 1 },
    { id: uid(), title: 'Vulnerability Scanner', category: 'Security Research', description: 'A lightweight scanner integrating multiple open-source tools into a single dashboard.', githubLink: '#', demoLink: '', thumbnail: '', order: 2 },
  ],
  certifications: [],
  roadmap: [
    { id: uid(), year: '2023 - 2026', title: 'B.Sc. Computer Science', description: 'Completed Bachelor of Science in Computer Science from Marutraoji Ghule Patil College, Ahmednagar.', status: 'completed', order: 0 },
    { id: uid(), year: 'Ongoing', title: 'Cyber Security Training', description: 'Pursuing 7-8 months offline training at Skill Rise Academy in Hyderabad, focusing on practical security concepts.', status: 'in-progress', order: 1 },
    { id: uid(), year: 'Present', title: 'Daily Learning & Practice', description: 'Dedicating 2-3 hours daily to mastering Networking, Linux, Python, Wireshark, Burp Suite, and TryHackMe labs.', status: 'in-progress', order: 2 },
    { id: uid(), year: 'Future', title: 'Cybersecurity Company', description: 'Aiming to build strong foundations, secure a professional role, and eventually build my own cybersecurity company.', status: 'planned', order: 3 },
  ],
  futureProjects: [
    { id: uid(), title: 'Cyber Security Academy', description: 'An interactive learning platform for cybersecurity education.', status: 'Planned', progress: 5, order: 0 },
    { id: uid(), title: 'Security Tools Hub', description: 'A curated repository of open-source security tools.', status: 'Planned', progress: 0, order: 1 },
    { id: uid(), title: 'Cloud Vulnerability Scanner', description: 'A cloud-based scanning service for SMEs.', status: 'Planned', progress: 0, order: 2 },
    { id: uid(), title: 'Security Community Platform', description: 'A forum for security enthusiasts and professionals.', status: 'Planned', progress: 0, order: 3 },
    { id: uid(), title: 'Security Services Portal', description: 'Client dashboard for consulting and security services.', status: 'Planned', progress: 0, order: 4 },
  ],
  contactMessages: [],
  socialLinks: [
    { id: uid(), platform: 'GitHub', url: 'https://github.com/aayan12-master', order: 0 },
    { id: uid(), platform: 'TryHackMe', url: 'https://tryhackme.com/p/midnightceeobra', order: 1 },
    { id: uid(), platform: 'X', url: 'https://x.com/AayanS36903', order: 2 },
  ],
  siteSettings: {
    seoTitle: 'Aayan G. Sayyad | Cyber Security Student & Enthusiast',
    metaDescription: 'Portfolio of Aayan G. Sayyad – Cyber Security Student, Enthusiast, and aspiring security professional from India.',
    ogImage: '',
    analyticsId: '',
  },
  sectionVisibility: {
    hero: true,
    about: true,
    education: true,
    training: true,
    skills: true,
    services: true,
    projects: true,
    certifications: true,
    roadmap: true,
    futureProjects: true,
    contact: true,
  },
};

// ─── Context Interface ────────────────────────────────────────────────────────

interface DataContextType {
  data: SiteData;
  updateHero: (hero: HeroContent) => void;
  updateAbout: (about: AboutContent) => void;
  updateEducation: (edu: Education) => void;
  updateTraining: (training: Training) => void;
  addSkill: (skill: Omit<Skill, 'id' | 'order'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  reorderSkills: (skills: Skill[]) => void;
  addService: (service: Omit<Service, 'id' | 'order'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'order'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addCertification: (cert: Omit<Certification, 'id' | 'order'>) => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  addRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'order'>) => void;
  updateRoadmapItem: (id: string, item: Partial<RoadmapItem>) => void;
  deleteRoadmapItem: (id: string) => void;
  reorderRoadmap: (items: RoadmapItem[]) => void;
  addFutureProject: (proj: Omit<FutureProject, 'id' | 'order'>) => void;
  updateFutureProject: (id: string, proj: Partial<FutureProject>) => void;
  deleteFutureProject: (id: string) => void;
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'resolved'>) => void;
  deleteContactMessage: (id: string) => void;
  resolveContactMessage: (id: string) => void;
  addSocialLink: (link: Omit<SocialLink, 'id' | 'order'>) => void;
  updateSocialLink: (id: string, link: Partial<SocialLink>) => void;
  deleteSocialLink: (id: string) => void;
  reorderSocialLinks: (links: SocialLink[]) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateSectionVisibility: (visibility: SectionVisibility) => void;
  incrementVisitors: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = 'aayan_portfolio_data_v1';

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SiteData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as any;
        let migratedSocialLinks: SocialLink[] = [];
        if (parsed.socialLinks && !Array.isArray(parsed.socialLinks)) {
          let order = 0;
          Object.entries(parsed.socialLinks).forEach(([platform, url]) => {
            if (url && typeof url === 'string' && url.trim() !== '') {
              let normPlatform = platform;
              if (platform === 'github') normPlatform = 'GitHub';
              else if (platform === 'tryhackme') normPlatform = 'TryHackMe';
              else if (platform === 'twitter') normPlatform = 'X';
              else if (platform === 'linkedin') normPlatform = 'LinkedIn';
              else if (platform === 'hackthebox') normPlatform = 'Hack The Box';
              else normPlatform = platform.charAt(0).toUpperCase() + platform.slice(1);
              
              migratedSocialLinks.push({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                platform: normPlatform,
                url: url.trim(),
                order: order++
              });
            }
          });
        } else if (Array.isArray(parsed.socialLinks)) {
          migratedSocialLinks = parsed.socialLinks;
        } else {
          migratedSocialLinks = DEFAULT_DATA.socialLinks;
        }

        return {
          ...DEFAULT_DATA,
          ...parsed,
          hero: { ...DEFAULT_DATA.hero, ...parsed.hero },
          about: { ...DEFAULT_DATA.about, ...parsed.about },
          education: { ...DEFAULT_DATA.education, ...parsed.education },
          training: { ...DEFAULT_DATA.training, ...parsed.training },
          socialLinks: migratedSocialLinks,
          siteSettings: { ...DEFAULT_DATA.siteSettings, ...parsed.siteSettings },
          sectionVisibility: { ...DEFAULT_DATA.sectionVisibility, ...parsed.sectionVisibility },
        };
      }
    } catch { /* ignore */ }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (updater: (prev: SiteData) => SiteData) => setData(updater);

  const ctx: DataContextType = {
    data,
    updateHero: (hero) => update(d => ({ ...d, hero })),
    updateAbout: (about) => update(d => ({ ...d, about })),
    updateEducation: (education) => update(d => ({ ...d, education })),
    updateTraining: (training) => update(d => ({ ...d, training })),

    addSkill: (skill) => update(d => ({ ...d, skills: [...d.skills, { ...skill, id: uid(), order: d.skills.length }] })),
    updateSkill: (id, skill) => update(d => ({ ...d, skills: d.skills.map(s => s.id === id ? { ...s, ...skill } : s) })),
    deleteSkill: (id) => update(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) })),
    reorderSkills: (skills) => update(d => ({ ...d, skills })),

    addService: (service) => update(d => ({ ...d, services: [...d.services, { ...service, id: uid(), order: d.services.length }] })),
    updateService: (id, service) => update(d => ({ ...d, services: d.services.map(s => s.id === id ? { ...s, ...service } : s) })),
    deleteService: (id) => update(d => ({ ...d, services: d.services.filter(s => s.id !== id) })),

    addProject: (project) => update(d => ({ ...d, projects: [...d.projects, { ...project, id: uid(), order: d.projects.length }] })),
    updateProject: (id, project) => update(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...project } : p) })),
    deleteProject: (id) => update(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) })),

    addCertification: (cert) => update(d => ({ ...d, certifications: [...d.certifications, { ...cert, id: uid(), order: d.certifications.length }] })),
    updateCertification: (id, cert) => update(d => ({ ...d, certifications: d.certifications.map(c => c.id === id ? { ...c, ...cert } : c) })),
    deleteCertification: (id) => update(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) })),

    addRoadmapItem: (item) => update(d => ({ ...d, roadmap: [...d.roadmap, { ...item, id: uid(), order: d.roadmap.length }] })),
    updateRoadmapItem: (id, item) => update(d => ({ ...d, roadmap: d.roadmap.map(r => r.id === id ? { ...r, ...item } : r) })),
    deleteRoadmapItem: (id) => update(d => ({ ...d, roadmap: d.roadmap.filter(r => r.id !== id) })),
    reorderRoadmap: (roadmap) => update(d => ({ ...d, roadmap })),

    addFutureProject: (proj) => update(d => ({ ...d, futureProjects: [...d.futureProjects, { ...proj, id: uid(), order: d.futureProjects.length }] })),
    updateFutureProject: (id, proj) => update(d => ({ ...d, futureProjects: d.futureProjects.map(p => p.id === id ? { ...p, ...proj } : p) })),
    deleteFutureProject: (id) => update(d => ({ ...d, futureProjects: d.futureProjects.filter(p => p.id !== id) })),

    addContactMessage: (msg) => update(d => ({ ...d, contactMessages: [...d.contactMessages, { ...msg, id: uid(), date: new Date().toISOString(), resolved: false }] })),
    deleteContactMessage: (id) => update(d => ({ ...d, contactMessages: d.contactMessages.filter(m => m.id !== id) })),
    resolveContactMessage: (id) => update(d => ({ ...d, contactMessages: d.contactMessages.map(m => m.id === id ? { ...m, resolved: true } : m) })),

    addSocialLink: (link) => update(d => ({ ...d, socialLinks: [...d.socialLinks, { ...link, id: uid(), order: d.socialLinks.length }] })),
    updateSocialLink: (id, link) => update(d => ({ ...d, socialLinks: d.socialLinks.map(s => s.id === id ? { ...s, ...link } : s) })),
    deleteSocialLink: (id) => update(d => ({
      ...d,
      socialLinks: d.socialLinks.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx }))
    })),
    reorderSocialLinks: (socialLinks) => update(d => ({ ...d, socialLinks })),
    updateSiteSettings: (siteSettings) => update(d => ({ ...d, siteSettings })),
    updateSectionVisibility: (sectionVisibility) => update(d => ({ ...d, sectionVisibility })),
    incrementVisitors: () => update(d => ({ ...d, visitors: d.visitors + 1 })),
  };

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
