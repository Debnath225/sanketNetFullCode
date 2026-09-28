import Telemetry from "../models/Telemetry.js";
import Node from "../models/Node.js";

import hazardService from "./hazard.service.js";
import alertService from "./alert.service.js";
import { broadcast } from "./socket.service.js";

const normalizeTelemetry = (data) => {
  return {
    nodeId: data.nodeId,

    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),

    temperature: data.temperature ?? data.temperature_c ?? null,

    humidity: data.humidity ?? data.humidity_pct ?? null,

    pressure: data.pressure ?? data.pressure_hpa ?? null,

    gasVoltage: data.gasVoltage ?? data.gas_voltage ?? null,

    mq2: data.mq2 ?? data.mq2_value ?? null,

    mq135: data.mq135 ?? data.mq135_value ?? null,

    waterLevel: data.waterLevel ?? data.water_level_pct ?? null,

    soilMoisture: data.soilMoisture ?? data.soil_moisture ?? null,

    soilTemperature: data.soilTemperature ?? data.soil_temp ?? null,

    rainfall: data.rainfall ?? null,

    slope: data.slope ?? null,

    vegetation: data.vegetation ?? null,

    elevation: data.elevation ?? null,

    soilSaturation: data.soilSaturation ?? data.soil_sat ?? null,

    accelX: data.accelX ?? data.accel_x ?? null,

    accelY: data.accelY ?? data.accel_y ?? null,

    accelZ: data.accelZ ?? data.accel_z ?? null,

    battery: data.battery ?? data.battery_pct ?? null,

    batteryVoltage: data.batteryVoltage ?? data.battery_volts ?? null,

    latitude: data.latitude ?? null,

    longitude: data.longitude ?? null,

    raw: data,
  };
};

const getTelemetry = async (query = {}) => {
  const filter = {};

  if (query.nodeId) {
    filter.nodeId = query.nodeId;
  }

  if (query.from || query.to) {
    filter.timestamp = {};

    if (query.from) {
      filter.timestamp.$gte = new Date(query.from);
    }

    if (query.to) {
      filter.timestamp.$lte = new Date(query.to);
    }
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

  return Telemetry.find(filter)
    .sort({
      timestamp: -1,
    })
    .limit(limit)
    .lean();
};

const ingestTelemetry = async (data) => {
  if (!data || !data.nodeId) {
    const error = new Error("nodeId is required");
    error.statusCode = 400;
    throw error;
  }

  // Auto-register the node if it doesn't exist yet
  let node = await Node.findOne({ nodeId: data.nodeId });

  if (!node) {
    node = await Node.create({
      nodeId: data.nodeId,
      name: data.nodeId,
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      role: "generic",
      isOnline: true,
    });
    console.log(`Auto-registered new node: ${data.nodeId}`);
  }

  const normalized = normalizeTelemetry(data);

  const hazardResult = await hazardService.detectHazards(normalized);

  normalized.riskScore = hazardResult.riskScore;
  normalized.hazard = hazardResult.primaryHazard;
  normalized.hazards = hazardResult.hazards;

  const telemetry = await Telemetry.create(normalized);

  await Node.findOneAndUpdate(
    {
      nodeId: data.nodeId,
    },
    {
      $set: {
        isOnline: true,
        lastSeenAt: telemetry.timestamp,
        lastTelemetryAt: telemetry.timestamp,
        ...(normalized.battery !== null ? { batteryPct: normalized.battery } : {}),
        ...(normalized.batteryVoltage !== null ? { batteryVolts: normalized.batteryVoltage } : {}),
      },
    },
  );

  if (hazardResult.alert) {
    await alertService.createAlert({
      nodeId: data.nodeId,
      hazard: hazardResult.primaryHazard,
      severity: hazardResult.severity,
      riskScore: hazardResult.riskScore,
      message: hazardResult.message,
      telemetryId: telemetry._id,
      metadata: hazardResult.metadata,
    });
  }

  broadcast("telemetry:new", { telemetry, hazard: hazardResult });

  return {
    telemetry,
    hazard: hazardResult,
  };
};

const getLatestTelemetry = async (nodeId) => {
  const telemetry = await Telemetry.findOne({
    nodeId,
  })
    .sort({
      timestamp: -1,
    })
    .lean();

  if (!telemetry) {
    const error = new Error("No telemetry found for this node");
    error.statusCode = 404;
    throw error;
  }

  return telemetry;
};

const getNodeHistory = async (nodeId, query = {}) => {
  const filter = {
    nodeId,
  };

  if (query.from || query.to) {
    filter.timestamp = {};

    if (query.from) {
      filter.timestamp.$gte = new Date(query.from);
    }

    if (query.to) {
      filter.timestamp.$lte = new Date(query.to);
    }
  }

  const limit = Math.min(Math.max(Number(query.limit) || 500, 1), 5000);

  return Telemetry.find(filter)
    .sort({
      timestamp: 1,
    })
    .limit(limit)
    .lean();
};

const getNodeTelemetry = async (nodeId, query = {}) => {
  return getNodeHistory(nodeId, query);
};

export default {
  normalizeTelemetry,
  getTelemetry,
  ingestTelemetry,
  getLatestTelemetry,
  getNodeHistory,
  getNodeTelemetry,
};
