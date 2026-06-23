const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Public routes for cart operations. Authentication middleware
// can be added where appropriate (e.g. authMiddleware).
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);

module.exports = router;
