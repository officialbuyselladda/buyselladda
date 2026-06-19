import { Router } from 'express';
import * as productController from './product.controller.js';
import auth from '../../middleware/auth.middleware.js';
import { createProductPostLimiter } from '../../middleware/rateLimiter.js';
import asyncHandler from '../../utils/asyncHandler.js';
import chatService from '../chat/chat.service.js';
import { getProduct as getProductById } from './product.service.js';
import sendResponse from '../../utils/responseHandler.js';

const router = Router();

router.get('/', asyncHandler(productController.getProducts));
router.get('/recommendations', asyncHandler(productController.getRecommendations));
router.get('/my-products', auth, asyncHandler(productController.getMyProducts));
router.get('/posting-eligibility', auth, asyncHandler(productController.getPostingEligibility));
router.get('/my-products/:id', auth, asyncHandler(productController.getMyProduct));
router.get('/:id', asyncHandler(productController.getProduct));

// Contact product seller - creates chat with seller
router.post('/:id/contact', auth, asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  
  // Get product to find seller
  const product = await getProductById(productId);
  if (!product) {
    return sendResponse(res, {
      success: false,
      statusCode: 404,
      message: 'Product not found',
    });
  }
  
  // Can't chat with yourself
  const sellerId = product.user?._id || product.user;

  if (sellerId.toString() === req.user._id.toString()) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'You cannot chat with yourself',
    });
  }
  
  // Create or find chat with seller (pass productId so same product = same chat)
  const participants = [req.user._id.toString(), sellerId.toString()];
  const chat = await chatService.createChat(participants, productId);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Chat created',
    data: { chat, product },
  });
}));

router.post('/', auth, createProductPostLimiter, asyncHandler(productController.createProduct));
router.put('/:id', auth, asyncHandler(productController.updateProduct));
router.post('/:id/boost', auth, asyncHandler(productController.boostProduct));
router.delete('/:id', auth, asyncHandler(productController.deleteProduct));

export default router;

