const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Các route quản trị sẽ viết ở đây
router.get('/users', adminController.getAllUsers);
module.exports = router;