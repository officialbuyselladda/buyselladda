import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import productRoutes from './modules/product/product.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import geocodeRoutes from './modules/geocode/geocode.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/upload', uploadRoutes);
router.use('/chats', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/geocode', geocodeRoutes);

export default router;

