import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/confirmemail?token=${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          
          // Auto-login if user is not already logged in
          if (!localStorage.getItem('token')) {
            const { email, password } = response.data;
            if (email && password) {
              await login({ email, password });
            }
          }
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Email verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'An error occurred during email verification.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, navigate, login]);

  // Resend verification email
  const handleResendEmail = async () => {
    try {
      await axios.post('/api/auth/resendverification', { token });
      toast.success('Verification email resent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        
        {status === 'verifying' && (
          <div className="verification-status">
            <div className="spinner"></div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="verification-status success">
            <div className="success-icon">✓</div>
            <p>{message}</p>
            <p>Redirecting you to the home page...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="verification-status error">
            <div className="error-icon">✕</div>
            <p>{message}</p>
            {token && (
              <button 
                onClick={handleResendEmail}
                className="btn btn-primary"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}
        
        <div className="auth-footer">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
