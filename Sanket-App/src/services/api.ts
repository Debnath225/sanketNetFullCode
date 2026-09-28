import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Base URL resolution
// ---------------------------------------------------------------------------
// Android emulators can't reach the host's localhost, so we map to 10.0.2.2.
// On web / iOS simulator, localhost works fine.  For physical devices on the
// same WiFi, the user should override this via the Settings screen.
// ---------------------------------------------------------------------------

const DEFAULT_HOST =
  Platform.OS === 'android' ? process.env.EXPO_PUBLIC_BACKEND_URL : 'localhost';
const DEFAULT_PORT = process.env.EXPO_PUBLIC_BACKEND_PORT || 3000;

let _baseUrl = `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
let _wsUrl = `ws://${DEFAULT_HOST}:${DEFAULT_PORT}`;
let _authToken: string | null = null;

// ---------------------------------------------------------------------------
// Runtime config helpers (called from Settings / SanketContext)
// ---------------------------------------------------------------------------

export function setBaseUrl(url: string) {
  // Strip trailing slash
  _baseUrl = url.replace(/\/+$/, '');
  // Derive WS URL from HTTP URL
  _wsUrl = _baseUrl.replace(/^http/, 'ws');
}

export function getBaseUrl() {
  return _baseUrl;
}

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken() {
  return _authToken;
}

let _onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: (() => void) | null) {
  _onUnauthorized = cb;
}

interface ApiError {
  error: string;
  status: number;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${_baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 && _onUnauthorized && path !== '/api/auth/login') {
      _onUnauthorized();
    }
    let body: Record<string, unknown> = {};
    try {
      body = await response.json();
    } catch {
      /* non-JSON error body */
    }
    const err: ApiError = {
      error: (body.error as string) || `HTTP ${response.status}`,
      status: response.status,
    };
    throw err;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth endpoints (public – no token needed)
// ---------------------------------------------------------------------------

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    username: string;
    role: 'ADMIN' | 'USER';
  };
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const saved = _authToken;
  _authToken = null; // don't send stale token on login
  try {
    const result = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    _authToken = result.token;
    return result;
  } catch (err) {
    _authToken = saved;
    throw err;
  }
}

export async function register(
  username: string,
  password: string,
  accountType: 'USER' | 'ADMIN' = 'USER',
  adminCode?: string,
): Promise<AuthResponse> {
  const saved = _authToken;
  _authToken = null;
  try {
    const result = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, accountType, adminCode }),
    });
    _authToken = result.token;
    return result;
  } catch (err) {
    _authToken = saved;
    throw err;
  }
}

export async function validateToken(): Promise<{
  user: {
    username: string;
    role: 'ADMIN' | 'USER';
    active: boolean;
  };
}> {
  return apiFetch<{
    user: {
      username: string;
      role: 'ADMIN' | 'USER';
      active: boolean;
    };
  }>('/api/auth/me');
}

export interface AccountResponse {
  user: { username: string; role: 'ADMIN' | 'USER'; createdAt?: string | null };
  token?: string;
  expiresAt?: string;
  usernameChanged?: boolean;
}

export async function updateAccount(input: {
  username?: string;
  currentPassword: string;
  newPassword?: string;
}): Promise<AccountResponse> {
  const result = await apiFetch<AccountResponse>('/api/account', {
    method: 'PATCH', body: JSON.stringify(input),
  });
  if (result.token) _authToken = result.token;
  return result;
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch(`${_baseUrl}/api/account`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${_authToken}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { error: body.error || `HTTP ${response.status}`, status: response.status } as ApiError;
  }
}

// ---------------------------------------------------------------------------
// Health / connectivity check
// ---------------------------------------------------------------------------

export interface HealthResponse {
  ok: boolean;
  service: string;
  persistence: string;
  at: string;
}

export async function checkHealth(
  customBaseUrl?: string,
): Promise<HealthResponse> {
  const url = customBaseUrl
    ? `${customBaseUrl.replace(/\/+$/, '')}/api/health`
    : `${_baseUrl}/api/health`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json();
}

// ---------------------------------------------------------------------------
// Dashboard / telemetry endpoints (require auth)
// ---------------------------------------------------------------------------

export async function getSnapshot(limit = 100) {
  return apiFetch<{
    telemetry: unknown[];
    alerts: unknown[];
    heartbeats: unknown[];
    events: unknown[];
  }>(`/api/snapshot?limit=${limit}`);
}

export async function getTelemetry(limit = 100) {
  return apiFetch<unknown[]>(`/api/telemetry?limit=${limit}`);
}

