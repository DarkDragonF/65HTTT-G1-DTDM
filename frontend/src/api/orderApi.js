import axiosInstance from './axiosInstance';

export const placeOrder = (data) => {
  return axiosInstance.post('/orders', data);
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

export const cancelOrder = (id) => {
  return axiosInstance.patch(`/orders/${id}/cancel`);
};
