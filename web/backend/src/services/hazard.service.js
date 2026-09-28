const clamp = (value, min, max) => {
  return Math.min(Math.max(Number(value) || 0, min), max);
};

const normalize = (value, min, max) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return clamp(((Number(value) - min) / (max - min)) * 100, 0, 100);
};

const detectFireRisk = (data) => {
  const temperature = Number(data.temperature ?? 0);

  const humidity = Number(data.humidity ?? 0);

  const gas = Number(data.mq2 ?? data.gasVoltage ?? 0);

  const vegetation = Number(data.vegetation ?? 0);

  /*
   * Do not interpret a missing temperature
   * as extreme heat.
   */
  if (data.temperature === null || data.temperature === undefined) {
    return 0;
  }

  let score = 0;

  score += normalize(temperature, 20, 50) * 0.45;

  score += (100 - clamp(humidity, 0, 100)) * 0.25;

  score += normalize(gas, 0, 5) * 0.2;

  score += normalize(vegetation, 0, 100) * 0.1;

  return clamp(score, 0, 100);
};

const detectFloodRisk = (data) => {
  const waterLevel = Number(data.waterLevel ?? 0);

  const rainfall = Number(data.rainfall ?? 0);

  const humidity = Number(data.humidity ?? 0);

  let score = 0;

  score += normalize(waterLevel, 0, 100) * 0.55;

  score += normalize(rainfall, 0, 200) * 0.3;

  score += normalize(humidity, 40, 100) * 0.15;

  return clamp(score, 0, 100);
};

const detectLandslideRisk = (data) => {
  const slope = Number(data.slope ?? 0);

  const soilSaturation = Number(data.soilSaturation ?? 0);

  const rainfall = Number(data.rainfall ?? 0);

  const vibration =
    Math.abs(Number(data.accelX ?? 0)) +
    Math.abs(Number(data.accelY ?? 0)) +
    Math.abs(Number(data.accelZ ?? 0));

  let score = 0;

  score += normalize(slope, 0, 60) * 0.3;

  score += normalize(soilSaturation, 0, 100) * 0.3;

  score += normalize(rainfall, 0, 200) * 0.25;

  score += normalize(vibration, 0, 5) * 0.15;

  return clamp(score, 0, 100);
};

const detectPollutionRisk = (data) => {
  const mq2 = Number(data.mq2 ?? 0);

  const mq135 = Number(data.mq135 ?? 0);

  const gasVoltage = Number(data.gasVoltage ?? 0);

  let score = 0;

  score += normalize(mq2, 0, 1000) * 0.35;

  score += normalize(mq135, 0, 1000) * 0.45;

  score += normalize(gasVoltage, 0, 5) * 0.2;

  return clamp(score, 0, 100);
};

const detectHazards = async (data) => {
  const fireRisk = detectFireRisk(data);
  const floodRisk = detectFloodRisk(data);
  const landslideRisk = detectLandslideRisk(data);
  const pollutionRisk = detectPollutionRisk(data);

  const hazards = [
    {
      type: "fire",
      score: Number(fireRisk.toFixed(2)),
    },
    {
      type: "flood",
      score: Number(floodRisk.toFixed(2)),
    },
    {
      type: "landslide",
      score: Number(landslideRisk.toFixed(2)),
    },
    {
      type: "pollution",
      score: Number(pollutionRisk.toFixed(2)),
    },
  ];

  hazards.sort((a, b) => b.score - a.score);

  const primary = hazards[0];

  let severity = "normal";

  if (primary.score >= 80) {
    severity = "critical";
  } else if (primary.score >= 60) {
    severity = "high";
  } else if (primary.score >= 35) {
    severity = "medium";
  } else if (primary.score >= 15) {
    severity = "low";
  }

  const alert = primary.score >= 60;

  // Map to uppercase enum values used by the Telemetry model
  const hazardEnumMap = {
    fire: "FIRE",
    flood: "FLOOD",
    landslide: "LANDSLIDE",
    pollution: "POLLUTION",
  };

  const primaryHazard = primary.score >= 15
    ? (hazardEnumMap[primary.type] || "UNKNOWN")
    : "NORMAL";

  // Store hazards as sorted string names (schema is [String])
  const hazardStrings = hazards
    .filter(h => h.score >= 10)
    .map(h => hazardEnumMap[h.type] || h.type.toUpperCase());

  const hazardNames = {
    fire: "Forest Fire",
    flood: "Flood",
    landslide: "Landslide",
    pollution: "Pollution",
  };

  return {
    riskScore: Number(primary.score.toFixed(2)),

    primaryHazard,

    severity,

    alert,

    hazards: hazardStrings,

    message: alert
      ? `${hazardNames[primary.type]} risk detected`
      : "Environmental conditions normal",

    metadata: {
      fireRisk,
      floodRisk,
      landslideRisk,
      pollutionRisk,
      scores: hazards,
    },
  };
};

export default {
  detectHazards,
  detectFireRisk,
  detectFloodRisk,
  detectLandslideRisk,
  detectPollutionRisk,
};
