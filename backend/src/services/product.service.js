// ==================== PRODUCT SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// ==================== CREATE PRODUCT ====================
const createProduct = async (companyId, data) => {
  // Validation
  if (!data.name || !data.category || !data.mrp || !data.rate) {
    throw new Error('Name, Category, MRP, Rate zaroori hain');
  }

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      company_id: companyId,
      name: data.name.trim(),
      category: data.category.trim().toUpperCase(),
      mrp: Number(data.mrp),
      rate: Number(data.rate),
      unit: data.unit || 'PCH',
      stock: Number(data.stock) || 0,
      scheme: data.scheme || null,
      barcode: data.barcode || null,
      image_url: data.imageUrl || data.image_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return product;
};

// ==================== GET ALL PRODUCTS ====================
const getProducts = async (companyId, filters = {}) => {
  let query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.lowStock === 'true') {
    query = query.lt('stock', 50);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Debug: image_url check
  console.log(`📦 Products fetched: ${data?.length}`);
  if (data && data.length > 0) {
    console.log(`   First product image_url: ${data[0].image_url || 'NONE'}`);
  }

  return data;
};

// ==================== GET ONE PRODUCT ====================
const getProductById = async (companyId, productId) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .eq('id', productId)
    .single();

  if (error) return null;
  return data;
};

// ==================== UPDATE PRODUCT ====================
const updateProduct = async (companyId, productId, updates) => {
  delete updates.id;
  delete updates.company_id;
  delete updates.created_at;

  if (updates.mrp) updates.mrp = Number(updates.mrp);
  if (updates.rate) updates.rate = Number(updates.rate);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.category) updates.category = updates.category.toUpperCase();

  // Image URL support (camelCase → snake_case)
  if (updates.imageUrl !== undefined) {
    updates.image_url = updates.imageUrl;
    delete updates.imageUrl;
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== DELETE PRODUCT ====================
const deleteProduct = async (companyId, productId) => {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('id', productId)
    .single();

  if (!product) {
    throw new Error('Product not found');
  }

  console.log(`🗑️  Deleting product: ${product.name}`);

  await supabaseAdmin
    .from('stock')
    .delete()
    .eq('company_id', companyId)
    .eq('product_id', productId);

  await supabaseAdmin
    .from('stock_movements')
    .delete()
    .eq('company_id', companyId)
    .eq('product_id', productId);

  await supabaseAdmin
    .from('orders')
    .update({ product_id: null })
    .eq('company_id', companyId)
    .eq('product_id', productId);

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('company_id', companyId)
    .eq('id', productId);

  if (error) throw error;

  console.log('✅ Product deleted successfully');
  return { success: true };
};

// ==================== GET CATEGORIES ====================
const getCategories = async (companyId) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('company_id', companyId);

  if (error) throw error;

  const categories = [...new Set(data.map((p) => p.category))];
  return categories.sort();
};

// ==================== GET LOW STOCK PRODUCTS ====================
const getLowStockProducts = async (companyId, threshold = 50) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .lt('stock', threshold)
    .order('stock', { ascending: true });

  if (error) throw error;
  return data;
};

// ==================== SEARCH PRODUCTS ====================
const searchProducts = async (companyId, query) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
};

// ==================== EXPORTS ====================
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getLowStockProducts,
  searchProducts,
};