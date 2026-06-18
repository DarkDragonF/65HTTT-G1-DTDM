const cartService = require('../services/cartService');

const getAuthenticatedUserId = (req) => req.user?.id || req.body?.user_id;

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const handleError = (res, error) => {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
};

const getCart = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user_id is required',
      });
    }

    const cart = await cartService.getCart(Number(userId));

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { food_id: foodId, quantity } = req.body;

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user_id is required',
      });
    }

    if (!isPositiveInteger(foodId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid food_id is required',
      });
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const cart = await cartService.addToCart({
      userId: Number(userId),
      foodId: Number(foodId),
      quantity: Number(quantity),
    });

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  getCart,
  addToCart,
};
