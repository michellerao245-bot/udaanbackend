// ==================== EXPRESS APP ====================
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { supabaseAdmin } = require('./config/supabase');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Udaan SaaS Backend',
    version: '1.0.0',
    database: 'supabase',
    timestamp: new Date().toISOString(),
  });
});

// ==================== TEST SUPABASE ====================
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('plans').select('*');
    if (error) throw error;
    res.json({
      success: true,
      message: 'Supabase working!',
      plansCount: data?.length || 0,
      plans: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== API ROUTES ====================
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// ✅ COMPANY ROUTES (PHASE 1)
const companyRoutes = require('./routes/company.routes');
app.use('/api/company', companyRoutes);

// ✅ PRODUCT ROUTES (PHASE 2)
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

// ✅ STOCK ROUTES (PHASE 4)
const stockRoutes = require('./routes/stock.routes');
app.use('/api/stock', stockRoutes);

// ✅ ORDER ROUTES (PHASE 5)
const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

// ✅ RETAILER ROUTES
const retailerRoutes = require('./routes/retailer.routes');
app.use('/api/retailers', retailerRoutes);

// ✅ PAYMENT ROUTES (PHASE 6)
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);

// ✅ SCHEME ROUTES (NEW)
const schemeRoutes = require('./routes/scheme.routes');
app.use('/api/schemes', schemeRoutes);

// ==================== ROOT ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Udaan SaaS API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      testSupabase: '/test-supabase',
      auth: {
        superAdminLogin: 'POST /api/auth/super-admin/login',
        companyAdminLogin: 'POST /api/auth/company-admin/login',
        userLogin: 'POST /api/auth/user/login',
        me: 'GET /api/auth/me',
      },
      // ✅ COMPANY (PHASE 1 — READY)
      company: {
        register: 'POST /api/company/register',
        profile: 'GET /api/company/profile',
        updateProfile: 'PUT /api/company/profile',
        dashboard: 'GET /api/company/dashboard',
        subscription: 'GET /api/company/subscription',
        users: {
          list: 'GET /api/company/users',
          create: 'POST /api/company/users',
          update: 'PUT /api/company/users/:id',
          delete: 'DELETE /api/company/users/:id',
          block: 'PUT /api/company/users/:id/block',
        },
      },
      // ✅ PRODUCTS (PHASE 2 — READY)
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        detail: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        categories: 'GET /api/products/categories',
        lowStock: 'GET /api/products/low-stock',
        search: 'GET /api/products/search?q=...',
      },
      // ✅ STOCK (PHASE 4 — READY)
      stock: {
        list: 'GET /api/stock',
        stats: 'GET /api/stock/stats',
        stockIn: 'POST /api/stock/in',
        stockOut: 'POST /api/stock/out',
        movements: 'GET /api/stock/movements',
        lowAlerts: 'GET /api/stock/low-alerts',
        productStock: 'GET /api/stock/product/:productId',
      },
      // ✅ ORDERS (PHASE 5 — READY)
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        detail: 'GET /api/orders/:id',
        updateStatus: 'PUT /api/orders/:id/status',
        delete: 'DELETE /api/orders/:id',
        stats: 'GET /api/orders/stats',
        byRetailer: 'GET /api/orders/retailer/:retailerId',
        bySalesman: 'GET /api/orders/salesman/:salesmanId',
      },
      // ✅ RETAILERS
      retailers: {
        list: 'GET /api/retailers',
        create: 'POST /api/retailers',
        bulk: 'POST /api/retailers/bulk (admin)',
        detail: 'GET /api/retailers/:id',
        update: 'PUT /api/retailers/:id',
        delete: 'DELETE /api/retailers/:id',
        stats: 'GET /api/retailers/stats',
      },
      // ✅ PAYMENT (PHASE 6 — READY)
      payment: {
        createOrder: 'POST /api/payment/create-order',
        callback: 'POST /api/payment/callback',
        status: 'GET /api/payment/status/:orderId',
        history: 'GET /api/payment/history',
        simulate: 'GET /api/payment/simulate/:orderId (testing)',
      },
      // ✅ SCHEMES (NEW — State-wise)
      schemes: {
        states: 'GET /api/schemes/states',
        list: 'GET /api/schemes?state_code=MH',
        create: 'POST /api/schemes',
        detail: 'GET /api/schemes/:id',
        update: 'PUT /api/schemes/:id',
        delete: 'DELETE /api/schemes/:id',
        stats: 'GET /api/schemes/stats',
      },
    },
  });
});

// ==================== 404 ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ==================== ERROR ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

module.exports = app;