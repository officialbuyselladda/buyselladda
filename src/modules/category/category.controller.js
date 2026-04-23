import asyncHandler from '../../utils/asyncHandler.js';
import responseHandler from '../../utils/responseHandler.js';
import Category from './category.model.js';
import * as categoryService from './category.service.js';
import { createCategorySchema, updateCategorySchema, listCategoriesSchema, getCategorySchema } from './category.validation.js';

const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = createCategorySchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  // Check parent exists if provided
  if (value.parent) {
    const parent = await Category.findById(value.parent);
    if (!parent) throw new ValidationError('Parent category not found');
  }

  const category = await categoryService.createCategory(value);
  responseHandler(res, 'Category created successfully', category, 201);
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  responseHandler(res, 'Category retrieved successfully', category);
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { withChildren = true, withProductsCount = true } = req.query;
  const category = await categoryService.getCategoryBySlug(slug, { 
    withChildren: withChildren === 'true', 
    withProductsCount: withProductsCount === 'true' 
  });
  responseHandler(res, 'Category retrieved successfully', category);
});

const listCategories = asyncHandler(async (req, res) => {
  const { error, value } = listCategoriesSchema.validate(req.query);
  if (error) throw new ValidationError(error.details[0].message);

  const categories = await categoryService.listCategories(value);
  responseHandler(res, 'Categories retrieved successfully', categories);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateCategorySchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  const category = await categoryService.updateCategory(id, value);
  responseHandler(res, 'Category updated successfully', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);
  responseHandler(res, 'Category deleted successfully');
});

const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoryTree();
  responseHandler(res, 'Category tree retrieved successfully', tree);
});

export {
  createCategory,
  getCategory,
  getCategoryBySlug,
  listCategories,
  updateCategory,
  deleteCategory,
  getCategoryTree
};

