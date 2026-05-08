const admin = (req, res, next) => {
  console.log('=== Admin Middleware ===');
  console.log('req.user:', req.user); // Debug log
  console.log('req.user.role:', req.user?.role); // Debug log
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access GRANTED');
    next();
  } else {
    console.log('Admin access DENIED');
    console.log('User role:', req.user?.role);
    res.status(401).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

export default admin;

