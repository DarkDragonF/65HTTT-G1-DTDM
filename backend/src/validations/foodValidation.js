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

const createFoodSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Food name must be at least 2 characters',
    'any.required': 'Food name is required',
  }),
  description: Joi.string().max(2000).optional().allow('', null),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': 'Category ID must be a number',
    'any.required': 'Category ID is required',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),
  quantity: Joi.number().integer().min(0).optional().default(0),
});

const updateFoodSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  description: Joi.string().max(2000).optional().allow('', null),
  categoryId: Joi.number().integer().positive().optional(),
  price: Joi.number().positive().optional(),
  quantity: Joi.number().integer().min(0).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = {
  createFoodSchema,
  updateFoodSchema,
  validate,
};
