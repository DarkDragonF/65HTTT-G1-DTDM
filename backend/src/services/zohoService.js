const sendCliqNotification = async (message, payload = {}) => {
  console.log('[Zoho Cliq] Notification:', { message, payload });
  return {
    success: true,
    provider: 'ZOHO_CLIQ',
    message,
    payload,
  };
};

const syncInventoryReduction = async (order) => {
  console.log('[Zoho Inventory] Stock reduced:', order);
  return {
    success: true,
    provider: 'ZOHO_INVENTORY',
    action: 'REDUCE_STOCK',
    order,
  };
};

const refundInventoryStock = async (order) => {
  console.log('[Zoho Inventory] Stock refunded:', order);
  return {
    success: true,
    provider: 'ZOHO_INVENTORY',
    action: 'REFUND_STOCK',
    order,
  };
};

const generateInvoice = async (order) => {
  const invoiceNumber = `TLU-INV-${order.id}-${Date.now()}`;

  console.log('[Zoho Invoice] E-invoice generated:', {
    invoiceNumber,
    order,
  });

  return {
    success: true,
    provider: 'ZOHO_INVOICE',
    invoiceNumber,
    order,
  };
};

module.exports = {
  sendCliqNotification,
  syncInventoryReduction,
  refundInventoryStock,
  generateInvoice,
};
