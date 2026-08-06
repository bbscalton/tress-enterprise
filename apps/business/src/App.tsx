import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { CalendarPage } from './pages/CalendarPage';
import { RentalsPage } from './pages/RentalsPage';
import { MapPage } from './pages/MapPage';
import { ChatPage } from './pages/ChatPage';
import { TasksPage } from './pages/TasksPage';
import { useAlertMonitor } from './hooks/useAlertMonitor';
import { initFirebase } from '@fleetrentals/shared';

initFirebase();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  useAlertMonitor();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider role="business">
      <ProtectedRoutes />
    </AuthProvider>
  );
}
