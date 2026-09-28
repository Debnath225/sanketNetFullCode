import Simulation from "../models/Simulation.js";
import Telemetry from "../models/Telemetry.js";

import hazardService from "./hazard.service.js";
import alertService from "./alert.service.js";

const getSimulationStatus = async () => {
  const simulation = await Simulation.findOne({
    status: "running",
  })
    .sort({
      startedAt: -1,
    })
    .lean();

  if (!simulation) {
    return {
      running: false,
      simulation: null,
    };
  }

  return {
    running: true,
    simulation,
  };
};

const startSimulation = async (data = {}, currentUser) => {
  const running = await Simulation.findOne({
    status: "running",
  });

  if (running) {
    const error = new Error("A simulation is already running");
    error.statusCode = 409;
    throw error;
  }

  const simulation = await Simulation.create({
    name: data.name || "Sankat-Net Disaster Simulation",
    type: data.type || "custom",
    status: "running",

    originNode: data.originNode || data.nodeId || null,

    intensity: Number(data.intensity) || 50,

    packetHops: Number(data.packetHops) || 1,

    startedAt: new Date(),

    startedBy: currentUser?._id || null,

    configuration: data,
  });

  return simulation;
};

const stopSimulation = async (currentUser) => {
  const simulation = await Simulation.findOne({
    status: "running",
  }).sort({
    startedAt: -1,
  });

  if (!simulation) {
    const error = new Error("No running simulation found");
    error.statusCode = 404;
    throw error;
  }

  simulation.status = "completed";
  simulation.completedAt = new Date();
  simulation.completedBy = currentUser?._id || null;

  await simulation.save();

  return simulation;
};

const createSimulationEvent = async (data, currentUser) => {
  if (!data || !data.hazard) {
    const error = new Error("Simulation hazard is required");
    error.statusCode = 400;
    throw error;
  }

  const simulation = await Simulation.findOne({
    status: "running",
  }).sort({
    startedAt: -1,
  });

  if (!simulation) {
    const error = new Error("Start a simulation before creating events");
    error.statusCode = 400;
    throw error;
  }

  const telemetryData = {
    nodeId: data.nodeId || simulation.originNode,

    timestamp: new Date(),

    temperature: data.temperature ?? null,

    humidity: data.humidity ?? null,

    pressure: data.pressure ?? null,

    rainfall: data.rainfall ?? null,

    waterLevel: data.waterLevel ?? data.water_level_pct ?? null,

    soilMoisture: data.soilMoisture ?? data.soil_moisture ?? null,

    slope: data.slope ?? null,

    vegetation: data.vegetation ?? null,

    elevation: data.elevation ?? null,

    soilSaturation: data.soilSaturation ?? data.soil_sat ?? null,

    mq2: data.mq2 ?? null,

    mq135: data.mq135 ?? null,

    simulated: true,
  };

  const hazardResult = await hazardService.detectHazards(telemetryData);

  const telemetry = await Telemetry.create({
    ...telemetryData,
    riskScore: hazardResult.riskScore,
    hazard: hazardResult.primaryHazard,
    hazards: hazardResult.hazards,
    simulationId: simulation._id,
  });

  simulation.events = simulation.events || [];

  simulation.events.push({
    hazard: data.hazard,
    intensity: Number(data.intensity) || simulation.intensity,
    nodeId: telemetryData.nodeId,
    telemetryId: telemetry._id,
    timestamp: new Date(),
  });

  await simulation.save();

  if (hazardResult.alert) {
    await alertService.createAlert({
      nodeId: telemetryData.nodeId,
      hazard: hazardResult.primaryHazard,
      severity: hazardResult.severity,
      riskScore: hazardResult.riskScore,
      message: hazardResult.message || `Simulated ${data.hazard} event`,
      telemetryId: telemetry._id,
      metadata: {
        simulationId: simulation._id,
        simulated: true,
        createdBy: currentUser?._id || null,
      },
    });
  }

  return {
    simulationId: simulation._id,
    telemetry,
    hazard: hazardResult,
  };
};

const getSimulationEvents = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

  const simulations = await Simulation.find(filter)
    .sort({
      startedAt: -1,
    })
    .limit(limit)
    .lean();

  return simulations;
};

export default {
  getSimulationStatus,
  startSimulation,
  stopSimulation,
  createSimulationEvent,
  getSimulationEvents,
};
