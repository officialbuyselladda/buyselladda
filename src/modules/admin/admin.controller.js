import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import adminService from './admin.service.js';
import dashboardService from './dashboard.service.js';
import { deleteUserValidation, deleteProductValidation, approveProductValidation, rejectProductValidation, listValidation, userDetailValidation, toggleUserBlockValidation } from './admin.validation.js';

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Dashboard stats',
    data: stats,
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const { error } = listValidation.validate(req.query);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const products = await adminService.listProducts(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Products list',
    data: products,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { error } = listValidation.validate(req.query);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const users = await adminService.listUsers(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users list',
    data: users,
  });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const { error } = userDetailValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await adminService.getUserDetail(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User detail',
    data: user,
  });
});

const toggleUserBlock = asyncHandler(async (req, res) => {
  const { error } = toggleUserBlockValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await adminService.toggleUserBlock(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { error } = deleteUserValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  await adminService.deleteUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted',
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { error } = deleteProductValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  await adminService.deleteProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product deleted',
  });
});

const approveProduct = asyncHandler(async (req, res) => {
  const { error } = approveProductValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  await adminService.approveProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product approved',
  });
});

const rejectProduct = asyncHandler(async (req, res) => {
  const { error } = rejectProductValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  await adminService.rejectProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product rejected',
  });
});

export { getDashboard, deleteUser, deleteProduct, approveProduct, rejectProduct, getProducts, getUsers, getUserDetail, toggleUserBlock };

