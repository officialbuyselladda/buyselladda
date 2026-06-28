import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../user/user.model.js';
import generateToken from '../../utils/generateToken.js';

const createPublicToken = () => crypto.randomBytes(32).toString('hex');
const createOtp = () => crypto.randomInt(100000, 1000000).toString();
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (userData) => {
  const { name, email, password, phone, userType = 'normal' } = userData;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('This email is already registered. Please login or use a different email.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      subscriptionGroup: userType === 'dealer' ? 'dealer' : 'free',
      isEmailVerified: false,
    });
    const verifyToken = createPublicToken();
    const verifyOtp = createOtp();
    user.emailVerificationToken = hashToken(verifyToken);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    user.emailVerificationOtp = hashToken(verifyOtp);
    user.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    return { user, verifyToken, verifyOtp };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.code === 11000) {
      const err = new Error('This email is already registered. Please login or use a different email.');
      err.statusCode = 409;
      throw err;
    }
    const err = new Error('Could not create user. Please try again later.');
    err.statusCode = 500;
    throw err;
  }
};

const login = async ({ email, password }) => {
  if (!password) {
    throw new Error('Password required');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  if (user.isBlocked) {
    const error = new Error('Your account is blocked. Please contact support.');
    error.statusCode = 403;
    throw error;
  }
  if (user.role !== 'admin' && !user.isEmailVerified) {
    const error = new Error('Please verify your email before login. Check your inbox for the verification link.');
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id);
  return { user: user.toObject({ versionKey: false }), token };
};

const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+resetPasswordToken +resetPasswordExpire +resetPasswordOtp +resetPasswordOtpExpire');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(resetToken);
  const resetOtp = createOtp();
  const hashedOtp = hashToken(resetOtp);

  if (user) {
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
  }

  return { user, resetToken, resetOtp };
};

const verifyResetOtp = async (email, otp) => {
  const user = await User.findOne({
    email: String(email).trim().toLowerCase(),
    resetPasswordOtp: hashToken(String(otp)),
    resetPasswordOtpExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire +resetPasswordOtp +resetPasswordOtpExpire');
  if (!user) {
    const error = new Error('Reset OTP is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }

  // Generate a fresh reset token for the client to use
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  // Clear OTP fields after successful verification
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

const resetPassword = async (token, password) => {
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) {
    const error = new Error('Password reset link is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  await user.save();

  const authToken = generateToken(user._id);
  return { user: user.toObject({ versionKey: false }), token: authToken };
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpire');

  if (!user) {
    const error = new Error('Email verification link is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  const authToken = generateToken(user._id);
  return { user: user.toObject({ versionKey: false }), token: authToken };
};

const verifyEmailOtp = async (email, otp) => {
  const user = await User.findOne({
    email: String(email).trim().toLowerCase(),
    emailVerificationOtp: hashToken(String(otp)),
    emailVerificationOtpExpire: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpire +emailVerificationOtp +emailVerificationOtpExpire');
  if (!user) {
    const error = new Error('Verification OTP is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });
  return { user: user.toObject({ versionKey: false }), token: generateToken(user._id) };
};

const createEmailVerification = async (email) => {
  const user = await User.findOne({ email: String(email).trim().toLowerCase() })
    .select('+emailVerificationToken +emailVerificationExpire +emailVerificationOtp +emailVerificationOtpExpire');
  if (!user || user.isEmailVerified) return { user: null };
  const verifyToken = createPublicToken();
  const verifyOtp = createOtp();
  user.emailVerificationToken = hashToken(verifyToken);
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  user.emailVerificationOtp = hashToken(verifyOtp);
  user.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  return { user, verifyToken, verifyOtp };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !user.password) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return user.toObject({ versionKey: false });
};

export default { register, login, createPasswordResetToken, verifyResetOtp, resetPassword, changePassword, verifyEmail, verifyEmailOtp, createEmailVerification };
