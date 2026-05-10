import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';
import * as notificationController from './notification.controller.js';

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, notificationController.createNotification);
router.get('/admin/list', authMiddleware, adminMiddleware, notificationController.getAdminNotifications);

export default router;


