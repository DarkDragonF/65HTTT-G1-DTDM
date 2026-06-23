const zohoService = require('./zohoService');
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

const zohoAnalyticsService = {
  syncRevenueData: async (date, totalOrders, totalRevenue) => {
    console.log(`[Zoho Analytics] Attempting to sync daily snapshot data for date: ${date}...`);
    
    const accessToken = await zohoService.getAccessToken('analytics');
    const workspaceId = await getCredential('ZOHO_ANALYTICS_WORKSPACE_ID');
    const tableName = await getCredential('ZOHO_ANALYTICS_TABLE_NAME') || 'Revenue_Snapshots';

    if (!accessToken || !workspaceId || workspaceId === 'placeholder' || workspaceId.includes('workspace')) {
      console.log(`[Zoho Analytics] Operating in MOCK mode. Mock synced data for ${date}: Orders: ${totalOrders}, Revenue: ${totalRevenue}`);
      return { success: true, syncedAt: new Date(), mock: true };
    }

    try {
      const response = await fetch(`https://analyticsapi.zoho.com/api/v2/workspaces/${workspaceId}/tables/${tableName}/rows`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              "Date": date,
              "Total_Orders": Number(totalOrders),
              "Total_Revenue": Number(totalRevenue)
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Analytics responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Analytics] Server Response:`, JSON.stringify(resData));
      console.log(`[Zoho Analytics] Daily snapshot metrics synced successfully.`);
      return { success: true, syncedAt: new Date() };
    } catch (error) {
      console.error(`[Zoho Analytics] Error syncing stats:`, error.message);
      console.log(`[Zoho Analytics] Graceful degradation: treating as mock success.`);
      return { success: true, syncedAt: new Date(), mock: true, error: error.message };
    }
  }
};

module.exports = zohoAnalyticsService;
