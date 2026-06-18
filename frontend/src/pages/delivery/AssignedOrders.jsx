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

  const update = async (orderId, status) => {
    await deliveryApi.updateDeliveryStatus(orderId, status);
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
            <li key={d.id}>
              Order #{d.id} — {d.status} — {d.total_amount}
              <div>
                <button onClick={() => update(d.id, 'ACCEPTED')}>Accept</button>
                <button onClick={() => update(d.id, 'IN_TRANSIT')}>Start</button>
                <button onClick={() => update(d.id, 'DELIVERED')}>Delivered</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
