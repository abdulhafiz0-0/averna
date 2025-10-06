import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import StudentDetailsPage from './pages/StudentDetailsPage';
import CoursesPage from './pages/CoursesPage';
import PaymentsPage from './pages/PaymentsPage';
import AttendancePage from './pages/AttendancePage';
import UsersPage from './pages/UsersPage';
import Layout from './components/Layout';
import { setupTelegramWebApp, setViewportHeight } from './utils/mobileOptimizations';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated,user, loading } = useAuth();
  
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<ProtectedRoute requiredRoles={['admin', 'superadmin']}><StudentsPage /></ProtectedRoute>} />
        <Route path="students/:id" element={<ProtectedRoute requiredRoles={['admin', 'superadmin']}><StudentDetailsPage /></ProtectedRoute>} />
        <Route path="courses" element={<ProtectedRoute requiredRoles={['admin', 'superadmin']}><CoursesPage /></ProtectedRoute>} />
        <Route path="payments" element={<ProtectedRoute requiredRoles={['admin', 'superadmin']}><PaymentsPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute requiredRoles={['superadmin']}><UsersPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

function App() {
  useEffect(() => {
    // Setup mobile optimizations
    setViewportHeight();
    setupTelegramWebApp();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
