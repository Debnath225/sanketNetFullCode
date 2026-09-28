const errorMiddleware = (err, req, res, next) => {
  console.error("API ERROR:", {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;

  if (typeof statusCode !== "number" || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyPattern || {})[0] || "field";

    return res.status(409).json({
      success: false,
      message: `${duplicatedField} already exists`,
      code: "DUPLICATE_RESOURCE",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors,
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
      code: "INVALID_ID",
    });
  }

  const response = {
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  };

  if (err.code) {
    response.code = err.code;
  }

  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
