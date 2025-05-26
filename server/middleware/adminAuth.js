const AppError = require('../utils/appError');

const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  next();
};

module.exports = adminAuth; 