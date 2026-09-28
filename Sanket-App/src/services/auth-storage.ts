import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Secure token persistence
// ---------------------------------------------------------------------------
// Uses expo-secure-store on native platforms (encrypted keychain/keystore)
// and localStorage on web.
// ---------------------------------------------------------------------------

// Lazy-load expo-secure-store to avoid crashes on web
let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    /* expo-secure-store not available */
  }
}

const KEYS = {
  token: 'sanket_auth_token',
  expiresAt: 'sanket_auth_expires',
  username: 'sanket_auth_username',
  role: 'sanket_auth_role',
  serverUrl: 'sanket_server_url',
} as const;

export interface StoredSession {
  token: string;
  expiresAt: string;
  user: {
    username: string;
    role: string;
  };
}

// ---------------------------------------------------------------------------
// Low-level get/set
// ---------------------------------------------------------------------------

async function setItem(key: string, value: string): Promise<void> {
  if (SecureStore) {
    await SecureStore.setItemAsync(key, value);
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (SecureStore) {
    return SecureStore.getItemAsync(key);
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

async function deleteItem(key: string): Promise<void> {
  if (SecureStore) {
    await SecureStore.deleteItemAsync(key);
  } else if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function saveSession(
  token: string,
  expiresAt: string,
  user: { username: string; role: string },
): Promise<void> {
  await Promise.all([
    setItem(KEYS.token, token),
    setItem(KEYS.expiresAt, expiresAt),
    setItem(KEYS.username, user.username),
    setItem(KEYS.role, user.role),
  ]);
}

export async function getSession(): Promise<StoredSession | null> {
  const [token, expiresAt, username, role] = await Promise.all([
    getItem(KEYS.token),
    getItem(KEYS.expiresAt),
    getItem(KEYS.username),
    getItem(KEYS.role),
  ]);

  if (!token || !expiresAt || !username || !role) return null;

  // Check if token has expired
  if (new Date(expiresAt).getTime() <= Date.now()) {
    await clearSession();
    return null;
  }

  return { token, expiresAt, user: { username, role } };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    deleteItem(KEYS.token),
    deleteItem(KEYS.expiresAt),
    deleteItem(KEYS.username),
    deleteItem(KEYS.role),
  ]);
}

// ---------------------------------------------------------------------------
// Server URL persistence
// ---------------------------------------------------------------------------

export async function saveServerUrl(url: string): Promise<void> {
  await setItem(KEYS.serverUrl, url);
}

export async function getSavedServerUrl(): Promise<string | null> {
  return getItem(KEYS.serverUrl);
}
