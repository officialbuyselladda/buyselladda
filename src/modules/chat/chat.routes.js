import { Router } from 'express';
import * as chatController from './chat.controller.js';
import auth from '../../middleware/auth.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', auth, asyncHandler(chatController.getChats));
router.get('/:chatId/messages', auth, asyncHandler(chatController.getMessages));
router.post('/create', auth, asyncHandler(chatController.createChat));
router.post('/:chatId/send', auth, asyncHandler(chatController.sendMessage));

export default router;

