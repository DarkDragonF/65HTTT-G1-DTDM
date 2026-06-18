const orderService = require('../services/orderService');

const getAuthenticatedUserId = (req) => req.user?.id || req.body?.user_id;

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const handleError = (res, error) => {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
};

const createOrder = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user_id is required',
      });
    }

    const order = await orderService.createOrder(Number(userId));

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order id is required',
      });
    }

    if (!orderService.VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${orderService.VALID_ORDER_STATUSES.join(', ')}`,
      });
    }

    const order = await orderService.updateOrderStatus({
      orderId: Number(id),
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
};
