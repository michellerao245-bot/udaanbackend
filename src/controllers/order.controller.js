// ==================== ORDER CONTROLLER ====================
const orderService = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== CREATE ORDER ====================
const createOrder = async (req, res) => {
  try {
    const { companyId, id: userId, type } = req.user;

    // Sirf salesman aur company-admin order bana sakte hain
    if (!['salesman', 'company-admin'].includes(type)) {
      return errorResponse(res, 'Not authorized to create orders', 403);
    }

    const result = await orderService.createOrder(companyId, userId, req.body);
    return successResponse(res, result, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// ==================== GET ORDERS ====================
const getOrders = async (req, res) => {
  try {
    const { companyId, id: userId, type } = req.user;
    const orders = await orderService.getOrders(companyId, type, userId, req.query);
    return successResponse(res, orders, 'Orders fetched');
  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== GET ONE ORDER ====================
const getOrder = async (req, res) => {
  try {
    const { companyId } = req.user;
    const order = await orderService.getOrderById(companyId, req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order, 'Order fetched');
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// ==================== UPDATE STATUS ====================
const updateStatus = async (req, res) => {
  try {
    const { companyId, type } = req.user;

    // Sirf company-admin status update kar sakta hai
    if (type !== 'company-admin') {
      return errorResponse(res, 'Only admin can update order status', 403);
    }

    const { status } = req.body;
    const order = await orderService.updateOrderStatus(companyId, req.params.id, status);
    return successResponse(res, order, 'Status updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== DELETE ORDER ====================
const deleteOrder = async (req, res) => {
  try {
    const { companyId, type } = req.user;

    // Sirf company-admin delete kar sakta hai
    if (type !== 'company-admin') {
      return errorResponse(res, 'Only admin can delete orders', 403);
    }

    await orderService.deleteOrder(companyId, req.params.id);
    return successResponse(res, {}, 'Order deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== STATS ====================
const getStats = async (req, res) => {
  try {
    const { companyId, id: userId, type } = req.user;
    const stats = await orderService.getOrderStats(companyId, type, userId);
    return successResponse(res, stats, 'Order stats');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== RETAILER ORDERS ====================
const getRetailerOrders = async (req, res) => {
  try {
    const { companyId } = req.user;
    const orders = await orderService.getRetailerOrders(companyId, req.params.retailerId);
    return successResponse(res, orders, 'Retailer orders fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== SALESMAN ORDERS ====================
const getSalesmanOrders = async (req, res) => {
  try {
    const { companyId } = req.user;
    const orders = await orderService.getSalesmanOrders(companyId, req.params.salesmanId);
    return successResponse(res, orders, 'Salesman orders fetched');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateStatus,
  deleteOrder,
  getStats,
  getRetailerOrders,
  getSalesmanOrders,
};