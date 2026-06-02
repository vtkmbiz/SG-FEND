import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { T } from './utils/theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { NewEntryPage, ManagePage, VendorsPage, ReportsPage, StaffPage, SettingsPage } from './pages/Pages';

function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/"        element={<Protected><DashboardPage /></Protected>} />
      <Route path="/new"     element={<Protected><NewEntryPage /></Protected>} />
      <Route path="/manage"  element={<Protected><ManagePage /></Protected>} />
      <Route path="/vendors" element={<Protected><VendorsPage /></Protected>} />
      <Route path="/reports" element={<Protected roles={['owner','co-owner']}><ReportsPage /></Protected>} />
      <Route path="/staff"   element={<Protected><StaffPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" toastOptions={{
          style: { background: T.maroon, color: T.gold, fontWeight: 700, fontFamily: "'Poppins',sans-serif", borderRadius: 12, fontSize: 13 },
          success: { iconTheme: { primary: T.gold, secondary: T.maroon } },
          error: { style: { background: T.red, color: '#fff' } },
          duration: 3000,
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
