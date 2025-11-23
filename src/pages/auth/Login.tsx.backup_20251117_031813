import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2>ERHA OPS</h2>
            <p className="text-muted">Operations Management System</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter username"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
          
          <div className="mt-3 text-center">
            <small className="text-muted">Phase 1 - Demo Version</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;