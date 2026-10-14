const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Register a new player
 */
export async function registerPlayer(name, email, password) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

/**
 * Login existing player
 */
export async function loginPlayer(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

/**
 * Get currently logged-in player's profile
 */
export async function getPlayerProfile(token) {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load profile");
  }

  return data;
}

/**
 * Store authentication token
 */
export function saveAuthToken(token) {
  localStorage.setItem("game_auth_token", token);
}

/**
 * Get authentication token
 */
export function getAuthToken() {
  return localStorage.getItem("game_auth_token");
}

/**
 * Remove authentication token
 */
export function clearAuthToken() {
  localStorage.removeItem("game_auth_token");
}