import bcrypt from 'bcryptjs';
import User from '../user/user.model.js';
import generateToken from '../../utils/generateToken.js';

const register = async (userData) => {
  const { name, email, password, phone = '' } = userData;

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
    });
    const token = generateToken(user._id);
    return { user, token };
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

  const token = generateToken(user._id);
  return { user: user.toObject({ versionKey: false }), token };
};

export default { register, login };

