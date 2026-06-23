import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from '../pages/cart/Cart';
import Checkout from '../pages/cart/Checkout';
import OrderList from '../pages/order/OrderList';
import OrderDetails from '../pages/order/OrderDetails';
import AssignedOrders from '../pages/delivery/AssignedOrders';
import { CartProvider } from '../contexts/CartContext';

export default function AppRoutes() {
	return (
		<Router>
			<CartProvider>
				<Routes>
					<Route path="/cart" element={<Cart />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/orders" element={<OrderList />} />
					<Route path="/orders/:id" element={<OrderDetails />} />
					<Route path="/deliveries/assigned" element={<AssignedOrders />} />
				</Routes>
			</CartProvider>
		</Router>
	);
}
