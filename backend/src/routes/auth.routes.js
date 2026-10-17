// ==================== AUTH ROUTES ====================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/super-admin/login', authController.superAdminLogin);
router.post('/company-admin/login', authController.companyAdminLogin);
router.post('/user/login', authController.userLogin);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;