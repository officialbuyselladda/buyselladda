import { Router } from 'express';
import { getMe, getPublicProfile, reportUser, toggleBlockUser, updateProfile, getProfileStats } from './user.controller.js';
import auth from '../../middleware/auth.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/me', auth, asyncHandler(getMe));
router.put('/profile', auth, asyncHandler(updateProfile));
router.get('/profile-stats', auth, asyncHandler(getProfileStats));
router.get('/:id', auth, asyncHandler(getPublicProfile));
router.post('/:id/block', auth, asyncHandler(toggleBlockUser));
router.post('/:id/report', auth, asyncHandler(reportUser));

export default router;

