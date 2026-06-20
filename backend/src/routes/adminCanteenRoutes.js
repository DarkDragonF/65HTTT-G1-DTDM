const express = require('express');
const router = express.Router();
const adminCanteenController = require('../controllers/adminCanteenController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbacMiddleware');
const { auditLogMiddleware } = require('../middlewares/auditMiddleware');

router.use(verifyToken);

router.get('/canteens', checkPermission('manage_canteens'), adminCanteenController.getCanteens);
router.patch('/canteens/:id/approve', checkPermission('manage_canteens'), auditLogMiddleware, adminCanteenController.approve);
router.patch('/canteens/:id/suspend', checkPermission('manage_canteens'), auditLogMiddleware, adminCanteenController.suspend);

module.exports = router;
