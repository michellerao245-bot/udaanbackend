// ==================== ORDER SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// ==================== CREATE ORDER ====================
const createOrder = async (companyId, salesmanId, data) => {
  const { retailerId, retailerName, items } = data;

  if (!items || items.length === 0) {
    throw new Error('Koi item nahi hai order me');
  }

  // Order number banao
  const orderNumber = `UDN-${Date.now().toString().slice(-8)}`;

  // Har item ka row banao
  const orderRows = items.map((item) => ({
    order_number: orderNumber,
    company_id: companyId,
    salesman_id: salesmanId,
    retailer_id: retailerId,
    retailer_name: retailerName,
    product_id: item.productId,
    product_name: item.productName,
    quantity: Number(item.quantity),
    rate: Number(item.rate),
    mrp: Number(item.mrp),
    amount: Number(item.amount),
    status: 'PENDING',
    location_lat: data.locationLat || null,
    location_lng: data.locationLng || null,
    location_distance: data.locationDistance || null,
  }));

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .insert(orderRows)
    .select();

  if (error) throw error;

  return { orderNumber, orders };
};

// ==================== GET ORDERS (role-based) ====================
const getOrders = async (companyId, userType, userId, filters = {}) => {
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Salesman sirf apne orders dekhe
  if (userType === 'salesman') {
    query = query.eq('salesman_id', userId);
  }

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.retailerId) query = query.eq('retailer_id', filters.retailerId);
  if (filters.salesmanId) query = query.eq('salesman_id', filters.salesmanId);

  const limit = Number(filters.limit) || 100;
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== GET ONE ORDER ====================
const getOrderById = async (companyId, orderId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data;
};

// ==================== UPDATE STATUS ====================
const updateOrderStatus = async (companyId, orderId, status) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Valid: ${validStatuses.join(', ')}`);
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('company_id', companyId)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== DELETE ORDER ====================
const deleteOrder = async (companyId, orderId) => {
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('company_id', companyId)
    .eq('id', orderId);

  if (error) throw error;
  return { success: true };
};

// ==================== ORDER STATS ====================
const getOrderStats = async (companyId, userType, userId) => {
  let query = supabaseAdmin
    .from('orders')
    .select('status, amount')
    .eq('company_id', companyId);

  if (userType === 'salesman') {
    query = query.eq('salesman_id', userId);
  }

  const { data: orders } = await query;

  const today = new Date().toISOString().split('T')[0];

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'PENDING').length || 0,
    confirmed: orders?.filter((o) => o.status === 'CONFIRMED').length || 0,
    delivered: orders?.filter((o) => o.status === 'DELIVERED').length || 0,
    cancelled: orders?.filter((o) => o.status === 'CANCELLED').length || 0,
    totalRevenue:
      orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0,
  };

  return stats;
};

// ==================== RETAILER KE ORDERS ====================
const getRetailerOrders = async (companyId, retailerId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .eq('retailer_id', retailerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ==================== SALESMAN KE ORDERS ====================
const getSalesmanOrders = async (companyId, salesmanId) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .eq('salesman_id', salesmanId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ==================== EXPORTS ====================
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  getRetailerOrders,
  getSalesmanOrders,
};