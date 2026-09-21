import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Code2, Folder,
  Award, Map, Rocket, MessageSquare, Share2, Settings, LogOut,
  Shield, Menu, Eye, BookOpen, NotebookPen, Search, Moon, Sun, FileText
} from 'lucide-react';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import AdminGlobalSearch from './components/AdminGlobalSearch';
import './AdminLayout.css';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/about', icon: BookOpen, label: 'About' },
      { to: '/admin/skills', icon: Code2, label: 'Skills' },
      { to: '/admin/services', icon: Shield, label: 'Services' },
      { to: '/admin/projects', icon: Folder, label: 'Projects' },
      { to: '/admin/blog', icon: FileText, label: 'Blog' },
      { to: '/admin/certifications', icon: Award, label: 'Certifications' },
      { to: '/admin/roadmap', icon: Map, label: 'Roadmap' },
      { to: '/admin/future-projects', icon: Rocket, label: 'Future Projects' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/admin/notes', icon: NotebookPen, label: 'Notes' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/social-links', icon: Share2, label: 'Social Links' },
      { to: '/admin/site-settings', icon: Settings, label: 'Site Settings' },
      { to: '/admin/visibility', icon: Eye, label: 'Section Visibility' },
    ],
  },
];

const AdminLayout = () => {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    console.log("[ADMIN SEARCH] open =", isSearchOpen);
  }, [isSearchOpen]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        // Ignore if focus is inside the Tiptap editor
        const target = e.target as HTMLElement;
        if (target.closest('.ProseMirror') || target.closest('.tiptap')) {
          return;
        }
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Basic breadcrumb generation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = pathParts[pathParts.length - 1];
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ');

  // Fullscreen bypass for Notes workspace
  if (location.pathname.startsWith('/admin/notes')) {
    return <Outlet />;
  }

  return (
    <>
      <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-sidebar-open' : ''}`}>
        {/* Mobile Overlay */}
        {mobileOpen && (
          <div className="admin-mobile-overlay" onClick={() => setMobileOpen(false)} />
        )}

      <aside className="admin-sidebar">
        <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '1.25rem 0' : '1.25rem' }}>
          {!collapsed && (
            <div className="sidebar-brand">
              <div className="brand-icon">
                <Shield size={18} aria-hidden="true" />
              </div>
              <span className="brand-text">Control Center</span>
            </div>
          )}
          <button
            className="sidebar-toggle desktop-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            style={collapsed ? {} : { marginLeft: 'auto' }}
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.label} className="nav-group">
              <span className="nav-group-label">{group.label}</span>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} aria-hidden="true" className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-content-wrapper">
        <header className="admin-top-header">
          <div className="header-left">
            <button
              className="sidebar-toggle mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={mobileOpen}
            >
              <Menu size={18} />
            </button>
            
            <div className="header-breadcrumbs">
              <span className="breadcrumb-path">Admin</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{pageTitle}</span>
              
              {!isAuthenticated && (
                <div className="auth-overlay">
                  <div className="auth-prompt">
                    <h3>Authentication Required</h3>
                    <p>Your session has expired or you are not logged in.</p>
                    <button className="btn-admin primary" onClick={() => window.location.href = '/admin/login'}>
                      Log In Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className={`header-icon-btn ${isSearchOpen ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("[ADMIN SEARCH] button clicked");
                setIsSearchOpen(true);
              }}
              title="Search (Cmd+K)" 
              aria-label="Search"
              style={{
                transition: 'all 0.15s ease',
                color: isSearchOpen ? 'var(--a-accent)' : undefined,
                background: isSearchOpen ? 'var(--a-accent-glow)' : undefined
              }}
            >
              <Search size={18} />
            </button>
            <button className="header-icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="header-divider"></div>
            <div className="admin-user-menu">
              <div className="admin-user-info">
                <span className="admin-user-name">Aayan S.</span>
                <span className="admin-user-role">Admin</span>
              </div>
              <div className="admin-avatar">A</div>
            </div>
            <button className="header-icon-btn text-danger" onClick={handleLogout} title="Logout" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
      {isSearchOpen && <AdminGlobalSearch onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

export default AdminLayout;
