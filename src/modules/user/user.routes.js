import { Router } from 'express';
import { getMe, updateProfile, getProfileStats } from './user.controller.js';
import auth from '../../middleware/auth.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/me', auth, asyncHandler(getMe));
router.put('/profile', auth, asyncHandler(updateProfile));
router.get('/profile-stats', auth, asyncHandler(getProfileStats));

export default router;

