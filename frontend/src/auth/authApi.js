// frontend/src/auth/authApi.js
import axios from "axios";

const API_BASE = "/api/auth";

export const TOKEN_STORAGE_KEY = "codearena_token";
export const USER_STORAGE_KEY = "codearena_user";

// Fallback in-memory store in case document/window denies localStorage access
const memoryStore = new Map();

/**
 * Universal Safe Storage adapter:
 * Guards against SecurityError: Access is denied for this document
 * when third-party cookies or site storage are disabled by browser.
 */
export const safeStorage = {
  getItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (_) {
      // Silently fall back to in-memory store
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },

  setItem(key, value) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, String(value));
        return;
      }
    } catch (_) {
      // Silently fall back to in-memory store
    }
    memoryStore.set(key, String(value));
  },

  removeItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (_) {
      // Silently fall back to in-memory store
    }
    memoryStore.delete(key);
  },

  clear() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
        return;
      }
    } catch (_) {
      // Silently fall back to in-memory store
    }
    memoryStore.clear();
  },
};

/**
 * Get current stored auth token safely
 */
export function getStoredToken() {
  return safeStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Get current stored auth state safely
 */
export function getStoredAuth() {
  try {
    const token = safeStorage.getItem(TOKEN_STORAGE_KEY);
    const userStr = safeStorage.getItem(USER_STORAGE_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (err) {
    return { token: null, user: null };
  }
}

/**
 * Save auth session safely (falls back to memory if localStorage is restricted)
 */
export function setStoredAuth(token, user) {
  try {
    if (token) {
      safeStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      safeStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (user) {
      safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      safeStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (_) {}
}

/**
 * Clear auth session safely
 */
export function clearStoredAuth() {
  try {
    safeStorage.removeItem(TOKEN_STORAGE_KEY);
    safeStorage.removeItem(USER_STORAGE_KEY);
  } catch (_) {}
}

/**
 * Google Sign In / Sign Up
 */
export async function authenticateWithGoogle(payload) {
  const response = await axios.post(`${API_BASE}/google`, payload);
  const data = response.data?.data || response.data;
  if (data?.token && data?.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

/**
 * Traditional Email/Password Login
 */
export async function loginWithEmail(email, password) {
  const response = await axios.post(`${API_BASE}/login`, { email, password });
  const data = response.data?.data || response.data;
  if (data?.token && data?.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

/**
 * Traditional Email/Password Registration
 */
export async function registerWithEmail(name, email, password) {
  const response = await axios.post(`${API_BASE}/register`, { name, email, password });
  const data = response.data?.data || response.data;
  if (data?.token && data?.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

/**
 * 1-Click Instant Demo Login using real backend
 */
export async function loginWithDemo() {
  const response = await axios.post(`${API_BASE}/demo`);
  const data = response.data?.data || response.data;
  if (data?.token && data?.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

/**
 * Get current authenticated user profile
 */
export async function getMe(token) {
  const authToken = token || getStoredToken();
  if (!authToken) throw new Error("No token found");

  const response = await axios.get(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  const user = response.data?.data || response.data;
  if (user) {
    safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}
