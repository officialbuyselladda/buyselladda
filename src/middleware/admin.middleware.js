const admin = (req, res, next) => {
  console.log('Admin middleware - req.user:', req.user); // Debug log
  console.log('Admin middleware - req.user.role:', req.user?.role); // Debug log
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('Admin middleware - Access denied, user is not admin');
    res.status(401).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

export default admin;

