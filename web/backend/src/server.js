import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./services/socket.service.js";
import mqttService from "./services/mqtt.service.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [env.clientUrl, env.adminUrl],
    credentials: true
  }
});

initSocket(io);

async function bootstrap() {
  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    if (!env.demoMode) {
      process.exit(1);
    }
  }

  if (env.mqttEnabled && env.mqttBrokerUrl) {
    mqttService.connect();
    console.log(`MQTT connecting to: ${env.mqttBrokerUrl}`);
  } else {
    console.log("MQTT disabled or broker URL not set — skipping MQTT connection");
  }

  server.listen(env.port, () => {
    console.log(`Sankat-Net backend: http://localhost:${env.port}`);
  });
}

bootstrap();