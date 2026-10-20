// ==================== COMPANY CONTROLLER ====================
const companyService = require('../services/company.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== REGISTER COMPANY ====================
const registerCompany = async (req, res) => {
  try {
    const { companyName, ownerName, email, phone, password } = req.body;

    // Diagnostic log: secret values print nahi hongi
    console.log('Registration fields received:', {
      bodyKeys: Object.keys(req.body || {}),
      companyName: !!companyName,
      ownerName: !!ownerName,
      email: !!email,
      phone: !!phone,
      password: !!password
    });

    if (!companyName || !ownerName || !email || !phone || !password) {
      return errorResponse(res, 'Saare fields zaroori hain', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password minimum 6 characters', 400);
    }

    const company = await companyService.createCompany(req.body);

    return successResponse(
      res,
      company,
      'Company registered successfully. Please complete payment.',
      201
    );
  } catch (error) {
    console.error('Register company error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET PROFILE ====================
const getProfile = async (req, res) => {
  try {
    const { companyId } = req.user;
    const company = await companyService.getCompanyById(companyId);

    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    return successResponse(res, company, 'Company profile');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== UPDATE PROFILE ====================
const updateProfile = async (req, res) => {
  try {
    const { companyId } = req.user;
    const company = await companyService.updateCompany(companyId, req.body);
    return successResponse(res, company, 'Profile updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== DASHBOARD ====================
const getDashboard = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stats = await companyService.getDashboardStats(companyId);
    return successResponse(res, stats, 'Dashboard stats');
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== USERS ====================
const getUsers = async (req, res) => {
  try {
    const { companyId } = req.user;
    const users = await companyService.getCompanyUsers(companyId, req.query);
    return successResponse(res, users, 'Users fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

const createUser = async (req, res) => {
  try {
    const { companyId } = req.user;
    const user = await companyService.createUser(companyId, req.body);
    return successResponse(res, user, 'User created', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updateUser = async (req, res) => {
  try {
    const { companyId } = req.user;
    const user = await companyService.updateUser(companyId, req.params.id, req.body);
    return successResponse(res, user, 'User updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { companyId } = req.user;
    await companyService.deleteUser(companyId, req.params.id);
    return successResponse(res, {}, 'User deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const toggleBlock = async (req, res) => {
  try {
    const { companyId } = req.user;
    const user = await companyService.toggleUserBlock(companyId, req.params.id);
    return successResponse(res, user, `User ${user.status.toLowerCase()}`);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== SUBSCRIPTION ====================
const getSubscription = async (req, res) => {
  try {
    const { companyId } = req.user;
    const sub = await companyService.getSubscription(companyId);
    return successResponse(res, sub, 'Subscription details');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== USER STATS ====================
const getUserStats = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stats = await companyService.getUserStats(companyId);
    return successResponse(res, stats, 'User stats');
  } catch (error) {
    console.error('User stats error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET ONE USER ====================
const getUser = async (req, res) => {
  try {
    const { companyId } = req.user;
    const user = await companyService.getUserById(companyId, req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET SALESMEN ====================
const getSalesmen = async (req, res) => {
  try {
    const { companyId } = req.user;
    const salesmen = await companyService.getUsersByRole(companyId, 'SALESMAN');
    return successResponse(res, salesmen, 'Salesmen fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET DISTRIBUTORS ====================
const getDistributors = async (req, res) => {
  try {
    const { companyId } = req.user;
    const distributors = await companyService.getUsersByRole(companyId, 'DISTRIBUTOR');
    return successResponse(res, distributors, 'Distributors fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { newPassword } = req.body;

    const user = await companyService.resetUserPassword(
      companyId,
      req.params.id,
      newPassword
    );

    return successResponse(res, user, 'Password reset successful');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== SCHEME PASSWORD ====================

// SET
const setSchemePassword = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { password } = req.body;
    const result = await companyService.setSchemePassword(companyId, password);
    return successResponse(res, result, 'Scheme password set');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// GET
const getSchemePassword = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await companyService.getSchemePassword(companyId);
    return successResponse(res, result, 'Scheme password fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// VERIFY
const verifySchemePassword = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { password } = req.body;
    const result = await companyService.verifySchemePassword(companyId, password);

    return successResponse(
      res,
      result,
      result.valid ? 'Password verified' : 'Invalid password'
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  // Company
  registerCompany,
  getProfile,
  updateProfile,
  getDashboard,
  getSubscription,

  // Users
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBlock,
  getUserStats,
  getUser,
  getSalesmen,
  getDistributors,
  resetPassword,

  // Scheme Password
  setSchemePassword,
  getSchemePassword,
  verifySchemePassword,
};