import * as orderApi from '../api/orderApi';

/**
 * Service wrapper for order actions.
 */
export const orderService = {
  placeOrder: async (data) => {
    const response = await orderApi.placeOrder(data);
    return response.data;
  },

  placeOrderFromCart: async (canteenId, data) => {
    const response = await orderApi.placeOrderFromCart(canteenId, data);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await orderApi.getMyOrders();
    return response.data;
  },

  getCanteenOrders: async (canteenId) => {
    const response = await orderApi.getCanteenOrders(canteenId);
    return response.data;
  },

  getCanteenStats: async (canteenId, params) => {
    const response = await orderApi.getCanteenStats(canteenId, params);
    return response.data;
  },

  getOrderDetails: async (id) => {
    const response = await orderApi.getOrderDetails(id);
    return response.data;
  },

  updateOrderStatus: async (id, status, cancelReason = null) => {
    const response = await orderApi.updateOrderStatus(id, status, cancelReason);
    return response.data;
  },

  cancelOrder: async (id, reason = null) => {
    const response = await orderApi.cancelOrder(id, reason);
    return response.data;
  },
};

export default orderService;
