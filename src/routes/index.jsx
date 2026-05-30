import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import DashboardPage from '../pages/Dashboard';
import ChatbotPage from '../pages/Chatbot';
import PlacesPage from '../pages/Places';
import SettingsPage from '../pages/Settings';
import FavoritesPage from '../pages/Favorites';
import HistoryPage from '../pages/History';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
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

      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
