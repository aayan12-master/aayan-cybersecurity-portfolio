import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import HeroEditor from './admin/editors/HeroEditor';
import AboutEditor from './admin/editors/AboutEditor';
import EducationEditor from './admin/editors/EducationEditor';
import TrainingEditor from './admin/editors/TrainingEditor';
import SkillsManager from './admin/editors/SkillsManager';
import ServicesManager from './admin/editors/ServicesManager';
import ProjectsManager from './admin/editors/ProjectsManager';
import CertificationsManager from './admin/editors/CertificationsManager';
import RoadmapManager from './admin/editors/RoadmapManager';
import FutureProjectsManager from './admin/editors/FutureProjectsManager';
import ContactMessages from './admin/editors/ContactMessages';
import SocialLinksEditor from './admin/editors/SocialLinksEditor';
import SiteSettingsEditor from './admin/editors/SiteSettingsEditor';
import SectionVisibilityEditor from './admin/editors/SectionVisibilityEditor';

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
            <Route path="/admin/login" element={<Login />} />

            {/* ── Redirect /admin → /admin/login ── */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* ── Protected Admin Routes ── */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard"      element={<Dashboard />} />
              <Route path="hero"           element={<HeroEditor />} />
              <Route path="about"          element={<AboutEditor />} />
              <Route path="education"      element={<EducationEditor />} />
              <Route path="training"       element={<TrainingEditor />} />
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
