import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, isLockedOut, lockoutRemainingMs, remainingAttempts } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (isLockedOut && lockoutRemainingMs > 0) {
      const interval = setInterval(() => {
        const remaining = lockoutRemainingMs - Date.now();
        if (remaining <= 0) {
          setCountdown('');
          clearInterval(interval);
        } else {
          const mins = Math.ceil(remaining / 60000);
          setCountdown(`${mins} min`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLockedOut, lockoutRemainingMs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  const isFormDisabled = loading || isLockedOut;

  return (
    <div className="admin-login-page">
      <div className="login-bg-pattern" />
      <div className="login-grid-pattern" />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Shield size={28} aria-hidden="true" />
            </div>
            <h1>Admin Panel</h1>
            <p>Secure area — authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={isFormDisabled}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {isLockedOut && (
              <div className="login-error">
                <AlertCircle size={15} aria-hidden="true" />
                <span>Account locked. Try again in {countdown}.</span>
              </div>
            )}

            {error && !isLockedOut && (
              <div className="login-error">
                <AlertCircle size={15} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {!isLockedOut && remainingAttempts < 5 && remainingAttempts > 0 && (
              <div className="login-warning">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout.
              </div>
            )}

            <button type="submit" className="login-btn" disabled={isFormDisabled}>
              {loading ? <span className="login-spinner" /> : 'Sign In to Admin'}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/" className="back-link">
              <ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} aria-hidden="true" />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;