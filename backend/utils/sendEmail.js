const { Resend } = require('resend');

// Resend sends over HTTPS, not raw SMTP - this matters because several free-tier hosts
// (Render included) block outbound SMTP ports to cut down on spam abuse, which raw
// Nodemailer/SMTP would silently hang against until it times out. An HTTPS API call
// goes through the same port (443) as any other outbound web request, so it isn't blocked.
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email not sent: RESEND_API_KEY not configured in .env');
    throw new Error('Email service is not configured on the server');
  }

  // EMAIL_FROM defaults to Resend's shared test sender, which works immediately with zero
  // domain setup - fine for development/testing. For a real product, verify your own domain
  // in the Resend dashboard and set EMAIL_FROM to an address on it (e.g. noreply@yourdomain.com).
  const from = process.env.EMAIL_FROM || 'EduStream <onboarding@resend.dev>';

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error('Resend API error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
};

module.exports = sendEmail;
