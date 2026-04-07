import { Router } from 'express';
import { uploadImage } from './upload.controller.js';
import uploadMiddleware from '../../middleware/upload.middleware.js';
import auth from '../../middleware/auth.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

router.post('/', auth, uploadMiddleware.single('image'), asyncHandler(uploadImage));

export default router;

