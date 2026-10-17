// ==================== COMPANY SERVICE ====================
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

// ==================== COMPANY REGISTER ====================
const createCompany = async (data) => {
  // Check existing email/phone
  const { data: existing } = await supabaseAdmin
    .from('companies')
    .select('id')
    .or(`email.eq.${data.email},phone.eq.${data.phone}`)
    .maybeSingle();

  if (existing) {
    throw new Error('Email ya phone already registered hai');
  }

  // Password hash
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Company create
  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .insert({
      name: data.companyName,
      owner_name: data.ownerName,
      email: data.email,
      phone: data.phone,
      password_hash: passwordHash,
      gst_number: data.gstNumber,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      status: 'INACTIVE',
      subscription_status: 'PENDING',
      scheme_password: '123456',
    })
    .select()
    .single();

  if (error) throw error;

  // Password hash hata ke return karo
  delete company.password_hash;
  return company;
};

// ==================== COMPANY PROFILE ====================
const getCompanyById = async (companyId) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) return null;
  delete data.password_hash;
  return data;
};

// ==================== UPDATE COMPANY ====================
const updateCompany = async (companyId, updates) => {
  // Ye fields update nahi karne
  delete updates.id;
  delete updates.password_hash;
  delete updates.email;
  delete updates.phone;
  delete updates.subscription_status;
  delete updates.status;

  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  delete data.password_hash;
  return data;
};

// ==================== DASHBOARD STATS ====================
const getDashboardStats = async (companyId) => {
  const { count: usersCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: salesmenCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'SALESMAN');

  const { count: distributorsCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'DISTRIBUTOR');

  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: ordersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const today = new Date().toISOString().split('T')[0];
  const { count: todayOrders } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', today);

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('company_id', companyId);

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;

  return {
    users: usersCount || 0,
    salesmen: salesmenCount || 0,
    distributors: distributorsCount || 0,
    products: productsCount || 0,
    orders: ordersCount || 0,
    todayOrders: todayOrders || 0,
    totalRevenue: totalRevenue,
  };
};

// ==================== USERS CRUD ====================
const getCompanyUsers = async (companyId, filters = {}) => {
  let query = supabaseAdmin
    .from('users')
    .select('id, user_id, name, email, phone, role, status, state_code, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const createUser = async (companyId, data) => {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('company_id', companyId)
    .eq('user_id', data.userId)
    .maybeSingle();

  if (existing) {
    throw new Error(`User ID "${data.userId}" already exists in your company`);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      company_id: companyId,
      user_id: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash: passwordHash,
      role: data.role || 'SALESMAN',
      status: 'ACTIVE',
      state_code: data.stateCode || data.state_code || null,
      distributor_id: data.distributorId,
    })
    .select('id, user_id, name, email, phone, role, status, state_code')
    .single();

  if (error) throw error;
  return user;
};

const updateUser = async (companyId, userId, updates) => {
  delete updates.id;
  delete updates.company_id;
  delete updates.password_hash;
  delete updates.user_id;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', userId)
    .select('id, user_id, name, email, phone, role, status, state_code')
    .single();

  if (error) throw error;
  return data;
};

const deleteUser = async (companyId, userId) => {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('company_id', companyId)
    .eq('id', userId);

  if (error) throw error;
  return { success: true };
};

const toggleUserBlock = async (companyId, userId) => {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('status')
    .eq('company_id', companyId)
    .eq('id', userId)
    .single();

  if (!user) throw new Error('User not found');

  const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', userId)
    .select('id, user_id, name, status')
    .single();

  if (error) throw error;
  return data;
};

// ==================== SUBSCRIPTION ====================
const getSubscription = async (companyId) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('plan_id, plan_name, subscription_start, subscription_end, subscription_status, max_users, max_products, max_distributors')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

// ==================== ⭐ NAYE FUNCTIONS ====================

// ==================== USER STATS ====================
const getUserStats = async (companyId) => {
  const { count: total } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: active } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'ACTIVE');

  const { count: blocked } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'BLOCKED');

  const { count: salesmen } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'SALESMAN');

  const { count: distributors } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'DISTRIBUTOR');

  return {
    total: total || 0,
    active: active || 0,
    blocked: blocked || 0,
    salesmen: salesmen || 0,
    distributors: distributors || 0,
  };
};

// ==================== GET ONE USER ====================
const getUserById = async (companyId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, user_id, name, email, phone, role, status, state_code, created_at')
    .eq('company_id', companyId)
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};

// ==================== GET USERS BY ROLE ====================
const getUsersByRole = async (companyId, role) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, user_id, name, email, phone, role, status, state_code, created_at')
    .eq('company_id', companyId)
    .eq('role', role)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ==================== RESET PASSWORD ====================
const resetUserPassword = async (companyId, userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password minimum 6 characters');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)
    .eq('id', userId)
    .select('id, user_id, name')
    .single();

  if (error) throw error;
  return data;
};

// ==================== 🎁 SCHEME PASSWORD FUNCTIONS ====================

// Set scheme password (6-digit)
const setSchemePassword = async (companyId, password) => {
  if (!password || password.length !== 6 || !/^\d+$/.test(password)) {
    throw new Error('Password 6-digit numbers ka hona chahiye');
  }

  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({
      scheme_password: password,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId)
    .select('id, name, scheme_password')
    .single();

  if (error) throw error;
  return data;
};

// Get scheme password
const getSchemePassword = async (companyId) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('scheme_password')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

// Verify scheme password
const verifySchemePassword = async (companyId, password) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('scheme_password')
    .eq('id', companyId)
    .single();

  if (error) throw error;

  if (!data.scheme_password) {
    throw new Error('Scheme password set nahi hai. Settings me set karo.');
  }

  return { valid: data.scheme_password === password };
};

// ==================== EXPORTS ====================
module.exports = {
  // Company
  createCompany,
  getCompanyById,
  updateCompany,
  getDashboardStats,
  getSubscription,

  // Users
  getCompanyUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserBlock,
  getUserStats,
  getUserById,
  getUsersByRole,
  resetUserPassword,

  // 🎁 Scheme Password
  setSchemePassword,
  getSchemePassword,
  verifySchemePassword,
};