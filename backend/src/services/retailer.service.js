// ==================== RETAILER SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// ==================== CREATE SINGLE (Salesman bhi kar sakta hai) ====================
const createRetailer = async (companyId, data, addedBy) => {
  // Validation
  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Shop name zaroori hai (minimum 2 characters)');
  }

  // Auto retailer code agar nahi diya
  let retailerCode = data.retailerCode;
  if (!retailerCode) {
    const { count } = await supabaseAdmin
      .from('retailers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    retailerCode = `RTL-${String((count || 0) + 1).padStart(5, '0')}`;
  }

  const { data: retailer, error } = await supabaseAdmin
    .from('retailers')
    .insert({
      company_id: companyId,
      retailer_code: retailerCode,
      name: data.name.trim(),
      owner_name: data.ownerName || null,
      phone: data.phone || null,
      address: data.address || null,
      location_lat: data.lat ? Number(data.lat) : null,
      location_lng: data.lng ? Number(data.lng) : null,
      assigned_salesman: addedBy,  // ⭐ Salesman ID
      category: data.category || 'B',
    })
    .select()
    .single();

  if (error) throw error;
  return retailer;
};

// ==================== BULK INSERT ====================
const bulkInsertRetailers = async (companyId, retailers, addedBy) => {
  if (!retailers || retailers.length === 0) {
    throw new Error('Koi retailer nahi mila');
  }

  if (retailers.length > 5000) {
    throw new Error('Ek baar me maximum 5000 retailers');
  }

  // Company ke existing retailers ke codes
  const { data: existing } = await supabaseAdmin
    .from('retailers')
    .select('retailer_code')
    .eq('company_id', companyId);

  const existingCodes = new Set((existing || []).map((r) => r.retailer_code));

  // Filter duplicates
  const newRetailers = retailers
    .filter((r) => r.retailerCode && !existingCodes.has(r.retailerCode))
    .map((r) => ({
      company_id: companyId,
      retailer_code: r.retailerCode,
      name: r.name,
      owner_name: r.ownerName || null,
      phone: r.phone || null,
      address: r.address || null,
      location_lat: r.lat ? Number(r.lat) : null,
      location_lng: r.lng ? Number(r.lng) : null,
      category: r.category || 'B',
    }));

  if (newRetailers.length === 0) {
    return {
      inserted: 0,
      skipped: retailers.length,
      message: 'Saare retailers already exist karte hain',
    };
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('retailers')
    .insert(newRetailers)
    .select('id, retailer_code, name');

  if (error) throw error;

  return {
    inserted: inserted.length,
    skipped: retailers.length - inserted.length,
    retailers: inserted,
  };
};

// ==================== GET ALL ====================
const getRetailers = async (companyId, filters = {}, userType, userId) => {
  let query = supabaseAdmin
    .from('retailers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Salesman sirf apne retailers dekhe
  if (userType === 'salesman') {
    query = query.eq('assigned_salesman', userId);
  }

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.assignedSalesman) {
    query = query.eq('assigned_salesman', filters.assignedSalesman);
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,retailer_code.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  const limit = Number(filters.limit) || 100;
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== GET ONE ====================
const getRetailerById = async (companyId, retailerId) => {
  const { data, error } = await supabaseAdmin
    .from('retailers')
    .select('*')
    .eq('company_id', companyId)
    .eq('id', retailerId)
    .single();

  if (error) return null;
  return data;
};

// ==================== UPDATE ====================
const updateRetailer = async (companyId, retailerId, updates) => {
  delete updates.id;
  delete updates.company_id;
  delete updates.created_at;

  const { data, error } = await supabaseAdmin
    .from('retailers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', retailerId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== DELETE ====================
const deleteRetailer = async (companyId, retailerId) => {
  const { error } = await supabaseAdmin
    .from('retailers')
    .delete()
    .eq('company_id', companyId)
    .eq('id', retailerId);

  if (error) throw error;
  return { success: true };
};

// ==================== STATS (FIXED) ====================
const getRetailerStats = async (companyId, userType, userId) => {
  // Ek helper function jo query build kare
  const buildQuery = (category) => {
    let q = supabaseAdmin
      .from('retailers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // ⭐ Salesman ke liye filter
    if (userType === 'salesman') {
      q = q.eq('assigned_salesman', userId);
    }

    // Category filter
    if (category) {
      q = q.eq('category', category);
    }

    return q;
  };

  const { count: total } = await buildQuery();
  const { count: aPlus } = await buildQuery('A+');
  const { count: a } = await buildQuery('A');
  const { count: b } = await buildQuery('B');

  return {
    total: total || 0,
    aPlus: aPlus || 0,
    a: a || 0,
    b: b || 0,
  };
};

// ==================== EXPORTS ====================
module.exports = {
  createRetailer,
  bulkInsertRetailers,
  getRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
  getRetailerStats,
};