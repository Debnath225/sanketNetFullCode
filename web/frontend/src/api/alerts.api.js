import { get, post, unwrap } from "./client";
export const getAlerts = (query) => get("/alerts", query).then(unwrap);
export const getAlert = (alertId) => get(`/alerts/${encodeURIComponent(alertId)}`).then(unwrap);
export const getActiveAlerts = (query) => get("/alerts/active", query).then(unwrap);
export const getAlertHistory = (query) => get("/alerts/history", query).then(unwrap);
export const acknowledgeAlert = (alertId, payload = {}) => post(`/alerts/${encodeURIComponent(alertId)}/acknowledge`, payload).then(unwrap);
export const resolveAlert = (alertId, payload = {}) => post(`/alerts/${encodeURIComponent(alertId)}/resolve`, payload).then(unwrap);
export default { getAlerts, getAlert, getActiveAlerts, getAlertHistory, acknowledgeAlert, resolveAlert };
