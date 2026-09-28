import mongoose from "mongoose";

export const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

export const isValidNodeId = (nodeId) => {
  if (!nodeId || typeof nodeId !== "string") {
    return false;
  }

  return /^[A-Za-z0-9_-]{2,64}$/.test(nodeId);
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128
  );
};

export const isValidLatitude = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
};

export const isValidLongitude = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
};

export const isValidPercentage = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
};

export const isValidRiskScore = (value) => {
  return isValidPercentage(value);
};

export const isValidTimestamp = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

export const validateNodePayload = (payload = {}) => {
  const errors = {};

  if (!isValidNodeId(payload.nodeId)) {
    errors.nodeId = "nodeId must contain 2-64 letters, numbers, _ or -";
  }

  if (payload.latitude !== undefined && !isValidLatitude(payload.latitude)) {
    errors.latitude = "Latitude must be between -90 and 90";
  }

  if (payload.longitude !== undefined && !isValidLongitude(payload.longitude)) {
    errors.longitude = "Longitude must be between -180 and 180";
  }

  if (
    payload.batteryPct !== undefined &&
    payload.batteryPct !== null &&
    !isValidPercentage(payload.batteryPct)
  ) {
    errors.batteryPct = "Battery percentage must be between 0 and 100";
  }

  if (
    payload.txInterval !== undefined &&
    (typeof payload.txInterval !== "number" ||
      !Number.isFinite(payload.txInterval) ||
      payload.txInterval < 1)
  ) {
    errors.txInterval = "TX interval must be a positive number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTelemetryPayload = (payload = {}) => {
  const errors = {};

  if (!isValidNodeId(payload.nodeId)) {
    errors.nodeId = "Valid nodeId is required";
  }

  if (
    payload.temperature_c !== undefined &&
    payload.temperature_c !== null &&
    (typeof payload.temperature_c !== "number" ||
      !Number.isFinite(payload.temperature_c))
  ) {
    errors.temperature_c = "Temperature must be a finite number";
  }

  if (
    payload.humidity_pct !== undefined &&
    payload.humidity_pct !== null &&
    !isValidPercentage(payload.humidity_pct)
  ) {
    errors.humidity_pct = "Humidity must be between 0 and 100";
  }

  if (
    payload.water_level_pct !== undefined &&
    payload.water_level_pct !== null &&
    !isValidPercentage(payload.water_level_pct)
  ) {
    errors.water_level_pct = "Water level must be between 0 and 100";
  }

  if (
    payload.battery_pct !== undefined &&
    payload.battery_pct !== null &&
    !isValidPercentage(payload.battery_pct)
  ) {
    errors.battery_pct = "Battery percentage must be between 0 and 100";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const parsePagination = (query = {}, defaults = {}) => {
  const defaultLimit = defaults.limit || 50;
  const maxLimit = defaults.maxLimit || 200;

  let page = Number.parseInt(query.page, 10);
  let limit = Number.parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }

  if (!Number.isFinite(limit) || limit < 1) {
    limit = defaultLimit;
  }

  limit = Math.min(limit, maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
