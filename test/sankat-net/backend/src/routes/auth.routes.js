import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";
import { validate, registerSchema, loginSchema, refreshTokenSchema } from "../utils/schemas.js";

const router = Router();

// Public — rate limited
router.post("/register",
  authRateLimit,
  validate(registerSchema),
  authController.register
);

router.post("/login",
  authRateLimit,
  validate(loginSchema),
  authController.login
);

router.post("/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Protected
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;