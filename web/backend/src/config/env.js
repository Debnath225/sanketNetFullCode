import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sankatnet",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  mqttEnabled: String(process.env.MQTT_ENABLED).toLowerCase() === "true",
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || "",
  mqttUsername: process.env.MQTT_USERNAME || "",
  mqttPassword: process.env.MQTT_PASSWORD || "",
  demoMode: String(process.env.DEMO_MODE ?? "true").toLowerCase() === "true"
};
