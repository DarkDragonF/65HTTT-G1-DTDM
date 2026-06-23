const db = require('../config/db');

const deliveryService = {
  assignDelivery: async (orderId, staffId) => {
    const [orderRows] = await db.query('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) throw new Error('Không tìm thấy đơn hàng!');
    if (orderRows[0].status !== 'READY_FOR_PICKUP') {
      throw new Error('Đơn hàng chưa sẵn sàng để giao!');
    }

    await db.query(
      'UPDATE orders SET delivery_staff_id = ?, status = ? WHERE id = ?',
      [staffId, 'DELIVERING', orderId],
    );

    return { message: 'Đã nhận giao đơn hàng này!' };
  },

  getAssignedForStaff: async (staffId) => {
    const query = `
      SELECT id, user_id, total_amount, status, created_at, delivery_staff_id
      FROM orders
      WHERE delivery_staff_id = ?
      ORDER BY created_at DESC
    `;
    const [orders] = await db.query(query, [staffId]);
    return orders;
  },

  updateDeliveryStatus: async (orderId, staffId, newStatus) => {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ? AND delivery_staff_id = ?',
      [newStatus, orderId, staffId],
    );

    if (result.affectedRows === 0) {
      throw new Error('Cập nhật thất bại. Đơn hàng không tồn tại hoặc bạn không có quyền!');
    }

    return { message: `Đã cập nhật trạng thái thành ${newStatus}` };
  },
};

module.exports = deliveryService;
