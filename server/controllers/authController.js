import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  // Generate token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Create a cart for the new user
  await Cart.create({ user: user._id, items: [] });

  // Generate email confirmation token
  const emailToken = user.generateEmailConfirmToken();
  await user.save({ validateBeforeSave: false });

  // Create confirmation URL
  const confirmEmailURL = `${process.env.FRONTEND_URL}/confirm-email?token=${emailToken}`;

  // Send confirmation email
  const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email confirmation token',
      message,
    });

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailConfirmed: user.isEmailConfirmed,
      },
    });
  } catch (err) {
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true; // Auto-confirm if email fails
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailConfirmed: user.isEmailConfirmed,
      },
      message: 'Account created. Email confirmation could not be sent.',
    });
  }
});

// @desc    Confirm email
// @route   GET /api/v1/auth/confirmemail
// @access  Public
export const confirmEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(400);
    throw new Error('Invalid token');
  }

  const splitToken = token.split('.')[0];
  const confirmEmailToken = crypto
    .createHash('sha256')
    .update(splitToken)
    .digest('hex');

  const user = await User.findOne({
    confirmEmailToken,
    isEmailConfirmed: false,
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token or email already confirmed');
  }

  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;
  await user.save({ validateBeforeSave: false });

  // Generate token
  const authToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    success: true,
    token: authToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
    },
  });
});

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Check if account is locked
    if (user.isLocked) {
      if (user.lockUntil < Date.now()) {
        // Unlock the account if lock has expired
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.isLocked = false;
        await user.save({ validateBeforeSave: false });
      } else {
        const timeLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
        res.status(401);
        throw new Error(
          `Account is locked. Try again in ${timeLeft} minutes.`
        );
      }
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      // Optionally resend confirmation email here
      res.status(401);
      throw new Error('Please confirm your email before logging in');
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailConfirmed: user.isEmailConfirmed,
      },
    });
  } else {
    // Handle failed login attempt
    if (user) {
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }

      await user.save({ validateBeforeSave: false });

      const attemptsLeft = 5 - user.loginAttempts;
      if (attemptsLeft > 0) {
        res.status(401);
        throw new Error(
          `Invalid credentials. ${attemptsLeft} attempts left before account is locked.`
        );
      } else {
        res.status(401);
        throw new Error(
          'Too many failed login attempts. Account locked for 30 minutes.'
        );
      }
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token or token has expired');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // For API responses, we'll include the tokens in the response body
  // The cookie is set for browser-based auth
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
};

// @desc    Social login callback
// @access  Public
export const socialCallback = (req, res) => {
  try {
    if (req.user) {
      const token = generateToken(req.user._id);
      const refreshToken = generateRefreshToken(req.user._id);
      
      // Redirect to frontend with tokens in query params
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/social-callback?token=${token}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    } else {
      // Handle authentication failure
      const error = req.session.messages ? req.session.messages[0] : 'Authentication failed';
      const redirectUrl = `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Social login error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent('An error occurred during social login')}`;
    res.redirect(redirectUrl);
  }
};

// @desc    Social login failure
// @access  Public
export const socialLoginFailure = (req, res) => {
  const error = req.query.error || 'Authentication failed';
  const redirectUrl = `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`;
  res.redirect(redirectUrl);
};

// Using the existing getMe function for social login as well
