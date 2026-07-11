import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import uploadMiddleware from '../../middleware/upload.middleware.js';
import { createContactMessage } from './contact.controller.js';

const router = Router();

router.post('/', uploadMiddleware.single('screenshot'), asyncHandler(createContactMessage));

export default router;
