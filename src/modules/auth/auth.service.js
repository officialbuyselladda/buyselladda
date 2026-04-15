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

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
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

