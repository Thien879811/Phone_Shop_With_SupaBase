import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
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

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/repairs" element={<RepairsPage />} />
          <Route path="/repair-services" element={<RepairServicesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/imports" element={<ImportsPage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/imei" element={<ImeiPage />} />
          <Route path="/social-accounts" element={<SocialAccountsPage />} />
          <Route path="/social-posts" element={<SocialPostsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
