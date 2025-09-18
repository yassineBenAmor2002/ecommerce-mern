import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { validationRules, validateForm, isFormValid } from '../../utils/validators';
import './Auth.css';
import { FiMail } from 'react-icons/fi';

const Login = () => {
  // State management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showResendLink, setShowResendLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Context and hooks
  const { login, resendVerificationEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Form validation rules
  const rules = {
    email: validationRules.email,
    password: validationRules.required,
  };

  // Validate form on change when fields are touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateForm(formData, rules);
      setErrors(newErrors);
    }
  }, [formData, touched]);

  // Handle input blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Pre-fill email if coming from registration
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }));
    }
  }, [location.state]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);
    
    // Validate form
    const formErrors = validateForm(formData, rules);
    setErrors(formErrors);
    
    if (!isFormValid(formErrors)) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setShowResendLink(false);

    try {
      const response = await login(formData);

      if (!response.success) {
        // Check if the error is due to unverified email
        if (response.error?.includes('verify your email')) {
          setError('Please verify your email address before logging in.');
          setShowResendLink(true);
        } else {
          setError(response.error || 'Login failed');
        }
      } else {
        toast.success('Login successful!');
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await resendVerificationEmail(formData.email);
      
      if (response.success) {
        toast.success(response.message || 'Verification email sent! Please check your inbox.');
        setShowResendLink(false);
      } else {
        setError(response.error || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={touched.email && errors.email ? 'error' : ''}
              required
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={touched.password && errors.password ? 'error' : ''}
              required
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
              {showResendLink && (
                <button 
                  type="button" 
                  onClick={handleResendVerification}
                  className="btn-link"
                  disabled={loading}
                >
                  <FiMail /> Resend verification email
                </button>
              )}
            </div>
          )}
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
