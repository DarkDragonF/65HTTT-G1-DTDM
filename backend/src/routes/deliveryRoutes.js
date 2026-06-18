const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Assign a delivery to a staff (admin/canteen)
router.post('/', deliveryController.assignDelivery);

// Get assigned deliveries for a staff
router.get('/assigned', deliveryController.getAssigned);

// Update delivery status
router.put('/:id/status', deliveryController.updateStatus);

module.exports = router;
