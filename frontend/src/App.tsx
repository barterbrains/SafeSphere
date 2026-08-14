import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RoutesPage from './pages/RoutesPage';
import RouteDetailPage from './pages/RouteDetailPage';
import JourneyPage from './pages/JourneyPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import InstitutionLoginPage from './pages/institution/InstitutionLoginPage';
import InstitutionRegisterPage from './pages/institution/InstitutionRegisterPage';
import InstitutionOverviewPage from './pages/institution/InstitutionOverviewPage';
import InstitutionHeatmapPage from './pages/institution/InstitutionHeatmapPage';
import InstitutionIncidentsPage from './pages/institution/InstitutionIncidentsPage';
import InstitutionAnalyticsPage from './pages/institution/InstitutionAnalyticsPage';
import InstitutionAlertsPage from './pages/institution/InstitutionAlertsPage';
import InstitutionProfilePage from './pages/institution/InstitutionProfilePage';
import InstitutionSettingsPage from './pages/institution/InstitutionSettingsPage';

// ── Route Guards ───────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, isDemo, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isDemo && !session) return <Navigate to="/login" replace />;

  // If real user is not yet onboarded (onboarded flag false), route to /onboarding
  if (!isDemo && session && profile && profile.onboarded === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function InstitutionRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, isDemo, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isDemo && !session) return <Navigate to="/login" replace />;

  // If real user is not yet onboarded, enforce onboarding first
  if (!isDemo && session && profile && profile.onboarded === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, isDemo, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isDemo && !session) return <Navigate to="/login" replace />;
  if (isDemo) return <Navigate to="/routes" replace />;

  // If already onboarded, send to consumer routes
  if (profile && profile.onboarded === true) {
    return <Navigate to="/routes" replace />;
  }

  return <>{children}</>;
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
        <Route path="/institution/register" element={<InstitutionRegisterPage />} />

        {/* Onboarding Flow for new users */}
        <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

        {/* Consumer app */}
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/routes" element={<PrivateRoute><RoutesPage /></PrivateRoute>} />
        <Route path="/route/:id" element={<PrivateRoute><RouteDetailPage /></PrivateRoute>} />
        <Route path="/journey/:id" element={<PrivateRoute><JourneyPage /></PrivateRoute>} />
        <Route path="/emergency" element={<PrivateRoute><EmergencyPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Institution / Command suite */}
        <Route path="/institution/overview" element={<InstitutionRoute><InstitutionOverviewPage /></InstitutionRoute>} />
        <Route path="/institution/heatmap" element={<InstitutionRoute><InstitutionHeatmapPage /></InstitutionRoute>} />
        <Route path="/institution/incidents" element={<InstitutionRoute><InstitutionIncidentsPage /></InstitutionRoute>} />
        <Route path="/institution/analytics" element={<InstitutionRoute><InstitutionAnalyticsPage /></InstitutionRoute>} />
        <Route path="/institution/alerts" element={<InstitutionRoute><InstitutionAlertsPage /></InstitutionRoute>} />
        <Route path="/institution/settings" element={<InstitutionRoute><InstitutionSettingsPage /></InstitutionRoute>} />
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
