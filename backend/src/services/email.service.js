const nodemailer = require('nodemailer');

// Nodemailer transporter configuration using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Aapka Gmail address (Environment variable se aayega)
    pass: process.env.EMAIL_PASS  // Gmail App Password
  }
});

/**
 * Send email function
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Udaan Fast Track" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email send karne mein error aayi hai!');
  }
};

module.exports = {
  sendEmail
};