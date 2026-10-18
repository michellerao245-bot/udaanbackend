const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ==================== CORS CONFIGURATION ====================
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.mongodb.net/udaan?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({ status: 'API is running successfully for Udaan!' });
});

// ==================== IMPORT & USE ROUTES ====================
const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const distributorRoutes = require('./routes/distributor.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const productRoutes = require('./routes/product.routes');
const registrationRoutes = require('./routes/registration.routes');
const retailerRoutes = require('./routes/retailer.routes');
const salesmanRoutes = require('./routes/salesman.routes');
const schemeRoutes = require('./routes/scheme.routes');
const stockRoutes = require('./routes/stock.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const trackingRoutes = require('./routes/tracking.routes');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/salesmen', salesmanRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/tracking', trackingRoutes);

// ==================== SERVER LISTEN ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});