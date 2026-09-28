import Node from "../models/Node.js";
import Telemetry from "../models/Telemetry.js";
import Alert from "../models/Alert.js";
import NetworkEvent from "../models/NetworkEvent.js";

const getSummary = async () => {
  const [totalNodes, activeNodes, activeAlerts, telemetryCount] =
    await Promise.all([
      Node.countDocuments(),
      Node.countDocuments({
        status: "online",
      }),
      Alert.countDocuments({
        status: "active",
      }),
      Telemetry.countDocuments(),
    ]);

  const riskResult = await Telemetry.aggregate([
    {
      $match: {
        riskScore: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: null,
        averageRisk: {
          $avg: "$riskScore",
        },
      },
    },
  ]);

  const averageRisk =
    riskResult.length > 0 ? Number(riskResult[0].averageRisk.toFixed(2)) : 0;

  return {
    fieldNodes: totalNodes,
    activeNodes,
    packetsReceived: telemetryCount,
    activeAlerts,
    averageRisk,
  };
};

const getLatest = async () => {
  const telemetry = await Telemetry.find()
    .sort({
      timestamp: -1,
    })
    .limit(20)
    .lean();

  return telemetry;
};

const getActivity = async (query = {}) => {
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const events = await NetworkEvent.find()
    .sort({
      timestamp: -1,
    })
    .limit(limit)
    .lean();

  return events;
};

const getHazards = async (query = {}) => {
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const alerts = await Alert.find()
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return alerts;
};

export default {
  getSummary,
  getLatest,
  getActivity,
  getHazards,
};
