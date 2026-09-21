import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Shield, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import './Login.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Password reset link has been sent to your email.');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
            <h1>Reset Admin Password</h1>
            <p>Enter your email to receive a recovery link</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
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
              {loading ? <span className="login-spinner" /> : 'Send Reset Link'}
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

export default ResetPassword;
