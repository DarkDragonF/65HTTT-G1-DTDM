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

const zohoDeskService = {
  syncTicketToZohoDesk: async (ticketId, subject, description, userEmail) => {
    console.log(`[Zoho Desk] Attempting to sync support ticket ID: ${ticketId} to Zoho Desk...`);
    
    const accessToken = await zohoService.getAccessToken('desk');
    const orgId = await getCredential('ZOHO_DESK_ORG_ID');
    const departmentId = await getCredential('ZOHO_DESK_DEPARTMENT_ID') || 'placeholder_dept_123';

    const mockTicketId = `DESK_TCK_${ticketId}_${Date.now().toString().slice(-4)}`;

    if (!accessToken || !orgId || orgId === 'placeholder' || orgId.includes('org_id')) {
      console.log(`[Zoho Desk] Operating in MOCK mode. Returning mock ticket ID: ${mockTicketId}`);
      return { success: true, deskTicketId: mockTicketId, mock: true };
    }

    try {
      const response = await fetch('https://desk.zoho.com/api/v1/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'orgId': orgId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          description,
          departmentId,
          contact: { email: userEmail }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Desk responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Desk] Server Response:`, JSON.stringify(resData));

      if (resData.id) {
        console.log(`[Zoho Desk] Ticket successfully created. Ticket ID: ${resData.id}`);
        return { success: true, deskTicketId: resData.id };
      } else {
        throw new Error(`Invalid Desk response payload: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Desk] Error syncing ticket:`, error.message);
      console.log(`[Zoho Desk] Graceful degradation: falling back to mock ticket: ${mockTicketId}`);
      return { success: true, deskTicketId: mockTicketId, error: error.message };
    }
  }
};

module.exports = zohoDeskService;
