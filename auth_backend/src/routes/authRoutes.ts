import express from 'express';
import authController from '../controller/authController';

const router = express.Router();

// Email & Password Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// reset password route
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:resetToken', authController.resetPassword);

// GIS and Github (Auth0) Authentication Routes
router.get('/google', authController.googleAuth);
router.get(
  '/google/callback',
  authController.googleAuthCallback,
  authController.googleAuthSuccess,
);
router.get('/github', authController.githubAuth);
router.get(
  '/github/callback',
  authController.githubAuthCallback,
  authController.githubAuthSuccess,
);

// Logout Route
router.get('/logout', authController.protect, authController.logout);

export default router;
