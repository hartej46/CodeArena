// frontend/src/auth/authApi.js
import axios from "axios";

const API_BASE = "/api/auth";

export const TOKEN_STORAGE_KEY = "codearena_token";
export const USER_STORAGE_KEY = "codearena_user";

/**
 * Get current stored auth state
 */
export function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (err) {
    console.error("Failed to read auth from storage:", err);
    return { token: null, user: null };
  }
}

/**
 * Save auth session to localStorage
 */
export function setStoredAuth(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Clear auth session
 */
export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
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
  const authToken = token || localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!authToken) throw new Error("No token found");

  const response = await axios.get(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  const user = response.data?.data || response.data;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}
