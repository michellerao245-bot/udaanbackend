// ==================== SCHEME CONTROLLER ====================
const schemeService = require('../services/scheme.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== GET STATES ====================
const getStates = async (req, res) => {
  try {
    const states = await schemeService.getStates();
    return successResponse(res, states, 'States fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== CREATE ====================
const createScheme = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id: userId } = req.user;
    const scheme = await schemeService.createScheme(companyId, userId, req.body);
    return successResponse(res, scheme, 'Scheme created', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET ALL ====================
const getSchemes = async (req, res) => {
  try {
    const { companyId } = req.user;
    const schemes = await schemeService.getSchemes(companyId, req.query);
    return successResponse(res, schemes, 'Schemes fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== GET ONE ====================
const getScheme = async (req, res) => {
  try {
    const { companyId } = req.user;
    const scheme = await schemeService.getSchemeById(companyId, req.params.id);
    if (!scheme) return errorResponse(res, 'Scheme not found', 404);
    return successResponse(res, scheme, 'Scheme fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== UPDATE ====================
const updateScheme = async (req, res) => {
  try {
    const { companyId } = req.user;
    const scheme = await schemeService.updateScheme(companyId, req.params.id, req.body);
    return successResponse(res, scheme, 'Scheme updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== DELETE ====================
const deleteScheme = async (req, res) => {
  try {
    const { companyId } = req.user;
    await schemeService.deleteScheme(companyId, req.params.id);
    return successResponse(res, {}, 'Scheme deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== STATS ====================
const getStats = async (req, res) => {
  try {
    const { companyId } = req.user;
    const stats = await schemeService.getSchemeStats(companyId);
    return successResponse(res, stats, 'Scheme stats');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  getStates,
  createScheme,
  getSchemes,
  getScheme,
  updateScheme,
  deleteScheme,
  getStats,
};