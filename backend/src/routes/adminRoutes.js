const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Các route quản trị sẽ viết ở đây
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.changeUserStatus);
module.exports = router;