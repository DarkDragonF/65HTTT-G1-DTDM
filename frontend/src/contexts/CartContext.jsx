import React, { createContext, useState, useMemo } from 'react';
import * as cartApi from '../api/cartApi';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const [cart, setCart] = useState({ items: [], total_amount: 0 });

	const loadCart = async (userId) => {
		try {
			const res = await cartApi.getCart(userId);
			if (res && res.success) setCart(res.data);
		} catch (err) {
			console.error('loadCart error', err);
		}
	};

	const addToCart = async ({ userId, foodId, quantity }) => {
		try {
			const res = await cartApi.addToCart({ userId, foodId, quantity });
			if (res && res.success) setCart(res.data);
			return res;
		} catch (err) {
			console.error('addToCart error', err);
			return { success: false, message: err.message };
		}
	};

	// Compute total client-side from items as a fallback or authoritative source
	const total = useMemo(() => {
		if (!cart || !Array.isArray(cart.items)) return 0;
		return cart.items.reduce((sum, it) => {
			const qty = Number(it.quantity || 0);
			const price = Number(it.unit_price ?? it.price ?? 0);
			const subtotal = Number(it.subtotal ?? qty * price);
			return sum + subtotal;
		}, 0);
	}, [cart.items]);

	const formattedTotal = useMemo(() => {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(total);
	}, [total]);

	return (
		<CartContext.Provider value={{ cart, loadCart, addToCart, total, formattedTotal }}>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
