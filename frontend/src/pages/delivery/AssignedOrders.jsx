import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as deliveryApi from '../../api/deliveryApi';

export default function AssignedOrders() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    deliveryApi.getAssigned(user.id).then((res) => {
      if (res && res.success) setList(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const update = async (deliveryId, status) => {
    await deliveryApi.updateDeliveryStatus(deliveryId, status);
    const res = await deliveryApi.getAssigned(user.id);
    if (res && res.success) setList(res.data || []);
  };

  if (loading) return <div>Loading assigned deliveries...</div>;

  return (
    <div>
      <h2>Assigned Deliveries</h2>
      {list.length === 0 ? <div>No deliveries assigned</div> : (
        <ul>
          {list.map(d => (
            <li key={d.delivery_id}>
              Order #{d.order_id} — {d.status} — {d.total_amount}
              <div>
                <button onClick={() => update(d.delivery_id, 'ACCEPTED')}>Accept</button>
                <button onClick={() => update(d.delivery_id, 'IN_TRANSIT')}>Start</button>
                <button onClick={() => update(d.delivery_id, 'DELIVERED')}>Delivered</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
