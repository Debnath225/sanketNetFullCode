const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "sankatnet_access_token";

export const getApiUrl = () => API_URL;
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAccessToken = () => localStorage.removeItem(TOKEN_KEY);

const buildUrl = (path, query) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_URL}${normalized}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export async function apiRequest(path, options = {}) {
  const { query, body, headers = {}, ...rest } = options;
  const token = getAccessToken();
  const requestHeaders = { Accept: "application/json", ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || `API request failed with status ${response.status}`);
    error.status = response.status;
    error.code = payload?.code;
    error.data = payload;
    if (response.status === 401) clearAccessToken();
    throw error;
  }

  return payload;
}

export const get = (path, query) => apiRequest(path, { method: "GET", query });
export const post = (path, body, query) => apiRequest(path, { method: "POST", body, query });
export const patch = (path, body, query) => apiRequest(path, { method: "PATCH", body, query });
export const del = (path, query) => apiRequest(path, { method: "DELETE", query });

export const unwrap = (response) => response?.data ?? response;

export default { apiRequest, get, post, patch, del, unwrap, getApiUrl, getAccessToken, setAccessToken, clearAccessToken };
