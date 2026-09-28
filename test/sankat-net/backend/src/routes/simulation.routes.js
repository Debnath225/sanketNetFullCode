import { Router } from "express";

import {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  createSimulationEvent,
  getSimulationEvents,
} from "../controllers/simulation.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/status",
  getSimulationStatus
);

router.get(
  "/events",
  getSimulationEvents
);

router.post(
  "/start",
  adminMiddleware,
  startSimulation
);

router.post(
  "/stop",
  adminMiddleware,
  stopSimulation
);

router.post(
  "/event",
  adminMiddleware,
  createSimulationEvent
);

export default router;