import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Set refresh token in localStorage
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [refreshToken]);

  // Check if user is authenticated
  const checkUserLoggedIn = async () => {
    // If no token, skip the check
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set the auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Authentication check failed:', err);
      
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      // Don't log in automatically - user needs to verify email first
      if (res.data.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true,
          message: 'Registration successful! Please check your email to verify your account.'
        };
      }
      
      // If verification is not required, log in normally
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      await checkUserLoggedIn();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed',
      };
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      await axios.post('/api/auth/resendverification', { email });
      return { success: true, message: 'Verification email sent successfully!' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to resend verification email',
      };
    }
  };
  
  // Check if email is verified
  const isEmailVerified = () => {
    return user?.isEmailVerified || false;
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      setToken(res.data.token);
      setRefreshToken(res.data.refreshToken);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Handle social login callback
  const handleSocialCallback = async (token, refreshToken) => {
    try {
      // Set tokens first
      setToken(token);
      setRefreshToken(refreshToken);
      
      // Get user data with the new token
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      
      // Set axios default headers with the new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user: res.data };
    } catch (err) {
      console.error('Social login failed:', err);
      setError(err.response?.data?.message || 'Failed to complete social login');
      
      // Clear invalid tokens
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Only try to call the logout endpoint if we have a token
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth state
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect to login
      navigate('/login');
    }
  };

  // Update user details
  const updateDetails = async (formData) => {
    try {
      const res = await axios.put('/api/auth/updatedetails', formData);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Update failed',
      };
    }
  };

  // Update password
  const updatePassword = async (formData) => {
    try {
      await axios.put('/api/auth/updatepassword', formData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Password update failed',
      };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgotpassword', { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to send reset email',
      };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      await axios.put(`/api/auth/resetpassword/${resetToken}`, { password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Password reset failed',
      };
    }
  };

  // Check if user is authenticated on initial load
  useEffect(() => {
    if (token) {
      checkUserLoggedIn();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        error,
        isAuthenticated: !!token,
        isEmailVerified: isEmailVerified(),
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateDetails,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
