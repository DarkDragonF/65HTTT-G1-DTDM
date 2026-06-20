const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbacMiddleware');
const { auditLogMiddleware } = require('../middlewares/auditMiddleware');
const { validate, updateSettingSchema } = require('../validations/adminValidation');

router.use(verifyToken);

router.get('/dashboard/summary', checkPermission('view_dashboard'), adminController.getSummary);
router.get('/dashboard/revenue', checkPermission('view_dashboard'), adminController.getRevenue);
router.post('/dashboard/snapshot', checkPermission('manage_security'), auditLogMiddleware, adminController.triggerSnapshot);

router.get('/monitoring/health', checkPermission('view_dashboard'), adminController.getPlatformHealth);
router.get('/monitoring/metrics', checkPermission('view_dashboard'), adminController.getSystemMetrics);

router.get('/audit-logs', checkPermission('view_audit_logs'), adminController.getAuditLogs);

router.get('/settings', checkPermission('manage_settings'), adminController.getSettings);
router.patch('/settings/:key', checkPermission('manage_settings'), auditLogMiddleware, validate(updateSettingSchema), adminController.updateSetting);

module.exports = router;
