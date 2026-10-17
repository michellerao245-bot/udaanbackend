// ==================== PAYMENT CONTROLLER ====================
const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== CREATE PAYMENT ORDER ====================
const createOrder = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await paymentService.createPaymentOrder(companyId, req.body);
    return successResponse(res, result, 'Payment order created');
  } catch (error) {
    console.error('Create payment error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== PAYMENT CALLBACK ====================
const callback = async (req, res) => {
  try {
    const { orderId, txnId, status } = req.body;

    console.log(`📥 Payment callback: ${orderId} - ${status}`);

    const result = await paymentService.verifyPayment(orderId, txnId, status);
    return successResponse(res, result, 'Payment verified');
  } catch (error) {
    console.error('Payment callback error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== PAYMENT STATUS ====================
const getStatus = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.orderId);
    if (!payment) return errorResponse(res, 'Payment not found', 404);
    return successResponse(res, payment, 'Payment status');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== PAYMENT HISTORY ====================
const getHistory = async (req, res) => {
  try {
    const { companyId } = req.user;
    const payments = await paymentService.getPaymentHistory(companyId, req.query.limit);
    return successResponse(res, payments, 'Payment history');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== SIMULATE PAYMENT (Testing) ====================
// Ye endpoint dummy payment ke liye hai
// Jab PhonePe KYC pending ho
const simulatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status = 'SUCCESS' } = req.query;

    console.log(`🧪 Simulating payment: ${orderId} → ${status}`);

    const result = await paymentService.verifyPayment(
      orderId,
      `SIMULATED-${Date.now()}`,
      status
    );

    return successResponse(res, result, `Payment simulated: ${status}`);
  } catch (error) {
    console.error('Simulate payment error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  createOrder,
  callback,
  getStatus,
  getHistory,
  simulatePayment,
};