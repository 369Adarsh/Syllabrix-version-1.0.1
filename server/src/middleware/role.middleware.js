// Role-based access control
// Restricts routes to specific user types

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action is only for: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
