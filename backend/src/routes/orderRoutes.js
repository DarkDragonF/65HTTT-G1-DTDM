const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { verifyCanteenOwnership, verifyOrderOwnership } = require('../middlewares/ownershipMiddleware');
const { validate, createOrderSchema, updateOrderStatusSchema } = require('../validations/orderValidation');

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Place a new order
 * @access  Private (student, lecturer)
 */
router.post('/', verifyToken, requireRole('student', 'lecturer'), validate(createOrderSchema), orderController.createOrder);

/**
 * @route   GET /api/orders/my
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/my', verifyToken, orderController.getMyOrders);

/**
 * @route   GET /api/orders/canteen/:canteenId
 * @desc    Get orders for a canteen
 * @access  Private (canteen_owner: own, admin)
 */
router.get('/canteen/:canteenId', verifyToken, requireRole('canteen_owner', 'admin'), verifyCanteenOwnership, orderController.getCanteenOrders);

/**
 * @route   GET /api/orders/canteen/:canteenId/stats
 * @desc    Get revenue statistics for a canteen
 * @access  Private (canteen_owner: own, admin)
 */
router.get('/canteen/:canteenId/stats', verifyToken, requireRole('canteen_owner', 'admin'), verifyCanteenOwnership, orderController.getRevenueStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private (canteen_owner: own, admin, customer: own)
 */
router.get('/:id', verifyToken, verifyOrderOwnership, orderController.getOrderDetails);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (canteen_owner: own, admin)
 */
router.patch('/:id/status', verifyToken, requireRole('canteen_owner', 'admin'), verifyOrderOwnership, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order (student: only if pending)
 * @access  Private
 */
router.patch('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
