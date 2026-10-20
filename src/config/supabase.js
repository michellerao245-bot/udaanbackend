// ==================== SUPABASE CLIENT ====================
const { createClient } = require('@supabase/supabase-js');

// Service role client (backend — full access)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Anon client (agar chahiye)
//const supabase = createClient(
//  process.env.SUPABASE_URL,
 // process.env.SUPABASE_ANON_KEY
//);

module.exports = { supabase, supabaseAdmin };