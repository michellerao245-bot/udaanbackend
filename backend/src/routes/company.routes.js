// ==================== COMPANY ROUTES ====================
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// ==================== PUBLIC ROUTES ====================
// Company register (koi bhi kar sakta hai)
router.post('/register', companyController.registerCompany);

// ==================== PROTECTED ROUTES ====================
// Company admin only
router.use(verifyToken);
router.use(authorize('company-admin'));

// ==================== PROFILE ====================
router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);

// ==================== DASHBOARD ====================
router.get('/dashboard', companyController.getDashboard);

// ==================== USER STATS (⚠️ /:id se PEHLE) ====================
router.get('/users/stats', companyController.getUserStats);
router.get('/users/salesmen', companyController.getSalesmen);
router.get('/users/distributors', companyController.getDistributors);

// ==================== USER CRUD ====================
router.get('/users', companyController.getUsers);
router.post('/users', companyController.createUser);
router.get('/users/:id', companyController.getUser);
router.put('/users/:id', companyController.updateUser);
router.delete('/users/:id', companyController.deleteUser);
router.put('/users/:id/block', companyController.toggleBlock);
router.post('/users/:id/reset-password', companyController.resetPassword);

// ==================== SUBSCRIPTION ====================
router.get('/subscription', companyController.getSubscription);

// ==================== 🎁 SCHEME PASSWORD ====================
router.get('/scheme-password', companyController.getSchemePassword);
router.post('/scheme-password/set', companyController.setSchemePassword);
router.post('/scheme-password/verify', companyController.verifySchemePassword);

module.exports = router;