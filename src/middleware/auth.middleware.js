// ==================== AUTH MIDDLEWARE ====================
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const verifyToken = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return errorResponse(res, 'Not authorized. Token missing.', 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Not authorized', 401);
    if (!roles.includes(req.user.type)) {
      return errorResponse(res, `Role '${req.user.type}' not allowed`, 403);
    }
    next();
  };
};

module.exports = { verifyToken, authorize };