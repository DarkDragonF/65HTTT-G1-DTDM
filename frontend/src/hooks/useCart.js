import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * Custom Hook to use the CartContext safely.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
