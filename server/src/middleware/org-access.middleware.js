const { pool } = require('../database/connection');
const { ApiError } = require('../utils/api-error');

/**
 * Middleware to verify that the authenticated user belongs to the requested organization.
 * Prevents cross-tenant data leakage in the Corporate L&D environment.
 */
const checkOrgAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orgId = req.params.orgId;

    if (!orgId) {
      return next(); // No orgId in params, skip check (handled by other logic if needed)
    }

    // Check if user is a member of the organization
    const [members] = await pool.query(
      'SELECT org_role FROM ld_org_members WHERE user_id = ? AND org_id = ?',
      [userId, orgId]
    );

    if (members.length === 0) {
      // Security: Throw 403 Forbidden to prevent unauthorized access
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to access this organization\'s data.'
      });
    }

    // Optional: Attach org-specific role to request for fine-grained permissions
    req.orgRole = members[0].org_role;
    
    next();
  } catch (error) {
    console.error(`[SECURITY ERROR] Org Access Check Failed | User: ${req.user?.id} | Org: ${req.params?.orgId} | Route: ${req.originalUrl} | Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal security check failed.'
    });
  }
};

module.exports = { checkOrgAccess };
