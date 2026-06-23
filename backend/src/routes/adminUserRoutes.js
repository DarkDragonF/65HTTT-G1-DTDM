const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbacMiddleware');
const { auditLogMiddleware } = require('../middlewares/auditMiddleware');
const { validate, updateUserStatusSchema, updateUserRoleSchema } = require('../validations/adminValidation');

router.use(verifyToken);

router.get('/users', checkPermission('manage_users'), adminUserController.getUsers);
router.patch('/users/:id/status', checkPermission('manage_users'), auditLogMiddleware, validate(updateUserStatusSchema), adminUserController.updateStatus);
router.patch('/users/:id/role', checkPermission('manage_security'), auditLogMiddleware, validate(updateUserRoleSchema), adminUserController.updateRole);

module.exports = router;
