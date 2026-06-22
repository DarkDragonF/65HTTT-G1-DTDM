const { AppError } = require('../middlewares/errorHandler');

// Secure store simulation in memory
const secureSecretsStore = {
  ZOHO_CRM_CLIENT_ID: 'crm_client_id_secret_abc123',
  ZOHO_CRM_CLIENT_SECRET: 'crm_client_secret_xyz789',
  ZOHO_DESK_ORG_ID: 'desk_org_id_9999',
  JWT_SECRET: 'local_testing_jwt_secret_key_12345'
};

const zohoVaultService = {
  getSecret: async (secretKey) => {
    console.log(`[Zoho Vault] Fetching secret for key: ${secretKey}`);
    
    // Core OAuth parameters must avoid Zoho Vault API to prevent infinite recursion
    const coreOAuthKeys = ['ZOHO_CLIENT_ID', 'ZOHO_CRM_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_CRM_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'];
    if (coreOAuthKeys.includes(secretKey)) {
      if (!(secretKey in secureSecretsStore)) {
        return null;
      }
      return secureSecretsStore[secretKey];
    }

    const vaultUrl = process.env.ZOHO_VAULT_API_URL;
    const secretId = process.env[`ZOHO_VAULT_ID_${secretKey}`];

    // If Vault API is not configured or no specific ID is mapped, fall back to memory store
    if (!vaultUrl || !secretId) {
      if (!(secretKey in secureSecretsStore)) {
        throw new AppError(`Secret not found in Zoho Vault memory store: ${secretKey}`, 404);
      }
      return secureSecretsStore[secretKey];
    }

    try {
      // Lazy load to prevent circular require issues at boot
      const zohoService = require('./zohoService');
      const accessToken = await zohoService.getAccessToken();
      if (!accessToken) {
        throw new Error('OAuth accessToken is unavailable.');
      }

      console.log(`[Zoho Vault] Calling Vault API to fetch secret ID: ${secretId}`);
      const response = await fetch(`${vaultUrl}/secrets/${secretId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Vault responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.secret_value) {
        return data.secret_value;
      }
      throw new Error('Secret value not present in Vault response.');
    } catch (error) {
      console.error(`[Zoho Vault] API fetch failed:`, error.message);
      // Fallback to memory store
      if (secretKey in secureSecretsStore) {
        console.log(`[Zoho Vault] Falling back to memory store for key: ${secretKey}`);
        return secureSecretsStore[secretKey];
      }
      throw new AppError(`Failed to fetch secret from Vault: ${error.message}`, 500);
    }
  },
  rotateSecret: async (secretKey, newValue) => {
    console.log(`[Zoho Vault] Rotating secret for key: ${secretKey}`);
    secureSecretsStore[secretKey] = newValue;
    return { success: true, key: secretKey, rotatedAt: new Date() };
  }
};

module.exports = zohoVaultService;
