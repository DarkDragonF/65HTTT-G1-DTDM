const nodemailer = require('nodemailer');
const zohoVaultService = require('./zohoVaultService');

async function getCredential(key) {
  if (process.env[key]) {
    return process.env[key];
  }
  try {
    return await zohoVaultService.getSecret(key);
  } catch {
    return null;
  }
}

// Nodemailer transporter instance, initialized lazily on first send
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = await getCredential('dragon474@zohomail.com');
  const pass = await getCredential('RwatDJwim1ha');
  const host = process.env.ZOHO_MAIL_HOST || 'smtp.zoho.com';
  const port = Number(process.env.ZOHO_MAIL_PORT) || 465;

  if (!user || !pass || user === 'placeholder' || pass === 'placeholder') {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports (like 587 with STARTTLS)
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const emailService = {
  /**
   * Sends an OTP verification email to a user.
   * Falls back to a mock logger if credentials are not configured.
   */
  sendVerificationOtp: async (email, fullName, otp) => {
    const user = await getCredential('ZOHO_MAIL_USER');
    const mailTransporter = await getTransporter();

    // Fallback if not configured
    if (!mailTransporter || !user) {
      console.warn(`[emailService] Zoho Mail SMTP credentials not configured. MOCK OTP SENDING: Send OTP ${otp} to ${email}`);
      return { success: true, mock: true };
    }

    try {
      console.log(`[emailService] Sending real OTP verification email to ${email} via Zoho Mail SMTP...`);
      const info = await mailTransporter.sendMail({
        from: `"TLU Food" <${user}>`,
        to: email,
        subject: 'Verify Your TLU Food Account',
        html: `<p>Hello ${fullName || 'User'},</p>
               <p>Your OTP code is: <strong>${otp}</strong></p>
               <p>This code expires in 5 minutes.</p>
               <br/>
               <p>Best regards,</p>
               <p>TLU Food Team</p>`,
      });

      console.log(`[emailService] Email sent successfully via Zoho Mail SMTP:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[emailService] Failed to send email via Zoho Mail SMTP:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
