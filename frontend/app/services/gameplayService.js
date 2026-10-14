const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Get authentication token
 */
function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("game_auth_token");
}

/**
 * Create a new gameplay session
 */
export async function startGameSession() {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/session/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to start game session."
    );
  }

  return data;
}

/**
 * Record a gameplay performance event
 */
export async function recordGameplayEvent(eventData) {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/event`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to record gameplay event."
    );
  }

  return data;
}

/**
 * End the current gameplay session
 */
export async function endGameSession(sessionData) {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/session/end`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to end game session."
    );
  }

  return data;
}

/**
 * Record a difficulty change
 */
export async function recordDifficultyHistory(historyData) {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/difficulty-history`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(historyData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to record difficulty history."
    );
  }

  return data;
}

/**
 * Get difficulty change history
 */
export async function getDifficultyHistory() {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/difficulty-history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to load difficulty history."
    );
  }

  return data;
}

/**
 * Get all events belonging to a gameplay session
 */
export async function getSessionEvents(sessionId) {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/session/${sessionId}/events`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load session events."
    );
  }

  return data;
}

/**
 * Get all gameplay sessions for the logged-in player
 */
export async function getPlayerSessions() {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/api/gameplay/sessions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load gameplay sessions."
    );
  }

  return data;
}