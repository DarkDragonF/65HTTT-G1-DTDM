const cartService = require('../services/cartService');

/**
 * Controller for cart endpoints.
 */
const cartController = {
  /**
   * Adds an item to the cart.
   */
  addToCart: async (req, res, next) => {
    try {
      const cart = await cartService.addToCart(req.user.id, req.body);
      res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) { next(error); }
  },

  /**
   * Retrieves the cart for a specific canteen.
   */
  getCart: async (req, res, next) => {
    try {
      const canteenId = parseInt(req.params.canteenId);
      const cart = await cartService.getCart(req.user.id, canteenId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
  },

  /**
   * Gets a list of all active carts for the logged-in user.
   */
  getMyCarts: async (req, res, next) => {
    try {
      const carts = await cartService.getMyCarts(req.user.id);
      res.status(200).json({ success: true, data: carts });
    } catch (error) { next(error); }
  },

  /**
   * Updates the quantity of a specific cart item.
   */
  updateCartItem: async (req, res, next) => {
    try {
      const cartItemId = parseInt(req.params.cartItemId);
      const cart = await cartService.updateCartItem(req.user.id, cartItemId, req.body.quantity);
      res.status(200).json({ success: true, message: 'Cart item updated', data: cart });
    } catch (error) { next(error); }
  },

  /**
   * Removes a specific item from the cart.
   */
  removeCartItem: async (req, res, next) => {
    try {
      const cartItemId = parseInt(req.params.cartItemId);
      const cart = await cartService.removeCartItem(req.user.id, cartItemId);
      res.status(200).json({ success: true, message: 'Cart item removed', data: cart });
    } catch (error) { next(error); }
  },

  /**
   * Clears the entire cart for a canteen.
   */
  clearCart: async (req, res, next) => {
    try {
      const canteenId = parseInt(req.params.canteenId);
      const cart = await cartService.clearCart(req.user.id, canteenId);
      res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
    } catch (error) { next(error); }
  },
};

module.exports = cartController;
