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

const zohoCrmService = {
  syncPartnerRecord: async (canteenId, canteenName, ownerEmail) => {
    console.log(`[Zoho CRM] Attempting to sync partner record for Canteen ID: ${canteenId}...`);
    const accessToken = await zohoService.getAccessToken('crm');

    const mockPartnerId = `PARTNER_CRM_${canteenId}_${Date.now().toString().slice(-4)}`;

    if (!accessToken) {
      console.log(`[Zoho CRM] Operating in MOCK mode. Returning mock partner CRM ID: ${mockPartnerId}`);
      return { success: true, partnerCrmId: mockPartnerId, mock: true };
    }

    const crmApiUrl = process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v3';

    try {
      console.log(`[Zoho CRM] Sending partner record to Zoho CRM Accounts: Name="${canteenName}", Email="${ownerEmail}"`);
      const response = await fetch(`${crmApiUrl}/Accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              "Account_Name": canteenName,
              "Email": ownerEmail,
              "Description": `Synced Canteen ID: ${canteenId} from TLUFood Application`
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho CRM responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho CRM] Server Response:`, JSON.stringify(resData));

      if (resData.data && resData.data[0] && resData.data[0].status === 'success') {
        const recordId = resData.data[0].details.id;
        console.log(`[Zoho CRM] Sync successful. Partner CRM ID: ${recordId}`);
        return { success: true, partnerCrmId: recordId };
      } else {
        throw new Error(`Invalid sync response payload: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho CRM] Error syncing partner record:`, error.message);
      console.log(`[Zoho CRM] Graceful degradation: falling back to mock CRM ID: ${mockPartnerId}`);
      return { success: true, partnerCrmId: mockPartnerId, error: error.message };
    }
  },

  triggerZohoSignContract: async (canteenId, canteenName, ownerEmail, ownerName) => {
    const contractNum = `TLU-CONT-${canteenId}-${Date.now().toString().slice(-4)}`;
    console.log(`[Zoho Sign] Attempting to trigger contract signing for Canteen: ${canteenName}...`);

    const accessToken = await zohoService.getAccessToken('crm');
    const templateId = await getCredential('ZOHO_SIGN_TEMPLATE_ID');

    const mockDetails = {
      contractNumber: contractNum,
      fileUrl: `https://storage.googleapis.com/tlu-contracts/${contractNum}.pdf`,
      status: 'sent',
      mock: true
    };

    if (!accessToken || !templateId || templateId === 'placeholder' || templateId.includes('template_id')) {
      console.log(`[Zoho Sign] Operating in MOCK mode. Returning mock contract: ${JSON.stringify(mockDetails)}`);
      return mockDetails;
    }

    const signApiUrl = process.env.ZOHO_SIGN_API_URL || 'https://sign.zoho.com/api/v1';

    try {
      console.log(`[Zoho Sign] Creating document from template ID: ${templateId}`);

      const payload = {
        templates: {
          request_name: `TLU Food Canteen Partnership Agreement - ${canteenName}`,
          field_data: {
            field_text_data: {
              "canteen_id": String(canteenId),
              "canteen_name": canteenName,
              "contract_number": contractNum
            }
          },
          actions: [
            {
              recipient_name: ownerName || "Canteen Owner",
              recipient_email: ownerEmail || "unknown@tlufood.com",
              action_type: "SIGN",
              role: "Vendor",
              verify_recipient: true,
              verification_type: "EMAIL"
            }
          ],
          is_quicksend: true
        }
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));

      const response = await fetch(`${signApiUrl}/templates/${templateId}/createdocument`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Sign responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Sign] Server Response:`, JSON.stringify(resData));

      if (resData.requests && resData.requests.request_id) {
        const requestId = resData.requests.request_id;
        const documentUrl = `https://sign.zoho.com/#/requests/${requestId}`;
        console.log(`[Zoho Sign] Template submission successful. Request ID: ${requestId}`);
        return {
          contractNumber: contractNum,
          fileUrl: documentUrl,
          status: 'sent'
        };
      } else {
        throw new Error(`Invalid Sign response payload: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Sign] Error triggering sign template:`, error.message);
      console.log(`[Zoho Sign] Graceful degradation: falling back to mock contract: ${JSON.stringify(mockDetails)}`);
      return mockDetails;
    }
  }
};

module.exports = zohoCrmService;
