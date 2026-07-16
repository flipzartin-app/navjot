const nodemailer = require('nodemailer');

// Generic SMTP transporter - works with Gmail (app password), SendGrid, Resend, Mailgun, etc.
// Configure via env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    // Fail loudly in logs rather than silently pretending an email was sent -
    // this is the #1 thing people forget to configure.
    console.error('Email not sent: SMTP_HOST/SMTP_USER not configured in .env');
    throw new Error('Email service is not configured on the server');
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
