import { Router } from 'express';
import * as adminController from './admin.controller.js';
import * as categoryController from '../category/category.controller.js';
import * as favoriteController from '../favorite/favorite.controller.js';
import * as notificationController from '../notification/notification.controller.js';
import * as contentController from '../content/content.controller.js';
import auth from '../../middleware/auth.middleware.js';
import admin from '../../middleware/admin.middleware.js';
import { requireAdminPermission } from '../../middleware/admin.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();
const permit = (permission) => requireAdminPermission(permission);

// Dashboard & Products & Users
router.get('/dashboard', auth, admin, permit('dashboard'), asyncHandler(adminController.getDashboard));
router.get('/analytics', auth, admin, permit('analytics'), asyncHandler(adminController.getAnalytics));
router.get('/products', auth, admin, permit('products'), asyncHandler(adminController.getProducts));
router.get('/users', auth, admin, permit('users'), asyncHandler(adminController.getUsers));
router.post('/users', auth, admin, permit('users'), asyncHandler(adminController.createUser));
router.get('/user-limits', auth, admin, permit('userLimits'), asyncHandler(adminController.getUserLimits));
router.put('/user-limits/bulk', auth, admin, permit('userLimits'), asyncHandler(adminController.bulkUpdateUserAdLimits));
router.get('/role-permissions', auth, admin, permit('adminRoles'), asyncHandler(adminController.getAdminRoleAccounts));
router.post('/role-permissions', auth, admin, permit('adminRoles'), asyncHandler(adminController.createAdminRoleAccount));
router.put('/role-permissions/:id', auth, admin, permit('adminRoles'), asyncHandler(adminController.updateAdminRoleAccount));
router.delete('/role-permissions/:id', auth, admin, permit('adminRoles'), asyncHandler(adminController.deleteAdminRoleAccount));
router.get('/chats', auth, admin, permit('chats'), asyncHandler(adminController.getChats));
router.delete('/chats/:id', auth, admin, permit('chats'), asyncHandler(adminController.deleteChat));
router.get('/reports', auth, admin, permit('reports'), asyncHandler(adminController.getReports));
router.get('/moderation', auth, admin, permit('moderation'), asyncHandler(adminController.getModeration));
router.get('/users/:id', auth, admin, permit('users'), asyncHandler(adminController.getUserDetail));
router.put('/users/:id/block', auth, admin, permit('users'), asyncHandler(adminController.toggleUserBlock));
router.put('/users/:id/ad-limits', auth, admin, permit('userLimits'), asyncHandler(adminController.updateUserAdLimits));
router.put('/users/:id', auth, admin, permit('users'), asyncHandler(adminController.updateUser));
router.delete('/users/:id', auth, admin, permit('users'), asyncHandler(adminController.deleteUser));
router.delete('/products/:id', auth, admin, permit('products'), asyncHandler(adminController.deleteProduct));
router.put('/products/:id/approve', auth, admin, permit('products'), asyncHandler(adminController.approveProduct));
router.put('/products/:id/reject', auth, admin, permit('products'), asyncHandler(adminController.rejectProduct));

// Categories (admin management)
router.get('/categories', auth, admin, permit('categories'), asyncHandler(categoryController.listCategoriesAdmin));
router.post('/categories', auth, admin, permit('categories'), asyncHandler(categoryController.createCategory));
router.patch('/categories/:id', auth, admin, permit('categories'), asyncHandler(categoryController.updateCategory));
router.delete('/categories/:id', auth, admin, permit('categories'), asyncHandler(categoryController.deleteCategory));

// Favorites (admin view/manage)
router.get('/favorites', auth, admin, permit('favorites'), asyncHandler(favoriteController.listFavoritesAdmin));
router.delete('/favorites/:id', auth, admin, permit('favorites'), asyncHandler(favoriteController.deleteFavoriteAdmin));

// Notifications (admin)
router.get('/notifications', auth, admin, permit('notifications'), asyncHandler(notificationController.getAdminNotifications));
router.post('/notifications', auth, admin, permit('notifications'), asyncHandler(notificationController.createNotification));
router.delete('/notifications/:id', auth, admin, permit('notifications'), asyncHandler(notificationController.deleteNotificationAdmin));

// Site content CMS
router.get('/content', auth, admin, permit('systemSettings'), asyncHandler(contentController.getSiteContent));
router.put('/content', auth, admin, permit('systemSettings'), asyncHandler(contentController.updateSiteContent));

export default router;

