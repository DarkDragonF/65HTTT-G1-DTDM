const API_BASE = import.meta.env.VITE_API_URL || '';

export async function getCart(userId) {
	const url = `${API_BASE}/api/cart${userId ? `?user_id=${userId}` : ''}`;
	const res = await fetch(url, {
		credentials: 'include',
	});
	return res.json();
}

export async function addToCart({ userId, foodId, quantity }) {
	const url = `${API_BASE}/api/cart`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ user_id: userId, food_id: foodId, quantity }),
	});
	return res.json();
}

export default { getCart, addToCart };
