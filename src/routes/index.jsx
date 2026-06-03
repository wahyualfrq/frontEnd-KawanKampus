import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import PageSkeleton from '../components/common/PageSkeleton';

const LandingPage = lazy(() => import('../pages/Landing'));
const LoginPage = lazy(() => import('../pages/Login'));
const RegisterPage = lazy(() => import('../pages/Register'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const ChatbotPage = lazy(() => import('../pages/Chatbot'));
const PlacesPage = lazy(() => import('../pages/Places'));
const SettingsPage = lazy(() => import('../pages/Settings'));
const FavoritesPage = lazy(() => import('../pages/Favorites'));
const HistoryPage = lazy(() => import('../pages/History'));

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
    <Suspense fallback={<PageSkeleton />}>
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
    </Suspense>
  );
}
