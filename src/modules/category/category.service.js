import Category from './category.model.js';
import { NotFoundError, ValidationError } from '../../utils/errorHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ✅ CREATE
const createCategory = asyncHandler(async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
});

// ✅ GET BY ID
const getCategoryById = asyncHandler(async (id) => {
  const category = await Category.findById(id)
    .populate('children', 'name slug icon productsCount')
    .lean();

  if (!category) throw new NotFoundError('Category not found');

  return category;
});

// ✅ GET BY SLUG
const getCategoryBySlug = asyncHandler(async (slug, options = {}) => {
  const query = { slug, isActive: true };

  const category = await Category.findOne(query)
    .populate('children', 'name slug icon productsCount')
    .lean();

  if (!category) throw new NotFoundError('Category not found');

  // 🔥 FIX: products count
  if (options.withProductsCount) {
    const result = await Category.aggregate([
      { $match: { _id: category._id } },
      {
        $lookup: {
          from: 'products',
          let: { catId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$category', '$$catId'] } } }
          ],
          as: 'products'
        }
      },
      { $addFields: { productsCount: { $size: '$products' } } }
    ]);

    category.productsCount = result?.[0]?.productsCount || 0;
  }

  return category;
});

// ✅ LIST
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

// ✅ UPDATE
const updateCategory = asyncHandler(async (id, updateData) => {
  const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

  if (!category) throw new NotFoundError('Category not found');

  return category;
});

// ✅ DELETE
const deleteCategory = asyncHandler(async (id) => {
  const category = await Category.findById(id);

  if (!category) throw new NotFoundError('Category not found');

  const childrenCount = await Category.countDocuments({ parent: id });

  if (childrenCount > 0) {
    throw new ValidationError('Cannot delete category with children');
  }

  await category.deleteOne();

  return { message: 'Category deleted successfully' };
});

// ✅ 🔥 FINAL FIX: CATEGORY TREE (NO 500 ERROR)
const getCategoryTree = asyncHandler(async () => {

  const categories = await Category.find({ isActive: true })
    .sort('sortOrder')
    .lean();

  // 🔥 SAFE TREE BUILD (NO POPULATE CRASH)
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat._id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent && map[cat.parent]) {
      map[cat.parent].children.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
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