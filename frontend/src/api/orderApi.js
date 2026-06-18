const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createOrder(userId) {
  const url = `${API_BASE}/api/orders`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

export async function getOrder(orderId) {
  const url = `${API_BASE}/api/orders/${orderId}`;
  const res = await fetch(url, { credentials: 'include' });
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const url = `${API_BASE}/api/orders/${orderId}/status`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export default { createOrder, getOrder, updateOrderStatus };
