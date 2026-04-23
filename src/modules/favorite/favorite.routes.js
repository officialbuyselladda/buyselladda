import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import * as favoriteController from './favorite.controller.js';

router.post('/toggle', authMiddleware, favoriteController.toggleFavorite);
router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.get('/count', authMiddleware, favoriteController.getFavoriteCount);

export default router;

