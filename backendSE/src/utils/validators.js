// src/utils/validators.js
// Simple express-validator wrappers and helpers for common routes
const { body, param, query, validationResult } = require('express-validator');

exports.validate = validations => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({ errors: errors.array() });
  };
};

// Common validators
exports.registerRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min length 6'),
  body('name').optional().isLength({ min: 1 })
];

exports.loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
];

exports.objectIdParam = name => [ param(name).isMongoId().withMessage(`${name} must be a valid id`) ];
