import { get, post, patch, del, unwrap } from "./client";
export const getNodes = (query) => get("/nodes", query).then(unwrap);
export const getNode = (nodeId) => get(`/nodes/${encodeURIComponent(nodeId)}`).then(unwrap);
export const createNode = (payload) => post("/nodes", payload).then(unwrap);
export const updateNode = (nodeId, payload) => patch(`/nodes/${encodeURIComponent(nodeId)}`, payload).then(unwrap);
export const deleteNode = (nodeId) => del(`/nodes/${encodeURIComponent(nodeId)}`).then(unwrap);
export const enableNode = (nodeId) => post(`/nodes/${encodeURIComponent(nodeId)}/enable`).then(unwrap);
export const disableNode = (nodeId) => post(`/nodes/${encodeURIComponent(nodeId)}/disable`).then(unwrap);
export default { getNodes, getNode, createNode, updateNode, deleteNode, enableNode, disableNode };
