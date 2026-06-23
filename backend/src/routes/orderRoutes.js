const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { verifyCanteenOwnership, verifyOrderOwnership } = require('../middlewares/ownershipMiddleware');
const { validate, createOrderSchema, updateOrderStatusSchema } = require('../validations/orderValidation');

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Place a new order directly
 * @access  Private (student, lecturer)
 */
router.post('/', verifyToken, requireRole('student', 'lecturer'), validate(createOrderSchema), orderController.createOrder);

/**
 * @route   POST /api/orders/from-cart/:canteenId
 * @desc    Place order from shopping cart
 * @access  Private (student, lecturer)
 */
router.post('/from-cart/:canteenId', verifyToken, requireRole('student', 'lecturer'), orderController.createOrderFromCart);

/**
 * @route   GET /api/orders/delivery/available
 * @desc    Get all orders ready for delivery (available tasks)
 * @access  Private (delivery_staff, admin)
 */
router.get('/delivery/available', verifyToken, requireRole('delivery_staff', 'admin'), orderController.getAvailableDeliveryOrders);

/**
 * @route   GET /api/orders/delivery/my
 * @desc    Get delivery tasks assigned to the current staff member
 * @access  Private (delivery_staff, admin)
 */
router.get('/delivery/my', verifyToken, requireRole('delivery_staff', 'admin'), orderController.getMyDeliveryTasks);

/**
 * @route   GET /api/orders/my
 * @desc    Get current customer's orders
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
 * @access  Private (canteen_owner: own, admin, customer: own, assigned/available delivery staff)
 */
router.get('/:id', verifyToken, verifyOrderOwnership, orderController.getOrderDetails);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (canteen_owner: own, delivery_staff, admin)
 */
router.patch('/:id/status', verifyToken, requireRole('canteen_owner', 'delivery_staff', 'admin'), verifyOrderOwnership, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order (student: only if pending)
 * @access  Private
 */
router.patch('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
