import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import adminService from './admin.service.js';
import dashboardService from './dashboard.service.js';
import { deleteUserValidation, deleteProductValidation, approveProductValidation, rejectProductValidation, listValidation, userDetailValidation, toggleUserBlockValidation, updateUserValidation, resetUserPasswordValidation, createUserValidation, adPostingLimitsValidation, bulkAdPostingLimitsValidation, adminRoleAccountValidation, updateAdminRoleAccountValidation, userEmailVerificationValidation } from './admin.validation.js';

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

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { error } = userEmailVerificationValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await adminService.verifyUserEmail(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User email verified',
    data: user,
  });
});

const resendUserVerificationEmail = asyncHandler(async (req, res) => {
  const { error } = userEmailVerificationValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const result = await adminService.resendUserVerificationEmail(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.alreadyVerified ? 'User email is already verified' : 'Verification email sent',
    data: {
      emailSent: result.emailSent,
      alreadyVerified: result.alreadyVerified,
    },
  });
});

const getUserLimits = asyncHandler(async (req, res) => {
  const { error } = listValidation.validate(req.query);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const users = await adminService.listUserLimits(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User ad limits',
    data: users,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { error, value } = createUserValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await adminService.createUser(value);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created',
    data: user,
  });
});


const updateUser = asyncHandler(async (req, res) => {
  const paramValidation = userDetailValidation.validate({ id: req.params.id });
  if (paramValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: paramValidation.error.details[0].message,
    });
  }

  const bodyValidation = updateUserValidation.validate(req.body);
  if (bodyValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: bodyValidation.error.details[0].message,
    });
  }

  const user = await adminService.updateUser(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated',
    data: user,
  });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const paramValidation = userDetailValidation.validate({ id: req.params.id });
  if (paramValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: paramValidation.error.details[0].message,
    });
  }

  const bodyValidation = resetUserPasswordValidation.validate(req.body);
  if (bodyValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: bodyValidation.error.details[0].message,
    });
  }

  const user = await adminService.resetUserPassword(req.params.id, bodyValidation.value.password, req.user);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User password updated successfully',
    data: user,
  });
});

const updateUserAdLimits = asyncHandler(async (req, res) => {
  const paramValidation = userDetailValidation.validate({ id: req.params.id });
  if (paramValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: paramValidation.error.details[0].message,
    });
  }

  const bodyValidation = adPostingLimitsValidation.validate(req.body);
  if (bodyValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: bodyValidation.error.details[0].message,
    });
  }

  const user = await adminService.updateUserAdLimits(req.params.id, bodyValidation.value);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad posting limits updated',
    data: user,
  });
});

const bulkUpdateUserAdLimits = asyncHandler(async (req, res) => {
  const { error, value } = bulkAdPostingLimitsValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const result = await adminService.bulkUpdateUserAdLimits(value);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ad posting limits applied',
    data: result,
  });
});

const getAdminRoleAccounts = asyncHandler(async (req, res) => {
  const { error } = listValidation.validate(req.query);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const admins = await adminService.listAdminRoleAccounts(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin role accounts',
    data: admins,
  });
});

const createAdminRoleAccount = asyncHandler(async (req, res) => {
  const { error, value } = adminRoleAccountValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const adminUser = await adminService.createAdminRoleAccount(value);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Admin account created',
    data: adminUser,
  });
});

const updateAdminRoleAccount = asyncHandler(async (req, res) => {
  const paramValidation = userDetailValidation.validate({ id: req.params.id });
  if (paramValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: paramValidation.error.details[0].message,
    });
  }

  const bodyValidation = updateAdminRoleAccountValidation.validate(req.body);
  if (bodyValidation.error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: bodyValidation.error.details[0].message,
    });
  }

  const adminUser = await adminService.updateAdminRoleAccount(req.params.id, bodyValidation.value);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin account updated',
    data: adminUser,
  });
});

const deleteAdminRoleAccount = asyncHandler(async (req, res) => {
  const { error } = userDetailValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  await adminService.deleteAdminRoleAccount(req.params.id, req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin account deleted',
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

const getChats = asyncHandler(async (req, res) => {
  const chats = await adminService.listChats(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Chats list',
    data: chats,
  });
});

const deleteChat = asyncHandler(async (req, res) => {
  await adminService.deleteChat(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Chat deleted',
  });
});

const getReports = asyncHandler(async (req, res) => {
  const reports = await adminService.getReports(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Reports list',
    data: reports,
  });
});

const exportReports = asyncHandler(async (req, res) => {
  const format = req.params.format === 'pdf' ? 'pdf' : 'csv';
  const file = await adminService.getReportsExport(req.query, format);
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Disposition', `attachment; filename="buyselladda-reports-${stamp}.${format}"`);
  res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv; charset=utf-8');
  res.send(file);
});

const getModeration = asyncHandler(async (req, res) => {
  const moderation = await adminService.getModerationQueue(req.query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Moderation queue',
    data: moderation,
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Analytics data',
    data: analytics,
  });
});

export { getDashboard, deleteUser, deleteProduct, approveProduct, rejectProduct, getProducts, getUsers, getUserLimits, createUser, getUserDetail, toggleUserBlock, verifyUserEmail, resendUserVerificationEmail, updateUser, resetUserPassword, updateUserAdLimits, bulkUpdateUserAdLimits, getAdminRoleAccounts, createAdminRoleAccount, updateAdminRoleAccount, deleteAdminRoleAccount, getChats, deleteChat, getReports, exportReports, getModeration, getAnalytics };

