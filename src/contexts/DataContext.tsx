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
  heroStatValue: string;
  heroStatLabel: string;
  badgeTitle: string;
  badgeSubtitle: string;
  showProfileBadge: boolean;
  resumeUrl: string;
  showResumeButton: boolean;
  resumeButtonText: string;
  profilePhotoUrl: string;
}

export interface AboutContent {
  heading: string;
  bio: string;
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
  githubUrl: string;
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

const mapProjectFromDB = (p: any): Project => ({
  id: p.id,
  title: p.title,
  category: p.category,
  description: p.description,
  githubUrl: (p.github_link === '#' || !p.github_link) ? '' : p.github_link,
  demoLink: (p.demo_link === '#' || !p.demo_link) ? '' : p.demo_link,
  thumbnail: p.thumbnail || '',
  order: p.order
});

const mapProjectToDB = (p: Project) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  description: p.description,
  github_link: (p.githubUrl === '#' || !p.githubUrl) ? '' : p.githubUrl,
  demo_link: (p.demoLink === '#' || !p.demoLink) ? '' : p.demoLink,
  thumbnail: p.thumbnail || '',
  order: p.order
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
    heroStatValue: '2-3',
    heroStatLabel: 'Hours Daily Learning Journey',
    badgeTitle: 'Training',
    badgeSubtitle: 'Skill Rise Academy',
    showProfileBadge: true,
    resumeUrl: '',
    showResumeButton: false,
    resumeButtonText: 'Download Resume',
    profilePhotoUrl: '',
  },
  about: {
    heading: 'About Me',
    bio: 'I am Aayan G. Sayyad, a Cyber Security Student and Cyber Security Enthusiast from Ahmednagar, Maharashtra, India. I completed my Bachelor of Science (B.Sc.) in Computer Science in 2026 from Marutraoji Ghule Patil College.\n\nCurrently, I am pursuing a Cyber Security Training Program at Skill Rise Academy in Hyderabad, where I am building practical knowledge in networking, Linux, security concepts, and hands-on cybersecurity labs.\n\nMy interest in cybersecurity comes from solving security challenges and continuously learning how technology can be secured against modern threats. My long-term vision is to build a cybersecurity company and contribute meaningful solutions to the cybersecurity industry.',
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
    { id: uid(), title: 'Network Traffic Analyzer', category: 'Python Tool', description: 'A custom packet sniffer built with Scapy to identify suspicious network behaviors.', githubUrl: '', demoLink: '', thumbnail: '', order: 0 },
    { id: uid(), title: 'Automated Linux Hardening', category: 'Bash Script', description: 'A script that automatically applies CIS benchmarks to secure Ubuntu servers.', githubUrl: '', demoLink: '', thumbnail: '', order: 1 },
    { id: uid(), title: 'Vulnerability Scanner', category: 'Security Research', description: 'A lightweight scanner integrating multiple open-source tools into a single dashboard.', githubUrl: '', demoLink: '', thumbnail: '', order: 2 },
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
  addSkill: (skill: Omit<Skill, 'id' | 'order'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  reorderSkills: (skills: Skill[]) => void;
  addService: (service: Omit<Service, 'id' | 'order'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'order'>, onSuccess?: () => void) => void;
  updateProject: (id: string, project: Partial<Project>, onSuccess?: () => void) => void;
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

        let sanitizedProjects = DEFAULT_DATA.projects;
        if (parsed.projects && Array.isArray(parsed.projects)) {
          sanitizedProjects = parsed.projects.map((p: any) => ({
            ...p,
            githubUrl: (p.githubUrl === '#' || !p.githubUrl) ? '' : p.githubUrl,
            demoLink: (p.demoLink === '#' || !p.demoLink) ? '' : p.demoLink
          }));
        }

        return {
          ...DEFAULT_DATA,
          ...parsed,
          hero: { ...DEFAULT_DATA.hero, ...parsed.hero },
          about: { ...DEFAULT_DATA.about, ...parsed.about },
          projects: sanitizedProjects,
          socialLinks: migratedSocialLinks,
          siteSettings: { ...DEFAULT_DATA.siteSettings, ...parsed.siteSettings },
          sectionVisibility: { ...DEFAULT_DATA.sectionVisibility, ...parsed.sectionVisibility },
        };
      }
    } catch { /* ignore */ }
    return DEFAULT_DATA;
  });

  // Keep localStorage as a backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Seeding routine for individual lists and missing configs
  const seedDatabase = async (configsRes: any, skillsRes: any, servicesRes: any, projectsRes: any, certsRes: any, roadmapRes: any, futureRes: any, socialRes: any) => {
    console.log('[Supabase Seed] Checking for empty configurations or lists to seed...');
    try {
      // 1. Seed missing configurations
      const existingKeys = (configsRes.data || []).map((r: any) => r.key);
      const requiredConfigs = [
        { key: 'hero', value: DEFAULT_DATA.hero },
        { key: 'about', value: DEFAULT_DATA.about },
        { key: 'siteSettings', value: DEFAULT_DATA.siteSettings },
        { key: 'sectionVisibility', value: DEFAULT_DATA.sectionVisibility }
      ];
      const missingConfigs = requiredConfigs.filter(rc => !existingKeys.includes(rc.key));
      if (missingConfigs.length > 0) {
        console.log('[Supabase Seed] Seeding missing configs:', missingConfigs.map(c => c.key));
        const res = await supabase.from('portfolio_configs').upsert(missingConfigs);
        console.log('[Supabase Seed Response] portfolio_configs:', { status: res.status, error: res.error });
      }

      // 2. Seed missing lists
      if ((!skillsRes.data || skillsRes.data.length === 0) && DEFAULT_DATA.skills.length > 0) {
        console.log('[Supabase Seed] Seeding skills list...');
        const res = await supabase.from('skills').upsert(DEFAULT_DATA.skills);
        console.log('[Supabase Seed Response] skills:', { status: res.status, error: res.error });
      }
      if ((!servicesRes.data || servicesRes.data.length === 0) && DEFAULT_DATA.services.length > 0) {
        console.log('[Supabase Seed] Seeding services list...');
        const res = await supabase.from('services').upsert(DEFAULT_DATA.services.map(mapServiceToDB));
        console.log('[Supabase Seed Response] services:', { status: res.status, error: res.error });
      }
      if ((!projectsRes.data || projectsRes.data.length === 0) && DEFAULT_DATA.projects.length > 0) {
        console.log('[Supabase Seed] Seeding projects list...');
        const res = await supabase.from('projects').upsert(DEFAULT_DATA.projects.map(mapProjectToDB));
        console.log('[Supabase Seed Response] projects:', { status: res.status, error: res.error });
      }
      if ((!certsRes.data || certsRes.data.length === 0) && DEFAULT_DATA.certifications.length > 0) {
        console.log('[Supabase Seed] Seeding certifications list...');
        const res = await supabase.from('certifications').upsert(DEFAULT_DATA.certifications.map(mapCertToDB));
        console.log('[Supabase Seed Response] certifications:', { status: res.status, error: res.error });
      }
      if ((!roadmapRes.data || roadmapRes.data.length === 0) && DEFAULT_DATA.roadmap.length > 0) {
        console.log('[Supabase Seed] Seeding roadmap list...');
        const res = await supabase.from('roadmap_items').upsert(DEFAULT_DATA.roadmap);
        console.log('[Supabase Seed Response] roadmap_items:', { status: res.status, error: res.error });
      }
      if ((!futureRes.data || futureRes.data.length === 0) && DEFAULT_DATA.futureProjects.length > 0) {
        console.log('[Supabase Seed] Seeding future_projects list...');
        const res = await supabase.from('future_projects').upsert(DEFAULT_DATA.futureProjects);
        console.log('[Supabase Seed Response] future_projects:', { status: res.status, error: res.error });
      }
      if ((!socialRes.data || socialRes.data.length === 0) && DEFAULT_DATA.socialLinks.length > 0) {
        console.log('[Supabase Seed] Seeding social_links list...');
        const res = await supabase.from('social_links').upsert(DEFAULT_DATA.socialLinks);
        console.log('[Supabase Seed Response] social_links:', { status: res.status, error: res.error });
      }
      console.log('[Supabase Seed] Seeding check completed.');
    } catch (err) {
      console.error('[Supabase Seed Exception] Error seeding tables:', err);
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

        const { data: { session } } = await supabase.auth.getSession();

        // Perform seeding check for any unseeded configs/lists if authenticated admin is logged in
        if (session) {
          await seedDatabase(configsRes, skillsRes, servicesRes, projectsRes, certsRes, roadmapRes, futureRes, socialRes);
          // Refetch to get newly seeded records
          const [
            newConfigs,
            newSkills,
            newServices,
            newProjects,
            newCerts,
            newRoadmap,
            newFuture,
            newSocial
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
          configsRes.data = newConfigs.data;
          skillsRes.data = newSkills.data;
          servicesRes.data = newServices.data;
          projectsRes.data = newProjects.data;
          certsRes.data = newCerts.data;
          roadmapRes.data = newRoadmap.data;
          futureRes.data = newFuture.data;
          socialRes.data = newSocial.data;
        }

        // Parse configurations
        let hero = DEFAULT_DATA.hero;
        let about = DEFAULT_DATA.about;
        let siteSettings = DEFAULT_DATA.siteSettings;
        let sectionVisibility = DEFAULT_DATA.sectionVisibility;

        if (configsRes.data && configsRes.data.length > 0) {
          configsRes.data.forEach((row: any) => {
            if (row.key === 'hero') {
              hero = {
                ...DEFAULT_DATA.hero,
                ...row.value,
                heroStatValue: row.value.heroStatValue || row.value.learningHours || '2-3',
                heroStatLabel: row.value.heroStatLabel || 'Hours Daily Learning Journey',
                badgeTitle: row.value.badgeTitle || 'Training',
                badgeSubtitle: row.value.badgeSubtitle || row.value.trainingBadge || 'Skill Rise Academy',
                 showProfileBadge: row.value.showProfileBadge !== undefined ? row.value.showProfileBadge : true,
                resumeUrl: row.value.resumeUrl !== undefined ? row.value.resumeUrl : '',
                showResumeButton: row.value.showResumeButton !== undefined ? row.value.showResumeButton : false,
                resumeButtonText: row.value.resumeButtonText || 'Download Resume',
                profilePhotoUrl: row.value.profilePhotoUrl !== undefined ? row.value.profilePhotoUrl : ''
              };
            }
            else if (row.key === 'about') {
              about = {
                heading: row.value?.heading || DEFAULT_DATA.about.heading,
                bio: row.value?.bio || DEFAULT_DATA.about.bio
              };
            }
            else if (row.key === 'siteSettings') siteSettings = row.value;
            else if (row.key === 'sectionVisibility') sectionVisibility = row.value;
          });
        }

        // Parse lists (fall back to DEFAULT_DATA only if database query returned no results/null)
        const skills = skillsRes.data && skillsRes.data.length > 0 ? skillsRes.data : DEFAULT_DATA.skills;
        const services = servicesRes.data && servicesRes.data.length > 0 
          ? servicesRes.data.map(mapServiceFromDB) 
          : DEFAULT_DATA.services;
        const projects = projectsRes.data && projectsRes.data.length > 0 
          ? projectsRes.data.map(mapProjectFromDB) 
          : DEFAULT_DATA.projects;
        const certifications = certsRes.data && certsRes.data.length > 0 
          ? certsRes.data.map(mapCertFromDB) 
          : DEFAULT_DATA.certifications;
        const roadmap = roadmapRes.data && roadmapRes.data.length > 0 ? roadmapRes.data : DEFAULT_DATA.roadmap;
        const futureProjects = futureRes.data && futureRes.data.length > 0 ? futureRes.data : DEFAULT_DATA.futureProjects;
        const socialLinks = socialRes.data && socialRes.data.length > 0 ? socialRes.data : DEFAULT_DATA.socialLinks;

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
      const tableName = 'portfolio_configs';
      const payload = { key: 'hero', value: hero };
      try {
        const res = await supabase.from(tableName).upsert(payload);
        console.log(`[Supabase Write] Table: ${tableName}`, { payload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName}`, err);
      }
    },
    updateAbout: async (about) => {
      update(d => ({ ...d, about }));
      const tableName = 'portfolio_configs';
      const payload = { key: 'about', value: about };
      try {
        const res = await supabase.from(tableName).upsert(payload);
        console.log(`[Supabase Write] Table: ${tableName}`, { payload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName}`, err);
      }
    },


    addSkill: async (skill) => {
      const newItem = { ...skill, id: uid(), order: data.skills.length };
      update(d => ({ ...d, skills: [...d.skills, newItem] }));
      const tableName = 'skills';
      try {
        const res = await supabase.from(tableName).insert(newItem);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: newItem, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateSkill: async (id, skill) => {
      update(d => ({ ...d, skills: d.skills.map(s => s.id === id ? { ...s, ...skill } : s) }));
      const tableName = 'skills';
      try {
        const res = await supabase.from(tableName).update(skill).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: skill, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteSkill: async (id) => {
      update(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }));
      const tableName = 'skills';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },
    reorderSkills: async (skills) => {
      update(d => ({ ...d, skills }));
      const tableName = 'skills';
      try {
        const res = await supabase.from(tableName).upsert(skills);
        console.log(`[Supabase Write] Table: ${tableName} (Reorder/Upsert)`, { payload: skills, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Reorder)`, err);
      }
    },

    addService: async (service) => {
      const newItem = { ...service, id: uid(), order: data.services.length };
      update(d => ({ ...d, services: [...d.services, newItem] }));
      const tableName = 'services';
      const dbPayload = mapServiceToDB(newItem);
      try {
        const res = await supabase.from(tableName).insert(dbPayload);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: dbPayload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateService: async (id, service) => {
      update(d => ({ ...d, services: d.services.map(s => s.id === id ? { ...s, ...service } : s) }));
      const tableName = 'services';
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
        const res = await supabase.from(tableName).update(mappedUpdate).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: mappedUpdate, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteService: async (id) => {
      update(d => ({ ...d, services: d.services.filter(s => s.id !== id) }));
      const tableName = 'services';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },

    addProject: async (project, onSuccess) => {
      const newItem = { ...project, id: uid(), order: data.projects.length };
      update(d => ({ ...d, projects: [...d.projects, newItem] }));
      const tableName = 'projects';
      // Ensure no null values for NOT NULL columns
      const dbPayload = {
        ...mapProjectToDB(newItem),
        github_link: newItem.githubUrl || '',
        demo_link: newItem.demoLink || '',
        thumbnail: newItem.thumbnail || '',
      };
      try {
        const res = await supabase.from(tableName).insert(dbPayload);
        if (res.error) {
          console.error(`[Supabase Write] ${tableName} (Add) ERROR:`, res.error);
        } else {
          console.log(`[Supabase Write] ${tableName} (Add) OK — status ${res.status}`);
          onSuccess?.();
        }
      } catch (err: any) {
        console.error(`[Supabase Exception] ${tableName} (Add)`, err);
      }
    },
    updateProject: async (id, project, onSuccess) => {
      update(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...project } : p) }));
      const tableName = 'projects';
      const mappedUpdate: any = {};
      if (project.title !== undefined) mappedUpdate.title = project.title;
      if (project.category !== undefined) mappedUpdate.category = project.category;
      if (project.description !== undefined) mappedUpdate.description = project.description;
      // Coerce null/# to '' for NOT NULL columns
      if (project.githubUrl !== undefined) mappedUpdate.github_link = (project.githubUrl === '#' || !project.githubUrl) ? '' : project.githubUrl;
      if (project.demoLink !== undefined) mappedUpdate.demo_link = (project.demoLink === '#' || !project.demoLink) ? '' : project.demoLink;
      if (project.thumbnail !== undefined) mappedUpdate.thumbnail = project.thumbnail || '';
      if (project.order !== undefined) mappedUpdate.order = project.order;
      try {
        const res = await supabase.from(tableName).update(mappedUpdate).eq('id', id);
        if (res.error) {
          console.error(`[Supabase Write] ${tableName} (Update) ERROR:`, res.error);
        } else {
          console.log(`[Supabase Write] ${tableName} (Update) OK — status ${res.status}`);
          onSuccess?.();
        }
      } catch (err: any) {
        console.error(`[Supabase Exception] ${tableName} (Update)`, err);
      }
    },
    deleteProject: async (id) => {
      update(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
      const tableName = 'projects';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        if (res.error) {
          console.error(`[Supabase Write] ${tableName} (Delete) ERROR:`, res.error);
        } else {
          console.log(`[Supabase Write] ${tableName} (Delete) OK — status ${res.status}`);
        }
      } catch (err: any) {
        console.error(`[Supabase Exception] ${tableName} (Delete)`, err);
      }
    },

    addCertification: async (cert) => {
      const newItem = { ...cert, id: uid(), order: data.certifications.length };
      update(d => ({ ...d, certifications: [...d.certifications, newItem] }));
      const tableName = 'certifications';
      const dbPayload = mapCertToDB(newItem);
      try {
        const res = await supabase.from(tableName).insert(dbPayload);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: dbPayload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateCertification: async (id, cert) => {
      update(d => ({ ...d, certifications: d.certifications.map(c => c.id === id ? { ...c, ...cert } : c) }));
      const tableName = 'certifications';
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
        const res = await supabase.from(tableName).update(mappedUpdate).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: mappedUpdate, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteCertification: async (id) => {
      update(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) }));
      const tableName = 'certifications';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },

    addRoadmapItem: async (item) => {
      const newItem = { ...item, id: uid(), order: data.roadmap.length };
      update(d => ({ ...d, roadmap: [...d.roadmap, newItem] }));
      const tableName = 'roadmap_items';
      try {
        const res = await supabase.from(tableName).insert(newItem);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: newItem, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateRoadmapItem: async (id, item) => {
      update(d => ({ ...d, roadmap: d.roadmap.map(r => r.id === id ? { ...r, ...item } : r) }));
      const tableName = 'roadmap_items';
      try {
        const res = await supabase.from(tableName).update(item).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: item, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteRoadmapItem: async (id) => {
      update(d => ({ ...d, roadmap: d.roadmap.filter(r => r.id !== id) }));
      const tableName = 'roadmap_items';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },
    reorderRoadmap: async (roadmap) => {
      update(d => ({ ...d, roadmap }));
      const tableName = 'roadmap_items';
      try {
        const res = await supabase.from(tableName).upsert(roadmap);
        console.log(`[Supabase Write] Table: ${tableName} (Reorder/Upsert)`, { payload: roadmap, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Reorder)`, err);
      }
    },

    addFutureProject: async (proj) => {
      const newItem = { ...proj, id: uid(), order: data.futureProjects.length };
      update(d => ({ ...d, futureProjects: [...d.futureProjects, newItem] }));
      const tableName = 'future_projects';
      try {
        const res = await supabase.from(tableName).insert(newItem);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: newItem, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateFutureProject: async (id, proj) => {
      update(d => ({ ...d, futureProjects: d.futureProjects.map(p => p.id === id ? { ...p, ...proj } : p) }));
      const tableName = 'future_projects';
      try {
        const res = await supabase.from(tableName).update(proj).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: proj, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteFutureProject: async (id) => {
      update(d => ({ ...d, futureProjects: d.futureProjects.filter(p => p.id !== id) }));
      const tableName = 'future_projects';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },

    addContactMessage: (msg) => update(d => ({ ...d, contactMessages: [...d.contactMessages, { ...msg, id: uid(), date: new Date().toISOString(), resolved: false }] })),
    deleteContactMessage: async (id) => {
      update(d => ({ ...d, contactMessages: d.contactMessages.filter(m => m.id !== id) }));
      const tableName = 'contact_messages';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },
    resolveContactMessage: async (id) => {
      update(d => ({ ...d, contactMessages: d.contactMessages.map(m => m.id === id ? { ...m, resolved: true } : m) }));
      const tableName = 'contact_messages';
      try {
        const res = await supabase.from(tableName).update({ resolved: true }).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update/Resolve)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update/Resolve)`, err);
      }
    },

    addSocialLink: async (link) => {
      const newItem = { ...link, id: uid(), order: data.socialLinks.length };
      update(d => ({ ...d, socialLinks: [...d.socialLinks, newItem] }));
      const tableName = 'social_links';
      try {
        const res = await supabase.from(tableName).insert(newItem);
        console.log(`[Supabase Write] Table: ${tableName} (Add)`, { payload: newItem, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Add)`, err);
      }
    },
    updateSocialLink: async (id, link) => {
      update(d => ({ ...d, socialLinks: d.socialLinks.map(s => s.id === id ? { ...s, ...link } : s) }));
      const tableName = 'social_links';
      try {
        const res = await supabase.from(tableName).update(link).eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Update)`, { id, payload: link, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Update)`, err);
      }
    },
    deleteSocialLink: async (id) => {
      const updated = data.socialLinks.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx }));
      update(d => ({ ...d, socialLinks: updated }));
      const tableName = 'social_links';
      try {
        const res = await supabase.from(tableName).delete().eq('id', id);
        console.log(`[Supabase Write] Table: ${tableName} (Delete)`, { id, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
        if (updated.length > 0) {
          const resUpsert = await supabase.from(tableName).upsert(updated);
          console.log(`[Supabase Write] Table: ${tableName} (Delete/Reorder)`, { payload: updated, status: resUpsert.status, statusText: resUpsert.statusText, error: resUpsert.error });
        }
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Delete)`, err);
      }
    },
    reorderSocialLinks: async (socialLinks) => {
      update(d => ({ ...d, socialLinks }));
      const tableName = 'social_links';
      try {
        const res = await supabase.from(tableName).upsert(socialLinks);
        console.log(`[Supabase Write] Table: ${tableName} (Reorder/Upsert)`, { payload: socialLinks, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName} (Reorder)`, err);
      }
    },

    updateSiteSettings: async (settings) => {
      update(d => ({ ...d, siteSettings: settings }));
      const tableName = 'portfolio_configs';
      const payload = { key: 'siteSettings', value: settings };
      try {
        const res = await supabase.from(tableName).upsert(payload);
        console.log(`[Supabase Write] Table: ${tableName}`, { payload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName}`, err);
      }
    },
    updateSectionVisibility: async (visibility) => {
      update(d => ({ ...d, sectionVisibility: visibility }));
      const tableName = 'portfolio_configs';
      const payload = { key: 'sectionVisibility', value: visibility };
      try {
        const res = await supabase.from(tableName).upsert(payload);
        console.log(`[Supabase Write] Table: ${tableName}`, { payload, status: res.status, statusText: res.statusText, data: res.data, error: res.error });
      } catch (err: any) {
        console.error(`[Supabase Exception] Table: ${tableName}`, err);
      }
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
