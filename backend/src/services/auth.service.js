// ==================== AUTH SERVICE ====================
const { supabaseAdmin } = require('../config/supabase');

// Super Admin dhundho
const findSuperAdminByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from('super_admins')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
};

// Company dhundho
const findCompanyByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
};

// User dhundho (Salesman/Distributor)
const findUserById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, companies(*)')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

// Company active check
const isCompanyActive = (company) => {
  if (!company) return false;
  if (company.status === 'SUSPENDED') return false;
  if (company.subscription_status !== 'ACTIVE') return false;
  if (company.subscription_end) {
    const endDate = new Date(company.subscription_end);
    if (endDate < new Date()) return false;
  }
  return true;
};

module.exports = {
  findSuperAdminByEmail,
  findCompanyByEmail,
  findUserById,
  isCompanyActive,
};