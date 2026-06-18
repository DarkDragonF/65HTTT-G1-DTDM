import React, { createContext, useState } from 'react';
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

	return (
		<CartContext.Provider value={{ cart, loadCart, addToCart }}>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
