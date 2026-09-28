import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: [
        "fire_pollution",
        "flood_soil",
        "seismic_environment",
        "water_quality",
        "gateway",
        "generic",
      ],
      default: "generic",
      index: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    batteryPct: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    batteryVolts: {
      type: Number,
      min: 0,
      default: null,
    },

    txInterval: {
      type: Number,
      min: 1,
      default: 60,
    },

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastSeenAt: {
      type: Date,
      default: null,
      index: true,
    },

    lastTelemetryAt: {
      type: Date,
      default: null,
    },

    lastHazard: {
      type: String,
      default: "NORMAL",
      index: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    gatewayId: {
      type: String,
      trim: true,
      default: "GW-FFFF",
      index: true,
    },

    firmwareVersion: {
      type: String,
      default: null,
    },

    hardwareVersion: {
      type: String,
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

nodeSchema.index({ latitude: 1, longitude: 1 });
nodeSchema.index({ isOnline: 1, isEnabled: 1 });
nodeSchema.index({ lastSeenAt: -1 });

const Node = mongoose.model("Node", nodeSchema);

export default Node;