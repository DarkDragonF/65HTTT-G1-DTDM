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
    if (!(secretKey in secureSecretsStore)) {
      throw new AppError(`Secret not found in Zoho Vault: ${secretKey}`, 404);
    }
    return secureSecretsStore[secretKey];
  },
  rotateSecret: async (secretKey, newValue) => {
    console.log(`[Zoho Vault] Rotating secret for key: ${secretKey}`);
    secureSecretsStore[secretKey] = newValue;
    return { success: true, key: secretKey, rotatedAt: new Date() };
  }
};

module.exports = zohoVaultService;
