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

const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended').required(),
  reason: Joi.string().max(255).optional().allow('', null)
});

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('student', 'lecturer', 'canteen_owner', 'delivery_staff', 'admin', 'super_admin').required()
});

const createTicketSchema = Joi.object({
  orderId: Joi.number().integer().positive().optional().allow(null),
  subject: Joi.string().min(5).max(150).required(),
  description: Joi.string().min(10).required(),
  priority: Joi.string().valid('low', 'medium', 'high').optional()
});

const createCommentSchema = Joi.object({
  message: Joi.string().min(1).required(),
  isInternal: Joi.boolean().optional()
});

const updateSettingSchema = Joi.object({
  value: Joi.string().required()
});

module.exports = {
  updateUserStatusSchema,
  updateUserRoleSchema,
  createTicketSchema,
  createCommentSchema,
  updateSettingSchema,
  validate
};
