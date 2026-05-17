import { Router } from 'express';
import auth from '../../middleware/auth.middleware.js';
import admin from '../../middleware/admin.middleware.js';
import { requireAdminPermission } from '../../middleware/admin.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getAppConfig, updateAppConfig } from './appConfig.controller.js';

const router = Router();

router.get('/', asyncHandler(getAppConfig));
router.get('/admin', auth, admin, requireAdminPermission('appControl'), asyncHandler(getAppConfig));
router.put('/admin', auth, admin, requireAdminPermission('appControl'), asyncHandler(updateAppConfig));

export default router;
