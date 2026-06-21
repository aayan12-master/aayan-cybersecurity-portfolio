import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, Code2, Folder,
  Award, Map, Rocket, MessageSquare, Share2, Settings, LogOut,
  Shield, ChevronLeft, Menu, Eye, BookOpen
} from 'lucide-react';
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
      { to: '/admin/hero', icon: User, label: 'Hero Section' },
      { to: '/admin/about', icon: BookOpen, label: 'About' },
      { to: '/admin/skills', icon: Code2, label: 'Skills' },
      { to: '/admin/services', icon: Shield, label: 'Services' },
      { to: '/admin/projects', icon: Folder, label: 'Projects' },
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
    label: 'Settings',
    items: [
      { to: '/admin/social-links', icon: Share2, label: 'Social Links' },
      { to: '/admin/site-settings', icon: Settings, label: 'Site Settings' },
      { to: '/admin/visibility', icon: Eye, label: 'Section Visibility' },
    ],
  },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Shield size={20} aria-hidden="true" />
            <span>Admin Panel</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <Menu size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
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
                  <item.icon size={17} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">Aayan Sayyad</span>
              <span className="admin-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut size={17} aria-hidden="true" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
