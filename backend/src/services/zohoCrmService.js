const zohoCrmService = {
  syncPartnerRecord: async (canteenId, canteenName, ownerEmail) => {
    console.log(`[Zoho CRM] Syncing partner record for Canteen ID: ${canteenId}`);
    console.log(`[Zoho CRM] Record: { name: "${canteenName}", owner: "${ownerEmail}" }`);
    return { success: true, partnerCrmId: `PARTNER_CRM_${canteenId}_${Date.now().toString().slice(-4)}` };
  },
  triggerZohoSignContract: async (canteenId, canteenName) => {
    const contractNum = `TLU-CONT-${canteenId}-${Date.now().toString().slice(-4)}`;
    console.log(`[Zoho Sign] Triggering contract signing for Canteen: ${canteenName}`);
    console.log(`[Zoho Sign] Contract number: ${contractNum}`);
    return {
      contractNumber: contractNum,
      fileUrl: `https://storage.googleapis.com/tlu-contracts/${contractNum}.pdf`,
      status: 'sent'
    };
  }
};

module.exports = zohoCrmService;
