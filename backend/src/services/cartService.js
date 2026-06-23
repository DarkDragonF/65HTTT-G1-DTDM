const db = require('../config/db');

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getOrCreateCart = async (userId) => {
  const [existingCarts] = await db.query(
    'SELECT id, user_id FROM cart WHERE user_id = ? LIMIT 1',
    [userId],
  );

  if (existingCarts.length > 0) {
    return existingCarts[0];
  }

  const [result] = await db.query(
    'INSERT INTO cart (user_id) VALUES (?)',
    [userId],
  );

  return {
    id: result.insertId,
    user_id: userId,
  };
};

const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const [items] = await db.query(
    `
      SELECT
        ci.id AS cart_item_id,
        ci.food_id,
        ci.quantity,
        f.price AS unit_price,
        f.quantity AS available_quantity,
        (ci.quantity * f.price) AS subtotal
      FROM cart_items ci
      INNER JOIN foods f ON f.id = ci.food_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id ASC
    `,
    [cart.id],
  );

  const totalAmount = items.reduce(
    (total, item) => total + Number(item.subtotal || 0),
    0,
  );

  return {
    cart_id: cart.id,
    user_id: userId,
    items,
    total_amount: totalAmount,
  };
};

const addToCart = async ({ userId, foodId, quantity }) => {
  const [foods] = await db.query(
    'SELECT id, price, quantity FROM foods WHERE id = ? LIMIT 1',
    [foodId],
  );

  if (foods.length === 0) {
    throw createHttpError('Food item not found', 404);
  }

  const food = foods[0];
  const cart = await getOrCreateCart(userId);

  const [existingItems] = await db.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND food_id = ? LIMIT 1',
    [cart.id, foodId],
  );

  const currentQuantity = existingItems[0]?.quantity || 0;
  const nextQuantity = currentQuantity + quantity;

  if (nextQuantity > food.quantity) {
    throw createHttpError('Requested quantity exceeds available stock', 400);
  }

  if (existingItems.length > 0) {
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [nextQuantity, existingItems[0].id],
    );
  } else {
    await db.query(
      'INSERT INTO cart_items (cart_id, food_id, quantity) VALUES (?, ?, ?)',
      [cart.id, foodId, quantity],
    );
  }

  return getCart(userId);
};

module.exports = {
  getCart,
  addToCart,
};
