const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { supabaseAdmin } = require('./config/supabase');

const app = express();

// ==================== CORS CONFIGURATION ====================

const allowedOrigins = [ 
  'https://udaancompanyadminpanel-yp87.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // and requests from the authorized frontend.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// ==================== BODY PARSERS ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== LOGGER ====================

app.use(morgan('dev'));

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Udaan SaaS Backend',
    version: '1.0.0',
    database: 'supabase',
    timestamp: new Date().toISOString()
  });
});

// ==================== TEST SUPABASE ====================

app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Supabase working!',
      plansCount: data?.length || 0,
      plans: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== API ROUTES ====================

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// COMPANY ROUTES
const companyRoutes = require('./routes/company.routes');
app.use('/api/company', companyRoutes);

// PRODUCT ROUTES
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

// STOCK ROUTES
const stockRoutes = require('./routes/stock.routes');
app.use('/api/stock', stockRoutes);

// ORDER ROUTES
const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

// RETAILER ROUTES
const retailerRoutes = require('./routes/retailer.routes');
app.use('/api/retailers', retailerRoutes);

// PAYMENT ROUTES
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);

// SCHEME ROUTES
const schemeRoutes = require('./routes/scheme.routes');
app.use('/api/schemes', schemeRoutes);

// ==================== ROOT ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Udaan SaaS API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      testSupabase: '/test-supabase',
      auth: {
        superAdminLogin: 'POST /api/auth/super-admin/login',
        companyAdminLogin: 'POST /api/auth/company-admin/login',
        userLogin: 'POST /api/auth/user/login',
        me: 'GET /api/auth/me'
      },
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
          block: 'PUT /api/company/users/:id/block'
        }
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        detail: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        categories: 'GET /api/products/categories',
        lowStock: 'GET /api/products/low-stock',
        search: 'GET /api/products/search?q=...'
      },
      stock: {
        list: 'GET /api/stock',
        stats: 'GET /api/stock/stats',
        stockIn: 'POST /api/stock/in',
        stockOut: 'POST /api/stock/out',
        movements: 'GET /api/stock/movements',
        lowAlerts: 'GET /api/stock/low-alerts',
        productStock: 'GET /api/stock/product/:productId'
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        detail: 'GET /api/orders/:id',
        updateStatus: 'PUT /api/orders/:id/status',
        delete: 'DELETE /api/orders/:id',
        stats: 'GET /api/orders/stats',
        byRetailer: 'GET /api/orders/retailer/:retailerId',
        bySalesman: 'GET /api/orders/salesman/:salesmanId'
      },
      retailers: {
        list: 'GET /api/retailers',
        create: 'POST /api/retailers',
        bulk: 'POST /api/retailers/bulk',
        detail: 'GET /api/retailers/:id',
        update: 'PUT /api/retailers/:id',
        delete: 'DELETE /api/retailers/:id',
        stats: 'GET /api/retailers/stats'
      },
      payment: {
        createOrder: 'POST /api/payment/create-order',
        callback: 'POST /api/payment/callback',
        status: 'GET /api/payment/status/:orderId',
        history: 'GET /api/payment/history',
        simulate: 'GET /api/payment/simulate/:orderId'
      },
      schemes: {
        states: 'GET /api/schemes/states',
        list: 'GET /api/schemes?state_code=MH',
        create: 'POST /api/schemes',
        detail: 'GET /api/schemes/:id',
        update: 'PUT /api/schemes/:id',
        delete: 'DELETE /api/schemes/:id',
        stats: 'GET /api/schemes/stats'
      }
    }
  });
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Backend error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ==================== EXPORT ====================

module.exports = app;