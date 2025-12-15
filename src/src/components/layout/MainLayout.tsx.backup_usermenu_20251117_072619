import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Briefcase,
  AlertCircle,
  Settings,
  Users,
  Package,
  TrendingUp,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard'
    },
    {
      path: '/rfq',
      icon: <FileText size={20} />,
      label: 'RFQs',
      badge: '8',
      badgeColor: 'primary'
    },
    {
      path: '/quotes',
      icon: <FileSpreadsheet size={20} />,
      label: 'Quotes',
      badge: '5',
      badgeColor: 'info'
    },
    {
      path: '/jobs',
      icon: <Briefcase size={20} />,
      label: 'Jobs',
      badge: '12',
      badgeColor: 'success'
    },
    {
      path: '/clients',
      icon: <Users size={20} />,
      label: 'Clients'
    },
    {
      path: '/inventory',
      icon: <Package size={20} />,
      label: 'Inventory'
    },
    {
      path: '/reports',
      icon: <TrendingUp size={20} />,
      label: 'Reports'
    },
    {
      path: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div
        className={`bg-dark text-white ${sidebarOpen ? '' : 'd-none d-md-block'}`}
        style={{
          width: sidebarOpen ? '260px' : '0',
          transition: 'width 0.3s',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000
        }}
      >
        {/* Logo/Brand */}
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: '40px', height: '40px' }}
              >
                <strong style={{ fontSize: '18px' }}>E</strong>
              </div>
              <div>
                <h5 className="mb-0" style={{ fontSize: '16px', fontWeight: 600 }}>
                  ERHA OPS
                </h5>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Operations Management
                </small>
              </div>
            </div>
            <button
              className="btn btn-link text-white d-md-none p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`d-flex align-items-center px-3 py-2 text-decoration-none ${
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'text-light hover-bg-secondary'
              }`}
              style={{
                transition: 'all 0.2s',
                borderLeft: isActive(item.path) ? '4px solid #0d6efd' : '4px solid transparent'
              }}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <span className="me-3">{item.icon}</span>
              <span className="flex-grow-1">{item.label}</span>
              {item.badge && (
                <span className={`badge bg-${item.badgeColor} rounded-pill`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Emergency Section */}
        <div className="p-3 mt-auto border-top border-secondary">
          <Link
            to="/emergency"
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
            style={{ animation: 'pulse 2s infinite' }}
          >
            <AlertCircle size={18} className="me-2" />
            <strong>Emergency Job</strong>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-3 border-top border-secondary text-center">
          <small className="text-muted">
            PUSH AI Foundation
            <br />
            v0.3 UAT
          </small>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: sidebarOpen ? '260px' : '0',
          transition: 'margin-left 0.3s'
        }}
      >
        {/* Top Header */}
        <header className="bg-white border-bottom sticky-top">
          <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between py-3">
              {/* Menu Toggle */}
              <button
                className="btn btn-link text-dark p-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>

              {/* Page Title */}
              <div className="flex-grow-1 px-3">
                <h4 className="mb-0">
                  {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                </h4>
              </div>

              {/* User Menu */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-dark text-decoration-none d-flex align-items-center"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <strong>A</strong>
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Admin User</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Administrator</div>
                  </div>
                  <ChevronDown size={16} className="ms-2" />
                </button>
                {userMenuOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end show"
                    style={{ right: 0, left: 'auto' }}
                  >
                    <a className="dropdown-item" href="#profile">Profile</a>
                    <a className="dropdown-item" href="#settings">Settings</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item text-danger" href="#logout">Logout</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="d-md-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Custom Styles */}
      <style>{`
        .hover-bg-secondary:hover {
          background-color: rgba(108, 117, 125, 0.1);
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
        }
        
        .dropdown-menu.show {
          display: block;
          position: absolute;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;