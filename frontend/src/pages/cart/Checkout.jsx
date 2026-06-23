import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as orderApi from '../../api/orderApi';
import useAuth from '../../hooks/useAuth';

export default function Checkout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const placeOrder = async () => {
    setLoading(true);
    const res = await orderApi.createOrder(user?.id);
    setLoading(false);
    if (res && res.success) {
      navigate(`/orders/${res.data.id}`);
    } else {
      alert(res?.message || 'Order failed');
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={placeOrder} disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</button>
    </div>
  );
}
