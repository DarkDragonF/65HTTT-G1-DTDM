const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create a new order from user's cart
router.post('/', orderController.createOrder);

// Get order details
router.get('/:id', orderController.getOrder);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
