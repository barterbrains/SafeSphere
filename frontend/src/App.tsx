import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RoutesPage from './pages/RoutesPage';
import RouteDetailPage from './pages/RouteDetailPage';
import JourneyPage from './pages/JourneyPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import InstitutionLoginPage from './pages/institution/InstitutionLoginPage';
import InstitutionOverviewPage from './pages/institution/InstitutionOverviewPage';
import InstitutionHeatmapPage from './pages/institution/InstitutionHeatmapPage';
import InstitutionIncidentsPage from './pages/institution/InstitutionIncidentsPage';
import InstitutionAnalyticsPage from './pages/institution/InstitutionAnalyticsPage';
import InstitutionAlertsPage from './pages/institution/InstitutionAlertsPage';
import InstitutionProfilePage from './pages/institution/InstitutionProfilePage';

// ── Route Guards ───────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, isDemo, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isDemo || session) return <>{children}</>;
  return <Navigate to="/login" replace />;
}

function InstitutionRoute({ children }: { children: React.ReactNode }) {
  const { session, isDemo, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  // Allow demo users AND any signed-in user
  if (isDemo || session) return <>{children}</>;
  return <Navigate to="/login" replace />;
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a12',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(79,70,229,0.3)',
        borderTopColor: '#4f46e5',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/institution/login" element={<InstitutionLoginPage />} />

        {/* Consumer app */}
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/routes" element={<PrivateRoute><RoutesPage /></PrivateRoute>} />
        <Route path="/route/:id" element={<PrivateRoute><RouteDetailPage /></PrivateRoute>} />
        <Route path="/journey/:id" element={<PrivateRoute><JourneyPage /></PrivateRoute>} />
        <Route path="/emergency" element={<PrivateRoute><EmergencyPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Institution */}
        <Route path="/institution/overview" element={<InstitutionRoute><InstitutionOverviewPage /></InstitutionRoute>} />
        <Route path="/institution/heatmap" element={<InstitutionRoute><InstitutionHeatmapPage /></InstitutionRoute>} />
        <Route path="/institution/incidents" element={<InstitutionRoute><InstitutionIncidentsPage /></InstitutionRoute>} />
        <Route path="/institution/analytics" element={<InstitutionRoute><InstitutionAnalyticsPage /></InstitutionRoute>} />
        <Route path="/institution/alerts" element={<InstitutionRoute><InstitutionAlertsPage /></InstitutionRoute>} />
        <Route path="/institution/profile" element={<InstitutionRoute><InstitutionProfilePage /></InstitutionRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
