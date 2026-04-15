import { Router } from 'express';
import { reverseGeocode } from './geocode.controller.js';
import rateLimiter from '../../middleware/rateLimiter.js';

const router = Router({ mergeParams: true });

router.get('/reverse', rateLimiter, reverseGeocode);

export default router;

