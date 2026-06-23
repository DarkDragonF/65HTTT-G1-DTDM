const Joi = require('joi');
const { AppError } = require('../middlewares/errorHandler');

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

const createOrderSchema = Joi.object({
  canteenId: Joi.number().integer().positive().required().messages({
    'any.required': 'Canteen ID is required',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        foodId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Order items are required',
    }),
  note: Joi.string().max(500).optional().allow('', null),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'preparing', 'ready_for_pickup', 'delivering', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: confirmed, preparing, ready_for_pickup, delivering, completed, cancelled',
      'any.required': 'Status is required',
    }),
  cancelReason: Joi.string().max(255).when('status', {
    is: 'cancelled',
    then: Joi.required().messages({ 'any.required': 'Cancel reason is required when cancelling' }),
    otherwise: Joi.optional().allow('', null),
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  validate,
};
