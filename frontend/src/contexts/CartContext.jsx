import { createContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

/**
 * Global Cart Provider that tracks active carts, quantities, and exposes cart action triggers.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [carts, setCarts] = useState([]);
  const [activeCart, setActiveCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Refreshes active carts summary list and total count badge.
   */
  const refreshCarts = useCallback(async () => {
    if (!isAuthenticated || !user || !['student', 'lecturer'].includes(user.role)) {
      setCarts([]);
      setCartCount(0);
      return;
    }
    try {
      const resBody = await cartService.getMyCarts();
      const cartsList = resBody.data || [];
      setCarts(cartsList);
      const total = cartsList.reduce((acc, c) => acc + c.totalQuantity, 0);
      setCartCount(total);
    } catch (error) {
      console.error('Failed to fetch carts summary:', error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshCarts();
  }, [refreshCarts]);

  /**
   * Fetches detailed cart items for a specific canteen.
   */
  const fetchCartDetails = useCallback(async (canteenId) => {
    setIsLoading(true);
    try {
      const resBody = await cartService.getCartDetails(canteenId);
      setActiveCart(resBody.data);
      return resBody.data;
    } catch (error) {
      console.error(`Failed to fetch cart details for canteen ${canteenId}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Adds an item to the cart, updating the context state.
   */
  const addItem = useCallback(async (foodId, quantity) => {
    setIsLoading(true);
    try {
      const resBody = await cartService.addToCart(foodId, quantity);
      const cart = resBody.data;
      if (activeCart && activeCart.canteenId === cart.canteenId) {
        setActiveCart(cart);
      }
      await refreshCarts();
      return cart;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeCart, refreshCarts]);

  /**
   * Updates the quantity of a specific cart item.
   */
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    setIsLoading(true);
    try {
      const resBody = await cartService.updateCartItem(cartItemId, quantity);
      setActiveCart(resBody.data);
      await refreshCarts();
      return resBody.data;
    } catch (error) {
      console.error(`Failed to update cart item ${cartItemId}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCarts]);

  /**
   * Removes a specific item from a cart.
   */
  const removeItem = useCallback(async (cartItemId) => {
    setIsLoading(true);
    try {
      const resBody = await cartService.removeCartItem(cartItemId);
      setActiveCart(resBody.data);
      await refreshCarts();
      return resBody.data;
    } catch (error) {
      console.error(`Failed to remove cart item ${cartItemId}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCarts]);

  /**
   * Clears the entire cart for a canteen.
   */
  const clearCanteenCart = useCallback(async (canteenId) => {
    setIsLoading(true);
    try {
      const resBody = await cartService.clearCart(canteenId);
      setActiveCart(resBody.data);
      await refreshCarts();
      return resBody.data;
    } catch (error) {
      console.error(`Failed to clear cart for canteen ${canteenId}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCarts]);

  const value = {
    carts,
    activeCart,
    cartCount,
    isLoading,
    refreshCarts,
    fetchCartDetails,
    addItem,
    updateQuantity,
    removeItem,
    clearCanteenCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
