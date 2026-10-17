// ==================== SUPABASE CONNECTION CHECK ====================
const { supabaseAdmin } = require('./supabase');

const connectDB = async () => {
  try {
    // Test query — plans table se (jo exist karta hai)
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('id, name, price')
      .limit(5);

    if (error) throw error;

    console.log('');
    console.log('✅ Supabase Connected Successfully');
    console.log(`   URL: ${process.env.SUPABASE_URL}`);
    console.log(`   Plans found: ${data?.length || 0}`);
    console.log('');

    return true;
  } catch (error) {
    console.error('');
    console.error('❌ Supabase Connection Failed');
    console.error(`   Error: ${error.message}`);
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;