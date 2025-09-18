import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check if reset token is valid
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Verify the token with the backend
        const response = await axios.get(`/api/auth/validate-reset-token/${resetToken}`);
        if (response.data.valid) {
          setValidToken(true);
        } else {
          toast.error('Invalid or expired reset token');
          navigate('/forgot-password');
        }
      } catch (error) {
        toast.error('Invalid or expired reset token');
        navigate('/forgot-password');
      } finally {
        setLoading(false);
      }
    };

    if (resetToken) {
      checkToken();
    } else {
      setLoading(false);
      setValidToken(false);
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(resetToken, formData.password);
      if (result.success) {
        toast.success('Password reset successful! Please log in with your new password.');
        navigate('/login');
      } else {
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Validating Token...</h2>
          <p>Please wait while we validate your reset token.</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Invalid Token</h2>
          <p>The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <p>Please enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
          >
            {submitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        <div className="auth-footer">
          Remembered your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
