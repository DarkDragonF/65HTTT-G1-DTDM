const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
router.use(authMiddleware, isAdmin); // Tất cả endpoint phía dưới bắt buộc phải là Admin mới gọi được

// Các route quản trị sẽ viết ở đây
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.changeUserStatus);
module.exports = router;