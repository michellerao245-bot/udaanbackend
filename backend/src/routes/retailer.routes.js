// ==================== RETAILER ROUTES ====================
const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailer.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Sab routes protected — login zaroori
router.use(verifyToken);

// Stats (⚠️ /:id se PEHLE)
router.get('/stats', retailerController.getStats);

// Bulk insert (sirf company admin)
router.post('/bulk', authorize('company-admin'), retailerController.bulkInsert);

// ==================== CRUD (Salesman + Admin dono) ====================
router.post('/', retailerController.createRetailer);           // ⭐ Salesman bhi add kar sakta
router.get('/', retailerController.getRetailers);
router.get('/:id', retailerController.getRetailer);
router.put('/:id', retailerController.updateRetailer);
router.delete('/:id', authorize('company-admin'), retailerController.deleteRetailer);

module.exports = router;