import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import productRoutes from './modules/product/product.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import geocodeRoutes from './modules/geocode/geocode.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import favoriteRoutes from './modules/favorite/favorite.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import appConfigRoutes from './modules/appConfig/appConfig.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/upload', uploadRoutes);
router.use('/chats', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/geocode', geocodeRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);
router.use('/content', contentRoutes);
router.use('/support', supportRoutes);
router.use('/app-config', appConfigRoutes);
router.use('/contact', contactRoutes);

export default router;
