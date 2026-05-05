import express from 'express';
const router = express.Router();
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';
import * as categoryController from './category.controller.js';

router.route('/')
  .post(authMiddleware, adminMiddleware, categoryController.createCategory)
  .get(categoryController.listCategories);

// Admin route for listing all categories
router.get('/admin/list', authMiddleware, adminMiddleware, categoryController.listCategoriesAdmin);

router.route('/tree')
  .get(categoryController.getCategoryTree);

router.route('/:id')
  .get(categoryController.getCategory)
  .patch(authMiddleware, adminMiddleware, categoryController.updateCategory)
  .delete(authMiddleware, adminMiddleware, categoryController.deleteCategory);

router.route('/slug/:slug')
  .get(categoryController.getCategoryBySlug);

export default router;

