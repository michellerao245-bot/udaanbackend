// ==================== AUTH ROUTES ====================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const otpService = require('../services/otp.service');

// Public routes
router.post('/super-admin/login', authController.superAdminLogin);
router.post('/company-admin/login', authController.companyAdminLogin);
router.post('/user/login', authController.userLogin);

// Email OTP Verification Routes
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await otpService.sendOtp(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    await otpService.verifyOtp(email, otp);
    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;