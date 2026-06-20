import axiosInstance from './axiosInstance';

/**
 * API requests for order operations.
 */
export const placeOrder = (data) => {
  return axiosInstance.post('/orders', data);
};

export const placeOrderFromCart = (canteenId, data) => {
  return axiosInstance.post(`/orders/from-cart/${canteenId}`, data);
};

export const getMyOrders = () => {
  return axiosInstance.get('/orders/my');
};

export const getCanteenOrders = (canteenId) => {
  return axiosInstance.get(`/orders/canteen/${canteenId}`);
};

export const getCanteenStats = (canteenId, params) => {
  return axiosInstance.get(`/orders/canteen/${canteenId}/stats`, { params });
};

export const getOrderDetails = (id) => {
  return axiosInstance.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status, cancelReason = null) => {
  return axiosInstance.patch(`/orders/${id}/status`, { status, cancelReason });
};

export const cancelOrder = (id, reason = null) => {
  return axiosInstance.patch(`/orders/${id}/cancel`, { reason });
};
