const emailService = require('./email.service');

// Temporary memory store for OTPs (Production me Redis ya MongoDB OTP model use kar sakte hain)
const otpStore = {};

/**
 * 1. Generate & Send OTP to User's Email
 * @param {string} email 
 */
const sendOtp = async (email) => {
  if (!email) {
    throw new Error('Email address zaroori hai!');
  }

  // 6-Digit Random OTP generate karein
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // OTP Store mein save karein (10 minutes expiry ke saath)
  otpStore[email] = {
    otp: otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 Minutes
  };

  // Professional HTML Email Template
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; border-radius: 16px; color: #ffffff; max-width: 500px; margin: auto;">
      <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">UDAAN FAST TRACK</h2>
      <p style="font-size: 14px; color: #cbd5e1;">Aapka Email Verification OTP niche diya gaya hai:</p>
      
      <div style="background-color: #1e293b; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #334155;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4ade80;">${otp}</span>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Yeh OTP 10 minute tak valid hai. Kripya kisi ke saath share na karein.</p>
    </div>
  `;

  // Email Service ka use karke Mail bhejein
  await emailService.sendEmail({
    to: email,
    subject: 'Verification OTP - Udaan Fast Track',
    html: emailHtml
  });

  return { success: true, message: 'OTP successfully bhej diya gaya hai!' };
};

/**
 * 2. Verify User Entered OTP
 * @param {string} email 
 * @param {string} otp 
 */
const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Email aur OTP dono zaroori hain!');
  }

  const storedOtpData = otpStore[email];

  if (!storedOtpData) {
    throw new Error('OTP nahi mila ya expire ho gaya hai! Kripya dobara Send OTP par click karein.');
  }

  // Expiry check
  if (Date.now() > storedOtpData.expiresAt) {
    delete otpStore[email];
    throw new Error('OTP expire ho gaya hai! Kripya naya OTP mangwayein.');
  }

  // OTP match check (Demo test master OTP 123456 bhi work karega)
  if (storedOtpData.otp === otp || otp === '123456') {
    delete otpStore[email]; // Verified hone ke baad OTP remove kar dein
    return true;
  } else {
    throw new Error('Galat OTP! Kripya sahi OTP enter karein.');
  }
};

module.exports = {
  sendOtp,
  verifyOtp
};