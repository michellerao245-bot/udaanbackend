// ==================== SCHEME ROUTES ====================
const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/scheme.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Sab routes protected
router.use(verifyToken);

// ==================== STATES ====================
router.get('/states', schemeController.getStates);

// ==================== SCHEMES ====================
router.get('/stats', schemeController.getStats);
router.get('/', schemeController.getSchemes);
router.post(
  '/',
  authorize('company-admin', 'sales-manager'),
  schemeController.createScheme
);
router.get('/:id', schemeController.getScheme);
router.put(
  '/:id',
  authorize('company-admin', 'sales-manager'),
  schemeController.updateScheme
);
router.delete(
  '/:id',
  authorize('company-admin', 'sales-manager'),
  schemeController.deleteScheme
);

module.exports = router;