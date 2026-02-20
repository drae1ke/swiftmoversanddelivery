import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignUp.css';
import { apiRequest } from '../../api';
import { useToast } from './Toast';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // 'client', 'driver' or 'admin'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const newErrors = validateForm();
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const newErrors = validateForm();
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setSubmitting(true);
        const data = await apiRequest('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        // Auto-login and redirect based on role
        login(data.token, data.user);
        showToast({ message: 'Registration successful! You are now logged in.', type: 'success' });
        const role = data.user?.role;
        if (role === 'driver') {
          navigate('/DriverDashboard');
        } else if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'landlord') {
          navigate('/LandlordDashboard');
        } else {
          navigate('/Client');
        }
      } catch (err) {
        showToast({ message: err.message || 'Registration failed', type: 'error' });
      } finally {
        setSubmitting(false);
      }
    } else {
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join SwiftDeliver today</p>
        </div>

        <div className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.fullName && touched.fullName ? 'input-error' : ''}`}
              placeholder="Full Name"
              aria-label="Full Name"
            />
            {errors.fullName && touched.fullName && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.fullName}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.email && touched.email ? 'input-error' : ''}`}
              placeholder="Email Address"
              aria-label="Email Address"
            />
            {errors.email && touched.email && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
              placeholder="Password"
              aria-label="Password"
            />
            {errors.password && touched.password && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
              placeholder="Verify Password"
              aria-label="Verify Password"
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                />
                <span>Client (send deliveries)</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={formData.role === 'driver'}
                  onChange={handleChange}
                />
                <span>Driver (fulfil deliveries)</span>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                />
                <span>Admin (manage platform)</span>
              </label>
            </div>
          </div>

          <button onClick={handleSubmit} className="auth-button" disabled={submitting}>
            {submitting ? (
              <>
                <span className="button-spinner" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account <i className="fas fa-user-plus"></i>
              </>
            )}
          </button>

          <p className="auth-footer">
            Already have an account? <a href="Login" className="auth-link">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;