import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  confirmEmail,
  refreshToken,
  socialCallback,
  socialLoginFailure
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import passport from 'passport';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/confirmemail', confirmEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/refresh-token', refreshToken);

// Social login routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/api/v1/auth/failure',
    failureMessage: true,
    session: false 
  }), 
  socialCallback
);

router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'],
  session: false
}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: '/api/v1/auth/failure',
    failureMessage: true,
    session: false 
  }), 
  socialCallback
);

router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/api/v1/auth/failure',
    failureMessage: true,
    session: false 
  }), 
  socialCallback
);

// Social login failure route
router.get('/failure', socialLoginFailure);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', getMe);
router.get('/logout', logout);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

export default router;
