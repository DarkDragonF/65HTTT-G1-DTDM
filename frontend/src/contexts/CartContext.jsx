import { createContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

/**
 * Global Cart Provider that tracks active carts, quantities, and exposes cart action triggers.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [carts, setCarts] = useState([]);
  const [activeCart, setActiveCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Refreshes active carts summary list and total count badge.
   */
  const refreshCarts = useCallback(async () => {
    if (!isAuthenticated) {
      setCarts([]);
      setCartCount(0);
      return;
    }
    try {
      const data = await cartService.getMyCarts();
      setCarts(data || []);
      const total = (data || []).reduce((acc, c) => acc + c.totalQuantity, 0);
      setCartCount(total);
    } catch (error) {
      console.error('Failed to fetch carts summary:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCarts();
  }, [refreshCarts]);

  /**
   * Fetches detailed cart items for a specific canteen.
   */
  const fetchCartDetails = useCallback(async (canteenId) => {
    setIsLoading(true);
    try {
      const data = await cartService.getCartDetails(canteenId);
      setActiveCart(data);
      return data;
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
      const data = await cartService.addToCart(foodId, quantity);
      if (activeCart && activeCart.canteenId === data.canteenId) {
        setActiveCart(data);
      }
      await refreshCarts();
      return data;
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
      const data = await cartService.updateCartItem(cartItemId, quantity);
      setActiveCart(data);
      await refreshCarts();
      return data;
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
      const data = await cartService.removeCartItem(cartItemId);
      setActiveCart(data);
      await refreshCarts();
      return data;
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
      const data = await cartService.clearCart(canteenId);
      setActiveCart(data);
      await refreshCarts();
      return data;
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
