const zohoVaultService = require('./zohoVaultService');

let cachedToken = null;
let tokenExpiry = 0; // Epoch ms

const zohoService = {
  getAccessToken: async () => {
    const now = Date.now();
    // Buffer of 60 seconds
    if (cachedToken && now < tokenExpiry - 60000) {
      return cachedToken;
    }

    const clientId = await getCredential('ZOHO_CLIENT_ID') || await getCredential('ZOHO_CRM_CLIENT_ID');
    const clientSecret = await getCredential('ZOHO_CLIENT_SECRET') || await getCredential('ZOHO_CRM_CLIENT_SECRET');
    const refreshToken = await getCredential('ZOHO_REFRESH_TOKEN');
    const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';

    // If client ID / client secret is placeholder/missing or no refresh token, return null (mock mode)
    if (!clientId || !clientSecret || !refreshToken || 
        clientId.includes('secret_abc123') || clientSecret.includes('secret_xyz789')) {
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

      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      console.log('[Zoho Service] Access token refreshed successfully.');
      return cachedToken;
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
