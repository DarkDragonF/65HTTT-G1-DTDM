// backend/src/config/zoho.js

const zohoConfig = {
    clientId: process.env.ZOHO_CLIENT_ID || "your_mock_client_id",
    clientSecret: process.env.ZOHO_CLIENT_SECRET || "your_mock_client_secret",
    refreshToken: process.env.ZOHO_REFRESH_TOKEN || "your_mock_refresh_token",
    authUrl: "https://accounts.zoho.com/oauth/v2/token",
    vaultUrl: "https://vault.zoho.com/api/v1/secrets",
    crmUrl: "https://www.zohoapis.com/crm/v2/Leads",
    analyticsUrl: "https://analyticsapi.zoho.com/api/v1/report"
};

module.exports = zohoConfig;