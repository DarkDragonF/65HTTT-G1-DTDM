const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbacMiddleware');
const { auditLogMiddleware } = require('../middlewares/auditMiddleware');
const { validate, createTicketSchema, createCommentSchema } = require('../validations/adminValidation');

router.use(verifyToken);

router.get('/tickets', supportController.getTickets);
router.post('/tickets', validate(createTicketSchema), supportController.createTicket);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets/:id/comments', validate(createCommentSchema), supportController.addComment);

// Admin-restricted tickets escalation and resolution endpoints
router.patch('/tickets/:id/escalate', checkPermission('manage_support'), auditLogMiddleware, supportController.escalate);
router.patch('/tickets/:id/resolve', checkPermission('manage_support'), auditLogMiddleware, supportController.resolve);

module.exports = router;
