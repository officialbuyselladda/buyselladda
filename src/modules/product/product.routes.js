import { Router } from 'express';
import * as productController from './product.controller.js';
import auth from '../../middleware/auth.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(productController.getProducts));
router.get('/:id', asyncHandler(productController.getProduct));
router.get('/my-products', auth, asyncHandler(productController.getMyProducts));
router.post('/', auth, asyncHandler(productController.createProduct));
router.put('/:id', auth, asyncHandler(productController.updateProduct));
router.delete('/:id', auth, asyncHandler(productController.deleteProduct));

export default router;

