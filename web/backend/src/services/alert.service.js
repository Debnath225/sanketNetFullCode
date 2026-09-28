import Alert from "../models/Alert.js";

const createAlert = async ({
  nodeId,
  hazard,
  severity,
  riskScore,
  message,
  telemetryId,
  metadata = {},
}) => {
  const existingAlert = await Alert.findOne({
    nodeId,
    hazard,
    status: "active",
  });

  if (existingAlert) {
    existingAlert.riskScore = riskScore;
    existingAlert.message = message;
    existingAlert.metadata = metadata;
    existingAlert.updatedAt = new Date();

    await existingAlert.save();

    return existingAlert;
  }

  const alert = await Alert.create({
    nodeId,
    hazard,
    severity,
    riskScore,
    message,
    telemetryId,
    metadata,
    status: "active",
    createdAt: new Date(),
  });

  return alert;
};

const getAlerts = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.severity) {
    filter.severity = query.severity;
  }

  if (query.hazard) {
    filter.hazard = query.hazard;
  }

  if (query.nodeId) {
    filter.nodeId = query.nodeId;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

  return Alert.find(filter)
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
};

const getActiveAlerts = async (query = {}) => {
  return getAlerts({
    ...query,
    status: "active",
  });
};

const getAlertHistory = async (query = {}) => {
  const filter = {
    status: {
      $in: ["acknowledged", "resolved"],
    },
  };

  if (query.nodeId) {
    filter.nodeId = query.nodeId;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

  return Alert.find(filter)
    .sort({
      updatedAt: -1,
    })
    .limit(limit)
    .lean();
};

const getAlert = async (alertId) => {
  const alert = await Alert.findById(alertId).lean();

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

const acknowledgeAlert = async (alertId, currentUser, data = {}) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  if (alert.status === "resolved") {
    const error = new Error("Resolved alerts cannot be acknowledged");
    error.statusCode = 400;
    throw error;
  }

  alert.status = "acknowledged";
  alert.acknowledgedAt = new Date();
  alert.acknowledgedBy = currentUser?._id || null;

  if (data.note) {
    alert.acknowledgementNote = data.note;
  }

  await alert.save();

  return alert;
};

const resolveAlert = async (alertId, currentUser, data = {}) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  alert.status = "resolved";
  alert.resolvedAt = new Date();
  alert.resolvedBy = currentUser?._id || null;

  if (data.note) {
    alert.resolutionNote = data.note;
  }

  await alert.save();

  return alert;
};

export default {
  createAlert,
  getAlerts,
  getActiveAlerts,
  getAlertHistory,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
};
