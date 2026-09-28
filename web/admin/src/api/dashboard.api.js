import { get, unwrap } from "./client";
export const getSummary = (query) => get("/dashboard/summary", query).then(unwrap);
export const getLatest = (query) => get("/dashboard/latest", query).then(unwrap);
export const getActivity = (query) => get("/dashboard/activity", query).then(unwrap);
export const getHazards = (query) => get("/dashboard/hazards", query).then(unwrap);
export default { getSummary, getLatest, getActivity, getHazards };
