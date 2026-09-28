import { Router } from "express";

import {
  getSummary,
  getLatest,
  getActivity,
  getHazards,
} from "../controllers/dashboard.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/summary", authMiddleware, getSummary);

router.get("/latest", authMiddleware, getLatest);

router.get("/activity", authMiddleware, getActivity);

router.get("/hazards", authMiddleware, getHazards);

export default router;