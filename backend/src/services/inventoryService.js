/**
 * Zoho Inventory Service Stub
 */
const inventoryService = {
  /**
   * Syncs the stock quantity of a product with Zoho Inventory.
   */
  syncStock: async (foodId, quantity) => {
    console.log(`===== [ZOHO INVENTORY] Syncing stock for Food ID ${foodId} - New quantity: ${quantity} =====`);
    return { success: true, message: 'Stock synced successfully' };
  },
  
  /**
   * Syncs order information with Zoho Inventory.
   */
  syncOrder: async (orderId) => {
    console.log(`===== [ZOHO INVENTORY] Syncing Order ID ${orderId} information =====`);
    return { success: true, message: 'Order info synced successfully' };
  }
};

module.exports = inventoryService;
