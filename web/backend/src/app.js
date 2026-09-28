import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import nodesRoutes from "./routes/nodes.routes.js";
import telemetryRoutes from "./routes/telemetry.routes.js";
import alertsRoutes from "./routes/alerts.routes.js";
import networkRoutes from "./routes/network.routes.js";
import simulationRoutes from "./routes/simulation.routes.js";

const app = express();

app.use(cors({
  origin: [env.clientUrl, env.adminUrl],
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "sankat-net-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/nodes", nodesRoutes);
app.use("/api/v1/telemetry", telemetryRoutes);
app.use("/api/v1/alerts", alertsRoutes);
app.use("/api/v1/network", networkRoutes);
app.use("/api/v1/simulation", simulationRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  
  if (statusCode >= 500) {
    console.error(error);
  } else {
    console.warn(`[${statusCode}] ${error.message}`);
  }

  res.status(statusCode).json({ 
    success: false, 
    message: error.message || "Internal server error" 
  });
});

export default app;