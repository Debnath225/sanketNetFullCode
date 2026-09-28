import { get, post, setAccessToken, clearAccessToken, unwrap } from "./client";

export async function register(payload) {
  const response = await post("/auth/register", payload);
  const data = unwrap(response);
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function login(payload) {
  const response = await post("/auth/login", payload);
  const data = unwrap(response);
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  try { return unwrap(await post("/auth/logout")); }
  finally { clearAccessToken(); }
}

export async function getMe() { return unwrap(await get("/auth/me")); }

export async function refresh() {
  const data = unwrap(await post("/auth/refresh"));
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export default { register, login, logout, getMe, refresh };
