const Notification = require('../models/Notification');
const Canteen = require('../models/Canteen');

/**
 * Notification service handling database notifications and mock Zoho notifications.
 */
const notificationService = {
  /**
   * Creates a notification.
   */
  createNotification: async (data) => {
    const id = await Notification.create(data);
    return { id, ...data };
  },

  /**
   * Notifies the canteen owner that a new order has been placed.
   */
  notifyOrderCreated: async (order) => {
    const canteen = await Canteen.findById(order.canteen_id);
    if (!canteen) return;

    const title = 'New Order Received';
    const message = `You have received a new order #${order.order_number || order.id} for ${order.total_amount} VND.`;
    
    await Notification.create({
      userId: canteen.owner_id,
      type: 'order_created',
      title,
      message,
      referenceId: order.id,
      referenceType: 'order',
    });

    console.log(`===== [ZOHO CLIQ] Notification to Canteen Owner (User ID ${canteen.owner_id}): ${title} - ${message} =====`);
  },

  /**
   * Notifies the customer of an order status change.
   */
  notifyOrderStatusChanged: async (order, newStatus, oldStatus) => {
    const title = `Order ${newStatus.toUpperCase().replace(/_/g, ' ')}`;
    let message = `Your order #${order.order_number || order.id} status has been updated to ${newStatus.replace(/_/g, ' ')}.`;

    if (newStatus === 'cancelled') {
      const reasonStr = order.cancel_reason ? ` Reason: ${order.cancel_reason}` : '';
      message = `Your order #${order.order_number || order.id} has been cancelled.${reasonStr}`;
    }

    // Map new status string to notification ENUM type
    let notificationType = 'system';
    const allowedNotificationTypes = [
      'order_created', 'order_confirmed', 'order_rejected',
      'order_preparing', 'order_ready_for_pickup', 'order_delivering', 
      'order_completed', 'order_cancelled'
    ];
    if (allowedNotificationTypes.includes(`order_${newStatus}`)) {
      notificationType = `order_${newStatus}`;
    }

    await Notification.create({
      userId: order.user_id,
      type: notificationType,
      title,
      message,
      referenceId: order.id,
      referenceType: 'order',
    });

    console.log(`===== [ZOHO CLIQ] Notification to Customer (User ID ${order.user_id}): ${title} - ${message} =====`);

    // If order was cancelled and there was a delivery staff assigned, notify them too
    if (order.delivery_staff_id && newStatus === 'cancelled') {
      await Notification.create({
        userId: order.delivery_staff_id,
        type: 'order_cancelled',
        title: 'Delivery Task Cancelled',
        message: `Order #${order.order_number || order.id} that you accepted has been cancelled.`,
        referenceId: order.id,
        referenceType: 'order',
      });
      console.log(`===== [ZOHO CLIQ] Notification to Delivery Staff (User ID ${order.delivery_staff_id}): Delivery Task Cancelled =====`);
    }
  },

  /**
   * Notifies the canteen owner when a food item's stock is low (e.g. less than 5).
   */
  notifyInventoryWarning: async (food) => {
    const canteen = await Canteen.findById(food.canteen_id);
    if (!canteen) return;

    const title = 'Low Stock Warning';
    const message = `Food item "${food.name}" is running low on stock. Current quantity: ${food.quantity}.`;

    await Notification.create({
      userId: canteen.owner_id,
      type: 'inventory_warning',
      title,
      message,
      referenceId: food.id,
      referenceType: 'food',
    });

    console.log(`===== [ZOHO CLIQ] Notification to Canteen Owner (User ID ${canteen.owner_id}): ${title} - ${message} =====`);
  },

  /**
   * Gets paginated notifications for a user.
   */
  getNotifications: async (userId, filters) => {
    return await Notification.findByUserId(userId, filters);
  },

  /**
   * Marks a notification as read.
   */
  markAsRead: async (id, userId) => {
    return await Notification.markAsRead(id, userId);
  },

  /**
   * Marks all notifications as read.
   */
  markAllAsRead: async (userId) => {
    await Notification.markAllAsRead(userId);
  },

  /**
   * Gets unread notifications count.
   */
  getUnreadCount: async (userId) => {
    return await Notification.getUnreadCount(userId);
  },
};

module.exports = notificationService;
