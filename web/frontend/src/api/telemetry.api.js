import { get, unwrap } from "./client";
export const getTelemetry = (query) => get("/telemetry", query).then(unwrap);
export const getNodeTelemetry = (nodeId, query) => get(`/telemetry/${encodeURIComponent(nodeId)}`, query).then(unwrap);
export const getLatestTelemetry = (nodeId) => get(`/telemetry/${encodeURIComponent(nodeId)}/latest`).then(unwrap);
export const getTelemetryHistory = (nodeId, query) => get(`/telemetry/${encodeURIComponent(nodeId)}/history`, query).then(unwrap);
export default { getTelemetry, getNodeTelemetry, getLatestTelemetry, getTelemetryHistory };
