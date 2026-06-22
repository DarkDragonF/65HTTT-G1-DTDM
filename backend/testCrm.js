require('dotenv').config();
const zohoCrmService = require('./src/services/zohoCrmService');

async function runTest() {
  console.log('--- Starting Zoho CRM Integration Test ---');
  console.log('Configured Env Parameters:');
  console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID || '(not set)');
  console.log('ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN ? '***' : '(not set)');
  console.log('ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '***' : '(not set)');
  console.log('-----------------------------------------');

  try {
    const result = await zohoCrmService.syncPartnerRecord(999, 'Test Canteen Partner', 'partner_owner@example.com');
    console.log('\n--- Sync Record Results ---');
    console.log(JSON.stringify(result, null, 2));
    console.log('---------------------------');
  } catch (error) {
    console.error('Test script crashed:', error);
  }
}

runTest();
