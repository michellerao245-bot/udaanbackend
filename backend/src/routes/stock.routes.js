// ==================== STOCK ROUTES ====================
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Sab routes protected — login zaroori
router.use(verifyToken);

// ==================== GET ROUTES (sab role dekh sakte) ====================
router.get('/', stockController.getStock);
router.get('/stats', stockController.getStats);
router.get('/movements', stockController.getMovements);
router.get('/low-alerts', stockController.getLowStockAlerts);
router.get('/product/:productId', stockController.getProductStock);

// ==================== WRITE ROUTES (sirf company admin aur distributor) ====================
router.post('/in', authorize('company-admin', 'distributor'), stockController.stockIn);
router.post('/out', authorize('company-admin', 'distributor'), stockController.stockOut);

module.exports = router;