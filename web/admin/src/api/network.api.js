import { get, unwrap } from "./client";
export const getNetworkStatus = () => get("/network/status").then(unwrap);
export const getNetworkNodes = (query) => get("/network/nodes", query).then(unwrap);
export const getNetworkLinks = (query) => get("/network/links", query).then(unwrap);
export const getNetworkRoutes = (query) => get("/network/routes", query).then(unwrap);
export const getNetworkEvents = (query) => get("/network/events", query).then(unwrap);
export default { getNetworkStatus, getNetworkNodes, getNetworkLinks, getNetworkRoutes, getNetworkEvents };
