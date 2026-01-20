import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';
import { apiRequest } from '../api';
import { useToast } from './Toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!token) {
      newErrors.token = 'Reset link is missing or invalid';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
      showToast({ message: 'Password has been reset. You can now log in.', type: 'success' });
    } catch (err) {
      showToast({ message: err.message || 'Failed to reset password', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 className="success-title">Password Reset Successful</h2>
            <p className="success-text">You can now sign in with your new password.</p>
            <button onClick={() => navigate('/Login')} className="auth-button">
              Go to Login <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="forgot-icon">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter a new password for your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.token && (
            <p className="error-message" style={{ marginBottom: '1rem' }}>
              <i className="fas fa-exclamation-circle"></i> {errors.token}
            </p>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter new password"
            />
            {errors.password && touched.password && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter new password"
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? (
              <>
                <span className="button-spinner" />
                Resetting...
              </>
            ) : (
              <>
                Reset Password <i className="fas fa-paper-plane"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
