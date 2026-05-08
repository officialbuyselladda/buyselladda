import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Attach full user object to req.user including role
    req.user = user;
    console.log('Auth middleware - User role:', user.role); // Debug log
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};

export default auth;

