/**
 * requireRole: RBAC (Role-Based Access Control) Middleware
 * Restricts access based on Global Admin roles or Organizational roles.
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      // Check Global Admin Role
      const adminRole = req.user.adminRole || req.user.admin_role; // Support both naming conventions
      
      // Super Admin ALWAYS has access
      if (adminRole === 'super_admin') {
        return next();
      }

      // Check Specific Role (Priority to Global Admin, then Organizational)
      const currentRole = adminRole || req.orgRole;

      if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Role (${currentRole || 'none'}) lacks permission.`
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC ERROR]', error.message);
      res.status(500).json({ success: false, message: 'Authorization error.' });
    }
  };
};

module.exports = { requireRole, authorizeRole: requireRole };
