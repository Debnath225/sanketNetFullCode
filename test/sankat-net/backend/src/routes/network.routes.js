import { Router } from "express";

import {
  getNetworkStatus,
  getNetworkNodes,
  getNetworkLinks,
  getNetworkRoutes,
  getNetworkEvents,
} from "../controllers/network.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/status",
  getNetworkStatus
);

router.get(
  "/nodes",
  getNetworkNodes
);

router.get(
  "/links",
  getNetworkLinks
);

router.get(
  "/routes",
  getNetworkRoutes
);

router.get(
  "/events",
  getNetworkEvents
);

export default router;