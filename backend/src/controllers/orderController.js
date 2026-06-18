const orderService = require('../services/orderService');

/** @route POST /api/orders */
const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
  } catch (error) { next(error); }
};

/** @route GET /api/orders/canteen/:canteenId */
const getCanteenOrders = async (req, res, next) => {
  try {
    const result = await orderService.getCanteenOrders(parseInt(req.params.canteenId), req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** @route GET /api/orders/my */
const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user.id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** @route GET /api/orders/:id */
const getOrderDetails = async (req, res, next) => {
  try {
    const order = await orderService.getOrderDetails(req.params.id);
    res.status(200).json({ success: true, data: { order } });
  } catch (error) { next(error); }
};

/** @route PATCH /api/orders/:id/status */
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id, req.body.status, req.user.id, req.body.cancelReason
    );
    res.status(200).json({ success: true, message: `Order status updated to ${req.body.status}`, data: { order } });
  } catch (error) { next(error); }
};

/** @route PATCH /api/orders/:id/cancel */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id, req.body.reason);
    res.status(200).json({ success: true, message: 'Order cancelled', data: { order } });
  } catch (error) { next(error); }
};

/** @route GET /api/orders/canteen/:canteenId/stats */
const getRevenueStats = async (req, res, next) => {
  try {
    const stats = await orderService.getRevenueStats(parseInt(req.params.canteenId), req.query.period || 'daily');
    res.status(200).json({ success: true, data: { stats } });
  } catch (error) { next(error); }
};

module.exports = { createOrder, getCanteenOrders, getMyOrders, getOrderDetails, updateOrderStatus, cancelOrder, getRevenueStats };
