const { ZodError } = require('zod');

module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let payload = { error: 'Internal server error' };

  if (err?.code === 'P2002') {
    status = 409;
    payload = { error: 'Resource already exists' };
  } else if (err?.code === 'P2025') {
    status = 404;
    payload = { error: 'Resource not found' };
  } else if (err instanceof ZodError) {
    status = 400;
    payload = { error: 'Validation failed', details: err.errors };
  } else if (
    err?.name === 'JsonWebTokenError' ||
    err?.name === 'TokenExpiredError' ||
    err?.name === 'NotBeforeError'
  ) {
    status = 401;
    payload = { error: 'Authentication failed' };
  }

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err?.stack;
  }

  res.status(status).json(payload);
};
