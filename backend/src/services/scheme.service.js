// ==================== SCHEME SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// ==================== GET STATES ====================
const getStates = async () => {
  const { data, error } = await supabaseAdmin
    .from('states')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// ==================== CREATE SCHEME ====================
const createScheme = async (companyId, userId, data) => {
  // Validation
  if (!data.title || !data.state_code || !data.valid_from || !data.valid_to) {
    throw new Error('Title, State, Valid dates zaroori hain');
  }

  const { data: scheme, error } = await supabaseAdmin
    .from('schemes')
    .insert({
      company_id: companyId,
      title: data.title.trim(),
      description: data.description || null,
      scheme_type: data.scheme_type || 'PRODUCT',
      state_code: data.state_code,
      target_product_id: data.target_product_id || null,
      target_category: data.target_category || null,
      target_amount: data.target_amount ? Number(data.target_amount) : null,
      offer_type: data.offer_type || 'BOGO',
      offer_value: Number(data.offer_value) || 0,
      offer_description: data.offer_description || null,
      reward_points: Number(data.reward_points) || 0,
      reward_cashback: Number(data.reward_cashback) || 0,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      status: 'ACTIVE',
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return scheme;
};

// ==================== GET ALL SCHEMES ====================
const getSchemes = async (companyId, filters = {}) => {
  let query = supabaseAdmin
    .from('schemes')
    .select('*, states(name, code)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.state_code) {
    query = query.eq('state_code', filters.state_code);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== GET ONE ====================
const getSchemeById = async (companyId, schemeId) => {
  const { data, error } = await supabaseAdmin
    .from('schemes')
    .select('*, states(name, code)')
    .eq('company_id', companyId)
    .eq('id', schemeId)
    .single();

  if (error) return null;
  return data;
};

// ==================== UPDATE ====================
const updateScheme = async (companyId, schemeId, updates) => {
  delete updates.id;
  delete updates.company_id;
  delete updates.created_at;

  if (updates.target_amount) updates.target_amount = Number(updates.target_amount);
  if (updates.offer_value) updates.offer_value = Number(updates.offer_value);
  if (updates.reward_points) updates.reward_points = Number(updates.reward_points);
  if (updates.reward_cashback) updates.reward_cashback = Number(updates.reward_cashback);

  const { data, error } = await supabaseAdmin
    .from('schemes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', schemeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== DELETE ====================
const deleteScheme = async (companyId, schemeId) => {
  const { error } = await supabaseAdmin
    .from('schemes')
    .delete()
    .eq('company_id', companyId)
    .eq('id', schemeId);

  if (error) throw error;
  return { success: true };
};

// ==================== STATS ====================
const getSchemeStats = async (companyId) => {
  const { data: schemes } = await supabaseAdmin
    .from('schemes')
    .select('status')
    .eq('company_id', companyId);

  const total = schemes?.length || 0;
  const active = schemes?.filter((s) => s.status === 'ACTIVE').length || 0;
  const paused = schemes?.filter((s) => s.status === 'PAUSED').length || 0;
  const expired = schemes?.filter((s) => s.status === 'EXPIRED').length || 0;

  return { total, active, paused, expired };
};

// ==================== EXPORTS ====================
module.exports = {
  getStates,
  createScheme,
  getSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
  getSchemeStats,
};