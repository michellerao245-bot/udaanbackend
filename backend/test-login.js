// test-login.js
// Ye file sirf testing ke liye hai — login kaam kar raha hai ya nahi check karega

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('./src/config/supabase');

const testLogin = async () => {
  console.log('');
  console.log('========== DEBUG LOGIN ==========');

  const email = 'admin@udaan.com';
  const password = 'admin123';

  // Step 1: Supabase me admin dhundo
  const { data: admin, error } = await supabaseAdmin
    .from('super_admins')
    .select('*')
    .eq('email', email)
    .single();

  console.log('1. Email:', email);
  console.log('2. Admin found:', admin ? '✅ YES' : '❌ NO');

  if (error) {
    console.log('   Error:', error.message);
    return;
  }

  if (!admin) {
    console.log('   Admin nahi mila database me');
    return;
  }

  console.log('3. DB Email:', admin.email);
  console.log('4. DB Hash:', admin.password_hash);
  console.log('5. Hash length:', admin.password_hash?.length);

  // Step 2: Password verify karo
  const isValid = await bcrypt.compare(password, admin.password_hash);
  console.log('6. Password:', password);
  console.log('7. Password valid:', isValid ? '✅ YES' : '❌ NO');
  console.log('================================');
  console.log('');
};

testLogin();