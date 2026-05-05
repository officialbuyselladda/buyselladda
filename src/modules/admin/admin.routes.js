import { Router } from 'express';
import * as adminController from './admin.controller.js';
import * as categoryController from '../category/category.controller.js';
import * as favoriteController from '../favorite/favorite.controller.js';
import * as notificationController from '../notification/notification.controller.js';
import auth from '../../middleware/auth.middleware.js';
import admin from '../../middleware/admin.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

// Dashboard & Products & Users
router.get('/dashboard', auth, admin, asyncHandler(adminController.getDashboard));
router.get('/products', auth, admin, asyncHandler(adminController.getProducts));
router.get('/users', auth, admin, asyncHandler(adminController.getUsers));
router.get('/users/:id', auth, admin, asyncHandler(adminController.getUserDetail));
router.put('/users/:id/block', auth, admin, asyncHandler(adminController.toggleUserBlock));
router.put('/users/:id', auth, admin, asyncHandler(adminController.updateUser));
router.delete('/users/:id', auth, admin, asyncHandler(adminController.deleteUser));
router.delete('/products/:id', auth, admin, asyncHandler(adminController.deleteProduct));
router.put('/products/:id/approve', auth, admin, asyncHandler(adminController.approveProduct));
router.put('/products/:id/reject', auth, admin, asyncHandler(adminController.rejectProduct));

// Categories (admin management)
router.get('/categories', auth, admin, asyncHandler(categoryController.listCategories));
router.post('/categories', auth, admin, asyncHandler(categoryController.createCategory));
router.patch('/categories/:id', auth, admin, asyncHandler(categoryController.updateCategory));
router.delete('/categories/:id', auth, admin, asyncHandler(categoryController.deleteCategory));

// Favorites (admin view/manage)
router.get('/favorites', auth, admin, asyncHandler(favoriteController.listFavoritesAdmin));
router.delete('/favorites/:id', auth, admin, asyncHandler(favoriteController.deleteFavoriteAdmin));

// Notifications (admin)
router.get('/notifications', auth, admin, asyncHandler(notificationController.getAdminNotifications));

export default router;

