const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

export const hasAdminPermission = (user, permission) => {
  if (!user || user.role !== 'admin') return false;
  const permissions = Array.isArray(user.adminPermissions) ? user.adminPermissions : [];
  return permissions.length === 0 || permissions.includes('all') || permissions.includes(permission);
};

export const requireAdminPermission = (permission) => (req, res, next) => {
  if (hasAdminPermission(req.user, permission)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to access this admin section',
  });
};

export default admin;

