import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const SocialCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSocialCallback } = useContext(AuthContext);

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const refreshToken = params.get('refreshToken');
      const error = params.get('error');

      if (error) {
        toast.error(decodeURIComponent(error));
        navigate('/login');
        return;
      }

      if (token && refreshToken) {
        try {
          await handleSocialCallback(token, refreshToken);
          
          // Get the redirect URL from state or default to home
          const from = location.state?.from?.pathname || '/';
          navigate(from);
          toast.success('Successfully logged in!');
        } catch (err) {
          console.error('Social login error:', err);
          toast.error('Failed to complete social login. Please try again.');
          navigate('/login');
        }
      } else {
        toast.error('Invalid authentication response. Please try again.');
        navigate('/login');
      }
    };

    processCallback();
  }, [location, navigate, handleSocialCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">Completing Login</h2>
        <p className="text-center">Please wait while we log you in...</p>
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SocialCallback;
