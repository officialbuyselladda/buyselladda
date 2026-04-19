import { Router } from 'express';
import * as productController from './product.controller.js';
import auth from '../../middleware/auth.middleware.js';
import { createProductPostLimiter } from '../../middleware/rateLimiter.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(productController.getProducts));
router.get('/recommendations', asyncHandler(productController.getRecommendations));
router.get('/my-products', auth, asyncHandler(productController.getMyProducts));
router.get('/:id', asyncHandler(productController.getProduct));
router.post('/', auth, createProductPostLimiter, asyncHandler(productController.createProduct));
router.put('/:id', auth, asyncHandler(productController.updateProduct));
router.delete('/:id', auth, asyncHandler(productController.deleteProduct));

export default router;

