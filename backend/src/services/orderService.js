const { pool } = require('../config/db');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Food = require('../models/Food');
const Canteen = require('../models/Canteen');
const User = require('../models/User');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const OrderStatusLog = require('../models/OrderStatusLog');
const notificationService = require('./notificationService');
const invoiceService = require('./invoiceService');
const inventoryService = require('./inventoryService');
const cliqService = require('./cliqService');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Order Service implementing business logic, transactional checkouts,
 * role-based status transitions, and stock management.
 */
const orderService = {
  /**
   * Places an order directly from custom item arrays (Legacy/Direct mode).
   */
  createOrder: async (userId, { canteenId, items, note }) => {
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) throw new AppError('Canteen not found', 404);
    if (canteen.status !== 'active') throw new AppError('This canteen is not currently accepting orders', 400);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let totalAmount = 0;
      const orderItems = [];
      const foodsToNotify = [];

      for (const item of items) {
        // Lock food row for update to prevent race conditions
        const [foodRows] = await connection.execute(
          'SELECT * FROM foods WHERE id = ? FOR UPDATE',
          [item.foodId]
        );
        const food = foodRows[0];
        
        if (!food) throw new AppError(`Food item with ID ${item.foodId} not found`, 404);
        if (food.canteen_id !== canteenId) {
          throw new AppError(`Food item "${food.name}" does not belong to this canteen`, 400);
        }
        if (food.status !== 'available') {
          throw new AppError(`Food item "${food.name}" is currently unavailable`, 400);
        }
        if (food.quantity < item.quantity) {
          throw new AppError(`Insufficient stock. Only ${food.quantity} left for "${food.name}".`, 400);
        }

        const subtotal = food.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          foodId: item.foodId,
          quantity: item.quantity,
          unitPrice: food.price,
          subtotal,
        });

        // Deduct inventory locally in transaction
        const newQty = food.quantity - item.quantity;
        await connection.execute(
          'UPDATE foods SET quantity = ? WHERE id = ?',
          [newQty, item.foodId]
        );

        if (newQty < 5) {
          foodsToNotify.push({ ...food, quantity: newQty });
        }
      }

      // Generate order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randStr = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `TLU-${dateStr}-${randStr}`;

      // Create order
      const orderId = await Order.create({
        orderNumber,
        userId,
        canteenId,
        totalAmount,
        note: note || null,
      }, connection);

      // Create order items
      await OrderItem.createMany(orderId, orderItems, connection);

      // Log initial status transition
      await OrderStatusLog.create({
        orderId,
        fromStatus: null,
        toStatus: 'pending',
        changedBy: userId,
        note: 'Order placed directly',
      }, connection);

      await connection.commit();

      const createdOrder = await Order.findById(orderId);
      
      // Async secondary side-effects
      notificationService.notifyOrderCreated(createdOrder).catch(console.error);
      invoiceService.generateInvoice(createdOrder).catch(console.error);
      inventoryService.syncOrder(orderId).catch(console.error);
      cliqService.sendOrderAlert(`New Order placed: #${createdOrder.order_number} - Total: ${createdOrder.total_amount} VND`).catch(console.error);
      
      for (const item of orderItems) {
        inventoryService.syncStock(item.foodId, item.quantity).catch(console.error);
      }
      for (const food of foodsToNotify) {
        notificationService.notifyInventoryWarning(food).catch(console.error);
        cliqService.sendInventoryWarning(`Food "${food.name}" is low on stock (${food.quantity} left)`).catch(console.error);
      }

      const orderItemsData = await OrderItem.findByOrderId(orderId);
      return { ...createdOrder, items: orderItemsData };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Places an order from a user's active shopping cart for a canteen.
   */
  createOrderFromCart: async (userId, canteenId, { note }) => {
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) throw new AppError('Canteen not found', 404);
    if (canteen.status !== 'active') throw new AppError('This canteen is not active', 400);

    const cart = await Cart.findByUserAndCanteen(userId, canteenId);
    if (!cart) throw new AppError('Shopping cart is empty for this canteen', 400);

    const cartItems = await CartItem.findByCartId(cart.id);
    if (cartItems.length === 0) throw new AppError('Shopping cart is empty', 400);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let totalAmount = 0;
      const orderItems = [];
      const foodsToNotify = [];

      for (const item of cartItems) {
        // Lock food row
        const [foodRows] = await connection.execute(
          'SELECT * FROM foods WHERE id = ? FOR UPDATE',
          [item.food_id]
        );
        const food = foodRows[0];

        if (!food) throw new AppError(`Food item "${item.food_name}" no longer exists`, 404);
        if (food.status !== 'available') {
          throw new AppError(`Food item "${food.name}" is currently unavailable`, 400);
        }
        if (food.quantity < item.quantity) {
          throw new AppError(`Insufficient stock. Only ${food.quantity} left for "${food.name}".`, 400);
        }

        const subtotal = food.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          foodId: item.food_id,
          quantity: item.quantity,
          unitPrice: food.price,
          subtotal,
        });

        // Deduct inventory
        const newQty = food.quantity - item.quantity;
        await connection.execute(
          'UPDATE foods SET quantity = ? WHERE id = ?',
          [newQty, item.food_id]
        );

        if (newQty < 5) {
          foodsToNotify.push({ ...food, quantity: newQty });
        }
      }

      // Generate order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randStr = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `TLU-${dateStr}-${randStr}`;

      // Create order
      const orderId = await Order.create({
        orderNumber,
        userId,
        canteenId,
        totalAmount,
        note: note || null,
      }, connection);

      // Create order items
      await OrderItem.createMany(orderId, orderItems, connection);

      // Clear Cart items & Cart
      await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
      await connection.execute('DELETE FROM carts WHERE id = ?', [cart.id]);

      // Log initial status transition
      await OrderStatusLog.create({
        orderId,
        fromStatus: null,
        toStatus: 'pending',
        changedBy: userId,
        note: 'Order placed from cart',
      }, connection);

      await connection.commit();

      const createdOrder = await Order.findById(orderId);
      
      // Async side-effects
      notificationService.notifyOrderCreated(createdOrder).catch(console.error);
      invoiceService.generateInvoice(createdOrder).catch(console.error);
      inventoryService.syncOrder(orderId).catch(console.error);
      cliqService.sendOrderAlert(`New Order placed from cart: #${createdOrder.order_number} - Total: ${createdOrder.total_amount} VND`).catch(console.error);
      
      for (const item of orderItems) {
        inventoryService.syncStock(item.foodId, item.quantity).catch(console.error);
      }
      for (const food of foodsToNotify) {
        notificationService.notifyInventoryWarning(food).catch(console.error);
        cliqService.sendInventoryWarning(`Food "${food.name}" is low on stock (${food.quantity} left)`).catch(console.error);
      }

      const orderItemsData = await OrderItem.findByOrderId(orderId);
      return { ...createdOrder, items: orderItemsData };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Gets paginated orders belonging to a canteen.
   */
  getCanteenOrders: async (canteenId, filters) => {
    return await Order.findByCanteenId(canteenId, filters);
  },

  /**
   * Gets paginated orders belonging to a student/lecturer customer.
   */
  getMyOrders: async (userId, filters) => {
    return await Order.findByUserId(userId, filters);
  },

  /**
   * Gets detailed order information including items and timeline logs.
   */
  getOrderDetails: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const items = await OrderItem.findByOrderId(orderId);
    const logs = await OrderStatusLog.findByOrderId(orderId);
    return { ...order, items, timeline: logs };
  },

  /**
   * Updates order status with strict transition, role checks, and database transactions.
   */
  updateOrderStatus: async (orderId, status, userId, cancelReason) => {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const role = user.role;
    const oldStatus = order.status;

    // Validate status transitions based on user roles
    if (role === 'canteen_owner') {
      const allowed = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready_for_pickup', 'cancelled'],
      };
      if (!allowed[oldStatus] || !allowed[oldStatus].includes(status)) {
        throw new AppError(`Canteen owner cannot transition order from "${oldStatus}" to "${status}"`, 400);
      }
    } else if (role === 'delivery_staff') {
      const allowed = {
        ready_for_pickup: ['delivering'],
        delivering: ['completed'],
      };
      if (!allowed[oldStatus] || !allowed[oldStatus].includes(status)) {
        throw new AppError(`Delivery staff cannot transition order from "${oldStatus}" to "${status}"`, 400);
      }
    } else if (role === 'student' || role === 'lecturer') {
      const allowed = {
        pending: ['cancelled'],
      };
      if (!allowed[oldStatus] || !allowed[oldStatus].includes(status)) {
        throw new AppError(`Customer cannot transition order from "${oldStatus}" to "${status}"`, 400);
      }
    } else if (role === 'admin') {
      const allowed = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready_for_pickup', 'cancelled'],
        ready_for_pickup: ['delivering', 'cancelled'],
        delivering: ['completed'],
      };
      if (!allowed[oldStatus] || !allowed[oldStatus].includes(status)) {
        throw new AppError(`Admin cannot transition order from "${oldStatus}" to "${status}"`, 400);
      }
    } else {
      throw new AppError('Forbidden. Access denied.', 403);
    }

    // Process update
    if (status === 'cancelled') {
      if (!cancelReason) throw new AppError('Cancel reason is required', 400);

      const cancelInfo = {
        cancelledBy: role === 'canteen_owner' ? 'canteen' : (role === 'admin' ? 'admin' : 'student'),
        cancelReason
      };

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // 1. Update order status
        await Order.updateStatus(orderId, 'cancelled', cancelInfo, connection);

        // 2. Restore stock
        const items = await OrderItem.findByOrderId(orderId);
        for (const item of items) {
          await connection.execute(
            'UPDATE foods SET quantity = quantity + ? WHERE id = ?',
            [item.quantity, item.food_id]
          );
        }

        // 3. Log status change
        await OrderStatusLog.create({
          orderId,
          fromStatus: oldStatus,
          toStatus: 'cancelled',
          changedBy: userId,
          note: cancelReason,
        }, connection);

        await connection.commit();

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      // Sync updated stock to Zoho
      const items = await OrderItem.findByOrderId(orderId);
      for (const item of items) {
        const food = await Food.findById(item.food_id);
        if (food) inventoryService.syncStock(food.id, food.quantity).catch(console.error);
      }

    } else if (status === 'delivering') {
      // Assign delivery staff and change status to delivering
      await Order.assignDeliveryStaff(orderId, userId);

      await OrderStatusLog.create({
        orderId,
        fromStatus: oldStatus,
        toStatus: 'delivering',
        changedBy: userId,
        note: 'Delivery task accepted by staff',
      });

    } else {
      // Normal transition (confirmed, preparing, ready_for_pickup, completed)
      await Order.updateStatus(orderId, status);

      await OrderStatusLog.create({
        orderId,
        fromStatus: oldStatus,
        toStatus: status,
        changedBy: userId,
        note: `Order updated to ${status}`,
      });
    }

    const updatedOrder = await Order.findById(orderId);

    // Notify of status change
    notificationService.notifyOrderStatusChanged(updatedOrder, status, oldStatus).catch(console.error);

    // Send Zoho Cliq Alerts
    if (status === 'completed' || status === 'cancelled') {
      cliqService.sendOrderAlert(`Order #${updatedOrder.order_number} status updated to: *${status.toUpperCase()}*`).catch(console.error);
    }

    return updatedOrder;
  },

  /**
   * Cancels a pending order (called by customer student/lecturer).
   */
  cancelOrder: async (orderId, userId, reason) => {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    if (order.user_id !== userId) {
      throw new AppError('You can only cancel your own orders', 403);
    }

    if (order.status !== 'pending') {
      throw new AppError('Can only cancel orders that are still pending', 400);
    }

    return await orderService.updateOrderStatus(orderId, 'cancelled', userId, reason || 'Cancelled by customer');
  },

  /**
   * Gets available orders for pickup (called by delivery staff).
   */
  getAvailableDeliveryOrders: async (filters) => {
    return await Order.findAvailableForPickup(filters);
  },

  /**
   * Gets assigned delivery orders (called by delivery staff).
   */
  getMyDeliveryTasks: async (staffId, filters) => {
    return await Order.findByDeliveryStaffId(staffId, filters);
  },

  /**
   * Gets revenue statistics for a canteen.
   */
  getRevenueStats: async (canteenId, period) => {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      throw new AppError('Period must be one of: daily, weekly, monthly', 400);
    }
    return await Order.getRevenueStats(canteenId, period);
  },
};

module.exports = orderService;
