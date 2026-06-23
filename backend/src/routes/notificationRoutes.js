const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = Router();

// All notification routes are protected for authenticated users
router.use(verifyToken);

/**
 * @route   GET /api/notifications
 * @desc    Get paginated notifications of the logged-in user
 */
router.get('/', notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark one notification as read
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all user notifications as read
 */
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
