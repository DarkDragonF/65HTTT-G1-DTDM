import React, { useEffect } from 'react';
import useCart from '../../hooks/useCart';

export default function Cart() {
  const { cart, loadCart, total, formattedTotal, addToCart } = useCart();

  useEffect(() => {
    // attempt to load for current user if stored; callers should pass userId
    loadCart();
  }, []);

  if (!cart) return <div>Loading cart...</div>;

  return (
    <div>
      <h2>Your Cart</h2>
      <ul>
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((it) => (
            <li key={it.cart_item_id}>
              {it.food_id} — {it.quantity} x {it.unit_price} = {it.subtotal}
            </li>
          ))
        ) : (
          <li>Your cart is empty</li>
        )}
      </ul>
      <div>Tổng: {formattedTotal}</div>
    </div>
  );
}
