import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';
import * as notificationController from './notification.controller.js';

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, notificationController.createNotification);

export default router;

