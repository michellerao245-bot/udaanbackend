// ==================== PRODUCT CONTROLLER ====================
const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== CREATE ====================
const createProduct = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { name, category, mrp, rate } = req.body;

    // Validation
    if (!name || !category || !mrp || !rate) {
      return errorResponse(res, 'Name, Category, MRP, Rate zaroori hain', 400);
    }

    if (Number(rate) > Number(mrp)) {
      return errorResponse(res, 'Rate MRP se zyada nahi ho sakta', 400);
    }

    const product = await productService.createProduct(companyId, req.body);
    return successResponse(res, product, 'Product created', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET ALL ====================
const getProducts = async (req, res) => {
  try {
    const { companyId } = req.user;
    const products = await productService.getProducts(companyId, req.query);
    return successResponse(res, products, 'Products fetched');
  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== GET ONE ====================
const getProduct = async (req, res) => {
  try {
    const { companyId } = req.user;
    const product = await productService.getProductById(companyId, req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, product, 'Product fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== UPDATE ====================
const updateProduct = async (req, res) => {
  try {
    const { companyId } = req.user;
    const product = await productService.updateProduct(companyId, req.params.id, req.body);
    return successResponse(res, product, 'Product updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== DELETE ====================
const deleteProduct = async (req, res) => {
  try {
    const { companyId } = req.user;
    await productService.deleteProduct(companyId, req.params.id);
    return successResponse(res, {}, 'Product deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== CATEGORIES ====================
const getCategories = async (req, res) => {
  try {
    const { companyId } = req.user;
    const categories = await productService.getCategories(companyId);
    return successResponse(res, categories, 'Categories fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== LOW STOCK ====================
const getLowStock = async (req, res) => {
  try {
    const { companyId } = req.user;
    const threshold = req.query.threshold || 50;
    const products = await productService.getLowStockProducts(companyId, Number(threshold));
    return successResponse(res, products, 'Low stock products');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== SEARCH ====================
const searchProducts = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { q } = req.query;

    if (!q) {
      return errorResponse(res, 'Search query required', 400);
    }

    const products = await productService.searchProducts(companyId, q);
    return successResponse(res, products, 'Search results');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getLowStock,
  searchProducts,
};