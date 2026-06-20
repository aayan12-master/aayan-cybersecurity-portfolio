import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

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

// ─── DB Column Mappers ────────────────────────────────────────────────────────

const mapServiceFromDB = (s: any): Service => ({
  id: s.id,
  title: s.title,
  description: s.description,
  iconName: s.icon_name,
  ctaText: s.cta_text || undefined,
  actionType: s.action_type || undefined,
  inquirySubject: s.inquiry_subject || undefined,
  externalUrl: s.external_url || undefined,
  order: s.order
});

const mapServiceToDB = (s: Service) => ({
  id: s.id,
  title: s.title,
  description: s.description,
  icon_name: s.iconName,
  cta_text: s.ctaText || null,
  action_type: s.actionType || null,
  inquiry_subject: s.inquirySubject || null,
  external_url: s.externalUrl || null,
  order: s.order
});

const mapCertFromDB = (c: any): Certification => ({
  id: c.id,
  title: c.title,
  issuer: c.issuer,
  issueDate: c.issue_date,
  status: c.status,
  description: c.description,
  imageUrl: c.image_url,
  pdfUrl: c.pdf_url,
  verificationLink: c.verification_link,
  credentialId: c.credential_id,
  order: c.order
});

const mapCertToDB = (c: Certification) => ({
  id: c.id,
  title: c.title,
  issuer: c.issuer,
  issue_date: c.issueDate,
  status: c.status,
  description: c.description,
  image_url: c.imageUrl,
  pdf_url: c.pdfUrl,
  verification_link: c.verificationLink,
  credential_id: c.credentialId,
  order: c.order
});

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

  // Keep localStorage as a synchronous offline backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Seeding routine
  const seedDatabase = async () => {
    console.log('Supabase database is empty. Seeding with default data...');
    try {
      // 1. Seed configs
      const configs = [
        { key: 'hero', value: DEFAULT_DATA.hero },
        { key: 'about', value: DEFAULT_DATA.about },
        { key: 'education', value: DEFAULT_DATA.education },
        { key: 'training', value: DEFAULT_DATA.training },
        { key: 'siteSettings', value: DEFAULT_DATA.siteSettings },
        { key: 'sectionVisibility', value: DEFAULT_DATA.sectionVisibility }
      ];
      await supabase.from('portfolio_configs').upsert(configs);

      // 2. Seed lists
      if (DEFAULT_DATA.skills.length > 0) {
        await supabase.from('skills').upsert(DEFAULT_DATA.skills);
      }
      if (DEFAULT_DATA.services.length > 0) {
        const dbServices = DEFAULT_DATA.services.map(mapServiceToDB);
        await supabase.from('services').upsert(dbServices);
      }
      if (DEFAULT_DATA.projects.length > 0) {
        await supabase.from('projects').upsert(DEFAULT_DATA.projects);
      }
      if (DEFAULT_DATA.certifications.length > 0) {
        const dbCerts = DEFAULT_DATA.certifications.map(mapCertToDB);
        await supabase.from('certifications').upsert(dbCerts);
      }
      if (DEFAULT_DATA.roadmap.length > 0) {
        await supabase.from('roadmap_items').upsert(DEFAULT_DATA.roadmap);
      }
      if (DEFAULT_DATA.futureProjects.length > 0) {
        await supabase.from('future_projects').upsert(DEFAULT_DATA.futureProjects);
      }
      if (DEFAULT_DATA.socialLinks.length > 0) {
        await supabase.from('social_links').upsert(DEFAULT_DATA.socialLinks);
      }
      console.log('Database seeding completed successfully.');
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  };

  // Hydrate context from Supabase on mount
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        console.log('Hydrating context from Supabase...');
        const [
          configsRes,
          skillsRes,
          servicesRes,
          projectsRes,
          certsRes,
          roadmapRes,
          futureRes,
          socialRes
        ] = await Promise.all([
          supabase.from('portfolio_configs').select('*'),
          supabase.from('skills').select('*').order('order', { ascending: true }),
          supabase.from('services').select('*').order('order', { ascending: true }),
          supabase.from('projects').select('*').order('order', { ascending: true }),
          supabase.from('certifications').select('*').order('order', { ascending: true }),
          supabase.from('roadmap_items').select('*').order('order', { ascending: true }),
          supabase.from('future_projects').select('*').order('order', { ascending: true }),
          supabase.from('social_links').select('*').order('order', { ascending: true })
        ]);

        // If core table configurations query fails because it doesn't exist, fallback to localStorage
        if (configsRes.error && (configsRes.error.code === 'PGRST205' || configsRes.error.message.includes('relation'))) {
          console.warn('Supabase DDL tables are missing in the schema. Falling back to local storage cache.');
          return;
        }

        const hasConfigs = configsRes.data && configsRes.data.length > 0;
        const { data: { session } } = await supabase.auth.getSession();

        // Trigger automatic seeding if database exists but is completely empty and authenticated
        if (!hasConfigs && session) {
          await seedDatabase();
          // Reload values after seeding completes
          loadSupabaseData();
          return;
        }

        // Parse configurations
        let hero = DEFAULT_DATA.hero;
        let about = DEFAULT_DATA.about;
        let education = DEFAULT_DATA.education;
        let training = DEFAULT_DATA.training;
        let siteSettings = DEFAULT_DATA.siteSettings;
        let sectionVisibility = DEFAULT_DATA.sectionVisibility;

        if (configsRes.data) {
          configsRes.data.forEach((row: any) => {
            if (row.key === 'hero') hero = row.value;
            else if (row.key === 'about') about = row.value;
            else if (row.key === 'education') education = row.value;
            else if (row.key === 'training') training = row.value;
            else if (row.key === 'siteSettings') siteSettings = row.value;
            else if (row.key === 'sectionVisibility') sectionVisibility = row.value;
          });
        }

        // Parse lists
        const skills = skillsRes.data || [];
        const services = (servicesRes.data || []).map(mapServiceFromDB);
        const projects = projectsRes.data || [];
        const certifications = (certsRes.data || []).map(mapCertFromDB);
        const roadmap = roadmapRes.data || [];
        const futureProjects = futureRes.data || [];
        const socialLinks = socialRes.data || [];

        // Load contact messages if authenticated
        let contactMessages = data.contactMessages;
        if (session) {
          const { data: msgs, error: msgsError } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
          if (!msgsError && msgs) {
            contactMessages = msgs.map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              subject: m.subject,
              message: m.message,
              date: m.created_at,
              resolved: m.resolved
            }));
          }
        }

        setData(prev => ({
          ...prev,
          hero,
          about,
          education,
          training,
          siteSettings,
          sectionVisibility,
          skills,
          services,
          projects,
          certifications,
          roadmap,
          futureProjects,
          socialLinks,
          contactMessages
        }));
        console.log('Context successfully hydrated from Supabase.');
      } catch (err) {
        console.error('Error loading data from Supabase, falling back:', err);
      }
    };

    loadSupabaseData();
  }, []);

  const update = (updater: (prev: SiteData) => SiteData) => setData(updater);

  const ctx: DataContextType = {
    data,
    updateHero: async (hero) => {
      update(d => ({ ...d, hero }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'hero', value: hero });
      } catch (err) { console.error('Error saving hero:', err); }
    },
    updateAbout: async (about) => {
      update(d => ({ ...d, about }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'about', value: about });
      } catch (err) { console.error('Error saving about:', err); }
    },
    updateEducation: async (edu) => {
      update(d => ({ ...d, education: edu }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'education', value: edu });
      } catch (err) { console.error('Error saving education:', err); }
    },
    updateTraining: async (training) => {
      update(d => ({ ...d, training }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'training', value: training });
      } catch (err) { console.error('Error saving training:', err); }
    },

    addSkill: async (skill) => {
      const newItem = { ...skill, id: uid(), order: data.skills.length };
      update(d => ({ ...d, skills: [...d.skills, newItem] }));
      try {
        await supabase.from('skills').insert(newItem);
      } catch (err) { console.error('Error adding skill:', err); }
    },
    updateSkill: async (id, skill) => {
      update(d => ({ ...d, skills: d.skills.map(s => s.id === id ? { ...s, ...skill } : s) }));
      try {
        await supabase.from('skills').update(skill).eq('id', id);
      } catch (err) { console.error('Error updating skill:', err); }
    },
    deleteSkill: async (id) => {
      update(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }));
      try {
        await supabase.from('skills').delete().eq('id', id);
      } catch (err) { console.error('Error deleting skill:', err); }
    },
    reorderSkills: async (skills) => {
      update(d => ({ ...d, skills }));
      try {
        await supabase.from('skills').upsert(skills);
      } catch (err) { console.error('Error reordering skills:', err); }
    },

    addService: async (service) => {
      const newItem = { ...service, id: uid(), order: data.services.length };
      update(d => ({ ...d, services: [...d.services, newItem] }));
      try {
        await supabase.from('services').insert(mapServiceToDB(newItem));
      } catch (err) { console.error('Error adding service:', err); }
    },
    updateService: async (id, service) => {
      update(d => ({ ...d, services: d.services.map(s => s.id === id ? { ...s, ...service } : s) }));
      const mappedUpdate: any = {};
      if (service.title !== undefined) mappedUpdate.title = service.title;
      if (service.description !== undefined) mappedUpdate.description = service.description;
      if (service.iconName !== undefined) mappedUpdate.icon_name = service.iconName;
      if (service.ctaText !== undefined) mappedUpdate.cta_text = service.ctaText;
      if (service.actionType !== undefined) mappedUpdate.action_type = service.actionType;
      if (service.inquirySubject !== undefined) mappedUpdate.inquiry_subject = service.inquirySubject;
      if (service.externalUrl !== undefined) mappedUpdate.external_url = service.externalUrl;
      if (service.order !== undefined) mappedUpdate.order = service.order;

      try {
        await supabase.from('services').update(mappedUpdate).eq('id', id);
      } catch (err) { console.error('Error updating service:', err); }
    },
    deleteService: async (id) => {
      update(d => ({ ...d, services: d.services.filter(s => s.id !== id) }));
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) { console.error('Error deleting service:', err); }
    },

    addProject: async (project) => {
      const newItem = { ...project, id: uid(), order: data.projects.length };
      update(d => ({ ...d, projects: [...d.projects, newItem] }));
      try {
        await supabase.from('projects').insert(newItem);
      } catch (err) { console.error('Error adding project:', err); }
    },
    updateProject: async (id, project) => {
      update(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...project } : p) }));
      try {
        await supabase.from('projects').update(project).eq('id', id);
      } catch (err) { console.error('Error updating project:', err); }
    },
    deleteProject: async (id) => {
      update(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) { console.error('Error deleting project:', err); }
    },

    addCertification: async (cert) => {
      const newItem = { ...cert, id: uid(), order: data.certifications.length };
      update(d => ({ ...d, certifications: [...d.certifications, newItem] }));
      try {
        await supabase.from('certifications').insert(mapCertToDB(newItem));
      } catch (err) { console.error('Error adding certification:', err); }
    },
    updateCertification: async (id, cert) => {
      update(d => ({ ...d, certifications: d.certifications.map(c => c.id === id ? { ...c, ...cert } : c) }));
      const mappedUpdate: any = {};
      if (cert.title !== undefined) mappedUpdate.title = cert.title;
      if (cert.issuer !== undefined) mappedUpdate.issuer = cert.issuer;
      if (cert.issueDate !== undefined) mappedUpdate.issue_date = cert.issueDate;
      if (cert.status !== undefined) mappedUpdate.status = cert.status;
      if (cert.description !== undefined) mappedUpdate.description = cert.description;
      if (cert.imageUrl !== undefined) mappedUpdate.image_url = cert.imageUrl;
      if (cert.pdfUrl !== undefined) mappedUpdate.pdf_url = cert.pdfUrl;
      if (cert.verificationLink !== undefined) mappedUpdate.verification_link = cert.verificationLink;
      if (cert.credentialId !== undefined) mappedUpdate.credential_id = cert.credentialId;
      if (cert.order !== undefined) mappedUpdate.order = cert.order;

      try {
        await supabase.from('certifications').update(mappedUpdate).eq('id', id);
      } catch (err) { console.error('Error updating certification:', err); }
    },
    deleteCertification: async (id) => {
      update(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) }));
      try {
        await supabase.from('certifications').delete().eq('id', id);
      } catch (err) { console.error('Error deleting certification:', err); }
    },

    addRoadmapItem: async (item) => {
      const newItem = { ...item, id: uid(), order: data.roadmap.length };
      update(d => ({ ...d, roadmap: [...d.roadmap, newItem] }));
      try {
        await supabase.from('roadmap_items').insert(newItem);
      } catch (err) { console.error('Error adding roadmap item:', err); }
    },
    updateRoadmapItem: async (id, item) => {
      update(d => ({ ...d, roadmap: d.roadmap.map(r => r.id === id ? { ...r, ...item } : r) }));
      try {
        await supabase.from('roadmap_items').update(item).eq('id', id);
      } catch (err) { console.error('Error updating roadmap item:', err); }
    },
    deleteRoadmapItem: async (id) => {
      update(d => ({ ...d, roadmap: d.roadmap.filter(r => r.id !== id) }));
      try {
        await supabase.from('roadmap_items').delete().eq('id', id);
      } catch (err) { console.error('Error deleting roadmap item:', err); }
    },
    reorderRoadmap: async (roadmap) => {
      update(d => ({ ...d, roadmap }));
      try {
        await supabase.from('roadmap_items').upsert(roadmap);
      } catch (err) { console.error('Error reordering roadmap:', err); }
    },

    addFutureProject: async (proj) => {
      const newItem = { ...proj, id: uid(), order: data.futureProjects.length };
      update(d => ({ ...d, futureProjects: [...d.futureProjects, newItem] }));
      try {
        await supabase.from('future_projects').insert(newItem);
      } catch (err) { console.error('Error adding future project:', err); }
    },
    updateFutureProject: async (id, proj) => {
      update(d => ({ ...d, futureProjects: d.futureProjects.map(p => p.id === id ? { ...p, ...proj } : p) }));
      try {
        await supabase.from('future_projects').update(proj).eq('id', id);
      } catch (err) { console.error('Error updating future project:', err); }
    },
    deleteFutureProject: async (id) => {
      update(d => ({ ...d, futureProjects: d.futureProjects.filter(p => p.id !== id) }));
      try {
        await supabase.from('future_projects').delete().eq('id', id);
      } catch (err) { console.error('Error deleting future project:', err); }
    },

    addContactMessage: (msg) => update(d => ({ ...d, contactMessages: [...d.contactMessages, { ...msg, id: uid(), date: new Date().toISOString(), resolved: false }] })),
    deleteContactMessage: async (id) => {
      update(d => ({ ...d, contactMessages: d.contactMessages.filter(m => m.id !== id) }));
      try {
        await supabase.from('contact_messages').delete().eq('id', id);
      } catch (err) { console.error('Error deleting message:', err); }
    },
    resolveContactMessage: async (id) => {
      update(d => ({ ...d, contactMessages: d.contactMessages.map(m => m.id === id ? { ...m, resolved: true } : m) }));
      try {
        await supabase.from('contact_messages').update({ resolved: true }).eq('id', id);
      } catch (err) { console.error('Error resolving message:', err); }
    },

    addSocialLink: async (link) => {
      const newItem = { ...link, id: uid(), order: data.socialLinks.length };
      update(d => ({ ...d, socialLinks: [...d.socialLinks, newItem] }));
      try {
        await supabase.from('social_links').insert(newItem);
      } catch (err) { console.error('Error adding social link:', err); }
    },
    updateSocialLink: async (id, link) => {
      update(d => ({ ...d, socialLinks: d.socialLinks.map(s => s.id === id ? { ...s, ...link } : s) }));
      try {
        await supabase.from('social_links').update(link).eq('id', id);
      } catch (err) { console.error('Error updating social link:', err); }
    },
    deleteSocialLink: async (id) => {
      const updated = data.socialLinks.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx }));
      update(d => ({ ...d, socialLinks: updated }));
      try {
        await supabase.from('social_links').delete().eq('id', id);
        if (updated.length > 0) {
          await supabase.from('social_links').upsert(updated);
        }
      } catch (err) { console.error('Error deleting social link:', err); }
    },
    reorderSocialLinks: async (socialLinks) => {
      update(d => ({ ...d, socialLinks }));
      try {
        await supabase.from('social_links').upsert(socialLinks);
      } catch (err) { console.error('Error reordering social links:', err); }
    },

    updateSiteSettings: async (settings) => {
      update(d => ({ ...d, siteSettings: settings }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'siteSettings', value: settings });
      } catch (err) { console.error('Error saving site settings:', err); }
    },
    updateSectionVisibility: async (visibility) => {
      update(d => ({ ...d, sectionVisibility: visibility }));
      try {
        await supabase.from('portfolio_configs').upsert({ key: 'sectionVisibility', value: visibility });
      } catch (err) { console.error('Error saving section visibility:', err); }
    },
    incrementVisitors: () => update(d => ({ ...d, visitors: d.visitors + 1 })),
  };

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
