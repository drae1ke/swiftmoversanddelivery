import React, { useState } from 'react';
import '../../styles/ForgotPassword.css';
import { useToast } from './Toast';
import { apiRequest } from '../../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email) {
      return 'Email is required';
    } else if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    if (touched) {
      setError(validateForm());
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateForm());
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    setError(validationError);
    setTouched(true);

    if (!validationError) {
      try {
        await apiRequest('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        setSubmitted(true);
        showToast({ message: `If that email exists, a reset link will be sent to ${email}`, type: 'success' });
      } catch (err) {
        showToast({ message: err.message || 'Failed to request password reset', type: 'error' });
      }
    }
  };

  const handleResend = async () => {
    const validationError = validateForm();
    setError(validationError);
    setTouched(true);
    if (validationError) return;

    try {
      setResending(true);
      await apiRequest('/api/auth/resend-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      showToast({ message: `If that email exists, another reset link will be sent to ${email}`, type: 'success' });
    } catch (err) {
      showToast({ message: err.message || 'Failed to resend reset email', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 className="success-title">Check Your Email</h2>
            <p className="success-text">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="success-subtext">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <button onClick={handleResend} className="auth-button" disabled={resending}>
              {resending ? (
                <>
                  <span className="button-spinner" /> Sending again...
                </>
              ) : (
                <>
                  Resend Email <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
            <button onClick={() => setSubmitted(false)} className="auth-button-secondary">
              <i className="fas fa-arrow-left"></i> Back to Reset
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
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            No worries! Enter your email and we'll send you reset instructions
          </p>
        </div>

        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${error && touched ? 'input-error' : ''}`}
              placeholder="Enter your email"
              aria-label="Email Address"
            />
            {error && touched && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </span>
            )}
          </div>

          <button onClick={handleSubmit} className="auth-button">
            Reset Password <i className="fas fa-paper-plane"></i>
          </button>

          <p className="auth-footer">
            Remember your password? <a href="Login" className="auth-link">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;