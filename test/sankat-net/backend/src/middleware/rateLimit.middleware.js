import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
    code: "AUTH_RATE_LIMIT",
  },

  skip: (req) => {
    return (
      process.env.NODE_ENV === "test" ||
      process.env.DISABLE_RATE_LIMIT === "true"
    );
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMIT",
  },

  skip: (req) => {
    return (
      process.env.NODE_ENV === "test" ||
      process.env.DISABLE_RATE_LIMIT === "true"
    );
  },
});
