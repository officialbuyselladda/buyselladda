import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';
import * as categoryController from './category.controller.js';
import cache from '../../middleware/cache.middleware.js';

router.route('/')
  .post(authMiddleware, adminMiddleware, categoryController.createCategory)
  .get(cache(300), categoryController.listCategories);

// Admin route for listing all categories
router.get('/admin/list', authMiddleware, adminMiddleware, categoryController.listCategoriesAdmin);

router.route('/tree')
  .get(cache(300), categoryController.getCategoryTree);

router.route('/slug/:slug')
  .get(categoryController.getCategoryBySlug);

router.route('/:id')
  .get(categoryController.getCategory)
  .patch(authMiddleware, adminMiddleware, categoryController.updateCategory)
  .delete(authMiddleware, adminMiddleware, categoryController.deleteCategory);

export default router;

