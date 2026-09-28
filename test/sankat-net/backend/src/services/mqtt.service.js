import mqtt from "mqtt";

import { env } from "../config/env.js";

import telemetryService from "./telemetry.service.js";

let client = null;

let state = {
  connected: false,
  connecting: false,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  lastError: null,
};

export const getStatus = () => {
  return {
    ...state,
  };
};

export const buildClientOptions = () => {
  const options = {
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true,
  };

  if (env.mqttUsername) {
    options.username = env.mqttUsername;
  }

  if (env.mqttPassword) {
    options.password = env.mqttPassword;
  }

  return options;
};

export const handleMessage = async (topic, buffer) => {
  try {
    const payloadText = buffer.toString("utf8");

    let payload;

    try {
      payload = JSON.parse(payloadText);
      console.log(payload);
    } catch {
      console.error(`MQTT message on ${topic} is not valid JSON`);
      return;
    }

    const parts = topic.split("/");

    /*
     * Expected:
     *
     * sankatnet/telemetry/NODE-01
     */
    if (parts[0] !== "sankatnet" || parts[1] !== "telemetry") {
      return;
    }

    const nodeId = payload.nodeId || parts[2];

    if (!nodeId) {
      console.error("MQTT telemetry received without nodeId");
      return;
    }

    await telemetryService.ingestTelemetry({
      ...payload,
      nodeId,
    });
  } catch (error) {
    console.error("MQTT message processing error:", error);
  }
};

export const connect = () => {
  if (client && client.connected) {
    return client;
  }

  if (!env.mqttBrokerUrl) {
    console.warn("MQTT_BROKER_URL is not configured");

    return null;
  }

  state.connecting = true;

  client = mqtt.connect(env.mqttBrokerUrl, buildClientOptions());

  client.on("connect", () => {
    state.connected = true;
    state.connecting = false;
    state.lastConnectedAt = new Date();
    state.lastError = null;

    console.log("MQTT connected:", env.mqttBrokerUrl);

    client.subscribe(
      "sankatnet/telemetry/+",
      {
        qos: 1,
      },
      (error) => {
        if (error) {
          console.error("MQTT subscription error:", error);
          return;
        }

        console.log("Subscribed to sankatnet/telemetry/+");
      },
    );
  });

  client.on("message", handleMessage);

  client.on("reconnect", () => {
    state.connecting = true;
    console.log("MQTT reconnecting...");
  });

  client.on("close", () => {
    state.connected = false;
    state.connecting = false;
    state.lastDisconnectedAt = new Date();

    console.log("MQTT disconnected");
  });

  client.on("error", (error) => {
    state.lastError = error.message;

    console.error("MQTT error:", error.message);
  });

  return client;
};

export const disconnect = () => {
  if (!client) {
    return;
  }

  client.end(true);

  client = null;

  state.connected = false;
  state.connecting = false;
};

export const publish = (topic, payload, options = {}) => {
  if (!client || !client.connected) {
    const error = new Error("MQTT client is not connected");
    error.statusCode = 503;
    throw error;
  }

  const message =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  client.publish(topic, message, {
    qos: options.qos ?? 1,
    retain: options.retain ?? false,
  });

  return {
    published: true,
    topic,
  };
};

export const publishCommand = (nodeId, command, data = {}) => {
  if (!nodeId) {
    const error = new Error("nodeId is required");
    error.statusCode = 400;
    throw error;
  }

  return publish(`sankatnet/command/${nodeId}`, {
    command,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export default {
  connect,
  disconnect,
  publish,
  publishCommand,
  getStatus,
};
