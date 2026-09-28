import Node from "../models/Node.js";
import NetworkEvent from "../models/NetworkEvent.js";

import mqttService from "./mqtt.service.js";

const getNetworkStatus = async () => {
  const nodes = await Node.find()
    .select("nodeId status lastSeenAt gatewayId")
    .lean();

  const onlineNodes = nodes.filter((node) => node.status === "online").length;

  let mqttStatus = {
    connected: false,
  };

  try {
    mqttStatus = mqttService.getStatus();
  } catch {
    mqttStatus = {
      connected: false,
    };
  }

  return {
    gateway: {
      id: "GW-FFFF",
      status: mqttStatus.connected ? "online" : "offline",
    },

    mqtt: mqttStatus,

    nodes: {
      total: nodes.length,
      online: onlineNodes,
      offline: nodes.length - onlineNodes,
    },

    mesh: {
      status: onlineNodes > 0 ? "operational" : "idle",
    },
  };
};

const getNetworkNodes = async () => {
  return Node.find()
    .select(
      "nodeId name role latitude longitude status battery lastSeenAt gatewayId",
    )
    .sort({
      nodeId: 1,
    })
    .lean();
};

const getNetworkLinks = async () => {
  const nodes = await Node.find().select("nodeId gatewayId status").lean();

  const links = [];

  for (const node of nodes) {
    if (node.gatewayId) {
      links.push({
        source: node.nodeId,
        target: node.gatewayId,
        status: node.status === "online" ? "active" : "inactive",
      });
    }
  }

  return links;
};

const getNetworkRoutes = async () => {
  const nodes = await Node.find().select("nodeId gatewayId status").lean();

  return nodes.map((node) => ({
    nodeId: node.nodeId,
    gateway: node.gatewayId || "GW-FFFF",
    route: [node.nodeId, node.gatewayId || "GW-FFFF"],
    status: node.status,
  }));
};

const getNetworkEvents = async (query = {}) => {
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.nodeId) {
    filter.nodeId = query.nodeId;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 1000);

  return NetworkEvent.find(filter)
    .sort({
      timestamp: -1,
    })
    .limit(limit)
    .lean();
};

export default {
  getNetworkStatus,
  getNetworkNodes,
  getNetworkLinks,
  getNetworkRoutes,
  getNetworkEvents,
};
