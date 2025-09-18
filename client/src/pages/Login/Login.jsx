import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the 'from' location or default to the home page
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleClickShowPassword = () => {
    setFormData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };
  
  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // const response = await loginUser(formData.email, formData.password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful login, redirect to the previous page or home
      navigate(from, { replace: true });
      
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = (provider) => {
    // In a real app, this would redirect to the OAuth provider
    console.log(`Logging in with ${provider}`);
    // For demo purposes, we'll just show an alert
    alert(`You would be redirected to ${provider} login`);
  };
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to access your account
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          variant="outlined" 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}
        >
          {/* Social Login Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
              Sign in with
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton 
                onClick={() => handleSocialLogin('Google')}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: 'rgba(66, 133, 244, 0.04)' },
                }}
              >
                <Google sx={{ color: '#DB4437' }} />
              </IconButton>
              <IconButton 
                onClick={() => handleSocialLogin('Facebook')}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: 'rgba(66, 103, 178, 0.04)' },
                }}
              >
                <Facebook sx={{ color: '#4267B2' }} />
              </IconButton>
              <IconButton 
                onClick={() => handleSocialLogin('Apple')}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <Apple sx={{ color: 'black' }} />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3, color: 'text.secondary' }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          {error && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
            </motion.div>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                color="primary"
                underline="hover"
              >
                Forgot password?
              </Link>
            </Box>
            
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mt: 1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    color="primary"
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Paper>
        
        <motion.div 
          variants={itemVariants}
          style={{ marginTop: 24 }}
        >
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ textTransform: 'none' }}
          >
            Back to home
          </Button>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;
