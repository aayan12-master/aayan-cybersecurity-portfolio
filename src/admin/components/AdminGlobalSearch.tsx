import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useData } from '../../contexts/DataContext';
import { Search, Folder, MessageSquare, NotebookPen, Settings, Shield, Code2, Award, Map, Rocket, Share2, LayoutDashboard, Eye, AlertCircle, FileText } from 'lucide-react';
import './AdminGlobalSearch.css';

interface AdminGlobalSearchProps {
  onClose: () => void;
}

interface SearchResult {
  id: string; // unique key
  title: string;
  type: string;
  typeLabel: string;
  icon: React.ElementType;
  desc?: string;
  path: string;
  rank: number;
}

const STATIC_NAVIGATION = [
  { id: 'nav-dashboard', title: 'Dashboard', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/dashboard', icon: LayoutDashboard, desc: 'Overview of your portfolio metrics' },
  { id: 'nav-about', title: 'About', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/about', icon: LayoutDashboard, desc: 'Manage your bio and profile' },
  { id: 'nav-skills', title: 'Skills', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/skills', icon: Code2, desc: 'Manage your technical skills' },
  { id: 'nav-services', title: 'Services', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/services', icon: Shield, desc: 'Manage your consulting services' },
  { id: 'nav-projects', title: 'Projects', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/projects', icon: Folder, desc: 'Manage your portfolio projects' },
  { id: 'nav-certs', title: 'Certifications', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/certifications', icon: Award, desc: 'Manage your certificates' },
  { id: 'nav-roadmap', title: 'Roadmap', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/roadmap', icon: Map, desc: 'Manage your timeline and journey' },
  { id: 'nav-future', title: 'Future Projects', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/future-projects', icon: Rocket, desc: 'Manage planned projects' },
  { id: 'nav-messages', title: 'Messages', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/messages', icon: MessageSquare, desc: 'View incoming contact messages' },
  { id: 'nav-social', title: 'Social Links', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/social-links', icon: Share2, desc: 'Manage your social media presence' },
  { id: 'nav-settings', title: 'Site Settings', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/site-settings', icon: Settings, desc: 'Manage SEO and global configuration' },
  { id: 'nav-visibility', title: 'Section Visibility', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/visibility', icon: Eye, desc: 'Toggle public sections' },
  { id: 'nav-notes', title: 'Notes Workspace', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/notes', icon: NotebookPen, desc: 'Access your private notes' },
  { id: 'nav-blog', title: 'Blog', type: 'NAV', typeLabel: 'NAVIGATION', path: '/admin/blog', icon: FileText, desc: 'Manage blog posts' },
];

export const useDataContextHook = () => {
  try {
    const ctx = useData();
    return ctx;
  } catch (e) {
    return null; // Fallback if somehow not wrapped
  }
};

const getRank = (text: string, query: string): number => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 1;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 3;
  return 4; // Description match
};

const HighlightText = ({ text, query }: { text: string, query: string }) => {
  if (!query || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="admin-global-search-highlight">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const AdminGlobalSearch: React.FC<AdminGlobalSearchProps> = ({ onClose }) => {

  const navigate = useNavigate();
  const dataCtx = useDataContextHook();
  const [query, setQuery] = useState('');
  const [remoteNotes, setRemoteNotes] = useState<SearchResult[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState(false);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced remote search
  useEffect(() => {
    if (!query.trim()) {
      setRemoteNotes([]);
      setIsSearchingRemote(false);
      setRemoteError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      setRemoteError(false);
      try {
        const cleanQuery = query.trim().toLowerCase();
        // Use ilike for partial matching. 
        // Supabase RLS automatically limits to the authenticated user's notes.
        const [notesRes, blogRes] = await Promise.all([
          supabase
            .from('notes')
            .select('id, title, content')
            .or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%`)
            .limit(5),
          supabase
            .from('blog_posts')
            .select('id, title, excerpt, content, status')
            .or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%`)
            .limit(5)
        ]);

        if (notesRes.error) throw notesRes.error;
        if (blogRes.error) throw blogRes.error;

        const noteResults: SearchResult[] = (notesRes.data || []).map(note => {
          let r = getRank(note.title || '', query);
          if (r === 4 && !(note.title || '').toLowerCase().includes(cleanQuery)) {
            r = 4; // Content match
          }
          return {
            id: `note-${note.id}`,
            title: note.title || 'Untitled Note',
            type: 'NOTE',
            typeLabel: 'NOTE',
            icon: NotebookPen,
            desc: note.content ? note.content.replace(/[#*`_~[\]()>-]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 60) + '...' : '',
            path: `/admin/notes/${note.id}`,
            rank: r
          };
        });

        const blogResults: SearchResult[] = (blogRes.data || []).map(post => {
          let r = getRank(post.title || '', query);
          if (r === 4 && !(post.title || '').toLowerCase().includes(cleanQuery)) {
            r = 4; // Content match
          }
          return {
            id: `blog-${post.id}`,
            title: post.title || 'Untitled Post',
            type: 'BLOG',
            typeLabel: 'BLOG POST',
            icon: FileText,
            desc: `Blog Post · ${post.status === 'published' ? 'Published' : 'Draft'}`,
            path: `/admin/blog/${post.id}`,
            rank: r
          };
        });

        setRemoteNotes([...noteResults, ...blogResults]);
      } catch (err) {
        console.error('Remote search error:', err);
        setRemoteError(true);
      } finally {
        setIsSearchingRemote(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Aggregate and filter local data
  const results = useMemo(() => {
    if (!query.trim()) {
      // Initial state: show basic navigation shortcuts
      return STATIC_NAVIGATION.slice(0, 5).map(nav => ({...nav, rank: 1}));
    }

    const q = query.toLowerCase();
    const localResults: SearchResult[] = [];

    // Navigation
    STATIC_NAVIGATION.forEach(nav => {
      const r = getRank(nav.title, q);
      if (r <= 3) {
        localResults.push({ ...nav, rank: r });
      }
    });

    if (dataCtx?.data) {
      const { projects, services, skills, certifications, roadmap, futureProjects, contactMessages } = dataCtx.data;
      
      projects?.forEach((p: any) => {
        const rTitle = getRank(p.title, q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (rTitle <= 3 || matchDesc) {
          localResults.push({ id: `proj-${p.id}`, title: p.title, type: 'PROJECT', typeLabel: 'PROJECT', icon: Folder, desc: p.category, path: '/admin/projects', rank: rTitle <= 3 ? rTitle : 4 });
        }
      });

      services?.forEach((s: any) => {
        const rTitle = getRank(s.title, q);
        const matchDesc = s.description?.toLowerCase().includes(q);
        if (rTitle <= 3 || matchDesc) {
          localResults.push({ id: `srv-${s.id}`, title: s.title, type: 'SERVICE', typeLabel: 'SERVICE', icon: Shield, desc: s.description?.substring(0, 50), path: '/admin/services', rank: rTitle <= 3 ? rTitle : 4 });
        }
      });

      skills?.forEach((s: any) => {
        const rTitle = getRank(s.name, q);
        if (rTitle <= 3) {
          localResults.push({ id: `skill-${s.id}`, title: s.name, type: 'SKILL', typeLabel: 'SKILL', icon: Code2, desc: s.category, path: '/admin/skills', rank: rTitle });
        }
      });

      certifications?.forEach((c: any) => {
        const rTitle = getRank(c.title, q);
        const matchIssuer = c.issuer?.toLowerCase().includes(q);
        if (rTitle <= 3 || matchIssuer) {
          localResults.push({ id: `cert-${c.id}`, title: c.title, type: 'CERT', typeLabel: 'CERTIFICATION', icon: Award, desc: c.issuer, path: '/admin/certifications', rank: rTitle <= 3 ? rTitle : 4 });
        }
      });

      roadmap?.forEach((r: any) => {
        const rTitle = getRank(r.title, q);
        if (rTitle <= 3) {
          localResults.push({ id: `rdmp-${r.id}`, title: r.title, type: 'ROADMAP', typeLabel: 'TIMELINE', icon: Map, desc: r.year, path: '/admin/roadmap', rank: rTitle });
        }
      });
      
      futureProjects?.forEach((f: any) => {
        const rTitle = getRank(f.title, q);
        if (rTitle <= 3) {
          localResults.push({ id: `fut-${f.id}`, title: f.title, type: 'FUTURE', typeLabel: 'FUTURE PROJECT', icon: Rocket, desc: f.status, path: '/admin/future-projects', rank: rTitle });
        }
      });

      contactMessages?.forEach((m: any) => {
        const rTitle = getRank(m.subject, q);
        const matchName = m.name?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        if (rTitle <= 3 || matchName || matchEmail) {
          localResults.push({ id: `msg-${m.id}`, title: m.subject, type: 'MESSAGE', typeLabel: 'MESSAGE', icon: MessageSquare, desc: `From: ${m.name}`, path: '/admin/messages', rank: rTitle <= 3 ? rTitle : 4 });
        }
      });
    }

    // Combine local and remote
    const combined = [...localResults, ...remoteNotes];
    
    // Sort primarily by rank (1=exact, 2=starts, 3=contains title, 4=contains desc)
    combined.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Secondary sort by type to group them somewhat logically if ranks tie
      return a.type.localeCompare(b.type);
    });

    // Limit to 20 total results
    return combined.slice(0, 20);
  }, [query, dataCtx, remoteNotes]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Handle Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, navigate, onClose]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const item = selectedItemRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += (itemRect.bottom - containerRect.bottom) + 10;
      } else if (itemRect.top < containerRect.top) {
        container.scrollTop -= (containerRect.top - itemRect.top) + 10;
      }
    }
  }, [selectedIndex]);

  // Click outside handler
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Grouping for render
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.typeLabel]) {
      acc[result.typeLabel] = [];
    }
    // Limit to 5 per category
    if (acc[result.typeLabel].length < 5) {
      acc[result.typeLabel].push(result);
    }
    return acc;
  }, {} as Record<string, SearchResult[]>);

  console.log("[ADMIN SEARCH] overlay visible");

  return (
    <div className="admin-global-search-overlay" onClick={handleOverlayClick}>
      <div className="admin-global-search-modal">
        <div className="admin-global-search-header">
          <Search size={20} className="admin-global-search-icon" />
          <input
            ref={inputRef}
            className="admin-global-search-input"
            type="text"
            placeholder="Search Admin..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Admin search input"
          />
          <span className="admin-global-search-esc">esc</span>
        </div>

        <div className="admin-global-search-body" ref={scrollRef}>
          {query.trim() === '' ? (
            <div className="admin-global-search-group">
              <div className="admin-global-search-group-title">Quick Navigation</div>
              {results.map((r, globalIndex) => {
                const isSelected = globalIndex === selectedIndex;
                return (
                  <div
                    key={r.id}
                    ref={isSelected ? selectedItemRef : null}
                    className="admin-global-search-item"
                    aria-selected={isSelected}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    onClick={() => { navigate(r.path); onClose(); }}
                  >
                    <div className="admin-global-search-item-icon">
                      <r.icon size={16} />
                    </div>
                    <div className="admin-global-search-item-content">
                      <div className="admin-global-search-item-title">{r.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : results.length === 0 && !isSearchingRemote ? (
            <div className="admin-global-search-empty">
              <div style={{ fontWeight: 600, color: 'var(--a-text)' }}>No results found</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--a-text-muted)' }}>Try another keyword</div>
            </div>
          ) : (
            <>
              {Object.entries(groupedResults).map(([typeLabel, items]) => {
                // Find global index for each item so keyboard navigation maps correctly
                return (
                  <div key={typeLabel} className="admin-global-search-group">
                    <div className="admin-global-search-group-title">{typeLabel}</div>
                    {items.map(r => {
                      const globalIndex = results.findIndex(x => x.id === r.id);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <div
                          key={r.id}
                          ref={isSelected ? selectedItemRef : null}
                          className="admin-global-search-item"
                          aria-selected={isSelected}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          onClick={() => { navigate(r.path); onClose(); }}
                        >
                          <div className="admin-global-search-item-icon">
                            <r.icon size={16} />
                          </div>
                          <div className="admin-global-search-item-content">
                            <div className="admin-global-search-item-title">
                              <span><HighlightText text={r.title} query={query.trim()} /></span>
                            </div>
                            {r.desc && (
                              <div className="admin-global-search-item-desc">
                                <HighlightText text={r.desc} query={query.trim()} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {isSearchingRemote && (
                <div className="admin-global-search-loading" style={{ padding: '1rem', flexDirection: 'row', justifyContent: 'center' }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span style={{ fontSize: '0.85rem' }}>Searching remote data...</span>
                </div>
              )}
              
              {remoteError && (
                <div className="admin-global-search-error" style={{ padding: '1rem', flexDirection: 'row', justifyContent: 'center', color: 'var(--a-danger)' }}>
                  <AlertCircle size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Search unavailable. Try again.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalSearch;
