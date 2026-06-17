const { pool } = require('../config/db');
const { AppError } = require('./errorHandler');

/**
 * Middleware that verifies the authenticated user owns the canteen.
 * Admin users bypass the ownership check.
 * Reads canteenId from req.params.canteenId or req.params.id (for canteen routes).
 */
const verifyCanteenOwnership = async (req, res, next) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') return next();

    const canteenId = req.params.canteenId || req.params.id;
    if (!canteenId) throw new AppError('Canteen ID is required', 400);

    const [rows] = await pool.execute(
      'SELECT owner_id FROM canteens WHERE id = ?',
      [canteenId]
    );

    if (rows.length === 0) throw new AppError('Canteen not found', 404);
    if (rows[0].owner_id !== req.user.id) {
      throw new AppError('Forbidden. You do not own this canteen.', 403);
    }

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Ownership verification failed', 500));
  }
};

/**
 * Middleware that verifies the authenticated user owns the canteen
 * that the food item belongs to.
 * Admin users bypass the check.
 * Reads food id from req.params.id.
 */
const verifyFoodOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const foodId = req.params.id;
    if (!foodId) throw new AppError('Food ID is required', 400);

    const [rows] = await pool.execute(
      `SELECT c.owner_id FROM foods f 
       JOIN canteens c ON f.canteen_id = c.id 
       WHERE f.id = ?`,
      [foodId]
    );

    if (rows.length === 0) throw new AppError('Food item not found', 404);
    if (rows[0].owner_id !== req.user.id) {
      throw new AppError('Forbidden. You do not own this food item.', 403);
    }

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Ownership verification failed', 500));
  }
};

/**
 * Middleware that verifies the authenticated user owns the canteen
 * that the order belongs to.
 */
const verifyOrderOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const orderId = req.params.id;
    if (!orderId) throw new AppError('Order ID is required', 400);

    const [rows] = await pool.execute(
      `SELECT c.owner_id, o.user_id FROM orders o
       JOIN canteens c ON o.canteen_id = c.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (rows.length === 0) throw new AppError('Order not found', 404);
    
    // Allow canteen owner OR the student who placed the order
    const isOwner = rows[0].owner_id === req.user.id;
    const isCustomer = rows[0].user_id === req.user.id;
    
    if (!isOwner && !isCustomer) {
      throw new AppError('Forbidden. You do not have access to this order.', 403);
    }

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Ownership verification failed', 500));
  }
};

module.exports = { verifyCanteenOwnership, verifyFoodOwnership, verifyOrderOwnership };
