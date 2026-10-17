// ==================== PRODUCT ROUTES ====================
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Sab routes protected — login zaroori
router.use(verifyToken);

// ==================== GET ROUTES (sab role dekh sakte) ====================
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStock);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);

// ==================== WRITE ROUTES (sirf company admin) ====================
router.post('/', authorize('company-admin'), productController.createProduct);
router.put('/:id', authorize('company-admin'), productController.updateProduct);
router.delete('/:id', authorize('company-admin'), productController.deleteProduct);

module.exports = router;