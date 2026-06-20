/**
 * Zoho Invoice Service Stub
 */
const invoiceService = {
  /**
   * Generates a mock invoice for an order.
   */
  generateInvoice: async (order) => {
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`===== [ZOHO INVOICE] Generating invoice ${invoiceNumber} for Order Number: ${order.order_number} - Amount: ${order.total_amount} =====`);
    return {
      success: true,
      invoiceNumber,
      pdfUrl: `https://invoice.zoho.com/pdf/${invoiceNumber}.pdf`
    };
  }
};

module.exports = invoiceService;
