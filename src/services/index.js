const express = require('express');
const cors = require('cors');
const app = express();

// Allowed Origins List
const allowedOrigins = [
  'https://udaancompanyregi-subs.vercel.app',
  'https://udaancompanyadminpanel-yp87.vercel.app',
  'https://udaan-superadmin-panel.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS Options with Preflight Support
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins if needed or handle strictly
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Express JSON Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests globally
app.options('*', cors());