import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import { 
  createProduct, 
  getProducts, 
  getProduct, 
  getMyProduct,
  updateProduct, 
  deleteProduct, 
  getMyProducts, 
  getRecommendations 
} from './product.service.js';
import {
  createProductValidation,
  updateProductValidation,
  productIdParamValidation,
  productListQueryValidation,
  myProductsQueryValidation,
  recommendationsQueryValidation,
} from './product.validation.js';

const createProductHandler = asyncHandler(async (req, res) => {
  const { error } = createProductValidation.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  req.body.user = req.user._id;
  const product = await createProduct(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Product created',
    data: product,
  });
});

const getProductsHandler = asyncHandler(async (req, res) => {
  const { error } = productListQueryValidation.validate(req.query);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const products = await getProducts(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Products fetched',
    data: products,
  });
});

const getProductHandler = asyncHandler(async (req, res) => {
  const { error } = productIdParamValidation.validate({ id: req.params.id });
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const product = await getProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product fetched',
    data: product,
  });
});

const getMyProductHandler = asyncHandler(async (req, res) => {
  const { error } = productIdParamValidation.validate({ id: req.params.id });
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const product = await getMyProduct(req.params.id, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your product fetched',
    data: product,
  });
});


const updateProductHandler = asyncHandler(async (req, res) => {
  const paramValidation = productIdParamValidation.validate({ id: req.params.id });
  if (paramValidation.error) {
    const err = new Error(paramValidation.error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const bodyValidation = updateProductValidation.validate(req.body);
  if (bodyValidation.error) {
    const err = new Error(bodyValidation.error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const product = await updateProduct(req.params.id, req.body, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product updated',
    data: product,
  });
});

const deleteProductHandler = asyncHandler(async (req, res) => {
  const { error } = productIdParamValidation.validate({ id: req.params.id });
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  await deleteProduct(req.params.id, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product deleted',
  });
});

const getMyProductsHandler = asyncHandler(async (req, res) => {
  const { error } = myProductsQueryValidation.validate(req.query);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const myProducts = await getMyProducts(req.user._id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your products fetched',
    data: myProducts,
  });
});

const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const { error } = recommendationsQueryValidation.validate(req.query);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const recommendations = await getRecommendations(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Recommendations fetched' + (req.query.similarTo ? ' using DSA Cosine Similarity' : ''),
    data: recommendations,
  });
});

export { 
  createProductHandler as createProduct, 
  getProductsHandler as getProducts, 
  getProductHandler as getProduct, 
  getMyProductHandler as getMyProduct,
  updateProductHandler as updateProduct, 
  deleteProductHandler as deleteProduct, 
  getMyProductsHandler as getMyProducts, 
  getRecommendationsHandler as getRecommendations 
};

