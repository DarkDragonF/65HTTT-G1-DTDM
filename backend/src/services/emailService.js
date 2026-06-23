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

const emailService = {
  sendVerificationOtp: async (email, fullName, otp) => {
    const token = await getCredential('ZEPTOMAIL_TOKEN');
    const apiUrl = process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email';
    const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || 'noreply@tlufood.com';
    const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'TLU Food';

    // If no token or token is a placeholder, log and simulate success
    if (!token || token.includes('YOUR_ZEPTOMAIL_TOKEN') || token === 'placeholder') {
      console.warn(`[emailService] ZeptoMail token not configured. MOCK OTP SENDING: Send OTP ${otp} to ${email}`);
      return { success: true, mock: true };
    }

    try {
      console.log(`[emailService] Sending real OTP verification email to ${email} via ZeptoMail...`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Zoho-enczauthtoken ${token}`
        },
        body: JSON.stringify({
          from: {
            address: fromAddress,
            name: fromName
          },
          to: [
            {
              email_address: {
                address: email,
                name: fullName || 'User'
              }
            }
          ],
          subject: 'Verify Your TLU Food Account',
          htmlbody: `<p>Hello ${fullName || 'User'},</p>
                     <p>Your OTP code is: <strong>${otp}</strong></p>
                     <p>This code expires in 5 minutes.</p>
                     <br/>
                     <p>Best regards,</p>
                     <p>TLU Food Team</p>`
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ZeptoMail responded with status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log(`[emailService] Email sent successfully via ZeptoMail:`, JSON.stringify(data));
      return { success: true, messageId: data.message_id || 'sent' };
    } catch (error) {
      console.error(`[emailService] Failed to send email via ZeptoMail:`, error.message);
      // Degrade gracefully: log and return mock-success state, but set error flag
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
