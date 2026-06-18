const deliveryService = require('../services/deliveryService');

const getAuthenticatedUserId = (req) => req.user?.id || req.body?.user_id;

const handleError = (res, error) => {
  console.error(error);
  return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
};

const assignDelivery = async (req, res) => {
  try {
    const { order_id: orderId, delivery_staff_id: deliveryStaffId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'order_id is required' });
    if (!deliveryStaffId) return res.status(400).json({ success: false, message: 'delivery_staff_id is required' });

    await deliveryService.assignDelivery({ orderId: Number(orderId), deliveryStaffId: Number(deliveryStaffId) });

    return res.status(200).json({ success: true, message: 'Delivery assigned' });
  } catch (err) {
    return handleError(res, err);
  }
};

const getAssigned = async (req, res) => {
  try {
    const staffId = getAuthenticatedUserId(req) || req.query.staff_id;
    if (!staffId) return res.status(400).json({ success: false, message: 'staff_id is required' });

    const rows = await deliveryService.getAssignedForStaff(Number(staffId));
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return handleError(res, err);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'delivery id required' });
    if (!status) return res.status(400).json({ success: false, message: 'status required' });

    await deliveryService.updateDeliveryStatus({ deliveryId: Number(id), status });
    return res.status(200).json({ success: true, message: 'Delivery status updated' });
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  assignDelivery,
  getAssigned,
  updateStatus,
};
