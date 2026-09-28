export const successResponse = (
  res,
  data = null,
  message = "Request successful",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const createdResponse = (
  res,
  data = null,
  message = "Resource created successfully",
) => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Request failed",
  statusCode = 400,
  code = null,
  errors = null,
) => {
  const response = {
    success: false,
    message,
  };

  if (code) {
    response.code = code;
  }

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404, "NOT_FOUND");
};

export const unauthorizedResponse = (
  res,
  message = "Authentication required",
) => {
  return errorResponse(res, message, 401, "UNAUTHORIZED");
};

export const forbiddenResponse = (res, message = "Access denied") => {
  return errorResponse(res, message, 403, "FORBIDDEN");
};

export default {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
