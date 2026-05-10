import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { getSiteContent } from './content.controller.js';

const router = Router();

router.get('/site', asyncHandler(getSiteContent));

export default router;
