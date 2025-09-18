import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { validationRules, validateForm, isFormValid } from '../../utils/validators';
import './Auth.css';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form validation rules
  const validationRules = {
    name: validationRules.name,
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: (value, allValues) => 
      value === allValues.password ? undefined : 'Passwords do not match',
  };

  // Validate form on change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateForm(formData, validationRules);
      setErrors(newErrors);
    }
  }, [formData, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);
    
    // Validate form
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    
    if (!isFormValid(formErrors)) {
      setError('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        if (response.requiresVerification) {
          // Show success message about email verification
          toast.success(response.message || 'Registration successful! Please check your email to verify your account.');
          // Redirect to login page
          navigate('/login', { state: { email: formData.email } });
        } else {
          // If no verification required, log in normally
          toast.success('Registration successful! You are now logged in.');
          navigate('/');
        }
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={touched.name && errors.name ? 'error' : ''}
              required
            />
            {touched.name && errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>
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
              minLength="8"
              required
            />
            {touched.password && errors.password && (
              <div className="error-message">
                {errors.password}
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'valid' : ''}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                      At least one uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                      At least one lowercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                      At least one number
                    </li>
                    <li className={/[!@#$%^&*]/.test(formData.password) ? 'valid' : ''}>
                      At least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
              minLength="8"
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Social Login Buttons */}
        <SocialAuthButtons />

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
