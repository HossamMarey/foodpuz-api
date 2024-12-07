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
  verifyEmail
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Auth routes will be implemented here
router.post('/register', validateRequest(authSchemas.register), register);

router.post('/login', validateRequest(authSchemas.login), login);

router.post('/google', validateRequest(authSchemas.google), googleAuth);

router.post('/logout', authenticate, logout);

router.post('/refresh-token', validateRequest(authSchemas.refreshToken), refreshToken);

router.get('/verify-email-status', authenticate, checkEmailVerification);

// New email verification routes
router.post('/resend-verification', validateRequest(authSchemas.resendVerification), resendVerificationEmail);

router.get('/verify-email', verifyEmail);

export default router;
