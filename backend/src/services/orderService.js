const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Food = require('../models/Food');
const Canteen = require('../models/Canteen');
const { AppError } = require('../middlewares/errorHandler');

// Valid status transitions for canteen owners
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: [],   // delivery staff handles from here
  delivering: [],
  completed: [],
  cancelled: [],
};

/**
 * @desc Create a new order (student/lecturer)
 */
const createOrder = async (userId, { canteenId, items, note }) => {
  // Verify canteen exists and is active
  const canteen = await Canteen.findById(canteenId);
  if (!canteen) throw new AppError('Canteen not found', 404);
  if (canteen.status !== 'active') throw new AppError('This canteen is not currently accepting orders', 400);

  // Verify all food items and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const food = await Food.findById(item.foodId);
    if (!food) throw new AppError(`Food item with ID ${item.foodId} not found`, 404);
    if (food.canteen_id !== canteenId) {
      throw new AppError(`Food item "${food.name}" does not belong to this canteen`, 400);
    }
    if (food.status !== 'available') {
      throw new AppError(`Food item "${food.name}" is currently unavailable`, 400);
    }

    const subtotal = food.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      foodId: item.foodId,
      quantity: item.quantity,
      unitPrice: food.price,
      subtotal,
    });
  }

  // Create order
  const orderId = await Order.create({
    userId,
    canteenId,
    totalAmount,
    note: note || null,
  });

  // Create order items
  await OrderItem.createMany(orderId, orderItems);

  // Mock Zoho Cliq notification
  console.log(`===== [ZOHO CLIQ] New order #${orderId} placed at "${canteen.name}" - Total: ${totalAmount} =====`);

  // Return full order with items
  const order = await Order.findById(orderId);
  const orderItemsData = await OrderItem.findByOrderId(orderId);
  return { ...order, items: orderItemsData };
};

/**
 * @desc Get orders for a canteen (canteen owner dashboard)
 */
const getCanteenOrders = async (canteenId, filters) => {
  return await Order.findByCanteenId(canteenId, filters);
};

/**
 * @desc Get orders for a student
 */
const getMyOrders = async (userId, filters) => {
  return await Order.findByUserId(userId, filters);
};

/**
 * @desc Get order details with items
 */
const getOrderDetails = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const items = await OrderItem.findByOrderId(orderId);
  return { ...order, items };
};

/**
 * @desc Update order status (canteen owner)
 */
const updateOrderStatus = async (orderId, status, userId, cancelReason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  // Validate status transition
  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(status)) {
    throw new AppError(
      `Cannot transition from "${order.status}" to "${status}"`,
      400
    );
  }

  // Handle cancellation
  let cancelInfo = null;
  if (status === 'cancelled') {
    if (!cancelReason) throw new AppError('Cancel reason is required', 400);
    cancelInfo = { cancelledBy: 'canteen', cancelReason };
  }

  await Order.updateStatus(orderId, status, cancelInfo);

  // Mock notifications
  console.log(`===== [ZOHO CLIQ] Order #${orderId} status updated to ${status} =====`);

  return await Order.findById(orderId);
};

/**
 * @desc Cancel order (student — only if PENDING)
 */
const cancelOrder = async (orderId, userId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.user_id !== userId) {
    throw new AppError('You can only cancel your own orders', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Can only cancel orders that are still pending', 400);
  }

  await Order.updateStatus(orderId, 'cancelled', {
    cancelledBy: 'student',
    cancelReason: reason || 'Cancelled by customer',
  });

  return await Order.findById(orderId);
};

/**
 * @desc Get revenue statistics for a canteen
 */
const getRevenueStats = async (canteenId, period) => {
  const validPeriods = ['daily', 'weekly', 'monthly'];
  if (!validPeriods.includes(period)) {
    throw new AppError('Period must be one of: daily, weekly, monthly', 400);
  }
  return await Order.getRevenueStats(canteenId, period);
};

module.exports = {
  createOrder,
  getCanteenOrders,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getRevenueStats,
};
