import { get, post, unwrap } from "./client";
export const getSimulationStatus = () => get("/simulation/status").then(unwrap);
export const getSimulationEvents = (query) => get("/simulation/events", query).then(unwrap);
export const startSimulation = (payload) => post("/simulation/start", payload).then(unwrap);
export const stopSimulation = (payload = {}) => post("/simulation/stop", payload).then(unwrap);
export const createSimulationEvent = (payload) => post("/simulation/event", payload).then(unwrap);
export default { getSimulationStatus, getSimulationEvents, startSimulation, stopSimulation, createSimulationEvent };
