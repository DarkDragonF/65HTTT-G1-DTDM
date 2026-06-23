const Joi = require('joi');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Middleware factory that validates req.body against a Joi schema.
 * @param {Joi.ObjectSchema} schema
 * @returns {import('express').RequestHandler}
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

const createCanteenSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Canteen name must be at least 2 characters',
    'string.max': 'Canteen name must not exceed 150 characters',
    'any.required': 'Canteen name is required',
  }),
  address: Joi.string().max(255).optional().allow('', null),
  description: Joi.string().max(2000).optional().allow('', null),
  phone: Joi.string().pattern(/^[0-9+\-() ]{8,20}$/).optional().allow('', null).messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  openingHours: Joi.string().max(100).optional().allow('', null),
});

const updateCanteenSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  address: Joi.string().max(255).optional().allow('', null),
  description: Joi.string().max(2000).optional().allow('', null),
  phone: Joi.string().pattern(/^[0-9+\-() ]{8,20}$/).optional().allow('', null),
  openingHours: Joi.string().max(100).optional().allow('', null),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'pending').required().messages({
    'any.only': 'Status must be one of: active, inactive, pending',
    'any.required': 'Status is required',
  }),
});

module.exports = {
  createCanteenSchema,
  updateCanteenSchema,
  updateStatusSchema,
  validate,
};
