const adminCanteenService = require('../services/adminCanteenService');

const adminCanteenController = {
  getCanteens: async (req, res, next) => {
    try {
      const { page, limit, search, status } = req.query;
      const canteens = await adminCanteenService.getCanteensList({ page, limit, search, status });
      res.status(200).json({ status: 'success', data: canteens });
    } catch (error) {
      next(error);
    }
  },

  approve: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await adminCanteenService.approveCanteen(id, req.user.id);
      res.status(200).json({ status: 'success', message: 'Canteen approved successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  suspend: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await adminCanteenService.suspendCanteen(id, req.user.id);
      res.status(200).json({ status: 'success', message: 'Canteen suspended successfully', data: result });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminCanteenController;
