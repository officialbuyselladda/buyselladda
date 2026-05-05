import asyncHandler from '../../utils/asyncHandler.js';
import responseHandler from '../../utils/responseHandler.js';
import Category from './category.model.js';
import * as categoryService from './category.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema
} from './category.validation.js';
import { ValidationError } from '../../utils/errorHandler.js'; // ✅ FIX

// ✅ CREATE
const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = createCategorySchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  // parent validation
  if (value.parent) {
    const parent = await Category.findById(value.parent);
    if (!parent) throw new ValidationError('Parent category not found');
  }

  const category = await categoryService.createCategory(value);

  responseHandler(res, 'Category created successfully', category, 201);
});

// ✅ GET BY ID
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);

  responseHandler(res, 'Category retrieved successfully', category);
});

// ✅ GET BY SLUG
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { withProductsCount = true } = req.query;

  const category = await categoryService.getCategoryBySlug(slug, {
    withProductsCount: withProductsCount === 'true'
  });

  responseHandler(res, 'Category retrieved successfully', category);
});

// ✅ LIST
const listCategories = asyncHandler(async (req, res) => {
  const { error, value } = listCategoriesSchema.validate(req.query);
  if (error) throw new ValidationError(error.details[0].message);

  const categories = await categoryService.listCategories(value);

  responseHandler(res, 'Categories retrieved successfully', categories);
});

// ✅ UPDATE
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error, value } = updateCategorySchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  const category = await categoryService.updateCategory(id, value);

  responseHandler(res, 'Category updated successfully', category);
});

// ✅ DELETE
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await categoryService.deleteCategory(id);

  responseHandler(res, 'Category deleted successfully');
});

// ✅ TREE (Already correct after service fix)
const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoryTree();

  responseHandler(res, 'Category tree retrieved successfully', tree);
});

// ✅ ADMIN LIST - all categories for admin panel
const listCategoriesAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const result = await categoryService.listCategoriesAdmin({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    status
  });

  responseHandler(res, 'Admin categories retrieved successfully', result);
});

export {
  createCategory,
  getCategory,
  getCategoryBySlug,
  listCategories,
  listCategoriesAdmin,
  updateCategory,
  deleteCategory,
  getCategoryTree
};
