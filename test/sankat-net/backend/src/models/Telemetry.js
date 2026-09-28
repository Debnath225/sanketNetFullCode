import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    temperatureC: {
      type: Number,
      default: null,
    },

    humidityPct: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    pressureHpa: {
      type: Number,
      default: null,
    },

    gasVoltage: {
      type: Number,
      default: null,
    },

    mq2: {
      type: Number,
      default: null,
    },

    mq135: {
      type: Number,
      default: null,
    },

    waterLevelPct: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    soilMoisturePct: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    soilTemperatureC: {
      type: Number,
      default: null,
    },

    rainfallMm: {
      type: Number,
      min: 0,
      default: null,
    },

    windSpeed: {
      type: Number,
      min: 0,
      default: null,
    },

    windDirection: {
      type: Number,
      min: 0,
      max: 360,
      default: null,
    },

    turbidity: {
      type: Number,
      min: 0,
      default: null,
    },

    ph: {
      type: Number,
      default: null,
    },

    tds: {
      type: Number,
      min: 0,
      default: null,
    },

    accelX: {
      type: Number,
      default: null,
    },

    accelY: {
      type: Number,
      default: null,
    },

    accelZ: {
      type: Number,
      default: null,
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

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },

    elevation: {
      type: Number,
      default: null,
    },

    slope: {
      type: Number,
      min: 0,
      default: null,
    },

    vegetation: {
      type: Number,
      default: null,
    },

    soilSaturation: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },

    hazard: {
      type: String,
      enum: [
        "NORMAL",
        "FIRE",
        "FLOOD",
        "LANDSLIDE",
        "SEISMIC",
        "POLLUTION",
        "WATER_QUALITY",
        "MULTI_HAZARD",
        "UNKNOWN",
      ],
      default: "NORMAL",
      index: true,
    },

    hazards: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: ["mqtt", "simulation", "api", "gateway"],
      default: "mqtt",
      index: true,
    },

    packetId: {
      type: String,
      default: null,
      index: true,
    },

    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

telemetrySchema.index({ nodeId: 1, timestamp: -1 });
telemetrySchema.index({ hazard: 1, timestamp: -1 });
telemetrySchema.index({ riskScore: -1, timestamp: -1 });

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;