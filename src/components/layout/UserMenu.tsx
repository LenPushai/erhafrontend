// UserMenu.tsx - User profile dropdown with logout
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Shield, Settings } from 'lucide-react';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'ADMIN': 'danger',
      'MANAGER': 'primary',
      'ESTIMATOR': 'info',
      'USER': 'secondary'
    };
    return colors[role] || 'secondary';
  };

  const getRoleDisplayName = (role: string) => {
    const names: { [key: string]: string } = {
      'ADMIN': 'Administrator',
      'MANAGER': 'Manager',
      'ESTIMATOR': 'Estimator',
      'USER': 'User'
    };
    return names[role] || role;
  };

  return (
    <div className="dropdown" style={{ position: 'relative' }}>
      <button
        className="btn btn-link text-decoration-none d-flex align-items-center gap-2"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ color: '#2d3748' }}
      >
        <div 
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
        >
          {user.firstName?.charAt(0) || user.username?.charAt(0).toUpperCase()}
        </div>
        <div className="text-start d-none d-md-block">
          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#718096' }}>
            {getRoleDisplayName(user.roles[0])}
          </div>
        </div>
        <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'} ms-1`}></i>
      </button>

      {showDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1040
            }}
            onClick={() => setShowDropdown(false)}
          />

          <div
            className="dropdown-menu show shadow-lg"
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '0.5rem',
              minWidth: '280px',
              zIndex: 1050,
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="px-3 py-3 border-bottom">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: '50px', height: '50px', fontWeight: 'bold', fontSize: '1.2rem' }}
                >
                  {user.firstName?.charAt(0) || user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                    {user.email}
                  </div>
                  <div className="mt-1">
                    <span className={`badge bg-${getRoleBadgeColor(user.roles[0])}`}>
                      <Shield size={12} className="me-1" />
                      {getRoleDisplayName(user.roles[0])}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                style={{ cursor: 'pointer' }}
              >
                <User size={18} />
                <span>My Profile</span>
              </button>

              {user.roles.includes('ADMIN') && (
                <button
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/settings');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Settings size={18} />
                  <span>System Settings</span>
                </button>
              )}
            </div>

            <div className="border-top"></div>

            <div className="py-2">
              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer', fontWeight: '500' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
