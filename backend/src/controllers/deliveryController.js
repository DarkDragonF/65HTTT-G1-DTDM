const deliveryService = require('../services/deliveryService');

const deliveryController = {
  assignDelivery: async (req, res) => {
    try {
      const staffId = req.user ? req.user.id : 2;
      const { orderId } = req.body;

      const result = await deliveryService.assignDelivery(orderId, staffId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getAssigned: async (req, res) => {
    try {
      const staffId = req.user ? req.user.id : 2;
      const orders = await deliveryService.getAssignedForStaff(staffId);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const staffId = req.user ? req.user.id : 2;
      const { orderId } = req.params;
      const { status } = req.body;

      const result = await deliveryService.updateDeliveryStatus(orderId, staffId, status);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = deliveryController;
