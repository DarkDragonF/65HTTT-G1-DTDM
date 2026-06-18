const API_BASE = import.meta.env.VITE_API_URL || '';

export async function assignDelivery({ orderId, deliveryStaffId }) {
  const url = `${API_BASE}/api/deliveries`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ orderId, deliveryStaffId }),
  });
  return res.json();
}

export async function getAssigned(staffId) {
  const url = `${API_BASE}/api/deliveries/assigned${staffId ? `?staff_id=${staffId}` : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  return res.json();
}

export async function updateDeliveryStatus(orderId, status) {
  const url = `${API_BASE}/api/deliveries/${orderId}/status`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export default { assignDelivery, getAssigned, updateDeliveryStatus };
