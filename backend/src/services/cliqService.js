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

const cliqService = {
  sendOrderAlert: async (message) => {
    const webhookUrl = await getCredential('ZOHO_CLIQ_ORDER_WEBHOOK');
    console.log(`[Zoho Cliq] Attempting to send order alert: "${message}"`);

    if (!webhookUrl || webhookUrl === 'placeholder' || webhookUrl.includes('webhook')) {
      console.warn(`[Zoho Cliq] Webhook URL not configured. MOCK POST: ${message}`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: message
        })
      });

      if (!response.ok) {
        throw new Error(`Zoho Cliq responded with status ${response.status}`);
      }

      console.log(`[Zoho Cliq] Message posted to channel successfully.`);
      return { success: true };
    } catch (error) {
      console.error(`[Zoho Cliq] Failed to post alert:`, error.message);
      return { success: false, error: error.message };
    }
  },

  sendInventoryWarning: async (message) => {
    const webhookUrl = await getCredential('ZOHO_CLIQ_ALERT_WEBHOOK') || await getCredential('ZOHO_CLIQ_ORDER_WEBHOOK');
    console.log(`[Zoho Cliq] Attempting to send inventory warning: "${message}"`);

    if (!webhookUrl || webhookUrl === 'placeholder' || webhookUrl.includes('webhook')) {
      console.warn(`[Zoho Cliq] Webhook URL not configured. MOCK POST: ${message}`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `⚠️ *INVENTORY WARNING*: ${message}`
        })
      });

      if (!response.ok) {
        throw new Error(`Zoho Cliq responded with status ${response.status}`);
      }

      console.log(`[Zoho Cliq] Message posted to channel successfully.`);
      return { success: true };
    } catch (error) {
      console.error(`[Zoho Cliq] Failed to post alert:`, error.message);
      return { success: false, error: error.message };
    }
  },

  sendFeedbackAlert: async (message) => {
    const webhookUrl = await getCredential('ZOHO_CLIQ_ALERT_WEBHOOK') || await getCredential('ZOHO_CLIQ_ORDER_WEBHOOK');
    console.log(`[Zoho Cliq] Attempting to send feedback alert: "${message}"`);

    if (!webhookUrl || webhookUrl === 'placeholder' || webhookUrl.includes('webhook')) {
      console.warn(`[Zoho Cliq] Webhook URL not configured. MOCK POST: ${message}`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: message
        })
      });

      if (!response.ok) {
        throw new Error(`Zoho Cliq responded with status ${response.status}`);
      }

      console.log(`[Zoho Cliq] Message posted to channel successfully.`);
      return { success: true };
    } catch (error) {
      console.error(`[Zoho Cliq] Failed to post alert:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = cliqService;

