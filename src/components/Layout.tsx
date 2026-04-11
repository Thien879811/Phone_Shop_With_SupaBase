import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="app-layout">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        
        <div className="mobile-logo">
          <h1>PhoneShop</h1>
        </div>

        <div className="mobile-header-actions">
          <button className="mobile-action-btn"><Bell size={20} /></button>
          <div className="mobile-avatar">
            <User size={18} />
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with mobile state */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <button 
          className="mobile-close-btn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>
        <Sidebar />
      </div>

      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>

      <style>{`
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--header-mobile-height);
          background: var(--bg-sidebar);
          border-bottom: 1px solid var(--border);
          padding: 0 1rem;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 900;
        }

        .mobile-logo h1 {
          font-size: 1.1rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mobile-menu-btn, .mobile-action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-bg);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-close-btn {
          position: absolute;
          right: 1.25rem;
          top: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        @media (min-width: 1024px) {
          .mobile-header, .mobile-close-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
