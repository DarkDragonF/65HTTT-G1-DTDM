const { Router } = require('express');
const cartController = require('../controllers/cartController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { validate, addToCartSchema, updateCartItemSchema } = require('../validations/cartValidation');

const router = Router();

// Protect all cart routes for student/lecturer roles
router.use(verifyToken, requireRole('student', 'lecturer'));

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 */
router.post('/add', validate(addToCartSchema), cartController.addToCart);

/**
 * @route   GET /api/cart
 * @desc    Get all carts of current user
 */
router.get('/', cartController.getMyCarts);

/**
 * @route   GET /api/cart/canteen/:canteenId
 * @desc    Get cart details for a specific canteen
 */
router.get('/canteen/:canteenId', cartController.getCart);

/**
 * @route   PUT /api/cart/item/:cartItemId
 * @desc    Update cart item quantity
 */
router.put('/item/:cartItemId', validate(updateCartItemSchema), cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/item/:cartItemId
 * @desc    Remove item from cart
 */
router.delete('/item/:cartItemId', cartController.removeCartItem);

/**
 * @route   DELETE /api/cart/canteen/:canteenId
 * @desc    Clear entire cart for a canteen
 */
router.delete('/canteen/:canteenId', cartController.clearCart);

module.exports = router;
