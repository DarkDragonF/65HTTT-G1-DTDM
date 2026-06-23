const Joi = require('joi');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Validation middleware factory.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return next(new AppError(messages, 400));
    }
    next();
  };
};

/**
 * Schema for adding/updating items in a cart.
 */
const addToCartSchema = Joi.object({
  foodId: Joi.number().integer().positive().required().messages({
    'any.required': 'Food ID is required',
    'number.base': 'Food ID must be a number',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be at least 1',
  }),
});

/**
 * Schema for updating item quantity.
 */
const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be at least 1',
  }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  validate,
};
