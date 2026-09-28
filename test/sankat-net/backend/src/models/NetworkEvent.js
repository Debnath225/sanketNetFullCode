import mongoose from "mongoose";

const networkEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        "NODE_ONLINE",
        "NODE_OFFLINE",
        "NODE_ADDED",
        "NODE_REMOVED",
        "PACKET_RECEIVED",
        "PACKET_DROPPED",
        "PACKET_FORWARDED",
        "ROUTE_CHANGED",
        "GATEWAY_ONLINE",
        "GATEWAY_OFFLINE",
        "MQTT_CONNECTED",
        "MQTT_DISCONNECTED",
        "AUTH_FAILURE",
        "DECRYPTION_FAILURE",
        "SYSTEM",
      ],
      required: true,
      index: true,
    },

    nodeId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true,
    },

    gatewayId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true,
    },

    sourceNode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    destinationNode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING", "INFO"],
      default: "INFO",
      index: true,
    },

    packetId: {
      type: String,
      default: null,
      index: true,
    },

    hopCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    latencyMs: {
      type: Number,
      min: 0,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

networkEventSchema.index({ timestamp: -1 });
networkEventSchema.index({ nodeId: 1, timestamp: -1 });
networkEventSchema.index({ eventType: 1, timestamp: -1 });

const NetworkEvent = mongoose.model(
  "NetworkEvent",
  networkEventSchema
);

export default NetworkEvent;