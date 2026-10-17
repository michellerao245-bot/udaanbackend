// ==================== STOCK SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// ==================== GET ALL STOCK ====================
const getStock = async (companyId, filters = {}) => {
  let query = supabaseAdmin
    .from('stock')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.distributorId) {
    query = query.eq('distributor_id', filters.distributorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== GET STOCK STATS ====================
const getStockStats = async (companyId) => {
  const { data: stock } = await supabaseAdmin
    .from('stock')
    .select('received, sold, low_threshold')
    .eq('company_id', companyId);

  const totalReceived = stock?.reduce((s, i) => s + (i.received || 0), 0) || 0;
  const totalSold = stock?.reduce((s, i) => s + (i.sold || 0), 0) || 0;
  const totalCurrent = totalReceived - totalSold;

  const lowStock =
    stock?.filter((s) => s.received - s.sold <= s.low_threshold).length || 0;

  const outOfStock =
    stock?.filter((s) => s.received - s.sold === 0).length || 0;

  return {
    totalReceived,
    totalSold,
    totalCurrent,
    lowStock,
    outOfStock,
    totalProducts: stock?.length || 0,
  };
};

// ==================== STOCK IN ====================
const stockIn = async (companyId, body, userId) => {
  const { productId, quantity, distributorId, reason } = body;

  if (!productId || !quantity || quantity <= 0) {
    throw new Error('Product ID aur Quantity zaroori hai');
  }

  // Product check
  const { data: product, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, name, company_id')
    .eq('id', productId)
    .eq('company_id', companyId)
    .single();

  if (prodError || !product) {
    throw new Error('Product not found in your company');
  }

  // Pehle stock record dhundo
  let query = supabaseAdmin
    .from('stock')
    .select('*')
    .eq('company_id', companyId)
    .eq('product_id', productId);

  if (distributorId) {
    query = query.eq('distributor_id', distributorId);
  } else {
    query = query.is('distributor_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  let stockRecord;

  if (existing) {
    // Update existing
    const { data: updated, error: updError } = await supabaseAdmin
      .from('stock')
      .update({
        received: existing.received + Number(quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updError) throw updError;
    stockRecord = updated;
  } else {
    // Create new
    const { data: created, error: insError } = await supabaseAdmin
      .from('stock')
      .insert({
        company_id: companyId,
        product_id: productId,
        product_name: product.name,
        distributor_id: distributorId || null,
        received: Number(quantity),
        sold: 0,
        low_threshold: 50,
      })
      .select()
      .single();

    if (insError) throw insError;
    stockRecord = created;
  }

  // Movement log
  await supabaseAdmin.from('stock_movements').insert({
    company_id: companyId,
    product_id: productId,
    product_name: product.name,
    distributor_id: distributorId || null,
    type: 'IN',
    quantity: Number(quantity),
    reason: reason || 'Stock received',
    created_by: userId,
  });

  return stockRecord;
};

// ==================== STOCK OUT ====================
const stockOut = async (companyId, body, userId) => {
  const { productId, quantity, distributorId, reason } = body;

  if (!productId || !quantity || quantity <= 0) {
    throw new Error('Product ID aur Quantity zaroori hai');
  }

  // Product check
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .eq('company_id', companyId)
    .single();

  if (!product) {
    throw new Error('Product not found');
  }

  // Stock record dhundo
  let query = supabaseAdmin
    .from('stock')
    .select('*')
    .eq('company_id', companyId)
    .eq('product_id', productId);

  if (distributorId) {
    query = query.eq('distributor_id', distributorId);
  } else {
    query = query.is('distributor_id', null);
  }

  const { data: existing } = await query.single();

  if (!existing) {
    throw new Error('Stock record nahi mila. Pehle Stock IN karein');
  }

  const currentStock = existing.received - existing.sold;

  if (currentStock < quantity) {
    throw new Error(
      `Stock kam hai! Available: ${currentStock}, Required: ${quantity}`
    );
  }

  // Update sold
  const { data: updatedStock, error: updErr } = await supabaseAdmin
    .from('stock')
    .update({
      sold: existing.sold + Number(quantity),
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (updErr) throw updErr;

  // Movement log
  await supabaseAdmin.from('stock_movements').insert({
    company_id: companyId,
    product_id: productId,
    product_name: product.name,
    distributor_id: distributorId || null,
    type: 'OUT',
    quantity: Number(quantity),
    reason: reason || 'Stock sent',
    created_by: userId,
  });

  return updatedStock;
};

// ==================== STOCK MOVEMENTS ====================
const getMovements = async (companyId, filters = {}) => {
  let query = supabaseAdmin
    .from('stock_movements')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(Number(filters.limit) || 100);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.productId) query = query.eq('product_id', filters.productId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== LOW STOCK ALERTS ====================
const getLowStockAlerts = async (companyId) => {
  const { data: stock, error } = await supabaseAdmin
    .from('stock')
    .select('*')
    .eq('company_id', companyId);

  if (error) throw error;

  const lowStock =
    stock?.filter((s) => {
      const current = s.received - s.sold;
      return current <= s.low_threshold;
    }) || [];

  // Sort by most critical
  lowStock.sort((a, b) => {
    const aPercent = (a.received - a.sold) / (a.received || 1);
    const bPercent = (b.received - b.sold) / (b.received || 1);
    return aPercent - bPercent;
  });

  return lowStock.map((s) => ({
    ...s,
    current: s.received - s.sold,
    percentage: s.received
      ? Math.round(((s.received - s.sold) / s.received) * 100)
      : 0,
  }));
};

// ==================== PRODUCT STOCK ====================
const getProductStock = async (companyId, productId) => {
  const { data, error } = await supabaseAdmin
    .from('stock')
    .select('*')
    .eq('company_id', companyId)
    .eq('product_id', productId);

  if (error) throw error;
  return data;
};

// ==================== EXPORTS ====================
module.exports = {
  getStock,
  getStockStats,
  stockIn,
  stockOut,
  getMovements,
  getLowStockAlerts,
  getProductStock,
};