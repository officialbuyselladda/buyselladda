import { Router } from 'express';
import { register, login } from './auth.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import rateLimiter from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', rateLimiter, asyncHandler(register));
router.post('/login', rateLimiter, asyncHandler(login));

export default router;

