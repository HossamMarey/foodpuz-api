import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { authSchemas } from '../validators/auth.validator';
import { 
  register, 
  login, 
  googleAuth, 
  logout, 
  refreshToken, 
  checkEmailVerification,
  resendVerificationEmail,
  verifyEmail,
  getProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateEmail
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Auth routes will be implemented here
router.post('/register', validateRequest(authSchemas.register), register);

router.post('/login', validateRequest(authSchemas.login), async (req, res) => {
  try {
      await login(req, res); 
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/google', validateRequest(authSchemas.google), googleAuth);

router.post('/logout', authenticate, logout);

router.post('/refresh-token', validateRequest(authSchemas.refreshToken), refreshToken);

router.get('/verify-email-status', authenticate, checkEmailVerification);

// New email verification routes
router.post('/resend-verification', validateRequest(authSchemas.resendVerification), resendVerificationEmail);

router.get('/verify-email', verifyEmail);

// Profile routes
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, validateRequest(authSchemas.updateProfile), updateProfile);
router.patch('/email', authenticate, validateRequest(authSchemas.updateEmail), updateEmail);

// Password reset routes
router.post('/forgot-password', validateRequest(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password', validateRequest(authSchemas.resetPassword), resetPassword);

export default router;
