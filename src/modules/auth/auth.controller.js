import asyncHandler from '../../utils/asyncHandler.js';
import authService from './auth.service.js';
import sendResponse from '../../utils/responseHandler.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import sendEmail from '../../config/email.js';
import templates from '../../utils/emailTemplates.js';

const register = asyncHandler(async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const user = await authService.register(req.body);
  // Send welcome email
  await sendEmail(user.email, 'Welcome to DealKro', templates.welcome(user.name));
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: { user: { id: user._id, name: user.name, email: user.email } },
  });
});

const login = asyncHandler(async (req, res) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, token } = await authService.login(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Login successful',
    data: { user: { id: user._id, name: user.name, email: user.email }, token },
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, token } = await authService.login(req.body);
  
  // Check if user is admin
  if (user.role !== 'admin') {
    return sendResponse(res, {
      success: false,
      statusCode: 403,
      message: 'Access denied. Admin credentials required.',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin login successful',
    data: { 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    },
  });
});

export { register, login, adminLogin };

