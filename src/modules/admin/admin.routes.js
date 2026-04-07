import { Router } from 'express';
import * as adminController from './admin.controller.js';
import auth from '../../middleware/auth.middleware.js';
import admin from '../../middleware/admin.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/dashboard', auth, admin, asyncHandler(adminController.getDashboard));
router.delete('/users/:id', auth, admin, asyncHandler(adminController.deleteUser));
router.delete('/products/:id', auth, admin, asyncHandler(adminController.deleteProduct));
router.put('/products/:id/approve', auth, admin, asyncHandler(adminController.approveProduct));
router.put('/products/:id/reject', auth, admin, asyncHandler(adminController.rejectProduct));

export default router;

