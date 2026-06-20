const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Food = require('../models/Food');
const Canteen = require('../models/Canteen');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Cart service providing business logic for student/lecturer shopping carts.
 */
const cartService = {
  /**
   * Adds food to a cart, creating the cart first if necessary.
   */
  addToCart: async (userId, { foodId, quantity }) => {
    // 1. Verify food exists
    const food = await Food.findById(foodId);
    if (!food) throw new AppError('Food item not found', 404);
    
    // Verify food is available
    if (food.status !== 'available') {
      throw new AppError(`Food item "${food.name}" is currently unavailable`, 400);
    }

    // Verify canteen exists and is active
    const canteen = await Canteen.findById(food.canteen_id);
    if (!canteen) throw new AppError('Canteen not found', 404);
    if (canteen.status !== 'active') {
      throw new AppError('This canteen is not currently active', 400);
    }

    // 2. Verify stock
    if (food.quantity < quantity) {
      throw new AppError(`Insufficient stock. Only ${food.quantity} left for "${food.name}".`, 400);
    }

    // 3. Find or create cart
    const cart = await Cart.findOrCreate(userId, food.canteen_id);

    // 4. Add/update item (verify cumulative quantity doesn't exceed stock)
    const existingItems = await CartItem.findByCartId(cart.id);
    const existingItem = existingItems.find(item => item.food_id === foodId);
    
    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (food.quantity < targetQuantity) {
      throw new AppError(`Cannot add more. Combined quantity in cart (${targetQuantity}) exceeds available stock (${food.quantity}).`, 400);
    }

    await CartItem.addItem(cart.id, foodId, quantity);

    // 5. Return updated cart
    return await cartService.getCart(userId, food.canteen_id);
  },

  /**
   * Gets details of a cart for a specific canteen, calculating subtotals.
   */
  getCart: async (userId, canteenId) => {
    const cart = await Cart.findByUserAndCanteen(userId, canteenId);
    if (!cart) {
      return {
        cartId: null,
        canteenId,
        canteenName: null,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
      };
    }

    const cartInfo = await Cart.findById(cart.id);
    const items = await CartItem.findByCartId(cart.id);

    let subtotal = 0;
    let totalQuantity = 0;
    
    const formattedItems = items.map(item => {
      const itemSubtotal = item.food_price * item.quantity;
      subtotal += itemSubtotal;
      totalQuantity += item.quantity;

      return {
        id: item.id,
        foodId: item.food_id,
        name: item.food_name,
        price: item.food_price,
        imageUrl: item.food_image_url,
        quantity: item.quantity,
        status: item.food_status,
        stock: item.food_stock,
        subtotal: itemSubtotal,
      };
    });

    return {
      cartId: cart.id,
      canteenId: cart.canteen_id,
      canteenName: cartInfo.canteen_name,
      canteenLogoUrl: cartInfo.canteen_logo_url,
      items: formattedItems,
      subtotal,
      totalQuantity,
    };
  },

  /**
   * Gets summary of all active carts for a user.
   */
  getMyCarts: async (userId) => {
    const carts = await Cart.findByUserId(userId);
    const results = [];

    for (const cart of carts) {
      const items = await CartItem.findByCartId(cart.id);
      let subtotal = 0;
      let totalQuantity = 0;

      items.forEach(item => {
        subtotal += item.food_price * item.quantity;
        totalQuantity += item.quantity;
      });

      results.push({
        cartId: cart.id,
        canteenId: cart.canteen_id,
        canteenName: cart.canteen_name,
        canteenLogoUrl: cart.canteen_logo_url,
        totalItems: items.length,
        totalQuantity,
        subtotal,
      });
    }

    return results;
  },

  /**
   * Updates cart item quantity.
   */
  updateCartItem: async (userId, cartItemId, quantity) => {
    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) throw new AppError('Cart item not found', 404);
    if (cartItem.user_id !== userId) throw new AppError('Access denied. You do not own this cart item.', 403);

    // Verify stock
    const food = await Food.findById(cartItem.food_id);
    if (!food) throw new AppError('Food item not found', 404);
    if (food.status !== 'available') throw new AppError('Food item is currently unavailable', 400);
    
    if (food.quantity < quantity) {
      throw new AppError(`Insufficient stock. Only ${food.quantity} left for "${food.name}".`, 400);
    }

    await CartItem.updateQuantity(cartItemId, quantity);

    const cart = await Cart.findById(cartItem.cart_id);
    return await cartService.getCart(userId, cart.canteen_id);
  },

  /**
   * Removes a specific item from a cart. Deletes the cart if it becomes empty.
   */
  removeCartItem: async (userId, cartItemId) => {
    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) throw new AppError('Cart item not found', 404);
    if (cartItem.user_id !== userId) throw new AppError('Access denied. You do not own this cart item.', 403);

    const cartId = cartItem.cart_id;
    await CartItem.removeItem(cartItemId);

    const count = await CartItem.countItems(cartId);
    const cart = await Cart.findById(cartId);
    
    if (count === 0) {
      await Cart.delete(cartId);
      return { cartId: null, canteenId: cart.canteen_id, items: [], subtotal: 0, totalQuantity: 0 };
    }

    return await cartService.getCart(userId, cart.canteen_id);
  },

  /**
   * Clears a cart entirely.
   */
  clearCart: async (userId, canteenId) => {
    const cart = await Cart.findByUserAndCanteen(userId, canteenId);
    if (!cart) throw new AppError('Cart not found', 404);

    await Cart.delete(cart.id);
    return { cartId: null, canteenId, items: [], subtotal: 0, totalQuantity: 0 };
  },
};

module.exports = cartService;
