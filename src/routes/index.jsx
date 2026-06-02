import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import LandingPage from '../pages/Landing';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import DashboardPage from '../pages/Dashboard';
import ChatbotPage from '../pages/Chatbot';
import PlacesPage from '../pages/Places';
import SettingsPage from '../pages/Settings';
import FavoritesPage from '../pages/Favorites';
import HistoryPage from '../pages/History';

/**
 * PrivateRoute: redirects unauthenticated users to /login.
 */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute: redirects authenticated users away from public auth pages to /places.
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/places" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes (no sidebar/topbar) ── */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ── Protected routes (with AppLayout sidebar + topbar) ── */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      {/* ── Wildcard: redirect unknown paths to landing ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
