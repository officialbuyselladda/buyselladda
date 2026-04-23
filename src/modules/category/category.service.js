import Category from './category.model.js';
import { NotFoundError, ValidationError } from '../../utils/errorHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';

const createCategory = asyncHandler(async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
});

const getCategoryById = asyncHandler(async (id) => {
  const category = await Category.findById(id).populate('children', 'name slug icon');
  if (!category) throw new NotFoundError('Category not found');
  return category;
});

const getCategoryBySlug = asyncHandler(async (slug, options = {}) => {
  const query = { slug, isActive: true };
  const category = await Category.findOne(query)
    .populate('children', 'name slug icon productsCount')
    .lean();
  
  if (!category) throw new NotFoundError('Category not found');
  
  // Add products count if requested (virtual population)
  if (options.withProductsCount) {
    category.productsCount = await Category.aggregate([
      { $match: { _id: category._id } },
      {
        $lookup: {
          from: 'products',
          let: { catId: '$_id' },
          pipeline: [{ $match: { $expr: { $in: ['$category', '$$catId'] } } }],
          as: 'products'
        }
      },
      { $addFields: { productsCount: { $size: '$products' } } },
      { $project: { productsCount: 1 } }
    ]);
  }
  
  return category;
});

const listCategories = asyncHandler(async (query = {}) => {
  const {
    parent = null,
    search,
    isActive = true,
    page = 1,
    limit = 10,
    sort = '-sortOrder'
  } = query;

  const filter = { isActive };
  if (parent) filter.parent = parent;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const categories = await Category.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('parent', 'name slug')
    .lean();

  const total = await Category.countDocuments(filter);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
});

const updateCategory = asyncHandler(async (id, updateData) => {
  const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
  if (!category) throw new NotFoundError('Category not found');
  return category;
});

const deleteCategory = asyncHandler(async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError('Category not found');
  
  // Check if has children or products
  const childrenCount = await Category.countDocuments({ parent: id });
  if (childrenCount > 0) {
    throw new ValidationError('Cannot delete category with children');
  }
  
  await category.deleteOne();
  return { message: 'Category deleted successfully' };
});

const getCategoryTree = asyncHandler(async () => {
  const rootCategories = await Category.find({ parent: null, isActive: true })
    .sort('sortOrder')
    .populate('children', 'name slug icon productsCount')
    .lean();
  return rootCategories;
});

export {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
  deleteCategory,
  getCategoryTree
};

