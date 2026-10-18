// ==================== ORDER ROUTES ====================
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Sab routes protected — login zaroori
router.use(verifyToken);

// ==================== STATS (⚠️ /:id se PEHLE) ====================
router.get('/stats', orderController.getStats);

// ==================== FILTERS (⚠️ /:id se PEHLE) ====================
router.get('/retailer/:retailerId', orderController.getRetailerOrders);
router.get('/salesman/:salesmanId', orderController.getSalesmanOrders);

// ==================== CRUD ====================
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;