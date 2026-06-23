import React, { useEffect, useState } from 'react';
import * as orderApi from '../../api/orderApi';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // For now reuse getOrder by fetching recent orders could be implemented in API
      // Fallback: do nothing if no API for listing orders
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <div>No orders yet</div>
      ) : (
        <ul>
          {orders.map(o => (
            <li key={o.id}><Link to={`/orders/${o.id}`}>Order #{o.id} — {o.status}</Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
