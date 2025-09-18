import React, { useState } from 'react';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './SocialAuthButtons.css';

const SocialAuthButtons = () => {
  const [isLoading, setIsLoading] = useState({
    google: false,
    facebook: false,
    github: false
  });

  const handleSocialLogin = async (provider) => {
    try {
      // Set loading state
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      // Store the current URL to redirect back after login
      const redirectUrl = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', redirectUrl);
      
      // Redirect to the backend's social login endpoint
      window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Failed to initiate ${provider} login. Please try again.`);
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="social-auth-container">
      <div className="divider">
        <span>OR</span>
      </div>
      
      <div className="social-buttons">
        <button 
          className={`social-btn google ${isLoading.google ? 'loading' : ''}`}
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading.google}
        >
          {isLoading.google ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FaGoogle className="social-icon" />
              Continue with Google
            </>
          )}
        </button>
        
        <button 
          className={`social-btn facebook ${isLoading.facebook ? 'loading' : ''}`}
          onClick={() => handleSocialLogin('facebook')}
          disabled={isLoading.facebook}
        >
          {isLoading.facebook ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FaFacebook className="social-icon" />
              Continue with Facebook
            </>
          )}
        </button>
        
        <button 
          className={`social-btn github ${isLoading.github ? 'loading' : ''}`}
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading.github}
        >
          {isLoading.github ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FaGithub className="social-icon" />
              Continue with GitHub
            </>
          )}
        </button>
      </div>
      
      <div className="terms-notice">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default SocialAuthButtons;
