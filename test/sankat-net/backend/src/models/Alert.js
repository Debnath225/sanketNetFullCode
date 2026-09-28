import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "FIRE",
        "FLOOD",
        "LANDSLIDE",
        "SEISMIC",
        "POLLUTION",
        "WATER_QUALITY",
        "MULTI_HAZARD",
        "SYSTEM",
        "NETWORK",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"],
      default: "ACTIVE",
      index: true,
    },

    source: {
      type: String,
      enum: ["sensor", "ai", "simulation", "system", "network"],
      default: "sensor",
      index: true,
    },

    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    telemetryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Telemetry",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ status: 1, triggeredAt: -1 });
alertSchema.index({ nodeId: 1, triggeredAt: -1 });
alertSchema.index({ severity: 1, status: 1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;