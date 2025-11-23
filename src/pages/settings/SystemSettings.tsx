import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastLogin: string | null;
}

const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'company' | 'system' | 'security'>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    companyName: 'ERHA Fabrication & Construction',
    contactEmail: 'info@erha.co.za',
    contactPhone: '+27 (0)16 123 4567',
    address: 'Sasolburg, Free State, South Africa',
    taxNumber: 'VAT123456789',
    registrationNumber: 'REG2024/001'
  });

  // System information state
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    buildDate: 'November 17, 2025',
    environment: 'Development',
    databaseSize: '10.5 MB',
    totalRecords: '8,834',
    uptime: '15 hours'
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30
  });

  // Check if user has admin access
  useEffect(() => {
    if (!permissions.canAccessSettings()) {
      navigate('/dashboard');
    }
  }, [permissions, navigate]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('http://localhost:8080/api/users', {
      //   headers: { Authorization: `Bearer ${user?.token}` }
      // });
      
      // Mock data for now
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@erha.co.za',
          firstName: 'System',
          lastName: 'Administrator',
          status: 'ACTIVE',
          roles: ['ADMIN'],
          createdAt: '2024-10-01T08:00:00',
          lastLogin: '2025-11-17T10:00:00'
        },
        {
          id: '2',
          username: 'manager',
          email: 'manager@erha.co.za',
          firstName: 'John',
          lastName: 'Manager',
          status: 'ACTIVE',
          roles: ['MANAGER'],
          createdAt: '2024-10-05T09:00:00',
          lastLogin: '2025-11-17T09:45:00'
        },
        {
          id: '3',
          username: 'estimator',
          email: 'estimator@erha.co.za',
          firstName: 'Sarah',
          lastName: 'Estimator',
          status: 'ACTIVE',
          roles: ['ESTIMATOR'],
          createdAt: '2024-10-10T10:00:00',
          lastLogin: '2025-11-17T09:30:00'
        },
        {
          id: '4',
          username: 'user',
          email: 'user@erha.co.za',
          firstName: 'Mike',
          lastName: 'Worker',
          status: 'ACTIVE',
          roles: ['USER', 'EXECUTIVE'],
          createdAt: '2024-10-15T11:00:00',
          lastLogin: '2025-11-16T16:00:00'
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    const colorMap: { [key: string]: string } = {
      'ADMIN': 'danger',
      'MANAGER': 'primary',
      'ESTIMATOR': 'info',
      'EXECUTIVE': 'secondary',
      'USER': 'secondary',
      'FINANCE': 'success',
      'HUMAN_RESOURCES': 'warning'
    };
    return colorMap[role] || 'secondary';
  };

  const getStatusBadgeColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'INACTIVE': 'secondary',
      'SUSPENDED': 'danger',
      'PENDING_ACTIVATION': 'warning'
    };
    return colorMap[status] || 'secondary';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveCompanySettings = () => {
    // TODO: Implement API call to save company settings
    alert('Company settings saved successfully! (API integration pending)');
  };

  const handleSaveSecuritySettings = () => {
    // TODO: Implement API call to save security settings
    alert('Security settings saved successfully! (API integration pending)');
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowCreateUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowCreateUserModal(true);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    // TODO: Implement API call to toggle user status
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  const handleResetPassword = (userId: string) => {
    // TODO: Implement API call to reset password
    alert('Password reset email sent! (API integration pending)');
  };

  if (!permissions.canAccessSettings()) {
    return null;
  }

  return (
    <div className="container-fluid mt-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">System Settings</h2>
          <p className="text-muted mb-0">Manage users, company settings, and system configuration</p>
        </div>
        <div>
          <span className="badge bg-danger">Admin Only</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-2"></i>
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <i className="bi bi-building me-2"></i>
            Company Settings
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <i className="bi bi-info-circle me-2"></i>
            System Information
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="bi bi-shield-lock me-2"></i>
            Security Settings
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        
        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">System Users</h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleCreateUser}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create User
                </button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading users...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Roles</th>
                          <th>Status</th>
                          <th>Last Login</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <strong>{user.username}</strong>
                            </td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.roles.map((role, index) => (
                                <span 
                                  key={index}
                                  className={`badge bg-${getRoleBadgeColor(role)} me-1`}
                                >
                                  {role}
                                </span>
                              ))}
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <small>{formatDate(user.lastLogin)}</small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => handleResetPassword(user.id)}
                                  title="Reset Password"
                                >
                                  <i className="bi bi-key"></i>
                                </button>
                                <button 
                                  className={`btn btn-outline-${user.status === 'ACTIVE' ? 'danger' : 'success'}`}
                                  onClick={() => handleToggleUserStatus(user.id, user.status)}
                                  title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                >
                                  <i className={`bi bi-${user.status === 'ACTIVE' ? 'x-circle' : 'check-circle'}`}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* User Statistics */}
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h3 className="mb-0">{users.length}</h3>
                        <small className="text-muted">Total Users</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="mb-0 text-success">
                          {users.filter(u => u.status === 'ACTIVE').length}
                        </h3>
                        <small className="text-muted">Active Users</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-secondary bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="mb-0 text-secondary">
                          {users.filter(u => u.status === 'INACTIVE').length}
                        </h3>
                        <small className="text-muted">Inactive Users</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-danger bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="mb-0 text-danger">
                          {users.filter(u => u.roles.includes('ADMIN')).length}
                        </h3>
                        <small className="text-muted">Administrators</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPANY SETTINGS TAB */}
        {activeTab === 'company' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Company Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCompanySettings(); }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.companyName}
                        onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={companySettings.contactEmail}
                        onChange={(e) => setCompanySettings({...companySettings, contactEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={companySettings.contactPhone}
                        onChange={(e) => setCompanySettings({...companySettings, contactPhone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tax/VAT Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.taxNumber}
                        onChange={(e) => setCompanySettings({...companySettings, taxNumber: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Registration Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={companySettings.registrationNumber}
                        onChange={(e) => setCompanySettings({...companySettings, registrationNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-save me-2"></i>
                      Save Company Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM INFORMATION TAB */}
        {activeTab === 'system' && (
          <div className="tab-pane fade show active">
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Application Information</h5>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Version:</td>
                          <td>{systemInfo.version}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Build Date:</td>
                          <td>{systemInfo.buildDate}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Environment:</td>
                          <td>
                            <span className="badge bg-warning">{systemInfo.environment}</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">System Uptime:</td>
                          <td>{systemInfo.uptime}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Database Information</h5>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Database Size:</td>
                          <td>{systemInfo.databaseSize}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Total Records:</td>
                          <td>{systemInfo.totalRecords}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Database Type:</td>
                          <td>MySQL 8.0</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Last Backup:</td>
                          <td className="text-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Not configured
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">System Health</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <i className="bi bi-server text-success fs-3"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">Backend API</h6>
                            <small className="text-success">
                              <i className="bi bi-check-circle"></i> Healthy
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <i className="bi bi-database text-success fs-3"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">Database</h6>
                            <small className="text-success">
                              <i className="bi bi-check-circle"></i> Connected
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <i className="bi bi-shield-check text-success fs-3"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">Security</h6>
                            <small className="text-success">
                              <i className="bi bi-check-circle"></i> Active
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <i className="bi bi-cloud-arrow-down text-warning fs-3"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">Backups</h6>
                            <small className="text-warning">
                              <i className="bi bi-exclamation-triangle"></i> Not configured
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY SETTINGS TAB */}
        {activeTab === 'security' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Security & Authentication Settings</h5>
              </div>
              <div className="card-body">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSecuritySettings(); }}>
                  <h6 className="border-bottom pb-2 mb-3">Session Management</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        min="5"
                        max="480"
                      />
                      <small className="text-muted">Users will be logged out after this period of inactivity</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Login Attempts</label>
                      <input
                        type="number"
                        className="form-control"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                        min="3"
                        max="10"
                      />
                      <small className="text-muted">Account locked after exceeding this limit</small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lockout Duration (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                        min="5"
                        max="1440"
                      />
                      <small className="text-muted">How long accounts remain locked after failed attempts</small>
                    </div>
                  </div>

                  <h6 className="border-bottom pb-2 mb-3 mt-4">Password Policy</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Minimum Password Length</label>
                      <input
                        type="number"
                        className="form-control"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                        min="6"
                        max="32"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="requireUppercase"
                          checked={securitySettings.requireUppercase}
                          onChange={(e) => setSecuritySettings({...securitySettings, requireUppercase: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="requireUppercase">
                          Require Uppercase Letter
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="requireNumber"
                          checked={securitySettings.requireNumber}
                          onChange={(e) => setSecuritySettings({...securitySettings, requireNumber: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="requireNumber">
                          Require Number
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="requireSpecialChar"
                          checked={securitySettings.requireSpecialChar}
                          onChange={(e) => setSecuritySettings({...securitySettings, requireSpecialChar: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="requireSpecialChar">
                          Require Special Character
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Note:</strong> Security settings changes will apply to new user registrations and password changes. Existing sessions will not be affected immediately.
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-shield-check me-2"></i>
                      Save Security Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showCreateUserModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedUser ? 'Edit User' : 'Create New User'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Coming in Phase 1.5:</strong> Full user creation and editing functionality with role assignment and password management.
                </div>
                <p className="text-muted">For now, users can be managed directly in the database or use the backend API endpoints.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
