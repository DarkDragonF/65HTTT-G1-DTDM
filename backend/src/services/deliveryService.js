const db = require('../config/db');
const orderService = require('./orderService');

const VALID_DELIVERY_STATUSES = [
  'PENDING',
  'ASSIGNED',
  'ACCEPTED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
];

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assignDelivery = async ({ orderId, deliveryStaffId }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ensure order exists
    const order = await orderService.getOrder(orderId, connection);

    // create delivery record (or update if exists)
    const [existing] = await connection.query(
      'SELECT id FROM deliveries WHERE order_id = ? LIMIT 1',
      [orderId],
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE deliveries SET delivery_staff_id = ?, status = ?, assigned_at = NOW() WHERE id = ?',
        [deliveryStaffId, 'ASSIGNED', existing[0].id],
      );
    } else {
      await connection.query(
        'INSERT INTO deliveries (order_id, delivery_staff_id, status, assigned_at) VALUES (?, ?, ?, NOW())',
        [orderId, deliveryStaffId, 'ASSIGNED'],
      );
    }

    // update order status to DELIVERING
    await orderService.updateOrderStatus({ orderId, status: 'DELIVERING' });

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getAssignedForStaff = async (staffId) => {
  const [rows] = await db.query(
    `
      SELECT d.id AS delivery_id, d.order_id, d.status, d.assigned_at, d.accepted_at, d.started_at, d.delivered_at,
             o.total_amount, o.status AS order_status
      FROM deliveries d
      INNER JOIN orders o ON o.id = d.order_id
      WHERE d.delivery_staff_id = ?
      ORDER BY d.assigned_at DESC
    `,
    [staffId],
  );

  return rows;
};

const updateDeliveryStatus = async ({ deliveryId, status }) => {
  if (!VALID_DELIVERY_STATUSES.includes(status)) {
    throw createHttpError('Invalid delivery status', 400);
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT id, order_id FROM deliveries WHERE id = ? LIMIT 1 FOR UPDATE', [deliveryId]);
    if (rows.length === 0) throw createHttpError('Delivery not found', 404);

    const delivery = rows[0];

    const tsField =
      status === 'ACCEPTED' ? 'accepted_at' : status === 'IN_TRANSIT' ? 'started_at' : status === 'DELIVERED' ? 'delivered_at' : null;

    if (tsField) {
      await connection.query(`UPDATE deliveries SET status = ?, ${tsField} = NOW() WHERE id = ?`, [status, deliveryId]);
    } else {
      await connection.query('UPDATE deliveries SET status = ? WHERE id = ?', [status, deliveryId]);
    }

    // If delivered, update order status to COMPLETED
    if (status === 'DELIVERED') {
      await orderService.updateOrderStatus({ orderId: delivery.order_id, status: 'COMPLETED' });
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  VALID_DELIVERY_STATUSES,
  assignDelivery,
  getAssignedForStaff,
  updateDeliveryStatus,
};
