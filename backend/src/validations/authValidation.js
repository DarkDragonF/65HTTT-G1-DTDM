const Joi = require('joi');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Registration request validation schema.
 * - fullName: 2–100 characters
 * - email: valid email format
 * - password: min 8 chars with uppercase, lowercase, and digit
 * - phone: optional, Vietnamese phone format
 * - role: optional, must be a valid enum value
 */
const registerSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name must not exceed 100 characters',
      'any.required': 'Full name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
      'any.required': 'Password is required',
    }),
  phone: Joi.string()
    .pattern(/^[0-9+\-() ]{8,20}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  role: Joi.string()
    .valid('student', 'lecturer', 'canteen_owner', 'delivery_staff')
    .optional()
    .messages({
      'any.only': 'Role must be one of: student, lecturer, canteen_owner, delivery_staff',
    }),
});

/**
 * Login request validation schema.
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * OTP verification request validation schema.
 */
const verifyOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP code must be exactly 6 digits',
      'string.pattern.base': 'OTP code must be exactly 6 digits',
      'any.required': 'OTP code is required',
    }),
});

/**
 * Resend OTP request validation schema.
 */
const resendOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Returns 400 with detailed error messages if validation fails.
 *
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @returns {import('express').RequestHandler} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('; ');
      return next(new AppError(messages, 400));
    }

    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  validate,
};
