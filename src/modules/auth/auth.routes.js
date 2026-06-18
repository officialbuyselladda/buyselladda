import { Router } from 'express';
import { register, login, adminLogin, forgotPassword, resetPassword, changePassword, verifyEmail } from './auth.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import auth from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/admin-login', authLimiter, asyncHandler(adminLogin));
router.post('/forgot-password', authLimiter, asyncHandler(forgotPassword));
router.get('/verify-email/:token', authLimiter, asyncHandler(verifyEmail));
router.put('/reset-password/:token', authLimiter, asyncHandler(resetPassword));
router.put('/change-password', auth, asyncHandler(changePassword));

export default router;

