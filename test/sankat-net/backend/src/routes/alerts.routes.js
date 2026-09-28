import { Router } from "express";

import {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
  getActiveAlerts,
  getAlertHistory,
} from "../controllers/alert.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Specific routes first
router.get(
  "/active",
  getActiveAlerts
);

router.get(
  "/history",
  getAlertHistory
);

router.get(
  "/",
  getAlerts
);

router.get(
  "/:alertId",
  getAlert
);

router.post(
  "/:alertId/acknowledge",
  acknowledgeAlert
);

router.post(
  "/:alertId/resolve",
  resolveAlert
);

export default router;