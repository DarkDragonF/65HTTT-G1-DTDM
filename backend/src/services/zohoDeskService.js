const zohoDeskService = {
  syncTicketToZohoDesk: async (ticketId, subject, description, userEmail) => {
    console.log(`[Zoho Desk] Syncing Support Ticket ID: ${ticketId}`);
    console.log(`[Zoho Desk] Payload: { subject: "${subject}", from: "${userEmail}" }`);
    return { success: true, deskTicketId: `DESK_TCK_${ticketId}_${Date.now().toString().slice(-4)}` };
  }
};

module.exports = zohoDeskService;
