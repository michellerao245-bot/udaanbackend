// ==================== PAYMENT ROUTES ====================
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// ==================== PUBLIC ROUTES (No auth) ====================
// Payment callback — PhonePe se aayega
router.post('/callback', paymentController.callback);

// Payment status check
router.get('/status/:orderId', paymentController.getStatus);

// Simulate (testing ke liye — production me remove kar dena)
router.get('/simulate/:orderId', paymentController.simulatePayment);

// ==================== PROTECTED ROUTES ====================
router.use(verifyToken);

// Company admin payment order create
router.post(
  '/create-order',
  authorize('company-admin'),
  paymentController.createOrder
);

// Payment history
router.get('/history', paymentController.getHistory);

module.exports = router;