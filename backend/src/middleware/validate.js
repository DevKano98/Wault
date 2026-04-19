const { ZodError, z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }

      return next(error);
    }
  };
}

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const vaultItemSchema = z.object({
  type: z.enum(['PASSWORD', 'NOTE', 'DOCUMENT']),
  title: z.string().min(1),
  data: z.string(),
});

const beneficiarySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const inactivityRuleSchema = z.object({
  thresholdDays: z.number().min(7).max(365),
  warningDays: z.number().min(1).max(30),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  vaultItemSchema,
  beneficiarySchema,
  inactivityRuleSchema,
  changePasswordSchema,
};
