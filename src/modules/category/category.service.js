import Category from './category.model.js';
import { NotFoundError, ValidationError } from '../../utils/errorHandler.js';

// ✅ CREATE
const createCategory = async (categoryData) => {
  try {
    if (categoryData.parent === '') categoryData.parent = null;
    const category = await Category.create(categoryData);
    return category;
  } catch (error) {
    if (error.code === 11000) {
      throw new ValidationError('Category with this name already exists');
    }
    throw error;
  }
};

// ✅ GET BY ID
const getCategoryById = async (id) => {
  const category = await Category.findById(id)
    .populate('children', 'name slug icon productsCount')
    .lean();

  if (!category) throw new NotFoundError('Category not found');

  return category;
};

// ✅ GET BY SLUG
const getCategoryBySlug = async (slug, options = {}) => {
  const query = { slug, isActive: true };

  const category = await Category.findOne(query)
    .populate('children', 'name slug icon productsCount')
    .lean();

  if (!category) throw new NotFoundError('Category not found');

  // 🔥 FIX: products count
  if (options.withProductsCount) {
    const Product = (await import('../product/product.model.js')).default;
    category.productsCount = await Product.countDocuments({ category: category.name, status: 'approved' });
  }

  return category;
};

// ✅ LIST
const listCategories = async (query = {}) => {
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
};

// ✅ UPDATE
const updateCategory = async (id, updateData) => {
  if (updateData.parent === '') updateData.parent = null;
  const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  if (!category) throw new NotFoundError('Category not found');

  return category;
};

// ✅ DELETE
const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) throw new NotFoundError('Category not found');

  const childrenCount = await Category.countDocuments({ parent: id });

  if (childrenCount > 0) {
    throw new ValidationError('Cannot delete category with children');
  }

  await category.deleteOne();

  return { message: 'Category deleted successfully' };
};

// ✅ 🔥 FINAL FIX: CATEGORY TREE (NO 500 ERROR)
const getCategoryTree = async () => {

  const categories = await Category.find({ isActive: true })
    .sort('sortOrder')
    .lean();

  const Product = (await import('../product/product.model.js')).default;
  const productCounts = await Product.aggregate([
    { $match: { status: 'approved', category: { $in: categories.map((cat) => cat.name) } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  productCounts.forEach((item) => { countMap[item._id] = item.count; });

  // 🔥 SAFE TREE BUILD (NO POPULATE CRASH)
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat._id] = { ...cat, productsCount: countMap[cat.name] || 0, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent && map[cat.parent]) {
      map[cat.parent].children.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
};

// ✅ ADMIN LIST - includes all categories (active and inactive)
const listCategoriesAdmin = async ({ page = 1, limit = 10, search, status }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  
  const filter = {};
  if (status && status !== 'all') {
    filter.isActive = status === 'active';
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('parent', 'name slug')
      .lean(),
    Category.countDocuments(filter)
  ]);
  
  // Get product counts for each category
  const Product = (await import('../product/product.model.js')).default;
  const categoryNames = categories.map(c => c.name);
  const productCounts = await Product.aggregate([
    { $match: { category: { $in: categoryNames }, status: 'approved' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const countMap = {};
  productCounts.forEach(p => { countMap[p._id] = p.count; });
  
  categories.forEach(c => {
    c.productCount = countMap[c.name] || 0;
    c.status = c.isActive ? 'active' : 'inactive';
  });
  
  return { 
    categories, 
    total, 
    page: pageNum, 
    limit: limitNum, 
    pages: Math.ceil(total / limitNum) 
  };
};

export {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  listCategoriesAdmin,
  updateCategory,
  deleteCategory,
  getCategoryTree
};

