import * as cartApi from '../api/cartApi';

/**
 * Service orchestrator for cart actions.
 */
export const cartService = {
  addToCart: async (foodId, quantity) => {
    const response = await cartApi.addToCart({ foodId, quantity });
    return response.data;
  },

  getMyCarts: async () => {
    const response = await cartApi.getMyCarts();
    return response.data;
  },

  getCartDetails: async (canteenId) => {
    const response = await cartApi.getCartDetails(canteenId);
    return response.data;
  },

  updateCartItem: async (cartItemId, quantity) => {
    const response = await cartApi.updateCartItem(cartItemId, quantity);
    return response.data;
  },

  removeCartItem: async (cartItemId) => {
    const response = await cartApi.removeCartItem(cartItemId);
    return response.data;
  },

  clearCart: async (canteenId) => {
    const response = await cartApi.clearCart(canteenId);
    return response.data;
  },
};

export default cartService;
