import asyncHandler from '../../utils/asyncHandler.js';
import authService from './auth.service.js';
import sendResponse from '../../utils/responseHandler.js';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from './auth.validation.js';
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

  const { user, token } = await authService.register(req.body);
  // Send welcome email
  await sendEmail(user.email, 'Welcome to BuySellAdda', templates.welcome(user.name));
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: { user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token },
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
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, adminPermissions: user.adminPermissions || [] }, token },
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
        role: user.role,
        adminPermissions: user.adminPermissions || [],
      }, 
      token 
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { error } = forgotPasswordValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, resetToken } = await authService.createPasswordResetToken(req.body.email);
  if (user) {
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;
    await sendEmail(user.email, 'Reset your BuySellAdda password', templates.passwordReset(resetUrl));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'If this email exists, password reset instructions have been sent.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { error } = resetPasswordValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, token } = await authService.resetPassword(req.params.token, req.body.password);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password reset successful',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
  });
});

export { register, login, adminLogin, forgotPassword, resetPassword };

