import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';
import * as favoriteController from './favorite.controller.js';

router.post('/toggle', authMiddleware, favoriteController.toggleFavorite);
router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.get('/count', authMiddleware, favoriteController.getFavoriteCount);

// Admin routes - list all favorites
router.get('/admin/list', authMiddleware, adminMiddleware, favoriteController.listFavoritesAdmin);
// Admin delete a favorite
router.delete('/admin/:id', authMiddleware, adminMiddleware, favoriteController.deleteFavoriteAdmin);

export default router;

