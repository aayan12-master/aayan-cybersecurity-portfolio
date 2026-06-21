import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProtectedRoute from './admin/ProtectedRoute';

// Lazy-loaded Admin Components
const Login = lazy(() => import('./admin/Login'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const HeroEditor = lazy(() => import('./admin/editors/HeroEditor'));
const AboutEditor = lazy(() => import('./admin/editors/AboutEditor'));
const SkillsManager = lazy(() => import('./admin/editors/SkillsManager'));
const ServicesManager = lazy(() => import('./admin/editors/ServicesManager'));
const ProjectsManager = lazy(() => import('./admin/editors/ProjectsManager'));
const CertificationsManager = lazy(() => import('./admin/editors/CertificationsManager'));
const RoadmapManager = lazy(() => import('./admin/editors/RoadmapManager'));
const FutureProjectsManager = lazy(() => import('./admin/editors/FutureProjectsManager'));
const ContactMessages = lazy(() => import('./admin/editors/ContactMessages'));
const SocialLinksEditor = lazy(() => import('./admin/editors/SocialLinksEditor'));
const SiteSettingsEditor = lazy(() => import('./admin/editors/SiteSettingsEditor'));
const SectionVisibilityEditor = lazy(() => import('./admin/editors/SectionVisibilityEditor'));

const AdminFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0b0b10',
    color: '#9090b0',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        width: '24px',
        height: '24px',
        border: '2.5px solid rgba(255, 255, 255, 0.15)',
        borderTopColor: '#7c6ff7',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '0.75rem'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div>Loading Admin Panel...</div>
    </div>
  </div>
);

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Public Portfolio ── */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                </>
              }
            />

            {/* ── Admin Login (public) ── */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Login />
                </Suspense>
              }
            />

            {/* ── Redirect /admin → /admin/login ── */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* ── Protected Admin Routes ── */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLayout />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard"      element={<Dashboard />} />
              <Route path="hero"           element={<HeroEditor />} />
              <Route path="about"          element={<AboutEditor />} />
              <Route path="skills"         element={<SkillsManager />} />
              <Route path="services"       element={<ServicesManager />} />
              <Route path="projects"       element={<ProjectsManager />} />
              <Route path="certifications" element={<CertificationsManager />} />
              <Route path="roadmap"        element={<RoadmapManager />} />
              <Route path="future-projects" element={<FutureProjectsManager />} />
              <Route path="messages"       element={<ContactMessages />} />
              <Route path="social-links"   element={<SocialLinksEditor />} />
              <Route path="site-settings"  element={<SiteSettingsEditor />} />
              <Route path="visibility"     element={<SectionVisibilityEditor />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
