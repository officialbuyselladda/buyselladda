import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import productService from './product.service.js';

const createProduct = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  const product = await productService.createProduct(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Product created',
    data: product,
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Products fetched',
    data: products,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product fetched',
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product updated',
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product deleted',
  });
});

const getMyProducts = asyncHandler(async (req, res) => {
  const myProducts = await productService.getMyProducts(req.user._id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your products fetched',
    data: myProducts,
  });
});

export { createProduct, getProducts, getProduct, updateProduct, deleteProduct, getMyProducts };

