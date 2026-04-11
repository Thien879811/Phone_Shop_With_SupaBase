import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  ClipboardList,
  Warehouse,
  ShoppingCart,
  History,
  Smartphone,
  Tags,
  Apple,
  Wrench,
  ShieldCheck,
  Globe,
  Send,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  {
    section: 'Tổng quan',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Danh mục',
    items: [
      { to: '/products', label: 'Sản phẩm', icon: Package },
      { to: '/categories', label: 'Danh mục', icon: Tags },
      { to: '/brands', label: 'Thương hiệu', icon: Apple },
      { to: '/suppliers', label: 'Nhà cung cấp', icon: Truck },
    ],
  },
  {
    section: 'Kho hàng',
    items: [
      { to: '/imports', label: 'Phiếu nhập kho', icon: ClipboardList },
      { to: '/stocks', label: 'Tồn kho', icon: Warehouse },
      { to: '/movements', label: 'Lịch sử kho', icon: History },
      { to: '/imei', label: 'Quản lý IMEI', icon: Smartphone },
    ],
  },
  {
    section: 'Sửa chữa',
    items: [
      { to: '/repairs', label: 'Phiếu sửa chữa', icon: Wrench },
      { to: '/repair-services', label: 'Dịch vụ sửa chữa', icon: ShieldCheck },
    ],
  },
  {
    section: 'Bán hàng',
    items: [
      { to: '/sales', label: 'Hóa đơn bán', icon: ShoppingCart },
    ],
  },
  {
    section: 'Marketing',
    items: [
      { to: '/social-accounts', label: 'Tài khoản MXH', icon: Globe },
      { to: '/social-posts', label: 'Đăng bài tự động', icon: Send },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { signOut } = useAuthStore();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Smartphone size={22} />
        </div>
        <div className="brand-text">
          <h1>PhoneShop</h1>
          <span>Warehouse System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section, idx) => (
          <div className="nav-section" key={idx}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={() => signOut()}>
          <LogIn size={18} style={{ transform: 'rotate(180deg)' }} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
