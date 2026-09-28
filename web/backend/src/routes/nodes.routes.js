import { Router } from "express";
import Node from "../models/Node.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { broadcast } from "../services/socket.service.js";
import { validate, createNodeSchema, updateNodeSchema } from "../utils/schemas.js";

const router = Router();

// All node routes require authentication
router.use(authMiddleware);

// GET /api/v1/nodes — list all nodes
router.get("/", async (_req, res, next) => {
  try {
    const nodes = await Node.find({ isEnabled: true }).sort({ nodeId: 1 }).lean();
    res.json({ success: true, data: nodes });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/nodes/:nodeId
router.get("/:nodeId", async (req, res, next) => {
  try {
    const node = await Node.findOne({ nodeId: req.params.nodeId.toUpperCase() }).lean();
    if (!node) return res.status(404).json({ success: false, message: "Node not found" });
    res.json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/nodes — create (admin only)
router.post("/",
  adminMiddleware,
  validate(createNodeSchema),
  async (req, res, next) => {
    try {
      const node = await Node.create(req.body);
      broadcast("node:status", node);
      res.status(201).json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/nodes/:nodeId — update (admin only)
router.patch("/:nodeId",
  adminMiddleware,
  validate(updateNodeSchema),
  async (req, res, next) => {
    try {
      const node = await Node.findOneAndUpdate(
        { nodeId: req.params.nodeId.toUpperCase() },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!node) return res.status(404).json({ success: false, message: "Node not found" });
      broadcast("node:status", node);
      res.json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/nodes/:nodeId — soft delete (admin only)
router.delete("/:nodeId",
  adminMiddleware,
  async (req, res, next) => {
    try {
      const node = await Node.findOneAndUpdate(
        { nodeId: req.params.nodeId.toUpperCase() },
        { $set: { isEnabled: false } },
        { new: true }
      );
      if (!node) return res.status(404).json({ success: false, message: "Node not found" });
      res.json({ success: true, message: "Node disabled" });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/nodes/:nodeId/enable — re-enable (admin only)
router.post("/:nodeId/enable",
  adminMiddleware,
  async (req, res, next) => {
    try {
      const node = await Node.findOneAndUpdate(
        { nodeId: req.params.nodeId.toUpperCase() },
        { $set: { isEnabled: true } },
        { new: true }
      );
      if (!node) return res.status(404).json({ success: false, message: "Node not found" });
      broadcast("node:status", node);
      res.json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  }
);

export default router;