const notificationService = require('../services/notificationService');

/**
 * Controller for handling user notifications.
 */
const notificationController = {
  /**
   * Retrieves paginated notifications for the logged-in user.
   */
  getNotifications: async (req, res, next) => {
    try {
      const result = await notificationService.getNotifications(req.user.id, req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  /**
   * Gets the unread notifications count for the user.
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (error) { next(error); }
  },

  /**
   * Marks a single notification as read.
   */
  markAsRead: async (req, res, next) => {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await notificationService.markAsRead(notificationId, req.user.id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Notification not found or access denied' });
      }
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) { next(error); }
  },

  /**
   * Marks all user notifications as read.
   */
  markAllAsRead: async (req, res, next) => {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
  },
};

module.exports = notificationController;
