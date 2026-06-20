import axiosInstance from './axiosInstance';

/**
 * API requests for cart operations.
 */
export const addToCart = (data) => {
  return axiosInstance.post('/cart/add', data);
};

export const getMyCarts = () => {
  return axiosInstance.get('/cart');
};

export const getCartDetails = (canteenId) => {
  return axiosInstance.get(`/cart/canteen/${canteenId}`);
};

export const updateCartItem = (cartItemId, quantity) => {
  return axiosInstance.put(`/cart/item/${cartItemId}`, { quantity });
};

export const removeCartItem = (cartItemId) => {
  return axiosInstance.delete(`/cart/item/${cartItemId}`);
};

export const clearCart = (canteenId) => {
  return axiosInstance.delete(`/cart/canteen/${canteenId}`);
};
