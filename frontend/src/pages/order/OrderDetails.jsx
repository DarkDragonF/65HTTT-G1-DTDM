import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as orderApi from '../../api/orderApi';
import useAuth from '../../hooks/useAuth';

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi.getOrder(id).then((res) => {
      if (res && res.success) setOrder(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const changeStatus = async (newStatus) => {
    setStatusUpdating(true);
    const res = await orderApi.updateOrderStatus(id, newStatus);
    if (res && res.success) setOrder(res.data);
    setStatusUpdating(false);
  };

  if (loading) return <div>Loading order...</div>;
  if (!order) return <div>No order found.</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>
      <div>Status: {order.status}</div>
      <div>Total: {order.total_amount}</div>
      <h3>Items</h3>
      <ul>
        {order.items.map((it) => (
          <li key={it.order_item_id}>
            Food #{it.food_id} — {it.quantity} x {it.unit_price} = {it.subtotal}
          </li>
        ))}
      </ul>

      {/* Allow status change for privileged users (simple check) */}
      {user?.role === 'admin' || user?.role === 'canteen' ? (
        <div>
          <button disabled={statusUpdating} onClick={() => changeStatus('CONFIRMED')}>Confirm</button>
          <button disabled={statusUpdating} onClick={() => changeStatus('PREPARING')}>Preparing</button>
          <button disabled={statusUpdating} onClick={() => changeStatus('DELIVERING')}>Delivering</button>
          <button disabled={statusUpdating} onClick={() => changeStatus('COMPLETED')}>Complete</button>
          <button disabled={statusUpdating} onClick={() => changeStatus('CANCELLED')}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}
