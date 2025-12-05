import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the page they were trying to access
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call testlogin endpoint directly
      const response = await fetch('http://localhost:8080/api/auth/testlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login success:', data);

      // Store user data for AuthContext
      const user = {
        username: data.username,
        roles: ['USER'],
        token: data.token
      };

      localStorage.setItem('user', JSON.stringify(user));

      // Force page reload to reinitialize AuthContext with new user
      window.location.href = from;

    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Backend may not be running.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center"
           style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)' }}>
        <div className="card shadow-lg border-0" style={{ width: '420px' }}>
          <div className="card-body p-5">
            {/* Logo/Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                   style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #1e3a5f, #3498db)' }}>
                <span className="text-white fw-bold fs-4">E</span>
              </div>
              <h2 className="fw-bold text-dark mb-1">ERHA OPS</h2>
              <p className="text-muted small">Operations Management System</p>
              <div className="badge bg-success text-white mt-2">
                TEST MODE - ANY PASSWORD WORKS
              </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <small>{error}</small>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label fw-medium">Username</label>
                <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    placeholder="Enter any username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoFocus
                    required
                />
                <small className="text-muted">Tip: Try "admin"</small>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-medium">Password</label>
                <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    placeholder="Enter any password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                />
                <small className="text-muted">Tip: Any password works (test mode)</small>
              </div>

              <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-medium"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)', border: 'none' }}
              >
                {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center">
              <small className="text-muted">
                ERHA Fabrication &amp; Construction
              </small>
            </div>

            {/* Scripture - Proverbs 16:3 */}
            <div className="mt-3 pt-3 border-top text-center">
              <small className="text-muted fst-italic">
                "Commit your works to the LORD, and your plans will be established."
                <br />— Proverbs 16:3
              </small>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
