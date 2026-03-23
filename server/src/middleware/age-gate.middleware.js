// Age-based access control
// Checks if user's age group has permission for the requested action

const { AGE_PERMISSIONS, hasPermission } = require('../../../shared/constants/age-permissions');

const requireAgePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const allowed = hasPermission(req.user.ageGroup, permission);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'This feature is not available for your age group.',
        ageGroup: req.user.ageGroup,
        requiredPermission: permission,
      });
    }

    next();
  };
};

// Check minimum age group
const requireMinAge = (minAgeGroup) => {
  const ageOrder = ['5-7', '8-10', '11-13', '14-15', '16-17', '18+'];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userIndex = ageOrder.indexOf(req.user.ageGroup);
    const minIndex = ageOrder.indexOf(minAgeGroup);

    if (userIndex < minIndex) {
      return res.status(403).json({
        success: false,
        message: 'You must be older to access this feature.',
      });
    }

    next();
  };
};

module.exports = { requireAgePermission, requireMinAge };
