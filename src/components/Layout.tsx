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
          padding: 0 clamp(0.75rem, 2vw, 1rem);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 901; /* Above overlay */
          gap: clamp(8px, 2vw, 16px);
        }

        .mobile-logo {
          flex: 1;
          text-align: center;
          min-width: 0;
        }

        .mobile-logo h1 {
          font-size: clamp(0.95rem, 4vw, 1.1rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-menu-btn, .mobile-action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          width: 44px; /* WCAG minimum touch target */
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: var(--transition);
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-menu-btn:active, .mobile-action-btn:active {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 10px);
          flex-shrink: 0;
        }

        .mobile-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--primary-bg);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-close-btn {
          position: absolute;
          right: clamp(0.75rem, 3vw, 1.25rem);
          top: clamp(0.75rem, 3vw, 1.25rem);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2001; /* Above sidebar */
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-close-btn:active {
          background: var(--border-light);
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
