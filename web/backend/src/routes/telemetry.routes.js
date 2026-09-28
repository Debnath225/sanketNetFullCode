import { Router } from "express";

import {
  getTelemetry,
  getNodeTelemetry,
  getLatestTelemetry,
  getNodeHistory,
} from "../controllers/telemetry.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Collection
router.get("/", getTelemetry);

// Specific node sub-resources MUST come first
router.get(
  "/:nodeId/latest",
  getLatestTelemetry
);

router.get(
  "/:nodeId/history",
  getNodeHistory
);

// Generic node telemetry
router.get(
  "/:nodeId",
  getNodeTelemetry
);

export default router;