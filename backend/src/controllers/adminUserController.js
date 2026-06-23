const adminUserService = require('../services/adminUserService');

const adminUserController = {
  getUsers: async (req, res, next) => {
    try {
      const { page, limit, search, role, status } = req.query;
      const users = await adminUserService.getUsersList({ page, limit, search, role, status });
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const result = await adminUserService.updateUserStatus(id, status, reason, req.user.id);
      res.status(200).json({ status: 'success', message: 'User status updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  updateRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const result = await adminUserService.updateUserRole(id, role, req.user.id);
      res.status(200).json({ status: 'success', message: 'User role updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminUserController;
