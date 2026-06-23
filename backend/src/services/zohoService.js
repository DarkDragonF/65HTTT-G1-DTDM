const zohoVaultService = require('./zohoVaultService');

const tokenCache = {}; // { [serviceKey]: { token, expiry } }

const serviceTokenKeys = {
  vault: 'ZOHO_VAULT_REFRESH_TOKEN',
  crm: 'ZOHO_CRM_REFRESH_TOKEN',
  inventory: 'ZOHO_INVENTORY_REFRESH_TOKEN',
  invoice: 'ZOHO_INVOICE_REFRESH_TOKEN'
};

const zohoService = {
  getAccessToken: async (serviceKey = 'crm') => {
    const now = Date.now();
    const cache = tokenCache[serviceKey];
    
    // Buffer of 60 seconds
    if (cache && now < cache.expiry - 60000) {
      return cache.token;
    }

    const clientId = await getCredential('ZOHO_CLIENT_ID') || await getCredential('ZOHO_CRM_CLIENT_ID');
    const clientSecret = await getCredential('ZOHO_CLIENT_SECRET') || await getCredential('ZOHO_CRM_CLIENT_SECRET');
    
    const specificEnvKey = serviceTokenKeys[serviceKey];
    const refreshToken = (specificEnvKey ? await getCredential(specificEnvKey) : null) || await getCredential('ZOHO_REFRESH_TOKEN');
    const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';

    // If client ID / client secret is placeholder/missing or no refresh token, return null (mock mode).
    // Note: Scopes are bound to the refresh_token at the time of code generation in the Developer Console.
    // Ensure you request: ZohoCRM.modules.ALL, ZohoSign.documents.ALL, Desk.tickets.ALL, ZohoCampaigns.contact.ALL, etc.
    if (!clientId || !clientSecret || !refreshToken || 
        clientId.includes('secret_abc123') || clientSecret.includes('secret_xyz789') ||
        clientId.includes('your_') || clientSecret.includes('your_') || refreshToken.includes('your_')) {
      console.log('[Zoho Service] OAuth credentials not fully configured. Operating in MOCK mode.');
      return null;
    }

    try {
      console.log('[Zoho Service] Refreshing OAuth access token...');
      const response = await fetch(`${accountsUrl}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to refresh token: status ${response.status}, response: ${errText}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error(`Token response missing access_token: ${JSON.stringify(data)}`);
      }

      tokenCache[serviceKey] = {
        token: data.access_token,
        expiry: Date.now() + (data.expires_in || 3600) * 1000
      };
      console.log(`[Zoho Service] Access token refreshed successfully for: ${serviceKey}`);
      return data.access_token;
    } catch (error) {
      console.error('[Zoho Service] Error refreshing Zoho OAuth token:', error.message);
      // Fallback: return null so caller degrades gracefully to mock mode
      return null;
    }
  }
};

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

module.exports = zohoService;
