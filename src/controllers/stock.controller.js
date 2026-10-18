// ==================== STOCK CONTROLLER ====================
const stockService = require('../services/stock.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== GET STOCK ====================
const getStock = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stock = await stockService.getStock(companyId, req.query);
    return successResponse(res, stock, 'Stock fetched');
  } catch (error) {
    console.error('Get stock error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== GET STATS ====================
const getStats = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stats = await stockService.getStockStats(companyId);
    return successResponse(res, stats, 'Stock stats');
  } catch (error) {
    console.error('Get stock stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== STOCK IN ====================
const stockIn = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const result = await stockService.stockIn(companyId, req.body, userId);
    return successResponse(res, result, 'Stock IN successful', 201);
  } catch (error) {
    console.error('Stock IN error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== STOCK OUT ====================
const stockOut = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const result = await stockService.stockOut(companyId, req.body, userId);
    return successResponse(res, result, 'Stock OUT successful');
  } catch (error) {
    console.error('Stock OUT error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== MOVEMENTS ====================
const getMovements = async (req, res) => {
  try {
    const { companyId } = req.user;
    const movements = await stockService.getMovements(companyId, req.query);
    return successResponse(res, movements, 'Movements fetched');
  } catch (error) {
    console.error('Get movements error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== LOW STOCK ALERTS ====================
const getLowStockAlerts = async (req, res) => {
  try {
    const { companyId } = req.user;
    const alerts = await stockService.getLowStockAlerts(companyId);
    return successResponse(res, alerts, 'Low stock alerts');
  } catch (error) {
    console.error('Low stock alerts error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== PRODUCT STOCK ====================
const getProductStock = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stock = await stockService.getProductStock(companyId, req.params.productId);
    return successResponse(res, stock, 'Product stock fetched');
  } catch (error) {
    console.error('Product stock error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  getStock,
  getStats,
  stockIn,
  stockOut,
  getMovements,
  getLowStockAlerts,
  getProductStock,
};