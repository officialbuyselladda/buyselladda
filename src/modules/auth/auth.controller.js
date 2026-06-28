import asyncHandler from '../../utils/asyncHandler.js';
import authService from './auth.service.js';
import sendResponse from '../../utils/responseHandler.js';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, verifyResetOtpValidation, changePasswordValidation, verifyEmailValidation, verifyEmailOtpValidation } from './auth.validation.js';
import sendEmail from '../../config/email.js';
import templates from '../../utils/emailTemplates.js';

const getClientUrl = () => (
  process.env.CLIENT_URL
  || process.env.FRONTEND_URL
  || process.env.WEBSITE_URL
  || 'https://buyselladda.com'
).replace(/\/$/, '');

const register = asyncHandler(async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, verifyToken, verifyOtp } = await authService.register(req.body);
  const clientUrl = getClientUrl();
  const verifyUrl = `${clientUrl}/verify-email/${verifyToken}`;
  let emailSent = true;
  let emailError = null;
  try {
    await sendEmail(user.email, 'Verify your BuySellAdda email', templates.verifyEmail({ name: user.name, verifyUrl, otp: verifyOtp }));
  } catch (error) {
    emailSent = false;
    emailError = error.message;
    console.warn('Verification email failed:', error.message);
  }
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: emailSent
      ? 'Registration successful. Please verify your email before login.'
      : 'Registration successful, but verification email could not be sent. Please contact admin or request resend.',
    data: {
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isEmailVerified: user.isEmailVerified },
      emailSent,
      emailError,
    },
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
  if (user.email) {
    sendEmail(
      user.email,
      'New login to your BuySellAdda account',
      templates.loginAlert({
        name: user.name,
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }),
    ).catch((emailError) => {
      console.warn('Login alert email failed:', emailError.message);
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Login successful',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, adminPermissions: user.adminPermissions || [] }, token },
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { error } = verifyEmailValidation.validate({ token: req.params.token });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { user, token } = await authService.verifyEmail(req.params.token);
  sendEmail(user.email, 'Welcome to BuySellAdda', templates.welcome(user.name)).catch((emailError) => {
    console.warn('Welcome email failed:', emailError.message);
  });
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Email verified successfully. You are now logged in.',
    data: { user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isEmailVerified: true }, token },
  });
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { error, value } = verifyEmailOtpValidation.validate(req.body);
  if (error) return sendResponse(res, { success: false, statusCode: 400, message: error.details[0].message });
  const { user, token } = await authService.verifyEmailOtp(value.email, value.otp);
  sendEmail(user.email, 'Welcome to BuySellAdda', templates.welcome(user.name)).catch((emailError) => {
    console.warn('Welcome email failed:', emailError.message);
  });
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Email verified successfully.',
    data: { user, token },
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { error, value } = verifyEmailOtpValidation.fork(['otp'], (schema) => schema.optional()).validate(req.body);
  if (error) return sendResponse(res, { success: false, statusCode: 400, message: error.details[0].message });
  const { user, verifyToken, verifyOtp } = await authService.createEmailVerification(value.email);
  if (user) {
    const clientUrl = getClientUrl();
    const verifyUrl = `${clientUrl}/verify-email/${verifyToken}`;
    await sendEmail(user.email, 'Your BuySellAdda verification code', templates.verifyEmail({ name: user.name, verifyUrl, otp: verifyOtp }));
  }
  sendResponse(res, { success: true, statusCode: 200, message: 'If the account is unverified, a new verification email has been sent.' });
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

  const { user, resetToken, resetOtp } = await authService.createPasswordResetToken(req.body.email);
  if (user) {
    const clientUrl = getClientUrl();
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    await sendEmail(user.email, 'Reset your BuySellAdda password', templates.passwordReset({ resetUrl, otp: resetOtp, name: user.name }));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'If this email exists, a password reset OTP has been sent.',
  });
});

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { error, value } = verifyResetOtpValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { resetToken } = await authService.verifyResetOtp(value.email, value.otp);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP verified. You can now set a new password.',
    data: { resetToken },
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
  if (user.email) {
    sendEmail(user.email, 'Your BuySellAdda password was changed', templates.passwordChanged(user.name)).catch((error) => {
      console.warn('Password reset confirmation email failed:', error.message);
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password reset successful',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { error } = changePasswordValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const user = await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  if (user.email) {
    sendEmail(user.email, 'Your BuySellAdda password was changed', templates.passwordChanged(user.name)).catch((error) => {
      console.warn('Password change email failed:', error.message);
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password changed successfully',
  });
});

export { register, login, adminLogin, forgotPassword, verifyResetOtp, resetPassword, changePassword, verifyEmail, verifyEmailOtp, resendVerification };
