// ==================== PAYTM CONFIG ====================
const crypto = require('crypto');

const PAYTM_CONFIG = {
  MID: process.env.PAYTM_MID || 'TESTMID12345',
  MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY || 'TESTKEY@123',
  WEBSITE: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
  CHANNEL_ID: process.env.PAYTM_CHANNEL_ID || 'WEB',
  INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID || 'Retail',
  ENVIRONMENT: process.env.PAYTM_ENVIRONMENT || 'staging',
  CALLBACK_URL:
    process.env.PAYTM_CALLBACK_URL ||
    'http://localhost:5000/api/payment/callback',
};

// Base URL — staging or production
const BASE_URL =
  PAYTM_CONFIG.ENVIRONMENT === 'production'
    ? process.env.PAYTM_PRODUCTION_URL || 'https://securegw.paytm.in'
    : process.env.PAYTM_STAGING_URL || 'https://securegw-stage.paytm.in';

// ==================== CHECKSUM GENERATOR ====================
const generateChecksum = (params) => {
  const data = JSON.stringify(params);
  return crypto
    .createHmac('sha256', PAYTM_CONFIG.MERCHANT_KEY)
    .update(data)
    .digest('hex');
};

// ==================== CHECKSUM VERIFY ====================
const verifyChecksum = (params, checksum) => {
  const data = JSON.stringify(params);
  const hash = crypto
    .createHmac('sha256', PAYTM_CONFIG.MERCHANT_KEY)
    .update(data)
    .digest('hex');
  return hash === checksum;
};

module.exports = {
  PAYTM_CONFIG,
  BASE_URL,
  generateChecksum,
  verifyChecksum,
};