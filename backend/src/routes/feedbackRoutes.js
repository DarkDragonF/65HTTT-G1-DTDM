const { Router } = require('express');
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback directly from web application
 * @access  Private (any authenticated user)
 */
router.post('/', verifyToken, feedbackController.submitDirectFeedback);

/**
 * @route   POST /api/feedback/webhook
 * @desc    Receive external webhook from Zoho Forms submission
 * @access  Public
 */
router.post('/webhook', feedbackController.receiveZohoWebhook);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback records for reporting
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, requireRole('admin', 'super_admin'), feedbackController.getAllFeedback);

module.exports = router;
