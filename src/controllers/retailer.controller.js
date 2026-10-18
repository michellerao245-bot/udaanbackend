// ==================== RETAILER CONTROLLER ====================
const retailerService = require('../services/retailer.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== CREATE (Salesman bhi) ====================
const createRetailer = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const retailer = await retailerService.createRetailer(companyId, req.body, userId);
    return successResponse(res, retailer, 'Retailer added successfully', 201);
  } catch (error) {
    console.error('Create retailer error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== BULK INSERT (sirf admin) ====================
const bulkInsert = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { retailers } = req.body;

    console.log(`📥 Bulk insert: ${retailers?.length || 0} retailers`);

    const result = await retailerService.bulkInsertRetailers(companyId, retailers, userId);
    return successResponse(res, result, `${result.inserted} retailers added`, 201);
  } catch (error) {
    console.error('Bulk insert error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET ALL ====================
const getRetailers = async (req, res) => {
  try {
    const { companyId, id: userId, type } = req.user;
    const retailers = await retailerService.getRetailers(
      companyId,
      req.query,
      type,
      userId
    );
    return successResponse(res, retailers, 'Retailers fetched');
  } catch (error) {
    console.error('Get retailers error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== GET ONE ====================
const getRetailer = async (req, res) => {
  try {
    const { companyId } = req.user;
    const retailer = await retailerService.getRetailerById(companyId, req.params.id);
    if (!retailer) return errorResponse(res, 'Retailer not found', 404);
    return successResponse(res, retailer, 'Retailer fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== UPDATE ====================
const updateRetailer = async (req, res) => {
  try {
    const { companyId } = req.user;
    const retailer = await retailerService.updateRetailer(
      companyId,
      req.params.id,
      req.body
    );
    return successResponse(res, retailer, 'Retailer updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== DELETE ====================
const deleteRetailer = async (req, res) => {
  try {
    const { companyId } = req.user;
    await retailerService.deleteRetailer(companyId, req.params.id);
    return successResponse(res, {}, 'Retailer deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== STATS ====================
const getStats = async (req, res) => {
  try {
    const { companyId, id: userId, type } = req.user;
    const stats = await retailerService.getRetailerStats(companyId, type, userId);
    return successResponse(res, stats, 'Retailer stats');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createRetailer,
  bulkInsert,
  getRetailers,
  getRetailer,
  updateRetailer,
  deleteRetailer,
  getStats,
};