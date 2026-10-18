const nodemailer = require('nodemailer');

// Passwords spaces fix
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!emailUser || !emailPass) {
      throw new Error("EMAIL_USER ya EMAIL_PASS environment variables missing hain!");
    }

    const mailOptions = {
      from: `"Udaan Fast Track" <${emailUser}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to %s: %s', to, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Nodemailer Error Detail:', error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = {
  sendEmail
};