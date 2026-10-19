const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable missing hai!");
    }

    const data = await resend.emails.send({
      from: 'Udaan Fast Track <onboarding@resend.dev>', // Testing ke liye Resend ka default verified domain
      to: [to],
      subject: subject,
      html: html
    });

    console.log('✅ Resend Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Resend Error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = {
  sendEmail
};