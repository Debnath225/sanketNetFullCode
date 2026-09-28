import mongoose from "mongoose";

const simulationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Disaster Simulation",
    },

    status: {
      type: String,
      enum: ["IDLE", "RUNNING", "STOPPED", "COMPLETED"],
      default: "IDLE",
      index: true,
    },

    hazardType: {
      type: String,
      enum: [
        "FIRE",
        "FLOOD",
        "LANDSLIDE",
        "SEISMIC",
        "POLLUTION",
      ],
      default: "FIRE",
      index: true,
    },

    originNode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true,
    },

    intensity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    packetHops: {
      type: Number,
      min: 0,
      default: 1,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    stoppedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    affectedNodes: {
      type: [String],
      default: [],
    },

    events: {
      type: [
        {
          nodeId: {
            type: String,
            trim: true,
            uppercase: true,
          },

          hazardType: {
            type: String,
            trim: true,
          },

          intensity: {
            type: Number,
            min: 0,
            max: 100,
          },

          riskScore: {
            type: Number,
            min: 0,
            max: 100,
          },

          timestamp: {
            type: Date,
            default: Date.now,
          },

          metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
        },
      ],
      default: [],
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

simulationSchema.index({ createdAt: -1 });
simulationSchema.index({ status: 1, createdAt: -1 });

const Simulation = mongoose.model("Simulation", simulationSchema);

export default Simulation;