import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Checkbox,
  FormControlLabel,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    acceptTerms: false,
    acceptNewsletter: true,
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleClickShowPassword = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  
  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // const response = await registerUser({
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   password: formData.password,
      //   acceptNewsletter: formData.acceptNewsletter,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful registration, redirect to login or dashboard
      // For demo, we'll redirect to login with a success message
      navigate('/login', { 
        state: { 
          from: '/',
          message: 'Registration successful! Please log in with your new account.' 
        } 
      });
      
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialRegister = (provider) => {
    // In a real app, this would redirect to the OAuth provider
    console.log(`Registering with ${provider}`);
    // For demo purposes, we'll just show an alert
    alert(`You would be redirected to ${provider} registration`);
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
        staggerChildren: 0.08,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ maxWidth: 580, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Create an Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join us today and start shopping
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
          {/* Social Register Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
              Sign up with
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton 
                onClick={() => handleSocialRegister('Google')}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: 'rgba(66, 133, 244, 0.04)' },
                }}
              >
                <Google sx={{ color: '#DB4437' }} />
              </IconButton>
              <IconButton 
                onClick={() => handleSocialRegister('Facebook')}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { backgroundColor: 'rgba(66, 103, 178, 0.04)' },
                }}
              >
                <Facebook sx={{ color: '#4267B2' }} />
              </IconButton>
              <IconButton 
                onClick={() => handleSocialRegister('Apple')}
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
          
          {submitError && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
            
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
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
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
                error={!!errors.password}
                helperText={errors.password || 'At least 8 characters'}
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
                        onClick={() => handleClickShowPassword('showPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={formData.showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => handleClickShowPassword('showConfirmPassword')}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {formData.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    name="acceptTerms"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" color="primary" underline="hover">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" color="primary" underline="hover">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 1, alignItems: 'flex-start' }}
              />
              {errors.acceptTerms && (
                <Typography variant="caption" color="error" display="block" gutterBottom>
                  {errors.acceptTerms}
                </Typography>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptNewsletter}
                    onChange={handleChange}
                    name="acceptNewsletter"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Subscribe to our newsletter for updates and offers
                  </Typography>
                }
                sx={{ mt: 1, mb: 2 }}
              />
            </motion.div>
            
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    color="primary"
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign in
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

export default Register;
