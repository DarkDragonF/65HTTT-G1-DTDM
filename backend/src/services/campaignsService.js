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

const campaignsService = {
  subscribeUserToNewsletter: async (email, fullName) => {
    console.log(`[Zoho Campaigns] Attempting to subscribe user: ${email}...`);
    
    const accessToken = await zohoService.getAccessToken();
    const listKey = await getCredential('ZOHO_CAMPAIGNS_LIST_KEY');

    if (!accessToken || !listKey || listKey === 'placeholder' || listKey.includes('list_key')) {
      console.log(`[Zoho Campaigns] Operating in MOCK mode. Mock subscribed: ${email} to list.`);
      return { success: true, mock: true };
    }

    try {
      // Split name into first and last name if possible
      const nameParts = (fullName || 'User').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const response = await fetch('https://campaigns.zoho.com/api/v1.1/listsubscriberadd', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          listkey: listKey,
          emailinfo: JSON.stringify({ 
            "Contact Email": email,
            "First Name": firstName,
            "Last Name": lastName
          }),
          resubscribe: 'true'
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Campaigns responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Campaigns] Server Response:`, JSON.stringify(resData));
      
      if (resData.status === 'success' || resData.response_code === '200' || resData.message === 'added successfully') {
        console.log(`[Zoho Campaigns] Subscriber successfully added to campaigns list.`);
        return { success: true };
      } else {
        throw new Error(`Invalid campaigns response payload: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Campaigns] Error subscribing contact:`, error.message);
      console.log(`[Zoho Campaigns] Graceful degradation: treating as mock success.`);
      return { success: true, mock: true, error: error.message };
    }
  }
};

module.exports = campaignsService;
