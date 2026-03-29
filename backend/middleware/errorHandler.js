const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);

  const status = err.status || err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}

module.exports = { errorHandler, AppError };
