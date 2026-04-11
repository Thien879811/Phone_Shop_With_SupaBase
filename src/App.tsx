import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuthStore } from './store/useAuthStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import ImportsPage from './pages/ImportsPage';
import StocksPage from './pages/StocksPage';
import MovementsPage from './pages/MovementsPage';
import SalesPage from './pages/SalesPage';
import ImeiPage from './pages/ImeiPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import RepairsPage from './pages/RepairsPage';
import RepairServicesPage from './pages/RepairServicesPage';
import SocialAccountsPage from './pages/SocialAccountsPage';
import SocialPostsPage from './pages/SocialPostsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
        <Route path="/repairs" element={<ProtectedRoute><RepairsPage /></ProtectedRoute>} />
        <Route path="/repair-services" element={<ProtectedRoute><RepairServicesPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        <Route path="/imports" element={<ProtectedRoute><ImportsPage /></ProtectedRoute>} />
        <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
        <Route path="/movements" element={<ProtectedRoute><MovementsPage /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        <Route path="/imei" element={<ProtectedRoute><ImeiPage /></ProtectedRoute>} />
        <Route path="/social-accounts" element={<ProtectedRoute><SocialAccountsPage /></ProtectedRoute>} />
        <Route path="/social-posts" element={<ProtectedRoute><SocialPostsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
