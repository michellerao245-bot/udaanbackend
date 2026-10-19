const express = require('express');
const cors = require('cors');

const app = express();

// 1. CORS Configuration (Fixes the CORS policy block error)
app.use(cors({
  origin: '*', // Sabhi origins allow karne ke liye (ya specific frontend URL de sakte ho)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors()); // Preflight requests handle karne ke liye

// 2. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Test Route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Udaan Fast Track Backend is Live & Running! 🚀' });
});

// 4. Import & Use Routes (Agar aapke routes folder mein routes hain)
// Jaise agar auth routes hain toh unhe yahan connect kar sakte ho:
try {
  const authRoutes = require('./routes/auth') || require('./routes/authRoutes');
  if (authRoutes) {
    app.use('/api/auth', authRoutes);
  }
} catch (err) {
  console.log("Auth routes not loaded directly in index.js, checking other files...");
}

// 5. Server Listener (Vercel ke liye export bhi zaroori hai)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;