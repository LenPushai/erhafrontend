import React from 'react';
import { 
  Settings, 
  Users, 
  Building2, 
  Bell,
  Shield,
  Database,
  Mail,
  Printer,
  Key,
  Globe,
  CheckCircle,
  Clock
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const settingsCategories = [
    { 
      name: 'Company Profile', 
      description: 'Update company details, logo, and contact information',
      icon: Building2,
      status: 'Phase 2'
    },
    { 
      name: 'User Management', 
      description: 'Manage users, roles, and permissions',
      icon: Users,
      status: 'Phase 2'
    },
    { 
      name: 'Notifications', 
      description: 'Configure email and system notifications',
      icon: Bell,
      status: 'Phase 2'
    },
    { 
      name: 'Security', 
      description: 'Password policies and two-factor authentication',
      icon: Shield,
      status: 'Phase 2'
    },
    { 
      name: 'Email Templates', 
      description: 'Customize quote and notification email templates',
      icon: Mail,
      status: 'Phase 2'
    },
    { 
      name: 'Print Templates', 
      description: 'Configure job card and quote PDF templates',
      icon: Printer,
      status: 'Phase 2'
    },
    { 
      name: 'API Keys', 
      description: 'Manage DocuSign and integration API keys',
      icon: Key,
      status: 'Configured'
    },
    { 
      name: 'System Backup', 
      description: 'Database backup and restore options',
      icon: Database,
      status: 'Phase 2'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Settings</h4>
          <p className="text-muted mb-0">System configuration and preferences</p>
        </div>
      </div>

      {/* Current System Info */}
      <div className="card mb-4 border-primary">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-2">
                <Settings size={32} className="text-primary me-3" />
                <div>
                  <h5 className="mb-1">ERHA Operations Management System</h5>
                  <p className="text-muted mb-0">Version 1.0.0 | Phase 1 Release</p>
                </div>
              </div>
              <div className="alert alert-success mb-0 mt-3">
                <CheckCircle size={16} className="me-2" />
                <strong>System Status:</strong> All services operational. DocuSign integration active.
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="text-muted">
                <small>
                  <strong>Environment:</strong> Production<br/>
                  <strong>Database:</strong> MySQL 8.0<br/>
                  <strong>Last Updated:</strong> Nov 2024
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="row mb-4">
        {settingsCategories.map((setting, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-3">
            <div 
              className={`card h-100 ${setting.status === 'Configured' ? 'border-success' : ''}`}
              style={{ opacity: setting.status === 'Phase 2' ? 0.7 : 1, cursor: setting.status === 'Phase 2' ? 'not-allowed' : 'pointer' }}
            >
              <div className="card-body text-center">
                <setting.icon 
                  size={40} 
                  className={`mb-3 ${setting.status === 'Configured' ? 'text-success' : 'text-secondary'}`} 
                />
                <h6 className="mb-2">{setting.name}</h6>
                <p className="text-muted small mb-2">{setting.description}</p>
                <span className={`badge ${setting.status === 'Configured' ? 'bg-success' : 'bg-secondary'}`}>
                  {setting.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Integrations */}
      <div className="row">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">🔗 Integrations Status</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                <CheckCircle size={24} className="text-success me-2" />
                <div className="flex-grow-1">
                  <strong>DocuSign</strong>
                  <p className="text-muted small mb-0">E-signature for quotes</p>
                </div>
                <span className="badge bg-success">Connected</span>
              </div>
              <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                <Clock size={24} className="text-warning me-2" />
                <div className="flex-grow-1">
                  <strong>Pastel Accounting</strong>
                  <p className="text-muted small mb-0">Inventory & financials</p>
                </div>
                <span className="badge bg-warning text-dark">Phase 2</span>
              </div>
              <div className="d-flex align-items-center p-2 bg-light rounded">
                <CheckCircle size={24} className="text-success me-2" />
                <div className="flex-grow-1">
                  <strong>MySQL Database</strong>
                  <p className="text-muted small mb-0">Primary data store</p>
                </div>
                <span className="badge bg-success">Online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">🚀 Phase 2 Settings</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><span className="text-primary me-2">○</span> Multi-user role management</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Custom PDF templates</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Email notification rules</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Audit logging</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Pastel API integration</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Backup scheduling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="card bg-light mt-4">
        <div className="card-body text-center">
          <p className="mb-2">
            <strong>"Whatever you do, work at it with all your heart, as working for the Lord."</strong>
          </p>
          <small className="text-muted">Colossians 3:23</small>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;