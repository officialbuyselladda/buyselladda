import bcrypt from 'bcryptjs';
import User from '../user/user.model.js';
import generateToken from '../../utils/generateToken.js';

const register = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User already exists');
    }
    console.error('Create user error:', error);
    throw error;
  }
};

const login = async ({ email, password }) => {
  console.log('Login attempt for:', email); // Debug log
  if (!password) {
    throw new Error('Password required');
  }
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', !!user); // Debug log
  if (!user || !user.password) {
    console.log('No user or password missing');
    throw new Error('Invalid credentials');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch); // Debug log
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);
  return { user: user.toObject({ versionKey: false }), token };
};

export default { register, login };

