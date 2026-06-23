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

const invoiceService = {
  generateInvoice: async (order) => {
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`[Zoho Invoice] Attempting to generate invoice for Order Number: ${order.order_number}...`);
    
    const accessToken = await zohoService.getAccessToken();
    const orgId = await getCredential('ZOHO_FINANCE_ORG_ID');
    const customerId = await getCredential('ZOHO_INVOICE_CUSTOMER_ID') || 'placeholder_customer_123';

    const mockResult = {
      success: true,
      invoiceNumber,
      pdfUrl: `https://invoice.zoho.com/pdf/${invoiceNumber}.pdf`,
      mock: true
    };

    if (!accessToken || !orgId || orgId === 'placeholder' || orgId.includes('org_id') || orgId.includes('organization') || orgId.includes('your_')) {
      console.log(`[Zoho Invoice] Operating in MOCK mode. Returning mock invoice: ${invoiceNumber}`);
      return mockResult;
    }

    try {
      console.log(`[Zoho Invoice] Creating invoice in organization: ${orgId}`);
      
      const response = await fetch(`https://www.zohoapis.com/invoice/v3/invoices?organization_id=${orgId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          invoice_number: invoiceNumber,
          date: new Date().toISOString().split('T')[0],
          line_items: [
            {
              name: `TLU Food Order #${order.order_number}`,
              rate: Number(order.total_amount),
              quantity: 1
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Invoice responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Invoice] Server Response:`, JSON.stringify(resData));

      if (resData.code === 0 && resData.invoice) {
        const invoiceId = resData.invoice.invoice_id;
        console.log(`[Zoho Invoice] Invoice successfully created. Invoice ID: ${invoiceId}`);
        return {
          success: true,
          invoiceNumber: resData.invoice.invoice_number,
          pdfUrl: `https://www.zohoapis.com/invoice/v3/invoices/${invoiceId}?organization_id=${orgId}&accept=pdf`
        };
      } else {
        throw new Error(`Invalid invoice response: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Invoice] Error generating invoice:`, error.message);
      console.log(`[Zoho Invoice] Graceful degradation: falling back to mock invoice.`);
      return mockResult;
    }
  }
};

module.exports = invoiceService;