export interface SensorReadingRow {
  id: string;
  nodeId: string;
  receivedAt: string;
  latitude: number | null;
  longitude: number | null;
  batteryMv: number | null;
  temperature: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  waterLevel: number | null;
  soilMoisture: number | null;
  windSpeed: number | null;
  vibration: number | null;
  mq2: number | null;
  mq135: number | null;
  turbidity: number | null;
  riskLevel: string | null;
  riskScore: number | null;
  riskFactors: string[];
}

export async function getSensorReadings(
  limit = 100,
  nodeId?: string,
): Promise<SensorReadingRow[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (nodeId) params.set('nodeId', nodeId);
  return apiFetch<SensorReadingRow[]>(`/api/sensor-readings?${params}`);
}

export async function getAlerts(limit = 100) {
  return apiFetch<unknown[]>(`/api/alerts?limit=${limit}`);
}

export async function getEvents(limit = 100) {
  return apiFetch<unknown[]>(`/api/events?limit=${limit}`);
}

export interface NodeStatus {
  nodeId: string;
  lastSeen: string;
  batteryMv?: number;
  waterLevel?: number;
  temperature?: number;
  humidity?: number;
  rainfallMm?: number;
  soilMoisture?: number;
  riskLevel?: string;
  riskScore?: number;
}

export async function getNodes(): Promise<NodeStatus[]> {
  return apiFetch<NodeStatus[]>('/api/nodes');
}

export async function getNode(nodeId: string): Promise<NodeStatus> {
  return apiFetch<NodeStatus>(`/api/nodes/${encodeURIComponent(nodeId)}`);
}

export interface NetworkSummary {
  nodeCount: number;
  alertCount: number;
  eventCount: number;
}

export async function getNetworkSummary(): Promise<NetworkSummary> {
  return apiFetch<NetworkSummary>('/api/network/summary');
}

export async function getAdminStatus() {
  return apiFetch<{ persistence: string; mqttConfigured: boolean; llmConfigured: boolean; registrationEnabled: boolean; at: string }>('/api/admin/status');
}

export async function getAdminUsers() {
  return apiFetch<{ username: string; role: 'ADMIN' | 'USER'; active: boolean; createdAt: string }[]>('/api/admin/users');
}

// ---------------------------------------------------------------------------
// Prediction / ingestion
// ---------------------------------------------------------------------------

export interface PredictionResult {
  riskLevel: string;
  riskScore: number;
  riskFactors: string[];
  [key: string]: unknown;
}

export async function predict(
  sensorData: Record<string, unknown>,
): Promise<PredictionResult> {
  return apiFetch<PredictionResult>('/api/predict', {
    method: 'POST',
    body: JSON.stringify(sensorData),
  });
}

export async function ingest(payload: Record<string, unknown>) {
  return apiFetch<{ accepted: boolean; persistence: string }>('/api/ingest', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Chat / RAG assistant
// ---------------------------------------------------------------------------

export interface ChatResponse {
  answer: string;
  sources: {
    kind: string;
    summary: string;
    timestamp: string;
    score: number;
  }[];
  provider: 'local' | 'llm';
  retrievedAt: string;
  conversationId?: string | null;
}

export async function askChat(
  question: string,
  conversationId?: string,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question, conversationId }),
  });
}

export interface ConversationSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>('/api/conversations');
}

export async function getConversationMessages(id: string) {
  return apiFetch<{
    id: string;
    messages: unknown[];
  }>(`/api/conversations/${encodeURIComponent(id)}`);
}

export async function deleteConversation(id: string) {
  return apiFetch<{ deleted: boolean }>(
    `/api/conversations/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

// ---------------------------------------------------------------------------
// WebSocket connection
// ---------------------------------------------------------------------------

export type WsMessageType =
  | 'snapshot'
  | 'telemetry'
  | 'alerts'
  | 'heartbeats'
  | 'events';

export interface WsMessage {
  type: WsMessageType;
  data: unknown;
}

export interface WsConnection {
  close: () => void;
  isConnected: () => boolean;
}

export function connectWebSocket(
  token: string,
  onMessage: (msg: WsMessage) => void,
  onStatusChange?: (connected: boolean) => void,
): WsConnection {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionallyClosed = false;
  let connected = false;

  const connect = () => {
    if (intentionallyClosed) return;

    const url = `${_wsUrl}/ws?token=${encodeURIComponent(token)}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected = true;
      onStatusChange?.(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(
          typeof event.data === 'string' ? event.data : '',
        ) as WsMessage;
        onMessage(msg);
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onerror = () => {
      // onclose will fire after this
    };

    ws.onclose = () => {
      connected = false;
      onStatusChange?.(false);
      if (!intentionallyClosed) {
        // Exponential-ish backoff: reconnect after 3s
        reconnectTimer = setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return {
    close() {
      intentionallyClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      connected = false;
      onStatusChange?.(false);
    },
    isConnected() {
      return connected;
    },
  };
}
