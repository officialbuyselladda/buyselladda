import { Router } from 'express';
import { register, login, adminLogin } from './auth.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/admin-login', authLimiter, asyncHandler(adminLogin));

export default router;

