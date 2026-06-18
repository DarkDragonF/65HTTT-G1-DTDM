const db = require('../config/db');
const zohoService = require('./zohoService');

const VALID_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'DELIVERING',
  'COMPLETED',
  'CANCELLED',
];

const STOCK_REDUCED_STATUSES = [
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'DELIVERING',
  'COMPLETED',
];

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getOrderById = async (orderId, connection = db) => {
  const [orders] = await connection.query(
    'SELECT id, user_id, total_amount, status FROM orders WHERE id = ? LIMIT 1',
    [orderId],
  );

  if (orders.length === 0) {
    throw createHttpError('Order not found', 404);
  }

  const [items] = await connection.query(
    `
      SELECT
        oi.id AS order_item_id,
        oi.food_id,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS subtotal
      FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `,
    [orderId],
  );

  return {
    ...orders[0],
    items,
  };
};

const getOrderItemsForStock = async (orderId, connection) => {
  const [items] = await connection.query(
    `
      SELECT
        oi.food_id,
        oi.quantity,
        f.quantity AS available_quantity
      FROM order_items oi
      INNER JOIN foods f ON f.id = oi.food_id
      WHERE oi.order_id = ?
      FOR UPDATE
    `,
    [orderId],
  );

  return items;
};

const reduceStock = async (orderId, connection) => {
  const items = await getOrderItemsForStock(orderId, connection);

  for (const item of items) {
    if (item.available_quantity < item.quantity) {
      throw createHttpError(
        `Insufficient stock for food_id ${item.food_id}`,
        400,
      );
    }

    await connection.query(
      'UPDATE foods SET quantity = quantity - ? WHERE id = ?',
      [item.quantity, item.food_id],
    );
  }
};

const refundStock = async (orderId, connection) => {
  const [items] = await connection.query(
    'SELECT food_id, quantity FROM order_items WHERE order_id = ?',
    [orderId],
  );

  for (const item of items) {
    await connection.query(
      'UPDATE foods SET quantity = quantity + ? WHERE id = ?',
      [item.quantity, item.food_id],
    );
  }
};

const createOrder = async (userId) => {
  const connection = await db.getConnection();
  let orderId;
  let createdOrder;

  try {
    await connection.beginTransaction();

    const [cartRows] = await connection.query(
      'SELECT id FROM cart WHERE user_id = ? LIMIT 1 FOR UPDATE',
      [userId],
    );

    if (cartRows.length === 0) {
      throw createHttpError('Cart is empty', 400);
    }

    const cartId = cartRows[0].id;

    const [cartItems] = await connection.query(
      `
        SELECT
          ci.food_id,
          ci.quantity,
          f.price AS unit_price,
          f.quantity AS available_quantity
        FROM cart_items ci
        INNER JOIN foods f ON f.id = ci.food_id
        WHERE ci.cart_id = ?
        FOR UPDATE
      `,
      [cartId],
    );

    if (cartItems.length === 0) {
      throw createHttpError('Cart is empty', 400);
    }

    for (const item of cartItems) {
      if (item.quantity > item.available_quantity) {
        throw createHttpError(
          `Insufficient stock for food_id ${item.food_id}`,
          400,
        );
      }
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + Number(item.quantity) * Number(item.unit_price),
      0,
    );

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'PENDING'],
    );

    orderId = orderResult.insertId;
    const orderItemRows = cartItems.map((item) => [
      orderId,
      item.food_id,
      item.quantity,
      item.unit_price,
    ]);

    await connection.query(
      'INSERT INTO order_items (order_id, food_id, quantity, unit_price) VALUES ?',
      [orderItemRows],
    );

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  createdOrder = await getOrderById(orderId);

  await zohoService.sendCliqNotification(
    `New order #${createdOrder.id} created successfully`,
    createdOrder,
  );

  return createdOrder;
};

const updateOrderStatus = async ({ orderId, status }) => {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw createHttpError('Invalid order status', 400);
  }

  const connection = await db.getConnection();
  let updatedOrder;
  let shouldSyncReduction = false;
  let shouldRefundStock = false;
  let shouldGenerateInvoice = false;

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? LIMIT 1 FOR UPDATE',
      [orderId],
    );

    if (orders.length === 0) {
      throw createHttpError('Order not found', 404);
    }

    const previousStatus = orders[0].status;

    shouldSyncReduction =
      status === 'CONFIRMED' && !STOCK_REDUCED_STATUSES.includes(previousStatus);

    shouldRefundStock =
      status === 'CANCELLED' && STOCK_REDUCED_STATUSES.includes(previousStatus);

    shouldGenerateInvoice =
      status === 'COMPLETED' && previousStatus !== 'COMPLETED';

    if (shouldSyncReduction) {
      await reduceStock(orderId, connection);
    }

    if (shouldRefundStock) {
      await refundStock(orderId, connection);
    }

    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  updatedOrder = await getOrderById(orderId);

  if (shouldSyncReduction) {
    await zohoService.syncInventoryReduction(updatedOrder);
  }

  if (shouldRefundStock) {
    await zohoService.refundInventoryStock(updatedOrder);
  }

  if (shouldGenerateInvoice) {
    updatedOrder.invoice = await zohoService.generateInvoice(updatedOrder);
  }

  return updatedOrder;
};

module.exports = {
  VALID_ORDER_STATUSES,
  createOrder,
  updateOrderStatus,
};
