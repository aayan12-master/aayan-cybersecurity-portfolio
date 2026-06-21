import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Shield, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import './Login.css';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if there are error parameters in the URL hash (from Supabase Auth redirect failures)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const errorMsg = params.get('error_description');
      const errorCode = params.get('error_code');
      if (errorMsg) {
        setError(decodeURIComponent(errorMsg.replace(/\+/g, ' ')));
      } else if (errorCode === 'otp_expired') {
        setError('The password recovery link has expired. Please request a new one.');
      }
    }

    // Double check if the user is authenticated or has a valid recovery flow session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !hash.includes('error')) {
        setError('No active password recovery session was found. Please request a new reset link.');
      }
    };
    checkSession();
  }, []);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 12) {
      return 'Password must be at least 12 characters long.';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number.';
    }
    if (!/[^A-Za-z0-9]/.test(pass)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Password updated successfully! Redirecting to login in 3 seconds...');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Update Password</h1>
            <p>Set a secure new password for your administrator account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min. 12 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" aria-hidden="true" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={15} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#4ade80',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={15} aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : 'Update Password'}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/admin/login" className="back-link">
              <ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} aria-hidden="true" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
