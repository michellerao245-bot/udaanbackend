// ==================== AUTH CONTROLLER ====================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// ==================== 1. SUPER ADMIN LOGIN ====================
const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password required', 400);
    }
    const superAdmin = await authService.findSuperAdminByEmail(email);
    if (!superAdmin) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    const token = generateToken({
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
      type: 'super-admin',
    });
    return successResponse(
      res,
      {
        token,
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          type: 'super-admin',
        },
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Super admin login error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== 2. COMPANY ADMIN LOGIN ====================
const companyAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password required', 400);
    }
    const company = await authService.findCompanyByEmail(email);
    if (!company) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, company.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    if (!authService.isCompanyActive(company)) {
      return errorResponse(res, 'Company subscription expired or suspended.', 403, 'COMPANY_INACTIVE');
    }
    const token = generateToken({
      id: company.id,
      companyId: company.id,
      email: company.email,
      name: company.name,
      type: 'company-admin',
    });
    return successResponse(
      res,
      {
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          plan: company.plan_name,
          subscriptionEnd: company.subscription_end,
        },
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Company login error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== 3. USER LOGIN ====================
const userLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return errorResponse(res, 'User ID and password required', 400);
    }
    const user = await authService.findUserById(userId);
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    if (user.status === 'BLOCKED') {
      return errorResponse(res, 'Your account has been blocked.', 403, 'USER_BLOCKED');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    if (!authService.isCompanyActive(user.companies)) {
      return errorResponse(res, 'Company subscription expired.', 403, 'COMPANY_INACTIVE');
    }
    const token = generateToken({
      id: user.id,
      companyId: user.company_id,
      userId: user.user_id,
      name: user.name,
      role: user.role,
      type: user.role.toLowerCase(),
    });
    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          userId: user.user_id,
          name: user.name,
          role: user.role,
          companyId: user.company_id,
          companyName: user.companies?.name,
        },
      },
      'Login successful'
    );
  } catch (error) {
    console.error('User login error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== 4. GET CURRENT USER ====================
const getCurrentUser = async (req, res) => {
  return successResponse(res, req.user, 'User fetched');
};

module.exports = {
  superAdminLogin,
  companyAdminLogin,
  userLogin,
  getCurrentUser,
};